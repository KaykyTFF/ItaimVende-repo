/**
 * ITAIM VENDE - COMPONENTES GLOBAIS E CATÁLOGO UNIFICADO (BUNDLE UNIFICADO)
 * Arquivo: frontend/js/core/componentes-globais.js
 * 
 * ATENÇÃO:
 * Este arquivo unifica de forma profissional os módulos da pasta:
 *   frontend/js/core/componentes-globais/
 * 
 * Módulos integrantes:
 *   - componentes-globais/componentes-rotas.js: Identificação e roteamento
 *   - componentes-globais/componentes-header.js: Navbar e barra de pesquisa
 *   - componentes-globais/componentes-drawer.js: Menu lateral deslizante
 *   - componentes-globais/componentes-badges.js: Badges dinâmicos
 *   - componentes-globais/componentes-produtos.js: Cards e formatação (ItaimProdutos)
 *   - componentes-globais/index.js: Orquestrador da API global window.ItaimComponentes
 * 
 * Para editar funcionalidades isoladas de forma modular, edite diretamente os
 * arquivos na pasta componentes-globais/ e execute 'npm run build:componentes'.
 */

// ==========================================================================
// MÓDULO: ROTEAMENTO E IDENTIFICAÇÃO (componentes-rotas.js)
// ==========================================================================

/**
 * ITAIM VENDE - ROTEAMENTO E IDENTIFICAÇÃO DE PÁGINAS (COMPONENTES ROTAS)
 * Arquivo: frontend/js/core/componentes-globais/componentes-rotas.js
 * 
 * Responsabilidades:
 * - Identificação da página ativa no navegador para destacar menus e abas
 * - Helpers de resolução de URLs e assets relativos/absolutos
 */

(function() {
    'use strict';

    const urlPara = (dest, params = '') => (window.ItaimRotas ? window.ItaimRotas.obterUrl(dest, params) : dest);
    const assetPara = (caminho) => (window.ItaimRotas ? window.ItaimRotas.obterAsset(caminho) : caminho);

    /**
     * Identifica o nome semântico da página atual a partir da URL
     */
    function obterIdentificadorPagina() {
        const path = window.location.pathname.toLowerCase();
        if (path.includes('meus-anuncios.html')) return 'meus-anuncios';
        if (path.includes('perfil.html')) return 'perfil';
        if (path.includes('favoritos.html')) return 'favoritos';
        if (path.includes('vender.html')) return 'vender';
        if (path.includes('notificacoes.html')) return 'notificacoes';
        if (path.includes('conversas.html') || path.includes('chat.html')) return 'conversas';
        if (path.includes('configuracoes.html')) return 'configuracoes';
        if (path.includes('categoria.html')) return 'categoria';
        if (path.includes('produto.html')) return 'produto';
        if (path.includes('vendedor.html')) return 'vendedor';
        if (path.includes('painel.html')) return 'painel';
        return 'home';
    }

    window.ItaimComponentesRotas = {
        urlPara,
        assetPara,
        obterIdentificadorPagina
    };

})();


// ==========================================================================
// MÓDULO: CABEÇALHO GLOBAL (HEADER) (componentes-header.js)
// ==========================================================================

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


// ==========================================================================
// MÓDULO: MENU LATERAL (DRAWER) (componentes-drawer.js)
// ==========================================================================

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
                <button type="button" class="drawer-link btn-alternar-tema" id="btn-tema-drawer" aria-label="Alternar tema do site">
                    <svg class="icone-tema-lua" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                    </svg>
                    <svg class="icone-tema-sol" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: none;">
                        <circle cx="12" cy="12" r="5"></circle>
                        <line x1="12" y1="1" x2="12" y2="3"></line>
                        <line x1="12" y1="21" x2="12" y2="23"></line>
                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                        <line x1="1" y1="12" x2="3" y2="12"></line>
                        <line x1="21" y1="12" x2="23" y2="12"></line>
                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                    </svg>
                    <span class="drawer-tema-texto">Modo Escuro</span>
                    <span class="drawer-tema-switch" aria-hidden="true">
                        <span class="drawer-tema-trilho">
                            <span class="drawer-tema-bolinha"></span>
                        </span>
                    </span>
                </button>
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


// ==========================================================================
// MÓDULO: SINCRONIZADOR DE BADGES (componentes-badges.js)
// ==========================================================================

