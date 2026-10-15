import prisma from '../../config/prisma.js';
import { AppError } from '../../utils/errors.js';

/**
 * Lista pedidos realizados pelo comprador autenticado
 */
export async function getUserOrders(buyerId) {
  const orders = await prisma.order.findMany({
    where: { buyerId },
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              title: true,
              images: { take: 1 },
              seller: { select: { id: true, name: true, phone: true } },
            },
          },
        },
      },
      payments: true,
    },
  });

  return orders;
}

/**
 * Detalhes do pedido com verificação estrita de autorização
 */
export async function getOrderDetails(userId, userRole, identifier) {
  const order = await prisma.order.findFirst({
    where: {
      OR: [{ id: identifier }, { code: identifier }],
    },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              title: true,
              images: true,
              seller: { select: { id: true, name: true, phone: true, city: true } },
            },
          },
        },
      },
      payments: true,
    },
  });

  if (!order) {
    throw new AppError('Pedido não encontrado.', 404);
  }

  if (order.buyerId !== userId && userRole !== 'ADMIN') {
    throw new AppError('Acesso não autorizado a este pedido.', 403);
  }

  return order;
}
