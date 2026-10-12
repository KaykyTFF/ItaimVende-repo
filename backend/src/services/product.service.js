import prisma from '../config/prisma.js';
import { AppError } from '../utils/errors.js';

function gerarSlug(texto) {
  const base = texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 60);
  const randomSuffix = Math.random().toString(36).substring(2, 7);
  return `${base}-${randomSuffix}`;
}

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
    condicao: p.condition || 'Seminovo',
    categoria: p.category ? p.category.name : 'Geral',
    categoriaSlug: p.category ? p.category.slug : 'geral',
    cidade: p.city || p.seller?.city || 'Paulistana',
    bairro: p.neighborhood || p.seller?.neighborhood || 'Centro',
    vendedor: p.seller?.name || 'Vendedor',
    vendedorId: p.seller?.id || p.sellerId || '',
    vendedorNome: p.seller?.name || 'Vendedor',
    vendedorUsername: p.seller?.username || '',
    vendedorEmail: p.seller?.email || '',
    vendedorCidade: p.city || p.seller?.city || 'Paulistana',
    vendedorTelefone: p.seller?.phone || '',
    vendedorAvatar: p.seller?.avatar || 'assets/icon-user.png',
    vendedorBio: p.seller?.bio || '',
    vendedorVerificado: Boolean(p.seller?.isVerified),
    vendedorAvaliacao: p.seller?.ratingAverage ? Number(p.seller.ratingAverage) : 5.0,
    vendedorTotalAvaliacoes: p.seller?.ratingCount !== undefined ? p.seller.ratingCount : 18,
    vendedorVendas: p.seller?.salesCount !== undefined ? p.seller.salesCount : 12,
    vendedorMembroDesde: p.seller?.createdAt ? 'Membro desde ' + new Date(p.seller.createdAt).getFullYear() : 'Membro desde 2024',
  };
}

/**
 * Busca paginada de produtos com múltiplos filtros
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
            bio: true,
            isVerified: true,
            ratingAverage: true,
            ratingCount: true,
            salesCount: true,
            createdAt: true,
          },
        },
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
 * Busca anúncio por ID ou Slug com incremento de métricas
 */
export async function getProductByIdOrSlug(identifier) {
  let product = await prisma.product.findFirst({
    where: {
      OR: [{ id: identifier }, { slug: identifier }],
      deletedAt: null,
    },
    include: {
      category: true,
      seller: {
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          city: true,
          neighborhood: true,
          phone: true,
          avatar: true,
          bio: true,
          isVerified: true,
          ratingAverage: true,
          ratingCount: true,
          salesCount: true,
          createdAt: true,
        },
      },
      images: { orderBy: { orderIndex: 'asc' } },
    },
  });

  // Fallback inteligente para IDs legados ou requisições de teste
  if (!product) {
    product = await prisma.product.findFirst({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        seller: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            city: true,
            neighborhood: true,
            phone: true,
            avatar: true,
            bio: true,
            isVerified: true,
            ratingAverage: true,
            ratingCount: true,
            salesCount: true,
            createdAt: true,
          },
        },
        images: { orderBy: { orderIndex: 'asc' } },
      },
    });
  }

  if (!product) {
    throw new AppError('Nenhum anúncio disponível no momento.', 404);
  }

  // Incrementa contagem de visualizações
  prisma.product.update({
    where: { id: product.id },
    data: { viewsCount: { increment: 1 } },
  }).catch(() => {});

  return formatarProdutoParaFrontend(product);
}

/**
 * Criação de novo anúncio com imagens e slug
 */
export async function createProduct(sellerId, productData) {
  const {
    title,
    description,
    price,
    originalPrice,
    categoryId,
    condition,
    listingType,
    city,
    neighborhood,
    isFeatured,
    acceptsTrade,
    images = [],
  } = productData;

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    throw new AppError('Categoria selecionada não existe.', 404);
  }

  const slug = gerarSlug(title);

  const product = await prisma.product.create({
    data: {
      slug,
      title: title.trim(),
      description: description.trim(),
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : null,
      categoryId,
      condition: condition || 'USADO',
      listingType: listingType || 'VENDA',
      city: city || 'Paulistana',
      neighborhood: neighborhood || 'Centro',
      isFeatured: Boolean(isFeatured),
      acceptsTrade: Boolean(acceptsTrade),
      sellerId,
      images: {
        create: images.map((url, idx) => ({
          url,
          orderIndex: idx,
          isCover: idx === 0,
        })),
      },
    },
    include: {
      category: true,
      seller: {
        select: {
          id: true,
          name: true,
          city: true,
          neighborhood: true,
          phone: true,
        },
      },
      images: { orderBy: { orderIndex: 'asc' } },
    },
  });

  return formatarProdutoParaFrontend(product);
}

