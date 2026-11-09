/**
 * ITAIM VENDE - CLIENTE HTTP CENTRAL (CORE API)
 * Arquivo: frontend/js/core/api/api-core.js
 * 
 * Responsabilidades:
 * - Resolução inteligente de URLs (desenvolvimento localhost vs produção)
 * - Obtenção e injeção do JWT Bearer Token
 * - Tratamento centralizado de erros HTTP (401, 204, etc.)
 * - Resolução e normalização de URLs de imagens do backend e placeholders
 * - Conversão de dataURL (base64) para Blob para upload multipart
 */

(function() {
    'use strict';

    // Determina a URL base do backend de forma inteligente:
    // 1. Variável global window.ITAI_API_URL (se customizada)
    // 2. Localhost:3000 (ambiente de desenvolvimento local)
    // 3. /api relativo (produção com reverse proxy)
    const BACKEND_HOST = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://localhost:3000'
        : '';

    const API_BASE_URL = window.ITAI_API_URL || `${BACKEND_HOST}/api/v1`;

    /**
     * Recupera o token JWT salvo no localStorage
     */
    function obterToken() {
        return localStorage.getItem('itaim_token') || '';
    }

    /**
     * Monta headers padrão para requisições JSON, injetando Bearer Token se disponível
     */
    function obterHeaders(isJson = true) {
        const headers = {};
        if (isJson) {
            headers['Content-Type'] = 'application/json';
        }
        const token = obterToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    }

    /**
     * Executa requisição fetch com tratamento padronizado de erro,
     * detecção de reinicialização do backend e expiração de sessão.
     */
    async function requisicao(endpoint, opcoes = {}) {
        const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
        
        // Injeta automaticamente os headers padrão com Content-Type e Authorization Bearer
        const isFormData = (opcoes.body instanceof FormData);
        const headersPadrao = obterHeaders(!isFormData);
        const headersFinais = {
            ...headersPadrao,
            ...(opcoes.headers || {})
        };

        if (isFormData) {
            delete headersFinais['Content-Type'];
        }

        const opcoesFinais = {
            ...opcoes,
            headers: headersFinais
        };

        try {
            const resposta = await fetch(url, opcoesFinais);
            
            // 1. Registra header X-Server-Boot se disponível
            const serverBoot = resposta.headers.get('X-Server-Boot');
            if (serverBoot) {
                localStorage.setItem('itaim_server_boot', serverBoot);
            }

            // Tratamento especial para respostas 204 No Content
            if (resposta.status === 204) {
                return { success: true };
            }

            const dados = await resposta.json().catch(() => ({}));

            // 2. Tratamento de 401 Unauthorized:
            // Invalida a sessão se for erro 401 na rota GET /auth/me ou se o token estiver explicitamente expirado/inválido.
            // Erros 403 ou operações PUT/DELETE normais não deslogam desnecessariamente.
            if (resposta.status === 401) {
                const metodo = (opcoesFinais.method || 'GET').toUpperCase();
                const isAuthCheck = endpoint.includes('/auth/me') && metodo === 'GET';
                const isTokenExpired = dados && (dados.code === 'TOKEN_EXPIRED' || dados.code === 'TOKEN_INVALID' || dados.error === 'jwt expired');
                const isDevMode = localStorage.getItem('itaim_modo_dev') === 'true';
                if ((isAuthCheck || isTokenExpired) && obterToken() && !isDevMode) {
                    console.info('[ItaimApi] Sessão expirada ou token inválido. Limpando credenciais.');
                    if (window.ItaimSocket && typeof window.ItaimSocket.desconectar === 'function') {
                        window.ItaimSocket.desconectar();
                    }
                    if (window.ItaimSessao && typeof window.ItaimSessao.deslogarUsuario === 'function') {
                        window.ItaimSessao.deslogarUsuario();
                    } else {
                        localStorage.removeItem('itaim_token');
                        localStorage.removeItem('itaim_usuario_logado');
                        localStorage.removeItem('itaim_usuario_logado_email');
                        if (window.ItaimSessao && typeof window.ItaimSessao.atualizarHeaderUsuario === 'function') {
                            window.ItaimSessao.atualizarHeaderUsuario();
                        }
                    }
                }
            }

            if (!resposta.ok) {
                let msg = dados.message || `Erro HTTP ${resposta.status}`;
                if (dados.errors && Array.isArray(dados.errors) && dados.errors.length > 0) {
                    msg = dados.errors.map(e => e.message).join(' ');
                }
                const erro = new Error(msg);
                erro.status = resposta.status;
                erro.data = dados;
                throw erro;
            }

            // Registra carimbo de atividade bem-sucedida
            localStorage.setItem('itaim_ultima_atividade', Date.now().toString());

            return dados;
        } catch (erro) {
            console.warn(`[ItaimApi] Falha na requisição para ${endpoint}:`, erro.message);
            throw erro;
        }
    }

    /**
     * Converte dataURL (Base64) em Blob caso a imagem venha de um Canvas ou FileReader
     */
    function dataURLParaBlob(dataUrl) {
        const partes = dataUrl.split(';base64,');
        const contentType = partes[0].split(':')[1];
        const raw = window.atob(partes[1]);
        const rawLength = raw.length;
        const uInt8Array = new Uint8Array(rawLength);

        for (let i = 0; i < rawLength; ++i) {
            uInt8Array[i] = raw.charCodeAt(i);
        }

        return new Blob([uInt8Array], { type: contentType });
    }

    /**
     * Resolve URLs de imagens do backend (/uploads/...) ou caminhos relativos
     */
    function resolverUrlImagem(url) {
        const placeholder = (window.ItaimRotas && typeof window.ItaimRotas.obterAsset === 'function')
            ? window.ItaimRotas.obterAsset('assets/placeholders/produto-placeholder.svg')
            : (window.location.protocol && window.location.protocol.startsWith('http')
                ? '/assets/placeholders/produto-placeholder.svg'
                : (window.location.pathname.toLowerCase().includes('/pages/') ? '../../assets/placeholders/produto-placeholder.svg' : './assets/placeholders/produto-placeholder.svg'));

        if (!url) return placeholder;
        if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
            return url;
        }
        if (url.startsWith('/uploads/')) {
            return `${BACKEND_HOST}${url}`;
        }

        // Normaliza caminhos antigos ou prefixos legados
        let limpo = url
            .replace(/^(\.\.\/)+/, '')
            .replace(/^\.\//, '')
            .replace(/^assets\/images\/produtos\//, 'assets/produtos/')
            .replace(/^assets\/images\//, 'assets/');

        if (window.ItaimRotas && typeof window.ItaimRotas.obterAsset === 'function') {
            return window.ItaimRotas.obterAsset(limpo);
        }

        if (window.location.protocol && window.location.protocol.startsWith('http')) {
            return '/' + limpo;
        }

        const prefixo = window.location.pathname.toLowerCase().includes('/pages/') ? '../../' : './';
        return prefixo + limpo;
    }

    // Exporta no namespace do Core HTTP
    window.ItaimApiCore = {
        BACKEND_HOST,
        API_BASE_URL,
        obterToken,
        obterHeaders,
        requisicao,
        dataURLParaBlob,
        resolverUrlImagem
    };

})();
