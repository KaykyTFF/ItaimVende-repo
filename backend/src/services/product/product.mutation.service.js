import prisma from '../../config/prisma.js';
import { AppError } from '../../utils/errors.js';
import { gerarSlug, formatarProdutoParaFrontend } from './product.formatter.js';
import { storageAdapter } from '../../adapters/storage/index.js';
import { isUserOnline } from '../../sockets/index.js';
import { ENV } from '../../config/env.js';
import { enviarEmailProdutoVendido } from '../email/email.service.js';

/**
 * Hook assíncrono para remoção de mídias órfãs do Supabase Storage / Local Storage
 * @param {string|string[]} urls - URLs ou caminhos das imagens a serem deletadas
 */
export async function removerImagensDoStorage(urls) {
  if (!urls) return;
  const lista = (Array.isArray(urls) ? urls : [urls]).filter(Boolean);
  if (lista.length === 0) return;

  try {
    // Filtra URLs padrão do sistema / placeholders
    const urlsValidas = lista.filter((url) => {
      const str = String(url).toLowerCase();
      return (
        !str.includes('placeholder') &&
        !str.includes('icon-user') &&
        !str.startsWith('data:') &&
        (str.includes('/storage/v1/object/') || str.includes('/uploads/') || str.includes('vendas/'))
      );
    });

    if (urlsValidas.length === 0) return;

    console.log(`🧹 [Storage Cleanup] Disparando hook para remover ${urlsValidas.length} imagem(ns) órfã(s)...`);

    if (typeof storageAdapter.deleteMany === 'function') {
      await storageAdapter.deleteMany(urlsValidas);
    } else {
      await Promise.allSettled(urlsValidas.map((url) => storageAdapter.delete(url)));
    }

    console.log(`✅ [Storage Cleanup] ${urlsValidas.length} imagem(ns) órfã(s) processada(s) com sucesso.`);
  } catch (err) {
    console.warn(`⚠️ [Storage Cleanup] Falha no hook de exclusão de mídias órfãs: ${err.message}`);
  }
}

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
 * Atualização completa de dados do produto com verificação de permissão e limpeza de fotos órfãs
 * @param {string} userId - ID do usuário autenticado
 * @param {string} userRole - Papel do usuário (SELLER, ADMIN, etc.)
 * @param {string} productId - ID do produto a atualizar
 * @param {object} updateData - Dados a serem atualizados
 */
