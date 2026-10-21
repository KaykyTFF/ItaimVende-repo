import { Router } from 'express';
import {
  listUserReviews,
  addReview,
  replyReview,
} from '../../controllers/review/index.js';
import { authenticateToken } from '../../middlewares/auth.middleware.js';

const router = Router();

// 1. Listar avaliações de um vendedor (Público)
router.get('/user/:userId', listUserReviews);

// 2. Enviar avaliação para um vendedor (Requer autenticação)
router.post('/user/:userId', authenticateToken, addReview);

// 3. Vendedor responde a uma avaliação recebida (Requer autenticação)
router.patch('/:id/reply', authenticateToken, replyReview);

export default router;
