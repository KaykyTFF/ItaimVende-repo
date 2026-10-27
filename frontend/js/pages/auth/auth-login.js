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
            // Desativado a pedido: não exibe a frase de aviso azul no rodapé
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

            // Integração dos botões de login rápido (Google, E-mail, Facebook) -> Exibe Pop-up elegante
            const btnGoogle = document.getElementById('btn-social-google');
            if (btnGoogle) {
                btnGoogle.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.abrirModalSocial('Google');
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

            // Listeners para fechar o pop-up social
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
        },

        abrirModalSocial: function (provedor) {
            const modal = document.getElementById('modal-social-aviso');
            if (!modal) return;

            const titulo = document.getElementById('modal-social-titulo');
            const mensagem = document.getElementById('modal-social-mensagem');
            const iconeBox = document.getElementById('modal-social-icone-box');

            let iconeSvg = '';
            if (provedor === 'Google') {
                iconeSvg = '<svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true"><path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/><path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/></svg>';
            } else if (provedor === 'Facebook') {
                iconeSvg = '<svg viewBox="0 0 24 24" width="30" height="30" fill="#1877F2" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>';
            } else {
                iconeSvg = '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#0284C7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>';
            }

            if (iconeBox) iconeBox.innerHTML = iconeSvg;
            if (titulo) titulo.textContent = `Entrar com ${provedor}`;
            if (mensagem) {
                mensagem.textContent = `O login rápido com ${provedor} ainda não foi implementado. Por favor, utilize seu e-mail e senha cadastrados no formulário para acessar sua conta.`;
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
        }
    };

})(window, document);
