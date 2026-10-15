import { getUserProfile, updateUserProfile } from '../../services/auth.service.js';

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
