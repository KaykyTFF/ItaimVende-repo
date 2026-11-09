#!/usr/bin/env node
/**
 * ITAIM VENDE - ATIVADOR DE MODO FRONT-END DESENVOLVEDOR (SEM BANCO DE DADOS)
 * Permite que desenvolvedores acessem o sistema instantaneamente sem precisar de banco de dados,
 * sem exibir botões invasivos na interface de login ou cabeçalho.
 */

import { exec, spawn } from 'child_process';
import http from 'http';

const param = (process.argv[2] || 'dev').toLowerCase().trim();
const isOff = ['off', 'desativar', 'sair', 'false'].includes(param);
const isAdmin = ['admin', 'adm', 'administrador'].includes(param);

const PORTA_FRONT = 5500;
let urlDestino = `http://localhost:${PORTA_FRONT}/?dev=true`;

if (isOff) {
  urlDestino = `http://localhost:${PORTA_FRONT}/?dev=off`;
} else if (isAdmin) {
  urlDestino = `http://localhost:${PORTA_FRONT}/?dev=true&perfil=admin`;
}

function abrirNavegador(url) {
  const plataforma = process.platform;
  let comando = '';
  if (plataforma === 'win32') {
    comando = `start "" "${url}"`;
  } else if (plataforma === 'darwin') {
    comando = `open "${url}"`;
  } else {
    comando = `xdg-open "${url}"`;
  }

  exec(comando, (err) => {
    if (err) {
      console.log(`🔗 Copie e cole no seu navegador: ${url}`);
    }
  });
}

function checarServidorAtivo(porta) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${porta}`, () => resolve(true));
    req.on('error', () => resolve(false));
    req.setTimeout(800, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function executar() {
  console.log('\n========================================================================');
  console.log('⚡ ITAIM VENDE - MODO FRONT-END DEV (SEM BANCO DE DADOS)');
  console.log('========================================================================');

  if (isOff) {
    console.log('🔒 Status       : Desativando Modo Dev...');
    console.log(`🔗 URL          : ${urlDestino}`);
    abrirNavegador(urlDestino);
    console.log('✅ O Modo Dev foi desativado. Sessão limpa com sucesso!\n');
    return;
  }

  const rotulo = isAdmin ? 'Administrador Local (Admin)' : 'Desenvolvedor Front-End (Dev)';
  console.log(`👤 Perfil       : ${rotulo}`);
  console.log(`🔗 URL Direta   : ${urlDestino}`);
  console.log('------------------------------------------------------------------------');

  const servidorRodando = await checarServidorAtivo(PORTA_FRONT);

  if (!servidorRodando) {
    console.log(`🚀 Iniciando servidor front-end na porta ${PORTA_FRONT}...`);
    const proc = spawn('npx', ['-y', 'serve', 'frontend', '-p', String(PORTA_FRONT)], {
      shell: true,
      detached: true,
      stdio: 'ignore'
    });
    proc.unref();
    // Aguarda 1.2s para o servidor subir
    await new Promise((r) => setTimeout(r, 1200));
  } else {
    console.log(`✅ Servidor front-end já ativo na porta ${PORTA_FRONT}.`);
  }

  console.log('🌐 Abrindo o navegador com login local automático...');
  abrirNavegador(urlDestino);

  console.log('========================================================================');
  console.log('💡 DICAS DE USO PELO TERMINAL:');
  console.log('   npm run modo:sem-bd          -> Entra como Dev Front-End');
  console.log('   npm run modo:sem-bd:admin    -> Entra como Administrador');
  console.log('   npm run modo:sem-bd:off      -> Desativa o modo sem banco');
  console.log('========================================================================\n');
}

executar();

