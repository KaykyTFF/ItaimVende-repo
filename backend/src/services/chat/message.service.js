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
 * @param {string|null} after - Timestamp ISO opcional para buscar apenas mensagens recentes
 */
export async function getConversationMessages(userId, userRole, conversationId, after = null) {
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

  const whereClause = { conversationId };
  if (after) {
    const afterDate = new Date(after);
    if (!isNaN(afterDate.getTime())) {
      whereClause.createdAt = { gt: afterDate };
    }
  }

  const messages = await prisma.message.findMany({
    where: whereClause,
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
  let { content, messageType = 'TEXT', offerValue } = messageData;

  // Normalização do tipo de mensagem
  if (messageType === 'OFFER') {
    messageType = 'OFFER_PROPOSAL';
  }

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
    throw new AppError('Esta conversa está bloqueada. Desbloqueie-a para enviar mensagens.', 403);
  }

  const offerValNum = offerValue ? parseFloat(offerValue) : null;
  const offerStatus = messageType === 'OFFER_PROPOSAL' ? 'PENDING' : null;

  const [message] = await prisma.$transaction([
    prisma.message.create({
      data: {
        conversationId,
        senderId,
        content: content.trim(),
        messageType,
        offerValue: offerValNum,
        offerStatus,
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

  // Cria notificação persistente para o destinatário no banco
  const recipientId = conversation.buyerId === senderId ? conversation.sellerId : conversation.buyerId;
  import('../notification/index.js').then(({ createNotification }) => {
    let tituloNotif = `Nova mensagem de ${message.sender?.name || 'Usuário'}`;
    let tipoNotif = 'mensagem';

    if (messageType === 'OFFER_PROPOSAL') {
      tituloNotif = `Nova proposta de R$ ${offerValNum?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} de ${message.sender?.name || 'Usuário'}`;
      tipoNotif = 'oferta';
    }

    createNotification({
      userId: recipientId,
      title: tituloNotif,
      message: content.trim().length > 60 ? `${content.trim().substring(0, 57)}...` : content.trim(),
      type: tipoNotif,
      link: `/pages/mensagens/conversas.html?id=${conversationId}`,
    }).catch(() => {});
  }).catch(() => {});

  return formatarMensagem(message, senderId);
}

/**
 * Aceita uma proposta de preço recebida
 * @param {string} userId
 * @param {string} userRole
 * @param {string} messageId
 */
export async function acceptOfferProposal(userId, userRole, messageId) {
  const message = await prisma.message.findUnique({
    where: { id: messageId },
    include: {
      conversation: true,
      sender: { select: SENDER_SELECT },
    },
  });

  if (!message) {
    throw new AppError('Mensagem de proposta não encontrada.', 404);
  }

  if (message.messageType !== 'OFFER_PROPOSAL') {
    throw new AppError('Esta mensagem não é uma proposta de preço.', 400);
  }

  const conv = message.conversation;
  if (conv.buyerId !== userId && conv.sellerId !== userId && userRole !== 'ADMIN') {
    throw new AppError('Acesso não autorizado a esta conversa.', 403);
  }

  if (message.senderId === userId) {
    throw new AppError('Você não pode aceitar a sua própria proposta.', 400);
  }

  if (message.offerStatus && message.offerStatus !== 'PENDING') {
    throw new AppError(`Esta proposta já foi ${message.offerStatus === 'ACCEPTED' ? 'aceita' : 'recusada'}.`, 400);
  }

  const valorFormatado = message.offerValue
    ? Number(message.offerValue).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    : 'o valor proposto';

  const [updatedMessage] = await prisma.$transaction([
    prisma.message.update({
      where: { id: messageId },
      data: { offerStatus: 'ACCEPTED' },
      include: { sender: { select: SENDER_SELECT } },
    }),
    prisma.message.create({
      data: {
        conversationId: conv.id,
        senderId: userId,
        content: `✅ Proposta de ${valorFormatado} aceita!`,
        messageType: 'SYSTEM',
      },
    }),
    prisma.conversation.update({
      where: { id: conv.id },
      data: { lastMessageAt: new Date() },
    }),
  ]);

  // Notifica o autor da proposta
  import('../notification/index.js').then(({ createNotification }) => {
    createNotification({
      userId: message.senderId,
      title: 'Proposta Aceita! 🎉',
      message: `Sua proposta de ${valorFormatado} foi aceita! Abra a conversa para combinar a entrega.`,
      type: 'oferta',
      link: `/pages/mensagens/conversas.html?id=${conv.id}`,
    }).catch(() => {});
  }).catch(() => {});

  return formatarMensagem(updatedMessage, userId);
}

/**
 * Recusa uma proposta de preço recebida
 * @param {string} userId
 * @param {string} userRole
 * @param {string} messageId
 */
export async function rejectOfferProposal(userId, userRole, messageId) {
  const message = await prisma.message.findUnique({
    where: { id: messageId },
    include: {
      conversation: true,
      sender: { select: SENDER_SELECT },
    },
  });

  if (!message) {
    throw new AppError('Mensagem de proposta não encontrada.', 404);
  }

  if (message.messageType !== 'OFFER_PROPOSAL') {
    throw new AppError('Esta mensagem não é uma proposta de preço.', 400);
  }

  const conv = message.conversation;
  if (conv.buyerId !== userId && conv.sellerId !== userId && userRole !== 'ADMIN') {
    throw new AppError('Acesso não autorizado a esta conversa.', 403);
  }

  if (message.senderId === userId) {
    throw new AppError('Você não pode recusar a sua própria proposta.', 400);
  }

  if (message.offerStatus && message.offerStatus !== 'PENDING') {
    throw new AppError(`Esta proposta já foi ${message.offerStatus === 'ACCEPTED' ? 'aceita' : 'recusada'}.`, 400);
  }

  const valorFormatado = message.offerValue
    ? Number(message.offerValue).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    : 'o valor proposto';

  const [updatedMessage] = await prisma.$transaction([
    prisma.message.update({
      where: { id: messageId },
      data: { offerStatus: 'REJECTED' },
      include: { sender: { select: SENDER_SELECT } },
    }),
    prisma.message.create({
      data: {
        conversationId: conv.id,
        senderId: userId,
        content: `❌ Proposta de ${valorFormatado} recusada.`,
        messageType: 'SYSTEM',
      },
    }),
    prisma.conversation.update({
      where: { id: conv.id },
      data: { lastMessageAt: new Date() },
    }),
  ]);

  // Notifica o autor da proposta
  import('../notification/index.js').then(({ createNotification }) => {
    createNotification({
      userId: message.senderId,
      title: 'Proposta Recusada',
      message: `Sua proposta de ${valorFormatado} foi recusada.`,
      type: 'oferta',
      link: `/pages/mensagens/conversas.html?id=${conv.id}`,
    }).catch(() => {});
  }).catch(() => {});

  return formatarMensagem(updatedMessage, userId);
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

