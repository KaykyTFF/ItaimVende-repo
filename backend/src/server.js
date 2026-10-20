import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import prisma from './config/prisma.js';
import { ENV } from './config/env.js';
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
  const requestedFile = req.path.replace(/^\//, '');

  // Se o arquivo foi requisitado direto na raiz de /uploads/ (ex: URLs antigas), tenta localizar nas subpastas
  if (requestedFile && !requestedFile.includes('/')) {
    const perfilCandidate = path.join(UPLOAD_PERFIL_DIR, requestedFile);
    if (fs.existsSync(perfilCandidate)) {
      return res.sendFile(perfilCandidate);
    }
    const vendasCandidate = path.join(UPLOAD_VENDAS_DIR, requestedFile);
    if (fs.existsSync(vendasCandidate)) {
      return res.sendFile(vendasCandidate);
    }
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

// Suporte e retrocompatibilidade para requisições legadas em /assets/:file
app.get('/assets/:filename', (req, res, next) => {
  const filename = req.params.filename;
  const subpastas = ['logos', 'icons', 'placeholders', 'banners', 'categorias', 'backgrounds', 'usuarios', 'produtos'];
  for (const sub of subpastas) {
    const candidate = path.join(FRONTEND_DIR, 'assets', sub, filename);
    if (fs.existsSync(candidate)) {
      return res.sendFile(candidate);
    }
  }
  next();
});

// Suporte e retrocompatibilidade para requisições legadas em /css/:file
app.get('/css/:filename', (req, res, next) => {
  const filename = req.params.filename;
  // Verifica em core/
  const candidateCore = path.join(FRONTEND_DIR, 'css', 'core', filename);
  if (fs.existsSync(candidateCore)) {
    return res.sendFile(candidateCore);
  }
  // Verifica em pages/*/
  const pageDirs = ['admin', 'favoritos', 'home', 'mensagens', 'notificacoes', 'perfil', 'produtos', 'vender'];
  for (const sub of pageDirs) {
    const candidate = path.join(FRONTEND_DIR, 'css', 'pages', sub, filename);
    if (fs.existsSync(candidate)) {
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
    version: 'v1',
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


// Servir arquivos estáticos da pasta frontend (CSS, JS, Assets, Pages)
app.use(express.static(FRONTEND_DIR));
app.use('/frontend', express.static(FRONTEND_DIR));

// Rotas amigáveis (Clean URLs) para as páginas do Marketplace
const PAGE_ROUTES = [
  { route: '/', file: 'index.html' },
  { route: '/login', file: 'index.html' },
  { route: '/home', file: 'pages/home/home.html' },
  { route: '/cadastro', file: 'pages/auth/cadastro.html' },
  { route: '/categoria', file: 'pages/produtos/categoria.html' },
  { route: '/produto', file: 'pages/produtos/produto.html' },
  { route: '/vender', file: 'pages/vender/vender.html' },
  { route: '/meus-anuncios', file: 'pages/vender/meus-anuncios.html' },
  { route: '/conversas', file: 'pages/mensagens/conversas.html' },
  { route: '/chat', file: 'pages/mensagens/conversas.html' },
  { route: '/perfil', file: 'pages/perfil/perfil.html' },
  { route: '/vendedor', file: 'pages/perfil/vendedor.html' },
  { route: '/configuracoes', file: 'pages/perfil/configuracoes.html' },
  { route: '/favoritos', file: 'pages/favoritos/favoritos.html' },
  { route: '/notificacoes', file: 'pages/notificacoes/notificacoes.html' },
  { route: '/painel', file: 'pages/admin/painel.html' },
  { route: '/status', file: 'pages/admin/painel.html' },
];

PAGE_ROUTES.forEach(({ route, file }) => {
  app.get(route, (req, res) => {
    res.sendFile(path.join(FRONTEND_DIR, file));
  });
});

// Tratamento de rota não encontrada (404)
app.use((req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({
      success: false,
      message: `A rota '${req.originalUrl}' não foi encontrada na API do Itaim Vende.`,
    });
  }
  const notFoundPage = path.join(FRONTEND_DIR, '404.html');
  if (fs.existsSync(notFoundPage)) {
    return res.status(404).sendFile(notFoundPage);
  }
  res.status(404).send('Página não encontrada.');
});

// Middleware Global de Erros
app.use(errorHandler);

// Inicialização do Servidor
const PORT = ENV.PORT;
const server = app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 Servidor Itaim Vende Ativo na Porta: ${PORT}`);
  console.log(`🌐 Healthcheck: http://localhost:${PORT}/api/v1/health`);
  console.log(`📦 Produtos:    http://localhost:${PORT}/api/v1/products`);
  console.log(`🔒 Modo:        ${ENV.NODE_ENV}`);
  console.log(`=========================================`);
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

