/**
 * ITAIM VENDE - VENDEDOR: ORQUESTRADOR GERAL
 * Arquivo: frontend/js/pages/perfil/vendedor/index.js
 */

(function () {
    'use strict';

    async function inicializar() {
        if (window.ItaimVendedorDados?.inicializar) {
            await window.ItaimVendedorDados.inicializar();
        }
        if (window.ItaimVendedorVitrine?.inicializar) {
            window.ItaimVendedorVitrine.inicializar();
        }
        if (window.ItaimVendedorAvaliacoes?.inicializar) {
            window.ItaimVendedorAvaliacoes.inicializar();
        }

        // Sincronização do Header Global
        if (window.ItaimSessao && typeof window.ItaimSessao.atualizarHeaderUsuario === 'function') {
            window.ItaimSessao.atualizarHeaderUsuario();
        }
    }

    window.ItaimVendedorOrquestrador = {
        inicializar
    };
})();
