import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import prisma from '../config/prisma.js';

/**
 * Middleware para validar o token JWT e injetar o usuário na requisição
 */
export async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Acesso não autorizado. Token não informado.',
    });
  }

  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET);
    
    // Busca dados atualizados do usuário no banco
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId || decoded.id },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        status: true,
        city: true,
        neighborhood: true,
        phone: true,
        avatar: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário associado ao token não encontrado.',
      });
    }

    if (user.status === 'BANNED' || user.status === 'SUSPENDED') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Esta conta foi suspensa ou desativada.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    const isExpired = error.name === 'TokenExpiredError';
    return res.status(401).json({
      success: false,
      code: isExpired ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID',
      message: isExpired
        ? 'Sua sessão expirou por tempo limite. Por favor, faça login novamente.'
        : 'Token de autenticação inválido.',
      error: error.message,
    });
  }
}

/**
 * Middleware opcional de autenticação: anexa req.user se houver token válido, mas não bloqueia
 */
export async function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, email: true, role: true },
    });
    if (user) req.user = user;
  } catch (e) {
    // Continua sem usuário autenticado
  }
  next();
}

/**
 * Middleware para restringir por papéis (roles)
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Não autenticado.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Permissão insuficiente.',
      });
    }
    next();
  };
}
