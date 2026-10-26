import {
  solicitarRecuperacao,
  validarCodigoRecuperacao,
  redefinirSenha,
} from '../../services/auth/auth.password-reset.service.js';

/**
 * POST /api/v1/auth/forgot-password
 * Envia e-mail com código OTP de 6 dígitos e link seguro de redefinição
 */
export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const result = await solicitarRecuperacao(email);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/auth/verify-reset-code
 * Valida o código OTP informado pelo usuário na Etapa 2
 */
export async function verifyResetCode(req, res, next) {
  try {
    const { email, code } = req.body;
    const result = await validarCodigoRecuperacao(email, code);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/auth/reset-password
 * Redefine a senha com o token ou código verificado
 */
export async function resetPassword(req, res, next) {
  try {
    const { email, token, code, newPassword } = req.body;
    const result = await redefinirSenha({ email, token, code, newPassword });
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}
