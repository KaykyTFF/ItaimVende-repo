/**
 * ITAIM VENDE - AUTENTICAÇÃO: MÓDULO DE VISIBILIDADE DE SENHA
 * Arquivo: frontend/js/pages/auth/auth-senha-toggle.js
 * 
 * Regra de exibição dos ícones:
 * - Senha OCULTADA (type="password"): exibe ícone com traço (icone-fechado)
 * - Senha VISÍVEL (type="text"): exibe ícone aberto (icone-aberto)
 */

(function (window, document) {
    'use strict';

    function sincronizarIcones(btn, input) {
        if (!btn || !input) return;

        const estaOculta = (input.type === 'password') || (input.getAttribute('type') === 'password');
        const iconAberto = btn.querySelector('.icone-aberto');
        const iconFechado = btn.querySelector('.icone-fechado');

        if (iconAberto && iconFechado) {
            if (estaOculta) {
                // Senha OCULTADA -> exibe ícone com traço, oculta ícone aberto
                iconAberto.classList.add('icone-oculto');
                iconFechado.classList.remove('icone-oculto');
            } else {
                // Senha VISÍVEL -> exibe ícone aberto, oculta ícone com traço
                iconAberto.classList.remove('icone-oculto');
                iconFechado.classList.add('icone-oculto');
            }
        }

        btn.setAttribute('aria-pressed', estaOculta ? 'false' : 'true');
        btn.setAttribute('title', estaOculta ? 'Exibir senha' : 'Ocultar senha');
    }

    function alternarVisibilidade(btn, input) {
        if (!btn || !input) return;

        const estaOculta = (input.type === 'password') || (input.getAttribute('type') === 'password');
        // Se está oculta, o clique vai MOSTRAR a senha (tipo 'text')
        // Se já está visível, o clique vai OCULTAR a senha (tipo 'password')
        const vaiMostrar = estaOculta;
        const novoTipo = vaiMostrar ? 'text' : 'password';

        input.type = novoTipo;
        input.setAttribute('type', novoTipo);

        sincronizarIcones(btn, input);

        // Se o input já está focado, apenas mantém o cursor no fim sem re-disparar foco/blur (evita piscar o card)
        try {
            if (document.activeElement !== input) {
                input.focus({ preventScroll: true });
            }
            const len = input.value ? input.value.length : 0;
            if (typeof input.setSelectionRange === 'function') {
                input.setSelectionRange(len, len);
            }
        } catch (_) {}
    }

    // Previne blur do input no mousedown para eliminar o efeito de "piscar" ou animação do card ao clicar no olho
    if (!window._itaimToggleSenhaMouseDownDelegado) {
        window._itaimToggleSenhaMouseDownDelegado = true;

        document.addEventListener('mousedown', function (e) {
            const btn = e.target && e.target.closest ? e.target.closest('.btn-toggle-senha') : null;
            if (btn) {
                e.preventDefault();
            }
        }, true);
    }

    // Gerenciador universal via Delegação de Eventos no Documento
    if (!window._itaimToggleSenhaDelegado) {
        window._itaimToggleSenhaDelegado = true;

        document.addEventListener('click', function (e) {
            const btn = e.target && e.target.closest ? e.target.closest('.btn-toggle-senha') : null;
            if (!btn) return;

            e.preventDefault();
            e.stopPropagation();

            // 1. Tenta achar input no mesmo .input-wrapper
            let input = null;
            const wrapper = btn.closest('.input-wrapper');
            if (wrapper) {
                input = wrapper.querySelector('input');
            }

            // 2. Fallback por mapeamento de IDs conhecidos
            if (!input) {
                const idMap = {
                    'btn-toggle-senha-login': 'input-senha',
                    'btn-toggle-cad-senha': document.getElementById('cad-senha-completo') ? 'cad-senha-completo' : 'cad-senha',
                    'btn-toggle-cad-confirma': document.getElementById('cad-confirma-senha') ? 'cad-confirma-senha' : 'cad-confirma',
                    'btn-toggle-rec-nova-senha': 'recuperar-nova-senha',
                    'btn-toggle-rec-confirma-senha': 'recuperar-confirmar-senha'
                };
                const inputId = idMap[btn.id];
                if (inputId) {
                    input = document.getElementById(inputId);
                }
            }

            if (input) {
                alternarVisibilidade(btn, input);
            }
        }, true);
    }

    window.ItaimAuthSenhaToggle = {
        configurarToggle: function (btnId, inputId) {
            const btn = document.getElementById(btnId);
            const input = document.getElementById(inputId);
            if (!btn || !input) return;

            // Sincroniza estado inicial dos ícones com o tipo do input
            sincronizarIcones(btn, input);

            if (btn.dataset.toggleConfigurado === 'true') return;
            btn.dataset.toggleConfigurado = 'true';
        },

        sincronizarTodos: function () {
            document.querySelectorAll('.btn-toggle-senha').forEach(btn => {
                const wrapper = btn.closest('.input-wrapper');
                const input = wrapper ? wrapper.querySelector('input') : null;
                if (input) {
                    sincronizarIcones(btn, input);
                }
            });
        },

        alternar: alternarVisibilidade,

        inicializar: function () {
            this.configurarToggle('btn-toggle-senha-login', 'input-senha');

            const inputCadSenhaId = document.getElementById('cad-senha-completo') ? 'cad-senha-completo' : 'cad-senha';
            const inputCadConfirmaId = document.getElementById('cad-confirma-senha') ? 'cad-confirma-senha' : 'cad-confirma';

            this.configurarToggle('btn-toggle-cad-senha', inputCadSenhaId);
            this.configurarToggle('btn-toggle-cad-confirma', inputCadConfirmaId);

            this.configurarToggle('btn-toggle-rec-nova-senha', 'recuperar-nova-senha');
            this.configurarToggle('btn-toggle-rec-confirma-senha', 'recuperar-confirmar-senha');

            this.sincronizarTodos();
        }
    };

    // Auto-inicializa assim que o arquivo é avaliado
    if (document.readyState !== 'loading') {
        window.ItaimAuthSenhaToggle.inicializar();
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            window.ItaimAuthSenhaToggle.inicializar();
        });
    }

})(window, document);
