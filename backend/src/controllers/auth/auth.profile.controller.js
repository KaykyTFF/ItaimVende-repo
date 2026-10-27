import { getUserProfile, getPublicUserProfile, updateUserProfile, changeUserPassword, deleteUserAccount } from '../../services/auth/index.js';

export async function getProfile(req, res, next) {
  try {
    const user = await getUserProfile(req.user.id);
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const user = await updateUserProfile(req.user.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Perfil atualizado com sucesso!',
      user,
    });
  } catch (error) {
    next(error);
  }
}

export async function getPublicProfile(req, res, next) {
  try {
    const user = await getPublicUserProfile(req.params.id);
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
}

export async function changePassword(req, res, next) {
  try {
    const result = await changeUserPassword(req.user.id, req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function deleteAccount(req, res, next) {
  try {
    const result = await deleteUserAccount(req.user.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

