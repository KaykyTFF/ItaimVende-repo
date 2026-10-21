/**
 * ITAIM VENDE - CORE DE SESSÃO E IDENTIDADE DO USUÁRIO (BUNDLE UNIFICADO)
 * Arquivo: frontend/js/core/sessao.js
 * 
 * ATENÇÃO:
 * Este arquivo unifica de forma profissional os módulos da pasta:
 *   frontend/js/core/sessao/
 * 
 * Módulos integrantes:
 *   - sessao/sessao-auth.js: Gestão de contas, isolamento e autenticação
 *   - sessao/sessao-produtos.js: Catálogo, anúncios e persistência
 *   - sessao/sessao-notificacoes.js: Centro de notificações e toasts
 *   - sessao/sessao-avaliacoes.js: Sistema de avaliações (1 a 5 estrelas)
 *   - sessao/sessao-ui.js: Sincronização do cabeçalho, drawer e busca
 *   - sessao/index.js: Orquestrador da API global window.ItaimSessao
 * 
 * Para editar funcionalidades isoladas de forma modular, edite diretamente os
 * arquivos na pasta sessao/ e execute 'npm run build:sessao'.
 */

// ==========================================================================
// MÓDULO: SISTEMA DE TEMAS (sessao-tema.js)
// ==========================================================================

/**
 * ITAIM VENDE - GERENCIADOR GLOBAL DE TEMAS (SESSAO TEMA)
 * Arquivo: frontend/js/core/sessao/sessao-tema.js
 * 
 * Responsabilidades:
 * - Persistência do tema escolhido no localStorage ('itaim_tema': 'light' | 'dark')
 * - Aplicação imediata de atributos e classes para evitar efeito FOUC
 * - Sincronização automática entre o botão do menu lateral (Drawer) e a aba de Configurações
 * - Sincronização em tempo real entre abas do navegador via evento 'storage'
 * - Exportação de API global window.ItaimTema
 */

(function() {
    'use strict';

    const CHAVE_STORAGE = 'itaim_tema';

    // 1. Aplicação imediata para evitar tela piscando ao carregar a página
    function obterTemaInicial() {
        try {
            const temaSalvo = localStorage.getItem(CHAVE_STORAGE);
            if (temaSalvo === 'dark' || temaSalvo === 'light') {
                return temaSalvo;
            }
            // Se não houver tema salvo, verificar preferência do sistema operacional
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                return 'dark';
            }
        } catch (e) {
            console.warn('[ItaimTema] Não foi possível ler preferência do tema:', e);
        }
        return 'light';
    }

    let temaAtual = obterTemaInicial();

    // Aplica no elemento raiz (HTML) o mais cedo possível
    function aplicarClasseRaiz(tema) {
        const isDark = (tema === 'dark');
        document.documentElement.setAttribute('data-theme', tema);
        document.documentElement.classList.toggle('dark-theme', isDark);
        if (document.body) {
            document.body.setAttribute('data-theme', tema);
            document.body.classList.toggle('dark-theme', isDark);
        }
    }

    aplicarClasseRaiz(temaAtual);

    /**
     * Sincroniza o estado visual de todos os botões de tema do site
     */
    function sincronizarBotoes() {
        const isDark = (temaAtual === 'dark');

        // Sincroniza botões no Menu Lateral (Drawer)
        const botoesDrawer = document.querySelectorAll('#btn-tema-drawer, .btn-alternar-tema');
        botoesDrawer.forEach(btn => {
            btn.classList.toggle('tema-escuro-ativo', isDark);
            btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
            btn.setAttribute('title', isDark ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro');

            // Ícones de Sol e Lua
            const iconeLua = btn.querySelector('.icone-tema-lua');
            const iconeSol = btn.querySelector('.icone-tema-sol');
            if (iconeLua && iconeSol) {
                iconeLua.style.display = isDark ? 'none' : 'block';
                iconeSol.style.display = isDark ? 'block' : 'none';
            }

            // Texto do botão
            const textoEl = btn.querySelector('.drawer-tema-texto');
            if (textoEl) {
                textoEl.textContent = isDark ? 'Modo Claro' : 'Modo Escuro';
            }
        });

        // Sincroniza cartões de seleção na página de Configurações
        const cardClaro = document.getElementById('card-tema-claro');
        const cardEscuro = document.getElementById('card-tema-escuro');
        if (cardClaro) {
            cardClaro.classList.toggle('ativo', !isDark);
            cardClaro.setAttribute('aria-pressed', !isDark ? 'true' : 'false');
        }
        if (cardEscuro) {
            cardEscuro.classList.toggle('ativo', isDark);
            cardEscuro.setAttribute('aria-pressed', isDark ? 'true' : 'false');
        }

        // Sincroniza switch direto na página de Configurações
        const switchConfig = document.getElementById('switch-tema-escuro');
        if (switchConfig) {
            switchConfig.checked = isDark;
        }

        const legendaConfig = document.getElementById('cfg-tema-legenda');
        if (legendaConfig) {
            legendaConfig.textContent = isDark ? 'Atualmente no Modo Escuro' : 'Atualmente no Modo Claro';
        }
    }

    /**
     * Define o tema ativo na plataforma
     * @param {'light'|'dark'} novoTema 
     * @param {boolean} dispararEvento 
     */
    function definirTema(novoTema, dispararEvento = true) {
        if (novoTema !== 'dark' && novoTema !== 'light') {
            novoTema = 'light';
        }

        temaAtual = novoTema;

        try {
            localStorage.setItem(CHAVE_STORAGE, novoTema);
        } catch (e) {
            console.warn('[ItaimTema] Erro ao salvar tema no storage:', e);
        }

        aplicarClasseRaiz(novoTema);
        sincronizarBotoes();

        if (dispararEvento) {
            window.dispatchEvent(new CustomEvent('itaim:tema-alterado', {
                detail: { tema: novoTema, isDark: novoTema === 'dark' }
            }));
        }
    }

    /**
     * Alterna entre modo claro e escuro
     */
    function alternarTema() {
        const proximoTema = (temaAtual === 'dark') ? 'light' : 'dark';
        definirTema(proximoTema, true);
        return proximoTema;
    }

    /**
     * Garante que o botão de tema exista no menu lateral, injetando dinamicamente se necessário
     */
    function garantirBotaoNoDrawer() {
        const drawerNav = document.querySelector('.drawer-nav');
        if (!drawerNav) return;

        let btnTema = document.getElementById('btn-tema-drawer');
        if (!btnTema) {
            btnTema = document.createElement('button');
            btnTema.type = 'button';
            btnTema.className = 'drawer-link btn-alternar-tema';
            btnTema.id = 'btn-tema-drawer';
            btnTema.setAttribute('aria-label', 'Alternar tema do site');
            btnTema.innerHTML = `
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
            `;

            // Inserir antes do link de configurações ou no final da navegação
            const linkConfiguracoes = document.getElementById('drawer-link-configuracoes');
            if (linkConfiguracoes) {
                drawerNav.insertBefore(btnTema, linkConfiguracoes);
            } else {
                const linkSair = drawerNav.querySelector('.item-sair');
                if (linkSair) {
                    drawerNav.insertBefore(btnTema, linkSair);
                } else {
                    drawerNav.appendChild(btnTema);
                }
            }
        }

        // Adiciona evento de clique se ainda não vinculado
        if (!btnTema._temaHandlerVinculado) {
            btnTema.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                alternarTema();
            });
            btnTema._temaHandlerVinculado = true;
        }

        sincronizarBotoes();
    }

    /**
     * Vincula ouvintes em botões de configuração e switches da página
     */
    function inicializarOuvintesTema() {
        garantirBotaoNoDrawer();

        // Switch de alternância na página de Configurações
        const switchConfig = document.getElementById('switch-tema-escuro');
        if (switchConfig && !switchConfig._temaVinculado) {
            switchConfig.addEventListener('change', (e) => {
                definirTema(e.target.checked ? 'dark' : 'light');
            });
            switchConfig._temaVinculado = true;
        }

        // Cartões interativos de tema na página de Configurações
        const botoesTema = document.querySelectorAll('.btn-ativar-tema, .cfg-tema-card');
        botoesTema.forEach(el => {
            if (el._temaVinculado) return;
            el.addEventListener('click', (e) => {
                const temaAlvo = el.getAttribute('data-tema') || el.closest('[data-tema]')?.getAttribute('data-tema');
                if (temaAlvo) {
                    definirTema(temaAlvo);
                }
            });
            el._temaVinculado = true;
        });

        sincronizarBotoes();
    }

    // Exportação da API Pública
    window.ItaimTema = {
        obterTema: () => temaAtual,
        isDark: () => temaAtual === 'dark',
        definirTema,
        alternarTema,
        sincronizarBotoes,
        garantirBotaoNoDrawer
    };

    // Inicialização ao carregar o DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            aplicarClasseRaiz(temaAtual);
            inicializarOuvintesTema();
        });
    } else {
        aplicarClasseRaiz(temaAtual);
        inicializarOuvintesTema();
    }

    // Sincronização entre abas em tempo real
    window.addEventListener('storage', (e) => {
        if (e.key === CHAVE_STORAGE && e.newValue) {
            definirTema(e.newValue, false);
        }
    });

})();


// ==========================================================================
// MÓDULO: AUTENTICAÇÃO & USUÁRIOS (sessao-auth.js)
// ==========================================================================

/**
 * ITAIM VENDE - MÓDULO DE AUTENTICAÇÃO E SESSÃO DO USUÁRIO
 * Arquivo: frontend/js/core/sessao/sessao-auth.js
 * 
 * Responsabilidades:
 * - Gerenciamento de credenciais e contas de usuários
 * - Isolamento total entre contas (impede sobreposição de perfis)
 * - Identidade oficial da conta Administrador (USUARIO_ADMIN)
 * - Persistência segura em itaim_usuarios_db e itaim_usuario_logado
 */

