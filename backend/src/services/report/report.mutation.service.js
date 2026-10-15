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

/**
 * Cria denúncia de anúncio fraudulento ou impróprio
 */
export async function createReport(productId, reportData) {
  const { reason, description } = reportData;

  const reasonUpper = (reason || 'OTHER').toUpperCase().trim();
  if (!VALID_REASONS.includes(reasonUpper)) {
    throw new AppError(`Motivo de denúncia inválido. Escolha entre: ${VALID_REASONS.join(', ')}.`, 400);
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product || product.deletedAt) {
    throw new AppError('Anúncio não encontrado.', 404);
  }

  const report = await prisma.report.create({
    data: {
      productId,
      reason: reasonUpper,
      description: description ? description.trim() : null,
      status: 'PENDING',
    },
  });

  return {
    id: report.id,
    message: 'Denúncia recebida pela moderação do Itaim Vende. Obrigado por ajudar a manter a comunidade segura!',
  };
}
