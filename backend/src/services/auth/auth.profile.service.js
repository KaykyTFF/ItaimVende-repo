import bcrypt from 'bcryptjs';
import prisma from '../../config/prisma.js';
import { AppError } from '../../utils/errors.js';
import { storageAdapter } from '../../adapters/storage/index.js';

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
      neighborhood: true,
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
          orders: true,
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
      neighborhood: true,
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
  const { name, username, phone, city, neighborhood, bio, avatar } = updateData;

  let oldAvatar = null;
  if (avatar !== undefined) {
    const current = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatar: true },
    });
    oldAvatar = current?.avatar || null;
  }

  const dataToUpdate = {};
  if (name) dataToUpdate.name = name.trim();
  if (username) dataToUpdate.username = username.trim().toLowerCase();
  if (phone !== undefined) dataToUpdate.phone = phone ? phone.trim() : null;
  if (city !== undefined) dataToUpdate.city = city.trim();
  if (neighborhood !== undefined) dataToUpdate.neighborhood = neighborhood.trim();
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
      neighborhood: true,
      bio: true,
      avatar: true,
      isVerified: true,
      ratingAverage: true,
      ratingCount: true,
      salesCount: true,
    },
  });

  // Se o avatar foi substituído, remove a foto anterior do bucket para evitar mídia órfã
  if (oldAvatar && avatar && oldAvatar !== avatar && !oldAvatar.includes('icon-user') && !oldAvatar.includes('placeholder')) {
    storageAdapter.delete(oldAvatar).catch((err) => {
      console.warn(`[updateUserProfile] Erro ao remover avatar anterior: ${err.message}`);
    });
  }

  return {
    ...updatedUser,
    ratingAverage: Number(updatedUser.ratingCount) > 0 ? Number(updatedUser.ratingAverage) : 0,
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

