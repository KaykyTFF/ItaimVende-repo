/**
 * ITAIM VENDE - AUTENTICAÇÃO: MÓDULO DE RECUPERAÇÃO DE SENHA
 * Arquivo: frontend/js/pages/auth/auth-recuperar.js
 * 
 * Gerencia o fluxo completo de recuperação e redefinição de senha:
 * - Etapa 1: Envio do e-mail com geração de código OTP e link direto
 * - Etapa 2: Validação dos 6 dígitos OTP com reenvio temporizado (30s)
 * - Etapa 3: Definição da nova senha segura com validação de força
 * - Suporte automático a links diretos recebidos por e-mail (#recuperar?token=...&email=...)
 */

(function (window, document) {
    'use strict';

    window.ItaimAuthRecuperar = {
        emailRecuperacao: '',
        tokenRedefinicao: null,

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

        definirEstadoCarregando: function (btn, carregando, textoOriginal) {
            if (!btn) return;
            const spinner = btn.querySelector('.btn-spinner');
            const texto = btn.querySelector('.btn-texto');

            if (carregando) {
                btn.disabled = true;
                btn.style.opacity = '0.7';
                btn.style.pointerEvents = 'none';
                if (spinner) spinner.style.display = 'inline-block';
            } else {
                btn.disabled = false;
                btn.style.opacity = '1';
                btn.style.pointerEvents = 'auto';
                if (spinner) spinner.style.display = 'none';
                if (texto && textoOriginal) texto.textContent = textoOriginal;
            }
        },

        exibirStatus: function (el, msg, tipo = 'erro', segundos = 4.5) {
            if (window.ItaimStatusMsg && typeof window.ItaimStatusMsg.exibir === 'function') {
                window.ItaimStatusMsg.exibir(el, msg, tipo, segundos);
            } else if (el) {
                el.textContent = msg;
                el.className = `status-msg ${tipo ? 'status-' + tipo : ''}`;
            }
        },

        limparStatus: function (el) {
            if (window.ItaimStatusMsg && typeof window.ItaimStatusMsg.limpar === 'function') {
                window.ItaimStatusMsg.limpar(el);
            } else if (el) {
                el.textContent = '';
                el.className = 'status-msg';
            }
        },

        irParaEtapa: function (etapa) {
            const formRecEtapa1 = document.getElementById('form-recuperar-etapa1');
            const formRecEtapa2 = document.getElementById('form-recuperar-etapa2');
            const formRecEtapa3 = document.getElementById('form-recuperar-etapa3');
            const subtituloRecuperar = document.getElementById('subtitulo-recuperar');
            const inputRecEmail = document.getElementById('recuperar-email');
            const statusRecEtapa1 = document.getElementById('status-modal-recuperar');
            const statusRecEtapa2 = document.getElementById('status-recuperar-etapa2');
            const statusRecEtapa3 = document.getElementById('status-recuperar-etapa3');

            if (formRecEtapa1) formRecEtapa1.style.display = etapa === 1 ? 'block' : 'none';
            if (formRecEtapa2) formRecEtapa2.style.display = etapa === 2 ? 'block' : 'none';
            if (formRecEtapa3) formRecEtapa3.style.display = etapa === 3 ? 'block' : 'none';

            if (etapa === 1) {
                if (subtituloRecuperar) subtituloRecuperar.textContent = 'Informe seu e-mail para receber o código de verificação.';
                if (statusRecEtapa1) { statusRecEtapa1.textContent = ''; statusRecEtapa1.className = 'status-msg'; }
                if (inputRecEmail) setTimeout(() => inputRecEmail.focus(), 80);
            } else if (etapa === 2) {
                const emailDigitado = this.emailRecuperacao || (inputRecEmail ? inputRecEmail.value.trim() : 'seu e-mail');
                if (subtituloRecuperar) subtituloRecuperar.textContent = `Código enviado para ${emailDigitado}. Insira os 6 números:`;
                if (statusRecEtapa2) { statusRecEtapa2.textContent = ''; statusRecEtapa2.className = 'status-msg'; }
                this.limparOtpQuadrinhos();
                setTimeout(() => this.focarPrimeiroQuadrinhoOtp(), 80);
            } else if (etapa === 3) {
                if (subtituloRecuperar) subtituloRecuperar.textContent = 'Crie uma nova senha segura para a sua conta.';
                if (statusRecEtapa3) { statusRecEtapa3.textContent = ''; statusRecEtapa3.className = 'status-msg'; }
                const inputNovaSenha = document.getElementById('recuperar-nova-senha');
                if (inputNovaSenha) setTimeout(() => inputNovaSenha.focus(), 80);
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

        /**
         * Verifica se o link foi aberto diretamente com token na URL (e-mail)
         */
        verificarParametrosUrl: function () {
            try {
                let params = new URLSearchParams(window.location.search);
                if (window.location.hash.includes('?')) {
                    const hashQuery = window.location.hash.split('?')[1];
                    params = new URLSearchParams(hashQuery);
                }

                const token = params.get('token') || params.get('resetToken');
                const email = params.get('email');

                if (token && email) {
                    this.tokenRedefinicao = token;
                    this.emailRecuperacao = decodeURIComponent(email);

                    const inputRecEmail = document.getElementById('recuperar-email');
                    if (inputRecEmail) inputRecEmail.value = this.emailRecuperacao;

                    if (window.ItaimAuthNavegacao && typeof window.ItaimAuthNavegacao.alternarTela === 'function') {
                        window.ItaimAuthNavegacao.alternarTela('recuperar');
                    }

                    this.irParaEtapa(3);
                    const subtituloRecuperar = document.getElementById('subtitulo-recuperar');
                    if (subtituloRecuperar) {
                        subtituloRecuperar.textContent = 'Link de recuperação verificado! Defina sua nova senha abaixo.';
                    }
                }
            } catch (err) {
                console.warn('[ItaimAuthRecuperar] Erro ao ler parâmetros de recuperação na URL:', err);
            }
        },

        inicializar: function () {
            const self = this;

            const formRecEtapa1 = document.getElementById('form-recuperar-etapa1');
            const formRecEtapa2 = document.getElementById('form-recuperar-etapa2');
            const formRecEtapa3 = document.getElementById('form-recuperar-etapa3');

            const btnEnviarRecuperacao = document.getElementById('btn-enviar-recuperacao');
            const btnConfirmarCodigo = document.getElementById('btn-confirmar-codigo');
            const btnSalvarNovaSenha = document.getElementById('btn-salvar-nova-senha');

            const btnVoltarRecEtapa1 = document.getElementById('btn-recuperar-voltar-etapa1');
            const btnVoltarRecEtapa2 = document.getElementById('btn-recuperar-voltar-etapa2');

            const statusRecEtapa1 = document.getElementById('status-modal-recuperar');
            const statusRecEtapa2 = document.getElementById('status-recuperar-etapa2');
            const statusRecEtapa3 = document.getElementById('status-recuperar-etapa3');

            this.configurarQuadrinhosOtp();

            // =========================================================================
            // SUBMISSÃO DA ETAPA 1: Solicitar Código por E-mail
            // =========================================================================
            formRecEtapa1?.addEventListener('submit', async (e) => {
                e.preventDefault();
                const inputEmail = document.getElementById('recuperar-email');
                const email = inputEmail ? inputEmail.value.trim() : '';

                if (!email) {
                    self.exibirStatus(statusRecEtapa1, 'Por favor, informe seu e-mail cadastrado.', 'erro');
                    if (inputEmail) inputEmail.focus();
                    return;
                }

                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    self.exibirStatus(statusRecEtapa1, 'Por favor, insira um e-mail válido.', 'erro');
                    if (inputEmail) inputEmail.focus();
                    return;
                }

                self.emailRecuperacao = email;
                self.definirEstadoCarregando(btnEnviarRecuperacao, true);
                if (statusRecEtapa1) {
                    statusRecEtapa1.textContent = 'Enviando código de verificação...';
                    statusRecEtapa1.className = 'status-msg';
                }

                try {
                    if (window.ItaimApiAuth && typeof window.ItaimApiAuth.solicitarRecuperacao === 'function') {
                        const resposta = await window.ItaimApiAuth.solicitarRecuperacao(email);
                        self.irParaEtapa(2);
                        if (statusRecEtapa2) {
                            statusRecEtapa2.textContent = resposta.message || `Código enviado para ${email}! Verifique seu e-mail.`;
                            statusRecEtapa2.className = 'status-msg status-sucesso';
                        }
                    } else {
                        // Modo sem backend / fallback
                        self.irParaEtapa(2);
                    }
                } catch (err) {
                    self.exibirStatus(statusRecEtapa1, err.message || 'Erro ao enviar código. Tente novamente.', 'erro');
                } finally {
                    self.definirEstadoCarregando(btnEnviarRecuperacao, false, 'AVANÇAR');
                }
            });

            // =========================================================================
            // ETAPA 2: Voltar para Etapa 1
            // =========================================================================
            btnVoltarRecEtapa1?.addEventListener('click', (e) => {
                e.preventDefault();
                self.irParaEtapa(1);
            });

            // =========================================================================
            // ETAPA 2: Reenviar Código com Cooldown de 30 segundos
            // =========================================================================
            const btnReenviar = document.getElementById('btn-reenviar-codigo');
            if (btnReenviar) {
                let tempoCooldown = 0;
                let intervaloCooldown = null;

                btnReenviar.addEventListener('click', async (e) => {
                    e.preventDefault();
                    if (tempoCooldown > 0) return;

                    const email = self.emailRecuperacao;
                    if (!email) {
                        self.irParaEtapa(1);
                        return;
                    }

                    self.limparOtpQuadrinhos();
                    self.focarPrimeiroQuadrinhoOtp();

                    if (statusRecEtapa2) {
                        statusRecEtapa2.textContent = 'Enviando novo código...';
                        statusRecEtapa2.className = 'status-msg';
                    }

                    try {
                        if (window.ItaimApiAuth && typeof window.ItaimApiAuth.solicitarRecuperacao === 'function') {
                            await window.ItaimApiAuth.solicitarRecuperacao(email);
                        }
                        if (statusRecEtapa2) {
                            statusRecEtapa2.textContent = `Novo código enviado para ${email}! Verifique sua caixa de entrada.`;
                            statusRecEtapa2.className = 'status-msg status-sucesso';
                        }
                    } catch (err) {
                        self.exibirStatus(statusRecEtapa2, err.message || 'Falha ao reenviar código.', 'erro');
                    }

                    // Inicia cooldown de 30 segundos
                    tempoCooldown = 30;
                    btnReenviar.style.pointerEvents = 'none';
                    btnReenviar.style.opacity = '0.65';
                    btnReenviar.textContent = `Reenviar código (${tempoCooldown}s)`;

                    clearInterval(intervaloCooldown);
                    intervaloCooldown = setInterval(() => {
                        tempoCooldown--;
                        if (tempoCooldown <= 0) {
                            clearInterval(intervaloCooldown);
                            btnReenviar.style.pointerEvents = 'auto';
                            btnReenviar.style.opacity = '1';
                            btnReenviar.textContent = 'Reenviar código';
                        } else {
                            btnReenviar.textContent = `Reenviar código (${tempoCooldown}s)`;
                        }
                    }, 1000);
                });
            }

            // =========================================================================
            // SUBMISSÃO DA ETAPA 2: Validar Código de 6 Dígitos
            // =========================================================================
            formRecEtapa2?.addEventListener('submit', async (e) => {
                e.preventDefault();
                const codigo = self.obterCodigoOtp();

                if (codigo.length < 6) {
                    self.exibirStatus(statusRecEtapa2, 'Por favor, insira todos os 6 números do código.', 'erro');
                    self.destacarErroOtp();
                    return;
                }

                self.definirEstadoCarregando(btnConfirmarCodigo, true);
                if (statusRecEtapa2) {
                    statusRecEtapa2.textContent = 'Validando código...';
                    statusRecEtapa2.className = 'status-msg';
                }

                try {
                    if (window.ItaimApiAuth && typeof window.ItaimApiAuth.validarCodigoRecuperacao === 'function') {
                        const resposta = await window.ItaimApiAuth.validarCodigoRecuperacao(self.emailRecuperacao, codigo);
                        self.tokenRedefinicao = resposta.token || null;
                    }
                    if (statusRecEtapa2) {
                        statusRecEtapa2.textContent = 'Código confirmado com sucesso!';
                        statusRecEtapa2.className = 'status-msg status-sucesso';
                    }
                    setTimeout(() => {
                        self.irParaEtapa(3);
                    }, 400);
                } catch (err) {
                    self.exibirStatus(statusRecEtapa2, err.message || 'Código incorreto ou expirado. Tente novamente.', 'erro');
                    self.destacarErroOtp();
                } finally {
                    self.definirEstadoCarregando(btnConfirmarCodigo, false, 'CONFIRMAR');
                }
            });

            // =========================================================================
            // ETAPA 3: Voltar para Etapa 2
            // =========================================================================
            btnVoltarRecEtapa2?.addEventListener('click', (e) => {
                e.preventDefault();
                self.irParaEtapa(2);
            });

            // =========================================================================
            // SUBMISSÃO DA ETAPA 3: Salvar Nova Senha
            // =========================================================================
            formRecEtapa3?.addEventListener('submit', async (e) => {
                e.preventDefault();
                const inputNovaSenha = document.getElementById('recuperar-nova-senha');
                const inputConfirmaSenha = document.getElementById('recuperar-confirmar-senha');

                const novaSenha = inputNovaSenha ? inputNovaSenha.value : '';
                const confirmaSenha = inputConfirmaSenha ? inputConfirmaSenha.value : '';

                if (!novaSenha) {
                    self.exibirStatus(statusRecEtapa3, 'Por favor, informe a nova senha.', 'erro');
                    if (inputNovaSenha) inputNovaSenha.focus();
                    return;
                }

                if (novaSenha.length < 6) {
                    self.exibirStatus(statusRecEtapa3, 'A nova senha deve ter no mínimo 6 caracteres.', 'erro');
                    if (inputNovaSenha) inputNovaSenha.focus();
                    return;
                }

                if (!/^(?=.*[A-Za-z])(?=.*\d)/.test(novaSenha)) {
                    self.exibirStatus(statusRecEtapa3, 'A senha deve conter pelo menos uma letra e um número.', 'erro');
                    if (inputNovaSenha) inputNovaSenha.focus();
                    return;
                }

                if (novaSenha !== confirmaSenha) {
                    self.exibirStatus(statusRecEtapa3, 'As senhas não coincidem. Verifique a digitação.', 'erro');
                    if (inputConfirmaSenha) inputConfirmaSenha.focus();
                    return;
                }

                self.definirEstadoCarregando(btnSalvarNovaSenha, true);
                if (statusRecEtapa3) {
                    statusRecEtapa3.textContent = 'Salvando nova senha...';
                    statusRecEtapa3.className = 'status-msg';
                }

                try {
                    if (window.ItaimApiAuth && typeof window.ItaimApiAuth.redefinirSenha === 'function') {
                        await window.ItaimApiAuth.redefinirSenha({
                            email: self.emailRecuperacao,
                            token: self.tokenRedefinicao,
                            code: self.obterCodigoOtp(),
                            newPassword: novaSenha
                        });
                    }

                    if (statusRecEtapa3) {
                        statusRecEtapa3.textContent = 'Senha redefinida com sucesso! Redirecionando para login...';
                        statusRecEtapa3.className = 'status-msg status-sucesso';
                    }

                    // Limpa formulários
                    if (formRecEtapa1) formRecEtapa1.reset();
                    if (formRecEtapa2) formRecEtapa2.reset();
                    if (formRecEtapa3) formRecEtapa3.reset();
                    self.limparOtpQuadrinhos();

                    // Transição elegante para a tela de login preenchendo o e-mail
                    setTimeout(() => {
                        if (window.ItaimAuthNavegacao && typeof window.ItaimAuthNavegacao.alternarTela === 'function') {
                            window.ItaimAuthNavegacao.alternarTela('login');
                        }

                        const inputEmailLogin = document.getElementById('input-email');
                        const inputSenhaLogin = document.getElementById('input-senha');
                        if (inputEmailLogin && self.emailRecuperacao) {
                            inputEmailLogin.value = self.emailRecuperacao;
                        }
                        if (inputSenhaLogin) {
                            inputSenhaLogin.focus();
                        }

                        const statusMsgLogin = document.getElementById('status-msg-login');
                        if (statusMsgLogin) {
                            statusMsgLogin.textContent = 'Senha redefinida com sucesso! Entre com sua nova senha.';
                            statusMsgLogin.className = 'status-msg status-sucesso';
                        }
                    }, 1200);
                } catch (err) {
                    self.exibirStatus(statusRecEtapa3, err.message || 'Falha ao redefinir a senha. Tente novamente.', 'erro');
                } finally {
                    self.definirEstadoCarregando(btnSalvarNovaSenha, false, 'REDEFINIR SENHA');
                }
            });

            // Verifica se a página foi carregada diretamente com link de recuperação
            this.verificarParametrosUrl();
        }
    };

})(window, document);
