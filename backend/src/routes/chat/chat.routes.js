import { Router } from 'express';
import {
  listConversations,
  getConversation,
  getOrCreateConversation,
  getMessages,
  sendMessage,
  getUnreadCount,
  toggleBlock,
  acceptProposal,
  rejectProposal,
} from '../../controllers/chat/index.js';
import { authenticateToken } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import {
  createConversationSchema,
  sendMessageSchema,
  conversationParamsSchema,
  messageParamsSchema,
} from '../../schemas/chat/index.js';

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

// 5. Histórico de mensagens de uma conversa (suporta ?after=ISO_DATE)
router.get('/conversations/:id/messages', validate(conversationParamsSchema, 'params'), getMessages);

// 6. Enviar mensagem em uma conversa (com validação Zod)
router.post(
  '/conversations/:id/messages',
  validate(conversationParamsSchema, 'params'),
  validate(sendMessageSchema),
  sendMessage
);

// 7. Bloquear ou desbloquear conversa
router.patch(
  '/conversations/:id/block',
  validate(conversationParamsSchema, 'params'),
  toggleBlock
);

// 8. Aceitar proposta de preço
router.patch(
  '/messages/:id/accept',
  validate(messageParamsSchema, 'params'),
  acceptProposal
);

// 9. Recusar proposta de preço
router.patch(
  '/messages/:id/reject',
  validate(messageParamsSchema, 'params'),
  rejectProposal
);

export default router;

