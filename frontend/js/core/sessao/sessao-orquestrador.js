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
        abrirModalAuth: UI.abrirModalAuth || (() => {}),
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
        atualizarAnuncio: Produtos.atualizarAnuncio || (() => false),
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
        exibirToastGlobal: Notificacoes.exibirToastGlobal || (() => {}),
        obterFavoritosIds: function() {
            const estaAutenticado = (typeof Auth.usuarioEstaAutenticado === 'function')
                ? Auth.usuarioEstaAutenticado()
                : !!(localStorage.getItem('itaim_token') && localStorage.getItem('itaim_usuario_logado'));
            if (!estaAutenticado) {
                try { localStorage.removeItem('itaim_favoritos'); } catch(e) {}
                return [];
            }
            try {
                const salvos = JSON.parse(localStorage.getItem('itaim_favoritos') || '[]');
                return Array.isArray(salvos) ? salvos.map(String) : [];
            } catch(e) {
                return [];
            }
        }
    };

    window.ItaimSessao = ItaimSessao;

    // Inicialização da Sessão e Interface (Bootstrap)
    function bootstrap() {
        // Se houver resquício de mock dev antigo sem o modo dev ativado, limpa
        const tokenAtual = localStorage.getItem('itaim_token');
        const modoDevAtivo = localStorage.getItem('itaim_modo_dev') === 'true';
        if (!modoDevAtivo && (tokenAtual === 'token_mock_dev_frontend' || tokenAtual === 'dev_mock_admin_token')) {
            try {
                localStorage.removeItem('itaim_token');
                localStorage.removeItem('itaim_usuario_logado');
                localStorage.removeItem('itaim_usuario_logado_email');
            } catch (e) {}
        }

        // Suporte a ativação e desativação via comando de URL (?dev=true, ?dev=off, etc.)
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const devParam = (urlParams.get('dev') || urlParams.get('modo') || '').toLowerCase();
            if (devParam === 'true' || devParam === '1' || devParam === 'dev') {
                const perfilUrl = urlParams.get('perfil') === 'admin' ? 'admin' : 'dev';
                if (typeof Auth.ativarModoDevFrontend === 'function') {
                    Auth.ativarModoDevFrontend(perfilUrl);
                }
            } else if (devParam === 'false' || devParam === 'off' || devParam === '0' || devParam === 'desativar') {
                if (typeof Auth.desativarModoDevFrontend === 'function') {
                    Auth.desativarModoDevFrontend();
                } else {
                    localStorage.removeItem('itaim_modo_dev');
                    localStorage.removeItem('itaim_token');
                    localStorage.removeItem('itaim_usuario_logado');
                    localStorage.removeItem('itaim_usuario_logado_email');
                }
            }
        } catch (e) {}

        // Limpa favoritos residuais de visitante não autenticado
        const visitanteLogado = (typeof Auth.usuarioEstaAutenticado === 'function')
            ? Auth.usuarioEstaAutenticado()
            : !!(localStorage.getItem('itaim_token') && localStorage.getItem('itaim_usuario_logado'));
        if (!visitanteLogado) {
            try { localStorage.removeItem('itaim_favoritos'); } catch(e) {}
        }

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

        // Sincroniza dados e foto real do usuário com o backend se estiver autenticado com token (apenas se NÃO for modo dev)
        const isModoDevAtual = localStorage.getItem('itaim_modo_dev') === 'true';
        if (!isModoDevAtual && window.ItaimApi && window.ItaimApi.auth && typeof window.ItaimApi.auth.obterToken === 'function' && window.ItaimApi.auth.obterToken()) {
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
            }).catch(err => {
                if (err && (err.status === 401 || err.status === 403)) {
                    if (typeof Auth.deslogarUsuario === 'function') {
                        Auth.deslogarUsuario();
                    }
                }
            });
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
            // Se o botão for de entrar ou o visitante não estiver autenticado, não executa logout
            if (btnSair.classList.contains('item-entrar') || (typeof Auth.usuarioEstaAutenticado === 'function' && !Auth.usuarioEstaAutenticado())) {
                return;
            }
            if (typeof Auth.deslogarUsuario === 'function') {
                Auth.deslogarUsuario();
            }
        }
    });

})();
