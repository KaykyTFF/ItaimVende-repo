/**
 * ITAIM VENDE - PRODUTO: CARREGAMENTO DE DADOS E DETALHES
 * Arquivo: frontend/js/pages/produtos/produto/produto-dados.js
 */

(function () {
    'use strict';

    let produtoAtual = null;

    function formatarPreco(val, item) {
        const isDoacao = (item && (item.listingType === 'DOACAO' || item.listingType === 'doacao' || item.isDoacao))
            || (val === 0 || val === '0' || val === null || val === undefined || Number(val) <= 0 || val === 'Doação');
        if (isDoacao) {
            return '<span style="color: #44BD32; font-weight: 800;">Doação</span>';
        }
        return Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    async function carregarProduto() {
        const skeletonContainer = document.getElementById('skeleton-produto-container');
        const mainConteudo = document.getElementById('main-anuncio-conteudo');

        // Exibe skeleton screen enquanto busca anúncio
        if (skeletonContainer && window.ItaimSkeleton && typeof window.ItaimSkeleton.obterDetalhesProdutoHtml === 'function') {
            skeletonContainer.innerHTML = window.ItaimSkeleton.obterDetalhesProdutoHtml();
            if (mainConteudo) {
                mainConteudo.style.display = 'none';
            }
        }

        // Obter ID via URL (?id=, ?produto=, ?slug= ou #hash)
        const params = new URLSearchParams(window.location.search);
        let produtoIdParam = params.get('id') || params.get('produto') || params.get('slug');
        if (!produtoIdParam && window.location.hash) {
            produtoIdParam = window.location.hash.replace(/^#/, '');
        }

        // Carregar produtos da sessão ou fallback local
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

        let produto = null;

        // 1. Busca Direta na API por ID ou Slug
        if (produtoIdParam && window.ItaimApi && typeof window.ItaimApi.produtos?.obter === 'function') {
            try {
                const resApi = await window.ItaimApi.produtos.obter(produtoIdParam);
                if (resApi && resApi.success && resApi.data) {
                    produto = resApi.data;
                }
            } catch (errApi) {
                console.info('[Produto] Busca direta por ID falhou, buscando na listagem.');
            }
        }

        // 2. Busca na vitrine pública da API
        if (!produto && window.ItaimApi && typeof window.ItaimApi.produtos?.listar === 'function') {
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

        // 3. Fallback em cache local / mock
        if (!produto && produtoIdParam) {
            produto = todosProdutos.find(p => 
                String(p.id) === String(produtoIdParam) ||
                String(p.slug) === String(produtoIdParam) ||
                (p.titulo && String(p.titulo).toLowerCase() === String(produtoIdParam).toLowerCase())
            );
        }

        // 4. Se entrou sem parâmetros na URL, pega o primeiro item
        if (!produto && !produtoIdParam) {
            if (window.ItaimApi && typeof window.ItaimApi.produtos?.listar === 'function') {
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
            return null;
        }

        produtoAtual = produto;

        // Ocultar Skeleton e exibir o conteúdo real preenchido
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
        if (elPreco) elPreco.innerHTML = formatarPreco(produto.preco, produto);

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

        window.ItaimProdutoDados.produto = produto;
        return produto;
    }

    window.ItaimProdutoDados = {
        carregarProduto,
        obterProduto: () => produtoAtual,
        formatarPreco,
        produto: null
    };
})();
