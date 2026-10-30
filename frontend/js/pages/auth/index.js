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

    function inicializarTodos() {
        try {
            if (window.ItaimAuthNavegacao && typeof window.ItaimAuthNavegacao.inicializar === 'function') {
                window.ItaimAuthNavegacao.inicializar();
            }
        } catch (e) {
            console.warn('[Auth] Erro ao inicializar ItaimAuthNavegacao:', e);
        }

        try {
            if (window.ItaimAuthSenhaToggle && typeof window.ItaimAuthSenhaToggle.inicializar === 'function') {
                window.ItaimAuthSenhaToggle.inicializar();
            }
        } catch (e) {
            console.warn('[Auth] Erro ao inicializar ItaimAuthSenhaToggle:', e);
        }

        try {
            if (window.ItaimAuthMascarasCep && typeof window.ItaimAuthMascarasCep.inicializar === 'function') {
                window.ItaimAuthMascarasCep.inicializar();
            }
        } catch (e) {
            console.warn('[Auth] Erro ao inicializar ItaimAuthMascarasCep:', e);
        }

        try {
            if (window.ItaimAuthLogin && typeof window.ItaimAuthLogin.inicializar === 'function') {
                window.ItaimAuthLogin.inicializar();
            }
        } catch (e) {
            console.warn('[Auth] Erro ao inicializar ItaimAuthLogin:', e);
        }

        try {
            if (window.ItaimAuthCadastroWizard && typeof window.ItaimAuthCadastroWizard.inicializar === 'function') {
                window.ItaimAuthCadastroWizard.inicializar();
            }
        } catch (e) {
            console.warn('[Auth] Erro ao inicializar ItaimAuthCadastroWizard:', e);
        }

        try {
            if (window.ItaimAuthCadastroDireto && typeof window.ItaimAuthCadastroDireto.inicializar === 'function') {
                window.ItaimAuthCadastroDireto.inicializar();
            }
        } catch (e) {
            console.warn('[Auth] Erro ao inicializar ItaimAuthCadastroDireto:', e);
        }

        try {
            if (window.ItaimAuthRecuperar && typeof window.ItaimAuthRecuperar.inicializar === 'function') {
                window.ItaimAuthRecuperar.inicializar();
            }
        } catch (e) {
            console.warn('[Auth] Erro ao inicializar ItaimAuthRecuperar:', e);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inicializarTodos);
    } else {
        setTimeout(inicializarTodos, 50);
    }

    window.addEventListener('load', () => {
        setTimeout(inicializarTodos, 80);
    });

})();
