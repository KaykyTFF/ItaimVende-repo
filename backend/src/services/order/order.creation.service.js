import prisma from '../../config/prisma.js';
import { AppError } from '../../utils/errors.js';
import { isUserOnline } from '../../sockets/index.js';
import { ENV } from '../../config/env.js';
import { enviarEmailProdutoVendido } from '../email/email.service.js';

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

  // Dispara notificação push em tempo real para os vendedores dos itens vendidos
  const sellerMap = new Map();
  for (const item of newOrder.items || []) {
    const sId = item.product?.sellerId;
    if (sId && sId !== buyerId) {
      if (!sellerMap.has(sId)) sellerMap.set(sId, []);
      sellerMap.get(sId).push(item.title || item.product?.title || 'Produto');
    }
  }

  import('../notification/index.js').then(async ({ createNotification }) => {
    let buyerName = 'Cliente';
    try {
      const buyer = await prisma.user.findUnique({ where: { id: buyerId }, select: { name: true } });
      if (buyer?.name) buyerName = buyer.name;
    } catch (e) {}

    for (const [sellerId, titles] of sellerMap.entries()) {
      const resumo = titles.slice(0, 2).join(', ') + (titles.length > 2 ? ` e mais ${titles.length - 2}` : '');
      createNotification({
        userId: sellerId,
        title: 'Venda realizada',
        message: `Novo pedido ${orderCode} confirmado para: ${resumo}.`,
        type: 'aviso',
        link: '/pages/vender/meus-anuncios.html',
      }).catch(() => {});

      // Se o vendedor estiver offline, envia e-mail transacional externo
      if (!isUserOnline(sellerId)) {
        prisma.user.findUnique({
          where: { id: sellerId },
          select: { email: true, name: true },
        }).then((seller) => {
          if (seller && seller.email) {
            enviarEmailProdutoVendido({
              to: seller.email,
              name: seller.name,
              productTitle: resumo,
              orderCode,
              totalAmount: calculatedTotal,
              buyerName,
              orderUrl: `${ENV.APP_URL}/pages/vender/meus-anuncios.html`,
            }).catch((err) => console.warn('[Email Notification] Erro ao avisar venda ao vendedor:', err.message));
          }
        }).catch(() => {});
      }
    }
  }).catch(() => {});

  return newOrder;
}
