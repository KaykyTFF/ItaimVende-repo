import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import prisma from '../../config/prisma.js';
import { AppError } from '../../utils/errors.js';
import { normalizePhone, sendPhoneVerificationCode } from '../../adapters/phone/phone.provider.js';
import { enviarEmail } from '../email/email.service.js';
import { ENV } from '../../config/env.js';

export const PHONE_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias em milissegundos
const RESEND_INTERVAL_MS = 60 * 1000; // 60 segundos entre reenvios
const MAX_REQUESTS_PER_HOUR = 4; // Máximo de 4 solicitações de SMS/WhatsApp por hora

/**
 * Formata um telefone de 10 ou 11 dígitos no padrão brasileiro
 */
export function formatarTelefone(digitos) {
  if (!digitos) return null;
  const limpo = String(digitos).replace(/\D/g, '');
  if (limpo.length === 11) {
    return `(${limpo.slice(0, 2)}) ${limpo.slice(2, 7)}-${limpo.slice(7)}`;
  }
  if (limpo.length === 10) {
    return `(${limpo.slice(0, 2)}) ${limpo.slice(2, 6)}-${limpo.slice(6)}`;
  }
  return limpo;
}

/**
 * Mascara parcialmente o número para exibição segura em e-mails e logs
 * Exemplo: (89) 99985-8585 -> (89) 9****-8585
 */
export function mascararTelefone(digitos) {
  if (!digitos) return '';
  const limpo = String(digitos).replace(/\D/g, '');
  if (limpo.length === 11) {
    return `(${limpo.slice(0, 2)}) ${limpo.slice(2, 3)}****-${limpo.slice(7)}`;
  }
  return limpo;
}

/**
 * Calcula o status de cooldown para alteração de número de telefone (regra de 7 dias)
 */
export function calcularStatusPhone(phoneLastChangedAt) {
  const now = new Date();
  if (!phoneLastChangedAt) {
    return {
      phoneLastChangedAt: null,
      canChangePhone: true,
      nextPhoneChangeAt: null,
      daysUntilNextPhoneChange: 0,
    };
  }

  const lastChanged = new Date(phoneLastChangedAt).getTime();
  const elapsedMs = now.getTime() - lastChanged;

  if (elapsedMs < PHONE_COOLDOWN_MS) {
    const nextDate = new Date(lastChanged + PHONE_COOLDOWN_MS);
    const diffMs = nextDate.getTime() - now.getTime();
    const daysRemaining = Math.max(1, Math.ceil(diffMs / (24 * 60 * 60 * 1000)));
    return {
      phoneLastChangedAt: new Date(phoneLastChangedAt).toISOString(),
      canChangePhone: false,
      nextPhoneChangeAt: nextDate.toISOString(),
      daysUntilNextPhoneChange: daysRemaining,
    };
  }

  return {
    phoneLastChangedAt: new Date(phoneLastChangedAt).toISOString(),
    canChangePhone: true,
    nextPhoneChangeAt: null,
    daysUntilNextPhoneChange: 0,
  };
}

/**
 * Valida se a senha atual é obrigatória e está correta
 * (Para contas Google sem senha, a reautenticação é concedida via token de sessão)
 */
async function validarReautenticacao(user, currentPassword) {
  const isGoogleAccount = !user.password || user.password === '' || user.password.startsWith('GOOGLE_OAUTH');
  if (isGoogleAccount) {
    return true; // Conta Google autenticada pela sessão JWT recente
  }

  if (!currentPassword) {
    throw new AppError('A senha atual é obrigatória para autorizar a operação.', 401, 'PASSWORD_REQUIRED');
  }

  const senhaValida = await bcrypt.compare(currentPassword, user.password);
  if (!senhaValida) {
    throw new AppError('A senha atual informada está incorreta.', 401, 'INVALID_PASSWORD');
  }

  return true;
}

/**
 * Etapa 1: Solicita alteração ou verificação de número de WhatsApp / celular
 */