(function() {
    'use strict';

    // Formata telefone padrão brasileiro para visualização
    function formatarTelefoneBR(tel) {
        if (!tel) return '(89) 99998-5858';
        const num = String(tel).replace(/\D/g, '');
        if (num.length === 11) {
            return `(${num.substring(0, 2)}) ${num.substring(2, 7)}-${num.substring(7)}`;
        }
        if (num.length === 10) {
            return `(${num.substring(0, 2)}) ${num.substring(2, 6)}-${num.substring(6)}`;
        }
        return tel;
    }

    // 1. USUÁRIO ADMIN PADRÃO DO SISTEMA (DADOS EXATOS DO SEED DO BANCO DE DADOS)
    const USUARIO_ADMIN = Object.freeze({
        id: "cmv5iacmv0000ttiwu9wtemar",
        nome: "Admin",
        name: "Admin",
        username: "adminfreefire",
        usuario: "adminfreefire",
        email: "admin@gmail.com",
        telefone: "(89) 99998-5858",
        phone: "89999858585",
        cidade: "Paulistana",
        city: "Paulistana",
        bairro: "Centro",
        neighborhood: "Centro",
        estado: "PI",
        state: "PI",
        avatar: "/uploads/perfil/itaim-1791903382039-jwd9lvb.jpg",
        bio: "Perfil oficial e verificado da administração do Itaim Vende.",
        role: "ADMIN",
        isVerified: true,
        dataCadastro: "Membro desde 2024",
        avaliacao: "5.0",
        ratingAverage: 5.0,
        totalAvaliacoes: 18,
        ratingCount: 18,
        vendasConcluidas: 12,
        salesCount: 12
    });

    // Inicializa a base de usuários garantindo integridade estrita e isolamento total entre contas
    function carregarUsuarios() {
        let lista = [];
        try {
            const salvos = JSON.parse(localStorage.getItem('itaim_usuarios_db') || '[]');
            if (Array.isArray(salvos)) {
                // Filtra perfis mock legados de teste
                lista = salvos.filter(u => {
                    if (!u || typeof u !== 'object') return false;
                    const em = (u.email || '').toLowerCase().trim();
                    return em !== 'giselly@itaimvende.com' && 
                           em !== 'railton@itaimvende.com' && 
                           em !== 'joao@itaimvende.com';
                });
            }
        } catch (e) {
            lista = [];
        }

        // Garante que o Admin oficial existe e NUNCA é contaminado por dados de outros perfis
        const adminIdx = lista.findIndex(u => (u.email || '').toLowerCase().trim() === 'admin@gmail.com' || u.id === 'cmv5iacmv0000ttiwu9wtemar');
        if (adminIdx !== -1) {
            lista[adminIdx] = {
                ...lista[adminIdx],
                ...USUARIO_ADMIN
            };
        } else {
            lista.unshift({ ...USUARIO_ADMIN });
        }

        // Garante deduplicação estrita por e-mail para não duplicar contas
        const mapa = new Map();
        const listaUnica = [];
        for (const u of lista) {
            if (!u || !u.email) continue;
            const key = u.email.toLowerCase().trim();
            if (!mapa.has(key)) {
                mapa.set(key, true);
                listaUnica.push(u);
            }
        }

        localStorage.setItem('itaim_usuarios_db', JSON.stringify(listaUnica));
        return listaUnica;
    }

    // Retorna todos os usuários cadastrados
    function obterTodosUsuarios() {
        return carregarUsuarios();
    }

    // Busca usuário por email
    function obterUsuarioPorEmail(email) {
        if (!email) return USUARIO_ADMIN;
        const lista = carregarUsuarios();
        const busca = email.toLowerCase().trim();
        return lista.find(u => (u.email || '').toLowerCase() === busca) || null;
    }

    // Busca usuário por username
    function obterUsuarioPorUsername(username) {
        if (!username) return null;
        const lista = carregarUsuarios();
        const limpo = username.replace('@', '').toLowerCase().trim();
        return lista.find(u => (u.username || '').toLowerCase() === limpo) || null;
    }

    // 1.1 USUÁRIO DEV FRONT-END (PARA TESTES RÁPIDOS NO LIVE SERVER SEM PRECISAR DE BACKEND)
    const USUARIO_DEV = Object.freeze({
        id: "usr_dev_frontend_001",
        nome: "Dev Front-End",
        name: "Dev Front-End",
        username: "dev_front",
        usuario: "dev_front",
        email: "dev@itaimvende.com",
        telefone: "(89) 99400-0000",
        phone: "89994000000",
        cidade: "Paulistana",
        city: "Paulistana",
        bairro: "Centro",
        neighborhood: "Centro",
        estado: "PI",
        state: "PI",
        avatar: "assets/icons/icon-user.png",
        bio: "Ambiente de Desenvolvimento Front-End ativo (Live Server).",
        role: "ADMIN",
        isVerified: true,
        dataCadastro: "Membro Dev",
        avaliacao: "5.0",
        ratingAverage: 5.0,
        totalAvaliacoes: 14,
        ratingCount: 14,
        vendasConcluidas: 9,
        salesCount: 9
    });

    // Detecta se a página está rodando em ambiente de Live Server / dev de front
    function isModoDevFrontend() {
        if (localStorage.getItem('itaim_modo_dev') === 'true') return true;
        try {
            const params = new URLSearchParams(window.location.search);
            if (params.get('dev') === 'true' || params.get('mock') === 'true') {
                localStorage.setItem('itaim_modo_dev', 'true');
                return true;
            }
        } catch(e) {}
        const port = String(window.location.port || '');
        const proto = String(window.location.protocol || '');
        if (proto === 'file:') return true;
        if (['5500', '5501', '5502', '5173', '8080', '3001'].includes(port)) return true;
        return false;
    }

    // Garante que a sessão mock exista caso estejamos em Modo Dev
    function garantirSessaoDevFrontend() {
        const token = localStorage.getItem('itaim_token');
        const bUserRaw = localStorage.getItem('itaim_usuario_logado');
        if (!token || !bUserRaw) {
            localStorage.setItem('itaim_token', 'token_mock_dev_frontend');
            localStorage.setItem('itaim_usuario_logado', JSON.stringify(USUARIO_DEV));
            localStorage.setItem('itaim_usuario_logado_email', USUARIO_DEV.email);
            console.info('⚡ [Itaim Vende] Modo Dev Front-End ativado! Sessão simulada criada automaticamente para testes livres no Live Server.');
        }
    }

    function ativarModoDevFrontend() {
        localStorage.setItem('itaim_modo_dev', 'true');
        garantirSessaoDevFrontend();
    }

    function desativarModoDevFrontend() {
        localStorage.removeItem('itaim_modo_dev');
    }

    // Retorna o usuário logado na sessão atual
    // Verifica se há um usuário autenticado com credenciais válidas
    function usuarioEstaAutenticado() {
        if (isModoDevFrontend()) {
            garantirSessaoDevFrontend();
            return true;
        }
        const token = localStorage.getItem('itaim_token');
        const bUserRaw = localStorage.getItem('itaim_usuario_logado');
        return !!(token && bUserRaw);
    }

    // Retorna o usuário logado na sessão atual (ou null se for visitante / não logado)
    function obterUsuarioLogado() {
        if (isModoDevFrontend()) {
            garantirSessaoDevFrontend();
        }
        const token = localStorage.getItem('itaim_token');
        const bUserRaw = localStorage.getItem('itaim_usuario_logado');
        let backendUser = null;
        try {
            backendUser = JSON.parse(bUserRaw || 'null');
        } catch(e) {}

        // Se não houver token ou usuário logado no storage, o visitante é anônimo (não autenticado)
        if (!token || !backendUser) {
            if (isModoDevFrontend()) return USUARIO_DEV;
            return null;
        }

        let emailAtivo = localStorage.getItem('itaim_usuario_logado_email') || backendUser.email;
        if (!emailAtivo) {
            emailAtivo = backendUser.email;
            localStorage.setItem('itaim_usuario_logado_email', emailAtivo);
        }

        let user = obterUsuarioPorEmail(emailAtivo) || backendUser;

        return {
            ...user,
            ...backendUser,
            id: backendUser.id || user.id,
            nome: backendUser.name || backendUser.nome || user.nome,
            name: backendUser.name || backendUser.nome || user.name,
            username: backendUser.username || user.username,
            usuario: backendUser.username || user.usuario,
            email: backendUser.email || user.email,
            telefone: backendUser.phone ? formatarTelefoneBR(backendUser.phone) : (user.telefone || '(89) 99998-5858'),
            phone: backendUser.phone || user.phone || '89999858585',
            cidade: backendUser.city || user.cidade || 'Paulistana',
            city: backendUser.city || user.city || 'Paulistana',
            bairro: backendUser.neighborhood || user.bairro || 'Centro',
            neighborhood: backendUser.neighborhood || user.neighborhood || 'Centro',
                    bio: backendUser.bio !== undefined ? backendUser.bio : user.bio,
                    avatar: backendUser.avatar || user.avatar || 'assets/icons/icon-user.png',
                    role: backendUser.role || user.role || 'ADMIN',
                    isVerified: backendUser.isVerified !== undefined ? backendUser.isVerified : true,
                    ratingAverage: backendUser.ratingAverage !== undefined ? Number(backendUser.ratingAverage) : 5.0,
                    avaliacao: (Number(backendUser.ratingAverage || user.ratingAverage || 5)).toFixed(1),
                    ratingCount: backendUser.ratingCount !== undefined ? backendUser.ratingCount : (user.totalAvaliacoes || 18),
                    totalAvaliacoes: backendUser.ratingCount !== undefined ? backendUser.ratingCount : (user.totalAvaliacoes || 18),
                    salesCount: backendUser.salesCount !== undefined ? backendUser.salesCount : (user.vendasConcluidas || 12),
                    vendasConcluidas: backendUser.salesCount !== undefined ? backendUser.salesCount : (user.vendasConcluidas || 12)
                };
    }

    // Define o usuário logado e atualiza a interface com isolamento estrito
    function definirUsuarioLogado(emailOuUser, dadosCompletos = null) {
        if (!emailOuUser && !dadosCompletos) return USUARIO_ADMIN;
        const chaveBusca = dadosCompletos?.email || emailOuUser || '';
        const chaveLower = chaveBusca.toLowerCase().trim();

        let user = null;
        if (chaveLower === 'admin' || chaveLower === 'admin@gmail.com') {
            user = { ...USUARIO_ADMIN };
        } else {
            user = obterUsuarioPorEmail(chaveLower) || obterUsuarioPorUsername(chaveLower);
        }

        // Se forneceu dados completos do backend, mescla sobre os dados DESTE usuário
        if (dadosCompletos && typeof dadosCompletos === 'object') {
            const baseUser = user || {
                id: dadosCompletos.id || ('usr_' + Date.now()),
                nome: dadosCompletos.name || dadosCompletos.nome || chaveBusca.split('@')[0],
                name: dadosCompletos.name || dadosCompletos.nome || chaveBusca.split('@')[0],
                username: dadosCompletos.username || chaveBusca.split('@')[0],
                email: dadosCompletos.email || chaveLower,
                role: dadosCompletos.role || 'BUYER',
                avatar: dadosCompletos.avatar || 'assets/icons/icon-user.png',
                city: dadosCompletos.city || 'Paulistana',
                cidade: dadosCompletos.city || 'Paulistana',
                neighborhood: dadosCompletos.neighborhood || 'Centro',
                bairro: dadosCompletos.neighborhood || 'Centro',
                phone: dadosCompletos.phone || '',
                telefone: dadosCompletos.phone ? formatarTelefoneBR(dadosCompletos.phone) : ''
            };

            user = {
                ...baseUser,
                id: dadosCompletos.id || baseUser.id,
                nome: dadosCompletos.name || dadosCompletos.nome || baseUser.nome,
                name: dadosCompletos.name || dadosCompletos.nome || baseUser.name,
                username: dadosCompletos.username || baseUser.username,
                usuario: dadosCompletos.username || baseUser.usuario,
                email: (dadosCompletos.email || baseUser.email).toLowerCase().trim(),
                telefone: dadosCompletos.phone ? formatarTelefoneBR(dadosCompletos.phone) : (dadosCompletos.telefone || baseUser.telefone),
                phone: dadosCompletos.phone || baseUser.phone,
                cidade: dadosCompletos.city || dadosCompletos.cidade || baseUser.cidade,
                city: dadosCompletos.city || dadosCompletos.cidade || baseUser.city,
                bairro: dadosCompletos.neighborhood || dadosCompletos.bairro || baseUser.bairro,
                neighborhood: dadosCompletos.neighborhood || dadosCompletos.bairro || baseUser.neighborhood,
                avatar: dadosCompletos.avatar || baseUser.avatar,
                bio: dadosCompletos.bio !== undefined ? dadosCompletos.bio : (baseUser.bio || ''),
                role: dadosCompletos.role || baseUser.role,
                isVerified: dadosCompletos.isVerified !== undefined ? dadosCompletos.isVerified : baseUser.isVerified,
                ratingAverage: dadosCompletos.ratingAverage !== undefined ? Number(dadosCompletos.ratingAverage) : (baseUser.ratingAverage || 5.0),
                avaliacao: (Number(dadosCompletos.ratingAverage || baseUser.ratingAverage || 5)).toFixed(1),
                ratingCount: dadosCompletos.ratingCount !== undefined ? dadosCompletos.ratingCount : (baseUser.ratingCount || 0),
                totalAvaliacoes: dadosCompletos.ratingCount !== undefined ? dadosCompletos.ratingCount : (baseUser.totalAvaliacoes || 0),
                salesCount: dadosCompletos.salesCount !== undefined ? dadosCompletos.salesCount : (baseUser.salesCount || 0),
                vendasConcluidas: dadosCompletos.salesCount !== undefined ? dadosCompletos.salesCount : (baseUser.vendasConcluidas || 0)
            };
        }

        if (user) {
            const todos = carregarUsuarios();
            const uIdx = todos.findIndex(u => (u.email || '').toLowerCase().trim() === (user.email || '').toLowerCase().trim());
            if (uIdx !== -1) {
                todos[uIdx] = { ...todos[uIdx], ...user };
            } else {
                todos.push(user);
            }
            localStorage.setItem('itaim_usuarios_db', JSON.stringify(todos));
            localStorage.setItem('itaim_usuario_logado_email', user.email);
            localStorage.setItem('itaim_usuario_logado', JSON.stringify(user));
            localStorage.setItem('itaim_ultimo_email', user.email);

            if (window.ItaimSessao && typeof window.ItaimSessao.atualizarHeaderUsuario === 'function') {
                window.ItaimSessao.atualizarHeaderUsuario();
            }
            return user;
        }
        return null;
    }

    // Cadastra um novo perfil de usuário com garantia total de isolamento
    function cadastrarNovoUsuario(dados) {
        if (!dados || !dados.email) return { sucesso: false, erro: 'E-mail é obrigatório.' };
        const lista = carregarUsuarios();
        const emailLower = (dados.email || '').toLowerCase().trim();
        const usernameLower = (dados.username || emailLower.split('@')[0]).replace('@', '').toLowerCase().trim();

        // 1. Verifica se já existe por e-mail ou username
        const existenteEmail = lista.find(u => (u.email || '').toLowerCase().trim() === emailLower);
        if (existenteEmail) {
            return { sucesso: false, jaExistia: true, erro: 'Já existe uma conta cadastrada com este e-mail.', usuario: existenteEmail };
        }

        const existenteUser = lista.find(u => (u.username || '').toLowerCase().trim() === usernameLower);
        if (existenteUser) {
            return { sucesso: false, jaExistia: true, erro: 'Este nome de usuário já está em uso.', usuario: existenteUser };
        }

        // 2. Cria conta única e independente
        const novoUser = {
            id: dados.id || ('usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7)),
            nome: dados.nome || dados.name || 'Novo Usuário',
            name: dados.nome || dados.name || 'Novo Usuário',
            username: usernameLower,
            usuario: usernameLower,
            email: emailLower,
            telefone: dados.telefone || (dados.phone ? formatarTelefoneBR(dados.phone) : ''),
            phone: dados.phone || dados.telefone || '',
            cidade: dados.cidade || dados.city || 'Paulistana',
            city: dados.cidade || dados.city || 'Paulistana',
            bairro: dados.bairro || dados.neighborhood || 'Centro',
            neighborhood: dados.bairro || dados.neighborhood || 'Centro',
            estado: dados.estado || dados.state || 'PI',
            state: dados.estado || dados.state || 'PI',
            avatar: dados.avatar || 'assets/icons/icon-user.png',
            bio: dados.bio || `Perfil de ${dados.nome || 'usuário'} no Itaim Vende.`,
            role: dados.role || 'BUYER',
            status: 'ativo',
            isVerified: false,
            dataCadastro: 'Membro desde ' + new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(new Date()),
            avaliacao: '5.0',
            ratingAverage: 5.0,
            totalAvaliacoes: 0,
            ratingCount: 0,
            vendasConcluidas: 0,
            salesCount: 0
        };

        lista.push(novoUser);
        localStorage.setItem('itaim_usuarios_db', JSON.stringify(lista));
        return { sucesso: true, usuario: novoUser };
    }

    // Atualiza os dados de um perfil de usuário existente com proteção estrita (NUNCA altera index 0 inadvertidamente)
    function atualizarDadosUsuario(email, novosDados) {
        if (!email && !novosDados) return null;
        const lista = carregarUsuarios();
        const emailLower = (email || (novosDados && novosDados.email) || '').toLowerCase().trim();
        
        let idx = -1;
        if (emailLower) {
            idx = lista.findIndex(u => (u.email || '').toLowerCase().trim() === emailLower);
        }
        if (idx === -1 && novosDados && novosDados.id) {
            idx = lista.findIndex(u => String(u.id) === String(novosDados.id));
        }

        // Se NÃO encontrou, NUNCA atualiza o index 0!
        if (idx === -1) {
            console.warn('[ItaimSessaoAuth] Conta não encontrada para atualização:', emailLower);
            return null;
        }

        const antigoEmail = lista[idx].email;
        lista[idx] = {
            ...lista[idx],
            ...novosDados,
            email: emailLower || lista[idx].email
        };

        if (novosDados.username && !novosDados.usuario) {
            lista[idx].usuario = novosDados.username;
        }

        const novoEmail = lista[idx].email || antigoEmail;
        localStorage.setItem('itaim_usuarios_db', JSON.stringify(lista));

        // Se este usuário for o usuário logado ativo, sincroniza a sessão
        const emailLogado = (localStorage.getItem('itaim_usuario_logado_email') || '').toLowerCase().trim();
        if (emailLogado === (antigoEmail || '').toLowerCase().trim() || emailLogado === (novoEmail || '').toLowerCase().trim()) {
            localStorage.setItem('itaim_usuario_logado_email', novoEmail);
            localStorage.setItem('itaim_usuario_logado', JSON.stringify(lista[idx]));
            if (window.ItaimSessao && typeof window.ItaimSessao.atualizarHeaderUsuario === 'function') {
                window.ItaimSessao.atualizarHeaderUsuario();
            }
        }

        return lista[idx];
    }

    // Obter preferências de privacidade e notificações
    function obterConfiguracoes() {
        try {
            const raw = localStorage.getItem('itaim_configuracoes');
            return raw ? JSON.parse(raw) : { 'priv-telefone': true, 'priv-bairro': true, 'priv-online': false };
        } catch(e) {
            return { 'priv-telefone': true, 'priv-bairro': true, 'priv-online': false };
        }
    }

    // Suspender conta do usuário (desativa conta e pausa todos os anúncios)
    function suspenderConta(email) {
        const user = email ? obterUsuarioPorEmail(email) : obterUsuarioLogado();
        if (!user) return false;
        const uEm = (user.email || '').toLowerCase();
        
        // 1. Marca status como suspenso na base de usuários
        const todos = carregarUsuarios();
        const uIdx = todos.findIndex(u => (u.email || '').toLowerCase() === uEm || u.id === user.id);
        if (uIdx !== -1) {
            todos[uIdx].status = 'suspenso';
            todos[uIdx].suspenso = true;
            todos[uIdx].dataSuspensao = new Date().toISOString();
            localStorage.setItem('itaim_usuarios_db', JSON.stringify(todos));
        }

        // 2. Pausa todos os anúncios publicados pelo usuário
        try {
            const prods = JSON.parse(localStorage.getItem('itaim_produtos_cadastrados') || '[]');
            let alterou = false;
            prods.forEach(p => {
                if ((p.vendedorEmail || '').toLowerCase() === uEm || p.vendedorId === user.id) {
                    p.status = 'pausado';
                    alterou = true;
                }
            });
            if (alterou) {
                localStorage.setItem('itaim_produtos_cadastrados', JSON.stringify(prods));
            }
        } catch(e) {}

        // 3. Desconecta o usuário
        deslogarUsuario();
        return true;
    }

    // Excluir conta permanentemente (apaga usuário, anúncios e dados locais)
    function excluirContaPermanentemente(email) {
        const user = email ? obterUsuarioPorEmail(email) : obterUsuarioLogado();
        if (!user) return false;
        const uEm = (user.email || '').toLowerCase();

        // 1. Remove anúncios publicados pelo usuário
        try {
            const prods = JSON.parse(localStorage.getItem('itaim_produtos_cadastrados') || '[]');
            const restantes = prods.filter(p => (p.vendedorEmail || '').toLowerCase() !== uEm && p.vendedorId !== user.id);
            localStorage.setItem('itaim_produtos_cadastrados', JSON.stringify(restantes));
        } catch(e) {}

        // 2. Remove avaliações do vendedor
        try {
            localStorage.removeItem('itaim_avaliacoes_' + uEm);
            if (user.username) {
                localStorage.removeItem('itaim_avaliacoes_' + user.username.toLowerCase());
            }
        } catch(e) {}

        // 3. Remove o usuário da base de dados
        try {
            const todos = carregarUsuarios();
            const novos = todos.filter(u => (u.email || '').toLowerCase() !== uEm && u.id !== user.id);
            localStorage.setItem('itaim_usuarios_db', JSON.stringify(novos));
        } catch(e) {}

        // 4. Limpa sessões e rastros locais
        deslogarUsuario();
        return true;
    }

    // Desloga o usuário e limpa completamente a sessão ativa sem apagar a conta
    function deslogarUsuario() {
        try {
            localStorage.removeItem('itaim_usuario_logado_email');
            localStorage.removeItem('itaim_usuario_logado');
            localStorage.removeItem('itaim_token');
            localStorage.removeItem('itaim_perfil_usuario');
            localStorage.removeItem('itaim_perfil_customizado');
            localStorage.removeItem('itaim_ultima_atividade');
            localStorage.removeItem('itaim_ultimo_email');
        } catch(e) {}
        if (window.ItaimSessao && typeof window.ItaimSessao.atualizarHeaderUsuario === 'function') {
            window.ItaimSessao.atualizarHeaderUsuario();
        }
        window.dispatchEvent(new CustomEvent('itaim:logout'));
    }

    // Exporta API no namespace de Autenticação
    window.ItaimSessaoAuth = {
        USUARIO_ADMIN,
        USUARIO_DEV,
        isModoDevFrontend,
        garantirSessaoDevFrontend,
        ativarModoDevFrontend,
        desativarModoDevFrontend,
        formatarTelefoneBR,
        carregarUsuarios,
        obterTodosUsuarios,
        obterUsuarioPorEmail,
        obterUsuarioPorUsername,
        usuarioEstaAutenticado,
        obterUsuarioLogado,
        definirUsuarioLogado,
        cadastrarNovoUsuario,
        atualizarDadosUsuario,
        obterConfiguracoes,
        suspenderConta,
        excluirContaPermanentemente,
        deslogarUsuario
    };

})();


// ==========================================================================
// MÓDULO: PRODUTOS & ANÚNCIOS (sessao-produtos.js)
// ==========================================================================

/**
 * ITAIM VENDE - MÓDULO DE GESTÃO DE ANÚNCIOS E PRODUTOS LOCAIS
 * Arquivo: frontend/js/core/sessao/sessao-produtos.js
 * 
 * Responsabilidades:
 * - Leitura e mescla de produtos iniciais e cadastrados localmente
 * - Filtro de anúncios por vendedor logado
 * - Publicação de novos anúncios locais com proteção de cota
 * - Alteração de status (ativo / pausado / vendido)
 * - Exclusão lógica de anúncios e limpeza de resíduos
 */

(function() {
    'use strict';

    // Retorna todos os produtos do sistema (iniciais + cadastrados localmente)
    function obterTodosProdutos() {
        let todos = [];
        if (typeof PRODUTOS_INICIAIS !== 'undefined' && Array.isArray(PRODUTOS_INICIAIS)) {
            todos = [...PRODUTOS_INICIAIS];
        }
        
        try {
            const locais = JSON.parse(localStorage.getItem('itaim_produtos_cadastrados') || '[]');
            if (Array.isArray(locais)) {
                todos = [...locais, ...todos];
            }
        } catch (e) {}

        // Filtrar produtos excluídos pelo usuário
        try {
            const excluidos = JSON.parse(localStorage.getItem('itaim_produtos_excluidos') || '[]');
            if (Array.isArray(excluidos) && excluidos.length > 0) {
                const setExcluidos = new Set(excluidos.map(id => String(id)));
                todos = todos.filter(p => !setExcluidos.has(String(p.id)));
            }
        } catch (e) {}

        // Sincronizar status modificado (ativo/pausado/vendido)
        try {
            const statusMap = JSON.parse(localStorage.getItem('itaim_produtos_status_map') || '{}');
            todos = todos.map(p => {
                const sId = String(p.id);
                if (statusMap[sId]) {
                    return { ...p, status: statusMap[sId] };
                }
                return p;
            });
        } catch (e) {}

        // Fallback de dados para desenvolvimento no front-end quando a base estiver vazia
        if (todos.length === 0) {
            const isDev = (window.ItaimSessaoAuth && typeof window.ItaimSessaoAuth.isModoDevFrontend === 'function' && window.ItaimSessaoAuth.isModoDevFrontend())
                || (window.ItaimSessao && typeof window.ItaimSessao.isModoDevFrontend === 'function' && window.ItaimSessao.isModoDevFrontend());
            if (isDev) {
                return [...PRODUTOS_MOCK_DEV];
            }
        }

        return todos;
    }

    const PRODUTOS_MOCK_DEV = [
        {
            id: 'mock_1',
            titulo: 'iPhone 13 Pro 128GB Grafite - Impecável com Caixa',
            preco: 3450,
            categoria: 'Eletrônicos',
            condicao: 'Usado - Excelente',
            cidade: 'Paulistana',
            bairro: 'Centro',
            imagem: 'assets/produtos/anuncio_11.jpg',
            fotos: ['assets/produtos/anuncio_11.jpg'],
            descricao: 'Aparelho 100% original, bateria com 89% de saúde, sem marcas ou arranhões. Acompanha cabo e capinha.',
            status: 'ativo',
            data: '20/10/2026',
            visualizacoes: 42,
            conversas: 5,
            favorito: false,
            vendedorId: 'usr_dev_frontend',
            vendedorNome: 'Dev Front-End',
            vendedorEmail: 'dev@itaimvende.com',
            vendedorUsername: 'dev_front',
            vendedorTelefone: '89994000000',
            vendedorCidade: 'Paulistana',
            vendedorAvatar: 'assets/icons/icon-user.png'
        },
        {
            id: 'mock_2',
            titulo: 'Bicicleta Aro 29 Mountain Bike Shimano 24V Freio a Disco',
            preco: 1290,
            categoria: 'Esportes',
            condicao: 'Semi-nova',
            cidade: 'Paulistana',
            bairro: 'Correnteza',
            imagem: 'assets/produtos/anuncio_13.jpg',
            fotos: ['assets/produtos/anuncio_13.jpg'],
            descricao: 'Pouco usada, revisada recentemente. Câmbio Shimano original, pneus com cravos novos.',
            status: 'ativo',
            data: '19/10/2026',
            visualizacoes: 28,
            conversas: 3,
            favorito: true,
            vendedorId: 'cmv5iacmv0000ttiwu9wtemar',
            vendedorNome: 'Admin',
            vendedorEmail: 'admin@gmail.com',
            vendedorUsername: 'adminfreefire',
            vendedorTelefone: '89999985858',
            vendedorCidade: 'Paulistana',
            vendedorAvatar: 'assets/icons/icon-user.png'
        },
        {
            id: 'mock_3',
            titulo: 'Sofá Retrátil e Reclinável 3 Lugares Suede Bege',
            preco: 1100,
            categoria: 'Móveis',
            condicao: 'Usado',
            cidade: 'Paulistana',
            bairro: 'Guarani',
            imagem: 'assets/produtos/anuncio_15.jpg',
            fotos: ['assets/produtos/anuncio_15.jpg'],
            descricao: 'Muito confortável, espuma D28, tecido impermeabilizado. Medidas: 2.10m de largura.',
            status: 'ativo',
            data: '18/10/2026',
            visualizacoes: 19,
            conversas: 2,
            favorito: false,
            vendedorId: 'usr_dev_frontend',
            vendedorNome: 'Dev Front-End',
            vendedorEmail: 'dev@itaimvende.com',
            vendedorUsername: 'dev_front',
            vendedorTelefone: '89994000000',
            vendedorCidade: 'Paulistana',
            vendedorAvatar: 'assets/icons/icon-user.png'
        },
        {
            id: 'mock_4',
            titulo: 'Smart TV 50 Polegadas 4K UHD Wi-Fi Bluetooth HDR',
            preco: 1850,
            categoria: 'Eletrônicos',
            condicao: 'Semi-nova',
            cidade: 'Paulistana',
            bairro: 'Centro',
            imagem: 'assets/produtos/anuncio_12.jpg',
            fotos: ['assets/produtos/anuncio_12.jpg'],
            descricao: 'Perfeito estado, com controle smart magic original e nota fiscal. Apenas 8 meses de uso.',
            status: 'ativo',
            data: '17/10/2026',
            visualizacoes: 56,
            conversas: 7,
            favorito: false,
            vendedorId: 'cmv5iacmv0000ttiwu9wtemar',
            vendedorNome: 'Admin',
            vendedorEmail: 'admin@gmail.com',
            vendedorUsername: 'adminfreefire',
            vendedorTelefone: '89999985858',
            vendedorCidade: 'Paulistana',
            vendedorAvatar: 'assets/icons/icon-user.png'
        }
    ];

    // Retorna todos os anúncios pertencentes ao usuário solicitado
    function obterAnunciosDoUsuario(emailOuUsername) {
        const todos = obterTodosProdutos();
        if (!emailOuUsername) return [];

        const raw = emailOuUsername.toLowerCase().trim();
        const semArroba = raw.replace('@', '');
        return todos.filter(p => {
            const pEmail = (p.vendedorEmail || '').toLowerCase().trim();
            const pUser = (p.vendedorUsername || '').toLowerCase().trim();
            const pId = String(p.vendedorId || p.sellerId || '');
            const pNome = (p.vendedorNome || p.vendedor || '').toLowerCase().trim();
            if (raw === 'admin@gmail.com' || semArroba === 'admin' || semArroba === 'rsstore' || semArroba === 'adminfreefire') {
                return pEmail === 'admin@gmail.com' || pUser === 'admin' || pUser === 'adminfreefire' || pId === 'cmv5iacmv0000ttiwu9wtemar';
            }
            return pEmail === raw || pEmail === semArroba || (pUser && (pUser === semArroba || pUser === raw)) || pId === raw;
        });
    }

    // Adiciona um novo anúncio criado pelo usuário logado
    function adicionarNovoAnuncio(dados) {
        const user = (window.ItaimSessaoAuth && typeof window.ItaimSessaoAuth.obterUsuarioLogado === 'function')
            ? window.ItaimSessaoAuth.obterUsuarioLogado()
            : ((window.ItaimSessao && typeof window.ItaimSessao.obterUsuarioLogado === 'function') ? window.ItaimSessao.obterUsuarioLogado() : {});

        const novoId = Date.now();
        const novoAnuncio = {
            id: novoId,
            titulo: dados.titulo,
            preco: Number(dados.preco) || 0,
            categoria: dados.categoria || 'Geral',
            condicao: dados.condicao || 'Usado',
            cidade: dados.cidade || user.cidade || 'Paulistana',
            bairro: dados.bairro || user.bairro || 'Centro',
            imagem: (dados.imagens && dados.imagens[0]) || 'assets/placeholders/produto-placeholder.svg',
            fotos: dados.imagens && dados.imagens.length > 0 ? dados.imagens : ['assets/placeholders/produto-placeholder.svg'],
            descricao: dados.descricao || '',
            status: 'ativo',
            data: new Intl.DateTimeFormat('pt-BR').format(new Date()),
            visualizacoes: 1,
            conversas: 0,
            favorito: false,
            vendedorId: user.id || 'admin',
            vendedorNome: user.nome || 'Admin',
            vendedorEmail: user.email || 'admin@gmail.com',
            vendedorUsername: user.username || (user.email ? user.email.split('@')[0] : 'adminfreefire'),
            vendedorTelefone: user.telefone ? user.telefone.replace(/\D/g, '') : '5589999999999',
            vendedorCidade: user.cidade || 'Paulistana',
            vendedorAvatar: user.avatar || 'assets/icons/icon-user.png'
        };

        let locais = [];
        try {
            locais = JSON.parse(localStorage.getItem('itaim_produtos_cadastrados') || '[]');
            if (!Array.isArray(locais)) locais = [];
        } catch(e) {
            locais = [];
        }

        locais.unshift(novoAnuncio);

        try {
            localStorage.setItem('itaim_produtos_cadastrados', JSON.stringify(locais));
        } catch (err) {
            console.warn('Alerta de cota no localStorage ao salvar anúncio:', err);
            try {
                // Remove fotos pesadas em base64 de anúncios anteriores para liberar espaço imediatamente
                locais = locais.map((p, idx) => {
                    if (idx > 0 && p.fotos && p.fotos.length > 0 && p.fotos[0].startsWith('data:')) {
                        return { ...p, fotos: ['assets/produtos/anuncio_11.jpg'], imagem: 'assets/produtos/anuncio_11.jpg' };
                    }
                    return p;
                });
                localStorage.setItem('itaim_produtos_cadastrados', JSON.stringify(locais));
            } catch (err2) {
                console.error('Falha crítica de armazenamento:', err2);
            }
        }

        return novoAnuncio;
    }

    // Atualiza status do anúncio ('ativo', 'pausado', 'vendido')
    function atualizarStatusAnuncio(id, novoStatus) {
        const idStr = String(id);
        
        let locais = JSON.parse(localStorage.getItem('itaim_produtos_cadastrados') || '[]');
        locais = locais.map(p => {
            if (String(p.id) === idStr) {
                return { ...p, status: novoStatus };
            }
            return p;
        });
        localStorage.setItem('itaim_produtos_cadastrados', JSON.stringify(locais));

        let statusMap = JSON.parse(localStorage.getItem('itaim_produtos_status_map') || '{}');
        statusMap[idStr] = novoStatus;
        localStorage.setItem('itaim_produtos_status_map', JSON.stringify(statusMap));

        return true;
    }

    // Exclui um anúncio
    function excluirAnuncio(id) {
        const idStr = String(id);
        
        let locais = JSON.parse(localStorage.getItem('itaim_produtos_cadastrados') || '[]');
        locais = locais.filter(p => String(p.id) !== idStr);
        localStorage.setItem('itaim_produtos_cadastrados', JSON.stringify(locais));

        let excluidos = JSON.parse(localStorage.getItem('itaim_produtos_excluidos') || '[]');
        if (!excluidos.includes(idStr)) {
            excluidos.push(idStr);
            localStorage.setItem('itaim_produtos_excluidos', JSON.stringify(excluidos));
        }

        return true;
    }

    // Limpa produtos em venda e notificações a pedido do usuário
    function limparDadosZerados() {
        try {
            if (localStorage.getItem('itaim_zerado_v4') !== 'true') {
                localStorage.setItem('itaim_produtos_cadastrados', JSON.stringify([]));
                localStorage.setItem('itaim_notificacoes', JSON.stringify([]));
                localStorage.setItem('itaim_favoritos', JSON.stringify([]));
                localStorage.removeItem('itaim_produtos_excluidos');
                localStorage.removeItem('itaim_produtos_status_map');
                localStorage.setItem('itaim_zerado_v4', 'true');
            }

            // Remove comentários falsos de enfeite de todas as chaves de avaliações existentes
            const chaves = [];
            for (let i = 0; i < localStorage.length; i++) {
                chaves.push(localStorage.key(i));
            }
            chaves.forEach(k => {
                if (k && k.startsWith('itaim_avaliacoes_')) {
                    try {
                        const lista = JSON.parse(localStorage.getItem(k) || '[]');
                        if (Array.isArray(lista)) {
                            const limpos = lista.filter(item => {
                                if (!item) return false;
                                const autor = (item.autor || '').trim();
                                const com = (item.comentario || '').trim();
                                if (autor === 'Lucas Ribeiro' || autor === 'Ana Paula') return false;
                                if (com.includes('WhatsApp e o produto veio exatamente')) return false;
                                if (com.includes('Negociação tranquila e segura')) return false;
                                return true;
                            });
                            localStorage.setItem(k, JSON.stringify(limpos));
                        }
                    } catch(e) {}
                }
            });
        } catch(e) {}
    }

    // Exporta API no namespace de Produtos
    window.ItaimSessaoProdutos = {
        obterTodosProdutos,
        obterAnunciosDoUsuario,
        adicionarNovoAnuncio,
        atualizarStatusAnuncio,
        excluirAnuncio,
        limparDadosZerados
    };

})();


// ==========================================================================
// MÓDULO: NOTIFICAÇÕES & TOASTS (sessao-notificacoes.js)
// ==========================================================================

/**
 * ITAIM VENDE - SISTEMA CENTRAL DE NOTIFICAÇÕES E TOASTS GLOBAIS
 * Arquivo: frontend/js/core/sessao/sessao-notificacoes.js
 * 
 * Responsabilidades:
 * - Persistência e leitura isolada de notificações por usuário (itaim_notificacoes_email)
 * - Toasts globais animados na tela
 * - Disparos de notificações em eventos (curtidas, chat, venda, preço, avaliações)
 * - Atualização dinâmica dos badges de contagem no Header e Drawer
 */

(function() {
    'use strict';

    const NOTIF_CONFIG_PADRAO = {
        'not-mensagens': true,
        'not-avaliacoes': true,
        'not-compras': true,
        'not-favoritos': true,
        'not-precos': true,
        'not-expiracao': true,
        'not-avisos': true
    };

    function obterConfiguracoesNotificacoes() {
        try {
            const raw = localStorage.getItem('itaim_configuracoes');
            return raw ? { ...NOTIF_CONFIG_PADRAO, ...JSON.parse(raw) } : NOTIF_CONFIG_PADRAO;
        } catch(e) {
            return NOTIF_CONFIG_PADRAO;
        }
    }

    function obterEmailUsuarioAtivo() {
        try {
            const getLogado = (window.ItaimSessaoAuth && window.ItaimSessaoAuth.obterUsuarioLogado) || 
                              (window.ItaimSessao && window.ItaimSessao.obterUsuarioLogado);
            const u = getLogado ? getLogado() : null;
            return (u && u.email ? u.email : 'admin@gmail.com').toLowerCase().trim();
        } catch(e) {
            return 'admin@gmail.com';
        }
    }

    function resolverEmailDestinatario(destinatario) {
        if (!destinatario) return obterEmailUsuarioAtivo();
        if (typeof destinatario === 'object') {
            const em = destinatario.email || destinatario.vendedorEmail;
            if (em) return String(em).toLowerCase().trim();
            const nom = destinatario.nome || destinatario.vendedorNome || destinatario.username;
            if (nom) return resolverEmailDestinatario(nom);
            return obterEmailUsuarioAtivo();
        }
        const str = String(destinatario).trim().toLowerCase();
        if (str.includes('@')) return str;
        
        const getUsuarios = (window.ItaimSessaoAuth && window.ItaimSessaoAuth.carregarUsuarios) || 
                            (window.ItaimSessao && window.ItaimSessao.obterTodosUsuarios);
        const todos = getUsuarios ? getUsuarios() : [];
        const u = todos.find(x => 
            String(x.id) === str || 
            (x.username || '').toLowerCase() === str || 
            (x.nome || '').toLowerCase() === str
        );
        if (u && u.email) return u.email.toLowerCase().trim();
        return str;
    }

    // Retorna a lista real de notificações do usuário especificado (ou do usuário logado)
    function obterNotificacoes(destinatario) {
        try {
            const email = resolverEmailDestinatario(destinatario);
            const chave = 'itaim_notificacoes_' + email;
            let lista = JSON.parse(localStorage.getItem(chave) || 'null');
            
            // Limpa qualquer resquício de mock fake antigo da plataforma
            if (localStorage.getItem('itaim_notificacoes')) {
                localStorage.removeItem('itaim_notificacoes');
            }

            if (!Array.isArray(lista)) {
                return [];
            }
            return lista;
        } catch(e) {
            return [];
        }
    }

    // Salva a lista de notificações para o usuário especificado
    function salvarNotificacoes(lista, destinatario) {
        try {
            const email = resolverEmailDestinatario(destinatario);
            const chave = 'itaim_notificacoes_' + email;
            localStorage.setItem(chave, JSON.stringify(Array.isArray(lista) ? lista : []));
            
            if (email === obterEmailUsuarioAtivo()) {
                atualizarBadgesNotificacoes();
            }
        } catch(e) {}
    }

    function exibirToastGlobal(titulo, texto, link) {
        let container = document.getElementById('itaim-toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'itaim-toast-container';
            container.style.cssText = 'position:fixed;top:20px;right:20px;z-index:99999;display:flex;flex-direction:column;gap:10px;pointer-events:none;max-width:360px;width:calc(100% - 40px);';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.style.cssText = 'pointer-events:auto;background:#FFFFFF;border-left:4px solid #44BD32;border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,0.16);padding:14px 16px;cursor:pointer;display:flex;flex-direction:column;gap:4px;transition:all 0.3s ease;transform:translateX(100px);opacity:0;';
        toast.innerHTML = `
            <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
                <strong style="color:#1E272E;font-size:14px;font-weight:700;">${titulo}</strong>
                <button type="button" style="background:none;border:none;color:#94A3B8;cursor:pointer;font-size:16px;line-height:1;padding:2px;">&times;</button>
            </div>
            <p style="color:#57606F;font-size:13px;margin:0;line-height:1.4;">${texto}</p>
        `;

        toast.addEventListener('click', (e) => {
            if (e.target.tagName.toLowerCase() === 'button') {
                toast.remove();
                return;
            }
            if (link) window.location.href = link;
        });

        container.appendChild(toast);
        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(0)';
            toast.style.opacity = '1';
        });

        setTimeout(() => {
            toast.style.transform = 'translateX(100px)';
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 350);
        }, 5000);
    }

    // Cria notificação real para um usuário específico
    function criarNotificacao({ destinatario, tipo = 'aviso', titulo, texto, link = (window.ItaimRotas ? window.ItaimRotas.obterUrl('notificacoes') : 'notificacoes.html'), icone, tempo = 'Agora' }) {
        const cfg = obterConfiguracoesNotificacoes();
        
        // Valida preferências
        if (tipo === 'mensagem' && cfg['not-mensagens'] === false) return false;
        if (tipo === 'avaliacao' && cfg['not-avaliacoes'] === false) return false;
        if (tipo === 'compra' && cfg['not-compras'] === false) return false;
        if (tipo === 'favorito' && cfg['not-favoritos'] === false) return false;
        if (tipo === 'preco' && cfg['not-precos'] === false) return false;
        if (tipo === 'aviso' && cfg['not-avisos'] === false) return false;

        const emailDestinatario = resolverEmailDestinatario(destinatario);
        if (!emailDestinatario) return false;

        const nova = {
            id: Date.now() + Math.floor(Math.random() * 1000),
            tipo,
            titulo: titulo || 'Nova notificação',
            texto: texto || '',
            link: link || (window.ItaimRotas ? window.ItaimRotas.obterUrl('notificacoes') : 'notificacoes.html'),
            icone: icone || tipo,
            tempo: tempo || 'Agora',
            data: 'Hoje',
            lida: false,
            criadoEm: Date.now()
        };

        const lista = obterNotificacoes(emailDestinatario);
        lista.unshift(nova);
        salvarNotificacoes(lista, emailDestinatario);

        // Se o destinatário estiver logado na tela agora, dispara alerta visual
        if (emailDestinatario === obterEmailUsuarioAtivo()) {
            exibirToastGlobal(nova.titulo, nova.texto, nova.link);
            atualizarBadgesNotificacoes();
        }

        return nova;
    }

    // DISPARO 1: Notificar quando outro usuário salvar/curtir um item
    function notificarItemSalvo(produtoOuId, usuarioQueSalvou) {
        try {
            let produto = produtoOuId;
            if (typeof produtoOuId === 'number' || typeof produtoOuId === 'string') {
                const getProds = (window.ItaimSessaoProdutos && window.ItaimSessaoProdutos.obterTodosProdutos) ||
                                 (window.ItaimSessao && window.ItaimSessao.obterTodosProdutos);
                const todos = getProds ? getProds() : [];
                produto = todos.find(p => String(p.id) === String(produtoOuId));
            }
            if (!produto) return false;

            const getLogado = (window.ItaimSessaoAuth && window.ItaimSessaoAuth.obterUsuarioLogado) || 
                              (window.ItaimSessao && window.ItaimSessao.obterUsuarioLogado);
            const remetente = usuarioQueSalvou || (getLogado ? getLogado() : {});
            const emailVendedor = resolverEmailDestinatario(produto.vendedorEmail || produto.vendedorUsername || produto.vendedorNome);
            const emailQuemSalvou = (remetente?.email || obterEmailUsuarioAtivo()).toLowerCase().trim();

            if (emailVendedor === emailQuemSalvou) {
                return false;
            }

            return criarNotificacao({
                destinatario: emailVendedor,
                tipo: 'favorito',
                titulo: 'Anúncio salvo por outro usuário',
                texto: `${remetente.nome || 'Um usuário'} salvou seu anúncio "${produto.titulo}" nos favoritos.`,
                link: (window.ItaimRotas ? window.ItaimRotas.obterUrl('produto', `id=${produto.id}`) : `produto.html?id=${produto.id}`),
                icone: 'favorito',
                tempo: 'Agora'
            });
        } catch(e) {
            console.warn('Erro ao notificar item salvo:', e);
            return false;
        }
    }

    // DISPARO 2: Notificar quando outro usuário enviar mensagem no chat
    function notificarNovaMensagem({ destinatario, remetente, produtoTitulo, textoMensagem, conversaId }) {
        try {
            const getLogado = (window.ItaimSessaoAuth && window.ItaimSessaoAuth.obterUsuarioLogado) || 
                              (window.ItaimSessao && window.ItaimSessao.obterUsuarioLogado);
            const userRemetente = remetente || (getLogado ? getLogado() : {});
            const emailDestino = resolverEmailDestinatario(destinatario);
            const emailRemetente = (userRemetente?.email || obterEmailUsuarioAtivo()).toLowerCase().trim();

            if (emailDestino === emailRemetente) return false;

            const previewTexto = (textoMensagem || '').length > 60 
                ? (textoMensagem || '').substring(0, 57) + '...' 
                : textoMensagem;

            const tit = produtoTitulo ? `Nova mensagem sobre "${produtoTitulo}"` : `Nova mensagem de ${userRemetente.nome || 'Usuário'}`;

            return criarNotificacao({
                destinatario: emailDestino,
                tipo: 'mensagem',
                titulo: tit,
                texto: `${userRemetente.nome || 'Usuário'}: "${previewTexto}"`,
                link: (window.ItaimRotas ? (conversaId ? window.ItaimRotas.obterUrl('conversas', `id=${conversaId}`) : window.ItaimRotas.obterUrl('conversas')) : 'conversas.html'),
                icone: 'chat',
                tempo: 'Agora'
            });
        } catch(e) {
            console.warn('Erro ao notificar nova mensagem:', e);
            return false;
        }
    }

    // DISPARO 3: Notificar quando uma compra e venda for finalizada
    function notificarVendaFinalizada(produtoOuId, vendedor) {
        try {
            let produto = produtoOuId;
            if (typeof produtoOuId === 'number' || typeof produtoOuId === 'string') {
                const getProds = (window.ItaimSessaoProdutos && window.ItaimSessaoProdutos.obterTodosProdutos) ||
                                 (window.ItaimSessao && window.ItaimSessao.obterTodosProdutos);
                const todos = getProds ? getProds() : [];
                produto = todos.find(p => String(p.id) === String(produtoOuId));
            }
            if (!produto) return false;

            const getLogado = (window.ItaimSessaoAuth && window.ItaimSessaoAuth.obterUsuarioLogado) || 
                              (window.ItaimSessao && window.ItaimSessao.obterUsuarioLogado);
            const userVendedor = vendedor || (getLogado ? getLogado() : {});

            // 1. Notifica o vendedor
            criarNotificacao({
                destinatario: userVendedor.email,
                tipo: 'compra',
                titulo: 'Venda finalizada com sucesso!',
                texto: `Parabéns! Seu anúncio "${produto.titulo}" foi finalizado e marcado como vendido.`,
                link: (window.ItaimRotas ? window.ItaimRotas.obterUrl('meus-anuncios') : 'meus-anuncios.html'),
                icone: 'sucesso',
                tempo: 'Agora'
            });

            // 2. Notifica outros usuários que tinham salvo esse produto nos favoritos
            const getUsuarios = (window.ItaimSessaoAuth && window.ItaimSessaoAuth.carregarUsuarios) || 
                                (window.ItaimSessao && window.ItaimSessao.obterTodosUsuarios);
            const todosUsuarios = getUsuarios ? getUsuarios() : [];
            todosUsuarios.forEach(u => {
                const uEmail = (u.email || '').toLowerCase().trim();
                if (uEmail !== (userVendedor.email || '').toLowerCase().trim()) {
                    const favs = JSON.parse(localStorage.getItem('itaim_favoritos_' + uEmail) || '[]');
                    if (Array.isArray(favs) && favs.includes(produto.id)) {
                        criarNotificacao({
                            destinatario: uEmail,
                            tipo: 'compra',
                            titulo: 'Anúncio vendido',
                            texto: `O anúncio "${produto.titulo}" que estava nos seus favoritos foi finalizado/vendido.`,
                            link: (window.ItaimRotas ? window.ItaimRotas.obterUrl('produto', `id=${produto.id}`) : `produto.html?id=${produto.id}`),
                            icone: 'sucesso',
                            tempo: 'Agora'
                        });
                    }
                }
            });

            return true;
        } catch(e) {
            console.warn('Erro ao notificar venda finalizada:', e);
            return false;
        }
    }

    // DISPARO 4: Notificar quando houver mudança de preço de um anúncio
    function notificarMudancaPreco(produtoOuId, precoAntigo, precoNovo) {
        try {
            let produto = produtoOuId;
            if (typeof produtoOuId === 'number' || typeof produtoOuId === 'string') {
                const getProds = (window.ItaimSessaoProdutos && window.ItaimSessaoProdutos.obterTodosProdutos) ||
                                 (window.ItaimSessao && window.ItaimSessao.obterTodosProdutos);
                const todos = getProds ? getProds() : [];
                produto = todos.find(p => String(p.id) === String(produtoOuId));
            }
            if (!produto) return false;

            const formatMoeda = val => Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            const textoPreco = precoAntigo && precoAntigo !== precoNovo
                ? `O preço do anúncio "${produto.titulo}" mudou de ${formatMoeda(precoAntigo)} para ${formatMoeda(precoNovo)}.`
                : `O anúncio "${produto.titulo}" teve seu preço atualizado para ${formatMoeda(precoNovo)}.`;

            const getUsuarios = (window.ItaimSessaoAuth && window.ItaimSessaoAuth.carregarUsuarios) || 
                                (window.ItaimSessao && window.ItaimSessao.obterTodosUsuarios);
            const todosUsuarios = getUsuarios ? getUsuarios() : [];
            const vendedorEmail = (produto.vendedorEmail || '').toLowerCase().trim();

            todosUsuarios.forEach(u => {
                const uEmail = (u.email || '').toLowerCase().trim();
                if (uEmail !== vendedorEmail) {
                    const favs = JSON.parse(localStorage.getItem('itaim_favoritos_' + uEmail) || '[]');
                    if (Array.isArray(favs) && favs.includes(produto.id)) {
                        criarNotificacao({
                            destinatario: uEmail,
                            tipo: 'preco',
                            titulo: 'Mudança de preço em item salvo',
                            texto: textoPreco,
                            link: (window.ItaimRotas ? window.ItaimRotas.obterUrl('produto', `id=${produto.id}`) : `produto.html?id=${produto.id}`),
                            icone: 'preco',
                            tempo: 'Agora'
                        });
                    }
                }
            });

            return true;
        } catch(e) {
            console.warn('Erro ao notificar mudança de preço:', e);
            return false;
        }
    }

    // DISPARO 5: Notificar quando um usuário avaliar o perfil
    function notificarNovaAvaliacao(vendedorOuDestinatario, review) {
        try {
            if (!review) return false;
            const emailDestino = resolverEmailDestinatario(vendedorOuDestinatario);
            if (!emailDestino) return false;

            const getLogado = (window.ItaimSessaoAuth && window.ItaimSessaoAuth.obterUsuarioLogado) || 
                              (window.ItaimSessao && window.ItaimSessao.obterUsuarioLogado);
            const userLogado = getLogado ? getLogado() : {};
            const autorNome = review.autor || userLogado?.nome || 'Um usuário';
            const emailRemetente = (userLogado?.email || '').toLowerCase().trim();

            if (emailDestino === emailRemetente && emailDestino !== 'admin@gmail.com') {
                return false;
            }

            const estrelas = Math.round(Number(review.nota) || 5);
            const estrelasTexto = '★'.repeat(estrelas) + '☆'.repeat(5 - estrelas);
            const comentarioCurto = (review.comentario || '').trim();
            const previewComentario = comentarioCurto.length > 55
                ? comentarioCurto.substring(0, 52) + '...'
                : comentarioCurto;

            const textoNotif = previewComentario 
                ? `${autorNome} avaliou você com ${estrelasTexto}: "${previewComentario}"`
                : `${autorNome} avaliou o seu perfil com ${estrelasTexto}.`;

            return criarNotificacao({
                destinatario: emailDestino,
                tipo: 'avaliacao',
                titulo: 'Nova avaliação no seu perfil',
                texto: textoNotif,
                link: (window.ItaimRotas ? window.ItaimRotas.obterUrl('perfil', '#perfil-secao-avaliacoes') : 'perfil.html#perfil-secao-avaliacoes'),
                icone: 'avaliacao',
                tempo: 'Agora'
            });
        } catch(e) {
            console.warn('Erro ao notificar nova avaliação:', e);
            return false;
        }
    }

    function atualizarBadgesNotificacoes() {
        const lista = obterNotificacoes();
        const naoLidas = lista.filter(n => !n.lida).length;

        // Badge no ícone do cabeçalho
        const btnNotif = document.getElementById('btn-notificacoes');
        if (btnNotif) {
            let badge = btnNotif.querySelector('.badge-contador-notif');
            if (naoLidas > 0) {
                if (!badge) {
                    badge = document.createElement('span');
                    badge.className = 'badge-contador-notif';
                    btnNotif.appendChild(badge);
                }
                badge.textContent = naoLidas > 99 ? '99+' : naoLidas;
                badge.style.display = 'inline-block';
            } else if (badge) {
                badge.remove();
            }
        }

        // Badge no menu lateral (drawer)
        const linkDrawer = document.getElementById('drawer-link-notificacoes');
        if (linkDrawer) {
            let drawerBadge = linkDrawer.querySelector('.drawer-badge-notif');
            if (naoLidas > 0) {
                if (!drawerBadge) {
                    drawerBadge = document.createElement('span');
                    drawerBadge.className = 'drawer-badge-notif';
                    linkDrawer.appendChild(drawerBadge);
                }
                drawerBadge.textContent = naoLidas;
                drawerBadge.style.display = 'inline-block';
            } else if (drawerBadge) {
                drawerBadge.remove();
            }
        }
    }

    // Exporta API de Notificações
    window.ItaimNotificacoes = {
        obterNotificacoes,
        salvarNotificacoes,
        criarNotificacao,
        atualizarBadgesNotificacoes,
        obterConfiguracoesNotificacoes,
        notificarItemSalvo,
        notificarNovaMensagem,
        notificarVendaFinalizada,
        notificarMudancaPreco,
        notificarNovaAvaliacao,
        exibirToastGlobal
    };

})();


