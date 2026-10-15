import { Router } from 'express';
import {
  listConversations,
  getConversation,
  getOrCreateConversation,
  getMessages,
  sendMessage,
  getUnreadCount,
} from '../../controllers/chat.controller.js';
import { authenticateToken } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import {
  createConversationSchema,
  sendMessageSchema,
  conversationParamsSchema,
} from '../../schemas/chat.schema.js';

const router = Router();

// Todas as rotas de chat requerem autenticação por token JWT
router.use(authenticateToken);

// 1. Listagem geral e busca de conversas
router.get('/conversations', listConversations);

// 2. Iniciar ou obter conversa existente para um anúncio (com validação Zod)
router.post('/conversations', validate(createConversationSchema), getOrCreateConversation);

// 3. Contagem global de mensagens não lidas (declarada antes de :id para evitar conflito de rota)
router.get('/conversations/unread/total', getUnreadCount);

// 4. Detalhes de uma conversa por ID
router.get('/conversations/:id', validate(conversationParamsSchema, 'params'), getConversation);

// 5. Histórico de mensagens de uma conversa
router.get('/conversations/:id/messages', validate(conversationParamsSchema, 'params'), getMessages);

// 6. Enviar mensagem em uma conversa (com validação Zod)
router.post(
  '/conversations/:id/messages',
  validate(conversationParamsSchema, 'params'),
  validate(sendMessageSchema),
  sendMessage
);

export default router;