export async function requestPhoneChange({ userId, currentPassword, newPhone, channel = 'whatsapp', ipAddress, userAgent }) {
  const { clean: newClean, e164, formatted, valid } = normalizePhone(newPhone);

  if (!valid || !newClean) {
    throw new AppError('Informe um número de celular válido com DDD (11 dígitos, iniciando com 9).', 400, 'INVALID_PHONE_FORMAT');
  }

  // 1. Busca usuário atual
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      password: true,
      phone: true,
      phoneVerifiedAt: true,
      phoneLastChangedAt: true,
    },
  });

  if (!user) {
    throw new AppError('Usuário não encontrado.', 404);
  }

  // 2. Checa regra de cooldown de 7 dias antes da reautenticação
  const cooldown = calcularStatusPhone(user.phoneLastChangedAt);
  if (!cooldown.canChangePhone) {
    const dias = cooldown.daysUntilNextPhoneChange;
    throw new AppError(
      `Você só pode alterar ou remover seu número uma vez a cada 7 dias. Restam ${dias} ${dias === 1 ? 'dia' : 'dias'}.`,
      403,
      'PHONE_COOLDOWN_ACTIVE'
    );
  }

  // 3. Reautenticação
  await validarReautenticacao(user, currentPassword);

  // 4. Checa se o número já está verificado por outro usuário ativo
  const existingUser = await prisma.user.findFirst({
    where: {
      phone: newClean,
      phoneVerifiedAt: { not: null },
      NOT: { id: userId },
    },
    select: { id: true },
  });

  if (existingUser) {
    throw new AppError('Este número de WhatsApp/celular já está em uso por outra conta.', 409, 'PHONE_TAKEN');
  }

  // Se já for o mesmo número cadastrado e já verificado
  const currentClean = user.phone ? user.phone.replace(/\D/g, '') : null;
  if (currentClean === newClean && user.phoneVerifiedAt) {
    throw new AppError('Este número de WhatsApp já está cadastrado e verificado na sua conta.', 400, 'SAME_PHONE');
  }

  // 5. Rate limit de reenvios por hora e intervalo mínimo de 60 segundos
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const requestsLastHour = await prisma.phoneChangeRequest.count({
    where: {
      userId,
      createdAt: { gte: oneHourAgo },
    },
  });

  if (requestsLastHour >= MAX_REQUESTS_PER_HOUR) {
    throw new AppError('Limite de solicitações de código por hora atingido. Tente novamente mais tarde.', 429, 'RATE_LIMIT_EXCEEDED');
  }

  const latestRequest = await prisma.phoneChangeRequest.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  if (latestRequest && Date.now() - new Date(latestRequest.createdAt).getTime() < RESEND_INTERVAL_MS) {
    const waitSeconds = Math.ceil((RESEND_INTERVAL_MS - (Date.now() - new Date(latestRequest.createdAt).getTime())) / 1000);
    throw new AppError(`Aguarde ${waitSeconds} segundos antes de solicitar um novo código.`, 429, 'RATE_LIMIT_COOLDOWN');
  }

  // 6. Invalida solicitações não confirmadas anteriores
  await prisma.phoneChangeRequest.deleteMany({
    where: {
      userId,
      confirmedAt: null,
    },
  });

  // 7. Gera código OTP de 6 dígitos e token de reversão
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const codeHash = await bcrypt.hash(code, 8);
  const revertToken = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

  await prisma.phoneChangeRequest.create({
    data: {
      userId,
      oldPhone: user.phone,
      newPhone: newClean,
      codeHash,
      revertToken,
      expiresAt,
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
    },
  });

  // 8. Envia o código via Adapter (WhatsApp / SMS)
  await sendPhoneVerificationCode({
    phone: newClean,
    code,
    channel,
  });

  // 9. Envia o código de confirmação também para o e-mail da conta do usuário
  if (user.email) {
    const primeiroNome = (user.name || 'Usuário').split(' ')[0];
    const phoneFormatado = formatted || formatarTelefone(newClean);
    const htmlEmail = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>Código de Confirmação - Itaim Vende</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; padding: 24px; margin: 0;">
  <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.04);">
    <div style="text-align: center; margin-bottom: 24px;">
      <h2 style="color: #16a34a; margin: 0; font-size: 22px; font-weight: 800;">Itaim Vende</h2>
      <p style="color: #64748b; font-size: 14px; margin: 6px 0 0;">Confirmação de WhatsApp / Celular</p>
    </div>

    <p style="font-size: 15px; line-height: 1.5; color: #334155;">Olá, <strong>${primeiroNome}</strong>!</p>
    <p style="font-size: 14.5px; line-height: 1.5; color: #475569;">
      Recebemos um pedido para cadastrar ou alterar o número de WhatsApp/celular da sua conta para <strong>${phoneFormatado}</strong>.
    </p>

    <div style="background: #f0fdf4; border: 2px dashed #86efac; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
      <span style="display: block; font-size: 12px; font-weight: 700; color: #15803d; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 6px;">Código de Verificação</span>
      <span style="font-family: monospace, Consolas, sans-serif; font-size: 34px; font-weight: 800; color: #15803d; letter-spacing: 8px;">${code}</span>
      <span style="display: block; font-size: 12px; color: #16a34a; margin-top: 8px;">⏱️ Válido por 10 minutos &bull; Uso único</span>
    </div>

    <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
      Este código também foi enviado para o seu ${channel === 'sms' ? 'SMS' : 'WhatsApp'}. Se não foi você que solicitou esta alteração, ignore este e-mail. Nenhuma mudança foi feita na sua conta até o momento.
    </p>

    <div style="margin-top: 28px; padding-top: 18px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8;">
      Itaim Vende &bull; Segurança e Confiança
    </div>
  </div>
