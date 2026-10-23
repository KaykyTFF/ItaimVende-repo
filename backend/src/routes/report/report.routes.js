import { Router } from 'express';
import {
  addReport,
  getTicket,
  listAllReports,
  updateTicketStatus,
} from '../../controllers/report/index.js';
import { optionalAuth, authenticateToken, requireRole } from '../../middlewares/auth.middleware.js';

const router = Router();

// Enviar denúncia de anúncio (cria ticket para o usuário e notifica moderação)
router.post('/:productId', optionalAuth, addReport);

// Consultar ticket por protocolo (ex: TK-84A12B) ou ID
router.get('/ticket/:protocolOrId', optionalAuth, getTicket);

// Listar relatórios / tickets de denúncia (restrito exclusivamente a ADMIN e MODERATOR)
router.get('/', authenticateToken, requireRole('ADMIN', 'MODERATOR'), listAllReports);

// Atualizar status do ticket de denúncia (restrito exclusivamente a ADMIN e MODERATOR)
router.patch('/:id/status', authenticateToken, requireRole('ADMIN', 'MODERATOR'), updateTicketStatus);

export default router;
