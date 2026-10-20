/**
 * ITAIM VENDE - LÓGICA DA PÁGINA DO PRODUTO (PRODUTO.HTML)
 * Carrega dados dinâmicos do anúncio selecionado, fotos, favoritos, WhatsApp e perfil do vendedor
 */

document.addEventListener('DOMContentLoaded', async () => {
    // 0. Exibir Skeleton Screen imediatamente enquanto busca o anúncio no Supabase/API
    const skeletonContainer = document.getElementById('skeleton-produto-container');
    const mainConteudo = document.getElementById('main-anuncio-conteudo');
    if (skeletonContainer && window.ItaimSkeleton && typeof window.ItaimSkeleton.obterDetalhesProdutoHtml === 'function') {
        skeletonContainer.innerHTML = window.ItaimSkeleton.obterDetalhesProdutoHtml();
        if (mainConteudo) {
            mainConteudo.style.display = 'none';
        }
    }

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
                <div class="anuncios-vazio-icone" style="width: 72px; height: 72px; margin: 0 auto 16px; border-radius: 50%; background: rgba(68, 189, 50, 0.12); display: inline-flex; align-items: center; justify-content: center; color: #44BD32;">
                    <svg viewBox="0 0 24 24" width="38" height="38" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                        <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                        <line x1="12" y1="22.08" x2="12" y2="12"></line>
                    </svg>
                </div>
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

    // 5. Ocultar Skeleton e exibir o conteúdo real preenchido
    if (skeletonContainer) {
        skeletonContainer.style.display = 'none';
    }
    if (mainConteudo) {
        mainConteudo.style.display = '';
        mainConteudo.classList.add('fade-in-content');
    }

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
        ? window.ItaimRotas.obterAsset('assets/placeholders/produto-placeholder.svg')
        : '../../assets/placeholders/produto-placeholder.svg';

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
        ? window.ItaimRotas.obterAsset('assets/icons/icon-user.png')
        : '../../assets/icons/icon-user.png';
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

        const nomeVendedor = (dadosVendedor && (dadosVendedor.name || dadosVendedor.nome)) || produto.vendedorNome || produto.vendedor || 'Vendedor';
        const cidadeVendedor = (dadosVendedor && (dadosVendedor.city || dadosVendedor.cidade)) || produto.vendedorCidade || produto.cidade || 'Paulistana';
        
        // Foto de perfil real do vendedor: prioriza foto personalizada do banco/perfil
        const avatarBruto = (dadosVendedor && dadosVendedor.avatar) || produto.vendedorAvatar || fallbackAvatarVendedor;
        if (avatarBruto && avatarBruto !== 'assets/icons/icon-user.png') {
            avatarVendedor = (window.ItaimApi && typeof window.ItaimApi.resolverUrlImagem === 'function')
                ? window.ItaimApi.resolverUrlImagem(avatarBruto)
                : ((window.ItaimRotas && typeof window.ItaimRotas.obterAsset === 'function')
                    ? window.ItaimRotas.obterAsset(avatarBruto)
                    : avatarBruto);
        } else {
            avatarVendedor = fallbackAvatarVendedor;
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
        const queryParams = new URLSearchParams();
        if (idParam) queryParams.set('id', idParam);
        if (emailParam) queryParams.set('email', emailParam);
        if (nomeVendedor) queryParams.set('vendedor', nomeVendedor);

        const urlVendedor = (window.ItaimRotas ? window.ItaimRotas.obterUrl('vendedor', queryParams.toString()) : `../perfil/vendedor.html?${queryParams.toString()}`);

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

    // Helper: Verifica se o usuário autenticado atual é o vendedor deste anúncio
    function verificarSeUsuarioEhVendedor() {
        const usuarioLogado = window.ItaimSessao ? window.ItaimSessao.obterUsuarioLogado() : null;
        if (!usuarioLogado) return false;

        const uId = String(usuarioLogado.id || usuarioLogado.userId || '').trim();
        const uEmail = String(usuarioLogado.email || '').toLowerCase().trim();
        const uUsername = String(usuarioLogado.username || usuarioLogado.usuario || '').toLowerCase().trim();

        const vId = String(
            (dadosVendedor && (dadosVendedor.id || dadosVendedor.userId)) ||
            produto.vendedorId ||
            produto.sellerId ||
            (produto.seller && (produto.seller.id || produto.seller.userId)) ||
            ''
        ).trim();

        const vEmail = String(
            (dadosVendedor && dadosVendedor.email) ||
            produto.vendedorEmail ||
            (produto.seller && produto.seller.email) ||
            ''
        ).toLowerCase().trim();

        const vUsername = String(
            (dadosVendedor && (dadosVendedor.username || dadosVendedor.usuario)) ||
            produto.vendedorUsername ||
            (produto.seller && (produto.seller.username || produto.seller.usuario)) ||
            ''
        ).toLowerCase().trim();

        return Boolean(
            (uId && vId && uId === vId) ||
            (uEmail && vEmail && uEmail === vEmail) ||
            (uUsername && vUsername && uUsername === vUsername)
        );
    }

    // 8. Botão Iniciar Chat com o Vendedor (Integração 100% Real com a API do Backend)
    const btnChatVendedor = document.getElementById('btn-chat-vendedor');
    if (btnChatVendedor) {
        btnChatVendedor.addEventListener('click', async (e) => {
            e.preventDefault();

            // 1. Se o anúncio for do próprio usuário, exibe aviso e NÃO redireciona para o chat
            if (verificarSeUsuarioEhVendedor()) {
                mostrarToast('Você é o vendedor deste anúncio');
                return;
            }

            // 2. Verificar se o usuário está autenticado
            const estaLogado = (window.ItaimSessao && typeof window.ItaimSessao.usuarioEstaAutenticado === 'function')
                ? window.ItaimSessao.usuarioEstaAutenticado()
                : !!(window.ItaimApi?.auth?.obterToken() && localStorage.getItem('itaim_usuario_logado'));

            if (!estaLogado) {
                mostrarToast('Faça login para conversar com o vendedor.');
                if (window.ItaimSessao && typeof window.ItaimSessao.redirecionarParaLogin === 'function') {
                    setTimeout(() => {
                        window.ItaimSessao.redirecionarParaLogin('Faça login para conversar com o vendedor.');
                    }, 400);
                } else {
                    const urlLogin = window.ItaimRotas ? window.ItaimRotas.obterUrl('login', 'returnTo=' + encodeURIComponent(window.location.href)) : '../../index.html';
                    setTimeout(() => {
                        window.location.href = urlLogin;
                    }, 400);
                }
                return;
            }

            // 3. Desabilitar botão para evitar duplo clique
            const textoOriginal = btnChatVendedor.innerHTML;
            btnChatVendedor.disabled = true;
            btnChatVendedor.innerHTML = `
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" style="animation: spin 0.8s linear infinite;">
                    <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
                    <path d="M12 2a10 10 0 0 1 10 10"></path>
                </svg>
                <span>Conectando...</span>
            `;

            try {
                const prodIdParaChat = produto.id || produto.slug;
                const resp = await window.ItaimApi.chat.iniciarConversa(prodIdParaChat);

                if (resp && resp.success && resp.data) {
                    const convId = resp.data.id;
                    const urlDestino = window.ItaimRotas 
                        ? window.ItaimRotas.obterUrl('conversas', `id=${encodeURIComponent(convId)}`)
                        : `../mensagens/conversas.html?id=${encodeURIComponent(convId)}`;
                    window.location.href = urlDestino;
                    return;
                }
                throw new Error(resp?.message || 'Não foi possível iniciar o chat.');
            } catch (err) {
                console.error('Erro ao iniciar chat com vendedor:', err);
                const msgErro = err?.message || 'Erro ao abrir chat com o vendedor.';

                btnChatVendedor.disabled = false;
                btnChatVendedor.innerHTML = textoOriginal;

                if (msgErro.includes('anunciante') || msgErro.includes('vendedor')) {
                    mostrarToast('Você é o vendedor deste anúncio');
                    return;
                }

                mostrarToast(msgErro);
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

        btnWpp.addEventListener('click', (e) => {
            if (verificarSeUsuarioEhVendedor()) {
                e.preventDefault();
                mostrarToast('Você é o vendedor deste anúncio');
            }
        });
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

    // =========================================================================
    // 11. SISTEMA DE DENÚNCIAS & TICKETS DE MODERAÇÃO
    // =========================================================================
    const modalDenuncia = document.getElementById('modal-denuncia');
    const btnAbrirDenuncia = document.getElementById('btn-abrir-denuncia');
    const btnFecharDenuncia = document.getElementById('btn-fechar-denuncia');
    const btnCancelarDenuncia = document.getElementById('btn-cancelar-denuncia');
    const btnFecharHistorico = document.getElementById('btn-fechar-historico');
    const btnVoltarAoAnuncio = document.getElementById('btn-voltar-ao-anuncio');
    const btnConcluirTicket = document.getElementById('btn-concluir-ticket');
    const btnVerMeusTickets = document.getElementById('btn-ver-meus-tickets');
    const btnEnviarDenuncia = document.getElementById('btn-enviar-denuncia');
    const btnCopiarTicket = document.getElementById('btn-copiar-ticket');
    const contadorMeusTicketsEl = document.getElementById('contador-meus-tickets');

    const etapaForm = document.getElementById('denuncia-etapa-form');
    const etapaSucesso = document.getElementById('denuncia-etapa-sucesso');
    const etapaHistorico = document.getElementById('denuncia-etapa-historico');

    const descTextarea = document.getElementById('denuncia-descricao');
    const charsCountEl = document.getElementById('denuncia-chars-val');
    const inputEmailContato = document.getElementById('denuncia-email-contato');

    const STORAGE_TICKETS_KEY = 'itaim_tickets_denuncias';

    // Recupera tickets salvos localmente
    function obterTicketsLocais() {
        try {
            const salvos = JSON.parse(localStorage.getItem(STORAGE_TICKETS_KEY) || '[]');
            return Array.isArray(salvos) ? salvos : [];
        } catch (e) {
            return [];
        }
    }

    function salvarTicketLocal(ticket) {
        try {
            const tickets = obterTicketsLocais();
            const filtrados = tickets.filter(t => t.id !== ticket.id && t.protocol !== ticket.protocol);
            filtrados.unshift(ticket);
            localStorage.setItem(STORAGE_TICKETS_KEY, JSON.stringify(filtrados));
            atualizarContadorTickets();
        } catch (e) {
            console.warn('[Tickets] Não foi possível salvar localmente:', e);
        }
    }

    function atualizarContadorTickets() {
        const total = obterTicketsLocais().length;
        if (contadorMeusTicketsEl) {
            contadorMeusTicketsEl.textContent = total;
        }
    }
    atualizarContadorTickets();

    // Mapeamento amigável de motivos
    const LABELS_MOTIVOS = {
        'FRAUD': 'Golpe ou Fraude',
        'INAPPROPRIATE_CONTENT': 'Conteúdo Impróprio',
        'SPAM': 'Spam / Anúncio Falso',
        'COUNTERFEIT': 'Item Proibido / Réplica',
        'ALREADY_SOLD': 'Já Vendido / Indisponível',
        'OTHER': 'Outro Motivo'
    };

    // Preenche dados do anúncio no modal de denúncia
    function preencherResumoProdutoModal() {
        const resumoImg = document.getElementById('denuncia-resumo-img');
        const resumoTitulo = document.getElementById('denuncia-resumo-titulo');
        const resumoVendedor = document.getElementById('denuncia-resumo-vendedor');
        const resumoPreco = document.getElementById('denuncia-resumo-preco');

        if (resumoTitulo) resumoTitulo.textContent = produto.titulo;
        if (resumoVendedor) {
            const vNome = (dadosVendedor && (dadosVendedor.name || dadosVendedor.nome)) || produto.vendedorNome || produto.vendedor || 'Vendedor';
            resumoVendedor.textContent = `Vendedor: ${vNome}`;
        }
        if (resumoPreco) {
            resumoPreco.innerHTML = formatarPreco(produto.preco);
        }
        if (resumoImg) {
            const fotoUrl = (produto.fotos && produto.fotos[0]) || produto.imagem || produto.foto || '../../assets/produtos/anuncio_15.jpg';
            resumoImg.src = fotoUrl;
            resumoImg.alt = produto.titulo;
        }

        // Pré-preenche e-mail se logado
        const usuarioLogado = window.ItaimSessao ? window.ItaimSessao.obterUsuarioLogado() : null;
        if (inputEmailContato && usuarioLogado && usuarioLogado.email) {
            inputEmailContato.value = usuarioLogado.email;
        }
    }

    function abrirModalEtapa(etapa) {
        if (!modalDenuncia) return;
        if (etapaForm) etapaForm.style.display = (etapa === 'form') ? 'block' : 'none';
        if (etapaSucesso) etapaSucesso.style.display = (etapa === 'sucesso') ? 'block' : 'none';
        if (etapaHistorico) etapaHistorico.style.display = (etapa === 'historico') ? 'block' : 'none';

        modalDenuncia.style.display = 'flex';
        void modalDenuncia.offsetWidth;
        modalDenuncia.classList.add('ativo');
        modalDenuncia.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function fecharModalDenuncia() {
        if (!modalDenuncia) return;
        modalDenuncia.classList.remove('ativo');
        modalDenuncia.setAttribute('aria-hidden', 'true');
        setTimeout(() => {
            modalDenuncia.style.display = 'none';
            document.body.style.overflow = '';
        }, 280);
    }

    // Botão de Denunciar Anúncio
    if (btnAbrirDenuncia) {
        btnAbrirDenuncia.addEventListener('click', (e) => {
            e.preventDefault();

            // Vendedor não pode denunciar o próprio anúncio
            if (verificarSeUsuarioEhVendedor()) {
                mostrarToast('Você é o autor deste anúncio.');
                return;
            }

            preencherResumoProdutoModal();
            abrirModalEtapa('form');
        });
    }

    // Fechamento de modal
    [btnFecharDenuncia, btnCancelarDenuncia, btnFecharHistorico, btnVoltarAoAnuncio, btnConcluirTicket].forEach(btn => {
        if (btn) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                fecharModalDenuncia();
            });
        }
    });

    // Fechar ao clicar no fundo escuro
    if (modalDenuncia) {
        modalDenuncia.addEventListener('click', (e) => {
            if (e.target === modalDenuncia) {
                fecharModalDenuncia();
            }
        });
    }

    // Tecla ESC para fechar
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalDenuncia && modalDenuncia.classList.contains('ativo')) {
            fecharModalDenuncia();
        }
    });

    // Contador de caracteres da descrição
    if (descTextarea && charsCountEl) {
        descTextarea.addEventListener('input', () => {
            charsCountEl.textContent = descTextarea.value.length;
        });
    }

    // Efeito de seleção nos cards de motivos
    const radiosMotivo = document.querySelectorAll('input[name="denuncia-motivo"]');
    radiosMotivo.forEach(radio => {
        radio.addEventListener('change', () => {
            document.querySelectorAll('.motivo-card-item').forEach(card => card.classList.remove('ativo'));
            const cardPai = radio.closest('.motivo-card-item');
            if (cardPai) cardPai.classList.add('ativo');
        });
    });

    // Envio do formulário de denúncia / Abertura de Ticket
    if (btnEnviarDenuncia) {
        btnEnviarDenuncia.addEventListener('click', async (e) => {
            e.preventDefault();

            const radioSelecionado = document.querySelector('input[name="denuncia-motivo"]:checked');
            const motivo = radioSelecionado ? radioSelecionado.value : 'OTHER';
            const descricao = descTextarea ? descTextarea.value.trim() : '';
            const emailContato = inputEmailContato ? inputEmailContato.value.trim() : '';

            // Estado de carregamento
            const textoOriginal = btnEnviarDenuncia.innerHTML;
            btnEnviarDenuncia.disabled = true;
            btnEnviarDenuncia.innerHTML = `
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" style="animation: spin 0.8s linear infinite;">
                    <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
                    <path d="M12 2a10 10 0 0 1 10 10"></path>
                </svg>
                <span>Registrando Ticket...</span>
            `;

            let ticketRetornado = null;

            try {
                // Envio real na API
                const produtoIdReal = produto.id || produto.slug || produtoIdParam;
                if (window.ItaimApi && window.ItaimApi.reports && typeof window.ItaimApi.reports.criar === 'function') {
                    const resposta = await window.ItaimApi.reports.criar(produtoIdReal, {
                        reason: motivo,
                        description: descricao,
                        contactEmail: emailContato
                    });

                    if (resposta && (resposta.success || resposta.ticket || resposta.protocol)) {
                        ticketRetornado = resposta.ticket || {
                            id: resposta.id || ('tk_' + Date.now()),
                            protocol: resposta.protocol || `TK-${String(Date.now()).slice(-6)}`,
                            productId: produto.id,
                            productTitle: produto.titulo,
                            reason: motivo,
                            reasonLabel: LABELS_MOTIVOS[motivo] || motivo,
                            description: descricao,
                            status: 'PENDING',
                            createdAt: new Date().toISOString()
                        };
                    }
                }
            } catch (err) {
                console.info('[Denúncia] Backend offline ou erro de rede. Gerando ticket em modo resiliente:', err.message);
            }

            // Fallback resiliente caso backend esteja offline
            if (!ticketRetornado) {
                const protocoloFallback = `TK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
                ticketRetornado = {
                    id: 'ticket_' + Date.now(),
                    protocol: protocoloFallback,
                    productId: produto.id,
                    productTitle: produto.titulo,
                    productImage: (produto.fotos && produto.fotos[0]) || produto.imagem || null,
                    sellerName: (dadosVendedor && (dadosVendedor.name || dadosVendedor.nome)) || produto.vendedorNome || 'Vendedor',
                    reason: motivo,
                    reasonLabel: LABELS_MOTIVOS[motivo] || motivo,
                    description: descricao,
                    status: 'PENDING',
                    statusLabel: 'Em Análise',
                    createdAt: new Date().toISOString(),
                    contactEmail: emailContato
                };
            }

            // Salva no histórico de tickets local
            salvarTicketLocal(ticketRetornado);

            // Restaura botão
            btnEnviarDenuncia.disabled = false;
            btnEnviarDenuncia.innerHTML = textoOriginal;

            // Limpa campos do form
            if (descTextarea) descTextarea.value = '';
            if (charsCountEl) charsCountEl.textContent = '0';

            // Preenche dados do Ticket Gerado (Etapa 2)
            const ticketProtocoloNum = document.getElementById('ticket-protocolo-num');
            const ticketDadoProduto = document.getElementById('ticket-dado-produto');
            const ticketDadoMotivo = document.getElementById('ticket-dado-motivo');
            const ticketDadoData = document.getElementById('ticket-dado-data');

            if (ticketProtocoloNum) ticketProtocoloNum.textContent = ticketRetornado.protocol;
            if (ticketDadoProduto) ticketDadoProduto.textContent = ticketRetornado.productTitle || produto.titulo;
            if (ticketDadoMotivo) ticketDadoMotivo.textContent = ticketRetornado.reasonLabel || LABELS_MOTIVOS[motivo] || motivo;
            if (ticketDadoData) {
                ticketDadoData.textContent = new Date(ticketRetornado.createdAt).toLocaleDateString('pt-BR', {
                    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                });
            }

            abrirModalEtapa('sucesso');
            mostrarToast(`Denúncia recebida! Ticket #${ticketRetornado.protocol} gerado.`);
        });
    }

    // Copiar Protocolo do Ticket
    if (btnCopiarTicket) {
        btnCopiarTicket.addEventListener('click', async () => {
            const protocolo = document.getElementById('ticket-protocolo-num')?.textContent || '';
            if (!protocolo) return;

            try {
                await navigator.clipboard.writeText(protocolo);
                const txtEl = document.getElementById('btn-copiar-ticket-txt');
                if (txtEl) txtEl.textContent = 'Copiado! ✓';
                mostrarToast(`Protocolo ${protocolo} copiado para a área de transferência!`);
                setTimeout(() => {
                    if (txtEl) txtEl.textContent = 'Copiar Protocolo';
                }, 2000);
            } catch (err) {
                mostrarToast(`Protocolo: ${protocolo}`);
            }
        });
    }

    // Renderiza a lista de histórico de tickets do usuário
    function renderizarHistoricoTickets() {
        const listaEl = document.getElementById('tickets-historico-lista');
        if (!listaEl) return;

        const tickets = obterTicketsLocais();

        if (tickets.length === 0) {
            listaEl.innerHTML = `
                <div class="tickets-vazio-box">
                    <div class="tickets-vazio-icone">🛡️</div>
                    <h4 class="tickets-vazio-titulo">Nenhum ticket aberto</h4>
                    <p class="tickets-vazio-desc">Você ainda não realizou denúncias de anúncios na plataforma.</p>
                </div>
            `;
            return;
        }

        listaEl.innerHTML = tickets.map(t => {
            const dataFmt = new Date(t.createdAt).toLocaleDateString('pt-BR', {
                day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
            });

            let statusClass = 'status-pendente';
            let statusTexto = 'Em Análise';
            if (t.status === 'UNDER_REVIEW') {
                statusClass = 'status-investigacao';
                statusTexto = 'Em Investigação';
            } else if (t.status === 'RESOLVED') {
                statusClass = 'status-resolvido';
                statusTexto = 'Resolvido';
            } else if (t.status === 'DISMISSED') {
                statusClass = 'status-descartado';
                statusTexto = 'Encerrado';
            }

            return `
                <div class="ticket-item-card">
                    <div class="ticket-item-topo">
                        <span class="ticket-item-protocolo">#${t.protocol}</span>
                        <span class="ticket-status-pill ${statusClass}">${statusTexto}</span>
                    </div>
                    <div class="ticket-item-produto">${t.productTitle || 'Anúncio reportado'}</div>
                    <div class="ticket-item-detalhes">
                        <span><strong>Motivo:</strong> ${t.reasonLabel || LABELS_MOTIVOS[t.reason] || t.reason}</span>
                        <span>&bull;</span>
                        <span>${dataFmt}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Abrir histórico de tickets do usuário
    if (btnVerMeusTickets) {
        btnVerMeusTickets.addEventListener('click', (e) => {
            e.preventDefault();
            renderizarHistoricoTickets();
            abrirModalEtapa('historico');
        });
    }

    // Se a URL tiver ?denunciar=1 ou #denunciar, abre automaticamente o formulário de denúncia
    if (params.get('denunciar') === '1' || window.location.hash === '#denunciar') {
        setTimeout(() => {
            if (btnAbrirDenuncia) btnAbrirDenuncia.click();
        }, 300);
    }

    // Header e Menu Lateral (Drawer) são gerenciados de forma centralizada e global por sessao.js
});
