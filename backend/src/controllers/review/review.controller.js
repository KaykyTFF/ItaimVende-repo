import {
  getUserReviews,
  createReview,
} from '../../services/review/index.js';

export async function listUserReviews(req, res, next) {
  try {
    const data = await getUserReviews(req.params.userId);
    res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error) {
    next(error);
  }
}

export async function addReview(req, res, next) {
  try {
    const data = await createReview(req.user.id, req.params.userId, req.body);
    res.status(201).json({
      success: true,
      message: 'Avaliação enviada com sucesso!',
      ...data,
    });
  } catch (error) {
    next(error);
  }
}
