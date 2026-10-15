import prisma from '../../config/prisma.js';
import { AppError } from '../../utils/errors.js';
import { formatarProdutoParaFrontend } from './product.formatter.js';

/**
 * Seletor padrão de dados públicos do vendedor
 */
const SELLER_PUBLIC_SELECT = {
  id: true,
  name: true,
  username: true,
  email: true,
  phone: true,
  city: true,
  neighborhood: true,
  avatar: true,
  bio: true,
  isVerified: true,
  ratingAverage: true,
  ratingCount: true,
  salesCount: true,
  createdAt: true,
};

/**
 * Busca todos os anúncios do vendedor autenticado (com sumário de ativos, pausados e vendidos)
 * @param {string} sellerId - ID do vendedor autenticado
 */
export async function getMyProducts(sellerId) {
  const products = await prisma.product.findMany({
    where: {
      sellerId,
      deletedAt: null,
    },
    orderBy: { createdAt: 'desc' },
    include: {
      category: { select: { id: true, name: true, slug: true, icon: true } },
      seller: { select: SELLER_PUBLIC_SELECT },
      images: { orderBy: { orderIndex: 'asc' } },
    },
  });

  const formatted = products.map(formatarProdutoParaFrontend);

  const summary = {
    total: formatted.length,
    ativos: formatted.filter((p) => p.status === 'ATIVO').length,
    pausados: formatted.filter((p) => p.status === 'PAUSADO').length,
    vendidos: formatted.filter((p) => p.status === 'VENDIDO').length,
  };

  return { products: formatted, summary };
}

/**
 * Busca a vitrine pública de anúncios de um vendedor específico
 * @param {string} sellerId - ID, email, username ou nome do vendedor
 * @param {boolean} includeAllStatuses - Se verdadeiro, inclui pausados/vendidos (admin)
 */
export async function getSellerProducts(sellerId, includeAllStatuses = false) {
  const seller = await prisma.user.findFirst({
    where: {
      OR: [
        { id: sellerId },
        { email: { equals: sellerId, mode: 'insensitive' } },
        { username: { equals: sellerId, mode: 'insensitive' } },
        { name: { equals: sellerId, mode: 'insensitive' } },
      ],
    },
    select: SELLER_PUBLIC_SELECT,
  });

  if (!seller) {
    throw new AppError('Vendedor não encontrado.', 404);
  }

  const where = {
    sellerId: seller.id,
    deletedAt: null,
  };

  if (!includeAllStatuses) {
    where.status = 'ATIVO';
  }

  const products = await prisma.product.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      category: { select: { id: true, name: true, slug: true, icon: true } },
      images: { orderBy: { orderIndex: 'asc' } },
    },
  });

  return {
    seller: {
      ...seller,
      ratingAverage: Number(seller.ratingAverage),
    },
    products: products.map((p) => formatarProdutoParaFrontend({ ...p, seller })),
  };
}
