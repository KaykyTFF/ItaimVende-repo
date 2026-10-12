/**
 * ITAIM VENDE - LISTA ÚNICA DE CATEGORIAS
 * Usada pela página categoria.html. Concentra o nome exibido, a chave usada
 * na URL (?cat=...) e os nomes alternativos (aliases) que aparecem em outras
 * telas, como as opções do formulário vender.html.
 */
/**
 * ITAIM VENDE - LISTA ÚNICA DE CATEGORIAS
 * Usada pela página categoria.html e home.html. Concentra o nome exibido, a chave usada
 * na URL (?cat=...), slugs oficiais do banco de dados e nomes alternativos (aliases).
 */
const CATEGORIAS = [
    { chave: 'Eletrônicos', nome: 'Eletrônicos & Celulares', slug: 'eletronicos',
      aliases: ['Eletrônicos', 'Eletrônicos & Celulares', 'Celulares e Smartphones', 'Eletrônicos e Áudio', 'Computadores e Informática', 'Informática & PC', 'Tecnologia'] },
    { chave: 'Veículos', nome: 'Veículos & Peças', slug: 'veiculos',
      aliases: ['Veículos', 'Veículos & Peças', 'Carros e Motos', 'Motos', 'Carros', 'Automóveis', 'Peças'] },
    { chave: 'Móveis', nome: 'Móveis & Casa', slug: 'moveis',
      aliases: ['Móveis', 'Móveis & Casa', 'Móveis e Decoração', 'Casa', 'Eletrodomésticos'] },
    { chave: 'Decoração', nome: 'Decoração & Casa', slug: 'decoracao',
      aliases: ['Decoração', 'Móveis e Decoração', 'Cama, Mesa e Banho'] },
    { chave: 'Moda', nome: 'Moda & Vestuário', slug: 'moda',
      aliases: ['Moda', 'Moda & Vestuário', 'Moda e Acessórios', 'Moda e Calçados', 'Roupas', 'Calçados'] },
    { chave: 'Esportes', nome: 'Esportes & Lazer', slug: 'esportes',
      aliases: ['Esportes', 'Esportes & Lazer', 'Bicicletas', 'Fitness', 'Ciclismo'] },
    { chave: 'Infantil', nome: 'Infantil & Brinquedos', slug: 'infantil',
      aliases: ['Infantil', 'Infantil & Brinquedos', 'Infantil & Bebês', 'Bebês', 'Games e Brinquedos', 'Brinquedos'] },
    { chave: 'Hobbies', nome: 'Hobbies & Games', slug: 'hobbies',
      aliases: ['Hobbies', 'Hobbies & Games', 'Games e Brinquedos', 'Jogos', 'Instrumentos'] },
    { chave: 'Agro', nome: 'Agro & Animais', slug: 'agro',
      aliases: ['Agro', 'Agro & Animais', 'Animais', 'Fazenda', 'Agricultura', 'Pecuária'] },
    { chave: 'Imóveis', nome: 'Imóveis & Terrenos', slug: 'imoveis',
      aliases: ['Imóveis', 'Imóveis & Terrenos', 'Casas', 'Terrenos', 'Aluguel', 'Venda de Imóveis'] },
    { chave: 'Serviços', nome: 'Serviços & Negócios', slug: 'servicos',
      aliases: ['Serviços', 'Serviços & Negócios', 'Serviços e Trabalhos', 'Negócios', 'Empregos'] },
    { chave: 'Outros', nome: 'Outros & Geral', slug: 'outros',
      aliases: ['Outros', 'Outros & Geral', 'Outros Produtos', 'Geral', 'Diversos'] }
];

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
    return CATEGORIAS.find(c =>
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
