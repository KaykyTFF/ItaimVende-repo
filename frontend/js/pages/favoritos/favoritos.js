/**
 * ITAIM VENDE - PÁGINA DE FAVORITOS (FAVORITOS.JS)
 * Arquivo: frontend/js/pages/favoritos/favoritos.js
 * 
 * Responsabilidades:
 * - Proteção de acesso exclusivo a usuários autenticados
 * - Consulta de anúncios favoritados na API (/favorites) com fallback para armazenamento local
 * - Sincronização bidirecional com a nuvem e isolamento por conta de usuário
 * - Renderização da grade em caixinhas (cards de produtos)
 * - Remoção dinâmica de favoritos com animação fluida e atualização de contadores
 * - Busca e filtro em tempo real pelo campo de busca
 */

document.addEventListener('DOMContentLoaded', async () => {
    'use strict';

    // 1. Verificação de Autenticação (Guardião da Página)
    const estaAutenticado = (window.ItaimSessao && typeof window.ItaimSessao.usuarioEstaAutenticado === 'function')
        ? window.ItaimSessao.usuarioEstaAutenticado()
        : !!(localStorage.getItem('itaim_token') && localStorage.getItem('itaim_usuario_logado'));

    if (!estaAutenticado) {
        if (window.ItaimSessao && typeof window.ItaimSessao.redirecionarParaLogin === 'function') {
            window.ItaimSessao.redirecionarParaLogin('Faça login para acessar seus favoritos.', true);
        } else {
            const urlLogin = window.ItaimRotas ? window.ItaimRotas.obterUrl('login') : '../../index.html';
            window.location.href = urlLogin;
        }
        return;
    }

    // 2. Elementos da Interface
    const grade = document.getElementById('grade-favoritos');
    const qtdFavoritosSpan = document.getElementById('qtd-favoritos');
    const campoBusca = document.getElementById('campo-busca');
    const formBusca = document.getElementById('form-busca');

    let produtosFavoritos = [];
    let favoritosIds = [];
    let termoBusca = '';

    // Obtém e-mail do usuário logado para isolamento estrito de armazenamento
    const usuarioAtual = (window.ItaimSessao && typeof window.ItaimSessao.obterUsuarioLogado === 'function')
        ? window.ItaimSessao.obterUsuarioLogado()
        : null;
    const userEmail = (usuarioAtual?.email || localStorage.getItem('itaim_usuario_logado_email') || '').toLowerCase().trim();
    const storageKeyUser = userEmail ? ('itaim_favoritos_' + userEmail) : null;

    // 3. Exibe Skeletons imediatamente enquanto busca os dados
    if (grade && window.ItaimSkeleton && typeof window.ItaimSkeleton.renderizarCards === 'function') {
        window.ItaimSkeleton.renderizarCards(grade, 6);
    }

    // Sincroniza dados visuais do usuário no header
    if (window.ItaimSessao && typeof window.ItaimSessao.atualizarHeaderUsuario === 'function') {
        window.ItaimSessao.atualizarHeaderUsuario();
    }

    /**
     * Formata o preço com suporte a doação
     */
    function formatarPreco(val, item = null) {
        if (item && (item.listingType === 'DOACAO' || item.isDoacao)) {
            return '<span style="color: #44BD32; font-weight: 800;">Doação</span>';
        }
        if (!val || Number(val) <= 0) {
            return '<span style="color: #44BD32; font-weight: 800;">Doação</span>';
        }
        return Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    /**
     * Atualiza todos os contadores de favoritos na tela e no cabeçalho
     */
    function atualizarContadores() {
        const total = produtosFavoritos.length;
        if (qtdFavoritosSpan) {
            qtdFavoritosSpan.textContent = total;
        }
        const badgeDropdown = document.getElementById('favoritos-contador-badge');
        if (badgeDropdown) {
            badgeDropdown.textContent = total;
        }
        if (window.ItaimSessao && typeof window.ItaimSessao.atualizarHeaderUsuario === 'function') {
            window.ItaimSessao.atualizarHeaderUsuario();
        }
    }

    /**
     * Remove um produto dos favoritos com animação suave e sincronização em segundo plano
     */
    async function removerFavorito(produtoId, cardElement) {
        const pId = String(produtoId);

        // Feedback visual imediato
        if (cardElement) {
            cardElement.style.transition = 'all 0.25s ease';
            cardElement.style.opacity = '0';
            cardElement.style.transform = 'scale(0.9)';
        }

        setTimeout(async () => {
            // Remove da lista em memória
            produtosFavoritos = produtosFavoritos.filter(p => String(p.id) !== pId);
            favoritosIds = favoritosIds.filter(id => String(id) !== pId);

            // Atualiza persistência local sincronizada
            try {
                localStorage.setItem('itaim_favoritos', JSON.stringify(favoritosIds));
                if (storageKeyUser) {
                    localStorage.setItem(storageKeyUser, JSON.stringify(favoritosIds));
                }
            } catch (e) {}

            atualizarContadores();
            renderizarFavoritos();

            // Sincroniza remoção com a API do backend
            if (window.ItaimApi && typeof window.ItaimApi.favoritos?.toggle === 'function' && window.ItaimApi.auth?.obterToken()) {
                try {
                    await window.ItaimApi.favoritos.toggle(pId);
                } catch (err) {
                    console.warn('[Favoritos] Erro ao sincronizar remoção na nuvem:', err);
                }
            }
        }, 200);
    }

    /**
     * Cria o elemento do card de produto estilizado
     */
    function criarCardProduto(produto) {
        const card = document.createElement('article');
        card.className = 'card-produto fade-in-content';
        card.dataset.id = produto.id;

        const placeholderSrc = (window.ItaimRotas && typeof window.ItaimRotas.obterAsset === 'function')
            ? window.ItaimRotas.obterAsset('assets/placeholders/produto-placeholder.svg')
            : (window.location.protocol && window.location.protocol.startsWith('http') ? '/assets/placeholders/produto-placeholder.svg' : '../../assets/placeholders/produto-placeholder.svg');

        const rawFoto = produto.imagem || (produto.fotos && produto.fotos[0]) || (produto.images && produto.images[0]) || '';
        const foto = (window.ItaimApi && typeof window.ItaimApi.resolverUrlImagem === 'function')
            ? window.ItaimApi.resolverUrlImagem(rawFoto)
            : (rawFoto || placeholderSrc);

        const isDoacao = Boolean(produto.isDoacao || produto.listingType === 'DOACAO' || !produto.preco || Number(produto.preco) <= 0);

        card.innerHTML = `
            <div class="card-img-box">
                <img 
                    src="${foto}" 
                    alt="${produto.titulo}" 
                    class="card-img"
                    onerror="this.onerror=null; this.src='${placeholderSrc}'"
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
                <div class="card-preco ${isDoacao ? 'doacao' : ''}">
                    ${formatarPreco(produto.preco, produto)}
                </div>
                <div class="card-rodape">
                    <span class="card-local" title="${produto.cidade || 'Paulistana'} - ${(!produto.bairro || /^\d/.test(produto.bairro) || /\d{5}/.test(produto.bairro)) ? 'Centro' : produto.bairro}">
                        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: -1px; margin-right: 2px;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>${produto.cidade || 'Paulistana'} - ${(!produto.bairro || /^\d/.test(produto.bairro) || /\d{5}/.test(produto.bairro)) ? 'Centro' : produto.bairro}
                    </span>
                    <span style="color: #44BD32; font-weight: 700; font-size: 12.5px;">Ver anúncio &rarr;</span>
                </div>
            </div>
        `;

        // Clique no card redireciona para a página do produto
        card.addEventListener('click', (e) => {
            if (e.target.closest('.btn-remover-favorito-card')) return;
            const urlProd = window.ItaimRotas 
                ? window.ItaimRotas.obterUrl('produto', `id=${produto.id}`) 
                : `../produtos/produto.html?id=${produto.id}`;
            window.location.href = urlProd;
        });

        // Clique no coração de remover favorito
        const btnRemover = card.querySelector('.btn-remover-favorito-card');
        btnRemover?.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            removerFavorito(produto.id, card);
        });

        return card;
    }

    /**
     * Renderiza a grade de favoritos ou os respectivos estados vazios
     */
    function renderizarFavoritos() {
        if (!grade) return;
        grade.innerHTML = '';

        // 1. Estado quando o usuário não possui nenhum favorito
        if (produtosFavoritos.length === 0) {
            grade.innerHTML = `
                <div class="favoritos-vazio" style="grid-column: 1 / -1;">
                    <div class="favoritos-vazio-icon">🤍</div>
                    <h2>Sua lista de favoritos está vazia</h2>
                    <p>Você ainda não favoritou nenhum item. Navegue pelos anúncios e clique no coração para salvá-los aqui!</p>
                    <a href="${window.ItaimRotas ? window.ItaimRotas.obterUrl('home') : '../home/home.html'}" class="btn-explorar-ofertas">
                        Explorar Ofertas
                    </a>
                </div>
            `;
            return;
        }

        // 2. Filtro em tempo real pela barra de pesquisa
        let listaExibicao = produtosFavoritos;
        if (termoBusca && termoBusca.trim() !== '') {
            const termoLower = termoBusca.trim().toLowerCase();
            listaExibicao = produtosFavoritos.filter(p => {
                const matchTitulo = p.titulo && p.titulo.toLowerCase().includes(termoLower);
                const matchCat = p.categoria && p.categoria.toLowerCase().includes(termoLower);
                const matchCidade = p.cidade && p.cidade.toLowerCase().includes(termoLower);
                const matchBairro = p.bairro && p.bairro.toLowerCase().includes(termoLower);
                const matchDesc = p.descricao && p.descricao.toLowerCase().includes(termoLower);
                return matchTitulo || matchCat || matchCidade || matchBairro || matchDesc;
            });

            if (listaExibicao.length === 0) {
                const urlCatalogo = window.ItaimRotas 
                    ? window.ItaimRotas.obterUrl('categoria', `q=${encodeURIComponent(termoBusca.trim())}`) 
                    : `../produtos/categoria.html?q=${encodeURIComponent(termoBusca.trim())}`;

                grade.innerHTML = `
                    <div class="favoritos-vazio" style="grid-column: 1 / -1;">
                        <div class="favoritos-vazio-icon">🔍</div>
                        <h2>Nenhum favorito encontrado para "${termoBusca.trim()}"</h2>
                        <p>Nenhum anúncio salvo nos seus favoritos corresponde à sua busca. Deseja pesquisar em todo o catálogo?</p>
                        <a href="${urlCatalogo}" class="btn-explorar-ofertas">
                            Buscar em todo o Itaim Vende
                        </a>
                    </div>
                `;
                return;
            }
        }

        // 3. Constrói e anexa os cards dos produtos
        listaExibicao.forEach(produto => {
            const card = criarCardProduto(produto);
            grade.appendChild(card);
        });
    }

    /**
     * Carrega favoritos da API (com suporte a cache e fallback local)
     */
    async function carregarCatalogoEFavoritos() {
        let apiSucesso = false;

        // 1. Tenta obter da API do backend
        if (window.ItaimApi && typeof window.ItaimApi.favoritos?.listar === 'function' && window.ItaimApi.auth?.obterToken()) {
            try {
                const resFavs = await window.ItaimApi.favoritos.listar();
                if (resFavs && resFavs.success) {
                    apiSucesso = true;
                    const rawList = Array.isArray(resFavs.favorites) 
                        ? resFavs.favorites 
                        : (Array.isArray(resFavs.data) ? resFavs.data : []);

                    produtosFavoritos = rawList.map(item => {
                        const prod = item.product ? { ...item.product, favoriteId: item.favoriteId || item.id, favoritadoEm: item.favoritadoEm || item.createdAt } : item;
                        return {
                            id: prod.id,
                            titulo: prod.titulo || prod.title || 'Anúncio',
                            preco: Number(prod.preco !== undefined ? prod.preco : (prod.price || 0)),
                            price: Number(prod.price !== undefined ? prod.price : (prod.preco || 0)),
                            listingType: prod.listingType,
                            isDoacao: Boolean(prod.isDoacao || prod.listingType === 'DOACAO'),
                            categoria: prod.categoria || prod.category?.name || 'Geral',
                            cidade: prod.cidade || prod.city || prod.seller?.city || 'Paulistana',
                            bairro: prod.bairro || prod.neighborhood || prod.seller?.neighborhood || 'Centro',
                            imagem: prod.imagem || (prod.images && prod.images[0]) || (prod.fotos && prod.fotos[0]) || '',
                            fotos: prod.fotos || prod.images || [],
                            descricao: prod.descricao || prod.description || '',
                            status: prod.status || 'active'
                        };
                    });

                    favoritosIds = produtosFavoritos.map(p => String(p.id));

                    // Salva no storage para navegação rápida
                    localStorage.setItem('itaim_favoritos', JSON.stringify(favoritosIds));
                    if (storageKeyUser) {
                        localStorage.setItem(storageKeyUser, JSON.stringify(favoritosIds));
                    }
                }
            } catch (err) {
                console.warn('[Favoritos] Falha na consulta à API de favoritos:', err);
            }
        }

        // 2. Fallback caso a API não esteja disponível ou não retorne dados
        if (!apiSucesso) {
            try {
                let salvos = [];
                if (storageKeyUser && localStorage.getItem(storageKeyUser)) {
                    salvos = JSON.parse(localStorage.getItem(storageKeyUser) || '[]');
                } else {
                    salvos = JSON.parse(localStorage.getItem('itaim_favoritos') || '[]');
                }
                if (Array.isArray(salvos)) {
                    favoritosIds = salvos.map(String);
                }
            } catch (e) {
                favoritosIds = [];
            }

            if (favoritosIds.length > 0) {
                let catalogo = [];
                if (window.ItaimSessao && typeof window.ItaimSessao.obterTodosProdutos === 'function') {
                    catalogo = window.ItaimSessao.obterTodosProdutos(false);
                } else if (typeof PRODUTOS_INICIAIS !== 'undefined') {
                    catalogo = [...PRODUTOS_INICIAIS];
                }
                const setIds = new Set(favoritosIds.map(String));
                produtosFavoritos = catalogo.filter(p => setIds.has(String(p.id)));
            } else {
                produtosFavoritos = [];
            }
        }

        atualizarContadores();
        renderizarFavoritos();
    }

    // 4. Conecta eventos do campo de busca
    campoBusca?.addEventListener('input', (e) => {
        termoBusca = e.target.value;
        renderizarFavoritos();
    });

    formBusca?.addEventListener('submit', (e) => {
        e.preventDefault();
        if (termoBusca.trim()) {
            const termoLower = termoBusca.trim().toLowerCase();
            const temResultados = produtosFavoritos.some(p => {
                const matchTitulo = p.titulo && p.titulo.toLowerCase().includes(termoLower);
                const matchCat = p.categoria && p.categoria.toLowerCase().includes(termoLower);
                return matchTitulo || matchCat;
            });
            if (!temResultados) {
                const urlGeral = window.ItaimRotas 
                    ? window.ItaimRotas.obterUrl('categoria', `q=${encodeURIComponent(termoBusca.trim())}`) 
                    : `../produtos/categoria.html?q=${encodeURIComponent(termoBusca.trim())}`;
                window.location.href = urlGeral;
            }
        }
    });

    // 5. Carga inicial dos favoritos
    await carregarCatalogoEFavoritos();
});
