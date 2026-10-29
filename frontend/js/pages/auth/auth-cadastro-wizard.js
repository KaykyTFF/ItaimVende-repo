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

        ativarModoGoogle: function (usuario, token) {
            window.ItaimGoogleCadastroAtivo = { user: usuario, token: token };
            try {
                sessionStorage.setItem('itaim_google_cadastro_ativo', JSON.stringify({ user: usuario, token: token }));
            } catch (e) {}

            // Oculta o botão de cadastro Google e o separador
            const btnGoogle = document.getElementById('btn-cadastro-wizard-google');
            const divisor = btnGoogle?.nextElementSibling;
            if (btnGoogle) btnGoogle.style.display = 'none';
            if (divisor && divisor.classList.contains('divisor-social')) divisor.style.display = 'none';

            // Cria ou atualiza banner indicando conta conectada
            let banner = document.getElementById('banner-google-conectado');
            if (!banner) {
                banner = document.createElement('div');
                banner.id = 'banner-google-conectado';
                banner.className = 'status-msg status-sucesso';
                banner.style.cssText = 'margin-bottom: 14px; text-align: left; padding: 10px 14px; display: flex; align-items: center; gap: 8px; font-size: 13px; line-height: 1.4;';
                const headerWizard = document.querySelector('.cadastro-wizard-header');
                if (headerWizard && headerWizard.parentNode) {
                    headerWizard.parentNode.insertBefore(banner, headerWizard.nextSibling);
                }
            }
            banner.innerHTML = `<span>✓</span> <div><strong>Conta Google vinculada:</strong> ${usuario?.email || ''}. Complete suas informações restantes para ativar seu perfil!</div>`;
            banner.style.display = 'flex';

            // Preenche dados recebidos do Google
            const nomeEl = document.getElementById('cad-nome');
            const usernameEl = document.getElementById('cad-username');
            const emailEl = document.getElementById('cad-email-completo');
            const cidadeEl = document.getElementById('cad-cidade');
            const estadoEl = document.getElementById('cad-estado');
            const bairroEl = document.getElementById('cad-bairro');
            const cepEl = document.getElementById('cad-cep');
            const telEl = document.getElementById('cad-telefone');

            if (nomeEl && usuario?.name) nomeEl.value = usuario.name;
            if (usernameEl && usuario?.username) usernameEl.value = usuario.username;
            if (emailEl && usuario?.email) {
                emailEl.value = usuario.email;
                emailEl.readOnly = true;
                emailEl.style.backgroundColor = '#f8fafc';
                emailEl.style.cursor = 'not-allowed';
            }
            if (cidadeEl) {
                cidadeEl.value = (usuario?.city && usuario.city !== 'Paulistana') ? usuario.city : '';
            }
            if (estadoEl) {
                estadoEl.value = (usuario?.state && usuario.state !== 'PI') ? usuario.state : '';
            }
            if (bairroEl) {
                if (usuario?.neighborhood && usuario.neighborhood !== 'Centro') {
                    bairroEl.value = usuario.neighborhood;
                } else {
                    bairroEl.value = '';
                }
            }
            if (cepEl && usuario?.postalCode) cepEl.value = usuario.postalCode;
            if (telEl && usuario?.phone) telEl.value = usuario.phone;

            this.irParaEtapa(1);
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

            if (window.ItaimGoogleCadastroAtivo) {
                const etapaVisual = etapa === 1 ? '1 de 3' : (etapa === 3 ? '2 de 3' : '3 de 3');
                if (badgeEtapa) badgeEtapa.textContent = `Etapa ${etapaVisual}`;
                if (nomeEtapa) nomeEtapa.textContent = nomesEtapas[etapa] || '';
                const progressoPct = etapa === 1 ? 33 : (etapa === 3 ? 66 : 100);
                if (barraProgresso) barraProgresso.style.width = `${progressoPct}%`;
            } else {
                if (badgeEtapa) badgeEtapa.textContent = `Etapa ${etapa} de 4`;
                if (nomeEtapa) nomeEtapa.textContent = nomesEtapas[etapa] || '';
                if (barraProgresso) barraProgresso.style.width = `${(etapa / 4) * 100}%`;
            }

            // Mensagem de conta conectada só aparece na etapa 1
            const bannerGoogle = document.getElementById('banner-google-conectado');
            if (bannerGoogle) {
                if (etapa === 1 && window.ItaimGoogleCadastroAtivo) {
                    bannerGoogle.style.display = 'flex';
                } else {
                    bannerGoogle.style.display = 'none';
                }
            }

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
            // Se for cadastro com Google, não há senha para validar ou criar
            if (window.ItaimGoogleCadastroAtivo) {
                this.limparErro();
                return true;
            }

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
            const cepEl = document.getElementById('cad-cep');
            const estadoEl = document.getElementById('cad-estado');
            const cidadeEl = document.getElementById('cad-cidade');
            const bairroEl = document.getElementById('cad-bairro');

            const cep = (cepEl?.value || '').replace(/\D/g, '');
            const estado = (estadoEl?.value || '').trim();
            const cidade = (cidadeEl?.value || '').trim();
            const bairro = (bairroEl?.value || '').trim();

            if (!cep || cep.length !== 8) {
                this.exibirErro('Por favor, informe seu CEP completo (8 dígitos).', cepEl?.id);
                return false;
            }

            if (!estado || estado.length !== 2) {
                this.exibirErro('Por favor, informe a sigla do Estado com 2 letras (ex: PI).', estadoEl?.id);
                return false;
            }

            if (!cidade || cidade.length < 2) {
                this.exibirErro('Por favor, informe o nome da sua Cidade.', cidadeEl?.id);
                return false;
            }

            if (!bairro || bairro.length < 2) {
                this.exibirErro('Por favor, informe o seu Bairro.', bairroEl?.id);
                return false;
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
            // Etapa 2 (Senha) é totalmente dispensada no cadastro via Google
            if (!window.ItaimGoogleCadastroAtivo) {
                if (!this.validarEtapa2()) {
                    this.irParaEtapa(2, true);
                    return;
                }
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
            const estado = document.getElementById('cad-estado')?.value.trim().toUpperCase() || '';
            const cidade = document.getElementById('cad-cidade')?.value.trim() || '';
            const bairro = document.getElementById('cad-bairro')?.value.trim() || '';
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
                statusMsgCadastro.textContent = window.ItaimGoogleCadastroAtivo
                    ? 'Salvando seus dados e finalizando cadastro...'
                    : 'Criando e registrando sua conta com segurança...';
                statusMsgCadastro.className = 'status-msg';
            }

            // MODO DE CONCLUSÃO DO CADASTRO GOOGLE:
            if (window.ItaimGoogleCadastroAtivo && window.ItaimGoogleCadastroAtivo.token) {
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
                        const msgDetalhe = resData.detalhes?.[0]?.message || resData.errors?.[0]?.message || resData.message || 'Erro ao finalizar perfil.';
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
                    try { sessionStorage.removeItem("itaim_google_cadastro_ativo"); } catch(e) {}

                    if (statusMsgCadastro) {
                        statusMsgCadastro.textContent = 'Cadastro finalizado com sucesso! Entrando na plataforma...';
                        statusMsgCadastro.className = 'status-msg status-sucesso';
                    }

                    setTimeout(() => {
                        const destino = window.ItaimRotas && typeof window.ItaimRotas.obterDestinoPosLogin === 'function'
                            ? window.ItaimRotas.obterDestinoPosLogin()
                            : 'pages/home/home.html';
                        window.location.href = destino;
                    }, 500);
                    return;
                } catch (err) {
                    console.error('[Cadastro Wizard Google] Erro ao finalizar cadastro:', err);
                    if (statusMsgCadastro) {
                        statusMsgCadastro.textContent = err?.message || 'Erro ao salvar informações restantes.';
                        statusMsgCadastro.className = 'status-msg status-erro';
                    }
                    return;
                } finally {
                    if (btnConcluirCadastro) {
                        btnConcluirCadastro.disabled = false;
                        btnConcluirCadastro.classList.remove('carregando');
                    }
                }
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
                    const apiBase = window.ItaimApiCore?.API_BASE_URL || '/api/v1';
                    const res = await fetch(`${apiBase}/auth/register`, {
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
                    const destino = window.ItaimRotas && typeof window.ItaimRotas.obterDestinoPosLogin === 'function'
                        ? window.ItaimRotas.obterDestinoPosLogin()
                        : 'pages/home/home.html';
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
                if (self.validarEtapa1()) {
                    if (window.ItaimGoogleCadastroAtivo) {
                        self.irParaEtapa(3);
                    } else {
                        self.irParaEtapa(2);
                    }
                }
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
                if (window.ItaimGoogleCadastroAtivo) {
                    self.irParaEtapa(1);
                } else {
                    self.irParaEtapa(2);
                }
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
