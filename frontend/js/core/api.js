/**
 * ITAIM VENDE - CLIENTE DE API CENTRAL (BUNDLE UNIFICADO)
 * Arquivo: frontend/js/core/api.js
 * 
 * ATENÇÃO:
 * Este arquivo unifica de forma profissional os módulos da pasta:
 *   frontend/js/core/api/
 * 
 * Módulos integrantes:
 *   - api/api-core.js: Cliente HTTP, tokens, headers e tratamento de imagens
 *   - api/api-auth.js: Autenticação, login, registro, perfil e sessão
 *   - api/api-produtos.js: Catálogo, anúncios e vitrine
 *   - api/api-chat.js: Mensagens, conversas e negociações
 *   - api/api-upload.js: Upload multipart (perfil, vendas, múltiplos)
 *   - api/api-social.js: Categorias, favoritos e moderação/tickets
 *   - api/api-sistema.js: Diagnósticos, painel de controle e status
 *   - api/index.js: Orquestrador da API global window.ItaimApi
 * 
 * Para editar funcionalidades isoladas de forma modular, edite diretamente os
 * arquivos na pasta api/ e execute 'npm run build:api'.
 */

// ==========================================================================
// MÓDULO: CORE HTTP & CLIENTE (api-core.js)
// ==========================================================================

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

    const API_BASE_URL = window.ITAI_API_URL || `${BACKEND_HOST}/api`;

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
        
        try {
            const resposta = await fetch(url, opcoes);
            
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

            // 2. Se 401 Unauthorized, limpa token inválido sem forçar redirecionamento de tela
            if (resposta.status === 401) {
                if (obterToken() && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
                    console.info('[ItaimApi] Token expirado ou inválido.');
                    localStorage.removeItem('itaim_token');
                }
            }

            if (!resposta.ok) {
                const erro = new Error(dados.message || `Erro HTTP ${resposta.status}`);
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
            : (window.location.pathname.toLowerCase().includes('/pages/') ? '../../assets/placeholders/produto-placeholder.svg' : './assets/placeholders/produto-placeholder.svg');

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


// ==========================================================================
// MÓDULO: AUTENTICAÇÃO & PERFIL (api-auth.js)
// ==========================================================================

/**
 * ITAIM VENDE - SERVIÇO DE AUTENTICAÇÃO E PERFIL (API AUTH)
 * Arquivo: frontend/js/core/api/api-auth.js
 * 
 * Responsabilidades:
 * - Login com e-mail/senha ou objeto
 * - Cadastro de novos usuários
 * - Consulta de perfil autenticado (/auth/me) e dados de usuários (/auth/user/:id)
 * - Atualização cadastral de dados e sincronização com sessão
 * - Encerramento de sessão (logout/expiração)
 */

(function() {
    'use strict';

    function getCore() {
        return window.ItaimApiCore || {
            requisicao: () => Promise.reject(new Error('ItaimApiCore não carregado')),
            obterHeaders: () => ({}),
            obterToken: () => localStorage.getItem('itaim_token') || ''
        };
    }

    const auth = {
        obterToken() {
            return getCore().obterToken();
        },

        obterUsuarioLogado() {
            try {
                return JSON.parse(localStorage.getItem('itaim_usuario_logado') || 'null');
            } catch {
                return null;
            }
        },

        /**
         * Encerra a sessão imediatamente por expiração ou reset do servidor,
         * notificando o usuário e limpando o armazenamento local.
         */
        expirarSessao(motivo = 'Sua sessão expirou.') {
            localStorage.removeItem('itaim_token');
            localStorage.removeItem('itaim_usuario_logado');
            localStorage.removeItem('itaim_ultima_atividade');

            if (window.ItaimSessao && typeof window.ItaimSessao.deslogarUsuario === 'function') {
                window.ItaimSessao.deslogarUsuario();
            }

            console.info('[ItaimApi] Sessão limpa:', motivo);
        },

        /**
         * Autentica usuário com e-mail e senha
         */
        async login(emailOuDados, passwordParam) {
            const email = typeof emailOuDados === 'object' ? (emailOuDados.email || '') : (emailOuDados || '');
            const password = typeof emailOuDados === 'object' ? (emailOuDados.password || emailOuDados.senha || '') : (passwordParam || '');
            
            const resposta = await getCore().requisicao('/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (resposta.token) {
                localStorage.setItem('itaim_token', resposta.token);
                localStorage.setItem('itaim_ultima_atividade', Date.now().toString());
            }
            if (resposta.user) {
                localStorage.setItem('itaim_usuario_logado', JSON.stringify(resposta.user));
                localStorage.setItem('itaim_usuario_logado_email', resposta.user.email);
                if (window.ItaimSessao && typeof window.ItaimSessao.definirUsuarioLogado === 'function') {
                    window.ItaimSessao.definirUsuarioLogado(resposta.user.email || email, resposta.user);
                }
            }
            return resposta;
        },

        /**
         * Registra nova conta de usuário
         */
        async registrar(dados) {
            const resposta = await getCore().requisicao('/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });

            if (resposta.token) {
                localStorage.setItem('itaim_token', resposta.token);
                localStorage.setItem('itaim_ultima_atividade', Date.now().toString());
            }
            if (resposta.user) {
                localStorage.setItem('itaim_usuario_logado', JSON.stringify(resposta.user));
                if (window.ItaimSessao && typeof window.ItaimSessao.definirUsuarioLogado === 'function') {
                    window.ItaimSessao.definirUsuarioLogado(resposta.user.email || dados.email, resposta.user);
                }
            }
            return resposta;
        },

        /**
         * Consulta dados do perfil logado
         */
        async perfil() {
            return getCore().requisicao('/auth/me', {
                method: 'GET',
                headers: getCore().obterHeaders(true)
            });
        },

        /**
         * Consulta dados públicos de um usuário por ID
         */
        async obterUsuario(id) {
            return getCore().requisicao(`/auth/user/${encodeURIComponent(id)}`, {
                method: 'GET',
                headers: getCore().obterHeaders(true)
            });
        },

        /**
         * Atualiza informações cadastrais do perfil logado
         */
        async atualizarPerfil(dados) {
            const resposta = await getCore().requisicao('/auth/me', {
                method: 'PUT',
                headers: getCore().obterHeaders(true),
                body: JSON.stringify(dados)
            });
            if (resposta && resposta.user) {
                try {
                    const atual = JSON.parse(localStorage.getItem('itaim_usuario_logado') || '{}');
                    const fundido = { ...atual, ...resposta.user };
                    localStorage.setItem('itaim_usuario_logado', JSON.stringify(fundido));
                    if (window.ItaimSessao && typeof window.ItaimSessao.atualizarDadosUsuario === 'function') {
                        window.ItaimSessao.atualizarDadosUsuario(fundido.email, fundido);
                    }
                } catch(e) {}
            }
            return resposta;
        },

        /**
         * Encerra a sessão ativa e remove credenciais
         */
        logout() {
            localStorage.removeItem('itaim_token');
            localStorage.removeItem('itaim_usuario_logado');
            localStorage.removeItem('itaim_server_boot');
            localStorage.removeItem('itaim_ultima_atividade');
            if (window.ItaimSessao && typeof window.ItaimSessao.deslogarUsuario === 'function') {
                window.ItaimSessao.deslogarUsuario();
            }
        }
    };

    window.ItaimApiAuth = auth;

})();


// ==========================================================================
// MÓDULO: PRODUTOS & VITRINE (api-produtos.js)
// ==========================================================================

/**
 * ITAIM VENDE - SERVIÇO DE PRODUTOS E ANÚNCIOS (API PRODUTOS)
 * Arquivo: frontend/js/core/api/api-produtos.js
 * 
 * Responsabilidades:
 * - Listagem pública de vitrine com busca, filtros e ordenação
 * - Obtenção de detalhes de anúncio por ID ou Slug
 * - Criação, atualização e exclusão (soft-delete) de produtos
 * - Gestão de status (ATIVO, PAUSADO, VENDIDO)
 * - Meus anúncios do vendedor logado e anúncios de vendedor específico
 * - Registro de métricas de clique e contato
 */

(function() {
    'use strict';

    function getCore() {
        return window.ItaimApiCore || {
            requisicao: () => Promise.reject(new Error('ItaimApiCore não carregado')),
            obterHeaders: () => ({})
        };
    }

    const produtos = {
        /**
         * Listagem pública com paginação e filtros
         */
        async listar(filtros = {}) {
            const params = new URLSearchParams();
            Object.entries(filtros).forEach(([chave, valor]) => {
                if (valor !== undefined && valor !== null && valor !== '' && valor !== 'todas') {
                    params.append(chave, valor);
                }
            });

            const queryStr = params.toString() ? `?${params.toString()}` : '';
            return getCore().requisicao(`/products${queryStr}`, {
                method: 'GET',
                headers: getCore().obterHeaders(true)
            });
        },

        /**
         * Obter produto por ID ou Slug
         */
        async obter(idOuSlug) {
            return getCore().requisicao(`/products/${encodeURIComponent(idOuSlug)}`, {
                method: 'GET',
                headers: getCore().obterHeaders(true)
            });
        },

        /**
         * Criar novo anúncio (autenticado)
         */
        async criar(dados) {
            return getCore().requisicao('/products', {
                method: 'POST',
                headers: getCore().obterHeaders(true),
                body: JSON.stringify(dados)
            });
        },

        /**
         * Atualizar anúncio existente (autenticado)
         */
        async atualizar(id, dados) {
            return getCore().requisicao(`/products/${encodeURIComponent(id)}`, {
                method: 'PUT',
                headers: getCore().obterHeaders(true),
                body: JSON.stringify(dados)
            });
        },

        /**
         * Listar anúncios do usuário logado (autenticado)
         */
        async meusAnuncios() {
            return getCore().requisicao('/products/me', {
                method: 'GET',
                headers: getCore().obterHeaders(true)
            });
        },

        /**
         * Listar produtos de um vendedor específico
         */
        async doVendedor(sellerId, todos = false) {
            const queryStr = todos ? '?all=true' : '';
            return getCore().requisicao(`/products/seller/${encodeURIComponent(sellerId)}${queryStr}`, {
                method: 'GET',
                headers: getCore().obterHeaders(true)
            });
        },

        /**
         * Alterar status do anúncio (ATIVO, PAUSADO, VENDIDO, etc.)
         */
        async alterarStatus(id, status) {
            return getCore().requisicao(`/products/${encodeURIComponent(id)}/status`, {
                method: 'PATCH',
                headers: getCore().obterHeaders(true),
                body: JSON.stringify({ status })
            });
        },

        /**
         * Excluir anúncio (soft-delete autenticado)
         */
        async excluir(id) {
            return getCore().requisicao(`/products/${encodeURIComponent(id)}`, {
                method: 'DELETE',
                headers: getCore().obterHeaders(true)
            });
        },

        /**
         * Registrar métrica de clique para contato
         */
        async registrarContato(id) {
            return getCore().requisicao(`/products/${encodeURIComponent(id)}/contact`, {
                method: 'POST',
                headers: getCore().obterHeaders(true)
            });
        }
    };

    window.ItaimApiProdutos = produtos;

})();


// ==========================================================================
// MÓDULO: CHAT & MENSAGENS (api-chat.js)
// ==========================================================================

/**
 * ITAIM VENDE - SERVIÇO DE CHAT E MENSAGENS (API CHAT)
 * Arquivo: frontend/js/core/api/api-chat.js
 * 
 * Responsabilidades:
 * - Listagem de conversas ativas do usuário
 * - Obtenção de mensagens de um chat específico
 * - Início de novas negociações associadas a um produto
 * - Envio de mensagens de texto ou propostas com valor de oferta
 * - Contador global de mensagens não lidas
 */

(function() {
    'use strict';

    function getCore() {
        return window.ItaimApiCore || {
            requisicao: () => Promise.reject(new Error('ItaimApiCore não carregado')),
            obterHeaders: () => ({})
        };
    }

    const chat = {
        /**
         * Lista todas as conversas do usuário autenticado
         */
        async listarConversas() {
            return getCore().requisicao('/chat/conversations', {
                method: 'GET',
                headers: getCore().obterHeaders(true)
            });
        },

        /**
         * Obtém detalhes de uma conversa por ID
         */
        async obterConversa(id) {
            return getCore().requisicao(`/chat/conversations/${encodeURIComponent(id)}`, {
                method: 'GET',
                headers: getCore().obterHeaders(true)
            });
        },

        /**
         * Inicia uma nova negociação atrelada a um produto
         */
        async iniciarConversa(productId) {
            return getCore().requisicao('/chat/conversations', {
                method: 'POST',
                headers: getCore().obterHeaders(true),
                body: JSON.stringify({ productId })
            });
        },

        /**
         * Obtém o histórico de mensagens de uma conversa
         */
        async obterMensagens(conversationId) {
            return getCore().requisicao(`/chat/conversations/${encodeURIComponent(conversationId)}/messages`, {
                method: 'GET',
                headers: getCore().obterHeaders(true)
            });
        },

        /**
         * Envia mensagem de texto ou proposta de oferta
         */
        async enviarMensagem(conversationId, content, messageType = 'TEXT', offerValue = null) {
            return getCore().requisicao(`/chat/conversations/${encodeURIComponent(conversationId)}/messages`, {
                method: 'POST',
                headers: getCore().obterHeaders(true),
                body: JSON.stringify({ content, messageType, offerValue })
            });
        },

        /**
         * Retorna a quantidade total de mensagens não lidas
         */
        async contarNaoLidas() {
            return getCore().requisicao('/chat/conversations/unread/total', {
                method: 'GET',
                headers: getCore().obterHeaders(true)
            });
        }
    };

    window.ItaimApiChat = chat;

})();


// ==========================================================================
// MÓDULO: UPLOAD MULTIPART (api-upload.js)
// ==========================================================================

/**
 * ITAIM VENDE - SERVIÇO DE UPLOAD DE ARQUIVOS (API UPLOAD)
 * Arquivo: frontend/js/core/api/api-upload.js
 * 
 * Responsabilidades:
 * - Upload multipart de fotos de perfil (salvas em /uploads/perfil/)
 * - Upload multipart de fotos de produtos e vendas (salvas em /uploads/vendas/)
 * - Suporte transparente para File, Blob e Strings Base64 (dataURL)
 * - Compatibilidade com chamadas únicas e em lote
 */

(function() {
    'use strict';

    function getCore() {
        return window.ItaimApiCore || {
            requisicao: () => Promise.reject(new Error('ItaimApiCore não carregado')),
            obterHeaders: () => ({}),
            dataURLParaBlob: (url) => new Blob([url])
        };
    }

    const upload = {
        /**
         * Envio de foto de perfil (salva em /uploads/perfil/)
         * Aceita File, Blob ou String Base64 (dataURL)
         */
        async perfil(foto) {
            const formData = new FormData();
            let arquivo = foto;

            if (typeof foto === 'string' && foto.startsWith('data:')) {
                arquivo = getCore().dataURLParaBlob(foto);
            }

            formData.append('image', arquivo, 'foto_perfil.jpg');

            return getCore().requisicao('/upload/perfil', {
                method: 'POST',
                headers: getCore().obterHeaders(false),
                body: formData
            });
        },

        async avatar(foto) {
            return this.perfil(foto);
        },

        /**
         * Envio de múltiplas fotos para anúncios/vendas (salva em /uploads/vendas/ - máx 6)
         * Aceita Array de File, Blob ou Strings Base64
         */
        async vendas(fotos = []) {
            if (!fotos || fotos.length === 0) {
                return { success: true, urls: [] };
            }

            const formData = new FormData();

            fotos.forEach((foto, index) => {
                let arquivo = foto;
                if (typeof foto === 'string' && foto.startsWith('data:')) {
                    arquivo = getCore().dataURLParaBlob(foto);
                    formData.append('images', arquivo, `venda_${index + 1}.jpg`);
                } else if (foto instanceof File || foto instanceof Blob) {
                    formData.append('images', arquivo, foto.name || `venda_${index + 1}.jpg`);
                }
            });

            return getCore().requisicao('/upload/vendas', {
                method: 'POST',
                headers: getCore().obterHeaders(false),
                body: formData
            });
        },

        async produtos(fotos = []) {
            return this.vendas(fotos);
        },

        /**
         * Envio de foto única para venda/produto
         */
        async vendaUnica(foto) {
            const formData = new FormData();
            let arquivo = foto;

            if (typeof foto === 'string' && foto.startsWith('data:')) {
                arquivo = getCore().dataURLParaBlob(foto);
            }

            formData.append('image', arquivo, 'foto_venda.jpg');

            return getCore().requisicao('/upload/venda/single', {
                method: 'POST',
                headers: getCore().obterHeaders(false),
                body: formData
            });
        },

        /**
         * Envio de foto única (retrocompatível, padrão: perfil)
         */
        async unico(foto, categoria = 'perfil') {
            if (categoria === 'venda' || categoria === 'vendas' || categoria === 'produto' || categoria === 'produtos') {
                return this.vendaUnica(foto);
            }
            return this.perfil(foto);
        },

        unica(foto, categoria = 'perfil') {
            return this.unico(foto, categoria);
        },

        /**
         * Envio de múltiplas fotos (retrocompatível, padrão: vendas)
         */
        async multiplo(fotos = [], categoria = 'vendas') {
            return this.vendas(fotos);
        },

        multiplos(fotos = [], categoria = 'vendas') {
            return this.multiplo(fotos, categoria);
        }
    };

    window.ItaimApiUpload = upload;

})();


// ==========================================================================
// MÓDULO: SOCIAL (CATEGORIAS, FAVORITOS, DENÚNCIAS) (api-social.js)
// ==========================================================================

/**
 * ITAIM VENDE - SERVIÇOS SOCIAIS: CATEGORIAS, FAVORITOS E DENÚNCIAS (API SOCIAL)
 * Arquivo: frontend/js/core/api/api-social.js
 * 
 * Responsabilidades:
 * - Consulta de categorias cadastradas
 * - Gestão de produtos favoritados (listar, alternar, verificar status)
 * - Denúncias de anúncios e tickets de suporte/moderação
 */

(function() {
    'use strict';

    function getCore() {
        return window.ItaimApiCore || {
            requisicao: () => Promise.reject(new Error('ItaimApiCore não carregado')),
            obterHeaders: () => ({})
        };
    }

    // Módulo de Categorias
    const categorias = {
        async listar() {
            return getCore().requisicao('/categories', {
                method: 'GET',
                headers: getCore().obterHeaders(true)
            });
        }
    };

    // Módulo de Favoritos
    const favoritos = {
        async listar() {
            return getCore().requisicao('/favorites', {
                method: 'GET',
                headers: getCore().obterHeaders(true)
            });
        },

        async toggle(productId) {
            return getCore().requisicao(`/favorites/${encodeURIComponent(productId)}/toggle`, {
                method: 'POST',
                headers: getCore().obterHeaders(true)
            });
        },

        async status(productId) {
            return getCore().requisicao(`/favorites/${encodeURIComponent(productId)}/status`, {
                method: 'GET',
                headers: getCore().obterHeaders(true)
            });
        }
    };

    // Módulo de Denúncias & Tickets de Suporte/Moderação
    const reports = {
        /**
         * Envia uma denúncia de anúncio e abre um ticket na moderação
         */
        async criar(productId, dados = {}) {
            return getCore().requisicao(`/reports/${encodeURIComponent(productId)}`, {
                method: 'POST',
                headers: getCore().obterHeaders(true),
                body: JSON.stringify(dados)
            });
        },

        /**
         * Consulta um ticket pelo código de protocolo (ex: TK-ABC123) ou ID
         */
        async obter(protocolOrId) {
            return getCore().requisicao(`/reports/ticket/${encodeURIComponent(protocolOrId)}`, {
                method: 'GET',
                headers: getCore().obterHeaders(true)
            });
        },

        /**
         * Lista todos os tickets (visão de moderação / painel)
         */
        async listar(filtros = {}) {
            const params = new URLSearchParams();
            if (filtros.status) params.set('status', filtros.status);
            if (filtros.page) params.set('page', filtros.page);
            if (filtros.limit) params.set('limit', filtros.limit);
            const qs = params.toString() ? `?${params.toString()}` : '';
            return getCore().requisicao(`/reports${qs}`, {
                method: 'GET',
                headers: getCore().obterHeaders(true)
            });
        },

        /**
         * Atualiza status de um ticket
         */
        async atualizarStatus(id, status) {
            return getCore().requisicao(`/reports/${encodeURIComponent(id)}/status`, {
                method: 'PATCH',
                headers: getCore().obterHeaders(true),
                body: JSON.stringify({ status })
            });
        }
    };

    window.ItaimApiSocial = {
        categorias,
        favoritos,
        reports
    };

})();


// ==========================================================================
// MÓDULO: SISTEMA & DIAGNÓSTICO (api-sistema.js)
// ==========================================================================

/**
 * ITAIM VENDE - SERVIÇO DE SISTEMA, MÉTRICAS E DIAGNÓSTICO (API SISTEMA)
 * Arquivo: frontend/js/core/api/api-sistema.js
 * 
 * Responsabilidades:
 * - Diagnósticos de integridade do backend e banco de dados
 * - Status geral do sistema e monitoramento /health
 * - Controle do túnel Cloudflare via painel de administração
 * - Auditoria e limpeza de arquivos órfãos em uploads
 * - Gerenciamento de massa de dados demo (seed)
 * - Visão geral e controle operacional de produtos e usuários
 */

(function() {
    'use strict';

    function getCore() {
        return window.ItaimApiCore || {
            requisicao: () => Promise.reject(new Error('ItaimApiCore não carregado'))
        };
    }

    const sistema = {
        async obterStatus() {
            return getCore().requisicao('/system/status');
        },
        async executarDiagnostico() {
            return getCore().requisicao('/system/diagnostics', { method: 'POST' });
        },
        async health() {
            return getCore().requisicao('/health');
        },
        async obterTunnel() {
            return getCore().requisicao('/system/tunnel');
        },
        async iniciarTunnel() {
            return getCore().requisicao('/system/tunnel/start', { method: 'POST' });
        },
        async pararTunnel() {
            return getCore().requisicao('/system/tunnel/stop', { method: 'POST' });
        },
        async auditarStorage() {
            return getCore().requisicao('/system/storage/audit');
        },
        async limparStorageOrfaos() {
            return getCore().requisicao('/system/storage/clean', { method: 'POST' });
        },
        async gerarProdutosDemo() {
            return getCore().requisicao('/system/seed/products', { method: 'POST' });
        },
        async limparProdutosDemo() {
            return getCore().requisicao('/system/seed/clean', { method: 'POST' });
        },
        async obterVisaoGeralDados() {
            return getCore().requisicao('/system/data/overview');
        },
        async alternarStatusProduto(id) {
            return getCore().requisicao(`/system/data/products/${encodeURIComponent(id)}/toggle`, { method: 'PATCH' });
        },
        async alternarStatusUsuario(id) {
            return getCore().requisicao(`/system/data/users/${encodeURIComponent(id)}/toggle`, { method: 'PATCH' });
        }
    };

    window.ItaimApiSistema = sistema;

})();


// ==========================================================================
// MÓDULO: ORQUESTRADOR GLOBAL (INDEX) (index.js)
// ==========================================================================

/**
 * ITAIM VENDE - PONTO DE ENTRADA DO CLIENTE DE API
 * Arquivo: frontend/js/core/api/index.js
 * 
 * Carrega automaticamente e de forma síncrona todos os submódulos da API:
 * - api-core.js
 * - api-auth.js
 * - api-produtos.js
 * - api-chat.js
 * - api-upload.js
 * - api-social.js
 * - api-sistema.js
 * - api-orquestrador.js
 */

(function() {
    'use strict';

    const scriptAtual = document.currentScript;
    const base = scriptAtual ? scriptAtual.src.substring(0, scriptAtual.src.lastIndexOf('/') + 1) : '';

    const arquivos = [
        'api-core.js',
        'api-auth.js',
        'api-produtos.js',
        'api-chat.js',
        'api-upload.js',
        'api-social.js',
        'api-sistema.js',
        'api-orquestrador.js'
    ];

    arquivos.forEach(function(arquivo) {
        document.write('<script src="' + base + arquivo + '"><\/script>');
    });

})();


