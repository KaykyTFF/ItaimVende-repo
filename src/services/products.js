/**
 * Serviço de Produtos, Catálogo e Categorias (Itaim Vende)
 * Migrado e consolidado de js/categorias-dados.js, js/produtos-dados.js e js/sessao.js
 */

import { apiRequest } from './api.js';

// Lista unificada oficial de categorias
export const CATEGORIAS = [
  { chave: 'todos', nome: 'Todos', icon: 'assets/images/icon-pin.png', aliases: [] },
  { chave: 'Eletrônicos', nome: 'Eletrônicos', icon: 'assets/images/cat-eletronicos.png', aliases: ['Celulares e Smartphones', 'Eletrônicos e Áudio', 'Computadores e Informática', 'Informática & PC'] },
  { chave: 'Moda', nome: 'Moda & Vestuário', icon: 'assets/images/cat-moda.png', aliases: ['Moda e Acessórios', 'Moda e Calçados', 'Moda & Vestuário'] },
  { chave: 'Móveis', nome: 'Móveis', icon: 'assets/images/cat-moveis.png', aliases: ['Móveis e Decoração'] },
  { chave: 'Decoração', nome: 'Decoração', icon: 'assets/images/cat-decoracao.png', aliases: ['Móveis e Decoração'] },
  { chave: 'Esportes', nome: 'Esportes & Lazer', icon: 'assets/images/cat-esportes.png', aliases: ['Esportes & Lazer'] },
  { chave: 'Infantil', nome: 'Infantil & Bebês', icon: 'assets/images/cat-infantil.png', aliases: ['Games e Brinquedos', 'Infantil & Bebês'] },
  { chave: 'Hobbies', nome: 'Hobbies & Games', icon: 'assets/images/cat-hobbies.png', aliases: ['Games e Brinquedos', 'Hobbies & Games'] },
  { chave: 'Serviços', nome: 'Serviços', icon: 'assets/images/cat-servicos.png', aliases: ['Serviços e Trabalhos', 'Serviços e Negócios'] }
];

