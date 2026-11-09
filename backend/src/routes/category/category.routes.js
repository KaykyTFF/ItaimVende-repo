import { Router } from 'express';
import { listCategories } from '../../controllers/category/index.js';

const router = Router();

router.get('/', listCategories);

export default router;
