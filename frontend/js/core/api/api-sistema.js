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
