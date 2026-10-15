import { Router } from 'express';
import { addReport } from '../../controllers/report/index.js';

const router = Router();

// Enviar denúncia de anúncio (pode ser anônimo ou autenticado)
router.post('/:productId', addReport);

export default router;
