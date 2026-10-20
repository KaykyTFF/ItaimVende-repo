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

export const ENV = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET || 'itaim_vende_super_segredo_jwt_auth_chave_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '2h',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
};
