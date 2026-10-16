/**
 * ITAIM VENDE - PONTO DE ENTRADA DO MÓDULO DE DADOS DE PRODUTOS
 * Arquivo: frontend/js/core/produtos-dados/index.js
 * 
 * Carrega automaticamente e de forma síncrona os dados iniciais de produtos:
 * - produtos-iniciais.js
 */

(function() {
    'use strict';

    const scriptAtual = document.currentScript;
    const base = scriptAtual ? scriptAtual.src.substring(0, scriptAtual.src.lastIndexOf('/') + 1) : '';

    const arquivos = [
        'produtos-iniciais.js'
    ];

    arquivos.forEach(function(arquivo) {
        document.write('<script src="' + base + arquivo + '"><\/script>');
    });

})();
