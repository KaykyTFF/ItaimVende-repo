/**
 * ITAIM VENDE - PONTO DE ENTRADA DO MÓDULO DE MENSAGENS E CHAT
 * Arquivo: frontend/js/pages/mensagens/conversas.js
 * 
 * Carrega dinamicamente todos os submódulos de chat:
 * - conversas-utils.js: Formatações, horários, fotos e cache local
 * - conversas-estado.js: Mapeamento de DOM, dados de sessão e telas vazias
 * - conversas-lista.js: Lista lateral de conversas e busca
 * - conversas-feed.js: Painel de mensagens, balões e detalhes do produto
 * - conversas-envio.js: Envio de texto, anexos, lightbox e propostas
 * - conversas-acoes.js: Bloqueio, polling em tempo real e rotas
 */

(function () {
    'use strict';

    const scriptAtual = document.currentScript;
    const base = scriptAtual ? scriptAtual.src.substring(0, scriptAtual.src.lastIndexOf('/') + 1) : '';

    const arquivos = [
        'conversas-utils.js',
        'conversas-estado.js',
        'conversas-lista.js',
        'conversas-feed.js?v=3',
        'conversas-envio.js',
        'conversas-acoes.js'
    ];

    arquivos.forEach(function (arquivo) {
        document.write('<script src="' + base + arquivo + '"><\/script>');
    });

    document.addEventListener('DOMContentLoaded', async () => {
        if (window.ItaimChatEstado) window.ItaimChatEstado.inicializar();
        if (!window.ItaimChatEstado?.token) {
            if (window.ItaimChatEstado) window.ItaimChatEstado.exibirEstadoNaoAutenticado();
            return;
        }

        if (window.ItaimChatLista) window.ItaimChatLista.inicializar();
        if (window.ItaimChatEnvio) window.ItaimChatEnvio.inicializar();
        if (window.ItaimChatAcoes) {
            window.ItaimChatAcoes.inicializarEventos();
            await window.ItaimChatAcoes.processarInicializacaoRotas();
        }
    });

})();
