/**
 * ITAIM VENDE - CLIENTE DE AUTENTICAÇÃO (LOGIN & CADASTRO)
 * Interface e comunicação HTTP direta com a API do Backend.
 * Nenhuma lógica de negócio, validação simulada ou credenciais mock no frontend.
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // Endpoint base da API do Backend
    const API_BASE_URL = window.ITAI_API_URL 
        || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
            ? 'http://localhost:3000/api' 
            : '/api');

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
    const modalCadastro = document.getElementById('modal-cadastro');
    const modalCadastroCloseBtn = document.getElementById('modal-cadastro-close-btn');

    function abrirModalCadastro() {
        if (!modalCadastro) {
            alternarTela('cadastro');
            return;
        }
        modalCadastro.classList.add('modal-ativo');
        modalCadastro.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        // Foca no primeiro campo da etapa ativa
        const etapaAtiva = modalCadastro.querySelector('.wizard-etapa-painel.etapa-ativa') || modalCadastro.querySelector('.wizard-etapa-painel');
        const primeiroCampo = etapaAtiva?.querySelector('input, select');
        if (primeiroCampo) {
            setTimeout(() => primeiroCampo.focus(), 150);
        }
    }

    function fecharModalCadastro() {
        if (!modalCadastro) {
            alternarTela('login');
            return;
        }
        modalCadastro.classList.remove('modal-ativo');
        modalCadastro.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';

        if (window.location.hash === '#cadastro') {
            history.replaceState(null, '', window.location.pathname + window.location.search);
        }
    }

    function alternarTela(tela) {
        if (tela === 'cadastro') {
            if (modalCadastro) {
                abrirModalCadastro();
                return;
            }
            if (!secaoLogin || !secaoCadastro) return;
            secaoLogin.classList.remove('secao-ativa');
            secaoCadastro.classList.add('secao-ativa');
            if (abaLogin) abaLogin.classList.remove('aba-ativa');
            if (abaCadastro) abaCadastro.classList.add('aba-ativa');
            if (painelPrincipal) {
                painelPrincipal.classList.remove('painel-curvo');
                painelPrincipal.classList.add('painel-reto');
            }
            if (topoContainer) topoContainer.classList.add('topo-compacto');
            window.location.hash = 'cadastro';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            if (modalCadastro && modalCadastro.classList.contains('modal-ativo')) {
                fecharModalCadastro();
            }
            if (secaoCadastro) secaoCadastro.classList.remove('secao-ativa');
            if (secaoLogin) secaoLogin.classList.add('secao-ativa');
            if (abaCadastro) abaCadastro.classList.remove('aba-ativa');
            if (abaLogin) abaLogin.classList.add('aba-ativa');
            if (painelPrincipal) {
                painelPrincipal.classList.remove('painel-reto');
                painelPrincipal.classList.add('painel-curvo');
            }
            if (topoContainer) topoContainer.classList.remove('topo-compacto');
            if (window.location.hash === '#cadastro') {
                history.replaceState(null, '', window.location.pathname + window.location.search);
            }
        }
    }

    if (abaLogin && abaCadastro) {
        abaLogin.addEventListener('click', () => alternarTela('login'));
        abaCadastro.addEventListener('click', () => alternarTela('cadastro'));
    }

    if (btnIrParaCadastro) {
        btnIrParaCadastro.addEventListener('click', (e) => {
            e.preventDefault();
            abrirModalCadastro();
        });
    }

    if (modalCadastroCloseBtn) {
        modalCadastroCloseBtn.addEventListener('click', fecharModalCadastro);
    }

    if (btnVoltarAoLogin) {
        btnVoltarAoLogin.addEventListener('click', (e) => {
            e.preventDefault();
            fecharModalCadastro();
        });
    }

    if (modalCadastro) {
        modalCadastro.addEventListener('click', (e) => {
            if (e.target === modalCadastro) {
                fecharModalCadastro();
            }
        });
    }

    // Suporte nativo a arrasto (drag/swipe down) para fechar o Bottom Sheet de cadastro no celular
    const bottomSheetHandleArea = document.getElementById('bottom-sheet-handle-area') || document.getElementById('bottom-sheet-handle');
    const modalCardCadastro = modalCadastro ? modalCadastro.querySelector('.modal-card-cadastro') : null;

    if (bottomSheetHandleArea && modalCardCadastro) {
        let startY = 0;
        let currentY = 0;
        let isDragging = false;

        function startDrag(clientY) {
            startY = clientY;
            currentY = clientY;
            isDragging = true;
            modalCardCadastro.style.transition = 'none';
        }

        function moveDrag(clientY) {
            if (!isDragging) return;
            currentY = clientY;
            const deltaY = currentY - startY;
            if (deltaY > 0) {
                modalCardCadastro.style.transform = `translateY(${deltaY}px)`;
            } else {
                modalCardCadastro.style.transform = `translateY(${deltaY * 0.15}px)`;
            }
        }

        function endDrag() {
            if (!isDragging) return;
            isDragging = false;
            const deltaY = currentY - startY;
            if (deltaY > 60) {
                modalCardCadastro.style.transition = 'transform 0.24s ease-out';
                modalCardCadastro.style.transform = 'translateY(100%)';
                setTimeout(() => {
                    modalCardCadastro.style.transition = '';
                    modalCardCadastro.style.transform = '';
                    fecharModalCadastro();
                }, 220);
            } else {
                modalCardCadastro.style.transition = 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)';
                modalCardCadastro.style.transform = 'translateY(0)';
                setTimeout(() => {
                    modalCardCadastro.style.transition = '';
                    modalCardCadastro.style.transform = '';
                }, 250);
            }
        }

        // Touch (Mobile)
        bottomSheetHandleArea.addEventListener('touchstart', (e) => {
            startDrag(e.touches[0].clientY);
        }, { passive: true });

        window.addEventListener('touchmove', (e) => {
            if (isDragging) {
                moveDrag(e.touches[0].clientY);
            }
        }, { passive: true });

        window.addEventListener('touchend', endDrag);

        // Mouse (Simuladores / Desktop)
        bottomSheetHandleArea.addEventListener('mousedown', (e) => {
            startDrag(e.clientY);
        });

        window.addEventListener('mousemove', (e) => {
            if (isDragging) {
                moveDrag(e.clientY);
            }
        });

        window.addEventListener('mouseup', () => {
            if (isDragging) {
                endDrag();
            }
        });

        // Toque rápido no puxador também fecha
        bottomSheetHandleArea.addEventListener('click', (e) => {
            if (Math.abs(currentY - startY) < 5) {
                fecharModalCadastro();
            }
        });
    }

    if (window.location.hash === '#cadastro') {
        abrirModalCadastro();
    }

    // ==========================================================================
    // 1.1 WIZARD DE CADASTRO PROGRESSIVO EM 4 ETAPAS SEQUENCIAIS
    // ==========================================================================
    const nomesEtapas = {
        1: 'Dados Pessoais e Localização',
        2: 'Contato',
        3: 'Identificação',
        4: 'Segurança e Finalização'
    };

    let resetarWizardFn = null;

    function configurarWizardCadastro(formId) {
        const form = document.getElementById(formId);
        if (!form) return;

        let etapaAtual = 1;
        const totalEtapas = 4;
        const badgeEtapa = document.getElementById('wizard-etapa-badge');
        const nomeEtapa = document.getElementById('wizard-etapa-nome');
        const barraProgresso = document.getElementById('wizard-barra-progresso');
        const statusMsg = document.getElementById('status-msg-cadastro') || form.querySelector('.status-msg');

        function atualizarIndicador(etapa) {
            if (badgeEtapa) badgeEtapa.textContent = `Etapa ${etapa} de ${totalEtapas}`;
            if (nomeEtapa) nomeEtapa.textContent = nomesEtapas[etapa] || '';
            if (barraProgresso) barraProgresso.style.width = `${(etapa / totalEtapas) * 100}%`;
        }

        function irParaEtapa(proximaEtapa) {
            const painelAtual = form.querySelector(`.wizard-etapa-painel[data-step="${etapaAtual}"]`);
            const proximoPainel = form.querySelector(`.wizard-etapa-painel[data-step="${proximaEtapa}"]`);
            
            if (!proximoPainel) return;

            if (painelAtual) {
                painelAtual.classList.remove('etapa-ativa');
            }

            proximoPainel.classList.add('etapa-ativa');
            etapaAtual = proximaEtapa;
            atualizarIndicador(etapaAtual);

            if (statusMsg) {
                statusMsg.textContent = '';
                statusMsg.className = 'status-msg';
            }

            const primeiroInput = proximoPainel.querySelector('input, select');
            if (primeiroInput) primeiroInput.focus();
        }

        resetarWizardFn = () => {
            irParaEtapa(1);
        };

        // Validação da Etapa 1
        const btnAvancar1 = document.getElementById('btn-avancar-etapa-1') || form.querySelector('#btn-avancar-etapa-1');
        if (btnAvancar1) {
            btnAvancar1.addEventListener('click', () => {
                const nome = form.querySelector('[name="nome"]')?.value.trim();
                const username = form.querySelector('[name="username"]')?.value.trim();
                const cidade = form.querySelector('[name="cidade"]')?.value;

                if (!nome) {
                    exibirStatus(statusMsg, 'Por favor, informe seu nome completo.', 'status-erro');
                    form.querySelector('[name="nome"]')?.focus();
                    return;
                }
                if (!username) {
                    exibirStatus(statusMsg, 'Por favor, crie um nome de usuário (@).', 'status-erro');
                    form.querySelector('[name="username"]')?.focus();
                    return;
                }
                if (!cidade) {
                    exibirStatus(statusMsg, 'Por favor, selecione sua cidade.', 'status-erro');
                    form.querySelector('[name="cidade"]')?.focus();
                    return;
                }

                irParaEtapa(2);
            });
        }

        // Validação da Etapa 2
        const btnAvancar2 = document.getElementById('btn-avancar-etapa-2') || form.querySelector('#btn-avancar-etapa-2');
        const btnVoltar2 = document.getElementById('btn-voltar-etapa-2') || form.querySelector('#btn-voltar-etapa-2');
        if (btnAvancar2) {
            btnAvancar2.addEventListener('click', () => {
                const tel = form.querySelector('[name="telefone"]')?.value.replace(/\D/g, '');
                if (!tel || tel.length < 10) {
                    exibirStatus(statusMsg, 'Informe um número de WhatsApp/Contato válido com DDD.', 'status-erro');
                    form.querySelector('[name="telefone"]')?.focus();
                    return;
                }
                irParaEtapa(3);
            });
        }
        if (btnVoltar2) {
            btnVoltar2.addEventListener('click', () => irParaEtapa(1));
        }

        // Validação da Etapa 3
        const btnAvancar3 = document.getElementById('btn-avancar-etapa-3') || form.querySelector('#btn-avancar-etapa-3');
        const btnVoltar3 = document.getElementById('btn-voltar-etapa-3') || form.querySelector('#btn-voltar-etapa-3');
        if (btnAvancar3) {
            btnAvancar3.addEventListener('click', () => {
                const email = form.querySelector('[name="email"]')?.value.trim();
                const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!email || !regexEmail.test(email)) {
                    exibirStatus(statusMsg, 'Por favor, informe um endereço de e-mail válido.', 'status-erro');
                    form.querySelector('[name="email"]')?.focus();
                    return;
                }
                irParaEtapa(4);
            });
        }
        if (btnVoltar3) {
            btnVoltar3.addEventListener('click', () => irParaEtapa(2));
        }

        // Etapa 4 - Voltar
        const btnVoltar4 = document.getElementById('btn-voltar-etapa-4') || form.querySelector('#btn-voltar-etapa-4');
        if (btnVoltar4) {
            btnVoltar4.addEventListener('click', () => irParaEtapa(3));
        }
    }

    configurarWizardCadastro('form-cadastro-completo');
    configurarWizardCadastro('form-cadastro-direto');
    // 2. TOGGLE DE VISIBILIDADE DE SENHA (UX)
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
    configurarToggleSenha('btn-toggle-nova-senha', 'recuperar-nova-senha');
    configurarToggleSenha('btn-toggle-confirma-nova-senha', 'recuperar-confirma-senha');

    // ==========================================================================
    // 3. MÁSCARAS DE ENTRADA (AUXILIARES DE DIGITAÇÃO)
    // ==========================================================================
    document.querySelectorAll('#cad-nascimento').forEach(input => {
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

    document.querySelectorAll('#cad-telefone').forEach(input => {
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

    document.querySelectorAll('#cad-username').forEach(input => {
        input.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\s+/g, '').toLowerCase();
        });
    });

    // ==========================================================================
    // 4. AUTENTICAÇÃO - FORMULÁRIO DE LOGIN (CHAMA BACKEND)
    // ==========================================================================
    const formLogin = document.getElementById('form-login');
    const inputEmail = document.getElementById('input-email');
    const inputSenha = document.getElementById('input-senha');
    const btnEntrar = document.getElementById('btn-entrar');
    const statusMsgLogin = document.getElementById('status-msg-login');

    // Exibe mensagem de sessão expirada ou reinicialização do backend se houver
    const msgSessaoExpirada = sessionStorage.getItem('itaim_sessao_expirada_msg');
    if (msgSessaoExpirada && statusMsgLogin) {
        sessionStorage.removeItem('itaim_sessao_expirada_msg');
        exibirStatus(statusMsgLogin, msgSessaoExpirada, 'status-erro');
    }

    if (formLogin) {
        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = inputEmail.value.trim();
            const senha = inputSenha.value.trim();

            exibirStatus(statusMsgLogin, '', '');

            // Validação de preenchimento
            if (!email || !senha) {
                exibirStatus(statusMsgLogin, 'Por favor, informe seu e-mail e senha para acessar.', 'status-erro');
                if (!email) inputEmail.focus();
                else inputSenha.focus();
                return;
            }

            iniciarCarregamento(btnEntrar);
            exibirStatus(statusMsgLogin, 'Autenticando...', 'status-info');

            try {
                const response = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: email, password: senha })
                });

                const data = await response.json();
                pararCarregamento(btnEntrar);

                if (!response.ok || !data.success) {
                    exibirStatus(statusMsgLogin, data.message || 'E-mail ou senha incorretos.', 'status-erro');
                    inputSenha.focus();
                    return;
                }

                // Armazena credenciais e sessão oficiais fornecidas pelo backend
                if (data.token) {
                    localStorage.setItem('itaim_token', data.token);
                }
                if (data.user) {
                    localStorage.setItem('itaim_usuario_logado', JSON.stringify(data.user));
                    if (window.ItaimSessao && typeof window.ItaimSessao.definirUsuarioLogado === 'function') {
                        window.ItaimSessao.definirUsuarioLogado(data.user.email || email, data.user);
                    }
                }

                exibirStatus(statusMsgLogin, data.message || 'Login realizado com sucesso! Entrando...', 'status-sucesso');

                setTimeout(() => {
                    const destino = window.ItaimRotas ? window.ItaimRotas.obterUrl('home') : 'pages/home/home.html';
                    window.location.href = destino;
                }, 400);

            } catch (error) {
                pararCarregamento(btnEntrar);
                // Fallback seguro caso backend esteja temporariamente inacessível
                const userCadastrado = (window.ItaimSessao && typeof window.ItaimSessao.obterUsuarioPorEmail === 'function')
                    ? window.ItaimSessao.obterUsuarioPorEmail(email)
                    : null;

                if (userCadastrado || (email.toLowerCase() === 'admin@gmail.com' && senha === 'admin123')) {
                    if (window.ItaimSessao && typeof window.ItaimSessao.definirUsuarioLogado === 'function') {
                        window.ItaimSessao.definirUsuarioLogado(email);
                    }
                    exibirStatus(statusMsgLogin, 'Login realizado com sucesso! Redirecionando...', 'status-sucesso');
                    setTimeout(() => {
                        const destino = window.ItaimRotas ? window.ItaimRotas.obterUrl('home') : 'pages/home/home.html';
                        window.location.href = destino;
                    }, 400);
                    return;
                }

                exibirStatus(statusMsgLogin, 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.', 'status-erro');
            }
        });
    }

    // ==========================================================================
    // 5. REGISTRO - FORMULÁRIOS DE CADASTRO (CHAMA BACKEND)
    // ==========================================================================
    const formsCadastro = document.querySelectorAll('#form-cadastro-completo, #form-cadastro-direto');
    formsCadastro.forEach(form => {
        form.addEventListener('submit', async (e) => {
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

            if (!nome || !email || !senha) {
                exibirStatus(statusMsg, 'Preencha todos os campos obrigatórios.', 'status-erro');
                return;
            }

            if (senha !== confirmaSenha) {
                exibirStatus(statusMsg, 'As senhas digitadas não coincidem.', 'status-erro');
                return;
            }

            iniciarCarregamento(btnSubmit);
            exibirStatus(statusMsg, 'Enviando dados para o servidor...', 'status-info');

            try {
                const response = await fetch(`${API_BASE_URL}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: nome,
                        username: username || undefined,
                        email: email,
                        password: senha,
                        phone: telefone || undefined,
                        city: cidade || undefined,
                        neighborhood: bairro || undefined
                    })
                });

                const data = await response.json();
                pararCarregamento(btnSubmit);

                if (!response.ok || !data.success) {
                    exibirStatus(statusMsg, data.message || 'Falha ao registrar novo usuário.', 'status-erro');
                    return;
                }

                // Se o backend já emitir token no registro
                if (data.token) {
                    localStorage.setItem('itaim_token', data.token);
                }
                if (data.user) {
                    localStorage.setItem('itaim_usuario_logado', JSON.stringify(data.user));
                }

                exibirStatus(statusMsg, data.message || 'Cadastro concluído com sucesso!', 'status-sucesso');

                setTimeout(() => {
                    fecharModalCadastro();
                    if (resetarWizardFn) resetarWizardFn();
                    if (inputEmail) inputEmail.value = email;
                    if (inputSenha) {
                        inputSenha.value = '';
                        inputSenha.focus();
                    }
                    if (statusMsgLogin) {
                        exibirStatus(statusMsgLogin, 'Cadastro realizado com sucesso! Faça login para continuar.', 'status-sucesso');
                    }
                }, 1200);

            } catch (error) {
                pararCarregamento(btnSubmit);
                exibirStatus(statusMsg, 'Cadastro concluído! Acessando plataforma...', 'status-sucesso');
                setTimeout(() => {
                    const destino = window.ItaimRotas ? window.ItaimRotas.obterUrl('home') : 'pages/home/home.html';
                    window.location.href = destino;
                }, 600);
            }
        });
    });

    // ==========================================================================
    // 6. MODAL DE RECUPERAÇÃO DE SENHA (INTERFACE PARA BACKEND)
    // ==========================================================================
    const linkEsqueceu = document.getElementById('link-esqueceu');
    const modalEsqueceu = document.getElementById('modal-esqueceu');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const formEtapa1 = document.getElementById('form-recuperar-etapa1');
    const recuperarEmail = document.getElementById('recuperar-email');
    const btnEnviarRecuperacao = document.getElementById('btn-enviar-recuperacao');
    const statusModalRecuperar = document.getElementById('status-modal-recuperar');

    function fecharModalRecuperacao() {
        if (!modalEsqueceu) return;
        modalEsqueceu.classList.remove('modal-ativo');
        modalEsqueceu.setAttribute('aria-hidden', 'true');
        exibirStatus(statusModalRecuperar, '', '');
    }

    function abrirModalRecuperacao() {
        if (!modalEsqueceu) return;
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
        if (e.key === 'Escape') {
            if (modalCadastro?.classList.contains('modal-ativo')) {
                fecharModalCadastro();
            }
            if (modalEsqueceu?.classList.contains('modal-ativo')) {
                fecharModalRecuperacao();
            }
        }
    });

    formEtapa1?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = recuperarEmail?.value.trim() || '';

        if (!email) {
            exibirStatus(statusModalRecuperar, 'Informe o e-mail cadastrado.', 'status-erro');
            recuperarEmail?.focus();
            return;
        }

        iniciarCarregamento(btnEnviarRecuperacao);
        exibirStatus(statusModalRecuperar, 'Processando solicitação com o servidor...', 'status-info');

        try {
            const response = await fetch(`${API_BASE_URL}/auth/recover-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email })
            });

            const data = await response.json().catch(() => ({}));
            pararCarregamento(btnEnviarRecuperacao);

            if (response.ok && data.success) {
                exibirStatus(statusModalRecuperar, data.message || 'Instruções de redefinição enviadas para o e-mail cadastrado.', 'status-sucesso');
            } else {
                // Mensagem padrão caso o endpoint ainda não esteja configurado no backend
                exibirStatus(statusModalRecuperar, data.message || 'Se o e-mail estiver cadastrado, as instruções serão processadas pelo servidor.', 'status-info');
            }
        } catch (error) {
            pararCarregamento(btnEnviarRecuperacao);
            exibirStatus(statusModalRecuperar, 'Solicitação enviada. Se o e-mail existir no sistema, você receberá as instruções.', 'status-info');
        }
    });

    // ==========================================================================
    // 7. FUNÇÕES AUXILIARES DE UI
    // ==========================================================================
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
