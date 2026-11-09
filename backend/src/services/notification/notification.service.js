import prisma from '../../config/prisma.js';
import { AppError } from '../../utils/errors.js';
import { emitToUser, notifyBadgeUpdate } from '../../sockets/index.js';
import { getUserPreferences } from '../account/account.preferences.service.js';

/**
 * Converte data para formato relativo amigável em português
 */
function formatarTempoRelativo(data) {
  if (!data) return 'Agora';
  const agora = Date.now();
  const diffSegundos = Math.floor((agora - new Date(data).getTime()) / 1000);

  if (diffSegundos < 60) return 'Agora';
  const diffMinutos = Math.floor(diffSegundos / 60);
  if (diffMinutos < 60) return `${diffMinutos} min atrás`;
  const diffHoras = Math.floor(diffMinutos / 60);
  if (diffHoras < 24) return `${diffHoras}h atrás`;
  const diffDias = Math.floor(diffHoras / 24);
  if (diffDias === 1) return 'Ontem';
  if (diffDias < 7) return `${diffDias} dias atrás`;
  return new Date(data).toLocaleDateString('pt-BR');
}

/**
 * Formata notificação com atributos camelCase e retrocompatibilidade para o frontend
 */
export function formatNotification(n) {
  return {
    id: n.id,
    userId: n.userId,
    title: n.title,
    message: n.message,
    type: n.type,
    isRead: n.isRead,
    link: n.link,
    createdAt: n.createdAt,
    // Propriedades espelhadas para retrocompatibilidade direta com notificacoes.js
    titulo: n.title,
    texto: n.message,
    tipo: n.type,
    lida: n.isRead,
    tempo: formatarTempoRelativo(n.createdAt),
    criadoEm: n.createdAt ? new Date(n.createdAt).getTime() : Date.now(),
    data: n.createdAt ? new Date(n.createdAt).toLocaleDateString('pt-BR') : 'Hoje',
  };
}

/**
 * Lista notificações do usuário com suporte a filtros, paginação e preferências
 */
export async function listUserNotifications(userId, options = {}) {
  const { isRead, type, page = 1, limit = 30 } = options;

  const where = { userId };

  if (isRead !== undefined && isRead !== null && isRead !== '') {
    where.isRead = isRead === 'true' || isRead === true || isRead === '1' || isRead === 1;
  }

  if (type && type !== 'todas') {
    if (type === 'aviso') {
      where.type = { in: ['aviso', 'preco', 'sistema'] };
    } else {
      where.type = type;
    }
  }

  // Aplica filtro com base nas preferências de notificações do usuário
  const prefs = await getUserPreferences(userId);
  const disabledTypes = [];
  if (prefs['not-mensagens'] === false) disabledTypes.push('mensagem');
  if (prefs['not-avaliacoes'] === false) disabledTypes.push('avaliacao');
  if (prefs['not-favoritos'] === false) disabledTypes.push('favorito');
  if (prefs['not-avisos'] === false) disabledTypes.push('aviso', 'preco', 'sistema');

  if (disabledTypes.length > 0) {
    if (where.type && typeof where.type === 'string') {
      if (disabledTypes.includes(where.type)) {
        return { notifications: [], total: 0, unreadCount: 0, page: 1, limit: 30, totalPages: 0 };
      }
    } else if (where.type && where.type.in) {
      where.type.in = where.type.in.filter(t => !disabledTypes.includes(t));
      if (where.type.in.length === 0) {
        return { notifications: [], total: 0, unreadCount: 0, page: 1, limit: 30, totalPages: 0 };
      }
    } else {
      where.type = { notIn: disabledTypes };
    }
  }

  const take = Math.min(Math.max(Number(limit) || 30, 1), 100);
  const skip = (Math.max(Number(page) || 1, 1) - 1) * take;

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { userId, isRead: false, ...(disabledTypes.length > 0 ? { type: { notIn: disabledTypes } } : {}) } }),
  ]);

  return {
    notifications: notifications.map(formatNotification),
    total,
    unreadCount,
    page: Number(page) || 1,
    limit: take,
    totalPages: Math.ceil(total / take) || 1,
  };
}

/**
 * Retorna contagem de notificações não lidas considerando preferências
 */
export async function getUnreadNotificationCount(userId) {
  const prefs = await getUserPreferences(userId);
  const disabledTypes = [];
  if (prefs['not-mensagens'] === false) disabledTypes.push('mensagem');
  if (prefs['not-avaliacoes'] === false) disabledTypes.push('avaliacao');
  if (prefs['not-favoritos'] === false) disabledTypes.push('favorito');
  if (prefs['not-avisos'] === false) disabledTypes.push('aviso', 'preco', 'sistema');

  const where = { userId, isRead: false };
  if (disabledTypes.length > 0) {
    where.type = { notIn: disabledTypes };
  }

  const count = await prisma.notification.count({ where });
  return { unreadCount: count };
}

/**
 * Marca notificação específica como lida
 */
export async function markNotificationAsRead(userId, notificationId) {
  const existing = await prisma.notification.findFirst({
    where: { id: notificationId, userId },
  });

  if (!existing) {
    throw new AppError('Notificação não encontrada.', 404);
  }

  const updated = await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });

  notifyBadgeUpdate(userId);
  return formatNotification(updated);
}

/**
 * Marca todas as notificações do usuário como lidas
 */
export async function markAllNotificationsAsRead(userId) {
  const result = await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });

  notifyBadgeUpdate(userId);
  return {
    success: true,
    message: 'Todas as notificações foram marcadas como lidas.',
    updatedCount: result.count,
  };
}

/**
 * Remove uma notificação específica
 */
export async function deleteNotification(userId, notificationId) {
  const existing = await prisma.notification.findFirst({
    where: { id: notificationId, userId },
  });

  if (!existing) {
    throw new AppError('Notificação não encontrada.', 404);
  }

  await prisma.notification.delete({
    where: { id: notificationId },
  });

  notifyBadgeUpdate(userId);
  return {
    success: true,
    message: 'Notificação excluída com sucesso.',
  };
}

/**
 * Limpa todas as notificações do usuário
 */
export async function clearAllNotifications(userId) {
  const result = await prisma.notification.deleteMany({
    where: { userId },
  });

  notifyBadgeUpdate(userId);
  return {
    success: true,
    message: 'Todas as notificações foram excluídas com sucesso.',
    deletedCount: result.count,
  };
}

/**
 * Helper interno: Cria notificação persistente no banco de dados respeitando preferências
 */
export async function createNotification({ userId, title, message, type = 'aviso', link = null }) {
  if (!userId) return null;

  const prefs = await getUserPreferences(userId);
  const isTypeDisabled =
    (type === 'mensagem' && prefs['not-mensagens'] === false) ||
    (type === 'avaliacao' && prefs['not-avaliacoes'] === false) ||
    (type === 'favorito' && prefs['not-favoritos'] === false) ||
    ((type === 'aviso' || type === 'preco' || type === 'sistema') && prefs['not-avisos'] === false);

  const notif = await prisma.notification.create({
    data: {
      userId,
      title: title || 'Nova notificação',
      message: message || '',
      type: type || 'aviso',
      link: link || null,
      isRead: isTypeDisabled ? true : false,
    },
  });

  const formatted = formatNotification(notif);
  if (!isTypeDisabled) {
    emitToUser(userId, 'notification_new', formatted);
    notifyBadgeUpdate(userId);
  }
  return formatted;
}