// ==========================================================================
// MÓDULO: AVALIAÇÕES & REPUTAÇÃO (sessao-avaliacoes.js)
// ==========================================================================

/**
 * ITAIM VENDE - MÓDULO DE AVALIAÇÕES E REPUTAÇÃO DO VENDEDOR
 * Arquivo: frontend/js/core/sessao/sessao-avaliacoes.js
 * 
 * Responsabilidades:
 * - Sistema de avaliações (1 a 5 estrelas) por vendedor/usuário
 * - Cálculo dinâmico e em tempo real da média de notas
 * - Purgação de comentários falsos/estáticos de mockup
 * - Atualização da reputação no cadastro do vendedor em itaim_usuarios_db
 * - Disparo de notificação para o vendedor ao receber nova avaliação
 */

(function() {
    'use strict';

    // Helper interno para carregar a base de usuários com segurança
    function obterListaUsuarios() {
        if (window.ItaimSessaoAuth && typeof window.ItaimSessaoAuth.carregarUsuarios === 'function') {
            return window.ItaimSessaoAuth.carregarUsuarios();
        }
        if (window.ItaimSessao && typeof window.ItaimSessao.obterTodosUsuarios === 'function') {
            return window.ItaimSessao.obterTodosUsuarios();
        }
        try {
            return JSON.parse(localStorage.getItem('itaim_usuarios_db') || '[]');
        } catch(e) {
            return [];
        }
    }

    // Helper interno para salvar a base de usuários
    function salvarListaUsuarios(usuarios) {
        try {
            localStorage.setItem('itaim_usuarios_db', JSON.stringify(usuarios));
        } catch(e) {}
    }

    // Helper para disparar notificação de avaliação
    function dispararNotificacaoAvaliacao(vendedor, novaAvaliacao) {
        if (window.ItaimNotificacoes && typeof window.ItaimNotificacoes.notificarNovaAvaliacao === 'function') {
            window.ItaimNotificacoes.notificarNovaAvaliacao(vendedor, novaAvaliacao);
        } else if (window.ItaimSessao && typeof window.ItaimSessao.notificarNovaAvaliacao === 'function') {
            window.ItaimSessao.notificarNovaAvaliacao(vendedor, novaAvaliacao);
        }
    }

    // ========================================================================
    // API GLOBAL DE AVALIAÇÕES (0 A 5 ESTRELAS) TOTALMENTE FUNCIONAL
    // ========================================================================
    const ItaimAvaliacoes = {
        /**
         * Gera chave única e sanitizada de armazenamento para cada vendedor
         */
        obterChave: function(vendedor) {
            if (!vendedor) return 'seller_admin';
            
            // Se for string (email, username ou nome)
            if (typeof vendedor === 'string') {
                const s = vendedor.toLowerCase().trim();
                const todos = obterListaUsuarios();
                const u = todos.find(user => 
                    (user.email || '').toLowerCase() === s || 
                    (user.username || '').toLowerCase() === s ||
                    (user.nome || '').toLowerCase() === s
                );
                if (u) return 'seller_' + (u.username || u.id || 'admin').toLowerCase();
                return 'seller_' + s.replace(/[^a-z0-9]/g, '_');
            }

            // Se for objeto de vendedor/usuário
            if (typeof vendedor === 'object') {
                const todos = obterListaUsuarios();
                const vId = vendedor.id ? String(vendedor.id) : null;
                const vEmail = (vendedor.email || '').toLowerCase().trim();
                const vUser = (vendedor.username || '').toLowerCase().trim();
                const vNome = (vendedor.nome || '').toLowerCase().trim();

                const u = todos.find(user => 
                    (vId && String(user.id) === vId) ||
                    (vEmail && (user.email || '').toLowerCase() === vEmail) ||
                    (vUser && (user.username || '').toLowerCase() === vUser) ||
                    (vNome && (user.nome || '').toLowerCase() === vNome)
                );

                if (u) {
                    return 'seller_' + (u.username || u.id || 'admin').toLowerCase();
                }

                const fallback = vUser || vEmail || vNome || (vId ? 'id_' + vId : 'admin');
                return 'seller_' + fallback.replace(/[^a-z0-9]/g, '_');
            }

            return 'seller_admin';
        },

        /**
         * Obtém lista de avaliações do vendedor, purga comentários falsos de mock
         */
        obter: function(vendedor) {
            const chave = 'itaim_avaliacoes_' + this.obterChave(vendedor);
            let lista = [];
            try {
                const salvo = localStorage.getItem(chave);
                if (salvo) {
                    const parsed = JSON.parse(salvo);
                    if (Array.isArray(parsed)) {
                        // Purga comentários falsos de enfeite
                        lista = parsed.filter(item => {
                            if (!item) return false;
                            const autor = (item.autor || '').trim();
                            const com = (item.comentario || '').trim();
                            if (autor === 'Lucas Ribeiro' || autor === 'Ana Paula') return false;
                            if (com.includes('WhatsApp e o produto veio exatamente')) return false;
                            if (com.includes('Negociação tranquila e segura')) return false;
                            return true;
                        });
                        // Salva se filtrou algum falso
                        if (lista.length !== parsed.length) {
                            localStorage.setItem(chave, JSON.stringify(lista));
                        }
                    }
                }
            } catch(e) {}

            return lista;
        },

        /**
         * Adiciona nova avaliação para o vendedor e recalcula reputação
         */
        adicionar: function(vendedor, review) {
            const chave = 'itaim_avaliacoes_' + this.obterChave(vendedor);
            const lista = this.obter(vendedor);
            const novaNota = Math.min(5, Math.max(1, parseFloat(review.nota) || 5));
            const novoComentario = (review.comentario || '').trim();
            const autorNome = (review.autor || '').trim() || 'Comprador';

            if (!novoComentario) return lista;

            const novaAvaliacao = {
                id: Date.now(),
                autor: autorNome,
                nota: novaNota,
                data: 'Hoje',
                comentario: novoComentario
            };

            lista.unshift(novaAvaliacao);

            try {
                localStorage.setItem(chave, JSON.stringify(lista));
            } catch(e) {}

            // Recalcula média e atualiza permanentemente no cadastro do vendedor
            const stats = this.calcularMedia(lista);
            try {
                const todos = obterListaUsuarios();
                const chaveVend = this.obterChave(vendedor);
                const uIdx = todos.findIndex(u => this.obterChave(u) === chaveVend);
                if (uIdx !== -1) {
                    todos[uIdx].avaliacao = stats.media;
                    todos[uIdx].totalAvaliacoes = stats.total;
                    salvarListaUsuarios(todos);
                }
            } catch(e) {}

            // Dispara notificação de avaliação para o vendedor
            try {
                dispararNotificacaoAvaliacao(vendedor, novaAvaliacao);
            } catch(e) {}

            return lista;
        },

        /**
         * Exclui uma avaliação e recalcula reputação
         */
        excluir: function(vendedor, idAvaliacao) {
            const chave = 'itaim_avaliacoes_' + this.obterChave(vendedor);
            let lista = this.obter(vendedor);
            lista = lista.filter(item => String(item.id) !== String(idAvaliacao));

            try {
                localStorage.setItem(chave, JSON.stringify(lista));
            } catch(e) {}

            // Recalcula média e atualiza permanentemente no cadastro do vendedor
            const stats = this.calcularMedia(lista);
            try {
                const todos = obterListaUsuarios();
                const chaveVend = this.obterChave(vendedor);
                const uIdx = todos.findIndex(u => this.obterChave(u) === chaveVend);
                if (uIdx !== -1) {
                    todos[uIdx].avaliacao = stats.media;
                    todos[uIdx].totalAvaliacoes = stats.total;
                    salvarListaUsuarios(todos);
                }
            } catch(e) {}

            return lista;
        },

        /**
         * Calcula média e total de avaliações formatados
         */
        calcularMedia: function(lista, perfil = null) {
            if (!lista || !Array.isArray(lista) || lista.length === 0) {
                if (perfil && (perfil.totalAvaliacoes || perfil.ratingCount || (perfil.email && perfil.email.toLowerCase() === 'admin@gmail.com'))) {
                    const totalRatings = perfil.ratingCount || perfil.totalAvaliacoes || 18;
                    const mediaVal = Number(perfil.ratingAverage || perfil.avaliacao || 5.0).toFixed(1);
                    return {
                        media: mediaVal,
                        mediaNum: parseFloat(mediaVal),
                        total: totalRatings,
                        estrelasFormatadas: `${mediaVal} ★`
                    };
                }
                return {
                    media: '0.0',
                    mediaNum: 0,
                    total: 0,
                    estrelasFormatadas: '0.0 ★'
                };
            }
            const soma = lista.reduce((acc, curr) => acc + (parseFloat(curr.nota) || 0), 0);
            const mediaNum = soma / lista.length;
            const mediaStr = mediaNum.toFixed(1);
            return {
                media: mediaStr,
                mediaNum: mediaNum,
                total: lista.length,
                estrelasFormatadas: `${mediaStr} ★`
            };
        }
    };

    // Exporta API no namespace global e dedicado
    window.ItaimAvaliacoes = ItaimAvaliacoes;
    window.ItaimSessaoAvaliacoes = ItaimAvaliacoes;

})();


