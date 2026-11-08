/**
 * ITAIM VENDE - MÓDULO DE INTERFACE DO CABEÇALHO E SESSÃO (UI & NAVIGATION)
 * Arquivo: frontend/js/core/sessao/sessao-ui.js
 * 
 * Responsabilidades:
 * - Atualização do cabeçalho global com dados e avatar do usuário logado
 * - Redimensionamento e corte 1:1 de fotos (ItaimFoto)
 * - Controle do menu lateral (Drawer), acordeão de categorias e navegação móvel
 * - Barra de pesquisa global
 * - Destaque de páginas ativas e contadores visuais
 * - Bootstrap da interface e sincronização de sessão
 */

(function() {
    'use strict';

    // Helper interno para verificar se o usuário está autenticado
    function usuarioEstaAutenticado() {
        // Se possui autenticação exclusiva da moderação/tickets, considera autenticado
        try {
            const ticketsAuth = sessionStorage.getItem('itaim_tickets_auth') || localStorage.getItem('itaim_tickets_auth');
            if (ticketsAuth) {
                const parsed = JSON.parse(ticketsAuth);
                if (parsed && (parsed.username || parsed.nome)) return true;
            }
        } catch (e) {}

        if (window.ItaimSessaoAuth && typeof window.ItaimSessaoAuth.usuarioEstaAutenticado === 'function') {
            return window.ItaimSessaoAuth.usuarioEstaAutenticado();
        }
        if (window.ItaimSessao && typeof window.ItaimSessao.usuarioEstaAutenticado === 'function') {
            return window.ItaimSessao.usuarioEstaAutenticado();
        }
        const token = localStorage.getItem('itaim_token');
        const bUserRaw = localStorage.getItem('itaim_usuario_logado');
        return !!(token && bUserRaw);
    }

    // Helpers para resolução resiliente de URLs de login e cadastro
    function resolverUrlLogin(params = '') {
        if (window.ItaimRotas && typeof window.ItaimRotas.obterUrl === 'function') {
            return window.ItaimRotas.obterUrl('login', params);
        }
        const isEmPages = window.location.pathname.replace(/\\/g, '/').toLowerCase().includes('/pages/');
        const raiz = isEmPages ? '../../' : './';
        let url = raiz + 'index.html';
        if (params) {
            url += (url.includes('?') ? '&' : '?') + params.replace(/^[\?&]/, '');
        }
        return url;
    }

    function resolverUrlCadastro(params = '') {
        if (window.ItaimRotas && typeof window.ItaimRotas.obterUrl === 'function') {
            return window.ItaimRotas.obterUrl('cadastro', params);
        }
        const isEmPages = window.location.pathname.replace(/\\/g, '/').toLowerCase().includes('/pages/');
        const raiz = isEmPages ? '../../' : './';
        let url = raiz + 'index.html';
        if (params) {
            url += (url.includes('?') ? '&' : '?') + params.replace(/^[\?&]/, '');
        }
        return url + '#cadastro';
    }

    // Modal Global de Login / Cadastro para Visitantes
    function abrirModalAuth(motivo = '') {
        let modal = document.getElementById('modal-auth-visitante');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modal-auth-visitante';
            modal.className = 'modal-auth-backdrop';
            modal.innerHTML = `
                <div class="modal-auth-card" role="dialog" aria-modal="true" aria-labelledby="modal-auth-titulo">
                    <button type="button" class="modal-auth-fechar" id="modal-auth-btn-fechar" aria-label="Fechar modal">&times;</button>
                    <h3 class="modal-auth-titulo" id="modal-auth-titulo">Faça login para continuar</h3>
                    <a href="#" class="modal-auth-btn-entrar" id="modal-auth-btn-entrar">
                        <span>Entrar</span>
                    </a>
                    <div class="modal-auth-rodape">
                        <span>Não tem conta?</span>
                        <a href="#" class="modal-auth-link-cadastro" id="modal-auth-link-cadastro">Cadastre-se</a>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            const fechar = () => {
                modal.classList.remove('ativo');
                modal.style.display = 'none';
                document.body.style.overflow = '';
            };

            const btnFechar = modal.querySelector('#modal-auth-btn-fechar');
            if (btnFechar) {
                btnFechar.onclick = (e) => {
                    if (e) e.preventDefault();
                    fechar();
                };
            }

            modal.onclick = (e) => {
                if (e.target === modal) fechar();
            };

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && modal.classList.contains('ativo')) {
                    fechar();
                }
            });
        }

        // Atualiza URLs de redirecionamento preservando returnTo
        const urlAtual = window.location.href;
        const linkEntrar = modal.querySelector('#modal-auth-btn-entrar');
        const linkCad = modal.querySelector('#modal-auth-link-cadastro');

        let query = 'returnTo=' + encodeURIComponent(urlAtual);
        if (motivo) {
            query += '&mensagem=' + encodeURIComponent(motivo);
        }

        const urlLogin = window.ItaimRotas ? window.ItaimRotas.obterUrl('login', query) : ('/login?' + query);
        const urlCadastro = window.ItaimRotas ? window.ItaimRotas.obterUrl('cadastro', query) : ('../../index.html?' + query + '#cadastro');

        if (linkEntrar) linkEntrar.href = urlLogin;
        if (linkCad) linkCad.href = urlCadastro;

        modal.style.display = 'flex';
        void modal.offsetWidth;
        modal.classList.add('ativo');
        document.body.style.overflow = 'hidden';
    }

    // Helper para redirecionar visitante para a tela de login preservando a intenção (returnTo)
    function redirecionarParaLogin(motivo = '', forcar = false) {
        if (window.ItaimRotas && typeof window.ItaimRotas.salvarDestinoLogin === 'function') {
            window.ItaimRotas.salvarDestinoLogin(window.location.href);
        }
        if (!forcar) {
            abrirModalAuth(motivo);
            return;
        }
        const urlAtual = window.location.href;
        let query = 'returnTo=' + encodeURIComponent(urlAtual);
        if (motivo) {
            query += '&mensagem=' + encodeURIComponent(motivo);
        }
        const urlLogin = window.ItaimRotas ? window.ItaimRotas.obterUrl('login', query) : ('/login?' + query);
        if (window.ItaimRotas && typeof window.ItaimRotas.executarTransicao === 'function') {
            window.ItaimRotas.executarTransicao(urlLogin);
        } else {
            window.location.href = urlLogin;
        }
    }

    // Helper interno para obter usuário logado de forma resiliente
    function obterUsuario() {
        try {
            const ticketsAuth = sessionStorage.getItem('itaim_tickets_auth') || localStorage.getItem('itaim_tickets_auth');
            if (ticketsAuth) {
                const parsed = JSON.parse(ticketsAuth);
                if (parsed && (parsed.username || parsed.nome)) {
                    return {
                        ...parsed,
                        role: parsed.role || 'MODERATOR',
                        papel: parsed.papel || 'MODERATOR'
                    };
                }
            }
        } catch (e) {}

        if (!usuarioEstaAutenticado()) {
            return null;
        }
        if (window.ItaimSessaoAuth && typeof window.ItaimSessaoAuth.obterUsuarioLogado === 'function') {
            return window.ItaimSessaoAuth.obterUsuarioLogado();
        }
        if (window.ItaimSessao && typeof window.ItaimSessao.obterUsuarioLogado === 'function') {
            return window.ItaimSessao.obterUsuarioLogado();
        }
        try {
            return JSON.parse(localStorage.getItem('itaim_usuario_logado') || 'null');
        } catch(e) {
            return null;
        }
    }

    // Helper interno para atualizar badges de notificação
    function dispararAtualizacaoBadges() {
        if (!usuarioEstaAutenticado()) return;
        if (window.ItaimNotificacoes && typeof window.ItaimNotificacoes.atualizarBadgesNotificacoes === 'function') {
            window.ItaimNotificacoes.atualizarBadgesNotificacoes();
        } else if (window.ItaimSessao && typeof window.ItaimSessao.atualizarBadgesNotificacoes === 'function') {
            window.ItaimSessao.atualizarBadgesNotificacoes();
        }
    }

    // ==========================================================================
    // 1. SINCRONIZAÇÃO VISUAL GLOBAL DO HEADER & NAVBAR
    // ==========================================================================
    function atualizarHeaderUsuario() {
        const autenticado = usuarioEstaAutenticado();
        const user = autenticado ? obterUsuario() : null;

        // Avatar padrão
        const avatarPadrao = (window.ItaimRotas && typeof window.ItaimRotas.obterAsset === 'function')
            ? window.ItaimRotas.obterAsset('assets/icons/icon-user.png')
            : (window.location.pathname.toLowerCase().includes('/pages/') ? '../../assets/icons/icon-user.png' : './assets/icons/icon-user.png');
        
        const avatarImgs = document.querySelectorAll('#img-avatar-user, #drawer-user-avatar, .btn-avatar-header img, .drawer-user-avatar');

        const headerRight = document.querySelector('.header-right');

        // Se NÃO estiver autenticado (Visitante anônimo explorando o site)
        if (!autenticado || !user) {
            document.documentElement.classList.add('usuario-deslogado');
            document.documentElement.classList.remove('usuario-logado');
            if (document.body) {
                document.body.classList.add('usuario-deslogado');
                document.body.classList.remove('usuario-logado');
            }

            // Oculta botões restritos do cabeçalho e da barra lateral
            // No cabeçalho, visitante vê exclusivamente o botão Entrar na direita.
            // Na barra lateral (drawer), visitante vê exclusivamente: Home, Modo Escuro e o botão de sair virado para Entrar.
            const seletoresOcultar = [
                '#link-meus-anuncios',
                '#btn-meus-anuncios',
                '#btn-meus-anuncios-mobile',
                '.btn-meus-anuncios-mobile',
                '.btn-nav-texto',
                '#btn-abrir-modal-vender',
                '.btn-vender-destaque:not(#btn-header-entrar)',
                '#btn-chat',
                '#btn-notificacoes',
                '.perfil-wrapper',
                '#drawer-link-perfil',
                '#drawer-link-anuncios',
                '#drawer-link-favoritos',
                '#drawer-link-chat',
                '#drawer-link-vender',
                '#drawer-link-notificacoes',
                '#drawer-link-painel',
                '#drawer-link-configuracoes',
                '.drawer-secao-divisor'
            ];
            seletoresOcultar.forEach(sel => {
                document.querySelectorAll(sel).forEach(el => {
                    el.style.display = 'none';
                });
            });

            // Insere ou exibe o botão Entrar (no estilo do de vender) na direita
            if (headerRight) {
                let btnEntrar = document.getElementById('btn-header-entrar');
                if (!btnEntrar) {
                    btnEntrar = document.createElement('a');
                    btnEntrar.id = 'btn-header-entrar';
                    btnEntrar.className = 'btn-vender-destaque btn-header-entrar';
                    btnEntrar.innerHTML = '<span>Entrar</span>';
                    btnEntrar.title = 'Entrar na sua conta';
                    headerRight.appendChild(btnEntrar);
                }
                const urlLogin = window.ItaimRotas ? window.ItaimRotas.obterUrl('login') : (window.location.pathname.toLowerCase().includes('/pages/') ? '../../index.html' : './index.html');
                btnEntrar.setAttribute('href', urlLogin);
                btnEntrar.onclick = (e) => {
                    if (e) e.preventDefault();
                    if (window.ItaimRotas && typeof window.ItaimRotas.salvarDestinoLogin === 'function') {
                        window.ItaimRotas.salvarDestinoLogin(window.location.href);
                    }
                    if (window.ItaimRotas && typeof window.ItaimRotas.navegarPara === 'function') {
                        window.ItaimRotas.navegarPara('login');
                    } else {
                        window.location.href = urlLogin;
                    }
                };
                btnEntrar.style.display = 'inline-flex';
            }

            avatarImgs.forEach(img => {
                img.src = avatarPadrao;
            });

            const nomeEl = document.getElementById('dropdown-user-name');
            if (nomeEl) nomeEl.textContent = 'Visitante';
            const drawerNomeEl = document.getElementById('drawer-user-name');
            if (drawerNomeEl) drawerNomeEl.textContent = 'Olá, visitante';

            const emailEl = document.getElementById('dropdown-user-email');
            if (emailEl) emailEl.textContent = 'Entrar ou criar conta';
            const drawerEmailEl = document.getElementById('drawer-user-email');
            if (drawerEmailEl) drawerEmailEl.textContent = 'Entre para anunciar e comprar';

            // Altera botão de sair para Entrar
            const urlLogin = window.ItaimRotas ? window.ItaimRotas.obterUrl('login') : (window.location.pathname.toLowerCase().includes('/pages/') ? '../../index.html' : './index.html');
            document.querySelectorAll('.item-sair').forEach(el => {
                el.classList.add('item-entrar');
                el.innerHTML = `
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                        <polyline points="10 17 15 12 10 7"></polyline>
                        <line x1="15" y1="12" x2="3" y2="12"></line>
                    </svg>
                    <span>Entrar</span>
                `;
                el.setAttribute('href', urlLogin);
                el.title = 'Entrar na sua conta';
            });

            // Badges zeradas
            const badgeFav = document.getElementById('favoritos-contador-badge');
            if (badgeFav) badgeFav.textContent = '0';
            const badgeNotif = document.getElementById('badge-notificacoes-header');
            if (badgeNotif) badgeNotif.style.display = 'none';
            return;
        }

        // Se estiver autenticado: remove classe deslogado e restaura botões
        document.documentElement.classList.remove('usuario-deslogado');
        document.documentElement.classList.add('usuario-logado');
        if (document.body) {
            document.body.classList.remove('usuario-deslogado');
            document.body.classList.add('usuario-logado');
        }

        const btnEntrar = document.getElementById('btn-header-entrar');
        if (btnEntrar) {
            btnEntrar.style.display = 'none';
        }

        const seletoresRestaurar = [
            '#link-meus-anuncios',
            '#btn-meus-anuncios',
            '#btn-meus-anuncios-mobile',
            '.btn-meus-anuncios-mobile',
            '.btn-nav-texto',
            '#btn-abrir-modal-vender',
            '.btn-vender-destaque:not(#btn-header-entrar)',
            '#btn-chat',
            '#btn-notificacoes',
            '.perfil-wrapper',
            '#drawer-link-perfil',
            '#drawer-link-anuncios',
            '#drawer-link-favoritos',
            '#drawer-link-chat',
            '#drawer-link-vender',
            '#drawer-link-notificacoes',
            '#drawer-link-painel',
            '#drawer-link-configuracoes',
            '.drawer-secao-divisor'
        ];
        seletoresRestaurar.forEach(sel => {
            document.querySelectorAll(sel).forEach(el => {
                el.style.display = '';
            });
        });

        // Se estiver autenticado: dados reais do perfil
        const rawAvatar = user.avatar || 'assets/icons/icon-user.png';
        const avatarUrl = (window.ItaimApi && typeof window.ItaimApi.resolverUrlImagem === 'function')
            ? window.ItaimApi.resolverUrlImagem(rawAvatar)
            : ((window.ItaimRotas && typeof window.ItaimRotas.obterAsset === 'function')
                ? window.ItaimRotas.obterAsset(rawAvatar)
                : (rawAvatar.startsWith('data:') || rawAvatar.startsWith('http') ? rawAvatar : avatarPadrao));

        avatarImgs.forEach(img => {
            img.src = avatarUrl;
            img.onerror = function() {
                this.onerror = null;
                this.src = avatarPadrao;
            };
        });

        // Garante que o cabeçalho permaneça limpo sem badges intrusivas
        const badgeDev = document.getElementById('badge-modo-dev-header');
        if (badgeDev) {
            badgeDev.remove();
        }

        // Nome no dropdown e no drawer
        const nomeFinal = user.nome || user.name || 'Usuário';
        const nomeEl = document.getElementById('dropdown-user-name');
        if (nomeEl) nomeEl.textContent = nomeFinal;
        const drawerNomeEl = document.getElementById('drawer-user-name');
        if (drawerNomeEl) drawerNomeEl.textContent = nomeFinal;

        // E-mail no dropdown e no drawer
        const emailEl = document.getElementById('dropdown-user-email');
        if (emailEl) emailEl.textContent = user.email || '';
        const drawerEmailEl = document.getElementById('drawer-user-email');
        if (drawerEmailEl) drawerEmailEl.textContent = user.email || '';

        // Restaura texto e ícone de Sair quando autenticado
        document.querySelectorAll('.item-sair').forEach(el => {
            el.classList.remove('item-entrar');
            el.innerHTML = `
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                <span>Sair</span>
            `;
            el.setAttribute('href', window.ItaimRotas ? window.ItaimRotas.obterUrl('login') : (window.location.pathname.toLowerCase().includes('/pages/') ? '../../index.html' : './index.html'));
            el.title = 'Sair da conta';
        });

        // Atualizar badges dinâmicos de notificações
        dispararAtualizacaoBadges();
    }

    /**
     * API SIMPLES DE AJUSTE AUTOMÁTICO DE FOTO (1:1 QUADRADO PERFEITO)
     * Ajusta, centraliza e corta no formato 1:1 sem distorcer e sem deixar espaços cinzas,
     * redimensionando para a resolução ideal (ex: 800x800 para produtos, 400x400 para perfil).
     */
    function ajustarFotoSimples(arquivoOuSrc, tamanho = 800, callback) {
        if (!arquivoOuSrc) return;

        function renderizarCanvas(dataUrl) {
            const img = new Image();
            img.onload = () => {
                const w = img.naturalWidth || img.width;
                const h = img.naturalHeight || img.height;
                const minSide = Math.min(w, h);
                const startX = (w - minSide) / 2;
                const startY = (h - minSide) / 2;

                const canvas = document.createElement('canvas');
                canvas.width = tamanho;
                canvas.height = tamanho;
                const ctx = canvas.getContext('2d');
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';

                // Recorte centralizado 1:1 exato cobrindo 100% da área útil sem sobrar espaços cinzas
                ctx.drawImage(img, startX, startY, minSide, minSide, 0, 0, tamanho, tamanho);

                const resultado = canvas.toDataURL('image/jpeg', 0.82);
                if (typeof callback === 'function') {
                    callback(resultado);
                }
            };
            img.onerror = () => {
                if (typeof callback === 'function') callback(dataUrl);
            };
            img.src = dataUrl;
        }

        if (typeof arquivoOuSrc === 'string') {
            renderizarCanvas(arquivoOuSrc);
        } else if (arquivoOuSrc instanceof Blob || arquivoOuSrc instanceof File) {
            const reader = new FileReader();
            reader.onload = (e) => renderizarCanvas(e.target.result);
            reader.onerror = () => {};
            reader.readAsDataURL(arquivoOuSrc);
        }
    }

    window.ItaimFoto = {
        ajustar: ajustarFotoSimples
    };

    /**
     * Guardião de páginas protegidas contra acesso direto de visitantes
     */
    function protegerPagina() {
        const path = window.location.pathname.toLowerCase().replace(/\\/g, '/');

        // Identifica semanticamente a rota atual usando o orquestrador
        let rotaAtual = '';
        if (window.ItaimRotas && typeof window.ItaimRotas.identificarRota === 'function') {
            rotaAtual = window.ItaimRotas.identificarRota(path);
        } else if (window.ItaimRotasMapa && typeof window.ItaimRotasMapa.identificarRota === 'function') {
            rotaAtual = window.ItaimRotasMapa.identificarRota(path);
        } else {
            const rotasPadrao = ['vender', 'meus-anuncios', 'perfil', 'configuracoes', 'favoritos', 'notificacoes', 'conversas', 'chat', 'tickets', 'painel'];
            rotaAtual = rotasPadrao.find(p => path.includes(p)) || '';
        }

        const rotasProtegidas = (window.ItaimRotasMapa && window.ItaimRotasMapa.ROTAS_PROTEGIDAS) || [
            'vender',
            'meus-anuncios',
            'perfil',
            'configuracoes',
            'favoritos',
            'notificacoes',
            'conversas',
            'chat'
        ];

        const rotasAdmin = (window.ItaimRotasMapa && window.ItaimRotasMapa.ROTAS_ADMIN) || [
            'tickets',
            'moderacao',
            'painel',
            'status'
        ];

        // 0. Rota pública de login dos tickets
        if (rotaAtual === 'login-tickets' || path.includes('login-tickets')) {
            return true;
        }

        // 1. Verificação de rotas administrativas (RBAC)
        if (rotasAdmin.includes(rotaAtual)) {
            // Tratamento especial para Tickets & Moderação:
            if (rotaAtual === 'tickets' || rotaAtual === 'moderacao' || path.includes('tickets.html')) {
                try {
                    const ticketsAuth = sessionStorage.getItem('itaim_tickets_auth') || localStorage.getItem('itaim_tickets_auth');
                    if (ticketsAuth) {
                        const parsed = JSON.parse(ticketsAuth);
                        if (parsed && (parsed.username || parsed.nome)) {
                            return true; // Autenticado com sucesso no painel de tickets!
                        }
                    }
                } catch (e) {}

                // Se não está autenticado na moderação, redireciona estritamente para o login dos tickets
                const isEmPages = path.includes('/pages/');
                const urlLoginTickets = window.ItaimRotas ? window.ItaimRotas.obterUrl('login-tickets') : (isEmPages ? 'login-tickets.html' : 'pages/admin/login-tickets.html');
                window.location.replace(urlLoginTickets);
                return false;
            }

            if (!usuarioEstaAutenticado()) {
                redirecionarParaLogin('Acesso restrito. Faça login com uma conta administrativa.', true);
                return false;
            }
            const usuario = obterUsuario();
            const role = (usuario && (usuario.role || usuario.papel || '')).toUpperCase();
            if (role !== 'ADMIN' && role !== 'MODERATOR') {
                if (window.ItaimNotificacoes && typeof window.ItaimNotificacoes.exibirToastGlobal === 'function') {
                    window.ItaimNotificacoes.exibirToastGlobal('Acesso negado: área exclusiva da equipe de moderação.', 'aviso');
                }
                const destinoHome = window.ItaimRotas ? window.ItaimRotas.obterUrl('home') : '/home';
                setTimeout(() => { window.location.href = destinoHome; }, 300);
                return false;
            }
            return true;
        }

        // 2. Verificação de rotas privadas (requer autenticação)
        if (rotasProtegidas.includes(rotaAtual)) {
            if (!usuarioEstaAutenticado()) {
                redirecionarParaLogin('Faça login para acessar esta página.', true);
                return false;
            }
        }

        return true;
    }

    // ==========================================================================
    // 2. INICIALIZAÇÃO GLOBAL UNIFICADA DO CABEÇALHO E MENU LATERAL (DRAWER)
    // ==========================================================================
    function inicializarHeaderGlobal() {
    // Delegação resiliente de eventos para o Drawer e Acordeão de Categorias (garante funcionamento após re-injeções dinâmicas)
    if (!window.DRAWER_EVENT_DELEGATION_INITIALIZED) {
        window.DRAWER_EVENT_DELEGATION_INITIALIZED = true;
        document.addEventListener('click', (e) => {
            // Acordeão de Categorias
            const btnToggle = e.target.closest('#btn-toggle-categorias, .drawer-accordion-btn');
            if (btnToggle) {
                e.preventDefault();
                e.stopPropagation();
                const conteudo = document.getElementById('drawer-categorias-conteudo') || btnToggle.nextElementSibling;
                if (conteudo) {
                    const isOpen = conteudo.classList.toggle('aberto');
                    btnToggle.classList.toggle('aberto', isOpen);
                    btnToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
                }
                return;
            }

            // Abertura do Drawer
            if (e.target.closest('#btn-abrir-drawer, .btn-menu-hamburguer, [aria-label="Abrir menu lateral"]')) {
                e.preventDefault();
                if (typeof window.alternarDrawer === 'function') {
                    window.alternarDrawer(true);
                }
                return;
            }

            // Fechamento do Drawer
            if (e.target.closest('#btn-fechar-drawer, .drawer-close, [aria-label="Fechar menu"]')) {
                e.preventDefault();
                if (typeof window.alternarDrawer === 'function') {
                    window.alternarDrawer(false);
                }
                return;
            }
        });
    }

        const backdrop = document.getElementById('drawer-backdrop') || document.querySelector('.drawer-backdrop');
        const btnAbrirDrawer = document.getElementById('btn-abrir-drawer');
        const btnFecharDrawer = document.getElementById('btn-fechar-drawer');
        const btnToggleCategorias = document.getElementById('btn-toggle-categorias');
        const drawerCategoriasConteudo = document.getElementById('drawer-categorias-conteudo');
        const dropdownPerfil = document.getElementById('dropdown-perfil');
        const formBusca = document.getElementById('form-busca');
        const campoBusca = document.getElementById('campo-busca');
        const btnSubmitBusca = document.getElementById('btn-submit-busca');

        // Alternar Drawer Lateral
        function alternarDrawer(abrir) {
            const currentBackdrop = document.getElementById('drawer-backdrop') || document.querySelector('.drawer-backdrop');
            if (!currentBackdrop) return;
            const estado = typeof abrir === 'boolean' ? abrir : !currentBackdrop.classList.contains('aberto');
            currentBackdrop.classList.toggle('aberto', estado);
            currentBackdrop.classList.toggle('ativo', estado);
            document.body.style.overflow = estado ? 'hidden' : '';

            if (estado && window.ItaimTema && typeof window.ItaimTema.garantirBotaoNoDrawer === 'function') {
                window.ItaimTema.garantirBotaoNoDrawer();
            }
        }

        window.alternarDrawer = alternarDrawer;

        if (btnAbrirDrawer) {
            btnAbrirDrawer.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                alternarDrawer(true);
            };
        }

        if (btnFecharDrawer) {
            btnFecharDrawer.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                alternarDrawer(false);
            };
        }

        if (backdrop) {
            backdrop.onclick = (e) => {
                if (e.target === backdrop) alternarDrawer(false);
            };
        }

        // Acordeão de Categorias no Drawer
        if (btnToggleCategorias && drawerCategoriasConteudo) {
            btnToggleCategorias.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                const isOpen = drawerCategoriasConteudo.classList.toggle('aberto');
                btnToggleCategorias.classList.toggle('aberto', isOpen);
                btnToggleCategorias.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            };
        }

        // Clique no botão de perfil (vai direto para a página de perfil)
        const btnAvatarHeader = document.getElementById('btn-avatar-dropdown') || document.querySelector('.btn-avatar-header');
        if (btnAvatarHeader) {
            btnAvatarHeader.setAttribute('title', 'Ir para Meu Perfil');
            btnAvatarHeader.setAttribute('aria-label', 'Ir para Meu Perfil');
            btnAvatarHeader.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!usuarioEstaAutenticado()) {
                    redirecionarParaLogin('Faça login para acessar seu perfil.');
                    return;
                }
                const urlPerfil = window.ItaimRotas ? window.ItaimRotas.obterUrl('perfil') : 'perfil.html';
                if (window.ItaimRotas && typeof window.ItaimRotas.executarTransicao === 'function') {
                    window.ItaimRotas.executarTransicao(urlPerfil);
                } else {
                    window.location.href = urlPerfil;
                }
            };
        }

        // Garante que o dropdown de perfil nunca abra
        if (dropdownPerfil) {
            dropdownPerfil.classList.remove('aberto');
            dropdownPerfil.style.display = 'none';
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                alternarDrawer(false);
                dropdownPerfil?.classList.remove('aberto');
            }
        });

        // Submissão da Pesquisa Global
        function executarBusca(e) {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            const inputBusca = document.getElementById('campo-busca') || campoBusca;
            if (!inputBusca) return;
            const termo = (inputBusca.value || '').trim();
            // Se estiver na página de favoritos, deixa o script de favoritos cuidar do filtro em tempo real
            if (window.location.pathname.includes('favoritos.html')) {
                return;
            }
            if (termo) {
                window.location.href = window.ItaimRotas ? window.ItaimRotas.obterUrl('categoria', `q=${encodeURIComponent(termo)}`) : `categoria.html?q=${encodeURIComponent(termo)}`;
            } else {
                window.location.href = window.ItaimRotas ? window.ItaimRotas.obterUrl('categoria') : 'categoria.html';
            }
        }

        if (formBusca) {
            formBusca.onsubmit = executarBusca;
        }
        if (btnSubmitBusca) {
            btnSubmitBusca.onclick = executarBusca;
        }

        // Contador de favoritos no dropdown
        try {
            const favs = JSON.parse(localStorage.getItem('itaim_favoritos') || '[]');
            const badgeFav = document.getElementById('favoritos-contador-badge');
            if (badgeFav) badgeFav.textContent = usuarioEstaAutenticado() ? favs.length : 0;
        } catch(e) {}

        // Destaque de link ativo no Drawer e no botão mobile
        try {
            const path = window.location.pathname.toLowerCase();
            document.querySelectorAll('.drawer-link').forEach(link => link.classList.remove('ativo'));

            if (!usuarioEstaAutenticado()) {
                if (path.includes('home.html') || path.endsWith('/') || path.endsWith('index.html')) {
                    document.getElementById('drawer-link-home')?.classList.add('ativo');
                }
            } else {
                if (path.includes('meus-anuncios.html')) {
                    document.getElementById('drawer-link-anuncios')?.classList.add('ativo');
                    document.getElementById('btn-meus-anuncios-mobile')?.classList.add('ativo');
                } else if (path.includes('perfil.html')) {
                    document.getElementById('drawer-link-perfil')?.classList.add('ativo');
                } else if (path.includes('favoritos.html')) {
                    document.getElementById('drawer-link-favoritos')?.classList.add('ativo');
                } else if (path.includes('vender.html')) {
                    document.getElementById('drawer-link-vender')?.classList.add('ativo');
                } else if (path.includes('notificacoes.html')) {
                    document.getElementById('drawer-link-notificacoes')?.classList.add('ativo');
                } else if (path.includes('conversas.html') || path.includes('chat.html')) {
                    document.getElementById('drawer-link-chat')?.classList.add('ativo');
                    document.getElementById('btn-chat')?.classList.add('ativo-icone');
                } else if (path.includes('configuracoes.html')) {
                    document.getElementById('drawer-link-configuracoes')?.classList.add('ativo');
                } else if (path.includes('home.html') || path.endsWith('/') || path.endsWith('index.html')) {
                    document.getElementById('drawer-link-home')?.classList.add('ativo');
                }
            }
        } catch(e) {}
    }

    // Interceptor global de cliques para visitantes não autenticados
    document.addEventListener('click', (e) => {
        if (usuarioEstaAutenticado()) return;

        // Se o clique foi disparado dentro do modal de auth, não intercepta
        if (e.target && e.target.closest && e.target.closest('#modal-auth-visitante')) {
            return;
        }

        // Seletor abrangente de ações e botões interativos protegidos
        const elementoInteracao = e.target.closest(`
            #btn-abrir-modal-vender,
            .btn-vender-destaque,
            #drawer-link-vender,
            a[href*="vender.html"],
            #link-meus-anuncios,
            #btn-meus-anuncios-mobile,
            .btn-meus-anuncios-mobile,
            #drawer-link-anuncios,
            #link-menu-anuncios,
            #footer-link-anuncios,
            a[href*="meus-anuncios.html"],
            #btn-chat,
            #drawer-link-chat,
            a[href*="conversas.html"],
            a[href*="chat.html"],
            #btn-notificacoes,
            #drawer-link-notificacoes,
            a[href*="notificacoes.html"],
            #drawer-link-favoritos,
            #link-menu-favoritos,
            #footer-link-favoritos,
            a[href*="favoritos.html"],
            .btn-favorito,
            .btn-favoritar,
            .produto-card-favorito,
            .card-btn-favorito,
            .btn-chat-vendedor,
            #btn-chat-vendedor,
            #btn-avatar-dropdown,
            .btn-avatar-header,
            #drawer-link-perfil,
            #link-menu-perfil,
            a[href*="perfil.html"],
            #drawer-link-configuracoes,
            #link-menu-configuracoes,
            a[href*="configuracoes.html"],
            #btn-abrir-denuncia,
            #btn-ver-meus-tickets,
            #btn-denunciar-perfil
        `);

        if (elementoInteracao) {
            // Ignora se for o link de login / cadastro / sair, o botão de entrar do cabeçalho ou o próprio modal de autenticação
            if (
                elementoInteracao.classList.contains('item-sair') || 
                elementoInteracao.closest('.item-sair') || 
                elementoInteracao.id === 'btn-header-entrar' ||
                elementoInteracao.closest('#btn-header-entrar') ||
                e.target.closest('#btn-header-entrar') ||
                elementoInteracao.closest('#modal-auth-visitante')
            ) {
                return;
            }

            e.preventDefault();
            e.stopPropagation();

            let motivo = 'Faça login para continuar.';
            const id = elementoInteracao.id || '';
            const href = elementoInteracao.getAttribute('href') || '';
            const classes = elementoInteracao.className || '';

            if (id.includes('vender') || href.includes('vender.html') || classes.includes('vender')) {
                motivo = 'Faça login para anunciar e vender seus produtos.';
                const urlVender = window.ItaimRotas ? window.ItaimRotas.obterUrl('vender') : (window.location.pathname.includes('/pages/') ? '../vender/vender.html' : 'pages/vender/vender.html');
                if (window.ItaimRotas && typeof window.ItaimRotas.salvarDestinoLogin === 'function') {
                    window.ItaimRotas.salvarDestinoLogin(urlVender);
                }
            } else {
                if (window.ItaimRotas && typeof window.ItaimRotas.salvarDestinoLogin === 'function') {
                    window.ItaimRotas.salvarDestinoLogin(window.location.href);
                }
                if (id.includes('anuncios') || href.includes('meus-anuncios.html')) {
                    motivo = 'Faça login para gerenciar seus anúncios.';
                } else if (id.includes('chat') || href.includes('conversas.html') || href.includes('chat.html')) {
                    motivo = 'Faça login para conversar com os vendedores.';
                } else if (id.includes('notificacoes') || href.includes('notificacoes.html')) {
                    motivo = 'Faça login para visualizar suas notificações.';
                } else if (id.includes('favorito') || href.includes('favoritos.html') || classes.includes('btn-favorito') || classes.includes('favorit')) {
                    motivo = 'Faça login para salvar anúncios nos seus favoritos.';
                } else if (id.includes('perfil') || href.includes('perfil.html')) {
                    motivo = 'Faça login para acessar seu perfil.';
                } else if (id.includes('configuracoes') || href.includes('configuracoes.html')) {
                    motivo = 'Faça login para acessar as configurações.';
                } else if (id.includes('denuncia') || id.includes('tickets')) {
                    motivo = 'Faça login para abrir denúncias ou acompanhar tickets.';
                }
            }

            abrirModalAuth(motivo);
        }
    }, true);

    // Exporta API de UI no namespace dedicado
    window.ItaimSessaoUI = {
        abrirModalAuth,
        atualizarHeaderUsuario,
        ajustarFotoSimples,
        protegerPagina,
        redirecionarParaLogin,
        usuarioEstaAutenticado,
        inicializarHeaderGlobal
    };

    // Executa a verificação de proteção de rota imediatamente na carga do script
    protegerPagina();

})();


