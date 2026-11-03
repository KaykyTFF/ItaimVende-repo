import http from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { ENV } from './config/env.js';
import prisma from './config/prisma.js';
import { initSocketServer } from './sockets/index.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { requestLogger } from './middlewares/logger.middleware.js';
import { globalLimiter } from './middlewares/rateLimiter.middleware.js';
import { sanitizeInput } from './middlewares/sanitize.middleware.js';

// Rotas por Domínio
import authRoutes from './routes/auth/index.js';
import productRoutes from './routes/product/index.js';
import categoryRoutes from './routes/category/index.js';
import orderRoutes from './routes/order/index.js';
import chatRoutes from './routes/chat/index.js';
import favoriteRoutes from './routes/favorite/index.js';
import uploadRoutes from './routes/upload/index.js';
import reviewRoutes from './routes/review/index.js';
import reportRoutes from './routes/report/index.js';
import systemRoutes from './routes/system/index.js';
import addressRoutes from './routes/address/index.js';
import notificationRoutes from './routes/notification/index.js';
import { UPLOAD_DIR, UPLOAD_PERFIL_DIR, UPLOAD_VENDAS_DIR } from './config/upload.js';
import { storageAdapter } from './adapters/storage/index.js';
import swaggerUi from 'swagger-ui-express';
import { openapiSpec } from './docs/openapi.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FRONTEND_DIR = path.resolve(__dirname, '../../frontend');

