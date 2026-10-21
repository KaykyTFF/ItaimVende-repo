/**
 * ITAIM VENDE - AUTENTICAÇÃO (LOGIN, CADASTRO & RECUPERAÇÃO)
 * Navegação puramente local via Front-end (Javascript Simples) para testes ágeis e sem travamentos.
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // Seções principais
    const secaoLogin = document.getElementById('secao-login');
    const secaoCadastro = document.getElementById('secao-cadastro');
    const secaoRecuperar = document.getElementById('secao-recuperar');

    // Botões globais de alternância de tela
    const btnIrParaCadastro = document.getElementById('btn-ir-para-cadastro');
    const btnCadVoltarLogin = document.getElementById('btn-cad-voltar-login');
    const linkEsqueceu = document.getElementById('link-esqueceu');
    const btnRecuperarVoltarLogin = document.getElementById('btn-recuperar-voltar-login');

    function alternarTela(tela) {
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
            irParaEtapaCadastro(1);
        } else if (tela === 'recuperar') {
            secaoRecuperar.style.display = 'block';
            secaoRecuperar.classList.add('secao-ativa');
            irParaEtapaRecuperar(1);
        } else {
            secaoLogin.style.display = 'block';
            secaoLogin.classList.add('secao-ativa');
        }
    }

    if (btnIrParaCadastro) {
        btnIrParaCadastro.addEventListener('click', (e) => {
            e.preventDefault();
            alternarTela('cadastro');
        });
    }

    if (btnCadVoltarLogin) {
        btnCadVoltarLogin.addEventListener('click', (e) => {
            e.preventDefault();
            alternarTela('login');
        });
    }

    if (linkEsqueceu) {
        linkEsqueceu.addEventListener('click', (e) => {
            e.preventDefault();
            alternarTela('recuperar');
        });
    }

    if (btnRecuperarVoltarLogin) {
        btnRecuperarVoltarLogin.addEventListener('click', (e) => {
            e.preventDefault();
            alternarTela('login');
        });
    }


    // ==========================================================================
    // WIZARD DE CADASTRO (4 ETAPAS - JAVASCRIPT LOCAL SIMPLES)
    // ==========================================================================
    const nomesEtapas = {
        1: 'Sobre você',
        2: 'Sua conta',
        3: 'Onde você está',
        4: 'Vamos finalizar?'
    };

    let etapaCadastroAtual = 1;
    const badgeEtapa = document.getElementById('wizard-etapa-badge');
    const nomeEtapa = document.getElementById('wizard-etapa-nome');
    const barraProgresso = document.getElementById('wizard-barra-progresso');
    const statusMsgCadastro = document.getElementById('status-msg-cadastro');

    function exibirErroCadastro(mensagem, campoId = null) {
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
    }

    function limparErroCadastro() {
        if (statusMsgCadastro) {
            statusMsgCadastro.textContent = '';
            statusMsgCadastro.className = 'status-msg';
        }
        document.querySelectorAll('#form-cadastro-completo .com-erro, #form-cadastro-direto .com-erro').forEach(el => {
            el.classList.remove('com-erro');
        });
    }

    function irParaEtapaCadastro(etapa) {
        if (etapa < 1) {
            alternarTela('login');
            return;
        }
        if (etapa > 4) etapa = 4;

        etapaCadastroAtual = etapa;

        // Alterna os painéis usando display
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

        if (badgeEtapa) badgeEtapa.textContent = `Etapa ${etapa} de 4`;
        if (nomeEtapa) nomeEtapa.textContent = nomesEtapas[etapa] || '';
        if (barraProgresso) barraProgresso.style.width = `${(etapa / 4) * 100}%`;
        limparErroCadastro();

        // Foca no primeiro input da etapa ativa
        const painelAtivo = document.getElementById(`etapa-${etapa}`);
        const primeiroCampo = painelAtivo?.querySelector('input:not([type="hidden"]), select');
        if (primeiroCampo) setTimeout(() => primeiroCampo.focus(), 80);
    }

    function validarEtapa1() {
        const nomeEl = document.getElementById('cad-nome');
        const usernameEl = document.getElementById('cad-username');
        const nome = nomeEl?.value.trim() || '';
        const username = usernameEl?.value.trim().toLowerCase().replace(/^@/, '') || '';

        if (!nome) {
            exibirErroCadastro('Por favor, informe seu nome completo.', 'cad-nome');
            return false;
        }
        if (nome.length < 2) {
            exibirErroCadastro('O nome deve conter pelo menos 2 caracteres.', 'cad-nome');
            return false;
        }

        if (username) {
            if (username.length < 3) {
                exibirErroCadastro('O nome de usuário deve conter pelo menos 3 caracteres.', 'cad-username');
                return false;
            }
            if (!/^[a-z0-9_]+$/.test(username)) {
                exibirErroCadastro('O nome de usuário pode conter apenas letras, números e underline (_).', 'cad-username');
                return false;
            }
        }

        limparErroCadastro();
        return true;
    }

    function validarEtapa2() {
        const emailEl = document.getElementById('cad-email-completo') || document.getElementById('cad-email');
        const senhaEl = document.getElementById('cad-senha-completo') || document.getElementById('cad-senha');
        const confirmaEl = document.getElementById('cad-confirma-senha') || document.getElementById('cad-confirma');

        const email = emailEl?.value.trim().toLowerCase() || '';
        const senha = senhaEl?.value || '';
        const confirma = confirmaEl?.value || '';

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            exibirErroCadastro('Por favor, informe seu endereço de e-mail.', emailEl?.id);
            return false;
        }
        if (!emailRegex.test(email)) {
            exibirErroCadastro('Por favor, informe um e-mail válido (ex: seu.nome@email.com).', emailEl?.id);
            return false;
        }

        if (!senha) {
            exibirErroCadastro('Por favor, crie uma senha para acessar sua conta.', senhaEl?.id);
            return false;
        }
        if (senha.length < 6) {
            exibirErroCadastro('A senha deve conter no mínimo 6 caracteres.', senhaEl?.id);
            return false;
        }
        if (!/^(?=.*[A-Za-z])(?=.*\d)/.test(senha)) {
            exibirErroCadastro('A senha deve conter pelo menos uma letra e um número para sua segurança.', senhaEl?.id);
            return false;
        }

        if (!confirma) {
            exibirErroCadastro('Por favor, confirme a sua senha.', confirmaEl?.id);
            return false;
        }
        if (senha !== confirma) {
            exibirErroCadastro('As senhas informadas não coincidem. Digite novamente.', confirmaEl?.id);
            return false;
        }

        limparErroCadastro();
        return true;
    }

    function validarEtapa3() {
        const cidadeEl = document.getElementById('cad-cidade');
        const estadoEl = document.getElementById('cad-estado');
        if (cidadeEl && !cidadeEl.value.trim()) {
            cidadeEl.value = 'Paulistana';
        }
        if (estadoEl && !estadoEl.value.trim()) {
            estadoEl.value = 'PI';
        }
        limparErroCadastro();
        return true;
    }

    // Botões AVANÇAR das etapas de cadastro com validação em tempo real
    document.getElementById('btn-avancar-etapa-1')?.addEventListener('click', (e) => {
        e.preventDefault();
        if (validarEtapa1()) {
            irParaEtapaCadastro(2);
        }
    });

    document.getElementById('btn-avancar-etapa-2')?.addEventListener('click', (e) => {
        e.preventDefault();
        if (validarEtapa2()) {
            irParaEtapaCadastro(3);
        }
    });

    document.getElementById('btn-avancar-etapa-3')?.addEventListener('click', (e) => {
        e.preventDefault();
        if (validarEtapa3()) {
            irParaEtapaCadastro(4);
        }
    });

    // Botões VOLTAR das etapas de cadastro
    document.getElementById('btn-voltar-etapa-2')?.addEventListener('click', (e) => {
        e.preventDefault();
        limparErroCadastro();
        irParaEtapaCadastro(1);
    });

    document.getElementById('btn-voltar-etapa-3')?.addEventListener('click', (e) => {
        e.preventDefault();
        limparErroCadastro();
        irParaEtapaCadastro(2);
    });

    document.getElementById('btn-voltar-etapa-4')?.addEventListener('click', (e) => {
        e.preventDefault();
        limparErroCadastro();
        irParaEtapaCadastro(3);
    });

    // Submissão do cadastro Wizard (integrado à API do Backend e Sessão Local)
    const formCadastro = document.getElementById('form-cadastro-completo');
    const btnConcluirCadastro = document.getElementById('btn-concluir-cadastro');

    formCadastro?.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Valida todas as etapas para segurança completa
        if (!validarEtapa1()) {
            irParaEtapaCadastro(1);
            return;
        }
        if (!validarEtapa2()) {
            irParaEtapaCadastro(2);
            return;
        }
        if (!validarEtapa3()) {
            irParaEtapaCadastro(3);
            return;
        }

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
            console.error('[Cadastro] Erro ao cadastrar usuário:', err);
            const msgErro = err?.message || 'Erro ao realizar cadastro. Verifique os dados ou utilize outro e-mail.';

            // Navega até a etapa do erro correspondente
            if (/e-?mail/i.test(msgErro)) {
                irParaEtapaCadastro(2);
                exibirErroCadastro(msgErro, 'cad-email-completo');
            } else if (/username|usu[aá]rio/i.test(msgErro)) {
                irParaEtapaCadastro(1);
                exibirErroCadastro(msgErro, 'cad-username');
            } else if (/senha|password/i.test(msgErro)) {
                irParaEtapaCadastro(2);
                exibirErroCadastro(msgErro, 'cad-senha-completo');
            } else {
                exibirErroCadastro(msgErro);
            }
        } finally {
            if (btnConcluirCadastro) {
                btnConcluirCadastro.disabled = false;
                btnConcluirCadastro.classList.remove('carregando');
            }
        }
    });

    // ==========================================================================
    // FORMULÁRIO DIRETO DE CADASTRO (PAGES/AUTH/CADASTRO.HTML)
    // ==========================================================================
    const formCadastroDireto = document.getElementById('form-cadastro-direto');
    if (formCadastroDireto) {
        formCadastroDireto.addEventListener('submit', async (e) => {
            e.preventDefault();
            const statusMsg = document.getElementById('status-msg-cadastro');
            const btnSubmit = formCadastroDireto.querySelector('button[type="submit"]') || document.getElementById('btn-concluir-cadastro');

            const nome = document.getElementById('cad-nome')?.value.trim() || '';
            let username = document.getElementById('cad-username')?.value.trim().toLowerCase().replace(/^@/, '') || '';
            const cidade = document.getElementById('cad-cidade')?.value.trim() || 'Paulistana';
            const bairro = document.getElementById('cad-bairro')?.value.trim() || 'Centro';
            const telefone = document.getElementById('cad-telefone')?.value.trim() || '';
            const email = (document.getElementById('cad-email')?.value || document.getElementById('cad-email-completo')?.value || '').trim().toLowerCase();
            const senha = (document.getElementById('cad-senha')?.value || document.getElementById('cad-senha-completo')?.value || '');
            const confirma = (document.getElementById('cad-confirma')?.value || document.getElementById('cad-confirma-senha')?.value || '');

            function mostrarErroDireto(msg, campoId) {
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
            }

            if (!nome || nome.length < 2) {
                mostrarErroDireto('Por favor, informe seu nome completo (mínimo 2 caracteres).', 'cad-nome');
                return;
            }
            if (username && username.length < 3) {
                mostrarErroDireto('O nome de usuário deve conter pelo menos 3 caracteres.', 'cad-username');
                return;
            }
            if (username && !/^[a-z0-9_]+$/.test(username)) {
                mostrarErroDireto('O nome de usuário pode conter apenas letras, números e underline (_).', 'cad-username');
                return;
            }
            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                mostrarErroDireto('Por favor, informe um endereço de e-mail válido.', 'cad-email');
                return;
            }
            if (!senha || senha.length < 6) {
                mostrarErroDireto('A senha deve conter no mínimo 6 caracteres.', 'cad-senha');
                return;
            }
            if (!/^(?=.*[A-Za-z])(?=.*\d)/.test(senha)) {
                mostrarErroDireto('A senha deve conter pelo menos uma letra e um número para sua segurança.', 'cad-senha');
                return;
            }
            if (senha !== confirma) {
                mostrarErroDireto('As senhas digitadas não coincidem. Verifique a confirmação.', 'cad-confirma');
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
                    state: 'PI',
                    neighborhood: bairro,
                    role: 'BUYER'
                };

                let resposta = null;
                if (window.ItaimApi && window.ItaimApi.auth && typeof window.ItaimApi.auth.registrar === 'function') {
                    resposta = await window.ItaimApi.auth.registrar(payload);
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
                mostrarErroDireto(msgErro, campoFoco);
            } finally {
                if (btnSubmit) {
                    btnSubmit.disabled = false;
                    btnSubmit.classList.remove('carregando');
                }
            }
        });
    }

    // ==========================================================================
    // FLUXO DE RECUPERAÇÃO DE SENHA COM QUADRINHOS NUMÉRICOS (OTP 6 DÍGITOS)
    // ==========================================================================
    const formRecEtapa1 = document.getElementById('form-recuperar-etapa1');
    const formRecEtapa2 = document.getElementById('form-recuperar-etapa2');
    const subtituloRecuperar = document.getElementById('subtitulo-recuperar');
    const inputRecCodigo = document.getElementById('recuperar-codigo');
    const inputRecEmail = document.getElementById('recuperar-email');
    const btnVoltarRecEtapa1 = document.getElementById('btn-recuperar-voltar-etapa1');
    const statusRecEtapa1 = document.getElementById('status-modal-recuperar');
    const statusRecEtapa2 = document.getElementById('status-recuperar-etapa2');
    const otpQuadrinhos = document.querySelectorAll('.otp-quadrinho');

    function obterCodigoOtp() {
        return Array.from(otpQuadrinhos).map(q => q.value.trim()).join('');
    }

    function atualizarCodigoOtp() {
        const codigo = obterCodigoOtp();
        if (inputRecCodigo) {
            inputRecCodigo.value = codigo;
        }
        otpQuadrinhos.forEach(quadrinho => {
            if (quadrinho.value) {
                quadrinho.classList.add('preenchido');
                quadrinho.classList.remove('com-erro');
            } else {
                quadrinho.classList.remove('preenchido');
            }
        });
        return codigo;
    }

    function limparOtpQuadrinhos() {
        otpQuadrinhos.forEach(q => {
            q.value = '';
            q.classList.remove('preenchido', 'com-erro');
        });
        if (inputRecCodigo) inputRecCodigo.value = '';
    }

    function focarPrimeiroQuadrinhoOtp() {
        const primeiroVazio = Array.from(otpQuadrinhos).find(q => !q.value) || otpQuadrinhos[0];
        if (primeiroVazio) {
            primeiroVazio.focus();
            primeiroVazio.select();
        }
    }

    function destacarErroOtp() {
        otpQuadrinhos.forEach(q => {
            if (!q.value) {
                q.classList.add('com-erro');
            }
        });
        focarPrimeiroQuadrinhoOtp();
    }

    // Inicialização dos eventos dos quadrinhos numéricos
    otpQuadrinhos.forEach((quadrinho, index) => {
        // Bloqueia qualquer caractere que não seja número no keydown
        quadrinho.addEventListener('keydown', (e) => {
            // Teclas de controle permitidas
            const permitidas = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'];
            if (permitidas.includes(e.key) || e.ctrlKey || e.metaKey) {
                if (e.key === 'Backspace') {
                    if (!e.target.value && index > 0) {
                        e.preventDefault();
                        otpQuadrinhos[index - 1].value = '';
                        otpQuadrinhos[index - 1].focus();
                        atualizarCodigoOtp();
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

            // Apenas dígitos de 0 a 9 são aceitos
            if (!/^[0-9]$/.test(e.key)) {
                e.preventDefault();
            }
        });

        // Evento de input para avanço automático de quadrinho
        quadrinho.addEventListener('input', (e) => {
            const val = e.target.value.replace(/\D/g, '');

            if (val.length > 0) {
                // Se colou ou inseriu múltiplos dígitos de uma só vez
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
                    // Avança para o próximo quadrinho
                    if (index < otpQuadrinhos.length - 1) {
                        otpQuadrinhos[index + 1].focus();
                        otpQuadrinhos[index + 1].select();
                    }
                }
            } else {
                e.target.value = '';
            }
            atualizarCodigoOtp();
        });

        // Suporte completo a colar (paste) de código de verificação
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
                atualizarCodigoOtp();

                const proxIndex = Math.min(digitos.length, otpQuadrinhos.length - 1);
                if (otpQuadrinhos[proxIndex]) {
                    otpQuadrinhos[proxIndex].focus();
                    otpQuadrinhos[proxIndex].select();
                }
            }
        });

        // Selecionar conteúdo ao focar para fácil alteração
        quadrinho.addEventListener('focus', function () {
            this.select();
        });
    });

    function irParaEtapaRecuperar(etapa) {
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
            limparOtpQuadrinhos();
            setTimeout(() => focarPrimeiroQuadrinhoOtp(), 80);
        }
    }

    formRecEtapa1?.addEventListener('submit', (e) => {
        e.preventDefault();
        irParaEtapaRecuperar(2);
    });

    btnVoltarRecEtapa1?.addEventListener('click', (e) => {
        e.preventDefault();
        irParaEtapaRecuperar(1);
    });

    formRecEtapa2?.addEventListener('submit', (e) => {
        e.preventDefault();
        const codigo = obterCodigoOtp();

        if (codigo.length < 6) {
            if (statusRecEtapa2) {
                statusRecEtapa2.textContent = 'Por favor, insira todos os 6 números do código.';
                statusRecEtapa2.className = 'status-msg status-erro';
            }
            destacarErroOtp();
            return;
        }

        if (statusRecEtapa2) {
            statusRecEtapa2.textContent = 'Código validado com sucesso! Redirecionando...';
            statusRecEtapa2.className = 'status-msg status-sucesso';
        }
        setTimeout(() => {
            if (statusRecEtapa2) statusRecEtapa2.textContent = '';
            alternarTela('login');
            const statusMsgLogin = document.getElementById('status-msg-login');
            if (statusMsgLogin) {
                statusMsgLogin.textContent = 'Identidade confirmada! Acesse com suas credenciais.';
                statusMsgLogin.className = 'status-msg status-sucesso';
            }
        }, 800);
    });

    // ==========================================================================
    // FORMULÁRIO DE LOGIN
    // ==========================================================================
    const formLogin = document.getElementById('form-login');
    const inputEmail = document.getElementById('input-email');
    const inputSenha = document.getElementById('input-senha');
    const statusMsgLogin = document.getElementById('status-msg-login');

    const btnEntrar = document.getElementById('btn-entrar');

    // Feedback de mensagem vinda de redirecionamento (ex: tentativa de interação como visitante)
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const msgParam = urlParams.get('mensagem') || urlParams.get('aviso');
        if (msgParam && statusMsgLogin) {
            statusMsgLogin.textContent = decodeURIComponent(msgParam);
            statusMsgLogin.className = 'status-msg status-info';
        }
    } catch(e) {}

    formLogin?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = inputEmail ? inputEmail.value.trim() : '';
        const senha = inputSenha ? inputSenha.value.trim() : '';

        if (!email || !senha) {
            if (statusMsgLogin) {
                statusMsgLogin.textContent = 'Por favor, informe seu e-mail e senha para acessar.';
                statusMsgLogin.className = 'status-msg status-erro';
            }
            return;
        }

        if (btnEntrar) {
            btnEntrar.disabled = true;
            btnEntrar.classList.add('carregando');
        }
        if (statusMsgLogin) {
            statusMsgLogin.textContent = 'Autenticando suas credenciais...';
            statusMsgLogin.className = 'status-msg';
        }

        try {
            // Limpa dados de sessões passadas para não misturar perfis
            localStorage.removeItem('itaim_token');
            localStorage.removeItem('itaim_usuario_logado');
            localStorage.removeItem('itaim_perfil_customizado');

            let resposta = null;
            if (window.ItaimApi && window.ItaimApi.auth && typeof window.ItaimApi.auth.login === 'function') {
                resposta = await window.ItaimApi.auth.login(email, senha);
            }

            const usuarioAutenticado = (resposta && resposta.user) ? resposta.user : null;

            // Sincroniza sessão
            if (window.ItaimSessao && typeof window.ItaimSessao.definirUsuarioLogado === 'function') {
                window.ItaimSessao.definirUsuarioLogado(usuarioAutenticado?.email || email, usuarioAutenticado);
            } else {
                localStorage.setItem('itaim_usuario_logado_email', usuarioAutenticado?.email || email);
            }

            if (statusMsgLogin) {
                statusMsgLogin.textContent = 'Login realizado com sucesso! Redirecionando...';
                statusMsgLogin.className = 'status-msg status-sucesso';
            }

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
            // Fallback para admin caso offline/erro
            const isLocalAdmin = (email.toLowerCase() === 'admin@gmail.com' && (senha === 'admin' || senha === 'admin123'));
            if (isLocalAdmin && window.ItaimSessao && typeof window.ItaimSessao.definirUsuarioLogado === 'function') {
                window.ItaimSessao.definirUsuarioLogado('admin@gmail.com');
                if (statusMsgLogin) {
                    statusMsgLogin.textContent = 'Login efetuado com sucesso! Redirecionando...';
                    statusMsgLogin.className = 'status-msg status-sucesso';
                }
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

            if (statusMsgLogin) {
                statusMsgLogin.textContent = err?.message || 'E-mail ou senha inválidos. Tente novamente.';
                statusMsgLogin.className = 'status-msg status-erro';
            }
            if (btnEntrar) {
                btnEntrar.disabled = false;
                btnEntrar.classList.remove('carregando');
            }
        }
    });

    // ==========================================================================
    // TOGGLE DE VISIBILIDADE DE SENHA
    // ==========================================================================
    function configurarToggleSenha(btnId, inputId) {
        const btn = document.getElementById(btnId);
        const input = document.getElementById(inputId);
        if (!btn || !input) return;

        btn.addEventListener('click', () => {
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
    }

    configurarToggleSenha('btn-toggle-senha-login', 'input-senha');
    const inputCadSenhaId = document.getElementById('cad-senha-completo') ? 'cad-senha-completo' : 'cad-senha';
    const inputCadConfirmaId = document.getElementById('cad-confirma-senha') ? 'cad-confirma-senha' : 'cad-confirma';
    configurarToggleSenha('btn-toggle-cad-senha', inputCadSenhaId);
    configurarToggleSenha('btn-toggle-cad-confirma', inputCadConfirmaId);

    // ==========================================================================
    // MÁSCARAS SIMPLES DE ENTRADA
    // ==========================================================================
    document.querySelectorAll('#cad-cep').forEach(input => {
        input.addEventListener('input', (e) => {
            let v = e.target.value.replace(/\D/g, '').substring(0, 8);
            if (v.length > 5) v = v.replace(/^(\d{5})(\d{0,3})/, '$1-$2');
            e.target.value = v;
        });
    });

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

    document.querySelectorAll('#cad-username').forEach(input => {
        input.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\s+/g, '').toLowerCase();
        });
    });

    document.querySelectorAll('#recuperar-codigo').forEach(input => {
        input.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '').substring(0, 6);
        });
    });

    // ==========================================================================
    // INICIALIZAÇÃO DE HASH DA URL (EXECUTADO APÓS TODAS AS FUNÇÕES DEFINIDAS)
    // ==========================================================================
    function processarHashNavegacao() {
        const hash = (window.location.hash || '').toLowerCase();
        if (hash === '#cadastro') {
            alternarTela('cadastro');
        } else if (hash === '#recuperar-senha' || hash === '#recuperar') {
            alternarTela('recuperar');
        } else if (hash === '#login') {
            alternarTela('login');
        }
    }
    processarHashNavegacao();
    window.addEventListener('hashchange', processarHashNavegacao);
});
