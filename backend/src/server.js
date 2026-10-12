import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import { ENV } from './config/env.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { requestLogger } from './middlewares/logger.middleware.js';
import { globalLimiter } from './middlewares/rateLimiter.middleware.js';
import { sanitizeInput } from './middlewares/sanitize.middleware.js';

// Rotas
import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import categoryRoutes from './routes/category.routes.js';
import orderRoutes from './routes/order.routes.js';
import chatRoutes from './routes/chat.routes.js';
import favoriteRoutes from './routes/favorite.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import reviewRoutes from './routes/review.routes.js';
import reportRoutes from './routes/report.routes.js';
import { UPLOAD_DIR } from './config/upload.js';

export const SERVER_BOOT_ID = `boot_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

const app = express();

// Middlewares de Segurança Global (permite carregar fotos estáticas no frontend)
app.use(helmet({ crossOriginResourcePolicy: false }));

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

// Servir pasta de uploads de imagens de forma estática com fallback gracioso para placeholder
app.use('/uploads', express.static(UPLOAD_DIR));
app.use('/uploads', (req, res) => {
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

// Tratamento de rota não encontrada (404)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `A rota '${req.originalUrl}' não foi encontrada na API do Itaim Vende.`,
  });
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