export async function updateProduct(userId, userRole, productId, updateData) {
  const existing = await prisma.product.findUnique({
    where: { id: productId },
    include: { images: { orderBy: { orderIndex: 'asc' } } },
  });

  if (!existing || existing.deletedAt) {
    throw new AppError('Produto não encontrado.', 404);
  }

  if (existing.sellerId !== userId && userRole !== 'ADMIN') {
    throw new AppError('Sem permissão para alterar este anúncio.', 403);
  }

  // --- REGRAS DE NEGÓCIO ANTI-FRAUDE NA EDIÇÃO ---
  // 1. Bloqueio de alteração em anúncios já vendidos ou arquivados
  if (existing.status === 'VENDIDO') {
    throw new AppError('Anúncios já marcados como vendidos não podem ser editados para resguardar o histórico e evitar fraudes.', 400);
  }
  if (existing.status === 'ARQUIVADO') {
    throw new AppError('Anúncios arquivados ou excluídos não podem ser editados.', 400);
  }

  // 2. Proteção contra "Metamorfose de Anúncio" (Bait-and-Switch)
  // Impede que um vendedor troque a categoria de um produto já ativo para introduzir itens proibidos
  if (updateData.categoryId !== undefined && updateData.categoryId !== existing.categoryId && userRole !== 'ADMIN') {
    throw new AppError('Por segurança e prevenção a fraudes, a categoria do anúncio não pode ser alterada após a publicação.', 400);
  }

  // 3. Prevenção de Links Maliciosos, Phishing e Injeção no Título e Descrição
  const PADROES_PHISHING = new RegExp('(https?:\\/\\/|www\\.|bit\\.ly|tinyurl|t\\.me|cutt\\.ly|is\\.gd|<\\s*script)', 'i');
  if (updateData.title && PADROES_PHISHING.test(updateData.title)) {
    throw new AppError('O título não pode conter links externos, encurtadores ou URLs por motivos de segurança.', 400);
  }
  if (updateData.description && PADROES_PHISHING.test(updateData.description)) {
    throw new AppError('A descrição não pode conter links externos, encurtadores ou URLs por motivos de segurança.', 400);
  }

  // 4. Integridade de Preço
  if (updateData.price !== undefined) {
    const precoNum = parseFloat(updateData.price);
    if (isNaN(precoNum) || precoNum < 0) {
      throw new AppError('O preço do produto não pode ser negativo.', 400);
    }
  }

  const { images, price, originalPrice, ...otherData } = updateData;
  const dataToUpdate = { ...otherData };

  if (price !== undefined) dataToUpdate.price = parseFloat(price);
  if (originalPrice !== undefined) dataToUpdate.originalPrice = originalPrice ? parseFloat(originalPrice) : null;

  let fotosOrfasParaRemover = [];

  if (Array.isArray(images)) {
    // Identifica quais fotos antigas foram removidas/substituídas
    const novasImagensSet = new Set(
      images.map((img) => (typeof img === 'string' ? img.trim() : (img?.url || '').trim()))
    );

    fotosOrfasParaRemover = existing.images
      .map((img) => img.url)
      .filter((url) => !novasImagensSet.has(url.trim()));

    await prisma.productImage.deleteMany({ where: { productId } });

    if (images.length > 0) {
      dataToUpdate.images = {
        create: images.map((img, idx) => ({
          url: typeof img === 'string' ? img : img.url,
          orderIndex: idx,
          isCover: idx === 0,
        })),
      };
    }
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

  // Hook: Exclui do Supabase Storage as fotos substituídas que ficaram órfãs
  if (fotosOrfasParaRemover.length > 0) {
    removerImagensDoStorage(fotosOrfasParaRemover).catch((err) => {
      console.warn(`[updateProduct] Erro assíncrono ao remover mídias órfãs: ${err.message}`);
    });
  }

  return formatarProdutoParaFrontend(updated);
}

/**
 * Exclusão lógica (Soft Delete) do anúncio e remoção das imagens do bucket do Storage
 * @param {string} userId
 * @param {string} userRole
 * @param {string} productId
 */
export async function deleteProduct(userId, userRole, productId) {
  const existing = await prisma.product.findUnique({
    where: { id: productId },
    include: { images: true },
  });

  if (!existing || existing.deletedAt) {
    throw new AppError('Produto não encontrado.', 404);
  }

  if (existing.sellerId !== userId && userRole !== 'ADMIN') {
    throw new AppError('Sem permissão para remover este anúncio.', 403);
  }

  const fotosParaRemover = existing.images.map((img) => img.url);

  // Soft Delete no banco de dados (arquivamento)
  await prisma.product.update({
    where: { id: productId },
    data: {
      deletedAt: new Date(),
      status: 'ARQUIVADO',
    },
  });

  // Remove os vínculos na tabela ProductImage
  if (fotosParaRemover.length > 0) {
    await prisma.productImage.deleteMany({ where: { productId } });

    // Hook: Invoca storageAdapter.delete(url) para remover as fotos do Supabase Storage
    await removerImagensDoStorage(fotosParaRemover);
  }

  return { id: productId };
}

/**
 * Exclusão definitiva (Hard Delete) do anúncio com limpeza completa do Storage
 * @param {string} userId
 * @param {string} userRole
 * @param {string} productId
 */
export async function hardDeleteProduct(userId, userRole, productId) {
  const existing = await prisma.product.findUnique({
    where: { id: productId },
    include: { images: true },
  });

  if (!existing) {
    throw new AppError('Produto não encontrado.', 404);
  }

  if (existing.sellerId !== userId && userRole !== 'ADMIN') {
    throw new AppError('Sem permissão para remover permanentemente este anúncio.', 403);
  }

  const fotosParaRemover = existing.images.map((img) => img.url);

  await prisma.product.delete({
    where: { id: productId },
  });

  if (fotosParaRemover.length > 0) {
    await removerImagensDoStorage(fotosParaRemover);
  }

  return { id: productId, hardDeleted: true };
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

    // Se o vendedor estiver offline, envia e-mail transacional informando que o produto foi vendido
    if (!isUserOnline(existing.sellerId)) {
      prisma.user.findUnique({
        where: { id: existing.sellerId },
        select: { email: true, name: true },
      }).then((seller) => {
        if (seller && seller.email) {
          enviarEmailProdutoVendido({
            to: seller.email,
            name: seller.name,
            productTitle: existing.title,
            orderCode: '',
            totalAmount: Number(existing.price),
            buyerName: 'Cliente no Marketplace',
            orderUrl: `${ENV.APP_URL}/pages/vender/meus-anuncios.html`,
          }).catch((err) => console.warn('[Email Notification] Erro ao avisar venda ao vendedor:', err.message));
        }
      }).catch(() => {});
    }
  }

  return formatarProdutoParaFrontend(updated);
}
