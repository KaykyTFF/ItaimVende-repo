/**
 * ITAIM VENDE - BUILDER DO AJUSTADOR DE FOTO
 * Arquivo: scripts/build-foto.js
 * 
 * Este script une os submódulos da pasta:
 *   frontend/js/core/ajustar-foto/
 * no arquivo de distribuição unificado:
 *   frontend/js/core/ajustar-foto.js
 * 
 * Uso:
 *   node scripts/build-foto.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '..');
const FOTO_DIR = path.join(ROOT_DIR, 'frontend', 'js', 'core', 'ajustar-foto');
const OUTPUT_FILE = path.join(ROOT_DIR, 'frontend', 'js', 'core', 'ajustar-foto.js');

const MODULES = [
    { name: 'ESTILOS E TEMA DO MODAL', file: 'foto-estilos.js' },
    { name: 'MOTOR CANVAS E GEOMETRIA', file: 'foto-canvas.js' },
    { name: 'MODAL INTERATIVO E GESTOS', file: 'foto-modal.js' },
    { name: 'ORQUESTRADOR GLOBAL (INDEX)', file: 'index.js' }
];

function build() {
    console.log('[BUILD] Iniciando compilação do ajustador de foto...');

    const header = `/**
 * ITAIM VENDE - API DE AJUSTE DE FOTO (BUNDLE UNIFICADO)
 * Arquivo: frontend/js/core/ajustar-foto.js
 * 
 * ATENÇÃO:
 * Este arquivo unifica de forma profissional os módulos da pasta:
 *   frontend/js/core/ajustar-foto/
 * 
 * Módulos integrantes:
 *   - ajustar-foto/foto-estilos.js: Estilos e temas injetados
 *   - ajustar-foto/foto-canvas.js: Motor Canvas, zoom, pan e corte 1:1
 *   - ajustar-foto/foto-modal.js: Interface interativa, mouse e touch drag
 *   - ajustar-foto/index.js: Orquestrador da API global window.ItaimFoto
 * 
 * Para editar funcionalidades isoladas de forma modular, edite diretamente os
 * arquivos na pasta ajustar-foto/ e execute 'npm run build:foto'.
 */

`;

    let bundleContent = header;

    for (const mod of MODULES) {
        const filePath = path.join(FOTO_DIR, mod.file);
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
    console.log(`[SUCESSO] frontend/js/core/ajustar-foto.js gerado com sucesso! Tamanho: ${(stats.size / 1024).toFixed(2)} KB`);
}

build();
