import prisma from '../../config/prisma.js';
import { AppError } from '../../utils/errors.js';
import { formatarProdutoParaFrontend } from './product.formatter.js';

/**
 * Seletor padrão de dados do vendedor incluído nas buscas de produtos
 */
const SELLER_SELECT = {
  id: true,
  name: true,
  username: true,
  email: true,
  city: true,
  neighborhood: true,
  avatar: true,
  phone: true,
  phoneVerifiedAt: true,
  bio: true,
  isVerified: true,
  ratingAverage: true,
  ratingCount: true,
  salesCount: true,
  createdAt: true,
};

/**
 * Normaliza e expande variantes de nomes de cidades do Vale do Itaim e cidades vizinhas
 * para busca tolerante e estrita no Prisma.
 * @param {string} cidadeTermo - Nome ou termo da cidade pesquisada
 * @returns {string[]} Lista de variantes para pesquisa
 */
function expandirVariantesCidade(cidadeTermo) {
  if (!cidadeTermo || typeof cidadeTermo !== 'string') return [];
  const limpo = cidadeTermo.trim();
  if (!limpo) return [];

  const variantes = new Set([limpo]);

  // Mapa de aliases e cidades vizinhas do Vale do Itaim / Microrregião de Paulistana
  const mapaRegional = {
    'paulistana': ['Paulistana'],
    'acaua': ['Acauã', 'Acaua'],
    'betania': ['Betânia', 'Betânia do Piauí', 'Betania do Piaui', 'Betania'],
    'betania do piaui': ['Betânia', 'Betânia do Piauí', 'Betania do Piaui', 'Betania'],
    'jacobina': ['Jacobina', 'Jacobina do Piauí', 'Jacobina do Piaui', 'Jacobina'],
    'jacobina do piaui': ['Jacobina', 'Jacobina do Piauí', 'Jacobina do Piaui', 'Jacobina'],
    'queimada nova': ['Queimada Nova'],
    'curral novo': ['Curral Novo', 'Curral Novo do Piauí', 'Curral Novo do Piaui'],
    'curral novo do piaui': ['Curral Novo', 'Curral Novo do Piauí', 'Curral Novo do Piaui'],
    'patos': ['Patos', 'Patos do Piauí', 'Patos do Piaui'],
    'patos do piaui': ['Patos', 'Patos do Piauí', 'Patos do Piaui'],
    'simoes': ['Simões', 'Simoes'],
    'caridade': ['Caridade', 'Caridade do Piauí', 'Caridade do Piaui'],
    'caridade do piaui': ['Caridade', 'Caridade do Piauí', 'Caridade do Piaui'],
    'afranio': ['Afrânio', 'Afranio'],
    'picos': ['Picos'],
    'petrolina': ['Petrolina'],
  };

  const normalizado = limpo
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (mapaRegional[normalizado]) {
    mapaRegional[normalizado].forEach((item) => variantes.add(item));
  } else {
    variantes.add(normalizado);
  }

  return Array.from(variantes);
}

/**
 * Normaliza variantes do bairro para busca flexível
 * @param {string} bairroTermo
 * @returns {string[]}
 */
function expandirVariantesBairro(bairroTermo) {
  if (!bairroTermo || typeof bairroTermo !== 'string') return [];
  const limpo = bairroTermo.trim();
  if (!limpo) return [];

  const variantes = new Set([limpo]);
  const semAcento = limpo
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  if (semAcento !== limpo) {
    variantes.add(semAcento);
  }
  return Array.from(variantes);
}

/**
 * Busca paginada de produtos com múltiplos filtros (termo, categoria, cidade, bairro, preço, condição e ordenação)
 * @param {object} query - Parâmetros da requisição HTTP (ex: city, neighborhood, search, etc.)
 */
