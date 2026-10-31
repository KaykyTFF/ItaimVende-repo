/**
 * ITAIM VENDE - PRODUTO: ANÚNCIOS RELACIONADOS DA REGIÃO
 * Arquivo: frontend/js/pages/produtos/produto/produto-relacionados.js
 * 
 * Responsabilidades:
 * - Buscar e exibir anúncios recomendados da mesma região e/ou categoria
 * - Filtrar o anúncio atual e produtos encerrados/vendidos
 * - Atualizar link da categoria no cabeçalho da seção
 * - Gerenciar cards interativos, navegação e favoritos
 */

(function () {
    'use strict';

    function formatarPrecoCard(valor, item) {
        const isDoacao = (item && (item.listingType === 'DOACAO' || item.listingType === 'doacao' || item.isDoacao))
            || (valor === 0 || valor === '0' || valor === null || valor === undefined || Number(valor) <= 0 || valor === 'Doação');
        if (isDoacao) {
            return '<span class="doacao" style="color: #44BD32; font-weight: 800;">Doação</span>';
        }
        return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    function formatarTempoPublicacao(dataIso) {
        if (!dataIso) return 'Hoje';
        try {
            const diffMs = Date.now() - new Date(dataIso).getTime();
            const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
            if (diffHoras < 1) return 'Agora há pouco';
            if (diffHoras < 24) return `${diffHoras}h atrás`;
            const diffDias = Math.floor(diffHoras / 24);
            return diffDias === 1 ? 'Ontem' : `${diffDias} dias atrás`;
        } catch (e) {
            return 'Hoje';
        }
    }

    async function buscarProdutos() {
        let lista = [];

        // 1. Tentar buscar vitrine via API oficial
        if (window.ItaimApi && typeof window.ItaimApi.produtos?.listar === 'function') {
            try {
                const resp = await window.ItaimApi.produtos.listar();
                if (resp && resp.success && Array.isArray(resp.data)) {
                    lista = resp.data;
                }
            } catch (err) {
                console.info('[Relacionados] Vitrine da API indisponível, usando fallback local.');
            }
        }

        // 2. Fallback de sessão ou armazenamento local
        if (!lista || lista.length === 0) {
            if (window.ItaimSessao && typeof window.ItaimSessao.obterTodosProdutos === 'function') {
                lista = window.ItaimSessao.obterTodosProdutos() || [];
            } else {
                try {
                    const salvos = JSON.parse(localStorage.getItem('itaim_produtos_cadastrados') || '[]');
                    const iniciais = (typeof PRODUTOS_INICIAIS !== 'undefined' && Array.isArray(PRODUTOS_INICIAIS)) ? PRODUTOS_INICIAIS : [];
                    lista = [...salvos, ...iniciais];
                } catch (e) {
                    lista = [];
                }
            }
        }

        return lista;
    }

    function obterFavoritosSet() {
        const set = new Set();
        if (window.ItaimSessao && typeof window.ItaimSessao.obterFavoritosIds === 'function') {
            const favs = window.ItaimSessao.obterFavoritosIds();
            if (Array.isArray(favs)) {
                favs.forEach(id => set.add(String(id)));
            }
        } else {
            try {
                const salvos = JSON.parse(localStorage.getItem('itaim_favoritos') || '[]');
                if (Array.isArray(salvos)) {
                    salvos.forEach(id => set.add(String(id)));
                }
            } catch (e) {}
        }
        return set;
    }

    async function inicializar(produtoParam) {
        const gradeEl = document.getElementById('grade-relacionados');
        if (!gradeEl) return;

        const produto = produtoParam || window.ItaimProdutoDados?.obterProduto();
        if (!produto) return;

        // 1. Exibir skeleton enquanto busca
        if (window.ItaimSkeleton && typeof window.ItaimSkeleton.renderizarCards === 'function') {
            window.ItaimSkeleton.renderizarCards(gradeEl, 4);
        }

        // 2. Atualizar link de "Ver mais na categoria"
        const categoriaNome = produto.categoria || produto.category?.name || '';
        const linkVerMais = document.querySelector('.link-ver-mais-categoria');
        if (linkVerMais) {
            if (categoriaNome) {
                linkVerMais.textContent = `Ver todos em ${categoriaNome} →`;
                linkVerMais.href = window.ItaimRotas 
                    ? window.ItaimRotas.obterUrl('categoria', `cat=${encodeURIComponent(categoriaNome)}`)
                    : `categoria.html?cat=${encodeURIComponent(categoriaNome)}`;
            } else {
                linkVerMais.textContent = 'Ver todas as ofertas →';
                linkVerMais.href = window.ItaimRotas 
                    ? window.ItaimRotas.obterUrl('home')
                    : '../home/home.html';
            }
        }

        // 3. Buscar todos os anúncios disponíveis
        const todosProdutos = await buscarProdutos();

        const prodAtualId = String(produto.id || '');
        const prodAtualSlug = String(produto.slug || '');
        const prodAtualCat = String(categoriaNome).trim().toLowerCase();
        const prodAtualCidade = String(produto.cidade || produto.city || 'Paulistana').trim().toLowerCase();

        // 4. Filtrar anúncios válidos (não vendido, não arquivado, não é o anúncio atual)
        const vistos = new Set();
        const candidatos = [];

        for (const item of todosProdutos) {
            if (!item || !item.id) continue;
            const itemId = String(item.id);
            if (vistos.has(itemId)) continue;
            vistos.add(itemId);

            // Exclui o anúncio atual
            if (itemId === prodAtualId) continue;
            if (prodAtualSlug && String(item.slug || '') === prodAtualSlug) continue;

            // Exclui anúncios encerrados / vendidos
            const status = String(item.status || '').toUpperCase();
            if (status === 'VENDIDO' || status === 'ARQUIVADO' || status === 'INATIVO' || item.vendido) {
                continue;
            }

            candidatos.push(item);
        }

        // 5. Ordenar por relevância regional e categórica
        candidatos.sort((a, b) => {
            const catA = String(a.categoria || a.category?.name || '').trim().toLowerCase();
            const catB = String(b.categoria || b.category?.name || '').trim().toLowerCase();
            const cidA = String(a.cidade || a.city || '').trim().toLowerCase();
            const cidB = String(b.cidade || b.city || '').trim().toLowerCase();

            let scoreA = 0;
            let scoreB = 0;

            if (prodAtualCat && catA === prodAtualCat) scoreA += 4;
            if (prodAtualCidade && cidA === prodAtualCidade) scoreA += 2;

            if (prodAtualCat && catB === prodAtualCat) scoreB += 4;
            if (prodAtualCidade && cidB === prodAtualCidade) scoreB += 2;

            if (scoreB !== scoreA) {
                return scoreB - scoreA;
            }

            // Desempate por mais recentes
            const dataA = new Date(a.createdAt || a.criadoEm || 0).getTime();
            const dataB = new Date(b.createdAt || b.criadoEm || 0).getTime();
            return dataB - dataA;
        });

        // Limita a exibição aos 4 até 8 anúncios mais relevantes
        const relacionados = candidatos.slice(0, 8);

        // 6. Caso não haja nenhum anúncio disponível
        if (relacionados.length === 0) {
            gradeEl.innerHTML = `
                <div class="estado-vazio" style="grid-column: 1 / -1; text-align: center; padding: 36px 20px; background: #FFFFFF; border-radius: 14px; border: 1px dashed #CBD5E1; margin: 10px 0;">
                    <p style="color: #64748B; font-size: 14.5px; margin: 0; font-weight: 500;">
                        Nenhum outro anúncio encontrado na região no momento.
                    </p>
                </div>
            `;
            return;
        }

        const placeholderSrc = (window.ItaimRotas && typeof window.ItaimRotas.obterAsset === 'function')
            ? window.ItaimRotas.obterAsset('assets/placeholders/produto-placeholder.svg')
            : '../../assets/placeholders/produto-placeholder.svg';

        const favoritosSet = obterFavoritosSet();

        // 7. Renderizar Cards no padrão visual oficial
        gradeEl.innerHTML = relacionados.map(p => {
            const pId = String(p.id);
            const isFav = favoritosSet.has(pId);

            let fotoRaw = p.imagem || (Array.isArray(p.images) && p.images[0]) || (Array.isArray(p.fotos) && p.fotos[0]) || '';
            let imagemUrl = placeholderSrc;
            if (fotoRaw) {
                if (window.ItaimApi && typeof window.ItaimApi.resolverUrlImagem === 'function') {
                    imagemUrl = window.ItaimApi.resolverUrlImagem(fotoRaw);
                } else if (fotoRaw.startsWith('http') || fotoRaw.startsWith('data:')) {
                    imagemUrl = fotoRaw;
                } else if (window.ItaimRotas && typeof window.ItaimRotas.obterAsset === 'function') {
                    imagemUrl = window.ItaimRotas.obterAsset(fotoRaw);
                } else {
                    imagemUrl = '../../' + fotoRaw.replace(/^\.\.\/\.\.\//, '').replace(/^\.\//, '');
                }
            }

            const precoValor = (p.preco !== undefined) ? p.preco : p.price;
            const isDoacao = (p.listingType === 'DOACAO' || p.listingType === 'doacao' || p.isDoacao)
                || (precoValor === 0 || precoValor === '0' || precoValor === null || precoValor === undefined || Number(precoValor) <= 0 || precoValor === 'Doação');

            const precoHtml = formatarPrecoCard(precoValor, p);
            const titulo = p.titulo || p.title || 'Anúncio sem título';
            const categoria = p.categoria || p.category?.name || 'Geral';
            const cidade = p.cidade || p.city || 'Paulistana';
            const bairro = p.bairro || p.neighborhood || '';
            const localTexto = (bairro && bairro !== 'Centro') ? `${bairro} - ${cidade}` : cidade;
            const tempoFormatado = formatarTempoPublicacao(p.createdAt || p.criadoEm);

            return `
                <article class="card-produto fade-in-content" data-id="${pId}">
                    <div class="card-img-box">
                        <img src="${imagemUrl}" alt="${titulo}" class="card-img" onerror="this.onerror=null; this.src='${placeholderSrc}'" loading="lazy">
                        <button type="button" class="btn-favorito ${isFav ? 'ativo' : ''}" data-id="${pId}" aria-label="Favoritar anúncio">
                            <svg class="icone-coracao" viewBox="0 0 24 24">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                        </button>
                    </div>
                    <div class="card-corpo">
                        <span class="card-categoria-tag">${categoria}</span>
                        <h3 class="card-titulo" title="${titulo}">${titulo}</h3>
                        <div class="card-preco ${isDoacao ? 'doacao' : ''}">
                            ${precoHtml}
                        </div>
                        <div class="card-rodape">
                            <span class="card-local" title="${(bairro ? bairro + ', ' : '') + cidade}">
                                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: -1px; margin-right: 2px;">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                    <circle cx="12" cy="10" r="3"></circle>
                                </svg>${localTexto}
                            </span>
                            <span>${tempoFormatado}</span>
                        </div>
                    </div>
                </article>
            `;
        }).join('');

        // 8. Evento de clique no Card para navegar ao produto
        gradeEl.querySelectorAll('.card-produto').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('.btn-favorito')) return;
                const id = card.getAttribute('data-id');
                if (!id) return;
                const urlDestino = window.ItaimRotas 
                    ? window.ItaimRotas.obterUrl('produto', `id=${encodeURIComponent(id)}`)
                    : `produto.html?id=${encodeURIComponent(id)}`;
                window.location.href = urlDestino;
            });
        });

        // 9. Evento de clique no Botão de Favorito
        gradeEl.querySelectorAll('.btn-favorito').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                e.preventDefault();

                const estaAutenticado = (window.ItaimSessao && typeof window.ItaimSessao.usuarioEstaAutenticado === 'function')
                    ? window.ItaimSessao.usuarioEstaAutenticado()
                    : !!(localStorage.getItem('itaim_token') && localStorage.getItem('itaim_usuario_logado'));

                if (!estaAutenticado) {
                    if (window.ItaimNotificacao && typeof window.ItaimNotificacao.aviso === 'function') {
                        window.ItaimNotificacao.aviso('Faça login para favoritar produtos!');
                    } else if (window.ItaimSessao && typeof window.ItaimSessao.abrirModalAuth === 'function') {
                        window.ItaimSessao.abrirModalAuth('Faça login para favoritar produtos!');
                    } else {
                        const urlLogin = window.ItaimRotas ? window.ItaimRotas.obterUrl('login') : '../../index.html';
                        window.location.href = urlLogin;
                    }
                    return;
                }

                const id = btn.getAttribute('data-id');
                if (window.ItaimSessao && typeof window.ItaimSessao.alternarFavorito === 'function') {
                    const result = await window.ItaimSessao.alternarFavorito(id);
                    if (result && result.favoritado) {
                        btn.classList.add('ativo');
                    } else {
                        btn.classList.remove('ativo');
                    }
                } else {
                    btn.classList.toggle('ativo');
                }
            });
        });
    }

    window.ItaimProdutoRelacionados = {
        inicializar,
        carregarRelacionados: inicializar
    };
})();

