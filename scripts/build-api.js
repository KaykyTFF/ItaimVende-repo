/**
 * ITAIM VENDE - BUILDER DO CLIENTE DE API
 * Arquivo: scripts/build-api.js
 * 
 * Este script une os submódulos da pasta:
 *   frontend/js/core/api/
 * no arquivo de distribuição unificado:
 *   frontend/js/core/api.js
 * 
 * Uso:
 *   node scripts/build-api.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '..');
const API_DIR = path.join(ROOT_DIR, 'frontend', 'js', 'core', 'api');
const OUTPUT_FILE = path.join(ROOT_DIR, 'frontend', 'js', 'core', 'api.js');

const MODULES = [
    { name: 'CORE HTTP & CLIENTE', file: 'api-core.js' },
    { name: 'AUTENTICAÇÃO & PERFIL', file: 'api-auth.js' },
    { name: 'PRODUTOS & VITRINE', file: 'api-produtos.js' },
    { name: 'CHAT & MENSAGENS', file: 'api-chat.js' },
    { name: 'UPLOAD MULTIPART', file: 'api-upload.js' },
    { name: 'SOCIAL (CATEGORIAS, FAVORITOS, DENÚNCIAS)', file: 'api-social.js' },
    { name: 'SISTEMA & DIAGNÓSTICO', file: 'api-sistema.js' },
    { name: 'ORQUESTRADOR GLOBAL (INDEX)', file: 'index.js' }
];

function build() {
    console.log('[BUILD] Iniciando compilação do cliente de API...');

    const header = `/**
 * ITAIM VENDE - CLIENTE DE API CENTRAL (BUNDLE UNIFICADO)
 * Arquivo: frontend/js/core/api.js
 * 
 * ATENÇÃO:
 * Este arquivo unifica de forma profissional os módulos da pasta:
 *   frontend/js/core/api/
 * 
 * Módulos integrantes:
 *   - api/api-core.js: Cliente HTTP, tokens, headers e tratamento de imagens
 *   - api/api-auth.js: Autenticação, login, registro, perfil e sessão
 *   - api/api-produtos.js: Catálogo, anúncios e vitrine
 *   - api/api-chat.js: Mensagens, conversas e negociações
 *   - api/api-upload.js: Upload multipart (perfil, vendas, múltiplos)
 *   - api/api-social.js: Categorias, favoritos e moderação/tickets
 *   - api/api-sistema.js: Diagnósticos, painel de controle e status
 *   - api/index.js: Orquestrador da API global window.ItaimApi
 * 
 * Para editar funcionalidades isoladas de forma modular, edite diretamente os
 * arquivos na pasta api/ e execute 'npm run build:api'.
 */

`;

    let bundleContent = header;

    for (const mod of MODULES) {
        const filePath = path.join(API_DIR, mod.file);
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
    console.log(`[SUCESSO] frontend/js/core/api.js gerado com sucesso! Tamanho: ${(stats.size / 1024).toFixed(2)} KB`);
}

build();
