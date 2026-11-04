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
} from '../../services/account/account.phone.service.js';

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
      newEmail: req.body.newEmail,
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


