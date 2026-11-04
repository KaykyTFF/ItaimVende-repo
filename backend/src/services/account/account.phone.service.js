import prisma from '../../config/prisma.js';
import { AppError } from '../../utils/errors.js';

/**
 * Formata um telefone de 10 ou 11 dígitos no padrão brasileiro
 */
export function formatarTelefone(digitos) {
  if (!digitos) return null;
  const limpo = digitos.replace(/\D/g, '');
  if (limpo.length === 11) {
    return `(${limpo.slice(0, 2)}) ${limpo.slice(2, 7)}-${limpo.slice(7)}`;
  }
  if (limpo.length === 10) {
    return `(${limpo.slice(0, 2)}) ${limpo.slice(2, 6)}-${limpo.slice(6)}`;
  }
  return limpo;
}

/**
 * Altera ou remove exclusivamente o número de WhatsApp / celular do usuário
 */
export async function changePhone(userId, rawPhone, meta = {}) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, phone: true, email: true, username: true, avatar: true },
  });

  if (!user) {
    throw new AppError('Usuário não encontrado.', 404);
  }

  let cleanPhone = null;

  if (rawPhone !== null && rawPhone !== undefined && rawPhone.trim() !== '') {
    const digitos = rawPhone.replace(/\D/g, '');

    // Validação de formato (10 ou 11 dígitos)
    if (digitos.length !== 10 && digitos.length !== 11) {
      throw new AppError(
        'Informe um número de telefone com DDD válido (10 ou 11 dígitos).',
        400,
        'INVALID_PHONE_FORMAT'
      );
    }

    // Validação de DDD brasileiro (11 a 99)
    const ddd = parseInt(digitos.substring(0, 2), 10);
    if (ddd < 11 || ddd > 99) {
      throw new AppError('DDD informado é inválido.', 400, 'INVALID_DDD');
    }

    // Celulares no Brasil (11 dígitos) iniciam com 9
    if (digitos.length === 11 && digitos[2] !== '9') {
      throw new AppError('Números de celular devem começar com 9.', 400, 'INVALID_MOBILE_PREFIX');
    }

    cleanPhone = digitos;
  }

  const oldPhoneClean = user.phone ? user.phone.replace(/\D/g, '') : null;

  // Se for o mesmo número cadastrado
  if (cleanPhone === oldPhoneClean) {
    return {
      success: true,
      message: cleanPhone ? 'Este já é o seu número de WhatsApp cadastrado.' : 'Nenhum telefone cadastrado.',
      user: {
        ...user,
        phoneFormatted: formatarTelefone(cleanPhone),
      },
    };
  }

  const [updatedUser] = await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        phone: cleanPhone,
        phoneVerifiedAt: cleanPhone ? new Date() : null,
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
        newPhone: cleanPhone,
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
          newPhone: cleanPhone,
          userAgent: meta.userAgent || null,
        },
      },
    }),
  ]);

  return {
    success: true,
    message: cleanPhone
      ? 'Número de WhatsApp atualizado com sucesso!'
      : 'Número de telefone desvinculado com sucesso da sua conta.',
    user: {
      ...updatedUser,
      phoneFormatted: formatarTelefone(cleanPhone),
    },
  };
}

