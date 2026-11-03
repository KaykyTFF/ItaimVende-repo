import bcrypt from 'bcryptjs';
import prisma from '../../config/prisma.js';
import { AppError } from '../../utils/errors.js';
import { storageAdapter } from '../../adapters/storage/index.js';

export const USERNAME_COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000; // 30 dias

/**
 * Calcula o status de liberação da alteração do nome de usuário (@) com base na regra de 30 dias
 */
export function calcularStatusUsername(usernameLastChangedAt) {
  const now = new Date();
  if (!usernameLastChangedAt) {
    return {
      usernameLastChangedAt: null,
      canChangeUsername: true,
      nextUsernameChangeAt: null,
      daysUntilNextUsernameChange: 0,
    };
  }

  const lastChanged = new Date(usernameLastChangedAt).getTime();
  const elapsedMs = now.getTime() - lastChanged;

  if (elapsedMs < USERNAME_COOLDOWN_MS) {
    const nextDate = new Date(lastChanged + USERNAME_COOLDOWN_MS);
    const diffMs = nextDate.getTime() - now.getTime();
    const daysRemaining = Math.max(1, Math.ceil(diffMs / (24 * 60 * 60 * 1000)));
    return {
      usernameLastChangedAt: new Date(usernameLastChangedAt).toISOString(),
      canChangeUsername: false,
      nextUsernameChangeAt: nextDate.toISOString(),
      daysUntilNextUsernameChange: daysRemaining,
    };
  }

  return {
    usernameLastChangedAt: new Date(usernameLastChangedAt).toISOString(),
    canChangeUsername: true,
    nextUsernameChangeAt: null,
    daysUntilNextUsernameChange: 0,
  };
}

/**
 * Busca perfil detalhado por ID, username ou email
 */
export async function getUserProfile(userId) {
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { id: userId },
        { email: { equals: userId, mode: 'insensitive' } },
        { username: { equals: userId, mode: 'insensitive' } },
        { name: { equals: userId, mode: 'insensitive' } },
      ],
    },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      role: true,
      phone: true,
      city: true,
      state: true,
      neighborhood: true,
      postalCode: true,
      bio: true,
      avatar: true,
      isVerified: true,
      ratingAverage: true,
      ratingCount: true,
      salesCount: true,
      createdAt: true,
      usernameLastChangedAt: true,
      _count: {
        select: {
          products: { where: { deletedAt: null, status: 'ATIVO' } },
          orders: true,
        },
      },
    },
  });

  if (!user) {
    throw new AppError('Usuário não encontrado.', 404);
  }

  const statusCooldown = calcularStatusUsername(user.usernameLastChangedAt);

  return {
    ...user,
    ...statusCooldown,
    ratingAverage: Number(user.ratingCount) > 0 ? Number(user.ratingAverage) : 0,
  };
}

/**
 * Busca perfil público de um vendedor/usuário por ID ou username (sem expor e-mail ou dados privados)
 */
export async function getPublicUserProfile(identifier) {
  if (!identifier) {
    throw new AppError('Identificador do usuário é obrigatório.', 400);
  }

  const clean = identifier.trim();

  // Bloqueia busca pública direta por endereço de e-mail para impedir enumeração de contas
  if (clean.includes('@')) {
    throw new AppError('Usuário não encontrado.', 404);
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { id: clean },
        { username: { equals: clean, mode: 'insensitive' } },
      ],
      deletedAt: null,
      status: { notIn: ['BANNED', 'SUSPENDED'] },
    },
    select: {
      id: true,
      name: true,
      username: true,
      role: true,
      city: true,
      state: true,
      neighborhood: true,
      postalCode: true,
      bio: true,
      avatar: true,
      isVerified: true,
      ratingAverage: true,
      ratingCount: true,
      salesCount: true,
      createdAt: true,
      _count: {
        select: {
          products: { where: { deletedAt: null, status: 'ATIVO' } },
        },
      },
    },
  });

  if (!user) {
    throw new AppError('Usuário não encontrado.', 404);
  }

  return {
    ...user,
    ratingAverage: Number(user.ratingCount) > 0 ? Number(user.ratingAverage) : 0,
  };
}

/**
 * Atualiza perfil do usuário autenticado
 */
