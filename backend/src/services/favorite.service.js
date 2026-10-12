import prisma from '../config/prisma.js';
import { AppError } from '../utils/errors.js';

function formatarProdutoParaFrontend(p) {
  const fotosUrls = p.images && p.images.length > 0
    ? p.images.map((img) => img.url)
    : ['assets/produtos/anuncio_13.jpg'];

  const fotoPrincipal = p.images?.find((img) => img.isCover)?.url || fotosUrls[0];

  return {
    ...p,
    price: Number(p.price),
    originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
    images: fotosUrls,
    fotos: fotosUrls,
    imagem: fotoPrincipal,
    titulo: p.title,
    preco: Number(p.price),
    descricao: p.description,
    categoria: p.category ? p.category.name : 'Geral',
    categoriaSlug: p.category ? p.category.slug : 'geral',
    cidade: p.city || p.seller?.city || 'Paulistana',
    bairro: p.neighborhood || p.seller?.neighborhood || 'Centro',
    vendedor: p.seller?.name || 'Vendedor',
    vendedorId: p.seller?.id || p.sellerId || '',
    vendedorNome: p.seller?.name || 'Vendedor',
    vendedorUsername: p.seller?.username || '',
    vendedorEmail: p.seller?.email || '',
    vendedorTelefone: p.seller?.phone || '',
    vendedorAvatar: p.seller?.avatar || 'assets/icon-user.png',
    vendedorVerificado: Boolean(p.seller?.isVerified),
  };
}

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
 * Alterna favorito (adiciona se não existir, remove se já existir)
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

    return { favorited: true, message: 'Anúncio salvo nos favoritos!' };
  }
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
