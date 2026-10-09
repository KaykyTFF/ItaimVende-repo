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
    // 2. DADOS E GERENCIAMENTO DE PRODUTOS
    // ==========================================================================
    let produtos = [];
    if (window.ItaimSessao && typeof window.ItaimSessao.obterTodosProdutos === 'function') {
        produtos = window.ItaimSessao.obterTodosProdutos();
    } else if (typeof PRODUTOS_INICIAIS !== 'undefined' && Array.isArray(PRODUTOS_INICIAIS)) {
        produtos = [...PRODUTOS_INICIAIS];
        try {
            const locais = JSON.parse(localStorage.getItem('itaim_produtos_cadastrados') || '[]');
            if (Array.isArray(locais)) produtos = [...locais, ...produtos];
        } catch(e) {}
    }

    // Carregar favoritos do localStorage
    let favoritosSet = new Set();
    try {
        const salvos = JSON.parse(localStorage.getItem('itaim_favoritos') || '[]');
        favoritosSet = new Set(salvos);
    } catch (e) {}

    function atualizarContadorFavoritos() {
        const badge = document.getElementById('favoritos-contador-badge');
        if (badge) {
            badge.textContent = favoritosSet.size;
        }
    }
    atualizarContadorFavoritos();

    // ==========================================================================
    // 3. RENDERIZAÇÃO DOS CARDS DE PRODUTOS
    // ==========================================================================
    const gradeProdutos = document.getElementById('grade-produtos');
    const contadorProdutos = document.getElementById('contador-produtos');
    const btnLimparFiltros = document.getElementById('btn-limpar-filtros');

    let categoriaFiltro = 'todas';
    let cidadeFiltro = 'todas';
    let ordemFiltro = 'recentes';
    let termoBusca = '';

    function formatarPreco(valor) {
        if (!valor || valor <= 0) {
            return '<span class="doacao">Doação / Grátis</span>';
        }
        return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    function renderizarVitrine() {
        if (!gradeProdutos) return;

        // Filtragem
        let lista = produtos.filter(p => {
            const matchesCategoria = (categoriaFiltro === 'todas') || 
                (p.categoria && p.categoria.toLowerCase().includes(categoriaFiltro.toLowerCase()));
            
            const matchesCidade = (cidadeFiltro === 'todas') || 
                (p.cidade && p.cidade.toLowerCase() === cidadeFiltro.toLowerCase());
            
            const matchesBusca = !termoBusca || 
                (p.titulo && p.titulo.toLowerCase().includes(termoBusca.toLowerCase())) ||
                (p.cidade && p.cidade.toLowerCase().includes(termoBusca.toLowerCase())) ||
                (p.categoria && p.categoria.toLowerCase().includes(termoBusca.toLowerCase()));

            return matchesCategoria && matchesCidade && matchesBusca;
        });

        // Ordenação
        if (ordemFiltro === 'menor-preco') {
            lista.sort((a, b) => (a.preco || 0) - (b.preco || 0));
        } else if (ordemFiltro === 'maior-preco') {
            lista.sort((a, b) => (b.preco || 0) - (a.preco || 0));
        } else {
            lista.sort((a, b) => b.id - a.id);
        }

        // Atualizar contador
        if (contadorProdutos) {
            contadorProdutos.textContent = `(${lista.length} produto${lista.length !== 1 ? 's' : ''})`;
        }

        // Mostrar / ocultar botão de limpar filtros
        if (btnLimparFiltros) {
            const filtrosAtivos = (categoriaFiltro !== 'todas') || (cidadeFiltro !== 'todas') || (termoBusca !== '');
            btnLimparFiltros.style.display = filtrosAtivos ? 'inline-flex' : 'none';
        }

        // Se vazio
        if (lista.length === 0) {
            gradeProdutos.innerHTML = `
                <div class="estado-vazio" style="grid-column: 1 / -1; text-align: center; padding: 48px 20px; background: #FFFFFF; border-radius: 16px; border: 1px dashed #CBD5E1; margin: 10px auto; width: 100%; max-width: 580px;">
                    <div class="estado-vazio-icon" style="font-size: 42px; margin-bottom: 12px;">📦</div>
                    <h3 style="font-size: 20px; font-weight: 800; color: #1E293B; margin-bottom: 8px;">
                        ${produtos.length === 0 ? 'Nenhum produto anunciado no momento' : 'Nenhum anúncio encontrado'}
                    </h3>
                    <p style="color: #64748B; font-size: 14.5px; margin-bottom: 22px; line-height: 1.5;">
                        ${produtos.length === 0 
                            ? 'Ainda não há produtos à venda. Desapegue do que você não usa mais ou seja o primeiro a anunciar!' 
                            : 'Tente buscar por outro termo ou remova os filtros selecionados.'}
                    </p>
                    <a href="${window.ItaimRotas ? window.ItaimRotas.obterUrl('vender') : '../vender/vender.html'}" style="background: #44BD32; color: #FFFFFF; font-weight: 700; padding: 12px 24px; border-radius: 30px; text-decoration: none; font-size: 15px; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 12px rgba(68,189,50,0.25);">
                        + Anunciar Produto Agora
                    </a>
                </div>
            `;
            return;
        }

        // Gerar Cards
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
        document.querySelectorAll('.card-produto').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('.btn-favorito')) return;
                const id = parseInt(card.getAttribute('data-id'), 10);
                window.location.href = window.ItaimRotas ? window.ItaimRotas.obterUrl('produto', `id=${id}`) : `produto.html?id=${id}`;
            });
        });

        // Eventos nos botões de favoritos
        document.querySelectorAll('.btn-favorito').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(btn.getAttribute('data-id'), 10);
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
            });
        });
    }

    renderizarVitrine();

    // ==========================================================================
    // 4. FILTROS E BUSCA INTERATIVA
    // ==========================================================================
    // Busca em tempo real
    const campoBusca = document.getElementById('campo-busca');
    campoBusca?.addEventListener('input', (e) => {
        termoBusca = e.target.value.trim();
        renderizarVitrine();
    });

    // Filtro por Categorias
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

    // Filtro por Cidade
    const filtroCidade = document.getElementById('filtro-cidade');
    filtroCidade?.addEventListener('change', (e) => {
        cidadeFiltro = e.target.value;
        renderizarVitrine();
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
        ordemFiltro = 'recentes';
        if (filtroOrdem) filtroOrdem.value = 'recentes';
        renderizarVitrine();
    });

    // Header e Menu Lateral (Drawer) são gerenciados de forma centralizada e global por sessao.js

    // Redireciona hash #favoritos para a página dedicada favoritos.html
    if (window.location.hash === '#favoritos') {
        window.location.href = window.ItaimRotas ? window.ItaimRotas.obterUrl('favoritos') : 'favoritos.html';
    }

    // O antigo modal de detalhes foi substituído pela navegação direta para a página produto.html

    btnModalChat?.addEventListener('click', () => {
        alert('Abrindo chat privado com o anunciante no Itaim Vende...');
    });

    // Tecla Escape para fechar gaveta ou dropdown
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            alternarDrawer(false);
            dropdownPerfil?.classList.remove('aberto');
        }
    });

    // Leitura automática de parâmetros da URL (ex: ?categoria=Eletrônicos)
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const catParam = urlParams.get('categoria');
        if (catParam && typeof window.filtrarPorCategoria === 'function') {
            setTimeout(() => {
                window.filtrarPorCategoria(catParam);
            }, 100);
        }
    } catch (err) {}
});
