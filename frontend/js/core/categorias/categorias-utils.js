/**
 * ITAIM VENDE - UTILITÁRIOS E BUSCA DE CATEGORIAS
 * Arquivo: frontend/js/core/categorias/categorias-utils.js
 * 
 * Responsabilidades:
 * - Normalização de strings (remoção de acentos e casing)
 * - Busca de categoria por termo, chave, slug ou aliases
 * - Obtenção de subcategorias hierárquicas
 * - Verificação de pertencimento de produtos à categoria
 */

/** Remove acentos, espaços extras e diferença de maiúsculas/minúsculas. */
/** Verifica se o termo está contido como palavra inteira (evita que "imoveis" case com "moveis") */
function termoPresenteComoPalavra(texto, termo) {
    if (!texto || !termo) return false;
    if (texto === termo) return true;
    const pTexto = texto.split(/[^a-z0-9]+/).filter(Boolean);
    const pTermo = termo.split(/[^a-z0-9]+/).filter(Boolean);
    if (pTermo.length === 1) {
        return pTexto.includes(pTermo[0]);
    }
    return (' ' + texto + ' ').includes(' ' + termo + ' ');
}

function normalizarTexto(texto) {
    return (texto || '')
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

/** Retorna a lista completa de categorias oficiais cadastradas. */
function obterTodasCategorias() {
    return typeof CATEGORIAS !== 'undefined' ? CATEGORIAS : [];
}

/** Encontra a categoria a partir do valor da URL, nome, chave ou slug. Retorna null se não existir. */
function buscarCategoria(param) {
    const alvo = normalizarTexto(param);
    if (!alvo) return null;
    const lista = obterTodasCategorias();

    // 1. Busca exata por chave, slug ou nome
    const exata = lista.find(c =>
        normalizarTexto(c.chave) === alvo || 
        normalizarTexto(c.nome) === alvo ||
        normalizarTexto(c.slug) === alvo
    );
    if (exata) return exata;

    // 2. Busca por aliases ou subcategorias
    const porAlias = lista.find(c =>
        (c.aliases && c.aliases.some(a => normalizarTexto(a) === alvo)) ||
        (c.subcategorias && c.subcategorias.some(sub => normalizarTexto(sub) === alvo))
    );
    if (porAlias) return porAlias;

    // 3. Busca por inclusão parcial inteligente
    return lista.find(c => {
        const cNome = normalizarTexto(c.nome);
        const cChave = normalizarTexto(c.chave);
        return cNome.includes(alvo) || alvo.includes(cChave) || (c.aliases && c.aliases.some(a => normalizarTexto(a).includes(alvo) || alvo.includes(normalizarTexto(a))));
    }) || null;
}

/** Retorna a lista de subcategorias para uma dada categoria. */
function obterSubcategorias(chaveOuSlug) {
    const cat = buscarCategoria(chaveOuSlug);
    return cat && Array.isArray(cat.subcategorias) ? cat.subcategorias : [];
}

/** Diz se o produto pertence à categoria, considerando slugs, banco de dados, subcategorias e nomes alternativos. */
function produtoPertenceCategoria(produto, categoria) {
    if (!produto || !categoria) return false;

    // 1. Verificação por Slug oficial do banco
    const pSlug = normalizarTexto(produto.categoriaSlug || produto.categorySlug || produto.category?.slug);
    const catSlug = normalizarTexto(categoria.slug);
    if (pSlug && catSlug && pSlug === catSlug) return true;

    // 2. Verificação por Nome da Categoria
    const valor = normalizarTexto(produto.categoria || produto.category?.name || produto.category);
    if (!valor) return false;

    const listaNomes = [
        categoria.chave,
        categoria.nome,
        categoria.slug,
        ...(categoria.aliases || []),
        ...(categoria.subcategorias || [])
    ];
    
    // Comparação exata normalizada
    if (listaNomes.some(n => normalizarTexto(n) === valor)) return true;

    // Comparação por inclusão de palavra inteira (ex: "móveis" em "móveis e decoração")
    const chaveNorm = normalizarTexto(categoria.chave);
    const nomeNorm = normalizarTexto(categoria.nome);
    if (chaveNorm && termoPresenteComoPalavra(valor, chaveNorm)) return true;
    if (nomeNorm && termoPresenteComoPalavra(valor, nomeNorm)) return true;
    if (categoria.aliases && categoria.aliases.some(a => termoPresenteComoPalavra(valor, normalizarTexto(a)))) return true;

    return false;
}

window.ItaimCategoriasUtils = {
    normalizarTexto,
    obterTodasCategorias,
    buscarCategoria,
    obterSubcategorias,
    produtoPertenceCategoria
};
