/**
 * ITAIM VENDE - BUILDER DO PAINEL DE CONTROLE & OBSERVABILIDADE
 * Arquivo: scripts/build-admin.js
 * 
 * Este script une os módulos organizados da pasta:
 *   frontend/js/pages/admin/
 * no arquivo de distribuição unificado:
 *   frontend/js/pages/admin/painel.js
 * 
 * Uso:
 *   node scripts/build-admin.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '..');
const ADMIN_DIR = path.join(ROOT_DIR, 'frontend', 'js', 'pages', 'admin');
const OUTPUT_FILE = path.join(ADMIN_DIR, 'painel.bundle.js');

const MODULES = [
    { name: 'UTILITÁRIOS, ELEMENTOS E LOGS', file: 'painel-utils-logs.js' },
    { name: 'STATUS DO SISTEMA E TELEMETRIA', file: 'painel-status-telemetria.js' },
    { name: 'TÚNEL CLOUDFLARE E ACESSO REMOTO', file: 'painel-tunnel.js' },
    { name: 'BANCO DE DADOS, STORAGE E CONSOLE API', file: 'painel-database-storage.js' },
    { name: 'MODERAÇÃO RÁPIDA DE ANÚNCIOS E USUÁRIOS', file: 'painel-moderacao.js' },
    { name: 'MATRIZ DE TESTES DE INTEGRIDADE', file: 'painel-testes.js' },
    { name: 'BINDING DE EVENTOS E CICLO DE VIDA', file: 'painel-eventos.js' }
];

function build() {
    console.log('[BUILD] Iniciando compilação do módulo do painel administrativo...');

    const header = `/**
 * ITAIM VENDE - PAINEL DE CONTROLE & OBSERVABILIDADE (BUNDLE UNIFICADO)
 * Arquivo: frontend/js/pages/admin/painel.js
 * 
 * ATENÇÃO:
 * Este arquivo unifica de forma modular os componentes da pasta:
 *   frontend/js/pages/admin/
 * 
 * Módulos integrantes:
 *   - painel-utils-logs.js: Constantes, mapeamento de DOM, toasts, logs e relatório
 *   - painel-status-telemetria.js: Métricas, hero e gráfico Sparkline em Canvas
 *   - painel-tunnel.js: Conexão pública Cloudflare Quick Tunnel e QR Code
 *   - painel-database-storage.js: Auditoria de arquivos órfãos, seed demo e API playground
 *   - painel-moderacao.js: Moderação ágil de produtos e usuários
 *   - painel-testes.js: Matriz automatizada de testes de integridade das rotas
 *   - painel-eventos.js: Binding de cliques, atalhos, auto-refresh e ciclo de vida
 * 
 * Para editar funcionalidades isoladas, edite os arquivos específicos
 * e execute 'npm run build:admin'.
 */

`;

    let bundleContent = header;

    for (const mod of MODULES) {
        const filePath = path.join(ADMIN_DIR, mod.file);
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

    // Inicialização unificada no DOMContentLoaded
    bundleContent += `// ==========================================================================\n`;
    bundleContent += `// INICIALIZADOR GLOBAL DO PAINEL ADMIN\n`;
    bundleContent += `// ==========================================================================\n\n`;
    bundleContent += `document.addEventListener('DOMContentLoaded', () => {\n`;
    bundleContent += `    if (window.ItaimAdminEventos?.iniciarPainel) {\n`;
    bundleContent += `        window.ItaimAdminEventos.iniciarPainel();\n`;
    bundleContent += `    }\n`;
    bundleContent += `});\n`;

    fs.writeFileSync(OUTPUT_FILE, bundleContent, 'utf-8');
    const stats = fs.statSync(OUTPUT_FILE);
    console.log(`[SUCESSO] frontend/js/pages/admin/painel.bundle.js gerado com sucesso! Tamanho: ${(stats.size / 1024).toFixed(2)} KB`);
}

build();