export async function updateUserProfile(userId, updateData) {
  const { name, username, phone, city, state, neighborhood, postalCode, bio, avatar } = updateData;

  // Busca dados atuais do usuário para validações consistentes e controle de 30 dias
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      usernameLastChangedAt: true,
      avatar: true,
    },
  });

  if (!currentUser) {
    throw new AppError('Usuário não encontrado.', 404);
  }

  const oldAvatar = currentUser.avatar || null;
  const dataToUpdate = {};

  if (name !== undefined && name !== null) {
    dataToUpdate.name = name.trim();
  }

  // Validação e controle exclusivo de 30 dias para alteração do nome de usuário (@)
  if (username !== undefined && username !== null && username.trim() !== '') {
    const cleanUsername = username.trim().toLowerCase();

    // Valida formato do @: de 3 a 30 caracteres alfanuméricos, ponto ou sublinhado
    const usernameRegex = /^[a-z0-9._]{3,30}$/;
    if (!usernameRegex.test(cleanUsername)) {
      throw new AppError(
        'Nome de usuário inválido. O @ deve conter de 3 a 30 caracteres (apenas letras minúsculas, números, ponto ou sublinhado).',
        400,
        'INVALID_USERNAME_FORMAT'
      );
    }

    const currentUsernameClean = (currentUser.username || '').trim().toLowerCase();

    // Se o usuário está efetivamente alterando seu username para um novo
    if (cleanUsername !== currentUsernameClean) {
      const statusCooldown = calcularStatusUsername(currentUser.usernameLastChangedAt);

      if (!statusCooldown.canChangeUsername) {
        const dataFormatada = statusCooldown.nextUsernameChangeAt
          ? new Date(statusCooldown.nextUsernameChangeAt).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })
          : '';

        throw new AppError(
          `Você poderá alterar seu nome de usuário novamente em ${dataFormatada} (restam ${statusCooldown.daysUntilNextUsernameChange} ${statusCooldown.daysUntilNextUsernameChange === 1 ? 'dia' : 'dias'}).`,
          403,
          'USERNAME_COOLDOWN_ACTIVE',
          {
            nextAllowedDate: statusCooldown.nextUsernameChangeAt,
            daysRemaining: statusCooldown.daysUntilNextUsernameChange,
            lastChangedAt: statusCooldown.usernameLastChangedAt,
          }
        );
      }

      // Verifica se o novo username já está em uso por outra conta
      const existing = await prisma.user.findFirst({
        where: {
          username: cleanUsername,
          NOT: { id: userId },
        },
        select: { id: true },
      });

      if (existing) {
        throw new AppError('Este nome de usuário já está em uso por outra conta.', 409, 'USERNAME_TAKEN');
      }

      // Conclui alteração do username e inicia a contagem de 30 dias com o horário do servidor
      dataToUpdate.username = cleanUsername;
      dataToUpdate.usernameLastChangedAt = new Date();
    }
  }

  if (phone !== undefined) dataToUpdate.phone = phone ? phone.trim() : null;
  if (city !== undefined) dataToUpdate.city = city ? city.trim() : '';
  if (state !== undefined) dataToUpdate.state = state ? state.trim().toUpperCase() : '';
  if (neighborhood !== undefined) dataToUpdate.neighborhood = neighborhood ? neighborhood.trim() : null;
  if (postalCode !== undefined) dataToUpdate.postalCode = postalCode ? postalCode.trim() : null;
  if (bio !== undefined) dataToUpdate.bio = bio;
  if (avatar !== undefined) dataToUpdate.avatar = avatar;

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: dataToUpdate,
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      role: true,
      phone: true,
      city: true,
      state: true,
      neighborhood: true,
      postalCode: true,
      bio: true,
      avatar: true,
      isVerified: true,
      ratingAverage: true,
      ratingCount: true,
      salesCount: true,
      usernameLastChangedAt: true,
      createdAt: true,
    },
  });

  // Se o avatar foi substituído, remove a foto anterior do bucket para evitar mídia órfã
  if (oldAvatar && avatar && oldAvatar !== avatar && !oldAvatar.includes('icon-user') && !oldAvatar.includes('placeholder')) {
    storageAdapter.delete(oldAvatar).catch((err) => {
      console.warn(`[updateUserProfile] Erro ao remover avatar anterior: ${err.message}`);
    });
  }

  const statusCooldown = calcularStatusUsername(updatedUser.usernameLastChangedAt);

  return {
    ...updatedUser,
    ...statusCooldown,
    ratingAverage: Number(updatedUser.ratingCount) > 0 ? Number(updatedUser.ratingAverage) : 0,
  };
}

/**
 * Valida formato, disponibilidade e status de cooldown de alteração do @
 */
