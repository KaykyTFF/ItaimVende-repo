import { Router } from 'express';
import {
  listUserReviews,
  addReview,
} from '../controllers/review.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = Router();

// 1. Listar avaliações de um vendedor (Público)
router.get('/user/:userId', listUserReviews);

// 2. Enviar avaliação para um vendedor (Requer autenticação)
router.post('/user/:userId', authenticateToken, addReview);

export default router;
