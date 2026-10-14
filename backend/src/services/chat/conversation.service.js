import prisma from '../../config/prisma.js';
import { AppError } from '../../utils/errors.js';
import { formatarConversa } from './chat.formatter.js';

/**
 * Seletor padrão de dados do produto para conversas
 */
const PRODUCT_SELECT = {
  id: true,
  slug: true,
  title: true,
  description: true,
  price: true,
  status: true,
  condition: true,
  city: true,
  category: { select: { id: true, name: true, slug: true } },
  images: { orderBy: { orderIndex: 'asc' } },
};

/**
 * Seletor padrão de dados de usuário participante
 */
const PARTICIPANT_SELECT = {
  id: true,
  name: true,
  username: true,
  email: true,
  avatar: true,
  phone: true,
};

/**
 * Lista todas as conversas do usuário autenticado (como comprador ou vendedor)
 * @param {string} userId
 */
export async function getUserConversations(userId) {
  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [{ buyerId: userId }, { sellerId: userId }],
      status: { not: 'BLOCKED' },
    },
    orderBy: { lastMessageAt: 'desc' },
    include: {
      product: { select: PRODUCT_SELECT },
      buyer: { select: PARTICIPANT_SELECT },
      seller: { select: PARTICIPANT_SELECT },
      messages: {
        take: 1,
        orderBy: { createdAt: 'desc' },
      },
      _count: {
        select: {
          messages: {
            where: {
              senderId: { not: userId },
              isRead: false,
            },
          },
        },
      },
    },
  });

  return conversations.map((c) => formatarConversa(c, userId));
}

/**
 * Busca uma única conversa por ID garantindo autorização
 * @param {string} userId
 * @param {string} userRole
 * @param {string} conversationId
 */
export async function getConversationById(userId, userRole, conversationId) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      product: { select: PRODUCT_SELECT },
      buyer: { select: PARTICIPANT_SELECT },
      seller: { select: PARTICIPANT_SELECT },
      messages: {
        take: 1,
        orderBy: { createdAt: 'desc' },
      },
      _count: {
        select: {
          messages: {
            where: {
              senderId: { not: userId },
              isRead: false,
            },
          },
        },
      },
    },
  });

  if (!conversation) {
    throw new AppError('Conversa não encontrada.', 404);
  }

  if (conversation.buyerId !== userId && conversation.sellerId !== userId && userRole !== 'ADMIN') {
    throw new AppError('Acesso não autorizado a esta conversa.', 403);
  }

  return formatarConversa(conversation, userId);
}

/**
 * Inicia ou localiza conversa existente entre comprador e vendedor para um anúncio
 * @param {string} buyerId
 * @param {string} productId
 */
export async function findOrCreateConversation(buyerId, productId) {
  if (!productId) {
    throw new AppError('ID do produto não informado.', 400);
  }

  const product = await prisma.product.findFirst({
    where: {
      OR: [{ id: productId }, { slug: productId }],
      deletedAt: null,
    },
    include: {
      seller: true,
      category: true,
      images: { orderBy: { orderIndex: 'asc' } },
    },
  });

  if (!product) {
    throw new AppError('Anúncio não encontrado.', 404);
  }

  if (product.sellerId === buyerId) {
    throw new AppError('Você é o anunciante deste produto. Suas negociações com compradores aparecem aqui.', 400);
  }

  let conversation = await prisma.conversation.findUnique({
    where: {
      productId_buyerId_sellerId: {
        productId: product.id,
        buyerId,
        sellerId: product.sellerId,
      },
    },
    include: {
      product: { select: PRODUCT_SELECT },
      seller: { select: PARTICIPANT_SELECT },
      buyer: { select: PARTICIPANT_SELECT },
      messages: {
        take: 1,
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        productId: product.id,
        buyerId,
        sellerId: product.sellerId,
      },
      include: {
        product: { select: PRODUCT_SELECT },
        seller: { select: PARTICIPANT_SELECT },
        buyer: { select: PARTICIPANT_SELECT },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  return formatarConversa(conversation, buyerId);
}
