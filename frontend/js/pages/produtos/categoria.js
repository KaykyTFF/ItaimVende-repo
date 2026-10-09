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

    // 2. Carregar produtos
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

    // Sincronizar favoritos com localStorage
    let favoritosSet = new Set();
    try {
        favoritosSet = new Set(JSON.parse(localStorage.getItem('itaim_favoritos') || '[]'));
    } catch (e) {}
    todosProdutos.forEach(p => {
        p.favorito = favoritosSet.has(p.id);
    });

    let cidadeFiltro = 'todas';
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
                <div class="estado-vazio" style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: #fff; border-radius: 16px;">
                    <div style="font-size: 48px; margin-bottom: 12px;">📦</div>
                    <h3>Nenhum anúncio encontrado</h3>
                    <p style="color: #777; margin-top: 6px;">Não há anúncios cadastrados nesta categoria com os filtros atuais.</p>
                    <a href="vender.html" style="display: inline-block; margin-top: 18px; background: #44BD32; color: #fff; padding: 10px 22px; border-radius: 25px; text-decoration: none; font-weight: 700;">
                        Seja o primeiro a anunciar nesta categoria!
                    </a>
                </div>
            `;
            return;
        }

        gradeProdutos.innerHTML = lista.map(p => {
            const isFav = favoritosSet.has(p.id);
            return `
                <article class="card-produto" data-id="${p.id}">
                    <div class="card-img-box">
                        <img src="${p.imagem}" alt="${p.titulo}" class="card-img" onerror="this.src='assets/produto-placeholder.svg'">
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
                            <span class="card-local">
                                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: -1px; margin-right: 2px;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>${p.cidade || 'Paulistana'}
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
                const id = parseInt(card.getAttribute('data-id'), 10);
                window.location.href = (window.ItaimRotas ? window.ItaimRotas.obterUrl('produto', `id=${id}`) : `produto.html?id=${id}`);
            });
        });

        // Eventos dos botões de favoritar
        gradeProdutos.querySelectorAll('.btn-favorito').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(btn.getAttribute('data-id'), 10);
                const produtoItem = todosProdutos.find(p => p.id === id);
                if (produtoItem) {
                    produtoItem.favorito = !produtoItem.favorito;
                    if (produtoItem.favorito) {
                        favoritosSet.add(id);
                        btn.classList.add('ativo');
                        if (window.ItaimNotificacoes && typeof window.ItaimNotificacoes.notificarItemSalvo === 'function') {
                            window.ItaimNotificacoes.notificarItemSalvo(id);
                        }
                    } else {
                        favoritosSet.delete(id);
                        btn.classList.remove('ativo');
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
    });

    filtroOrdem?.addEventListener('change', (e) => {
        ordemFiltro = e.target.value;
        renderizar();
    });

    renderizar();

    // Header e Menu Lateral (Drawer) são gerenciados de forma centralizada e global por sessao.js
});
