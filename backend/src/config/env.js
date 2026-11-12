import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Caminhos suportados para o .env
const envBackend = path.resolve(__dirname, '../../.env');
const envTxt = path.resolve(__dirname, '../../.env.txt');
const envRoot = path.resolve(__dirname, '../../../../.env');

if (fs.existsSync(envBackend)) {
  dotenv.config({ path: envBackend });
} else if (fs.existsSync(envTxt)) {
  // Corrige automaticamente arquivo criado pelo Bloco de Notas do Windows (.env.txt)
  try {
    fs.copyFileSync(envTxt, envBackend);
  } catch (e) {}
  dotenv.config({ path: envTxt });
} else if (fs.existsSync(envRoot)) {
  dotenv.config({ path: envRoot });
} else {
  dotenv.config();
}

// Validação e carregamento de variáveis de ambiente obrigatórias
if (!process.env.DATABASE_URL || process.env.DATABASE_URL.trim() === '') {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('❌ [ERRO DE SEGURANÇA]: DATABASE_URL obrigatória não foi encontrada no .env.');
  }
  console.warn('⚠️ [Config] DATABASE_URL não definida no .env. Certifique-se de configurar o arquivo .env.');
}

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim() === '') {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('❌ [ERRO DE SEGURANÇA]: JWT_SECRET obrigatória não foi definida no .env.');
  }
  console.warn('⚠️ [Config] JWT_SECRET não configurada no .env. Usando chave de desenvolvimento.');
}

const isProduction = process.env.NODE_ENV === 'production';

// Em produção, a chave JWT deve ser obrigatoriamente definida no arquivo .env
if (isProduction && !process.env.JWT_SECRET) {
  throw new Error('CONFIGURAÇÃO CRÍTICA: A variável JWT_SECRET deve ser definida no arquivo .env para o ambiente de produção.');
}

export const ENV = {
  PORT: Number(process.env.PORT) || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || '',
<<<<<<< HEAD
  JWT_SECRET: process.env.JWT_SECRET || 'dev-local-jwt-secret-inseguro-apenas-para-testes',
=======
  JWT_SECRET: process.env.JWT_SECRET || 'dev_jwt_key_local_only',
>>>>>>> c94509fc3dc36ceb8bac555d12702d318c886a1e
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '2h',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',

  // Supabase Storage & Armazenamento em Nuvem
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_KEY: process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '',
  SUPABASE_BUCKET: process.env.SUPABASE_BUCKET || 'marketplace',
  STORAGE_PROVIDER: process.env.STORAGE_PROVIDER || (process.env.SUPABASE_KEY ? 'supabase' : 'local'),

  // Otimização e Compressão de Fotos com Sharp
  IMAGE_OPTIMIZATION_ENABLED: process.env.IMAGE_OPTIMIZATION_ENABLED !== 'false',
  IMAGE_MAX_WIDTH: parseInt(process.env.IMAGE_MAX_WIDTH || '1600', 10),
  IMAGE_QUALITY: parseInt(process.env.IMAGE_QUALITY || '82', 10),

  // Serviço de E-mail (Resend, Nodemailer/SMTP e Fallback de Desenvolvimento)
  RESEND_API_KEY: process.env.RESEND_API_KEY || '',
  EMAIL_FROM: process.env.EMAIL_FROM || 'Itaim Vende <onboarding@resend.dev>',
  APP_URL: process.env.APP_URL || process.env.FRONTEND_URL || 'http://localhost:3000',
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  SMTP_SECURE: process.env.SMTP_SECURE === 'true',

  // Google OAuth / Identity Services
  GOOGLE_CLIENT_ID: (process.env.GOOGLE_CLIENT_ID || '573964082793-kor90ei9qbgnuh13i97crosid73uikh5.apps.googleusercontent.com').trim().replace(/^["']|["']$/g, ''),
};

