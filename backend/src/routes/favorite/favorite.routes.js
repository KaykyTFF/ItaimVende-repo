import { Router } from 'express';
import {
  listFavorites,
  toggleFavoriteProduct,
  checkProductFavoriteStatus,
  addFavoriteProduct,
  removeFavoriteProduct,
} from '../../controllers/favorite/index.js';
import { authenticateToken } from '../../middlewares/auth.middleware.js';

const router = Router();

// Todas as rotas de favoritos exigem autenticação
router.use(authenticateToken);

// 1. Coleção geral de favoritos (RESTful)
router.get('/', listFavorites);
router.post('/', addFavoriteProduct);

// 2. Operações canônicas RESTful por recurso (/favorites/:productId)
router.get('/:productId', checkProductFavoriteStatus);
router.put('/:productId', addFavoriteProduct);
router.delete('/:productId', removeFavoriteProduct);

// 3. Rotas de compatibilidade retroativa
router.post('/:productId/toggle', toggleFavoriteProduct);
router.get('/:productId/status', checkProductFavoriteStatus);

export default router;
