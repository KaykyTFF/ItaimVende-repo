import { Router } from 'express';
import {
  listConversations,
  getConversation,
  getOrCreateConversation,
  getMessages,
  sendMessage,
} from '../controllers/chat.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = Router();

// Todas as rotas de chat requerem autenticação
router.use(authenticateToken);

router.get('/conversations', listConversations);
router.post('/conversations', getOrCreateConversation);
router.get('/conversations/:id', getConversation);
router.get('/conversations/:id/messages', getMessages);
router.post('/conversations/:id/messages', sendMessage);

export default router;
