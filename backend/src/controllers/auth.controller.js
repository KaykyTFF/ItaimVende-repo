import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
} from '../services/auth.service.js';

export async function register(req, res, next) {
  try {
    const result = await registerUser(req.body);
    res.status(201).json({
      success: true,
      message: 'Usuário cadastrado com sucesso!',
      ...result,
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const result = await loginUser(req.body);
    res.status(200).json({
      success: true,
      message: 'Login realizado com sucesso!',
      ...result,
    });
  } catch (error) {
    next(error);
  }
}

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
    const user = await getUserProfile(req.params.id);
    const publicUser = {
      id: user.id,
      name: user.name,
      username: user.username,
      city: user.city,
      neighborhood: user.neighborhood,
      phone: user.phone,
      bio: user.bio,
      avatar: user.avatar,
      isVerified: user.isVerified,
      ratingAverage: user.ratingAverage,
      ratingCount: user.ratingCount,
      salesCount: user.salesCount,
      createdAt: user.createdAt,
      _count: user._count,
    };
    res.status(200).json({
      success: true,
      user: publicUser,
    });
  } catch (error) {
    next(error);
  }
}
