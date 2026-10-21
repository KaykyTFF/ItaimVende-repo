/**
 * ITAIM VENDE - PONTO DE ENTRADA DA PÁGINA DE DETALHES DO PRODUTO
 * Arquivo: frontend/js/pages/produtos/produto.js
 * 
 * Carrega dinamicamente os submódulos da pasta produto/:
 * - produto-dados.js: Carregamento do anúncio, skeleton e especificações
 * - produto-galeria.js: Carrossel, zoom, miniaturas e fotos em alta resolução
 * - produto-vendedor.js: Sidebar com perfil, avatar real e dados do vendedor
 * - produto-acoes.js: Chat integrado, botão WhatsApp, favoritos e toasts
 * - produto-denuncias.js: Modal de denúncias, motivos e histórico de tickets
 * - index.js: Orquestrador do ciclo de vida da página
 */

(function () {
    'use strict';

    const scriptAtual = document.currentScript;
    const base = scriptAtual ? scriptAtual.src.substring(0, scriptAtual.src.lastIndexOf('/') + 1) : '';

    const arquivos = [
        'produto/produto-dados.js',
        'produto/produto-galeria.js',
        'produto/produto-vendedor.js',
        'produto/produto-acoes.js',
        'produto/produto-denuncias.js',
        'produto/index.js'
    ];

    arquivos.forEach(function (arquivo) {
        document.write('<script src="' + base + arquivo + '"><\/script>');
    });

    document.addEventListener('DOMContentLoaded', async () => {
        if (window.ItaimProdutoOrquestrador?.inicializar) {
            await window.ItaimProdutoOrquestrador.inicializar();
        }
    });

})();
