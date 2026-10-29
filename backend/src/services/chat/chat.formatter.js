/**
 * Formatador e DTOs para o módulo de Chat
 * Transforma dados do Prisma em respostas padronizadas para o cliente
 */

/**
 * Detecta se o conteúdo de uma mensagem representa uma imagem ou anexo
 * @param {string} content
 */
export function isImageContent(content) {
  if (!content || typeof content !== 'string') return false;
  const clean = content.trim();
  return /^\/uploads\/(perfil|vendas|chat)\//i.test(clean) ||
         /^(https?:\/\/|\/uploads\/|data:image\/).*\.(webp|png|jpe?g|gif|svg|avif)(\?.*)?$/i.test(clean) ||
         clean.startsWith('data:image/');
}

/**
 * Retorna o texto formatado amigável para exibição no preview do card da conversa
 * @param {object|null} msg - Objeto da última mensagem
 */
export function formatarPreviewMensagem(msg) {
  if (!msg) return 'Conversa iniciada';
  if (msg.messageType === 'IMAGE' || isImageContent(msg.content)) {
    return '📷 Foto';
  }
  if (msg.messageType === 'OFFER_PROPOSAL') {
    const val = msg.offerValue ? Number(msg.offerValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '';
    return val ? `🤝 Proposta de R$ ${val}` : '🤝 Proposta de valor';
  }
  if (msg.messageType === 'SYSTEM') {
    return `🔔 ${msg.content}`;
  }
  return msg.content || 'Conversa iniciada';
}

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
  const fotoCapa = fotos[0] || 'assets/placeholders/produto-placeholder.svg';

  const isImg = ultimaMsg && (ultimaMsg.messageType === 'IMAGE' || isImageContent(ultimaMsg.content));
  const tipoMsg = isImg ? 'IMAGE' : (ultimaMsg?.messageType || 'TEXT');

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
      avatar: outroParticipante?.avatar || 'assets/icons/icon-user.png',
      telefone: outroParticipante?.phone || '',
      phone: outroParticipante?.phone || '',
      papel: isUserBuyer ? 'Vendedor(a)' : 'Comprador(a)',
    },
    buyer: {
      id: c.buyer?.id || '',
      nome: c.buyer?.name || 'Comprador',
      email: c.buyer?.email || '',
      avatar: c.buyer?.avatar || 'assets/icons/icon-user.png',
      phone: c.buyer?.phone || '',
    },
    seller: {
      id: c.seller?.id || '',
      nome: c.seller?.name || 'Vendedor',
      email: c.seller?.email || '',
      avatar: c.seller?.avatar || 'assets/icons/icon-user.png',
      phone: c.seller?.phone || '',
    },
    ultimaMensagem: formatarPreviewMensagem(ultimaMsg),
    tipoUltimaMensagem: tipoMsg,
    lastMessageContent: ultimaMsg ? ultimaMsg.content : null,
    dataUltimaMensagem: c.lastMessageAt || c.createdAt,
    naoLidas: c._count?.messages || 0,
    status: c.status,
    isBlocked: c.status === 'BLOCKED',
    blockedById: c.blockedById || null,
    blockedByMe: c.blockedById === userId,
  };
}

/**
 * Formata um objeto de Mensagem individual
 * @param {object} m - Mensagem retornada pelo Prisma
 * @param {string} userId - ID do usuário atual requisitante
 */
export function formatarMensagem(m, userId) {
  const isImg = m.messageType === 'IMAGE' || isImageContent(m.content);
  const msgType = isImg ? 'IMAGE' : m.messageType;

  return {
    id: m.id,
    conversationId: m.conversationId,
    senderId: m.senderId,
    eMeu: m.senderId === userId,
    content: m.content,
    messageType: msgType,
    offerValue: m.offerValue ? Number(m.offerValue) : null,
    offerStatus: m.offerStatus || (msgType === 'OFFER_PROPOSAL' ? 'PENDING' : null),
    isRead: m.isRead,
    readAt: m.readAt,
    createdAt: m.createdAt,
    sender: {
      id: m.sender?.id || m.senderId,
      nome: m.sender?.name || 'Usuário',
      username: m.sender?.username || '',
      avatar: m.sender?.avatar || 'assets/icons/icon-user.png',
    },
  };
}
