/**
 * ITAIM VENDE - CONFIGURAÇÕES: DADOS DA CONTA E AVATAR
 * Arquivo: frontend/js/pages/perfil/configuracoes/config-conta.js
 */

(function () {
    'use strict';

    function inicializar() {
        const {
            CHAVE_PERFIL,
            ler,
            gravar,
            $,
            soDigitos,
            toast,
            marcarErro,
            maskTelefone,
            emailValido
        } = window.ItaimConfigUtils;

        const usuarioAtivo = (window.ItaimSessao && typeof window.ItaimSessao.obterUsuarioLogado === 'function')
            ? window.ItaimSessao.obterUsuarioLogado()
            : ler(CHAVE_PERFIL, {});

        let emailOriginal = usuarioAtivo.email || '';
        if (!emailOriginal) {
            try {
                emailOriginal = localStorage.getItem('itaim_ultimo_email') || '';
            } catch (e) {}
        }

        const inputNome = $('cfg-nome');
        const inputUsuario = $('cfg-usuario');
        const containerStatusUsuario = $('cfg-usuario-status');
        const badgeUsuario = $('cfg-usuario-badge');
        let usernameOriginal = (usuarioAtivo.username || usuarioAtivo.usuario || '').trim().toLowerCase();
        let usernameStatusData = null;
        const inputEmail = $('cfg-email');
        const inputTelefone = $('cfg-telefone');
        const inputBairro = $('cfg-bairro');
        const selectCidade = $('cfg-cidade');
        const inputFotoCfg = $('cfg-input-foto');
        const btnRemoverFotoCfg = $('cfg-btn-remover-foto');
        const avatarPreviewCfg = $('cfg-avatar-preview');
        const inputBio = $('cfg-bio');
        const contadorBio = $('contador-bio');
        const formConta = $('form-conta');

        if (inputNome) inputNome.value = usuarioAtivo.nome || usuarioAtivo.name || '';
        if (inputUsuario) inputUsuario.value = usuarioAtivo.username || usuarioAtivo.usuario || '';
        aplicarStatusUsername(usuarioAtivo);
        if (inputEmail) inputEmail.value = usuarioAtivo.email || emailOriginal;
        if (inputTelefone) inputTelefone.value = maskTelefone(usuarioAtivo.telefone || usuarioAtivo.phone || '');
        if (inputBairro) inputBairro.value = usuarioAtivo.bairro || usuarioAtivo.neighborhood || 'Centro';
        if (inputBio) {
            inputBio.value = usuarioAtivo.bio || '';
            if (contadorBio) contadorBio.textContent = `${inputBio.value.length}/300`;
            inputBio.addEventListener('input', (e) => {
                if (contadorBio) contadorBio.textContent = `${e.target.value.length}/300`;
            });
        }

        if (usuarioAtivo.cidade || usuarioAtivo.city) {
            const cid = usuarioAtivo.cidade || usuarioAtivo.city;
            if (selectCidade) {
                const existe = Array.from(selectCidade.options).some(o => o.value.toLowerCase() === cid.toLowerCase());
                if (!existe) {
                    const opt = document.createElement('option');
                    opt.value = cid;
                    opt.textContent = cid;
                    selectCidade.appendChild(opt);
                }
                selectCidade.value = cid;
            }
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
        atualizarCabecalhoUsuario();

        // Upload de foto do perfil
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
                            console.warn('[Configurações] Upload de imagem falhou, mantendo em cache:', err);
                        }
                    }

                    if (window.ItaimSessao && typeof window.ItaimSessao.atualizarDadosUsuario === 'function') {
                        window.ItaimSessao.atualizarDadosUsuario(emailOriginal, { avatar: avatarFinal });
                    }

                    const perfilAtual = ler(CHAVE_PERFIL, {});
                    perfilAtual.avatar = avatarFinal;
                    gravar(CHAVE_PERFIL, perfilAtual);

                    atualizarCabecalhoUsuario();
                    toast('Foto de perfil atualizada com sucesso!');
                };

                if (window.ItaimFoto && typeof window.ItaimFoto.ajustarPerfil === 'function') {
                    window.ItaimFoto.ajustarPerfil(file, salvarFoto);
                } else if (window.ItaimFoto && typeof window.ItaimFoto.ajustar === 'function') {
                    window.ItaimFoto.ajustar(file, 400, salvarFoto);
                } else {
                    const reader = new FileReader();
                    reader.onload = (evt) => salvarFoto(evt.target.result);
                    reader.readAsDataURL(file);
                }
            });
        }

        // Remover foto do perfil
        if (btnRemoverFotoCfg) {
            btnRemoverFotoCfg.addEventListener('click', async () => {
                const avatarPadrao = 'assets/icons/icon-user.png';
                if (avatarPreviewCfg) {
                    avatarPreviewCfg.src = window.ItaimRotas ? window.ItaimRotas.obterAsset(avatarPadrao) : '../../assets/icons/icon-user.png';
                }

                if (window.ItaimApi && window.ItaimApi.auth && typeof window.ItaimApi.auth.atualizarPerfil === 'function' && window.ItaimApi.auth.obterToken()) {
                    await window.ItaimApi.auth.atualizarPerfil({ avatar: avatarPadrao }).catch(() => {});
                }

                if (window.ItaimSessao && typeof window.ItaimSessao.atualizarDadosUsuario === 'function') {
                    window.ItaimSessao.atualizarDadosUsuario(emailOriginal, { avatar: avatarPadrao });
                }

                const perfilAtual = ler(CHAVE_PERFIL, {});
                perfilAtual.avatar = avatarPadrao;
                gravar(CHAVE_PERFIL, perfilAtual);

                atualizarCabecalhoUsuario();
                toast('Foto de perfil removida.');
            });
        }

        // Formatação de entradas
        if (inputTelefone) {
            inputTelefone.addEventListener('input', (e) => {
                e.target.value = maskTelefone(e.target.value);
            });
        }
        let timeoutValidacaoUsername = null;
        if (inputUsuario) {
            inputUsuario.addEventListener('input', (e) => {
                const val = e.target.value.replace(/\s+/g, '').toLowerCase();
                e.target.value = val;

                if (timeoutValidacaoUsername) clearTimeout(timeoutValidacaoUsername);

                // Se o campo for idêntico ao username atual do usuário, restaura status padrão
                if (val === usernameOriginal) {
                    marcarErro('cfg-usuario', 'erro-usuario', '');
                    aplicarStatusUsername(usernameStatusData || usuarioAtivo);
                    return;
                }

                // Validação de formato em tempo real
                if (val.length > 0 && !/^[a-z0-9._]{3,30}$/.test(val)) {
                    marcarErro('cfg-usuario', 'erro-usuario', 'Use de 3 a 30 caracteres (letras minúsculas, números, ponto ou sublinhado).');
                    return;
                }

                marcarErro('cfg-usuario', 'erro-usuario', '');

                if (val.length < 3) return;

                // Debounce para checagem assíncrona na API
                timeoutValidacaoUsername = setTimeout(async () => {
                    if (window.ItaimApi && window.ItaimApi.auth && typeof window.ItaimApi.auth.verificarDisponibilidadeUsername === 'function') {
                        try {
                            const res = await window.ItaimApi.auth.verificarDisponibilidadeUsername(val);
                            if (res) {
                                if (res.cooldownActive) {
                                    marcarErro('cfg-usuario', 'erro-usuario', res.message);
                                } else if (!res.available && !res.isCurrent) {
                                    marcarErro('cfg-usuario', 'erro-usuario', 'Este nome de usuário já está em uso por outra conta.');
                                } else if (res.available) {
                                    marcarErro('cfg-usuario', 'erro-usuario', '');
                                    if (containerStatusUsuario) {
                                        containerStatusUsuario.innerHTML = `
                                            <div style="display: flex; align-items: center; gap: 6px; color: #16A34A; font-size: 12px; font-weight: 600; margin-top: 4px;">
                                                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                <span>@${val} está disponível! (Atenção: só poderá ser alterado novamente após 30 dias)</span>
                                            </div>
                                        `;
                                    }
                                }
                            }
                        } catch (errCheck) {
                            console.warn('[Config] Erro ao validar disponibilidade de username:', errCheck);
                        }
                    }
                }, 400);
            });
        }

        
        function formatarDataBR(isoOuDate) {
            if (!isoOuDate) return '';
            const d = new Date(isoOuDate);
            if (isNaN(d.getTime())) return '';
            return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
        }

        function aplicarStatusUsername(dados) {
            if (!containerStatusUsuario) return;
            usernameStatusData = dados;

            const now = new Date();
            let canChange = dados.canChangeUsername !== undefined ? dados.canChangeUsername : true;
            let lastChangedAt = dados.usernameLastChangedAt || null;
            let nextDate = dados.nextUsernameChangeAt ? new Date(dados.nextUsernameChangeAt) : null;
            let diasRestantes = dados.daysUntilNextUsernameChange || 0;

            if (lastChangedAt) {
                const COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000;
                const elapsedMs = now.getTime() - new Date(lastChangedAt).getTime();
                if (elapsedMs < COOLDOWN_MS) {
                    canChange = false;
                    if (!nextDate) nextDate = new Date(new Date(lastChangedAt).getTime() + COOLDOWN_MS);
                    if (!diasRestantes) {
                        diasRestantes = Math.max(1, Math.ceil((nextDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)));
                    }
                }
            }

            if (!canChange && nextDate) {
                if (inputUsuario) {
                    inputUsuario.disabled = true;
                    inputUsuario.style.cursor = 'not-allowed';
                    inputUsuario.style.backgroundColor = '#F8FAFC';
                    inputUsuario.style.color = '#64748B';
                    inputUsuario.style.borderColor = '#E2E8F0';
                    inputUsuario.title = 'A alteração do nome de usuário só é permitida uma vez a cada 30 dias.';
                }
                if (badgeUsuario) {
                    badgeUsuario.style.display = 'inline-block';
                    badgeUsuario.style.color = '#B45309';
                    badgeUsuario.textContent = 'Bloqueado (regra de 30 dias)';
                }
                const dataFmt = formatarDataBR(nextDate);
                containerStatusUsuario.innerHTML = `
                    <div style="display: flex; align-items: flex-start; gap: 8px; color: #92400E; background: #FEF3C7; border: 1px solid #FCD34D; padding: 10px 14px; border-radius: 10px; font-weight: 500; font-size: 12.5px; margin-top: 4px;">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0; margin-top: 1px;">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        <div>
                            Você poderá alterar seu nome de usuário novamente em <strong>${dataFmt}</strong> (restam ${diasRestantes} ${diasRestantes === 1 ? 'dia' : 'dias'}).
                        </div>
                    </div>
                `;
            } else {
                if (inputUsuario) {
                    inputUsuario.disabled = false;
                    inputUsuario.style.cursor = '';
                    inputUsuario.style.backgroundColor = '';
                    inputUsuario.style.color = '';
                    inputUsuario.style.borderColor = '';
                    inputUsuario.title = '';
                }
                if (badgeUsuario) {
                    badgeUsuario.style.display = 'none';
                }
                containerStatusUsuario.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 6px; color: var(--text-secondary, #64748B); font-size: 12px; margin-top: 4px;">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="16" x2="12" y2="12"></line>
                            <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                        <span>Você pode alterar seu nome de usuário uma vez a cada 30 dias.</span>
                    </div>
                `;
            }
        }

        function sincronizarCamposConta(dados) {
            if (!dados) return;
            usernameOriginal = (dados.username || dados.usuario || '').trim().toLowerCase();
            if (inputNome && (dados.name || dados.nome)) inputNome.value = dados.name || dados.nome;
            if (inputUsuario && (dados.username || dados.usuario)) inputUsuario.value = dados.username || dados.usuario;
            aplicarStatusUsername(dados);
            if (inputEmail && dados.email) inputEmail.value = dados.email;
            if (inputTelefone && (dados.phone || dados.telefone)) inputTelefone.value = maskTelefone(dados.phone || dados.telefone);
            if (inputBairro && (dados.neighborhood || dados.bairro)) inputBairro.value = dados.neighborhood || dados.bairro;
            if (inputBio && dados.bio !== undefined) {
                inputBio.value = dados.bio || '';
                if (contadorBio) contadorBio.textContent = `${inputBio.value.length}/300`;
            }
            if (dados.avatar && avatarPreviewCfg) {
                avatarPreviewCfg.src = window.ItaimRotas ? window.ItaimRotas.obterAsset(dados.avatar) : dados.avatar;
            }
            const cid = dados.city || dados.cidade;
            if (cid && selectCidade) {
                const existe = Array.from(selectCidade.options).some(o => o.value.toLowerCase() === cid.toLowerCase());
                if (!existe) {
                    const opt = document.createElement('option');
                    opt.value = cid;
                    opt.textContent = cid;
                    selectCidade.appendChild(opt);
                }
                selectCidade.value = cid;
            }
        }

        if (window.ItaimApi && window.ItaimApi.auth && typeof window.ItaimApi.auth.perfil === 'function' && window.ItaimApi.auth.obterToken()) {
            window.ItaimApi.auth.perfil().then(res => {
                if (res && res.success && res.user) {
                    sincronizarCamposConta(res.user);
                }
            }).catch(() => {});
        }

        // Submissão do formulário de dados da conta
        if (formConta) {
            formConta.addEventListener('submit', async (e) => {
                e.preventDefault();
                const nome = inputNome ? inputNome.value.trim() : '';
                const usuario = inputUsuario ? inputUsuario.value.trim().toLowerCase() : '';
                const email = inputEmail ? inputEmail.value.trim() : '';
                const telefone = inputTelefone ? inputTelefone.value.trim() : '';
                const bio = inputBio ? inputBio.value.trim() : '';

                const okNome = marcarErro('cfg-nome', 'erro-nome', nome.length < 3 ? 'Informe seu nome completo.' : '');
                const okUser = marcarErro('cfg-usuario', 'erro-usuario',
                    usuario && !/^[a-z0-9._]{3,30}$/.test(usuario) ? 'Use de 3 a 30 letras minúsculas, números, ponto ou sublinhado.' : '');
                const okEmail = marcarErro('cfg-email', 'erro-email', !emailValido(email) ? 'Informe um e-mail válido.' : '');
                const dig = soDigitos(telefone).length;
                const okTel = marcarErro('cfg-telefone', 'erro-telefone',
                    telefone && dig !== 10 && dig !== 11 ? 'Informe o DDD e o número completo.' : '');

                if (!(okNome && okUser && okEmail && okTel)) {
                    toast('Corrija os campos destacados.', true);
                    return;
                }

                // Se o usuário está tentando alterar o @, verifica confirmação e cooldown
                const houveAlteracaoUsername = Boolean(usuario && usuario !== usernameOriginal);
                if (houveAlteracaoUsername) {
                    if (usernameStatusData && usernameStatusData.canChangeUsername === false) {
                        toast('Você não pode alterar seu nome de usuário antes de 30 dias.', true);
                        return;
                    }

                    const confirmou = window.confirm(
                        `Atenção: Ao alterar seu nome de usuário para @${usuario}, você só poderá alterá-lo novamente após 30 dias.\n\nDeseja realmente confirmar esta alteração?`
                    );
                    if (!confirmou) {
                        return;
                    }
                }

                const userAtual = (window.ItaimSessao && typeof window.ItaimSessao.obterUsuarioLogado === 'function')
                    ? window.ItaimSessao.obterUsuarioLogado()
                    : ler(CHAVE_PERFIL, {});
                const avatarAtual = userAtual.avatar || 'assets/icons/icon-user.png';
                const cidadeAtual = userAtual.city || userAtual.cidade || 'Paulistana';
                const bairroAtual = userAtual.neighborhood || userAtual.bairro || 'Centro';

                const btnSubmit = formConta.querySelector('button[type="submit"]');
                if (btnSubmit) {
                    btnSubmit.disabled = true;
                    btnSubmit.textContent = 'Salvando...';
                }

                try {
                    let resApi = null;
                    if (window.ItaimApi && window.ItaimApi.auth && typeof window.ItaimApi.auth.atualizarPerfil === 'function' && window.ItaimApi.auth.obterToken()) {
                        resApi = await window.ItaimApi.auth.atualizarPerfil({
                            name: nome,
                            username: usuario,
                            phone: telefone.replace(/\D/g, ''),
                            bio,
                            avatar: avatarAtual
                        });
                    }

                    const dadosFinais = (resApi && resApi.user) ? resApi.user : {
                        ...userAtual,
                        nome,
                        name: nome,
                        username: usuario,
                        usuario: usuario,
                        email,
                        telefone,
                        bairro: bairroAtual,
                        neighborhood: bairroAtual,
                        cidade: cidadeAtual,
                        city: cidadeAtual,
                        bio,
                        avatar: avatarAtual,
                        ...(houveAlteracaoUsername ? {
                            usernameLastChangedAt: new Date().toISOString(),
                            canChangeUsername: false,
                            daysUntilNextUsernameChange: 30,
                            nextUsernameChangeAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                        } : {})
                    };

                    if (window.ItaimSessao && typeof window.ItaimSessao.atualizarDadosUsuario === 'function') {
                        window.ItaimSessao.atualizarDadosUsuario(emailOriginal, dadosFinais);
                    }

                    emailOriginal = email;
                    try { localStorage.setItem('itaim_usuario_logado', JSON.stringify(dadosFinais)); } catch (err) {}
                    try { localStorage.setItem('itaim_usuario_logado_email', email); } catch (err) {}

                    usernameOriginal = (dadosFinais.username || dadosFinais.usuario || usuario).toLowerCase();
                    aplicarStatusUsername(dadosFinais);
                    atualizarCabecalhoUsuario();

                    if (houveAlteracaoUsername) {
                        toast('Nome de usuário alterado com sucesso! Próxima alteração disponível em 30 dias.');
                    } else {
                        toast('Dados da conta salvos com sucesso!');
                    }
                } catch (err) {
                    console.error('[Config] Erro ao atualizar perfil:', err);
                    if (err.status === 403 || err.data?.code === 'USERNAME_COOLDOWN_ACTIVE') {
                        marcarErro('cfg-usuario', 'erro-usuario', err.message);
                        if (err.data?.details) {
                            aplicarStatusUsername({ canChangeUsername: false, ...err.data.details });
                        }
                        toast(err.message || 'Alteração do nome de usuário bloqueada pelo período de 30 dias.', true);
                    } else if (err.status === 409 || err.data?.code === 'USERNAME_TAKEN') {
                        marcarErro('cfg-usuario', 'erro-usuario', 'Este nome de usuário já está em uso por outra conta.');
                        toast('Este nome de usuário já está em uso por outra conta.', true);
                    } else {
                        toast(err.message || 'Erro ao salvar alterações da conta.', true);
                    }
                } finally {
                    if (btnSubmit) {
                        btnSubmit.disabled = false;
                        btnSubmit.textContent = 'Salvar alterações';
                    }
                }
            });
        }

        window.ItaimConfigConta.atualizarCabecalhoUsuario = atualizarCabecalhoUsuario;
    }

    window.ItaimConfigConta = {
        inicializar,
        atualizarCabecalhoUsuario: null
    };
})();
