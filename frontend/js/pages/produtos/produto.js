/**
 * ITAIM VENDE - LÓGICA DA PÁGINA DO PRODUTO (PRODUTO.HTML)
 * Carrega dados dinâmicos do anúncio selecionado, fotos, favoritos, WhatsApp e perfil do vendedor
 */

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Obter ID do Produto via URL (suporta ?id=, ?produto=, ?slug= e #hash)
    const params = new URLSearchParams(window.location.search);
    let produtoIdParam = params.get('id') || params.get('produto') || params.get('slug');
    if (!produtoIdParam && window.location.hash) {
        produtoIdParam = window.location.hash.replace(/^#/, '');
    }

    // 2. Carregar produtos através da sessão ou dados iniciais (fallback local)
    let todosProdutos = [];
    if (window.ItaimSessao && typeof window.ItaimSessao.obterTodosProdutos === 'function') {
        todosProdutos = window.ItaimSessao.obterTodosProdutos();
    } else {
        if (typeof PRODUTOS_INICIAIS !== 'undefined' && Array.isArray(PRODUTOS_INICIAIS)) {
            todosProdutos = [...PRODUTOS_INICIAIS];
        }
        try {
            const produtosLocais = JSON.parse(localStorage.getItem('itaim_produtos_cadastrados') || '[]');
            if (Array.isArray(produtosLocais)) {
                todosProdutos = [...produtosLocais, ...todosProdutos];
            }
        } catch (e) {}
    }

    // 3. Encontrar o produto selecionado
    let produto = null;

    // 3.1 Busca Direta na API por ID ou Slug
    if (produtoIdParam && window.ItaimApi && typeof window.ItaimApi.produtos.obter === 'function') {
        try {
            const resApi = await window.ItaimApi.produtos.obter(produtoIdParam);
            if (resApi && resApi.success && resApi.data) {
                produto = resApi.data;
            }
        } catch (errApi) {
            console.info('[Produto] Busca direta por ID falhou, buscando na listagem da vitrine.');
        }
    }

    // 3.2 Se não encontrou por ID direto, busca na vitrine pública da API
    if (!produto && window.ItaimApi && typeof window.ItaimApi.produtos.listar === 'function') {
        try {
            const resList = await window.ItaimApi.produtos.listar();
            if (resList && resList.success && Array.isArray(resList.data) && resList.data.length > 0) {
                if (produtoIdParam) {
                    produto = resList.data.find(p => 
                        String(p.id) === String(produtoIdParam) || 
                        String(p.slug) === String(produtoIdParam)
                    );
                }
            }
        } catch (errList) {
            console.info('[Produto] API indisponível, buscando no cache local.');
        }
    }

    // 3.3 Fallback em cache local / mock (se produtoIdParam foi informado)
    if (!produto && produtoIdParam) {
        produto = todosProdutos.find(p => 
            String(p.id) === String(produtoIdParam) ||
            String(p.slug) === String(produtoIdParam) ||
            (p.titulo && String(p.titulo).toLowerCase() === String(produtoIdParam).toLowerCase())
        );
    }

    // 3.4 APENAS se o usuário entrou direto na página sem nenhum parâmetro (?id=...)
    if (!produto && !produtoIdParam) {
        if (window.ItaimApi && typeof window.ItaimApi.produtos.listar === 'function') {
            try {
                const resList = await window.ItaimApi.produtos.listar();
                if (resList && resList.success && Array.isArray(resList.data) && resList.data.length > 0) {
                    produto = resList.data[0];
                }
            } catch (errFallback) {}
        }
        if (!produto && todosProdutos.length > 0) {
            produto = todosProdutos[0];
        }
    }

    if (!produto) {
        document.body.innerHTML = `
            <div style="text-align: center; padding: 80px 20px; font-family: 'Plus Jakarta Sans', sans-serif;">
                <div style="font-size: 48px; margin-bottom: 12px;">📦</div>
                <h2 style="font-size: 24px; color: #1E293B; font-weight: 800; margin-bottom: 8px;">Nenhum anúncio disponível</h2>
                <p style="color: #64748B; font-size: 15px; margin: 0 auto 24px; max-width: 450px;">Ainda não há produtos à venda no momento ou o anúncio solicitado foi encerrado.</p>
                <a href="${window.ItaimRotas ? window.ItaimRotas.obterUrl('home') : '../home/home.html'}" style="background: #44BD32; color: #fff; padding: 12px 28px; text-decoration: none; border-radius: 30px; font-weight: 700; font-size: 15px; display: inline-block;">
                    ← Voltar para a Página Inicial
                </a>
            </div>
        `;
        return;
    }

    // 4. Formatação de Preço
    function formatarPreco(val) {
        if (val === 0 || val === '0' || val === null || val === undefined) {
            return '<span style="color: #44BD32; font-weight: 800;">Grátis / Doação</span>';
        }
        return Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    // 5. Preencher Informações na Página
    document.title = `${produto.titulo} - Itaim Vende`;

    const elTitulo = document.getElementById('produto-titulo');
    if (elTitulo) elTitulo.textContent = produto.titulo;

    const elPreco = document.getElementById('preco-valor');
    if (elPreco) elPreco.innerHTML = formatarPreco(produto.preco);

    const elLoc = document.getElementById('produto-localizacao');
    if (elLoc) {
        elLoc.innerHTML = `
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            <span>${produto.cidade || 'Paulistana'} - PI</span>
        `;
    }

    const elDescCurta = document.getElementById('descricao-curta-texto');
    if (elDescCurta && produto.descricao) {
        elDescCurta.textContent = produto.descricao;
    }

    const elCondicao = document.getElementById('espec-condicao');
    if (elCondicao && produto.condicao) {
        elCondicao.textContent = produto.condicao;
    }

    const elCategoria = document.getElementById('espec-categoria');
    if (elCategoria && produto.categoria) {
        elCategoria.textContent = produto.categoria;
    }

    const elSobreTexto = document.getElementById('sobre-anuncio-desc-texto');
    if (elSobreTexto && produto.descricao) {
        elSobreTexto.textContent = produto.descricao;
    }

    const elDescCompleta = document.getElementById('descricao-conteudo');
    if (elDescCompleta && produto.descricao) {
        elDescCompleta.innerHTML = produto.descricao.replace(/\n/g, '<br>');
    }

    // Breadcrumbs dinâmico
    const breadcrumbLista = document.querySelector('.breadcrumb-ref-lista');
    if (breadcrumbLista && produto.categoria) {
        breadcrumbLista.innerHTML = `
            <li><a href="${window.ItaimRotas ? window.ItaimRotas.obterUrl('home') : '../home/home.html'}" class="breadcrumb-home-link" title="Página Inicial">Início</a></li>
            <li class="sep">&gt;</li>
            <li><a href="${window.ItaimRotas ? window.ItaimRotas.obterUrl('categoria', `cat=${encodeURIComponent(produto.categoria)}`) : `categoria.html?cat=${encodeURIComponent(produto.categoria)}`}">${produto.categoria}</a></li>
            <li class="sep">&gt;</li>
            <li class="atual" style="max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${produto.titulo}</li>
        `;
    }

    // 6. Carrossel de Imagens Dinâmico para o Produto Selecionado
    let fotosCarrossel = [];
    const placeholderAsset = (window.ItaimRotas && typeof window.ItaimRotas.obterAsset === 'function')
        ? window.ItaimRotas.obterAsset('assets/produto-placeholder.svg')
        : '../../assets/produto-placeholder.svg';

    if (Array.isArray(produto.fotos) && produto.fotos.length > 0) {
        fotosCarrossel = [...produto.fotos];
    } else if (Array.isArray(produto.images) && produto.images.length > 0) {
        fotosCarrossel = [...produto.images];
    } else if (produto.imagem) {
        fotosCarrossel = [produto.imagem];
    } else {
        fotosCarrossel = [placeholderAsset];
    }

    if (window.ItaimApi && typeof window.ItaimApi.resolverUrlImagem === 'function') {
        fotosCarrossel = fotosCarrossel.map(src => window.ItaimApi.resolverUrlImagem(src));
    }

    let fotoAtualIndex = 0;
    const fotoDisplay = document.getElementById('foto-principal-img');
    if (fotoDisplay) {
        fotoDisplay.onerror = function() {
            this.onerror = null;
            this.src = placeholderAsset;
        };
    }
    const contadorTexto = document.getElementById('contador-fotos-texto');
    const btnCarrosselPrev = document.getElementById('btn-carrossel-prev');
    const btnCarrosselNext = document.getElementById('btn-carrossel-next');
    const miniaturasRow = document.getElementById('miniaturas-row');

    // Renderiza miniaturas do produto atual
    if (miniaturasRow) {
        miniaturasRow.innerHTML = '';
        fotosCarrossel.forEach((src, idx) => {
            const thumb = document.createElement('div');
            thumb.className = `thumb-box ${idx === 0 ? 'ativa' : ''}`;
            thumb.dataset.index = idx;
            thumb.dataset.src = src;
            thumb.title = `Foto ${idx + 1}`;
            thumb.innerHTML = `<img src="${src}" alt="Miniatura ${idx + 1}" onerror="this.onerror=null; this.src='${placeholderAsset}'">`;
            thumb.addEventListener('click', () => {
                exibirFotoIndex(idx);
            });
            miniaturasRow.appendChild(thumb);
        });
    }

    function exibirFotoIndex(idx) {
        fotoAtualIndex = (idx + fotosCarrossel.length) % fotosCarrossel.length;
        if (fotoDisplay) {
            fotoDisplay.src = fotosCarrossel[fotoAtualIndex];
            fotoDisplay.alt = produto.titulo;
        }
        const bgBlur = document.getElementById('foto-bg-blur');
        if (bgBlur) {
            bgBlur.style.backgroundImage = `url("${fotosCarrossel[fotoAtualIndex]}")`;
        }
        if (contadorTexto) {
            contadorTexto.textContent = `${fotoAtualIndex + 1}/${fotosCarrossel.length}`;
        }
        const thumbs = miniaturasRow ? miniaturasRow.querySelectorAll('.thumb-box') : [];
        thumbs.forEach((tb) => {
            const tbIdx = parseInt(tb.getAttribute('data-index') || '0', 10);
            tb.classList.toggle('ativa', tbIdx === fotoAtualIndex);
        });
    }

    // Exibe primeira foto
    exibirFotoIndex(0);

    btnCarrosselPrev?.addEventListener('click', (e) => {
        e.preventDefault();
        exibirFotoIndex(fotoAtualIndex - 1);
    });

    btnCarrosselNext?.addEventListener('click', (e) => {
        e.preventDefault();
        exibirFotoIndex(fotoAtualIndex + 1);
    });

    // 7. Dados do Vendedor no Sidebar
    let dadosVendedor = null;
    const fallbackAvatarVendedor = (window.ItaimRotas && typeof window.ItaimRotas.obterAsset === 'function')
        ? window.ItaimRotas.obterAsset('assets/icon-user.png')
        : '../../assets/icon-user.png';
    let avatarVendedor = fallbackAvatarVendedor;
    const boxVendedor = document.querySelector('.box-vendedor-sidebar');
    if (boxVendedor) {
        const nomeVendedorEl = document.getElementById('vendedor-nome-txt') || boxVendedor.querySelector('.vendedor-nome-selo strong');
        const cidadeVendedorEl = document.getElementById('vendedor-cidade-txt') || boxVendedor.querySelector('.vendedor-cidade-txt');
        const avatarVendedorEl = document.getElementById('vendedor-avatar-img') || boxVendedor.querySelector('.vendedor-avatar-circulo img');
        const linkPerfilVendedor = document.getElementById('link-perfil-vendedor') || boxVendedor.querySelector('.link-perfil-vendedor');
        const linkTopoVendedor = document.getElementById('link-vendedor-topo') || boxVendedor.querySelector('.vendedor-topo-row-link');

        // Busca o vendedor no banco de usuários para obter a foto de perfil real e mais recente
        if (produto.seller && typeof produto.seller === 'object') {
            dadosVendedor = produto.seller;
        }

        const vId = produto.vendedorId ? String(produto.vendedorId) : null;
        const vEmail = (produto.vendedorEmail || '').toLowerCase().trim();
        const vNome = (produto.vendedorNome || '').toLowerCase().trim();
        const vUsername = (produto.vendedorUsername || '').toLowerCase().trim();

        // 1. Procura em todos os usuários gerenciados pela sessão
        if (!dadosVendedor && window.ItaimSessao && typeof window.ItaimSessao.obterTodosUsuarios === 'function') {
            const todosUsuarios = window.ItaimSessao.obterTodosUsuarios();
            dadosVendedor = todosUsuarios.find(u => {
                const uId = String(u.id || '');
                const uEmail = (u.email || '').toLowerCase().trim();
                const uNome = (u.nome || '').toLowerCase().trim();
                const uUser = (u.username || '').toLowerCase().trim();
                return (vId && uId === vId) ||
                       (vEmail && uEmail === vEmail) ||
                       (vNome && (uNome === vNome || uUser === vNome)) ||
                       (vUsername && (uUser === vUsername || uNome === vUsername));
            });
        }

        // 2. Se não achou na lista em memória, busca no localStorage (itaim_usuarios_db)
        if (!dadosVendedor) {
            try {
                const db = JSON.parse(localStorage.getItem('itaim_usuarios_db') || '[]');
                if (Array.isArray(db)) {
                    dadosVendedor = db.find(u => {
                        const uId = String(u.id || '');
                        const uEmail = (u.email || '').toLowerCase().trim();
                        const uNome = (u.nome || '').toLowerCase().trim();
                        const uUser = (u.username || '').toLowerCase().trim();
                        return (vId && uId === vId) ||
                               (vEmail && uEmail === vEmail) ||
                               (vNome && (uNome === vNome || uUser === vNome)) ||
                               (vUsername && (uUser === vUsername || uNome === vUsername));
                    });
                }
            } catch(e) {}
        }

        // 3. Se ainda não achou, checa itaim_perfil_usuario (perfil salvo no navegador)
        if (!dadosVendedor) {
            try {
                const perfilLocal = JSON.parse(localStorage.getItem('itaim_perfil_usuario') || 'null');
                if (perfilLocal) {
                    const uId = String(perfilLocal.id || '');
                    const uEmail = (perfilLocal.email || '').toLowerCase().trim();
                    const uNome = (perfilLocal.nome || '').toLowerCase().trim();
                    const uUser = (perfilLocal.usuario || perfilLocal.username || '').toLowerCase().trim();
                    if ((vId && uId === vId) ||
                        (vEmail && uEmail === vEmail) ||
                        (vNome && (uNome === vNome || uUser === vNome)) ||
                        (vUsername && (uUser === vUsername || uNome === vUsername))) {
                        dadosVendedor = perfilLocal;
                    }
                }
            } catch(e) {}
        }

        // 4. Se o usuário logado atualmente for o criador do anúncio
        if (!dadosVendedor && window.ItaimSessao && typeof window.ItaimSessao.obterUsuarioLogado === 'function') {
            const userLogado = window.ItaimSessao.obterUsuarioLogado();
            if (userLogado) {
                const uId = String(userLogado.id || '');
                const uEmail = (userLogado.email || '').toLowerCase().trim();
                const uNome = (userLogado.nome || '').toLowerCase().trim();
                const uUser = (userLogado.username || '').toLowerCase().trim();
                if ((vId && uId === vId) ||
                    (vEmail && uEmail === vEmail) ||
                    (vNome && (uNome === vNome || uUser === vNome)) ||
                    (vUsername && (uUser === vUsername || uNome === vUsername))) {
                    dadosVendedor = userLogado;
                }
            }
        }

        const nomeVendedor = (dadosVendedor && dadosVendedor.nome) || produto.vendedorNome || 'Raili';
        const cidadeVendedor = (dadosVendedor && dadosVendedor.cidade) || produto.vendedorCidade || produto.cidade || 'Paulistana';
        
        // Foto de perfil real do vendedor: prioriza foto personalizada do perfil do usuário
        if (dadosVendedor && dadosVendedor.avatar) {
            avatarVendedor = (window.ItaimRotas && typeof window.ItaimRotas.obterAsset === 'function')
                ? window.ItaimRotas.obterAsset(dadosVendedor.avatar)
                : dadosVendedor.avatar;
        } else if (produto.vendedorAvatar) {
            avatarVendedor = (window.ItaimRotas && typeof window.ItaimRotas.obterAsset === 'function')
                ? window.ItaimRotas.obterAsset(produto.vendedorAvatar)
                : produto.vendedorAvatar;
        }

        if (nomeVendedorEl) nomeVendedorEl.textContent = nomeVendedor;
        if (cidadeVendedorEl) cidadeVendedorEl.textContent = `${cidadeVendedor} - PI`;
        if (avatarVendedorEl) {
            avatarVendedorEl.src = avatarVendedor || fallbackAvatarVendedor;
            avatarVendedorEl.alt = `Foto de ${nomeVendedor}`;
            avatarVendedorEl.onerror = function() {
                this.onerror = null;
                this.src = fallbackAvatarVendedor;
            };
        }

        // URL para o perfil público do vendedor com todos os identificadores
        const emailParam = (dadosVendedor && dadosVendedor.email) || produto.vendedorEmail || '';
        const idParam = (dadosVendedor && dadosVendedor.id) || produto.vendedorId || '';
        const urlVendedor = (window.ItaimRotas ? window.ItaimRotas.obterUrl('vendedor', `email=${encodeURIComponent(emailParam)}&vendedor=${encodeURIComponent(nomeVendedor)}&id=${encodeURIComponent(idParam)}`) : `../perfil/vendedor.html?email=${encodeURIComponent(emailParam)}&vendedor=${encodeURIComponent(nomeVendedor)}&id=${encodeURIComponent(idParam)}`);

        if (linkPerfilVendedor) {
            linkPerfilVendedor.href = urlVendedor;
        }
        if (linkTopoVendedor) {
            linkTopoVendedor.href = urlVendedor;
        }

        // Torna toda a área do vendedor clicável e funcional
        const avatarBox = boxVendedor.querySelector('.vendedor-avatar-circulo');
        if (avatarBox) {
            avatarBox.style.cursor = 'pointer';
            avatarBox.title = `Ver perfil de ${nomeVendedor}`;
            avatarBox.onclick = (e) => {
                e.preventDefault();
                window.location.href = urlVendedor;
            };
        }
        const nomeBox = boxVendedor.querySelector('.vendedor-nome-selo');
        if (nomeBox) {
            nomeBox.style.cursor = 'pointer';
            nomeBox.title = `Ver perfil de ${nomeVendedor}`;
            nomeBox.onclick = (e) => {
                e.preventDefault();
                window.location.href = urlVendedor;
            };
        }
    }

    // 8. Botão Iniciar Chat com o Vendedor
    const btnChatVendedor = document.getElementById('btn-chat-vendedor');
    if (btnChatVendedor) {
        btnChatVendedor.addEventListener('click', (e) => {
            e.preventDefault();

            const usuarioLogado = window.ItaimSessao ? window.ItaimSessao.obterUsuarioLogado() : {
                id: 'cmv5iacmv0000ttiwu9wtemar',
                nome: 'Raili',
                email: 'admin@gmail.com',
                avatar: fallbackAvatarVendedor
            };

            const vendedorEmailFinal = ((dadosVendedor && dadosVendedor.email) || produto.vendedorEmail || 'admin@gmail.com').toLowerCase().trim();
            const vendedorNomeFinal = (dadosVendedor && dadosVendedor.nome) || produto.vendedorNome || 'Vendedor';
            const vendedorAvatarFinal = avatarVendedor || fallbackAvatarVendedor;
            const userEmailLogado = (usuarioLogado.email || '').toLowerCase().trim();

            let vendedorEmailUsado = vendedorEmailFinal;
            let vendedorNomeUsado = vendedorNomeFinal;
            let vendedorAvatarUsado = vendedorAvatarFinal;

            if (userEmailLogado && vendedorEmailUsado && userEmailLogado === vendedorEmailUsado) {
                // Se for o autor testando no próprio anúncio, direciona para o chat com interlocutor do anúncio
                vendedorEmailUsado = 'anunciante_' + vendedorEmailUsado;
                vendedorNomeUsado = vendedorNomeFinal + ' (Vendedor)';
            }

            let conversas = [];
            try {
                conversas = JSON.parse(localStorage.getItem('itaim_conversas') || '[]');
            } catch (err) {
                conversas = [];
            }

            const pId = String(produto.id || '');
            let convExistente = conversas.find(c => {
                const mesmoProduto = String(c.produtoId || '') === pId;
                const cComprador = (c.compradorEmail || '').toLowerCase().trim();
                const cVendedor = (c.vendedorEmail || '').toLowerCase().trim();
                return mesmoProduto && (
                    (cComprador === userEmailLogado && cVendedor === vendedorEmailUsado) ||
                    (cComprador === vendedorEmailUsado && cVendedor === userEmailLogado)
                );
            });

            if (convExistente) {
                window.location.href = (window.ItaimRotas ? window.ItaimRotas.obterUrl('conversas', `id=${convExistente.id}`) : `../mensagens/conversas.html?id=${convExistente.id}`);
            } else {
                const agora = new Date();
                const horaStr = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                const novaConversa = {
                    id: 'conv_' + Date.now(),
                    produtoId: pId,
                    produto: {
                        id: pId,
                        titulo: produto.titulo,
                        preco: produto.preco,
                        imagem: fotosCarrossel[0] || produto.imagem || 'assets/produto-placeholder.svg',
                        cidade: produto.cidade || 'Paulistana',
                        condicao: produto.condicao || 'Usado',
                        categoria: produto.categoria || 'Geral',
                        descricao: produto.descricao || ''
                    },
                    compradorEmail: usuarioLogado.email || 'admin@gmail.com',
                    compradorNome: usuarioLogado.nome || 'Comprador',
                    compradorAvatar: (window.ItaimRotas && usuarioLogado.avatar ? window.ItaimRotas.obterAsset(usuarioLogado.avatar) : fallbackAvatarVendedor),
                    vendedorEmail: vendedorEmailUsado,
                    vendedorNome: vendedorNomeUsado,
                    vendedorAvatar: vendedorAvatarUsado,
                    mensagens: [],
                    ultimaMensagemTexto: 'Conversa iniciada',
                    ultimaMensagemHora: horaStr,
                    dataCriacao: agora.toISOString()
                };

                conversas.unshift(novaConversa);
                localStorage.setItem('itaim_conversas', JSON.stringify(conversas));
                window.location.href = (window.ItaimRotas ? window.ItaimRotas.obterUrl('conversas', `id=${novaConversa.id}`) : `../mensagens/conversas.html?id=${novaConversa.id}`);
            }
        });
    }

    // 8.2 Botão WhatsApp (com mensagem personalizada)
    const btnWpp = document.getElementById('btn-comprar-wpp');
    if (btnWpp) {
        let telVendedor = (produto.vendedorTelefone || (dadosVendedor && (dadosVendedor.phone || dadosVendedor.telefone)) || '5589999985858').replace(/\D/g, '');
        if (telVendedor.length === 10 || telVendedor.length === 11) telVendedor = '55' + telVendedor;
        const precoTexto = (produto.preco && produto.preco > 0) 
            ? `por R$ ${Number(produto.preco).toFixed(2).replace('.', ',')}` 
            : 'para doação/troca';
        const msg = encodeURIComponent(
            `Olá! Vi seu anúncio no Itaim Vende:\n"${produto.titulo}" (${precoTexto})\n` +
            `Ainda está disponível? Tenho interesse!`
        );
        btnWpp.href = `https://wa.me/${telVendedor}?text=${msg}`;
    }

    // 9. Favoritos
    let favoritosSet = new Set();
    try {
        const salvos = JSON.parse(localStorage.getItem('itaim_favoritos') || '[]');
        if (Array.isArray(salvos)) favoritosSet = new Set(salvos);
    } catch (e) {}

    const btnFavorito = document.getElementById('btn-favoritar-detalhe');

    function atualizarEstadoFavorito() {
        const isFav = favoritosSet.has(produto.id);
        btnFavorito?.classList.toggle('ativo', isFav);
    }
    atualizarEstadoFavorito();

    function alternarFavorito() {
        if (favoritosSet.has(produto.id)) {
            favoritosSet.delete(produto.id);
            mostrarToast('Removido dos favoritos');
        } else {
            favoritosSet.add(produto.id);
            mostrarToast('Salvo nos seus favoritos! ❤️');
            if (window.ItaimNotificacoes && typeof window.ItaimNotificacoes.notificarItemSalvo === 'function') {
                window.ItaimNotificacoes.notificarItemSalvo(produto);
            }
        }
        try {
            const favArr = Array.from(favoritosSet);
            localStorage.setItem('itaim_favoritos', JSON.stringify(favArr));
            const userEmail = window.ItaimSessao ? window.ItaimSessao.obterUsuarioLogado()?.email : null;
            if (userEmail) {
                localStorage.setItem('itaim_favoritos_' + userEmail.toLowerCase().trim(), JSON.stringify(favArr));
            }
        } catch (e) {}
        atualizarEstadoFavorito();

        const badgeFav = document.getElementById('favoritos-contador-badge');
        if (badgeFav) badgeFav.textContent = favoritosSet.size;
    }

    btnFavorito?.addEventListener('click', (e) => {
        e.preventDefault();
        alternarFavorito();
    });

    // 10. Toast de Notificação
    function mostrarToast(mensagem) {
        let toastEl = document.getElementById('toast-feedback-produto');
        if (!toastEl) {
            toastEl = document.createElement('div');
            toastEl.id = 'toast-feedback-produto';
            toastEl.style.position = 'fixed';
            toastEl.style.bottom = '24px';
            toastEl.style.right = '24px';
            toastEl.style.backgroundColor = '#2D3236';
            toastEl.style.color = '#FFFFFF';
            toastEl.style.padding = '12px 20px';
            toastEl.style.borderRadius = '10px';
            toastEl.style.boxShadow = '0 6px 20px rgba(0,0,0,0.18)';
            toastEl.style.fontSize = '14px';
            toastEl.style.fontWeight = '600';
            toastEl.style.zIndex = '99999';
            toastEl.style.opacity = '0';
            toastEl.style.transition = 'all 0.3s ease';
            document.body.appendChild(toastEl);
        }

        toastEl.textContent = mensagem;
        toastEl.style.opacity = '1';
        toastEl.style.transform = 'translateY(0)';

        setTimeout(() => {
            toastEl.style.opacity = '0';
            toastEl.style.transform = 'translateY(10px)';
        }, 2600);
    }

    // Header e Menu Lateral (Drawer) são gerenciados de forma centralizada e global por sessao.js
});
