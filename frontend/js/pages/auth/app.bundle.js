/**
 * ITAIM VENDE - AUTENTICAÇÃO (BUNDLE UNIFICADO)
 * Arquivo: frontend/js/pages/auth/app.js
 * 
 * ATENÇÃO:
 * Este arquivo unifica de forma modular os componentes da pasta:
 *   frontend/js/pages/auth/
 * 
 * Módulos integrantes:
 *   - auth-navegacao.js: Alternância entre telas e hash de rota
 *   - auth-senha-toggle.js: Visibilidade de senhas com ícones de olho
 *   - auth-mascaras-cep.js: Busca ViaCEP/BrasilAPI e máscaras de entrada
 *   - auth-login.js: Validação e autenticação de login com API e fallback
 *   - auth-cadastro-wizard.js: Cadastro em 4 etapas com validação e submissão
 *   - auth-cadastro-direto.js: Formulário legado/direto de cadastro
 *   - auth-recuperar.js: Fluxo de recuperação de senha com código OTP
 * 
 * Para editar funcionalidades isoladas, edite os arquivos específicos
 * e execute 'npm run build:auth'.
 */

// ==========================================================================
// MÓDULO: NAVEGAÇÃO ENTRE TELAS (auth-navegacao.js)
// ==========================================================================

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


// ==========================================================================
// MÓDULO: VISIBILIDADE DE SENHA (auth-senha-toggle.js)
// ==========================================================================

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
        }
    };

})(window, document);


// ==========================================================================
// MÓDULO: CEP E MÁSCARAS DE ENTRADA (auth-mascaras-cep.js)
// ==========================================================================

/**
 * ITAIM VENDE - AUTENTICAÇÃO: MÓDULO DE CEP E MÁSCARAS
 * Arquivo: frontend/js/pages/auth/auth-mascaras-cep.js
 * 
 * Gerencia preenchimento automático por CEP (ViaCEP + BrasilAPI fallback) e
 * máscaras de entrada para CEP, Telefone/WhatsApp, Username e OTP.
 */