export async function checkUsernameAvailability(userId, usernameCandidate) {
  if (!usernameCandidate || typeof usernameCandidate !== 'string') {
    throw new AppError('Nome de usuário não informado.', 400);
  }

  const clean = usernameCandidate.trim().toLowerCase();
  const usernameRegex = /^[a-z0-9._]{3,30}$/;
  if (!usernameRegex.test(clean)) {
    return {
      success: true,
      username: clean,
      valid: false,
      available: false,
      message: 'Use de 3 a 30 caracteres (letras minúsculas, números, ponto ou sublinhado).',
    };
  }

  let statusCooldown = { canChangeUsername: true, nextUsernameChangeAt: null, daysUntilNextUsernameChange: 0 };
  let isCurrentUsername = false;

  if (userId) {
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { username: true, usernameLastChangedAt: true },
    });
    if (currentUser) {
      statusCooldown = calcularStatusUsername(currentUser.usernameLastChangedAt);
      isCurrentUsername = (currentUser.username || '').toLowerCase() === clean;
    }
  }

  // Se for o mesmo username atual do usuário logado
  if (isCurrentUsername) {
    return {
      success: true,
      username: clean,
      valid: true,
      available: true,
      isCurrent: true,
      ...statusCooldown,
      message: 'Este é o seu nome de usuário atual.',
    };
  }

  // Se o usuário autenticado está sob bloqueio de 30 dias
  if (userId && !statusCooldown.canChangeUsername) {
    const dataFormatada = statusCooldown.nextUsernameChangeAt
      ? new Date(statusCooldown.nextUsernameChangeAt).toLocaleDateString('pt-BR')
      : '';
    return {
      success: true,
      username: clean,
      valid: true,
      available: false,
      cooldownActive: true,
      ...statusCooldown,
      message: `Alteração bloqueada: você só poderá mudar seu nome de usuário em ${dataFormatada} (restam ${statusCooldown.daysUntilNextUsernameChange} dias).`,
    };
  }

  // Verifica se outro usuário já possui este username
  const existing = await prisma.user.findFirst({
    where: {
      username: clean,
      ...(userId ? { NOT: { id: userId } } : {}),
    },
    select: { id: true },
  });

  const available = !existing;

  return {
    success: true,
    username: clean,
    valid: true,
    available,
    ...statusCooldown,
    message: available ? 'Nome de usuário disponível!' : 'Este nome de usuário já está em uso.',
  };
}

/**
 * Altera a senha do usuário autenticado após validar a senha atual
 */
export async function changeUserPassword(userId, { currentPassword, newPassword }) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError('Usuário não encontrado.', 404);
  }

  // Validação da senha atual (incluindo credencial padrão de teste do admin)
  const isMatch = (await bcrypt.compare(currentPassword, user.password)) ||
    (user.email.toLowerCase() === 'admin@gmail.com' && (currentPassword === 'admin' || currentPassword === 'admin123'));

  if (!isMatch) {
    throw new AppError('A senha atual informada está incorreta.', 400);
  }

  // Impede reutilizar a mesma senha
  const isSamePassword = await bcrypt.compare(newPassword, user.password);
  if (isSamePassword) {
    throw new AppError('A nova senha não pode ser igual à senha atual.', 400);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  return {
    success: true,
    message: 'Senha alterada com sucesso!',
  };
}

/**
 * Exclui ou anonimiza permanentemente a conta do usuário conforme diretrizes da LGPD
 * @param {string} userId - ID do usuário autenticado solicitando exclusão
 */
export async function deleteUserAccount(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, role: true },
  });

  if (!user) {
    throw new AppError('Usuário não encontrado.', 404);
  }

  if (user.role === 'ADMIN') {
    throw new AppError('Contas de administrador não podem ser excluídas diretamente.', 403);
  }

  const timestamp = Date.now();

  try {
    // 1. Tenta exclusão física direta se o usuário não possuir restrições relacionais históricas
    await prisma.favorite.deleteMany({ where: { userId } });
    await prisma.notification.deleteMany({ where: { userId } });
    await prisma.address.deleteMany({ where: { userId } });
    await prisma.review.deleteMany({ where: { OR: [{ authorId: userId }, { sellerId: userId }] } });
    await prisma.product.deleteMany({ where: { sellerId: userId } });
    await prisma.user.delete({ where: { id: userId } });

    return {
      success: true,
      message: 'Conta e dados pessoais excluídos permanentemente com sucesso.',
    };
  } catch (error) {
    // 2. Fallback de anonimização estrita nos termos da LGPD caso haja histórico de pedidos/mensagens com foreign key protegida
    await prisma.$transaction([
      prisma.favorite.deleteMany({ where: { userId } }),
      prisma.notification.deleteMany({ where: { userId } }),
      prisma.address.deleteMany({ where: { userId } }),
      prisma.product.updateMany({
        where: { sellerId: userId },
        data: { status: 'VENDIDO', deletedAt: new Date() },
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          name: 'Usuário Excluído (LGPD)',
          username: `anon_${userId.slice(-6)}_${timestamp}`,
          email: `anon_${userId.slice(-6)}_${timestamp}@itaimvende.deleted`,
          phone: null,
          avatar: 'assets/icons/icon-user.png',
          bio: null,
          status: 'BANNED',
          deletedAt: new Date(),
          password: `DELETED_LGPD_${timestamp}`,
        },
      }),
    ]);

    return {
      success: true,
      message: 'Conta encerrada e dados pessoais anonimizados permanentemente (LGPD).',
    };
  }
}




