import { getCategories } from '../../services/category/index.js';

export async function listCategories(req, res, next) {
  try {
    const categories = await getCategories();
    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
}
