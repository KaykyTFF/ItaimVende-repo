/**
 * ITAIM VENDE - LÓGICA DA PÁGINA DE CATEGORIA (CATEGORIA.HTML)
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Obter Categoria via URL
    const params = new URLSearchParams(window.location.search);
    let categoriaParam = params.get('cat') || 'todas';

    // Buscar categoria correspondente na lista única (js/categorias-dados.js)
    const catObj = (typeof buscarCategoria === 'function') ? buscarCategoria(categoriaParam) : null;

    // Normalizar categoria
    const tituloEl = document.getElementById('categoria-titulo');
    const subtituloEl = document.getElementById('categoria-subtitulo');
    const breadcrumbNome = document.getElementById('breadcrumb-categoria-nome');
    const contadorBadge = document.getElementById('categoria-contador-badge');
    const gradeProdutos = document.getElementById('grade-produtos');
    const filtroCidade = document.getElementById('filtro-cidade');
    const filtroOrdem = document.getElementById('filtro-ordem');
    const btnVoltar = document.getElementById('btn-voltar-categoria');

    const categoriaNomeExibicao = catObj 
        ? catObj.nome 
        : ((categoriaParam.toLowerCase() === 'todas') ? 'Todas as Categorias' : categoriaParam);

    document.title = `${categoriaNomeExibicao} - Itaim Vende`;
    if (tituloEl) tituloEl.textContent = categoriaNomeExibicao;
    if (breadcrumbNome) breadcrumbNome.textContent = categoriaNomeExibicao;
    if (subtituloEl) {
        subtituloEl.textContent = (categoriaParam.toLowerCase() === 'todas')
            ? 'Todos os anúncios à venda na região de Paulistana e cidades vizinhas'
            : `Anúncios e ofertas na categoria ${categoriaNomeExibicao}`;
    }

    // Botão Voltar
    btnVoltar?.addEventListener('click', () => {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            window.location.href = (window.ItaimRotas ? window.ItaimRotas.obterUrl('home') : '../home/home.html');
        }
    });

    // 2. Carregar produtos (API com fallback local)
    let todosProdutos = [];

    async function carregarProdutosCategoria() {
        if (window.ItaimApi && typeof window.ItaimApi.produtos.listar === 'function') {
            try {
                const apiParams = {};
                if (categoriaParam && categoriaParam.toLowerCase() !== 'todas') {
                    apiParams.category = categoriaParam;
                }
                if (cidadeFiltro && cidadeFiltro !== 'todas') {
                    apiParams.city = cidadeFiltro;
                }

                const res = await window.ItaimApi.produtos.listar(apiParams);
                if (res && res.success && Array.isArray(res.data)) {
                    todosProdutos = res.data.map(p => ({
                        ...p,
                        id: p.id,
                        titulo: p.titulo || p.title,
                        preco: Number(p.preco !== undefined ? p.preco : p.price),
                        categoria: p.categoria || (p.category ? p.category.name : 'Geral'),
                        cidade: p.cidade || p.city || 'Paulistana',
                        bairro: p.bairro || p.neighborhood || 'Centro',
                        imagem: window.ItaimApi.resolverUrlImagem(p.imagem || (p.images && p.images[0]) || '')
                    }));
                    renderizar();
                    return;
                }
            } catch (err) {
                console.info('[Categoria] API offline ou sem resposta, utilizando base local de fallback.');
            }
        }

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
        renderizar();
    }

    // Sincronizar favoritos com localStorage
    let favoritosSet = new Set();
    try {
        favoritosSet = new Set(JSON.parse(localStorage.getItem('itaim_favoritos') || '[]').map(String));
    } catch (e) {}

    // Parâmetro de Cidade vindo pela URL (ex: ?cid=Acauã ou clicado no rodapé)
    const cidadeUrlParam = params.get('cid') || params.get('cidade') || params.get('city') || 'todas';
    let cidadeFiltro = cidadeUrlParam;
    if (filtroCidade && cidadeFiltro !== 'todas') {
        filtroCidade.value = cidadeFiltro;
    }

    let ordemFiltro = 'recentes';

    function formatarPreco(val) {
        if (!val || val <= 0) {
            return '<span class="doacao">Doação / Grátis</span>';
        }
        return Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    function renderizar() {
        let lista = [...todosProdutos];

        // Filtrar por categoria (se não for "todas")
        if (categoriaParam.toLowerCase() !== 'todas') {
            if (catObj && typeof produtoPertenceCategoria === 'function') {
                lista = lista.filter(p => produtoPertenceCategoria(p, catObj));
            } else {
                lista = lista.filter(p => (p.categoria || '').toLowerCase() === categoriaParam.toLowerCase());
            }
        }

        // Filtrar por cidade
        if (cidadeFiltro !== 'todas') {
            lista = lista.filter(p => (p.cidade || '').toLowerCase() === cidadeFiltro.toLowerCase());
        }

        // Ordenar
        if (ordemFiltro === 'menor-preco') {
            lista.sort((a, b) => (a.preco || 0) - (b.preco || 0));
        } else if (ordemFiltro === 'maior-preco') {
            lista.sort((a, b) => (b.preco || 0) - (a.preco || 0));
        } else {
            lista.sort((a, b) => b.id - a.id);
        }

        // Atualizar badge
        if (contadorBadge) {
            contadorBadge.textContent = `${lista.length} ${lista.length === 1 ? 'anúncio encontrado' : 'anúncios encontrados'}`;
        }

        if (lista.length === 0) {
            gradeProdutos.innerHTML = `
                <div class="estado-vazio" style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; border-radius: 16px;">
                    <div class="anuncios-vazio-icone" style="width: 64px; height: 64px; margin: 0 auto 16px; border-radius: 50%; background: rgba(68, 189, 50, 0.12); display: inline-flex; align-items: center; justify-content: center; color: #44BD32;">
                        <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                            <line x1="12" y1="22.08" x2="12" y2="12"></line>
                        </svg>
                    </div>
                    <h3>Nenhum anúncio encontrado</h3>
                    <p style="color: #777; margin-top: 6px;">Não há anúncios cadastrados nesta categoria com os filtros atuais.</p>
                    <a href="${window.ItaimRotas ? window.ItaimRotas.obterUrl('vender') : '../vender/vender.html'}" style="display: inline-block; margin-top: 18px; background: #44BD32; color: #fff; padding: 10px 22px; border-radius: 25px; text-decoration: none; font-weight: 700;">
                        Seja o primeiro a anunciar nesta categoria!
                    </a>
                </div>
            `;
            return;
        }

        const placeholderSrc = (window.ItaimRotas && typeof window.ItaimRotas.obterAsset === 'function')
            ? window.ItaimRotas.obterAsset('assets/placeholders/produto-placeholder.svg')
            : '../../assets/placeholders/produto-placeholder.svg';

        gradeProdutos.innerHTML = lista.map(p => {
            const isFav = favoritosSet.has(p.id);
            return `
                <article class="card-produto fade-in-content" data-id="${p.id}">
                    <div class="card-img-box">
                        <img src="${p.imagem}" alt="${p.titulo}" class="card-img" onerror="this.onerror=null; this.src='${placeholderSrc}'">
                        <button type="button" class="btn-favorito ${isFav ? 'ativo' : ''}" data-id="${p.id}" aria-label="Favoritar anúncio">
                            <svg class="icone-coracao" viewBox="0 0 24 24">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                        </button>
                    </div>
                    <div class="card-corpo">
                        <span class="card-categoria-tag">${p.categoria || 'Geral'}</span>
                        <h3 class="card-titulo" title="${p.titulo}">${p.titulo}</h3>
                        <div class="card-preco ${!p.preco ? 'doacao' : ''}">
                            ${formatarPreco(p.preco)}
                        </div>
                        <div class="card-rodape">
                            <span class="card-local" title="${p.bairro ? p.bairro + ', ' : ''}${p.cidade || 'Paulistana'}">
                                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: -1px; margin-right: 2px;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>${p.bairro && p.bairro !== 'Centro' ? p.bairro + ' - ' : ''}${p.cidade || 'Paulistana'}
                            </span>
                            <span>Hoje</span>
                        </div>
                    </div>
                </article>
            `;
        }).join('');

        // Eventos nos cards - redireciona para a página dedicada do produto
        gradeProdutos.querySelectorAll('.card-produto').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('.btn-favorito')) return;
                const id = card.getAttribute('data-id');
                window.location.href = (window.ItaimRotas ? window.ItaimRotas.obterUrl('produto', `id=${id}`) : `produto.html?id=${id}`);
            });
        });

        // Eventos dos botões de favoritar
        gradeProdutos.querySelectorAll('.btn-favorito').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const id = String(btn.getAttribute('data-id'));
                if (favoritosSet.has(id)) {
                    favoritosSet.delete(id);
                    btn.classList.remove('ativo');
                } else {
                    favoritosSet.add(id);
                    btn.classList.add('ativo');
                    if (window.ItaimNotificacoes && typeof window.ItaimNotificacoes.notificarItemSalvo === 'function') {
                        window.ItaimNotificacoes.notificarItemSalvo(id);
                    }
                }

                try {
                    const favArr = [...favoritosSet];
                    localStorage.setItem('itaim_favoritos', JSON.stringify(favArr));
                    const userEmail = window.ItaimSessao ? window.ItaimSessao.obterUsuarioLogado()?.email : null;
                    if (userEmail) {
                        localStorage.setItem('itaim_favoritos_' + userEmail.toLowerCase().trim(), JSON.stringify(favArr));
                    }
                } catch (err) {}
                atualizarContadorFavoritos();

                if (window.ItaimApi && window.ItaimApi.auth.obterToken()) {
                    try {
                        await window.ItaimApi.favoritos.toggle(id);
                    } catch (err) {}
                }
            });
        });
    }

    function atualizarContadorFavoritos() {
        const badge = document.getElementById('favoritos-contador-badge');
        if (badge) badge.textContent = favoritosSet.size;
    }
    atualizarContadorFavoritos();

    filtroCidade?.addEventListener('change', (e) => {
        cidadeFiltro = e.target.value;
        renderizar();
        carregarProdutosCategoria();
    });

    filtroOrdem?.addEventListener('change', (e) => {
        ordemFiltro = e.target.value;
        renderizar();
    });

    // Exibe skeletons na grade imediatamente durante o carregamento
    if (window.ItaimSkeleton && typeof window.ItaimSkeleton.renderizarCards === 'function') {
        window.ItaimSkeleton.renderizarCards(gradeProdutos, 8);
    }
    carregarProdutosCategoria();

    // Header e Menu Lateral (Drawer) são gerenciados de forma centralizada e global por sessao.js
});
