/**
 * ITAIM VENDE - PONTO DE ENTRADA DO MÓDULO DE CATEGORIAS
 * Arquivo: frontend/js/core/categorias/index.js
 * 
 * Carrega automaticamente e de forma síncrona todos os submódulos de categorias:
 * - categorias-lista.js
 * - categorias-utils.js
 */

(function() {
    'use strict';

    const scriptAtual = document.currentScript;
    const base = scriptAtual ? scriptAtual.src.substring(0, scriptAtual.src.lastIndexOf('/') + 1) : '';

    const arquivos = [
        'categorias-lista.js',
        'categorias-utils.js'
    ];

    arquivos.forEach(function(arquivo) {
        document.write('<script src="' + base + arquivo + '"><\/script>');
    });

})();
