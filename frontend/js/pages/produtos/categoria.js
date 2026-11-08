/**
 * ITAIM VENDE - LÓGICA DA PÁGINA DE CATEGORIA E RESULTADOS DE BUSCA (CATEGORIA.HTML)
 * Suporte a busca por termo (Enter na barra de pesquisa), barra lateral de filtros e alternador grid/lista
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Obter Parâmetros via URL
    const params = new URLSearchParams(window.location.search);
    let categoriaParam = params.get('cat') || 'todas';
    let termoBusca = (params.get('q') || params.get('busca') || params.get('search') || '').trim();
    const cidadeUrlParam = params.get('cid') || params.get('cidade') || params.get('city') || 'todas';

    // Elementos do DOM
    const tituloEl = document.getElementById('categoria-titulo');
    const subtituloEl = document.getElementById('categoria-subtitulo');
    const breadcrumbNome = document.getElementById('breadcrumb-categoria-nome');
    const contadorBadge = document.getElementById('categoria-contador-badge');
    const gradeProdutos = document.getElementById('grade-produtos');
    const btnVoltar = document.getElementById('btn-voltar-categoria');
    const formBusca = document.getElementById('form-busca');
    const campoBusca = document.getElementById('campo-busca');

    // Elementos da Barra Lateral e Header de Resultados
    const sidebarFiltros = document.getElementById('sidebar-filtros-pesquisa');
    const sidebarBackdrop = document.getElementById('sidebar-filtros-backdrop');
    const btnLimparSidebar = document.getElementById('btn-limpar-filtros-sidebar');
    const btnAbrirFiltrosMobile = document.getElementById('btn-abrir-filtros-mobile');
    const pesquisaTituloPrincipal = document.getElementById('pesquisa-titulo-principal');
    const pesquisaSubtituloContador = document.getElementById('pesquisa-subtitulo-contador');
    const selectOrdemPesquisa = document.getElementById('select-ordem-pesquisa');
    const btnViewGrid = document.getElementById('btn-view-grid');
    const btnViewLista = document.getElementById('btn-view-lista');

    // Preenche campo de busca com o termo pesquisado
    if (campoBusca && termoBusca) {
        campoBusca.value = termoBusca;
    }

    // Normalizar categoria
    const catObj = (typeof buscarCategoria === 'function') ? buscarCategoria(categoriaParam) : null;
    const categoriaNomeExibicao = catObj
        ? catObj.nome
        : ((categoriaParam.toLowerCase() === 'todas') ? 'Todas as Categorias' : categoriaParam);

    if (termoBusca) {
        document.title = `Busca por "${termoBusca}" - Itaim Vende`;
        if (tituloEl) tituloEl.textContent = `Resultados para "${termoBusca}"`;
        if (breadcrumbNome) breadcrumbNome.textContent = `Busca: ${termoBusca}`;
        if (subtituloEl) subtituloEl.textContent = `Mostrando anúncios encontrados para "${termoBusca}"`;
    } else {
        document.title = `${categoriaNomeExibicao} - Itaim Vende`;
        if (tituloEl) tituloEl.textContent = categoriaNomeExibicao;
        if (breadcrumbNome) breadcrumbNome.textContent = categoriaNomeExibicao;
        if (subtituloEl) {
            subtituloEl.textContent = (categoriaParam.toLowerCase() === 'todas')
                ? 'Todos os anúncios à venda na região de Paulistana e cidades vizinhas'
                : `Anúncios e ofertas na categoria ${categoriaNomeExibicao}`;
        }
    }

    // Botão Voltar
    btnVoltar?.addEventListener('click', () => {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            window.location.href = (window.ItaimRotas ? window.ItaimRotas.obterUrl('home') : '../home/home.html');
        }
    });

    // 2. Estados de Filtragem
    let todosProdutos = [];
    let cidadeFiltro = cidadeUrlParam;
    let ordemFiltro = 'relevantes';
    let modoVisualizacao = 'grid';

    const categoriasSelecionadas = new Set();
    const condicoesSelecionadas = new Set();
    const cidadesSelecionadas = new Set();
    let precoMinFiltro = 0;
    let precoMaxFiltro = 5000;

    // Se veio com categoria específica na URL, adiciona ao filtro da barra
    if (categoriaParam && categoriaParam.toLowerCase() !== 'todas') {
        categoriasSelecionadas.add(categoriaNomeExibicao);
    }
    if (cidadeUrlParam && cidadeUrlParam.toLowerCase() !== 'todas') {
        cidadesSelecionadas.add(cidadeUrlParam);
    }

    // Sincronizar favoritos apenas para usuários autenticados
    const estaAutenticado = (window.ItaimSessao && typeof window.ItaimSessao.usuarioEstaAutenticado === 'function')
        ? window.ItaimSessao.usuarioEstaAutenticado()
        : !!(localStorage.getItem('itaim_token') && localStorage.getItem('itaim_usuario_logado'));

    let favoritosSet = new Set();
    if (estaAutenticado) {
        try {
            favoritosSet = new Set(JSON.parse(localStorage.getItem('itaim_favoritos') || '[]').map(String));
        } catch (e) { }
    } else {
        try {
            localStorage.removeItem('itaim_favoritos');
        } catch (e) { }
    }

    function atualizarContadorFavoritos() {
        const badge = document.getElementById('favoritos-contador-badge');
        if (badge) {
            const estaLogado = (window.ItaimSessao && typeof window.ItaimSessao.usuarioEstaAutenticado === 'function')
                ? window.ItaimSessao.usuarioEstaAutenticado()
                : !!(localStorage.getItem('itaim_token') && localStorage.getItem('itaim_usuario_logado'));
            badge.textContent = estaLogado ? favoritosSet.size : 0;
        }
    }
    atualizarContadorFavoritos();

    function formatarPreco(val, item) {
        const isDoacao = (item && (item.listingType === 'DOACAO' || item.listingType === 'doacao' || item.isDoacao))
            || (!val || val <= 0 || val === '0' || val === 'Doação');
        if (isDoacao) {
            return '<span class="doacao" style="color: #44BD32; font-weight: 800;">Doação</span>';
        }
        return Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    // Atualiza opções dinâmicas da barra lateral de filtros ("filtrar por")
    function atualizarSidebarFiltros() {
        const opcoesCategoriasEl = document.getElementById('sidebar-opcoes-categorias');
        const opcoesCidadesEl = document.getElementById('sidebar-opcoes-cidades');

        const contagemCat = {};
        const contagemCid = {};
        let countNovo = 0;
        let countExcelente = 0;
        let countBom = 0;
        let countSinais = 0;
        let countDefeito = 0;
        let countPreco50 = 0;
        let countPreco200 = 0;
        let countPreco500 = 0;
        let countPreco500mais = 0;

        // Base de cálculo para contadores (considera o termo de busca se ativo)
        const baseCalculo = termoBusca
            ? todosProdutos.filter(p => {
                const q = termoBusca.toLowerCase();
                return (p.titulo && p.titulo.toLowerCase().includes(q)) ||
                    (p.categoria && p.categoria.toLowerCase().includes(q)) ||
                    (p.cidade && p.cidade.toLowerCase().includes(q)) ||
                    (p.bairro && p.bairro.toLowerCase().includes(q)) ||
                    (p.descricao && p.descricao.toLowerCase().includes(q));
            })
            : todosProdutos;

        baseCalculo.forEach(p => {
            const cat = p.categoria || 'Geral';
            contagemCat[cat] = (contagemCat[cat] || 0) + 1;

            const cid = p.cidade || 'Paulistana';
            contagemCid[cid] = (contagemCid[cid] || 0) + 1;

            const cond = (p.condicao || p.condition || '').toLowerCase();
            if (cond.includes('novo') && !cond.includes('semi')) {
                countNovo++;
            } else if (cond.includes('excelente') || cond.includes('semi')) {
                countExcelente++;
            } else if (cond.includes('sinais')) {
                countSinais++;
            } else if (cond.includes('defeito') || cond.includes('peça') || cond.includes('peca')) {
                countDefeito++;
            } else {
                countBom++;
            }

            const pr = Number(p.preco || 0);
            if (pr > 0 && pr <= 50) countPreco50++;
            else if (pr > 50 && pr <= 200) countPreco200++;
            else if (pr > 200 && pr <= 500) countPreco500++;
            else if (pr > 500) countPreco500mais++;
        });

        // Atualizar Contadores de Condição
        const elNovo = document.getElementById('count-condicao-novo');
        const elExcelente = document.getElementById('count-condicao-excelente');
        const elBom = document.getElementById('count-condicao-bom');
        const elSinais = document.getElementById('count-condicao-sinais');
        const elDefeito = document.getElementById('count-condicao-defeito');
        if (elNovo) elNovo.textContent = `(${countNovo})`;
        if (elExcelente) elExcelente.textContent = `(${countExcelente})`;
        if (elBom) elBom.textContent = `(${countBom})`;
        if (elSinais) elSinais.textContent = `(${countSinais})`;
        if (elDefeito) elDefeito.textContent = `(${countDefeito})`;

        // Atualizar Contadores de Preço
        const elP50 = document.getElementById('count-preco-50');
        const elP200 = document.getElementById('count-preco-200');
        const elP500 = document.getElementById('count-preco-500');
        const elP500m = document.getElementById('count-preco-500mais');
        if (elP50) elP50.textContent = `(${countPreco50})`;
        if (elP200) elP200.textContent = `(${countPreco200})`;
        if (elP500) elP500.textContent = `(${countPreco500})`;
        if (elP500m) elP500m.textContent = `(${countPreco500mais})`;

        // Renderizar Categorias na Barra Lateral (inclui todas as categorias oficiais que existem no app)
        if (opcoesCategoriasEl) {
            const listaOficial = (window.ItaimCategoriasUtils && typeof window.ItaimCategoriasUtils.obterTodasCategorias === 'function')
                ? window.ItaimCategoriasUtils.obterTodasCategorias()
                : ((typeof CATEGORIAS !== 'undefined' && Array.isArray(CATEGORIAS)) ? CATEGORIAS : []);

            const chavesOficiais = listaOficial.map(c => c.chave || c.nome);
            const contagemCatTotal = {};
            chavesOficiais.forEach(cat => {
                contagemCatTotal[cat] = 0;
            });

            // Contabiliza cada anúncio na respectiva categoria oficial
            baseCalculo.forEach(p => {
                let casou = false;
                for (const catObj of listaOficial) {
                    const pertence = (window.ItaimCategoriasUtils && typeof window.ItaimCategoriasUtils.produtoPertenceCategoria === 'function')
                        ? window.ItaimCategoriasUtils.produtoPertenceCategoria(p, catObj)
                        : ((typeof produtoPertenceCategoria === 'function')
                            ? produtoPertenceCategoria(p, catObj)
                            : ((p.categoria || '').toLowerCase() === (catObj.chave || '').toLowerCase()));

                    if (pertence) {
                        contagemCatTotal[catObj.chave] = (contagemCatTotal[catObj.chave] || 0) + 1;
                        casou = true;
                        break;
                    }
                }
                if (!casou) {
                    const pCat = p.categoria || 'Outros';
                    contagemCatTotal[pCat] = (contagemCatTotal[pCat] || 0) + 1;
                }
            });

            // Ordenação: selecionadas primeiro, depois categorias com anúncios (decrescente), depois todas as outras em ordem alfabética
            const todasCategorias = Object.keys(contagemCatTotal);
            todasCategorias.sort((a, b) => {
                const aSel = categoriasSelecionadas.has(a) ? 1 : 0;
                const bSel = categoriasSelecionadas.has(b) ? 1 : 0;
                if (aSel !== bSel) return bSel - aSel;

                const aCount = contagemCatTotal[a] || 0;
                const bCount = contagemCatTotal[b] || 0;
                if (aCount > 0 || bCount > 0) {
                    if (aCount !== bCount) return bCount - aCount;
                }

                return a.localeCompare(b, 'pt-BR');
            });

            opcoesCategoriasEl.innerHTML = todasCategorias.map(cat => {
                const checked = categoriasSelecionadas.has(cat) ? 'checked' : '';
                return `
                    <label class="filtro-checkbox-item">
                        <div class="filtro-check-conteudo">
                            <input type="checkbox" class="filtro-sidebar-check" name="filtro_categoria" value="${cat}" ${checked}>
                            <span class="custom-checkbox"></span>
                            <span class="filtro-label-texto" title="${cat}">${cat.toLowerCase()}</span>
                        </div>
                        <span class="filtro-contador">(${contagemCatTotal[cat] || 0})</span>
                    </label>
                `;
            }).join('');

            opcoesCategoriasEl.querySelectorAll('input[type="checkbox"]').forEach(chk => {
                chk.addEventListener('change', (e) => {
                    const val = e.target.value;
                    if (e.target.checked) categoriasSelecionadas.add(val);
                    else categoriasSelecionadas.delete(val);
                    renderizar();
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
                    renderizar();
                });
            });
        }
    }

    // 3. Renderização dos Produtos e Aplicação de Filtros
    function renderizar() {
        function formatarLocalCard(cidade, bairro) {
            const c = (cidade || 'Paulistana').trim();
            let b = (bairro || 'Centro').trim();
            if (!b || /^\d/.test(b) || /\d{5}/.test(b) || b.toLowerCase().includes('cep')) {
                b = 'Centro';
            }
            return `${c} - ${b}`;
        }

        let lista = todosProdutos.filter(p => !p.status || String(p.status).toLowerCase() === 'ativo');

        // Filtro por termo de busca (se houver)
        if (termoBusca) {
            const q = termoBusca.toLowerCase();
            lista = lista.filter(p => {
                return (p.titulo && p.titulo.toLowerCase().includes(q)) ||
                    (p.categoria && p.categoria.toLowerCase().includes(q)) ||
                    (p.cidade && p.cidade.toLowerCase().includes(q)) ||
                    (p.bairro && p.bairro.toLowerCase().includes(q)) ||
                    (p.descricao && p.descricao.toLowerCase().includes(q));
            });
        }

        // Filtro por categorias da barra lateral
        if (categoriasSelecionadas.size > 0) {
            lista = lista.filter(p => {
                return Array.from(categoriasSelecionadas).some(catSel => {
                    const cObj = (window.ItaimCategoriasUtils && typeof window.ItaimCategoriasUtils.buscarCategoria === 'function')
                        ? window.ItaimCategoriasUtils.buscarCategoria(catSel)
                        : ((typeof buscarCategoria === 'function') ? buscarCategoria(catSel) : null);
                    if (cObj && window.ItaimCategoriasUtils && typeof window.ItaimCategoriasUtils.produtoPertenceCategoria === 'function') {
                        return window.ItaimCategoriasUtils.produtoPertenceCategoria(p, cObj);
                    }
                    if (cObj && typeof produtoPertenceCategoria === 'function') {
                        return produtoPertenceCategoria(p, cObj);
                    }
                    const pCat = (p.categoria || '').toLowerCase();
                    const sCat = catSel.toLowerCase();
                    return pCat === sCat || pCat.includes(sCat) || sCat.includes(pCat);
                });
            });
        } else if (categoriaParam.toLowerCase() !== 'todas' && !termoBusca) {
            if (catObj && window.ItaimCategoriasUtils && typeof window.ItaimCategoriasUtils.produtoPertenceCategoria === 'function') {
                lista = lista.filter(p => window.ItaimCategoriasUtils.produtoPertenceCategoria(p, catObj));
            } else if (catObj && typeof produtoPertenceCategoria === 'function') {
                lista = lista.filter(p => produtoPertenceCategoria(p, catObj));
            } else {
                lista = lista.filter(p => (p.categoria || '').toLowerCase() === categoriaParam.toLowerCase());
            }
        }

        // Filtro por cidades da barra lateral
        if (cidadesSelecionadas.size > 0) {
            lista = lista.filter(p => p.cidade && cidadesSelecionadas.has(p.cidade));
        }

        // Filtro por condição
        if (condicoesSelecionadas.size > 0) {
            lista = lista.filter(p => {
                const cond = (p.condicao || p.condition || 'usado').toLowerCase();
                return Array.from(condicoesSelecionadas).some(c => {
                    const cLow = c.toLowerCase();
                    if (cLow === 'novo') return cond.includes('novo') && !cond.includes('semi');
                    if (cLow.includes('excelente') || cLow.includes('semi')) return cond.includes('excelente') || cond.includes('semi');
                    if (cLow.includes('sinais')) return cond.includes('sinais');
                    if (cLow.includes('defeito') || cLow.includes('peça') || cLow.includes('peca')) return cond.includes('defeito') || cond.includes('peça') || cond.includes('peca');
                    if (cLow.includes('bom') || cLow === 'usado') return cond.includes('bom') || cond === 'usado' || (!cond.includes('novo') && !cond.includes('excelente') && !cond.includes('semi') && !cond.includes('sinais') && !cond.includes('defeito'));
                    return cond.includes(cLow);
                });
            });
        }

        // Filtro por faixa de preço (slider interativo)
        if (precoMinFiltro > 0 || precoMaxFiltro < 5000) {
            lista = lista.filter(p => {
                const pr = Number(p.preco || 0);
                if (precoMinFiltro > 0 && pr < precoMinFiltro) return false;
                if (precoMaxFiltro < 5000 && pr > precoMaxFiltro) return false;
                return true;
            });
        }

        // Ordenação
        if (ordemFiltro === 'menor-preco') {
            lista.sort((a, b) => (a.preco || 0) - (b.preco || 0));
        } else if (ordemFiltro === 'maior-preco') {
            lista.sort((a, b) => (b.preco || 0) - (a.preco || 0));
        } else if (ordemFiltro === 'relevantes' && termoBusca) {
            const q = termoBusca.toLowerCase();
            lista.sort((a, b) => {
                const aMatch = (a.titulo || '').toLowerCase().startsWith(q) ? 2 : ((a.titulo || '').toLowerCase().includes(q) ? 1 : 0);
                const bMatch = (b.titulo || '').toLowerCase().startsWith(q) ? 2 : ((b.titulo || '').toLowerCase().includes(q) ? 1 : 0);
                return bMatch - aMatch;
            });
        } else {
            lista.sort((a, b) => {
                if (a.createdAt && b.createdAt) {
                    return new Date(b.createdAt) - new Date(a.createdAt);
                }
                return (b.id || 0) > (a.id || 0) ? 1 : -1;
            });
        }

        // Atualizar contadores
        const textoContador = `${lista.length} ${lista.length === 1 ? 'produto encontrado' : 'produtos encontrados'}`;
        if (contadorBadge) contadorBadge.textContent = textoContador;
        if (pesquisaSubtituloContador) pesquisaSubtituloContador.textContent = textoContador;
        if (pesquisaTituloPrincipal) {
            pesquisaTituloPrincipal.textContent = termoBusca
                ? `listagem de produtos`
                : (categoriaNomeExibicao ? categoriaNomeExibicao.toLowerCase() : 'listagem de produtos');
        }

        if (lista.length === 0) {
            gradeProdutos.innerHTML = `
                <div class="estado-vazio" style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; border-radius: 16px; background: #FFFFFF; border: 1px dashed #CBD5E1; margin: 10px auto; width: 100%; max-width: 580px;">
                    <div class="anuncios-vazio-icone" style="width: 64px; height: 64px; margin: 0 auto 16px; border-radius: 50%; background: rgba(68, 189, 50, 0.12); display: inline-flex; align-items: center; justify-content: center; color: #44BD32;">
                        <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                            <line x1="12" y1="22.08" x2="12" y2="12"></line>
                        </svg>
                    </div>
                    <h3 style="font-size: 20px; font-weight: 800; color: #1E293B; margin-bottom: 8px;">Nenhum produto encontrado</h3>
                    <p style="color: #64748B; font-size: 14.5px; margin-bottom: 22px; line-height: 1.5;">Não há anúncios correspondentes com os filtros atuais. Tente buscar por outro termo ou limpe os filtros da barra lateral.</p>
                    <a href="${window.ItaimRotas ? window.ItaimRotas.obterUrl('vender') : '../vender/vender.html'}" style="background: #44BD32; color: #FFFFFF; font-weight: 700; padding: 12px 24px; border-radius: 30px; text-decoration: none; font-size: 15px; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 12px rgba(68,189,50,0.25);">
                        + Anunciar Produto Agora
                    </a>
                </div>
            `;
            return;
        }

        const placeholderSrc = (window.ItaimRotas && typeof window.ItaimRotas.obterAsset === 'function')
            ? window.ItaimRotas.obterAsset('assets/placeholders/produto-placeholder.svg')
            : (window.location.protocol && window.location.protocol.startsWith('http') ? '/assets/placeholders/produto-placeholder.svg' : '../../assets/placeholders/produto-placeholder.svg');

        // Renderizar cards limpos (sem o botão "+")
        gradeProdutos.innerHTML = lista.map(p => {
            const pId = String(p.id);
            const estaLogado = (window.ItaimSessao && typeof window.ItaimSessao.usuarioEstaAutenticado === 'function')
                ? window.ItaimSessao.usuarioEstaAutenticado()
                : !!(localStorage.getItem('itaim_token') && localStorage.getItem('itaim_usuario_logado'));
            const isFav = estaLogado && favoritosSet.has(pId);
            return `
                <article class="card-produto fade-in-content" data-id="${pId}">
                    <div class="card-img-box">
                        <img src="${p.imagem}" alt="${p.titulo}" class="card-img" onerror="this.onerror=null; this.src='${placeholderSrc}'">
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
                            <span class="card-local" title="${formatarLocalCard(p.cidade, p.bairro)}">
                                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: -1px; margin-right: 2px;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>${formatarLocalCard(p.cidade, p.bairro)}
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
                } catch (err) { }
                atualizarContadorFavoritos();

                if (window.ItaimApi && window.ItaimApi.auth.obterToken()) {
                    try {
                        await window.ItaimApi.favoritos.toggle(id);
                    } catch (err) { }
                }
            });
        });
    }

    // 4. Carregar Produtos (API com Fallback Local)
    async function carregarProdutosCategoria() {
        if (gradeProdutos && window.ItaimSkeleton && typeof window.ItaimSkeleton.renderizarCards === 'function') {
            window.ItaimSkeleton.renderizarCards(gradeProdutos, 8);
        }

        if (window.ItaimApi && typeof window.ItaimApi.produtos.listar === 'function') {
            try {
                const apiParams = {};
                if (categoriaParam && categoriaParam.toLowerCase() !== 'todas') {
                    apiParams.category = categoriaParam;
                }
                if (termoBusca) {
                    apiParams.search = termoBusca;
                }

                const res = await window.ItaimApi.produtos.listar(apiParams);
                if (res && res.success && Array.isArray(res.data)) {
                    const mapaExcluidos = (() => {
                        try { return new Set(JSON.parse(localStorage.getItem('itaim_produtos_excluidos') || '[]').map(String)); } catch (e) { return new Set(); }
                    })();
                    const mapaStatus = (() => {
                        try { return JSON.parse(localStorage.getItem('itaim_produtos_status_map') || '{}'); } catch (e) { return {}; }
                    })();

                    todosProdutos = res.data
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
                                bairro: (() => {
                                    const b = (p.bairro || p.neighborhood || 'Centro').trim();
                                    return (!b || /^\d/.test(b) || /\d{5}/.test(b) || b.toLowerCase().includes('cep')) ? 'Centro' : b;
                                })(),
                                imagem: window.ItaimApi.resolverUrlImagem(p.imagem || (p.images && p.images[0]) || '')
                            };
                        })
                        .filter(p => {
                            const s = String(p.status || '').toLowerCase();
                            return s === 'ativo' || s === 'active' || !p.status;
                        });
                    atualizarSidebarFiltros();
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
            } catch (e) { }
        }
        atualizarSidebarFiltros();
        renderizar();
    }

    // 5. Eventos da Barra Lateral e Header de Busca
    // Digitação no campo de busca: NÃO filtra enquanto digita (apenas no Enter)
    campoBusca?.addEventListener('input', (e) => {
        if (e.target.value.trim() === '' && termoBusca) {
            termoBusca = '';
            try {
                const url = new URL(window.location.href);
                url.searchParams.delete('q');
                window.history.pushState({}, '', url.toString());
            } catch (err) { }
            atualizarSidebarFiltros();
            renderizar();
        }
    });

    // Submissão da Busca no Enter ou clique na lupa
    formBusca?.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = campoBusca ? campoBusca.value.trim() : '';
        termoBusca = query;

        try {
            const url = new URL(window.location.href);
            if (termoBusca) {
                url.searchParams.set('q', termoBusca);
            } else {
                url.searchParams.delete('q');
            }
            window.history.pushState({ search: termoBusca }, '', url.toString());
        } catch (err) { }

        if (termoBusca) {
            document.title = `Busca por "${termoBusca}" - Itaim Vende`;
            if (tituloEl) tituloEl.textContent = `Resultados para "${termoBusca}"`;
            if (breadcrumbNome) breadcrumbNome.textContent = `Busca: ${termoBusca}`;
            if (subtituloEl) subtituloEl.textContent = `Mostrando anúncios encontrados para "${termoBusca}"`;
        }

        atualizarSidebarFiltros();
        renderizar();
    });

    // Alternador de Visualização: Grid vs Lista
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

    // Ordenação
    selectOrdemPesquisa?.addEventListener('change', (e) => {
        ordemFiltro = e.target.value;
        renderizar();
    });

    // Filtros de Condição na Sidebar
    document.querySelectorAll('input[name="filtro_condicao"]').forEach(chk => {
        chk.addEventListener('change', (e) => {
            const val = e.target.value;
            if (e.target.checked) condicoesSelecionadas.add(val);
            else condicoesSelecionadas.delete(val);
            renderizar();
        });
    });

    // ==========================================================================
    // Slider Interativo de Faixa de Preço
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
            renderizar();
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
    btnLimparSidebar?.addEventListener('click', () => {
        categoriasSelecionadas.clear();
        condicoesSelecionadas.clear();
        cidadesSelecionadas.clear();
        termoBusca = '';
        if (campoBusca) campoBusca.value = '';

        document.querySelectorAll('input[name="filtro_condicao"]').forEach(c => c.checked = false);
        atualizarSliderPreco(0, 5000, false);

        try {
            const url = new URL(window.location.href);
            url.searchParams.delete('q');
            window.history.pushState({}, '', url.toString());
        } catch (err) { }

        atualizarSidebarFiltros();
        renderizar();
    });

    // Mobile Filtros Drawer
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

    // Inicialização da Grade com Skeleton
    if (window.ItaimSkeleton && typeof window.ItaimSkeleton.renderizarCards === 'function') {
        window.ItaimSkeleton.renderizarCards(gradeProdutos, 8);
    }
    carregarProdutosCategoria();
});
