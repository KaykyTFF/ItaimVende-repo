/**
 * ITAIM VENDE - MEU PERFIL (BUNDLE UNIFICADO)
 * Arquivo: frontend/js/pages/perfil/perfil.bundle.js
 * Gerado automaticamente via: node scripts/build-perfil.js
 */

// ==========================================================================
// MÓDULO: UTILITÁRIOS E PARÂMETROS (perfil-utils.js)
// ==========================================================================

/**
 * ITAIM VENDE - PERFIL: UTILITÁRIOS E FORMATAÇÃO
 * Arquivo: frontend/js/pages/perfil/perfil/perfil-utils.js
 */

(function () {
    'use strict';

    const urlParams = new URLSearchParams(window.location.search);
    const paramEmail = (urlParams.get('email') || '').toLowerCase().trim();
    const paramNome = (urlParams.get('vendedor') || urlParams.get('nome') || '').trim();
    const paramId = urlParams.get('id');

    const isPerfilProprio = !paramEmail && !paramNome && !paramId;

    const fallbackAvatarPerfil = (window.ItaimRotas && typeof window.ItaimRotas.obterAsset === 'function')
        ? window.ItaimRotas.obterAsset('assets/icons/icon-user.png')
        : '../../assets/icons/icon-user.png';

    function formatarTelefoneBR(tel) {
        if (!tel) return '';
        const num = String(tel).replace(/\D/g, '');
        if (num.length === 11) {
            return `(${num.substring(0, 2)}) ${num.substring(2, 7)}-${num.substring(7)}`;
        }
        if (num.length === 10) {
            return `(${num.substring(0, 2)}) ${num.substring(2, 6)}-${num.substring(6)}`;
        }
        return tel;
    }

    function formatarPreco(val) {
        if (val === 0 || val === '0' || val === null || val === undefined) {
            return '<span style="color: #44BD32; font-weight: 800;">Grátis / Doação</span>';
        }
        return Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    function exibirToast(mensagem = 'Informações salvas com sucesso!') {
        const toast = document.getElementById('toast-sucesso');
        if (!toast) return;
        const span = toast.querySelector('span');
        if (span) span.textContent = mensagem;
        toast.classList.add('visivel');
        setTimeout(() => {
            toast.classList.remove('visivel');
        }, 3500);
    }

    window.ItaimPerfilUtils = {
        paramEmail,
        paramNome,
        paramId,
        isPerfilProprio,
        fallbackAvatarPerfil,
        formatarTelefoneBR,
        formatarPreco,
        exibirToast
    };
})();

// ==========================================================================
// MÓDULO: DADOS DO PERFIL E BANNER (perfil-dados.js)
// ==========================================================================

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

// ==========================================================================
// MÓDULO: UPLOAD DE FOTO DE PERFIL (perfil-avatar-upload.js)
// ==========================================================================

/**
 * ITAIM VENDE - PERFIL: UPLOAD E ALTERAÇÃO DE FOTO
 * Arquivo: frontend/js/pages/perfil/perfil/perfil-avatar-upload.js
 */

(function () {
    'use strict';

    function inicializar() {
        const { exibirToast } = window.ItaimPerfilUtils;
        const inputFotoAvatar = document.getElementById('input-foto-avatar');
        const avatarImgView = document.getElementById('perfil-avatar-view');

        if (!inputFotoAvatar || !avatarImgView) return;

        inputFotoAvatar.addEventListener('change', (e) => {
            const file = e.target.files && e.target.files[0];
            if (!file) return;

            const perfil = window.ItaimPerfilDados?.obterPerfil() || {};

            const salvarFoto = async (novaFoto) => {
                // Atualização visual imediata
                if (typeof novaFoto === 'string') {
                    avatarImgView.src = novaFoto;
                }

                // Upload para o backend Express / Supabase
                if (window.ItaimApi && window.ItaimApi.upload && window.ItaimApi.auth && window.ItaimApi.auth.obterToken()) {
                    try {
                        const resUpload = await window.ItaimApi.upload.perfil(novaFoto);
                        if (resUpload && resUpload.data && resUpload.data.url) {
                            const urlFotoServidor = resUpload.data.url;

                            // Atualiza a URL do avatar no PostgreSQL via PUT /api/auth/me
                            await window.ItaimApi.auth.atualizarPerfil({ avatar: urlFotoServidor });

                            // Atualiza visualização final resolvida
                            const urlResolvida = window.ItaimApi.resolverUrlImagem(urlFotoServidor);
                            avatarImgView.src = urlResolvida;

                            // Atualiza cache e Header Global
                            if (window.ItaimSessao && typeof window.ItaimSessao.atualizarDadosUsuario === 'function') {
                                window.ItaimSessao.atualizarDadosUsuario(perfil.email, { avatar: urlFotoServidor });
                            }
                            if (window.ItaimSessao && typeof window.ItaimSessao.atualizarHeaderUsuario === 'function') {
                                window.ItaimSessao.atualizarHeaderUsuario();
                            }

                            perfil.avatar = urlFotoServidor;
                            exibirToast('Foto de perfil salva com sucesso no servidor!');
                            return;
                        }
                    } catch (errUpload) {
                        console.error('[Perfil] Erro no upload da imagem:', errUpload);
                        alert('Não foi possível salvar a imagem no servidor. Verifique sua conexão.');
                    }
                } else {
                    // Sem token, salva apenas localmente
                    if (window.ItaimSessao && typeof window.ItaimSessao.atualizarDadosUsuario === 'function') {
                        window.ItaimSessao.atualizarDadosUsuario(perfil.email, { avatar: novaFoto });
                    }
                    if (window.ItaimSessao && typeof window.ItaimSessao.atualizarHeaderUsuario === 'function') {
                        window.ItaimSessao.atualizarHeaderUsuario();
                    }
                    exibirToast('Foto atualizada localmente!');
                }
            };

            // Processa com corte 1:1 se a biblioteca de recorte estiver carregada
            if (window.ItaimFoto && typeof window.ItaimFoto.ajustarPerfil === 'function') {
                window.ItaimFoto.ajustarPerfil(file, salvarFoto);
            } else if (window.ItaimFoto && typeof window.ItaimFoto.ajustar === 'function') {
                window.ItaimFoto.ajustar(file, 400, salvarFoto);
            } else {
                salvarFoto(file);
            }
        });
    }

    window.ItaimPerfilAvatarUpload = {
        inicializar
    };
})();

// ==========================================================================
// MÓDULO: VITRINE DE ANÚNCIOS (perfil-anuncios.js)
// ==========================================================================

/**
 * ITAIM VENDE - PERFIL: ANÚNCIOS PUBLICADOS E ESTATÍSTICAS
 * Arquivo: frontend/js/pages/perfil/perfil/perfil-anuncios.js
 */

(function () {
    'use strict';

    async function inicializar() {
        const { isPerfilProprio, formatarPreco } = window.ItaimPerfilUtils;
        const perfilExibido = window.ItaimPerfilDados?.obterPerfil() || {};

        const statAtivos = document.getElementById('stat-anuncios-ativos');
        const statVendas = document.getElementById('stat-vendas-concluidas');
        const gradeAnuncios = document.getElementById('grade-anuncios-perfil');
        const tituloSecaoAnuncios = document.getElementById('titulo-secao-anuncios');
        const subtituloSecaoAnuncios = document.getElementById('subtitulo-secao-anuncios');

        // Estatística de vendas
        const baseVendas = perfilExibido.salesCount !== undefined
            ? perfilExibido.salesCount
            : (perfilExibido.vendasConcluidas !== undefined ? perfilExibido.vendasConcluidas : 0);
        if (statVendas) statVendas.textContent = baseVendas;

        const nomePrincipal = perfilExibido.name || perfilExibido.nome || 'Usuário';

        if (tituloSecaoAnuncios) {
            tituloSecaoAnuncios.textContent = isPerfilProprio ? 'Meus Anúncios Publicados' : `Anúncios de ${nomePrincipal}`;
        }
        if (subtituloSecaoAnuncios) {
            subtituloSecaoAnuncios.textContent = isPerfilProprio
                ? 'Esses são os anúncios do seu perfil visíveis para outros compradores no Itaim Vende.'
                : `Todos os produtos anunciados por ${nomePrincipal} disponíveis para negociação.`;
        }

        // Exibe skeleton enquanto busca anúncios
        if (window.ItaimSkeleton && typeof window.ItaimSkeleton.exibir === 'function' && gradeAnuncios) {
            window.ItaimSkeleton.exibir(gradeAnuncios, 'cards', 3);
        }

        let listaAnuncios = [];
        try {
            if (isPerfilProprio && window.ItaimApi && window.ItaimApi.produtos) {
                const resMeus = await window.ItaimApi.produtos.meusAnuncios();
                listaAnuncios = resMeus.data || resMeus.products || [];
            } else if (!isPerfilProprio && perfilExibido.id && window.ItaimApi && window.ItaimApi.produtos) {
                const resVendedor = await window.ItaimApi.produtos.doVendedor(perfilExibido.id);
                listaAnuncios = resVendedor.data || resVendedor.products || [];
            }
        } catch (errAds) {
            console.warn('[Perfil] Erro ao carregar anúncios via API, buscando localmente:', errAds);
        }

        // Se API não retornou produtos, faz fallback para anúncios locais
        if ((!listaAnuncios || listaAnuncios.length === 0) && window.ItaimSessao && typeof window.ItaimSessao.obterAnunciosDoUsuario === 'function') {
            const anunciosLocais = window.ItaimSessao.obterAnunciosDoUsuario(perfilExibido.email);
            if (anunciosLocais && anunciosLocais.length > 0) {
                listaAnuncios = anunciosLocais;
            }
        }

        const totalAtivos = (listaAnuncios || []).filter(a => {
            const st = String(a.status || 'ATIVO').toUpperCase();
            return st === 'ATIVO' || st === 'ACTIVE';
        }).length;

        if (statAtivos) {
            statAtivos.textContent = perfilExibido._count?.products !== undefined ? perfilExibido._count.products : totalAtivos;
        }

        // Renderiza cards de produtos
        if (gradeAnuncios) {
            if (!listaAnuncios || listaAnuncios.length === 0) {
                gradeAnuncios.innerHTML = `
                    <div class="estado-vazio" style="grid-column: 1 / -1; text-align: center; padding: 44px 20px; border-radius: 14px; border: 1px dashed #CBD5E1;">
                        <div class="anuncios-vazio-icone" style="width: 60px; height: 60px; margin: 0 auto 14px; border-radius: 50%; background: rgba(68, 189, 50, 0.12); display: inline-flex; align-items: center; justify-content: center; color: #44BD32;">
                            <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                                <line x1="12" y1="22.08" x2="12" y2="12"></line>
                            </svg>
                        </div>
                        <h3 style="font-size: 17px; font-weight: 800; margin-bottom: 6px;">Nenhum anúncio ativo no momento</h3>
                        <p style="color: #64748B; font-size: 13.5px; margin-bottom: 16px;">
                            ${isPerfilProprio ? 'Você ainda não possui anúncios publicados.' : 'Este vendedor ainda não possui anúncios ativos.'}
                        </p>
                        ${isPerfilProprio ? `
                        <a href="${window.ItaimRotas ? window.ItaimRotas.obterUrl('vender') : '../vender/vender.html'}" style="background: #44BD32; color: #FFFFFF; font-weight: 700; padding: 10px 22px; border-radius: 20px; text-decoration: none; font-size: 14px; display: inline-block; box-shadow: 0 4px 12px rgba(68,189,50,0.3);">
                            + Anunciar um Produto
                        </a>` : ''}
                    </div>
                `;
            } else {
                const placeholderSrc = (window.ItaimRotas && typeof window.ItaimRotas.obterAsset === 'function')
                    ? window.ItaimRotas.obterAsset('assets/placeholders/produto-placeholder.svg')
                    : '../../assets/placeholders/produto-placeholder.svg';

                gradeAnuncios.innerHTML = listaAnuncios.map(item => {
                    const fotoSrc = item.imagem || (item.fotos && item.fotos[0]) || (item.images && item.images[0]) || '';
                    const fotoFinal = (window.ItaimApi && typeof window.ItaimApi.resolverUrlImagem === 'function')
                        ? window.ItaimApi.resolverUrlImagem(fotoSrc)
                        : (fotoSrc || placeholderSrc);

                    const linkProduto = window.ItaimRotas 
                        ? window.ItaimRotas.obterUrl('produto', `id=${item.id}`) 
                        : `../produtos/produto.html?id=${item.id}`;

                    return `
                    <article class="card-produto" onclick="window.location.href='${linkProduto}'" style="cursor: pointer;">
                        <div class="card-img-box">
                            <img src="${fotoFinal}" alt="${item.titulo || item.title}" class="card-img" onerror="this.onerror=null; this.src='${placeholderSrc}'">
                            <span class="badge-card-condicao" style="position: absolute; bottom: 8px; left: 8px; background: rgba(0,0,0,0.7); color: #fff; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;">
                                ${item.categoria || item.category?.name || 'Geral'}
                            </span>
                        </div>
                        <div class="card-info" style="padding: 14px;">
                            <h3 class="card-titulo" title="${item.titulo || item.title}" style="font-size: 14.5px; font-weight: 700; color: #1E293B; margin-bottom: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                ${item.titulo || item.title}
                            </h3>
                            <div class="card-preco" style="font-size: 17px; font-weight: 800; color: #44BD32; margin-bottom: 8px;">
                                ${formatarPreco(item.preco !== undefined ? item.preco : item.price)}
                            </div>
                            <div class="card-rodape" style="display: flex; justify-content: space-between; font-size: 12px; color: #64748B;">
                                <span class="card-local"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: -1px; margin-right: 2px;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>${item.cidade || item.city || perfilExibido.city || 'Paulistana'}</span>
                                <span style="color: #44BD32; font-weight: 600;">Ver anúncio &rarr;</span>
                            </div>
                        </div>
                    </article>
                    `;
                }).join('');
            }
        }
    }

    window.ItaimPerfilAnuncios = {
        inicializar
    };
})();

// ==========================================================================
// MÓDULO: AVALIAÇÕES E REPUTAÇÃO (perfil-avaliacoes.js)
// ==========================================================================

/**
 * ITAIM VENDE - PERFIL: AVALIAÇÕES E REPUTAÇÃO
 * Arquivo: frontend/js/pages/perfil/perfil/perfil-avaliacoes.js
 *
 * Busca avaliações reais da API (/api/v1/reviews/user/:userId),
 * conecta o formulário de avaliação para visitantes (#perfil-form-nova-avaliacao)
 * e permite que o próprio vendedor responda cada avaliação via PATCH /reviews/:id/reply.
 * Mantém fallback para ItaimAvaliacoes (localStorage) quando offline.
 */

(function () {
    'use strict';

    function formatarData(iso) {
        if (!iso) return 'Recente';
        try {
            return new Date(iso).toLocaleDateString('pt-BR', {
                day: '2-digit', month: 'short', year: 'numeric'
            });
        } catch (_) { return 'Recente'; }
    }

    function renderizarCard(item, isProprioUsuario) {
        const notaNum = Math.min(5, Math.max(1, Math.round(item.nota || 5)));
        const estrelasTxt = '★'.repeat(notaNum) + '☆'.repeat(5 - notaNum);
        const nomeAutor = item.autor?.nome || item.autor || 'Comprador';
        const inicial = nomeAutor.charAt(0).toUpperCase();
        const avatarAutor = item.autor?.avatar
            ? (window.ItaimApi?.resolverUrlImagem?.(item.autor.avatar) || item.autor.avatar)
            : null;

        const avatarHtml = avatarAutor
            ? `<img src="${avatarAutor}" alt="${nomeAutor}" style="width:34px;height:34px;border-radius:50%;object-fit:cover;" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
               <div style="width:34px;height:34px;border-radius:50%;background:#DCFCE7;color:#166534;font-weight:800;display:none;align-items:center;justify-content:center;font-size:14px;border:1px solid #BBF7D0;">${inicial}</div>`
            : `<div style="width:34px;height:34px;border-radius:50%;background:#DCFCE7;color:#166534;font-weight:800;display:flex;align-items:center;justify-content:center;font-size:14px;border:1px solid #BBF7D0;">${inicial}</div>`;

        const respostaHtml = item.resposta
            ? `<div style="margin:8px 0 0 44px;padding:10px 14px;background:#F0FDF4;border-left:3px solid #22C55E;border-radius:0 8px 8px 0;">
                   <div style="font-size:12px;font-weight:700;color:#166534;margin-bottom:4px;">💬 Resposta do Vendedor</div>
                   <p style="font-size:13px;color:#334155;margin:0;line-height:1.5;">${item.resposta}</p>
               </div>`
            : (isProprioUsuario
                ? `<div style="margin:6px 0 0 44px;">
                       <button type="button" class="btn-responder-avaliacao" data-id="${item.id}"
                           style="font-size:12px;padding:5px 12px;border-radius:6px;border:1px solid #22C55E;background:transparent;color:#16A34A;cursor:pointer;font-weight:600;">
                           Responder
                       </button>
                       <form class="form-resposta-inline" data-id="${item.id}" style="display:none;margin-top:8px;">
                           <textarea placeholder="Escreva sua resposta..." rows="2"
                               style="width:100%;padding:8px 12px;border-radius:8px;border:1px solid #BBF7D0;font-family:inherit;font-size:13px;resize:vertical;box-sizing:border-box;outline:none;"></textarea>
                           <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:6px;">
                               <button type="button" class="btn-cancelar-resposta" data-id="${item.id}"
                                   style="font-size:12px;padding:5px 12px;border-radius:6px;border:1px solid #CBD5E1;background:transparent;color:#64748B;cursor:pointer;">
                                   Cancelar
                               </button>
                               <button type="submit"
                                   style="font-size:12px;padding:5px 14px;border-radius:6px;border:none;background:#22C55E;color:#fff;font-weight:700;cursor:pointer;">
                                   Publicar
                               </button>
                           </div>
                       </form>
                   </div>`
                : '');

        return `
            <div class="item-avaliacao-card" data-review-id="${item.id}" style="padding:14px 0;border-bottom:1px solid #F1F5F9;">
                <div class="avaliacao-topo-row" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;flex-wrap:wrap;gap:8px;">
                    <div style="display:flex;align-items:center;gap:10px;">
                        <div style="display:flex;align-items:center;">${avatarHtml}</div>
                        <div>
                            <div style="font-weight:700;font-size:13.5px;color:#1E293B;">${nomeAutor}</div>
                            <div style="font-size:11.5px;color:#94A3B8;">${formatarData(item.data)}</div>
                        </div>
                    </div>
                    <div style="color:#F59E0B;font-size:14px;letter-spacing:2px;">
                        ${estrelasTxt} <span style="font-size:12px;font-weight:700;color:#64748B;">(${Number(item.nota).toFixed(1)})</span>
                    </div>
                </div>
                ${item.comentario ? `<p style="font-size:13.5px;color:#475569;line-height:1.5;margin:4px 0 0 44px;">${item.comentario}</p>` : ''}
                ${respostaHtml}
            </div>`;
    }

    async function inicializar() {
        const { exibirToast, isPerfilProprio } = window.ItaimPerfilUtils || {};
        const perfilExibido = window.ItaimPerfilDados?.obterPerfil() || {};
        const userId = perfilExibido.id || perfilExibido.username || window.ItaimPerfilUtils?.paramId || null;

        const statAvaliacao = document.getElementById('stat-avaliacoes-texto');
        const statLegenda = document.getElementById('stat-avaliacoes-legenda');
        const badgeAvaliacoes = document.getElementById('perfil-badge-avaliacoes');
        const container = document.getElementById('lista-avaliacoes-perfil');

        // Formulário de nova avaliação
        const boxForm = document.getElementById('perfil-box-form-avaliacao');
        const formAvaliacao = document.getElementById('perfil-form-nova-avaliacao');
        const inputNota = document.getElementById('perfil-input-nota');
        const labelNota = document.getElementById('perfil-label-nota');
        const inputAutor = document.getElementById('perfil-input-autor');
        const labelAutorLogado = document.getElementById('perfil-nome-autor-logado');
        const textareaComentario = document.getElementById('perfil-textarea-comentario');
        const estrelasContainer = document.getElementById('perfil-estrelas-seletor');

        // Usuário atualmente autenticado
        const usuarioLogado = (window.ItaimSessao && typeof window.ItaimSessao.obterUsuarioLogado === 'function')
            ? window.ItaimSessao.obterUsuarioLogado()
            : null;
        const isLogado = !!(usuarioLogado?.id || window.ItaimApi?.auth?.obterToken?.());

        // O usuário está visualizando seu próprio perfil se isPerfilProprio for true
        // ou se o ID/email do logado coincidir com o perfil exibido
        const isProprioUsuario = !!isPerfilProprio || (!!usuarioLogado?.id && !!perfilExibido?.id && usuarioLogado.id === perfilExibido.id);

        // Se for o próprio perfil, esconde formulário de autoavaliação
        if (boxForm) {
            boxForm.style.display = isProprioUsuario ? 'none' : 'block';
        }

        // Preenche dados do autor logado no formulário se estiver visitando perfil alheio
        if (!isProprioUsuario && boxForm) {
            const nomeLogado = usuarioLogado?.name || usuarioLogado?.nome || usuarioLogado?.username || 'Comprador';
            if (inputAutor) inputAutor.value = nomeLogado;
            if (labelAutorLogado) labelAutorLogado.textContent = isLogado ? nomeLogado : 'Visitante (faça login)';
        }

        // =====================================================================
        // BUSCA AVALIAÇÕES DA API REAL
        // =====================================================================
        let avaliacoes = [];
        let mediaGeral = Number(perfilExibido.ratingAverage || perfilExibido.avaliacao || 5.0);
        let totalAvaliacoes = perfilExibido.ratingCount || perfilExibido.totalAvaliacoes || 0;
        let usouApi = false;

        const idBusca = userId || perfilExibido.email || perfilExibido.username;
        if (idBusca && window.ItaimApi?.reviews?.listar) {
            try {
                const res = await window.ItaimApi.reviews.listar(idBusca);
                if (res?.success && Array.isArray(res.avaliacoes)) {
                    avaliacoes = res.avaliacoes;
                    mediaGeral = res.vendedor?.mediaGeral ?? mediaGeral;
                    totalAvaliacoes = res.vendedor?.totalAvaliacoes ?? totalAvaliacoes;
                    usouApi = true;
                }
            } catch (err) {
                console.info('[PerfilAvaliacoes] Fallback para dados locais:', err.message);
            }
        }

        // Fallback: localStorage
        if (!usouApi && window.ItaimAvaliacoes) {
            const lista = window.ItaimAvaliacoes.obter(perfilExibido);
            const stats = window.ItaimAvaliacoes.calcularMedia(lista, perfilExibido);
            avaliacoes = lista.map(item => ({
                id: item.id,
                nota: item.nota,
                comentario: item.comentario,
                resposta: item.resposta || null,
                data: item.data || null,
                autor: { nome: item.autor, avatar: null }
            }));
            if (stats.total > 0) {
                mediaGeral = stats.media;
                totalAvaliacoes = stats.total;
            }
        }

        // =====================================================================
        // ATUALIZA INDICADORES DE REPUTAÇÃO
        // =====================================================================
        function atualizarIndicadores(media, total) {
            const mediaStr = total > 0 ? `${Number(media).toFixed(1)} ★` : 'Novo';
            const legendaStr = total > 0 ? `Avaliações (${total})` : 'Sem avaliações';
            if (statAvaliacao) statAvaliacao.textContent = mediaStr;
            if (statLegenda) statLegenda.textContent = legendaStr;
            if (badgeAvaliacoes) badgeAvaliacoes.textContent = `${mediaStr} (${total})`;
        }

        atualizarIndicadores(mediaGeral, totalAvaliacoes);

        // =====================================================================
        // RENDERIZA LISTA
        // =====================================================================
        function renderizarLista(lista) {
            if (!container) return;
            if (lista.length === 0) {
                container.innerHTML = `
                    <div style="text-align:center;padding:32px 18px;border-radius:12px;border:1px dashed #CBD5E1;">
                        <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="#94A3B8" stroke-width="1.8" style="margin-bottom:8px;">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                        <h4 style="font-size:14px;color:#1E293B;margin:0 0 4px;">Nenhuma avaliação ainda</h4>
                        <p style="font-size:13px;color:#64748B;margin:0;">As avaliações e comentários deixados por compradores aparecerão aqui.</p>
                    </div>`;
                return;
            }

            container.innerHTML = lista.map(item => renderizarCard(item, isProprioUsuario)).join('');
            vincularEventosResposta(lista);
        }

        // =====================================================================
        // RESPONDER AVALIAÇÃO (PELO PRÓPRIO VENDEDOR)
        // =====================================================================
        function vincularEventosResposta(lista) {
            if (!container || !isProprioUsuario) return;

            container.querySelectorAll('.btn-responder-avaliacao').forEach(btn => {
                const id = btn.getAttribute('data-id');
                const form = container.querySelector(`.form-resposta-inline[data-id="${id}"]`);
                btn.addEventListener('click', () => {
                    btn.style.display = 'none';
                    if (form) form.style.display = 'block';
                });
            });

            container.querySelectorAll('.btn-cancelar-resposta').forEach(btn => {
                const id = btn.getAttribute('data-id');
                const form = container.querySelector(`.form-resposta-inline[data-id="${id}"]`);
                const btnResponder = container.querySelector(`.btn-responder-avaliacao[data-id="${id}"]`);
                btn.addEventListener('click', () => {
                    if (form) form.style.display = 'none';
                    if (btnResponder) btnResponder.style.display = 'inline-block';
                });
            });

            container.querySelectorAll('.form-resposta-inline').forEach(form => {
                form.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const id = form.getAttribute('data-id');
                    const textarea = form.querySelector('textarea');
                    const texto = textarea?.value.trim() || '';
                    if (!texto) return;

                    const btnSubmit = form.querySelector('[type="submit"]');
                    if (btnSubmit) { btnSubmit.disabled = true; btnSubmit.textContent = 'Enviando...'; }

                    try {
                        if (window.ItaimApi?.reviews?.responder) {
                            await window.ItaimApi.reviews.responder(id, texto);
                        }
                        const idx = lista.findIndex(a => a.id === id);
                        if (idx !== -1) lista[idx].resposta = texto;
                        renderizarLista(lista);
                        exibirToast('Resposta publicada com sucesso!');
                    } catch (err) {
                        exibirToast(err.message || 'Erro ao publicar resposta.');
                        if (btnSubmit) { btnSubmit.disabled = false; btnSubmit.textContent = 'Publicar'; }
                    }
                });
            });
        }

        // =====================================================================
        // SELETOR VISUAL DE ESTRELAS (1 a 5) NO FORMULÁRIO DO PERFIL
        // =====================================================================
        if (estrelasContainer && !isProprioUsuario) {
            const estrelas = estrelasContainer.querySelectorAll('.estrela-item');

            function destacarEstrelas(qtd) {
                estrelas.forEach(estrela => {
                    const valor = parseInt(estrela.dataset.valor, 10);
                    estrela.classList.toggle('ativa', valor <= qtd);
                    estrela.style.color = valor <= qtd ? '#F59E0B' : '#CBD5E1';
                });
            }

            estrelas.forEach(estrela => {
                estrela.addEventListener('click', () => {
                    const valor = parseInt(estrela.dataset.valor, 10);
                    if (inputNota) inputNota.value = valor;
                    if (labelNota) labelNota.textContent = `(${valor}.0)`;
                    destacarEstrelas(valor);
                });
                estrela.addEventListener('mouseenter', () => destacarEstrelas(parseInt(estrela.dataset.valor, 10)));
            });

            estrelasContainer.addEventListener('mouseleave', () => {
                destacarEstrelas(parseInt(inputNota?.value || '5', 10));
            });
        }

        // =====================================================================
        // ENVIO DO FORMULÁRIO DE AVALIAÇÃO DE PERFIL
        // =====================================================================
        if (formAvaliacao && !isProprioUsuario) {
            formAvaliacao.addEventListener('submit', async (e) => {
                e.preventDefault();

                const nota = parseInt(inputNota?.value || '5', 10);
                const comentario = textareaComentario?.value.trim() || '';

                if (!comentario) {
                    exibirToast('Por favor, escreva um comentário sobre a sua experiência.');
                    return;
                }

                if (!isLogado) {
                    exibirToast('Você precisa estar logado para avaliar este vendedor.');
                    return;
                }

                const btnEnviar = formAvaliacao.querySelector('button[type="submit"]');
                const spanOriginal = btnEnviar?.querySelector('span')?.textContent || 'Enviar Avaliação';
                if (btnEnviar) {
                    btnEnviar.disabled = true;
                    const span = btnEnviar.querySelector('span');
                    if (span) span.textContent = 'Enviando...';
                }

                try {
                    let novaAvaliacao = null;
                    const alvoId = userId || perfilExibido.id || perfilExibido.username;

                    // 1. Tenta envio via API real
                    if (alvoId && window.ItaimApi?.reviews?.enviar) {
                        const res = await window.ItaimApi.reviews.enviar(alvoId, {
                            rating: nota,
                            comment: comentario
                        });

                        if (res?.review) {
                            novaAvaliacao = {
                                id: res.review.id,
                                nota: res.review.rating,
                                comentario: res.review.comment,
                                resposta: res.review.reply || null,
                                data: res.review.createdAt,
                                autor: {
                                    id: res.review.author?.id,
                                    nome: res.review.author?.name || usuarioLogado?.name || 'Comprador',
                                    avatar: res.review.author?.avatar || null
                                }
                            };

                            // Recalcula média atômica
                            mediaGeral = res.novaMedia ?? mediaGeral;
                            totalAvaliacoes = res.totalAvaliacoes ?? (totalAvaliacoes + 1);
                            atualizarIndicadores(mediaGeral, totalAvaliacoes);
                        }
                    }

                    // 2. Fallback local se a API estiver indisponível
                    if (!novaAvaliacao && window.ItaimAvaliacoes) {
                        const nomeLogado = usuarioLogado?.name || usuarioLogado?.nome || 'Comprador';
                        window.ItaimAvaliacoes.adicionar(perfilExibido, { autor: nomeLogado, nota, comentario });
                        novaAvaliacao = {
                            id: Date.now().toString(),
                            nota,
                            comentario,
                            resposta: null,
                            data: new Date().toISOString(),
                            autor: { nome: nomeLogado, avatar: null }
                        };
                        totalAvaliacoes += 1;
                        atualizarIndicadores(mediaGeral, totalAvaliacoes);
                    }

                    if (novaAvaliacao) {
                        avaliacoes.unshift(novaAvaliacao);
                        renderizarLista(avaliacoes);
                    }

                    if (textareaComentario) textareaComentario.value = '';
                    exibirToast('Avaliação enviada com sucesso!');
                } catch (err) {
                    console.error('[PerfilAvaliacoes] Erro ao enviar avaliação:', err);
                    exibirToast(err.message || 'Erro ao enviar avaliação. Tente novamente.');
                } finally {
                    if (btnEnviar) {
                        btnEnviar.disabled = false;
                        const span = btnEnviar.querySelector('span');
                        if (span) span.textContent = spanOriginal;
                    }
                }
            });
        }

        renderizarLista(avaliacoes);
    }

    window.ItaimPerfilAvaliacoes = { inicializar };
})();

