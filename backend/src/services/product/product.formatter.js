/**
 * Formatador e utilitários DTO para o módulo de Produtos
 */

/**
 * Gera um slug amigável para URLs a partir do título do produto
 * @param {string} texto
 */
export function gerarSlug(texto) {
  const base = texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 60);
  const randomSuffix = Math.random().toString(36).substring(2, 7);
  return `${base}-${randomSuffix}`;
}

/**
 * Normaliza e enriquece os dados do produto para o frontend
 * @param {object} p - Produto retornado pelo Prisma
 */
export function formatarProdutoParaFrontend(p) {
  const fotosUrls = p.images && p.images.length > 0
    ? p.images.map((img) => img.url)
    : ['assets/produtos/anuncio_13.jpg'];

  const fotoPrincipal = p.images?.find((img) => img.isCover)?.url || fotosUrls[0];

  return {
    ...p,
    price: Number(p.price),
    originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
    images: fotosUrls,
    fotos: fotosUrls,
    imagem: fotoPrincipal,
    titulo: p.title,
    preco: Number(p.price),
    descricao: p.description,
    condicao: p.condition || 'Seminovo',
    categoria: p.category ? p.category.name : 'Geral',
    categoriaSlug: p.category ? p.category.slug : 'geral',
    cidade: p.city || p.seller?.city || 'Paulistana',
    bairro: p.neighborhood || p.seller?.neighborhood || 'Centro',
    vendedor: p.seller?.name || 'Vendedor',
    vendedorId: p.seller?.id || p.sellerId || '',
    vendedorNome: p.seller?.name || 'Vendedor',
    vendedorUsername: p.seller?.username || '',
    vendedorEmail: p.seller?.email || '',
    vendedorCidade: p.city || p.seller?.city || 'Paulistana',
    vendedorTelefone: p.seller?.phone || '',
    vendedorAvatar: p.seller?.avatar || 'assets/icons/icon-user.png',
    vendedorBio: p.seller?.bio || '',
    vendedorVerificado: Boolean(p.seller?.isVerified),
    vendedorAvaliacao: (p.seller?.ratingCount > 0 && p.seller?.ratingAverage) ? Number(p.seller.ratingAverage) : 0.0,
    vendedorTotalAvaliacoes: p.seller?.ratingCount !== undefined ? p.seller.ratingCount : 0,
    vendedorVendas: p.seller?.salesCount !== undefined ? p.seller.salesCount : 0,
    vendedorMembroDesde: p.seller?.createdAt ? 'Membro desde ' + new Date(p.seller.createdAt).getFullYear() : 'Membro desde 2024',
  };
}
