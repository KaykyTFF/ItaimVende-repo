/**
 * ITAIM VENDE - CONFIGURAÇÕES: SEGURANÇA, E-MAIL DE ACESSO E ALTERAÇÃO DE SENHA
 * Arquivo: frontend/js/pages/perfil/configuracoes/config-seguranca.js
 */

(function () {
    'use strict';

    function mascararEmail(email) {
        if (!email || !email.includes('@')) return 'não cadastrado';
        const [usuario, dominio] = email.split('@');
        if (usuario.length <= 2) {
            return `${usuario[0]}***@${dominio}`;
        }
        return `${usuario[0]}***${usuario[usuario.length - 1]}@${dominio}`;
    }

    function inicializar() {
        const { CHAVE_PERFIL, ler, $, toast, marcarErro, emailValido } = window.ItaimConfigUtils;

        let usuarioAtivo = (window.ItaimSessao && typeof window.ItaimSessao.obterUsuarioLogado === 'function')
            ? window.ItaimSessao.obterUsuarioLogado()
            : ler(CHAVE_PERFIL, {});

        // Elementos do Card de E-mail de Acesso
        const displayEmailMascarado = $('cfg-email-mascarado');
        const btnAbrirModalEmail = $('btn-abrir-modal-trocar-email');

        // Elementos do Modal de Alteração Segura de E-mail
        const modalEmail = $('modal-alterar-email');
        const btnFecharModalEmail = $('btn-fechar-modal-alterar-email');
        const btnCancelarModalEmail = $('btn-cancelar-modal-email');

        // Indicadores do Stepper
        const stepInd1 = $('step-indicador-1');
        const stepInd2 = $('step-indicador-2');
        const stepInd3 = $('step-indicador-3');

        // Painéis das etapas
        const paneStep1 = $('email-step-1');
        const paneStep2 = $('email-step-2');
        const paneStep3 = $('email-step-3');

        // Passo 1
        const inputSenhaAtual = $('email-input-senha-atual');
        const erroSenhaAtual = 'erro-email-senha-atual';
        const btnAvancarStep1 = $('btn-avancar-email-step-1');

        // Passo 2
        const inputNovoEmail = $('email-input-novo-email');
        const erroNovoEmail = 'erro-email-novo';
        const btnVoltarStep2 = $('btn-voltar-email-step-2');
        const btnAvancarStep2 = $('btn-avancar-email-step-2');

        // Passo 3
        const labelDestinatario = $('email-label-destinatario');
        const inputCodigoOtp = $('email-input-codigo-otp');
        const erroCodigoOtp = 'erro-email-codigo';
        const btnReenviarCodigo = $('btn-reenviar-codigo-email');
        const btnVoltarStep3 = $('btn-voltar-email-step-3');
        const btnConfirmarStep3 = $('btn-confirmar-email-step-3');

        // Variáveis de estado do fluxo de e-mail
        let senhaVerificada = '';
        let novoEmailAlvo = '';
        let timerReenvio = null;

        function atualizarDisplayEmail(email) {
            const emailReal = email || usuarioAtivo.email || localStorage.getItem('itaim_usuario_logado_email') || '';
            if (displayEmailMascarado) {
                displayEmailMascarado.textContent = mascararEmail(emailReal);
            }
        }

        atualizarDisplayEmail();

        // Alternância de visibilidade de senhas
        document.querySelectorAll('.cfg-ver-senha').forEach(btn => {
            btn.addEventListener('click', () => {
                const input = $(btn.dataset.alvo);
                if (!input) return;
                const mostrar = input.type === 'password';
                input.type = mostrar ? 'text' : 'password';
                btn.textContent = mostrar ? 'Ocultar' : 'Mostrar';
            });
        });

        // =========================================================================
        // 1. FLUXO DE ALTERAÇÃO SEGURA DE E-MAIL (MODAL EM 3 ETAPAS)
        // =========================================================================
        function navegarParaStep(step) {
            [paneStep1, paneStep2, paneStep3].forEach(p => { if (p) p.style.display = 'none'; });
            [stepInd1, stepInd2, stepInd3].forEach(ind => {
                if (ind) {
                    ind.classList.remove('ativo', 'completo');
                }
            });

            if (step === 1) {
                if (paneStep1) paneStep1.style.display = '';
                if (stepInd1) stepInd1.classList.add('ativo');
                if (inputSenhaAtual) {
                    inputSenhaAtual.value = '';
                    setTimeout(() => inputSenhaAtual.focus(), 100);
                }
            } else if (step === 2) {
                if (paneStep2) paneStep2.style.display = '';
                if (stepInd1) stepInd1.classList.add('completo');
                if (stepInd2) stepInd2.classList.add('ativo');
                if (inputNovoEmail) {
                    inputNovoEmail.value = novoEmailAlvo || '';
                    setTimeout(() => inputNovoEmail.focus(), 100);
                }
            } else if (step === 3) {
                if (paneStep3) paneStep3.style.display = '';
                if (stepInd1) stepInd1.classList.add('completo');
                if (stepInd2) stepInd2.classList.add('completo');
                if (stepInd3) stepInd3.classList.add('ativo');
                if (labelDestinatario) labelDestinatario.textContent = novoEmailAlvo;
                if (inputCodigoOtp) {
                    inputCodigoOtp.value = '';
                    setTimeout(() => inputCodigoOtp.focus(), 100);
                }
            }
        }

        function abrirModalEmail() {
            if (!modalEmail) return;
            senhaVerificada = '';
            novoEmailAlvo = '';
            marcarErro('email-input-senha-atual', erroSenhaAtual, '');
            marcarErro('email-input-novo-email', erroNovoEmail, '');
            marcarErro('email-input-codigo-otp', erroCodigoOtp, '');

            navegarParaStep(1);
            modalEmail.classList.add('aberto');
        }

        function fecharModalEmail() {
            if (modalEmail) modalEmail.classList.remove('aberto');
            senhaVerificada = '';
            novoEmailAlvo = '';
            if (timerReenvio) clearInterval(timerReenvio);
        }

        if (btnAbrirModalEmail) {
            btnAbrirModalEmail.addEventListener('click', abrirModalEmail);
        }
        if (btnFecharModalEmail) {
            btnFecharModalEmail.addEventListener('click', fecharModalEmail);
        }
        if (btnCancelarModalEmail) {
            btnCancelarModalEmail.addEventListener('click', fecharModalEmail);
        }
        if (modalEmail) {
            modalEmail.addEventListener('click', (e) => {
                if (e.target === modalEmail) fecharModalEmail();
            });
        }

        // --- PASSO 1: Reautenticação com Senha Atual ---
        if (btnAvancarStep1) {
            btnAvancarStep1.addEventListener('click', () => {
                const senha = inputSenhaAtual ? inputSenhaAtual.value : '';
                if (!senha) {
                    marcarErro('email-input-senha-atual', erroSenhaAtual, 'Informe sua senha atual para continuar.');
                    return;
                }
                marcarErro('email-input-senha-atual', erroSenhaAtual, '');
                senhaVerificada = senha;
                navegarParaStep(2);
            });
        }

        // --- PASSO 2: Digitação e Validação do Novo E-mail ---
        if (btnVoltarStep2) {
            btnVoltarStep2.addEventListener('click', () => {
                navegarParaStep(1);
            });
        }

        async function dispararEnvioCodigo() {
            const emailDigitado = inputNovoEmail ? inputNovoEmail.value.trim().toLowerCase() : '';
            if (!emailDigitado || !emailValido(emailDigitado)) {
                marcarErro('email-input-novo-email', erroNovoEmail, 'Informe um endereço de e-mail válido.');
                return;
            }

            const emailAtual = (usuarioAtivo.email || '').trim().toLowerCase();
            if (emailDigitado === emailAtual) {
                marcarErro('email-input-novo-email', erroNovoEmail, 'O novo e-mail deve ser diferente do e-mail atual.');
                return;
            }

            marcarErro('email-input-novo-email', erroNovoEmail, '');
            novoEmailAlvo = emailDigitado;

            if (btnAvancarStep2) {
                btnAvancarStep2.disabled = true;
                btnAvancarStep2.textContent = 'Enviando código...';
            }

            try {
                if (window.ItaimApi && window.ItaimApi.auth && typeof window.ItaimApi.auth.solicitarTrocaEmail === 'function') {
                    await window.ItaimApi.auth.solicitarTrocaEmail(senhaVerificada, novoEmailAlvo);
                }

                toast(`Código de 6 dígitos enviado para ${novoEmailAlvo}`);
                navegarParaStep(3);
            } catch (err) {
                console.error('[Config] Erro ao solicitar troca de e-mail:', err);
                const msg = err.message || 'Erro ao enviar código de verificação.';
                if (err.status === 401 || err.code === 'INVALID_PASSWORD') {
                    navegarParaStep(1);
                    marcarErro('email-input-senha-atual', erroSenhaAtual, 'A senha informada está incorreta.');
                } else if (err.status === 409 || err.code === 'EMAIL_TAKEN') {
                    marcarErro('email-input-novo-email', erroNovoEmail, 'Este e-mail já está em uso por outra conta.');
                } else {
                    marcarErro('email-input-novo-email', erroNovoEmail, msg);
                }
                toast(msg, true);
            } finally {
                if (btnAvancarStep2) {
                    btnAvancarStep2.disabled = false;
                    btnAvancarStep2.textContent = 'Enviar código';
                }
            }
        }

        if (btnAvancarStep2) {
            btnAvancarStep2.addEventListener('click', dispararEnvioCodigo);
        }

        // --- PASSO 3: Confirmação com Código OTP ---
        if (btnVoltarStep3) {
            btnVoltarStep3.addEventListener('click', () => {
                navegarParaStep(2);
            });
        }

        if (inputCodigoOtp) {
            inputCodigoOtp.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6);
                marcarErro('email-input-codigo-otp', erroCodigoOtp, '');
            });
        }

        if (btnReenviarCodigo) {
            btnReenviarCodigo.addEventListener('click', async () => {
                btnReenviarCodigo.disabled = true;
                btnReenviarCodigo.textContent = 'Reenviando...';
                try {
                    if (window.ItaimApi && window.ItaimApi.auth && typeof window.ItaimApi.auth.solicitarTrocaEmail === 'function') {
                        await window.ItaimApi.auth.solicitarTrocaEmail(senhaVerificada, novoEmailAlvo);
                    }
                    toast('Novo código enviado para ' + novoEmailAlvo);
                } catch (err) {
                    toast(err.message || 'Erro ao reenviar código.', true);
                } finally {
                    setTimeout(() => {
                        btnReenviarCodigo.disabled = false;
                        btnReenviarCodigo.textContent = 'Reenviar código';
                    }, 5000);
                }
            });
        }

        if (btnConfirmarStep3) {
            btnConfirmarStep3.addEventListener('click', async () => {
                const codigo = inputCodigoOtp ? inputCodigoOtp.value.trim() : '';
                if (codigo.length !== 6) {
                    marcarErro('email-input-codigo-otp', erroCodigoOtp, 'Digite o código de 6 dígitos.');
                    return;
                }

                marcarErro('email-input-codigo-otp', erroCodigoOtp, '');
                btnConfirmarStep3.disabled = true;
                btnConfirmarStep3.textContent = 'Confirmando...';

                try {
                    let res = null;
                    if (window.ItaimApi && window.ItaimApi.auth && typeof window.ItaimApi.auth.confirmarTrocaEmail === 'function') {
                        res = await window.ItaimApi.auth.confirmarTrocaEmail(novoEmailAlvo, codigo);
                    }

                    // Sucesso! Atualiza dados locais e fecha modal
                    const emailAnterior = usuarioAtivo.email;
                    usuarioAtivo.email = novoEmailAlvo;
                    try { localStorage.setItem('itaim_usuario_logado', JSON.stringify(usuarioAtivo)); } catch (e) {}
                    try { localStorage.setItem('itaim_usuario_logado_email', novoEmailAlvo); } catch (e) {}

                    if (window.ItaimSessao && typeof window.ItaimSessao.atualizarDadosUsuario === 'function') {
                        window.ItaimSessao.atualizarDadosUsuario(emailAnterior, usuarioAtivo);
                    }

                    atualizarDisplayEmail(novoEmailAlvo);
                    if (window.ItaimConfigConta && typeof window.ItaimConfigConta.atualizarCabecalhoUsuario === 'function') {
                        window.ItaimConfigConta.atualizarCabecalhoUsuario();
                    }

                    fecharModalEmail();
                    toast('E-mail alterado com sucesso! Um aviso foi enviado ao endereço anterior.');
                } catch (err) {
                    console.error('[Config] Erro ao confirmar troca de e-mail:', err);
                    const msg = err.message || 'Código de verificação incorreto.';
                    marcarErro('email-input-codigo-otp', erroCodigoOtp, msg);
                    toast(msg, true);
                } finally {
                    btnConfirmarStep3.disabled = false;
                    btnConfirmarStep3.textContent = 'Confirmar alteração';
                }
            });
        }

        // =========================================================================
        // 2. ALTERAÇÃO DE SENHA (FORMULÁRIO EXISTENTE)
        // =========================================================================
        function forcaSenha(s) {
            let pontos = 0;
            if (s.length >= 8) pontos++;
            if (s.length >= 12) pontos++;
            if (/[a-z]/.test(s) && /[A-Z]/.test(s)) pontos++;
            if (/\d/.test(s)) pontos++;
            if (/[^A-Za-z0-9]/.test(s)) pontos++;
            return pontos;
        }

        const inputSenhaNova = $('cfg-senha-nova');
        if (inputSenhaNova) {
            inputSenhaNova.addEventListener('input', (e) => {
                const s = e.target.value;
                const barra = $('forca-barra'), texto = $('forca-texto');
                if (!barra || !texto) return;

                if (!s) {
                    barra.style.width = '0';
                    texto.textContent = 'Digite uma nova senha';
                    return;
                }
                const p = forcaSenha(s);
                const niveis = [
                    { w: '20%', cor: '#DC2626', t: 'Muito fraca' },
                    { w: '20%', cor: '#DC2626', t: 'Muito fraca' },
                    { w: '40%', cor: '#F97316', t: 'Fraca' },
                    { w: '60%', cor: '#EAB308', t: 'Razoável' },
                    { w: '80%', cor: '#65A30D', t: 'Boa' },
                    { w: '100%', cor: '#44BD32', t: 'Forte' }
                ];
                const n = niveis[p] || niveis[0];
                barra.style.width = n.w;
                barra.style.background = n.cor;
                texto.textContent = 'Força: ' + n.t;
            });
        }

        const formSenha = $('form-senha');
        if (formSenha) {
            formSenha.addEventListener('submit', async (e) => {
                e.preventDefault();
                const atual = $('cfg-senha-atual') ? $('cfg-senha-atual').value : '';
                const nova = $('cfg-senha-nova') ? $('cfg-senha-nova').value : '';
                const confirma = $('cfg-senha-confirma') ? $('cfg-senha-confirma').value : '';

                const okAtual = marcarErro('cfg-senha-atual', 'erro-senha-atual', !atual ? 'Informe sua senha atual.' : '');
                let msgNova = '';
                if (nova.length < 8) {
                    msgNova = 'A nova senha precisa ter pelo menos 8 caracteres.';
                } else if (!/[A-Za-z]/.test(nova) || !/\d/.test(nova)) {
                    msgNova = 'Misture letras e números.';
                } else if (nova === atual) {
                    msgNova = 'A nova senha deve ser diferente da atual.';
                }

                const okNova = marcarErro('cfg-senha-nova', 'erro-senha-nova', msgNova);
                const okConf = marcarErro('cfg-senha-confirma', 'erro-senha-confirma', nova !== confirma ? 'As senhas não coincidem.' : '');

                if (!(okAtual && okNova && okConf)) {
                    toast('Corrija os campos destacados.', true);
                    return;
                }

                const btnSalvar = formSenha.querySelector('button[type="submit"]');
                const textoOriginal = btnSalvar ? btnSalvar.textContent : 'Atualizar senha';
                if (btnSalvar) {
                    btnSalvar.disabled = true;
                    btnSalvar.textContent = 'Salvando...';
                }

                try {
                    if (window.ItaimApi && window.ItaimApi.auth && window.ItaimApi.auth.obterToken()) {
                        await window.ItaimApi.auth.alterarSenha(atual, nova);
                    }

                    formSenha.reset();
                    const barra = $('forca-barra'), texto = $('forca-texto');
                    if (barra) barra.style.width = '0';
                    if (texto) texto.textContent = 'Digite uma nova senha';

                    document.querySelectorAll('.cfg-ver-senha').forEach(b => { b.textContent = 'Mostrar'; });
                    ['cfg-senha-atual', 'cfg-senha-nova', 'cfg-senha-confirma'].forEach(id => {
                        const el = $(id);
                        if (el) el.type = 'password';
                    });

                    toast('Senha atualizada com sucesso!');
                } catch (err) {
                    console.warn('[Configurações] Erro ao alterar senha:', err);
                    const msgErro = err.message || 'Erro ao alterar senha. Verifique os dados.';
                    if (msgErro.toLowerCase().includes('atual')) {
                        marcarErro('cfg-senha-atual', 'erro-senha-atual', msgErro);
                    }
                    toast(msgErro, true);
                } finally {
                    if (btnSalvar) {
                        btnSalvar.disabled = false;
                        btnSalvar.textContent = textoOriginal;
                    }
                }
            });
        }
    }

    window.ItaimConfigSeguranca = {
        inicializar
    };
})();
