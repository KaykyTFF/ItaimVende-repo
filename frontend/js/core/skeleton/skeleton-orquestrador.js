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

    function exibir(container, tipo = 'cards', qtd = 6) {
        const el = (typeof container === 'string') ? document.querySelector(container) : container;
        if (!el) return;

        switch (tipo) {
            case 'cards':
            case 'produtos':
                if (typeof Cards.renderizarCards === 'function') Cards.renderizarCards(el, qtd);
                break;
            case 'meus-anuncios':
                if (typeof Detalhes.renderizarMeusAnuncios === 'function') Detalhes.renderizarMeusAnuncios(el, qtd);
                break;
            case 'conversas':
            case 'chat':
                if (typeof Detalhes.renderizarConversas === 'function') Detalhes.renderizarConversas(el, qtd);
                break;
            case 'notificacoes':
                if (typeof Detalhes.renderizarNotificacoes === 'function') Detalhes.renderizarNotificacoes(el, qtd);
                break;
            case 'avaliacoes':
                if (typeof Detalhes.renderizarAvaliacoes === 'function') Detalhes.renderizarAvaliacoes(el, qtd);
                break;
            case 'detalhes':
            case 'produto':
                if (typeof Detalhes.obterDetalhesProdutoHtml === 'function') {
                    el.innerHTML = Detalhes.obterDetalhesProdutoHtml();
                }
                break;
            default:
                if (typeof Cards.renderizarCards === 'function') Cards.renderizarCards(el, qtd);
        }
    }

    const ItaimSkeleton = {
        obterCardsHtml: Cards.obterCardsHtml || (() => ''),
        renderizarCards: Cards.renderizarCards || (() => {}),
        obterDetalhesProdutoHtml: Detalhes.obterDetalhesProdutoHtml || (() => ''),
        obterMeusAnunciosHtml: Detalhes.obterMeusAnunciosHtml || (() => ''),
        renderizarMeusAnuncios: Detalhes.renderizarMeusAnuncios || (() => {}),
        obterConversasHtml: Detalhes.obterConversasHtml || (() => ''),
        renderizarConversas: Detalhes.renderizarConversas || (() => {}),
        obterNotificacoesHtml: Detalhes.obterNotificacoesHtml || (() => ''),
        renderizarNotificacoes: Detalhes.renderizarNotificacoes || (() => {}),
        obterAvaliacoesHtml: Detalhes.obterAvaliacoesHtml || (() => ''),
        renderizarAvaliacoes: Detalhes.renderizarAvaliacoes || (() => {}),
        exibir
    };

    window.ItaimSkeleton = ItaimSkeleton;

})();
