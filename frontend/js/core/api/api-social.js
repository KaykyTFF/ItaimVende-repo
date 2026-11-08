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

        async adicionar(productId) {
            return getCore().requisicao(`/favorites/${encodeURIComponent(productId)}`, {
                method: 'PUT',
                headers: getCore().obterHeaders(true)
            });
        },

        async remover(productId) {
            return getCore().requisicao(`/favorites/${encodeURIComponent(productId)}`, {
                method: 'DELETE',
                headers: getCore().obterHeaders(true)
            });
        },

        async status(productId) {
            return getCore().requisicao(`/favorites/${encodeURIComponent(productId)}`, {
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
        },

        /**
         * Ação de Moderação: Remove anúncio fraudulento e limpa o bucket (RESTful DELETE)
         */
        async removerAnuncioFraudulento(id, reasonNote = '') {
            return getCore().requisicao(`/reports/${encodeURIComponent(id)}/product`, {
                method: 'DELETE',
                headers: getCore().obterHeaders(true),
                body: JSON.stringify({ reasonNote })
            });
        },

        /**
         * Ação de Moderação: Suspende a conta do vendedor denunciado e arquiva seus anúncios
         */
        async suspenderConta(id, reasonNote = '', statusType = 'SUSPENDED') {
            return getCore().requisicao(`/reports/${encodeURIComponent(id)}/suspend-account`, {
                method: 'POST',
                headers: getCore().obterHeaders(true),
                body: JSON.stringify({ reasonNote, statusType })
            });
        },

        /**
         * Ação de Moderação: Descarta denúncia como improcedente
         */
        async descartarDenuncia(id, reasonNote = '') {
            return getCore().requisicao(`/reports/${encodeURIComponent(id)}/dismiss`, {
                method: 'POST',
                headers: getCore().obterHeaders(true),
                body: JSON.stringify({ reasonNote })
            });
        }
    };

    window.ItaimApiSocial = {
        categorias,
        favoritos,
        reports
    };

})();
