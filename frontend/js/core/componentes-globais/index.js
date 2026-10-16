/**
 * ITAIM VENDE - PONTO DE ENTRADA DOS COMPONENTES GLOBAIS
 * Arquivo: frontend/js/core/componentes-globais/index.js
 * 
 * Carrega automaticamente e de forma síncrona todos os submódulos de componentes:
 * - componentes-rotas.js
 * - componentes-header.js
 * - componentes-drawer.js
 * - componentes-badges.js
 * - componentes-produtos.js
 * - componentes-orquestrador.js
 */

(function() {
    'use strict';

    const scriptAtual = document.currentScript;
    const base = scriptAtual ? scriptAtual.src.substring(0, scriptAtual.src.lastIndexOf('/') + 1) : '';

    const arquivos = [
        'componentes-rotas.js',
        'componentes-header.js',
        'componentes-drawer.js',
        'componentes-badges.js',
        'componentes-produtos.js',
        'componentes-orquestrador.js'
    ];

    arquivos.forEach(function(arquivo) {
        document.write('<script src="' + base + arquivo + '"><\/script>');
    });

})();
