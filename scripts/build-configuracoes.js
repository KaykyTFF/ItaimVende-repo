/**
 * ITAIM VENDE - BUILDER DO MÓDULO DE CONFIGURAÇÕES
 * Arquivo: scripts/build-configuracoes.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '..');
const CFG_DIR = path.join(ROOT_DIR, 'frontend', 'js', 'pages', 'perfil', 'configuracoes');
const OUTPUT_FILE = path.join(ROOT_DIR, 'frontend', 'js', 'pages', 'perfil', 'configuracoes.bundle.js');

const MODULES = [
    { name: 'UTILITÁRIOS E PERSISTÊNCIA', file: 'config-utils.js' },
    { name: 'NAVEGAÇÃO POR ABAS', file: 'config-navegacao.js' },
    { name: 'ZONA DE RISCO E MODAL', file: 'config-risco.js' },
    { name: 'DADOS DA CONTA E AVATAR', file: 'config-conta.js' },
    { name: 'SEGURANÇA E SENHA', file: 'config-seguranca.js' },
    { name: 'ENDEREÇOS E VIACEP', file: 'config-enderecos.js' },
    { name: 'PREFERÊNCIAS E INTERRUPTORES', file: 'config-preferencias.js' },
    { name: 'APARÊNCIA E TEMA', file: 'config-tema.js' },
    { name: 'ORQUESTRADOR GERAL', file: 'index.js' }
];

function build() {
    console.log('[BUILD] Iniciando compilação do módulo de configurações...');

    const header = `/**
 * ITAIM VENDE - CONFIGURAÇÕES DO USUÁRIO (BUNDLE UNIFICADO)
 * Arquivo: frontend/js/pages/perfil/configuracoes.bundle.js
 * Gerado automaticamente via: node scripts/build-configuracoes.js
 */

`;

    let bundleContent = header;

    for (const mod of MODULES) {
        const filePath = path.join(CFG_DIR, mod.file);
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
document.addEventListener('DOMContentLoaded', () => {
    if (window.ItaimConfigOrquestrador?.inicializar) {
        window.ItaimConfigOrquestrador.inicializar();
    }
});
`;

    fs.writeFileSync(OUTPUT_FILE, bundleContent, 'utf-8');
    const stats = fs.statSync(OUTPUT_FILE);
    console.log(`[SUCESSO] Bundle de configurações gerado com sucesso:`);
    console.log(`  Arquivo: ${OUTPUT_FILE}`);
    console.log(`  Tamanho: ${(stats.size / 1024).toFixed(2)} KB`);
}

build();
