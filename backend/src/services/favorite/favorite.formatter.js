/**
 * Formata os dados de um anúncio favoritado para o DTO consumido pelo frontend
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
    categoria: p.category ? p.category.name : 'Geral',
    categoriaSlug: p.category ? p.category.slug : 'geral',
    cidade: p.city || p.seller?.city || 'Paulistana',
    bairro: p.neighborhood || p.seller?.neighborhood || 'Centro',
    vendedor: p.seller?.name || 'Vendedor',
    vendedorId: p.seller?.id || p.sellerId || '',
    vendedorNome: p.seller?.name || 'Vendedor',
    vendedorUsername: p.seller?.username || '',
    vendedorEmail: p.seller?.email || '',
    vendedorTelefone: p.seller?.phone || '',
    vendedorAvatar: p.seller?.avatar || 'assets/icons/icon-user.png',
    vendedorVerificado: Boolean(p.seller?.isVerified),
  };
}
