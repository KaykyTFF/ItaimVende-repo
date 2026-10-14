import {
  getProducts,
  getProductByIdOrSlug,
  createProduct as createProductService,
  updateProduct as updateProductService,
  deleteProduct as deleteProductService,
  recordProductContact,
  getMyProducts as getMyProductsService,
  updateProductStatus as updateProductStatusService,
  getSellerProducts as getSellerProductsService,
} from '../services/product.service.js';

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

export async function createProduct(req, res, next) {
  try {
    const product = await createProductService(req.user.id, req.body);
    res.status(201).json({
      success: true,
      message: 'Anúncio publicado com sucesso no Itaim Vende!',
      data: product,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProduct(req, res, next) {
  try {
    const product = await updateProductService(req.user.id, req.user.role, req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Produto atualizado com sucesso!',
      data: product,
    });
  } catch (error) {
    next(error);
  }
}

export async function changeProductStatus(req, res, next) {
  try {
    const { status } = req.body;
    const product = await updateProductStatusService(req.user.id, req.user.role, req.params.id, status);
    res.status(200).json({
      success: true,
      message: `Status do anúncio alterado para ${product.status}.`,
      data: product,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteProduct(req, res, next) {
  try {
    await deleteProductService(req.user.id, req.user.role, req.params.id);
    res.status(200).json({
      success: true,
      message: 'Anúncio removido com sucesso.',
    });
  } catch (error) {
    next(error);
  }
}

export async function trackContact(req, res, next) {
  try {
    await recordProductContact(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Contato registrado.',
    });
  } catch (error) {
    next(error);
  }
}
