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

    function obterConversasHtml(qtd = 5) {
        let html = '<div class="skeleton-conversas-wrapper" aria-hidden="true">';
        for (let i = 0; i < qtd; i++) {
            html += `
                <div class="skeleton-conversa-item">
                    <div class="skeleton-conversa-avatar"></div>
                    <div class="skeleton-conversa-info">
                        <div class="skeleton-conversa-linha-topo">
                            <div class="skeleton-conversa-nome"></div>
                            <div class="skeleton-conversa-tempo"></div>
                        </div>
                        <div class="skeleton-conversa-msg"></div>
                    </div>
                </div>
            `;
        }
        html += '</div>';
        return html;
    }

    function renderizarConversas(container, qtd = 5) {
        const el = (typeof container === 'string') ? document.querySelector(container) : container;
        if (el) {
            el.innerHTML = obterConversasHtml(qtd);
        }
    }

    function obterNotificacoesHtml(qtd = 5) {
        let html = '<div class="skeleton-notificacoes-wrapper" aria-hidden="true">';
        for (let i = 0; i < qtd; i++) {
            html += `
                <div class="skeleton-notificacao-card">
                    <div class="skeleton-notificacao-icone"></div>
                    <div class="skeleton-notificacao-info">
                        <div class="skeleton-notificacao-titulo"></div>
                        <div class="skeleton-notificacao-texto"></div>
                        <div class="skeleton-notificacao-data"></div>
                    </div>
                </div>
            `;
        }
        html += '</div>';
        return html;
    }

    function renderizarNotificacoes(container, qtd = 5) {
        const el = (typeof container === 'string') ? document.querySelector(container) : container;
        if (el) {
            el.innerHTML = obterNotificacoesHtml(qtd);
        }
    }

    function obterAvaliacoesHtml(qtd = 3) {
        let html = '<div class="skeleton-avaliacoes-wrapper" aria-hidden="true">';
        for (let i = 0; i < qtd; i++) {
            html += `
                <div class="skeleton-avaliacao-item">
                    <div class="skeleton-avaliacao-topo">
                        <div class="skeleton-avaliacao-autor-row">
                            <div class="skeleton-avaliacao-avatar"></div>
                            <div class="skeleton-avaliacao-autor-linhas">
                                <div class="skeleton-avaliacao-nome"></div>
                                <div class="skeleton-avaliacao-data"></div>
                            </div>
                        </div>
                        <div class="skeleton-avaliacao-estrelas"></div>
                    </div>
                    <div class="skeleton-avaliacao-comentario"></div>
                </div>
            `;
        }
        html += '</div>';
        return html;
    }

    function renderizarAvaliacoes(container, qtd = 3) {
        const el = (typeof container === 'string') ? document.querySelector(container) : container;
        if (el) {
            el.innerHTML = obterAvaliacoesHtml(qtd);
        }
    }

    window.ItaimSkeletonDetalhes = {
        obterDetalhesProdutoHtml,
        obterMeusAnunciosHtml,
        renderizarMeusAnuncios,
        obterConversasHtml,
        renderizarConversas,
        obterNotificacoesHtml,
        renderizarNotificacoes,
        obterAvaliacoesHtml,
        renderizarAvaliacoes
    };

})();

