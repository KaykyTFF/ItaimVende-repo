import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { ENV } from './config/env.js';
import { errorHandler } from './middlewares/error.middleware.js';

// Rotas
import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import categoryRoutes from './routes/category.routes.js';
import orderRoutes from './routes/order.routes.js';

const app = express();

// Middlewares de Segurança Global
app.use(helmet());

// Configuração do CORS (aceita requisições do frontend local ou configurado)
app.use(
  cors({
    origin: (origin, callback) => {
      // Permite requisições sem origin (como mobile apps, curl, postman) ou origens permitidas
      if (!origin || ENV.CORS_ORIGIN === '*' || ENV.CORS_ORIGIN.split(',').includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Bloqueado por política CORS'));
    },
    credentials: true,
  })
);

// Parser de JSON com limite seguro
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Rota de Diagnóstico / Healthcheck
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    platform: 'Itaim Vende API',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: ENV.NODE_ENV,
  });
});

// Montagem das Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);

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
