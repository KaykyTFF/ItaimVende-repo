/**
 * ITAIM VENDE - LÓGICA DE AUTENTICAÇÃO (LOGIN & CADASTRO)
 * Suporte completo a validações, máscaras, abas e alternância de telas
 */

document.addEventListener('DOMContentLoaded', () => {
    // ==========================================================================
    // 1. GERENCIAMENTO DE ABAS E TELAS (LOGIN <-> CADASTRO)
    // ==========================================================================
    const abaLogin = document.getElementById('aba-login');
    const abaCadastro = document.getElementById('aba-cadastro');
    const secaoLogin = document.getElementById('secao-login');
    const secaoCadastro = document.getElementById('secao-cadastro');
    const painelPrincipal = document.getElementById('painel-principal');
    const topoContainer = document.getElementById('topo-container');
    const btnIrParaCadastro = document.getElementById('btn-ir-para-cadastro');
    const btnVoltarAoLogin = document.getElementById('btn-voltar-ao-login');

    function alternarTela(tela) {
        if (!secaoLogin || !secaoCadastro) return;

        if (tela === 'cadastro') {
            secaoLogin.classList.remove('secao-ativa');
            secaoCadastro.classList.add('secao-ativa');
            if (abaLogin) abaLogin.classList.remove('aba-ativa');
            if (abaCadastro) abaCadastro.classList.add('aba-ativa');
            if (painelPrincipal) {
                painelPrincipal.classList.remove('painel-curvo');
                painelPrincipal.classList.add('painel-reto');
            }
            if (topoContainer) {
                topoContainer.classList.add('topo-compacto');
            }
            window.location.hash = 'cadastro';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            secaoCadastro.classList.remove('secao-ativa');
            secaoLogin.classList.add('secao-ativa');
            if (abaCadastro) abaCadastro.classList.remove('aba-ativa');
            if (abaLogin) abaLogin.classList.add('aba-ativa');
            if (painelPrincipal) {
                painelPrincipal.classList.remove('painel-reto');
                painelPrincipal.classList.add('painel-curvo');
            }
            if (topoContainer) {
                topoContainer.classList.remove('topo-compacto');
            }
            window.location.hash = 'login';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    if (abaLogin && abaCadastro) {
        abaLogin.addEventListener('click', () => alternarTela('login'));
        abaCadastro.addEventListener('click', () => alternarTela('cadastro'));
    }

    if (btnIrParaCadastro) {
        btnIrParaCadastro.addEventListener('click', () => alternarTela('cadastro'));
    }

    if (btnVoltarAoLogin) {
        btnVoltarAoLogin.addEventListener('click', () => alternarTela('login'));
    }

    // Checa a URL inicial (ex: #cadastro)
    if (window.location.hash === '#cadastro') {
        alternarTela('cadastro');
    }

    // Feedback de suspensão ou exclusão de conta
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const msgTipo = urlParams.get('msg');
        const avisoAuth = localStorage.getItem('itaim_aviso_auth');
        if (msgTipo || avisoAuth) {
            localStorage.removeItem('itaim_aviso_auth');
            const statusLogin = document.getElementById('status-msg-login');
            if (statusLogin) {
                const texto = avisoAuth || (msgTipo === 'conta_suspensa' 
                    ? 'Sua conta foi suspensa temporariamente. Para reativá-la e voltar a negociar, faça login.' 
                    : 'Sua conta foi excluída permanentemente.');
                const classeCor = msgTipo === 'conta_excluida' ? 'status-erro' : 'status-info';
                statusLogin.textContent = texto;
                statusLogin.className = `status-msg ${classeCor}`;
                statusLogin.style.display = 'block';
            }
        }
    } catch(e) {}

    // ==========================================================================
    // 2. TOGGLE DE VISIBILIDADE DE SENHA (GENÉRICO)
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
    configurarToggleSenha('btn-toggle-cad-senha', 'cad-senha-completo');
    configurarToggleSenha('btn-toggle-cad-confirma', 'cad-confirma-senha');
    configurarToggleSenha('btn-toggle-cad-senha', 'cad-senha');
    configurarToggleSenha('btn-toggle-cad-confirma', 'cad-confirma');

    // ==========================================================================
    // 3. MÁSCARAS DE ENTRADA (DATA E WHATSAPP)
    // ==========================================================================
    // Máscara Data de Nascimento: DD/MM/AAAA
    const inputsData = document.querySelectorAll('#cad-nascimento');
    inputsData.forEach(input => {
        input.addEventListener('input', (e) => {
            let v = e.target.value.replace(/\D/g, '');
            if (v.length > 8) v = v.substring(0, 8);
            if (v.length >= 5) {
                v = v.replace(/^(\d{2})(\d{2})(\d{0,4})/, '$1/$2/$3');
            } else if (v.length >= 3) {
                v = v.replace(/^(\d{2})(\d{0,2})/, '$1/$2');
            }
            e.target.value = v;
        });
    });

    // Máscara WhatsApp / Telefone: (00) 00000-0000
    const inputsTel = document.querySelectorAll('#cad-telefone');
    inputsTel.forEach(input => {
        input.addEventListener('input', (e) => {
            let v = e.target.value.replace(/\D/g, '');
            if (v.length > 11) v = v.substring(0, 11);
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

    // Username limpa espaços e caracteres inválidos
    const inputsUser = document.querySelectorAll('#cad-username');
    inputsUser.forEach(input => {
        input.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\s+/g, '').toLowerCase();
        });
    });

    // ==========================================================================
    // 4. FORMULÁRIO DE LOGIN
    // ==========================================================================
    const formLogin = document.getElementById('form-login');
    const inputEmail = document.getElementById('input-email');
    const inputSenha = document.getElementById('input-senha');
    const btnEntrar = document.getElementById('btn-entrar');
    const statusMsgLogin = document.getElementById('status-msg-login');

    if (formLogin) {
        formLogin.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = inputEmail.value.trim();
            const senha = inputSenha.value.trim();

            exibirStatus(statusMsgLogin, '', '');

            if (!email || !senha) {
                exibirStatus(statusMsgLogin, 'Preencha todos os campos para continuar.', 'status-erro');
                if (!email) inputEmail.focus();
                else inputSenha.focus();
                return;
            }

            // Aceita usuário 'admin' ou qualquer formato de e-mail válido
            const isLoginValido = email.toLowerCase() === 'admin' || validarEmail(email);
            if (!isLoginValido) {
                exibirStatus(statusMsgLogin, 'Insira um formato de e-mail válido (ex: admin@admin.com) ou o usuário admin.', 'status-erro');
                inputEmail.focus();
                return;
            }

            iniciarCarregamento(btnEntrar);
            exibirStatus(statusMsgLogin, 'Verificando...', 'status-info');

            setTimeout(() => {
                pararCarregamento(btnEntrar);
                if (senha.length < 4) {
                    exibirStatus(statusMsgLogin, 'E-mail ou senha incorretos.', 'status-erro');
                    inputSenha.focus();
                } else {
                    exibirStatus(statusMsgLogin, 'Login realizado com sucesso! Redirecionando...', 'status-sucesso');
                    try {
                        localStorage.setItem('itaim_ultimo_email', email);
                        if (window.ItaimSessao && typeof window.ItaimSessao.definirUsuarioLogado === 'function') {
                            window.ItaimSessao.definirUsuarioLogado(email);
                        }
                    } catch (err) {}
                    setTimeout(() => {
                        const isInsidePages = window.location.pathname.toLowerCase().includes('/pages/') || window.location.pathname.toLowerCase().includes('\\pages\\');
                        window.location.href = (window.ItaimRotas ? window.ItaimRotas.obterUrl('home') : 'pages/home/home.html');
                    }, 500);
                }
            }, 1000);
        });
    }

    // ==========================================================================
    // 5. FORMULÁRIO DE CADASTRO COMPLETO (SEM CPF)
    // ==========================================================================
    const formsCadastro = document.querySelectorAll('#form-cadastro-completo, #form-cadastro-direto');
    formsCadastro.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const statusMsg = form.querySelector('.status-msg');
            const btnSubmit = form.querySelector('.btn-concluir-cadastro');

            const nome = form.querySelector('[name="nome"]')?.value.trim() || '';
            const username = form.querySelector('[name="username"]')?.value.trim() || '';
            const cidade = form.querySelector('[name="cidade"]')?.value || '';
            const bairro = form.querySelector('[name="bairro"]')?.value.trim() || '';
            const telefone = form.querySelector('[name="telefone"]')?.value.trim() || '';
            const email = form.querySelector('[name="email"]')?.value.trim() || '';
            const senha = form.querySelector('[name="senha"]')?.value || '';
            const confirmaSenha = form.querySelector('[name="confirmaSenha"], [name="confirma"]')?.value || '';

            exibirStatus(statusMsg, '', '');

            // Validações
            if (!nome || !username || !email || !senha) {
                exibirStatus(statusMsg, 'Preencha todos os campos obrigatórios.', 'status-erro');
                return;
            }

            if (!validarEmail(email)) {
                exibirStatus(statusMsg, 'Insira um e-mail válido.', 'status-erro');
                return;
            }

            if (senha.length < 8) {
                exibirStatus(statusMsg, 'Senha fraca: use no mínimo 8 caracteres.', 'status-erro');
                return;
            }

            if (senha !== confirmaSenha) {
                exibirStatus(statusMsg, 'As senhas não coincidem.', 'status-erro');
                return;
            }

            iniciarCarregamento(btnSubmit);
            exibirStatus(statusMsg, 'Verificando dados...', 'status-info');

            setTimeout(() => {
                pararCarregamento(btnSubmit);

                // Cadastra o novo usuário no sistema multiusuário
                if (window.ItaimSessao && typeof window.ItaimSessao.cadastrarNovoUsuario === 'function') {
                    window.ItaimSessao.cadastrarNovoUsuario({
                        nome: nome,
                        username: username,
                        cidade: cidade,
                        bairro: bairro,
                        telefone: telefone,
                        email: email
                    });
                }

                exibirStatus(statusMsg, 'Cadastro concluído com sucesso! Bem-vindo ao Itaim Vende.', 'status-sucesso');

                setTimeout(() => {
                    if (secaoLogin) {
                        alternarTela('login');
                        inputEmail.value = email;
                        inputSenha.value = senha;
                        exibirStatus(statusMsgLogin, 'Conta criada! Clique em ENTRAR para acessar.', 'status-sucesso');
                    } else {
                        const isInsidePages = window.location.pathname.toLowerCase().includes('/pages/') || window.location.pathname.toLowerCase().includes('\\pages\\');
                        window.location.href = (window.ItaimRotas ? window.ItaimRotas.obterUrl('index') : '../../index.html');
                    }
                }, 1600);
            }, 1200);
        });
    });

    // ==========================================================================
    // 6. MODAL RECUPERAR SENHA COM CONFIRMAÇÃO DE CÓDIGO (FLUXO MULTI-ETAPAS)
    // ==========================================================================
    const linkEsqueceu = document.getElementById('link-esqueceu');
    const modalEsqueceu = document.getElementById('modal-esqueceu');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalTituloRecuperar = document.getElementById('modal-titulo-recuperar');
    const modalDescricaoRecuperar = document.getElementById('modal-descricao-recuperar');
    const modalIconTopo = document.getElementById('modal-icon-topo');

    // Etapa 1
    const formEtapa1 = document.getElementById('form-recuperar-etapa1');
    const recuperarEmail = document.getElementById('recuperar-email');
    const btnEnviarRecuperacao = document.getElementById('btn-enviar-recuperacao');
    const statusModalRecuperar = document.getElementById('status-modal-recuperar');

    // Etapa 2 (Código)
    const formEtapa2 = document.getElementById('form-recuperar-etapa2');
    const codigoGeradoDisplay = document.getElementById('codigo-gerado-display');
    const btnCopiarCodigo = document.getElementById('btn-copiar-codigo');
    const inputsDigito = document.querySelectorAll('.input-digito-codigo');
    const btnValidarCodigo = document.getElementById('btn-validar-codigo');
    const statusModalCodigo = document.getElementById('status-modal-codigo');
    const btnReenviarCodigo = document.getElementById('btn-reenviar-codigo');
    const timerReenviarCodigo = document.getElementById('timer-reenviar-codigo');
    const timerSegundos = document.getElementById('timer-segundos');
    const btnVoltarEtapa1 = document.getElementById('btn-voltar-etapa1');

    // Etapa 3 (Nova Senha)
    const formEtapa3 = document.getElementById('form-recuperar-etapa3');
    const recuperarNovaSenha = document.getElementById('recuperar-nova-senha');
    const recuperarConfirmaSenha = document.getElementById('recuperar-confirma-senha');
    const btnSalvarNovaSenha = document.getElementById('btn-salvar-nova-senha');
    const statusModalSenha = document.getElementById('status-modal-senha');

    // Etapa 4 (Sucesso)
    const boxRecuperarSucesso = document.getElementById('box-recuperar-sucesso');
    const btnIrParaLoginPosRecuperacao = document.getElementById('btn-ir-para-login-pos-recuperacao');

    configurarToggleSenha('btn-toggle-nova-senha', 'recuperar-nova-senha');
    configurarToggleSenha('btn-toggle-confirma-nova-senha', 'recuperar-confirma-senha');

    let codigoAtivo = null;
    let emailRecuperacaoAtual = '';
    let intervalTimerReenviar = null;

    function resetarModalRecuperacao() {
        if (formEtapa1) formEtapa1.style.display = 'block';
        if (formEtapa2) formEtapa2.style.display = 'none';
        if (formEtapa3) formEtapa3.style.display = 'none';
        if (boxRecuperarSucesso) boxRecuperarSucesso.style.display = 'none';
        if (modalIconTopo) modalIconTopo.style.display = 'inline-flex';

        if (modalTituloRecuperar) {
            modalTituloRecuperar.style.display = 'block';
            modalTituloRecuperar.textContent = 'Recuperar Senha';
        }
        if (modalDescricaoRecuperar) {
            modalDescricaoRecuperar.style.display = 'block';
            modalDescricaoRecuperar.textContent = 'Informe o e-mail cadastrado na sua conta para enviarmos o código de confirmação.';
        }

        exibirStatus(statusModalRecuperar, '', '');
        exibirStatus(statusModalCodigo, '', '');
        exibirStatus(statusModalSenha, '', '');

        inputsDigito.forEach(input => {
            input.value = '';
            input.classList.remove('erro-digito', 'sucesso-digito');
        });

        if (recuperarNovaSenha) recuperarNovaSenha.value = '';
        if (recuperarConfirmaSenha) recuperarConfirmaSenha.value = '';

        if (intervalTimerReenviar) {
            clearInterval(intervalTimerReenviar);
            intervalTimerReenviar = null;
        }
    }

    function fecharModalRecuperacao() {
        if (!modalEsqueceu) return;
        modalEsqueceu.classList.remove('modal-ativo');
        modalEsqueceu.setAttribute('aria-hidden', 'true');
        setTimeout(resetarModalRecuperacao, 300);
    }

    function abrirModalRecuperacao() {
        if (!modalEsqueceu) return;
        resetarModalRecuperacao();
        modalEsqueceu.classList.add('modal-ativo');
        modalEsqueceu.setAttribute('aria-hidden', 'false');
        if (inputEmail && inputEmail.value.trim() && recuperarEmail) {
            recuperarEmail.value = inputEmail.value.trim();
        }
        recuperarEmail?.focus();
    }

    if (linkEsqueceu) {
        linkEsqueceu.addEventListener('click', (e) => {
            e.preventDefault();
            abrirModalRecuperacao();
        });
    }

    modalCloseBtn?.addEventListener('click', fecharModalRecuperacao);

    modalEsqueceu?.addEventListener('click', (e) => {
        if (e.target === modalEsqueceu) fecharModalRecuperacao();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalEsqueceu?.classList.contains('modal-ativo')) {
            fecharModalRecuperacao();
        }
    });

    function gerarNovoCodigo() {
        codigoAtivo = String(Math.floor(100000 + Math.random() * 900000));
        if (codigoGeradoDisplay) {
            codigoGeradoDisplay.textContent = codigoAtivo;
        }
        return codigoAtivo;
    }

    function iniciarContadorReenviar() {
        if (intervalTimerReenviar) clearInterval(intervalTimerReenviar);
        let tempoRestante = 30;

        if (btnReenviarCodigo) btnReenviarCodigo.disabled = true;
        if (timerReenviarCodigo) timerReenviarCodigo.style.display = 'inline';
        if (timerSegundos) timerSegundos.textContent = tempoRestante;

        intervalTimerReenviar = setInterval(() => {
            tempoRestante--;
            if (timerSegundos) timerSegundos.textContent = tempoRestante;
            if (tempoRestante <= 0) {
                clearInterval(intervalTimerReenviar);
                intervalTimerReenviar = null;
                if (btnReenviarCodigo) btnReenviarCodigo.disabled = false;
                if (timerReenviarCodigo) timerReenviarCodigo.style.display = 'none';
            }
        }, 1000);
    }

    // Navegação e validação dos 6 dígitos
    inputsDigito.forEach((input, index) => {
        input.addEventListener('input', (e) => {
            input.classList.remove('erro-digito');
            let val = e.target.value.replace(/\D/g, '');
            if (val.length > 1) {
                val = val.slice(-1);
            }
            e.target.value = val;

            if (val && index < inputsDigito.length - 1) {
                inputsDigito[index + 1].focus();
            }

            // Se preencheu todos os 6 dígitos, auto-valida
            const codigoCompleto = Array.from(inputsDigito).map(i => i.value).join('');
            if (codigoCompleto.length === 6) {
                btnValidarCodigo?.focus();
            }
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !input.value && index > 0) {
                inputsDigito[index - 1].focus();
                inputsDigito[index - 1].value = '';
            } else if (e.key === 'ArrowLeft' && index > 0) {
                inputsDigito[index - 1].focus();
            } else if (e.key === 'ArrowRight' && index < inputsDigito.length - 1) {
                inputsDigito[index + 1].focus();
            } else if (e.key === 'Enter') {
                e.preventDefault();
                btnValidarCodigo?.click();
            }
        });

        input.addEventListener('paste', (e) => {
            e.preventDefault();
            const colar = (e.clipboardData || window.clipboardData).getData('text');
            const digitos = colar.replace(/\D/g, '').slice(0, 6);
            if (!digitos) return;

            digitos.split('').forEach((d, i) => {
                if (inputsDigito[i]) {
                    inputsDigito[i].value = d;
                    inputsDigito[i].classList.remove('erro-digito');
                }
            });

            const proximoIndex = Math.min(digitos.length, inputsDigito.length - 1);
            inputsDigito[proximoIndex].focus();

            if (digitos.length === 6) {
                btnValidarCodigo?.focus();
            }
        });
    });

    // Botão de preencher o código de teste com 1 clique
    btnCopiarCodigo?.addEventListener('click', () => {
        if (!codigoAtivo) return;
        codigoAtivo.split('').forEach((d, i) => {
            if (inputsDigito[i]) {
                inputsDigito[i].value = d;
                inputsDigito[i].classList.remove('erro-digito');
                inputsDigito[i].classList.add('sucesso-digito');
            }
        });
        exibirStatus(statusModalCodigo, 'Código preenchido automaticamente!', 'status-info');
        btnValidarCodigo?.focus();
    });

    // ETAPA 1 -> ETAPA 2 (Enviar Código)
    formEtapa1?.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = recuperarEmail?.value.trim() || '';

        if (!validarEmail(email)) {
            exibirStatus(statusModalRecuperar, 'Por favor, insira um e-mail válido.', 'status-erro');
            recuperarEmail?.focus();
            return;
        }

        emailRecuperacaoAtual = email;
        iniciarCarregamento(btnEnviarRecuperacao);
        exibirStatus(statusModalRecuperar, 'Gerando e enviando código...', 'status-info');

        setTimeout(() => {
            pararCarregamento(btnEnviarRecuperacao);
            gerarNovoCodigo();

            formEtapa1.style.display = 'none';
            formEtapa2.style.display = 'block';

            if (modalTituloRecuperar) modalTituloRecuperar.textContent = 'Confirmar Código';
            if (modalDescricaoRecuperar) {
                modalDescricaoRecuperar.innerHTML = `Enviamos um código de 6 dígitos para:<br><strong style="color:#FFFFFF;">${emailRecuperacaoAtual}</strong>`;
            }

            iniciarContadorReenviar();
            inputsDigito[0]?.focus();
        }, 800);
    });

    // Voltar da Etapa 2 para a Etapa 1
    btnVoltarEtapa1?.addEventListener('click', () => {
        formEtapa2.style.display = 'none';
        formEtapa1.style.display = 'block';
        if (modalTituloRecuperar) modalTituloRecuperar.textContent = 'Recuperar Senha';
        if (modalDescricaoRecuperar) modalDescricaoRecuperar.textContent = 'Informe o e-mail cadastrado na sua conta para enviarmos o código de confirmação.';
        exibirStatus(statusModalRecuperar, '', '');
        recuperarEmail?.focus();
    });

    // Reenviar Código
    btnReenviarCodigo?.addEventListener('click', () => {
        gerarNovoCodigo();
        iniciarContadorReenviar();
        inputsDigito.forEach(i => {
            i.value = '';
            i.classList.remove('erro-digito', 'sucesso-digito');
        });
        exibirStatus(statusModalCodigo, 'Novo código gerado com sucesso!', 'status-sucesso');
        inputsDigito[0]?.focus();
    });

    // ETAPA 2 -> ETAPA 3 (Validar Código)
    btnValidarCodigo?.addEventListener('click', () => {
        const codigoDigitado = Array.from(inputsDigito).map(i => i.value).join('');

        if (codigoDigitado.length < 6) {
            inputsDigito.forEach(i => {
                if (!i.value) i.classList.add('erro-digito');
            });
            exibirStatus(statusModalCodigo, 'Digite todos os 6 dígitos do código.', 'status-erro');
            const primeiroVazio = Array.from(inputsDigito).find(i => !i.value);
            primeiroVazio?.focus();
            return;
        }

        iniciarCarregamento(btnValidarCodigo);
        exibirStatus(statusModalCodigo, 'Validando código...', 'status-info');

        setTimeout(() => {
            pararCarregamento(btnValidarCodigo);

            // Permite o código gerado ou o código padrão '123456' para facilidade de teste
            const isValido = codigoDigitado === codigoAtivo || codigoDigitado === '123456';

            if (isValido) {
                inputsDigito.forEach(i => {
                    i.classList.remove('erro-digito');
                    i.classList.add('sucesso-digito');
                });
                exibirStatus(statusModalCodigo, 'Código verificado com sucesso!', 'status-sucesso');

                setTimeout(() => {
                    formEtapa2.style.display = 'none';
                    formEtapa3.style.display = 'block';
                    if (modalTituloRecuperar) modalTituloRecuperar.textContent = 'Criar Nova Senha';
                    if (modalDescricaoRecuperar) {
                        modalDescricaoRecuperar.textContent = 'Crie uma nova senha forte para acessar sua conta.';
                    }
                    recuperarNovaSenha?.focus();
                }, 600);
            } else {
                inputsDigito.forEach(i => i.classList.add('erro-digito'));
                exibirStatus(statusModalCodigo, 'Código incorreto. Confira os 6 dígitos e tente novamente.', 'status-erro');
                inputsDigito[0]?.focus();
                inputsDigito[0]?.select();
            }
        }, 600);
    });

    // ETAPA 3 -> ETAPA 4 (Salvar Nova Senha)
    formEtapa3?.addEventListener('submit', (e) => {
        e.preventDefault();
        const novaSenha = recuperarNovaSenha?.value || '';
        const confirmaSenha = recuperarConfirmaSenha?.value || '';

        if (novaSenha.length < 8) {
            exibirStatus(statusModalSenha, 'A senha deve conter no mínimo 8 caracteres.', 'status-erro');
            recuperarNovaSenha?.focus();
            return;
        }

        if (novaSenha !== confirmaSenha) {
            exibirStatus(statusModalSenha, 'As senhas não coincidem.', 'status-erro');
            recuperarConfirmaSenha?.focus();
            return;
        }

        iniciarCarregamento(btnSalvarNovaSenha);
        exibirStatus(statusModalSenha, 'Salvando nova senha...', 'status-info');

        setTimeout(() => {
            pararCarregamento(btnSalvarNovaSenha);

            // Salva no localStorage para persistência de teste
            try {
                localStorage.setItem('itaim_ultimo_email', emailRecuperacaoAtual);
                localStorage.setItem('itaim_senha_redefinida', 'true');
            } catch (err) {}

            formEtapa3.style.display = 'none';
            if (modalIconTopo) modalIconTopo.style.display = 'none';
            if (modalTituloRecuperar) modalTituloRecuperar.style.display = 'none';
            if (modalDescricaoRecuperar) modalDescricaoRecuperar.style.display = 'none';
            if (boxRecuperarSucesso) boxRecuperarSucesso.style.display = 'block';
        }, 800);
    });

    // ETAPA 4 (Botão Fazer Login)
    btnIrParaLoginPosRecuperacao?.addEventListener('click', () => {
        fecharModalRecuperacao();
        if (inputEmail) inputEmail.value = emailRecuperacaoAtual;
        if (inputSenha) {
            inputSenha.value = '';
            inputSenha.focus();
        }
        if (statusMsgLogin) {
            exibirStatus(statusMsgLogin, 'Senha redefinida com sucesso! Digite sua nova senha para entrar.', 'status-sucesso');
        }
    });

    // ==========================================================================
    // 7. FUNÇÕES AUXILIARES
    // ==========================================================================
    function validarEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function exibirStatus(elem, texto, tipoClasse) {
        if (!elem) return;
        elem.textContent = texto;
        elem.className = 'status-msg';
        if (tipoClasse) elem.classList.add(tipoClasse);
    }

    function iniciarCarregamento(btn) {
        if (!btn) return;
        btn.classList.add('btn-loading');
        btn.disabled = true;
    }

    function pararCarregamento(btn) {
        if (!btn) return;
        btn.classList.remove('btn-loading');
        btn.disabled = false;
    }
});
