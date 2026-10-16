/**
 * ITAIM VENDE - BUILDER DE COMPONENTES GLOBAIS
 * Arquivo: scripts/build-componentes.js
 * 
 * Este script une os submódulos da pasta:
 *   frontend/js/core/componentes-globais/
 * no arquivo de distribuição unificado:
 *   frontend/js/core/componentes-globais.js
 * 
 * Uso:
 *   node scripts/build-componentes.js
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const COMP_DIR = path.join(ROOT_DIR, 'frontend', 'js', 'core', 'componentes-globais');
const OUTPUT_FILE = path.join(ROOT_DIR, 'frontend', 'js', 'core', 'componentes-globais.js');

const MODULES = [
    { name: 'ROTEAMENTO E IDENTIFICAÇÃO', file: 'componentes-rotas.js' },
    { name: 'CABEÇALHO GLOBAL (HEADER)', file: 'componentes-header.js' },
    { name: 'MENU LATERAL (DRAWER)', file: 'componentes-drawer.js' },
    { name: 'SINCRONIZADOR DE BADGES', file: 'componentes-badges.js' },
    { name: 'CATÁLOGO E CARDS DE PRODUTOS', file: 'componentes-produtos.js' },
    { name: 'ORQUESTRADOR GLOBAL (INDEX)', file: 'index.js' }
];

function build() {
    console.log('[BUILD] Iniciando compilação dos componentes globais...');

    const header = `/**
 * ITAIM VENDE - COMPONENTES GLOBAIS E CATÁLOGO UNIFICADO (BUNDLE UNIFICADO)
 * Arquivo: frontend/js/core/componentes-globais.js
 * 
 * ATENÇÃO:
 * Este arquivo unifica de forma profissional os módulos da pasta:
 *   frontend/js/core/componentes-globais/
 * 
 * Módulos integrantes:
 *   - componentes-globais/componentes-rotas.js: Identificação e roteamento
 *   - componentes-globais/componentes-header.js: Navbar e barra de pesquisa
 *   - componentes-globais/componentes-drawer.js: Menu lateral deslizante
 *   - componentes-globais/componentes-badges.js: Badges dinâmicos
 *   - componentes-globais/componentes-produtos.js: Cards e formatação (ItaimProdutos)
 *   - componentes-globais/index.js: Orquestrador da API global window.ItaimComponentes
 * 
 * Para editar funcionalidades isoladas de forma modular, edite diretamente os
 * arquivos na pasta componentes-globais/ e execute 'npm run build:componentes'.
 */

`;

    let bundleContent = header;

    for (const mod of MODULES) {
        const filePath = path.join(COMP_DIR, mod.file);
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
    console.log(`[SUCESSO] frontend/js/core/componentes-globais.js gerado com sucesso! Tamanho: ${(stats.size / 1024).toFixed(2)} KB`);
}

build();
