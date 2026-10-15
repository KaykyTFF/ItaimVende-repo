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
    ratingAverage: Number(user.ratingAverage),
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
    ratingAverage: Number(updatedUser.ratingAverage),
  };
}
