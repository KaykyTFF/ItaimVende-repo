import prisma from '../../config/prisma.js';
import { AppError } from '../../utils/errors.js';

async function dispararNotificacaoFavorito(userId, product) {
  if (!product.sellerId || product.sellerId === userId) return;

  try {
    const umaHoraAtras = new Date(Date.now() - 60 * 60 * 1000);
    const notifExistente = await prisma.notification.findFirst({
      where: {
        userId: product.sellerId,
        type: 'favorito',
        link: { contains: product.id },
        createdAt: { gte: umaHoraAtras },
      },
    });

    if (notifExistente) return;

    const [user, { createNotification }] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { name: true, avatar: true } }),
      import('../notification/index.js'),
    ]);

    const nomeUsuario = user?.name || 'Um usuário';
    const firstImage = Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : '';
    const avatarParam = user?.avatar ? `&avatar=${encodeURIComponent(user.avatar)}` : '';
    const imgParam = firstImage ? `&img=${encodeURIComponent(firstImage)}` : '';

    await createNotification({
      userId: product.sellerId,
      title: 'Anúncio salvo nos favoritos',
      message: `${nomeUsuario} salvou seu anúncio "${product.title}" nos favoritos.`,
      type: 'favorito',
      link: `/pages/produtos/produto.html?id=${product.id}${imgParam}${avatarParam}`,
    });
  } catch {
    // Falha silenciosa para não quebrar a transação principal
  }
}

/**
 * Alterna favorito (adiciona se não existir, remove se já existir) de forma atômica
 */
export async function toggleFavorite(userId, productId) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product || product.deletedAt) {
    throw new AppError('Produto não encontrado.', 404);
  }

  const existing = await prisma.favorite.findUnique({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
  });

  if (existing) {
    // Remove dos favoritos e decrementa contador
    await prisma.$transaction([
      prisma.favorite.delete({ where: { id: existing.id } }),
      prisma.product.update({
        where: { id: productId },
        data: { favoritesCount: { decrement: 1 } },
      }),
    ]);

    return { favorited: false, message: 'Anúncio removido dos favoritos.' };
  } else {
    // Adiciona aos favoritos e incrementa contador
    await prisma.$transaction([
      prisma.favorite.create({
        data: { userId, productId },
      }),
      prisma.product.update({
        where: { id: productId },
        data: { favoritesCount: { increment: 1 } },
      }),
    ]);

    dispararNotificacaoFavorito(userId, product).catch(() => {});

    return { favorited: true, message: 'Anúncio salvo nos favoritos.' };
  }
}

/**
 * Adiciona aos favoritos de forma idempotente (REST PUT)
 */
export async function addFavorite(userId, productId) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product || product.deletedAt) {
    throw new AppError('Produto não encontrado.', 404);
  }

  const existing = await prisma.favorite.findUnique({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
  });

  if (existing) {
    return { favorited: true, message: 'Anúncio já estava nos favoritos.' };
  }

  await prisma.$transaction([
    prisma.favorite.create({
      data: { userId, productId },
    }),
    prisma.product.update({
      where: { id: productId },
      data: { favoritesCount: { increment: 1 } },
    }),
  ]);

  dispararNotificacaoFavorito(userId, product).catch(() => {});

  return { favorited: true, message: 'Anúncio salvo nos favoritos.' };
}

/**
 * Remove dos favoritos de forma idempotente (REST DELETE)
 */
export async function removeFavorite(userId, productId) {
  const existing = await prisma.favorite.findUnique({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
  });

  if (!existing) {
    return { favorited: false, message: 'Anúncio não estava nos favoritos.' };
  }

  await prisma.$transaction([
    prisma.favorite.delete({ where: { id: existing.id } }),
    prisma.product.update({
      where: { id: productId },
      data: { favoritesCount: { decrement: 1 } },
    }),
  ]);

  return { favorited: false, message: 'Anúncio removido dos favoritos.' };
}
