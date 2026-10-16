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

    // Helper interno para obter usuário logado de forma resiliente
    function obterUsuario() {
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
        const user = obterUsuario();
        if (!user) return;

        // Avatar padrão
        const avatarPadrao = (window.ItaimRotas && typeof window.ItaimRotas.obterAsset === 'function')
            ? window.ItaimRotas.obterAsset('assets/icons/icon-user.png')
            : (window.location.pathname.toLowerCase().includes('/pages/') ? '../../assets/icons/icon-user.png' : './assets/icons/icon-user.png');
        
        const rawAvatar = user.avatar || 'assets/icons/icon-user.png';
        const avatarUrl = (window.ItaimApi && typeof window.ItaimApi.resolverUrlImagem === 'function')
            ? window.ItaimApi.resolverUrlImagem(rawAvatar)
            : ((window.ItaimRotas && typeof window.ItaimRotas.obterAsset === 'function')
                ? window.ItaimRotas.obterAsset(rawAvatar)
                : (rawAvatar.startsWith('data:') || rawAvatar.startsWith('http') ? rawAvatar : avatarPadrao));

        // Atualiza apenas os avatares do Header e do Menu Lateral (Drawer) do usuário logado
        const avatarImgs = document.querySelectorAll('#img-avatar-user, #drawer-user-avatar, .btn-avatar-header img, .drawer-user-avatar');
        avatarImgs.forEach(img => {
            img.src = avatarUrl;
            img.onerror = function() {
                this.onerror = null;
                this.src = avatarPadrao;
            };
        });

        // Nome no dropdown e no drawer
        const nomeFinal = user.nome || user.name || 'Admin';
        const nomeEl = document.getElementById('dropdown-user-name');
        if (nomeEl) nomeEl.textContent = nomeFinal;
        const drawerNomeEl = document.getElementById('drawer-user-name');
        if (drawerNomeEl) drawerNomeEl.textContent = nomeFinal;

        // E-mail no dropdown e no drawer
        const emailEl = document.getElementById('dropdown-user-email');
        if (emailEl) emailEl.textContent = user.email;
        const drawerEmailEl = document.getElementById('drawer-user-email');
        if (drawerEmailEl) drawerEmailEl.textContent = user.email;

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
     * Guardião de páginas (navegação livre no front)
     */
    function protegerPagina() {
        return true;
    }

    // ==========================================================================
    // 2. INICIALIZAÇÃO GLOBAL UNIFICADA DO CABEÇALHO E MENU LATERAL (DRAWER)
    // ==========================================================================
    function inicializarHeaderGlobal() {
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

        // Clique no botão de perfil vai DIRETO para o perfil sem abrir mini aba
        const btnAvatarHeader = document.getElementById('btn-avatar-dropdown') || document.querySelector('.btn-avatar-header');
        if (btnAvatarHeader) {
            btnAvatarHeader.setAttribute('title', 'Ir para Meu Perfil');
            btnAvatarHeader.setAttribute('aria-label', 'Ir para Meu Perfil');
            btnAvatarHeader.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                window.location.href = window.ItaimRotas ? window.ItaimRotas.obterUrl('perfil') : 'perfil.html';
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
            if (badgeFav) badgeFav.textContent = favs.length;
        } catch(e) {}

        // Destaque de link ativo no Drawer e no botão mobile
        try {
            const path = window.location.pathname.toLowerCase();
            document.querySelectorAll('.drawer-link').forEach(link => link.classList.remove('ativo'));

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
        } catch(e) {}
    }

    // Exporta API de UI no namespace dedicado
    window.ItaimSessaoUI = {
        atualizarHeaderUsuario,
        ajustarFotoSimples,
        protegerPagina,
        inicializarHeaderGlobal
    };

})();