/**
 * ITAIM VENDE - SINCRONIZADOR DE BADGES DINÂMICOS (COMPONENTES BADGES)
 * Arquivo: frontend/js/core/componentes-globais/componentes-badges.js
 * 
 * Responsabilidades:
 * - Leitura e cálculo de mensagens não lidas no Chat (itaim_conversas)
 * - Leitura e cálculo de notificações direcionadas ao usuário ativo (itaim_notificacoes)
 * - Atualização dos badges numéricos no cabeçalho
 */

(function() {
    'use strict';

    function obterEmailUsuarioAtivo() {
        if (window.ItaimSessao && typeof window.ItaimSessao.obterUsuarioLogado === 'function') {
            const u = window.ItaimSessao.obterUsuarioLogado();
            if (u && u.email) return u.email.toLowerCase().trim();
        }
        try {
            const salvo = JSON.parse(localStorage.getItem('itaim_usuario_logado') || '{}');
            if (salvo && salvo.email) return salvo.email.toLowerCase().trim();
        } catch(e) {}
        return 'admin@gmail.com';
    }

    /**
     * Atualiza os contadores numéricos nos ícones do cabeçalho
     */
    function atualizarBadgesGlobais() {
        const userEmail = obterEmailUsuarioAtivo();

        // 1. Mensagens Não Lidas no Chat
        try {
            const rawConversas = localStorage.getItem('itaim_conversas');
            if (rawConversas) {
                const convs = JSON.parse(rawConversas);
                let totalNaoLidas = 0;
                if (Array.isArray(convs)) {
                    convs.forEach(c => {
                        const msgs = Array.isArray(c.mensagens) ? c.mensagens : [];
                        totalNaoLidas += msgs.filter(m => {
                            const rem = (m.remetenteEmail || '').toLowerCase().trim();
                            return rem !== userEmail && !m.lida;
                        }).length;
                    });
                }

                const badgeChat = document.getElementById('badge-conversas-header');
                if (badgeChat) {
                    if (totalNaoLidas > 0) {
                        badgeChat.textContent = totalNaoLidas > 99 ? '99+' : totalNaoLidas;
                        badgeChat.style.display = 'inline-block';
                    } else {
                        badgeChat.style.display = 'none';
                    }
                }
            }
        } catch(e) {}

        // 2. Notificações Não Lidas
        try {
            const rawNotifs = localStorage.getItem('itaim_notificacoes');
            if (rawNotifs) {
                const notifs = JSON.parse(rawNotifs);
                let naoLidas = 0;
                if (Array.isArray(notifs)) {
                    naoLidas = notifs.filter(n => {
                        const dest = (n.destinatario || n.destinatarioEmail || '').toLowerCase().trim();
                        const ehParaMim = (!dest || dest === userEmail || dest === 'todos');
                        return ehParaMim && !n.lida;
                    }).length;
                }

                const badgeNotifs = document.getElementById('badge-notificacoes-header');
                if (badgeNotifs) {
                    if (naoLidas > 0) {
                        badgeNotifs.textContent = naoLidas > 99 ? '99+' : naoLidas;
                        badgeNotifs.style.display = 'inline-block';
                    } else {
                        badgeNotifs.style.display = 'none';
                    }
                }
            }
        } catch(e) {}
    }

    window.ItaimComponentesBadges = {
        atualizarBadgesGlobais
    };

})();


// ==========================================================================
// MÓDULO: CATÁLOGO E CARDS DE PRODUTOS (componentes-produtos.js)
// ==========================================================================

/**
 * ITAIM VENDE - COMPONENTES E UTILITÁRIOS DE PRODUTOS (ITAIMPRODUTOS)
 * Arquivo: frontend/js/core/componentes-globais/componentes-produtos.js
 * 
 * Responsabilidades:
 * - Geração de Cards padronizados de produtos à venda com suporte a lazy loading
 * - Formatação monetária em padrão Real (R$) ou indicador "Doação / Grátis"
 * - Gestão de favoritos local e sincronização imediata dos ícones de coração
 */

