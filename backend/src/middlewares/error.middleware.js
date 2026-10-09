import { ENV } from '../config/env.js';

/**
 * Middleware central de tratamento de erros
 */
export function errorHandler(err, req, res, next) {
  console.error('[Erro na aplicação]:', err);

  const statusCode = err.statusCode || 500;
  const response = {
    success: false,
    message: err.message || 'Erro interno no servidor.',
  };

  // Não expõe stack trace em ambiente de produção
  if (ENV.NODE_ENV !== 'production' && err.stack) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}
