/**
 * ITAIM VENDE - LÓGICA DA TELA PRINCIPAL (HOME)
 * Carrossel, Categorias, Vitrine de Produtos, Favoritos, Filtros e Modais
 */

document.addEventListener('DOMContentLoaded', () => {
    // ==========================================================================
    // 1. CARROSSEL DE BANNERS HERO
    // ==========================================================================
    const carrosselSlides = document.getElementById('carrossel-slides');
    const btnBannerPrev = document.getElementById('btn-banner-prev');
    const btnBannerNext = document.getElementById('btn-banner-next');
    const indicadores = document.querySelectorAll('.indicador-ponto');
    const carrosselContainer = document.getElementById('carrossel-container');

    let slideAtual = 0;
    const totalSlides = 3;
    let timerCarrossel = null;

    function mudarSlide(novoIndice) {
        if (novoIndice < 0) {
            slideAtual = totalSlides - 1;
        } else if (novoIndice >= totalSlides) {
            slideAtual = 0;
        } else {
            slideAtual = novoIndice;
        }

        if (carrosselSlides) {
            carrosselSlides.style.transform = `translateX(-${slideAtual * 100}%)`;
        }

        indicadores.forEach((ind, i) => {
            ind.classList.toggle('ativo', i === slideAtual);
        });
    }

    function iniciarTimerCarrossel() {
        pararTimerCarrossel();
        timerCarrossel = setInterval(() => {
            mudarSlide(slideAtual + 1);
        }, 5000);
    }

    function pararTimerCarrossel() {
        if (timerCarrossel) clearInterval(timerCarrossel);
    }

    if (btnBannerPrev && btnBannerNext) {
        btnBannerPrev.addEventListener('click', () => {
            pararTimerCarrossel();
            mudarSlide(slideAtual - 1);
            iniciarTimerCarrossel();
        });

        btnBannerNext.addEventListener('click', () => {
            pararTimerCarrossel();
            mudarSlide(slideAtual + 1);
            iniciarTimerCarrossel();
        });

        indicadores.forEach(ind => {
            ind.addEventListener('click', () => {
                pararTimerCarrossel();
                const index = parseInt(ind.getAttribute('data-index'), 10);
                mudarSlide(index);
                iniciarTimerCarrossel();
            });
        });

        carrosselContainer?.addEventListener('mouseenter', pararTimerCarrossel);
        carrosselContainer?.addEventListener('mouseleave', iniciarTimerCarrossel);

        // Suporte a swipe por toque (mobile)
        let touchStartX = 0;
        let touchEndX = 0;

        carrosselContainer?.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            pararTimerCarrossel();
        }, { passive: true });

        carrosselContainer?.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            const diffX = touchEndX - touchStartX;
            if (Math.abs(diffX) > 35) {
                if (diffX < 0) {
                    mudarSlide(slideAtual + 1);
                } else {
                    mudarSlide(slideAtual - 1);
                }
            }
            iniciarTimerCarrossel();
        }, { passive: true });

        iniciarTimerCarrossel();
    }

    // ==========================================================================
    // 2. DADOS E GERENCIAMENTO DE PRODUTOS (API CENTRAL COM FALLBACK)
    // ==========================================================================
    let produtos = [];

    // Inicializa fallback local caso a API esteja indisponível
    function carregarProdutosLocais() {
        let locais = [];
        if (window.ItaimSessao && typeof window.ItaimSessao.obterTodosProdutos === 'function') {
            locais = window.ItaimSessao.obterTodosProdutos();
        } else if (typeof PRODUTOS_INICIAIS !== 'undefined' && Array.isArray(PRODUTOS_INICIAIS)) {
            locais = [...PRODUTOS_INICIAIS];
            try {
                const cadastrados = JSON.parse(localStorage.getItem('itaim_produtos_cadastrados') || '[]');
                if (Array.isArray(cadastrados)) locais = [...cadastrados, ...locais];
            } catch(e) {}
        }
        return locais;
    }

    produtos = carregarProdutosLocais();

    // Carregar favoritos do localStorage (com IDs padronizados como String)
    let favoritosSet = new Set();
    try {
        const salvos = JSON.parse(localStorage.getItem('itaim_favoritos') || '[]');
        favoritosSet = new Set(salvos.map(String));
    } catch (e) {}

    function atualizarContadorFavoritos() {
        const badge = document.getElementById('favoritos-contador-badge');
        if (badge) {
            badge.textContent = favoritosSet.size;
        }
    }
    atualizarContadorFavoritos();

    // ==========================================================================
    // 3. RENDERIZAÇÃO DOS CARDS DE PRODUTOS E MODO DE PESQUISA COM SIDEBAR
    // ==========================================================================
    const gradeProdutos = document.getElementById('grade-produtos');
    const btnLimparFiltros = document.getElementById('btn-limpar-filtros');
    const layoutVitrine = document.getElementById('layout-vitrine-com-sidebar');
    const headerPesquisaResultados = document.getElementById('header-pesquisa-resultados');
    const pesquisaTituloPrincipal = document.getElementById('pesquisa-titulo-principal');
    const pesquisaSubtituloContador = document.getElementById('pesquisa-subtitulo-contador');
    const selectOrdemPesquisa = document.getElementById('select-ordem-pesquisa');
    const btnViewGrid = document.getElementById('btn-view-grid');
    const btnViewLista = document.getElementById('btn-view-lista');
    const btnLimparSidebar = document.getElementById('btn-limpar-filtros-sidebar');
    const btnAbrirFiltrosMobile = document.getElementById('btn-abrir-filtros-mobile');
    const sidebarFiltros = document.getElementById('sidebar-filtros-pesquisa');
    const sidebarBackdrop = document.getElementById('sidebar-filtros-backdrop');

    // Estados de filtragem
    let modoPesquisaAtivo = false;
    let modoVisualizacao = 'grid'; // 'grid' ou 'lista'
    let categoriaFiltro = 'todas';
    let cidadeFiltro = 'todas';
    let bairroFiltro = 'todos';
    let ordemFiltro = 'recentes';
    let termoBusca = '';

    // Estados da barra lateral de filtros ("filtrar por")
    const categoriasSelecionadas = new Set();
    const condicoesSelecionadas = new Set();
    const cidadesSelecionadas = new Set();
    let precoMinFiltro = 0;
    let precoMaxFiltro = 5000;
    let ordemPesquisa = 'relevantes';

    function ativarModoPesquisa(ativo) {
        modoPesquisaAtivo = !!ativo;
        document.body.classList.toggle('modo-pesquisa-ativo', modoPesquisaAtivo);
        if (layoutVitrine) {
            layoutVitrine.classList.toggle('modo-pesquisa-ativo', modoPesquisaAtivo);
        }
    }

    function formatarPreco(valor, item) {
        const isDoacao = (item && (item.listingType === 'DOACAO' || item.listingType === 'doacao' || item.isDoacao))
            || (!valor || valor <= 0 || valor === '0' || valor === 'Doação');
        if (isDoacao) {
            return '<span class="doacao" style="color: #44BD32; font-weight: 800;">Doação</span>';
        }
        return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    // Atualiza opções dinâmicas da barra lateral ("filtrar por") com contagem real
    function atualizarSidebarFiltros() {
        const opcoesCategoriasEl = document.getElementById('sidebar-opcoes-categorias');
        const opcoesCidadesEl = document.getElementById('sidebar-opcoes-cidades');

        const contagemCat = {};
        const contagemCid = {};
        let countNovo = 0;
        let countUsado = 0;
        let countPreco50 = 0;
        let countPreco200 = 0;
        let countPreco500 = 0;
        let countPreco500mais = 0;

        // Base de cálculo para os contadores (considera o termo buscado se houver)
        const baseCalculo = termoBusca
            ? produtos.filter(p => {
                const q = termoBusca.toLowerCase();
                return (p.titulo && p.titulo.toLowerCase().includes(q)) ||
                       (p.categoria && p.categoria.toLowerCase().includes(q)) ||
                       (p.cidade && p.cidade.toLowerCase().includes(q)) ||
                       (p.bairro && p.bairro.toLowerCase().includes(q));
            })
            : produtos;

        baseCalculo.forEach(p => {
            const cat = p.categoria || 'Geral';
            contagemCat[cat] = (contagemCat[cat] || 0) + 1;

            const cid = p.cidade || 'Paulistana';
            contagemCid[cid] = (contagemCid[cid] || 0) + 1;

            const cond = (p.condicao || '').toLowerCase();
            if (cond.includes('novo')) countNovo++;
            else countUsado++;

            const pr = Number(p.preco || 0);
            if (pr > 0 && pr <= 50) countPreco50++;
            else if (pr > 50 && pr <= 200) countPreco200++;
            else if (pr > 200 && pr <= 500) countPreco500++;
            else if (pr > 500) countPreco500mais++;
        });

        // Atualizar Contadores de Condição
        const elNovo = document.getElementById('count-condicao-novo');
        const elUsado = document.getElementById('count-condicao-usado');
        if (elNovo) elNovo.textContent = `(${countNovo})`;
        if (elUsado) elUsado.textContent = `(${countUsado})`;

        // Atualizar Contadores de Preço
        const elP50 = document.getElementById('count-preco-50');
        const elP200 = document.getElementById('count-preco-200');
        const elP500 = document.getElementById('count-preco-500');
        const elP500m = document.getElementById('count-preco-500mais');
        if (elP50) elP50.textContent = `(${countPreco50})`;
        if (elP200) elP200.textContent = `(${countPreco200})`;
        if (elP500) elP500.textContent = `(${countPreco500})`;
        if (elP500m) elP500m.textContent = `(${countPreco500mais})`;

        // Renderizar Categorias na Barra Lateral
        if (opcoesCategoriasEl) {
            const catsOrdenadas = Object.keys(contagemCat).sort((a, b) => contagemCat[b] - contagemCat[a]);
            opcoesCategoriasEl.innerHTML = catsOrdenadas.map(cat => {
                const checked = categoriasSelecionadas.has(cat) ? 'checked' : '';
                return `
                    <label class="filtro-checkbox-item">
                        <div class="filtro-check-conteudo">
                            <input type="checkbox" class="filtro-sidebar-check" name="filtro_categoria" value="${cat}" ${checked}>
                            <span class="custom-checkbox"></span>
                            <span class="filtro-label-texto" title="${cat}">${cat.toLowerCase()}</span>
                        </div>
                        <span class="filtro-contador">(${contagemCat[cat]})</span>
                    </label>
                `;
            }).join('');

            opcoesCategoriasEl.querySelectorAll('input[type="checkbox"]').forEach(chk => {
                chk.addEventListener('change', (e) => {
                    const val = e.target.value;
                    if (e.target.checked) categoriasSelecionadas.add(val);
                    else categoriasSelecionadas.delete(val);
                    renderizarVitrine();
                });
            });
        }

        // Renderizar Cidades na Barra Lateral
        if (opcoesCidadesEl) {
            const cidsOrdenadas = Object.keys(contagemCid).sort((a, b) => contagemCid[b] - contagemCid[a]);
            opcoesCidadesEl.innerHTML = cidsOrdenadas.map(cid => {
                const checked = cidadesSelecionadas.has(cid) ? 'checked' : '';
                return `
                    <label class="filtro-checkbox-item">
                        <div class="filtro-check-conteudo">
                            <input type="checkbox" class="filtro-sidebar-check" name="filtro_cidade_sidebar" value="${cid}" ${checked}>
                            <span class="custom-checkbox"></span>
                            <span class="filtro-label-texto" title="${cid}">${cid.toLowerCase()}</span>
                        </div>
                        <span class="filtro-contador">(${contagemCid[cid]})</span>
                    </label>
                `;
            }).join('');

            opcoesCidadesEl.querySelectorAll('input[type="checkbox"]').forEach(chk => {
                chk.addEventListener('change', (e) => {
                    const val = e.target.value;
                    if (e.target.checked) cidadesSelecionadas.add(val);
                    else cidadesSelecionadas.delete(val);
                    renderizarVitrine();
                });
            });
        }
    }

    function renderizarVitrine() {
        if (!gradeProdutos) return;

        // Filtragem combinada
        let lista = produtos.filter(p => {
            // 0. Apenas anúncios ativos aparecem na vitrine da loja
            if (p.status && String(p.status).toLowerCase() !== 'ativo') return false;

            // Se modo pesquisa ativo com categorias selecionadas na sidebar
            if (modoPesquisaAtivo && categoriasSelecionadas.size > 0) {
                if (!p.categoria || !categoriasSelecionadas.has(p.categoria)) return false;
            } else if (!modoPesquisaAtivo && categoriaFiltro !== 'todas') {
                if (!p.categoria || !p.categoria.toLowerCase().includes(categoriaFiltro.toLowerCase())) return false;
            }

            // Cidades
            if (modoPesquisaAtivo && cidadesSelecionadas.size > 0) {
                if (!p.cidade || !cidadesSelecionadas.has(p.cidade)) return false;
            } else if (!modoPesquisaAtivo && cidadeFiltro !== 'todas') {
                const matchesCidade = (p.cidade && p.cidade.toLowerCase() === cidadeFiltro.toLowerCase()) ||
                    (p.cidade && cidadeFiltro && (p.cidade.toLowerCase().includes(cidadeFiltro.toLowerCase()) || cidadeFiltro.toLowerCase().includes(p.cidade.toLowerCase())));
                if (!matchesCidade) return false;
            }

            // Bairro (no modo padrão Home)
            if (!modoPesquisaAtivo && bairroFiltro !== 'todos') {
                const matchesBairro = (p.bairro && p.bairro.toLowerCase().includes(bairroFiltro.toLowerCase())) ||
                    (bairroFiltro && p.bairro && bairroFiltro.toLowerCase().includes(p.bairro.toLowerCase()));
                if (!matchesBairro) return false;
            }

            // Condição (Novo vs Usado na sidebar)
            if (modoPesquisaAtivo && condicoesSelecionadas.size > 0) {
                const cond = (p.condicao || 'usado').toLowerCase();
                const matchesCond = Array.from(condicoesSelecionadas).some(c => cond.includes(c.toLowerCase()));
                if (!matchesCond) return false;
            }

            // Faixa de Preço (slider interativo)
            if (modoPesquisaAtivo && (precoMinFiltro > 0 || precoMaxFiltro < 5000)) {
                const pr = Number(p.preco || 0);
                if (precoMinFiltro > 0 && pr < precoMinFiltro) return false;
                if (precoMaxFiltro < 5000 && pr > precoMaxFiltro) return false;
            }

            // Termo de Busca
            if (termoBusca) {
                const q = termoBusca.toLowerCase();
                const matchesBusca = (p.titulo && p.titulo.toLowerCase().includes(q)) ||
                    (p.cidade && p.cidade.toLowerCase().includes(q)) ||
                    (p.bairro && p.bairro.toLowerCase().includes(q)) ||
                    (p.categoria && p.categoria.toLowerCase().includes(q)) ||
                    (p.descricao && p.descricao.toLowerCase().includes(q));
                if (!matchesBusca) return false;
            }

            return true;
        });

        // Ordenação
        const ordemAtiva = modoPesquisaAtivo ? ordemPesquisa : ordemFiltro;
        if (ordemAtiva === 'menor-preco') {
            lista.sort((a, b) => (a.preco || 0) - (b.preco || 0));
        } else if (ordemAtiva === 'maior-preco') {
            lista.sort((a, b) => (b.preco || 0) - (a.preco || 0));
        } else if (ordemAtiva === 'relevantes' && termoBusca) {
            const q = termoBusca.toLowerCase();
            lista.sort((a, b) => {
                const aTitle = (a.titulo || '').toLowerCase().startsWith(q) ? 2 : ((a.titulo || '').toLowerCase().includes(q) ? 1 : 0);
                const bTitle = (b.titulo || '').toLowerCase().startsWith(q) ? 2 : ((b.titulo || '').toLowerCase().includes(q) ? 1 : 0);
                return bTitle - aTitle;
            });
        } else {
            // 'recentes'
            lista.sort((a, b) => {
                if (a.createdAt && b.createdAt) {
                    return new Date(b.createdAt) - new Date(a.createdAt);
                }
                return (b.id || 0) > (a.id || 0) ? 1 : -1;
            });
        }
        // Atualizar contadores
        if (pesquisaSubtituloContador) {
            pesquisaSubtituloContador.textContent = `${lista.length} produto${lista.length !== 1 ? 's' : ''} encontrado${lista.length !== 1 ? 's' : ''}`;
        }
        if (pesquisaTituloPrincipal) {
            pesquisaTituloPrincipal.textContent = 'listagem de produtos';
        }

        // Mostrar / ocultar botão de limpar filtros no modo padrão
        if (btnLimparFiltros) {
            const filtrosAtivos = (categoriaFiltro !== 'todas') || (cidadeFiltro !== 'todas') || (bairroFiltro !== 'todos') || (termoBusca !== '');
            btnLimparFiltros.style.display = filtrosAtivos ? 'inline-flex' : 'none';
        }

        // Se vazio
        if (lista.length === 0) {
            gradeProdutos.innerHTML = `
                <div class="estado-vazio" style="grid-column: 1 / -1; text-align: center; padding: 48px 20px; background: #FFFFFF; border-radius: 16px; border: 1px dashed #CBD5E1; margin: 10px auto; width: 100%; max-width: 580px;">
                    <div class="anuncios-vazio-icone" style="width: 64px; height: 64px; margin: 0 auto 16px; border-radius: 50%; background: rgba(68, 189, 50, 0.12); display: inline-flex; align-items: center; justify-content: center; color: #44BD32;">
                        <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                            <line x1="12" y1="22.08" x2="12" y2="12"></line>
                        </svg>
                    </div>
                    <h3 style="font-size: 20px; font-weight: 800; color: #1E293B; margin-bottom: 8px;">
                        ${produtos.length === 0 ? 'Nenhum produto anunciado no momento' : 'Nenhum anúncio encontrado'}
                    </h3>
                    <p style="color: #64748B; font-size: 14.5px; margin-bottom: 22px; line-height: 1.5;">
                        ${produtos.length === 0 
                            ? 'Ainda não há produtos à venda. Desapegue do que você não usa mais ou seja o primeiro a anunciar!' 
                            : 'Tente buscar por outro termo ou remova os filtros selecionados na barra lateral.'}
                    </p>
                    <a href="${window.ItaimRotas ? window.ItaimRotas.obterUrl('vender') : '../vender/vender.html'}" style="background: #44BD32; color: #FFFFFF; font-weight: 700; padding: 12px 24px; border-radius: 30px; text-decoration: none; font-size: 15px; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 12px rgba(68,189,50,0.25);">
                        + Anunciar Produto Agora
                    </a>
                </div>
            `;
            return;
        }

        const placeholderSrc = (window.ItaimRotas && typeof window.ItaimRotas.obterAsset === 'function')
            ? window.ItaimRotas.obterAsset('assets/placeholders/produto-placeholder.svg')
            : '../../assets/placeholders/produto-placeholder.svg';

        // Gerar Cards com botão de favorito e botão de ação rápida vermelho "+"
        gradeProdutos.innerHTML = lista.map(p => {
            const pId = String(p.id);
            const isFav = favoritosSet.has(pId);
            const imagemUrl = (window.ItaimApi && typeof window.ItaimApi.resolverUrlImagem === 'function')
                ? window.ItaimApi.resolverUrlImagem(p.imagem || (p.images && p.images[0]) || '')
                : (window.ItaimRotas ? window.ItaimRotas.obterAsset('assets/produtos/anuncio_13.jpg') : '../../assets/produtos/anuncio_13.jpg');

            return `
                <article class="card-produto fade-in-content" data-id="${pId}">
                    <div class="card-img-box">
                        <img src="${imagemUrl}" alt="${p.titulo}" class="card-img" onerror="this.onerror=null; this.src='${placeholderSrc}'">
                        <button type="button" class="btn-favorito ${isFav ? 'ativo' : ''}" data-id="${pId}" aria-label="Favoritar anúncio">
                            <svg class="icone-coracao" viewBox="0 0 24 24">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                        </button>
                    </div>
                    <div class="card-corpo">
                        <span class="card-categoria-tag">${p.categoria || 'Geral'}</span>
                        <h3 class="card-titulo" title="${p.titulo}">${p.titulo}</h3>
                        <div class="card-preco ${(!p.preco || p.listingType === 'DOACAO' || p.isDoacao) ? 'doacao' : ''}">
                            ${formatarPreco(p.preco, p)}
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
        document.querySelectorAll('.card-produto').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('.btn-favorito')) return;
                const id = card.getAttribute('data-id');
                window.location.href = window.ItaimRotas ? window.ItaimRotas.obterUrl('produto', `id=${id}`) : `produto.html?id=${id}`;
            });
        });

        // Eventos nos botões de favoritos
        document.querySelectorAll('.btn-favorito').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                e.preventDefault();

                // Se visitante não autenticado, redireciona imediatamente para o login
                const estaAutenticado = (window.ItaimSessao && typeof window.ItaimSessao.usuarioEstaAutenticado === 'function')
                    ? window.ItaimSessao.usuarioEstaAutenticado()
                    : !!(localStorage.getItem('itaim_token') && localStorage.getItem('itaim_usuario_logado'));

                if (!estaAutenticado) {
                    if (window.ItaimSessao && typeof window.ItaimSessao.redirecionarParaLogin === 'function') {
                        window.ItaimSessao.redirecionarParaLogin('Faça login para salvar anúncios nos seus favoritos.');
                    } else {
                        const urlLogin = window.ItaimRotas ? window.ItaimRotas.obterUrl('login', 'mensagem=' + encodeURIComponent('Faça login para salvar anúncios nos seus favoritos.')) : '../../index.html';
                        window.location.href = urlLogin;
                    }
                    return;
                }

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

                // Sincroniza com a API se usuário autenticado
                if (window.ItaimApi && typeof window.ItaimApi.favoritos.toggle === 'function' && window.ItaimApi.auth.obterToken()) {
                    try {
                        await window.ItaimApi.favoritos.toggle(id);
                    } catch (err) {
                        // Mantém persistência local caso a API retorne erro
                    }
                }
            });
        });
    }

    // Carrega dados da API do Backend com filtros e fallback automático
    async function carregarProdutosApi() {
        if (gradeProdutos && window.ItaimSkeleton && typeof window.ItaimSkeleton.renderizarCards === 'function') {
            window.ItaimSkeleton.renderizarCards(gradeProdutos, 8);
        }

        if (window.ItaimApi && typeof window.ItaimApi.produtos.listar === 'function') {
            try {
                const apiFiltros = {};
                if (cidadeFiltro && cidadeFiltro !== 'todas') apiFiltros.city = cidadeFiltro;
                if (bairroFiltro && bairroFiltro !== 'todos') apiFiltros.neighborhood = bairroFiltro;
                if (categoriaFiltro && categoriaFiltro !== 'todas') apiFiltros.category = categoriaFiltro;
                if (termoBusca) apiFiltros.search = termoBusca;

                const res = await window.ItaimApi.produtos.listar(apiFiltros);
                if (res && res.success && Array.isArray(res.data)) {
                    const mapaExcluidos = (() => {
                        try { return new Set(JSON.parse(localStorage.getItem('itaim_produtos_excluidos') || '[]').map(String)); } catch(e) { return new Set(); }
                    })();
                    const mapaStatus = (() => {
                        try { return JSON.parse(localStorage.getItem('itaim_produtos_status_map') || '{}'); } catch(e) { return {}; }
                    })();

                    const apiProdutos = res.data
                        .filter(p => !mapaExcluidos.has(String(p.id)))
                        .map(p => {
                            const st = mapaStatus[String(p.id)] || p.status || 'ATIVO';
                            return {
                                ...p,
                                id: p.id,
                                status: st,
                                titulo: p.titulo || p.title,
                                preco: Number(p.preco !== undefined ? p.preco : p.price),
                                categoria: p.categoria || (p.category ? p.category.name : 'Geral'),
                                cidade: p.cidade || p.city || 'Paulistana',
                                bairro: p.bairro || p.neighborhood || 'Centro',
                                imagem: (window.ItaimApi && window.ItaimApi.resolverUrlImagem)
                                    ? window.ItaimApi.resolverUrlImagem(p.imagem || (p.images && p.images[0]) || '')
                                    : (window.ItaimRotas ? window.ItaimRotas.obterAsset('assets/produtos/anuncio_13.jpg') : '../../assets/produtos/anuncio_13.jpg')
                            };
                        })
                        .filter(p => String(p.status).toLowerCase() === 'ativo');

                    produtos = apiProdutos;
                    renderizarVitrine();
                    return;
                }
            } catch (err) {
                console.info('[Home] API backend indisponível no momento, exibindo anúncios locais.');
            }
        }
        renderizarVitrine();
    }

    // Inicialização da vitrine com Skeleton Shimmer imediato
    if (window.ItaimSkeleton && typeof window.ItaimSkeleton.renderizarCards === 'function') {
        window.ItaimSkeleton.renderizarCards(gradeProdutos, 8);
    }
    carregarProdutosApi();

    // ==========================================================================
    // 4. FILTROS E BUSCA INTERATIVA (COM SUPORTE À SIDEBAR DE PESQUISA)
    // ==========================================================================
    const formBusca = document.getElementById('form-busca');
    const campoBusca = document.getElementById('campo-busca');

    // Campo de busca: NÃO ativa a barra de filtros enquanto o usuário estiver apenas digitando
    campoBusca?.addEventListener('input', (e) => {
        // Se o usuário apagar todo o texto e não houver outros filtros ativos, restaura a vitrine padrão
        if (e.target.value.trim() === '' && modoPesquisaAtivo && categoriasSelecionadas.size === 0 && condicoesSelecionadas.size === 0 && cidadesSelecionadas.size === 0 && precoMinFiltro === 0 && precoMaxFiltro === 5000) {
            termoBusca = '';
            ativarModoPesquisa(false);
            try {
                const url = new URL(window.location.href);
                url.searchParams.delete('q');
                url.searchParams.delete('busca');
                window.history.pushState({}, '', url.toString());
            } catch (err) {}
            atualizarSidebarFiltros();
            renderizarVitrine();
        }
    });

    // Submissão do formulário de busca: vai para a página de busca com os filtros apenas ao dar Enter ou clicar na lupa
    formBusca?.addEventListener('submit', (e) => {
        const valorDigitado = campoBusca ? campoBusca.value.trim() : '';
        if (valorDigitado.length > 0) {
            e.preventDefault();
            const urlDestino = window.ItaimRotas 
                ? window.ItaimRotas.obterUrl('categoria', `q=${encodeURIComponent(valorDigitado)}`) : `../produtos/categoria.html?q=${encodeURIComponent(valorDigitado)}`;
            window.location.href = urlDestino;
        }
    });

    // Alternador de Visualização da Pesquisa: Grid vs Lista
    btnViewGrid?.addEventListener('click', () => {
        modoVisualizacao = 'grid';
        gradeProdutos?.classList.remove('modo-lista');
        btnViewGrid?.classList.add('ativo');
        btnViewLista?.classList.remove('ativo');
        btnViewGrid?.setAttribute('aria-pressed', 'true');
        btnViewLista?.setAttribute('aria-pressed', 'false');
    });

    btnViewLista?.addEventListener('click', () => {
        modoVisualizacao = 'lista';
        gradeProdutos?.classList.add('modo-lista');
        btnViewLista?.classList.add('ativo');
        btnViewGrid?.classList.remove('ativo');
        btnViewLista?.setAttribute('aria-pressed', 'true');
        btnViewGrid?.setAttribute('aria-pressed', 'false');
    });

    // Ordenação da Pesquisa
    selectOrdemPesquisa?.addEventListener('change', (e) => {
        ordemPesquisa = e.target.value;
        renderizarVitrine();
    });

    // Filtros de Condição na Sidebar
    document.querySelectorAll('input[name="filtro_condicao"]').forEach(chk => {
        chk.addEventListener('change', (e) => {
            const val = e.target.value;
            if (e.target.checked) condicoesSelecionadas.add(val);
            else condicoesSelecionadas.delete(val);
            renderizarVitrine();
        });
    });

    // ==========================================================================
    // Slider Interativo de Faixa de Preço (Home Search Mode)
    // ==========================================================================
    const sliderMin = document.getElementById('filtro-preco-min');
    const sliderMax = document.getElementById('filtro-preco-max');
    const trackFill = document.getElementById('preco-slider-track-fill');
    const displayMin = document.getElementById('preco-min-display');
    const displayMax = document.getElementById('preco-max-display');
    const btnResetPreco = document.getElementById('btn-reset-preco-slider');
    const chipsPreco = document.querySelectorAll('.chip-preco');

    function formatarMoedaSimples(val) {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
    }

    function atualizarSliderPreco(minVal, maxVal, dispararRender = true) {
        if (!sliderMin || !sliderMax) return;

        let min = parseInt(minVal !== undefined ? minVal : sliderMin.value, 10) || 0;
        let max = parseInt(maxVal !== undefined ? maxVal : sliderMax.value, 10) || 5000;

        if (min > max) {
            if (minVal !== undefined) max = min;
            else min = max;
        }

        sliderMin.value = min;
        sliderMax.value = max;
        precoMinFiltro = min;
        precoMaxFiltro = max;

        const maxLim = 5000;
        const pctMin = (min / maxLim) * 100;
        const pctMax = (max / maxLim) * 100;

        if (trackFill) {
            trackFill.style.left = `${pctMin}%`;
            trackFill.style.width = `${pctMax - pctMin}%`;
        }

        if (displayMin) displayMin.textContent = formatarMoedaSimples(min);
        if (displayMax) displayMax.textContent = max >= maxLim ? 'R$ 5.000+' : formatarMoedaSimples(max);

        chipsPreco.forEach(chip => {
            const cMin = parseInt(chip.getAttribute('data-min'), 10);
            const cMax = parseInt(chip.getAttribute('data-max'), 10);
            if (cMin === min && cMax === max) {
                chip.classList.add('ativo');
            } else {
                chip.classList.remove('ativo');
            }
        });

        if (dispararRender) {
            if (!modoPesquisaAtivo && (min > 0 || max < 5000)) {
                ativarModoPesquisa(true);
            }
            renderizarVitrine();
        }
    }

    sliderMin?.addEventListener('input', (e) => {
        let min = parseInt(e.target.value, 10) || 0;
        let max = parseInt(sliderMax.value, 10) || 5000;
        if (min > max) {
            min = max;
            sliderMin.value = min;
        }
        atualizarSliderPreco(min, max, true);
    });

    sliderMax?.addEventListener('input', (e) => {
        let min = parseInt(sliderMin.value, 10) || 0;
        let max = parseInt(e.target.value, 10) || 5000;
        if (max < min) {
            max = min;
            sliderMax.value = max;
        }
        atualizarSliderPreco(min, max, true);
    });

    chipsPreco.forEach(chip => {
        chip.addEventListener('click', () => {
            const cMin = parseInt(chip.getAttribute('data-min'), 10);
            const cMax = parseInt(chip.getAttribute('data-max'), 10);
            atualizarSliderPreco(cMin, cMax, true);
        });
    });

    btnResetPreco?.addEventListener('click', () => {
        atualizarSliderPreco(0, 5000, true);
    });

    // Inicializa posição do slider visual
    atualizarSliderPreco(0, 5000, false);

    // Botão Limpar Filtros da Barra Lateral
    function limparFiltrosSidebar() {
        categoriasSelecionadas.clear();
        condicoesSelecionadas.clear();
        cidadesSelecionadas.clear();
        termoBusca = '';
        if (campoBusca) campoBusca.value = '';

        document.querySelectorAll('input[name="filtro_condicao"]').forEach(c => c.checked = false);
        atualizarSliderPreco(0, 5000, false);

        ativarModoPesquisa(false);
        atualizarSidebarFiltros();
        renderizarVitrine();
    }

    btnLimparSidebar?.addEventListener('click', limparFiltrosSidebar);

    // Controles Mobile da Sidebar de Filtros
    btnAbrirFiltrosMobile?.addEventListener('click', () => {
        sidebarFiltros?.classList.add('aberto');
        sidebarBackdrop?.classList.add('aberto');
        document.body.style.overflow = 'hidden';
    });

    function fecharFiltrosMobile() {
        sidebarFiltros?.classList.remove('aberto');
        sidebarBackdrop?.classList.remove('aberto');
        document.body.style.overflow = '';
    }

    sidebarBackdrop?.addEventListener('click', fecharFiltrosMobile);

    // Filtro por Categorias (Círculos da Home)
    const botoesCategorias = document.querySelectorAll('.item-categoria');
    botoesCategorias.forEach(btn => {
        btn.addEventListener('click', () => {
            botoesCategorias.forEach(b => b.classList.remove('categoria-selecionada'));
            btn.classList.add('categoria-selecionada');
            categoriaFiltro = btn.getAttribute('data-categoria');
            renderizarVitrine();
        });
    });

    window.filtrarPorCategoria = function(catNome) {
        botoesCategorias.forEach(b => {
            const matches = b.getAttribute('data-categoria') === catNome;
            b.classList.toggle('categoria-selecionada', matches);
        });
        categoriaFiltro = catNome;
        renderizarVitrine();
        window.scrollTo({ top: 400, behavior: 'smooth' });
    };

    // Mapeamento dinâmico de bairros por cidade do Vale do Itaim e região
    const BAIRROS_POR_CIDADE = {
        'Paulistana': ['Centro', 'Correnteza', 'Triângulo', 'Alto da Guia', 'Guarita', 'São Francisco', 'Choró', 'Lagoa dos Bois'],
        'Acauã': ['Centro', 'Bairro Novo', 'Posto Fiscal', 'Baraúnas'],
        'Betânia do Piauí': ['Centro', 'Vila Nova', 'Barra do Juá'],
        'Jacobina do Piauí': ['Centro', 'Alto São Pedro'],
        'Queimada Nova': ['Centro', 'Jacu', 'Cantinho'],
        'Curral Novo': ['Centro', 'Serrote'],
        'Picos': ['Centro', 'Junco', 'Canto da Várzea', 'Ipueiras', 'Bomba'],
        'Afrânio': ['Centro', 'Ramos', 'Extrema'],
        'Petrolina': ['Centro', 'Areia Branca', 'Atrás da Banca', 'Cohab Massangano']
    };

    function atualizarSelectBairros(cidade) {
        const selectBairro = document.getElementById('filtro-bairro');
        if (!selectBairro) return;

        bairroFiltro = 'todos';
        selectBairro.innerHTML = '<option value="todos">Todos os Bairros</option>';

        if (!cidade || cidade === 'todas') {
            selectBairro.disabled = true;
            selectBairro.style.opacity = '0.6';
            selectBairro.style.cursor = 'not-allowed';
            return;
        }

        selectBairro.disabled = false;
        selectBairro.style.opacity = '1';
        selectBairro.style.cursor = 'pointer';

        // Busca pela chave exata ou normalizada
        const chaveEncontrada = Object.keys(BAIRROS_POR_CIDADE).find(
            k => k.toLowerCase() === cidade.toLowerCase() || cidade.toLowerCase().includes(k.toLowerCase())
        );

        const bairros = chaveEncontrada ? BAIRROS_POR_CIDADE[chaveEncontrada] : ['Centro'];
        bairros.forEach(b => {
            const opt = document.createElement('option');
            opt.value = b;
            opt.textContent = b;
            selectBairro.appendChild(opt);
        });
    }

    // Filtro por Cidade
    const filtroCidade = document.getElementById('filtro-cidade');
    filtroCidade?.addEventListener('change', (e) => {
        cidadeFiltro = e.target.value;
        atualizarSelectBairros(cidadeFiltro);
        renderizarVitrine();
        carregarProdutosApi();
    });

    // Filtro por Bairro
    const filtroBairro = document.getElementById('filtro-bairro');
    filtroBairro?.addEventListener('change', (e) => {
        bairroFiltro = e.target.value;
        renderizarVitrine();
        carregarProdutosApi();
    });

    // Ordenação
    const filtroOrdem = document.getElementById('filtro-ordem');
    filtroOrdem?.addEventListener('change', (e) => {
        ordemFiltro = e.target.value;
        renderizarVitrine();
    });

    // Botão Limpar Filtros
    btnLimparFiltros?.addEventListener('click', () => {
        termoBusca = '';
        if (campoBusca) campoBusca.value = '';
        categoriaFiltro = 'todas';
        botoesCategorias.forEach(b => {
            b.classList.remove('categoria-selecionada');
        });
        cidadeFiltro = 'todas';
        if (filtroCidade) filtroCidade.value = 'todas';
        atualizarSelectBairros('todas');
        bairroFiltro = 'todos';
        ordemFiltro = 'recentes';
        if (filtroOrdem) filtroOrdem.value = 'recentes';
        ativarModoPesquisa(false);
        renderizarVitrine();
        carregarProdutosApi();
    });

    // Inicializa os bairros no carregamento da vitrine
    atualizarSelectBairros(cidadeFiltro);
    atualizarSidebarFiltros();

    // Header e Menu Lateral (Drawer) são gerenciados de forma centralizada e global por sessao.js

    // Redireciona hash #favoritos para a página dedicada favoritos.html
    if (window.location.hash === '#favoritos') {
        window.location.href = window.ItaimRotas ? window.ItaimRotas.obterUrl('favoritos') : 'favoritos.html';
    }

    // O antigo modal de detalhes foi substituído pela navegação direta para a página produto.html

    document.getElementById('btn-modal-chat')?.addEventListener('click', () => {
        alert('Abrindo chat privado com o anunciante no Itaim Vende...');
    });

    // Tecla Escape para fechar gaveta ou dropdown
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            alternarDrawer(false);
            dropdownPerfil?.classList.remove('aberto');
        }
    });

    // Leitura automática de parâmetros da URL (ex: ?categoria=Eletrônicos ou ?q=celular)
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const catParam = urlParams.get('categoria');
        const buscaParam = urlParams.get('q') || urlParams.get('busca') || urlParams.get('search');

        if (buscaParam) {
            termoBusca = buscaParam.trim();
            if (campoBusca) campoBusca.value = termoBusca;
            ativarModoPesquisa(true);
            atualizarSidebarFiltros();
            renderizarVitrine();
        } else if (catParam && typeof window.filtrarPorCategoria === 'function') {
            setTimeout(() => {
                window.filtrarPorCategoria(catParam);
            }, 100);
        }
    } catch (err) {}
});
