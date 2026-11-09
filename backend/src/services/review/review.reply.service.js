import prisma from '../../config/prisma.js';
import { AppError } from '../../utils/errors.js';

/**
 * Permite que o vendedor-alvo da avaliação responda a ela
 */
export async function replyToReview(reviewId, vendedorId, replyText) {
  if (!replyText || !replyText.trim()) {
    throw new AppError('O texto da resposta não pode ser vazio.', 400);
  }

  const avaliacao = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!avaliacao) {
    throw new AppError('Avaliação não encontrada.', 404);
  }

  // Apenas o vendedor-alvo pode responder
  if (avaliacao.targetId !== vendedorId) {
    throw new AppError('Você não tem permissão para responder a esta avaliação.', 403);
  }

  const atualizada = await prisma.review.update({
    where: { id: reviewId },
    data: { reply: replyText.trim() },
    include: {
      author: {
        select: { id: true, name: true, username: true, avatar: true },
      },
    },
  });

  return {
    avaliacao: {
      id: atualizada.id,
      nota: atualizada.rating,
      comentario: atualizada.comment,
      resposta: atualizada.reply,
      data: atualizada.createdAt,
      autor: {
        id: atualizada.author.id,
        nome: atualizada.author.name,
        username: atualizada.author.username,
        avatar: atualizada.author.avatar || 'assets/icons/icon-user.png',
      },
    },
  };
}
