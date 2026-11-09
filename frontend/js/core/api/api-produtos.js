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
            const res = await getCore().requisicao(`/products${queryStr}`, {
                method: 'GET',
                headers: getCore().obterHeaders(true)
            });

            if (res && Array.isArray(res.data)) {
                let excluidosSet = new Set();
                let statusMap = {};
                try {
                    const arr = JSON.parse(localStorage.getItem('itaim_produtos_excluidos') || '[]');
                    if (Array.isArray(arr)) excluidosSet = new Set(arr.map(String));
                } catch (_) {}
                try {
                    statusMap = JSON.parse(localStorage.getItem('itaim_produtos_status_map') || '{}') || {};
                } catch (_) {}

                // Sincroniza silenciosamente no servidor qualquer exclusão pendente em itaim_produtos_excluidos
                const token = localStorage.getItem('itaim_token') || '';
                if (token && !token.startsWith('mock_') && excluidosSet.size > 0) {
                    res.data.forEach(p => {
                        if (p && p.id && excluidosSet.has(String(p.id))) {
                            getCore().requisicao(`/products/${encodeURIComponent(p.id)}`, {
                                method: 'DELETE',
                                headers: getCore().obterHeaders(true)
                            }).catch(() => {});
                        }
                    });
                }

                res.data = res.data
                    .filter(p => p && !p.deletedAt && !excluidosSet.has(String(p.id)))
                    .map(p => {
                        const sId = String(p.id);
                        return statusMap[sId] ? { ...p, status: statusMap[sId] } : p;
                    });
            }

            return res;
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
