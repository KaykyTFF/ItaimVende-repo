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

    // Hash na URL
    if (window.location.hash === '#cadastro') {
        alternarTela('cadastro');
    } else if (window.location.hash === '#recuperar-senha' || window.location.hash === '#recuperar') {
        alternarTela('recuperar');
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
        if (statusMsgCadastro) {
            statusMsgCadastro.textContent = '';
            statusMsgCadastro.className = 'status-msg';
        }

        // Foca no primeiro input da etapa ativa
        const painelAtivo = document.getElementById(`etapa-${etapa}`);
        const primeiroCampo = painelAtivo?.querySelector('input, select');
        if (primeiroCampo) setTimeout(() => primeiroCampo.focus(), 80);
    }

    // Botões AVANÇAR das etapas de cadastro
    document.getElementById('btn-avancar-etapa-1')?.addEventListener('click', (e) => {
        e.preventDefault();
        irParaEtapaCadastro(2);
    });

    document.getElementById('btn-avancar-etapa-2')?.addEventListener('click', (e) => {
        e.preventDefault();
        irParaEtapaCadastro(3);
    });

    document.getElementById('btn-avancar-etapa-3')?.addEventListener('click', (e) => {
        e.preventDefault();
        irParaEtapaCadastro(4);
    });

    // Botões VOLTAR das etapas de cadastro
    document.getElementById('btn-voltar-etapa-2')?.addEventListener('click', (e) => {
        e.preventDefault();
        irParaEtapaCadastro(1);
    });

    document.getElementById('btn-voltar-etapa-3')?.addEventListener('click', (e) => {
        e.preventDefault();
        irParaEtapaCadastro(2);
    });

    document.getElementById('btn-voltar-etapa-4')?.addEventListener('click', (e) => {
        e.preventDefault();
        irParaEtapaCadastro(3);
    });

    // Submissão do cadastro (simples e instantânea para testes)
    const formCadastro = document.getElementById('form-cadastro-completo');
    formCadastro?.addEventListener('submit', (e) => {
        e.preventDefault();
        if (statusMsgCadastro) {
            statusMsgCadastro.textContent = 'Cadastro concluído com sucesso!';
            statusMsgCadastro.className = 'status-msg status-sucesso';
        }

        setTimeout(() => {
            if (statusMsgCadastro) statusMsgCadastro.textContent = '';
            alternarTela('login');
            const statusMsgLogin = document.getElementById('status-msg-login');
            if (statusMsgLogin) {
                statusMsgLogin.textContent = 'Cadastro realizado com sucesso! Faça login para continuar.';
                statusMsgLogin.className = 'status-msg status-sucesso';
            }
        }, 800);
    });

    // ==========================================================================
    // FLUXO DE RECUPERAÇÃO DE SENHA (2 ETAPAS - JAVASCRIPT LOCAL SIMPLES)
    // ==========================================================================
    const formRecEtapa1 = document.getElementById('form-recuperar-etapa1');
    const formRecEtapa2 = document.getElementById('form-recuperar-etapa2');
    const subtituloRecuperar = document.getElementById('subtitulo-recuperar');
    const inputRecCodigo = document.getElementById('recuperar-codigo');
    const inputRecEmail = document.getElementById('recuperar-email');
    const btnVoltarRecEtapa1 = document.getElementById('btn-recuperar-voltar-etapa1');
    const statusRecEtapa1 = document.getElementById('status-modal-recuperar');
    const statusRecEtapa2 = document.getElementById('status-recuperar-etapa2');

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
            if (inputRecCodigo) {
                inputRecCodigo.value = '';
                setTimeout(() => inputRecCodigo.focus(), 80);
            }
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

    formLogin?.addEventListener('submit', (e) => {
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

        if (statusMsgLogin) {
            statusMsgLogin.textContent = 'Login realizado com sucesso! Redirecionando...';
            statusMsgLogin.className = 'status-msg status-sucesso';
        }

        setTimeout(() => {
            const destino = window.ItaimRotas ? window.ItaimRotas.obterUrl('home') : 'pages/home/home.html';
            window.location.href = destino;
        }, 600);
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
    configurarToggleSenha('btn-toggle-cad-senha', 'cad-senha-completo');
    configurarToggleSenha('btn-toggle-cad-confirma', 'cad-confirma-senha');

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
});
