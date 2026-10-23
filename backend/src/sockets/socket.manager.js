import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import prisma from '../config/prisma.js';

let io = null;

/**
 * Inicializa o servidor Socket.IO acoplado ao servidor HTTP do Express
 * @param {import('http').Server} httpServer
 */
export function initSocketServer(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        // Permite requisições do frontend local, configurado ou mesmo host
        if (!origin || ENV.CORS_ORIGIN === '*' || ENV.CORS_ORIGIN.split(',').includes(origin)) {
          return callback(null, true);
        }
        return callback(null, true);
      },
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
      credentials: true,
    },
    pingTimeout: 30000,
    pingInterval: 15000,
  });

  // Middleware de Autenticação JWT para conexões WebSocket
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace(/^Bearer\s+/i, '') ||
        socket.handshake.query?.token;

      if (!token) {
        // Permite conexão de visitantes não autenticados (sem acesso a salas privadas)
        socket.user = null;
        return next();
      }

      const decoded = jwt.verify(token, ENV.JWT_SECRET);
      socket.user = {
        id: decoded.id,
        role: decoded.role,
        email: decoded.email,
        name: decoded.name || 'Usuário',
      };
      return next();
    } catch (err) {
      console.warn('[Socket Auth] Token inválido ou expirado:', err.message);
      // Conexão permitida como visitante anônimo
      socket.user = null;
      return next();
    }
  });

  // Gerenciamento de conexões ativas
  io.on('connection', (socket) => {
    const userId = socket.user?.id;

    if (userId) {
      // O usuário entra na sua sala pessoal para notificações push e badges
      const userRoom = `user:${userId}`;
      socket.join(userRoom);
      console.log(`🔌 [Socket.IO] Usuário autenticado conectado: ${socket.user.name || socket.user.email} (${userId})`);

      // Envia confirmação de conexão e contadores atuais
      notifyBadgeUpdate(userId);
    } else {
      console.log(`🔌 [Socket.IO] Cliente visitante conectado: ${socket.id}`);
    }

    /**
     * Evento: Entrar em uma conversa específica
     */
    socket.on('join_conversation', async ({ conversationId }) => {
      if (!userId || !conversationId) return;

      try {
        const conv = await prisma.conversation.findUnique({
          where: { id: conversationId },
          select: { id: true, buyerId: true, sellerId: true },
        });

        if (!conv) {
          return socket.emit('chat_error', { message: 'Conversa não encontrada.' });
        }

        const isParticipant =
          conv.buyerId === userId || conv.sellerId === userId || socket.user.role === 'ADMIN';

        if (!isParticipant) {
          return socket.emit('chat_error', { message: 'Acesso negado a esta conversa.' });
        }

        const room = `conversation:${conversationId}`;
        socket.join(room);
        socket.emit('joined_conversation', { conversationId });
      } catch (err) {
        console.error('[Socket] Erro ao entrar na conversa:', err);
      }
    });

    /**
     * Evento: Sair da sala de uma conversa
     */
    socket.on('leave_conversation', ({ conversationId }) => {
      if (conversationId) {
        socket.leave(`conversation:${conversationId}`);
      }
    });

    /**
     * Evento: Indicador de "digitando..."
     */
    socket.on('typing', ({ conversationId, isTyping }) => {
      if (!userId || !conversationId) return;

      const room = `conversation:${conversationId}`;
      socket.to(room).emit('user_typing', {
        userId,
        userName: socket.user.name,
        conversationId,
        isTyping: Boolean(isTyping),
      });
    });

    /**
     * Evento de Desconexão
     */
    socket.on('disconnect', (reason) => {
      // Silencioso ou informativo
    });
  });

  console.log('⚡ [Socket.IO] Servidor WebSocket inicializado e pronto para eventos em tempo real.');
  return io;
}

/**
 * Retorna a instância global ativa do Socket.IO
 */
export function getIO() {
  return io;
}

/**
 * Emite um evento diretamente para um usuário específico (todas as abas dele)
 * @param {string} userId
 * @param {string} event
 * @param {any} data
 */
export function emitToUser(userId, event, data) {
  if (!io || !userId) return;
  io.to(`user:${userId}`).emit(event, data);
}

/**
 * Emite um evento para todos os clientes conectados a uma conversa
 * @param {string} conversationId
 * @param {string} event
 * @param {any} data
 */
export function emitToConversation(conversationId, event, data) {
  if (!io || !conversationId) return;
  io.to(`conversation:${conversationId}`).emit(event, data);
}

/**
 * Recalcula e emite instantaneamente os contadores atualizados de badges para o usuário
 * @param {string} userId
 */
export async function notifyBadgeUpdate(userId) {
  if (!io || !userId) return;

  try {
    const [unreadMessages, unreadNotifications] = await Promise.all([
      prisma.message.count({
        where: {
          conversation: {
            OR: [{ buyerId: userId }, { sellerId: userId }],
            status: { not: 'BLOCKED' },
          },
          senderId: { not: userId },
          isRead: false,
        },
      }),
      prisma.notification.count({
        where: { userId, isRead: false },
      }),
    ]);

    io.to(`user:${userId}`).emit('badge_update', {
      unreadMessages,
      unreadNotifications,
      total: unreadMessages + unreadNotifications,
      timestamp: Date.now(),
    });
  } catch (err) {
    console.error('[Socket] Erro ao disparar badge_update:', err.message);
  }
}
