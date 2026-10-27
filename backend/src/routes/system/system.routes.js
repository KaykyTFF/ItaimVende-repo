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

/**
 * Blindagem: Rotas do sistema exigem credenciais de ADMIN para qualquer visitante na internet
 * (como acessos remotos via túnel Cloudflare). Requisições diretas de loopback local (localhost)
 * no ambiente do desenvolvedor são permitidas para gerenciamento e inicialização do túnel.
 */
async function requireSystemAccess(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    return authenticateToken(req, res, () => {
      return requireRole('ADMIN')(req, res, next);
    });
  }

  // Permite bypass de loopback APENAS em ambiente de desenvolvimento local (NODE_ENV !== 'production')
  const isDev = (process.env.NODE_ENV || 'development') !== 'production';
  const forwarded = req.headers['x-forwarded-for'] || req.headers['cf-connecting-ip'];
  const remoteIp = req.socket?.remoteAddress || req.ip || '';
  const isLocalhost = !forwarded && (remoteIp === '127.0.0.1' || remoteIp === '::1' || remoteIp === '::ffff:127.0.0.1');

  if (isDev && isLocalhost) {
    req.user = { id: 'local_dev_admin', role: 'ADMIN', name: 'Administrador Local' };
    return next();
  }

  return res.status(401).json({
    success: false,
    message: 'Acesso não autorizado. Esta rota do sistema requer autenticação de Administrador.',
  });
}

router.use(requireSystemAccess);

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