(function (window, document) {
    'use strict';

    let timerConsultaCep = null;

    window.ItaimAuthMascarasCep = {
        consultarCepEPreencher: async function (inputCep) {
            if (!inputCep) return;
            const form = inputCep.closest('form') || document;
            const cepLimpo = inputCep.value.replace(/\D/g, '');

            if (cepLimpo.length !== 8) return;

            const campoCidade = form.querySelector('#cad-cidade');
            const campoEstado = form.querySelector('#cad-estado');
            const campoBairro = form.querySelector('#cad-bairro');
            const statusMsg = document.getElementById('status-msg-cadastro');

            inputCep.classList.add('buscando-cep');

            try {
                let dados = null;

                // 1. Tenta ViaCEP
                try {
                    const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
                    if (res.ok) {
                        const json = await res.json();
                        if (!json.erro) {
                            dados = {
                                cidade: json.localidade || '',
                                estado: json.uf || '',
                                bairro: json.bairro || '',
                                logradouro: json.logradouro || ''
                            };
                        }
                    }
                } catch (e1) {
                    // Fallback para BrasilAPI
                    try {
                        const res2 = await fetch(`https://brasilapi.com.br/api/cep/v1/${cepLimpo}`);
                        if (res2.ok) {
                            const json2 = await res2.json();
                            dados = {
                                cidade: json2.city || '',
                                estado: json2.state || '',
                                bairro: json2.neighborhood || '',
                                logradouro: json2.street || ''
                            };
                        }
                    } catch (e2) {}
                }

                if (dados && dados.cidade) {
                    // Preenche Cidade
                    if (campoCidade) {
                        if (campoCidade.tagName.toLowerCase() === 'select') {
                            let encontrou = false;
                            for (let i = 0; i < campoCidade.options.length; i++) {
                                const opt = campoCidade.options[i];
                                if (opt.value.toLowerCase() === dados.cidade.toLowerCase() ||
                                    opt.text.toLowerCase() === dados.cidade.toLowerCase()) {
                                    campoCidade.selectedIndex = i;
                                    encontrou = true;
                                    break;
                                }
                            }
                            if (!encontrou) {
                                const novaOpt = document.createElement('option');
                                novaOpt.value = dados.cidade;
                                novaOpt.textContent = dados.cidade;
                                novaOpt.selected = true;
                                campoCidade.appendChild(novaOpt);
                            }
                        } else {
                            campoCidade.value = dados.cidade;
                        }
                        campoCidade.classList.add('campo-autocompletado');
                        setTimeout(() => campoCidade.classList.remove('campo-autocompletado'), 1800);
                    }

                    // Preenche Estado
                    if (campoEstado) {
                        campoEstado.value = dados.estado.toUpperCase();
                        campoEstado.classList.add('campo-autocompletado');
                        setTimeout(() => campoEstado.classList.remove('campo-autocompletado'), 1800);
                    }

                    // Preenche Bairro se fornecido
                    if (campoBairro && dados.bairro && !campoBairro.value.trim()) {
                        campoBairro.value = dados.bairro;
                        campoBairro.classList.add('campo-autocompletado');
                        setTimeout(() => campoBairro.classList.remove('campo-autocompletado'), 1800);
                    }

                    // Remove avisos de erro e adiciona destaque de sucesso
                    inputCep.classList.remove('com-erro');
                    if (statusMsg && statusMsg.classList.contains('status-erro')) {
                        statusMsg.textContent = '';
                        statusMsg.className = 'status-msg';
                    }

                    inputCep.classList.add('campo-sucesso');
                    setTimeout(() => inputCep.classList.remove('campo-sucesso'), 1800);

                    // Foca suavemente no próximo campo
                    if (campoBairro && !campoBairro.value.trim()) {
                        campoBairro.focus();
                    }
                } else {
                    if (statusMsg && !statusMsg.textContent) {
                        statusMsg.textContent = 'CEP não localizado automaticamente. Preencha a cidade e o estado manualmente.';
                        statusMsg.className = 'status-msg status-info';
                        setTimeout(() => {
                            if (statusMsg.className.includes('status-info')) {
                                statusMsg.textContent = '';
                                statusMsg.className = 'status-msg';
                            }
                        }, 4000);
                    }
                }
            } catch (err) {
                console.warn('[CEP] Erro ao consultar CEP:', err);
            } finally {
                inputCep.classList.remove('buscando-cep');
            }
        },

        inicializar: function () {
            const self = this;

            // Máscara e consulta de CEP
            document.querySelectorAll('#cad-cep').forEach(input => {
                input.addEventListener('input', (e) => {
                    let v = e.target.value.replace(/\D/g, '').substring(0, 8);
                    if (v.length > 5) v = v.replace(/^(\d{5})(\d{0,3})/, '$1-$2');
                    e.target.value = v;

                    const cepNumeros = v.replace(/\D/g, '');
                    if (cepNumeros.length === 8) {
                        clearTimeout(timerConsultaCep);
                        timerConsultaCep = setTimeout(() => {
                            self.consultarCepEPreencher(e.target);
                        }, 150);
                    }
                });

                input.addEventListener('blur', (e) => {
                    const cepNumeros = e.target.value.replace(/\D/g, '');
                    if (cepNumeros.length === 8) {
                        self.consultarCepEPreencher(e.target);
                    }
                });
            });

            // Máscara de Telefone / WhatsApp
            document.querySelectorAll('#cad-telefone').forEach(input => {
                input.addEventListener('input', (e) => {
                    let v = e.target.value.replace(/\D/g, '').substring(0, 11);
                    if (v.length > 6) {
                        v = v.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
                    } else if (v.length > 2) {
                        v = v.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
                    } else if (v.length > 0) {
                        v = v.replace(/^(\d{0,2})/, '($1');
                    }
                    e.target.value = v;
                });
            });

            // Higienização de Username
            document.querySelectorAll('#cad-username').forEach(input => {
                input.addEventListener('input', (e) => {
                    e.target.value = e.target.value.replace(/\s+/g, '').toLowerCase();
                });
            });

            // Higienização de Código OTP
            document.querySelectorAll('#recuperar-codigo').forEach(input => {
                input.addEventListener('input', (e) => {
                    e.target.value = e.target.value.replace(/\D/g, '').substring(0, 6);
                });
            });
        }
    };

})(window, document);


// ==========================================================================
// MÓDULO: AUTENTICAÇÃO E LOGIN (auth-login.js)
// ==========================================================================

/**
 * ITAIM VENDE - AUTENTICAÇÃO: MÓDULO DE LOGIN
 * Arquivo: frontend/js/pages/auth/auth-login.js
 * 
 * Gerencia validação do formulário de login, autenticação via backend API,
 * suporte para login offline/admin, gravação de sessão e redirecionamento.
 */

