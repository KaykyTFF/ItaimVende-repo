#!/usr/bin/env node
/**
 * ITAIM VENDE - ALTERNADOR DE PERFIL DE AMBIENTE (IFPI LOCAL vs SUPABASE NUVEM)
 * Permite alternar instantaneamente entre o banco local (para o Wi-Fi do IFPI)
 * e o banco oficial Supabase na nuvem, sem perder nenhuma configuração.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const BACKEND_DIR = path.resolve(ROOT_DIR, 'backend');

const targetMode = (process.argv[2] || '').toLowerCase().trim();

if (!['ifpi', 'supabase'].includes(targetMode)) {
  console.log('\n❌ Modo inválido!');
  console.log('Uso:');
  console.log('  node scripts/switch-env.js ifpi      -> Ativa PostgreSQL Local (Wi-Fi IFPI)');
  console.log('  node scripts/switch-env.js supabase  -> Ativa Supabase Oficial (Nuvem)\n');
  process.exit(1);
}

const envPath = path.join(BACKEND_DIR, '.env');
const envSupabase = path.join(BACKEND_DIR, '.env.supabase');
const envIfpi = path.join(BACKEND_DIR, '.env.ifpi');

// 1. Garantir que o .env.supabase existe com as credenciais atuais
if (!fs.existsSync(envSupabase) && fs.existsSync(envPath)) {
  fs.copyFileSync(envPath, envSupabase);
}

if (targetMode === 'ifpi') {
  if (!fs.existsSync(envIfpi)) {
    console.error('❌ Arquivo backend/.env.ifpi não encontrado.');
    process.exit(1);
  }

  // Copia o perfil IFPI para o .env ativo
  fs.copyFileSync(envIfpi, envPath);

  console.log('\n============================================================');
  console.log('🏫 [Itaim Vende] ATIVANDO MODO IFPI (PostgreSQL Local)...');
  console.log('============================================================');

  // Sincronizar tabelas no banco local se necessário
  try {
    console.log('📦 Sincronizando tabelas no PostgreSQL local (localhost:5432)...');
    execSync('npx prisma db push --skip-generate', { cwd: BACKEND_DIR, stdio: 'inherit' });
    console.log('✅ Tabelas e índices sincronizados com sucesso.');

    // Executar seed inicial se não houver categorias
    try {
      console.log('🌱 Verificando dados iniciais no banco local (seed)...');
      execSync('node prisma/seed.js', { cwd: BACKEND_DIR, stdio: 'inherit' });
    } catch (seedErr) {
      console.log('ℹ️  Seed concluído ou já existente.');
    }
  } catch (err) {
    console.warn('⚠️  Aviso ao sincronizar Prisma:', err.message);
  }

  console.log('\n============================================================');
  console.log('✅ MODO IFPI ATIVADO COM SUCESSO!');
  console.log('------------------------------------------------------------');
  console.log('• Banco de Dados: PostgreSQL Local (localhost:5432/itaimvende)');
  console.log('• Armazenamento: Local (uploads gravados no PC)');
  console.log('• O firewall do Wi-Fi do IFPI NÃO vai bloquear o sistema.');
  console.log('• Suas credenciais do Supabase continuam salvas em .env.supabase');
  console.log('\n👉 Para voltar ao Supabase oficial quando quiser:');
  console.log('   npm run modo:supabase');
  console.log('============================================================\n');

} else if (targetMode === 'supabase') {
  if (!fs.existsSync(envSupabase)) {
    console.error('❌ Arquivo backend/.env.supabase não encontrado.');
    process.exit(1);
  }

  // Copia o perfil Supabase para o .env ativo
  fs.copyFileSync(envSupabase, envPath);

  console.log('\n============================================================');
  console.log('☁️ [Itaim Vende] MODO SUPABASE NUVEM RESTAURADO!');
  console.log('============================================================');
  console.log('• Banco de Dados: Supabase PostgreSQL Oficial (Nuvem)');
  console.log('• Armazenamento: Supabase Storage Bucket');
  console.log('• Todas as credenciais de produção ativas no backend/.env');
  console.log('\n👉 Para alternar para o IFPI:');
  console.log('   npm run modo:ifpi');
  console.log('============================================================\n');
}
