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
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
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

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Token inválido ou expirado.',
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
