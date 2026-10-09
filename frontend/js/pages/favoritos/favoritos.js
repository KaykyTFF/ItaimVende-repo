/**
 * Itaim Vende - Meus Favoritos (js/favoritos.js)
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Obter todos os produtos da base
    let todosProdutos = [];
    if (window.ItaimSessao && typeof window.ItaimSessao.obterTodosProdutos === 'function') {
        todosProdutos = window.ItaimSessao.obterTodosProdutos();
    } else if (typeof obterTodosProdutos === 'function') {
        todosProdutos = obterTodosProdutos();
    } else if (typeof PRODUTOS_INICIAIS !== 'undefined') {
        todosProdutos = [...PRODUTOS_INICIAIS];
    }

    // 2. Carregar IDs favoritados reais do localStorage
    let favoritosIds = [];
    try {
        const salvos = JSON.parse(localStorage.getItem('itaim_favoritos') || '[]');
        if (Array.isArray(salvos)) favoritosIds = salvos;
    } catch (e) {
        favoritosIds = [];
    }

    const grade = document.getElementById('grade-favoritos');
    const qtdFavoritosSpan = document.getElementById('qtd-favoritos');
    const campoBusca = document.getElementById('campo-busca');
    const formBusca = document.getElementById('form-busca');
    let termoBusca = '';

    function formatarPreco(val) {
        if (!val || Number(val) <= 0) {
            return '<span style="color: #44BD32; font-weight: 800;">Grátis / Doação</span>';
        }
        return Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    function renderizarFavoritos() {
        if (!grade) return;
        grade.innerHTML = '';

        // Filtrar produtos favoritados reais
        const setFavs = new Set(favoritosIds.map(String));
        let produtosFavoritados = todosProdutos.filter(p => setFavs.has(String(p.id)));

        if (qtdFavoritosSpan) {
            qtdFavoritosSpan.textContent = produtosFavoritados.length;
        }

        if (produtosFavoritados.length === 0) {
            grade.innerHTML = `
                <div class="favoritos-vazio" style="grid-column: 1 / -1;">
                    <div class="favoritos-vazio-icon">🤍</div>
                    <h2>Sua lista de favoritos está vazia</h2>
                    <p>Você ainda não favoritou nenhum item. Navegue pelos anúncios e clique no coração para salvá-los aqui!</p>
                    <a href="home.html" class="btn-explorar-ofertas">
                        Explorar Ofertas
                    </a>
                </div>
            `;
            return;
        }

        // Filtro dinâmico pela barra de pesquisa
        if (termoBusca.trim() !== '') {
            const termoLower = termoBusca.trim().toLowerCase();
            produtosFavoritados = produtosFavoritados.filter(p => 
                (p.titulo && p.titulo.toLowerCase().includes(termoLower)) ||
                (p.categoria && p.categoria.toLowerCase().includes(termoLower)) ||
                (p.cidade && p.cidade.toLowerCase().includes(termoLower))
            );

            if (produtosFavoritados.length === 0) {
                grade.innerHTML = `
                    <div class="favoritos-vazio" style="grid-column: 1 / -1;">
                        <div class="favoritos-vazio-icon">🔍</div>
                        <h2>Nenhum favorito encontrado para "${termoBusca}"</h2>
                        <p>Nenhum anúncio salvo nos seus favoritos corresponde à sua busca. Deseja pesquisar em todo o catálogo?</p>
                        <a href="categoria.html?q=${encodeURIComponent(termoBusca)}" class="btn-explorar-ofertas">
                            Buscar em todo o Itaim Vende
                        </a>
                    </div>
                `;
                return;
            }
        }

        produtosFavoritados.forEach(produto => {
            const card = document.createElement('article');
            card.className = 'card-produto';
            card.dataset.id = produto.id;

            const foto = (produto.imagens && produto.imagens.length > 0)
                ? produto.imagens[0] 
                : (produto.imagem || 'assets/produto-placeholder.svg');

            card.innerHTML = `
                <div class="card-img-box">
                    <img 
                        src="${foto}" 
                        alt="${produto.titulo}" 
                        class="card-img"
                        onerror="this.src='assets/produto-placeholder.svg'"
                        loading="lazy"
                    >
                    <button type="button" class="btn-favorito ativo btn-remover-favorito-card" data-id="${produto.id}" title="Remover dos favoritos" aria-label="Remover dos favoritos">
                        <svg class="icone-coracao" viewBox="0 0 24 24">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                    </button>
                </div>

                <div class="card-corpo">
                    <span class="card-categoria-tag">${produto.categoria || 'Geral'}</span>
                    <h3 class="card-titulo" title="${produto.titulo}">${produto.titulo}</h3>
                    <div class="card-preco ${!produto.preco ? 'doacao' : ''}">
                        ${formatarPreco(produto.preco)}
                    </div>
                    <div class="card-rodape">
                        <span class="card-local">
                            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: -1px; margin-right: 2px;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>${produto.cidade || 'Paulistana'}
                        </span>
                        <span style="color: #44BD32; font-weight: 700; font-size: 12.5px;">Ver anúncio &rarr;</span>
                    </div>
                </div>
            `;

            // Clique no card redireciona para a página do produto
            card.addEventListener('click', (e) => {
                if (e.target.closest('.btn-remover-favorito-card')) return;
                window.location.href = (window.ItaimRotas ? window.ItaimRotas.obterUrl('produto', `id=${produto.id}`) : `../produtos/produto.html?id=${produto.id}`);
            });

            grade.appendChild(card);
        });

        // Eventos para remover dos favoritos ao clicar no coração
        grade.querySelectorAll('.btn-remover-favorito-card').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const id = String(btn.dataset.id);
                favoritosIds = favoritosIds.filter(favId => String(favId) !== id);
                try {
                    localStorage.setItem('itaim_favoritos', JSON.stringify(favoritosIds));
                } catch(e) {}
                renderizarFavoritos();
            });
        });
    }

    // Sincroniza dados do usuário no header
    if (window.ItaimSessao && typeof window.ItaimSessao.atualizarHeaderUsuario === 'function') {
        window.ItaimSessao.atualizarHeaderUsuario();
    }

    // Busca ao digitar na barra do topo
    campoBusca?.addEventListener('input', (e) => {
        termoBusca = e.target.value;
        renderizarFavoritos();
    });

    formBusca?.addEventListener('submit', (e) => {
        if (!termoBusca.trim()) {
            e.preventDefault();
        }
    });

    // Header e Menu Lateral (Drawer) são gerenciados de forma centralizada e global por sessao.js
    renderizarFavoritos();
});
