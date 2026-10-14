import prisma from '../config/prisma.js';
import { AppError } from '../utils/errors.js';

function formatarConversa(c, userId) {
  const isUserBuyer = c.buyerId === userId;
  const outroParticipante = isUserBuyer ? c.seller : c.buyer;
  const ultimaMsg = c.messages && c.messages.length > 0 ? c.messages[0] : null;

  const fotos = c.product?.images?.map((img) => img.url) || [];
  const fotoCapa = fotos[0] || 'assets/produto-placeholder.svg';

  return {
    id: c.id,
    productId: c.productId,
    buyerId: c.buyerId,
    sellerId: c.sellerId,
    souOComprador: isUserBuyer,
    product: {
      id: c.product?.id || c.productId,
      slug: c.product?.slug || '',
      titulo: c.product?.title || 'Produto',
      title: c.product?.title || 'Produto',
      preco: c.product ? Number(c.product.price) : 0,
      price: c.product ? Number(c.product.price) : 0,
      condicao: c.product?.condition || 'USADO',
      categoria: c.product?.category?.name || 'Geral',
      cidade: c.product?.city || 'Paulistana',
      descricao: c.product?.description || '',
      status: c.product?.status || 'ATIVO',
      image: fotoCapa,
      imagem: fotoCapa,
      fotos,
    },
    outroParticipante: {
      id: outroParticipante?.id || '',
      nome: outroParticipante?.name || 'Usuário',
      name: outroParticipante?.name || 'Usuário',
      username: outroParticipante?.username || '',
      email: outroParticipante?.email || '',
      avatar: outroParticipante?.avatar || 'assets/icon-user.png',
      telefone: outroParticipante?.phone || '',
      phone: outroParticipante?.phone || '',
      papel: isUserBuyer ? 'Vendedor(a)' : 'Comprador(a)',
    },
    buyer: {
      id: c.buyer?.id || '',
      nome: c.buyer?.name || 'Comprador',
      email: c.buyer?.email || '',
      avatar: c.buyer?.avatar || 'assets/icon-user.png',
      phone: c.buyer?.phone || '',
    },
    seller: {
      id: c.seller?.id || '',
      nome: c.seller?.name || 'Vendedor',
      email: c.seller?.email || '',
      avatar: c.seller?.avatar || 'assets/icon-user.png',
      phone: c.seller?.phone || '',
    },
    ultimaMensagem: ultimaMsg ? ultimaMsg.content : 'Conversa iniciada',
    dataUltimaMensagem: c.lastMessageAt || c.createdAt,
    naoLidas: c._count?.messages || 0,
    status: c.status,
  };
}

/**
 * Lista as conversas do usuário autenticado (como comprador ou vendedor)
 */
export async function getUserConversations(userId) {
  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [{ buyerId: userId }, { sellerId: userId }],
      status: { not: 'BLOCKED' },
    },
    orderBy: { lastMessageAt: 'desc' },
    include: {
      product: {
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
          price: true,
          status: true,
          condition: true,
          city: true,
          category: { select: { id: true, name: true, slug: true } },
          images: { orderBy: { orderIndex: 'asc' } },
        },
      },
      buyer: {
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          avatar: true,
          phone: true,
        },
      },
      seller: {
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          avatar: true,
          phone: true,
        },
      },
      messages: {
        take: 1,
        orderBy: { createdAt: 'desc' },
      },
      _count: {
        select: {
          messages: {
            where: {
              senderId: { not: userId },
              isRead: false,
            },
          },
        },
      },
    },
  });

  return conversations.map((c) => formatarConversa(c, userId));
}

/**
 * Busca detalhes de uma única conversa por ID
 */
export async function getConversationById(userId, userRole, conversationId) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      product: {
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
          price: true,
          status: true,
          condition: true,
          city: true,
          category: { select: { id: true, name: true, slug: true } },
          images: { orderBy: { orderIndex: 'asc' } },
        },
      },
      buyer: {
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          avatar: true,
          phone: true,
        },
      },
      seller: {
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          avatar: true,
          phone: true,
        },
      },
      messages: {
        take: 1,
        orderBy: { createdAt: 'desc' },
      },
      _count: {
        select: {
          messages: {
            where: {
              senderId: { not: userId },
              isRead: false,
            },
          },
        },
      },
    },
  });

  if (!conversation) {
    throw new AppError('Conversa não encontrada.', 404);
  }

  if (conversation.buyerId !== userId && conversation.sellerId !== userId && userRole !== 'ADMIN') {
    throw new AppError('Acesso não autorizado a esta conversa.', 403);
  }

  return formatarConversa(conversation, userId);
}

