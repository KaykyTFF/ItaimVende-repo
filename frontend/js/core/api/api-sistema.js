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
            requisicao: () => Promise.reject(new Error('ItaimApiCore não carregado')),
            obterHeaders: () => ({})
        };
    }

    const sistema = {
        async obterStatus() {
            return getCore().requisicao('/system/status', {
                headers: getCore().obterHeaders(true)
            });
        },
        async executarDiagnostico() {
            return getCore().requisicao('/system/diagnostics', {
                method: 'POST',
                headers: getCore().obterHeaders(true)
            });
        },
        async health() {
            return getCore().requisicao('/health');
        },
        async obterTunnel() {
            return getCore().requisicao('/system/tunnel', {
                headers: getCore().obterHeaders(true)
            });
        },
        async iniciarTunnel() {
            return getCore().requisicao('/system/tunnel/start', {
                method: 'POST',
                headers: getCore().obterHeaders(true)
            });
        },
        async pararTunnel() {
            return getCore().requisicao('/system/tunnel/stop', {
                method: 'POST',
                headers: getCore().obterHeaders(true)
            });
        },
        async auditarStorage() {
            return getCore().requisicao('/system/storage/audit', {
                headers: getCore().obterHeaders(true)
            });
        },
        async limparStorageOrfaos() {
            return getCore().requisicao('/system/storage/clean', {
                method: 'POST',
                headers: getCore().obterHeaders(true)
            });
        },
        async gerarProdutosDemo() {
            return getCore().requisicao('/system/seed/products', {
                method: 'POST',
                headers: getCore().obterHeaders(true)
            });
        },
        async limparProdutosDemo() {
            return getCore().requisicao('/system/seed/clean', {
                method: 'POST',
                headers: getCore().obterHeaders(true)
            });
        },
        async obterVisaoGeralDados() {
            return getCore().requisicao('/system/data/overview', {
                headers: getCore().obterHeaders(true)
            });
        },
        async alternarStatusProduto(id) {
            return getCore().requisicao(`/system/data/products/${encodeURIComponent(id)}/toggle`, {
                method: 'PATCH',
                headers: getCore().obterHeaders(true)
            });
        },
        async alternarStatusUsuario(id) {
            return getCore().requisicao(`/system/data/users/${encodeURIComponent(id)}/toggle`, {
                method: 'PATCH',
                headers: getCore().obterHeaders(true)
            });
        }
    };

    window.ItaimApiSistema = sistema;

})();