// ==========================================================================
// MÓDULO: ORQUESTRADOR GERAL (index.js)
// ==========================================================================

/**
 * ITAIM VENDE - PERFIL: ORQUESTRADOR GERAL
 * Arquivo: frontend/js/pages/perfil/perfil/index.js
 */

(function () {
    'use strict';

    async function inicializar() {
        if (window.ItaimPerfilDados?.inicializar) {
            await window.ItaimPerfilDados.inicializar();
        }
        if (window.ItaimPerfilAvatarUpload?.inicializar) {
            window.ItaimPerfilAvatarUpload.inicializar();
        }
        if (window.ItaimPerfilAnuncios?.inicializar) {
            await window.ItaimPerfilAnuncios.inicializar();
        }
        if (window.ItaimPerfilAvaliacoes?.inicializar) {
            await window.ItaimPerfilAvaliacoes.inicializar();
        }
    }

    window.ItaimPerfilOrquestrador = {
        inicializar
    };
})();


// ==========================================================================
// INICIALIZAÇÃO AUTOMÁTICA DO BUNDLE
// ==========================================================================
document.addEventListener('DOMContentLoaded', async () => {
    if (window.ItaimPerfilOrquestrador?.inicializar) {
        await window.ItaimPerfilOrquestrador.inicializar();
    }
});
