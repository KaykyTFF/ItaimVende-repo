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
        ativarModoGoogle: function (usuario, token) {
            window.ItaimGoogleCadastroAtivo = { user: usuario, token: token };

            // Oculta botão de cadastro Google e separador
            const btnGoogle = document.getElementById('btn-cadastro-google');
            const divisor = btnGoogle?.nextElementSibling;
            if (btnGoogle) btnGoogle.style.display = 'none';
            if (divisor && divisor.classList.contains('divisor-social')) divisor.style.display = 'none';

            // Oculta os campos de senha pois a autenticação é via Google
            const campoSenha = document.getElementById('cad-senha')?.closest('.grupo-campo');
            const campoConfirma = document.getElementById('cad-confirma')?.closest('.grupo-campo');
            if (campoSenha) campoSenha.style.display = 'none';
            if (campoConfirma) campoConfirma.style.display = 'none';

            // Banner moderno de status
            let banner = document.getElementById('banner-google-direto');
            if (!banner) {
                banner = document.createElement('div');
                banner.id = 'banner-google-direto';
                banner.className = 'status-msg status-sucesso';
                banner.style.cssText = 'margin-bottom: 14px; text-align: left; padding: 10px 14px; display: flex; align-items: center; gap: 8px; font-size: 13px; line-height: 1.4;';
                const form = document.getElementById('form-cadastro-direto');
                if (form && form.parentNode) {
                    form.parentNode.insertBefore(banner, form);
                }
            }
            banner.innerHTML = `<span>✓</span> <div><strong>Conta Google vinculada:</strong> ${usuario?.email || ''}. Complete suas informações abaixo para finalizar seu perfil!</div>`;
            banner.style.display = 'flex';

            const nomeEl = document.getElementById('cad-nome');
            const usernameEl = document.getElementById('cad-username');
            const emailEl = document.getElementById('cad-email') || document.getElementById('cad-email-completo');
            const cepEl = document.getElementById('cad-cep');
            const estadoEl = document.getElementById('cad-estado');
            const cidadeEl = document.getElementById('cad-cidade');
            const bairroEl = document.getElementById('cad-bairro');
            const telEl = document.getElementById('cad-telefone');

            if (nomeEl && usuario?.name) nomeEl.value = usuario.name;
            if (usernameEl && usuario?.username) usernameEl.value = usuario.username;
            if (emailEl && usuario?.email) {
                emailEl.value = usuario.email;
                emailEl.readOnly = true;
                emailEl.style.backgroundColor = '#f8fafc';
                emailEl.style.cursor = 'not-allowed';
            }
            if (cepEl && usuario?.postalCode) cepEl.value = usuario.postalCode;
            if (estadoEl) {
                estadoEl.value = (usuario?.state && usuario.state !== 'PI') ? usuario.state : '';
            }
            if (cidadeEl) {
                cidadeEl.value = (usuario?.city && usuario.city !== 'Paulistana') ? usuario.city : '';
            }
            if (bairroEl) {
                if (usuario?.neighborhood && usuario.neighborhood !== 'Centro') {
                    bairroEl.value = usuario.neighborhood;
                } else {
                    bairroEl.value = '';
                }
            }
            if (telEl && usuario?.phone) telEl.value = usuario.phone;

            if (telEl && !usuario?.phone) {
                telEl.focus();
            } else if (usernameEl) {
                usernameEl.focus();
            }
        },

        mostrarErro: function (msg, campoId) {
            if (window.ItaimStatusMsg && typeof window.ItaimStatusMsg.exibir === 'function') {
                window.ItaimStatusMsg.exibir('status-msg-cadastro', msg, 'erro', 4.5);
            } else {
                const statusMsg = document.getElementById('status-msg-cadastro');
                if (statusMsg) {
                    statusMsg.textContent = msg;
                    statusMsg.className = 'status-msg status-erro';
                }
            }
            if (campoId) {
                const el = document.getElementById(campoId);
                if (el) {
                    el.focus();
                    el.classList.add('com-erro');
                    el.addEventListener('input', () => {
                        el.classList.remove('com-erro');
                        if (window.ItaimStatusMsg && typeof window.ItaimStatusMsg.limpar === 'function') {
                            window.ItaimStatusMsg.limpar('status-msg-cadastro');
                        }
                    }, { once: true });
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
            const estado = document.getElementById('cad-estado')?.value.trim().toUpperCase() || '';
            const cidade = document.getElementById('cad-cidade')?.value.trim() || '';
            const bairro = document.getElementById('cad-bairro')?.value.trim() || '';
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

            const cepLimpo = cep.replace(/\D/g, '');
            if (!cepLimpo || cepLimpo.length !== 8) {
                self.mostrarErro('Por favor, informe seu CEP completo (8 dígitos).', 'cad-cep');
                return;
            }
            if (!estado || estado.length !== 2) {
                self.mostrarErro('Por favor, informe a sigla do Estado com 2 letras (ex: PI).', 'cad-estado');
                return;
            }
            if (!cidade || cidade.length < 2) {
                self.mostrarErro('Por favor, informe o nome da sua Cidade.', 'cad-cidade');
                return;
            }
            if (!bairro || bairro.length < 2) {
                self.mostrarErro('Por favor, informe o seu Bairro.', 'cad-bairro');
                return;
            }

            // FLUXO DE CONCLUSÃO DE CADASTRO COM CONTA GOOGLE
            if (window.ItaimGoogleCadastroAtivo && window.ItaimGoogleCadastroAtivo.token) {
                if (btnSubmit) {
                    btnSubmit.disabled = true;
                    btnSubmit.classList.add('carregando');
                }
                if (statusMsg) {
                    statusMsg.textContent = 'Salvando suas informações e ativando seu perfil...';
                    statusMsg.className = 'status-msg';
                }

                try {
                    const tokenGoogle = window.ItaimGoogleCadastroAtivo.token;
                    const updatePayload = {
                        name: nome,
                        username: username,
                        phone: telefone ? telefone : null,
                        city: cidade ? cidade : '',
                        state: estado ? estado : '',
                        neighborhood: bairro || null,
                        postalCode: cep ? cep : null
                    };

                    const apiBase = window.ItaimApiCore?.API_BASE_URL || '/api/v1';
                    const res = await fetch(`${apiBase}/auth/me`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${tokenGoogle}`
                        },
                        body: JSON.stringify(updatePayload)
                    });
                    const resData = await res.json();
                    if (!res.ok) {
                        const msgDetalhe = resData.detalhes?.[0]?.message || resData.errors?.[0]?.message || resData.message || 'Erro ao finalizar cadastro.';
                        throw new Error(msgDetalhe);
                    }

                    const usuarioAtualizado = resData.user || {
                        ...window.ItaimGoogleCadastroAtivo.user,
                        ...updatePayload
                    };

                    localStorage.setItem('itaim_token', tokenGoogle);
                    localStorage.setItem('itaim_usuario_logado', JSON.stringify(usuarioAtualizado));
                    localStorage.setItem('itaim_usuario_logado_email', usuarioAtualizado.email);
                    if (window.ItaimSessao && typeof window.ItaimSessao.definirUsuarioLogado === 'function') {
                        window.ItaimSessao.definirUsuarioLogado(usuarioAtualizado.email, usuarioAtualizado);
                    }

                    window.ItaimGoogleCadastroAtivo = null;

                    if (statusMsg) {
                        statusMsg.textContent = 'Cadastro finalizado com sucesso! Redirecionando...';
                        statusMsg.className = 'status-msg status-sucesso';
                    }

                    setTimeout(() => {
                        const destino = window.ItaimRotas && typeof window.ItaimRotas.obterDestinoPosLogin === 'function'
                            ? window.ItaimRotas.obterDestinoPosLogin()
                            : '../../pages/home/home.html';
                        window.location.href = destino;
                    }, 500);
                    return;
                } catch (err) {
                    self.mostrarErro(err?.message || 'Erro ao salvar informações restantes.');
                    return;
                } finally {
                    if (btnSubmit) {
                        btnSubmit.disabled = false;
                        btnSubmit.classList.remove('carregando');
                    }
                }
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
                    const destino = window.ItaimRotas && typeof window.ItaimRotas.obterDestinoPosLogin === 'function'
                        ? window.ItaimRotas.obterDestinoPosLogin()
                        : '../../pages/home/home.html';
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
            const btnCadGoogle = document.getElementById('btn-cadastro-google');
            if (btnCadGoogle) {
                btnCadGoogle.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (window.ItaimAuthLogin && typeof window.ItaimAuthLogin.abrirModalGoogle === 'function') {
                        window.ItaimAuthLogin.abrirModalGoogle();
                    }
                });
            }
        }
    };

})(window, document);
