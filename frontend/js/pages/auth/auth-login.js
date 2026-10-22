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
                        const returnTo = urlParams.get('returnTo');
                        let destino = window.ItaimRotas ? window.ItaimRotas.obterUrl('home') : 'pages/home/home.html';
                        if (returnTo && !returnTo.includes('index.html')) {
                            destino = returnTo;
                        }
                        window.location.replace(destino);
                        return;
                    }
                }
            } catch (e) {}

            const formLogin = document.getElementById('form-login');
            this.processarAvisoUrl();
            if (formLogin) {
                formLogin.addEventListener('submit', (e) => this.executarLogin(e));
            }

            const linkVisitante = document.getElementById('link-continuar-visitante');
            if (linkVisitante) {
                linkVisitante.addEventListener('click', () => {
                    try {
                        localStorage.removeItem('itaim_token');
                        localStorage.removeItem('itaim_usuario_logado');
                        localStorage.removeItem('itaim_usuario_logado_email');
                        localStorage.removeItem('itaim_modo_dev');
                    } catch (e) {}
                });
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
