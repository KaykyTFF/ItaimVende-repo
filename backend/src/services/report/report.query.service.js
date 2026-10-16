import prisma from '../../config/prisma.js';
import { AppError } from '../../utils/errors.js';
import { REASON_LABELS } from './report.mutation.service.js';

export const STATUS_LABELS = {
  PENDING: 'Em Análise',
  UNDER_REVIEW: 'Em Investigação',
  RESOLVED: 'Resolvido (Medida Tomada)',
  DISMISSED: 'Encerrado (Sem Infração)',
};

/**
 * Consulta um ticket de denúncia pelo protocolo (ex: TK-ABC123) ou pelo ID do banco
 */
export async function getTicketByProtocolOrId(protocolOrId) {
  if (!protocolOrId) {
    throw new AppError('Protocolo ou ID do ticket é obrigatório.', 400);
  }

  const clean = protocolOrId.trim();
  let report = null;

  // Se tem formato de protocolo (ex: TK-XXXXXX)
  if (clean.toUpperCase().startsWith('TK-')) {
    const suffix = clean.replace(/^TK-/i, '').toLowerCase();
    report = await prisma.report.findFirst({
      where: {
        OR: [
          { id: { endsWith: suffix } },
          { id: clean },
        ],
      },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            slug: true,
            price: true,
            status: true,
            images: {
              where: { isCover: true },
              take: 1,
              select: { url: true },
            },
            seller: {
              select: {
                id: true,
                name: true,
                username: true,
              },
            },
          },
        },
      },
    });
  } else {
    // Busca direta por ID CUID
    report = await prisma.report.findUnique({
      where: { id: clean },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            slug: true,
            price: true,
            status: true,
            images: {
              where: { isCover: true },
              take: 1,
              select: { url: true },
            },
            seller: {
              select: {
                id: true,
                name: true,
                username: true,
              },
            },
          },
        },
      },
    });
  }

  if (!report) {
    throw new AppError('Ticket de denúncia não encontrado.', 404);
  }

  const protocolSuffix = report.id.length >= 6 ? report.id.slice(-6).toUpperCase() : report.id.toUpperCase();
  const protocol = `TK-${protocolSuffix}`;

  return {
    id: report.id,
    protocol,
    productId: report.productId,
    productTitle: report.product?.title || 'Anúncio removido',
    productSlug: report.product?.slug || '',
    productPrice: report.product?.price || null,
    productStatus: report.product?.status || 'INDISPONIVEL',
    productImage: report.product?.images?.[0]?.url || null,
    sellerName: report.product?.seller?.name || 'Vendedor',
    reason: report.reason,
    reasonLabel: REASON_LABELS[report.reason] || report.reason,
    description: report.description,
    status: report.status,
    statusLabel: STATUS_LABELS[report.status] || report.status,
    createdAt: report.createdAt,
  };
}

/**
 * Lista denúncias/tickets para moderação ou painel administrativo
 */
export async function listReports(filters = {}) {
  const { status, productId, page = 1, limit = 20 } = filters;
  const skip = (Number(page) - 1) * Number(limit);

  const where = {};
  if (status) where.status = status;
  if (productId) where.productId = productId;

  const [reports, total] = await Promise.all([
    prisma.report.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            slug: true,
            price: true,
            status: true,
            seller: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    }),
    prisma.report.count({ where }),
  ]);

  const items = reports.map((r) => {
    const protocolSuffix = r.id.length >= 6 ? r.id.slice(-6).toUpperCase() : r.id.toUpperCase();
    return {
      id: r.id,
      protocol: `TK-${protocolSuffix}`,
      productId: r.productId,
      productTitle: r.product?.title || 'Anúncio removido',
      sellerName: r.product?.seller?.name || 'Vendedor',
      sellerEmail: r.product?.seller?.email || '',
      reason: r.reason,
      reasonLabel: REASON_LABELS[r.reason] || r.reason,
      description: r.description,
      status: r.status,
      statusLabel: STATUS_LABELS[r.status] || r.status,
      createdAt: r.createdAt,
    };
  });

  return {
    items,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)) || 1,
    },
  };
}

/**
 * Atualiza o status de um ticket de denúncia
 */
export async function updateReportStatus(reportId, newStatus) {
  const validStatuses = ['PENDING', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED'];
  const statusUpper = (newStatus || '').toUpperCase().trim();

  if (!validStatuses.includes(statusUpper)) {
    throw new AppError(`Status inválido. Escolha entre: ${validStatuses.join(', ')}.`, 400);
  }

  const updated = await prisma.report.update({
    where: { id: reportId },
    data: { status: statusUpper },
  });

  const protocolSuffix = updated.id.length >= 6 ? updated.id.slice(-6).toUpperCase() : updated.id.toUpperCase();

  return {
    id: updated.id,
    protocol: `TK-${protocolSuffix}`,
    status: updated.status,
    statusLabel: STATUS_LABELS[updated.status] || updated.status,
    message: `Status do Ticket TK-${protocolSuffix} atualizado para ${STATUS_LABELS[updated.status] || updated.status}.`,
  };
}
