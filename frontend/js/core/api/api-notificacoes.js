/**
 * ITAIM VENDE - SERVIÇO DE NOTIFICAÇÕES (API NOTIFICAÇÕES)
 * Arquivo: frontend/js/core/api/api-notificacoes.js
 * 
 * Responsabilidades:
 * - Consultar notificações persistidas no banco (/notifications)
 * - Obter contagem de não lidas para o badge do sino no cabeçalho (/notifications/unread-count)
 * - Marcar notificação individual ou todas como lidas (/notifications/:id/read, /notifications/read-all)
 * - Excluir notificação ou limpar histórico (/notifications/:id, /notifications)
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

    const notificacoes = {
        /**
         * Lista notificações com filtros e paginação
         * @param {Object} [filtros]
         * @param {string} [filtros.type]
         * @param {boolean|string} [filtros.isRead]
         * @param {number} [filtros.page]
         * @param {number} [filtros.limit]
         */
        async listar(filtros = {}) {
            const params = new URLSearchParams();
            if (filtros.type && filtros.type !== 'todas') params.append('type', filtros.type);
            if (filtros.isRead !== undefined && filtros.isRead !== null) params.append('isRead', String(filtros.isRead));
            if (filtros.page) params.append('page', String(filtros.page));
            if (filtros.limit) params.append('limit', String(filtros.limit));

            const query = params.toString() ? `?${params.toString()}` : '';
            return getCore().requisicao(`/notifications${query}`, {
                headers: getCore().obterHeaders ? getCore().obterHeaders(true) : {}
            });
        },

        /**
         * Retorna a contagem de notificações não lidas para o badge do sino
         */
        async obterContadorNaoLidas() {
            return getCore().requisicao('/notifications/unread-count', {
                headers: getCore().obterHeaders ? getCore().obterHeaders(true) : {}
            });
        },

        /**
         * Marca uma notificação específica como lida
         * @param {string} id
         */
        async marcarComoLida(id) {
            return getCore().requisicao(`/notifications/${encodeURIComponent(id)}/read`, {
                method: 'PATCH',
                headers: getCore().obterHeaders ? getCore().obterHeaders(true) : {}
            });
        },

        /**
         * Marca todas as notificações do usuário como lidas
         */
        async marcarTodasComoLidas() {
            return getCore().requisicao('/notifications/read-all', {
                method: 'PATCH',
                headers: getCore().obterHeaders ? getCore().obterHeaders(true) : {}
            });
        },

        /**
         * Remove uma notificação específica
         * @param {string} id
         */
        async remover(id) {
            return getCore().requisicao(`/notifications/${encodeURIComponent(id)}`, {
                method: 'DELETE',
                headers: getCore().obterHeaders ? getCore().obterHeaders(true) : {}
            });
        },

        /**
         * Exclui todas as notificações do histórico do usuário
         */
        async limparTodas() {
            return getCore().requisicao('/notifications', {
                method: 'DELETE',
                headers: getCore().obterHeaders ? getCore().obterHeaders(true) : {}
            });
        }
    };

    window.ItaimApiNotificacoes = notificacoes;

})();
