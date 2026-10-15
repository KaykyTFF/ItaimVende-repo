import prisma from '../../config/prisma.js';
import { AppError } from '../../utils/errors.js';
import { formatarMensagem } from './chat.formatter.js';

/**
 * Seletor padrão de dados do remetente
 */
const SENDER_SELECT = {
  id: true,
  name: true,
  username: true,
  avatar: true,
};

/**
 * Obtém mensagens de uma conversa e atualiza automaticamente o status de lido
 * @param {string} userId
 * @param {string} userRole
 * @param {string} conversationId
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

  // Marca mensagens enviadas pelo outro participante como lidas
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
      sender: { select: SENDER_SELECT },
    },
  });

  return messages.map((m) => formatarMensagem(m, userId));
}

/**
 * Envia uma nova mensagem com validações de segurança e transação atômica
 * @param {string} senderId
 * @param {string} userRole
 * @param {string} conversationId
 * @param {object} messageData
 */
export async function sendConversationMessage(senderId, userRole, conversationId, messageData) {
  const { content, messageType = 'TEXT', offerValue } = messageData;

  if (!content || !content.trim()) {
    throw new AppError('A mensagem não pode estar vazia.', 400);
  }

  if (content.trim().length > 3000) {
    throw new AppError('Mensagem muito longa (máximo de 3000 caracteres).', 400);
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) {
    throw new AppError('Conversa não encontrada.', 404);
  }

  if (conversation.buyerId !== senderId && conversation.sellerId !== senderId && userRole !== 'ADMIN') {
    throw new AppError('Acesso não autorizado a esta conversa.', 403);
  }

  if (conversation.status === 'BLOCKED') {
    throw new AppError('Esta conversa foi bloqueada.', 403);
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
        sender: { select: SENDER_SELECT },
      },
    }),
    prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    }),
  ]);

  return formatarMensagem(message, senderId);
}

/**
 * Conta o total de mensagens não lidas de um usuário em todas as conversas
 * @param {string} userId
 */
export async function getGlobalUnreadMessagesCount(userId) {
  const count = await prisma.message.count({
    where: {
      conversation: {
        OR: [{ buyerId: userId }, { sellerId: userId }],
        status: { not: 'BLOCKED' },
      },
      senderId: { not: userId },
      isRead: false,
    },
  });

  return count;
}
