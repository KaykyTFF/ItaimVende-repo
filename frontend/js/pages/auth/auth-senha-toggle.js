/**
 * ITAIM VENDE - AUTENTICAÇÃO: MÓDULO DE VISIBILIDADE DE SENHA
 * Arquivo: frontend/js/pages/auth/auth-senha-toggle.js
 * 
 * Alterna a visibilidade (mostrar/ocultar senha) em campos de senha com ícones de olho.
 */

(function (window, document) {
    'use strict';

    window.ItaimAuthSenhaToggle = {
        configurarToggle: function (btnId, inputId) {
            const btn = document.getElementById(btnId);
            const input = document.getElementById(inputId);
            if (!btn || !input) return;

            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const isPass = input.getAttribute('type') === 'password';
                input.setAttribute('type', isPass ? 'text' : 'password');
                const iconAberto = btn.querySelector('.icone-aberto');
                const iconFechado = btn.querySelector('.icone-fechado');
                if (iconAberto && iconFechado) {
                    iconAberto.classList.toggle('icone-oculto', isPass);
                    iconFechado.classList.toggle('icone-oculto', !isPass);
                }
                input.focus();
            });
        },

        inicializar: function () {
            this.configurarToggle('btn-toggle-senha-login', 'input-senha');

            const inputCadSenhaId = document.getElementById('cad-senha-completo') ? 'cad-senha-completo' : 'cad-senha';
            const inputCadConfirmaId = document.getElementById('cad-confirma-senha') ? 'cad-confirma-senha' : 'cad-confirma';

            this.configurarToggle('btn-toggle-cad-senha', inputCadSenhaId);
            this.configurarToggle('btn-toggle-cad-confirma', inputCadConfirmaId);

            this.configurarToggle('btn-toggle-rec-nova-senha', 'recuperar-nova-senha');
            this.configurarToggle('btn-toggle-rec-confirma-senha', 'recuperar-confirmar-senha');
        }
    };

})(window, document);
