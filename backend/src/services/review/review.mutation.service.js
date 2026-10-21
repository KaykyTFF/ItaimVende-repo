import prisma from '../../config/prisma.js';
import { AppError } from '../../utils/errors.js';

/**
 * Cria uma nova avaliação e recalcula a média do vendedor atomicamente em transação
 */
export async function createReview(authorId, targetUserId, reviewData) {
  const { rating, comment } = reviewData;

  const notaNum = parseInt(rating, 10);
  if (isNaN(notaNum) || notaNum < 1 || notaNum > 5) {
    throw new AppError('A nota deve ser um número inteiro entre 1 e 5 estrelas.', 400);
  }

  const targetUser = await prisma.user.findFirst({
    where: {
      OR: [
        { id: targetUserId },
        { username: targetUserId },
        { email: targetUserId },
      ],
    },
  });

  if (!targetUser) {
    throw new AppError('Vendedor não encontrado.', 404);
  }

  if (authorId === targetUser.id) {
    throw new AppError('Você não pode avaliar o seu próprio perfil.', 400);
  }

  const result = await prisma.$transaction(async (tx) => {
    // 1. Cria o registro da avaliação
    const newReview = await tx.review.create({
      data: {
        authorId,
        targetId: targetUser.id,
        rating: notaNum,
        comment: comment ? comment.trim() : null,
      },
      include: {
        author: {
          select: { id: true, name: true, username: true, avatar: true },
        },
      },
    });

    // 2. Busca todas as notas para recalcular média precisa
    const todasNotas = await tx.review.findMany({
      where: { targetId: targetUser.id },
      select: { rating: true },
    });

    const soma = todasNotas.reduce((acc, curr) => acc + curr.rating, 0);
    const novaMedia = parseFloat((soma / todasNotas.length).toFixed(2));

    // 3. Atualiza o perfil do vendedor com a nova média e contagem
    await tx.user.update({
      where: { id: targetUser.id },
      data: {
        ratingAverage: novaMedia,
        ratingCount: todasNotas.length,
      },
    });

    return {
      review: newReview,
      novaMedia,
      totalAvaliacoes: todasNotas.length,
    };
  });

  return result;
}
