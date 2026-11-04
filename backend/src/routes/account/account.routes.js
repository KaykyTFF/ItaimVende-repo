import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  changeUsername,
  checkUsername,
  requestEmailChange,
  confirmEmailChange,
  changePhone,
} from '../../controllers/account/account.controller.js';
import { authenticateToken, optionalAuth } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import {
  changeUsernameSchema,
  requestEmailChangeSchema,
  confirmEmailChangeSchema,
  changePhoneSchema,
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

// Rate limiter para alteração de telefone/WhatsApp
const phoneLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  skip: (req) => Boolean(req.headers['x-test-runner']),
  message: {
    success: false,
    message: 'Muitas tentativas de alteração de telefone. Aguarde alguns minutos antes de prosseguir.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 1. Rota de checagem prévia de disponibilidade do @
router.get('/username/check', optionalAuth, checkUsername);

// 2. Rota de alteração exclusiva do nome de usuário (@)
router.patch('/username', authenticateToken, usernameLimiter, validate(changeUsernameSchema), changeUsername);

// 3. Rota de solicitação de alteração de e-mail (com reautenticação)
router.post('/email/change-request', authenticateToken, emailRequestLimiter, validate(requestEmailChangeSchema), requestEmailChange);

// 4. Rota de confirmação da alteração de e-mail com código de 6 dígitos
router.post('/email/confirm', authenticateToken, emailConfirmLimiter, validate(confirmEmailChangeSchema), confirmEmailChange);

// 5. Rota de alteração exclusiva de WhatsApp / celular
router.patch('/phone', authenticateToken, phoneLimiter, validate(changePhoneSchema), changePhone);

export default router;
