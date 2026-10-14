import {
  getUserConversations,
  getConversationById,
  findOrCreateConversation,
  getConversationMessages,
  sendConversationMessage,
  getGlobalUnreadMessagesCount,
} from '../services/chat/index.js';

/**
 * Lista todas as conversas do usuário autenticado
 * GET /api/chat/conversations
 */
export async function listConversations(req, res, next) {
  try {
    const data = await getUserConversations(req.user.id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

/**
 * Obtém detalhes de uma única conversa por ID
 * GET /api/chat/conversations/:id
 */
export async function getConversation(req, res, next) {
  try {
    const data = await getConversationById(req.user.id, req.user.role, req.params.id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

/**
 * Inicia ou retorna conversa existente para um anúncio
 * POST /api/chat/conversations
 */
export async function getOrCreateConversation(req, res, next) {
  try {
    const data = await findOrCreateConversation(req.user.id, req.body.productId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

/**
 * Obtém o histórico de mensagens de uma conversa e marca como lidas
 * GET /api/chat/conversations/:id/messages
 */
export async function getMessages(req, res, next) {
  try {
    const data = await getConversationMessages(req.user.id, req.user.role, req.params.id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

/**
 * Envia uma nova mensagem na conversa
 * POST /api/chat/conversations/:id/messages
 */
export async function sendMessage(req, res, next) {
  try {
    const data = await sendConversationMessage(
      req.user.id,
      req.user.role,
      req.params.id,
      req.body
    );
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

/**
 * Obtém a contagem total de mensagens não lidas do usuário
 * GET /api/chat/conversations/unread/total
 */
export async function getUnreadCount(req, res, next) {
  try {
    const count = await getGlobalUnreadMessagesCount(req.user.id);
    res.status(200).json({ success: true, data: { unreadCount: count } });
  } catch (error) {
    next(error);
  }
}
