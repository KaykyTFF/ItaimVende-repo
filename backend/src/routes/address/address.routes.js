import { Router } from 'express';
import {
  getAddresses,
  getAddress,
  createAddress,
  updateAddress,
  deleteAddress,
  setPrimaryAddress,
} from '../../controllers/address/index.js';
import { authenticateToken } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import {
  createAddressSchema,
  updateAddressSchema,
} from '../../schemas/address/index.js';

const router = Router();

// Todas as rotas de endereços exigem usuário autenticado
router.use(authenticateToken);

router.get('/', getAddresses);
router.post('/', validate(createAddressSchema), createAddress);
router.get('/:id', getAddress);
router.put('/:id', validate(updateAddressSchema), updateAddress);
router.delete('/:id', deleteAddress);
router.patch('/:id/primary', setPrimaryAddress);

export default router;
