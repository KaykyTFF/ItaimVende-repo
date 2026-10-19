/**
 * ITAIM VENDE - BUILDER DO CORE DE SESSÃO
 * Arquivo: scripts/build-sessao.js
 * 
 * Este script une os módulos organizados da pasta:
 *   frontend/js/core/sessao/
 * no arquivo de distribuição unificado:
 *   frontend/js/core/sessao.js
 * 
 * Uso:
 *   node scripts/build-sessao.js
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const SESSAO_DIR = path.join(ROOT_DIR, 'frontend', 'js', 'core', 'sessao');
const OUTPUT_FILE = path.join(ROOT_DIR, 'frontend', 'js', 'core', 'sessao.js');

const MODULES = [
    { name: 'SISTEMA DE TEMAS', file: 'sessao-tema.js' },
    { name: 'AUTENTICAÇÃO & USUÁRIOS', file: 'sessao-auth.js' },
    { name: 'PRODUTOS & ANÚNCIOS', file: 'sessao-produtos.js' },
    { name: 'NOTIFICAÇÕES & TOASTS', file: 'sessao-notificacoes.js' },
    { name: 'AVALIAÇÕES & REPUTAÇÃO', file: 'sessao-avaliacoes.js' },
    { name: 'INTERFACE & CABEÇALHO', file: 'sessao-ui.js' },
    { name: 'ORQUESTRADOR GLOBAL (INDEX)', file: 'sessao-orquestrador.js' }
];

function build() {
    console.log('[BUILD] Iniciando compilação do core de sessão...');

    const header = `/**
 * ITAIM VENDE - CORE DE SESSÃO E IDENTIDADE DO USUÁRIO (BUNDLE UNIFICADO)
 * Arquivo: frontend/js/core/sessao.js
 * 
 * ATENÇÃO:
 * Este arquivo unifica de forma profissional os módulos da pasta:
 *   frontend/js/core/sessao/
 * 
 * Módulos integrantes:
 *   - sessao/sessao-auth.js: Gestão de contas, isolamento e autenticação
 *   - sessao/sessao-produtos.js: Catálogo, anúncios e persistência
 *   - sessao/sessao-notificacoes.js: Centro de notificações e toasts
 *   - sessao/sessao-avaliacoes.js: Sistema de avaliações (1 a 5 estrelas)
 *   - sessao/sessao-ui.js: Sincronização do cabeçalho, drawer e busca
 *   - sessao/index.js: Orquestrador da API global window.ItaimSessao
 * 
 * Para editar funcionalidades isoladas de forma modular, edite diretamente os
 * arquivos na pasta sessao/ e execute 'npm run build:sessao'.
 */

`;

    let bundleContent = header;

    for (const mod of MODULES) {
        const filePath = path.join(SESSAO_DIR, mod.file);
        if (!fs.existsSync(filePath)) {
            console.error(`[ERRO] Módulo não encontrado: ${filePath}`);
            process.exit(1);
        }

        const content = fs.readFileSync(filePath, 'utf-8');
        bundleContent += `// ==========================================================================\n`;
        bundleContent += `// MÓDULO: ${mod.name} (${mod.file})\n`;
        bundleContent += `// ==========================================================================\n\n`;
        bundleContent += content + '\n\n';
    }

    fs.writeFileSync(OUTPUT_FILE, bundleContent, 'utf-8');
    const stats = fs.statSync(OUTPUT_FILE);
    console.log(`[SUCESSO] frontend/js/core/sessao.js gerado com sucesso! Tamanho: ${(stats.size / 1024).toFixed(2)} KB`);
}

build();