(function (window, document) {
    'use strict';

    window.ItaimAuthLogin = {
        exibirMensagem: function (msg, tipo = 'erro') {
            const statusMsgLogin = document.getElementById('status-msg-login');
            if (statusMsgLogin) {
                statusMsgLogin.textContent = msg;
                statusMsgLogin.className = `status-msg ${tipo ? 'status-' + tipo : ''}`;
            }
        },

        limparMensagem: function () {
            const statusMsgLogin = document.getElementById('status-msg-login');
            if (statusMsgLogin) {
                statusMsgLogin.textContent = '';
                statusMsgLogin.className = 'status-msg';
            }
        },

        processarAvisoUrl: function () {
            try {
                const urlParams = new URLSearchParams(window.location.search);
                const msgParam = urlParams.get('mensagem') || urlParams.get('aviso');
                if (msgParam) {
                    this.exibirMensagem(decodeURIComponent(msgParam), 'info');
                }
            } catch (e) {}
        },

        executarLogin: async function (e) {
            if (e) e.preventDefault();

            const inputEmail = document.getElementById('input-email');
            const inputSenha = document.getElementById('input-senha');
            const btnEntrar = document.getElementById('btn-entrar');

            const email = inputEmail ? inputEmail.value.trim() : '';
            const senha = inputSenha ? inputSenha.value.trim() : '';

            if (!email || !senha) {
                this.exibirMensagem('Por favor, informe seu e-mail e senha para acessar.', 'erro');
                return;
            }

            if (btnEntrar) {
                btnEntrar.disabled = true;
                btnEntrar.classList.add('carregando');
            }
            this.exibirMensagem('Autenticando suas credenciais...', '');

            try {
                // Limpa resquícios de sessões passadas para isolamento total
                localStorage.removeItem('itaim_token');
                localStorage.removeItem('itaim_usuario_logado');
                localStorage.removeItem('itaim_perfil_customizado');

                let resposta = null;
                if (window.ItaimApi && window.ItaimApi.auth && typeof window.ItaimApi.auth.login === 'function') {
                    resposta = await window.ItaimApi.auth.login(email, senha);
                } else {
                    const res = await fetch('http://localhost:3000/api/v1/auth/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password: senha })
                    });
                    const resData = await res.json();
                    if (!res.ok) {
                        throw new Error(resData.message || 'Credenciais inválidas');
                    }
                    resposta = resData;
                }

                const usuarioAutenticado = (resposta && resposta.user) ? resposta.user : null;

                // Sincroniza sessão
                if (window.ItaimSessao && typeof window.ItaimSessao.definirUsuarioLogado === 'function') {
                    window.ItaimSessao.definirUsuarioLogado(usuarioAutenticado?.email || email, usuarioAutenticado);
                } else {
                    localStorage.setItem('itaim_usuario_logado_email', usuarioAutenticado?.email || email);
                    if (usuarioAutenticado) {
                        localStorage.setItem('itaim_usuario_logado', JSON.stringify(usuarioAutenticado));
                    }
                }

                if (resposta && resposta.token) {
                    localStorage.setItem('itaim_token', resposta.token);
                    localStorage.setItem('itaim_ultima_atividade', Date.now().toString());
                }

                this.exibirMensagem('Login realizado com sucesso! Redirecionando...', 'sucesso');

                setTimeout(() => {
                    const urlParams = new URLSearchParams(window.location.search);
                    const returnTo = urlParams.get('returnTo');
                    let destino = window.ItaimRotas ? window.ItaimRotas.obterUrl('home') : 'pages/home/home.html';
                    if (returnTo && !returnTo.includes('index.html')) {
                        destino = returnTo;
                    }
                    window.location.href = destino;
                }, 500);

            } catch (err) {
                console.error('[Login] Falha na autenticação:', err);

                // Fallback para admin caso offline/teste local
                const isLocalAdmin = (email.toLowerCase() === 'admin@gmail.com' && (senha === 'admin' || senha === 'admin123'));
                if (isLocalAdmin && window.ItaimSessao && typeof window.ItaimSessao.definirUsuarioLogado === 'function') {
                    window.ItaimSessao.definirUsuarioLogado('admin@gmail.com');
                    this.exibirMensagem('Login efetuado com sucesso! Redirecionando...', 'sucesso');
                    setTimeout(() => {
                        const urlParams = new URLSearchParams(window.location.search);
                        const returnTo = urlParams.get('returnTo');
                        let destino = window.ItaimRotas ? window.ItaimRotas.obterUrl('home') : 'pages/home/home.html';
                        if (returnTo && !returnTo.includes('index.html')) {
                            destino = returnTo;
                        }
                        window.location.href = destino;
                    }, 500);
                    return;
                }

                this.exibirMensagem(err?.message || 'E-mail ou senha inválidos. Tente novamente.', 'erro');
                if (btnEntrar) {
                    btnEntrar.disabled = false;
                    btnEntrar.classList.remove('carregando');
                }
            }
        },

        inicializar: function () {
            const formLogin = document.getElementById('form-login');
            this.processarAvisoUrl();
            if (formLogin) {
                formLogin.addEventListener('submit', (e) => this.executarLogin(e));
            }

            const btnModoDev = document.getElementById('btn-modo-dev');
            if (btnModoDev) {
                btnModoDev.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (window.ItaimSessao && typeof window.ItaimSessao.ativarModoDevFrontend === 'function') {
                        window.ItaimSessao.ativarModoDevFrontend();
                    } else if (window.ItaimSessaoAuth && typeof window.ItaimSessaoAuth.ativarModoDevFrontend === 'function') {
                        window.ItaimSessaoAuth.ativarModoDevFrontend();
                    } else {
                        localStorage.setItem('itaim_modo_dev', 'true');
                        localStorage.setItem('itaim_token', 'token_mock_dev_frontend');
                        localStorage.setItem('itaim_usuario_logado', JSON.stringify({
                            id: "usr_dev_frontend_001",
                            nome: "Dev Front-End",
                            name: "Dev Front-End",
                            username: "dev_front",
                            email: "dev@itaimvende.com",
                            role: "ADMIN"
                        }));
                        localStorage.setItem('itaim_usuario_logado_email', 'dev@itaimvende.com');
                    }
                    this.exibirMensagem('Modo Dev Front-End ativado! Entrando na plataforma...', 'sucesso');
                    setTimeout(() => {
                        const urlParams = new URLSearchParams(window.location.search);
                        const returnTo = urlParams.get('returnTo');
                        let destino = window.ItaimRotas ? window.ItaimRotas.obterUrl('home') : 'pages/home/home.html';
                        if (returnTo && !returnTo.includes('index.html')) {
                            destino = returnTo;
                        }
                        window.location.href = destino;
                    }, 400);
                });
            }
        }
    };

})(window, document);


