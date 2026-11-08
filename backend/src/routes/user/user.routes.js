import { Router } from 'express';
import { getPublicProfile } from '../../controllers/auth/index.js';
import { listUserReviews, addReview } from '../../controllers/review/index.js';
import { authenticateToken } from '../../middlewares/auth.middleware.js';

const router = Router();

// 1. Perfil público de usuário/vendedor
router.get('/:id', getPublicProfile);

// 2. Sub-recurso de avaliações do usuário (/users/:userId/reviews)
router.get('/:userId/reviews', listUserReviews);
router.post('/:userId/reviews', authenticateToken, addReview);

export default router;

