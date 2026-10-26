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

// Fallback oficial do banco de dados (Supabase PostgreSQL do Itaim Vende)
const DEFAULT_DATABASE_URL =
  'postgresql://postgres.pgrznndtajjzpwqgtkkz:Itaim111251125@aws-1-ca-central-1.pooler.supabase.com:5432/postgres';

if (!process.env.DATABASE_URL || process.env.DATABASE_URL.trim() === '') {
  process.env.DATABASE_URL = DEFAULT_DATABASE_URL;
}

// Configuração do Supabase Storage e Otimização de Imagens
const DEFAULT_SUPABASE_URL = 'https://pgrznndtajjzpwqgtkkz.supabase.co';

export const ENV = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET || 'itaim_vende_super_segredo_jwt_auth_chave_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '2h',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',

  // Supabase Storage & Armazenamento em Nuvem
  SUPABASE_URL: process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL,
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
};

