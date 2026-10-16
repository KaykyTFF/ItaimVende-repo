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
