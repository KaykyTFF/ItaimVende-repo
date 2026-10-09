import { Router } from 'express';
import {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/product.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createProductSchema,
  updateProductSchema,
} from '../schemas/product.schema.js';

const router = Router();

router.get('/', listProducts);
router.get('/:id', getProductById);
router.post('/', authenticateToken, validate(createProductSchema), createProduct);
router.put('/:id', authenticateToken, validate(updateProductSchema), updateProduct);
router.delete('/:id', authenticateToken, deleteProduct);

export default router;
