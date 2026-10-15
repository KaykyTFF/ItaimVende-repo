import { Router } from 'express';
import {
  getStatus,
  runDiagnostics,
  getTunnel,
  startTunnelHandler,
  stopTunnelHandler,
} from '../../controllers/system/index.js';

const router = Router();

// Rota de status em tempo real e visão geral do sistema
router.get('/status', getStatus);

// Rota de execução de autodiagnóstico detalhado
router.get('/diagnostics', runDiagnostics);
router.post('/diagnostics', runDiagnostics);

// Rotas de gerenciamento e inicialização do Túnel Cloudflare
router.get('/tunnel', getTunnel);
router.post('/tunnel/start', startTunnelHandler);
router.post('/tunnel/stop', stopTunnelHandler);

export default router;
