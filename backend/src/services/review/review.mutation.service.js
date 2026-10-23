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

  // Limite de 1 avaliação por usuário por vendedor
  const jaAvaliou = await prisma.review.findFirst({
    where: {
      authorId,
      targetId: targetUser.id,
    },
  });

  if (jaAvaliou) {
    throw new AppError('Você já avaliou este vendedor. Você pode editar ou excluir sua avaliação existente.', 400);
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
    const novaMedia = todasNotas.length > 0 ? parseFloat((soma / todasNotas.length).toFixed(2)) : 0;

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

  // Dispara notificação push em tempo real para o vendedor avaliado
  import('../notification/index.js').then(({ createNotification }) => {
    createNotification({
      userId: targetUser.id,
      title: 'Nova Avaliação Recebida! ⭐',
      message: `${result.review?.author?.name || 'Um comprador'} avaliou você com ${notaNum} estrela${notaNum > 1 ? 's' : ''}.`,
      type: 'avaliacao',
      link: `/pages/perfil/vendedor.html?id=${targetUser.id}`,
    }).catch(() => {});
  }).catch(() => {});

  return result;
}

/**
 * Atualiza uma avaliação existente pelo autor
 */
export async function updateReview(reviewId, authorId, reviewData) {
  const { rating, comment } = reviewData;

  const notaNum = parseInt(rating, 10);
  if (isNaN(notaNum) || notaNum < 1 || notaNum > 5) {
    throw new AppError('A nota deve ser um número inteiro entre 1 e 5 estrelas.', 400);
  }

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new AppError('Avaliação não encontrada.', 404);
  }

  if (review.authorId !== authorId) {
    throw new AppError('Você só tem permissão para editar a sua própria avaliação.', 403);
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedReview = await tx.review.update({
      where: { id: reviewId },
      data: {
        rating: notaNum,
        comment: comment ? comment.trim() : null,
      },
      include: {
        author: {
          select: { id: true, name: true, username: true, avatar: true },
        },
      },
    });

    const todasNotas = await tx.review.findMany({
      where: { targetId: review.targetId },
      select: { rating: true },
    });

    const soma = todasNotas.reduce((acc, curr) => acc + curr.rating, 0);
    const novaMedia = todasNotas.length > 0 ? parseFloat((soma / todasNotas.length).toFixed(2)) : 0;

    await tx.user.update({
      where: { id: review.targetId },
      data: {
        ratingAverage: novaMedia,
        ratingCount: todasNotas.length,
      },
    });

    return {
      review: updatedReview,
      novaMedia,
      totalAvaliacoes: todasNotas.length,
    };
  });

  return result;
}

/**
 * Exclui uma avaliação feita pelo autor ou por um administrador
 */
export async function deleteReview(reviewId, authorId, userRole) {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new AppError('Avaliação não encontrada.', 404);
  }

  if (review.authorId !== authorId && userRole !== 'ADMIN') {
    throw new AppError('Você só tem permissão para excluir a sua própria avaliação.', 403);
  }

  const result = await prisma.$transaction(async (tx) => {
    await tx.review.delete({
      where: { id: reviewId },
    });

    const todasNotas = await tx.review.findMany({
      where: { targetId: review.targetId },
      select: { rating: true },
    });

    const soma = todasNotas.reduce((acc, curr) => acc + curr.rating, 0);
    const novaMedia = todasNotas.length > 0 ? parseFloat((soma / todasNotas.length).toFixed(2)) : 0;

    await tx.user.update({
      where: { id: review.targetId },
      data: {
        ratingAverage: novaMedia,
        ratingCount: todasNotas.length,
      },
    });

    return {
      novaMedia,
      totalAvaliacoes: todasNotas.length,
    };
  });

  return result;
}
