/**
 * ITAIM VENDE - SERVIÇO DE ENDEREÇOS (API ENDEREÇOS)
 * Arquivo: frontend/js/core/api/api-enderecos.js
 * 
 * Responsabilidades:
 * - Listar múltiplos endereços cadastrados pelo usuário autenticado
 * - Cadastrar novo endereço (com definição automática ou manual de principal)
 * - Obter detalhes de um endereço
 * - Atualizar dados de um endereço
 * - Excluir endereço com promoção automática do principal remanescente
 * - Definir endereço principal
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

    const enderecos = {
        /**
         * Lista todos os endereços do usuário
         */
        async listar() {
            return getCore().requisicao('/addresses', {
                headers: getCore().obterHeaders ? getCore().obterHeaders(true) : {}
            });
        },

        /**
         * Obtém detalhes de um endereço pelo ID
         */
        async obter(id) {
            return getCore().requisicao(`/addresses/${encodeURIComponent(id)}`, {
                headers: getCore().obterHeaders ? getCore().obterHeaders(true) : {}
            });
        },

        /**
         * Cadastra um novo endereço
         */
        async criar(dados) {
            return getCore().requisicao('/addresses', {
                method: 'POST',
                headers: getCore().obterHeaders ? getCore().obterHeaders(true) : {},
                body: JSON.stringify(dados)
            });
        },

        /**
         * Atualiza os dados de um endereço existente
         */
        async atualizar(id, dados) {
            return getCore().requisicao(`/addresses/${encodeURIComponent(id)}`, {
                method: 'PUT',
                headers: getCore().obterHeaders ? getCore().obterHeaders(true) : {},
                body: JSON.stringify(dados)
            });
        },

        /**
         * Remove um endereço pelo ID
         */
        async remover(id) {
            return getCore().requisicao(`/addresses/${encodeURIComponent(id)}`, {
                method: 'DELETE',
                headers: getCore().obterHeaders ? getCore().obterHeaders(true) : {}
            });
        },

        /**
         * Marca um endereço como o endereço principal
         */
        async tornarPrincipal(id) {
            return getCore().requisicao(`/addresses/${encodeURIComponent(id)}/primary`, {
                method: 'PATCH',
                headers: getCore().obterHeaders ? getCore().obterHeaders(true) : {}
            });
        }
    };

    window.ItaimApiEnderecos = enderecos;

})();