export const SERVER_BOOT_ID = `boot_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

const app = express();
app.set('trust proxy', 1);
app.set('SERVER_BOOT_ID', SERVER_BOOT_ID);

// Middlewares de Segurança Global (permite scripts, estilos e fotos estáticas no frontend)
app.use(helmet({ crossOriginResourcePolicy: false, contentSecurityPolicy: false }));

// Configuração do CORS (aceita requisições do frontend local ou configurado e expõe X-Server-Boot)
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || ENV.CORS_ORIGIN === '*' || ENV.CORS_ORIGIN.split(',').includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Bloqueado por política CORS'));
    },
    credentials: true,
    exposedHeaders: ['X-Server-Boot'],
  })
);

// Middleware para anexar o identificador de inicialização do servidor em todas as respostas
app.use((req, res, next) => {
  res.setHeader('X-Server-Boot', SERVER_BOOT_ID);
  next();
});

// Observabilidade: Logger de Requisições HTTP em tempo real
app.use(requestLogger);

// Rate Limiting Global: Proteção contra flood, ataques de negação de serviço e scraping abusivo
app.use('/api', globalLimiter);

// Parser de JSON com limite seguro
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Higienização contra Stored/Reflected XSS em todas as requisições
app.use(sanitizeInput);


// Servir pasta de uploads de imagens de forma estática com fallback gracioso para subpastas e placeholder
app.use('/uploads', express.static(UPLOAD_DIR));
app.use('/uploads', (req, res) => {
  const rawPath = req.path || '';
  const requestedFile = path.basename(rawPath);

  // Prevenção estrita de Path Traversal
  if (!requestedFile || requestedFile.includes('..') || rawPath.includes('..') || rawPath.includes('\\')) {
    return res.status(400).json({ success: false, message: 'Caminho inválido.' });
  }

  // Se o arquivo foi requisitado direto na raiz de /uploads/ (ex: URLs antigas), tenta localizar nas subpastas
  const perfilDir = path.resolve(UPLOAD_PERFIL_DIR);
  const perfilCandidate = path.resolve(perfilDir, requestedFile);
  if (perfilCandidate.startsWith(perfilDir) && fs.existsSync(perfilCandidate)) {
    return res.sendFile(perfilCandidate);
  }

  const vendasDir = path.resolve(UPLOAD_VENDAS_DIR);
  const vendasCandidate = path.resolve(vendasDir, requestedFile);
  if (vendasCandidate.startsWith(vendasDir) && fs.existsSync(vendasCandidate)) {
    return res.sendFile(vendasCandidate);
  }

  // Fallback para placeholder se a imagem solicitada não existir no disco
  const candidate1 = path.resolve(process.cwd(), 'frontend/assets/placeholders/produto-placeholder.svg');
  const candidate2 = path.resolve(process.cwd(), '../frontend/assets/placeholders/produto-placeholder.svg');
  const placeholderPath = fs.existsSync(candidate1) ? candidate1 : (fs.existsSync(candidate2) ? candidate2 : null);
  if (placeholderPath) {
    res.setHeader('Content-Type', 'image/svg+xml');
    return res.sendFile(placeholderPath);
  }
  res.status(404).json({ success: false, message: 'Imagem não encontrada.' });
});

// Servir assets estáticos (imagens, ícones, placeholders) com suporte universal direto e aninhado (ex: /assets/..., /home/assets/..., /pages/*/assets/...)
app.use((req, res, next) => {
  const assetsIdx = req.path.indexOf('/assets/');
  if (assetsIdx !== -1) {
    const subpath = req.path.substring(assetsIdx + '/assets/'.length);

    // Prevenção estrita contra Path Traversal
    if (!subpath || subpath.includes('..') || subpath.includes('\\')) {
      return res.status(400).json({ success: false, message: 'Caminho inválido.' });
    }

    const fullPath = path.resolve(FRONTEND_DIR, 'assets', subpath);
    if (fullPath.startsWith(path.resolve(FRONTEND_DIR, 'assets')) && fs.existsSync(fullPath)) {
      try {
        const stat = fs.statSync(fullPath);
        if (stat.isFile()) {
          return res.sendFile(fullPath);
        }
      } catch (err) {}
    }

    // Se o arquivo solicitado for um placeholder ou imagem de produto/anúncio inexistente no disco, entrega o placeholder oficial
    if (req.path.includes('placeholder') || req.path.includes('/produtos/')) {
      const placeholderPath = path.resolve(FRONTEND_DIR, 'assets/placeholders/produto-placeholder.svg');
      if (fs.existsSync(placeholderPath)) {
        res.setHeader('Content-Type', 'image/svg+xml');
        return res.sendFile(placeholderPath);
      }
    }
  }

  // Suporte universal a CSS aninhado (ex: /home/css/..., /pages/*/css/...)
  const cssIdx = req.path.indexOf('/css/');
  if (cssIdx !== -1) {
    const subpath = req.path.substring(cssIdx + '/css/'.length);
    if (subpath && !subpath.includes('..') && !subpath.includes('\\')) {
      const fullPath = path.resolve(FRONTEND_DIR, 'css', subpath);
      if (fullPath.startsWith(path.resolve(FRONTEND_DIR, 'css')) && fs.existsSync(fullPath)) {
        try {
          if (fs.statSync(fullPath).isFile()) {
            res.setHeader('Content-Type', 'text/css');
            return res.sendFile(fullPath);
          }
        } catch (err) {}
      }
    }
  }

  // Suporte universal a JS aninhado (ex: /home/js/..., /pages/*/js/...)
  const jsIdx = req.path.indexOf('/js/');
  if (jsIdx !== -1) {
    const subpath = req.path.substring(jsIdx + '/js/'.length);
    if (subpath && !subpath.includes('..') && !subpath.includes('\\')) {
      const fullPath = path.resolve(FRONTEND_DIR, 'js', subpath);
      if (fullPath.startsWith(path.resolve(FRONTEND_DIR, 'js')) && fs.existsSync(fullPath)) {
        try {
          if (fs.statSync(fullPath).isFile()) {
            res.setHeader('Content-Type', 'application/javascript');
            return res.sendFile(fullPath);
          }
        } catch (err) {}
      }
    }
  }

  next();
});

// Suporte e retrocompatibilidade para requisições legadas em /assets/:filename (com proteção anti-Path Traversal)
app.get('/assets/:filename', (req, res, next) => {
  const filename = req.params.filename;

  // Bloqueio rigoroso contra Path Traversal: impede '..', barras e caracteres de navegação
  if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\') || path.basename(filename) !== filename) {
    return next();
  }

  const subpastas = ['logos', 'icons', 'placeholders', 'banners', 'categorias', 'backgrounds', 'usuarios', 'produtos'];
  for (const sub of subpastas) {
    const allowedDir = path.resolve(FRONTEND_DIR, 'assets', sub);
    const candidate = path.resolve(allowedDir, filename);

    // Garante que o caminho canônico do arquivo não escapa do diretório permitido
    if (candidate.startsWith(allowedDir) && fs.existsSync(candidate)) {
      return res.sendFile(candidate);
    }
  }
  next();
});

// Suporte e retrocompatibilidade para requisições legadas em /css/:filename (com proteção anti-Path Traversal)
app.get('/css/:filename', (req, res, next) => {
  const filename = req.params.filename;

  // Bloqueio rigoroso contra Path Traversal
  if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\') || path.basename(filename) !== filename) {
    return next();
  }

  // Verifica em core/
  const coreDir = path.resolve(FRONTEND_DIR, 'css', 'core');
  const candidateCore = path.resolve(coreDir, filename);
  if (candidateCore.startsWith(coreDir) && fs.existsSync(candidateCore)) {
    return res.sendFile(candidateCore);
  }

  // Verifica em pages/*/
  const pageDirs = ['admin', 'favoritos', 'home', 'mensagens', 'notificacoes', 'perfil', 'produtos', 'vender'];
  for (const sub of pageDirs) {
    const pageDir = path.resolve(FRONTEND_DIR, 'css', 'pages', sub);
    const candidate = path.resolve(pageDir, filename);
    if (candidate.startsWith(pageDir) && fs.existsSync(candidate)) {
      return res.sendFile(candidate);
    }
  }
  next();
});

// =============================================================================
// MONTAGEM DAS ROTAS DA API VERSIONADA (/api/v1)
// =============================================================================
const v1Router = express.Router();

// Rota de Diagnóstico / Healthcheck v1
v1Router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    version: 'v2.0.0',
    platform: 'Itaim Vende API',
    bootId: SERVER_BOOT_ID,
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: ENV.NODE_ENV,
  });
});

v1Router.use('/auth', authRoutes);
v1Router.use('/products', productRoutes);
v1Router.use('/categories', categoryRoutes);
v1Router.use('/orders', orderRoutes);
v1Router.use('/chat', chatRoutes);
v1Router.use('/favorites', favoriteRoutes);
v1Router.use('/upload', uploadRoutes);
v1Router.use('/reviews', reviewRoutes);
v1Router.use('/reports', reportRoutes);
v1Router.use('/system', systemRoutes);
v1Router.use('/addresses', addressRoutes);
v1Router.use('/notifications', notificationRoutes);

// Registra versão oficial /api/v1 e mantém /api para retrocompatibilidade
app.use('/api/v1', v1Router);
app.use('/api', v1Router);

// Documentação Interativa OpenAPI 3.0 / Swagger UI
app.get('/api/v1/docs/openapi.json', (req, res) => {
  res.status(200).json(openapiSpec);
});
app.get('/api-docs/openapi.json', (req, res) => {
  res.status(200).json(openapiSpec);
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));
app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));


// =============================================================================
// SISTEMA ROBUSTO DE ROTEAMENTO DO FRONTEND (CLEAN URLS & RETROCOMPATIBILIDADE)
// =============================================================================

const FRONTEND_PAGES_MAP = {
  // Página Inicial
  '': 'pages/home/home.html',
  '/': 'pages/home/home.html',
  'home': 'pages/home/home.html',

  // Catálogo e Produtos
  'categoria': 'pages/produtos/categoria.html',
  'produto': 'pages/produtos/produto.html',

  // Vendas
  'vender': 'pages/vender/vender.html',
  'meus-anuncios': 'pages/vender/meus-anuncios.html',

  // Mensagens
  'conversas': 'pages/mensagens/conversas.html',
  'chat': 'pages/mensagens/conversas.html',

  // Perfil e Configurações
  'perfil': 'pages/perfil/perfil.html',
  'vendedor': 'pages/perfil/vendedor.html',
  'configuracoes': 'pages/perfil/configuracoes.html',

  // Favoritos e Notificações
  'favoritos': 'pages/favoritos/favoritos.html',
  'notificacoes': 'pages/notificacoes/notificacoes.html',

  // Autenticação
  'login': 'index.html',
  'cadastro': 'index.html',
  'index': 'index.html',

  // Administração e Moderação
  'tickets': 'pages/admin/tickets.html',
  'moderacao': 'pages/admin/tickets.html',
  'painel': 'pages/admin/painel.html',
  'status': 'pages/admin/painel.html',

  // 404
  '404': '404.html',
};

/**
 * Resolve qualquer requisição de página para o arquivo HTML correspondente
 */
function resolverPaginaHtml(urlPath) {
  if (!urlPath) return null;
  let p = urlPath.replace(/\\/g, '/').toLowerCase();

  // Remove query string e hash se presentes
  p = p.split('?')[0].split('#')[0];

  // Normaliza barras repetidas e trailing slash
  p = p.replace(/\/+/g, '/');
  if (p.length > 1 && p.endsWith('/')) {
    p = p.slice(0, -1);
  }

  // Raiz exata
  if (p === '' || p === '/') return FRONTEND_PAGES_MAP['home'];

  // Remove prefixo /frontend se presente
  if (p.startsWith('/frontend')) {
    p = p.substring('/frontend'.length) || '/';
    if (p === '/') return FRONTEND_PAGES_MAP['home'];
  }

  // Se o caminho solicitado apontar diretamente para um arquivo HTML existente em frontend/
  const caminhoLimpo = p.startsWith('/') ? p.substring(1) : p;
  const caminhoFisicoDireto = path.resolve(FRONTEND_DIR, caminhoLimpo);
  if (caminhoFisicoDireto.startsWith(FRONTEND_DIR) && fs.existsSync(caminhoFisicoDireto)) {
    try {
      if (fs.statSync(caminhoFisicoDireto).isFile() && caminhoLimpo.endsWith('.html')) {
        return caminhoLimpo;
      }
    } catch (e) {}
  }

  // Remove prefixo /pages se presente
  if (p.startsWith('/pages/')) {
    p = p.substring('/pages'.length);
  }

  // Se terminar em .html, remove para busca canônica
  const semHtml = p.endsWith('.html') ? p.slice(0, -5) : p;
  const rotaLimpa = semHtml.startsWith('/') ? semHtml.substring(1) : semHtml;

  // 1. Mapeamento direto por nome da rota
  if (FRONTEND_PAGES_MAP[rotaLimpa]) {
    return FRONTEND_PAGES_MAP[rotaLimpa];
  }

  // 2. Mapeamento por último segmento do caminho (ex: /produtos/categoria, /vender/meus-anuncios)
  const partes = rotaLimpa.split('/').filter(Boolean);
  const ultimoSegmento = partes[partes.length - 1];
  if (ultimoSegmento && FRONTEND_PAGES_MAP[ultimoSegmento]) {
    return FRONTEND_PAGES_MAP[ultimoSegmento];
  }

  return null;
}

// Rota raiz oficial
app.get('/', (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, FRONTEND_PAGES_MAP['home']));
});

// Servir arquivos estáticos da pasta frontend (CSS, JS, Assets)
app.use(express.static(FRONTEND_DIR, { index: false }));
app.use('/frontend', express.static(FRONTEND_DIR, { index: false }));

// Roteador Universal de Páginas do Frontend (Clean URLs, aliases e retrocompatibilidade)
app.use((req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return next();
  }
  // Ignora endpoints da API RESTful e documentação OpenAPI
  if (req.path.startsWith('/api') || req.path.startsWith('/api-docs')) {
    return next();
  }

  // Ignora arquivos estáticos por extensão (exceto .html)
  const ext = path.extname(req.path).toLowerCase();
  const extensoesEstaticas = [
    '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico',
    '.css', '.js', '.map', '.woff', '.woff2', '.ttf', '.eot',
    '.json', '.xml', '.txt'
  ];
  if (ext && extensoesEstaticas.includes(ext)) {
    return next();
  }

  // Tenta resolver a página solicitada
  const arquivoPagina = resolverPaginaHtml(req.path);
  if (arquivoPagina) {
    const filePath = path.resolve(FRONTEND_DIR, arquivoPagina);
    if (fs.existsSync(filePath)) {
      return res.sendFile(filePath);
    }
  }

  next();
});

// Tratamento profissional de rotas inexistentes (404 com status HTTP correto)
app.use((req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({
      success: false,
      message: `A rota '${req.originalUrl}' não foi encontrada na API do Itaim Vende.`,
    });
  }

  // Para assets estáticos inexistentes, responde com 404 limpo (sem HTML pesado)
  const ext = path.extname(req.path).toLowerCase();
  const extensoesEstaticas = [
    '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico',
    '.css', '.js', '.map', '.woff', '.woff2', '.ttf', '.eot'
  ];
  if (ext && extensoesEstaticas.includes(ext)) {
    return res.status(404).send('Recurso estático não encontrado.');
  }

  const notFoundPage = path.join(FRONTEND_DIR, '404.html');
  if (fs.existsSync(notFoundPage)) {
    return res.status(404).sendFile(notFoundPage);
  }
  res.status(404).send('Página não encontrada.');
});

// Middleware Global de Erros
app.use(errorHandler);

// Inicialização do Servidor HTTP e WebSocket (Socket.IO)
const PORT = ENV.PORT;
const httpServer = http.createServer(app);
const io = initSocketServer(httpServer);

const server = httpServer.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 Servidor Itaim Vende Ativo na Porta: ${PORT}`);
  console.log(`🌐 Healthcheck: http://localhost:${PORT}/api/v1/health`);
  console.log(`📦 Produtos:    http://localhost:${PORT}/api/v1/products`);
  console.log(`☁️ Storage:     ${storageAdapter.provider === 'supabase' && storageAdapter.isConfigured ? `Supabase Cloud Storage (Bucket: "${ENV.SUPABASE_BUCKET}")` : 'Local Disk Storage (/uploads/) [Fallback/Dev]'}`);
  console.log(`🖼️ Otimizador:  Sharp WebP Converter (Max: ${ENV.IMAGE_MAX_WIDTH}px, Qualidade: ${ENV.IMAGE_QUALITY}%)`);
  console.log(`🔒 Modo:        ${ENV.NODE_ENV}`);
  console.log(`=========================================`);

  // Teste de integridade do Banco de Dados no boot e garantia do unaccent
  prisma.$queryRaw`SELECT 1`
    .then(async () => {
      console.log(`✅ Banco de Dados (Supabase PostgreSQL): CONECTADO E RESPONDENDO`);
      try {
        await prisma.$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS unaccent;');
        await prisma.$executeRawUnsafe(`
          CREATE OR REPLACE FUNCTION unaccent_text(text)
          RETURNS text AS $$ SELECT unaccent($1); $$ LANGUAGE sql IMMUTABLE PARALLEL SAFE;
        `);
        console.log(`🔍 Busca Inteligente: PostgreSQL unaccent (Insensível a Acentos) ATIVA`);
      } catch (unaccentInitErr) {
        // Ignora silenciosamente caso o banco já tenha unaccent
      }
      console.log(`=========================================\n`);
    })
    .catch((err) => {
      console.error(`❌ ATENÇÃO: O Banco de Dados NÃO pôde ser alcançado nesta rede!`);
      console.error(`   Detalhe do erro: ${err.message}`);
      console.error(`   💡 Motivo provável: A sua rede atual (ex: Wi-Fi do IFPI ou firewall) bloqueia portas de banco de dados.`);
      console.error(`   💡 Solução rápida: Conecte o PC no roteador 4G/5G do celular ou altere a porta para 6543 no .env.`);
      console.log(`=========================================\n`);
    });
});

// Encerramento Gracioso (Graceful Shutdown) - Libera conexões do Supabase PostgreSQL
async function gracefulShutdown(signal) {
  console.log(`\n[${signal}] Recebido sinal de parada. Fechando servidor HTTP e desconectando banco...`);
  server.close(async () => {
    try {
      await prisma.$disconnect();
      console.log('✅ Conexões do banco liberadas com sucesso.');
      process.exit(0);
    } catch (err) {
      console.error('❌ Erro ao desconectar do banco:', err);
      process.exit(1);
    }
  });

  // Força encerramento se travar por mais de 5s
  setTimeout(() => {
    console.error('⚠️ Encerramento forçado após timeout de 5 segundos.');
    process.exit(1);
  }, 5000);
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Blindagem contra crash do processo por erros assíncronos não capturados
process.on('unhandledRejection', (reason) => {
  console.error('[Proteção contra Queda - Unhandled Rejection]:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('[Proteção contra Queda - Uncaught Exception]:', err);
});

export default app;




