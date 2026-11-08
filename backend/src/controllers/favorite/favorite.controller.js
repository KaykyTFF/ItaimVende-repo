import {
  getUserFavorites,
  toggleFavorite,
  checkFavoriteStatus,
  addFavorite,
  removeFavorite,
} from '../../services/favorite/index.js';

export async function listFavorites(req, res, next) {
  try {
    const data = await getUserFavorites(req.user.id);
    res.status(200).json({
      success: true,
      data: data.favorites,
      ...data,
    });
  } catch (error) {
    next(error);
  }
}

export async function toggleFavoriteProduct(req, res, next) {
  try {
    const result = await toggleFavorite(req.user.id, req.params.productId);
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
}

export async function addFavoriteProduct(req, res, next) {
  try {
    const productId = req.params.productId || req.body?.productId;
    const result = await addFavorite(req.user.id, productId);
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
}

export async function removeFavoriteProduct(req, res, next) {
  try {
    const productId = req.params.productId;
    const result = await removeFavorite(req.user.id, productId);
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
}

export async function checkProductFavoriteStatus(req, res, next) {
  try {
    const data = await checkFavoriteStatus(req.user.id, req.params.productId);
    res.status(200).json({
      success: true,
      favorited: data.isFavorited,
      isFavorited: data.isFavorited,
      ...data,
    });
  } catch (error) {
    next(error);
  }
}
