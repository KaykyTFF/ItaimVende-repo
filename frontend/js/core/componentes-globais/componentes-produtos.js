/**
 * ITAIM VENDE - COMPONENTES E UTILITÁRIOS DE PRODUTOS (ITAIMPRODUTOS)
 * Arquivo: frontend/js/core/componentes-globais/componentes-produtos.js
 * 
 * Responsabilidades:
 * - Geração de Cards padronizados de produtos à venda com suporte a lazy loading
 * - Formatação monetária em padrão Real (R$) ou indicador "Doação / Grátis"
 * - Gestão de favoritos local e sincronização imediata dos ícones de coração
 */

(function() {
    'use strict';

    function getRotas() {
        return window.ItaimComponentesRotas || {
            urlPara: (d, p = '') => p ? `${d}.html?${p}` : `${d}.html`,
            assetPara: (a) => a
        };
    }

    const ItaimProdutos = {
        /**
         * Retorna todos os produtos ativos do catálogo global e produtos criados
         */
        obterTodos: function() {
            if (window.ItaimSessao && typeof window.ItaimSessao.obterTodosProdutos === 'function') {
                return window.ItaimSessao.obterTodosProdutos();
            }
            try {
                return JSON.parse(localStorage.getItem('itaim_produtos_cadastrados') || '[]');
            } catch(e) {
                return [];
            }
        },

        /**
         * Formata o preço no padrão BRL da plataforma ou "Doação / Grátis"
         */
        formatarPreco: function(valor) {
            if (!valor || valor <= 0) {
                return '<span class="preco-gratis" style="color: #44BD32; font-weight: 800;">Doação / Grátis</span>';
            }
            return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        },

        /**
         * Retorna conjunto de IDs favoritados pelo usuário
         */
        obterFavoritos: function() {
            try {
                return new Set(JSON.parse(localStorage.getItem('itaim_favoritos') || '[]'));
            } catch(e) {
                return new Set();
            }
        },

        /**
         * Adiciona ou remove um produto dos favoritos com sincronização instantânea
         */
        alternarFavorito: function(id) {
            const idNum = parseInt(id, 10);
            const setFav = this.obterFavoritos();
            let adicionou = false;

            if (setFav.has(idNum)) {
                setFav.delete(idNum);
            } else {
                setFav.add(idNum);
                adicionou = true;
            }

            localStorage.setItem('itaim_favoritos', JSON.stringify([...setFav]));

            // Atualiza visual de todos os corações deste produto na tela
            document.querySelectorAll(`.btn-favorito[data-id="${idNum}"]`).forEach(btn => {
                btn.classList.toggle('ativo', adicionou);
            });

            // Atualiza badge de favoritos se houver
            const badge = document.getElementById('favoritos-contador-badge');
            if (badge) badge.textContent = setFav.size;

            // Notifica se houver módulo de notificações ativo
            if (adicionou && window.ItaimNotificacoes && typeof window.ItaimNotificacoes.notificarItemSalvo === 'function') {
                const prod = this.obterTodos().find(p => p.id === idNum);
                if (prod) window.ItaimNotificacoes.notificarItemSalvo(prod.titulo);
            }

            return adicionou;
        },

        /**
         * Gera o HTML padronizado de um Card de Produto à Venda
         */
        criarCardHTML: function(p) {
            const { urlPara, assetPara } = getRotas();
            const setFav = this.obterFavoritos();
            const isFav = setFav.has(p.id);
            const precoFormatado = this.formatarPreco(p.preco);
            const fotoOriginal = p.imagem || (p.fotos && p.fotos[0]) || 'assets/placeholders/produto-placeholder.svg';
            const foto = assetPara(fotoOriginal);
            const placeholder = assetPara('assets/placeholders/produto-placeholder.svg');
            const condicao = p.condicao || 'Usado';
            const cidade = p.cidade || 'Paulistana';
            const linkProduto = urlPara('produto', 'id=' + p.id);

            return `
            <article class="card-produto" data-id="${p.id}" onclick="window.location.href='${linkProduto}'" style="cursor: pointer;">
                <div class="card-img-box">
                    <img src="${foto}" alt="${p.titulo}" class="card-img" onerror="this.onerror=null; this.src='${placeholder}'" loading="lazy">
                    <button type="button" class="btn-favorito ${isFav ? 'ativo' : ''}" data-id="${p.id}" aria-label="Favoritar anúncio" onclick="event.stopPropagation(); ItaimProdutos.alternarFavorito(${p.id});">
                        <svg class="icone-coracao" viewBox="0 0 24 24">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                    </button>
                    <span class="badge-card-condicao">${condicao}</span>
                </div>
                <div class="card-corpo">
                    <div class="card-preco">${precoFormatado}</div>
                    <h3 class="card-titulo" title="${p.titulo}">${p.titulo}</h3>
                    <div class="card-localizacao">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        <span>${cidade}, PI</span>
                    </div>
                </div>
            </article>
            `;
        }
    };

    window.ItaimProdutos = ItaimProdutos;

})();
