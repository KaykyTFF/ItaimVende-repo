/**
 * ITAIM VENDE - PONTO DE ENTRADA DO MÓDULO DE AUTENTICAÇÃO
 * Arquivo: frontend/js/pages/auth/index.js
 * 
 * Carrega dinamicamente todos os submódulos da pasta auth:
 * - auth-navegacao.js
 * - auth-senha-toggle.js
 * - auth-mascaras-cep.js
 * - auth-login.js
 * - auth-cadastro-wizard.js
 * - auth-cadastro-direto.js
 * - auth-recuperar.js
 */

(function () {
    'use strict';

    const scriptAtual = document.currentScript;
    const base = scriptAtual ? scriptAtual.src.substring(0, scriptAtual.src.lastIndexOf('/') + 1) : '';

    const arquivos = [
        'auth-navegacao.js',
        'auth-senha-toggle.js',
        'auth-mascaras-cep.js',
        'auth-login.js',
        'auth-cadastro-wizard.js',
        'auth-cadastro-direto.js',
        'auth-recuperar.js'
    ];

    arquivos.forEach(function (arquivo) {
        document.write('<script src="' + base + arquivo + '"><\/script>');
    });

    document.addEventListener('DOMContentLoaded', () => {
        if (window.ItaimAuthNavegacao) window.ItaimAuthNavegacao.inicializar();
        if (window.ItaimAuthSenhaToggle) window.ItaimAuthSenhaToggle.inicializar();
        if (window.ItaimAuthMascarasCep) window.ItaimAuthMascarasCep.inicializar();
        if (window.ItaimAuthLogin) window.ItaimAuthLogin.inicializar();
        if (window.ItaimAuthCadastroWizard) window.ItaimAuthCadastroWizard.inicializar();
        if (window.ItaimAuthCadastroDireto) window.ItaimAuthCadastroDireto.inicializar();
        if (window.ItaimAuthRecuperar) window.ItaimAuthRecuperar.inicializar();
    });

})();
