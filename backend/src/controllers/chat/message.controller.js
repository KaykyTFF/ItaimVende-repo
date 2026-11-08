import {
  getConversationMessages,
  sendConversationMessage,
  acceptOfferProposal,
  rejectOfferProposal,
} from '../../services/chat/index.js';

/**
 * Obtém o histórico de mensagens de uma conversa e marca como lidas
 * GET /api/chat/conversations/:id/messages
 */
export async function getMessages(req, res, next) {
  try {
    const after = req.query?.after || null;
    const data = await getConversationMessages(req.user.id, req.user.role, req.params.id, after);
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
 * Aceita uma proposta de preço
 * PATCH /api/chat/messages/:id/accept
 */
export async function acceptProposal(req, res, next) {
  try {
    const data = await acceptOfferProposal(req.user.id, req.user.role, req.params.id);
    res.status(200).json({ success: true, message: 'Proposta aceita com sucesso.', data });
  } catch (error) {
    next(error);
  }
}

/**
 * Recusa uma proposta de preço
 * PATCH /api/chat/messages/:id/reject
 */
export async function rejectProposal(req, res, next) {
  try {
    const data = await rejectOfferProposal(req.user.id, req.user.role, req.params.id);
    res.status(200).json({ success: true, message: 'Proposta recusada.', data });
  } catch (error) {
    next(error);
  }
}

/**
 * Atualiza o status de uma proposta de preço (RESTful canônica)
 * PATCH /api/chat/messages/:id/status
 */
export async function updateProposalStatus(req, res, next) {
  try {
    const status = (req.body?.status || '').toUpperCase();
    if (status === 'ACCEPTED') {
      const data = await acceptOfferProposal(req.user.id, req.user.role, req.params.id);
      return res.status(200).json({ success: true, message: 'Proposta aceita com sucesso.', data });
    } else if (status === 'REJECTED') {
      const data = await rejectOfferProposal(req.user.id, req.user.role, req.params.id);
      return res.status(200).json({ success: true, message: 'Proposta recusada.', data });
    } else {
      return res.status(400).json({
        success: false,
        code: 'VALIDATION_ERROR',
        message: 'Status inválido. Use "ACCEPTED" ou "REJECTED".',
      });
    }
  } catch (error) {
    next(error);
  }
}

