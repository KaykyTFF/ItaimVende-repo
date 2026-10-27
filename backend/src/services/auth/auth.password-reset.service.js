import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import prisma from '../../config/prisma.js';
import { ENV } from '../../config/env.js';
import { AppError } from '../../utils/errors.js';
import { enviarEmailRecuperacaoSenha } from '../email/email.service.js';

// Rastreador em memória de tentativas incorretas por e-mail para impedir força bruta no código de 6 dígitos
const failedAttemptsMap = new Map();

/**
 * Solicita a recuperação de senha: gera código OTP de 6 dígitos e token seguro (válidos por 1h)
 * e despacha o e-mail para o usuário.
 */
export async function solicitarRecuperacao(email) {
  const emailNormalized = email.toLowerCase().trim();

  // Reinicia contagem de tentativas para este e-mail
  failedAttemptsMap.delete(emailNormalized);

  const user = await prisma.user.findUnique({
    where: { email: emailNormalized },
  });

  // Se o usuário não existir, retornamos sucesso genérico por segurança (evita enumeração de e-mails)
  if (!user) {
    return {
      success: true,
      message: 'Se o e-mail informado estiver cadastrado, as instruções foram enviadas.',
    };
  }

  // Gera código OTP numérico de 6 dígitos e token criptográfico seguro
  const code = crypto.randomInt(100000, 999999).toString();
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora a partir de agora

  // Salva no banco de dados
  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetPasswordToken: token,
      resetPasswordCode: code,
      resetPasswordExpires: expiresAt,
    },
  });

  // Constrói o link direto seguro para redefinição
  const baseUrl = ENV.APP_URL.replace(/\/+$/, '');
  const resetUrl = `${baseUrl}/index.html#recuperar?token=${token}&email=${encodeURIComponent(user.email)}`;

  // Dispara o e-mail
  try {
    await enviarEmailRecuperacaoSenha({
      to: user.email,
      name: user.name,
      code,
      resetUrl,
    });
  } catch (err) {
    console.error('[PasswordResetService] Erro ao enviar e-mail de recuperação:', err.message);
  }

  return {
    success: true,
    message: 'Código de recuperação enviado para o seu e-mail!',
  };
}

/**
 * Valida o código OTP de 6 dígitos digitado pelo usuário na Etapa 2
 */
export async function validarCodigoRecuperacao(email, code) {
  const emailNormalized = email.toLowerCase().trim();
  const codeClean = (code || '').trim();

  const attemptsInfo = failedAttemptsMap.get(emailNormalized) || { count: 0, lastAttempt: Date.now() };

  // Se já errou 5 vezes anteriormente, bloqueia e cancela o código
  if (attemptsInfo.count >= 5) {
    await prisma.user.updateMany({
      where: { email: emailNormalized },
      data: { resetPasswordCode: null, resetPasswordToken: null, resetPasswordExpires: null },
    });
    failedAttemptsMap.delete(emailNormalized);
    throw new AppError('Limite de tentativas excedido para este código. Por favor, solicite um novo código de recuperação.', 429);
  }

  const user = await prisma.user.findUnique({
    where: { email: emailNormalized },
    select: {
      id: true,
      email: true,
      resetPasswordCode: true,
      resetPasswordToken: true,
      resetPasswordExpires: true,
    },
  });

  if (!user || !user.resetPasswordCode) {
    throw new AppError('Código inválido ou nenhuma recuperação ativa para este e-mail.', 400);
  }

  if (!user.resetPasswordExpires || new Date() > new Date(user.resetPasswordExpires)) {
    throw new AppError('O código de verificação expirou. Por favor, solicite um novo código.', 400);
  }

  if (user.resetPasswordCode !== codeClean) {
    attemptsInfo.count += 1;
    attemptsInfo.lastAttempt = Date.now();
    failedAttemptsMap.set(emailNormalized, attemptsInfo);

    const restantes = 5 - attemptsInfo.count;
    if (restantes <= 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: { resetPasswordCode: null, resetPasswordToken: null, resetPasswordExpires: null },
      });
      failedAttemptsMap.delete(emailNormalized);
      throw new AppError('Você errou o código 5 vezes. O código foi cancelado por segurança. Solicite um novo código.', 429);
    }

    throw new AppError(`Código incorreto. Você tem mais ${restantes} tentativa(s).`, 400);
  }

  // Sucesso na verificação: limpa tentativas incorretas
  failedAttemptsMap.delete(emailNormalized);

  return {
    success: true,
    valid: true,
    token: user.resetPasswordToken,
    message: 'Código verificado com sucesso!',
  };
}

/**
 * Redefine a senha do usuário utilizando o token de recuperação ou o código OTP validado
 */
export async function redefinirSenha({ email, token, code, newPassword }) {
  const emailNormalized = email.toLowerCase().trim();

  const user = await prisma.user.findUnique({
    where: { email: emailNormalized },
  });

  if (!user) {
    throw new AppError('Usuário não encontrado.', 404);
  }

  if (!user.resetPasswordExpires || new Date() > new Date(user.resetPasswordExpires)) {
    throw new AppError('A solicitação de recuperação expirou. Por favor, inicie o processo novamente.', 400);
  }

  // Verifica validação por token ou código
  let isValid = false;
  if (token && user.resetPasswordToken && user.resetPasswordToken === token.trim()) {
    isValid = true;
  } else if (code && user.resetPasswordCode && user.resetPasswordCode === code.trim()) {
    isValid = true;
  }

  if (!isValid) {
    throw new AppError('Credenciais de recuperação inválidas ou expiradas.', 400);
  }

  // Criptografa nova senha com bcrypt (10 rounds de salt)
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Atualiza a senha e limpa imediatamente os campos temporários de redefinição
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordCode: null,
      resetPasswordExpires: null,
    },
  });

  return {
    success: true,
    message: 'Sua senha foi redefinida com sucesso! Você já pode entrar com sua nova senha.',
  };
}
