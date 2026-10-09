/**
 * ITAIM VENDE - LISTA ÚNICA DE CATEGORIAS
 * Usada pela página categoria.html. Concentra o nome exibido, a chave usada
 * na URL (?cat=...) e os nomes alternativos (aliases) que aparecem em outras
 * telas, como as opções do formulário vender.html.
 */
const CATEGORIAS = [
    { chave: 'Eletrônicos', nome: 'Eletrônicos',
      aliases: ['Celulares e Smartphones', 'Eletrônicos e Áudio', 'Computadores e Informática', 'Informática & PC'] },
    { chave: 'Decoração', nome: 'Decoração',
      aliases: ['Móveis e Decoração'] },
    { chave: 'Móveis', nome: 'Móveis',
      aliases: ['Móveis e Decoração'] },
    { chave: 'Moda', nome: 'Moda & Vestuário',
      aliases: ['Moda e Acessórios', 'Moda e Calçados', 'Moda & Vestuário'] },
    { chave: 'Infantil', nome: 'Infantil & Bebês',
      aliases: ['Games e Brinquedos', 'Infantil & Bebês'] },
    { chave: 'Esportes', nome: 'Esportes & Lazer',
      aliases: ['Esportes & Lazer'] },
    { chave: 'Hobbies', nome: 'Hobbies & Games',
      aliases: ['Games e Brinquedos', 'Hobbies & Games'] },
    { chave: 'Veículos', nome: 'Veículos',
      aliases: ['Carros e Motos'] },
    { chave: 'Serviços', nome: 'Serviços',
      aliases: ['Serviços e Trabalhos', 'Serviços e Negócios'] }
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

/** Encontra a categoria a partir do valor da URL. Retorna null se não existir. */
function buscarCategoria(param) {
    const alvo = normalizarTexto(param);
    if (!alvo) return null;
    return CATEGORIAS.find(c =>
        normalizarTexto(c.chave) === alvo || normalizarTexto(c.nome) === alvo
    ) || null;
}

/** Diz se o produto pertence à categoria, considerando os nomes alternativos. */
function produtoPertenceCategoria(produto, categoria) {
    const valor = normalizarTexto(produto && produto.categoria);
    if (!valor || !categoria) return false;
    return [categoria.chave, categoria.nome, ...categoria.aliases]
        .some(n => normalizarTexto(n) === valor);
}
