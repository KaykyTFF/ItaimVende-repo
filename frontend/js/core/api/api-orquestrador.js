/**
 * ITAIM VENDE - CLIENTE DE API CENTRAL (ORQUESTRADOR UNIFICADO)
 * Arquivo: frontend/js/core/api/index.js
 * 
 * Unifica todos os serviços da pasta api/ sob a interface global window.ItaimApi:
 * - api-core.js: Cliente HTTP, tokens, headers e tratamento de imagens
 * - api-auth.js: Autenticação, login, registro, perfil e sessão
 * - api-produtos.js: Catálogo, anúncios e vitrine
 * - api-chat.js: Mensagens, conversas e negociações
 * - api-upload.js: Upload multipart (perfil, vendas, múltiplos)
 * - api-social.js: Categorias, favoritos e moderação/tickets
 * - api-sistema.js: Diagnósticos, painel de controle e status
 */

(function() {
    'use strict';

    const Core = window.ItaimApiCore || {};
    const Auth = window.ItaimApiAuth || {};
    const Produtos = window.ItaimApiProdutos || {};
    const Chat = window.ItaimApiChat || {};
    const Upload = window.ItaimApiUpload || {};
    const Social = window.ItaimApiSocial || {};
    const Enderecos = window.ItaimApiEnderecos || {};
    const Notificacoes = window.ItaimApiNotificacoes || {};
    const Sistema = window.ItaimApiSistema || {};

    const ItaimApi = {
        baseUrl: Core.API_BASE_URL || '',
        backendHost: Core.BACKEND_HOST || '',
        resolverUrlImagem: Core.resolverUrlImagem || (url => url),

        auth: Auth,
        produtos: Produtos,
        enderecos: Enderecos,
        notificacoes: Notificacoes,
        categorias: Social.categorias || {},
        favoritos: Social.favoritos || {},
        reports: Social.reports || {},
        chat: Chat,
        upload: Upload,
        sistema: Sistema
    };

    window.ItaimApi = ItaimApi;

    // =========================================================================
    // MONITOR PROFISSIONAL DE SESSÃO & REINICIALIZAÇÃO DO BACKEND
    // =========================================================================
    function obterTokenAtual() {
        if (typeof Core.obterToken === 'function') {
            return Core.obterToken();
        }
        return localStorage.getItem('itaim_token') || '';
    }

    function registrarAtividade() {
        if (obterTokenAtual()) {
            localStorage.setItem('itaim_ultima_atividade', Date.now().toString());
        }
    }

    if (typeof window !== 'undefined') {
        ['mousedown', 'keydown', 'touchstart', 'scroll'].forEach(evt => {
            window.addEventListener(evt, registrarAtividade, { passive: true });
        });

        // Sincronização passiva de boot do servidor
        setInterval(async () => {
            const token = obterTokenAtual();
            if (!token) return;

            try {
                const url = Core.API_BASE_URL ? `${Core.API_BASE_URL}/health` : '/api/health';
                const res = await fetch(url, {
                    method: 'GET',
                    cache: 'no-store',
                    headers: { 'Cache-Control': 'no-cache' }
                });
                const bootId = res.headers.get('X-Server-Boot');
                if (bootId) {
                    localStorage.setItem('itaim_server_boot', bootId);
                }
            } catch (err) {
                // Servidor offline ou reiniciando
            }
        }, 30000);
    }

})();
