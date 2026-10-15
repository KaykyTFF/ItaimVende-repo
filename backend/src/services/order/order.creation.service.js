import prisma from '../../config/prisma.js';
import { AppError } from '../../utils/errors.js';

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
