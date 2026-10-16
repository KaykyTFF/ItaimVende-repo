/**
 * ITAIM VENDE - PONTO DE ENTRADA DO AJUSTADOR DE FOTO
 * Arquivo: frontend/js/core/ajustar-foto/index.js
 * 
 * Carrega automaticamente e de forma síncrona todos os submódulos de foto:
 * - foto-estilos.js
 * - foto-canvas.js
 * - foto-modal.js
 * - foto-orquestrador.js
 */

(function() {
    'use strict';

    const scriptAtual = document.currentScript;
    const base = scriptAtual ? scriptAtual.src.substring(0, scriptAtual.src.lastIndexOf('/') + 1) : '';

    const arquivos = [
        'foto-estilos.js',
        'foto-canvas.js',
        'foto-modal.js',
        'foto-orquestrador.js'
    ];

    arquivos.forEach(function(arquivo) {
        document.write('<script src="' + base + arquivo + '"><\/script>');
    });

})();
