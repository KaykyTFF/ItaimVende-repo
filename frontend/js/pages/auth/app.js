/**
 * ITAIM VENDE - PONTO DE ENTRADA DO MÓDULO DE AUTENTICAÇÃO
 * Arquivo: frontend/js/pages/auth/app.js
 * 
 * Carrega dinamicamente todos os submódulos da pasta auth:
 * - auth-navegacao.js: Troca de abas (Login, Cadastro, Recuperação)
 * - auth-senha-toggle.js: Visibilidade de senha e feedback de força
 * - auth-mascaras-cep.js: Máscaras de CPF, CEP, telefone e preenchimento automático ViaCEP
 * - auth-login.js: Autenticação direta, validação e redirecionamento pós-login
 * - auth-cadastro-wizard.js: Fluxo de cadastro em 3 etapas com validações
 * - auth-cadastro-direto.js: Cadastro rápido com fallback de dados mockados
 * - auth-recuperar.js: Envio de link de recuperação de senha por e-mail
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
        if (window.ItaimAuthNavegacao && typeof window.ItaimAuthNavegacao.inicializar === 'function') {
            window.ItaimAuthNavegacao.inicializar();
        }
        if (window.ItaimAuthSenhaToggle && typeof window.ItaimAuthSenhaToggle.inicializar === 'function') {
            window.ItaimAuthSenhaToggle.inicializar();
        }
        if (window.ItaimAuthMascarasCep && typeof window.ItaimAuthMascarasCep.inicializar === 'function') {
            window.ItaimAuthMascarasCep.inicializar();
        }
        if (window.ItaimAuthLogin && typeof window.ItaimAuthLogin.inicializar === 'function') {
            window.ItaimAuthLogin.inicializar();
        }
        if (window.ItaimAuthCadastroWizard && typeof window.ItaimAuthCadastroWizard.inicializar === 'function') {
            window.ItaimAuthCadastroWizard.inicializar();
        }
        if (window.ItaimAuthCadastroDireto && typeof window.ItaimAuthCadastroDireto.inicializar === 'function') {
            window.ItaimAuthCadastroDireto.inicializar();
        }
        if (window.ItaimAuthRecuperar && typeof window.ItaimAuthRecuperar.inicializar === 'function') {
            window.ItaimAuthRecuperar.inicializar();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inicializarTodos);
    } else {
        setTimeout(inicializarTodos, 50);
    }

    // Executa também após o carregamento completo dos scripts injetados
    window.addEventListener('load', () => {
        setTimeout(inicializarTodos, 80);
    });

})();
