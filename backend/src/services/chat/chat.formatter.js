/**
 * Formatador e DTOs para o módulo de Chat
 * Transforma dados do Prisma em respostas padronizadas para o cliente
 */

/**
 * Formata um objeto de Conversa com metadados do interlocutor e do produto
 * @param {object} c - Conversa retornada pelo Prisma
 * @param {string} userId - ID do usuário atual requisitante
 */
export function formatarConversa(c, userId) {
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
 * Formata um objeto de Mensagem individual
 * @param {object} m - Mensagem retornada pelo Prisma
 * @param {string} userId - ID do usuário atual requisitante
 */
export function formatarMensagem(m, userId) {
  return {
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
      id: m.sender?.id || m.senderId,
      nome: m.sender?.name || 'Usuário',
      username: m.sender?.username || '',
      avatar: m.sender?.avatar || 'assets/icon-user.png',
    },
  };
}
