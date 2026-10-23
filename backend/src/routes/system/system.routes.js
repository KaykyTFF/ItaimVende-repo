import { Router } from 'express';
import {
  getStatus,
  runDiagnostics,
  getTunnel,
  startTunnelHandler,
  stopTunnelHandler,
  auditStorageHandler,
  cleanStorageHandler,
  seedProductsHandler,
  cleanSeedHandler,
  getRecentDataHandler,
  toggleProductStatusHandler,
  toggleUserStatusHandler,
} from '../../controllers/system/index.js';
import { authenticateToken, requireRole } from '../../middlewares/auth.middleware.js';

const router = Router();

// Blindagem: Todas as rotas operacionais e administrativas do sistema exigem token válido e perfil de ADMIN
router.use(authenticateToken, requireRole('ADMIN'));

// 1. Rota de status em tempo real e visão geral do sistema
router.get('/status', getStatus);

// 2. Rota de execução de autodiagnóstico detalhado
router.get('/diagnostics', runDiagnostics);
router.post('/diagnostics', runDiagnostics);

// 3. Rotas de gerenciamento e inicialização do Túnel Cloudflare
router.get('/tunnel', getTunnel);
router.post('/tunnel/start', startTunnelHandler);
router.post('/tunnel/stop', stopTunnelHandler);

// 4. Rotas de manutenção de storage e fotos órfãs
router.get('/storage/audit', auditStorageHandler);
router.post('/storage/clean', cleanStorageHandler);

// 5. Rotas de geração e limpeza de produtos demo / teste
router.post('/seed/products', seedProductsHandler);
router.post('/seed/clean', cleanSeedHandler);

// 6. Rotas de visão geral e moderação rápida de dados
router.get('/data/overview', getRecentDataHandler);
router.patch('/data/products/:id/toggle', toggleProductStatusHandler);
router.patch('/data/users/:id/toggle', toggleUserStatusHandler);

export default router;
