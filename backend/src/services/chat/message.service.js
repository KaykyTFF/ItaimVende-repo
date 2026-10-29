import prisma from '../../config/prisma.js';
import { AppError } from '../../utils/errors.js';
import { formatarMensagem, isImageContent, formatarPreviewMensagem } from './chat.formatter.js';
import { emitToConversation, emitToUser, notifyBadgeUpdate, isUserOnline } from '../../sockets/index.js';
import { ENV } from '../../config/env.js';
import { enviarEmailNovaMensagem, enviarEmailPropostaAceita } from '../email/email.service.js';

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
    select: { id: true, buyerId: true, sellerId: true, status: true },
  });

  if (!conversation) {
    throw new AppError('Conversa não encontrada.', 404);
  }

  if (conversation.buyerId !== userId && conversation.sellerId !== userId && userRole !== 'ADMIN') {
    throw new AppError('Acesso não autorizado a esta conversa.', 403);
  }

  // Marca mensagens enviadas pelo outro participante como lidas de forma assíncrona (não bloqueante)
  prisma.message.updateMany({
    where: {
      conversationId,
      senderId: { not: userId },
      isRead: false,
    },
    data: { isRead: true, readAt: new Date() },
  })
    .then((res) => {
      if (res.count > 0) notifyBadgeUpdate(userId);
    })
    .catch((err) => console.error('Erro ao marcar mensagens como lidas:', err));

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

  // Detecção automática de imagem se o conteúdo for um caminho/URL de foto
  if (messageType === 'TEXT' && isImageContent(content)) {
    messageType = 'IMAGE';
  }

  if (!content || !content.trim()) {
    throw new AppError('A mensagem não pode estar vazia.', 400);
  }

  if (content.trim().length > 3000) {
    throw new AppError('Mensagem muito longa (máximo de 3000 caracteres).', 400);
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      product: { select: { id: true, title: true } },
    },
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
    let previewNotif = content.trim();

    if (messageType === 'IMAGE') {
      tituloNotif = `${message.sender?.name || 'Usuário'} enviou uma foto`;
      previewNotif = '📷 Foto';
    } else if (messageType === 'OFFER_PROPOSAL') {
      tituloNotif = `Nova proposta de R$ ${offerValNum?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} de ${message.sender?.name || 'Usuário'}`;
      previewNotif = `🤝 Proposta de R$ ${offerValNum?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
      tipoNotif = 'oferta';
    }

    createNotification({
      userId: recipientId,
      title: tituloNotif,
      message: previewNotif.length > 60 ? `${previewNotif.substring(0, 57)}...` : previewNotif,
      type: tipoNotif,
      link: `/pages/mensagens/conversas.html?id=${conversationId}`,
    }).catch(() => {});
  }).catch(() => {});

  // Se o destinatário estiver offline no WebSocket, dispara e-mail transacional
  if (!isUserOnline(recipientId)) {
    prisma.user.findUnique({
      where: { id: recipientId },
      select: { email: true, name: true },
    }).then((recipient) => {
      if (recipient && recipient.email) {
        const emailPreview = messageType === 'IMAGE' ? '📷 Enviou uma foto' : (content.trim().length > 120 ? `${content.trim().substring(0, 117)}...` : content.trim());
        enviarEmailNovaMensagem({
          to: recipient.email,
          name: recipient.name,
          senderName: message.sender?.name || 'Um interessado',
          productTitle: conversation.product?.title || 'seu anúncio',
          messagePreview: emailPreview,
          conversationUrl: `${ENV.APP_URL}/pages/mensagens/conversas.html?id=${conversationId}`,
        }).catch((err) => console.warn('[Email Notification] Erro ao enviar aviso de nova mensagem:', err.message));
      }
    }).catch(() => {});
  }

  const formatted = formatarMensagem(message, senderId);

  // Emissão em tempo real para a sala da conversa (WebSocket)
  emitToConversation(conversationId, 'new_message', formatted);

  // Notifica ambos os participantes para atualizar o preview na lista de conversas
  const previewAmigavel = formatarPreviewMensagem(message);
  const convPreview = {
    conversationId,
    ultimaMensagem: previewAmigavel,
    tipoUltimaMensagem: messageType,
    dataUltimaMensagem: message.createdAt || new Date().toISOString(),
    lastMessageAt: message.createdAt || new Date().toISOString(),
  };
  emitToUser(recipientId, 'conversation_updated', convPreview);
  emitToUser(senderId, 'conversation_updated', convPreview);

  // Atualiza badge numérico do destinatário
  notifyBadgeUpdate(recipientId);

  // Se for proposta de valor ao vivo, emite evento específico para atualização em tempo real
  if (messageType === 'OFFER_PROPOSAL') {
    emitToConversation(conversationId, 'proposal_received', {
      messageId: message.id,
      offerValue: offerValNum,
      senderId,
      senderName: message.sender?.name,
      createdAt: message.createdAt,
    });
  }

  return formatted;
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

  const [updatedMessage, systemMessage] = await prisma.$transaction([
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
      include: { sender: { select: SENDER_SELECT } },
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

  // Se o autor da proposta estiver offline, dispara e-mail transacional
  if (!isUserOnline(message.senderId)) {
    Promise.all([
      prisma.user.findUnique({ where: { id: message.senderId }, select: { email: true, name: true } }),
      prisma.user.findUnique({ where: { id: userId }, select: { name: true } }),
      prisma.product.findUnique({ where: { id: conv.productId }, select: { title: true } }),
    ]).then(([buyer, seller, prod]) => {
      if (buyer && buyer.email) {
        enviarEmailPropostaAceita({
          to: buyer.email,
          name: buyer.name,
          productTitle: prod?.title || 'o produto',
          offerValue: valorFormatado,
          sellerName: seller?.name || 'O vendedor',
          conversationUrl: `${ENV.APP_URL}/pages/mensagens/conversas.html?id=${conv.id}`,
        }).catch((err) => console.warn('[Email Notification] Erro ao enviar aviso de proposta aceita:', err.message));
      }
    }).catch(() => {});
  }

  const formattedUpdated = formatarMensagem(updatedMessage, userId);
  const formattedSystem = formatarMensagem(systemMessage, userId);

  // Emite status atualizado da proposta ao vivo e mensagem de sistema para a conversa
  emitToConversation(conv.id, 'proposal_status_changed', {
    messageId,
    offerStatus: 'ACCEPTED',
    offerValue: message.offerValue,
    updatedMessage: formattedUpdated,
  });
  emitToConversation(conv.id, 'new_message', formattedSystem);

  notifyBadgeUpdate(message.senderId);
  notifyBadgeUpdate(userId);

  return formattedUpdated;
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

  const [updatedMessage, systemMessage] = await prisma.$transaction([
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
      include: { sender: { select: SENDER_SELECT } },
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

  const formattedUpdated = formatarMensagem(updatedMessage, userId);
  const formattedSystem = formatarMensagem(systemMessage, userId);

  // Emite status atualizado da proposta ao vivo e mensagem de sistema para a conversa
  emitToConversation(conv.id, 'proposal_status_changed', {
    messageId,
    offerStatus: 'REJECTED',
    offerValue: message.offerValue,
    updatedMessage: formattedUpdated,
  });
  emitToConversation(conv.id, 'new_message', formattedSystem);

  notifyBadgeUpdate(message.senderId);
  notifyBadgeUpdate(userId);

  return formattedUpdated;
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

