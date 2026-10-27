import prisma from '../../config/prisma.js';
import { AppError } from '../../utils/errors.js';

export const VALID_REASONS = [
  'FRAUD',
  'INAPPROPRIATE_CONTENT',
  'SPAM',
  'COUNTERFEIT',
  'ALREADY_SOLD',
  'OTHER',
];

export const REASON_LABELS = {
  FRAUD: 'Golpe ou Fraude',
  INAPPROPRIATE_CONTENT: 'Conteúdo Impróprio / Ofensivo',
  SPAM: 'Spam ou Anúncio Falso',
  COUNTERFEIT: 'Produto Proibido ou Falsificado',
  ALREADY_SOLD: 'Item já vendido ou indisponível',
  OTHER: 'Outro motivo',
};

/**
 * Cria denúncia de anúncio e gera ticket de atendimento da moderação
 */
export async function createReport(productId, reportData = {}, currentUser = null) {
  const { reason, description, contactEmail, reporterName } = reportData;

  const reasonUpper = (reason || 'OTHER').toUpperCase().trim();
  if (!VALID_REASONS.includes(reasonUpper)) {
    throw new AppError(`Motivo de denúncia inválido. Escolha entre: ${VALID_REASONS.join(', ')}.`, 400);
  }

  // Permite buscar tanto por ID direto do produto quanto por SLUG
  const product = await prisma.product.findFirst({
    where: {
      OR: [
        { id: productId },
        { slug: productId },
      ],
      deletedAt: null,
    },
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
        },
      },
      images: {
        where: { isCover: true },
        take: 1,
        select: { url: true },
      },
    },
  });

  if (!product) {
    throw new AppError('Anúncio não encontrado ou já encerrado.', 404);
  }

  // Não permitir que o próprio vendedor denuncie seu próprio anúncio
  if (currentUser && currentUser.id === product.sellerId) {
    throw new AppError('Você não pode denunciar o seu próprio anúncio.', 400);
  }

  // Monta a descrição do ticket
  const finalDescription = (description || '').trim();

  const report = await prisma.report.create({
    data: {
      productId: product.id,
      reason: reasonUpper,
      description: finalDescription || null,
      status: 'PENDING',
    },
  });

  // Gera protocolo humanizado baseado no ID do ticket
  const protocolSuffix = report.id.length >= 6 ? report.id.slice(-6).toUpperCase() : report.id.toUpperCase();
  const protocol = `TK-${protocolSuffix}`;

  // Tenta registrar auditoria de forma segura
  try {
    await prisma.auditLog.create({
      data: {
        userId: currentUser?.id || null,
        action: 'REPORT_TICKET_OPENED',
        entity: 'Report',
        entityId: report.id,
        metadata: {
          protocol,
          productId: product.id,
          productTitle: product.title,
          reason: reasonUpper,
          reporterEmail: contactEmail || currentUser?.email || 'anonimo@itaimvende.local',
          reporterName: reporterName || currentUser?.name || 'Usuário da Comunidade',
        },
      },
    });
  } catch (logErr) {
    // Log silencioso sem interromper o fluxo principal
  }

  const ticket = {
    id: report.id,
    protocol,
    productId: product.id,
    productTitle: product.title,
    productSlug: product.slug,
    productPrice: product.price,
    productImage: product.images?.[0]?.url || null,
    sellerName: product.seller?.name || 'Vendedor',
    reason: report.reason,
    reasonLabel: REASON_LABELS[report.reason] || report.reason,
    description: report.description,
    status: report.status,
    statusLabel: 'Em Análise',
    createdAt: report.createdAt,
    reporterName: reporterName || currentUser?.name || 'Anônimo',
    contactEmail: contactEmail || currentUser?.email || null,
  };

  return {
    id: report.id,
    protocol,
    ticket,
    message: `Ticket #${protocol} registrado com sucesso! Nossa moderação foi notificada e já está analisando o anúncio.`,
  };
}

