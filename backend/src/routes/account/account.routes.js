import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  changeUsername,
  checkUsername,
  requestEmailChange,
  confirmEmailChange,
  changePhone,
  requestPhoneChange,
  confirmPhoneChange,
  deletePhone,
  revertPhoneChange,
  getPreferences,
  updatePreferences,
} from '../../controllers/account/account.controller.js';
import { authenticateToken, optionalAuth } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import {
  changeUsernameSchema,
  requestEmailChangeSchema,
  confirmEmailChangeSchema,
  changePhoneSchema,
  requestPhoneChangeSchema,
  confirmPhoneChangeSchema,
  deletePhoneSchema,
  revertPhoneSchema,
} from '../../schemas/account/account.schema.js';

const router = Router();

// Rate limiter para alteração de @
const usernameLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  skip: (req) => Boolean(req.headers['x-test-runner']),
  message: {
    success: false,
    message: 'Muitas tentativas de alteração de nome de usuário. Tente novamente mais tarde.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter para envio de códigos de e-mail
const emailRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  skip: (req) => Boolean(req.headers['x-test-runner']),
  message: {
    success: false,
    message: 'Limite de solicitações de código atingido. Aguarde 15 minutos antes de tentar novamente.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter para confirmação do código de e-mail
const emailConfirmLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  skip: (req) => Boolean(req.headers['x-test-runner']),
  message: {
    success: false,
    message: 'Muitas tentativas de validação. Aguarde alguns minutos antes de prosseguir.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter para solicitação de código de telefone
const phoneRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  skip: (req) => Boolean(req.headers['x-test-runner']),
  message: {
    success: false,
    message: 'Limite de solicitações de código de telefone atingido. Tente mais tarde.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter para confirmação do código de telefone
const phoneConfirmLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25,
  skip: (req) => Boolean(req.headers['x-test-runner']),
  message: {
    success: false,
    message: 'Muitas tentativas de confirmação de código. Aguarde alguns minutos.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 1. Rota de checagem prévia de disponibilidade do @
router.get('/username/check', optionalAuth, checkUsername);

// 2. Rota de alteração exclusiva do nome de usuário (@)
router.patch('/username', authenticateToken, usernameLimiter, validate(changeUsernameSchema), changeUsername);

// 3. Rotas de alteração de e-mail
router.post('/email/change-request', authenticateToken, emailRequestLimiter, validate(requestEmailChangeSchema), requestEmailChange);
router.post('/email/confirm', authenticateToken, emailConfirmLimiter, validate(confirmEmailChangeSchema), confirmEmailChange);

// 4. Rotas do Novo Fluxo Seguro de WhatsApp / Celular
router.post('/phone/change-request', authenticateToken, phoneRequestLimiter, validate(requestPhoneChangeSchema), requestPhoneChange);
router.post('/phone/confirm', authenticateToken, phoneConfirmLimiter, validate(confirmPhoneChangeSchema), confirmPhoneChange);
router.delete('/phone', authenticateToken, validate(deletePhoneSchema), deletePhone);
router.post('/phone/revert', optionalAuth, validate(revertPhoneSchema), revertPhoneChange);

// 5. Rota legada de atualização de telefone
router.patch('/phone', authenticateToken, validate(changePhoneSchema), changePhone);

// 6. Rotas de Preferências do Usuário (Notificações e Privacidade)
router.get('/preferences', authenticateToken, getPreferences);
router.patch('/preferences', authenticateToken, updatePreferences);

export default router;
