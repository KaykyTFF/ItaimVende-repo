import { Router } from 'express';
import {
  getNotifications,
  getUnreadCount,
  markRead,
  markAllRead,
  deleteSingle,
  clearAll,
} from '../../controllers/notification/index.js';
import { authenticateToken } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { listNotificationsQuerySchema } from '../../schemas/notification/index.js';

const router = Router();

// Todas as rotas de notificações exigem usuário autenticado
router.use(authenticateToken);

router.get('/', validate(listNotificationsQuerySchema, 'query'), getNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/read-all', markAllRead);
router.patch('/:id/read', markRead);
router.delete('/:id', deleteSingle);
router.delete('/', clearAll);

export default router;