</body>
</html>
    `.trim();

    enviarEmail({
      to: user.email,
      subject: `🔑 Seu código de confirmação: ${code} - Itaim Vende`,
      html: htmlEmail,
      text: `Olá ${primeiroNome}! Seu código de confirmação para o WhatsApp ${phoneFormatado} no Itaim Vende é: ${code}. Válido por 10 minutos.`,
    }).catch((err) => console.warn('[PhoneService] Falha ao enviar e-mail com código OTP:', err.message));
  }

  return {
    success: true,
    message: `Código de verificação de 6 dígitos enviado para ${formatted || newClean} via ${channel.toUpperCase()} e também para seu e-mail (${user.email}).`,
    expiresInSeconds: 600,
    resendIntervalSeconds: 60,
    targetPhone: formatted || newClean,
    targetEmail: user.email,
    ...(process.env.NODE_ENV !== 'production' ? { debugCode: code } : {}),
  };
}

/**
 * Etapa 2: Confirmação do código OTP de 6 dígitos e aplicação da alteração
 */
export async function confirmPhoneChange({ userId, newPhone, code, ipAddress, userAgent }) {
  const { clean: newClean, formatted } = normalizePhone(newPhone);

  if (!code || code.trim().length !== 6) {
    throw new AppError('O código de confirmação deve possuir exatamente 6 dígitos.', 400, 'INVALID_CODE_FORMAT');
  }

  // 1. Busca solicitação pendente não expirada
  const pending = await prisma.phoneChangeRequest.findFirst({
    where: {
      userId,
      newPhone: newClean,
      confirmedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!pending) {
    throw new AppError('Código de confirmação expirado ou solicitação não encontrada. Solicite um novo código.', 400, 'EXPIRED_CODE');
  }

  // 2. Checa limite de tentativas (máx 5)
  if (pending.attempts >= pending.maxAttempts) {
    await prisma.phoneChangeRequest.delete({ where: { id: pending.id } });
    throw new AppError('Limite de tentativas excedido. Por segurança, solicite um novo código.', 400, 'MAX_ATTEMPTS_EXCEEDED');
  }

  // 3. Valida código hash
  const isMatch = await bcrypt.compare(code.trim(), pending.codeHash);
  if (!isMatch) {
    const updatedAttempts = pending.attempts + 1;
    await prisma.phoneChangeRequest.update({
      where: { id: pending.id },
      data: { attempts: updatedAttempts },
    });

    const remaining = pending.maxAttempts - updatedAttempts;
    if (remaining <= 0) {
      await prisma.phoneChangeRequest.delete({ where: { id: pending.id } });
      throw new AppError('Limite de tentativas incorretas atingido. Solicite um novo código.', 400, 'MAX_ATTEMPTS_EXCEEDED');
    }

    throw new AppError(`Código incorreto. Você tem mais ${remaining} ${remaining === 1 ? 'tentativa' : 'tentativas'}.`, 400, 'INVALID_CODE');
  }

  // 4. Busca usuário atual para transação
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, phone: true },
  });

  const now = new Date();

  // 5. Transação atômica: atualiza telefone, marca confirmação, cria histórico e log
  const [updatedUser] = await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        phone: newClean,
        phoneVerifiedAt: now,
        phoneLastChangedAt: now,
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        phone: true,
        phoneVerifiedAt: true,
        phoneLastChangedAt: true,
        avatar: true,
        city: true,
        state: true,
        neighborhood: true,
        bio: true,
      },
    }),
    prisma.phoneChangeRequest.update({
      where: { id: pending.id },
      data: { confirmedAt: now },
    }),
    prisma.phoneHistory.create({
      data: {
        userId,
        oldPhone: user.phone,
        newPhone: newClean,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
      },
    }),
    prisma.auditLog.create({
      data: {
        userId,
        action: 'USER_PHONE_CHANGED_VERIFIED',
        entity: 'User',
        entityId: userId,
        ipAddress: ipAddress || null,
        metadata: {
          oldPhone: user.phone,
          newPhone: newClean,
          userAgent: userAgent || null,
          method: 'OTP_VERIFICATION',
        },
      },
    }),
  ]);

  // 6. Envia e-mail de aviso para a conta com link "Não fui eu"
  const appUrl = ENV.APP_URL || 'http://localhost:3000';
  const revertUrl = `${appUrl}/reverter-telefone.html?token=${pending.revertToken}`;
  const phoneMasked = mascararTelefone(newClean);
  const dataFormatada = now.toLocaleString('pt-BR', { timeZone: 'America/Fortaleza' });

  const htmlEmail = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>Segurança da Conta: WhatsApp alterado</title>
</head>
<body style="font-family: sans-serif; background-color: #f8fafc; color: #1e293b; padding: 24px;">
  <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 28px; border: 1px solid #e2e8f0;">
    <h2 style="color: #1e293b; margin-top: 0;">Número de WhatsApp alterado</h2>
    <p>Olá, <strong>${user.name || 'Usuário'}</strong>!</p>
    <p>O número de WhatsApp/celular associado à sua conta no Itaim Vende foi atualizado para <strong>${phoneMasked}</strong> e verificado com sucesso.</p>
    <div style="background: #f1f5f9; padding: 14px; border-radius: 10px; margin: 18px 0; font-size: 13.5px;">
      <strong>Data:</strong> ${dataFormatada}<br>
      <strong>Endereço IP:</strong> ${ipAddress || 'Não registrado'}
    </div>
    <p>Se você reconhece essa alteração, nenhuma ação é necessária.</p>
    <div style="margin-top: 24px; padding-top: 18px; border-top: 1px solid #e2e8f0; text-align: center;">
      <p style="color: #dc2626; font-size: 13px; font-weight: 700; margin-bottom: 10px;">Não foi você que fez essa alteração?</p>
      <a href="${revertUrl}" style="display: inline-block; background: #dc2626; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: 700; font-size: 13.5px;">
        Não fui eu — Desfazer alteração
      </a>
      <p style="font-size: 11px; color: #64748b; margin-top: 10px;">Este link expira em 48 horas.</p>
    </div>
  </div>
</body>
</html>
  `;

  enviarEmail({
    to: user.email,
    subject: '⚠️ Alerta de Segurança: Seu número de WhatsApp foi alterado - Itaim Vende',
    html: htmlEmail,
    text: `Olá ${user.name}! Seu número de WhatsApp no Itaim Vende foi atualizado para ${phoneMasked}. Se não foi você, acesse imediatamente: ${revertUrl}`,
  }).catch((err) => console.warn('[PhoneService] Falha ao enviar e-mail de alerta:', err.message));

  import('../notification/index.js').then(({ createNotification }) => {
    createNotification({
      userId,
      title: 'WhatsApp atualizado',
      message: `O número de WhatsApp da sua conta foi atualizado para ${phoneMasked}.`,
      type: 'aviso',
      link: '/pages/perfil/configuracoes.html',
    }).catch(() => {});
  }).catch(() => {});

  return {
    success: true,
    message: 'Número de WhatsApp alterado e verificado com sucesso!',
    user: {
      ...updatedUser,
      phoneFormatted: formatarTelefone(newClean),
      isPhoneVerified: true,
    },
  };
}