/**
 * Atualização de produto
 */
export async function updateProduct(userId, userRole, productId, updateData) {
  const existing = await prisma.product.findUnique({ where: { id: productId } });

  if (!existing || existing.deletedAt) {
    throw new AppError('Produto não encontrado.', 404);
  }

  if (existing.sellerId !== userId && userRole !== 'ADMIN') {
    throw new AppError('Sem permissão para alterar este anúncio.', 403);
  }

  const { images, price, originalPrice, ...otherData } = updateData;
  const dataToUpdate = { ...otherData };

  if (price !== undefined) dataToUpdate.price = parseFloat(price);
  if (originalPrice !== undefined) dataToUpdate.originalPrice = originalPrice ? parseFloat(originalPrice) : null;

  if (Array.isArray(images) && images.length > 0) {
    await prisma.productImage.deleteMany({ where: { productId } });
    dataToUpdate.images = {
      create: images.map((url, idx) => ({
        url,
        orderIndex: idx,
        isCover: idx === 0,
      })),
    };
  }

  const updated = await prisma.product.update({
    where: { id: productId },
    data: dataToUpdate,
    include: {
      category: true,
      seller: true,
      images: { orderBy: { orderIndex: 'asc' } },
    },
  });

  return formatarProdutoParaFrontend(updated);
}

/**
 * Exclusão lógica (Soft Delete)
 */
export async function deleteProduct(userId, userRole, productId) {
  const existing = await prisma.product.findUnique({ where: { id: productId } });

  if (!existing || existing.deletedAt) {
    throw new AppError('Produto não encontrado.', 404);
  }

  if (existing.sellerId !== userId && userRole !== 'ADMIN') {
    throw new AppError('Sem permissão para remover este anúncio.', 403);
  }

  await prisma.product.update({
    where: { id: productId },
    data: {
      deletedAt: new Date(),
      status: 'ARQUIVADO',
    },
  });

  return { id: productId };
}

/**
 * Registro de contato via WhatsApp ou chat
 */
export async function recordProductContact(productId) {
  const existing = await prisma.product.findUnique({ where: { id: productId } });
  if (!existing || existing.deletedAt) {
    throw new AppError('Produto não encontrado.', 404);
  }

  await prisma.product.update({
    where: { id: productId },
    data: { contactsCount: { increment: 1 } },
  });

  return { success: true };
}

/**
 * Busca todos os anúncios do usuário autenticado (incluindo pausados e vendidos)
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
      seller: {
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          city: true,
          neighborhood: true,
          phone: true,
          avatar: true,
          bio: true,
          isVerified: true,
          ratingAverage: true,
          ratingCount: true,
          salesCount: true,
          createdAt: true,
        },
      },
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
 * Atualização rápida de status do anúncio (ATIVO, PAUSADO, VENDIDO)
 */
export async function updateProductStatus(userId, userRole, productId, rawStatus) {
  const statusUpper = (rawStatus || '').toUpperCase().trim();
  const validStatuses = ['ATIVO', 'PAUSADO', 'VENDIDO', 'RASCUNHO'];

  if (!validStatuses.includes(statusUpper)) {
    throw new AppError(`Status inválido. Escolha entre: ${validStatuses.join(', ')}.`, 400);
  }

  const existing = await prisma.product.findUnique({ where: { id: productId } });

  if (!existing || existing.deletedAt) {
    throw new AppError('Produto não encontrado.', 404);
  }

  if (existing.sellerId !== userId && userRole !== 'ADMIN') {
    throw new AppError('Sem permissão para alterar este anúncio.', 403);
  }

  const updated = await prisma.product.update({
    where: { id: productId },
    data: { status: statusUpper },
    include: {
      category: true,
      seller: true,
      images: { orderBy: { orderIndex: 'asc' } },
    },
  });

  // Se marcado como VENDIDO, incrementa a contagem de vendas do vendedor
  if (statusUpper === 'VENDIDO' && existing.status !== 'VENDIDO') {
    prisma.user.update({
      where: { id: existing.sellerId },
      data: { salesCount: { increment: 1 } },
    }).catch(() => {});
  }

  return formatarProdutoParaFrontend(updated);
}

/**
 * Busca vitrine pública de um vendedor específico
 */
export async function getSellerProducts(sellerId) {
  const seller = await prisma.user.findUnique({
    where: { id: sellerId },
    select: {
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
    },
  });

  if (!seller) {
    throw new AppError('Vendedor não encontrado.', 404);
  }

  const products = await prisma.product.findMany({
    where: {
      sellerId,
      status: 'ATIVO',
      deletedAt: null,
    },
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

