/**
 * ITAIM VENDE - SERVIÇO DE AVALIAÇÕES DE VENDEDORES (API REVIEWS)
 * Arquivo: frontend/js/core/api/api-reviews.js
 *
 * Responsabilidades:
 * - Buscar avaliações reais de um vendedor no backend
 * - Enviar nova avaliação (nota + comentário) para um vendedor
 * - Vendedor responder a uma avaliação recebida
 */

(function () {
    'use strict';

    function getCore() {
        return window.ItaimApiCore || {
            requisicao: () => Promise.reject(new Error('ItaimApiCore não carregado')),
            obterHeaders: () => ({})
        };
    }

    const reviews = {
        /**
         * Busca todas as avaliações recebidas por um vendedor.
         * Rota: GET /api/v1/reviews/user/:userId
         * @param {string} userId - ID do vendedor
         * @returns {{ vendedor, avaliacoes }}
         */
        async listar(userId) {
            return getCore().requisicao(`/users/${encodeURIComponent(userId)}/reviews`, {
                method: 'GET',
                headers: getCore().obterHeaders(false)
            });
        },

        /**
         * Envia uma nova avaliação para um vendedor.
         * Rota: POST /api/v1/users/:userId/reviews
         * Requer autenticação (token JWT).
         * @param {string} userId - ID do vendedor alvo
         * @param {{ rating: number, comment: string }} dados
         */
        async enviar(userId, dados) {
            return getCore().requisicao(`/users/${encodeURIComponent(userId)}/reviews`, {
                method: 'POST',
                headers: getCore().obterHeaders(true),
                body: JSON.stringify(dados)
            });
        },

        /**
         * Vendedor responde a uma avaliação recebida.
         * Rota: PATCH /api/v1/reviews/:id/reply
         * Requer autenticação (token JWT do próprio vendedor).
         * @param {string} reviewId - ID da avaliação
         * @param {string} reply - Texto da resposta
         */
        async responder(reviewId, reply) {
            return getCore().requisicao(`/reviews/${encodeURIComponent(reviewId)}/reply`, {
                method: 'PATCH',
                headers: getCore().obterHeaders(true),
                body: JSON.stringify({ reply })
            });
        },

        /**
         * Atualiza uma avaliação existente pelo autor.
         * Rota: PUT /api/v1/reviews/:id
         * Requer autenticação (token JWT).
         * @param {string} reviewId - ID da avaliação
         * @param {{ rating: number, comment: string }} dados
         */
        async editar(reviewId, dados) {
            return getCore().requisicao(`/reviews/${encodeURIComponent(reviewId)}`, {
                method: 'PUT',
                headers: getCore().obterHeaders(true),
                body: JSON.stringify(dados)
            });
        },

        /**
         * Exclui uma avaliação feita pelo autor.
         * Rota: DELETE /api/v1/reviews/:id
         * Requer autenticação (token JWT).
         * @param {string} reviewId - ID da avaliação
         */
        async excluir(reviewId) {
            return getCore().requisicao(`/reviews/${encodeURIComponent(reviewId)}`, {
                method: 'DELETE',
                headers: getCore().obterHeaders(true)
            });
        }
    };

    window.ItaimApiReviews = reviews;

})();
