import prisma from '../../config/prisma.js';
import { AppError } from '../../utils/errors.js';
import { gerarSlug, formatarProdutoParaFrontend } from './product.formatter.js';

/**
 * Criação de novo anúncio com imagens e slug automático
 * @param {string} sellerId - ID do vendedor autenticado
 * @param {object} productData - Dados do anúncio
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
 * Atualização completa de dados do produto com verificação de permissão
 * @param {string} userId - ID do usuário autenticado
 * @param {string} userRole - Papel do usuário (SELLER, ADMIN, etc.)
 * @param {string} productId - ID do produto a atualizar
 * @param {object} updateData - Dados a serem atualizados
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
 * Exclusão lógica (Soft Delete) do anúncio
 * @param {string} userId
 * @param {string} userRole
 * @param {string} productId
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
 * Registro de contato via WhatsApp ou Chat
 * @param {string} productId
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
 * Atualização rápida de status do anúncio (ATIVO, PAUSADO, VENDIDO, RASCUNHO)
 * @param {string} userId
 * @param {string} userRole
 * @param {string} productId
 * @param {string} rawStatus
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