/**
 * Remoção de telefone com reautenticação obrigatória e cooldown
 */
export async function deletePhone({ userId, currentPassword, ipAddress, userAgent }) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      password: true,
      phone: true,
      phoneLastChangedAt: true,
    },
  });

  if (!user) {
    throw new AppError('Usuário não encontrado.', 404);
  }

  // 1. Cooldown de 7 dias antes da reautenticação
  const cooldown = calcularStatusPhone(user.phoneLastChangedAt);
  if (!cooldown.canChangePhone) {
    const dias = cooldown.daysUntilNextPhoneChange;
    throw new AppError(
      `Você só pode alterar ou remover seu número uma vez a cada 7 dias. Restam ${dias} ${dias === 1 ? 'dia' : 'dias'}.`,
      403,
      'PHONE_COOLDOWN_ACTIVE'
    );
  }

  // 2. Reautenticação
  await validarReautenticacao(user, currentPassword);

  if (!user.phone) {
    return {
      success: true,
      message: 'Sua conta não possui nenhum telefone cadastrado.',
      user,
    };
  }

  const oldPhone = user.phone;
  const now = new Date();

  // 3. Transação atômica
  const [updatedUser] = await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        phone: null,
        phoneVerifiedAt: null,
        phoneLastChangedAt: now,
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        phone: true,
        phoneVerifiedAt: true,
        phoneLastChangedAt: true,
        avatar: true,
        city: true,
        state: true,
        neighborhood: true,
        bio: true,
      },
    }),
    prisma.phoneHistory.create({
      data: {
        userId,
        oldPhone,
        newPhone: null,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
      },
    }),
    prisma.auditLog.create({
      data: {
        userId,
        action: 'USER_PHONE_REMOVED',
        entity: 'User',
        entityId: userId,
        ipAddress: ipAddress || null,
        metadata: {
          oldPhone,
          userAgent: userAgent || null,
        },
      },
    }),
  ]);

  // 4. Envia e-mail informando a remoção
  enviarEmail({
    to: user.email,
    subject: 'Aviso: Número de WhatsApp removido da sua conta - Itaim Vende',
    html: `
      <p>Olá, <strong>${user.name || 'Usuário'}</strong>!</p>
      <p>O número de WhatsApp <strong>${formatarTelefone(oldPhone)}</strong> foi desvinculado da sua conta no Itaim Vende.</p>
      <p>Seus anúncios agora ficarão sem o botão de contato direto por WhatsApp até que você cadastre e confirme um novo número.</p>
    `,
    text: `Olá ${user.name}! O número de WhatsApp ${oldPhone} foi removido da sua conta no Itaim Vende.`,
  }).catch((err) => console.warn('[PhoneService] Falha ao enviar e-mail de remoção:', err.message));

  return {
    success: true,
    message: 'Número de WhatsApp removido com sucesso. Seus anúncios ficarão sem contato direto por WhatsApp.',
    user: {
      ...updatedUser,
      phoneFormatted: null,
      isPhoneVerified: false,
    },
  };
}

