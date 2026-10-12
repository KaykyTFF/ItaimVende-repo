/**
 * ITAIM VENDE - LÓGICA DE "MEUS ANÚNCIOS" (MEUS-ANUNCIOS.HTML)
 * Totalmente integrada ao usuário logado via ItaimSessao.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Obter usuário logado atual
    const userLogado = (window.ItaimSessao && typeof window.ItaimSessao.obterUsuarioLogado === 'function')
        ? window.ItaimSessao.obterUsuarioLogado()
        : { nome: 'Raili', email: 'admin@gmail.com', cidade: 'Paulistana' };

    // Elementos DOM
    const container = document.getElementById('container-meus-anuncios');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const badgeTodos = document.getElementById('badge-todos');
    const badgeAtivo = document.getElementById('badge-ativo');
    const badgePausado = document.getElementById('badge-pausado');
    const badgeVendido = document.getElementById('badge-vendido');

    // Atualiza subtítulo com o nome do usuário logado
    const titulosBox = document.querySelector('.anuncios-titulos p');
    if (titulosBox && userLogado.nome) {
        titulosBox.innerHTML = `Gerenciando anúncios de <strong>${userLogado.nome}</strong> (${userLogado.email}) em ${userLogado.cidade} - PI.`;
    }

    let statusFiltro = 'todos';
    let meusAnuncios = [];

    async function carregarAnunciosDoUsuario() {
        if (window.ItaimApi && window.ItaimApi.auth.obterToken()) {
            try {
                const res = await window.ItaimApi.produtos.meusAnuncios();
                if (res && res.success && Array.isArray(res.data)) {
                    meusAnuncios = res.data.map(item => {
                        const st = (item.status || 'ATIVO').toLowerCase();
                        const fotoSrc = item.imagem || (item.images && item.images[0]) || (item.fotos && item.fotos[0]) || '';
                        return {
                            ...item,
                            id: item.id,
                            titulo: item.titulo || item.title,
                            preco: Number(item.preco !== undefined ? item.preco : item.price),
                            categoria: item.categoria || (item.category ? item.category.name : 'Geral'),
                            status: st === 'pausado' ? 'pausado' : (st === 'vendido' ? 'vendido' : 'ativo'),
                            imagem: window.ItaimApi.resolverUrlImagem(fotoSrc),
                            data: item.createdAt ? new Date(item.createdAt).toLocaleDateString('pt-BR') : 'Hoje'
                        };
                    });
                    atualizarBadges();
                    renderizar();
                    return;
                }
            } catch (err) {
                console.info('[Meus Anúncios] Não foi possível carregar da API, usando cache local.');
            }
        }

        if (window.ItaimSessao && typeof window.ItaimSessao.obterAnunciosDoUsuario === 'function') {
            meusAnuncios = window.ItaimSessao.obterAnunciosDoUsuario(userLogado.email);
        } else {
            meusAnuncios = [];
        }
        atualizarBadges();
        renderizar();
    }

    function formatarPreco(val) {
        if (val === 0 || val === '0' || val === null || val === undefined) {
            return '<span style="color: #44BD32; font-weight: 800;">Grátis / Doação</span>';
        }
        return Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    function formatarTelefone(tel) {
        if (!tel) return '';
        const limpo = String(tel).replace(/\D/g, '');
        if (limpo.length === 11) {
            return `(${limpo.slice(0, 2)}) ${limpo.slice(2, 7)}-${limpo.slice(7)}`;
        } else if (limpo.length === 10) {
            return `(${limpo.slice(0, 2)}) ${limpo.slice(2, 6)}-${limpo.slice(6)}`;
        }
        return tel;
    }

    function atualizarBadges() {
        const total = meusAnuncios.length;
        const ativos = meusAnuncios.filter(a => a.status === 'ativo').length;
        const pausados = meusAnuncios.filter(a => a.status === 'pausado').length;
        const vendidos = meusAnuncios.filter(a => a.status === 'vendido').length;

        if (badgeTodos) badgeTodos.textContent = total;
        if (badgeAtivo) badgeAtivo.textContent = ativos;
        if (badgePausado) badgePausado.textContent = pausados;
        if (badgeVendido) badgeVendido.textContent = vendidos;
    }

    function renderizar() {
        if (!container) return;
        container.innerHTML = '';

        const filtrados = statusFiltro === 'todos' 
            ? meusAnuncios 
            : meusAnuncios.filter(a => a.status === statusFiltro);

        if (filtrados.length === 0) {
            container.innerHTML = `
                <div class="anuncios-vazio" style="text-align: center; padding: 48px 20px; background: #FFFFFF; border-radius: 18px; border: 1px dashed #CBD5E1; margin-top: 10px;">
                    <div style="font-size: 48px; margin-bottom: 12px;">📦</div>
                    <h2 style="font-size: 20px; color: #1E293B; font-weight: 800; margin-bottom: 8px;">Nenhum anúncio encontrado</h2>
                    <p style="color: #64748B; font-size: 14.5px; max-width: 480px; margin: 0 auto 24px; line-height: 1.6;">
                        ${meusAnuncios.length === 0 
                            ? `Você ainda não publicou anúncios no perfil de <strong>${userLogado.nome}</strong>. Desapegue de itens que você não usa mais no Itaim Vende!`
                            : `Não há anúncios com status "<strong>${statusFiltro}</strong>" no momento.`}
                    </p>
                    <a href="${window.ItaimRotas ? window.ItaimRotas.obterUrl('vender') : '../vender/vender.html'}" class="btn-novo-anuncio" style="display: inline-flex; align-items: center; gap: 8px; text-decoration: none;">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        <span>Anunciar Novo Produto</span>
                    </a>
                </div>
            `;
            return;
        }

        filtrados.forEach(item => {
            const card = document.createElement('article');
            card.className = 'anuncio-item-card';

            const statusClass = item.status || 'ativo';
            const statusLabel = statusClass === 'ativo' ? 'Ativo' : (statusClass === 'pausado' ? 'Pausado' : 'Vendido');
            const placeholderSrc = (window.ItaimRotas && typeof window.ItaimRotas.obterAsset === 'function')
                ? window.ItaimRotas.obterAsset('assets/produto-placeholder.svg')
                : '../../assets/produto-placeholder.svg';
            const fotoImg = item.imagem || (item.fotos && item.fotos[0]) || placeholderSrc;

            card.innerHTML = `
                <div class="anuncio-card-foto">
                    <img src="${fotoImg}" alt="${item.titulo}" onerror="this.onerror=null; this.src='${placeholderSrc}'">
                </div>

                <div class="anuncio-info-meio">
                    <div class="anuncio-topo-meta">
                        <span class="badge-status ${statusClass}">${statusLabel}</span>
                        <span class="anuncio-data">Publicado em ${item.data || 'Recente'}</span>
                        <span class="anuncio-data">• ${item.categoria || 'Geral'}</span>
                    </div>

                    <a href="${window.ItaimRotas ? window.ItaimRotas.obterUrl('produto', `id=${item.id}`) : `../produtos/produto.html?id=${item.id}`}" class="anuncio-titulo">${item.titulo}</a>

                    <div class="anuncio-preco">${formatarPreco(item.preco)}</div>

                    <div class="anuncio-metricas">
                        <span>${item.visualizacoes || item.viewsCount || 0} visualizações</span>
                        <span>${item.conversas || 0} conversas</span>
                        <span><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: -1px; margin-right: 2px;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>${item.cidade || userLogado.cidade || 'Paulistana'}</span>
                        ${item.vendedorTelefone ? `<span class="anuncio-metrica-wpp" title="WhatsApp: ${formatarTelefone(item.vendedorTelefone)}"><svg viewBox="0 0 24 24" width="13" height="13" fill="#25D366" style="vertical-align: -2px; margin-right: 3px;"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2z"/></svg>${formatarTelefone(item.vendedorTelefone)}</span>` : ''}
                    </div>
                </div>

                <div class="anuncio-acoes-coluna">
                    ${statusClass !== 'vendido' ? `
                        <button type="button" class="btn-acao-anuncio btn-acao-status" data-action="toggle-status" data-id="${item.id}" data-atual="${statusClass}">
                            ${textoBtnPausar}
                        </button>
                    ` : ''}

                    ${statusClass === 'ativo' ? `
                        <button type="button" class="btn-acao-anuncio" data-action="marcar-vendido" data-id="${item.id}" style="color: #2E7D32; border-color: #A5D6A7; background: #E8F5E9;">
                            Marcar Vendido
                        </button>
                    ` : ''}

                    <button type="button" class="btn-acao-anuncio btn-acao-excluir" data-action="excluir" data-id="${item.id}">
                        Excluir
                    </button>
                </div>
            `;

            container.appendChild(card);
        });

        // Eventos dos botões de ação
        container.querySelectorAll('[data-action="toggle-status"]').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.currentTarget.dataset.id;
                const atual = e.currentTarget.dataset.atual;
                const novoStatusBackend = atual === 'ativo' ? 'PAUSADO' : 'ATIVO';
                const novoStatusLocal = atual === 'ativo' ? 'pausado' : 'ativo';

                if (window.ItaimApi && window.ItaimApi.auth.obterToken()) {
                    try {
                        await window.ItaimApi.produtos.alterarStatus(id, novoStatusBackend);
                    } catch(err) {
                        console.warn('[Meus Anúncios] Erro na API ao alterar status:', err);
                    }
                }

                if (window.ItaimSessao && typeof window.ItaimSessao.atualizarStatusAnuncio === 'function') {
                    window.ItaimSessao.atualizarStatusAnuncio(id, novoStatusLocal);
                }
                carregarAnunciosDoUsuario();
            });
        });

        container.querySelectorAll('[data-action="marcar-vendido"]').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.currentTarget.dataset.id;
                if (confirm('Deseja marcar este anúncio como vendido?')) {
                    const itemAnuncio = meusAnuncios.find(a => String(a.id) === String(id));
                    const titulo = itemAnuncio ? itemAnuncio.titulo : 'Produto';

                    if (window.ItaimApi && window.ItaimApi.auth.obterToken()) {
                        try {
                            await window.ItaimApi.produtos.alterarStatus(id, 'VENDIDO');
                        } catch(err) {
                            console.warn('[Meus Anúncios] Erro na API ao marcar vendido:', err);
                        }
                    }

                    if (window.ItaimSessao && typeof window.ItaimSessao.atualizarStatusAnuncio === 'function') {
                        window.ItaimSessao.atualizarStatusAnuncio(id, 'vendido');
                    }
                    if (window.ItaimNotificacoes && typeof window.ItaimNotificacoes.criarNotificacao === 'function') {
                        window.ItaimNotificacoes.criarNotificacao({
                            tipo: 'compra',
                            titulo: 'Compra e venda finalizada!',
                            texto: `Seu anúncio "${titulo}" foi marcado como vendido e finalizado com sucesso.`,
                            link: (window.ItaimRotas ? window.ItaimRotas.obterUrl('meus-anuncios') : '../vender/meus-anuncios.html')
                        });
                    }
                    carregarAnunciosDoUsuario();
                }
            });
        });

        container.querySelectorAll('[data-action="excluir"]').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.currentTarget.dataset.id;
                if (confirm('Tem certeza que deseja remover este anúncio definitivamente?')) {
                    if (window.ItaimApi && window.ItaimApi.auth.obterToken()) {
                        try {
                            await window.ItaimApi.produtos.excluir(id);
                        } catch(err) {
                            console.warn('[Meus Anúncios] Erro na API ao excluir:', err);
                        }
                    }

                    if (window.ItaimSessao && typeof window.ItaimSessao.excluirAnuncio === 'function') {
                        window.ItaimSessao.excluirAnuncio(id);
                    }
                    carregarAnunciosDoUsuario();
                }
            });
        });
    }

    // Abas de filtro
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('ativo'));
            btn.classList.add('ativo');
            statusFiltro = btn.dataset.status;
            renderizar();
        });
    });

    // Header e Menu Lateral (Drawer) são gerenciados de forma centralizada e global por sessao.js
    // Carga inicial
    carregarAnunciosDoUsuario();
});
