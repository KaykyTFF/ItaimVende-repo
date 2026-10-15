import {
  getProducts,
  getProductByIdOrSlug,
  getMyProducts as getMyProductsService,
  getSellerProducts as getSellerProductsService,
} from '../../services/product.service.js';

export async function listProducts(req, res, next) {
  try {
    const { products, pagination } = await getProducts(req.query);
    res.status(200).json({
      success: true,
      data: products,
      pagination,
    });
  } catch (error) {
    next(error);
  }
}

export async function listMyProducts(req, res, next) {
  try {
    const { products, summary } = await getMyProductsService(req.user.id);
    res.status(200).json({
      success: true,
      data: products,
      summary,
    });
  } catch (error) {
    next(error);
  }
}

export async function listSellerProducts(req, res, next) {
  try {
    const all = req.query.all === 'true' || req.query.status === 'all';
    const data = await getSellerProductsService(req.params.sellerId, all);
    res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error) {
    next(error);
  }
}

export async function getProductById(req, res, next) {
  try {
    const product = await getProductByIdOrSlug(req.params.id);
    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
}
