import { Prisma } from '@prisma/client';
import { ENV } from '../config/env.js';

/**
 * Middleware central e defensivo de tratamento de erros
 * Padroniza respostas com code, message e detalhes, tratando falhas de banco e autenticação.
 */
export function errorHandler(err, req, res, next) {
  // 1. Erro de JSON mal formatado no body da requisição
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      code: 'INVALID_JSON',
      message: 'O corpo da requisição contém um JSON inválido ou mal formatado.',
    });
  }

  // 2. Erros de Token JWT (Expirado ou Inválido)
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      code: 'TOKEN_EXPIRED',
      message: 'Sua sessão expirou. Por favor, faça login novamente.',
    });
  }
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      code: 'INVALID_TOKEN',
      message: 'Token de autenticação inválido ou corrompido.',
    });
  }

  // 3. Erros Conhecidos do Prisma (ORM & PostgreSQL Supabase)
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002': {
        const fields = err.meta?.target
          ? Array.isArray(err.meta.target)
            ? err.meta.target.join(', ')
            : err.meta.target
          : 'campo';
        return res.status(409).json({
          success: false,
          code: 'DUPLICATE_ENTRY',
          message: `Conflito de dados: já existe um registro com o valor informado (${fields}).`,
        });
      }
      case 'P2025': {
        return res.status(404).json({
          success: false,
          code: 'NOT_FOUND',
          message: 'O registro solicitado não foi encontrado no banco de dados.',
        });
      }
      case 'P2003': {
        return res.status(400).json({
          success: false,
          code: 'FOREIGN_KEY_VIOLATION',
          message: 'A operação falhou devido a uma dependência de dados inválida ou inexistente.',
        });
      }
      case 'P2000': {
        return res.status(400).json({
          success: false,
          code: 'VALUE_TOO_LONG',
          message: 'O valor informado excede o tamanho máximo permitido no banco de dados.',
        });
      }
      default:
        console.error(`[Prisma Known Error ${err.code}]:`, err.message);
    }
  }

  // 4. Erros de Conexão com o Banco de Dados (Supabase offline / timeout de conexão)
  if (err instanceof Prisma.PrismaClientInitializationError) {
    console.error('[Prisma Init Error - Falha de Conexão]:', err.message);
    return res.status(503).json({
      success: false,
      code: 'DATABASE_UNAVAILABLE',
      message: 'Banco de dados temporariamente inacessível. Tente novamente em alguns segundos.',
    });
  }

  // 5. Erros de Validação da Query do Prisma
  if (err instanceof Prisma.PrismaClientValidationError) {
    console.error('[Prisma Validation Error]:', err.message);
    return res.status(400).json({
      success: false,
      code: 'DB_VALIDATION_ERROR',
      message: 'Parâmetros inválidos enviados para a consulta no banco de dados.',
    });
  }

  // 6. Erro de Aplicação (AppError customizado) ou Erro Genérico
  const statusCode = err.statusCode || 500;
  const errorDetails = err.details || err.errors || null;
  const response = {
    success: false,
    code: err.code || (statusCode === 500 ? 'INTERNAL_SERVER_ERROR' : 'REQUEST_ERROR'),
    message: err.message || 'Erro interno no servidor.',
    detalhes: errorDetails,
    details: errorDetails,
  };

  if (err.errors) {
    response.errors = err.errors;
  }

  if (ENV.NODE_ENV !== 'production' && err.stack) {
    response.stack = err.stack;
  }

  if (statusCode === 500) {
    console.error('[Erro Crítico 500]:', err);
  }

  res.status(statusCode).json(response);
}

