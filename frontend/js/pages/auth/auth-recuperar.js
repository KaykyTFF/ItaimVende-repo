/**
 * ITAIM VENDE - AUTENTICAÇÃO: MÓDULO DE RECUPERAÇÃO DE SENHA
 * Arquivo: frontend/js/pages/auth/auth-recuperar.js
 * 
 * Gerencia o fluxo de redefinição de senha em duas etapas com
 * interface OTP numérica moderna (6 quadrinhos com auto-avanço, colar e backspace).
 */

(function (window, document) {
    'use strict';

    window.ItaimAuthRecuperar = {
        obterCodigoOtp: function () {
            const otpQuadrinhos = document.querySelectorAll('.otp-quadrinho');
            return Array.from(otpQuadrinhos).map(q => q.value.trim()).join('');
        },

        atualizarCodigoOtp: function () {
            const codigo = this.obterCodigoOtp();
            const inputRecCodigo = document.getElementById('recuperar-codigo');
            if (inputRecCodigo) {
                inputRecCodigo.value = codigo;
            }
            const otpQuadrinhos = document.querySelectorAll('.otp-quadrinho');
            otpQuadrinhos.forEach(quadrinho => {
                if (quadrinho.value) {
                    quadrinho.classList.add('preenchido');
                    quadrinho.classList.remove('com-erro');
                } else {
                    quadrinho.classList.remove('preenchido');
                }
            });
            return codigo;
        },

        limparOtpQuadrinhos: function () {
            const otpQuadrinhos = document.querySelectorAll('.otp-quadrinho');
            otpQuadrinhos.forEach(q => {
                q.value = '';
                q.classList.remove('preenchido', 'com-erro');
            });
            const inputRecCodigo = document.getElementById('recuperar-codigo');
            if (inputRecCodigo) inputRecCodigo.value = '';
        },

        focarPrimeiroQuadrinhoOtp: function () {
            const otpQuadrinhos = document.querySelectorAll('.otp-quadrinho');
            const primeiroVazio = Array.from(otpQuadrinhos).find(q => !q.value) || otpQuadrinhos[0];
            if (primeiroVazio) {
                primeiroVazio.focus();
                primeiroVazio.select();
            }
        },

        destacarErroOtp: function () {
            const otpQuadrinhos = document.querySelectorAll('.otp-quadrinho');
            otpQuadrinhos.forEach(q => {
                if (!q.value) {
                    q.classList.add('com-erro');
                }
            });
            this.focarPrimeiroQuadrinhoOtp();
        },

        irParaEtapa: function (etapa) {
            const formRecEtapa1 = document.getElementById('form-recuperar-etapa1');
            const formRecEtapa2 = document.getElementById('form-recuperar-etapa2');
            const subtituloRecuperar = document.getElementById('subtitulo-recuperar');
            const inputRecEmail = document.getElementById('recuperar-email');
            const statusRecEtapa1 = document.getElementById('status-modal-recuperar');
            const statusRecEtapa2 = document.getElementById('status-recuperar-etapa2');

            if (etapa === 1) {
                if (formRecEtapa1) formRecEtapa1.style.display = 'block';
                if (formRecEtapa2) formRecEtapa2.style.display = 'none';
                if (subtituloRecuperar) subtituloRecuperar.textContent = 'Informe seu e-mail para receber o código de verificação.';
                if (statusRecEtapa1) { statusRecEtapa1.textContent = ''; statusRecEtapa1.className = 'status-msg'; }
                if (inputRecEmail) setTimeout(() => inputRecEmail.focus(), 80);
            } else {
                if (formRecEtapa1) formRecEtapa1.style.display = 'none';
                if (formRecEtapa2) formRecEtapa2.style.display = 'block';
                const emailDigitado = inputRecEmail ? inputRecEmail.value.trim() : 'seu e-mail';
                if (subtituloRecuperar) subtituloRecuperar.textContent = `Código enviado para ${emailDigitado}. Insira os números:`;
                if (statusRecEtapa2) { statusRecEtapa2.textContent = ''; statusRecEtapa2.className = 'status-msg'; }
                this.limparOtpQuadrinhos();
                setTimeout(() => this.focarPrimeiroQuadrinhoOtp(), 80);
            }
        },

        configurarQuadrinhosOtp: function () {
            const self = this;
            const otpQuadrinhos = document.querySelectorAll('.otp-quadrinho');

            otpQuadrinhos.forEach((quadrinho, index) => {
                quadrinho.addEventListener('keydown', (e) => {
                    const permitidas = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'];
                    if (permitidas.includes(e.key) || e.ctrlKey || e.metaKey) {
                        if (e.key === 'Backspace') {
                            if (!e.target.value && index > 0) {
                                e.preventDefault();
                                otpQuadrinhos[index - 1].value = '';
                                otpQuadrinhos[index - 1].focus();
                                self.atualizarCodigoOtp();
                            }
                        } else if (e.key === 'ArrowLeft' && index > 0) {
                            e.preventDefault();
                            otpQuadrinhos[index - 1].focus();
                            otpQuadrinhos[index - 1].select();
                        } else if (e.key === 'ArrowRight' && index < otpQuadrinhos.length - 1) {
                            e.preventDefault();
                            otpQuadrinhos[index + 1].focus();
                            otpQuadrinhos[index + 1].select();
                        }
                        return;
                    }

                    if (!/^[0-9]$/.test(e.key)) {
                        e.preventDefault();
                    }
                });

                quadrinho.addEventListener('input', (e) => {
                    const val = e.target.value.replace(/\D/g, '');

                    if (val.length > 0) {
                        if (val.length > 1) {
                            const digitos = val.split('');
                            let currIdx = index;
                            digitos.forEach(digito => {
                                if (currIdx < otpQuadrinhos.length) {
                                    otpQuadrinhos[currIdx].value = digito;
                                    currIdx++;
                                }
                            });
                            const proximoFoco = currIdx < otpQuadrinhos.length ? otpQuadrinhos[currIdx] : otpQuadrinhos[otpQuadrinhos.length - 1];
                            if (proximoFoco) {
                                proximoFoco.focus();
                                proximoFoco.select();
                            }
                        } else {
                            e.target.value = val;
                            if (index < otpQuadrinhos.length - 1) {
                                otpQuadrinhos[index + 1].focus();
                                otpQuadrinhos[index + 1].select();
                            }
                        }
                    } else {
                        e.target.value = '';
                    }
                    self.atualizarCodigoOtp();
                });

                quadrinho.addEventListener('paste', (e) => {
                    e.preventDefault();
                    const dadosColados = (e.clipboardData || window.clipboardData).getData('text');
                    const apenasNumeros = dadosColados.replace(/\D/g, '').slice(0, otpQuadrinhos.length);

                    if (apenasNumeros.length > 0) {
                        const digitos = apenasNumeros.split('');
                        digitos.forEach((num, i) => {
                            if (otpQuadrinhos[i]) {
                                otpQuadrinhos[i].value = num;
                            }
                        });
                        self.atualizarCodigoOtp();

                        const proxIndex = Math.min(digitos.length, otpQuadrinhos.length - 1);
                        if (otpQuadrinhos[proxIndex]) {
                            otpQuadrinhos[proxIndex].focus();
                            otpQuadrinhos[proxIndex].select();
                        }
                    }
                });

                quadrinho.addEventListener('focus', function () {
                    this.select();
                });
            });
        },

        inicializar: function () {
            const self = this;
            const formRecEtapa1 = document.getElementById('form-recuperar-etapa1');
            const formRecEtapa2 = document.getElementById('form-recuperar-etapa2');
            const btnVoltarRecEtapa1 = document.getElementById('btn-recuperar-voltar-etapa1');
            const statusRecEtapa2 = document.getElementById('status-recuperar-etapa2');

            this.configurarQuadrinhosOtp();

            formRecEtapa1?.addEventListener('submit', (e) => {
                e.preventDefault();
                self.irParaEtapa(2);
            });

            btnVoltarRecEtapa1?.addEventListener('click', (e) => {
                e.preventDefault();
                self.irParaEtapa(1);
            });

            formRecEtapa2?.addEventListener('submit', (e) => {
                e.preventDefault();
                const codigo = self.obterCodigoOtp();

                if (codigo.length < 6) {
                    if (statusRecEtapa2) {
                        statusRecEtapa2.textContent = 'Por favor, insira todos os 6 números do código.';
                        statusRecEtapa2.className = 'status-msg status-erro';
                    }
                    self.destacarErroOtp();
                    return;
                }

                if (statusRecEtapa2) {
                    statusRecEtapa2.textContent = 'Código validado com sucesso! Redirecionando...';
                    statusRecEtapa2.className = 'status-msg status-sucesso';
                }
                setTimeout(() => {
                    if (statusRecEtapa2) statusRecEtapa2.textContent = '';
                    if (window.ItaimAuthNavegacao && typeof window.ItaimAuthNavegacao.alternarTela === 'function') {
                        window.ItaimAuthNavegacao.alternarTela('login');
                    }
                    const statusMsgLogin = document.getElementById('status-msg-login');
                    if (statusMsgLogin) {
                        statusMsgLogin.textContent = 'Identidade confirmada! Acesse com suas credenciais.';
                        statusMsgLogin.className = 'status-msg status-sucesso';
                    }
                }, 800);
            });
        }
    };

})(window, document);
