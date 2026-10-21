/**
 * ITAIM VENDE - AUTENTICAÇÃO: MÓDULO DE NAVEGAÇÃO DE TELAS
 * Arquivo: frontend/js/pages/auth/auth-navegacao.js
 * 
 * Responsável pela alternância entre as telas de Login, Cadastro Wizard e Recuperação de Senha,
 * além do sincronismo automático com a hash da URL (#login, #cadastro, #recuperar).
 */

(function (window, document) {
    'use strict';

    window.ItaimAuthNavegacao = {
        alternarTela: function (tela) {
            const secaoLogin = document.getElementById('secao-login');
            const secaoCadastro = document.getElementById('secao-cadastro');
            const secaoRecuperar = document.getElementById('secao-recuperar');

            if (!secaoLogin || !secaoCadastro || !secaoRecuperar) return;

            // Oculta todas as telas
            secaoLogin.style.display = 'none';
            secaoLogin.classList.remove('secao-ativa');
            secaoCadastro.style.display = 'none';
            secaoCadastro.classList.remove('secao-ativa');
            secaoRecuperar.style.display = 'none';
            secaoRecuperar.classList.remove('secao-ativa');

            if (tela === 'cadastro') {
                secaoCadastro.style.display = 'block';
                secaoCadastro.classList.add('secao-ativa');
                if (window.ItaimAuthCadastroWizard && typeof window.ItaimAuthCadastroWizard.irParaEtapa === 'function') {
                    window.ItaimAuthCadastroWizard.irParaEtapa(1);
                }
            } else if (tela === 'recuperar') {
                secaoRecuperar.style.display = 'block';
                secaoRecuperar.classList.add('secao-ativa');
                if (window.ItaimAuthRecuperar && typeof window.ItaimAuthRecuperar.irParaEtapa === 'function') {
                    window.ItaimAuthRecuperar.irParaEtapa(1);
                }
            } else {
                secaoLogin.style.display = 'block';
                secaoLogin.classList.add('secao-ativa');
            }
        },

        processarHashNavegacao: function () {
            const hash = (window.location.hash || '').toLowerCase();
            if (hash === '#cadastro') {
                this.alternarTela('cadastro');
            } else if (hash === '#recuperar-senha' || hash === '#recuperar') {
                this.alternarTela('recuperar');
            } else if (hash === '#login') {
                this.alternarTela('login');
            }
        },

        inicializar: function () {
            const self = this;
            const btnIrParaCadastro = document.getElementById('btn-ir-para-cadastro');
            const btnCadVoltarLogin = document.getElementById('btn-cad-voltar-login');
            const linkEsqueceu = document.getElementById('link-esqueceu');
            const btnRecuperarVoltarLogin = document.getElementById('btn-recuperar-voltar-login');

            if (btnIrParaCadastro) {
                btnIrParaCadastro.addEventListener('click', (e) => {
                    e.preventDefault();
                    self.alternarTela('cadastro');
                    window.location.hash = '#cadastro';
                });
            }

            if (btnCadVoltarLogin) {
                btnCadVoltarLogin.addEventListener('click', (e) => {
                    e.preventDefault();
                    self.alternarTela('login');
                    window.location.hash = '#login';
                });
            }

            if (linkEsqueceu) {
                linkEsqueceu.addEventListener('click', (e) => {
                    e.preventDefault();
                    self.alternarTela('recuperar');
                    window.location.hash = '#recuperar';
                });
            }

            if (btnRecuperarVoltarLogin) {
                btnRecuperarVoltarLogin.addEventListener('click', (e) => {
                    e.preventDefault();
                    self.alternarTela('login');
                    window.location.hash = '#login';
                });
            }

            self.processarHashNavegacao();
            window.addEventListener('hashchange', () => self.processarHashNavegacao());
        }
    };

})(window, document);