export function normalizarTexto(texto) {
  return (texto || '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function buscarCategoria(param) {
  const alvo = normalizarTexto(param);
  if (!alvo) return null;
  return CATEGORIAS.find(c =>
    normalizarTexto(c.chave) === alvo || normalizarTexto(c.nome) === alvo
  ) || null;
}

export function produtoPertenceCategoria(produto, categoria) {
  const valor = normalizarTexto(produto && produto.categoria);
  if (!valor || !categoria) return false;
  if (normalizarTexto(categoria.chave) === 'todos') return true;
  return [categoria.chave, categoria.nome, ...(categoria.aliases || [])]
    .some(n => normalizarTexto(n) === valor);
}

// Catálogo com anúncios reais da plataforma
const PRODUTOS_BASE = [
  {
    id: 1,
    titulo: 'Smart TV 4K 50" UHD HDR Dolby Audio Crystal',
    preco: 2199.00,
    categoria: 'Eletrônicos',
    cidade: 'Paulistana',
    bairro: 'Centro',
    imagem: 'assets/images/produtos/anuncio_13.jpg',
    fotos: ['assets/images/produtos/anuncio_13.jpg'],
    descricao: 'Smart TV 4K novinha, excelente estado de conservação, tela sem riscos com suporte e controle original.',
    vendedor: 'Raili',
    vendedorEmail: 'admin@gmail.com',
    status: 'ativo',
    data: 'Hoje',
    visualizacoes: 48,
    badge: 'Destaque'
  },
  {
    id: 2,
    titulo: 'Controle Sem Fio DualSense Midnight Black',
    preco: 389.90,
    categoria: 'Eletrônicos',
    cidade: 'Paulistana',
    bairro: 'Itaim',
    imagem: 'assets/images/banner-controle.png',
    fotos: ['assets/images/banner-controle.png'],
    descricao: 'Controle sem fio com resposta tátil imersiva e gatilhos adaptáveis. Na caixa com manuais.',
    vendedor: 'PlayZone',
    vendedorEmail: 'playzone@gmail.com',
    status: 'ativo',
    data: 'Hoje',
    visualizacoes: 32,
    badge: 'Oferta'
  },
  {
    id: 3,
    titulo: 'Bicicleta Mountain Bike Aro 29 Câmbio Shimano 21V',
    preco: 1350.00,
    categoria: 'Esportes & Lazer',
    cidade: 'Paulistana',
    bairro: 'Centro',
    imagem: 'assets/images/produtos/anuncio_15.jpg',
    fotos: ['assets/images/produtos/anuncio_15.jpg', 'assets/images/produtos/anuncio_15_2.jpg'],
    descricao: 'Mountain Bike seminova com freios a disco mecânicos e amortecedor dianteiro revisado.',
    vendedor: 'Raili',
    vendedorEmail: 'admin@gmail.com',
    status: 'ativo',
    data: 'Ontem',
    visualizacoes: 75,
    badge: 'Novo'
  },
  {
    id: 4,
    titulo: 'Sofá Retrátil e Reclinável 3 Lugares Veludo',
    preco: 1899.90,
    categoria: 'Móveis',
    cidade: 'Paulistana',
    bairro: 'Cohab',
    imagem: 'assets/images/produtos/anuncio_10.jpg',
    fotos: ['assets/images/produtos/anuncio_10.jpg'],
    descricao: 'Sofá super confortável em veludo suede, retrátil e reclinável com espumas D28.',
    vendedor: 'Casa & Conforto',
    vendedorEmail: 'casa@gmail.com',
    status: 'ativo',
    data: 'Há 2 dias',
    visualizacoes: 41
  },
  {
    id: 5,
    titulo: 'Kit Jaqueta Casual Premium + Calça Slim Streetwear',
    preco: 249.00,
    categoria: 'Moda & Vestuário',
    cidade: 'Paulistana',
    bairro: 'Centro',
    imagem: 'assets/images/produtos/anuncio_11.jpg',
    fotos: ['assets/images/produtos/anuncio_11.jpg'],
    descricao: 'Conjunto moderno e versátil para o dia a dia, tecido confortável e acabamento impecável.',
    vendedor: 'Urban Itaim',
    vendedorEmail: 'urban@gmail.com',
    status: 'ativo',
    data: 'Há 3 dias',
    visualizacoes: 59,
    badge: 'Mais Vendido'
  },
  {
    id: 6,
    titulo: 'Conjunto Decorativo Vasos Cerâmica Minimalista',
    preco: 145.00,
    categoria: 'Decoração',
    cidade: 'Paulistana',
    bairro: 'Centro',
    imagem: 'assets/images/produtos/anuncio_12.jpg',
    fotos: ['assets/images/produtos/anuncio_12.jpg'],
    descricao: 'Trio de vasos artesanais feitos à mão com acabamento fosco e design escandinavo.',
    vendedor: 'Studio Decora',
    vendedorEmail: 'decora@gmail.com',
    status: 'ativo',
    data: 'Há 3 dias',
    visualizacoes: 23
  },
  {
    id: 7,
    titulo: 'Notebook Ultrafino Core i7 16GB RAM SSD 512GB',
    preco: 4299.00,
    categoria: 'Eletrônicos',
    cidade: 'Paulistana',
    bairro: 'Centro',
    imagem: 'assets/images/pc.png',
    fotos: ['assets/images/pc.png'],
    descricao: 'Notebook potente e ultraleve, bateria durando mais de 8 horas, ideal para trabalho e estudos.',
    vendedor: 'Raili',
    vendedorEmail: 'admin@gmail.com',
    status: 'ativo',
    data: 'Há 4 dias',
    visualizacoes: 104,
    badge: 'Imperdível'
  },
  {
    id: 8,
    titulo: 'Carrinho de Bebê Multifuncional com Bebê Conforto',
    preco: 890.00,
    categoria: 'Infantil & Bebês',
    cidade: 'Paulistana',
    bairro: 'Itaim',
    imagem: 'assets/images/produtos/anuncio_14.jpg',
    fotos: ['assets/images/produtos/anuncio_14.jpg'],
    descricao: 'Carrinho de bebê completo com bebê conforto acoplável, capota retrátil e cinto de 5 pontos.',
    vendedor: 'Mundo Baby',
    vendedorEmail: 'baby@gmail.com',
    status: 'ativo',
    data: 'Há 5 dias',
    visualizacoes: 37
  }
];

export async function getCategories() {
  try {
    const res = await apiRequest('/categories');
    if (res && Array.isArray(res.data) && res.data.length > 0) {
      return [
        { chave: 'todos', nome: 'Todos', icon: 'assets/images/icon-pin.png', aliases: [] },
        ...res.data.map((c) => ({
          chave: c.slug,
          nome: c.name,
          icon: c.icon || 'assets/images/cat-eletronicos.png',
          aliases: [],
        })),
      ];
    }
  } catch (e) {}
  return CATEGORIAS;
}

/**
 * Retorna todos os produtos unificando base inicial e os cadastrados no localStorage
 */
export function obterTodosProdutosLocais() {
  let todos = [...PRODUTOS_BASE];

  try {
    const locais = JSON.parse(localStorage.getItem('itaim_produtos_cadastrados') || '[]');
    if (Array.isArray(locais) && locais.length > 0) {
      todos = [...locais, ...todos];
    }
  } catch (e) {}

  // Filtrar excluídos
  try {
    const excluidos = JSON.parse(localStorage.getItem('itaim_produtos_excluidos') || '[]');
    if (Array.isArray(excluidos) && excluidos.length > 0) {
      const setExcluidos = new Set(excluidos.map((id) => String(id)));
      todos = todos.filter((p) => !setExcluidos.has(String(p.id)));
    }
  } catch (e) {}

  // Sincronizar status modificado
  try {
    const statusMap = JSON.parse(localStorage.getItem('itaim_produtos_status_map') || '{}');
    todos = todos.map((p) => {
      if (statusMap[p.id]) {
        return { ...p, status: statusMap[p.id] };
      }
      return p;
    });
  } catch (e) {}

  return todos;
}

/**
 * Consulta de produtos com suporte à API e fallback local
 */
export async function getProducts(params = {}) {
  const { query = '', category = 'todos', minPrice = 0, maxPrice = Infinity, sortBy = 'default', cidade = '' } = params;

  try {
    const queryParams = new URLSearchParams(params).toString();
    const res = await apiRequest(`/products?${queryParams}`);
    if (res && Array.isArray(res.data)) return res.data;
    if (Array.isArray(res)) return res;
  } catch (e) {}

  let lista = obterTodosProdutosLocais().filter((p) => p.status !== 'pausado');

  // Filtro de busca
  if (query && query.trim() !== '') {
    const termo = normalizarTexto(query);
    lista = lista.filter((p) =>
      normalizarTexto(p.titulo).includes(termo) ||
      normalizarTexto(p.descricao).includes(termo) ||
      normalizarTexto(p.cidade).includes(termo) ||
      normalizarTexto(p.categoria).includes(termo)
    );
  }

  // Filtro de categoria
  if (category && category !== 'todos' && category !== 'Todas') {
    const catObj = buscarCategoria(category) || { chave: category, nome: category, aliases: [] };
    lista = lista.filter((p) => produtoPertenceCategoria(p, catObj));
  }

  // Filtro de cidade
  if (cidade && cidade !== 'todas') {
    lista = lista.filter((p) => normalizarTexto(p.cidade) === normalizarTexto(cidade));
  }

  // Faixa de preço
  if (minPrice > 0) {
    lista = lista.filter((p) => (p.preco || 0) >= Number(minPrice));
  }
  if (maxPrice < Infinity && maxPrice > 0) {
    lista = lista.filter((p) => (p.preco || 0) <= Number(maxPrice));
  }

  // Ordenação
  if (sortBy === 'price-asc' || sortBy === 'menor-preco') {
    lista.sort((a, b) => (a.preco || 0) - (b.preco || 0));
  } else if (sortBy === 'price-desc' || sortBy === 'maior-preco') {
    lista.sort((a, b) => (b.preco || 0) - (a.preco || 0));
  } else if (sortBy === 'name') {
    lista.sort((a, b) => a.titulo.localeCompare(b.titulo));
  } else {
    // Recentes por padrão
    lista.sort((a, b) => (b.id || 0) - (a.id || 0));
  }

  return lista;
}

export async function getProductById(id) {
  const todos = obterTodosProdutosLocais();
  return todos.find((p) => String(p.id) === String(id)) || null;
}
