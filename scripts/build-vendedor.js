/**
 * ITAIM VENDE - BUILDER DO MÓDULO DE VENDEDOR
 * Arquivo: scripts/build-vendedor.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '..');
const VENDEDOR_DIR = path.join(ROOT_DIR, 'frontend', 'js', 'pages', 'perfil', 'vendedor');
const OUTPUT_FILE = path.join(ROOT_DIR, 'frontend', 'js', 'pages', 'perfil', 'vendedor.bundle.js');

const MODULES = [
    { name: 'UTILITÁRIOS E PARÂMETROS', file: 'vendedor-utils.js' },
    { name: 'DADOS DO VENDEDOR E HEADER', file: 'vendedor-dados.js' },
    { name: 'VITRINE DE PRODUTOS', file: 'vendedor-vitrine.js' },
    { name: 'AVALIAÇÕES E COMENTÁRIOS', file: 'vendedor-avaliacoes.js' },
    { name: 'ORQUESTRADOR GERAL', file: 'index.js' }
];

function build() {
    console.log('[BUILD] Iniciando compilação do módulo do vendedor...');

    const header = `/**
 * ITAIM VENDE - PERFIL PÚBLICO DO VENDEDOR (BUNDLE UNIFICADO)
 * Arquivo: frontend/js/pages/perfil/vendedor.bundle.js
 * Gerado automaticamente via: node scripts/build-vendedor.js
 */

`;

    let bundleContent = header;

    for (const mod of MODULES) {
        const filePath = path.join(VENDEDOR_DIR, mod.file);
        if (!fs.existsSync(filePath)) {
            console.error(`[ERRO] Arquivo não encontrado: ${filePath}`);
            process.exit(1);
        }

        const content = fs.readFileSync(filePath, 'utf-8');
        bundleContent += `// ==========================================================================\n`;
        bundleContent += `// MÓDULO: ${mod.name} (${mod.file})\n`;
        bundleContent += `// ==========================================================================\n\n`;
        bundleContent += content.trim() + '\n\n';
    }

    bundleContent += `
// ==========================================================================
// INICIALIZAÇÃO AUTOMÁTICA DO BUNDLE
// ==========================================================================
document.addEventListener('DOMContentLoaded', async () => {
    if (window.ItaimVendedorOrquestrador?.inicializar) {
        await window.ItaimVendedorOrquestrador.inicializar();
    }
});
`;

    fs.writeFileSync(OUTPUT_FILE, bundleContent, 'utf-8');
    const stats = fs.statSync(OUTPUT_FILE);
    console.log(`[SUCESSO] Bundle de vendedor gerado com sucesso:`);
    console.log(`  Arquivo: ${OUTPUT_FILE}`);
    console.log(`  Tamanho: ${(stats.size / 1024).toFixed(2)} KB`);
}

build();
