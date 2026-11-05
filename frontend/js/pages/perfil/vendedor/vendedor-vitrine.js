/**
 * ITAIM VENDE - VENDEDOR: VITRINE DE PRODUTOS E FILTROS
 * Arquivo: frontend/js/pages/perfil/vendedor/vendedor-vitrine.js
 */

(function () {
    'use strict';

    function inicializar() {
        const { formatarPreco } = window.ItaimVendedorUtils;
        const vendedor = window.ItaimVendedorDados?.obterVendedor() || {};
        const anunciosVendedor = window.ItaimVendedorDados?.obterAnuncios() || [];

        const containerGrade = document.getElementById('grade-produtos-vendedor');
        const selectOrdem = document.getElementById('select-ordem-vendedor');

        // Estatísticas nos cards
        const elStatAtivos = document.getElementById('stat-anuncios-ativos');
        if (elStatAtivos) elStatAtivos.textContent = anunciosVendedor.length;

        const elStatVendas = document.getElementById('stat-vendas-concluidas');
        if (elStatVendas) {
            const vendas = vendedor.salesCount !== undefined ? vendedor.salesCount : (vendedor.vendasConcluidas || 0);
            elStatVendas.textContent = vendas;
        }

        const elBadgeQtd = document.getElementById('vendedor-badge-qtd');
        if (elBadgeQtd) {
            elBadgeQtd.textContent = `${anunciosVendedor.length} ${anunciosVendedor.length === 1 ? 'anúncio' : 'anúncios'}`;
        }

        function renderizarAnuncios() {
            if (!containerGrade) return;
            containerGrade.innerHTML = '';

            let lista = [...anunciosVendedor];

            // Ordenação
            const ordem = selectOrdem?.value || 'recentes';
            if (ordem === 'menor-preco') {
                lista.sort((a, b) => (Number(a.preco || a.price) || 0) - (Number(b.preco || b.price) || 0));
            } else if (ordem === 'maior-preco') {
                lista.sort((a, b) => (Number(b.preco || b.price) || 0) - (Number(a.preco || a.price) || 0));
            }

            if (lista.length === 0) {
                containerGrade.innerHTML = `
                    <div class="vendedor-anuncios-vazio" style="grid-column: 1 / -1; text-align: center; padding: 48px 20px; border-radius: 14px; border: 1px dashed #CBD5E1;">
                        <div class="anuncios-vazio-icone" style="width: 60px; height: 60px; margin: 0 auto 14px; border-radius: 50%; background: rgba(68, 189, 50, 0.12); display: inline-flex; align-items: center; justify-content: center; color: #44BD32;">
                            <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                                <line x1="12" y1="22.08" x2="12" y2="12"></line>
                            </svg>
                        </div>
                        <h3 style="font-size: 17px; font-weight: 800; margin-bottom: 6px;">Nenhum anúncio ativo no momento</h3>
                        <p style="color: #64748B; font-size: 14px; margin: 0 auto; max-width: 420px;">Este anunciante ainda não possui outros produtos cadastrados ou os itens já foram vendidos.</p>
                    </div>
                `;
                return;
            }

            const placeholderSrc = (window.ItaimRotas && typeof window.ItaimRotas.obterAsset === 'function')
                ? window.ItaimRotas.obterAsset('assets/placeholders/produto-placeholder.svg')
                : '../../assets/placeholders/produto-placeholder.svg';

            lista.forEach(item => {
                const card = document.createElement('a');
                const linkUrl = window.ItaimRotas 
                    ? window.ItaimRotas.obterUrl('produto', `id=${item.id}`) 
                    : `../produtos/produto.html?id=${item.id}`;
                card.href = linkUrl;
                card.className = 'card-produto-vendedor fade-in-content';

                const fotoBruta = item.imagem || (item.fotos && item.fotos[0]) || (item.images && item.images[0]) || '';
                const fotoImg = (window.ItaimApi && typeof window.ItaimApi.resolverUrlImagem === 'function' && fotoBruta)
                    ? window.ItaimApi.resolverUrlImagem(fotoBruta)
                    : (fotoBruta || placeholderSrc);

                const titulo = item.titulo || item.title || 'Anúncio';
                const precoFormatado = formatarPreco(item.preco !== undefined ? item.preco : item.price);
                const categoria = item.categoria || (item.category && item.category.name) || 'Geral';
                const cidadeItem = item.cidade || item.city || vendedor.city || 'Paulistana';

                card.innerHTML = `
                    <div class="card-prod-foto-box">
                        <img src="${fotoImg}" alt="${titulo}" onerror="this.onerror=null; this.src='${placeholderSrc}'" loading="lazy">
                        <span class="card-prod-badge-cat">${categoria}</span>
                    </div>
                    <div class="card-prod-conteudo">
                        <div class="card-prod-preco">${precoFormatado}</div>
                        <h3 class="card-prod-titulo" title="${titulo}">${titulo}</h3>
                        <div class="card-prod-footer">
                            <span class="card-prod-loc">
                                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                ${cidadeItem} - ${(() => { const b = (item.bairro || item.neighborhood || 'Centro').trim(); return (!b || /^\d/.test(b) || /\d{5}/.test(b)) ? 'Centro' : b; })()}
                            </span>
                            <span style="color: #44BD32; font-weight: 700; font-size: 12px;">Ver anúncio &rarr;</span>
                        </div>
                    </div>
                `;

                containerGrade.appendChild(card);
            });
        }

        if (selectOrdem) {
            selectOrdem.addEventListener('change', renderizarAnuncios);
        }
        renderizarAnuncios();

        window.ItaimVendedorVitrine.renderizarAnuncios = renderizarAnuncios;
    }

    window.ItaimVendedorVitrine = {
        inicializar,
        renderizarAnuncios: null
    };
})();
