/**
 * ITAIM VENDE - BUILDER DO MÓDULO DE AUTENTICAÇÃO
 * Arquivo: scripts/build-auth.js
 * 
 * Este script une os módulos organizados da pasta:
 *   frontend/js/pages/auth/
 * no arquivo de distribuição unificado:
 *   frontend/js/pages/auth/app.js
 * 
 * Uso:
 *   node scripts/build-auth.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '..');
const AUTH_DIR = path.join(ROOT_DIR, 'frontend', 'js', 'pages', 'auth');
const OUTPUT_FILE = path.join(AUTH_DIR, 'app.js');

const MODULES = [
    { name: 'NAVEGAÇÃO ENTRE TELAS', file: 'auth-navegacao.js' },
    { name: 'VISIBILIDADE DE SENHA', file: 'auth-senha-toggle.js' },
    { name: 'CEP E MÁSCARAS DE ENTRADA', file: 'auth-mascaras-cep.js' },
    { name: 'AUTENTICAÇÃO E LOGIN', file: 'auth-login.js' },
    { name: 'WIZARD DE CADASTRO (4 ETAPAS)', file: 'auth-cadastro-wizard.js' },
    { name: 'CADASTRO DIRETO', file: 'auth-cadastro-direto.js' },
    { name: 'RECUPERAÇÃO DE SENHA E OTP', file: 'auth-recuperar.js' }
];

function build() {
    console.log('[BUILD] Iniciando compilação do módulo de autenticação...');

    const header = `/**
 * ITAIM VENDE - AUTENTICAÇÃO (BUNDLE UNIFICADO)
 * Arquivo: frontend/js/pages/auth/app.js
 * 
 * ATENÇÃO:
 * Este arquivo unifica de forma modular os componentes da pasta:
 *   frontend/js/pages/auth/
 * 
 * Módulos integrantes:
 *   - auth-navegacao.js: Alternância entre telas e hash de rota
 *   - auth-senha-toggle.js: Visibilidade de senhas com ícones de olho
 *   - auth-mascaras-cep.js: Busca ViaCEP/BrasilAPI e máscaras de entrada
 *   - auth-login.js: Validação e autenticação de login com API e fallback
 *   - auth-cadastro-wizard.js: Cadastro em 4 etapas com validação e submissão
 *   - auth-cadastro-direto.js: Formulário legado/direto de cadastro
 *   - auth-recuperar.js: Fluxo de recuperação de senha com código OTP
 * 
 * Para editar funcionalidades isoladas, edite os arquivos específicos
 * e execute 'npm run build:auth'.
 */

`;

    let bundleContent = header;

    for (const mod of MODULES) {
        const filePath = path.join(AUTH_DIR, mod.file);
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
    bundleContent += `// INICIALIZADOR GLOBAL DE AUTENTICAÇÃO\n`;
    bundleContent += `// ==========================================================================\n\n`;
    bundleContent += `document.addEventListener('DOMContentLoaded', () => {\n`;
    bundleContent += `    if (window.ItaimAuthNavegacao) window.ItaimAuthNavegacao.inicializar();\n`;
    bundleContent += `    if (window.ItaimAuthSenhaToggle) window.ItaimAuthSenhaToggle.inicializar();\n`;
    bundleContent += `    if (window.ItaimAuthMascarasCep) window.ItaimAuthMascarasCep.inicializar();\n`;
    bundleContent += `    if (window.ItaimAuthLogin) window.ItaimAuthLogin.inicializar();\n`;
    bundleContent += `    if (window.ItaimAuthCadastroWizard) window.ItaimAuthCadastroWizard.inicializar();\n`;
    bundleContent += `    if (window.ItaimAuthCadastroDireto) window.ItaimAuthCadastroDireto.inicializar();\n`;
    bundleContent += `    if (window.ItaimAuthRecuperar) window.ItaimAuthRecuperar.inicializar();\n`;
    bundleContent += `});\n`;

    fs.writeFileSync(OUTPUT_FILE, bundleContent, 'utf-8');
    const stats = fs.statSync(OUTPUT_FILE);
    console.log(`[SUCESSO] frontend/js/pages/auth/app.js gerado com sucesso! Tamanho: ${(stats.size / 1024).toFixed(2)} KB`);
}

build();
