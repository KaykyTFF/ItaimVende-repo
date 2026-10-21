/**
 * ITAIM VENDE - PONTO DE ENTRADA DO CLIENTE DE API
 * Arquivo: frontend/js/core/api/index.js
 * 
 * Carrega automaticamente e de forma síncrona todos os submódulos da API:
 * - api-core.js
 * - api-auth.js
 * - api-produtos.js
 * - api-chat.js
 * - api-upload.js
 * - api-social.js
 * - api-sistema.js
 * - api-orquestrador.js
 */

(function() {
    'use strict';

    const scriptAtual = document.currentScript;
    const base = scriptAtual ? scriptAtual.src.substring(0, scriptAtual.src.lastIndexOf('/') + 1) : '';

    const arquivos = [
        'api-core.js',
        'api-auth.js',
        'api-produtos.js',
        'api-chat.js',
        'api-upload.js',
        'api-social.js',
        'api-enderecos.js',
        'api-notificacoes.js',
        'api-reviews.js',
        'api-sistema.js',
        'api-orquestrador.js'

    ];

    arquivos.forEach(function(arquivo) {
        document.write('<script src="' + base + arquivo + '"><\/script>');
    });

})();
