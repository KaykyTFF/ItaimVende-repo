import { Router } from 'express';
import {
  addReport,
  getTicket,
  listAllReports,
  updateTicketStatus,
} from '../../controllers/report/index.js';
import { optionalAuth, authenticateToken } from '../../middlewares/auth.middleware.js';

const router = Router();

// Enviar denúncia de anúncio (cria ticket para o usuário e notifica moderação)
router.post('/:productId', optionalAuth, addReport);

// Consultar ticket por protocolo (ex: TK-84A12B) ou ID
router.get('/ticket/:protocolOrId', optionalAuth, getTicket);

// Listar relatórios / tickets de denúncia (moderação / admin)
router.get('/', optionalAuth, listAllReports);

// Atualizar status do ticket de denúncia
router.patch('/:id/status', authenticateToken, updateTicketStatus);

export default router;
