/**
 * ITAIM VENDE - LÓGICA DA PÁGINA PÚBLICA DO VENDEDOR (VENDEDOR.HTML)
 * Suporte completo a dados reais e fotos de perfil sincronizadas do banco de dados (Supabase PostgreSQL),
 * vitrine de produtos ativos, reputação, avaliações e contato via WhatsApp.
 */

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Obter parâmetros da URL
    const params = new URLSearchParams(window.location.search);
    const paramId = params.get('id') || params.get('sellerId') || params.get('userId');
    const paramEmail = (params.get('email') || '').toLowerCase().trim();
    const paramNome = (params.get('vendedor') || params.get('nome') || '').trim();
    const paramUsername = (params.get('username') || '').trim();

    const containerGrade = document.getElementById('grade-produtos-vendedor');
    const selectOrdem = document.getElementById('select-ordem-vendedor');

    // 0. Exibe skeleton nos produtos enquanto busca do backend
    if (window.ItaimSkeleton && typeof window.ItaimSkeleton.exibir === 'function' && containerGrade) {
        window.ItaimSkeleton.exibir(containerGrade, 'cards', 3);
    }

    // 2. Tentar buscar dados reais do vendedor e seus anúncios no Backend
    let vendedor = null;
    let anunciosVendedor = [];

    const identificador = paramId || paramEmail || paramUsername || paramNome;

    if (identificador && window.ItaimApi && window.ItaimApi.produtos && typeof window.ItaimApi.produtos.doVendedor === 'function') {
        try {
            const resVendedor = await window.ItaimApi.produtos.doVendedor(identificador);
            if (resVendedor && resVendedor.success && resVendedor.seller) {
                vendedor = resVendedor.seller;
                if (Array.isArray(resVendedor.products)) {
                    anunciosVendedor = resVendedor.products;
                }
            }
        } catch (errApi) {
            console.info('[Vendedor] Busca direta por doVendedor falhou:', errApi.message);
        }
    }

    // Se o vendedor não foi encontrado pelo endpoint do vendedor, tenta obter o perfil público por ID/Email
    if (!vendedor && (paramId || paramEmail) && window.ItaimApi && window.ItaimApi.auth && typeof window.ItaimApi.auth.obterUsuario === 'function') {
        try {
            const resUser = await window.ItaimApi.auth.obterUsuario(paramId || paramEmail);
            if (resUser && resUser.success && resUser.user) {
                vendedor = resUser.user;
                // Busca anúncios deste vendedor
                try {
                    const resAds = await window.ItaimApi.produtos.doVendedor(vendedor.id);
                    if (resAds && resAds.success && Array.isArray(resAds.products)) {
                        anunciosVendedor = resAds.products;
                    }
                } catch (eAds) {}
            }
        } catch (errUser) {
            console.info('[Vendedor] Busca de usuário falhou:', errUser.message);
        }
    }

    // 3. Fallback inteligente: busca em sessão local ou memória se o backend estiver offline
    let todosProdutosLocais = [];
    if (window.ItaimSessao && typeof window.ItaimSessao.obterTodosProdutos === 'function') {
        todosProdutosLocais = window.ItaimSessao.obterTodosProdutos();
    } else {
        try {
            todosProdutosLocais = JSON.parse(localStorage.getItem('itaim_produtos_cadastrados') || '[]');
        } catch(e) {}
    }

    if (!vendedor) {
        // Busca em todos os usuários gerenciados pela sessão
        if (window.ItaimSessao && typeof window.ItaimSessao.obterTodosUsuarios === 'function') {
            const usuarios = window.ItaimSessao.obterTodosUsuarios();
            if (paramId) {
                vendedor = usuarios.find(u => String(u.id) === String(paramId));
            }
            if (!vendedor && paramEmail) {
                vendedor = usuarios.find(u => (u.email || '').toLowerCase() === paramEmail);
            }
            if (!vendedor && paramNome) {
                const busca = paramNome.toLowerCase().trim();
                vendedor = usuarios.find(u => 
                    (u.name || u.nome || '').toLowerCase() === busca ||
                    (u.username || '').toLowerCase() === busca
                );
            }
        }

        // Busca em itaim_usuarios_db
        if (!vendedor) {
            try {
                const db = JSON.parse(localStorage.getItem('itaim_usuarios_db') || '[]');
                if (Array.isArray(db)) {
                    vendedor = db.find(u => 
                        (paramId && String(u.id) === String(paramId)) ||
                        (paramEmail && (u.email || '').toLowerCase() === paramEmail) ||
                        (paramNome && (u.nome || u.name || '').toLowerCase() === paramNome.toLowerCase())
                    );
                }
            } catch(e) {}
        }

        // Se ainda não encontrou, reconstrói pelos metadados dos produtos
        if (!vendedor && todosProdutosLocais.length > 0) {
            const prodMatch = todosProdutosLocais.find(p => {
                const pEmail = (p.vendedorEmail || '').toLowerCase();
                const pNome = (p.vendedorNome || p.vendedor || '').toLowerCase();
                const pId = String(p.vendedorId || p.sellerId || '');

                return (paramId && pId === String(paramId)) ||
                       (paramEmail && pEmail === paramEmail) || 
                       (paramNome && pNome === paramNome.toLowerCase());
            });

            if (prodMatch) {
                vendedor = {
                    id: prodMatch.vendedorId || prodMatch.sellerId || Date.now(),
                    name: prodMatch.vendedorNome || prodMatch.vendedor || 'Vendedor do Itaim Vende',
                    nome: prodMatch.vendedorNome || prodMatch.vendedor || 'Vendedor do Itaim Vende',
                    username: prodMatch.vendedorUsername || (prodMatch.vendedorEmail ? prodMatch.vendedorEmail.split('@')[0] : 'vendedor'),
                    email: prodMatch.vendedorEmail || '',
                    phone: prodMatch.vendedorTelefone || '(89) 99999-9999',
                    city: prodMatch.vendedorCidade || prodMatch.cidade || 'Paulistana',
                    avatar: prodMatch.vendedorAvatar || 'assets/icon-user.png',
                    bio: `Vendedor(a) na região de ${prodMatch.vendedorCidade || prodMatch.cidade || 'Paulistana'} e cidades vizinhas no Itaim Vende.`,
                    createdAt: '2024-01-01',
                    ratingAverage: 5.0,
                    ratingCount: 18,
                    salesCount: 12
                };
            }
        }
    }

    // Se ainda não tem anúncios carregados mas tem produtos locais
    if ((!anunciosVendedor || anunciosVendedor.length === 0) && todosProdutosLocais.length > 0) {
        anunciosVendedor = todosProdutosLocais.filter(p => {
            const pEmail = (p.vendedorEmail || '').toLowerCase().trim();
            const pNome = (p.vendedorNome || p.vendedor || '').toLowerCase().trim();
            const pId = String(p.vendedorId || p.sellerId || '');

            const vEmail = (vendedor?.email || paramEmail || '').toLowerCase().trim();
            const vNome = (vendedor?.name || vendedor?.nome || paramNome || '').toLowerCase().trim();
            const vId = String(vendedor?.id || paramId || '');

            return (vId && pId === vId) || 
                   (vEmail && pEmail === vEmail) || 
                   (vNome && pNome === vNome);
        });

        if (anunciosVendedor.length === 0 && (vendedor?.email === 'admin@gmail.com' || vendedor?.name === 'Raili' || paramNome.toLowerCase() === 'raili')) {
            anunciosVendedor = todosProdutosLocais;
        }
    }

    // Fallback final: cria objeto limpo se nenhum cadastro for encontrado
    if (!vendedor) {
        const nomeFinal = paramNome || (paramEmail ? paramEmail.split('@')[0] : 'Vendedor');
        vendedor = {
            id: paramId || Date.now(),
            name: nomeFinal,
            nome: nomeFinal,
            username: paramNome ? paramNome.toLowerCase().replace(/\s+/g, '') : (paramEmail ? paramEmail.split('@')[0] : 'vendedor'),
            email: paramEmail || '',
            phone: '(89) 99999-9999',
            city: 'Paulistana',
            avatar: 'assets/icon-user.png',
            bio: `Perfil de ${nomeFinal} na plataforma Itaim Vende.`,
            createdAt: '2024-01-01',
            ratingAverage: 5.0,
            ratingCount: 0,
            salesCount: 0
        };
    }

    // 4. Resolução da Foto Real do Vendedor (com suporte a /uploads/... do backend e localStorage)
    const fallbackAvatar = (window.ItaimRotas && typeof window.ItaimRotas.obterAsset === 'function')
        ? window.ItaimRotas.obterAsset('assets/icon-user.png')
        : '../../assets/icon-user.png';

    let rawAvatar = vendedor.avatar;

    // Se o avatar for o padrão, checa se há foto salva localmente no perfil
    if (!rawAvatar || rawAvatar === 'assets/icon-user.png') {
        try {
            const perfilSalvo = JSON.parse(localStorage.getItem('itaim_perfil_usuario') || 'null');
            if (perfilSalvo && perfilSalvo.avatar && perfilSalvo.avatar !== 'assets/icon-user.png') {
                const pEmail = (perfilSalvo.email || '').toLowerCase().trim();
                const vEmail = (vendedor.email || '').toLowerCase().trim();
                const pId = String(perfilSalvo.id || '');
                const vId = String(vendedor.id || '');
                if ((vEmail && pEmail === vEmail) || (vId && pId === vId)) {
                    rawAvatar = perfilSalvo.avatar;
                }
            }
        } catch(e) {}
    }

    const finalAvatar = (window.ItaimApi && typeof window.ItaimApi.resolverUrlImagem === 'function' && rawAvatar)
        ? window.ItaimApi.resolverUrlImagem(rawAvatar)
        : ((window.ItaimRotas && typeof window.ItaimRotas.obterAsset === 'function' && rawAvatar)
            ? window.ItaimRotas.obterAsset(rawAvatar)
            : (rawAvatar || fallbackAvatar));

    const elAvatar = document.getElementById('vendedor-avatar-img');
    if (elAvatar) {
        elAvatar.src = finalAvatar;
        elAvatar.alt = `Foto de ${vendedor.name || vendedor.nome}`;
        elAvatar.onerror = function() {
            this.onerror = null;
            this.src = fallbackAvatar;
        };
    }

    // 5. Preencher dados visuais do Vendedor na Página
    const nomeExibido = vendedor.name || vendedor.nome || 'Vendedor';
    document.title = `${nomeExibido} - Perfil do Vendedor - Itaim Vende`;

    const elBreadcrumbNome = document.getElementById('vendedor-breadcrumb-nome');
    if (elBreadcrumbNome) elBreadcrumbNome.textContent = nomeExibido;

    const elNome = document.getElementById('vendedor-nome-display');
    if (elNome) elNome.textContent = nomeExibido;

    const elUsername = document.getElementById('vendedor-username-display');
    if (elUsername) {
        const userSlug = vendedor.username || (vendedor.email ? vendedor.email.split('@')[0] : 'vendedor');
        elUsername.textContent = `@${userSlug}`;
    }

    const elSeloVerificado = document.getElementById('vendedor-selo-verificado');
    if (elSeloVerificado) {
        elSeloVerificado.style.display = (vendedor.isVerified || vendedor.role === 'ADMIN') ? 'inline-flex' : 'none';
    }

    const elBio = document.getElementById('vendedor-bio-display');
    if (elBio) {
        if (vendedor.bio) {
            elBio.textContent = vendedor.bio;
            elBio.style.display = 'block';
        } else {
            elBio.style.display = 'none';
        }
    }

    const elCidade = document.getElementById('vendedor-cidade-display');
    if (elCidade) {
        const cidadeNome = vendedor.city || vendedor.cidade || 'Paulistana';
        const estadoNome = vendedor.state || vendedor.estado || 'PI';
        elCidade.textContent = `${cidadeNome} - ${estadoNome}`;
    }

    const elData = document.getElementById('vendedor-data-display');
    if (elData) {
        const anoCriacao = vendedor.createdAt ? new Date(vendedor.createdAt).getFullYear() : '2024';
        elData.textContent = `Membro desde ${anoCriacao}`;
    }

    // Estatísticas nos cards
    const elStatAtivos = document.getElementById('stat-anuncios-ativos');
    if (elStatAtivos) elStatAtivos.textContent = anunciosVendedor.length;

    const elStatVendas = document.getElementById('stat-vendas-concluidas');
    if (elStatVendas) {
        const vendas = vendedor.salesCount !== undefined ? vendedor.salesCount : (vendedor.vendasConcluidas || 0);
        elStatVendas.textContent = vendas;
    }

    const elBadgeQtd = document.getElementById('vendedor-badge-qtd');
    if (elBadgeQtd) elBadgeQtd.textContent = `${anunciosVendedor.length} ${anunciosVendedor.length === 1 ? 'anúncio' : 'anúncios'}`;

    // Botão de Contato WhatsApp
    const btnWpp = document.getElementById('btn-vendedor-wpp');
    if (btnWpp) {
        let foneLimpo = String(vendedor.phone || vendedor.telefone || '8999985858').replace(/\D/g, '');
        if (foneLimpo.length === 10 || foneLimpo.length === 11) foneLimpo = '55' + foneLimpo;
        const msg = encodeURIComponent(`Olá ${nomeExibido}! Vi seu perfil de vendedor no portal Itaim Vende e gostaria de conversar sobre seus anúncios.`);
        btnWpp.href = `https://wa.me/${foneLimpo}?text=${msg}`;
    }

    // Botão Compartilhar Perfil
    const btnCompartilhar = document.getElementById('btn-vendedor-compartilhar');
    const toast = document.getElementById('vendedor-toast');

    btnCompartilhar?.addEventListener('click', () => {
        const link = window.location.href;
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(link).then(() => {
                exibirToast('Link do perfil copiado para a área de transferência! 📋');
            }).catch(() => {
                exibirToast('Perfil compartilhado com sucesso!');
            });
        } else {
            exibirToast('Link do perfil disponível na barra de endereços!');
        }
    });

    function exibirToast(msg) {
        if (!toast) return;
        toast.querySelector('.toast-texto').textContent = msg;
        toast.classList.add('visivel');
        setTimeout(() => {
            toast.classList.remove('visivel');
        }, 3200);
    }

    // 6. Renderização da Vitrine de Anúncios do Vendedor
    function formatarPreco(val) {
        if (val === 0 || val === '0' || val === null || val === undefined) {
            return '<span style="color: #44BD32; font-weight: 800;">Grátis / Doação</span>';
        }
        return Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    function renderizarAnuncios() {
        if (!containerGrade) return;
        containerGrade.innerHTML = '';

        let lista = [...anunciosVendedor];

        // Ordenação
        const ordem = selectOrdem?.value || 'recentes';
        if (ordem === 'menor-preco') {
            lista.sort((a, b) => (Number(a.preco || a.price) || 0) - (Number(b.preco || b.price) || 0));
        } else if (ordem === 'maior-preco') {
            lista.sort((a, b) => (Number(b.preco || b.price) || 0) - (Number(a.preco || a.price) || 0));
        }

        if (lista.length === 0) {
            containerGrade.innerHTML = `
                <div class="vendedor-anuncios-vazio" style="grid-column: 1 / -1; text-align: center; padding: 48px 20px; background: #F8FAFC; border-radius: 14px; border: 1px dashed #CBD5E1;">
                    <div class="vendedor-anuncios-vazio-icon" style="font-size: 40px; margin-bottom: 8px;">📦</div>
                    <h3 style="font-size: 17px; font-weight: 800; color: #1E293B; margin-bottom: 6px;">Nenhum anúncio ativo no momento</h3>
                    <p style="color: #64748B; font-size: 14px; margin: 0 auto; max-width: 420px;">Este anunciante ainda não possui outros produtos cadastrados ou os itens já foram vendidos.</p>
                </div>
            `;
            return;
        }

        const placeholderSrc = (window.ItaimRotas && typeof window.ItaimRotas.obterAsset === 'function')
            ? window.ItaimRotas.obterAsset('assets/produto-placeholder.svg')
            : '../../assets/produto-placeholder.svg';

        lista.forEach(item => {
            const card = document.createElement('a');
            const linkUrl = window.ItaimRotas 
                ? window.ItaimRotas.obterUrl('produto', `id=${item.id}`) 
                : `../produtos/produto.html?id=${item.id}`;
            card.href = linkUrl;
            card.className = 'card-produto-vendedor fade-in-content';

            const fotoBruta = item.imagem || (item.fotos && item.fotos[0]) || (item.images && item.images[0]) || '';
            const fotoImg = (window.ItaimApi && typeof window.ItaimApi.resolverUrlImagem === 'function' && fotoBruta)
                ? window.ItaimApi.resolverUrlImagem(fotoBruta)
                : (fotoBruta || placeholderSrc);

            const titulo = item.titulo || item.title || 'Anúncio';
            const precoFormatado = formatarPreco(item.preco !== undefined ? item.preco : item.price);
            const categoria = item.categoria || (item.category && item.category.name) || 'Geral';
            const cidadeItem = item.cidade || item.city || vendedor.city || 'Paulistana';

            card.innerHTML = `
                <div class="card-prod-foto-box">
                    <img src="${fotoImg}" alt="${titulo}" onerror="this.onerror=null; this.src='${placeholderSrc}'" loading="lazy">
                    <span class="card-prod-badge-cat">${categoria}</span>
                </div>
                <div class="card-prod-conteudo">
                    <div class="card-prod-preco">${precoFormatado}</div>
                    <h3 class="card-prod-titulo" title="${titulo}">${titulo}</h3>
                    <div class="card-prod-footer">
                        <span class="card-prod-loc">
                            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                            ${cidadeItem} - PI
                        </span>
                        <span style="color: #44BD32; font-weight: 700; font-size: 12px;">Ver anúncio &rarr;</span>
                    </div>
                </div>
            `;

            containerGrade.appendChild(card);
        });
    }

    selectOrdem?.addEventListener('change', renderizarAnuncios);
    renderizarAnuncios();

    // ========================================================================
    // 7. SISTEMA DE AVALIAÇÕES (0 A 5 ESTRELAS) E COMENTÁRIOS
    // ========================================================================
    const elReputacaoMedia = document.getElementById('stat-reputacao-media');
    const elReputacaoLegenda = document.getElementById('stat-reputacao-legenda');
    const elBadgeAvaliacoes = document.getElementById('badge-contador-avaliacoes');
    const containerAvaliacoes = document.getElementById('lista-avaliacoes-vendedor');

    const formAvaliacao = document.getElementById('form-nova-avaliacao');
    const inputNota = document.getElementById('input-nota-avaliacao');
    const inputAutor = document.getElementById('input-autor-avaliacao');
    const textareaComentario = document.getElementById('textarea-comentario');
    const labelNota = document.getElementById('label-nota-selecionada');
    const estrelasContainer = document.getElementById('estrelas-seletor');

    // Preenche o nome do autor com o usuário logado atualmente (se houver)
    const usuarioLogado = (window.ItaimSessao && typeof window.ItaimSessao.obterUsuarioLogado === 'function')
        ? window.ItaimSessao.obterUsuarioLogado()
        : null;

    if (inputAutor && usuarioLogado && (usuarioLogado.name || usuarioLogado.nome)) {
        inputAutor.value = usuarioLogado.name || usuarioLogado.nome;
    }

    function atualizarReputacaoELista() {
        if (!window.ItaimAvaliacoes) return;

        const lista = window.ItaimAvaliacoes.obter(vendedor);
        const stats = window.ItaimAvaliacoes.calcularMedia(lista, vendedor);

        const mediaTexto = stats.total > 0 ? stats.estrelasFormatadas : `${Number(vendedor.ratingAverage || 5.0).toFixed(1)} ★`;
        const totalReviews = stats.total > 0 ? stats.total : (vendedor.ratingCount || 0);

        if (elReputacaoMedia) elReputacaoMedia.textContent = mediaTexto;
        if (elReputacaoLegenda) elReputacaoLegenda.textContent = `Avaliações (${totalReviews})`;
        if (elBadgeAvaliacoes) elBadgeAvaliacoes.textContent = `${mediaTexto} (${totalReviews})`;

        // Renderiza lista de comentários
        if (containerAvaliacoes) {
            if (lista.length === 0) {
                containerAvaliacoes.innerHTML = `
                    <div class="avaliacoes-vazio" style="text-align: center; padding: 32px 18px; background: #F8FAFC; border-radius: 12px; border: 1px dashed #CBD5E1; margin-top: 10px;">
                        <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="#94A3B8" stroke-width="1.8" style="margin-bottom: 8px;">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                        <h4 style="font-size: 15px; font-weight: 700; color: #1E293B; margin: 0 0 6px;">Nenhuma avaliação ainda</h4>
                        <p style="font-size: 13.5px; color: #64748B; margin: 0;">Seja o primeiro a deixar uma avaliação e comentário sobre este vendedor!</p>
                    </div>
                `;
            } else {
                containerAvaliacoes.innerHTML = lista.map(item => {
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
                                    <button type="button" class="btn-excluir-avaliacao" data-id="${item.id}" title="Excluir este comentário">
                                        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                        <span>Excluir</span>
                                    </button>
                                </div>
                            </div>
                            <p class="avaliacao-comentario-txt" style="font-size: 13.5px; color: #475569; line-height: 1.5; margin: 4px 0 0 44px;">
                                ${item.comentario}
                            </p>
                        </div>
                    `;
                }).join('');

                containerAvaliacoes.querySelectorAll('.btn-excluir-avaliacao').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const id = btn.getAttribute('data-id');
                        if (btn.getAttribute('data-confirming') === 'true') {
                            if (window.ItaimAvaliacoes) {
                                window.ItaimAvaliacoes.excluir(vendedor, id);
                                atualizarReputacaoELista();
                                if (typeof exibirToast === 'function') {
                                    exibirToast('Comentário excluído com sucesso!');
                                }
                            }
                        } else {
                            btn.setAttribute('data-confirming', 'true');
                            btn.innerHTML = `
                                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                <span>Confirmar?</span>
                            `;
                            btn.style.backgroundColor = '#DC2626';
                            btn.style.color = '#FFFFFF';
                            btn.style.borderColor = '#B91C1C';

                            setTimeout(() => {
                                if (btn && btn.getAttribute('data-confirming') === 'true') {
                                    btn.removeAttribute('data-confirming');
                                    btn.innerHTML = `
                                        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                        <span>Excluir</span>
                                    `;
                                    btn.style.backgroundColor = '#FEF2F2';
                                    btn.style.color = '#EF4444';
                                    btn.style.borderColor = '#FECACA';
                                }
                            }, 4000);
                        }
                    });
                });
            }
        }
    }

    // Configura o seletor visual de estrelas (1 a 5)
    if (estrelasContainer) {
        const estrelas = estrelasContainer.querySelectorAll('.estrela-item');

        function destacarEstrelas(qtd) {
            estrelas.forEach(estrela => {
                const valor = parseInt(estrela.dataset.valor);
                if (valor <= qtd) {
                    estrela.classList.add('ativa');
                    estrela.style.color = '#F59E0B';
                } else {
                    estrela.classList.remove('ativa');
                    estrela.style.color = '#CBD5E1';
                }
            });
        }

        estrelas.forEach(estrela => {
            estrela.addEventListener('click', () => {
                const valor = parseInt(estrela.dataset.valor);
                if (inputNota) inputNota.value = valor;
                if (labelNota) labelNota.textContent = `(${valor}.0)`;
                destacarEstrelas(valor);
            });

            estrela.addEventListener('mouseenter', () => {
                const valor = parseInt(estrela.dataset.valor);
                destacarEstrelas(valor);
            });
        });

        estrelasContainer.addEventListener('mouseleave', () => {
            const notaAtual = parseInt(inputNota?.value || '5');
            destacarEstrelas(notaAtual);
        });
    }

    // Envio do formulário de avaliação
    if (formAvaliacao) {
        formAvaliacao.addEventListener('submit', (e) => {
            e.preventDefault();

            const nota = parseFloat(inputNota?.value || '5');
            const autor = inputAutor?.value.trim() || 'Visitante';
            const comentario = textareaComentario?.value.trim() || '';

            if (!comentario) {
                alert('Por favor, escreva um comentário sobre a sua negociação.');
                return;
            }

            if (window.ItaimAvaliacoes) {
                window.ItaimAvaliacoes.adicionar(vendedor, {
                    autor: autor,
                    nota: nota,
                    comentario: comentario
                });

                atualizarReputacaoELista();
                if (textareaComentario) textareaComentario.value = '';
                exibirToast('Avaliação enviada com sucesso!');
            }
        });
    }

    // Sincroniza nome do autor logado no formulário de avaliação do vendedor
    const usuarioAtual = (window.ItaimSessao && window.ItaimSessao.obterUsuarioLogado()) || {};
    const nomeLogadoVendedor = usuarioAtual.name || usuarioAtual.nome || usuarioAtual.username || 'Visitante';
    const labelAutorVendedor = document.getElementById('vendedor-nome-autor-logado');
    if (labelAutorVendedor) labelAutorVendedor.textContent = nomeLogadoVendedor;
    const inputAutorVendedor = document.getElementById('input-autor-avaliacao');
    if (inputAutorVendedor) inputAutorVendedor.value = nomeLogadoVendedor;

    // Carrega avaliações ao iniciar a página
    atualizarReputacaoELista();

    // 8. Sincronização do Header / Dropdown Usuário Logado
    if (window.ItaimSessao && typeof window.ItaimSessao.atualizarHeaderUsuario === 'function') {
        window.ItaimSessao.atualizarHeaderUsuario();
    }
});
