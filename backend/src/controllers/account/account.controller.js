import {
  changeUsername as changeUsernameService,
  checkUsernameAvailability as checkUsernameService,
} from '../../services/account/account.username.service.js';
import {
  requestEmailChange as requestEmailChangeService,
  confirmEmailChange as confirmEmailChangeService,
} from '../../services/account/account.email.service.js';
import {
  changePhone as changePhoneService,
  requestPhoneChange as requestPhoneChangeService,
  confirmPhoneChange as confirmPhoneChangeService,
  deletePhone as deletePhoneService,
  revertPhoneChange as revertPhoneChangeService,
} from '../../services/account/account.phone.service.js';
import {
  getUserPreferences,
  updateUserPreferences,
} from '../../services/account/account.preferences.service.js';

export async function changeUsername(req, res, next) {
  try {
    const meta = {
      ipAddress: req.ip || req.connection?.remoteAddress,
      userAgent: req.headers['user-agent'],
    };
    const result = await changeUsernameService(req.user.id, req.body.username, meta);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function checkUsername(req, res, next) {
  try {
    const username = req.query.username || req.body?.username || '';
    const userId = req.user?.id || null;
    const result = await checkUsernameService(userId, username);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function requestEmailChange(req, res, next) {
  try {
    const meta = {
      ipAddress: req.ip || req.connection?.remoteAddress,
      userAgent: req.headers['user-agent'],
    };
    const result = await requestEmailChangeService({
      userId: req.user.id,
      currentPassword: req.body.currentPassword,
      newEmail: req.body.newEmail,
      ...meta,
    });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function confirmEmailChange(req, res, next) {
  try {
    const meta = {
      ipAddress: req.ip || req.connection?.remoteAddress,
      userAgent: req.headers['user-agent'],
    };
    const result = await confirmEmailChangeService({
      userId: req.user.id,
      code: req.body.code,
      ...meta,
    });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function changePhone(req, res, next) {
  try {
    const meta = {
      ipAddress: req.ip || req.connection?.remoteAddress,
      userAgent: req.headers['user-agent'],
    };
    const result = await changePhoneService(req.user.id, req.body.phone, meta);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function requestPhoneChange(req, res, next) {
  try {
    const meta = {
      ipAddress: req.ip || req.connection?.remoteAddress,
      userAgent: req.headers['user-agent'],
    };
    const result = await requestPhoneChangeService({
      userId: req.user.id,
      currentPassword: req.body.currentPassword,
      newPhone: req.body.newPhone,
      channel: req.body.channel || 'whatsapp',
      ...meta,
    });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function confirmPhoneChange(req, res, next) {
  try {
    const meta = {
      ipAddress: req.ip || req.connection?.remoteAddress,
      userAgent: req.headers['user-agent'],
    };
    const result = await confirmPhoneChangeService({
      userId: req.user.id,
      newPhone: req.body.newPhone,
      code: req.body.code,
      ...meta,
    });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function deletePhone(req, res, next) {
  try {
    const meta = {
      ipAddress: req.ip || req.connection?.remoteAddress,
      userAgent: req.headers['user-agent'],
    };
    const result = await deletePhoneService({
      userId: req.user.id,
      currentPassword: req.body.currentPassword,
      ...meta,
    });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function revertPhoneChange(req, res, next) {
  try {
    const meta = {
      ipAddress: req.ip || req.connection?.remoteAddress,
      userAgent: req.headers['user-agent'],
    };
    const token = req.body.token || req.query.token;
    const result = await revertPhoneChangeService({
      token,
      ...meta,
    });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getPreferences(req, res, next) {
  try {
    const preferences = await getUserPreferences(req.user.id);
    res.status(200).json({ success: true, preferences });
  } catch (error) {
    next(error);
  }
}

export async function updatePreferences(req, res, next) {
  try {
    const preferences = await updateUserPreferences(req.user.id, req.body || {});
    res.status(200).json({ success: true, message: 'Preferências salvas com sucesso.', preferences });
  } catch (error) {
    next(error);
  }
}
