import prisma from '../../config/prisma.js';
import { AppError } from '../../utils/errors.js';

/**
 * Busca avaliações recebidas por um usuário/vendedor
 */
export async function getUserReviews(targetUserId) {
  const user = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true, name: true, ratingAverage: true, ratingCount: true },
  });

  if (!user) {
    throw new AppError('Usuário não encontrado.', 404);
  }

  const reviews = await prisma.review.findMany({
    where: { targetId: targetUserId },
    orderBy: { createdAt: 'desc' },
    include: {
      author: {
        select: { id: true, name: true, username: true, avatar: true },
      },
    },
  });

  return {
    vendedor: {
      id: user.id,
      nome: user.name,
      mediaGeral: Number(user.ratingAverage),
      totalAvaliacoes: user.ratingCount,
    },
    avaliacoes: reviews.map((r) => ({
      id: r.id,
      nota: r.rating,
      comentario: r.comment,
      resposta: r.reply,
      data: r.createdAt,
      autor: {
        id: r.author.id,
        nome: r.author.name,
        username: r.author.username,
        avatar: r.author.avatar || 'assets/images/icon-user.png',
      },
    })),
  };
}
