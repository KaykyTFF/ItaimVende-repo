/**
 * ITAIM VENDE - BUILDER DO MÓDULO DE CHAT & MENSAGENS
 * Arquivo: scripts/build-conversas.js
 * 
 * Este script une os módulos organizados da pasta:
 *   frontend/js/pages/mensagens/
 * no arquivo de distribuição unificado:
 *   frontend/js/pages/mensagens/conversas.js
 * 
 * Uso:
 *   node scripts/build-conversas.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '..');
const MENSAGENS_DIR = path.join(ROOT_DIR, 'frontend', 'js', 'pages', 'mensagens');
const OUTPUT_FILE = path.join(MENSAGENS_DIR, 'conversas.bundle.js');

const MODULES = [
    { name: 'UTILITÁRIOS & FORMATAÇÃO', file: 'conversas-utils.js' },
    { name: 'ESTADO & TELAS DE VISITA', file: 'conversas-estado.js' },
    { name: 'LISTA DE CONVERSAS (COLUNA 1)', file: 'conversas-lista.js' },
    { name: 'FEED DE MENSAGENS & PRODUTO (COLUNAS 2 E 3)', file: 'conversas-feed.js' },
    { name: 'ENVIO, FOTOS E PROPOSTAS', file: 'conversas-envio.js' },
    { name: 'AÇÕES, BLOQUEIO E POLLING', file: 'conversas-acoes.js' }
];

function build() {
    console.log('[BUILD] Iniciando compilação do módulo de conversas e chat...');

    const header = `/**
 * ITAIM VENDE - CENTRAL DE MENSAGENS E CHAT (BUNDLE UNIFICADO)
 * Arquivo: frontend/js/pages/mensagens/conversas.js
 * 
 * ATENÇÃO:
 * Este arquivo unifica de forma modular os componentes da pasta:
 *   frontend/js/pages/mensagens/
 * 
 * Módulos integrantes:
 *   - conversas-utils.js: Formatações, horários, fotos e cache local
 *   - conversas-estado.js: Mapeamento de DOM, dados de sessão e telas vazias
 *   - conversas-lista.js: Lista lateral de conversas e busca
 *   - conversas-feed.js: Painel de mensagens, balões e detalhes do produto
 *   - conversas-envio.js: Envio de texto, anexos, lightbox e propostas
 *   - conversas-acoes.js: Bloqueio, polling em tempo real e rotas
 * 
 * Para editar funcionalidades isoladas, edite os arquivos específicos
 * e execute 'npm run build:conversas'.
 */

`;

    let bundleContent = header;

    for (const mod of MODULES) {
        const filePath = path.join(MENSAGENS_DIR, mod.file);
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
    bundleContent += `// INICIALIZADOR GLOBAL DO CHAT\n`;
    bundleContent += `// ==========================================================================\n\n`;
    bundleContent += `document.addEventListener('DOMContentLoaded', async () => {\n`;
    bundleContent += `    if (window.ItaimChatEstado) window.ItaimChatEstado.inicializar();\n`;
    bundleContent += `    if (!window.ItaimChatEstado?.token) {\n`;
    bundleContent += `        if (window.ItaimChatEstado) window.ItaimChatEstado.exibirEstadoNaoAutenticado();\n`;
    bundleContent += `        return;\n`;
    bundleContent += `    }\n`;
    bundleContent += `    if (window.ItaimChatLista) window.ItaimChatLista.inicializar();\n`;
    bundleContent += `    if (window.ItaimChatEnvio) window.ItaimChatEnvio.inicializar();\n`;
    bundleContent += `    if (window.ItaimChatAcoes) {\n`;
    bundleContent += `        window.ItaimChatAcoes.inicializarEventos();\n`;
    bundleContent += `        await window.ItaimChatAcoes.processarInicializacaoRotas();\n`;
    bundleContent += `    }\n`;
    bundleContent += `});\n`;

    fs.writeFileSync(OUTPUT_FILE, bundleContent, 'utf-8');
    const stats = fs.statSync(OUTPUT_FILE);
    console.log(`[SUCESSO] frontend/js/pages/mensagens/conversas.bundle.js gerado com sucesso! Tamanho: ${(stats.size / 1024).toFixed(2)} KB`);
}

build();
