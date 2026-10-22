import {
  getUserReviews,
  createReview,
  updateReview,
  deleteReview,
  replyToReview,
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

export async function editReview(req, res, next) {
  try {
    const data = await updateReview(req.params.id, req.user.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Avaliação atualizada com sucesso!',
      ...data,
    });
  } catch (error) {
    next(error);
  }
}

export async function removeReview(req, res, next) {
  try {
    const data = await deleteReview(req.params.id, req.user.id, req.user.role);
    res.status(200).json({
      success: true,
      message: 'Avaliação excluída com sucesso!',
      ...data,
    });
  } catch (error) {
    next(error);
  }
}

export async function replyReview(req, res, next) {
  try {
    const { reply } = req.body;
    const data = await replyToReview(req.params.id, req.user.id, reply);
    res.status(200).json({
      success: true,
      message: 'Resposta publicada com sucesso!',
      ...data,
    });
  } catch (error) {
    next(error);
  }
}
