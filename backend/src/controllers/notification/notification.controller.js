import {
  listUserNotifications,
  getUnreadNotificationCount,
  getNotificationCategoryCounts,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearAllNotifications,
} from '../../services/notification/index.js';

export async function getNotifications(req, res, next) {
  try {
    const data = await listUserNotifications(req.user.id, req.query);
    res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error) {
    next(error);
  }
}

export async function getUnreadCount(req, res, next) {
  try {
    const data = await getUnreadNotificationCount(req.user.id);
    res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error) {
    next(error);
  }
}

export async function getCategoryCounts(req, res, next) {
  try {
    const data = await getNotificationCategoryCounts(req.user.id);
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function markRead(req, res, next) {
  try {
    const data = await markNotificationAsRead(req.user.id, req.params.id);
    res.status(200).json({
      success: true,
      message: 'Notificação marcada como lida.',
      ...data,
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function markAllRead(req, res, next) {
  try {
    const data = await markAllNotificationsAsRead(req.user.id);
    res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteSingle(req, res, next) {
  try {
    const data = await deleteNotification(req.user.id, req.params.id);
    res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error) {
    next(error);
  }
}

export async function clearAll(req, res, next) {
  try {
    const data = await clearAllNotifications(req.user.id);
    res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error) {
    next(error);
  }
}
