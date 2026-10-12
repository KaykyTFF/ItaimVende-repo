import prisma from '../config/prisma.js';
import { AppError } from '../utils/errors.js';

/**
 * Lista as conversas do usuário autenticado
 */
export async function getUserConversations(userId) {
  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [{ buyerId: userId }, { sellerId: userId }],
      status: { not: 'BLOCKED' },
    },
    orderBy: { lastMessageAt: 'desc' },
    include: {
      product: {
        select: {
          id: true,
          title: true,
          price: true,
          status: true,
          city: true,
          images: { take: 1, orderBy: { orderIndex: 'asc' } },
        },
      },
      buyer: { select: { id: true, name: true, avatar: true, phone: true } },
      seller: { select: { id: true, name: true, avatar: true, phone: true } },
      messages: {
        take: 1,
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  return conversations.map((c) => {
    const isUserBuyer = c.buyerId === userId;
    const outroParticipante = isUserBuyer ? c.seller : c.buyer;
    const ultimaMsg = c.messages[0] || null;

    return {
      id: c.id,
      productId: c.productId,
      product: {
        ...c.product,
        price: Number(c.product.price),
        image: c.product.images[0]?.url || 'assets/images/produtos/anuncio_13.jpg',
      },
      outroParticipante: {
        id: outroParticipante.id,
        nome: outroParticipante.name,
        avatar: outroParticipante.avatar || 'assets/images/icon-user.png',
        telefone: outroParticipante.phone,
      },
      ultimaMensagem: ultimaMsg ? ultimaMsg.content : 'Conversa iniciada',
      dataUltimaMensagem: c.lastMessageAt,
      status: c.status,
    };
  });
}

/**
 * Inicia ou localiza conversa existente para um anúncio
 */
export async function findOrCreateConversation(buyerId, productId) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { seller: true },
  });

  if (!product) {
    throw new AppError('Anúncio não encontrado.', 404);
  }

  if (product.sellerId === buyerId) {
    throw new AppError('Você não pode iniciar conversa no seu próprio anúncio.', 400);
  }

  let conversation = await prisma.conversation.findUnique({
    where: {
      productId_buyerId_sellerId: {
        productId,
        buyerId,
        sellerId: product.sellerId,
      },
    },
    include: {
      product: { include: { images: { take: 1 } } },
      seller: { select: { id: true, name: true, avatar: true, phone: true } },
      buyer: { select: { id: true, name: true, avatar: true, phone: true } },
    },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        productId,
        buyerId,
        sellerId: product.sellerId,
      },
      include: {
        product: { include: { images: { take: 1 } } },
        seller: { select: { id: true, name: true, avatar: true, phone: true } },
        buyer: { select: { id: true, name: true, avatar: true, phone: true } },
      },
    });
  }

  return conversation;
}

/**
 * Obtém mensagens e atualiza status de lido
 */
export async function getConversationMessages(userId, userRole, conversationId) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) {
    throw new AppError('Conversa não encontrada.', 404);
  }

  if (conversation.buyerId !== userId && conversation.sellerId !== userId && userRole !== 'ADMIN') {
    throw new AppError('Acesso não autorizado a esta conversa.', 403);
  }

  // Marca mensagens de outros usuários como lidas
  await prisma.message.updateMany({
    where: {
      conversationId,
      senderId: { not: userId },
      isRead: false,
    },
    data: { isRead: true, readAt: new Date() },
  });

  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
    include: {
      sender: {
        select: { id: true, name: true, avatar: true },
      },
    },
  });

  return messages;
}

/**
 * Envia mensagem com suporte a texto, imagem ou proposta de preço
 */
export async function sendConversationMessage(senderId, userRole, conversationId, messageData) {
  const { content, messageType = 'TEXT', offerValue } = messageData;

  if (!content || !content.trim()) {
    throw new AppError('A mensagem não pode estar vazia.', 400);
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) {
    throw new AppError('Conversa não encontrada.', 404);
  }

  if (conversation.buyerId !== senderId && conversation.sellerId !== senderId && userRole !== 'ADMIN') {
    throw new AppError('Acesso não autorizado.', 403);
  }

  const [message] = await prisma.$transaction([
    prisma.message.create({
      data: {
        conversationId,
        senderId,
        content: content.trim(),
        messageType,
        offerValue: offerValue ? parseFloat(offerValue) : null,
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
      },
    }),
    prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    }),
  ]);

  return message;
}
