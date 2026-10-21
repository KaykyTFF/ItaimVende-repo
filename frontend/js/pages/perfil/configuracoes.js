/**
 * ITAIM VENDE - PONTO DE ENTRADA DAS CONFIGURAÇÕES DO USUÁRIO
 * Arquivo: frontend/js/pages/perfil/configuracoes.js
 * 
 * Carrega dinamicamente os submódulos da pasta configuracoes/:
 * - config-utils.js: Utilitários, toasts, máscaras e armazenamento local
 * - config-navegacao.js: Navegação por abas com sincronização de hash na URL
 * - config-risco.js: Modal central de confirmação e ações de risco (suspensão/exclusão)
 * - config-conta.js: Dados cadastrais, avatar e sincronização com API
 * - config-seguranca.js: Medidor de força de senha e alteração segura
 * - config-enderecos.js: Múltiplos endereços com busca automática ViaCEP
 * - config-preferencias.js: Interruptores de notificações e privacidade
 * - config-tema.js: Alternância de temas Claro e Escuro
 * - index.js: Orquestrador do ciclo de vida
 */

(function () {
    'use strict';

    const scriptAtual = document.currentScript;
    const base = scriptAtual ? scriptAtual.src.substring(0, scriptAtual.src.lastIndexOf('/') + 1) : '';

    const arquivos = [
        'configuracoes/config-utils.js',
        'configuracoes/config-navegacao.js',
        'configuracoes/config-risco.js',
        'configuracoes/config-conta.js',
        'configuracoes/config-seguranca.js',
        'configuracoes/config-enderecos.js',
        'configuracoes/config-preferencias.js',
        'configuracoes/config-tema.js',
        'configuracoes/index.js'
    ];

    arquivos.forEach(function (arquivo) {
        document.write('<script src="' + base + arquivo + '"><\/script>');
    });

    document.addEventListener('DOMContentLoaded', () => {
        if (window.ItaimConfigOrquestrador?.inicializar) {
            window.ItaimConfigOrquestrador.inicializar();
        }
    });

})();
