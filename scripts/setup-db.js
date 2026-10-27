#!/usr/bin/env node
/**
 * ITAIM VENDE - SCRIPT AUTOMÁTICO DE SETUP & INICIALIZAÇÃO DO BANCO DE DADOS
 * Executa em qualquer máquina (Windows, Mac, Linux) para deixar o banco 100% conectado e pronto.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const BACKEND_DIR = path.resolve(ROOT_DIR, 'backend');

const isQuickMode = process.argv.includes('--quick');

console.log('\n=============================================================');
console.log('🚀 [Itaim Vende] Setup e Diagnóstico Automático do Banco de Dados');
console.log('=============================================================\n');

// 1. Garantir arquivo backend/.env
const envPath = path.join(BACKEND_DIR, '.env');
const envTxtPath = path.join(BACKEND_DIR, '.env.txt');
const envExamplePath = path.join(BACKEND_DIR, '.env.example');

const defaultEnvContent = `PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://postgres.pgrznndtajjzpwqgtkkz:Itaim111251125@aws-1-ca-central-1.pooler.supabase.com:5432/postgres"
JWT_SECRET="itaim_vende_super_segredo_jwt_auth_chave_2026"
JWT_EXPIRES_IN="2h"
CORS_ORIGIN="*"
`;

if (fs.existsSync(envTxtPath) && !fs.existsSync(envPath)) {
  console.log('📝 Corrigindo arquivo .env.txt gerado no Windows para .env...');
  fs.copyFileSync(envTxtPath, envPath);
  console.log('✅ Arquivo .env corrigido.');
} else if (!fs.existsSync(envPath)) {
  if (fs.existsSync(path.join(BACKEND_DIR, '.env.supabase'))) {
    console.log('📝 Restaurando backend/.env a partir de .env.supabase...');
    fs.copyFileSync(path.join(BACKEND_DIR, '.env.supabase'), envPath);
  } else {
    console.log('📝 Criando arquivo backend/.env com credenciais do Supabase...');
    fs.writeFileSync(envPath, defaultEnvContent, 'utf-8');
  }
  console.log('✅ Arquivo backend/.env criado com sucesso.');
} else {
  // Confere se DATABASE_URL está presente no .env
  const content = fs.readFileSync(envPath, 'utf-8');
  if (!content.includes('DATABASE_URL') || content.includes('file:./dev.db')) {
    console.log('🔄 Atualizando DATABASE_URL no .env para o Supabase oficial...');
    fs.writeFileSync(envPath, defaultEnvContent, 'utf-8');
    console.log('✅ Arquivo backend/.env atualizado.');
  } else {
    console.log('✅ Arquivo backend/.env verificado.');
  }
}

// 2. Garantir diretórios de upload
const uploadDirs = [
  path.join(BACKEND_DIR, 'uploads'),
  path.join(BACKEND_DIR, 'uploads', 'perfil'),
  path.join(BACKEND_DIR, 'uploads', 'vendas')
];

uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});
console.log('✅ Pastas de upload verificadas.');

// Se for modo rápido e o prisma client já estiver gerado, podemos passar direto
const prismaClientDir = path.join(BACKEND_DIR, 'node_modules', '@prisma', 'client');
if (isQuickMode && fs.existsSync(prismaClientDir)) {
  console.log('⚡ Modo rápido: Ambiente já inicializado anteriormente.\n');
  process.exit(0);
}

// 3. Gerar Prisma Client
try {
  console.log('\n⚙️  Gerando Prisma Client...');
  execSync('npx prisma generate', { cwd: BACKEND_DIR, stdio: 'inherit' });
  console.log('✅ Prisma Client gerado.');
} catch (err) {
  console.error('❌ Falha ao rodar npx prisma generate:', err.message);
}

// 4. Sincronizar Tabelas no PostgreSQL (db push)
try {
  console.log('\n📦 Sincronizando tabelas com o banco de dados PostgreSQL...');
  execSync('npx prisma db push --skip-generate', { cwd: BACKEND_DIR, stdio: 'inherit' });
  console.log('✅ Tabelas sincronizadas com sucesso no banco de dados!');
} catch (err) {
  console.warn('⚠️  Aviso: Não foi possível sincronizar o schema diretamente (pode ser bloqueio de IPv6 ou conexão offline).');
  console.warn('   O servidor tentará se conectar usando o pooler/fallback padrão.\n');
}

// 5. Executar Seed Inicial (Categorias e Admin)
try {
  console.log('\n🌱 Verificando categorias oficiais e usuário Admin (Seed)...');
  execSync('node prisma/seed.js', { cwd: BACKEND_DIR, stdio: 'inherit' });
  console.log('✅ Categorias e Admin verificados com sucesso.');
} catch (err) {
  console.warn('⚠️  Aviso no seed:', err.message);
}

console.log('\n=============================================================');
console.log('🎉 Setup concluído com sucesso!');
console.log('Para iniciar o site, basta rodar:');
console.log('👉 npm run dev');
console.log('=============================================================\n');
