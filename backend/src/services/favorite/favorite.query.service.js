import prisma from '../../config/prisma.js';
import { formatarProdutoParaFrontend } from './favorite.formatter.js';

/**
 * Lista todos os produtos favoritados pelo usuário autenticado
 */
export async function getUserFavorites(userId) {
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      product: {
        include: {
          category: { select: { id: true, name: true, slug: true, icon: true } },
          seller: {
            select: {
              id: true,
              name: true,
              username: true,
              email: true,
              city: true,
              neighborhood: true,
              avatar: true,
              phone: true,
              isVerified: true,
            },
          },
          images: { orderBy: { orderIndex: 'asc' } },
        },
      },
    },
  });

  const validProducts = favorites
    .filter((f) => f.product && !f.product.deletedAt)
    .map((f) => ({
      favoriteId: f.id,
      favoritadoEm: f.createdAt,
      ...formatarProdutoParaFrontend(f.product),
    }));

  return {
    favorites: validProducts,
    total: validProducts.length,
  };
}

/**
 * Verifica se um produto específico está favoritado pelo usuário
 */
export async function checkFavoriteStatus(userId, productId) {
  const favorite = await prisma.favorite.findUnique({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
  });

  return { isFavorited: Boolean(favorite) };
}