/**
 * Inicia ou localiza conversa existente para um anúncio
 */
export async function findOrCreateConversation(buyerId, productId) {
  if (!productId) {
    throw new AppError('ID do produto não informado.', 400);
  }

  const product = await prisma.product.findFirst({
    where: {
      OR: [{ id: productId }, { slug: productId }],
      deletedAt: null,
    },
    include: {
      seller: true,
      category: true,
      images: { orderBy: { orderIndex: 'asc' } },
    },
  });

  if (!product) {
    throw new AppError('Anúncio não encontrado.', 404);
  }

  if (product.sellerId === buyerId) {
    throw new AppError('Você é o anunciante deste produto. Suas negociações com compradores aparecem aqui.', 400);
  }

  let conversation = await prisma.conversation.findUnique({
    where: {
      productId_buyerId_sellerId: {
        productId: product.id,
        buyerId,
        sellerId: product.sellerId,
      },
    },
    include: {
      product: {
        include: {
          category: true,
          images: { orderBy: { orderIndex: 'asc' } },
        },
      },
      seller: {
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          avatar: true,
          phone: true,
        },
      },
      buyer: {
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          avatar: true,
          phone: true,
        },
      },
      messages: {
        take: 1,
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        productId: product.id,
        buyerId,
        sellerId: product.sellerId,
      },
      include: {
        product: {
          include: {
            category: true,
            images: { orderBy: { orderIndex: 'asc' } },
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            avatar: true,
            phone: true,
          },
        },
        buyer: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            avatar: true,
            phone: true,
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  return formatarConversa(conversation, buyerId);
}

/**
 * Obtém mensagens e atualiza status de lido
 */
export async function getConversationMessages(userId, userRole, conversationId) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) {
    throw new AppError('Conversa não encontrada.', 404);
  }

  if (conversation.buyerId !== userId && conversation.sellerId !== userId && userRole !== 'ADMIN') {
    throw new AppError('Acesso não autorizado a esta conversa.', 403);
  }

  // Marca mensagens do outro usuário como lidas
  await prisma.message.updateMany({
    where: {
      conversationId,
      senderId: { not: userId },
      isRead: false,
    },
    data: { isRead: true, readAt: new Date() },
  });

  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          username: true,
          avatar: true,
        },
      },
    },
  });

  return messages.map((m) => ({
    id: m.id,
    conversationId: m.conversationId,
    senderId: m.senderId,
    eMeu: m.senderId === userId,
    content: m.content,
    messageType: m.messageType,
    offerValue: m.offerValue ? Number(m.offerValue) : null,
    isRead: m.isRead,
    readAt: m.readAt,
    createdAt: m.createdAt,
    sender: {
      id: m.sender.id,
      nome: m.sender.name,
      avatar: m.sender.avatar || 'assets/icon-user.png',
    },
  }));
}

/**
 * Envia mensagem com suporte a texto, imagem ou proposta de preço
 */
export async function sendConversationMessage(senderId, userRole, conversationId, messageData) {
  const { content, messageType = 'TEXT', offerValue } = messageData;

  if (!content || !content.trim()) {
    throw new AppError('A mensagem não pode estar vazia.', 400);
  }

  if (content.trim().length > 3000) {
    throw new AppError('Mensagem muito longa (máximo de 3000 caracteres).', 400);
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) {
    throw new AppError('Conversa não encontrada.', 404);
  }

  if (conversation.buyerId !== senderId && conversation.sellerId !== senderId && userRole !== 'ADMIN') {
    throw new AppError('Acesso não autorizado.', 403);
  }

  if (conversation.status === 'BLOCKED') {
    throw new AppError('Esta conversa foi bloqueada.', 403);
  }

  const [message] = await prisma.$transaction([
    prisma.message.create({
      data: {
        conversationId,
        senderId,
        content: content.trim(),
        messageType,
        offerValue: offerValue ? parseFloat(offerValue) : null,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
      },
    }),
    prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    }),
  ]);

  return {
    id: message.id,
    conversationId: message.conversationId,
    senderId: message.senderId,
    eMeu: true,
    content: message.content,
    messageType: message.messageType,
    offerValue: message.offerValue ? Number(message.offerValue) : null,
    isRead: message.isRead,
    readAt: message.readAt,
    createdAt: message.createdAt,
    sender: {
      id: message.sender.id,
      nome: message.sender.name,
      avatar: message.sender.avatar || 'assets/icon-user.png',
    },
  };
}
