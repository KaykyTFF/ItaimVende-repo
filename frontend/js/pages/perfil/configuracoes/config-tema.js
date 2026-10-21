/**
 * ITAIM VENDE - CONFIGURAÇÕES: APARÊNCIA E TEMA (LIGHT/DARK)
 * Arquivo: frontend/js/pages/perfil/configuracoes/config-tema.js
 */

(function () {
    'use strict';

    function inicializar() {
        const { $, toast } = window.ItaimConfigUtils;

        function sincronizarTelaTema(tema) {
            const isDark = (tema === 'dark');
            const cardClaro = $('card-tema-claro');
            const cardEscuro = $('card-tema-escuro');
            const switchTema = $('switch-tema-escuro');
            const legenda = $('cfg-tema-legenda');

            if (cardClaro) {
                cardClaro.classList.toggle('ativo', !isDark);
                cardClaro.setAttribute('aria-pressed', !isDark ? 'true' : 'false');
            }
            if (cardEscuro) {
                cardEscuro.classList.toggle('ativo', isDark);
                cardEscuro.setAttribute('aria-pressed', isDark ? 'true' : 'false');
            }
            if (switchTema) {
                switchTema.checked = isDark;
            }
            if (legenda) {
                legenda.textContent = isDark ? 'Atualmente no Modo Escuro' : 'Atualmente no Modo Claro';
            }
        }

        const temaInicial = (window.ItaimTema && typeof window.ItaimTema.obterTema === 'function')
            ? window.ItaimTema.obterTema()
            : (localStorage.getItem('itaim_tema') || 'light');
        sincronizarTelaTema(temaInicial);

        // Eventos nos botões e cartões de tema
        document.querySelectorAll('.btn-ativar-tema, .cfg-tema-card').forEach(btn => {
            btn.addEventListener('click', () => {
                const tema = btn.getAttribute('data-tema') || btn.closest('[data-tema]')?.getAttribute('data-tema');
                if (!tema) return;
                if (window.ItaimTema && typeof window.ItaimTema.definirTema === 'function') {
                    window.ItaimTema.definirTema(tema);
                }
                sincronizarTelaTema(tema);
                toast(tema === 'dark' ? 'Modo Escuro ativado.' : 'Modo Claro ativado.');
            });
        });

        const switchTemaEscuro = $('switch-tema-escuro');
        if (switchTemaEscuro) {
            switchTemaEscuro.addEventListener('change', (e) => {
                const novoTema = e.target.checked ? 'dark' : 'light';
                if (window.ItaimTema && typeof window.ItaimTema.definirTema === 'function') {
                    window.ItaimTema.definirTema(novoTema);
                }
                sincronizarTelaTema(novoTema);
                toast(novoTema === 'dark' ? 'Modo Escuro ativado.' : 'Modo Claro ativado.');
            });
        }

        window.addEventListener('itaim:tema-alterado', (e) => {
            if (e.detail && e.detail.tema) {
                sincronizarTelaTema(e.detail.tema);
            }
        });

        window.ItaimConfigTema.sincronizarTelaTema = sincronizarTelaTema;
    }

    window.ItaimConfigTema = {
        inicializar,
        sincronizarTelaTema: null
    };
})();
