/**
 * ITAIM VENDE - BUILDER DO MÓDULO DE PERFIL DO USUÁRIO
 * Arquivo: scripts/build-perfil.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '..');
const PERFIL_DIR = path.join(ROOT_DIR, 'frontend', 'js', 'pages', 'perfil', 'perfil');
const OUTPUT_FILE = path.join(ROOT_DIR, 'frontend', 'js', 'pages', 'perfil', 'perfil.bundle.js');

const MODULES = [
    { name: 'UTILITÁRIOS E PARÂMETROS', file: 'perfil-utils.js' },
    { name: 'DADOS DO PERFIL E BANNER', file: 'perfil-dados.js' },
    { name: 'UPLOAD DE FOTO DE PERFIL', file: 'perfil-avatar-upload.js' },
    { name: 'VITRINE DE ANÚNCIOS', file: 'perfil-anuncios.js' },
    { name: 'AVALIAÇÕES E REPUTAÇÃO', file: 'perfil-avaliacoes.js' },
    { name: 'ORQUESTRADOR GERAL', file: 'index.js' }
];

function build() {
    console.log('[BUILD] Iniciando compilação do módulo de perfil...');

    const header = `/**
 * ITAIM VENDE - MEU PERFIL (BUNDLE UNIFICADO)
 * Arquivo: frontend/js/pages/perfil/perfil.bundle.js
 * Gerado automaticamente via: node scripts/build-perfil.js
 */

`;

    let bundleContent = header;

    for (const mod of MODULES) {
        const filePath = path.join(PERFIL_DIR, mod.file);
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
    if (window.ItaimPerfilOrquestrador?.inicializar) {
        await window.ItaimPerfilOrquestrador.inicializar();
    }
});
`;

    fs.writeFileSync(OUTPUT_FILE, bundleContent, 'utf-8');
    const stats = fs.statSync(OUTPUT_FILE);
    console.log(`[SUCESSO] Bundle de perfil gerado com sucesso:`);
    console.log(`  Arquivo: ${OUTPUT_FILE}`);
    console.log(`  Tamanho: ${(stats.size / 1024).toFixed(2)} KB`);
}

build();
