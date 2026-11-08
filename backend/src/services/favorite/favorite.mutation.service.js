import prisma from '../../config/prisma.js';
import { AppError } from '../../utils/errors.js';

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

    if (product.sellerId && product.sellerId !== userId) {
      import('../notification/index.js').then(({ createNotification }) => {
        createNotification({
          userId: product.sellerId,
          title: 'Anúncio salvo por outro usuário',
          message: `Um usuário salvou seu anúncio "${product.title}" nos favoritos.`,
          type: 'favorito',
          link: `/pages/produtos/produto.html?id=${productId}`,
        }).catch(() => {});
      }).catch(() => {});
    }

    return { favorited: true, message: 'Anúncio salvo nos favoritos!' };
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

  if (product.sellerId && product.sellerId !== userId) {
    import('../notification/index.js').then(({ createNotification }) => {
      createNotification({
        userId: product.sellerId,
        title: 'Anúncio salvo por outro usuário',
        message: `Um usuário salvou seu anúncio "${product.title}" nos favoritos.`,
        type: 'favorito',
        link: `/pages/produtos/produto.html?id=${productId}`,
      }).catch(() => {});
    }).catch(() => {});
  }

  return { favorited: true, message: 'Anúncio salvo nos favoritos!' };
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