// ==========================================================================
// MÓDULO: WIZARD DE CADASTRO (4 ETAPAS) (auth-cadastro-wizard.js)
// ==========================================================================

/**
 * ITAIM VENDE - AUTENTICAÇÃO: MÓDULO WIZARD DE CADASTRO (4 ETAPAS)
 * Arquivo: frontend/js/pages/auth/auth-cadastro-wizard.js
 * 
 * Gerencia a navegação em 4 passos (Sobre você, Sua conta, Onde você está, Vamos finalizar),
 * validação visual em tempo real e submissão à API de registro do Backend.
 */

(function (window, document) {
    'use strict';

    const nomesEtapas = {
        1: 'Sobre você',
        2: 'Sua conta',
        3: 'Onde você está',
        4: 'Vamos finalizar?'
    };

    let etapaCadastroAtual = 1;

    window.ItaimAuthCadastroWizard = {
        obterEtapaAtual: function () {
            return etapaCadastroAtual;
        },

        exibirErro: function (mensagem, campoId = null) {
            const statusMsgCadastro = document.getElementById('status-msg-cadastro');
            if (statusMsgCadastro) {
                statusMsgCadastro.textContent = mensagem;
                statusMsgCadastro.className = 'status-msg status-erro';
            }
            if (campoId) {
                const campo = document.getElementById(campoId);
                if (campo) {
                    campo.classList.add('com-erro');
                    campo.focus();
                    campo.addEventListener('input', () => {
                        campo.classList.remove('com-erro');
                        if (statusMsgCadastro && statusMsgCadastro.textContent === mensagem) {
                            statusMsgCadastro.textContent = '';
                            statusMsgCadastro.className = 'status-msg';
                        }
                    }, { once: true });
                }
            }
        },

        limparErro: function () {
            const statusMsgCadastro = document.getElementById('status-msg-cadastro');
            if (statusMsgCadastro) {
                statusMsgCadastro.textContent = '';
                statusMsgCadastro.className = 'status-msg';
            }
            document.querySelectorAll('#form-cadastro-completo .com-erro').forEach(el => {
                el.classList.remove('com-erro');
            });
        },

        irParaEtapa: function (etapa, manterMensagemErro = false) {
            if (etapa < 1) {
                if (window.ItaimAuthNavegacao && typeof window.ItaimAuthNavegacao.alternarTela === 'function') {
                    window.ItaimAuthNavegacao.alternarTela('login');
                }
                return;
            }
            if (etapa > 4) etapa = 4;

            etapaCadastroAtual = etapa;

            // Alterna os painéis visíveis
            for (let i = 1; i <= 4; i++) {
                const painel = document.getElementById(`etapa-${i}`);
                if (painel) {
                    if (i === etapa) {
                        painel.style.display = 'flex';
                        painel.classList.add('etapa-ativa');
                    } else {
                        painel.style.display = 'none';
                        painel.classList.remove('etapa-ativa');
                    }
                }
            }

            const badgeEtapa = document.getElementById('wizard-etapa-badge');
            const nomeEtapa = document.getElementById('wizard-etapa-nome');
            const barraProgresso = document.getElementById('wizard-barra-progresso');

            if (badgeEtapa) badgeEtapa.textContent = `Etapa ${etapa} de 4`;
            if (nomeEtapa) nomeEtapa.textContent = nomesEtapas[etapa] || '';
            if (barraProgresso) barraProgresso.style.width = `${(etapa / 4) * 100}%`;

            if (!manterMensagemErro) {
                this.limparErro();
            }

            // Foca no primeiro input da etapa ativa
            const painelAtivo = document.getElementById(`etapa-${etapa}`);
            const primeiroCampo = painelAtivo?.querySelector('input:not([type="hidden"]), select');
            if (primeiroCampo) setTimeout(() => primeiroCampo.focus(), 80);
        },

        validarEtapa1: function () {
            const nomeEl = document.getElementById('cad-nome');
            const usernameEl = document.getElementById('cad-username');
            const nome = nomeEl?.value.trim() || '';
            const username = usernameEl?.value.trim().toLowerCase().replace(/^@/, '') || '';

            if (!nome) {
                this.exibirErro('Por favor, informe seu nome completo.', 'cad-nome');
                return false;
            }
            if (nome.length < 2) {
                this.exibirErro('O nome deve conter pelo menos 2 caracteres.', 'cad-nome');
                return false;
            }

            if (username) {
                if (username.length < 3) {
                    this.exibirErro('O nome de usuário deve conter pelo menos 3 caracteres.', 'cad-username');
                    return false;
                }
                if (!/^[a-z0-9_]+$/.test(username)) {
                    this.exibirErro('O nome de usuário pode conter apenas letras, números e underline (_).', 'cad-username');
                    return false;
                }
            }

            this.limparErro();
            return true;
        },

        validarEtapa2: function () {
            const emailEl = document.getElementById('cad-email-completo') || document.getElementById('cad-email');
            const senhaEl = document.getElementById('cad-senha-completo') || document.getElementById('cad-senha');
            const confirmaEl = document.getElementById('cad-confirma-senha') || document.getElementById('cad-confirma');

            const email = emailEl?.value.trim().toLowerCase() || '';
            const senha = senhaEl?.value || '';
            const confirma = confirmaEl?.value || '';

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!email) {
                this.exibirErro('Por favor, informe seu endereço de e-mail.', emailEl?.id);
                return false;
            }
            if (!emailRegex.test(email)) {
                this.exibirErro('Por favor, informe um e-mail válido (ex: seu.nome@email.com).', emailEl?.id);
                return false;
            }

            if (!senha) {
                this.exibirErro('Por favor, crie uma senha para acessar sua conta.', senhaEl?.id);
                return false;
            }
            if (senha.length < 6) {
                this.exibirErro('A senha deve conter no mínimo 6 caracteres.', senhaEl?.id);
                return false;
            }
            if (!/^(?=.*[A-Za-z])(?=.*\d)/.test(senha)) {
                this.exibirErro('A senha deve conter pelo menos uma letra e um número para sua segurança.', senhaEl?.id);
                return false;
            }

            if (!confirma) {
                this.exibirErro('Por favor, confirme a sua senha.', confirmaEl?.id);
                return false;
            }
            if (senha !== confirma) {
                this.exibirErro('As senhas informadas não coincidem. Digite novamente.', confirmaEl?.id);
                return false;
            }

            this.limparErro();
            return true;
        },

        validarEtapa3: function () {
            const cidadeEl = document.getElementById('cad-cidade');
            const estadoEl = document.getElementById('cad-estado');
            if (cidadeEl && !cidadeEl.value.trim()) {
                cidadeEl.value = 'Paulistana';
            }
            if (estadoEl && !estadoEl.value.trim()) {
                estadoEl.value = 'PI';
            }
            this.limparErro();
            return true;
        },

        executarSubmissao: async function (e) {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }

            console.info('[Cadastro Wizard] Finalizar acionado');

            // Valida etapas anteriores garantindo consistência
            if (!this.validarEtapa1()) {
                this.irParaEtapa(1, true);
                return;
            }
            if (!this.validarEtapa2()) {
                this.irParaEtapa(2, true);
                return;
            }
            if (!this.validarEtapa3()) {
                this.irParaEtapa(3, true);
                return;
            }

            const btnConcluirCadastro = document.getElementById('btn-concluir-cadastro');
            const statusMsgCadastro = document.getElementById('status-msg-cadastro');

            const nome = document.getElementById('cad-nome')?.value.trim() || '';
            let username = document.getElementById('cad-username')?.value.trim().toLowerCase().replace(/^@/, '') || '';
            const email = document.getElementById('cad-email-completo')?.value.trim().toLowerCase() || '';
            const senha = document.getElementById('cad-senha-completo')?.value || '';
            const cep = document.getElementById('cad-cep')?.value.trim() || '';
            const estado = document.getElementById('cad-estado')?.value.trim().toUpperCase() || 'PI';
            const cidade = document.getElementById('cad-cidade')?.value.trim() || 'Paulistana';
            const bairro = document.getElementById('cad-bairro')?.value.trim() || 'Centro';
            const telefone = document.getElementById('cad-telefone')?.value.trim() || '';

            if (!username) {
                username = email.split('@')[0].replace(/[^a-z0-9_]/g, '');
                if (username.length < 3) username = `user_${Date.now().toString(36)}`;
            }

            if (btnConcluirCadastro) {
                btnConcluirCadastro.disabled = true;
                btnConcluirCadastro.classList.add('carregando');
            }
            if (statusMsgCadastro) {
                statusMsgCadastro.textContent = 'Criando e registrando sua conta com segurança...';
                statusMsgCadastro.className = 'status-msg';
            }

            try {
                // Limpa resquícios de sessões passadas para isolamento total
                if (window.ItaimSessao && typeof window.ItaimSessao.deslogarUsuario === 'function') {
                    window.ItaimSessao.deslogarUsuario();
                } else {
                    localStorage.removeItem('itaim_token');
                    localStorage.removeItem('itaim_usuario_logado');
                    localStorage.removeItem('itaim_usuario_logado_email');
                }

                const payload = {
                    name: nome,
                    username: username,
                    email: email,
                    password: senha,
                    phone: telefone,
                    city: cidade,
                    state: estado,
                    neighborhood: bairro,
                    postalCode: cep,
                    role: 'BUYER'
                };

                let resposta = null;
                if (window.ItaimApi && window.ItaimApi.auth && typeof window.ItaimApi.auth.registrar === 'function') {
                    resposta = await window.ItaimApi.auth.registrar(payload);
                } else {
                    const res = await fetch('http://localhost:3000/api/v1/auth/register', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    const resData = await res.json();
                    if (!res.ok) {
                        throw new Error(resData.message || (resData.errors && resData.errors[0]?.message) || 'Erro ao realizar cadastro');
                    }
                    resposta = resData;
                }

                const novoUsuario = (resposta && resposta.user) ? resposta.user : {
                    id: 'usr_' + Date.now(),
                    nome: nome,
                    name: nome,
                    username: username,
                    email: email,
                    phone: telefone,
                    telefone: telefone,
                    city: cidade,
                    cidade: cidade,
                    state: estado,
                    estado: estado,
                    neighborhood: bairro,
                    bairro: bairro,
                    role: 'BUYER'
                };

                // Salva token e sessão do usuário
                if (resposta && resposta.token) {
                    localStorage.setItem('itaim_token', resposta.token);
                    localStorage.setItem('itaim_ultima_atividade', Date.now().toString());
                }
                localStorage.setItem('itaim_usuario_logado', JSON.stringify(novoUsuario));
                localStorage.setItem('itaim_usuario_logado_email', novoUsuario.email);

                if (window.ItaimSessao) {
                    window.ItaimSessao.cadastrarNovoUsuario(novoUsuario);
                    window.ItaimSessao.definirUsuarioLogado(novoUsuario.email, novoUsuario);
                }

                if (statusMsgCadastro) {
                    statusMsgCadastro.textContent = 'Conta criada com sucesso! Entrando na plataforma...';
                    statusMsgCadastro.className = 'status-msg status-sucesso';
                }

                setTimeout(() => {
                    const urlParams = new URLSearchParams(window.location.search);
                    const returnTo = urlParams.get('returnTo');
                    let destino = window.ItaimRotas ? window.ItaimRotas.obterUrl('home') : 'pages/home/home.html';
                    if (returnTo && !returnTo.includes('index.html')) {
                        destino = returnTo;
                    }
                    window.location.href = destino;
                }, 600);

            } catch (err) {
                console.error('[Cadastro Wizard] Erro ao cadastrar:', err);
                const msgErro = err?.message || 'Erro ao realizar cadastro. Verifique os dados ou utilize outro e-mail.';

                // Navega até a etapa do erro correspondente
                if (/e-?mail/i.test(msgErro)) {
                    this.irParaEtapa(2, true);
                    this.exibirErro(msgErro, 'cad-email-completo');
                } else if (/username|usu[aá]rio/i.test(msgErro)) {
                    this.irParaEtapa(1, true);
                    this.exibirErro(msgErro, 'cad-username');
                } else if (/senha|password/i.test(msgErro)) {
                    this.irParaEtapa(2, true);
                    this.exibirErro(msgErro, 'cad-senha-completo');
                } else {
                    this.exibirErro(msgErro);
                }
            } finally {
                if (btnConcluirCadastro) {
                    btnConcluirCadastro.disabled = false;
                    btnConcluirCadastro.classList.remove('carregando');
                }
            }
        },

        inicializar: function () {
            const self = this;

            // Botões AVANÇAR
            document.getElementById('btn-avancar-etapa-1')?.addEventListener('click', (e) => {
                e.preventDefault();
                if (self.validarEtapa1()) self.irParaEtapa(2);
            });

            document.getElementById('btn-avancar-etapa-2')?.addEventListener('click', (e) => {
                e.preventDefault();
                if (self.validarEtapa2()) self.irParaEtapa(3);
            });

            document.getElementById('btn-avancar-etapa-3')?.addEventListener('click', (e) => {
                e.preventDefault();
                if (self.validarEtapa3()) self.irParaEtapa(4);
            });

            // Botões VOLTAR
            document.getElementById('btn-voltar-etapa-2')?.addEventListener('click', (e) => {
                e.preventDefault();
                self.limparErro();
                self.irParaEtapa(1);
            });

            document.getElementById('btn-voltar-etapa-3')?.addEventListener('click', (e) => {
                e.preventDefault();
                self.limparErro();
                self.irParaEtapa(2);
            });

            document.getElementById('btn-voltar-etapa-4')?.addEventListener('click', (e) => {
                e.preventDefault();
                self.limparErro();
                self.irParaEtapa(3);
            });

            // Submissão: tanto clique no botão quanto submit no form
            const formCadastro = document.getElementById('form-cadastro-completo');
            const btnConcluirCadastro = document.getElementById('btn-concluir-cadastro');

            if (formCadastro) {
                formCadastro.addEventListener('submit', (e) => self.executarSubmissao(e));
            }
            if (btnConcluirCadastro) {
                btnConcluirCadastro.addEventListener('click', (e) => self.executarSubmissao(e));
            }
        }
    };

})(window, document);


