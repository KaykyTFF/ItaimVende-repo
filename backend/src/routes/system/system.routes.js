import { Router } from 'express';
import { getStatus, runDiagnostics } from '../../controllers/system/index.js';

const router = Router();

// Rota de status em tempo real e visão geral do sistema
router.get('/status', getStatus);

// Rota de execução de autodiagnóstico detalhado
router.get('/diagnostics', runDiagnostics);
router.post('/diagnostics', runDiagnostics);

export default router;
