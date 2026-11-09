/**
 * ITAIM VENDE - AUTENTICAÇÃO: MÓDULO DE LOGIN & GOOGLE OAUTH 2.0
 * Arquivo: frontend/js/pages/auth/auth-login.js
 * 
 * Gerencia validação do formulário de login, autenticação via backend API,
 * suporte para login e cadastro oficial com Google (OAuth 2.0 Account Chooser),
 * gravação de sessão e redirecionamento.
 */

(function (window, document) {
    'use strict';

    window.GOOGLE_CLIENT_ID = window.GOOGLE_CLIENT_ID || '573964082793-kor90ei9qbgnuh13i97crosid73uikh5.apps.googleusercontent.com';

    // Gerenciador universal de auto-ocultação suave com fade-out
    window.ItaimStatusMsg = window.ItaimStatusMsg || {
        _timers: new Map(),

        exibir: function (elOuId, msg, tipo = 'erro', segundos = 4.2) {
            const el = typeof elOuId === 'string' ? document.getElementById(elOuId) : elOuId;
            if (!el) return;

            if (this._timers.has(el)) {
                clearTimeout(this._timers.get(el));
                this._timers.delete(el);
            }

            el.classList.remove('fade-out');
            el.textContent = msg;
            el.className = `status-msg ${tipo ? 'status-' + tipo : ''}`;
            el.style.opacity = '1';

            // Oculta automaticamente mensagens de erro ou alertas após os segundos estipulados
            if (msg && tipo && segundos > 0) {
                const timer = setTimeout(() => {
                    el.classList.add('fade-out');
                    setTimeout(() => {
                        if (el.classList.contains('fade-out')) {
                            el.textContent = '';
                            el.className = 'status-msg';
                            el.classList.remove('fade-out');
                            el.style.opacity = '';
                        }
                    }, 450);
                }, segundos * 1000);
                this._timers.set(el, timer);
            }
        },

        limpar: function (elOuId) {
            const el = typeof elOuId === 'string' ? document.getElementById(elOuId) : elOuId;
            if (!el) return;
            if (this._timers.has(el)) {
                clearTimeout(this._timers.get(el));
                this._timers.delete(el);
            }
            el.classList.remove('fade-out');
            el.textContent = '';
            el.className = 'status-msg';
            el.style.opacity = '';
        }
    };

    window.ItaimAuthLogin = {
        exibirMensagem: function (msg, tipo = 'erro', segundos = 4.2) {
            window.ItaimStatusMsg.exibir('status-msg-login', msg, tipo, segundos);
        },

        limparMensagem: function () {
            window.ItaimStatusMsg.limpar('status-msg-login');
        },

        processarAvisoUrl: function () {
            // Desativado a pedido
        },

        executarLogin: async function (e) {
            if (e) e.preventDefault();

            const inputEmail = document.getElementById('input-email');
            const inputSenha = document.getElementById('input-senha');
            const btnEntrar = document.getElementById('btn-entrar');

            const email = inputEmail ? inputEmail.value.trim() : '';
            const senha = inputSenha ? inputSenha.value.trim() : '';

            if (btnEntrar) {
                btnEntrar.disabled = true;
                btnEntrar.classList.add('carregando');
            }
            this.exibirMensagem('Autenticando suas credenciais...', '');

            // Se os campos estiverem vazios no portfólio (sem backend), entra diretamente na conta padrão
            if (!email || !senha) {
                this.entrarComoDev('dev');
                return;
            }

            try {
                localStorage.removeItem('itaim_token');
                localStorage.removeItem('itaim_usuario_logado');
                localStorage.removeItem('itaim_perfil_customizado');

                let resposta = null;
                if (window.ItaimApi && window.ItaimApi.auth && typeof window.ItaimApi.auth.login === 'function') {
                    resposta = await window.ItaimApi.auth.login(email, senha);
                } else {
                    const apiBase = window.ItaimApiCore?.API_BASE_URL || '/api/v1';
                    const res = await fetch(`${apiBase}/auth/login`, {
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
                    const destino = window.ItaimRotas && typeof window.ItaimRotas.obterDestinoPosLogin === 'function'
                        ? window.ItaimRotas.obterDestinoPosLogin()
                        : (window.ItaimRotas ? window.ItaimRotas.obterUrl('home') : '/home');
                    window.location.href = destino;
                }, 500);

            } catch (err) {
                console.error('[Login] Falha na autenticação:', err);

                // Fallback automático para modo offline / desenvolvimento sem banco de dados
                const emailLower = email.toLowerCase().trim();
                const isLocalAdmin = (emailLower === 'admin@gmail.com' && (senha === 'admin' || senha === 'admin123'));
                const isLocalDev = (emailLower === 'dev@itaimvende.com' || emailLower === 'dev' || emailLower.startsWith('dev@'));

                if (isLocalAdmin || isLocalDev) {
                    this.entrarComoDev(isLocalAdmin ? 'admin' : 'dev');
                    return;
                }

                // Detecta se a falha ocorreu por inacessibilidade de rede / backend offline (ex: deploy estático Vercel/Netlify)
                const isErroRede = !err?.status && (
                    (err?.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError') || err.message.includes('network') || err.message.includes('Conexão recusada') || err.message.includes('indisponível')))
                    || err?.name === 'TypeError'
                );

                if (isErroRede) {
                    console.info('[Login] Servidor offline detectado. Entrando automaticamente na conta padrão de demonstração...');
                    this.entrarComoDev('dev');
                    return;
                }

                this.exibirMensagem(err?.message || 'E-mail ou senha inválidos. Tente novamente.', 'erro');
                if (btnEntrar) {
                    btnEntrar.disabled = false;
                    btnEntrar.classList.remove('carregando');
                }
            }
        },

        /**
         * Autentica diretamente no Modo Dev Front-End sem necessitar de banco de dados
         * Permite testes imediatos de páginas públicas e protegidas
         */
        entrarComoDev: function (perfil = 'dev') {
            const isAdm = (perfil === 'admin');
            if (window.ItaimSessao && typeof window.ItaimSessao.ativarModoDevFrontend === 'function') {
                window.ItaimSessao.ativarModoDevFrontend(isAdm ? 'admin' : 'dev');
            } else if (window.ItaimSessaoAuth && typeof window.ItaimSessaoAuth.ativarModoDevFrontend === 'function') {
                window.ItaimSessaoAuth.ativarModoDevFrontend(isAdm ? 'admin' : 'dev');
            } else {
                localStorage.setItem('itaim_modo_dev', 'true');
                localStorage.setItem('itaim_token', isAdm ? 'dev_mock_admin_token' : 'token_mock_dev_frontend');
                localStorage.setItem('itaim_usuario_logado', JSON.stringify({
                    id: isAdm ? 'cmv5iacmv0000ttiwu9wtemar' : 'usr_dev_frontend_001',
                    nome: isAdm ? 'Admin' : 'Kayky Terles Ferreira Feitosa',
                    name: isAdm ? 'Admin' : 'Kayky Terles Ferreira Feitosa',
                    username: isAdm ? 'adminfreefire' : 'kaykyt',
                    email: isAdm ? 'admin@gmail.com' : 'kayky@gmail.com',
                    telefone: '(89) 99400-0000',
                    phone: '89994000000',
                    cidade: 'Paulistana',
                    city: 'Paulistana',
                    bairro: 'Centro',
                    neighborhood: 'Centro',
                    estado: 'PI',
                    state: 'PI',
                    role: 'ADMIN',
                    isVerified: true,
                    dataCadastro: 'Membro desde 2026',
                    avatar: isAdm ? '/uploads/perfil/itaim-1791903382039-jwd9lvb.jpg' : 'assets/usuarios/perfil-kayky.jpg',
                    bio: 'Perfil oficial e portfólio no Itaim Vende.'
                }));
                localStorage.setItem('itaim_usuario_logado_email', isAdm ? 'admin@gmail.com' : 'kayky@gmail.com');
            }

            this.exibirMensagem('Login realizado com sucesso! Redirecionando...', 'sucesso', 2.0);

            setTimeout(() => {
                const destino = window.ItaimRotas && typeof window.ItaimRotas.obterDestinoPosLogin === 'function'
                    ? window.ItaimRotas.obterDestinoPosLogin()
                    : (window.ItaimRotas ? window.ItaimRotas.obterUrl('home') : 'pages/home/home.html');
                window.location.href = destino;
            }, 350);
        },

        /**
         * Dispara a tela oficial do Google Accounts Chooser ("Escolha uma conta")
         */
                /**
         * Dispara a tela oficial de login do Google através de mini janela pop-up dedicada e centralizada
         */
        iniciarLoginGoogleOAuth: function () {
            const self = this;

            if (self._oauthEmProgresso) {
                return;
            }
            self._oauthEmProgresso = true;

            const clientId = window.GOOGLE_CLIENT_ID || '573964082793-kor90ei9qbgnuh13i97crosid73uikh5.apps.googleusercontent.com';
            const redirectUri = window.location.origin;

            try {
                localStorage.removeItem('itaim_google_oauth_token');
            } catch (e) {}

            self.exibirMensagem('Abrindo janela do Google...', 'sucesso');

            const googleUrl = 'https://accounts.google.com/o/oauth2/v2/auth?' + new URLSearchParams({
                client_id: clientId,
                redirect_uri: redirectUri,
                response_type: 'token',
                scope: 'openid email profile',
                prompt: 'select_account',
                state: 'itaim_popup'
            }).toString();

            const width = 500;
            const height = 650;
            const left = window.screenX + Math.max(0, (window.outerWidth - width) / 2);
            const top = window.screenY + Math.max(0, (window.outerHeight - height) / 2);

            let popup = null;
            try {
                popup = window.open(
                    googleUrl,
                    'ItaimGoogleAuthWindow',
                    `width=${width},height=${height},left=${left},top=${top},status=no,menubar=no,toolbar=no,scrollbars=yes,resizable=yes`
                );
            } catch (err) {
                console.error('[Google OAuth] Erro ao abrir janela pop-up:', err);
            }

            if (!popup || popup.closed || typeof popup.closed === 'undefined') {
                self.exibirMensagem('A mini janela foi bloqueada. Por favor, permita pop-ups neste site para entrar com o Google.', 'erro');
                self._oauthEmProgresso = false;
                return;
            }

            if (popup.focus) {
                popup.focus();
            }

            self.exibirMensagem('Selecione sua conta na janela do Google...', 'sucesso');

            let autenticado = false;

            const concluirComToken = (token) => {
                if (autenticado) return;
                autenticado = true;
                if (pollInterval) clearInterval(pollInterval);
                try {
                    localStorage.removeItem('itaim_google_oauth_token');
                } catch (e) {}
                if (popup && !popup.closed) {
                    try { popup.close(); } catch (e) {}
                }
                self.processarTokenAcessoGoogle(token);
            };

                        // 0. BroadcastChannel para captura instantânea e confiável
            try {
                const channel = new BroadcastChannel('itaim_google_auth_channel');
                channel.onmessage = (event) => {
                    if (event.data && event.data.accessToken) {
                        try { channel.close(); } catch (e) {}
                        concluirComToken(event.data.accessToken);
                    }
                };
            } catch (e) {}

            // 1. Notificação direta via postMessage enviada pelo script do popup
            const tratarMensagem = (event) => {
                if (event.data && event.data.type === 'GOOGLE_AUTH_TOKEN' && event.data.accessToken) {
                    window.removeEventListener('message', tratarMensagem);
                    concluirComToken(event.data.accessToken);
                }
            };
            window.addEventListener('message', tratarMensagem);

            // 2. Notificação via storage event (compatibilidade cross-context Brave/Chrome)
            const tratarStorage = (event) => {
                if (event.key === 'itaim_google_oauth_token' && event.newValue) {
                    window.removeEventListener('storage', tratarStorage);
                    concluirComToken(event.newValue);
                }
            };
            window.addEventListener('storage', tratarStorage);

            // 3. Monitor de encerramento e fallback
            let pollInterval = setInterval(() => {
                try {
                    const tokenSalvo = localStorage.getItem('itaim_google_oauth_token');
                    if (tokenSalvo) {
                        concluirComToken(tokenSalvo);
                        return;
                    }
                } catch (e) {}

                if (popup && popup.closed) {
                    clearInterval(pollInterval);
                    setTimeout(() => {
                        try {
                            const tokenSalvo = localStorage.getItem('itaim_google_oauth_token');
                            if (tokenSalvo) {
                                concluirComToken(tokenSalvo);
                                return;
                            }
                        } catch (e) {}

                        if (!autenticado) {
                            self._oauthEmProgresso = false;
                            self.exibirMensagem('', '');
                        }
                    }, 600);
                }
            }, 300);
        },

        abrirTelaGoogleDireta: function (clientId) {
            this.iniciarLoginGoogleOAuth();
        },

        processarTokenAcessoGoogle: async function (accessToken) {
            this._oauthEmProgresso = false;
            this.exibirMensagem('Conta Google selecionada! Criando sessão...', 'sucesso');
            try {
                const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });
                if (!userInfoRes.ok) {
                    throw new Error('Falha ao obter dados do perfil Google.');
                }
                const profile = await userInfoRes.json();

                let resposta = null;
                if (window.ItaimApi?.auth?.googleAuth) {
                    resposta = await window.ItaimApi.auth.googleAuth({
                        email: profile.email,
                        name: profile.name,
                        avatar: profile.picture,
                        googleId: profile.sub
                    });
                } else {
                    const apiBase = window.ItaimApiCore?.API_BASE_URL || '/api/v1';
                    const res = await fetch(`${apiBase}/auth/google`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email: profile.email,
                            name: profile.name,
                            avatar: profile.picture,
                            googleId: profile.sub
                        })
                    });
                    const resData = await res.json();
                    if (!res.ok) {
                        throw new Error(resData.message || 'Erro ao autenticar com Google');
                    }
                    resposta = resData;
                }

                this.concluirSessaoGoogle(resposta);

            } catch (err) {
                console.error('[GoogleAuth] Falha no processamento:', err);
                this.exibirMensagem(err?.message || 'Falha ao autenticar com o Google.', 'erro');
            }
        },

        verificarRetornoOAuthNaUrl: function () {
            const self = this;
            const hash = window.location.hash;
            if (hash && hash.includes('access_token=')) {
                const params = new URLSearchParams(hash.replace(/^#/, ''));
                const accessToken = params.get('access_token');
                if (accessToken) {
                    if (window.opener && window.opener !== window) {
                        try {
                            window.opener.postMessage({ type: 'GOOGLE_AUTH_TOKEN', accessToken }, '*');
                            window.close();
                            return;
                        } catch (e) {}
                    } else {
                        history.replaceState(null, '', window.location.pathname + window.location.search);
                        self.processarTokenAcessoGoogle(accessToken);
                    }
                }
            }

            window.addEventListener('message', (event) => {
                if (event.data && event.data.type === 'GOOGLE_AUTH_TOKEN' && event.data.accessToken) {
                    self.processarTokenAcessoGoogle(event.data.accessToken);
                }
            });
        },

        concluirSessaoGoogle: function (resposta) {
            const usuario = (resposta && resposta.user) ? resposta.user : null;

            if (resposta && resposta.token) {
                localStorage.setItem('itaim_token', resposta.token);
                localStorage.setItem('itaim_ultima_atividade', Date.now().toString());
            }
            if (usuario) {
                localStorage.setItem('itaim_usuario_logado', JSON.stringify(usuario));
                localStorage.setItem('itaim_usuario_logado_email', usuario.email);
                if (window.ItaimSessao && typeof window.ItaimSessao.definirUsuarioLogado === 'function') {
                    window.ItaimSessao.definirUsuarioLogado(usuario.email, usuario);
                }
            }

            // Se o usuário não for cadastrado ainda (ou tiver perfil incompleto sem telefone), redireciona para a parte de cadastro para completar os dados que faltam
            const precisaCompletarCadastro = Boolean(
                resposta?.isNewUser || 
                !usuario?.phone || 
                (typeof usuario?.phone === 'string' && usuario.phone.trim() === '')
            );

            if (precisaCompletarCadastro) {
                this.iniciarConclusaoCadastroGoogle(usuario, resposta.token);
                return;
            }

            this.exibirMensagem('Login com Google realizado com sucesso! Entrando...', 'sucesso');

            setTimeout(() => {
                const destino = window.ItaimRotas && typeof window.ItaimRotas.obterDestinoPosLogin === 'function'
                    ? window.ItaimRotas.obterDestinoPosLogin()
                    : (window.ItaimRotas ? window.ItaimRotas.obterUrl('home') : '/home');
                window.location.href = destino;
            }, 500);
        },

        iniciarConclusaoCadastroGoogle: function (usuario, token) {
            this.exibirMensagem('Conta Google conectada! Complete apenas seu usuário e endereço.', 'sucesso');
            window.ItaimGoogleCadastroAtivo = { user: usuario, token: token };

            // Se estiver na tela inicial (index.html), navega para a seção de cadastro wizard
            const secaoCadastro = document.getElementById('secao-cadastro');
            if (secaoCadastro) {
                if (window.ItaimAuthNavegacao && typeof window.ItaimAuthNavegacao.alternarTela === 'function') {
                    window.ItaimAuthNavegacao.alternarTela('cadastro');
                } else {
                    const secaoLogin = document.getElementById('secao-login');
                    if (secaoLogin) secaoLogin.style.display = 'none';
                    secaoCadastro.style.display = 'block';
                }
                if (window.ItaimAuthCadastroWizard && typeof window.ItaimAuthCadastroWizard.ativarModoGoogle === 'function') {
                    window.ItaimAuthCadastroWizard.ativarModoGoogle(usuario, token);
                }
                return;
            }

            // Se estiver na página direta de cadastro (pages/auth/cadastro.html)
            if (window.ItaimAuthCadastroDireto && typeof window.ItaimAuthCadastroDireto.ativarModoGoogle === 'function') {
                window.ItaimAuthCadastroDireto.ativarModoGoogle(usuario, token);
                return;
            }

            // Fallback caso esteja em outra página
            window.location.href = 'index.html#cadastro';
        },

        abrirModalSocial: function (provedor) {
            const modal = document.getElementById('modal-social-aviso');
            if (!modal) return;

            const titulo = document.getElementById('modal-social-titulo');
            const mensagem = document.getElementById('modal-social-mensagem');
            const iconeBox = document.getElementById('modal-social-icone-box');

            let iconeSvg = '';
            if (provedor === 'Facebook') {
                iconeSvg = '<svg viewBox="0 0 24 24" width="30" height="30" fill="#1877F2" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>';
            } else {
                iconeSvg = '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#0284C7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>';
            }

            if (iconeBox) iconeBox.innerHTML = iconeSvg;
            if (provedor === 'Facebook') {
                if (titulo) titulo.textContent = 'Login com Facebook em breve';
                if (mensagem) {
                    mensagem.textContent = 'Estamos preparando a integração oficial com o Facebook! Enquanto isso, utilize o botão do Google para entrar rapidamente ou seu e-mail cadastrado.';
                }
            } else {
                if (titulo) titulo.textContent = `Acesso por ${provedor}`;
                if (mensagem) {
                    mensagem.textContent = 'O acesso com e-mail e senha já está disponível diretamente nos campos abaixo! Basta preencher seus dados de acesso.';
                }
            }

            modal.classList.add('ativo');
            modal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        },

        fecharModalSocial: function () {
            const modal = document.getElementById('modal-social-aviso');
            if (!modal) return;
            modal.classList.remove('ativo');
            modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        },

        inicializar: function () {
            this.verificarRetornoOAuthNaUrl();

            // Se o usuário já estiver autenticado e não veio com aviso/motivo explícito de logout, redireciona para a Home
            try {
                const token = localStorage.getItem('itaim_token');
                if (token === 'token_mock_dev_frontend') {
                    localStorage.removeItem('itaim_token');
                    localStorage.removeItem('itaim_usuario_logado');
                    localStorage.removeItem('itaim_usuario_logado_email');
                    localStorage.removeItem('itaim_modo_dev');
                } else {
                    const userRaw = localStorage.getItem('itaim_usuario_logado');
                    const urlParams = new URLSearchParams(window.location.search);
                    const motivo = urlParams.get('mensagem') || urlParams.get('aviso');
                    if (token && userRaw && !motivo) {
                        const destino = window.ItaimRotas && typeof window.ItaimRotas.obterDestinoPosLogin === 'function'
                            ? window.ItaimRotas.obterDestinoPosLogin()
                            : (window.ItaimRotas ? window.ItaimRotas.obterUrl('home') : '/home');
                        window.location.replace(destino);
                        return;
                    }
                }
            } catch (e) {}

            // Suporte a ativação automática via URL ?dev=true ou ?modo=dev na própria tela de login
            try {
                const urlParams = new URLSearchParams(window.location.search);
                if (urlParams.get('dev') === 'true' || urlParams.get('modo') === 'dev') {
                    const perfilUrl = urlParams.get('perfil') === 'admin' ? 'admin' : 'dev';
                    this.entrarComoDev(perfilUrl);
                    return;
                }
            } catch (e) {}

            // Vincula botões de acesso direto Dev e Admin Local (Sem Banco de Dados)
            const btnDev = document.getElementById('btn-acesso-dev');
            if (btnDev) {
                btnDev.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.entrarComoDev('dev');
                });
            }

            const btnDevAdmin = document.getElementById('btn-acesso-dev-admin');
            if (btnDevAdmin) {
                btnDevAdmin.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.entrarComoDev('admin');
                });
            }

            const btnModoDevMini = document.getElementById('btn-modo-dev');
            if (btnModoDevMini) {
                btnModoDevMini.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.entrarComoDev('dev');
                });
            }

            const formLogin = document.getElementById('form-login');
            this.processarAvisoUrl();
            if (formLogin) {
                formLogin.addEventListener('submit', (e) => this.executarLogin(e));
                const inputEmail = document.getElementById('input-email');
                const inputSenha = document.getElementById('input-senha');
                if (inputEmail) inputEmail.addEventListener('input', () => this.limparMensagem());
                if (inputSenha) inputSenha.addEventListener('input', () => this.limparMensagem());
            }

            const linkVisitante = document.getElementById('link-continuar-visitante');
            if (linkVisitante) {
                linkVisitante.addEventListener('click', () => {
                    try {
                        localStorage.removeItem('itaim_token');
                        localStorage.removeItem('itaim_usuario_logado');
                        localStorage.removeItem('itaim_usuario_logado_email');
                        localStorage.removeItem('itaim_modo_dev');
                        localStorage.removeItem('itaim_favoritos');
                    } catch (e) {}
                });
            }

            // Integração dos botões de login Google -> Dispara tela oficial de escolha de contas
            const btnGoogle = document.getElementById('btn-social-google');
            if (btnGoogle) {
                btnGoogle.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.iniciarLoginGoogleOAuth();
                });
            }

            const btnCadGoogle = document.getElementById('btn-cadastro-google');
            if (btnCadGoogle) {
                btnCadGoogle.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.iniciarLoginGoogleOAuth();
                });
            }

            const btnWizardGoogle = document.getElementById('btn-cadastro-wizard-google');
            if (btnWizardGoogle) {
                btnWizardGoogle.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.iniciarLoginGoogleOAuth();
                });
            }

            const btnFacebook = document.getElementById('btn-social-facebook');
            if (btnFacebook) {
                btnFacebook.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.abrirModalSocial('Facebook');
                });
            }

            const btnEmail = document.getElementById('btn-social-email');
            if (btnEmail) {
                btnEmail.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.abrirModalSocial('E-mail');
                });
            }

            const btnFecharModalSocial = document.getElementById('btn-fechar-modal-social');
            if (btnFecharModalSocial) {
                btnFecharModalSocial.addEventListener('click', () => this.fecharModalSocial());
            }

            const btnEntendiSocial = document.getElementById('btn-modal-social-entendi');
            if (btnEntendiSocial) {
                btnEntendiSocial.addEventListener('click', () => this.fecharModalSocial());
            }

            const modalSocialBackdrop = document.getElementById('modal-social-aviso');
            if (modalSocialBackdrop) {
                modalSocialBackdrop.addEventListener('click', (e) => {
                    if (e.target === modalSocialBackdrop) {
                        this.fecharModalSocial();
                    }
                });
            }

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.fecharModalSocial();
                }
            });
        }
    };

    window.ItaimAuthLogin = ItaimAuthLogin;
    window.entrarComoDev = (perfil = 'dev') => ItaimAuthLogin.entrarComoDev(perfil);
    window.ItaimModoDev = {
        ativar: (perfil = 'dev') => ItaimAuthLogin.entrarComoDev(perfil),
        desativar: () => {
            localStorage.removeItem('itaim_modo_dev');
            localStorage.removeItem('itaim_token');
            localStorage.removeItem('itaim_usuario_logado');
            localStorage.removeItem('itaim_usuario_logado_email');
            window.location.reload();
        }
    };

})(window, document);
