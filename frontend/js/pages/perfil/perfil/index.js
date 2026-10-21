/**
 * ITAIM VENDE - PERFIL: ORQUESTRADOR GERAL
 * Arquivo: frontend/js/pages/perfil/perfil/index.js
 */

(function () {
    'use strict';

    async function inicializar() {
        if (window.ItaimPerfilDados?.inicializar) {
            await window.ItaimPerfilDados.inicializar();
        }
        if (window.ItaimPerfilAvatarUpload?.inicializar) {
            window.ItaimPerfilAvatarUpload.inicializar();
        }
        if (window.ItaimPerfilAnuncios?.inicializar) {
            await window.ItaimPerfilAnuncios.inicializar();
        }
        if (window.ItaimPerfilAvaliacoes?.inicializar) {
            window.ItaimPerfilAvaliacoes.inicializar();
        }
    }

    window.ItaimPerfilOrquestrador = {
        inicializar
    };
})();