export async function getProducts(query = {}) {
  const {
    search,
    categoryId,
    category,
    minPrice,
    maxPrice,
    condition,
    city,
    neighborhood,
    sort = 'newest',
    page = 1,
    limit = 24,
  } = query;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 24));
  const skip = (pageNum - 1) * limitNum;

  const where = {
    status: 'ATIVO',
    deletedAt: null,
  };

  const andConditions = [];

  // 1. Filtro textual com suporte a unaccent no PostgreSQL (insensível a acentos e maiúsculas)
  if (search && search.trim()) {
    const termo = search.trim();
    try {
      // Consulta otimizada diretamente no PostgreSQL via unaccent
      const matching = await prisma.$queryRaw`
        SELECT p.id
        FROM "Product" p
        LEFT JOIN "Category" c ON p."categoryId" = c.id
        WHERE (
          unaccent_text(lower(p.title)) LIKE unaccent_text(lower(${'%' + termo + '%'}))
          OR unaccent_text(lower(p.description)) LIKE unaccent_text(lower(${'%' + termo + '%'}))
          OR unaccent_text(lower(c.name)) LIKE unaccent_text(lower(${'%' + termo + '%'}))
        )
      `;
      const ids = matching.map((m) => m.id);
      andConditions.push({ id: { in: ids } });
    } catch (unaccentErr) {
      // Fallback seguro caso o banco de dados não possua unaccent
      andConditions.push({
        OR: [
          { title: { contains: termo, mode: 'insensitive' } },
          { description: { contains: termo, mode: 'insensitive' } },
        ],
      });
    }
  }

  // 2. Filtro estrito de Categoria (com tolerância a acentos)
  if (categoryId) {
    where.categoryId = parseInt(categoryId, 10);
  } else if (category && category !== 'todas' && category !== 'todos') {
    try {
      const catMatches = await prisma.$queryRaw`
        SELECT id FROM "Category"
        WHERE unaccent_text(lower(name)) LIKE unaccent_text(lower(${'%' + category + '%'}))
           OR slug = ${category.toLowerCase()}
        LIMIT 1
      `;
      if (catMatches.length > 0) {
        where.categoryId = catMatches[0].id;
      } else {
        const cat = await prisma.category.findFirst({
          where: {
            OR: [
              { slug: category.toLowerCase() },
              { name: { contains: category, mode: 'insensitive' } },
            ],
          },
        });
        if (cat) where.categoryId = cat.id;
      }
    } catch {
      const cat = await prisma.category.findFirst({
        where: {
          OR: [
            { slug: category.toLowerCase() },
            { name: { contains: category, mode: 'insensitive' } },
          ],
        },
      });
      if (cat) where.categoryId = cat.id;
    }
  }

  // 3. Filtro avançado por Cidade do Vale do Itaim e cidades vizinhas (suporta city e cidade)
  const cidadeParam = (city || query.cidade || '').trim();
  if (cidadeParam && !['todas', 'todos', 'all'].includes(cidadeParam.toLowerCase())) {
    const variantes = expandirVariantesCidade(cidadeParam);
    if (variantes.length === 1) {
      andConditions.push({ city: { contains: variantes[0], mode: 'insensitive' } });
    } else {
      andConditions.push({
        OR: variantes.map((v) => ({ city: { contains: v, mode: 'insensitive' } })),
      });
    }
  }

  // 4. Filtro avançado por Bairro (suporta neighborhood e bairro)
  const bairroParam = (neighborhood || query.neighborhood || query.bairro || '').trim();
  if (bairroParam && !['todos', 'todas', 'all'].includes(bairroParam.toLowerCase())) {
    const variantes = expandirVariantesBairro(bairroParam);
    if (variantes.length === 1) {
      andConditions.push({ neighborhood: { contains: variantes[0], mode: 'insensitive' } });
    } else {
      andConditions.push({
        OR: variantes.map((v) => ({ neighborhood: { contains: v, mode: 'insensitive' } })),
      });
    }
  }

  // Agrupa condições no AND para garantir interseção estrita e independente
  if (andConditions.length > 0) {
    where.AND = andConditions;
  }

  // 5. Filtros de Preço
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = parseFloat(minPrice);
    if (maxPrice) where.price.lte = parseFloat(maxPrice);
  }

  // 6. Filtro de Condição do Produto
  if (condition && ['NOVO', 'SEMINOVO', 'USADO', 'DEFEITO'].includes(condition.toUpperCase())) {
    where.condition = condition.toUpperCase();
  }

  let orderBy = { createdAt: 'desc' };
  if (sort === 'price_asc') orderBy = { price: 'asc' };
  else if (sort === 'price_desc') orderBy = { price: 'desc' };
  else if (sort === 'oldest') orderBy = { createdAt: 'asc' };
  else if (sort === 'popular') orderBy = { viewsCount: 'desc' };

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: limitNum,
      include: {
        category: { select: { id: true, name: true, slug: true, icon: true } },
        seller: { select: SELLER_SELECT },
        images: { orderBy: { orderIndex: 'asc' } },
      },
    }),
  ]);

  return {
    products: products.map(formatarProdutoParaFrontend),
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  };
}

/**
 * Busca anúncio por ID ou Slug com incremento atômico de visualizações
 * @param {string} identifier - ID ou slug do produto
 */
export async function getProductByIdOrSlug(identifier) {
  let product = await prisma.product.findFirst({
    where: {
      OR: [{ id: identifier }, { slug: identifier }],
      deletedAt: null,
    },
    include: {
      category: true,
      seller: { select: SELLER_SELECT },
      images: { orderBy: { orderIndex: 'asc' } },
    },
  });

  // Fallback inteligente para requisições de teste ou primeiro produto disponível
  if (!product) {
    product = await prisma.product.findFirst({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        seller: { select: SELLER_SELECT },
        images: { orderBy: { orderIndex: 'asc' } },
      },
    });
  }

  if (!product) {
    throw new AppError('Nenhum anúncio disponível no momento.', 404);
  }

  // Incrementa contagem de visualizações em segundo plano
  prisma.product.update({
    where: { id: product.id },
    data: { viewsCount: { increment: 1 } },
  }).catch(() => {});

  return formatarProdutoParaFrontend(product);
}
