/**
 * ITAIM VENDE - LÓGICA DE "MEUS ANÚNCIOS" (MEUS-ANUNCIOS.HTML)
 * Totalmente integrada ao usuário logado via ItaimSessao e ItaimApi.
 * Suporta Pausar, Reativar, Marcar Vendido e Excluir com atualização otimista imediata
 * e remoção automática da loja / vitrine.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Obter usuário logado atual
    const userLogado = (window.ItaimSessao && typeof window.ItaimSessao.obterUsuarioLogado === 'function')
        ? window.ItaimSessao.obterUsuarioLogado()
        : null;

    const nomeUsuario = userLogado?.name || userLogado?.nome || 'Minha Conta';
    const emailUsuario = userLogado?.email || '';
    const cidadeUsuario = userLogado?.city || userLogado?.cidade || 'Paulistana';

    // Elementos DOM
    const container = document.getElementById('container-meus-anuncios');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const badgeTodos = document.getElementById('badge-todos');
    const badgeAtivo = document.getElementById('badge-ativo');
    const badgePausado = document.getElementById('badge-pausado');
    const badgeVendido = document.getElementById('badge-vendido');

    // Atualiza subtítulo com o nome do usuário logado se disponível
    const titulosBox = document.querySelector('.anuncios-titulos p');
    if (titulosBox && userLogado && emailUsuario) {
        titulosBox.innerHTML = `Gerenciando anúncios de <strong>${nomeUsuario}</strong> (${emailUsuario}) em ${cidadeUsuario} - PI.`;
    }

    let statusFiltro = 'todos';
    let meusAnuncios = [];

    function mostrarToast(mensagem, isErro = false) {
        let toastEl = document.getElementById('toast-meus-anuncios');
        if (!toastEl) {
            toastEl = document.createElement('div');
            toastEl.id = 'toast-meus-anuncios';
            toastEl.className = 'anuncios-toast';
            document.body.appendChild(toastEl);
        }
        toastEl.textContent = mensagem;
        toastEl.className = 'anuncios-toast' + (isErro ? ' erro' : '') + ' visivel';

        clearTimeout(toastEl._timer);
        toastEl._timer = setTimeout(() => {
            toastEl.classList.remove('visivel');
        }, 3200);
    }

    // =========================================================================
    // MODAL DE CONFIRMAÇÃO DE AÇÕES NOS ANÚNCIOS (PAUSAR, REATIVAR, VENDIDO, EXCLUIR)
    // =========================================================================
    const ICONES_MODAL = {
        pausar: `
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="10" y1="15" x2="10" y2="9"></line>
                <line x1="14" y1="15" x2="14" y2="9"></line>
            </svg>
        `,
        reativar: `
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="23 4 23 10 17 10"></polyline>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
            </svg>
        `,
        vendido: `
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
        `,
        excluir: `
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
        `
    };

    let acaoConfirmadaAtual = null;

    function obterOuCriarModalConfirmacao() {
        let modal = document.getElementById('modal-confirmar-acao-anuncio');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modal-confirmar-acao-anuncio';
            modal.className = 'modal-anuncio-backdrop';
            modal.setAttribute('role', 'dialog');
            modal.setAttribute('aria-modal', 'true');
            modal.setAttribute('aria-labelledby', 'modal-anuncio-titulo');
            modal.innerHTML = `
                <div class="modal-anuncio-card">
                    <button type="button" class="modal-anuncio-fechar" id="btn-fechar-modal-anuncio" aria-label="Fechar">&times;</button>
                    <div class="modal-anuncio-icone" id="modal-anuncio-icone" aria-hidden="true"></div>
                    <h3 class="modal-anuncio-titulo" id="modal-anuncio-titulo">Confirmar ação</h3>
                    <p class="modal-anuncio-texto" id="modal-anuncio-texto"></p>
                    <div class="modal-anuncio-resumo" id="modal-anuncio-resumo" style="display: none;">
                        <img src="" alt="" class="modal-anuncio-resumo-foto" id="modal-anuncio-resumo-foto">
                        <div class="modal-anuncio-resumo-info">
                            <span class="modal-anuncio-resumo-nome" id="modal-anuncio-resumo-nome"></span>
                            <span class="modal-anuncio-resumo-preco" id="modal-anuncio-resumo-preco"></span>
                        </div>
                    </div>
                    <div class="modal-anuncio-acoes">
                        <button type="button" class="btn-modal-anuncio-cancelar" id="btn-cancelar-modal-anuncio">Cancelar</button>
                        <button type="button" class="btn-modal-anuncio-confirmar" id="btn-confirmar-modal-anuncio">Confirmar</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }

        if (!modal._eventosRegistrados) {
            modal._eventosRegistrados = true;

            const fecharModal = () => {
                modal.classList.remove('aberto');
                document.body.style.overflow = '';
                acaoConfirmadaAtual = null;
            };

            modal._fechar = fecharModal;

            const btnFechar = modal.querySelector('#btn-fechar-modal-anuncio');
            const btnCancelar = modal.querySelector('#btn-cancelar-modal-anuncio');
            const btnConfirmar = modal.querySelector('#btn-confirmar-modal-anuncio');

            if (btnFechar) btnFechar.addEventListener('click', fecharModal);
            if (btnCancelar) btnCancelar.addEventListener('click', fecharModal);
            if (btnConfirmar) {
                btnConfirmar.addEventListener('click', async () => {
                    const callback = acaoConfirmadaAtual;
                    fecharModal();
                    if (typeof callback === 'function') {
                        await callback();
                    }
                });
            }

            modal.addEventListener('click', (e) => {
                if (e.target === modal) fecharModal();
            });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && modal.classList.contains('aberto')) {
                    fecharModal();
                }
            });
        }

        return modal;
    }

    function abrirModalConfirmacao({ tipo, titulo, texto, textoConfirmar, item, aoConfirmar }) {
        const modal = obterOuCriarModalConfirmacao();
        const iconeEl = modal.querySelector('#modal-anuncio-icone');
        const tituloEl = modal.querySelector('#modal-anuncio-titulo');
        const textoEl = modal.querySelector('#modal-anuncio-texto');
        const resumoBox = modal.querySelector('#modal-anuncio-resumo');
        const resumoFoto = modal.querySelector('#modal-anuncio-resumo-foto');
        const resumoNome = modal.querySelector('#modal-anuncio-resumo-nome');
        const resumoPreco = modal.querySelector('#modal-anuncio-resumo-preco');
        const btnConfirmar = modal.querySelector('#btn-confirmar-modal-anuncio');
        const btnCancelar = modal.querySelector('#btn-cancelar-modal-anuncio');

        if (iconeEl) {
            iconeEl.className = `modal-anuncio-icone ${tipo || 'pausar'}`;
            iconeEl.innerHTML = ICONES_MODAL[tipo] || ICONES_MODAL.pausar;
        }
        if (tituloEl) tituloEl.textContent = titulo || 'Confirmar ação';
        if (textoEl) textoEl.textContent = texto || '';

        if (resumoBox) {
            if (item) {
                const placeholderSrc = (window.ItaimRotas && typeof window.ItaimRotas.obterAsset === 'function')
                    ? window.ItaimRotas.obterAsset('assets/placeholders/produto-placeholder.svg')
                    : (window.location.protocol && window.location.protocol.startsWith('http') ? '/assets/placeholders/produto-placeholder.svg' : '../../assets/placeholders/produto-placeholder.svg');
                const fotoImg = item.imagem || (item.fotos && item.fotos[0]) || placeholderSrc;

                if (resumoFoto) {
                    resumoFoto.src = fotoImg;
                    resumoFoto.alt = item.titulo || 'Anúncio';
                    resumoFoto.onerror = function() {
                        this.onerror = null;
                        this.src = placeholderSrc;
                    };
                }
                if (resumoNome) resumoNome.textContent = item.titulo || 'Anúncio';
                if (resumoPreco) resumoPreco.innerHTML = formatarPreco(item.preco, item);
                resumoBox.style.display = 'flex';
            } else {
                resumoBox.style.display = 'none';
            }
        }

        if (btnConfirmar) {
            btnConfirmar.textContent = textoConfirmar || 'Confirmar';
            btnConfirmar.className = `btn-modal-anuncio-confirmar ${tipo || 'pausar'}`;
        }

        acaoConfirmadaAtual = aoConfirmar;
        modal.classList.add('aberto');
        document.body.style.overflow = 'hidden';

        if (btnCancelar) {
            requestAnimationFrame(() => btnCancelar.focus());
        }
    }

    async function carregarAnunciosDoUsuario() {
        let listaBruta = [];
        let carregouDaApi = false;

        // 1. Tenta buscar da API autenticada se houver token
        if (window.ItaimApi && window.ItaimApi.auth && window.ItaimApi.auth.obterToken()) {
            try {
                const res = await window.ItaimApi.produtos.meusAnuncios();
                if (res && res.success && Array.isArray(res.data)) {
                    listaBruta = [...res.data];
                    carregouDaApi = true;
                }
            } catch (err) {
                console.warn('[Meus Anúncios] Falha ao consultar /products/me:', err.message);
            }
        }

        // 2. Se não estiver autenticado na API, busca vitrine local de sessão
        if (!carregouDaApi) {
            if (window.ItaimSessao && typeof window.ItaimSessao.obterAnunciosDoUsuario === 'function' && emailUsuario) {
                try {
                    const locais = window.ItaimSessao.obterAnunciosDoUsuario(emailUsuario);
                    if (Array.isArray(locais)) {
                        listaBruta = [...locais];
                    }
                } catch(e) {}
            } else if (window.ItaimSessao && typeof window.ItaimSessao.obterTodosProdutos === 'function') {
                try {
                    const todos = window.ItaimSessao.obterTodosProdutos(false);
                    if (Array.isArray(todos)) {
                        listaBruta = [...todos];
                    }
                } catch(e) {}
            }
        } else {
            // Mescla anúncios criados localmente nesta máquina que ainda não subiram
            if (window.ItaimSessao && typeof window.ItaimSessao.obterAnunciosDoUsuario === 'function' && emailUsuario) {
                try {
                    const locais = window.ItaimSessao.obterAnunciosDoUsuario(emailUsuario);
                    if (Array.isArray(locais) && locais.length > 0) {
                        locais.forEach(loc => {
                            const jaExiste = listaBruta.some(b => String(b.id) === String(loc.id) || b.titulo === loc.titulo || b.title === loc.titulo);
                            if (!jaExiste) {
                                listaBruta.push(loc);
                            }
                        });
                    }
                } catch(e) {}
            }
        }

        // 3. Mapeia e normaliza todos os produtos para a interface respeitando exclusões e modificações
        const mapaStatusModificados = (() => {
            try {
                return JSON.parse(localStorage.getItem('itaim_produtos_status_map') || '{}');
            } catch(e) {
                return {};
            }
        })();

        const mapaExcluidos = (() => {
            try {
                const arr = JSON.parse(localStorage.getItem('itaim_produtos_excluidos') || '[]');
                return new Set(arr.map(x => String(x)));
            } catch(e) {
                return new Set();
            }
        })();

        meusAnuncios = listaBruta
            .filter(item => !item.deletedAt && !mapaExcluidos.has(String(item.id)))
            .map(item => {
                const statusLocal = mapaStatusModificados[String(item.id)];
                const statusFinal = (statusLocal || item.status || 'ATIVO').toLowerCase();
                const fotoSrc = item.imagem || (item.images && item.images[0]) || (item.fotos && item.fotos[0]) || '';
                return {
                    ...item,
                    id: item.id,
                    titulo: item.titulo || item.title || 'Anúncio sem título',
                    preco: Number(item.preco !== undefined ? item.preco : (item.price || 0)),
                    categoria: item.categoria || (item.category ? (item.category.name || item.category) : 'Geral'),
                    status: statusFinal === 'pausado' ? 'pausado' : (statusFinal === 'vendido' ? 'vendido' : 'ativo'),
                    imagem: window.ItaimApi ? window.ItaimApi.resolverUrlImagem(fotoSrc) : fotoSrc,
                    data: item.createdAt ? new Date(item.createdAt).toLocaleDateString('pt-BR') : (item.data || 'Hoje'),
                    visualizacoes: item.viewsCount !== undefined ? item.viewsCount : (item.visualizacoes || 0),
                    conversas: item.contactsCount !== undefined ? item.contactsCount : (item.conversas || 0),
                    cidade: item.city || item.cidade || cidadeUsuario,
                    bairro: (() => {
                        const b = (item.neighborhood || item.bairro || 'Centro').trim();
                        return (!b || /^\d/.test(b) || /\d{5}/.test(b)) ? 'Centro' : b;
                    })(),
                    vendedorTelefone: item.vendedorTelefone || item.phone || userLogado?.phone || userLogado?.telefone || ''
                };
            });

        atualizarBadges();
        renderizar();
    }

    function formatarPreco(val, item) {
        const isDoacao = (item && (item.listingType === 'DOACAO' || item.listingType === 'doacao' || item.isDoacao))
            || (val === 0 || val === '0' || val === null || val === undefined || Number(val) <= 0 || val === 'Doação');
        if (isDoacao) {
            return '<span style="color: #44BD32; font-weight: 800;">Doação</span>';
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
                <div class="anuncios-vazio">
                    <div class="anuncios-vazio-icone" aria-hidden="true">
                        <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                            <line x1="12" y1="22.08" x2="12" y2="12"></line>
                        </svg>
                    </div>
                    <h2>Nenhum anúncio encontrado</h2>
                    <p>
                        ${meusAnuncios.length === 0 
                            ? `Você ainda não publicou anúncios no perfil de <strong>${nomeUsuario}</strong>. Desapegue de itens que você não usa mais no Itaim Vende!`
                            : `Não há anúncios com status "<strong>${statusFiltro}</strong>" no momento.`}
                    </p>
                    <a href="${window.ItaimRotas ? window.ItaimRotas.obterUrl('vender') : 'vender.html'}" class="btn-novo-anuncio">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        <span>Anunciar Novo Produto</span>
                    </a>
                </div>
            `;
            return;
        }

        filtrados.forEach(item => {
            const card = document.createElement('article');
            card.className = 'anuncio-item-card fade-in-content';

            const statusClass = item.status || 'ativo';
            const statusLabel = statusClass === 'ativo' ? 'Ativo' : (statusClass === 'pausado' ? 'Pausado' : 'Vendido');
            const placeholderSrc = (window.ItaimRotas && typeof window.ItaimRotas.obterAsset === 'function')
            ? window.ItaimRotas.obterAsset('assets/placeholders/produto-placeholder.svg')
            : (window.location.protocol && window.location.protocol.startsWith('http') ? '/assets/placeholders/produto-placeholder.svg' : '../../assets/placeholders/produto-placeholder.svg');
            const fotoImg = item.imagem || (item.fotos && item.fotos[0]) || placeholderSrc;
            const linkProduto = (window.ItaimRotas && typeof window.ItaimRotas.obterUrl === 'function')
                ? window.ItaimRotas.obterUrl('produto', `id=${item.id}`)
                : `../produtos/produto.html?id=${item.id}`;
            const linkEditar = (window.ItaimRotas && typeof window.ItaimRotas.obterUrl === 'function')
                ? window.ItaimRotas.obterUrl('vender', `editar=${item.id}`)
                : `vender.html?editar=${item.id}`;
            const textoBtnPausar = statusClass === 'ativo' ? 'Pausar' : 'Reativar';

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

                    <a href="${linkProduto}" class="anuncio-titulo">${item.titulo}</a>

                    <div class="anuncio-preco">${formatarPreco(item.preco, item)}</div>

                    <div class="anuncio-metricas">
                        <span>${item.visualizacoes || 0} visualizações</span>
                        <span>${item.conversas || 0} conversas</span>
                        <span><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: -1px; margin-right: 2px;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>${item.cidade || cidadeUsuario} - ${item.bairro || 'Centro'}</span>
                        ${item.vendedorTelefone ? `<span class="anuncio-metrica-wpp" title="WhatsApp: ${formatarTelefone(item.vendedorTelefone)}"><svg viewBox="0 0 24 24" width="13" height="13" fill="#25D366" style="vertical-align: -2px; margin-right: 3px;"><path fill-rule="evenodd" clip-rule="evenodd" d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm5.43 12.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.46-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.91-2.21-.24-.58-.49-.5-.67-.51-.17-.01-.37-.01-.57-.01-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.22 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35z"/></svg>${formatarTelefone(item.vendedorTelefone)}</span>` : ''}
                    </div>
                </div>

                <div class="anuncio-acoes-coluna">
                    ${statusClass !== 'vendido' ? `
                        <a href="${linkEditar}" class="btn-acao-anuncio btn-acao-editar" data-action="editar" data-id="${item.id}">
                            Editar
                        </a>
                    ` : ''}
                    <button type="button" class="btn-acao-anuncio btn-acao-status ${statusClass !== 'ativo' ? 'btn-status-reativar' : ''}" data-action="toggle-status" data-id="${item.id}" data-atual="${statusClass}">
                        ${textoBtnPausar}
                    </button>

                    ${statusClass === 'ativo' ? `
                        <button type="button" class="btn-acao-anuncio btn-acao-marcar-vendido" data-action="marcar-vendido" data-id="${item.id}">
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

        // 1. Ação Pausar / Reativar
        container.querySelectorAll('[data-action="toggle-status"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                const atual = e.currentTarget.dataset.atual;
                const isReativar = (atual === 'pausado' || atual === 'vendido');
                const novoStatusBackend = isReativar ? 'ATIVO' : 'PAUSADO';
                const novoStatusLocal = novoStatusBackend.toLowerCase();

                const item = meusAnuncios.find(a => String(a.id) === String(id));
                const statusAnterior = item ? item.status : atual;

                abrirModalConfirmacao({
                    tipo: isReativar ? 'reativar' : 'pausar',
                    titulo: isReativar ? 'Reativar anúncio?' : 'Pausar anúncio?',
                    texto: isReativar
                        ? 'Deseja reativar este anúncio? Ele voltará a ficar ativo e visível para os compradores na loja.'
                        : 'Deseja pausar este anúncio? Ele ficará temporariamente oculto na loja e você poderá reativá-lo quando quiser.',
                    textoConfirmar: isReativar ? 'Sim, reativar' : 'Sim, pausar',
                    item,
                    aoConfirmar: async () => {
                        // Atualização otimista imediata na interface
                        if (item) {
                            item.status = novoStatusLocal;
                        }
                        atualizarBadges();
                        renderizar();

                        if (novoStatusLocal === 'pausado') {
                            mostrarToast('Anúncio pausado e retirado da loja.');
                        } else {
                            mostrarToast('Anúncio reativado e disponível na loja!');
                        }

                        // Sincroniza localmente
                        if (window.ItaimSessao && typeof window.ItaimSessao.atualizarStatusAnuncio === 'function') {
                            window.ItaimSessao.atualizarStatusAnuncio(id, novoStatusLocal);
                        }

                        // Sincroniza com o backend via API
                        if (window.ItaimApi && window.ItaimApi.auth && window.ItaimApi.auth.obterToken()) {
                            try {
                                await window.ItaimApi.produtos.alterarStatus(id, novoStatusBackend);
                            } catch (err) {
                                console.warn('[Meus Anúncios] Erro na API ao alterar status:', err);
                                if (item) {
                                    item.status = statusAnterior;
                                    atualizarBadges();
                                    renderizar();
                                }
                                if (window.ItaimSessao && typeof window.ItaimSessao.atualizarStatusAnuncio === 'function') {
                                    window.ItaimSessao.atualizarStatusAnuncio(id, statusAnterior);
                                }
                                mostrarToast(err.message || 'Erro ao atualizar status do anúncio.', true);
                            }
                        }
                    }
                });
            });
        });

        // 2. Ação Marcar como Vendido
        container.querySelectorAll('[data-action="marcar-vendido"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                const item = meusAnuncios.find(a => String(a.id) === String(id));
                const titulo = item ? item.titulo : 'Produto';
                const statusAnterior = item ? item.status : 'ativo';

                abrirModalConfirmacao({
                    tipo: 'vendido',
                    titulo: 'Marcar como vendido?',
                    texto: 'Deseja marcar este anúncio como vendido? Ele sairá da loja e ficará registrado no seu histórico de vendidos.',
                    textoConfirmar: 'Sim, marcar vendido',
                    item,
                    aoConfirmar: async () => {
                        // Atualização otimista imediata na interface
                        if (item) {
                            item.status = 'vendido';
                        }
                        atualizarBadges();
                        renderizar();
                        mostrarToast('Anúncio marcado como vendido e retirado da loja!');

                        // Sincroniza localmente
                        if (window.ItaimSessao && typeof window.ItaimSessao.atualizarStatusAnuncio === 'function') {
                            window.ItaimSessao.atualizarStatusAnuncio(id, 'vendido');
                        }
                        if (window.ItaimNotificacoes && typeof window.ItaimNotificacoes.criarNotificacao === 'function') {
                            window.ItaimNotificacoes.criarNotificacao({
                                tipo: 'compra',
                                titulo: 'Anúncio vendido!',
                                texto: `Seu anúncio "${titulo}" foi marcado como vendido e finalizado com sucesso.`,
                                link: (window.ItaimRotas ? window.ItaimRotas.obterUrl('meus-anuncios') : 'meus-anuncios.html')
                            });
                        }

                        // Sincroniza com a API
                        if (window.ItaimApi && window.ItaimApi.auth && window.ItaimApi.auth.obterToken()) {
                            try {
                                await window.ItaimApi.produtos.alterarStatus(id, 'VENDIDO');
                            } catch (err) {
                                console.warn('[Meus Anúncios] Erro na API ao marcar vendido:', err);
                                if (item) {
                                    item.status = statusAnterior;
                                    atualizarBadges();
                                    renderizar();
                                }
                                if (window.ItaimSessao && typeof window.ItaimSessao.atualizarStatusAnuncio === 'function') {
                                    window.ItaimSessao.atualizarStatusAnuncio(id, statusAnterior);
                                }
                                mostrarToast(err.message || 'Erro ao marcar anúncio como vendido.', true);
                            }
                        }
                    }
                });
            });
        });

        // 3. Ação Excluir Anúncio
        container.querySelectorAll('[data-action="excluir"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                const item = meusAnuncios.find(a => String(a.id) === String(id));

                abrirModalConfirmacao({
                    tipo: 'excluir',
                    titulo: 'Excluir anúncio?',
                    texto: 'Tem certeza que deseja remover este anúncio definitivamente? Ele sairá da loja e não poderá ser recuperado.',
                    textoConfirmar: 'Sim, excluir',
                    item,
                    aoConfirmar: async () => {
                        const copiaAnterior = [...meusAnuncios];

                        // Atualização otimista imediata na interface
                        meusAnuncios = meusAnuncios.filter(a => String(a.id) !== String(id));
                        atualizarBadges();
                        renderizar();
                        mostrarToast('Anúncio excluído com sucesso.');

                        // Sincroniza no cache local
                        if (window.ItaimSessao && typeof window.ItaimSessao.excluirAnuncio === 'function') {
                            window.ItaimSessao.excluirAnuncio(id);
                        }

                        // Sincroniza exclusão no backend
                        if (window.ItaimApi && window.ItaimApi.auth && window.ItaimApi.auth.obterToken()) {
                            try {
                                await window.ItaimApi.produtos.excluir(id);
                            } catch (err) {
                                console.warn('[Meus Anúncios] Erro na API ao excluir:', err);
                                meusAnuncios = copiaAnterior;
                                atualizarBadges();
                                renderizar();
                                mostrarToast(err.message || 'Erro ao excluir anúncio no servidor.', true);
                            }
                        }
                    }
                });
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

    // Exibe skeletons enquanto carrega da API
    if (window.ItaimSkeleton && container && typeof window.ItaimSkeleton.renderizarMeusAnuncios === 'function') {
        window.ItaimSkeleton.renderizarMeusAnuncios(container, 3);
    }

    // Carga inicial
    carregarAnunciosDoUsuario();
});
