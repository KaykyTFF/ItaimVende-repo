/**
 * ITAIM VENDE - COMPONENTES GLOBAIS E CATÁLOGO UNIFICADO (JS/COMPONENTES-GLOBAIS.JS)
 * Fonte Única da Verdade para Cabeçalho, Menu Lateral (Drawer), Rodapé e Cards de Produtos.
 * Toda alteração feita aqui reflete instantaneamente em todas as páginas da plataforma.
 */

(function() {
    'use strict';

    const urlPara = (dest, params = '') => (window.ItaimRotas ? window.ItaimRotas.obterUrl(dest, params) : dest);
    const assetPara = (caminho) => (window.ItaimRotas ? window.ItaimRotas.obterAsset(caminho) : caminho);

    // ==========================================================================
    // 1. IDENTIFICAÇÃO DA PÁGINA ATIVA
    // ==========================================================================
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
        return 'home';
    }

    // ==========================================================================
    // 2. TEMPLATE GLOBAL DO CABEÇALHO (NAVBAR)
    // ==========================================================================
    function gerarHeaderHTML() {
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
                    <img src="${assetPara('assets/header1-logo.png')}" alt="Itaim Vende" class="header-logo-img">
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
                        <img src="${assetPara('assets/icon-user.png')}" alt="Foto de perfil" class="avatar-img" id="img-avatar-user">
                    </a>
                </div>
            </div>
        </div>
        `;
    }

    // ==========================================================================
    // 3. TEMPLATE GLOBAL DO MENU LATERAL (DRAWER)
    // ==========================================================================
    function gerarDrawerHTML() {
        const pagina = obterIdentificadorPagina();
        return `
        <aside class="drawer-menu" aria-label="Menu principal">
            <div class="drawer-header">
                <img src="${assetPara('assets/header1-logo.png')}" alt="Itaim Vende" class="drawer-logo">
                <button type="button" class="drawer-close" id="btn-fechar-drawer" aria-label="Fechar menu">&times;</button>
            </div>

            <!-- Card do Usuário Logado -->
            <a href="${urlPara('perfil')}" class="drawer-user-card" id="drawer-user-card" title="Acessar Meu Perfil">
                <div class="drawer-user-avatar-wrap">
                    <img src="${assetPara('assets/icon-user.png')}" alt="Foto de perfil" class="drawer-user-avatar" id="drawer-user-avatar">
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

    // ==========================================================================
    // 4. INJEÇÃO E SINCRONIZAÇÃO AUTOMÁTICA DO LAYOUT GLOBAL
    // ==========================================================================
    function aplicarLayoutGlobal() {
        // Injeta ou substitui o Header Global
        let elHeader = document.querySelector('header.header-principal');
        if (!elHeader) {
            elHeader = document.createElement('header');
            elHeader.className = 'header-principal';
            elHeader.setAttribute('role', 'banner');
            document.body.insertBefore(elHeader, document.body.firstChild);
        }
        elHeader.innerHTML = gerarHeaderHTML();

        // Injeta ou substitui o Menu Lateral (Drawer)
        let elDrawer = document.getElementById('drawer-backdrop');
        if (!elDrawer) {
            elDrawer = document.createElement('div');
            elDrawer.className = 'drawer-backdrop';
            elDrawer.id = 'drawer-backdrop';
            elHeader.insertAdjacentElement('afterend', elDrawer);
        }
        elDrawer.innerHTML = gerarDrawerHTML();

        // Atualiza Badges em tempo real
        atualizarBadgesGlobais();
    }

    // ==========================================================================
    // 5. ATUALIZADOR DE BADGES DINÂMICOS (CONVERSAS E NOTIFICAÇÕES)
    // ==========================================================================
    function atualizarBadgesGlobais() {
        // 1. Mensagens Não Lidas no Chat
        try {
            const rawConversas = localStorage.getItem('itaim_conversas');
            if (rawConversas) {
                const convs = JSON.parse(rawConversas);
                const userEmail = (window.ItaimSessao && window.ItaimSessao.obterUsuarioLogado)
                    ? (window.ItaimSessao.obterUsuarioLogado()?.email || 'admin@gmail.com').toLowerCase().trim()
                    : 'admin@gmail.com';

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
                const userEmail = (window.ItaimSessao && window.ItaimSessao.obterUsuarioLogado)
                    ? (window.ItaimSessao.obterUsuarioLogado()?.email || 'admin@gmail.com').toLowerCase().trim()
                    : 'admin@gmail.com';

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

    // ==========================================================================
    // 6. MÓDULO GLOBAL DE PRODUTOS À VENDA (ITAIMPRODUTOS)
    // ==========================================================================
    window.ItaimProdutos = {
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
            const setFav = this.obterFavoritos();
            const isFav = setFav.has(p.id);
            const precoFormatado = this.formatarPreco(p.preco);
            const fotoOriginal = p.imagem || (p.fotos && p.fotos[0]) || 'assets/produto-placeholder.svg';
            const foto = assetPara(fotoOriginal);
            const placeholder = assetPara('assets/produto-placeholder.svg');
            const condicao = p.condicao || 'Usado';
            const cidade = p.cidade || 'Paulistana';
            const linkProduto = urlPara('produto', 'id=' + p.id);

            return `
            <article class="card-produto" data-id="${p.id}" onclick="window.location.href='${linkProduto}'" style="cursor: pointer;">
                <div class="card-img-box">
                    <img src="${foto}" alt="${p.titulo}" class="card-img" onerror="this.src='${placeholder}'" loading="lazy">
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

    // Exporta API pública dos Componentes Globais
    window.ItaimComponentes = {
        obterIdentificadorPagina,
        gerarHeaderHTML,
        gerarDrawerHTML,
        aplicarLayoutGlobal,
        atualizarBadgesGlobais
    };

    // ==========================================================================
    // 7. BOOTSTRAP AUTOMÁTICO
    // ==========================================================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', aplicarLayoutGlobal);
    } else {
        aplicarLayoutGlobal();
    }

    // Sincroniza badges quando o storage sofrer alterações
    window.addEventListener('storage', (e) => {
        if (e.key === 'itaim_conversas' || e.key === 'itaim_notificacoes' || e.key === 'itaim_favoritos') {
            atualizarBadgesGlobais();
        }
    });

})();
