import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
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
import { UPLOAD_DIR, UPLOAD_PERFIL_DIR, UPLOAD_VENDAS_DIR } from './config/upload.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FRONTEND_DIR = path.resolve(__dirname, '../../frontend');

export const SERVER_BOOT_ID = `boot_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

const app = express();

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

// Rota de Diagnóstico / Healthcheck
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    platform: 'Itaim Vende API',
    bootId: SERVER_BOOT_ID,
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: ENV.NODE_ENV,
  });
});

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
  const candidate1 = path.resolve(process.cwd(), 'frontend/assets/produto-placeholder.svg');
  const candidate2 = path.resolve(process.cwd(), '../frontend/assets/produto-placeholder.svg');
  const placeholderPath = fs.existsSync(candidate1) ? candidate1 : (fs.existsSync(candidate2) ? candidate2 : null);
  if (placeholderPath) {
    res.setHeader('Content-Type', 'image/svg+xml');
    return res.sendFile(placeholderPath);
  }
  res.status(404).json({ success: false, message: 'Imagem não encontrada.' });
});

// Montagem das Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/reports', reportRoutes);

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
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 Servidor Itaim Vende Ativo na Porta: ${PORT}`);
  console.log(`🌐 Healthcheck: http://localhost:${PORT}/api/health`);
  console.log(`📦 Produtos:    http://localhost:${PORT}/api/products`);
  console.log(`🔒 Modo:        ${ENV.NODE_ENV}`);
  console.log(`=========================================`);
});

export default app;
