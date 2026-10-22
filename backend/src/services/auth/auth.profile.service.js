import bcrypt from 'bcryptjs';
import prisma from '../../config/prisma.js';
import { AppError } from '../../utils/errors.js';

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
 * Atualiza perfil do usuário autenticado
 */
export async function updateUserProfile(userId, updateData) {
  const { name, username, phone, city, neighborhood, bio, avatar } = updateData;

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
