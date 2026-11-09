/**
 * ITAIM VENDE - PRODUTO: ORQUESTRADOR GERAL
 * Arquivo: frontend/js/pages/produtos/produto/index.js
 */

(function () {
    'use strict';

    async function inicializar() {
        if (!window.ItaimProdutoDados?.carregarProduto) return;

        const produto = await window.ItaimProdutoDados.carregarProduto();
        if (!produto) return;

        if (window.ItaimProdutoGaleria?.inicializar) {
            window.ItaimProdutoGaleria.inicializar();
        }
        if (window.ItaimProdutoVendedor?.inicializar) {
            window.ItaimProdutoVendedor.inicializar();
        }
        if (window.ItaimProdutoAcoes?.inicializar) {
            window.ItaimProdutoAcoes.inicializar();
        }
        if (window.ItaimProdutoDenuncias?.inicializar) {
            window.ItaimProdutoDenuncias.inicializar();
        }
        if (window.ItaimProdutoRelacionados?.inicializar) {
            window.ItaimProdutoRelacionados.inicializar(produto);
        }
    }

    window.ItaimProdutoOrquestrador = {
        inicializar
    };
})();