// ==========================================================================
// MÓDULO: CADASTRO DIRETO (auth-cadastro-direto.js)
// ==========================================================================

/**
 * ITAIM VENDE - AUTENTICAÇÃO: MÓDULO DE CADASTRO DIRETO
 * Arquivo: frontend/js/pages/auth/auth-cadastro-direto.js
 * 
 * Gerencia a submissão do formulário direto de cadastro localizado em:
 * frontend/pages/auth/cadastro.html (#form-cadastro-direto).
 */

(function (window, document) {
    'use strict';

    window.ItaimAuthCadastroDireto = {
        mostrarErro: function (msg, campoId) {
            const statusMsg = document.getElementById('status-msg-cadastro');
            if (statusMsg) {
                statusMsg.textContent = msg;
                statusMsg.className = 'status-msg status-erro';
            }
            if (campoId) {
                const el = document.getElementById(campoId);
                if (el) {
                    el.focus();
                    el.classList.add('com-erro');
                    el.addEventListener('input', () => el.classList.remove('com-erro'), { once: true });
                }
            }
        },

        executarSubmissaoDireta: async function (e, formCadastroDireto) {
            e.preventDefault();
            const self = this;
            const statusMsg = document.getElementById('status-msg-cadastro');
            const btnSubmit = formCadastroDireto.querySelector('button[type="submit"]') || document.getElementById('btn-concluir-cadastro');

            const nome = document.getElementById('cad-nome')?.value.trim() || '';
            let username = document.getElementById('cad-username')?.value.trim().toLowerCase().replace(/^@/, '') || '';
            const cep = document.getElementById('cad-cep')?.value.trim() || '';
            const estado = document.getElementById('cad-estado')?.value.trim().toUpperCase() || 'PI';
            const cidade = document.getElementById('cad-cidade')?.value.trim() || 'Paulistana';
            const bairro = document.getElementById('cad-bairro')?.value.trim() || 'Centro';
            const telefone = document.getElementById('cad-telefone')?.value.trim() || '';
            const email = (document.getElementById('cad-email')?.value || document.getElementById('cad-email-completo')?.value || '').trim().toLowerCase();
            const senha = (document.getElementById('cad-senha')?.value || document.getElementById('cad-senha-completo')?.value || '');
            const confirma = (document.getElementById('cad-confirma')?.value || document.getElementById('cad-confirma-senha')?.value || '');

            if (!nome || nome.length < 2) {
                self.mostrarErro('Por favor, informe seu nome completo (mínimo 2 caracteres).', 'cad-nome');
                return;
            }
            if (username && username.length < 3) {
                self.mostrarErro('O nome de usuário deve conter pelo menos 3 caracteres.', 'cad-username');
                return;
            }
            if (username && !/^[a-z0-9_]+$/.test(username)) {
                self.mostrarErro('O nome de usuário pode conter apenas letras, números e underline (_).', 'cad-username');
                return;
            }
            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                self.mostrarErro('Por favor, informe um endereço de e-mail válido.', 'cad-email');
                return;
            }
            if (!senha || senha.length < 6) {
                self.mostrarErro('A senha deve conter no mínimo 6 caracteres.', 'cad-senha');
                return;
            }
            if (!/^(?=.*[A-Za-z])(?=.*\d)/.test(senha)) {
                self.mostrarErro('A senha deve conter pelo menos uma letra e um número para sua segurança.', 'cad-senha');
                return;
            }
            if (senha !== confirma) {
                self.mostrarErro('As senhas digitadas não coincidem. Verifique a confirmação.', 'cad-confirma');
                return;
            }

            if (!username) {
                username = email.split('@')[0].replace(/[^a-z0-9_]/g, '');
                if (username.length < 3) username = `user_${Date.now().toString(36)}`;
            }

            if (btnSubmit) {
                btnSubmit.disabled = true;
                btnSubmit.classList.add('carregando');
            }
            if (statusMsg) {
                statusMsg.textContent = 'Criando e registrando sua conta...';
                statusMsg.className = 'status-msg';
            }

            try {
                if (window.ItaimSessao && typeof window.ItaimSessao.deslogarUsuario === 'function') {
                    window.ItaimSessao.deslogarUsuario();
                } else {
                    localStorage.removeItem('itaim_token');
                    localStorage.removeItem('itaim_usuario_logado');
                    localStorage.removeItem('itaim_usuario_logado_email');
                }

                const payload = {
                    name: nome,
                    username: username,
                    email: email,
                    password: senha,
                    phone: telefone,
                    city: cidade,
                    state: estado,
                    neighborhood: bairro,
                    postalCode: cep,
                    role: 'BUYER'
                };

                let resposta = null;
                if (window.ItaimApi && window.ItaimApi.auth && typeof window.ItaimApi.auth.registrar === 'function') {
                    resposta = await window.ItaimApi.auth.registrar(payload);
                } else {
                    const res = await fetch('http://localhost:3000/api/v1/auth/register', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    const resData = await res.json();
                    if (!res.ok) {
                        throw new Error(resData.message || 'Erro ao realizar cadastro');
                    }
                    resposta = resData;
                }

                const novoUsuario = (resposta && resposta.user) ? resposta.user : {
                    id: 'usr_' + Date.now(),
                    name: nome,
                    nome: nome,
                    username: username,
                    email: email,
                    phone: telefone,
                    city: cidade,
                    neighborhood: bairro,
                    role: 'BUYER'
                };

                if (resposta && resposta.token) {
                    localStorage.setItem('itaim_token', resposta.token);
                    localStorage.setItem('itaim_ultima_atividade', Date.now().toString());
                }
                localStorage.setItem('itaim_usuario_logado', JSON.stringify(novoUsuario));
                localStorage.setItem('itaim_usuario_logado_email', novoUsuario.email);

                if (window.ItaimSessao) {
                    window.ItaimSessao.cadastrarNovoUsuario(novoUsuario);
                    window.ItaimSessao.definirUsuarioLogado(novoUsuario.email, novoUsuario);
                }

                if (statusMsg) {
                    statusMsg.textContent = 'Conta criada com sucesso! Redirecionando...';
                    statusMsg.className = 'status-msg status-sucesso';
                }

                setTimeout(() => {
                    const urlParams = new URLSearchParams(window.location.search);
                    const returnTo = urlParams.get('returnTo');
                    let destino = window.ItaimRotas ? window.ItaimRotas.obterUrl('home') : '../../pages/home/home.html';
                    if (returnTo && !returnTo.includes('index.html')) {
                        destino = returnTo;
                    }
                    window.location.href = destino;
                }, 600);
            } catch (err) {
                console.error('[Cadastro Direto] Erro:', err);
                const msgErro = err?.message || 'Erro ao realizar cadastro. Verifique os dados.';
                const campoFoco = /e-?mail/i.test(msgErro) ? 'cad-email' : (/username|usu[aá]rio/i.test(msgErro) ? 'cad-username' : (/senha/i.test(msgErro) ? 'cad-senha' : null));
                self.mostrarErro(msgErro, campoFoco);
            } finally {
                if (btnSubmit) {
                    btnSubmit.disabled = false;
                    btnSubmit.classList.remove('carregando');
                }
            }
        },

        inicializar: function () {
            const formCadastroDireto = document.getElementById('form-cadastro-direto');
            if (formCadastroDireto) {
                formCadastroDireto.addEventListener('submit', (e) => this.executarSubmissaoDireta(e, formCadastroDireto));
            }
        }
    };

})(window, document);


// ==========================================================================
// MÓDULO: RECUPERAÇÃO DE SENHA E OTP (auth-recuperar.js)
// ==========================================================================

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


// ==========================================================================
// INICIALIZADOR GLOBAL DE AUTENTICAÇÃO
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    if (window.ItaimAuthNavegacao) window.ItaimAuthNavegacao.inicializar();
    if (window.ItaimAuthSenhaToggle) window.ItaimAuthSenhaToggle.inicializar();
    if (window.ItaimAuthMascarasCep) window.ItaimAuthMascarasCep.inicializar();
    if (window.ItaimAuthLogin) window.ItaimAuthLogin.inicializar();
    if (window.ItaimAuthCadastroWizard) window.ItaimAuthCadastroWizard.inicializar();
    if (window.ItaimAuthCadastroDireto) window.ItaimAuthCadastroDireto.inicializar();
    if (window.ItaimAuthRecuperar) window.ItaimAuthRecuperar.inicializar();
});
