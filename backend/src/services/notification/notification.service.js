import prisma from '../../config/prisma.js';
import { AppError } from '../../utils/errors.js';
import { emitToUser, notifyBadgeUpdate } from '../../sockets/index.js';
import { getUserPreferences } from '../account/account.preferences.service.js';

/**
 * Remove emojis de títulos e mensagens para manter a documentação e interface técnicas e profissionais
 */
function removerEmojis(texto) {
  if (!texto) return '';
  return texto
    .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}]/gu, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

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
  const tipo = String(n.type || 'aviso').toLowerCase();
  const titleLimpo = removerEmojis(n.title);
  const messageLimpa = removerEmojis(n.message);

  let avatar = null;
  let produtoImagem = null;
  let estrelas = null;

  if (n.link && n.link.includes('?')) {
    try {
      const search = n.link.split('?')[1];
      const sp = new URLSearchParams(search);
      if (sp.get('avatar')) avatar = sp.get('avatar');
      if (sp.get('img')) produtoImagem = sp.get('img');
      if (sp.get('stars')) estrelas = parseInt(sp.get('stars'), 10);
    } catch (e) {}
  }

  if (!estrelas && tipo === 'avaliacao') {
    const match = messageLimpa.match(/(\d)\s*estrela/i);
    estrelas = match ? parseInt(match[1], 10) : 5;
  }

  let textoBotao = 'Ver detalhes';
  let tipoAcao = 'detalhes';

  if (tipo === 'mensagem' || tipo === 'proposta' || tipo === 'oferta') {
    const ehProposta = titleLimpo.toLowerCase().includes('proposta') || tipo === 'proposta' || tipo === 'oferta';
    textoBotao = ehProposta ? 'Ver proposta' : 'Conversar';
    tipoAcao = ehProposta ? 'proposta' : 'conversar';
  } else if (tipo === 'avaliacao') {
    textoBotao = 'Ver avaliação';
    tipoAcao = 'avaliacao';
  } else if (tipo === 'favorito') {
    textoBotao = 'Enviar oferta';
    tipoAcao = 'oferta';
  }

  return {
    id: n.id,
    userId: n.userId,
    title: titleLimpo,
    message: messageLimpa,
    type: tipo,
    isRead: n.isRead,
    link: n.link,
    createdAt: n.createdAt,

    // Propriedades compatíveis com o frontend
    titulo: titleLimpo,
    texto: messageLimpa,
    tipo: tipo,
    lida: n.isRead,
    tempo: formatarTempoRelativo(n.createdAt),
    criadoEm: n.createdAt ? new Date(n.createdAt).getTime() : Date.now(),
    data: n.createdAt ? new Date(n.createdAt).toLocaleDateString('pt-BR') : 'Hoje',
    avatar,
    avatarRing: (tipo === 'proposta' || tipo === 'oferta') ? 'avatar-ring-verde' : '',
    badgePonto: (tipo === 'mensagem' || tipo === 'conversar') ? 'mensagem' : (tipo === 'avaliacao' ? 'avaliacao' : (tipo === 'favorito' ? 'favorito' : 'outline')),
    produtoImagem: produtoImagem || (['mensagem', 'proposta', 'oferta', 'favorito'].includes(tipo) ? '../../assets/produtos/anuncio_8.jpg' : null),
    estrelas,
    textoBotao,
    temIconeChat: (tipo === 'mensagem' || textoBotao === 'Conversar'),
    temIconeEstrela: (tipo === 'avaliacao' || textoBotao === 'Ver avaliação'),
    temSeta: (tipo === 'mensagem' || textoBotao === 'Conversar'),
    tipoAcao,
  };
}

/**
 * Lista notificações do usuário com suporte a filtros, paginação, ordenação e preferências
 */
