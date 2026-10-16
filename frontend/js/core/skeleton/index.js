/**
 * ITAIM VENDE - PONTO DE ENTRADA DO MÓDULO SKELETON
 * Arquivo: frontend/js/core/skeleton/index.js
 * 
 * Carrega automaticamente e de forma síncrona todos os submódulos de skeleton:
 * - skeleton-cards.js
 * - skeleton-detalhes.js
 * - skeleton-orquestrador.js
 */

(function() {
    'use strict';

    const scriptAtual = document.currentScript;
    const base = scriptAtual ? scriptAtual.src.substring(0, scriptAtual.src.lastIndexOf('/') + 1) : '';

    const arquivos = [
        'skeleton-cards.js',
        'skeleton-detalhes.js',
        'skeleton-orquestrador.js'
    ];

    arquivos.forEach(function(arquivo) {
        document.write('<script src="' + base + arquivo + '"><\/script>');
    });

})();
