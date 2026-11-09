import prisma from '../../config/prisma.js';

/**
 * Busca todas as categorias ativas ordenadas por índice de exibição
 * com contagem de produtos ativos associados
 */
export async function getCategories() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { orderIndex: 'asc' },
    include: {
      _count: {
        select: {
          products: {
            where: { status: 'ATIVO', deletedAt: null },
          },
        },
      },
    },
  });

  return categories;
}
