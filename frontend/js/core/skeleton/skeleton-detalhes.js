/**
 * ITAIM VENDE - SKELETON SCREENS DE PÁGINAS DE DETALHES E ANÚNCIOS
 * Arquivo: frontend/js/core/skeleton/skeleton-detalhes.js
 * 
 * Responsabilidades:
 * - Placeholders shimmer para página de detalhes do produto (carrossel, vendedor)
 * - Placeholders shimmer para o painel gerencial de Meus Anúncios
 */

(function() {
    'use strict';

    function obterDetalhesProdutoHtml() {
        return `
            <div class="skeleton-produto-wrapper" id="skeleton-produto-placeholder" aria-hidden="true">
                <div class="skeleton-produto-grid">
                    <div class="skeleton-produto-card-topo">
                        <div class="skeleton-grid-carrossel">
                            <div class="skeleton-galeria-area">
                                <div class="skeleton-foto-destaque"></div>
                                <div class="skeleton-miniaturas-fila">
                                    <div class="skeleton-miniatura-item"></div>
                                    <div class="skeleton-miniatura-item"></div>
                                    <div class="skeleton-miniatura-item"></div>
                                    <div class="skeleton-miniatura-item"></div>
                                </div>
                            </div>
                            <div class="skeleton-detalhes-info">
                                <div class="skeleton-selo-topo"></div>
                                <div class="skeleton-titulo-grande-1"></div>
                                <div class="skeleton-titulo-grande-2"></div>
                                <div class="skeleton-localizacao-bar"></div>
                                <div class="skeleton-preco-destaque"></div>
                                <div class="skeleton-especificacoes-linha">
                                    <div class="skeleton-especificacao-pill"></div>
                                    <div class="skeleton-especificacao-pill"></div>
                                </div>
                                <div class="skeleton-descricao-curta">
                                    <div class="skeleton-line" style="width: 100%; height: 14px; border-radius: 4px;"></div>
                                    <div class="skeleton-line" style="width: 90%; height: 14px; border-radius: 4px;"></div>
                                    <div class="skeleton-line" style="width: 75%; height: 14px; border-radius: 4px;"></div>
                                </div>
                                <div class="skeleton-botao-whatsapp"></div>
                                <div class="skeleton-botao-chat"></div>
                            </div>
                        </div>
                    </div>
                    <div class="skeleton-card-vendedor">
                        <div class="skeleton-vendedor-topo">
                            <div class="skeleton-avatar-vendedor"></div>
                            <div class="skeleton-vendedor-info-linhas">
                                <div class="skeleton-line" style="width: 120px; height: 16px; border-radius: 6px;"></div>
                                <div class="skeleton-line" style="width: 80px; height: 13px; border-radius: 4px;"></div>
                            </div>
                        </div>
                        <div class="skeleton-vendedor-stats">
                            <div class="skeleton-stat-box"></div>
                            <div class="skeleton-stat-box"></div>
                        </div>
                        <div class="skeleton-line" style="width: 100%; height: 42px; border-radius: 12px;"></div>
                    </div>
                </div>
            </div>
        `;
    }

    function obterMeusAnunciosHtml(qtd = 4) {
        let html = '<div class="skeleton-meus-anuncios-container" aria-hidden="true">';
        for (let i = 0; i < qtd; i++) {
            html += `
                <div class="skeleton-meu-anuncio-card">
                    <div class="skeleton-meu-anuncio-thumb"></div>
                    <div class="skeleton-meu-anuncio-info">
                        <div class="skeleton-line" style="width: 60%; height: 18px; border-radius: 6px;"></div>
                        <div class="skeleton-line" style="width: 30%; height: 16px; border-radius: 6px;"></div>
                        <div class="skeleton-line" style="width: 40%; height: 13px; border-radius: 4px;"></div>
                    </div>
                    <div class="skeleton-meu-anuncio-acoes">
                        <div class="skeleton-acao-btn"></div>
                        <div class="skeleton-acao-btn"></div>
                        <div class="skeleton-acao-btn"></div>
                    </div>
                </div>
            `;
        }
        html += '</div>';
        return html;
    }

    function renderizarMeusAnuncios(container, qtd = 4) {
        const el = (typeof container === 'string') ? document.querySelector(container) : container;
        if (el) {
            el.innerHTML = obterMeusAnunciosHtml(qtd);
        }
    }

    window.ItaimSkeletonDetalhes = {
        obterDetalhesProdutoHtml,
        obterMeusAnunciosHtml,
        renderizarMeusAnuncios
    };

})();
