import { Router } from 'express';
import {
  listProducts,
  listMyProducts,
  listSellerProducts,
  getProductById,
  createProduct,
  updateProduct,
  changeProductStatus,
  deleteProduct,
  trackContact,
} from '../controllers/product.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createProductSchema,
  updateProductSchema,
} from '../schemas/product.schema.js';

const router = Router();

// 1. Rotas estáticas / específicas primeiro (evita colisão com /:id)
router.get('/', listProducts);
router.get('/me', authenticateToken, listMyProducts);
router.get('/seller/:sellerId', listSellerProducts);

// 2. Rotas parametrizadas por ID / Slug
router.get('/:id', getProductById);
router.post('/', authenticateToken, validate(createProductSchema), createProduct);
router.put('/:id', authenticateToken, validate(updateProductSchema), updateProduct);
router.patch('/:id/status', authenticateToken, changeProductStatus);
router.delete('/:id', authenticateToken, deleteProduct);
router.post('/:id/contact', trackContact);

export default router;
