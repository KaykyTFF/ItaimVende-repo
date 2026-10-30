import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { ENV } from '../../config/env.js';
import {
  register,
  login,
  googleAuth,
  getProfile,
  updateProfile,
  getPublicProfile,
  changePassword,
  deleteAccount,
  forgotPassword,
  verifyResetCode,
  resetPassword,
} from '../../controllers/auth/index.js';
import { authenticateToken } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import {
  registerSchema,
  loginSchema,
  googleAuthSchema,
  updateProfileSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  verifyResetCodeSchema,
  resetPasswordSchema,
} from '../../schemas/auth/index.js';

const router = Router();

// Proteção contra brute-force em autenticação: máximo 20 tentativas a cada 15 minutos por IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: 'Muitas tentativas de acesso. Por favor, tente novamente em 15 minutos.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.get('/config', (req, res) => {
  res.json({
    success: true,
    googleClientId: ENV.GOOGLE_CLIENT_ID || '573964082793-kor90ei9qbgnuh13i97crosid73uikh5.apps.googleusercontent.com',
  });
});

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/google', authLimiter, validate(googleAuthSchema), googleAuth);

// Recuperação e Redefinição de Senha (Pilar 1)
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post('/verify-reset-code', authLimiter, validate(verifyResetCodeSchema), verifyResetCode);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), resetPassword);

router.get('/me', authenticateToken, getProfile);
router.get('/profile', authenticateToken, getProfile);
router.get('/user/:id', getPublicProfile);
router.put('/me', authenticateToken, validate(updateProfileSchema), updateProfile);
router.put('/profile', authenticateToken, validate(updateProfileSchema), updateProfile);
router.put('/password', authenticateToken, validate(changePasswordSchema), changePassword);
router.put('/change-password', authenticateToken, validate(changePasswordSchema), changePassword);
router.delete('/me', authenticateToken, deleteAccount);
router.delete('/profile', authenticateToken, deleteAccount);

export default router;
