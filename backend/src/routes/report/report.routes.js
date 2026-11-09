import { Router } from 'express';
import {
  addReport,
  getTicket,
  listAllReports,
  getReportDetails,
  updateTicketStatus,
  actionRemoveProduct,
  actionSuspendAccount,
  actionDismissReport,
} from '../../controllers/report/index.js';
import { optionalAuth, authenticateToken, requireRole } from '../../middlewares/auth.middleware.js';

const router = Router();

// =============================================================================
// ROTAS PÚBLICAS / USUÁRIOS
// =============================================================================

// Enviar denúncia de anúncio (cria ticket para o usuário e notifica moderação)
router.post('/:productId', optionalAuth, addReport);

// Consultar ticket por protocolo (ex: TK-84A12B) ou ID
router.get('/ticket/:protocolOrId', optionalAuth, getTicket);

// =============================================================================
// ROTAS ADMINISTRATIVAS DE MODERAÇÃO (ADMIN & MODERATOR)
// =============================================================================

// Listar relatórios / tickets de denúncia com filtros de status e busca
router.get('/', authenticateToken, requireRole('ADMIN', 'MODERATOR'), listAllReports);

// Consultar detalhes completos de uma denúncia
router.get('/:id', authenticateToken, requireRole('ADMIN', 'MODERATOR'), getReportDetails);

// Atualizar status do ticket de denúncia
router.patch('/:id/status', authenticateToken, requireRole('ADMIN', 'MODERATOR'), updateTicketStatus);

// Resolução de Denúncia (RESTful canônica): Remover produto fraudulento associado
router.delete('/:id/product', authenticateToken, requireRole('ADMIN', 'MODERATOR'), actionRemoveProduct);

// Ação de Moderação 1: Aprovar remoção de anúncio fraudulento e limpar imagens do bucket (retrocompatibilidade)
router.post('/:id/remove-product', authenticateToken, requireRole('ADMIN', 'MODERATOR'), actionRemoveProduct);

// Ação de Moderação 2: Suspender ou banir a conta do usuário denunciado e arquivar seus anúncios
router.post('/:id/suspend-account', authenticateToken, requireRole('ADMIN', 'MODERATOR'), actionSuspendAccount);

// Ação de Moderação 3: Descartar denúncia improcedente
router.post('/:id/dismiss', authenticateToken, requireRole('ADMIN', 'MODERATOR'), actionDismissReport);
router.delete('/:id', authenticateToken, requireRole('ADMIN', 'MODERATOR'), actionDismissReport);

export default router;