/**
 * Reversão segura do número via link "Não fui eu"
 */
export async function revertPhoneChange({ token, ipAddress, userAgent }) {
  if (!token) {
    throw new AppError('Token de reversão inválido ou não fornecido.', 400, 'INVALID_REVERT_TOKEN');
  }

  // Busca solicitação com token nos últimos 2 dias (48 horas)
  const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
  const request = await prisma.phoneChangeRequest.findFirst({
    where: {
      revertToken: token,
      confirmedAt: { not: null },
      createdAt: { gte: twoDaysAgo },
    },
    include: { user: true },
  });

  if (!request || !request.user) {
    throw new AppError('Link de cancelamento expirado, inválido ou já utilizado.', 400, 'EXPIRED_REVERT_TOKEN');
  }

  const userId = request.userId;
  const phoneToRestore = request.oldPhone;
  const now = new Date();

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        phone: phoneToRestore,
        phoneVerifiedAt: phoneToRestore ? now : null,
        phoneLastChangedAt: now,
      },
    }),
    prisma.phoneChangeRequest.update({
      where: { id: request.id },
      data: { revertToken: null },
    }),
    prisma.phoneHistory.create({
      data: {
        userId,
        oldPhone: request.newPhone,
        newPhone: phoneToRestore,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
      },
    }),
    prisma.auditLog.create({
      data: {
        userId,
        action: 'USER_PHONE_REVERTED_SECURITY',
        entity: 'User',
        entityId: userId,
        ipAddress: ipAddress || null,
        metadata: {
          reason: 'USER_REPORTED_NOT_ME',
          revertedFrom: request.newPhone,
          restoredTo: phoneToRestore,
          userAgent: userAgent || null,
        },
      },
    }),
  ]);

  return {
    success: true,
    message: 'Alteração cancelada com sucesso! O número foi revertido e sua conta foi sinalizada para proteção.',
    restoredPhone: formatarTelefone(phoneToRestore),
  };
}

