import prisma from '../config/prisma.js';
import { AppError } from '../utils/errors.js';

/**
 * Criação segura de pedido calculando preços reais a partir do banco de dados
 */
export async function createOrder(buyerId, orderData) {
  const { items, shippingAddress, paymentMethod, notes } = orderData;

  const productIds = items.map((i) => i.productId);
  const dbProducts = await prisma.product.findMany({
    where: { id: { in: productIds } },
  });

  if (dbProducts.length !== productIds.length) {
    throw new AppError('Um ou mais produtos selecionados não foram encontrados.', 400);
  }

  let calculatedTotal = 0;
  const orderItemsData = [];

  for (const item of items) {
    const dbProd = dbProducts.find((p) => p.id === item.productId);
    const subtotal = Number(dbProd.price) * item.quantity;
    calculatedTotal += subtotal;

    orderItemsData.push({
      productId: dbProd.id,
      title: dbProd.title,
      quantity: item.quantity,
      unitPrice: parseFloat(Number(dbProd.price).toFixed(2)),
    });
  }

  const orderCode = `ITV-${Date.now().toString().slice(-6)}`;

  const newOrder = await prisma.$transaction(async (tx) => {
    return await tx.order.create({
      data: {
        code: orderCode,
        buyerId,
        totalAmount: parseFloat(calculatedTotal.toFixed(2)),
        status: 'PENDING_PAYMENT',
        shippingAddress:
          typeof shippingAddress === 'string'
            ? shippingAddress
            : JSON.stringify(shippingAddress),
        notes: notes || null,
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                sellerId: true,
                images: { take: 1 },
              },
            },
          },
        },
      },
    });
  });

  return newOrder;
}

/**
 * Lista pedidos do comprador
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
 * Detalhes do pedido com verificação de autorização
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
