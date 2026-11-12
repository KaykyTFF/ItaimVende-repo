import prisma from '../../config/prisma.js';
import { AppError } from '../../utils/errors.js';

/**
 * Busca avaliações recebidas por um usuário/vendedor
 */
export async function getUserReviews(targetUserId) {
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { id: targetUserId },
        { username: targetUserId },
        { email: targetUserId },
      ],
    },
    select: { id: true, name: true, ratingAverage: true, ratingCount: true },
  });

  if (!user) {
    throw new AppError('Usuário não encontrado.', 404);
  }

  const reviews = await prisma.review.findMany({
    where: { targetId: user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      author: {
        select: { id: true, name: true, username: true, avatar: true },
      },
    },
  });

  const totalAvaliacoes = reviews.length;
  const soma = reviews.reduce((acc, curr) => acc + curr.rating, 0);
  const mediaGeral = totalAvaliacoes > 0 ? parseFloat((soma / totalAvaliacoes).toFixed(2)) : 0;

  const distribuicao = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const r of reviews) {
    if (distribuicao[r.rating] !== undefined) {
      distribuicao[r.rating]++;
    }
  }

  return {
    vendedor: {
      id: user.id,
      nome: user.name,
      mediaGeral,
      totalAvaliacoes,
      distribuicao,
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
        avatar: r.author.avatar || 'assets/icons/icon-user.png',
      },
    })),
  };
}
