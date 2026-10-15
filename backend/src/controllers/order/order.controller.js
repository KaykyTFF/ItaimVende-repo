import {
  createOrder as createOrderService,
  getUserOrders,
  getOrderDetails,
} from '../../services/order.service.js';

export async function createOrder(req, res, next) {
  try {
    const order = await createOrderService(req.user.id, req.body);
    res.status(201).json({
      success: true,
      message: 'Pedido gerado com sucesso!',
      data: order,
    });
  } catch (error) {
    next(error);
  }
}

export async function getMyOrders(req, res, next) {
  try {
    const orders = await getUserOrders(req.user.id);
    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
}

export async function getOrderById(req, res, next) {
  try {
    const order = await getOrderDetails(req.user.id, req.user.role, req.params.id);
    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
}
