/**
 * ITAIM VENDE - CONFIGURAÇÕES: INICIALIZADOR GERAL
 * Arquivo: frontend/js/pages/perfil/configuracoes/index.js
 */

(function () {
    'use strict';

    function inicializar() {
        if (window.ItaimConfigNavegacao?.inicializar) window.ItaimConfigNavegacao.inicializar();
        if (window.ItaimConfigRisco?.inicializar) window.ItaimConfigRisco.inicializar();
        if (window.ItaimConfigConta?.inicializar) window.ItaimConfigConta.inicializar();
        if (window.ItaimConfigSeguranca?.inicializar) window.ItaimConfigSeguranca.inicializar();
        if (window.ItaimConfigEnderecos?.inicializar) window.ItaimConfigEnderecos.inicializar();
        if (window.ItaimConfigPreferencias?.inicializar) window.ItaimConfigPreferencias.inicializar();
        if (window.ItaimConfigPrivacidade?.inicializar) window.ItaimConfigPrivacidade.inicializar();
        if (window.ItaimConfigTema?.inicializar) window.ItaimConfigTema.inicializar();
        if (window.ItaimConfigSuporte?.inicializar) window.ItaimConfigSuporte.inicializar();
    }

    window.ItaimConfigOrquestrador = {
        inicializar
    };
})();
