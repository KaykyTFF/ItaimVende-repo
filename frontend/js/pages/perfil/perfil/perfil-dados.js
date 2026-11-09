/**
 * ITAIM VENDE - PERFIL: CARREGAMENTO DE DADOS E BANNER
 * Arquivo: frontend/js/pages/perfil/perfil/perfil-dados.js
 */

(function () {
    'use strict';

    let perfilExibido = null;

    async function inicializar() {
        const {
            paramEmail,
            paramNome,
            paramId,
            isPerfilProprio,
            fallbackAvatarPerfil,
            formatarTelefoneBR
        } = window.ItaimPerfilUtils;

        const nomeDisplay = document.getElementById('perfil-nome-display');
        const cidadeDisplay = document.getElementById('perfil-cidade-display');
        const dataDisplay = document.getElementById('perfil-data-display');
        const avatarImgView = document.getElementById('perfil-avatar-view');
        const btnCameraAvatar = document.querySelector('.btn-avatar-camera');
        const breadcrumbCurrent = document.querySelector('.perfil-breadcrumb-current');
        const boxContatoExterno = document.getElementById('box-contato-vendedor-externo');
        const btnWppExterno = document.getElementById('btn-whatsapp-perfil');
        const boxFormAvaliacao = document.getElementById('perfil-box-form-avaliacao');
        const alertaNaoLogado = document.getElementById('perfil-alerta-nao-logado');
        const userDisplayEl = document.getElementById('perfil-username-display');
        const bioDisplayEl = document.getElementById('perfil-bio-display');
        const btnAbrirModalPerfil = document.getElementById('btn-abrir-modal-editar-perfil');
        const modalPerfil = document.getElementById('modal-editar-perfil');
        const btnFecharModalPerfil = document.getElementById('btn-fechar-modal-editar-perfil');
        const btnCancelarModalPerfil = document.getElementById('btn-cancelar-modal-editar-perfil');
        const formModalPerfil = document.getElementById('form-modal-editar-perfil');
        const modalAvatarPreview = document.getElementById('modal-perfil-avatar-preview');
        const modalInputFoto = document.getElementById('modal-input-foto-perfil');
        const modalBtnRemoverFoto = document.getElementById('modal-btn-remover-foto-perfil');
        const modalInputNome = document.getElementById('modal-input-nome-perfil');
        const modalErroNome = document.getElementById('modal-erro-nome-perfil');
        const modalTextareaBio = document.getElementById('modal-textarea-bio-perfil');
        const modalContadorBio = document.getElementById('modal-contador-bio-perfil');
        const btnSalvarModalPerfil = document.getElementById('btn-salvar-modal-editar-perfil');

        const token = window.ItaimApi?.auth?.obterToken();

        if (isPerfilProprio) {
            if (alertaNaoLogado) alertaNaoLogado.style.display = 'none';
            if (btnCameraAvatar) btnCameraAvatar.style.display = 'flex';
            if (btnAbrirModalPerfil) btnAbrirModalPerfil.style.display = 'inline-flex';
            if (boxContatoExterno) boxContatoExterno.style.display = 'none';
            if (boxFormAvaliacao) boxFormAvaliacao.style.display = 'none';

            if (token && window.ItaimApi && window.ItaimApi.auth) {
                try {
                    const res = await window.ItaimApi.auth.perfil();
                    if (res && res.user) {
                        perfilExibido = res.user;
                        localStorage.setItem('itaim_usuario_logado', JSON.stringify(res.user));
                        localStorage.setItem('itaim_usuario_logado_email', res.user.email);
                        if (window.ItaimSessao && typeof window.ItaimSessao.definirUsuarioLogado === 'function') {
                            window.ItaimSessao.definirUsuarioLogado(res.user.email, res.user);
                        }
                    }
                } catch (errPerfil) {
                    console.warn('[Perfil] Falha ao carregar perfil do backend, usando dados locais:', errPerfil);
                }
            }

            if (!perfilExibido) {
                perfilExibido = (window.ItaimSessao && typeof window.ItaimSessao.obterUsuarioLogado === 'function')
                    ? window.ItaimSessao.obterUsuarioLogado()
                    : null;
            }

            if (!perfilExibido) {
                perfilExibido = {
                    name: 'Admin',
                    nome: 'Admin',
                    email: 'admin@gmail.com',
                    username: 'adminfreefire',
                    city: 'Paulistana',
                    cidade: 'Paulistana',
                    neighborhood: 'Centro',
                    phone: '(89) 99985-8585',
                    avatar: '/uploads/perfil/itaim-1791903382039-jwd9lvb.jpg',
                    bio: 'Perfil oficial e verificado da administração do Itaim Vende.',
                    isVerified: true
                };
            }
        } else {
            // Perfil de outro vendedor
            if (alertaNaoLogado) alertaNaoLogado.style.display = 'none';
            if (btnCameraAvatar) btnCameraAvatar.style.display = 'none';
            if (btnAbrirModalPerfil) btnAbrirModalPerfil.style.display = 'none';
            if (paramId && window.ItaimApi && window.ItaimApi.auth) {
                try {
                    const resOutro = await window.ItaimApi.auth.obterUsuario(paramId);
                    if (resOutro && resOutro.user) {
                        perfilExibido = resOutro.user;
                    }
                } catch (err) {
                    console.warn('[Perfil] Erro ao carregar usuário por ID:', err);
                }
            }

            if (!perfilExibido) {
                const todosUsuarios = (window.ItaimSessao && typeof window.ItaimSessao.obterTodosUsuarios === 'function')
                    ? window.ItaimSessao.obterTodosUsuarios()
                    : [];
                if (paramEmail) perfilExibido = todosUsuarios.find(u => (u.email || '').toLowerCase() === paramEmail);
                if (!perfilExibido && paramNome) {
                    const b = paramNome.toLowerCase();
                    perfilExibido = todosUsuarios.find(u => (u.name || u.nome || '').toLowerCase() === b || (u.username || '').toLowerCase() === b);
                }
            }

            if (!perfilExibido) {
                perfilExibido = {
                    name: paramNome || 'Vendedor',
                    username: paramNome ? paramNome.toLowerCase().replace(/\s+/g, '') : 'vendedor',
                    city: 'Paulistana',
                    state: 'PI',
                    avatar: 'assets/icons/icon-user.png'
                };
            }

            // Box de contato WhatsApp com vendedor externo (somente se tiver número cadastrado)
            if (boxContatoExterno && btnWppExterno) {
                const telRaw = perfilExibido.phone || perfilExibido.telefone || '';
                let fone = String(telRaw).replace(/\D/g, '');
                if (!fone || fone.length < 10) {
                    boxContatoExterno.style.display = 'none';
                    btnWppExterno.style.display = 'none';
                } else {
                    boxContatoExterno.style.display = 'block';
                    btnWppExterno.style.display = 'inline-flex';
                    if (fone.length === 10 || fone.length === 11) {
                        fone = '55' + fone;
                    }
                    const nomeVendedor = perfilExibido.name || perfilExibido.nome || 'Vendedor';
                    const msg = encodeURIComponent(`Olá ${nomeVendedor}! Vi seu perfil no Itaim Vende e gostaria de conversar sobre seus anúncios.`);
                    btnWppExterno.href = `https://wa.me/${fone}?text=${msg}`;
                }
            }

            // Formulário de avaliação
            if (boxFormAvaliacao) {
                boxFormAvaliacao.style.display = 'block';
                const userLogadoAtual = window.ItaimSessao ? window.ItaimSessao.obterUsuarioLogado() : null;
                const inputAutor = document.getElementById('perfil-input-autor');
                const labelAutorLogado = document.getElementById('perfil-nome-autor-logado');
                if (inputAutor && userLogadoAtual) {
                    inputAutor.value = userLogadoAtual.name || userLogadoAtual.nome || 'Comprador';
                    if (labelAutorLogado) labelAutorLogado.textContent = inputAutor.value;
                }
            }
        }

        // Atualizar informações visuais do Banner
        const nomePrincipal = perfilExibido.name || perfilExibido.nome || 'Usuário';
        document.title = `${nomePrincipal} - ${isPerfilProprio ? 'Meu Perfil' : 'Perfil'} - Itaim Vende`;
        if (breadcrumbCurrent) breadcrumbCurrent.textContent = isPerfilProprio ? 'Meu Perfil' : `Perfil de ${nomePrincipal}`;

        if (nomeDisplay) nomeDisplay.textContent = nomePrincipal;
        if (userDisplayEl) userDisplayEl.textContent = perfilExibido.username ? `@${perfilExibido.username}` : (perfilExibido.usuario ? `@${perfilExibido.usuario}` : '');
        if (bioDisplayEl) {
            if (perfilExibido.bio && perfilExibido.bio.trim()) {
                bioDisplayEl.textContent = perfilExibido.bio;
            } else {
                bioDisplayEl.textContent = isPerfilProprio
                    ? 'Nenhuma biografia informada.'
                    : 'Vendedor cadastrado no Itaim Vende.';
            }
        }

        const cidadeFormatada = `${perfilExibido.city || perfilExibido.cidade || 'Paulistana'} - ${perfilExibido.state || perfilExibido.estado || 'PI'}`;
        if (cidadeDisplay) cidadeDisplay.textContent = cidadeFormatada;

        const anoMembro = perfilExibido.createdAt ? new Date(perfilExibido.createdAt).getFullYear() : '2024';
        if (dataDisplay) dataDisplay.textContent = `Membro desde ${anoMembro}`;

        // Foto de perfil
        if (avatarImgView) {
            const rawAvatar = perfilExibido.avatar || 'assets/icons/icon-user.png';
            const finalAvatar = (window.ItaimApi && typeof window.ItaimApi.resolverUrlImagem === 'function')
                ? window.ItaimApi.resolverUrlImagem(rawAvatar)
                : ((window.ItaimRotas && typeof window.ItaimRotas.obterAsset === 'function')
                    ? window.ItaimRotas.obterAsset(rawAvatar)
                    : fallbackAvatarPerfil);

            avatarImgView.src = finalAvatar;
            avatarImgView.onerror = function() {
                this.onerror = null;
                this.src = fallbackAvatarPerfil;
            };
        }

        
        // =========================================================================
        // CONFIGURAÇÃO DO MODAL DE EDIÇÃO DE PERFIL (DADOS DA CONTA)
        // =========================================================================
        let avatarPendente = null;

        function abrirModalPerfil(focoBio = false) {
            if (!modalPerfil) return;
            avatarPendente = null;

            if (modalAvatarPreview && avatarImgView) {
                modalAvatarPreview.src = avatarImgView.src;
            }
            if (modalInputNome) {
                modalInputNome.value = perfilExibido.name || perfilExibido.nome || '';
                modalInputNome.classList.remove('com-erro');
            }
            if (modalErroNome) {
                modalErroNome.textContent = '';
            }
            if (modalTextareaBio) {
                modalTextareaBio.value = perfilExibido.bio || '';
                if (modalContadorBio) {
                    modalContadorBio.textContent = `${modalTextareaBio.value.length}/80`;
                }
            }
            if (btnSalvarModalPerfil) {
                btnSalvarModalPerfil.disabled = false;
                btnSalvarModalPerfil.textContent = 'Salvar alterações';
            }

            modalPerfil.style.display = 'flex';
            document.documentElement.classList.add('modal-perfil-aberto');
            document.body.classList.add('modal-perfil-aberto');
            requestAnimationFrame(() => {
                modalPerfil.classList.add('aberto');
                if (focoBio && modalTextareaBio) {
                    modalTextareaBio.focus();
                } else if (modalInputNome) {
                    modalInputNome.focus();
                }
            });
        }

        function fecharModalPerfil() {
            if (!modalPerfil) return;
            modalPerfil.classList.remove('aberto');
            document.documentElement.classList.remove('modal-perfil-aberto');
            document.body.classList.remove('modal-perfil-aberto');
            setTimeout(() => {
                modalPerfil.style.display = 'none';
            }, 200);
        }

        if (btnAbrirModalPerfil) {
            btnAbrirModalPerfil.onclick = () => abrirModalPerfil();
        }
        if (btnFecharModalPerfil) {
            btnFecharModalPerfil.onclick = fecharModalPerfil;
        }
        if (btnCancelarModalPerfil) {
            btnCancelarModalPerfil.onclick = fecharModalPerfil;
        }

        if (modalPerfil) {
            modalPerfil.onclick = (e) => {
                if (e.target === modalPerfil) fecharModalPerfil();
            };
        }

        // Contador de caracteres da bio
        if (modalTextareaBio && modalContadorBio) {
            modalTextareaBio.oninput = (e) => {
                modalContadorBio.textContent = `${e.target.value.length}/80`;
            };
        }

        // Validação em tempo real do nome completo
        if (modalInputNome) {
            modalInputNome.oninput = () => {
                if (modalInputNome.value.trim().length >= 3) {
                    modalInputNome.classList.remove('com-erro');
                    if (modalErroNome) modalErroNome.textContent = '';
                }
            };
        }

        // Alterar Foto dentro do modal (com corte quadrado automático 1:1)
        if (modalInputFoto) {
            modalInputFoto.onchange = (e) => {
                const file = e.target.files && e.target.files[0];
                if (!file) return;

                const aplicarFoto = (novaFotoDataUrl) => {
                    if (modalAvatarPreview) {
                        modalAvatarPreview.src = novaFotoDataUrl;
                    }
                    avatarPendente = novaFotoDataUrl;
                };

                if (window.ItaimFoto && typeof window.ItaimFoto.abrir === 'function') {
                    window.ItaimFoto.abrir({
                        arquivo: file,
                        tipo: 'perfil',
                        tamanho: 400,
                        aoSalvar: aplicarFoto
                    });
                } else if (window.ItaimFoto && typeof window.ItaimFoto.ajustarPerfil === 'function') {
                    window.ItaimFoto.ajustarPerfil(file, aplicarFoto);
                } else if (window.ItaimAjustarFoto && typeof window.ItaimAjustarFoto.abrir === 'function') {
                    window.ItaimAjustarFoto.abrir(file, aplicarFoto);
                } else {
                    const reader = new FileReader();
                    reader.onload = (ev) => aplicarFoto(ev.target.result);
                    reader.readAsDataURL(file);
                }
            };
        }

        // Remover Foto dentro do modal
        if (modalBtnRemoverFoto) {
            modalBtnRemoverFoto.onclick = () => {
                const fotoPadrao = fallbackAvatarPerfil;
                if (modalAvatarPreview) {
                    modalAvatarPreview.src = fotoPadrao;
                }
                avatarPendente = 'remover';
            };
        }

        // Submissão do formulário de edição de perfil
        if (formModalPerfil) {
            formModalPerfil.onsubmit = async (e) => {
                e.preventDefault();

                const novoNome = modalInputNome ? modalInputNome.value.trim() : '';
                const novaBio = modalTextareaBio ? modalTextareaBio.value.trim() : '';

                if (novoNome.length < 3) {
                    if (modalInputNome) modalInputNome.classList.add('com-erro');
                    if (modalErroNome) modalErroNome.textContent = 'Informe seu nome completo (mínimo de 3 caracteres).';
                    if (modalInputNome) modalInputNome.focus();
                    return;
                }

                if (btnSalvarModalPerfil) {
                    btnSalvarModalPerfil.disabled = true;
                    btnSalvarModalPerfil.textContent = 'Salvando...';
                }

                let avatarFinalUrl = null;

                // 1. Processar Foto se foi alterada no modal
                if (avatarPendente === 'remover') {
                    avatarFinalUrl = 'assets/icons/icon-user.png';
                    if (avatarImgView) avatarImgView.src = fallbackAvatarPerfil;
                } else if (avatarPendente && typeof avatarPendente === 'string') {
                    if (avatarImgView) avatarImgView.src = avatarPendente;
                    avatarFinalUrl = avatarPendente;

                    if (window.ItaimApi && window.ItaimApi.upload && window.ItaimApi.auth && window.ItaimApi.auth.obterToken()) {
                        try {
                            const resUpload = await window.ItaimApi.upload.perfil(avatarPendente);
                            if (resUpload && resUpload.data && resUpload.data.url) {
                                avatarFinalUrl = resUpload.data.url;
                                if (avatarImgView && window.ItaimApi.resolverUrlImagem) {
                                    avatarImgView.src = window.ItaimApi.resolverUrlImagem(avatarFinalUrl);
                                }
                            }
                        } catch (errUp) {
                            console.warn('[Perfil] Upload de avatar via modal falhou, salvando local:', errUp);
                        }
                    }
                }

                // 2. Montar payload do perfil
                const payloadAtualizacao = {
                    name: novoNome,
                    bio: novaBio
                };
                if (avatarFinalUrl) {
                    payloadAtualizacao.avatar = avatarFinalUrl;
                }

                // 3. Atualizar na API REST se usuário autenticado
                if (window.ItaimApi && window.ItaimApi.auth && typeof window.ItaimApi.auth.atualizarPerfil === 'function' && window.ItaimApi.auth.obterToken()) {
                    try {
                        await window.ItaimApi.auth.atualizarPerfil(payloadAtualizacao);
                    } catch (errApi) {
                        console.warn('[Perfil] Falha ao sincronizar dados com API:', errApi);
                    }
                }

                // 4. Atualizar objeto em memória e sessão local
                perfilExibido.name = novoNome;
                perfilExibido.nome = novoNome;
                perfilExibido.bio = novaBio;
                if (avatarFinalUrl) {
                    perfilExibido.avatar = avatarFinalUrl;
                }

                const userEmail = perfilExibido.email || localStorage.getItem('itaim_usuario_logado_email');
                if (window.ItaimSessao && typeof window.ItaimSessao.atualizarDadosUsuario === 'function') {
                    window.ItaimSessao.atualizarDadosUsuario(userEmail, payloadAtualizacao);
                }
                if (window.ItaimSessao && typeof window.ItaimSessao.atualizarHeaderUsuario === 'function') {
                    window.ItaimSessao.atualizarHeaderUsuario();
                }
                try {
                    localStorage.setItem('itaim_usuario_logado', JSON.stringify(perfilExibido));
                } catch (e) {}

                // 5. Atualizar DOM do Banner de perfil imediatamente
                if (nomeDisplay) nomeDisplay.textContent = novoNome;
                if (breadcrumbCurrent) breadcrumbCurrent.textContent = isPerfilProprio ? 'Meu Perfil' : `Perfil de ${novoNome}`;
                document.title = `${novoNome} - ${isPerfilProprio ? 'Meu Perfil' : 'Perfil'} - Itaim Vende`;

                if (bioDisplayEl) {
                    bioDisplayEl.textContent = novaBio || (isPerfilProprio ? 'Nenhuma biografia informada.' : 'Vendedor cadastrado no Itaim Vende.');
                }

                // 6. Fechar modal e exibir toast de confirmação
                fecharModalPerfil();

                if (btnSalvarModalPerfil) {
                    btnSalvarModalPerfil.disabled = false;
                    btnSalvarModalPerfil.textContent = 'Salvar alterações';
                }

                if (window.ItaimPerfilUtils && typeof window.ItaimPerfilUtils.exibirToast === 'function') {
                    window.ItaimPerfilUtils.exibirToast('Perfil atualizado com sucesso!');
                }
            };
        }

        window.ItaimPerfilDados.perfilExibido = perfilExibido;
        return perfilExibido;
    }

    window.ItaimPerfilDados = {
        inicializar,
        obterPerfil: () => perfilExibido,
        perfilExibido: null
    };
})();
