/**
 * ITAIM VENDE - TEMPLATE DO CABEÇALHO GLOBAL (COMPONENTES HEADER)
 * Arquivo: frontend/js/core/componentes-globais/componentes-header.js
 * 
 * Responsabilidades:
 * - Geração padronizada da barra superior de navegação (Navbar)
 * - Integração do menu hambúrguer, logo oficial, barra de busca centralizada
 * - Botões de ação direta (Vender, Meus Anúncios, Conversas, Notificações e Perfil)
 */

(function() {
    'use strict';

    function getRotas() {
        return window.ItaimComponentesRotas || {
            urlPara: (d) => d,
            assetPara: (a) => a,
            obterIdentificadorPagina: () => 'home'
        };
    }

    /**
     * Gera o código HTML completo e responsivo do Header Principal
     */
    function gerarHeaderHTML() {
        const { urlPara, assetPara, obterIdentificadorPagina } = getRotas();
        const pagina = obterIdentificadorPagina();

        return `
        <div class="header-container">
            <!-- Esquerda: Menu Hambúrguer + Logo Oficial -->
            <div class="header-left">
                <button type="button" class="btn-menu-hamburguer" id="btn-abrir-drawer" aria-label="Abrir menu de navegação" title="Menu principal">
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                </button>
                <a href="${urlPara('home')}" class="header-logo-link" title="Itaim Vende - Página Inicial">
                    <img src="${assetPara('assets/logos/header1-logo.png')}" alt="Itaim Vende" class="header-logo-img">
                </a>
            </div>

            <!-- Centro: Barra de Busca Global -->
            <div class="header-search">
                <form class="search-form" id="form-busca" role="search" autocomplete="off">
                    <input type="search" class="search-input" id="campo-busca" placeholder="Buscar produtos, marcas e muito mais..." aria-label="Buscar produtos">
                    <button type="submit" class="btn-submit-search" id="btn-submit-busca" aria-label="Pesquisar" title="Pesquisar">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </button>
                </form>
            </div>

            <!-- Direita: Ações Rápidas + Botão Vender + Perfil -->
            <div class="header-right">
                <!-- Botão Entrar para usuários não logados -->
                <a href="${urlPara('login')}" class="btn-vender-destaque btn-header-entrar" id="btn-header-entrar" style="display: none;">
                    <span>Entrar</span>
                </a>

                <!-- Meus Anúncios (Desktop) -->
                <a href="${urlPara('meus-anuncios')}" class="btn-texto-header ${pagina === 'meus-anuncios' ? 'ativo' : ''}" id="btn-meus-anuncios" title="Meus Anúncios">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 11l19-9-9 19-2-8-8-2z"></path>
                    </svg>
                    <span>Meus Anúncios</span>
                </a>

                <!-- Botão Destaque Vender -->
                <a href="${urlPara('vender')}" class="btn-vender-destaque ${pagina === 'vender' ? 'ativo' : ''}" id="btn-abrir-modal-vender" title="Anunciar um produto">
                    <span>Vender</span>
                </a>

                <!-- Ícone Conversas com Contador Dinâmico -->
                <a href="${urlPara('conversas')}" class="btn-icone-header ${pagina === 'conversas' ? 'ativo-icone' : ''}" id="btn-chat" aria-label="Conversas" title="Conversas">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <span class="badge-contador-header" id="badge-conversas-header" style="display: none;">0</span>
                </a>

                <!-- Ícone Notificações com Contador Dinâmico -->
                <a href="${urlPara('notificacoes')}" class="btn-icone-header ${pagina === 'notificacoes' ? 'ativo-icone' : ''}" id="btn-notificacoes" aria-label="Notificações" title="Notificações">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                    <span class="badge-contador-header" id="badge-notificacoes-header" style="display: none;">0</span>
                </a>

                <!-- Mobile: Ícone Meus Anúncios -->
                <a href="${urlPara('meus-anuncios')}" class="btn-icone-header btn-meus-anuncios-mobile ${pagina === 'meus-anuncios' ? 'ativo-icone' : ''}" id="btn-meus-anuncios-mobile" aria-label="Meus Anúncios" title="Meus Anúncios">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 11l19-9-9 19-2-8-8-2z"></path>
                    </svg>
                </a>

                <!-- Avatar do Perfil (leva direto a perfil.html) -->
                <div class="perfil-wrapper">
                    <a href="${urlPara('perfil')}" class="btn-avatar-header" id="btn-avatar-dropdown" aria-label="Meu Perfil" title="Ir para Meu Perfil">
                        <img src="${assetPara('assets/icons/icon-user.png')}" alt="Foto de perfil" class="avatar-img" id="img-avatar-user">
                    </a>
                </div>
            </div>
        </div>
        `;
    }

    window.ItaimComponentesHeader = {
        gerarHeaderHTML
    };

})();