/**
 * Ação de Moderação: Aprovar remoção de anúncio fraudulento
 * Arquiva o produto com status REJEITADO, limpa as imagens do bucket no Storage,
 * resolve o ticket da denúncia e gera log de auditoria.
 * 
 * @param {object} moderatorUser - Objeto do moderador/admin autenticado
 * @param {string} reportId - ID da denúncia
 * @param {string} [reasonNote] - Motivo ou observação da moderação
 */
export async function moderateRemoveProduct(moderatorUser, reportId, reasonNote = '') {
  const report = await prisma.report.findUnique({
    where: { id: reportId },
    include: {
      product: {
        include: {
          images: true,
          seller: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });

  if (!report) {
    throw new AppError('Denúncia não encontrada.', 404);
  }

  const product = report.product;
  if (!product) {
    throw new AppError('O anúncio associado a esta denúncia já foi excluído anteriormente.', 400);
  }

  const { removerImagensDoStorage } = await import('../product/product.mutation.service.js');
  const { createNotification } = await import('../notification/index.js');

  const imageUrls = (product.images || []).map((img) => img.url);

  // 1. Atualiza status do produto para REJEITADO e aplica soft delete
  await prisma.product.update({
    where: { id: product.id },
    data: {
      status: 'REJEITADO',
      deletedAt: new Date(),
    },
  });

  // 2. Remove registros de imagens e purga do Storage
  if (imageUrls.length > 0) {
    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    await removerImagensDoStorage(imageUrls);
  }

  // 3. Atualiza o status da denúncia para RESOLVED
  const updatedReport = await prisma.report.update({
    where: { id: reportId },
    data: { status: 'RESOLVED' },
  });

  // 4. Registra auditoria da moderação
  try {
    await prisma.auditLog.create({
      data: {
        userId: moderatorUser.id,
        action: 'MODERATION_REMOVE_FRAUDULENT_PRODUCT',
        entity: 'Product',
        entityId: product.id,
        metadata: {
          reportId,
          productTitle: product.title,
          sellerId: product.sellerId,
          sellerEmail: product.seller?.email,
          moderatorId: moderatorUser.id,
          moderatorName: moderatorUser.name,
          moderatorRole: moderatorUser.role,
          reportReason: report.reason,
          note: reasonNote || 'Anúncio removido por infração aos termos e suspeita de fraude.',
        },
      },
    });
  } catch (err) {}

  // 5. Notifica o vendedor sobre a remoção
  try {
    createNotification({
      userId: product.sellerId,
      title: 'Anúncio Removido pela Moderação ⚠️',
      message: `O anúncio "${product.title}" foi removido pela moderação: ${reasonNote || 'Violação das diretrizes de segurança da comunidade'}.`,
      type: 'aviso',
      link: '/pages/vender/meus-anuncios.html',
    }).catch(() => {});
  } catch (err) {}

  const protocolSuffix = report.id.length >= 6 ? report.id.slice(-6).toUpperCase() : report.id.toUpperCase();

  return {
    success: true,
    message: `Anúncio "${product.title}" removido com sucesso e fotos purgadas do bucket. Ticket TK-${protocolSuffix} resolvido.`,
    reportId: updatedReport.id,
    productId: product.id,
    productStatus: 'REJEITADO',
  };
}

/**
 * Ação de Moderação: Suspender ou banir conta suspeita/fraudulenta
 * Desativa a conta do usuário (SUSPENDED ou BANNED), arquiva todos os seus anúncios ativos,
 * resolve o ticket da denúncia e gera log de auditoria.
 * 
 * @param {object} moderatorUser - Objeto do moderador/admin autenticado
 * @param {string} reportId - ID da denúncia
 * @param {string} [reasonNote] - Motivo da suspensão
 * @param {'SUSPENDED'|'BANNED'} [statusType='SUSPENDED'] - Tipo de punição
 */
export async function moderateSuspendAccount(moderatorUser, reportId, reasonNote = '', statusType = 'SUSPENDED') {
  const report = await prisma.report.findUnique({
    where: { id: reportId },
    include: {
      product: {
        include: {
          seller: true,
        },
      },
    },
  });

  if (!report) {
    throw new AppError('Denúncia não encontrada.', 404);
  }

  const seller = report.product?.seller;
  if (!seller) {
    throw new AppError('Vendedor associado à denúncia não foi localizado.', 404);
  }

  // Não permite que moderador suspenda outro admin/moderador
  if (['ADMIN', 'MODERATOR'].includes(seller.role) && moderatorUser.role !== 'ADMIN') {
    throw new AppError('Você não tem permissão para suspender outro moderador ou administrador.', 403);
  }

  const normalizedStatus = statusType === 'BANNED' ? 'BANNED' : 'SUSPENDED';

  // 1. Atualiza status do usuário para SUSPENDED/BANNED
  await prisma.user.update({
    where: { id: seller.id },
    data: { status: normalizedStatus },
  });

  // 2. Arquiva todos os anúncios ativos do vendedor
  await prisma.product.updateMany({
    where: { sellerId: seller.id, deletedAt: null },
    data: {
      status: 'ARQUIVADO',
      deletedAt: new Date(),
    },
  });

  // 3. Atualiza o status do ticket para RESOLVED
  const updatedReport = await prisma.report.update({
    where: { id: reportId },
    data: { status: 'RESOLVED' },
  });

  // 4. Registra auditoria da moderação
  try {
    await prisma.auditLog.create({
      data: {
        userId: moderatorUser.id,
        action: normalizedStatus === 'BANNED' ? 'MODERATION_BAN_ACCOUNT' : 'MODERATION_SUSPEND_ACCOUNT',
        entity: 'User',
        entityId: seller.id,
        metadata: {
          reportId,
          sellerEmail: seller.email,
          sellerName: seller.name,
          moderatorId: moderatorUser.id,
          moderatorName: moderatorUser.name,
          moderatorRole: moderatorUser.role,
          note: reasonNote || `Conta ${normalizedStatus === 'BANNED' ? 'banida' : 'suspensa'} por atividade fraudulenta.`,
        },
      },
    });
  } catch (err) {}

  const protocolSuffix = report.id.length >= 6 ? report.id.slice(-6).toUpperCase() : report.id.toUpperCase();

  return {
    success: true,
    message: `Conta de ${seller.name} (${seller.email}) foi ${normalizedStatus === 'BANNED' ? 'banida' : 'suspensa'} com sucesso. Todos os anúncios foram desativados.`,
    reportId: updatedReport.id,
    userId: seller.id,
    userStatus: normalizedStatus,
  };
}

/**
 * Ação de Moderação: Descartar denúncia improcedente
 * 
 * @param {object} moderatorUser - Objeto do moderador/admin
 * @param {string} reportId - ID da denúncia
 * @param {string} [reasonNote] - Motivo do descarte
 */
export async function moderateDismissReport(moderatorUser, reportId, reasonNote = '') {
  const report = await prisma.report.findUnique({
    where: { id: reportId },
  });

  if (!report) {
    throw new AppError('Denúncia não encontrada.', 404);
  }

  const updatedReport = await prisma.report.update({
    where: { id: reportId },
    data: { status: 'DISMISSED' },
  });

  try {
    await prisma.auditLog.create({
      data: {
        userId: moderatorUser.id,
        action: 'MODERATION_DISMISS_REPORT',
        entity: 'Report',
        entityId: reportId,
        metadata: {
          moderatorId: moderatorUser.id,
          moderatorName: moderatorUser.name,
          moderatorRole: moderatorUser.role,
          note: reasonNote || 'Denúncia descartada como improcedente.',
        },
      },
    });
  } catch (err) {}

  const protocolSuffix = report.id.length >= 6 ? report.id.slice(-6).toUpperCase() : report.id.toUpperCase();

  return {
    success: true,
    message: `Ticket TK-${protocolSuffix} descartado e encerrado.`,
    reportId: updatedReport.id,
    reportStatus: 'DISMISSED',
  };
}
