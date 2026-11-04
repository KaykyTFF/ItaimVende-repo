/**
 * ITAIM VENDE - CONFIGURAÇÕES: DADOS DA CONTA, AVATAR E NOME DE USUÁRIO (@)
 * Arquivo: frontend/js/pages/perfil/configuracoes/config-conta.js
 */

(function () {
    'use strict';

    const RESERVED_USERNAMES = [
        'admin',
        'administrador',
        'suporte',
        'ajuda',
        'itaim',
        'itaimvende',
        'oficial',
        'moderador',
        'mod',
        'root',
        'sistema',
        'system',
        'atendimento',
        'seguranca',
        'contato',
        'api'
    ];

    const USERNAME_REGEX = /^[a-z0-9][a-z0-9._]{1,18}[a-z0-9]$/;

    function inicializar() {
        const {
            CHAVE_PERFIL,
            ler,
            $,
            soDigitos,
            toast,
            marcarErro,
            maskTelefone
        } = window.ItaimConfigUtils;

        let usuarioAtivo = (window.ItaimSessao && typeof window.ItaimSessao.obterUsuarioLogado === 'function')
            ? window.ItaimSessao.obterUsuarioLogado()
            : ler(CHAVE_PERFIL, {});

        // Campos do formulário principal de Conta (Apenas Foto, Nome e Bio)
        const inputNome = $('cfg-nome');
        const inputBio = $('cfg-bio');
        const contadorBio = $('contador-bio');
        const formConta = $('form-conta');
        const inputFotoCfg = $('cfg-input-foto');
        const btnRemoverFotoCfg = $('cfg-btn-remover-foto');
        const avatarPreviewCfg = $('cfg-avatar-preview');

        // Card de Username (@)
        const displayUsername = $('cfg-username-display');
        const boxCooldownUsername = $('box-status-cooldown-username');
        const textoCooldownUsername = $('texto-status-cooldown-username');
        const btnAbrirModalUsername = $('btn-abrir-modal-trocar-username');

        // Modal de Alteração de Username (@)
        const modalUsername = $('modal-alterar-username');
        const btnFecharModalUsername = $('btn-fechar-modal-alterar-username');
        const btnCancelarModalUsername = $('btn-cancelar-modal-alterar-username');
        const btnAvancarModalUsername = $('btn-avancar-modal-alterar-username');
        const btnVoltarModalUsername = $('btn-voltar-modal-alterar-username');
        const btnConfirmarModalUsername = $('btn-confirmar-modal-alterar-username');
        const faseEdicaoUsername = $('username-modal-fase-edicao');
        const faseConfirmacaoUsername = $('username-modal-fase-confirmacao');
        const inputNovoUsername = $('input-modal-novo-username');
        const indicadorStatus = $('status-indicador-username');
        const feedbackValidacao = $('feedback-disp-username');
        const erroModalUsername = $('erro-modal-username');
        const previewNovoUsername = $('modal-preview-novo-username');

        // Checklist de requisitos de Username
        const regraFormato = $('regra-formato');
        const regraSimbolos = $('regra-simbolos');
        const regraDisponivel = $('regra-disponivel');

        let debounceTimer = null;
        let novoUsernameValidado = '';

        // Card de WhatsApp / Celular
        const displayTelefone = $('cfg-telefone-display');
        const btnAbrirModalTelefone = $('btn-abrir-modal-trocar-telefone');
        const labelBtnTrocarTelefone = $('label-btn-trocar-telefone');
        const btnRemoverTelefone = $('btn-remover-telefone');

        // Modal de Alteração de WhatsApp / Celular
        const modalTelefone = $('modal-alterar-telefone');
        const btnFecharModalTelefone = $('btn-fechar-modal-alterar-telefone');
        const btnCancelarModalTelefone = $('btn-cancelar-modal-alterar-telefone');
        const btnAvancarModalTelefone = $('btn-avancar-modal-telefone');
        const btnVoltarModalTelefone = $('btn-voltar-modal-telefone');
        const btnConfirmarModalTelefone = $('btn-confirmar-modal-telefone');
        const faseEdicaoTelefone = $('telefone-modal-fase-edicao');
        const faseConfirmacaoTelefone = $('telefone-modal-fase-confirmacao');
        const inputNovoTelefone = $('input-modal-novo-telefone');
        const indicadorStatusTelefone = $('status-indicador-telefone');
        const erroModalTelefone = $('erro-modal-telefone');
        const previewNovoTelefone = $('modal-preview-novo-telefone');
        const regraTelefoneDdd = $('regra-telefone-ddd');
        const regraTelefoneFormato = $('regra-telefone-formato');

        // Modal de Remoção de WhatsApp (Zero window.confirm)
        const modalRemoverTelefone = $('modal-remover-telefone');
        const btnCancelarRemoverTelefone = $('btn-cancelar-remover-telefone');
        const btnConfirmarRemoverTelefone = $('btn-confirmar-remover-telefone');
        const previewRemoverTelefone = $('modal-remover-telefone-preview');

        let novoTelefoneValidado = '';

        // Preenche dados do formulário principal
        if (inputNome) inputNome.value = usuarioAtivo.nome || usuarioAtivo.name || '';
        if (inputBio) {
            inputBio.value = usuarioAtivo.bio || '';
            if (contadorBio) contadorBio.textContent = `${inputBio.value.length}/300`;
            inputBio.addEventListener('input', (e) => {
                if (contadorBio) contadorBio.textContent = `${e.target.value.length}/300`;
            });
        }

        // Renderiza cards separados de Nome de Usuário e WhatsApp
        atualizarCardUsername(usuarioAtivo);
        atualizarCardTelefone(usuarioAtivo);
        atualizarCabecalhoUsuario();

        // Busca dados mais recentes do perfil via API para garantir precisão
        if (window.ItaimApi && window.ItaimApi.auth && typeof window.ItaimApi.auth.obterPerfil === 'function' && window.ItaimApi.auth.obterToken()) {
            window.ItaimApi.auth.obterPerfil().then((res) => {
                if (res && res.user) {
                    usuarioAtivo = { ...usuarioAtivo, ...res.user };
                    atualizarCardUsername(usuarioAtivo);
                    atualizarCardTelefone(usuarioAtivo);
                    atualizarCabecalhoUsuario();
                }
            }).catch(() => {});
        }

        function atualizarCabecalhoUsuario() {
            if (window.ItaimSessao && typeof window.ItaimSessao.atualizarHeaderUsuario === 'function') {
                window.ItaimSessao.atualizarHeaderUsuario();
            }
            const dados = (window.ItaimSessao && typeof window.ItaimSessao.obterUsuarioLogado === 'function')
                ? window.ItaimSessao.obterUsuarioLogado()
                : ler(CHAVE_PERFIL, {});

            const nome = $('dropdown-user-name');
            const email = $('dropdown-user-email');
            if (nome && (dados.nome || dados.name)) nome.textContent = dados.nome || dados.name;
            if (email && dados.email) email.textContent = dados.email;

            if (avatarPreviewCfg) {
                const rawAv = dados.avatar || 'assets/icons/icon-user.png';
                const finalAv = (window.ItaimRotas && typeof window.ItaimRotas.obterAsset === 'function')
                    ? window.ItaimRotas.obterAsset(rawAv)
                    : rawAv;
                avatarPreviewCfg.src = finalAv;
            }
        }

        function atualizarCardUsername(dados) {
            const user = dados || usuarioAtivo;
            const username = (user.username || user.usuario || '').trim().replace(/^@/, '');

            if (displayUsername) {
                displayUsername.textContent = username || 'não definido';
            }

            const canChange = user.canChangeUsername !== false;

            if (boxCooldownUsername && textoCooldownUsername) {
                if (!canChange) {
                    boxCooldownUsername.classList.add('bloqueado');
                    const dias = user.daysUntilNextUsernameChange || 30;
                    let dataFmt = '';
                    if (user.nextUsernameChangeAt) {
                        try {
                            dataFmt = new Date(user.nextUsernameChangeAt).toLocaleDateString('pt-BR');
                        } catch (e) {}
                    }
                    textoCooldownUsername.innerHTML = dataFmt
                        ? `Você poderá alterar seu nome de usuário novamente em <strong>${dataFmt}</strong> (restam ${dias} ${dias === 1 ? 'dia' : 'dias'}).`
                        : `Você só pode alterar o nome de usuário uma vez a cada 30 dias (restam ${dias} dias).`;

                    if (btnAbrirModalUsername) {
                        btnAbrirModalUsername.disabled = true;
                        btnAbrirModalUsername.title = `Alteração bloqueada por 30 dias (restam ${dias} dias).`;
                        btnAbrirModalUsername.style.opacity = '0.6';
                        btnAbrirModalUsername.style.cursor = 'not-allowed';
                    }
                } else {
                    boxCooldownUsername.classList.remove('bloqueado');
                    textoCooldownUsername.textContent = 'Você pode alterar seu nome de usuário uma vez a cada 30 dias.';

                    if (btnAbrirModalUsername) {
                        btnAbrirModalUsername.disabled = false;
                        btnAbrirModalUsername.title = '';
                        btnAbrirModalUsername.style.opacity = '';
                        btnAbrirModalUsername.style.cursor = '';
                    }
                }
            }
        }

        // =========================================================================
        // 1. GERENCIAMENTO DE AVATAR (FOTO DO PERFIL)
        // =========================================================================
        if (inputFotoCfg && avatarPreviewCfg) {
            inputFotoCfg.addEventListener('change', (e) => {
                const file = e.target.files && e.target.files[0];
                if (!file) return;

                const salvarFoto = async (novaFoto) => {
                    avatarPreviewCfg.src = novaFoto;
                    let avatarFinal = novaFoto;

                    if (window.ItaimApi && window.ItaimApi.upload && window.ItaimApi.auth && window.ItaimApi.auth.obterToken()) {
                        try {
                            const resUpload = await window.ItaimApi.upload.perfil(novaFoto);
                            if (resUpload && resUpload.data && resUpload.data.url) {
                                avatarFinal = resUpload.data.url;
                            }
                            await window.ItaimApi.auth.atualizarPerfil({ avatar: avatarFinal });
                        } catch (err) {
                            console.warn('[Config] Upload de avatar falhou:', err);
                        }
                    }

                    usuarioAtivo.avatar = avatarFinal;
                    try { localStorage.setItem('itaim_usuario_logado', JSON.stringify(usuarioAtivo)); } catch (e) {}
                    atualizarCabecalhoUsuario();
                    toast('Foto de perfil atualizada!');
                };

                if (window.ItaimAjustarFoto && typeof window.ItaimAjustarFoto.abrir === 'function') {
                    window.ItaimAjustarFoto.abrir(file, salvarFoto);
                } else {
                    const reader = new FileReader();
                    reader.onload = (ev) => salvarFoto(ev.target.result);
                    reader.readAsDataURL(file);
                }
            });
        }

        if (btnRemoverFotoCfg) {
            btnRemoverFotoCfg.addEventListener('click', async () => {
                const padrao = 'assets/icons/icon-user.png';
                if (avatarPreviewCfg) avatarPreviewCfg.src = padrao;
                usuarioAtivo.avatar = padrao;

                if (window.ItaimApi && window.ItaimApi.auth && window.ItaimApi.auth.obterToken()) {
                    try {
                        await window.ItaimApi.auth.atualizarPerfil({ avatar: padrao });
                    } catch (e) {}
                }

                try { localStorage.setItem('itaim_usuario_logado', JSON.stringify(usuarioAtivo)); } catch (e) {}
                atualizarCabecalhoUsuario();
                toast('Foto de perfil removida.');
            });
        }

        // =========================================================================
        // 2. FORMULÁRIO PRINCIPAL DE CONTA (APENAS FOTO, NOME E BIOGRAFIA)
        // =========================================================================
        if (formConta) {
            formConta.addEventListener('submit', async (e) => {
                e.preventDefault();

                const nome = inputNome ? inputNome.value.trim() : '';
                const bio = inputBio ? inputBio.value.trim() : '';

                const okNome = marcarErro('cfg-nome', 'erro-nome', nome.length < 3 ? 'Informe seu nome completo (mínimo 3 letras).' : '');

                if (!okNome) {
                    toast('Corrija os campos destacados.', true);
                    return;
                }

                const btnSubmit = formConta.querySelector('button[type="submit"]');
                const textoOriginal = btnSubmit ? btnSubmit.textContent : 'Salvar alterações';
                if (btnSubmit) {
                    btnSubmit.disabled = true;
                    btnSubmit.textContent = 'Salvando...';
                }

                try {
                    const payload = {
                        name: nome,
                        bio
                    };

                    let resApi = null;
                    if (window.ItaimApi && window.ItaimApi.auth && typeof window.ItaimApi.auth.atualizarPerfil === 'function' && window.ItaimApi.auth.obterToken()) {
                        resApi = await window.ItaimApi.auth.atualizarPerfil(payload);
                    }

                    const dadosFinais = (resApi && resApi.user) ? { ...usuarioAtivo, ...resApi.user } : {
                        ...usuarioAtivo,
                        nome,
                        name: nome,
                        bio
                    };

                    usuarioAtivo = dadosFinais;
                    try { localStorage.setItem('itaim_usuario_logado', JSON.stringify(dadosFinais)); } catch (err) {}
                    if (window.ItaimSessao && typeof window.ItaimSessao.atualizarDadosUsuario === 'function') {
                        window.ItaimSessao.atualizarDadosUsuario(dadosFinais.email, dadosFinais);
                    }

                    atualizarCabecalhoUsuario();
                    toast('Dados da conta salvos com sucesso!');
                } catch (err) {
                    console.error('[Config] Erro ao salvar dados da conta:', err);
                    toast(err.message || 'Erro ao salvar alterações da conta.', true);
                } finally {
                    if (btnSubmit) {
                        btnSubmit.disabled = false;
                        btnSubmit.textContent = textoOriginal;
                    }
                }
            });
        }

        // =========================================================================
        // 3. FLUXO EXCLUSIVO DE ALTERAÇÃO DO NOME DE USUÁRIO (@) COM MODAL
        // =========================================================================
        function abrirModalUsername() {
            if (!modalUsername) return;
            if (usuarioAtivo.canChangeUsername === false) {
                toast('Você não pode alterar seu nome de usuário antes de 30 dias.', true);
                return;
            }

            // Reseta visual do modal
            if (faseEdicaoUsername) faseEdicaoUsername.style.display = '';
            if (faseConfirmacaoUsername) faseConfirmacaoUsername.style.display = 'none';
            if (inputNovoUsername) {
                inputNovoUsername.value = '';
                marcarErro('input-modal-novo-username', 'erro-modal-username', '');
            }
            if (indicadorStatus) indicadorStatus.innerHTML = '';
            if (feedbackValidacao) feedbackValidacao.innerHTML = '';
            if (btnAvancarModalUsername) btnAvancarModalUsername.disabled = true;

            resetarChecklist();
            modalUsername.classList.add('aberto');
            setTimeout(() => { if (inputNovoUsername) inputNovoUsername.focus(); }, 100);
        }

        function fecharModalUsername() {
            if (modalUsername) modalUsername.classList.remove('aberto');
            if (debounceTimer) clearTimeout(debounceTimer);
        }

        function resetarChecklist() {
            [regraFormato, regraSimbolos, regraDisponivel].forEach(el => {
                if (el) {
                    el.classList.remove('valido', 'invalido');
                    const dot = el.querySelector('.cfg-regra-dot');
                    if (dot) dot.textContent = '•';
                }
            });
        }

        function setChecklistItem(el, isValid) {
            if (!el) return;
            if (isValid === true) {
                el.classList.add('valido');
                el.classList.remove('invalido');
                const dot = el.querySelector('.cfg-regra-dot');
                if (dot) dot.textContent = '✓';
            } else if (isValid === false) {
                el.classList.add('invalido');
                el.classList.remove('valido');
                const dot = el.querySelector('.cfg-regra-dot');
                if (dot) dot.textContent = '✕';
            } else {
                el.classList.remove('valido', 'invalido');
                const dot = el.querySelector('.cfg-regra-dot');
                if (dot) dot.textContent = '•';
            }
        }

        if (btnAbrirModalUsername) {
            btnAbrirModalUsername.addEventListener('click', abrirModalUsername);
        }
        if (btnFecharModalUsername) {
            btnFecharModalUsername.addEventListener('click', fecharModalUsername);
        }
        if (btnCancelarModalUsername) {
            btnCancelarModalUsername.addEventListener('click', fecharModalUsername);
        }
        if (modalUsername) {
            modalUsername.addEventListener('click', (e) => {
                if (e.target === modalUsername) fecharModalUsername();
            });
        }

        // Validação em Tempo Real com Debounce
        if (inputNovoUsername) {
            inputNovoUsername.addEventListener('input', (e) => {
                let valor = e.target.value.toLowerCase().replace(/[@\s]/g, '');
                e.target.value = valor;

                if (debounceTimer) clearTimeout(debounceTimer);
                if (btnAvancarModalUsername) btnAvancarModalUsername.disabled = true;

                if (!valor) {
                    resetarChecklist();
                    if (indicadorStatus) indicadorStatus.innerHTML = '';
                    if (feedbackValidacao) feedbackValidacao.innerHTML = '';
                    marcarErro('input-modal-novo-username', 'erro-modal-username', '');
                    return;
                }

                // 1. Regra Formato: 3 a 20 caracteres
                const formatoValido = valor.length >= 3 && valor.length <= 20 && /^[a-z0-9._]+$/.test(valor);
                setChecklistItem(regraFormato, formatoValido);

                // 2. Regra Símbolos: não pode começar nem terminar com ponto ou underline
                const semSimbolosBordas = !/^[._]|[._]$/.test(valor);
                setChecklistItem(regraSimbolos, semSimbolosBordas && formatoValido);

                // 3. Regra Nomes Reservados
                const ehReservado = RESERVED_USERNAMES.includes(valor);

                const usernameAtualLimpo = (usuarioAtivo.username || usuarioAtivo.usuario || '').trim().toLowerCase();
                const ehMesmoAtual = valor === usernameAtualLimpo;

                if (!formatoValido || !semSimbolosBordas) {
                    setChecklistItem(regraDisponivel, null);
                    if (indicadorStatus) indicadorStatus.innerHTML = '';
                    if (feedbackValidacao) feedbackValidacao.innerHTML = '';
                    return;
                }

                if (ehReservado) {
                    setChecklistItem(regraDisponivel, false);
                    marcarErro('input-modal-novo-username', 'erro-modal-username', 'Este nome de usuário é reservado pelo sistema.');
                    if (indicadorStatus) indicadorStatus.innerHTML = '<span style="color:#DC2626; font-weight:800;">✕</span>';
                    return;
                }

                if (ehMesmoAtual) {
                    setChecklistItem(regraDisponivel, false);
                    marcarErro('input-modal-novo-username', 'erro-modal-username', 'Este já é seu nome de usuário atual.');
                    if (indicadorStatus) indicadorStatus.innerHTML = '<span style="color:#F59E0B; font-weight:800;">!</span>';
                    return;
                }

                marcarErro('input-modal-novo-username', 'erro-modal-username', '');
                if (indicadorStatus) indicadorStatus.innerHTML = '<span style="color:var(--text-secondary); font-size:11px;">checando...</span>';

                // Debounce de 350ms para chamada de API de verificação
                debounceTimer = setTimeout(async () => {
                    try {
                        let disp = true;
                        let msg = 'Nome de usuário disponível!';

                        if (window.ItaimApi && window.ItaimApi.auth && typeof window.ItaimApi.auth.verificarDisponibilidadeUsername === 'function') {
                            const res = await window.ItaimApi.auth.verificarDisponibilidadeUsername(valor);
                            disp = res.available === true;
                            msg = res.message || (disp ? 'Nome de usuário disponível!' : 'Nome de usuário indisponível.');
                        }

                        if (disp) {
                            setChecklistItem(regraDisponivel, true);
                            if (indicadorStatus) indicadorStatus.innerHTML = '<span style="color:#16A34A; font-weight:800; font-size:16px;">✓</span>';
                            if (feedbackValidacao) {
                                feedbackValidacao.innerHTML = `<span style="color:#16A34A; font-size:12px; font-weight:600;">✓ ${msg}</span>`;
                            }
                            novoUsernameValidado = valor;
                            if (btnAvancarModalUsername) btnAvancarModalUsername.disabled = false;
                        } else {
                            setChecklistItem(regraDisponivel, false);
                            if (indicadorStatus) indicadorStatus.innerHTML = '<span style="color:#DC2626; font-weight:800; font-size:16px;">✕</span>';
                            marcarErro('input-modal-novo-username', 'erro-modal-username', msg);
                            if (feedbackValidacao) feedbackValidacao.innerHTML = '';
                        }
                    } catch (err) {
                        setChecklistItem(regraDisponivel, null);
                        if (indicadorStatus) indicadorStatus.innerHTML = '';
                    }
                }, 350);
            });
        }

        // Avançar para a fase de confirmação
        if (btnAvancarModalUsername) {
            btnAvancarModalUsername.addEventListener('click', () => {
                if (!novoUsernameValidado) return;
                if (faseEdicaoUsername) faseEdicaoUsername.style.display = 'none';
                if (faseConfirmacaoUsername) faseConfirmacaoUsername.style.display = '';
                if (previewNovoUsername) previewNovoUsername.textContent = `@${novoUsernameValidado}`;
            });
        }

        // Voltar da fase de confirmação para edição
        if (btnVoltarModalUsername) {
            btnVoltarModalUsername.addEventListener('click', () => {
                if (faseConfirmacaoUsername) faseConfirmacaoUsername.style.display = 'none';
                if (faseEdicaoUsername) faseEdicaoUsername.style.display = '';
                if (inputNovoUsername) inputNovoUsername.focus();
            });
        }

        // Confirmar e salvar na API
        if (btnConfirmarModalUsername) {
            btnConfirmarModalUsername.addEventListener('click', async () => {
                if (!novoUsernameValidado) return;

                btnConfirmarModalUsername.disabled = true;
                btnConfirmarModalUsername.textContent = 'Alterando...';

                try {
                    let res = null;
                    if (window.ItaimApi && window.ItaimApi.auth && typeof window.ItaimApi.auth.alterarUsername === 'function') {
                        res = await window.ItaimApi.auth.alterarUsername(novoUsernameValidado);
                    }

                    const dadosAtualizados = (res && res.user) ? { ...usuarioAtivo, ...res.user } : {
                        ...usuarioAtivo,
                        username: novoUsernameValidado,
                        usuario: novoUsernameValidado,
                        usernameLastChangedAt: new Date().toISOString(),
                        canChangeUsername: false,
                        daysUntilNextUsernameChange: 30,
                        nextUsernameChangeAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                    };

                    usuarioAtivo = dadosAtualizados;
                    try { localStorage.setItem('itaim_usuario_logado', JSON.stringify(dadosAtualizados)); } catch (e) {}
                    if (window.ItaimSessao && typeof window.ItaimSessao.atualizarDadosUsuario === 'function') {
                        window.ItaimSessao.atualizarDadosUsuario(dadosAtualizados.email, dadosAtualizados);
                    }

                    fecharModalUsername();
                    atualizarCardUsername(dadosAtualizados);
                    atualizarCabecalhoUsuario();

                    toast('Nome de usuário alterado com sucesso! Próxima alteração disponível em 30 dias.');
                } catch (err) {
                    console.error('[Config] Erro ao alterar username:', err);
                    const msg = err.message || 'Erro ao alterar nome de usuário.';
                    toast(msg, true);
                    if (faseConfirmacaoUsername) faseConfirmacaoUsername.style.display = 'none';
                    if (faseEdicaoUsername) faseEdicaoUsername.style.display = '';
                    marcarErro('input-modal-novo-username', 'erro-modal-username', msg);
                } finally {
                    btnConfirmarModalUsername.disabled = false;
                    btnConfirmarModalUsername.textContent = 'Sim, alterar @';
                }
            });
        }

        // =========================================================================
        // 4. FLUXO EXCLUSIVO DE ALTERAÇÃO / REMOÇÃO DE WHATSAPP COM MODAL
        // =========================================================================
        function formatarTelefoneVisual(val) {
            const dig = soDigitos(val).slice(0, 11);
            if (!dig) return '';
            if (dig.length <= 2) return `(${dig}`;
            if (dig.length <= 6) return `(${dig.slice(0, 2)}) ${dig.slice(2)}`;
            if (dig.length <= 10) return `(${dig.slice(0, 2)}) ${dig.slice(2, 6)}-${dig.slice(6)}`;
            return `(${dig.slice(0, 2)}) ${dig.slice(2, 7)}-${dig.slice(7, 11)}`;
        }

        function atualizarCardTelefone(user) {
            const telBruto = user.telefone || user.phone || '';
            const digitos = soDigitos(telBruto);
            const temTel = digitos.length >= 10;
            const formatado = temTel ? formatarTelefoneVisual(digitos) : '';

            if (displayTelefone) {
                if (temTel) {
                    displayTelefone.textContent = formatado;
                    displayTelefone.classList.remove('vazio');
                } else {
                    displayTelefone.textContent = 'Nenhum WhatsApp cadastrado';
                    displayTelefone.classList.add('vazio');
                }
            }

            if (btnRemoverTelefone) {
                btnRemoverTelefone.style.display = temTel ? 'inline-flex' : 'none';
            }

            if (labelBtnTrocarTelefone) {
                labelBtnTrocarTelefone.textContent = temTel ? 'Alterar WhatsApp' : 'Cadastrar WhatsApp';
            }
        }

        function setChecklistTelefone(el, isValid) {
            if (!el) return;
            const dot = el.querySelector('.cfg-regra-dot');
            if (isValid === true) {
                el.classList.add('valido');
                el.classList.remove('invalido');
                if (dot) dot.textContent = '✓';
            } else if (isValid === false) {
                el.classList.add('invalido');
                el.classList.remove('valido');
                if (dot) dot.textContent = '✕';
            } else {
                el.classList.remove('valido', 'invalido');
                if (dot) dot.textContent = '○';
            }
        }

        function resetarChecklistTelefone() {
            setChecklistTelefone(regraTelefoneDdd, null);
            setChecklistTelefone(regraTelefoneFormato, null);
        }

        function abrirModalTelefone() {
            if (!modalTelefone) return;

            novoTelefoneValidado = '';
            if (inputNovoTelefone) {
                const telAtual = usuarioAtivo.telefone || usuarioAtivo.phone || '';
                const digAtual = soDigitos(telAtual);
                inputNovoTelefone.value = digAtual ? formatarTelefoneVisual(digAtual) : '';
                inputNovoTelefone.classList.remove('invalido');
            }
            if (erroModalTelefone) erroModalTelefone.textContent = '';
            if (indicadorStatusTelefone) indicadorStatusTelefone.innerHTML = '';
            if (btnAvancarModalTelefone) btnAvancarModalTelefone.disabled = true;

            resetarChecklistTelefone();

            if (faseEdicaoTelefone) faseEdicaoTelefone.style.display = '';
            if (faseConfirmacaoTelefone) faseConfirmacaoTelefone.style.display = 'none';

            modalTelefone.classList.add('aberto');
            setTimeout(() => {
                if (inputNovoTelefone) {
                    inputNovoTelefone.focus();
                    if (inputNovoTelefone.value) {
                        inputNovoTelefone.dispatchEvent(new Event('input'));
                    }
                }
            }, 100);
        }

        function fecharModalTelefone() {
            if (modalTelefone) modalTelefone.classList.remove('aberto');
        }

        // Eventos de Abertura / Fechamento do Modal de Telefone
        if (btnAbrirModalTelefone) {
            btnAbrirModalTelefone.addEventListener('click', abrirModalTelefone);
        }
        if (btnFecharModalTelefone) {
            btnFecharModalTelefone.addEventListener('click', fecharModalTelefone);
        }
        if (btnCancelarModalTelefone) {
            btnCancelarModalTelefone.addEventListener('click', fecharModalTelefone);
        }
        if (modalTelefone) {
            modalTelefone.addEventListener('click', (e) => {
                if (e.target === modalTelefone) fecharModalTelefone();
            });
        }

        // Validação e máscara em tempo real
        if (inputNovoTelefone) {
            inputNovoTelefone.addEventListener('input', (e) => {
                const formatado = formatarTelefoneVisual(e.target.value);
                e.target.value = formatado;

                const dig = soDigitos(formatado);
                if (erroModalTelefone) erroModalTelefone.textContent = '';
                inputNovoTelefone.classList.remove('invalido');

                if (dig.length === 0) {
                    resetarChecklistTelefone();
                    if (indicadorStatusTelefone) indicadorStatusTelefone.innerHTML = '';
                    if (btnAvancarModalTelefone) btnAvancarModalTelefone.disabled = true;
                    novoTelefoneValidado = '';
                    return;
                }

                // DDD: de 11 a 99
                const dddNum = dig.length >= 2 ? parseInt(dig.slice(0, 2), 10) : 0;
                const dddValido = dig.length >= 2 && dddNum >= 11 && dddNum <= 99;

                if (dig.length < 2) {
                    setChecklistTelefone(regraTelefoneDdd, null);
                } else {
                    setChecklistTelefone(regraTelefoneDdd, dddValido);
                }

                // Celular com 9 dígitos iniciando em 9
                let formatoValido = false;
                if (dig.length < 3) {
                    setChecklistTelefone(regraTelefoneFormato, null);
                } else if (dig.length < 11) {
                    const comecaComNove = dig[2] === '9';
                    setChecklistTelefone(regraTelefoneFormato, comecaComNove ? null : false);
                } else {
                    formatoValido = dig.length === 11 && dig[2] === '9';
                    setChecklistTelefone(regraTelefoneFormato, formatoValido);
                }

                const tudoValido = dddValido && formatoValido;

                if (tudoValido) {
                    novoTelefoneValidado = dig;
                    if (indicadorStatusTelefone) {
                        indicadorStatusTelefone.innerHTML = '<span style="color:#16A34A; font-weight:800; font-size:16px;">✓</span>';
                    }
                    if (btnAvancarModalTelefone) btnAvancarModalTelefone.disabled = false;
                } else {
                    novoTelefoneValidado = '';
                    if (btnAvancarModalTelefone) btnAvancarModalTelefone.disabled = true;
                    if (dig.length === 11 && !dddValido) {
                        if (indicadorStatusTelefone) indicadorStatusTelefone.innerHTML = '<span style="color:#DC2626; font-weight:800; font-size:16px;">✕</span>';
                        marcarErro('input-modal-novo-telefone', 'erro-modal-telefone', 'DDD inválido. Digite um DDD entre 11 e 99.');
                    } else if (dig.length === 11 && dig[2] !== '9') {
                        if (indicadorStatusTelefone) indicadorStatusTelefone.innerHTML = '<span style="color:#DC2626; font-weight:800; font-size:16px;">✕</span>';
                        marcarErro('input-modal-novo-telefone', 'erro-modal-telefone', 'Celular inválido. O número precisa começar com 9.');
                    } else {
                        if (indicadorStatusTelefone) indicadorStatusTelefone.innerHTML = '';
                    }
                }
            });
        }

        // Avançar para a fase de confirmação do telefone
        if (btnAvancarModalTelefone) {
            btnAvancarModalTelefone.addEventListener('click', () => {
                if (!novoTelefoneValidado) return;
                if (faseEdicaoTelefone) faseEdicaoTelefone.style.display = 'none';
                if (faseConfirmacaoTelefone) faseConfirmacaoTelefone.style.display = '';
                if (previewNovoTelefone) previewNovoTelefone.textContent = formatarTelefoneVisual(novoTelefoneValidado);
            });
        }

        // Voltar da fase de confirmação para edição
        if (btnVoltarModalTelefone) {
            btnVoltarModalTelefone.addEventListener('click', () => {
                if (faseConfirmacaoTelefone) faseConfirmacaoTelefone.style.display = 'none';
                if (faseEdicaoTelefone) faseEdicaoTelefone.style.display = '';
                if (inputNovoTelefone) inputNovoTelefone.focus();
            });
        }

        // Confirmar e salvar WhatsApp na API
        if (btnConfirmarModalTelefone) {
            btnConfirmarModalTelefone.addEventListener('click', async () => {
                if (!novoTelefoneValidado) return;

                btnConfirmarModalTelefone.disabled = true;
                btnConfirmarModalTelefone.textContent = 'Salvando...';

                try {
                    let res = null;
                    if (window.ItaimApi && window.ItaimApi.auth && typeof window.ItaimApi.auth.alterarTelefone === 'function') {
                        res = await window.ItaimApi.auth.alterarTelefone(novoTelefoneValidado);
                    }

                    const dadosAtualizados = (res && res.user) ? { ...usuarioAtivo, ...res.user } : {
                        ...usuarioAtivo,
                        telefone: novoTelefoneValidado,
                        phone: novoTelefoneValidado
                    };

                    usuarioAtivo = dadosAtualizados;
                    try { localStorage.setItem('itaim_usuario_logado', JSON.stringify(dadosAtualizados)); } catch (e) {}
                    if (window.ItaimSessao && typeof window.ItaimSessao.atualizarDadosUsuario === 'function') {
                        window.ItaimSessao.atualizarDadosUsuario(dadosAtualizados.email, dadosAtualizados);
                    }

                    fecharModalTelefone();
                    atualizarCardTelefone(dadosAtualizados);

                    toast('WhatsApp atualizado com sucesso!');
                } catch (err) {
                    console.error('[Config] Erro ao alterar telefone:', err);
                    const msg = err.message || 'Erro ao salvar número de WhatsApp.';
                    toast(msg, true);
                    if (faseConfirmacaoTelefone) faseConfirmacaoTelefone.style.display = 'none';
                    if (faseEdicaoTelefone) faseEdicaoTelefone.style.display = '';
                    marcarErro('input-modal-novo-telefone', 'erro-modal-telefone', msg);
                } finally {
                    btnConfirmarModalTelefone.disabled = false;
                    btnConfirmarModalTelefone.textContent = 'Confirmar e salvar';
                }
            });
        }

        // Remoção de WhatsApp (Modal Customizado no Design System - ZERO window.confirm)
        if (btnRemoverTelefone) {
            btnRemoverTelefone.addEventListener('click', () => {
                if (!modalRemoverTelefone) return;
                const telAtual = usuarioAtivo.telefone || usuarioAtivo.phone || '';
                if (previewRemoverTelefone) {
                    previewRemoverTelefone.textContent = telAtual ? formatarTelefoneVisual(telAtual) : 'atual';
                }
                modalRemoverTelefone.classList.add('aberto');
            });
        }

        function fecharModalRemoverTelefone() {
            if (modalRemoverTelefone) modalRemoverTelefone.classList.remove('aberto');
        }

        if (btnCancelarRemoverTelefone) {
            btnCancelarRemoverTelefone.addEventListener('click', fecharModalRemoverTelefone);
        }
        if (modalRemoverTelefone) {
            modalRemoverTelefone.addEventListener('click', (e) => {
                if (e.target === modalRemoverTelefone) fecharModalRemoverTelefone();
            });
        }

        if (btnConfirmarRemoverTelefone) {
            btnConfirmarRemoverTelefone.addEventListener('click', async () => {
                btnConfirmarRemoverTelefone.disabled = true;
                btnConfirmarRemoverTelefone.textContent = 'Removendo...';

                try {
                    let res = null;
                    if (window.ItaimApi && window.ItaimApi.auth && typeof window.ItaimApi.auth.alterarTelefone === 'function') {
                        res = await window.ItaimApi.auth.alterarTelefone(null);
                    }

                    const dadosAtualizados = (res && res.user) ? { ...usuarioAtivo, ...res.user } : {
                        ...usuarioAtivo,
                        telefone: null,
                        phone: null
                    };

                    usuarioAtivo = dadosAtualizados;
                    try { localStorage.setItem('itaim_usuario_logado', JSON.stringify(dadosAtualizados)); } catch (e) {}
                    if (window.ItaimSessao && typeof window.ItaimSessao.atualizarDadosUsuario === 'function') {
                        window.ItaimSessao.atualizarDadosUsuario(dadosAtualizados.email, dadosAtualizados);
                    }

                    fecharModalRemoverTelefone();
                    atualizarCardTelefone(dadosAtualizados);

                    toast('WhatsApp removido com sucesso.');
                } catch (err) {
                    console.error('[Config] Erro ao remover WhatsApp:', err);
                    toast(err.message || 'Erro ao remover número de WhatsApp.', true);
                } finally {
                    btnConfirmarRemoverTelefone.disabled = false;
                    btnConfirmarRemoverTelefone.textContent = 'Sim, remover WhatsApp';
                }
            });
        }

        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                fecharModalUsername();
                fecharModalTelefone();
                fecharModalRemoverTelefone();
            }
        });

        window.ItaimConfigConta.atualizarCabecalhoUsuario = atualizarCabecalhoUsuario;
    }

    window.ItaimConfigConta = {
        inicializar,
        atualizarCabecalhoUsuario: null
    };
})();
