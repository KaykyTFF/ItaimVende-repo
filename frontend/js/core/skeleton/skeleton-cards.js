/**
 * ITAIM VENDE - SKELETON SCREENS DE CARDS DE PRODUTOS
 * Arquivo: frontend/js/core/skeleton/skeleton-cards.js
 * 
 * Responsabilidades:
 * - Geração de placeholders com efeito shimmer para cards de vitrine e listagens
 */

(function() {
    'use strict';

    function obterCardsHtml(qtd = 8) {
        let html = '';
        for (let i = 0; i < qtd; i++) {
            html += `
                <div class="skeleton-card-produto" aria-hidden="true">
                    <div class="skeleton-thumb"></div>
                    <div class="skeleton-corpo">
                        <div class="skeleton-tag"></div>
                        <div class="skeleton-titulo-linha1"></div>
                        <div class="skeleton-titulo-linha2"></div>
                        <div class="skeleton-preco-box"></div>
                        <div class="skeleton-rodape">
                            <div class="skeleton-local"></div>
                            <div class="skeleton-tempo"></div>
                        </div>
                    </div>
                </div>
            `;
        }
        return html;
    }

    function renderizarCards(container, qtd = 8) {
        const el = (typeof container === 'string') ? document.querySelector(container) : container;
        if (el) {
            el.innerHTML = obterCardsHtml(qtd);
        }
    }

    window.ItaimSkeletonCards = {
        obterCardsHtml,
        renderizarCards
    };

})();
