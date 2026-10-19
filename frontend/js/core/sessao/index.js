/**
 * ITAIM VENDE - PONTO DE ENTRADA DO MÓDULO DE SESSÃO
 * Arquivo: frontend/js/core/sessao/index.js
 * 
 * Carrega automaticamente e de forma síncrona todos os submódulos de sessão:
 * - sessao-auth.js
 * - sessao-produtos.js
 * - sessao-notificacoes.js
 * - sessao-avaliacoes.js
 * - sessao-ui.js
 * - sessao-orquestrador.js
 */

(function() {
    'use strict';

    const scriptAtual = document.currentScript;
    const base = scriptAtual ? scriptAtual.src.substring(0, scriptAtual.src.lastIndexOf('/') + 1) : '';

    const arquivos = [
        'sessao-tema.js',
        'sessao-auth.js',
        'sessao-produtos.js',
        'sessao-notificacoes.js',
        'sessao-avaliacoes.js',
        'sessao-ui.js',
        'sessao-orquestrador.js'
    ];

    arquivos.forEach(function(arquivo) {
        document.write('<script src="' + base + arquivo + '"><\/script>');
    });

})();
