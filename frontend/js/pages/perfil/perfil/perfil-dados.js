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

        const nomeInput = document.getElementById('perfil-nome');
        const usuarioInput = document.getElementById('perfil-usuario');
        const emailInput = document.getElementById('perfil-email');
        const telefoneInput = document.getElementById('perfil-telefone');
        const cidadeInput = document.getElementById('perfil-cidade');
        const bairroInput = document.getElementById('perfil-bairro');

        const token = window.ItaimApi?.auth?.obterToken();

        if (isPerfilProprio) {
            if (alertaNaoLogado) alertaNaoLogado.style.display = 'none';
            if (btnCameraAvatar) btnCameraAvatar.style.display = 'flex';
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

            // Box de contato WhatsApp com vendedor externo
            if (boxContatoExterno && btnWppExterno) {
                boxContatoExterno.style.display = 'block';
                let fone = (perfilExibido.phone || perfilExibido.telefone || '89999858585').replace(/\D/g, '');
                if (fone.length === 10 || fone.length === 11) fone = '55' + fone;
                const nomeVendedor = perfilExibido.name || perfilExibido.nome || 'Vendedor';
                const msg = encodeURIComponent(`Olá ${nomeVendedor}! Vi seu perfil no Itaim Vende e gostaria de conversar sobre seus anúncios.`);
                btnWppExterno.href = `https://wa.me/${fone}?text=${msg}`;
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
        if (bioDisplayEl) bioDisplayEl.textContent = perfilExibido.bio || (isPerfilProprio ? 'Nenhuma biografia informada. Acesse Configurações para adicionar uma bio.' : 'Vendedor cadastrado no Itaim Vende.');

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

        // Preenche campos de dados pessoais
        if (nomeInput) nomeInput.value = nomePrincipal;
        if (usuarioInput) usuarioInput.value = perfilExibido.username || perfilExibido.usuario || '';
        if (emailInput) emailInput.value = perfilExibido.email || '';
        if (telefoneInput) telefoneInput.value = formatarTelefoneBR(perfilExibido.phone || perfilExibido.telefone || '');
        if (cidadeInput) cidadeInput.value = perfilExibido.city || perfilExibido.cidade || 'Paulistana';
        if (bairroInput) bairroInput.value = perfilExibido.neighborhood || perfilExibido.bairro || 'Centro';

        window.ItaimPerfilDados.perfilExibido = perfilExibido;
        return perfilExibido;
    }

    window.ItaimPerfilDados = {
        inicializar,
        obterPerfil: () => perfilExibido,
        perfilExibido: null
    };
})();
