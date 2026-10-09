import prisma from '../config/prisma.js';

/**
 * Criação segura de pedido (os preços são verificados no banco de dados, NUNCA confiando no front)
 */
export async function createOrder(req, res, next) {
  try {
    const buyerId = req.user.id;
    const { items, shippingAddress, paymentMethod } = req.body;

    const productIds = items.map((i) => i.productId);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (dbProducts.length !== productIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Um ou mais produtos selecionados não foram encontrados.',
      });
    }

    // Calcula o total com base no preço real gravado no banco de dados
    let calculatedTotal = 0;
    const orderItemsData = [];

    for (const item of items) {
      const dbProd = dbProducts.find((p) => p.id === item.productId);
      const subtotal = dbProd.price * item.quantity;
      calculatedTotal += subtotal;

      orderItemsData.push({
        productId: dbProd.id,
        quantity: item.quantity,
        unitPrice: dbProd.price,
      });
    }

    const orderId = `ord_${Date.now()}`;

    // Transação para persistir o pedido e os itens vinculados
    const newOrder = await prisma.$transaction(async (tx) => {
      return await tx.order.create({
        data: {
          id: orderId,
          buyerId,
          total: parseFloat(calculatedTotal.toFixed(2)),
          status: 'CONFIRMADO',
          paymentMethod: paymentMethod || 'pix',
          shippingAddress:
            typeof shippingAddress === 'string'
              ? shippingAddress
              : JSON.stringify(shippingAddress),
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
                  images: true,
                  sellerId: true,
                },
              },
            },
          },
        },
      });
    });

    res.status(201).json({
      success: true,
      message: 'Pedido realizado com sucesso!',
      data: newOrder,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Lista pedidos realizados pelo usuário logado
 */
export async function getMyOrders(req, res, next) {
  try {
    const buyerId = req.user.id;

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
                images: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Consulta detalhes de um pedido
 */
export async function getOrderById(req, res, next) {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        buyer: {
          select: { id: true, name: true, email: true, phone: true },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Pedido não encontrado.' });
    }

    if (order.buyerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Acesso negado a este pedido.' });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
}
