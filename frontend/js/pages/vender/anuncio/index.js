/**
 * ITAIM VENDE - VENDER: ORQUESTRADOR CENTRAL DO CICLO DE VIDA DO ANÚNCIO
 * Arquivo: frontend/js/pages/vender/anuncio/index.js
 */

(function () {
    'use strict';

    async function inicializar() {
        try {
            if (window.ItaimVenderFotos?.inicializar) {
                window.ItaimVenderFotos.inicializar();
            }

            if (window.ItaimVenderLocalizacao?.inicializar) {
                window.ItaimVenderLocalizacao.inicializar();
            }

            if (window.ItaimVenderWizard?.inicializar) {
                window.ItaimVenderWizard.inicializar();
            }

            if (window.ItaimVenderPublicacao?.inicializar) {
                window.ItaimVenderPublicacao.inicializar();
            }
        } catch (err) {
            console.error('[Vender Orquestrador] Erro ao inicializar módulos:', err);
        }
    }

    window.ItaimVenderOrquestrador = {
        inicializar
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inicializar);
    } else {
        inicializar();
    }
})();

