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
         * Obtém o histórico de mensagens de uma conversa (com suporte a polling incremental)
         */
        async obterMensagens(conversationId, after = null) {
            const query = after ? `?after=${encodeURIComponent(after)}` : '';
            return getCore().requisicao(`/chat/conversations/${encodeURIComponent(conversationId)}/messages${query}`, {
                method: 'GET',
                headers: getCore().obterHeaders(true)
            });
        },

        /**
         * Envia mensagem de texto, foto ou proposta de oferta
         */
        async enviarMensagem(conversationId, content, messageType = 'TEXT', offerValue = null) {
            return getCore().requisicao(`/chat/conversations/${encodeURIComponent(conversationId)}/messages`, {
                method: 'POST',
                headers: getCore().obterHeaders(true),
                body: JSON.stringify({ content, messageType, offerValue })
            });
        },

        /**
         * Alterna o status de bloqueio da conversa (Bloquear/Desbloquear)
         */
        async bloquearConversa(conversationId) {
            return getCore().requisicao(`/chat/conversations/${encodeURIComponent(conversationId)}/block`, {
                method: 'PATCH',
                headers: getCore().obterHeaders(true)
            });
        },

        /**
         * Aceita uma proposta de preço recebida
         */
        async aceitarProposta(messageId) {
            return getCore().requisicao(`/chat/messages/${encodeURIComponent(messageId)}/accept`, {
                method: 'PATCH',
                headers: getCore().obterHeaders(true)
            });
        },

        /**
         * Recusa uma proposta de preço recebida
         */
        async recusarProposta(messageId) {
            return getCore().requisicao(`/chat/messages/${encodeURIComponent(messageId)}/reject`, {
                method: 'PATCH',
                headers: getCore().obterHeaders(true)
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
