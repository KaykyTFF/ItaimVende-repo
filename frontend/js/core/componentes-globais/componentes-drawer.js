/**
 * ITAIM VENDE - TEMPLATE DO MENU LATERAL DESLIZANTE (COMPONENTES DRAWER)
 * Arquivo: frontend/js/core/componentes-globais/componentes-drawer.js
 * 
 * Responsabilidades:
 * - Geração do menu lateral deslizante (Drawer) móvel e desktop
 * - Card de perfil do usuário logado
 * - Links de navegação com destaques ativos
 * - Acordeão de categorias colapsável
 * - Atalhos para painel de controle, configurações e encerramento de sessão
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
     * Gera o código HTML completo do Drawer Lateral
     */
    function gerarDrawerHTML() {
        const { urlPara, assetPara, obterIdentificadorPagina } = getRotas();
        const pagina = obterIdentificadorPagina();

        return `
        <aside class="drawer-menu" aria-label="Menu principal">
            <div class="drawer-header">
                <img src="${assetPara('assets/logos/header1-logo.png')}" alt="Itaim Vende" class="drawer-logo">
                <button type="button" class="drawer-close" id="btn-fechar-drawer" aria-label="Fechar menu">&times;</button>
            </div>

            <!-- Card do Usuário Logado -->
            <a href="${urlPara('perfil')}" class="drawer-user-card" id="drawer-user-card" title="Acessar Meu Perfil">
                <div class="drawer-user-avatar-wrap">
                    <img src="${assetPara('assets/icons/icon-user.png')}" alt="Foto de perfil" class="drawer-user-avatar" id="drawer-user-avatar">
                </div>
                <div class="drawer-user-info">
                    <span class="drawer-user-nome" id="drawer-user-name">Usuário</span>
                    <span class="drawer-user-sub">Ver meu perfil &rarr;</span>
                </div>
            </a>

            <!-- Navegação Principal -->
            <nav class="drawer-nav">
                <a href="${urlPara('home')}" class="drawer-link ${pagina === 'home' ? 'ativo' : ''}" id="drawer-link-home">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
                    Início
                </a>
                <a href="${urlPara('perfil')}" class="drawer-link ${pagina === 'perfil' ? 'ativo' : ''}" id="drawer-link-perfil">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    Meu Perfil
                </a>
                <a href="${urlPara('meus-anuncios')}" class="drawer-link ${pagina === 'meus-anuncios' ? 'ativo' : ''}" id="drawer-link-anuncios">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 11l19-9-9 19-2-8-8-2z"></path></svg>
                    Meus Anúncios
                </a>
                <a href="${urlPara('favoritos')}" class="drawer-link ${pagina === 'favoritos' ? 'ativo' : ''}" id="drawer-link-favoritos">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                    Meus Favoritos
                </a>
                <a href="${urlPara('conversas')}" class="drawer-link ${pagina === 'conversas' ? 'ativo' : ''}" id="drawer-link-chat">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    Conversas
                </a>
                <a href="${urlPara('vender')}" class="drawer-link ${pagina === 'vender' ? 'ativo' : ''}" id="drawer-link-vender">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    Vender Produto
                </a>
                <a href="${urlPara('notificacoes')}" class="drawer-link ${pagina === 'notificacoes' ? 'ativo' : ''}" id="drawer-link-notificacoes">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                    Notificações
                </a>

                <!-- Acordeão de Categorias Retrátil -->
                <div class="drawer-secao-divisor"></div>
                <button type="button" class="drawer-accordion-btn" id="btn-toggle-categorias" aria-expanded="false">
                    <span class="drawer-accordion-label">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="3" width="7" height="7"></rect>
                            <rect x="14" y="3" width="7" height="7"></rect>
                            <rect x="14" y="14" width="7" height="7"></rect>
                            <rect x="3" y="14" width="7" height="7"></rect>
                        </svg>
                        <span>Categorias</span>
                    </span>
                    <svg class="chevron-accordion" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </button>
                <div class="drawer-categorias-conteudo" id="drawer-categorias-conteudo">
                    <a href="${urlPara('categoria', 'cat=Eletrônicos')}" class="drawer-sublink">Eletrônicos</a>
                    <a href="${urlPara('categoria', 'cat=Decoração')}" class="drawer-sublink">Decoração</a>
                    <a href="${urlPara('categoria', 'cat=Móveis')}" class="drawer-sublink">Móveis</a>
                    <a href="${urlPara('categoria', 'cat=Moda')}" class="drawer-sublink">Moda & Vestuário</a>
                    <a href="${urlPara('categoria', 'cat=Infantil')}" class="drawer-sublink">Infantil & Bebês</a>
                    <a href="${urlPara('categoria', 'cat=Esportes')}" class="drawer-sublink">Esportes & Lazer</a>
                    <a href="${urlPara('categoria', 'cat=Hobbies')}" class="drawer-sublink">Hobbies & Games</a>
                    <a href="${urlPara('categoria', 'cat=Serviços')}" class="drawer-sublink">Serviços</a>
                </div>

                <div class="drawer-secao-divisor"></div>
                <a href="${urlPara('painel')}" class="drawer-link ${pagina === 'painel' ? 'ativo' : ''}" id="drawer-link-painel">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                        <line x1="8" y1="21" x2="16" y2="21"></line>
                        <line x1="12" y1="17" x2="12" y2="21"></line>
                    </svg>
                    Painel de Controle
                </a>
                <a href="${urlPara('configuracoes')}" class="drawer-link ${pagina === 'configuracoes' ? 'ativo' : ''}" id="drawer-link-configuracoes">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0 1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                    </svg>
                    Configurações
                </a>
                <a href="${urlPara('index')}" class="drawer-link item-sair">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    Sair
                </a>
            </nav>
        </aside>
        `;
    }

    window.ItaimComponentesDrawer = {
        gerarDrawerHTML
    };

})();
