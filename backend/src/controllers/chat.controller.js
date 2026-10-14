import {
  getUserConversations,
  getConversationById,
  findOrCreateConversation,
  getConversationMessages,
  sendConversationMessage,
} from '../services/chat.service.js';

export async function listConversations(req, res, next) {
  try {
    const data = await getUserConversations(req.user.id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function getConversation(req, res, next) {
  try {
    const data = await getConversationById(req.user.id, req.user.role, req.params.id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function getOrCreateConversation(req, res, next) {
  try {
    const data = await findOrCreateConversation(req.user.id, req.body.productId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function getMessages(req, res, next) {
  try {
    const data = await getConversationMessages(req.user.id, req.user.role, req.params.id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function sendMessage(req, res, next) {
  try {
    const data = await sendConversationMessage(req.user.id, req.user.role, req.params.id, req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}
