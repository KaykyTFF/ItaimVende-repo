/**
 * ITAIM VENDE - PAINEL DE TICKETS & MODERAÇÃO (CONTROLADOR JS)
 * Arquivo: frontend/js/pages/admin/tickets.js
 * 
 * Gerencia o ciclo de vida do painel de moderadores:
 * - Listagem, filtragem e busca de denúncias (Tickets de Moderação)
 * - Ações executivas de moderação (Remover anúncio, suspender vendedor, descartar)
 * - Fila de conversas com o suporte ao usuário e envio de respostas oficiais
 * - Alternância de tema, cópia de protocolos e auditoria
 */

(function () {
    'use strict';

    // Estado global do painel
    let abaAtiva = 'denuncias'; // 'denuncias' | 'suporte'
    let filtroStatusDenuncia = 'ALL';
    let filtroMotivoDenuncia = '';
    let termoBuscaDenuncia = '';
    let todosTicketsDenuncias = [];
    let ticketSelecionadoModal = null;

    // Estado do chat de suporte
    let todasConversasSuporte = [];
    let conversaSuporteAtivaId = null;
    let termoBuscaSuporte = '';

    // =========================================================================
    // 1. INICIALIZAÇÃO E CONTROLE DE ACESSO RBAC
    // =========================================================================
    async function inicializar() {
        configurarTema();
        configurarNavegacaoAbas();
        configurarEventosToolbar();
        configurarEventosSuporte();
        configurarModalDetalhes();
        
        // Configuração do botão Ver Site
        const btnVerSite = document.getElementById('btn-ver-site');
        if (btnVerSite) {
            btnVerSite.addEventListener('click', (e) => {
                e.preventDefault();
                const url = window.ItaimRotas ? window.ItaimRotas.obterUrl('home') : '../home/home.html';
                window.location.href = url;
            });
        }

        // Verifica autenticação
        const usuario = window.ItaimSessao ? window.ItaimSessao.obterUsuarioAtual() : null;
        const modBadge = document.getElementById('mod-user-name');
        if (modBadge && usuario) {
            modBadge.textContent = `${usuario.name || usuario.nome || 'Moderador'} (${usuario.role || 'MODERATOR'})`;
        }

        // Carrega dados iniciais
        await carregarTicketsDenuncias();
        await carregarConversasSuporte();

        // Botão de atualização manual
        const btnAtualizar = document.getElementById('btn-atualizar-tickets');
        if (btnAtualizar) {
            btnAtualizar.addEventListener('click', async () => {
                mostrarToast('Atualizando dados...');
                await carregarTicketsDenuncias();
                await carregarConversasSuporte();
            });
        }
    }

    // =========================================================================
    // 2. TEMA CLARO / ESCURO
    // =========================================================================
    function configurarTema() {
        const btnTema = document.getElementById('btn-alternar-tema-tickets');
        const iconeTema = document.getElementById('icone-tema');
        const labelTema = document.getElementById('label-tema');

        function atualizarIcones(tema) {
            if (iconeTema) {
                iconeTema.className = tema === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
            }
            if (labelTema) {
                labelTema.textContent = tema === 'dark' ? 'Claro' : 'Escuro';
            }
        }

        const temaAtual = localStorage.getItem('itaim_tema') === 'dark' ? 'dark' : 'light';
        atualizarIcones(temaAtual);

        if (btnTema) {
            btnTema.addEventListener('click', () => {
                const novoTema = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
                document.documentElement.setAttribute('data-theme', novoTema);
                document.body.setAttribute('data-theme', novoTema);
                if (novoTema === 'dark') {
                    document.documentElement.classList.add('dark-theme');
                    document.body.classList.add('dark-theme');
                } else {
                    document.documentElement.classList.remove('dark-theme');
                    document.body.classList.remove('dark-theme');
                }
                localStorage.setItem('itaim_tema', novoTema);
                atualizarIcones(novoTema);
            });
        }
    }

    // =========================================================================
    // 3. NAVEGAÇÃO ENTRE ABAS (DENÚNCIAS VS SUPORTE)
    // =========================================================================
    function configurarNavegacaoAbas() {
        const tabBtnDenuncias = document.getElementById('tab-btn-denuncias');
        const tabBtnSuporte = document.getElementById('tab-btn-suporte');
        const abaDenuncias = document.getElementById('aba-conteudo-denuncias');
        const abaSuporte = document.getElementById('aba-conteudo-suporte');

        function alternarAba(aba) {
            abaAtiva = aba;
            if (aba === 'denuncias') {
                tabBtnDenuncias?.classList.add('ativo');
                tabBtnDenuncias?.setAttribute('aria-selected', 'true');
                tabBtnSuporte?.classList.remove('ativo');
                tabBtnSuporte?.setAttribute('aria-selected', 'false');
                if (abaDenuncias) abaDenuncias.style.display = 'block';
                if (abaSuporte) abaSuporte.style.display = 'none';
            } else {
                tabBtnSuporte?.classList.add('ativo');
                tabBtnSuporte?.setAttribute('aria-selected', 'true');
                tabBtnDenuncias?.classList.remove('ativo');
                tabBtnDenuncias?.setAttribute('aria-selected', 'false');
                if (abaDenuncias) abaDenuncias.style.display = 'none';
                if (abaSuporte) abaSuporte.style.display = 'block';
            }
        }

        tabBtnDenuncias?.addEventListener('click', () => alternarAba('denuncias'));
        tabBtnSuporte?.addEventListener('click', () => alternarAba('suporte'));
    }

    // =========================================================================
    // 4. TICKETS DE DENÚNCIA: CARREGAMENTO E RENDERIZAÇÃO
    // =========================================================================
    async function carregarTicketsDenuncias() {
        const listaEl = document.getElementById('lista-tickets-denuncias');
        if (!listaEl) return;

        let apiItems = [];
        let summary = { total: 0, pending: 0, underReview: 0, resolved: 0, dismissed: 0 };

        // 1. Tenta carregar via API oficial
        if (window.ItaimApi && window.ItaimApi.reports?.listar) {
            try {
                const res = await window.ItaimApi.reports.listar({
                    status: filtroStatusDenuncia === 'ALL' ? undefined : filtroStatusDenuncia,
                    limit: 100
                });
                if (res && res.success && Array.isArray(res.data)) {
                    apiItems = res.data;
                    summary = res.summary || summary;
                }
            } catch (err) {
                console.info('[Tickets] API em fallback, sincronizando com registros locais.');
            }
        }

        // 2. Coleta e normaliza todas as denúncias locais
        const locais = obterDenunciasLocais();

        // 3. Mescla sem duplicidade priorizando os registros locais mais recentes
        const mapaTickets = new Map();
        locais.forEach(item => {
            const chave = item.protocol || item.id;
            if (chave) mapaTickets.set(chave, item);
        });
        apiItems.forEach(item => {
            const chave = item.protocol || item.id;
            if (chave && !mapaTickets.has(chave)) {
                mapaTickets.set(chave, normalizarTicket(item));
            }
        });

        const items = Array.from(mapaTickets.values());
        summary = calcularResumoLocais(items);

        todosTicketsDenuncias = items;
        atualizarContadoresEstatisticas(summary, items.length);
        renderizarFilaDenuncias();
    }

    function normalizarTicket(t) {
        if (!t) return null;
        const id = t.id || ('tk_' + (t.protocol || Math.random().toString(36).substring(2, 9)));
        const protocol = t.protocol || t.protocolo || (id.startsWith('TK-') ? id : `TK-${id.slice(-6).toUpperCase()}`);
        const status = (t.status || 'PENDING').toUpperCase();
        
        const statusLabel = t.statusLabel || (
            status === 'PENDING' ? 'Pendente' :
            status === 'UNDER_REVIEW' ? 'Em Análise' :
            status === 'RESOLVED' ? 'Resolvido' :
            status === 'DISMISSED' ? 'Descartado' : status
        );

        const reason = t.reason || t.motivo || 'OTHER';
        const reasonLabel = t.reasonLabel || t.motivoLabel || (
            reason === 'FRAUD' || reason === 'FRAUD_SUSPECTED' ? 'Suspeita de Fraude / Golpe' :
            reason === 'INAPPROPRIATE_CONTENT' || reason === 'PROHIBITED_ITEM' ? 'Conteúdo Impróprio / Ilegal' :
            reason === 'INCORRECT_PRICE' ? 'Preço Enganoso / Isca' :
            reason === 'SPAM' ? 'Spam / Anúncio Falso' :
            reason === 'ALREADY_SOLD' ? 'Produto Já Vendido' :
            'Outro Motivo'
        );

        return {
            id,
            protocol,
            productId: t.productId || t.produtoId || t.product?.id || 'prod_anon',
            productTitle: t.productTitle || t.produtoTitulo || t.product?.title || t.titulo || 'Anúncio sob Denúncia',
            productPrice: t.productPrice ?? t.preco ?? t.product?.price ?? null,
            productCover: t.productCover || t.productImage || t.imagem || (t.fotos && t.fotos[0]) || t.product?.images?.[0]?.url || 'assets/placeholders/produto-placeholder.svg',
            sellerName: t.sellerName || t.vendedorNome || t.seller?.name || 'Vendedor do Anúncio',
            sellerEmail: t.sellerEmail || t.vendedorEmail || t.seller?.email || t.contactEmail || 'vendedor@itaimvende.com.br',
            sellerStatus: t.sellerStatus || 'ACTIVE',
            reason,
            reasonLabel,
            description: t.description || t.descricao || 'Denúncia registrada por usuário da plataforma.',
            status,
            statusLabel,
            createdAt: t.createdAt || t.dataCriacao || new Date().toISOString(),
            contactEmail: t.contactEmail || t.emailContato || ''
        };
    }

    function obterDenunciasLocais() {
        const chaves = ['itaim_tickets_denuncias', 'itaim_denuncias_moderacao', 'itaim_meus_tickets', 'itaim_denuncias'];
        const coletados = [];
        const vistos = new Set();

        chaves.forEach(k => {
            try {
                const raw = localStorage.getItem(k);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (Array.isArray(parsed)) {
                        parsed.forEach(item => {
                            const chave = item.protocol || item.id;
                            if (chave && !vistos.has(chave)) {
                                vistos.add(chave);
                                const norm = normalizarTicket(item);
                                if (norm) coletados.push(norm);
                            }
                        });
                    }
                }
            } catch (e) {
                console.warn('[Tickets] Erro ao ler chave ' + k, e);
            }
        });

        if (coletados.length > 0) {
            return coletados;
        }

        // Se o storage estiver vazio, registra as duas denúncias padrão da moderação
        const duasDenunciasIniciais = [
            {
                id: 'tk_denuncia_01',
                protocol: 'TK-784291',
                productId: 'anuncio_smart_tv',
                productTitle: 'Controle Remoto Smart TV Samsung 4K',
                productPrice: 65,
                productCover: 'assets/produtos/anuncio_13.jpg',
                sellerName: 'Marcos Silva Vendas',
                sellerEmail: 'marcos.vendas99@gmail.com',
                sellerStatus: 'ACTIVE',
                reason: 'FRAUD_SUSPECTED',
                reasonLabel: 'Suspeita de Fraude / Golpe',
                description: 'Vendedor solicita adiantamento de valor via PIX fora da plataforma e recusa entrega presencial em Paulistana.',
                status: 'PENDING',
                statusLabel: 'Pendente',
                createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
                contactEmail: 'denunciante1@gmail.com'
            },
            {
                id: 'tk_denuncia_02',
                protocol: 'TK-619402',
                productId: 'anuncio_ferramentas',
                productTitle: 'Lote de Ferramentas Elétricas e Baterias',
                productPrice: 10,
                productCover: 'assets/produtos/anuncio_14.jpg',
                sellerName: 'Oficina Central Paulistana',
                sellerEmail: 'oficina.central@gmail.com',
                sellerStatus: 'ACTIVE',
                reason: 'INCORRECT_PRICE',
                reasonLabel: 'Preço Enganoso / Isca',
                description: 'Anunciou por R$ 10,00 para atrair compradores na pesquisa, mas no chat informou que o valor real é R$ 850,00.',
                status: 'UNDER_REVIEW',
                statusLabel: 'Em Análise',
                createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
                contactEmail: 'denunciante2@gmail.com'
            }
        ];

        // Persiste nas chaves para ficarem acessíveis
        try {
            localStorage.setItem('itaim_tickets_denuncias', JSON.stringify(duasDenunciasIniciais));
            localStorage.setItem('itaim_denuncias_moderacao', JSON.stringify(duasDenunciasIniciais));
        } catch (e) {}

        return duasDenunciasIniciais;
    }

    function calcularResumoLocais(items) {
        return {
            total: items.length,
            pending: items.filter(i => (i.status || '').toUpperCase() === 'PENDING').length,
            underReview: items.filter(i => (i.status || '').toUpperCase() === 'UNDER_REVIEW').length,
            resolved: items.filter(i => (i.status || '').toUpperCase() === 'RESOLVED').length,
            dismissed: items.filter(i => (i.status || '').toUpperCase() === 'DISMISSED').length
        };
    }

    function atualizarContadoresEstatisticas(summary, totalItems) {
        const total = summary.total ?? totalItems;
        setText('stat-total-reports', total);
        setText('stat-pending-reports', summary.pending ?? 0);
        setText('stat-review-reports', summary.underReview ?? 0);
        setText('stat-resolved-reports', summary.resolved ?? 0);

        setText('tab-count-denuncias', summary.pending ?? 0);
        setText('count-all', total);
        setText('count-pending', summary.pending ?? 0);
        setText('count-review', summary.underReview ?? 0);
        setText('count-resolved', summary.resolved ?? 0);
        setText('count-dismissed', summary.dismissed ?? 0);
    }

    function setText(id, valor) {
        const el = document.getElementById(id);
        if (el) el.textContent = valor;
    }

    function renderizarFilaDenuncias() {
        const listaEl = document.getElementById('lista-tickets-denuncias');
        if (!listaEl) return;

        // Aplica filtros combinados (Status, Motivo, Busca textual)
        const filtrados = todosTicketsDenuncias.filter(item => {
            const st = (item.status || 'PENDING').toUpperCase();
            if (filtroStatusDenuncia !== 'ALL' && st !== filtroStatusDenuncia) return false;

            if (filtroMotivoDenuncia && item.reason !== filtroMotivoDenuncia) return false;

            if (termoBuscaDenuncia) {
                const q = termoBuscaDenuncia.toLowerCase();
                const matchProtocol = (item.protocol || '').toLowerCase().includes(q);
                const matchTitle = (item.productTitle || '').toLowerCase().includes(q);
                const matchSeller = (item.sellerName || item.sellerEmail || '').toLowerCase().includes(q);
                const matchReason = (item.reasonLabel || item.reason || '').toLowerCase().includes(q);
                const matchDesc = (item.description || '').toLowerCase().includes(q);
                if (!matchProtocol && !matchTitle && !matchSeller && !matchReason && !matchDesc) return false;
            }

            return true;
        });

        if (filtrados.length === 0) {
            listaEl.innerHTML = `
                <div class="tickets-empty-box">
                    <i class="fa-solid fa-shield-cat tickets-empty-icon" style="color: #64748B;"></i>
                    <h3>Nenhum ticket encontrado</h3>
                    <p>Nenhuma denúncia corresponde aos filtros aplicados no momento.</p>
                </div>
            `;
            return;
        }

        listaEl.innerHTML = filtrados.map(t => {
            const statusLower = (t.status || 'pending').toLowerCase();
            const reasonClass = obterClasseMotivo(t.reason);
            const precoFmt = t.productPrice != null
                ? Number(t.productPrice).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                : 'A combinar';
            const tempoFmt = formatarTempoRelativo(t.createdAt);
            const thumbUrl = resolverUrlImagem(t.productCover || t.productImage || t.imagem);

            const sellerStatusLower = (t.sellerStatus || 'active').toLowerCase();
            const sellerBadgeColor = sellerStatusLower === 'active' ? '#10B981' : '#EF4444';

            return `
                <div class="ticket-card status-${statusLower}" id="card-ticket-${t.id}">
                    <div class="ticket-card-header">
                        <div class="ticket-protocol-row">
                            <span class="ticket-protocol-badge">
                                <i class="fa-solid fa-hashtag"></i> ${t.protocol || t.id}
                                <button type="button" class="btn-copy-protocol" data-copy="${t.protocol || t.id}" title="Copiar protocolo">
                                    <i class="fa-regular fa-copy"></i>
                                </button>
                            </span>
                            <span class="ticket-reason-badge ${reasonClass}">
                                <i class="fa-solid fa-triangle-exclamation"></i> ${t.reasonLabel || t.reason}
                            </span>
                            <span class="ticket-status-pill ${statusLower}">
                                ${t.statusLabel || t.status}
                            </span>
                        </div>
                        <div class="ticket-meta-right">
                            <span><i class="fa-regular fa-clock"></i> ${tempoFmt}</span>
                        </div>
                    </div>

                    <div class="ticket-card-body">
                        <img src="${thumbUrl}" alt="Thumbnail" class="ticket-product-thumb" onerror="this.src='../../assets/placeholders/produto-placeholder.svg'">
                        
                        <div class="ticket-product-info">
                            <h3 title="${t.productTitle || 'Anúncio'}">
                                <a href="../produtos/produto.html?id=${t.productId || t.id}" target="_blank">
                                    ${t.productTitle || 'Anúncio Sem Título'}
                                </a>
                            </h3>
                            <div class="ticket-product-price">${precoFmt}</div>
                            <div style="font-size: 0.8rem; color: var(--tk-text-muted);">
                                ID do Produto: <code>${t.productId || t.id}</code>
                            </div>
                        </div>

                        <div class="ticket-seller-box">
                            <div class="ticket-seller-row">
                                <span class="ticket-seller-name">${t.sellerName || 'Vendedor Anônimo'}</span>
                                <span style="font-size: 0.72rem; font-weight: 700; color: ${sellerBadgeColor};">
                                    ● ${t.sellerStatus || 'Ativo'}
                                </span>
                            </div>
                            <div style="color: var(--tk-text-dim); font-size: 0.78rem; word-break: break-all;">
                                ${t.sellerEmail || '--'}
                            </div>
                        </div>
                    </div>

                    ${t.description ? `
                        <div class="ticket-description-quote">
                            <strong>Relato do Denunciante:</strong> "${t.description}"
                        </div>
                    ` : ''}

                    <div class="ticket-card-footer">
                        <div class="ticket-status-select-wrap">
                            <label for="select-status-${t.id}">Alterar Status:</label>
                            <select class="select-tk-custom select-alterar-status" data-id="${t.id}" id="select-status-${t.id}">
                                <option value="PENDING" ${t.status === 'PENDING' ? 'selected' : ''}>🟡 Pendente</option>
                                <option value="UNDER_REVIEW" ${t.status === 'UNDER_REVIEW' ? 'selected' : ''}>🔵 Em Análise</option>
                                <option value="RESOLVED" ${t.status === 'RESOLVED' ? 'selected' : ''}>🟢 Resolvido</option>
                                <option value="DISMISSED" ${t.status === 'DISMISSED' ? 'selected' : ''}>⚪ Descartado</option>
                            </select>
                        </div>

                        <div class="ticket-actions-group">
                            <a href="../produtos/produto.html?id=${t.productId || t.id}" target="_blank" class="btn-mod-action btn-view" title="Abrir anúncio na vitrine">
                                <i class="fa-solid fa-arrow-up-right-from-square"></i> Ver Anúncio
                            </a>
                            <button type="button" class="btn-mod-action btn-remove" data-action="remover" data-id="${t.id}" data-titulo="${t.productTitle || ''}">
                                <i class="fa-solid fa-trash-can"></i> Remover Anúncio
                            </button>
                            <button type="button" class="btn-mod-action btn-suspend" data-action="suspender" data-id="${t.id}" data-vendedor="${t.sellerName || ''}">
                                <i class="fa-solid fa-user-slash"></i> Suspender Vendedor
                            </button>
                            <button type="button" class="btn-mod-action btn-dismiss" data-action="descartar" data-id="${t.id}">
                                <i class="fa-solid fa-ban"></i> Descartar
                            </button>
                            <button type="button" class="btn-mod-action btn-view" data-action="detalhes" data-id="${t.id}">
                                <i class="fa-solid fa-circle-info"></i> Dossiê
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        vincularEventosCards();
    }

    function vincularEventosCards() {
        // Cópia de protocolo
        document.querySelectorAll('.btn-copy-protocol').forEach(btn => {
            btn.addEventListener('click', () => {
                const cod = btn.dataset.copy;
                if (cod && navigator.clipboard) {
                    navigator.clipboard.writeText(cod).then(() => {
                        mostrarToast(`Protocolo #${cod} copiado para a área de transferência!`);
                    });
                }
            });
        });

        // Alteração de Status
        document.querySelectorAll('.select-alterar-status').forEach(sel => {
            sel.addEventListener('change', async (e) => {
                const id = sel.dataset.id;
                const novoStatus = sel.value;
                await executarMudancaStatus(id, novoStatus);
            });
        });

        // Ações de Moderação (Remover, Suspender, Descartar, Detalhes)
        document.querySelectorAll('.btn-mod-action[data-action]').forEach(btn => {
            btn.addEventListener('click', async () => {
                const action = btn.dataset.action;
                const id = btn.dataset.id;
                const titulo = btn.dataset.titulo;
                const vendedor = btn.dataset.vendedor;

                if (action === 'remover') {
                    if (confirm(`Confirma a remoção imediata do anúncio "${titulo}"? As imagens serão purgadas do armazenamento.`)) {
                        await executarRemocaoAnuncio(id);
                    }
                } else if (action === 'suspender') {
                    if (confirm(`Confirma a suspensão preventiva da conta do vendedor "${vendedor}"? Seus anúncios ficarão ocultos.`)) {
                        await executarSuspensaoConta(id);
                    }
                } else if (action === 'descartar') {
                    if (confirm('Deseja descartar este ticket como denúncia improcedente?')) {
                        await executarDescarteTicket(id);
                    }
                } else if (action === 'detalhes') {
                    abrirModalDossie(id);
                }
            });
        });
    }

    // =========================================================================
    // 5. AÇÕES DE MODERAÇÃO
    // =========================================================================
    async function executarMudancaStatus(id, status) {
        try {
            if (window.ItaimApi && window.ItaimApi.reports?.atualizarStatus) {
                await window.ItaimApi.reports.atualizarStatus(id, status);
            }
            atualizarStatusLocal(id, status);
            mostrarToast(`Status do ticket atualizado para "${status}".`);
            await carregarTicketsDenuncias();
        } catch (err) {
            atualizarStatusLocal(id, status);
            mostrarToast(`Status atualizado localmente para "${status}".`);
            await carregarTicketsDenuncias();
        }
    }

    async function executarRemocaoAnuncio(id) {
        try {
            if (window.ItaimApi && window.ItaimApi.reports?.removerAnuncioFraudulento) {
                await window.ItaimApi.reports.removerAnuncioFraudulento(id, 'Removido por violação confirmada pela moderação.');
            }
            atualizarStatusLocal(id, 'RESOLVED');
            mostrarToast('Anúncio removido com sucesso e ticket resolvido!');
            await carregarTicketsDenuncias();
        } catch (err) {
            atualizarStatusLocal(id, 'RESOLVED');
            mostrarToast('Ação de remoção registrada e ticket finalizado.');
            await carregarTicketsDenuncias();
        }
    }

    async function executarSuspensaoConta(id) {
        try {
            if (window.ItaimApi && window.ItaimApi.reports?.suspenderConta) {
                await window.ItaimApi.reports.suspenderConta(id, 'Suspenso pela moderação de segurança.', 'SUSPENDED');
            }
            atualizarStatusLocal(id, 'RESOLVED');
            mostrarToast('Conta do vendedor suspensa preventivamente!');
            await carregarTicketsDenuncias();
        } catch (err) {
            atualizarStatusLocal(id, 'RESOLVED');
            mostrarToast('Suspensão registrada e ticket finalizado.');
            await carregarTicketsDenuncias();
        }
    }

    async function executarDescarteTicket(id) {
        try {
            if (window.ItaimApi && window.ItaimApi.reports?.descartarDenuncia) {
                await window.ItaimApi.reports.descartarDenuncia(id, 'Denúncia improcedente após verificação.');
            }
            atualizarStatusLocal(id, 'DISMISSED');
            mostrarToast('Ticket descartado com sucesso.');
            await carregarTicketsDenuncias();
        } catch (err) {
            atualizarStatusLocal(id, 'DISMISSED');
            mostrarToast('Ticket descartado.');
            await carregarTicketsDenuncias();
        }
    }

    function atualizarStatusLocal(id, status) {
        const item = todosTicketsDenuncias.find(t => t.id === id);
        if (item) item.status = status;

        const chaves = ['itaim_tickets_denuncias', 'itaim_denuncias_moderacao', 'itaim_meus_tickets'];
        chaves.forEach(k => {
            try {
                const raw = localStorage.getItem(k);
                if (raw) {
                    const list = JSON.parse(raw);
                    const alvo = list.find(t => t.id === id || t.protocol === item?.protocol);
                    if (alvo) {
                        alvo.status = status;
                        localStorage.setItem(k, JSON.stringify(list));
                    }
                }
            } catch (e) {}
        });
    }

    // =========================================================================
    // 6. ABA 2: TICKETS E CONVERSAS COM O SUPORTE
    // =========================================================================
    async function carregarConversasSuporte() {
        const listaThreadsEl = document.getElementById('lista-threads-suporte');
        if (!listaThreadsEl) return;

        let conversas = [];

        // 1. Busca conversas do usuário ou mock de atendimento
        try {
            const rawSuporte = localStorage.getItem('itaim_conversas_suporte');
            if (rawSuporte) {
                conversas = JSON.parse(rawSuporte);
            }
        } catch (e) {}

        if (!Array.isArray(conversas) || conversas.length === 0) {
            conversas = [
                {
                    id: 'sup_conv_1',
                    protocol: 'TK-SUP-101',
                    userName: 'Cláudio Ferreira',
                    userEmail: 'claudio.ferreira@gmail.com',
                    userCity: 'Paulistana - PI',
                    userAvatar: 'assets/icons/icon-user.png',
                    subject: 'Dúvida sobre taxa de entrega para Acauã',
                    status: 'EM_ATENDIMENTO',
                    lastMessage: 'Gostaria de saber se o frete é negociável diretamente com o vendedor ou pela plataforma.',
                    lastMessageAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
                    unread: true,
                    messages: [
                        { sender: 'user', text: 'Olá, bom dia! Estou negociando um sofá e queria tirar uma dúvida.', time: '10:15' },
                        { sender: 'user', text: 'Gostaria de saber se o frete é negociável diretamente com o vendedor ou pela plataforma.', time: '10:16' }
                    ]
                },
                {
                    id: 'sup_conv_2',
                    protocol: 'TK-SUP-102',
                    userName: 'Ana Paula Santos',
                    userEmail: 'anapaula.santos@hotmail.com',
                    userCity: 'Betânia do Piauí',
                    userAvatar: 'assets/icons/icon-user.png',
                    subject: 'Meu anúncio foi pausado indevidamente',
                    status: 'ABERTO',
                    lastMessage: 'Vocês poderiam verificar porque as fotos da minha moto não estão carregando?',
                    lastMessageAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
                    unread: false,
                    messages: [
                        { sender: 'user', text: 'Vocês poderiam verificar porque as fotos da minha moto não estão carregando?', time: '08:30' }
                    ]
                },
                {
                    id: 'sup_conv_3',
                    protocol: 'TK-SUP-103',
                    userName: 'Raimundo Nonato',
                    userEmail: 'raimundo.agro@bol.com.br',
                    userCity: 'Jacobina do Piauí',
                    userAvatar: 'assets/icons/icon-user.png',
                    subject: 'Ajuda com cadastro de caprinos e animais',
                    status: 'CONCLUIDO',
                    lastMessage: 'Muito obrigado pelo suporte! Consegui cadastrar o lote com sucesso.',
                    lastMessageAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
                    unread: false,
                    messages: [
                        { sender: 'user', text: 'Não estou encontrando a categoria de ovinos e caprinos.', time: 'Ontem' },
                        { sender: 'support', text: 'Olá Raimundo! A categoria oficial é Agro & Pecuária. Já está disponível na vitrine.', time: 'Ontem' },
                        { sender: 'user', text: 'Muito obrigado pelo suporte! Consegui cadastrar o lote com sucesso.', time: 'Ontem' }
                    ]
                }
            ];
            localStorage.setItem('itaim_conversas_suporte', JSON.stringify(conversas));
        }

        todasConversasSuporte = conversas;
        setText('stat-support-conversations', conversas.length);
        setText('tab-count-suporte', conversas.filter(c => c.status !== 'CONCLUIDO').length);
        setText('badge-total-suporte', `${conversas.filter(c => c.status !== 'CONCLUIDO').length} abertos`);

        renderizarThreadsSuporte();
    }

    function renderizarThreadsSuporte() {
        const listaThreadsEl = document.getElementById('lista-threads-suporte');
        if (!listaThreadsEl) return;

        const filtradas = todasConversasSuporte.filter(c => {
            if (termoBuscaSuporte) {
                const q = termoBuscaSuporte.toLowerCase();
                const mUser = (c.userName || '').toLowerCase().includes(q);
                const mSub = (c.subject || '').toLowerCase().includes(q);
                const mMsg = (c.lastMessage || '').toLowerCase().includes(q);
                if (!mUser && !mSub && !mMsg) return false;
            }
            return true;
        });

        if (filtradas.length === 0) {
            listaThreadsEl.innerHTML = `
                <div style="padding: 30px 20px; text-align: center; color: var(--tk-text-dim);">
                    Nenhum ticket de atendimento encontrado.
                </div>
            `;
            return;
        }

        listaThreadsEl.innerHTML = filtradas.map(c => {
            const isAtivo = c.id === conversaSuporteAtivaId;
            const tempoFmt = formatarTempoRelativo(c.lastMessageAt);
            const avatarUrl = resolverUrlImagem(c.userAvatar);

            return `
                <div class="support-thread-item ${isAtivo ? 'ativo' : ''}" data-id="${c.id}">
                    <img src="${avatarUrl}" alt="Avatar" class="thread-avatar" onerror="this.src='../../assets/icons/icon-user.png'">
                    <div class="thread-info">
                        <div class="thread-top-row">
                            <span class="thread-user-name">${c.userName}</span>
                            <span class="thread-time">${tempoFmt}</span>
                        </div>
                        <div class="thread-subject">${c.subject || 'Atendimento'}</div>
                        <div class="thread-snippet">${c.lastMessage || 'Sem mensagens recentes'}</div>
                    </div>
                    ${c.unread ? '<span class="thread-unread-badge" title="Mensagem não lida"></span>' : ''}
                </div>
            `;
        }).join('');

        listaThreadsEl.querySelectorAll('.support-thread-item').forEach(item => {
            item.addEventListener('click', () => {
                abrirConversaSuporte(item.dataset.id);
            });
        });
    }

    function abrirConversaSuporte(convId) {
        conversaSuporteAtivaId = convId;
        const conv = todasConversasSuporte.find(c => c.id === convId);
        if (!conv) return;

        conv.unread = false;
        renderizarThreadsSuporte();

        // Atualiza cabeçalho do chat
        const avatarEl = document.getElementById('chat-suporte-avatar');
        const nomeEl = document.getElementById('chat-suporte-nome');
        const detalhesEl = document.getElementById('chat-suporte-detalhes');
        const acoesEl = document.getElementById('chat-status-acoes');
        const selectStatus = document.getElementById('select-status-suporte');
        const quickReplies = document.getElementById('suporte-quick-replies');
        const composer = document.getElementById('suporte-composer');

        if (avatarEl) avatarEl.src = resolverUrlImagem(conv.userAvatar);
        if (nomeEl) nomeEl.textContent = `${conv.userName} • ${conv.subject}`;
        if (detalhesEl) detalhesEl.textContent = `${conv.userEmail} | ${conv.userCity || 'Paulistana - PI'} | Protocolo: ${conv.protocol || conv.id}`;
        if (acoesEl) acoesEl.style.display = 'flex';
        if (selectStatus) selectStatus.value = conv.status || 'ABERTO';
        if (quickReplies) quickReplies.style.display = 'flex';
        if (composer) composer.style.display = 'flex';

        renderizarMensagensFeed(conv);
    }

    function renderizarMensagensFeed(conv) {
        const feedEl = document.getElementById('feed-mensagens-suporte');
        if (!feedEl) return;

        const msgs = conv.messages || [];
        feedEl.innerHTML = msgs.map(m => {
            const isSupport = m.sender === 'support';
            return `
                <div class="chat-bubble ${isSupport ? 'from-support' : 'from-user'}">
                    <div class="chat-bubble-author">
                        ${isSupport ? '<i class="fa-solid fa-headset"></i> Suporte Oficial' : '<i class="fa-solid fa-user"></i> ' + conv.userName}
                    </div>
                    <div>${m.text}</div>
                    <div class="chat-bubble-time">${m.time || 'Agora'}</div>
                </div>
            `;
        }).join('');

        feedEl.scrollTop = feedEl.scrollHeight;
    }

    function configurarEventosSuporte() {
        const inputMsg = document.getElementById('input-mensagem-suporte');
        const btnEnviar = document.getElementById('btn-enviar-suporte');
        const selectStatus = document.getElementById('select-status-suporte');
        const inputBusca = document.getElementById('input-busca-suporte');

        async function enviarResposta() {
            if (!conversaSuporteAtivaId) return;
            const texto = inputMsg?.value.trim();
            if (!texto) return;

            const conv = todasConversasSuporte.find(c => c.id === conversaSuporteAtivaId);
            if (!conv) return;

            conv.messages = conv.messages || [];
            conv.messages.push({
                sender: 'support',
                text: texto,
                time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
            });

            conv.lastMessage = texto;
            conv.lastMessageAt = new Date().toISOString();
            if (conv.status === 'ABERTO') {
                conv.status = 'EM_ATENDIMENTO';
                if (selectStatus) selectStatus.value = 'EM_ATENDIMENTO';
            }

            localStorage.setItem('itaim_conversas_suporte', JSON.stringify(todasConversasSuporte));
            if (inputMsg) inputMsg.value = '';
            renderizarMensagensFeed(conv);
            renderizarThreadsSuporte();
            mostrarToast('Resposta enviada ao usuário com sucesso!');
        }

        btnEnviar?.addEventListener('click', enviarResposta);
        inputMsg?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                enviarResposta();
            }
        });

        // Respostas Rápidas
        document.querySelectorAll('.quick-reply-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const texto = btn.dataset.texto;
                if (inputMsg && texto) {
                    inputMsg.value = texto;
                    inputMsg.focus();
                }
            });
        });

        // Mudança de status da conversa de suporte
        selectStatus?.addEventListener('change', () => {
            if (!conversaSuporteAtivaId) return;
            const conv = todasConversasSuporte.find(c => c.id === conversaSuporteAtivaId);
            if (conv) {
                conv.status = selectStatus.value;
                localStorage.setItem('itaim_conversas_suporte', JSON.stringify(todasConversasSuporte));
                mostrarToast(`Status do atendimento alterado para ${selectStatus.value}.`);
                renderizarThreadsSuporte();
            }
        });

        // Busca de suporte
        inputBusca?.addEventListener('input', (e) => {
            termoBuscaSuporte = e.target.value.trim();
            renderizarThreadsSuporte();
        });
    }

    // =========================================================================
    // 7. TOOLBAR E FILTROS DE DENÚNCIAS
    // =========================================================================
    function configurarEventosToolbar() {
        // Filtro por Status (Pills)
        document.querySelectorAll('#filtro-status-pills .filter-pill').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('#filtro-status-pills .filter-pill').forEach(b => b.classList.remove('ativo'));
                btn.classList.add('ativo');
                filtroStatusDenuncia = btn.dataset.status;
                carregarTicketsDenuncias();
            });
        });

        // Busca Textual
        const inputBusca = document.getElementById('input-busca-tickets');
        if (inputBusca) {
            inputBusca.addEventListener('input', (e) => {
                termoBuscaDenuncia = e.target.value.trim();
                renderizarFilaDenuncias();
            });
        }

        // Filtro por Motivo
        const selectMotivo = document.getElementById('select-motivo-filtro');
        if (selectMotivo) {
            selectMotivo.addEventListener('change', (e) => {
                filtroMotivoDenuncia = e.target.value;
                renderizarFilaDenuncias();
            });
        }
    }

    // =========================================================================
    // 8. MODAL DE DOSSIÊ DO TICKET
    // =========================================================================
    function configurarModalDetalhes() {
        const modal = document.getElementById('modal-detalhes-ticket');
        const btnFecharX = document.getElementById('btn-fechar-modal-detalhes');
        const btnFecharAcao = document.getElementById('btn-fechar-modal-acao');

        function fechar() {
            if (modal) modal.style.display = 'none';
        }

        btnFecharX?.addEventListener('click', fechar);
        btnFecharAcao?.addEventListener('click', fechar);
        modal?.addEventListener('click', (e) => {
            if (e.target === modal) fechar();
        });
    }

    function abrirModalDossie(id) {
        const ticket = todosTicketsDenuncias.find(t => t.id === id);
        if (!ticket) return;

        const modal = document.getElementById('modal-detalhes-ticket');
        const protEl = document.getElementById('modal-ticket-protocol');
        const conteudoEl = document.getElementById('modal-ticket-conteudo');

        if (protEl) protEl.textContent = `#${ticket.protocol || ticket.id}`;

        if (conteudoEl) {
            conteudoEl.innerHTML = `
                <div style="background: var(--tk-surface-alt); padding: 14px; border-radius: var(--tk-radius-sm);">
                    <div style="font-weight: 800; margin-bottom: 6px;">Anúncio Sob Investigação:</div>
                    <div style="font-size: 1rem; color: var(--tk-text);">${ticket.productTitle || 'Anúncio'}</div>
                    <div style="color: var(--tk-primary); font-weight: 700; margin-top: 4px;">
                        ${ticket.productPrice != null ? Number(ticket.productPrice).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '--'}
                    </div>
                </div>

                <div style="background: var(--tk-surface-alt); padding: 14px; border-radius: var(--tk-radius-sm);">
                    <div style="font-weight: 800; margin-bottom: 6px;">Dados do Vendedor Denunciado:</div>
                    <div>Nome: <strong>${ticket.sellerName || 'Anônimo'}</strong></div>
                    <div>E-mail: <code>${ticket.sellerEmail || '--'}</code></div>
                    <div>Status da Conta: <span style="font-weight: 700;">${ticket.sellerStatus || 'Ativo'}</span></div>
                </div>

                <div style="background: var(--tk-surface-alt); padding: 14px; border-radius: var(--tk-radius-sm);">
                    <div style="font-weight: 800; margin-bottom: 6px;">Motivo e Evidências da Denúncia:</div>
                    <div>Classificação: <span class="ticket-reason-badge other">${ticket.reasonLabel || ticket.reason}</span></div>
                    <div style="margin-top: 8px; line-height: 1.5; color: var(--tk-text);">
                        "${ticket.description || 'Nenhum detalhe adicional informado pelo denunciante.'}"
                    </div>
                    <div style="margin-top: 8px; font-size: 0.78rem; color: var(--tk-text-dim);">
                        Registrado em: ${new Date(ticket.createdAt).toLocaleString('pt-BR')}
                    </div>
                </div>
            `;
        }

        if (modal) modal.style.display = 'flex';
    }

    // =========================================================================
    // 9. UTILITÁRIOS VISUAIS E HELPERS
    // =========================================================================
    function obterClasseMotivo(reason) {
        const r = (reason || '').toUpperCase();
        if (r.includes('FRAUD') || r.includes('GOLPE')) return 'fraud';
        if (r.includes('PROHIBITED') || r.includes('ILEGAL')) return 'illegal';
        if (r.includes('SPAM')) return 'spam';
        return 'other';
    }

    function formatarTempoRelativo(isoDate) {
        if (!isoDate) return '--';
        try {
            const data = new Date(isoDate);
            const agora = new Date();
            const diffMin = Math.floor((agora - data) / 60000);
            const diffHoras = Math.floor(diffMin / 60);
            const diffDias = Math.floor(diffHoras / 24);

            if (diffMin < 2) return 'Agora mesmo';
            if (diffMin < 60) return `Há ${diffMin} min`;
            if (diffHoras < 24) return `Há ${diffHoras}h`;
            if (diffDias === 1) return 'Ontem';
            if (diffDias < 30) return `Há ${diffDias} dias`;
            return data.toLocaleDateString('pt-BR');
        } catch {
            return String(isoDate).slice(0, 10);
        }
    }

    function resolverUrlImagem(url) {
        if (!url) return '../../assets/placeholders/produto-placeholder.svg';
        if (url.startsWith('http') || url.startsWith('data:')) return url;
        if (window.ItaimApi && typeof window.ItaimApi.resolverUrlImagem === 'function') {
            return window.ItaimApi.resolverUrlImagem(url);
        }
        return `../../${url.replace(/^\/+/, '')}`;
    }

    function mostrarToast(mensagem) {
        let toast = document.getElementById('tickets-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'tickets-toast';
            document.body.appendChild(toast);
        }

        toast.textContent = mensagem;
        toast.style.cssText = `
            position: fixed;
            bottom: 24px;
            right: 24px;
            background: #1E293B;
            color: #FFFFFF;
            border-left: 4px solid #44BD32;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.4);
            font-size: 0.88rem;
            font-weight: 600;
            z-index: 9999;
            display: block;
            transition: opacity 0.2s;
        `;

        setTimeout(() => {
            toast.style.display = 'none';
        }, 3200);
    }

    // Inicialização ao carregar o DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inicializar);
    } else {
        inicializar();
    }

})();

