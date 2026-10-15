/**
 * ITAIM VENDE - LÓGICA DA PÁGINA DE PERFIL (PERFIL.HTML)
 * Suporte completo a dados reais do banco de dados (Supabase PostgreSQL),
 * sincronização em tempo real de foto de perfil (/uploads/...), anúncios e estatísticas.
 */

document.addEventListener('DOMContentLoaded', async () => {
    // Parâmetros da URL para perfil de outros vendedores
    const urlParams = new URLSearchParams(window.location.search);
    const paramEmail = (urlParams.get('email') || '').toLowerCase().trim();
    const paramNome = (urlParams.get('vendedor') || urlParams.get('nome') || '').trim();
    const paramId = urlParams.get('id');

    const isPerfilProprio = !paramEmail && !paramNome && !paramId;

    // Elementos DOM do Banner
    const nomeDisplay = document.getElementById('perfil-nome-display');
    const cidadeDisplay = document.getElementById('perfil-cidade-display');
    const dataDisplay = document.getElementById('perfil-data-display');
    const avatarImgView = document.getElementById('perfil-avatar-view');
    const btnCameraAvatar = document.querySelector('.btn-avatar-camera');
    const inputFotoAvatar = document.getElementById('input-foto-avatar');
    const breadcrumbCurrent = document.querySelector('.perfil-breadcrumb-current');
    const btnSairBanner = document.getElementById('btn-sair-banner');
    const boxContatoExterno = document.getElementById('box-contato-vendedor-externo');
    const btnWppExterno = document.getElementById('btn-whatsapp-perfil');
    const boxFormAvaliacao = document.getElementById('perfil-box-form-avaliacao');
    const alertaNaoLogado = document.getElementById('perfil-alerta-nao-logado');
    const userDisplayEl = document.getElementById('perfil-username-display');
    const bioDisplayEl = document.getElementById('perfil-bio-display');
    const seloVerifEl = document.getElementById('perfil-selo-verificado');

    // Elementos de Estatísticas
    const statAtivos = document.getElementById('stat-anuncios-ativos');
    const statAvaliacao = document.getElementById('stat-avaliacoes-texto');
    const statVendas = document.getElementById('stat-vendas-concluidas');
    const statLegenda = document.getElementById('stat-avaliacoes-legenda');
    const badgeAvaliacoes = document.getElementById('perfil-badge-avaliacoes');

    // Formulário de Dados Pessoais
    const nomeInput = document.getElementById('perfil-nome');
    const usuarioInput = document.getElementById('perfil-usuario');
    const emailInput = document.getElementById('perfil-email');
    const telefoneInput = document.getElementById('perfil-telefone');
    const cidadeInput = document.getElementById('perfil-cidade');
    const bairroInput = document.getElementById('perfil-bairro');
    const toast = document.getElementById('toast-sucesso');
    const gradeAnuncios = document.getElementById('grade-anuncios-perfil');
    const tituloSecaoAnuncios = document.getElementById('titulo-secao-anuncios');
    const subtituloSecaoAnuncios = document.getElementById('subtitulo-secao-anuncios');

    const fallbackAvatarPerfil = (window.ItaimRotas && typeof window.ItaimRotas.obterAsset === 'function')
        ? window.ItaimRotas.obterAsset('assets/icon-user.png')
        : '../../assets/icon-user.png';

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
        if (!toast) return;
        const span = toast.querySelector('span');
        if (span) span.textContent = mensagem;
        toast.classList.add('visivel');
        setTimeout(() => {
            toast.classList.remove('visivel');
        }, 3500);
    }

    // -------------------------------------------------------------------------
    // 1. CARREGAMENTO DOS DADOS DO PERFIL
    // -------------------------------------------------------------------------
    let perfilExibido = null;
    const token = window.ItaimApi?.auth?.obterToken();

    if (isPerfilProprio) {
        if (alertaNaoLogado) alertaNaoLogado.style.display = 'none';
        if (btnSairBanner) btnSairBanner.style.display = 'inline-flex';
        if (btnCameraAvatar) btnCameraAvatar.style.display = 'flex';
        if (boxContatoExterno) boxContatoExterno.style.display = 'none';
        if (boxFormAvaliacao) boxFormAvaliacao.style.display = 'none';

        // Mostra skeleton nos anúncios enquanto busca do backend
        if (window.ItaimSkeleton && typeof window.ItaimSkeleton.exibir === 'function' && gradeAnuncios) {
            window.ItaimSkeleton.exibir(gradeAnuncios, 'cards', 3);
        }

        // Se autenticado com token, busca dados reais e atualizados do backend
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

        // Se não obteve da API (sem token ou backend offline), usa dados locais / padrão
        if (!perfilExibido) {
            perfilExibido = (window.ItaimSessao && typeof window.ItaimSessao.obterUsuarioLogado === 'function')
                ? window.ItaimSessao.obterUsuarioLogado()
                : null;
        }

        if (!perfilExibido) {
            perfilExibido = {
                name: 'Raili S.',
                nome: 'Raili S.',
                email: 'admin@gmail.com',
                username: 'admin',
                city: 'Paulistana',
                cidade: 'Paulistana',
                neighborhood: 'Centro',
                phone: '(89) 99985-8585',
                avatar: 'assets/icon-user.png',
                bio: 'Comprador e vendedor ativo na região de Paulistana - PI.',
                isVerified: true
            };
        }
    } else {
        // Visualização do perfil de outro vendedor
        if (alertaNaoLogado) alertaNaoLogado.style.display = 'none';
        if (btnCameraAvatar) btnCameraAvatar.style.display = 'none';
        if (btnSairBanner) btnSairBanner.style.display = 'none';

        if (paramId) {
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
                avatar: 'assets/icon-user.png'
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

    // -------------------------------------------------------------------------
    // 2. ATUALIZAR INFORMAÇÕES VISUAIS DO BANNER
    // -------------------------------------------------------------------------
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

    if (seloVerifEl) {
        seloVerifEl.style.display = (perfilExibido.isVerified || perfilExibido.role === 'ADMIN') ? 'inline-flex' : 'none';
    }

    // Resolução da foto de perfil com suporte a /uploads/... do backend
    if (avatarImgView) {
        const rawAvatar = perfilExibido.avatar || 'assets/icon-user.png';
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

    // Preenche dados pessoais (modo somente leitura no perfil)
    if (nomeInput) nomeInput.value = nomePrincipal;
    if (usuarioInput) usuarioInput.value = perfilExibido.username || perfilExibido.usuario || '';
    if (emailInput) emailInput.value = perfilExibido.email || '';
    if (telefoneInput) telefoneInput.value = formatarTelefoneBR(perfilExibido.phone || perfilExibido.telefone || '');
    if (cidadeInput) cidadeInput.value = perfilExibido.city || perfilExibido.cidade || 'Paulistana';
    if (bairroInput) bairroInput.value = perfilExibido.neighborhood || perfilExibido.bairro || 'Centro';

    // -------------------------------------------------------------------------
    // 3. ESTATÍSTICAS REAIS (ANÚNCIOS, AVALIAÇÕES E VENDAS)
    // -------------------------------------------------------------------------
    const baseVendas = perfilExibido.salesCount !== undefined ? perfilExibido.salesCount : (perfilExibido.vendasConcluidas !== undefined ? perfilExibido.vendasConcluidas : 0);
    if (statVendas) statVendas.textContent = baseVendas;

    const qtdAvaliacoes = perfilExibido.ratingCount !== undefined ? perfilExibido.ratingCount : (perfilExibido.totalAvaliacoes || 0);
    const mediaAvaliacao = Number(perfilExibido.ratingAverage || perfilExibido.avaliacao || 5.0).toFixed(1);
    const avaliacaoFormatada = qtdAvaliacoes > 0 ? `${mediaAvaliacao} ★` : 'Novo';
    const legendaAvaliacao = qtdAvaliacoes > 0 ? `Avaliações (${qtdAvaliacoes})` : 'Sem avaliações';

    if (statAvaliacao) statAvaliacao.textContent = avaliacaoFormatada;
    if (statLegenda) statLegenda.textContent = legendaAvaliacao;
    if (badgeAvaliacoes) badgeAvaliacoes.textContent = `${avaliacaoFormatada} (${qtdAvaliacoes})`;

    // -------------------------------------------------------------------------
    // 4. ANÚNCIOS REAIS DO USUÁRIO
    // -------------------------------------------------------------------------
    if (tituloSecaoAnuncios) {
        tituloSecaoAnuncios.textContent = isPerfilProprio ? 'Meus Anúncios Publicados' : `Anúncios de ${nomePrincipal}`;
    }
    if (subtituloSecaoAnuncios) {
        subtituloSecaoAnuncios.textContent = isPerfilProprio
            ? 'Esses são os anúncios do seu perfil visíveis para outros compradores no Itaim Vende.'
            : `Todos os produtos anunciados por ${nomePrincipal} disponíveis para negociação.`;
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

    // Renderiza os cards de produtos
    if (gradeAnuncios) {
        if (!listaAnuncios || listaAnuncios.length === 0) {
            gradeAnuncios.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 44px 20px; background: #F8FAFC; border-radius: 14px; border: 1px dashed #CBD5E1;">
                    <div style="font-size: 40px; margin-bottom: 8px;">📦</div>
                    <h3 style="font-size: 17px; font-weight: 800; color: #1E293B; margin-bottom: 6px;">Nenhum anúncio ativo no momento</h3>
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
                ? window.ItaimRotas.obterAsset('assets/produto-placeholder.svg')
                : '../../assets/produto-placeholder.svg';

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

    // -------------------------------------------------------------------------
    // 5. UPLOAD DE FOTO DE PERFIL (PROFISSIONAL MULTIPART + ATUALIZAÇÃO NO BD)
    // -------------------------------------------------------------------------
    if (inputFotoAvatar && avatarImgView) {
        inputFotoAvatar.addEventListener('change', (e) => {
            const file = e.target.files && e.target.files[0];
            if (!file) return;

            const salvarFoto = async (novaFoto) => {
                // Atualização visual imediata (otimista)
                if (typeof novaFoto === 'string') {
                    avatarImgView.src = novaFoto;
                }

                // Upload profissional para o backend Express / Supabase
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
                                window.ItaimSessao.atualizarDadosUsuario(perfilExibido.email, { avatar: urlFotoServidor });
                            }
                            if (window.ItaimSessao && typeof window.ItaimSessao.atualizarHeaderUsuario === 'function') {
                                window.ItaimSessao.atualizarHeaderUsuario();
                            }

                            perfilExibido.avatar = urlFotoServidor;
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
                        window.ItaimSessao.atualizarDadosUsuario(perfilExibido.email, { avatar: novaFoto });
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

    // -------------------------------------------------------------------------
    // 6. AVALIAÇÕES RECEBIDAS
    // -------------------------------------------------------------------------
    function renderizarAvaliacoesPerfil() {
        if (!window.ItaimAvaliacoes) return;
        const avaliacoes = window.ItaimAvaliacoes.obter(perfilExibido);
        const stats = window.ItaimAvaliacoes.calcularMedia(avaliacoes, perfilExibido);
        const totalReviews = stats.total > 0 ? stats.total : qtdAvaliacoes;
        const valorFormatado = stats.total > 0 ? stats.estrelasFormatadas : avaliacaoFormatada;

        if (statAvaliacao) statAvaliacao.textContent = valorFormatado;
        if (statLegenda) statLegenda.textContent = `Avaliações (${totalReviews})`;
        if (badgeAvaliacoes) badgeAvaliacoes.textContent = `${valorFormatado} (${totalReviews})`;

        const container = document.getElementById('lista-avaliacoes-perfil');
        if (!container) return;

        if (avaliacoes.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 32px 18px; background: #F8FAFC; border-radius: 12px; border: 1px dashed #CBD5E1;">
                    <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="#94A3B8" stroke-width="1.8" style="margin-bottom: 8px;">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                    <h4 style="font-size: 15px; font-weight: 700; color: #1E293B; margin: 0 0 6px;">Nenhuma avaliação ainda</h4>
                    <p style="font-size: 13.5px; color: #64748B; margin: 0;">As avaliações e comentários deixados por compradores aparecerão aqui.</p>
                </div>
            `;
        } else {
            container.innerHTML = avaliacoes.map(item => {
                const notaNum = Math.round(item.nota || 5);
                const estrelasTxt = '★'.repeat(notaNum) + '☆'.repeat(5 - notaNum);
                const inicial = (item.autor || 'C').charAt(0).toUpperCase();

                return `
                    <div class="item-avaliacao-card" style="padding: 14px 0; border-bottom: 1px solid #F1F5F9;">
                        <div class="avaliacao-topo-row" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; flex-wrap: wrap; gap: 8px;">
                            <div class="avaliacao-autor-box" style="display: flex; align-items: center; gap: 10px;">
                                <div class="avaliacao-avatar-mini" style="width: 34px; height: 34px; border-radius: 50%; background: #DCFCE7; color: #166534; font-weight: 800; display: flex; align-items: center; justify-content: center; font-size: 14px; border: 1px solid #BBF7D0;">
                                    ${inicial}
                                </div>
                                <div>
                                    <div class="avaliacao-autor-nome" style="font-weight: 700; font-size: 13.5px; color: #1E293B;">
                                        ${item.autor}
                                    </div>
                                    <div style="font-size: 11.5px; color: #94A3B8;">
                                        ${item.data || 'Recente'}
                                    </div>
                                </div>
                            </div>
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <div class="avaliacao-estrelas" style="color: #F59E0B; font-size: 14px; letter-spacing: 2px;">
                                    ${estrelasTxt} <span style="font-size: 12px; font-weight: 700; color: #64748B;">(${Number(item.nota).toFixed(1)})</span>
                                </div>
                            </div>
                        </div>
                        <p class="avaliacao-comentario-txt" style="font-size: 13.5px; color: #475569; line-height: 1.5; margin: 4px 0 0 44px;">
                            ${item.comentario}
                        </p>
                    </div>
                `;
            }).join('');
        }
    }

    renderizarAvaliacoesPerfil();

    // Formulário de nova avaliação no perfil
    const formAvaliacaoPerfil = document.getElementById('perfil-form-nova-avaliacao');
    if (formAvaliacaoPerfil) {
        formAvaliacaoPerfil.addEventListener('submit', (e) => {
            e.preventDefault();
            const inputNotaPerfil = document.getElementById('perfil-input-nota');
            const nota = parseFloat(inputNotaPerfil?.value || '5');
            const inputAutor = document.getElementById('perfil-input-autor');
            const textarea = document.getElementById('perfil-textarea-comentario');
            const autor = inputAutor?.value.trim() || 'Comprador';
            const comentario = textarea?.value.trim() || '';

            if (!comentario) {
                alert('Por favor, escreva um comentário sobre a sua experiência.');
                return;
            }

            if (window.ItaimAvaliacoes) {
                window.ItaimAvaliacoes.adicionar(perfilExibido, {
                    autor: autor,
                    nota: nota,
                    comentario: comentario
                });

                renderizarAvaliacoesPerfil();
                if (textarea) textarea.value = '';
                exibirToast('Avaliação enviada com sucesso!');
            }
        });
    }
});
