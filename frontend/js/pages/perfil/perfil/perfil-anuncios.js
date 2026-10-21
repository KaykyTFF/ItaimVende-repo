/**
 * ITAIM VENDE - PERFIL: ANÚNCIOS PUBLICADOS E ESTATÍSTICAS
 * Arquivo: frontend/js/pages/perfil/perfil/perfil-anuncios.js
 */

(function () {
    'use strict';

    async function inicializar() {
        const { isPerfilProprio, formatarPreco } = window.ItaimPerfilUtils;
        const perfilExibido = window.ItaimPerfilDados?.obterPerfil() || {};

        const statAtivos = document.getElementById('stat-anuncios-ativos');
        const statVendas = document.getElementById('stat-vendas-concluidas');
        const gradeAnuncios = document.getElementById('grade-anuncios-perfil');
        const tituloSecaoAnuncios = document.getElementById('titulo-secao-anuncios');
        const subtituloSecaoAnuncios = document.getElementById('subtitulo-secao-anuncios');

        // Estatística de vendas
        const baseVendas = perfilExibido.salesCount !== undefined
            ? perfilExibido.salesCount
            : (perfilExibido.vendasConcluidas !== undefined ? perfilExibido.vendasConcluidas : 0);
        if (statVendas) statVendas.textContent = baseVendas;

        const nomePrincipal = perfilExibido.name || perfilExibido.nome || 'Usuário';

        if (tituloSecaoAnuncios) {
            tituloSecaoAnuncios.textContent = isPerfilProprio ? 'Meus Anúncios Publicados' : `Anúncios de ${nomePrincipal}`;
        }
        if (subtituloSecaoAnuncios) {
            subtituloSecaoAnuncios.textContent = isPerfilProprio
                ? 'Esses são os anúncios do seu perfil visíveis para outros compradores no Itaim Vende.'
                : `Todos os produtos anunciados por ${nomePrincipal} disponíveis para negociação.`;
        }

        // Exibe skeleton enquanto busca anúncios
        if (window.ItaimSkeleton && typeof window.ItaimSkeleton.exibir === 'function' && gradeAnuncios) {
            window.ItaimSkeleton.exibir(gradeAnuncios, 'cards', 3);
        }

        let listaAnuncios = [];
        try {
            if (isPerfilProprio && window.ItaimApi && window.ItaimApi.produtos) {
                const resMeus = await window.ItaimApi.produtos.meusAnuncios();
                listaAnuncios = resMeus.data || resMeus.products || [];
            } else if (!isPerfilProprio && perfilExibido.id && window.ItaimApi && window.ItaimApi.produtos) {
                const resVendedor = await window.ItaimApi.produtos.doVendedor(perfilExibido.id);
                listaAnuncios = resVendedor.data || resVendedor.products || [];
            }
        } catch (errAds) {
            console.warn('[Perfil] Erro ao carregar anúncios via API, buscando localmente:', errAds);
        }

        // Se API não retornou produtos, faz fallback para anúncios locais
        if ((!listaAnuncios || listaAnuncios.length === 0) && window.ItaimSessao && typeof window.ItaimSessao.obterAnunciosDoUsuario === 'function') {
            const anunciosLocais = window.ItaimSessao.obterAnunciosDoUsuario(perfilExibido.email);
            if (anunciosLocais && anunciosLocais.length > 0) {
                listaAnuncios = anunciosLocais;
            }
        }

        const totalAtivos = (listaAnuncios || []).filter(a => {
            const st = String(a.status || 'ATIVO').toUpperCase();
            return st === 'ATIVO' || st === 'ACTIVE';
        }).length;

        if (statAtivos) {
            statAtivos.textContent = perfilExibido._count?.products !== undefined ? perfilExibido._count.products : totalAtivos;
        }

        // Renderiza cards de produtos
        if (gradeAnuncios) {
            if (!listaAnuncios || listaAnuncios.length === 0) {
                gradeAnuncios.innerHTML = `
                    <div class="estado-vazio" style="grid-column: 1 / -1; text-align: center; padding: 44px 20px; border-radius: 14px; border: 1px dashed #CBD5E1;">
                        <div class="anuncios-vazio-icone" style="width: 60px; height: 60px; margin: 0 auto 14px; border-radius: 50%; background: rgba(68, 189, 50, 0.12); display: inline-flex; align-items: center; justify-content: center; color: #44BD32;">
                            <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                                <line x1="12" y1="22.08" x2="12" y2="12"></line>
                            </svg>
                        </div>
                        <h3 style="font-size: 17px; font-weight: 800; margin-bottom: 6px;">Nenhum anúncio ativo no momento</h3>
                        <p style="color: #64748B; font-size: 13.5px; margin-bottom: 16px;">
                            ${isPerfilProprio ? 'Você ainda não possui anúncios publicados.' : 'Este vendedor ainda não possui anúncios ativos.'}
                        </p>
                        ${isPerfilProprio ? `
                        <a href="${window.ItaimRotas ? window.ItaimRotas.obterUrl('vender') : '../vender/vender.html'}" style="background: #44BD32; color: #FFFFFF; font-weight: 700; padding: 10px 22px; border-radius: 20px; text-decoration: none; font-size: 14px; display: inline-block; box-shadow: 0 4px 12px rgba(68,189,50,0.3);">
                            + Anunciar um Produto
                        </a>` : ''}
                    </div>
                `;
            } else {
                const placeholderSrc = (window.ItaimRotas && typeof window.ItaimRotas.obterAsset === 'function')
                    ? window.ItaimRotas.obterAsset('assets/placeholders/produto-placeholder.svg')
                    : '../../assets/placeholders/produto-placeholder.svg';

                gradeAnuncios.innerHTML = listaAnuncios.map(item => {
                    const fotoSrc = item.imagem || (item.fotos && item.fotos[0]) || (item.images && item.images[0]) || '';
                    const fotoFinal = (window.ItaimApi && typeof window.ItaimApi.resolverUrlImagem === 'function')
                        ? window.ItaimApi.resolverUrlImagem(fotoSrc)
                        : (fotoSrc || placeholderSrc);

                    const linkProduto = window.ItaimRotas 
                        ? window.ItaimRotas.obterUrl('produto', `id=${item.id}`) 
                        : `../produtos/produto.html?id=${item.id}`;

                    return `
                    <article class="card-produto" onclick="window.location.href='${linkProduto}'" style="cursor: pointer;">
                        <div class="card-img-box">
                            <img src="${fotoFinal}" alt="${item.titulo || item.title}" class="card-img" onerror="this.onerror=null; this.src='${placeholderSrc}'">
                            <span class="badge-card-condicao" style="position: absolute; bottom: 8px; left: 8px; background: rgba(0,0,0,0.7); color: #fff; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;">
                                ${item.categoria || item.category?.name || 'Geral'}
                            </span>
                        </div>
                        <div class="card-info" style="padding: 14px;">
                            <h3 class="card-titulo" title="${item.titulo || item.title}" style="font-size: 14.5px; font-weight: 700; color: #1E293B; margin-bottom: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                ${item.titulo || item.title}
                            </h3>
                            <div class="card-preco" style="font-size: 17px; font-weight: 800; color: #44BD32; margin-bottom: 8px;">
                                ${formatarPreco(item.preco !== undefined ? item.preco : item.price)}
                            </div>
                            <div class="card-rodape" style="display: flex; justify-content: space-between; font-size: 12px; color: #64748B;">
                                <span class="card-local"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: -1px; margin-right: 2px;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>${item.cidade || item.city || perfilExibido.city || 'Paulistana'}</span>
                                <span style="color: #44BD32; font-weight: 600;">Ver anúncio &rarr;</span>
                            </div>
                        </div>
                    </article>
                    `;
                }).join('');
            }
        }
    }

    window.ItaimPerfilAnuncios = {
        inicializar
    };
})();
