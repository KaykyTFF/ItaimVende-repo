/**
 * ITAIM VENDE - PONTO DE ENTRADA DO PAINEL ADMINISTRATIVO & OBSERVABILIDADE
 * Arquivo: frontend/js/pages/admin/index.js
 * 
 * Carrega dinamicamente todos os submódulos do painel de administração:
 * - painel-utils-logs.js: Constantes, mapeamento de DOM, toasts, logs e relatório
 * - painel-status-telemetria.js: Métricas, hero e gráfico Sparkline em Canvas
 * - painel-tunnel.js: Conexão pública Cloudflare Quick Tunnel e QR Code
 * - painel-database-storage.js: Auditoria de arquivos órfãos, seed demo e API playground
 * - painel-moderacao.js: Moderação ágil de produtos e usuários
 * - painel-testes.js: Matriz automatizada de testes de integridade das rotas
 * - painel-eventos.js: Binding de cliques, atalhos, auto-refresh e ciclo de vida
 */

(function () {
    'use strict';

    const scriptAtual = document.currentScript;
    const base = scriptAtual ? scriptAtual.src.substring(0, scriptAtual.src.lastIndexOf('/') + 1) : '';

    const arquivos = [
        'painel-utils-logs.js',
        'painel-status-telemetria.js',
        'painel-tunnel.js',
        'painel-database-storage.js',
        'painel-moderacao.js',
        'painel-testes.js',
        'painel-eventos.js'
    ];

    arquivos.forEach(function (arquivo) {
        document.write('<script src="' + base + arquivo + '"><\/script>');
    });

    document.addEventListener('DOMContentLoaded', () => {
        if (window.ItaimAdminEventos?.iniciarPainel) {
            window.ItaimAdminEventos.iniciarPainel();
        }
    });

})();