export async function listUserNotifications(userId, options = {}) {
  const { isRead, type, sort = 'recentes', page = 1, limit = 30 } = options;

  const where = { userId };

  if (isRead !== undefined && isRead !== null && isRead !== '') {
    where.isRead = isRead === 'true' || isRead === true || isRead === '1' || isRead === 1;
  }

  if (type && type !== 'todas') {
    if (type === 'aviso') {
      where.type = { in: ['aviso', 'preco', 'sistema', 'order', 'venda', 'conta'] };
    } else if (type === 'mensagem') {
      where.type = { in: ['mensagem', 'proposta', 'oferta', 'message'] };
    } else if (type === 'avaliacao') {
      where.type = { in: ['avaliacao', 'review', 'rating'] };
    } else if (type === 'favorito') {
      where.type = { in: ['favorito', 'favorite'] };
    } else {
      where.type = type;
    }
  }

  // Aplica filtro com base nas preferências de notificações do usuário
  const prefs = await getUserPreferences(userId);
  const disabledTypes = [];
  if (prefs['not-mensagens'] === false) disabledTypes.push('mensagem', 'proposta', 'oferta');
  if (prefs['not-avaliacoes'] === false) disabledTypes.push('avaliacao');
  if (prefs['not-favoritos'] === false) disabledTypes.push('favorito');
  if (prefs['not-avisos'] === false) disabledTypes.push('aviso', 'preco', 'sistema', 'order', 'venda', 'conta');

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

  // Ordenação
  let orderBy = { createdAt: 'desc' };
  if (sort === 'antigas' || sort === 'asc') {
    orderBy = { createdAt: 'asc' };
  } else if (sort === 'nao-lidas') {
    orderBy = [{ isRead: 'asc' }, { createdAt: 'desc' }];
  }

  const take = Math.min(Math.max(Number(limit) || 30, 1), 100);
  const skip = (Math.max(Number(page) || 1, 1) - 1) * take;

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy,
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
  if (prefs['not-mensagens'] === false) disabledTypes.push('mensagem', 'proposta', 'oferta');
  if (prefs['not-avaliacoes'] === false) disabledTypes.push('avaliacao');
  if (prefs['not-favoritos'] === false) disabledTypes.push('favorito');
  if (prefs['not-avisos'] === false) disabledTypes.push('aviso', 'preco', 'sistema', 'order', 'venda', 'conta');

  const where = { userId, isRead: false };
  if (disabledTypes.length > 0) {
    where.type = { notIn: disabledTypes };
  }

  const count = await prisma.notification.count({ where });
  return { unreadCount: count };
}

/**
 * Retorna contagens de notificações não lidas por categoria individual
 */
export async function getNotificationCategoryCounts(userId) {
  const prefs = await getUserPreferences(userId);
  const disabledTypes = [];
  if (prefs['not-mensagens'] === false) disabledTypes.push('mensagem', 'proposta', 'oferta');
  if (prefs['not-avaliacoes'] === false) disabledTypes.push('avaliacao');
  if (prefs['not-favoritos'] === false) disabledTypes.push('favorito');
  if (prefs['not-avisos'] === false) disabledTypes.push('aviso', 'preco', 'sistema', 'order', 'venda', 'conta');

  const baseWhere = { userId, isRead: false };
  if (disabledTypes.length > 0) baseWhere.type = { notIn: disabledTypes };

  const [unreadTotal, messages, reviews, favorites, notices, allTotal] = await Promise.all([
    prisma.notification.count({ where: baseWhere }),
    disabledTypes.includes('mensagem') ? 0 : prisma.notification.count({ where: { userId, isRead: false, type: { in: ['mensagem', 'proposta', 'oferta', 'message'] } } }),
    disabledTypes.includes('avaliacao') ? 0 : prisma.notification.count({ where: { userId, isRead: false, type: { in: ['avaliacao', 'review', 'rating'] } } }),
    disabledTypes.includes('favorito') ? 0 : prisma.notification.count({ where: { userId, isRead: false, type: { in: ['favorito', 'favorite'] } } }),
    disabledTypes.includes('aviso') ? 0 : prisma.notification.count({ where: { userId, isRead: false, type: { in: ['aviso', 'preco', 'sistema', 'order', 'venda', 'conta'] } } }),
    prisma.notification.count({ where: { userId, ...(disabledTypes.length > 0 ? { type: { notIn: disabledTypes } } : {}) } }),
  ]);

  return {
    unreadTotal,
    all: unreadTotal > 0 ? unreadTotal : allTotal,
    messages,
    reviews,
    favorites,
    notices,
    allTotal,
  };
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
  const tipo = (type || 'aviso').toLowerCase();

  const isTypeDisabled =
    ((tipo === 'mensagem' || tipo === 'proposta' || tipo === 'oferta') && prefs['not-mensagens'] === false) ||
    (tipo === 'avaliacao' && prefs['not-avaliacoes'] === false) ||
    (tipo === 'favorito' && prefs['not-favoritos'] === false) ||
    ((tipo === 'aviso' || tipo === 'preco' || tipo === 'sistema' || tipo === 'order' || tipo === 'venda' || tipo === 'conta') && prefs['not-avisos'] === false);

  const titleLimpo = removerEmojis(title || 'Nova notificação');
  const messageLimpa = removerEmojis(message || '');

  const notif = await prisma.notification.create({
    data: {
      userId,
      title: titleLimpo,
      message: messageLimpa,
      type: tipo,
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
