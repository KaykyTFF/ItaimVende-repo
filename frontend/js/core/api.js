/**
 * ITAIM VENDE - CLIENTE DE API CENTRAL (JS/CORE/API.JS)
 * Camada unificada de integração HTTP com o Backend Node.js / Express.
 * Gerencia endpoints, tokens JWT, headers de autorização e uploads multipart.
 */

(function () {
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

    // =========================================================================
    // OBJETO PRINCIPAL DA API
    // =========================================================================
    const ItaimApi = {
        baseUrl: API_BASE_URL,
        backendHost: BACKEND_HOST,

        /**
         * Resolve URLs de imagens do backend (/uploads/...) ou caminhos relativos
         */
        resolverUrlImagem(url) {
            const placeholder = (window.ItaimRotas && typeof window.ItaimRotas.obterAsset === 'function')
                ? window.ItaimRotas.obterAsset('assets/produto-placeholder.svg')
                : (window.location.pathname.toLowerCase().includes('/pages/') ? '../../assets/produto-placeholder.svg' : './assets/produto-placeholder.svg');

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
        },

        // ---------------------------------------------------------------------
        // MÓDULO DE AUTENTICAÇÃO E PERFIL
        // ---------------------------------------------------------------------
        auth: {
            obterToken,

            obterUsuarioLogado() {
                try {
                    return JSON.parse(localStorage.getItem('itaim_usuario_logado') || 'null');
                } catch {
                    return null;
                }
            },

            /**
             * Encerra a sessão imediatamente por expiração ou reset do servidor,
             * notificando o usuário e redirecionando para a tela de login.
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

            async login(email, password) {
                const resposta = await requisicao('/auth/login', {
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
                    if (window.ItaimSessao && typeof window.ItaimSessao.definirUsuarioLogado === 'function') {
                        window.ItaimSessao.definirUsuarioLogado(resposta.user.email || email, resposta.user);
                    }
                }
                return resposta;
            },

            async registrar(dados) {
                const resposta = await requisicao('/auth/register', {
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

            async perfil() {
                return requisicao('/auth/me', {
                    method: 'GET',
                    headers: obterHeaders(true)
                });
            },

            async obterUsuario(id) {
                return requisicao(`/auth/user/${id}`, {
                    method: 'GET',
                    headers: obterHeaders(true)
                });
            },

            async atualizarPerfil(dados) {
                const resposta = await requisicao('/auth/me', {
                    method: 'PUT',
                    headers: obterHeaders(true),
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

            logout() {
                localStorage.removeItem('itaim_token');
                localStorage.removeItem('itaim_usuario_logado');
                localStorage.removeItem('itaim_server_boot');
                localStorage.removeItem('itaim_ultima_atividade');
                if (window.ItaimSessao && typeof window.ItaimSessao.deslogarUsuario === 'function') {
                    window.ItaimSessao.deslogarUsuario();
                }
            }
        },

        // ---------------------------------------------------------------------
        // MÓDULO DE PRODUTOS & VITRINE
        // ---------------------------------------------------------------------
        produtos: {
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
                return requisicao(`/products${queryStr}`, {
                    method: 'GET',
                    headers: obterHeaders(true)
                });
            },

            /**
             * Obter produto por ID ou Slug
             */
            async obter(idOuSlug) {
                return requisicao(`/products/${encodeURIComponent(idOuSlug)}`, {
                    method: 'GET',
                    headers: obterHeaders(true)
                });
            },

            /**
             * Criar novo anúncio (autenticado)
             */
            async criar(dados) {
                return requisicao('/products', {
                    method: 'POST',
                    headers: obterHeaders(true),
                    body: JSON.stringify(dados)
                });
            },

            /**
             * Atualizar anúncio existente (autenticado)
             */
            async atualizar(id, dados) {
                return requisicao(`/products/${id}`, {
                    method: 'PUT',
                    headers: obterHeaders(true),
                    body: JSON.stringify(dados)
                });
            },

            /**
             * Listar anúncios do usuário logado (autenticado)
             */
            async meusAnuncios() {
                return requisicao('/products/me', {
                    method: 'GET',
                    headers: obterHeaders(true)
                });
            },

            /**
             * Listar produtos de um vendedor específico
             */
            async doVendedor(sellerId) {
                return requisicao(`/products/seller/${sellerId}`, {
                    method: 'GET',
                    headers: obterHeaders(true)
                });
            },

            /**
             * Alterar status do anúncio (ATIVO, PAUSADO, VENDIDO, etc.)
             */
            async alterarStatus(id, status) {
                return requisicao(`/products/${id}/status`, {
                    method: 'PATCH',
                    headers: obterHeaders(true),
                    body: JSON.stringify({ status })
                });
            },

            /**
             * Excluir anúncio (soft-delete autenticado)
             */
            async excluir(id) {
                return requisicao(`/products/${id}`, {
                    method: 'DELETE',
                    headers: obterHeaders(true)
                });
            },

            /**
             * Registrar métrica de clique para contato
             */
            async registrarContato(id) {
                return requisicao(`/products/${id}/contact`, {
                    method: 'POST',
                    headers: obterHeaders(true)
                });
            }
        },

        // ---------------------------------------------------------------------
        // MÓDULO DE CATEGORIAS
        // ---------------------------------------------------------------------
        categorias: {
            async listar() {
                return requisicao('/categories', {
                    method: 'GET',
                    headers: obterHeaders(true)
                });
            }
        },

        // ---------------------------------------------------------------------
        // MÓDULO DE FAVORITOS
        // ---------------------------------------------------------------------
        favoritos: {
            async listar() {
                return requisicao('/favorites', {
                    method: 'GET',
                    headers: obterHeaders(true)
                });
            },

            async toggle(productId) {
                return requisicao(`/favorites/${productId}/toggle`, {
                    method: 'POST',
                    headers: obterHeaders(true)
                });
            },

            async status(productId) {
                return requisicao(`/favorites/${productId}/status`, {
                    method: 'GET',
                    headers: obterHeaders(true)
                });
            }
        },

        // ---------------------------------------------------------------------
        // MÓDULO DE UPLOAD DE ARQUIVOS (MULTIPART)
        // ---------------------------------------------------------------------
        upload: {
            /**
             * Envio de foto única (ex: avatar de perfil)
             * Aceita File, Blob ou String Base64 (dataURL)
             */
            async unico(foto) {
                const formData = new FormData();
                let arquivo = foto;

                if (typeof foto === 'string' && foto.startsWith('data:')) {
                    arquivo = dataURLParaBlob(foto);
                }

                formData.append('image', arquivo, 'foto.jpg');

                return requisicao('/upload/single', {
                    method: 'POST',
                    headers: obterHeaders(false), // Sem Content-Type, o browser gera o boundary multipart
                    body: formData
                });
            },

            unica(foto) {
                return this.unico(foto);
            },

            /**
             * Envio de múltiplas fotos (galeria do anúncio - máx 6)
             * Aceita Array de File, Blob ou Strings Base64
             */
            async multiplo(fotos = []) {
                if (!fotos || fotos.length === 0) {
                    return { success: true, urls: [] };
                }

                const formData = new FormData();

                fotos.forEach((foto, index) => {
                    let arquivo = foto;
                    if (typeof foto === 'string' && foto.startsWith('data:')) {
                        arquivo = dataURLParaBlob(foto);
                        formData.append('images', arquivo, `foto_${index + 1}.jpg`);
                    } else if (foto instanceof File || foto instanceof Blob) {
                        formData.append('images', arquivo, foto.name || `foto_${index + 1}.jpg`);
                    }
                });

                return requisicao('/upload/multiple', {
                    method: 'POST',
                    headers: obterHeaders(false),
                    body: formData
                });
            },

            multiplos(fotos = []) {
                return this.multiplo(fotos);
            }
        }
    };

    // Exportação Global
    window.ItaimApi = ItaimApi;

    // =========================================================================
    // MONITOR PROFISSIONAL DE SESSÃO & REINICIALIZAÇÃO DO BACKEND
    // =========================================================================
    const TEMPO_EXPIRACAO_INATIVIDADE_MS = 2 * 60 * 60 * 1000; // 2 horas de inatividade máxima

    function registrarAtividade() {
        if (obterToken()) {
            localStorage.setItem('itaim_ultima_atividade', Date.now().toString());
        }
    }

    if (typeof window !== 'undefined') {
        ['mousedown', 'keydown', 'touchstart', 'scroll'].forEach(evt => {
            window.addEventListener(evt, registrarAtividade, { passive: true });
        });

        // Sincronização passiva de boot do servidor
        setInterval(async () => {
            const token = obterToken();
            if (!token) return;

            try {
                const res = await fetch(`${API_BASE_URL}/health`, {
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
