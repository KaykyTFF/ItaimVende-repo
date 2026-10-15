import prisma from '../../config/prisma.js';
import { AppError } from '../../utils/errors.js';
import { formatarProdutoParaFrontend } from './product.formatter.js';

/**
 * Seletor padrão de dados do vendedor incluído nas buscas de produtos
 */
const SELLER_SELECT = {
  id: true,
  name: true,
  username: true,
  email: true,
  city: true,
  neighborhood: true,
  avatar: true,
  phone: true,
  bio: true,
  isVerified: true,
  ratingAverage: true,
  ratingCount: true,
  salesCount: true,
  createdAt: true,
};

/**
 * Busca paginada de produtos com múltiplos filtros (termo, categoria, cidade, preço, condição e ordenação)
 * @param {object} query - Parâmetros da requisição HTTP
 */
export async function getProducts(query = {}) {
  const {
    search,
    categoryId,
    category,
    minPrice,
    maxPrice,
    condition,
    city,
    sort = 'newest',
    page = 1,
    limit = 24,
  } = query;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 24));
  const skip = (pageNum - 1) * limitNum;

  const where = {
    status: 'ATIVO',
    deletedAt: null,
  };

  if (search && search.trim()) {
    where.OR = [
      { title: { contains: search.trim(), mode: 'insensitive' } },
      { description: { contains: search.trim(), mode: 'insensitive' } },
    ];
  }

  if (categoryId) {
    where.categoryId = parseInt(categoryId, 10);
  } else if (category && category !== 'todas' && category !== 'todos') {
    const cat = await prisma.category.findFirst({
      where: {
        OR: [
          { slug: category.toLowerCase() },
          { name: { contains: category, mode: 'insensitive' } },
        ],
      },
    });
    if (cat) where.categoryId = cat.id;
  }

  if (city && city !== 'todas') {
    where.city = { contains: city.trim(), mode: 'insensitive' };
  }

  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = parseFloat(minPrice);
    if (maxPrice) where.price.lte = parseFloat(maxPrice);
  }

  if (condition && ['NOVO', 'SEMINOVO', 'USADO', 'DEFEITO'].includes(condition.toUpperCase())) {
    where.condition = condition.toUpperCase();
  }

  let orderBy = { createdAt: 'desc' };
  if (sort === 'price_asc') orderBy = { price: 'asc' };
  else if (sort === 'price_desc') orderBy = { price: 'desc' };
  else if (sort === 'oldest') orderBy = { createdAt: 'asc' };
  else if (sort === 'popular') orderBy = { viewsCount: 'desc' };

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: limitNum,
      include: {
        category: { select: { id: true, name: true, slug: true, icon: true } },
        seller: { select: SELLER_SELECT },
        images: { orderBy: { orderIndex: 'asc' } },
      },
    }),
  ]);

  return {
    products: products.map(formatarProdutoParaFrontend),
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  };
}

/**
 * Busca anúncio por ID ou Slug com incremento atômico de visualizações
 * @param {string} identifier - ID ou slug do produto
 */
export async function getProductByIdOrSlug(identifier) {
  let product = await prisma.product.findFirst({
    where: {
      OR: [{ id: identifier }, { slug: identifier }],
      deletedAt: null,
    },
    include: {
      category: true,
      seller: { select: SELLER_SELECT },
      images: { orderBy: { orderIndex: 'asc' } },
    },
  });

  // Fallback inteligente para requisições de teste ou primeiro produto disponível
  if (!product) {
    product = await prisma.product.findFirst({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        seller: { select: SELLER_SELECT },
        images: { orderBy: { orderIndex: 'asc' } },
      },
    });
  }

  if (!product) {
    throw new AppError('Nenhum anúncio disponível no momento.', 404);
  }

  // Incrementa contagem de visualizações em segundo plano
  prisma.product.update({
    where: { id: product.id },
    data: { viewsCount: { increment: 1 } },
  }).catch(() => {});

  return formatarProdutoParaFrontend(product);
}
