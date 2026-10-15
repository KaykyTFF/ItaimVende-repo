import { Router } from 'express';
import {
  listFavorites,
  toggleFavoriteProduct,
  checkProductFavoriteStatus,
} from '../../controllers/favorite/index.js';
import { authenticateToken } from '../../middlewares/auth.middleware.js';

const router = Router();

// Todas as rotas de favoritos exigem autenticação
router.use(authenticateToken);

router.get('/', listFavorites);
router.post('/:productId/toggle', toggleFavoriteProduct);
router.get('/:productId/status', checkProductFavoriteStatus);

export default router;
