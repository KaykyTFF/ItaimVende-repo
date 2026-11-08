import bcrypt from 'bcryptjs';
import prisma from '../../config/prisma.js';
import { AppError } from '../../utils/errors.js';
import { enviarEmail } from '../email/email.service.js';

/**
 * Solicita a alteração de e-mail com reautenticação obrigatória por senha
 */
export async function requestEmailChange({ userId, currentPassword, newEmail, ipAddress, userAgent }) {
  if (!currentPassword) {
    throw new AppError('A senha atual é obrigatória para autorizar a alteração do e-mail.', 400, 'PASSWORD_REQUIRED');
  }

  if (!newEmail || typeof newEmail !== 'string') {
    throw new AppError('O novo e-mail é obrigatório.', 400, 'INVALID_EMAIL');
  }

  const cleanEmail = newEmail.trim().toLowerCase();

  // Busca usuário atual para conferir credenciais
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      password: true,
    },
  });

  if (!user) {
    throw new AppError('Usuário não encontrado.', 404);
  }

  // Etapa a) Reautenticação: valida senha atual
  const senhaValida = await bcrypt.compare(currentPassword, user.password);
  if (!senhaValida) {
    throw new AppError('A senha atual informada está incorreta.', 401, 'INVALID_PASSWORD');
  }

  // Verifica se não é o mesmo e-mail
  if (cleanEmail === user.email.toLowerCase()) {
    throw new AppError('O novo e-mail informado é idêntico ao e-mail atual da sua conta.', 400, 'SAME_EMAIL');
  }

  // Etapa b) Verifica se novo e-mail já está em uso por outro usuário
  const existing = await prisma.user.findFirst({
    where: {
      email: { equals: cleanEmail, mode: 'insensitive' },
      NOT: { id: userId },
    },
    select: { id: true },
  });

  if (existing) {
    throw new AppError('Este endereço de e-mail já está em uso por outra conta.', 409, 'EMAIL_TAKEN');
  }

  // Invalida solicitações pendentes anteriores deste usuário
  await prisma.emailChangeRequest.deleteMany({
    where: {
      userId,
      confirmedAt: null,
    },
  });

  // Etapa c) Gera código numérico de 6 dígitos e define validade curta de 15 minutos
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

  await prisma.emailChangeRequest.create({
    data: {
      userId,
      oldEmail: user.email,
      newEmail: cleanEmail,
      code,
      expiresAt,
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
    },
  });

  // Envia código para o NOVO e-mail
  const primeiroNome = (user.name || 'Usuário').split(' ')[0];
  const subject = `🔐 Código de confirmação: ${code} - Itaim Vende`;
  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmação de alteração de e-mail</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #334155; }
    .wrapper { width: 100%; table-layout: fixed; background-color: #f1f5f9; padding: 40px 16px; }
    .main { background-color: #ffffff; margin: 0 auto; max-width: 540px; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%); padding: 28px 24px; text-align: center; }
    .header h1 { margin: 0; color: #ffffff; font-size: 22px; font-weight: 800; }
    .content { padding: 32px 28px; line-height: 1.6; }
    .greeting { font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 0; }
    .code-box { background: #f0fdf4; border: 2px dashed #22c55e; border-radius: 10px; padding: 20px; text-align: center; margin: 24px 0; }
    .code-digits { font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #15803d; font-family: monospace; }
    .warning { font-size: 13px; color: #64748b; margin-top: 16px; }
    .footer { background-color: #f8fafc; padding: 18px 24px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="main">
      <div class="header">
        <h1>Itaim Vende</h1>
      </div>
      <div class="content">
        <h2 class="greeting">Olá, ${primeiroNome}!</h2>
        <p>Recebemos uma solicitação para cadastrar este endereço de e-mail na sua conta do Itaim Vende.</p>
        <p>Utilize o código de verificação abaixo para confirmar a alteração:</p>
        <div class="code-box">
          <div class="code-digits">${code}</div>
        </div>
        <p class="warning">⏱️ Este código expira em <strong>15 minutos</strong>. Se você não solicitou esta alteração, ignore esta mensagem com segurança.</p>
      </div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} Itaim Vende - Segurança da Conta
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `
Itaim Vende - Confirmação de Alteração de E-mail

Olá, ${primeiroNome}!

Seu código de confirmação para cadastrar este novo e-mail é: ${code}

Este código expira em 15 minutos.
Se você não solicitou esta alteração, ignore este e-mail.
  `.trim();

  await enviarEmail({ to: cleanEmail, subject, html, text });

  return {
    success: true,
    message: `Código de verificação enviado com sucesso para ${cleanEmail}. O código expira em 15 minutos.`,
    expiresMinutes: 15,
  };
}

/**
 * Valida o código de 6 dígitos e conclui a alteração do e-mail no banco
 */
export async function confirmEmailChange({ userId, newEmail, code, ipAddress, userAgent }) {
  if (!newEmail || !code) {
    throw new AppError('E-mail e código de confirmação são obrigatórios.', 400);
  }

  const cleanEmail = newEmail.trim().toLowerCase();
  const cleanCode = code.trim();

  // Localiza a solicitação pendente mais recente
  const request = await prisma.emailChangeRequest.findFirst({
    where: {
      userId,
      newEmail: cleanEmail,
      confirmedAt: null,
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!request) {
    throw new AppError(
      'Nenhuma solicitação de alteração pendente foi encontrada para este e-mail. Inicie uma nova solicitação.',
      404,
      'REQUEST_NOT_FOUND'
    );
  }

  // Verifica expiração (15 minutos)
  if (new Date() > new Date(request.expiresAt)) {
    throw new AppError(
      'O código de verificação expirou. Por favor, solicite um novo código.',
      400,
      'CODE_EXPIRED'
    );
  }

  // Verifica limite de tentativas (máximo 5)
  if (request.attempts >= request.maxAttempts) {
    throw new AppError(
      'Limite de tentativas incorretas excedido para esta solicitação. Solicite um novo código.',
      429,
      'MAX_ATTEMPTS_EXCEEDED'
    );
  }

  // Validação do código
  if (request.code !== cleanCode) {
    const novasTentativas = request.attempts + 1;
    await prisma.emailChangeRequest.update({
      where: { id: request.id },
      data: { attempts: novasTentativas },
    });

    const restantes = Math.max(0, request.maxAttempts - novasTentativas);
    throw new AppError(
      `Código de verificação incorreto. Você tem mais ${restantes} ${restantes === 1 ? 'tentativa' : 'tentativas'}.`,
      400,
      'INVALID_CODE',
      { remainingAttempts: restantes }
    );
  }

  // Checa se o e-mail não foi ocupado por outro usuário enquanto aguardava
  const existing = await prisma.user.findFirst({
    where: {
      email: { equals: cleanEmail, mode: 'insensitive' },
      NOT: { id: userId },
    },
    select: { id: true },
  });

  if (existing) {
    throw new AppError('Este endereço de e-mail já está em uso por outra conta.', 409, 'EMAIL_TAKEN');
  }

  // Busca dados do usuário para histórico e envio de alerta
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, username: true, avatar: true },
  });

  const oldEmail = currentUser.email;

  // Etapa d & f) Atualiza e-mail no banco, confirma requisição e invalida tokens de recuperação
  const [updatedUser] = await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        email: cleanEmail,
        emailVerifiedAt: new Date(),
        resetPasswordToken: null,
        resetPasswordCode: null,
        resetPasswordExpires: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        avatar: true,
        role: true,
        phone: true,
        bio: true,
        city: true,
        state: true,
        neighborhood: true,
      },
    }),
    prisma.emailChangeRequest.update({
      where: { id: request.id },
      data: { confirmedAt: new Date() },
    }),
    prisma.auditLog.create({
      data: {
        userId,
        action: 'USER_EMAIL_CHANGED',
        entity: 'User',
        entityId: userId,
        ipAddress: ipAddress || null,
        metadata: {
          oldEmail,
          newEmail: cleanEmail,
          userAgent: userAgent || null,
        },
      },
    }),
  ]);

  // Etapa e) Dispara e-mail de alerta de segurança para o e-mail ANTIGO
  try {
    const primeiroNome = (currentUser.name || 'Usuário').split(' ')[0];
    const alertSubject = `⚠️ Aviso de Segurança: Seu e-mail de acesso foi alterado - Itaim Vende`;
    const alertHtml = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Aviso de Segurança</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #334155; }
    .wrapper { width: 100%; table-layout: fixed; background-color: #f1f5f9; padding: 40px 16px; }
    .main { background-color: #ffffff; margin: 0 auto; max-width: 540px; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
    .header { background: #dc2626; padding: 24px; text-align: center; }
    .header h1 { margin: 0; color: #ffffff; font-size: 20px; font-weight: 800; }
    .content { padding: 32px 28px; line-height: 1.6; }
    .alert-box { background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 20px 0; color: #991b1b; font-size: 14px; }
    .footer { background-color: #f8fafc; padding: 18px 24px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="main">
      <div class="header">
        <h1>Itaim Vende - Central de Segurança</h1>
      </div>
      <div class="content">
        <h2>Olá, ${primeiroNome}</h2>
        <p>Informamos que o endereço de e-mail de acesso da sua conta no <strong>Itaim Vende</strong> foi alterado com sucesso para:</p>
        <div class="alert-box">
          <strong>Novo e-mail:</strong> ${cleanEmail}
        </div>
        <p>Por medidas de proteção preventiva, tokens de recuperação pendentes foram cancelados.</p>
        <p style="color: #b91c1c; font-weight: 600;">Se você NÃO realizou essa alteração, entre em contato imediatamente com o suporte ou equipe de segurança.</p>
      </div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} Itaim Vende - Paulistana, PI
      </div>
    </div>
  </div>
</body>
</html>
    `.trim();

    const alertText = `
Itaim Vende - Alerta de Segurança

Olá, ${primeiroNome}!

O endereço de e-mail da sua conta no Itaim Vende foi alterado com sucesso para: ${cleanEmail}.
Se você NÃO realizou esta alteração, entre em contato imediatamente com nosso suporte.
    `.trim();

    await enviarEmail({ to: oldEmail, subject: alertSubject, html: alertHtml, text: alertText });
  } catch (err) {
    console.warn('[EmailService] Falha ao enviar aviso para e-mail antigo:', err.message);
  }

  import('../notification/index.js').then(({ createNotification }) => {
    createNotification({
      userId,
      title: 'E-mail atualizado',
      message: `O endereco de e-mail da sua conta foi alterado com sucesso para ${cleanEmail}.`,
      type: 'aviso',
      link: '/pages/perfil/configuracoes.html',
    }).catch(() => {});
  }).catch(() => {});

  return {
    success: true,
    message: 'E-mail de acesso alterado com sucesso!',
    user: updatedUser,
  };
}

