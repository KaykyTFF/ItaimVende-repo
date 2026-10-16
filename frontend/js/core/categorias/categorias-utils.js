/**
 * ITAIM VENDE - UTILITÁRIOS E BUSCA DE CATEGORIAS
 * Arquivo: frontend/js/core/categorias/categorias-utils.js
 * 
 * Responsabilidades:
 * - Normalização de strings (remoção de acentos e casing)
 * - Busca de categoria por termo, chave ou alias
 * - Verificação de pertencimento de produtos à categoria
 */

/** Remove acentos, espaços extras e diferença de maiúsculas/minúsculas. */
function normalizarTexto(texto) {
    return (texto || '')
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

/** Encontra a categoria a partir do valor da URL ou slug. Retorna null se não existir. */
function buscarCategoria(param) {
    const alvo = normalizarTexto(param);
    if (!alvo) return null;
    const lista = typeof CATEGORIAS !== 'undefined' ? CATEGORIAS : [];
    return lista.find(c =>
        normalizarTexto(c.chave) === alvo || 
        normalizarTexto(c.nome) === alvo ||
        normalizarTexto(c.slug) === alvo ||
        (c.aliases && c.aliases.some(a => normalizarTexto(a) === alvo))
    ) || null;
}

/** Diz se o produto pertence à categoria, considerando slugs, banco de dados e nomes alternativos. */
function produtoPertenceCategoria(produto, categoria) {
    if (!produto || !categoria) return false;

    // 1. Verificação por Slug oficial do banco
    const pSlug = normalizarTexto(produto.categoriaSlug || produto.categorySlug || produto.category?.slug);
    const catSlug = normalizarTexto(categoria.slug);
    if (pSlug && catSlug && pSlug === catSlug) return true;

    // 2. Verificação por Nome da Categoria
    const valor = normalizarTexto(produto.categoria || produto.category?.name || produto.category);
    if (!valor) return false;

    const listaNomes = [categoria.chave, categoria.nome, categoria.slug, ...(categoria.aliases || [])];
    
    // Comparação exata normalizada
    if (listaNomes.some(n => normalizarTexto(n) === valor)) return true;

    // Comparação por inclusão mútua (ex: "eletrônicos" em "eletrônicos & celulares")
    const chaveNorm = normalizarTexto(categoria.chave);
    if (chaveNorm && (valor.includes(chaveNorm) || chaveNorm.includes(valor))) return true;

    return false;
}