/**
 * Legado / Compatibilidade direta
 */
export async function changePhone(userId, rawPhone, meta = {}) {
  const { clean, valid } = normalizePhone(rawPhone);
  if (rawPhone && !valid) {
    throw new AppError('Informe um número de telefone com DDD válido (10 ou 11 dígitos).', 400, 'INVALID_PHONE_FORMAT');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, phone: true, email: true, username: true, avatar: true },
  });

  if (!user) {
    throw new AppError('Usuário não encontrado.', 404);
  }

  const now = new Date();
  const [updatedUser] = await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        phone: clean,
        phoneVerifiedAt: clean ? now : null,
        phoneLastChangedAt: now,
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        phone: true,
        avatar: true,
        city: true,
        state: true,
        neighborhood: true,
        bio: true,
      },
    }),
    prisma.phoneHistory.create({
      data: {
        userId,
        oldPhone: user.phone,
        newPhone: clean,
        ipAddress: meta.ipAddress || null,
        userAgent: meta.userAgent || null,
      },
    }),
    prisma.auditLog.create({
      data: {
        userId,
        action: 'USER_PHONE_CHANGED',
        entity: 'User',
        entityId: userId,
        ipAddress: meta.ipAddress || null,
        metadata: {
          oldPhone: user.phone,
          newPhone: clean,
          userAgent: meta.userAgent || null,
        },
      },
    }),
  ]);

  return {
    success: true,
    message: clean
      ? 'Número de WhatsApp atualizado com sucesso!'
      : 'Número de telefone desvinculado com sucesso da sua conta.',
    user: {
      ...updatedUser,
      phoneFormatted: formatarTelefone(clean),
    },
  };
}
