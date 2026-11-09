/**
 * ITAIM VENDE - PONTO DE ENTRADA DO MÓDULO DE ROTAS
 * Arquivo: frontend/js/core/rotas/index.js
 * 
 * Carrega automaticamente e de forma síncrona todos os submódulos de rotas:
 * - rotas-mapa.js
 * - rotas-orquestrador.js
 */

(function() {
    'use strict';

    const scriptAtual = document.currentScript;
    const base = scriptAtual ? scriptAtual.src.substring(0, scriptAtual.src.lastIndexOf('/') + 1) : '';

    const arquivos = [
        'rotas-mapa.js',
        'rotas-orquestrador.js'
    ];

    arquivos.forEach(function(arquivo) {
        document.write('<script src="' + base + arquivo + '"><\/script>');
    });

})();
