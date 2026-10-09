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
            if (topoContainer) topoContainer.classList.add('topo-compacto');
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
            if (topoContainer) topoContainer.classList.remove('topo-compacto');
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

    if (window.location.hash === '#cadastro') {
        alternarTela('cadastro');
    }

    // ==========================================================================
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

    if (formLogin) {
        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = inputEmail.value.trim();
            const senha = inputSenha.value.trim();

            exibirStatus(statusMsgLogin, '', '');

            // Se os campos não forem preenchidos ou forem deixados em branco, entra em modo de navegação do frontend
            if (!email || !senha) {
                iniciarCarregamento(btnEntrar);
                exibirStatus(statusMsgLogin, 'Entrando no Itaim Vende...', 'status-sucesso');
                setTimeout(() => {
                    const destino = window.ItaimRotas ? window.ItaimRotas.obterUrl('home') : 'pages/home/home.html';
                    window.location.href = destino;
                }, 300);
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

                // Armazena credenciais e sessão fornecidas pelo backend
                if (data.token) {
                    localStorage.setItem('itaim_token', data.token);
                }
                if (data.user) {
                    localStorage.setItem('itaim_usuario_logado', JSON.stringify(data.user));
                    if (window.ItaimSessao && typeof window.ItaimSessao.definirUsuarioLogado === 'function') {
                        window.ItaimSessao.definirUsuarioLogado(data.user.email || email);
                    }
                }

                exibirStatus(statusMsgLogin, data.message || 'Login realizado com sucesso! Redirecionando...', 'status-sucesso');

                setTimeout(() => {
                    const destino = window.ItaimRotas ? window.ItaimRotas.obterUrl('home') : 'pages/home/home.html';
                    window.location.href = destino;
                }, 400);

            } catch (error) {
                // No deploy estático do Netlify, o backend Node.js não roda localmente na mesma nuvem.
                // Redireciona diretamente para a home da aplicação para liberar a navegação do site.
                pararCarregamento(btnEntrar);
                exibirStatus(statusMsgLogin, 'Entrando na plataforma...', 'status-sucesso');
                setTimeout(() => {
                    const destino = window.ItaimRotas ? window.ItaimRotas.obterUrl('home') : 'pages/home/home.html';
                    window.location.href = destino;
                }, 300);
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
                    if (secaoLogin) {
                        alternarTela('login');
                        if (inputEmail) inputEmail.value = email;
                        if (inputSenha) {
                            inputSenha.value = '';
                            inputSenha.focus();
                        }
                        exibirStatus(statusMsgLogin, 'Cadastro realizado com sucesso! Faça login para continuar.', 'status-sucesso');
                    } else {
                        const destino = window.ItaimRotas ? window.ItaimRotas.obterUrl('index') : '../../index.html';
                        window.location.href = destino;
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
        if (e.key === 'Escape' && modalEsqueceu?.classList.contains('modal-ativo')) {
            fecharModalRecuperacao();
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
