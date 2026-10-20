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
            obterToken: () => localStorage.getItem('itaim_token') || ''
        };
    }

    const enderecos = {
        /**
         * Lista todos os endereços do usuário
         */
        async listar() {
            return getCore().requisicao('/addresses');
        },

        /**
         * Obtém detalhes de um endereço pelo ID
         */
        async obter(id) {
            return getCore().requisicao(`/addresses/${encodeURIComponent(id)}`);
        },

        /**
         * Cadastra um novo endereço
         */
        async criar(dados) {
            return getCore().requisicao('/addresses', {
                method: 'POST',
                body: JSON.stringify(dados)
            });
        },

        /**
         * Atualiza os dados de um endereço existente
         */
        async atualizar(id, dados) {
            return getCore().requisicao(`/addresses/${encodeURIComponent(id)}`, {
                method: 'PUT',
                body: JSON.stringify(dados)
            });
        },

        /**
         * Remove um endereço pelo ID
         */
        async remover(id) {
            return getCore().requisicao(`/addresses/${encodeURIComponent(id)}`, {
                method: 'DELETE'
            });
        },

        /**
         * Marca um endereço como o endereço principal
         */
        async tornarPrincipal(id) {
            return getCore().requisicao(`/addresses/${encodeURIComponent(id)}/primary`, {
                method: 'PATCH'
            });
        }
    };

    window.ItaimApiEnderecos = enderecos;

})();
