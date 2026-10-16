/**
 * ITAIM VENDE - UTILITÁRIO CENTRAL DE SKELETON SCREENS (ORQUESTRADOR)
 * Arquivo: frontend/js/core/skeleton/skeleton-orquestrador.js
 * 
 * Unifica todos os métodos sob window.ItaimSkeleton
 */

(function() {
    'use strict';

    const Cards = window.ItaimSkeletonCards || {};
    const Detalhes = window.ItaimSkeletonDetalhes || {};

    const ItaimSkeleton = {
        obterCardsHtml: Cards.obterCardsHtml || (() => ''),
        renderizarCards: Cards.renderizarCards || (() => {}),
        obterDetalhesProdutoHtml: Detalhes.obterDetalhesProdutoHtml || (() => ''),
        obterMeusAnunciosHtml: Detalhes.obterMeusAnunciosHtml || (() => ''),
        renderizarMeusAnuncios: Detalhes.renderizarMeusAnuncios || (() => {})
    };

    window.ItaimSkeleton = ItaimSkeleton;

})();
