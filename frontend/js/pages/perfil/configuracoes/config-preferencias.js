/**
 * ITAIM VENDE - CONFIGURAÇÕES: PREFERÊNCIAS, NOTIFICAÇÕES E PRIVACIDADE
 * Arquivo: frontend/js/pages/perfil/configuracoes/config-preferencias.js
 */

(function () {
    'use strict';

    function inicializar() {
        const { CHAVE_CONFIG, PADROES, ler, gravar, toast } = window.ItaimConfigUtils;

        let config = { ...PADROES, ...ler(CHAVE_CONFIG, {}) };
        const interruptores = document.querySelectorAll('input[data-chave]');

        function aplicarConfigNaTela() {
            interruptores.forEach(i => {
                i.checked = !!config[i.dataset.chave];
            });
        }

        aplicarConfigNaTela();

        interruptores.forEach(i => {
            i.addEventListener('change', () => {
                config[i.dataset.chave] = i.checked;
                gravar(CHAVE_CONFIG, config);
                toast('Preferência salva.');
                if (window.ItaimNotificacoes && typeof window.ItaimNotificacoes.atualizarBadgesNotificacoes === 'function') {
                    window.ItaimNotificacoes.atualizarBadgesNotificacoes();
                }
            });
        });
    }

    window.ItaimConfigPreferencias = {
        inicializar
    };
})();