(function() {
    'use strict';

    function getRotas() {
        return window.ItaimComponentesRotas || {
            urlPara: (d, p = '') => p ? `${d}.html?${p}` : `${d}.html`,
            assetPara: (a) => a
        };
    }

    const ItaimProdutos = {
        /**
         * Retorna todos os produtos ativos do catálogo global e produtos criados
         */
        obterTodos: function() {
            if (window.ItaimSessao && typeof window.ItaimSessao.obterTodosProdutos === 'function') {
                return window.ItaimSessao.obterTodosProdutos();
            }
            try {
                return JSON.parse(localStorage.getItem('itaim_produtos_cadastrados') || '[]');
            } catch(e) {
                return [];
            }
        },

        /**
         * Formata o preço no padrão BRL da plataforma ou "Doação / Grátis"
         */
        formatarPreco: function(valor) {
            if (!valor || valor <= 0) {
                return '<span class="preco-gratis" style="color: #44BD32; font-weight: 800;">Doação / Grátis</span>';
            }
            return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        },

        /**
         * Retorna conjunto de IDs favoritados pelo usuário
         */
        obterFavoritos: function() {
            try {
                return new Set(JSON.parse(localStorage.getItem('itaim_favoritos') || '[]'));
            } catch(e) {
                return new Set();
            }
        },

        /**
         * Adiciona ou remove um produto dos favoritos com sincronização instantânea
         */
        alternarFavorito: function(id) {
            const idNum = parseInt(id, 10);
            const setFav = this.obterFavoritos();
            let adicionou = false;

            if (setFav.has(idNum)) {
                setFav.delete(idNum);
            } else {
                setFav.add(idNum);
                adicionou = true;
            }

            localStorage.setItem('itaim_favoritos', JSON.stringify([...setFav]));

            // Atualiza visual de todos os corações deste produto na tela
            document.querySelectorAll(`.btn-favorito[data-id="${idNum}"]`).forEach(btn => {
                btn.classList.toggle('ativo', adicionou);
            });

            // Atualiza badge de favoritos se houver
            const badge = document.getElementById('favoritos-contador-badge');
            if (badge) badge.textContent = setFav.size;

            // Notifica se houver módulo de notificações ativo
            if (adicionou && window.ItaimNotificacoes && typeof window.ItaimNotificacoes.notificarItemSalvo === 'function') {
                const prod = this.obterTodos().find(p => p.id === idNum);
                if (prod) window.ItaimNotificacoes.notificarItemSalvo(prod.titulo);
            }

            return adicionou;
        },

        /**
         * Gera o HTML padronizado de um Card de Produto à Venda
         */
        criarCardHTML: function(p) {
            const { urlPara, assetPara } = getRotas();
            const setFav = this.obterFavoritos();
            const isFav = setFav.has(p.id);
            const precoFormatado = this.formatarPreco(p.preco);
            const fotoOriginal = p.imagem || (p.fotos && p.fotos[0]) || 'assets/placeholders/produto-placeholder.svg';
            const foto = assetPara(fotoOriginal);
            const placeholder = assetPara('assets/placeholders/produto-placeholder.svg');
            const condicao = p.condicao || 'Usado';
            const cidade = p.cidade || 'Paulistana';
            const linkProduto = urlPara('produto', 'id=' + p.id);

            return `
            <article class="card-produto" data-id="${p.id}" onclick="window.location.href='${linkProduto}'" style="cursor: pointer;">
                <div class="card-img-box">
                    <img src="${foto}" alt="${p.titulo}" class="card-img" onerror="this.onerror=null; this.src='${placeholder}'" loading="lazy">
                    <button type="button" class="btn-favorito ${isFav ? 'ativo' : ''}" data-id="${p.id}" aria-label="Favoritar anúncio" onclick="event.stopPropagation(); ItaimProdutos.alternarFavorito(${p.id});">
                        <svg class="icone-coracao" viewBox="0 0 24 24">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                    </button>
                    <span class="badge-card-condicao">${condicao}</span>
                </div>
                <div class="card-corpo">
                    <div class="card-preco">${precoFormatado}</div>
                    <h3 class="card-titulo" title="${p.titulo}">${p.titulo}</h3>
                    <div class="card-localizacao">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        <span>${cidade}, PI</span>
                    </div>
                </div>
            </article>
            `;
        }
    };

    window.ItaimProdutos = ItaimProdutos;

})();


// ==========================================================================
// MÓDULO: ORQUESTRADOR GLOBAL (INDEX) (index.js)
// ==========================================================================

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


