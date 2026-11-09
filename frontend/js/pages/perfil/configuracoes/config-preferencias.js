/**
 * ITAIM VENDE - CONFIGURAÇÕES: PREFERÊNCIAS, NOTIFICAÇÕES E PRIVACIDADE
 * Arquivo: frontend/js/pages/perfil/configuracoes/config-preferencias.js
 */

(function () {
    'use strict';

    function inicializar() {
        const { CHAVE_CONFIG, PADROES, ler, gravar, toast } = window.ItaimConfigUtils || {};
        if (!CHAVE_CONFIG) return;

        let config = { ...PADROES, ...(ler ? ler(CHAVE_CONFIG, {}) : {}) };
        const interruptores = document.querySelectorAll('input[data-chave]');

        function aplicarConfigNaTela() {
            interruptores.forEach(i => {
                if (config[i.dataset.chave] !== undefined) {
                    i.checked = !!config[i.dataset.chave];
                }
            });
        }

        aplicarConfigNaTela();

        // Se o usuário estiver autenticado, sincroniza com o banco de dados
        async function carregarPreferenciasServidor() {
            try {
                if (window.ItaimApi && window.ItaimApi.auth && typeof window.ItaimApi.auth.obterPreferencias === 'function') {
                    const token = window.ItaimApi.auth.obterToken ? window.ItaimApi.auth.obterToken() : localStorage.getItem('itaim_token');
                    if (!token) return;

                    const res = await window.ItaimApi.auth.obterPreferencias();
                    if (res && res.success && res.preferences) {
                        config = { ...config, ...res.preferences };
                        if (gravar) gravar(CHAVE_CONFIG, config);
                        aplicarConfigNaTela();
                    }
                }
            } catch (err) {
                // Silencioso em caso de offline; mantém preferências locais
                console.info('[ConfigPreferencias] Usando preferências locais de cache.');
            }
        }

        carregarPreferenciasServidor();

        interruptores.forEach(i => {
            i.addEventListener('change', async () => {
                const chave = i.dataset.chave;
                const valor = i.checked;
                config[chave] = valor;

                if (gravar) gravar(CHAVE_CONFIG, config);

                if (typeof toast === 'function') {
                    toast('Preferência salva.');
                }

                // Dispara recálculo dos badges e eventos locais
                if (window.ItaimNotificacoes && typeof window.ItaimNotificacoes.atualizarBadgesNotificacoes === 'function') {
                    window.ItaimNotificacoes.atualizarBadgesNotificacoes();
                }
                if (window.ItaimComponentesBadges && typeof window.ItaimComponentesBadges.atualizarBadgesGlobais === 'function') {
                    window.ItaimComponentesBadges.atualizarBadgesGlobais();
                }

                // Sincroniza de forma atômica com o backend
                try {
                    if (window.ItaimApi && window.ItaimApi.auth && typeof window.ItaimApi.auth.atualizarPreferencias === 'function') {
                        const token = window.ItaimApi.auth.obterToken ? window.ItaimApi.auth.obterToken() : localStorage.getItem('itaim_token');
                        if (token) {
                            await window.ItaimApi.auth.atualizarPreferencias({ [chave]: valor });
                        }
                    }
                } catch (err) {
                    console.warn('[ConfigPreferencias] Erro ao sincronizar preferência com o servidor:', err.message);
                }
            });
        });
    }

    window.ItaimConfigPreferencias = {
        inicializar
    };
})();
