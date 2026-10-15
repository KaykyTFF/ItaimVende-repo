import {
  getConversationMessages,
  sendConversationMessage,
} from '../../services/chat/index.js';

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
