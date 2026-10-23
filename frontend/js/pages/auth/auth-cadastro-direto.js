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
                    const apiBase = window.ItaimApiCore?.API_BASE_URL || '/api/v1';
                    const res = await fetch(`${apiBase}/auth/register`, {
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