// ==========================================================================
// MÓDULO: INTERFACE & CABEÇALHO (sessao-ui.js)
// ==========================================================================

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

    // Helper para redirecionar visitante para a tela de login preservando a intenção (returnTo)
    function redirecionarParaLogin(motivo = '') {
        const urlAtual = window.location.href;
        let query = 'returnTo=' + encodeURIComponent(urlAtual);
        if (motivo) {
            query += '&mensagem=' + encodeURIComponent(motivo);
        }
        const urlLogin = window.ItaimRotas ? window.ItaimRotas.obterUrl('login', query) : ('../../index.html?' + query);
        window.location.href = urlLogin;
    }

    // Helper interno para obter usuário logado de forma resiliente
    function obterUsuario() {
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

            // Oculta todos os botões do usuário: Meus Anúncios, Vender, Conversas, Perfil e Notificações
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
                '.perfil-wrapper'
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

            // Altera botão de sair para Entrar / Cadastrar
            const urlLogin = window.ItaimRotas ? window.ItaimRotas.obterUrl('login') : '../../index.html';
            document.querySelectorAll('.item-sair').forEach(el => {
                el.innerHTML = `
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                        <polyline points="10 17 15 12 10 7"></polyline>
                        <line x1="15" y1="12" x2="3" y2="12"></line>
                    </svg>
                    <span>Entrar / Cadastrar</span>
                `;
                el.setAttribute('href', urlLogin);
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
            '.perfil-wrapper'
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

        // Restaura texto de Sair se necessário
        document.querySelectorAll('.item-sair').forEach(el => {
            el.innerHTML = `
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                <span>Sair</span>
            `;
            el.setAttribute('href', window.ItaimRotas ? window.ItaimRotas.obterUrl('login') : '../../index.html');
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
        const paginasProtegidas = [
            'vender.html',
            'meus-anuncios.html',
            'perfil.html',
            'configuracoes.html',
            'favoritos.html',
            'notificacoes.html',
            'conversas.html',
            'chat.html'
        ];

        const precisaProtecao = paginasProtegidas.some(p => path.endsWith('/' + p) || path.includes('/' + p));
        if (precisaProtecao) {
            // Se estiver em Modo Dev (Live Server / sem backend), nunca expulsa o desenvolvedor
            const isDev = (window.ItaimSessaoAuth && typeof window.ItaimSessaoAuth.isModoDevFrontend === 'function' && window.ItaimSessaoAuth.isModoDevFrontend())
                || (window.ItaimSessao && typeof window.ItaimSessao.isModoDevFrontend === 'function' && window.ItaimSessao.isModoDevFrontend());
            if (isDev) {
                if (window.ItaimSessaoAuth && typeof window.ItaimSessaoAuth.garantirSessaoDevFrontend === 'function') {
                    window.ItaimSessaoAuth.garantirSessaoDevFrontend();
                }
                return true;
            }

            if (!usuarioEstaAutenticado()) {
                redirecionarParaLogin('Faça login para acessar esta página.');
                return false;
            }
        }
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

        // Clique no botão de perfil
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
            if (badgeFav) badgeFav.textContent = usuarioEstaAutenticado() ? favs.length : 0;
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

    // Interceptor global de cliques para visitantes não autenticados
    document.addEventListener('click', (e) => {
        if (usuarioEstaAutenticado()) return;

        // Seletor abrangente de ações e botões interativos
        const elementoInteracao = e.target.closest(`
            #btn-abrir-modal-vender,
            .btn-vender-destaque,
            #drawer-link-vender,
            a[href*="vender.html"],
            #link-meus-anuncios,
            #btn-meus-anuncios-mobile,
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
            #btn-avatar-dropdown,
            .btn-avatar-header,
            #drawer-link-perfil,
            #link-menu-perfil,
            a[href*="perfil.html"],
            #drawer-link-configuracoes,
            #link-menu-configuracoes,
            a[href*="configuracoes.html"],
            #btn-abrir-denuncia,
            #btn-ver-meus-tickets
        `);

        if (elementoInteracao) {
            // Ignora se for o link de login / cadastro / sair
            if (elementoInteracao.classList.contains('item-sair') || elementoInteracao.closest('.item-sair')) {
                return;
            }

            e.preventDefault();
            e.stopPropagation();

            let motivo = 'Faça login para interagir na plataforma.';
            const id = elementoInteracao.id || '';
            const href = elementoInteracao.getAttribute('href') || '';
            const classes = elementoInteracao.className || '';

            if (id.includes('vender') || href.includes('vender.html') || classes.includes('vender')) {
                motivo = 'Faça login para anunciar e vender seus produtos.';
            } else if (id.includes('anuncios') || href.includes('meus-anuncios.html')) {
                motivo = 'Faça login para gerenciar seus anúncios.';
            } else if (id.includes('chat') || href.includes('conversas.html') || href.includes('chat.html')) {
                motivo = 'Faça login para conversar com os vendedores.';
            } else if (id.includes('notificacoes') || href.includes('notificacoes.html')) {
                motivo = 'Faça login para visualizar suas notificações.';
            } else if (id.includes('favorito') || href.includes('favoritos.html') || classes.includes('btn-favorito')) {
                motivo = 'Faça login para salvar anúncios nos seus favoritos.';
            } else if (id.includes('perfil') || href.includes('perfil.html')) {
                motivo = 'Faça login para acessar seu perfil.';
            } else if (id.includes('configuracoes') || href.includes('configuracoes.html')) {
                motivo = 'Faça login para acessar as configurações.';
            } else if (id.includes('denuncia') || id.includes('tickets')) {
                motivo = 'Faça login para abrir denúncias ou acompanhar tickets.';
            }

            redirecionarParaLogin(motivo);
        }
    }, true);

    // Exporta API de UI no namespace dedicado
    window.ItaimSessaoUI = {
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


// ==========================================================================
// MÓDULO: ORQUESTRADOR GLOBAL (INDEX) (sessao-orquestrador.js)
// ==========================================================================

/**
 * ITAIM VENDE - ORQUESTRADOR CENTRAL DO CORE DE SESSÃO
 * Arquivo: frontend/js/core/sessao/index.js
 * 
 * Unifica todos os submódulos da pasta sessao/ sob a API global window.ItaimSessao:
 * - sessao-auth.js: Autenticação, isolamento de contas e usuários
 * - sessao-produtos.js: Anúncios, catálogo e persistência
 * - sessao-notificacoes.js: Centro de notificações, toasts e eventos
 * - sessao-avaliacoes.js: Sistema de avaliações e reputação (1 a 5 estrelas)
 * - sessao-ui.js: Cabeçalho, drawer, busca e fotos
 */

(function() {
    'use strict';

    const Auth = window.ItaimSessaoAuth || {};
    const Produtos = window.ItaimSessaoProdutos || {};
    const Notificacoes = window.ItaimNotificacoes || {};
    const Avaliacoes = window.ItaimAvaliacoes || {};
    const UI = window.ItaimSessaoUI || {};

    // API Global Unificada ItaimSessao (100% retrocompatível com todo o frontend)
    const ItaimSessao = {
        // --- UI & Navegação ---
        protegerPagina: UI.protegerPagina || (() => true),
        redirecionarParaLogin: UI.redirecionarParaLogin || (() => {}),
        atualizarHeaderUsuario: UI.atualizarHeaderUsuario || (() => {}),
        ajustarFoto: (window.ItaimFoto && window.ItaimFoto.ajustar) || UI.ajustarFotoSimples || (() => {}),
        tema: window.ItaimTema || {},

        // --- Autenticação e Usuários ---
        isModoDevFrontend: Auth.isModoDevFrontend || (() => false),
        garantirSessaoDevFrontend: Auth.garantirSessaoDevFrontend || (() => {}),
        ativarModoDevFrontend: Auth.ativarModoDevFrontend || (() => {}),
        desativarModoDevFrontend: Auth.desativarModoDevFrontend || (() => {}),
        usuarioEstaAutenticado: Auth.usuarioEstaAutenticado || (() => !!(localStorage.getItem('itaim_token') && localStorage.getItem('itaim_usuario_logado'))),
        deslogarUsuario: Auth.deslogarUsuario || (() => {}),
        obterUsuarioLogado: Auth.obterUsuarioLogado || (() => null),
        definirUsuarioLogado: Auth.definirUsuarioLogado || (() => null),
        obterTodosUsuarios: Auth.obterTodosUsuarios || (() => []),
        obterUsuarioPorEmail: Auth.obterUsuarioPorEmail || (() => null),
        obterUsuarioPorUsername: Auth.obterUsuarioPorUsername || (() => null),
        cadastrarNovoUsuario: Auth.cadastrarNovoUsuario || (() => null),
        atualizarDadosUsuario: Auth.atualizarDadosUsuario || (() => null),
        obterConfiguracoes: Auth.obterConfiguracoes || (() => ({})),
        suspenderConta: Auth.suspenderConta || (() => false),
        excluirContaPermanentemente: Auth.excluirContaPermanentemente || (() => false),
        formatarTelefoneBR: Auth.formatarTelefoneBR || (t => t),

        // --- Produtos e Anúncios ---
        obterTodosProdutos: Produtos.obterTodosProdutos || (() => []),
        obterAnunciosDoUsuario: Produtos.obterAnunciosDoUsuario || (() => []),
        adicionarNovoAnuncio: Produtos.adicionarNovoAnuncio || (() => null),
        atualizarStatusAnuncio: Produtos.atualizarStatusAnuncio || (() => false),
        excluirAnuncio: Produtos.excluirAnuncio || (() => false),
        limparDadosZerados: Produtos.limparDadosZerados || (() => {}),

        // --- Avaliações ---
        avaliacoes: Avaliacoes,

        // --- Notificações ---
        obterNotificacoes: Notificacoes.obterNotificacoes || (() => []),
        salvarNotificacoes: Notificacoes.salvarNotificacoes || (() => {}),
        criarNotificacao: Notificacoes.criarNotificacao || (() => {}),
        atualizarBadgesNotificacoes: Notificacoes.atualizarBadgesNotificacoes || (() => {}),
        obterConfiguracoesNotificacoes: Notificacoes.obterConfiguracoesNotificacoes || (() => ({})),
        notificarItemSalvo: Notificacoes.notificarItemSalvo || (() => {}),
        notificarNovaMensagem: Notificacoes.notificarNovaMensagem || (() => {}),
        notificarVendaFinalizada: Notificacoes.notificarVendaFinalizada || (() => {}),
        notificarMudancaPreco: Notificacoes.notificarMudancaPreco || (() => {}),
        notificarNovaAvaliacao: Notificacoes.notificarNovaAvaliacao || (() => {}),
        exibirToastGlobal: Notificacoes.exibirToastGlobal || (() => {})
    };

    window.ItaimSessao = ItaimSessao;

    // Inicialização da Sessão e Interface (Bootstrap)
    function bootstrap() {
        if (typeof Produtos.limparDadosZerados === 'function') {
            Produtos.limparDadosZerados();
        }
        if (typeof Auth.carregarUsuarios === 'function') {
            Auth.carregarUsuarios();
        }
        if (typeof UI.atualizarHeaderUsuario === 'function') {
            UI.atualizarHeaderUsuario();
        }
        if (typeof UI.inicializarHeaderGlobal === 'function') {
            UI.inicializarHeaderGlobal();
        }

        // Sincroniza dados e foto real do usuário com o backend se estiver autenticado com token
        if (window.ItaimApi && window.ItaimApi.auth && typeof window.ItaimApi.auth.obterToken === 'function' && window.ItaimApi.auth.obterToken()) {
            window.ItaimApi.auth.perfil().then(res => {
                if (res && res.user) {
                    localStorage.setItem('itaim_usuario_logado', JSON.stringify(res.user));
                    localStorage.setItem('itaim_usuario_logado_email', res.user.email);
                    if (typeof Auth.definirUsuarioLogado === 'function') {
                        Auth.definirUsuarioLogado(res.user.email, res.user);
                    }
                    if (typeof UI.atualizarHeaderUsuario === 'function') {
                        UI.atualizarHeaderUsuario();
                    }
                    window.dispatchEvent(new CustomEvent('itaim:usuario-atualizado', { detail: res.user }));
                }
            }).catch(() => {});
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootstrap);
    } else {
        bootstrap();
    }

    // Listener global para botões de sair / logout
    document.addEventListener('click', (e) => {
        const btnSair = e.target.closest('.item-sair, #btn-sair-banner');
        if (btnSair) {
            if (typeof Auth.deslogarUsuario === 'function') {
                Auth.deslogarUsuario();
            }
        }
    });

})();


