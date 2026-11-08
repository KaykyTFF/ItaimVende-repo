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

    // Estado dos tickets de suporte
    let todosTicketsSuporte = [];
    let filtroStatusSuporte = 'ALL';
    let filtroCategoriaSuporte = '';
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

        // Configuração do botão Sair (Logout dos Tickets)
        const btnLogout = document.getElementById('btn-logout-tickets');
        if (btnLogout) {
            btnLogout.addEventListener('click', (e) => {
                e.preventDefault();
                if (confirm('Deseja encerrar a sessão de moderação?')) {
                    try {
                        sessionStorage.removeItem('itaim_tickets_auth');
                        localStorage.removeItem('itaim_tickets_auth');
                    } catch (err) {}
                    window.location.href = 'login-tickets.html';
                }
            });
        }

        // Verifica autenticação exclusiva e isolada da moderação (independente da loja)
        try {
            let usuario = null;
            const ticketsAuthStr = sessionStorage.getItem('itaim_tickets_auth') || localStorage.getItem('itaim_tickets_auth');
            if (ticketsAuthStr) {
                usuario = JSON.parse(ticketsAuthStr);
            }

            if (!usuario || !usuario.username) {
                window.location.href = 'login-tickets.html';
                return;
            }

            const modBadge = document.getElementById('mod-user-name');
            if (modBadge && usuario) {
                const nomeExibicao = usuario.nome || usuario.name || usuario.username || 'Moderador';
                const roleExibicao = usuario.cargo || usuario.role || 'Desenvolvedor & Moderador';
                modBadge.textContent = `${nomeExibicao} (${roleExibicao})`;
            }
        } catch (e) {
            console.warn('[Tickets] Aviso ao verificar sessão de moderação:', e);
        }

        // Carrega dados iniciais de forma assíncrona garantida
        try {
            await Promise.allSettled([
                carregarTicketsDenuncias(),
                carregarTicketsSuporte()
            ]);
        } catch (err) {
            console.error('[Tickets] Erro na carga inicial assíncrona:', err);
        }

        // Botão de atualização manual
        const btnAtualizar = document.getElementById('btn-atualizar-tickets');
        if (btnAtualizar) {
            btnAtualizar.addEventListener('click', async () => {
                mostrarToast('Atualizando dados...');
                await Promise.allSettled([
                    carregarTicketsDenuncias(),
                    carregarTicketsSuporte()
                ]);
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
                        <img src="${thumbUrl}" alt="Thumbnail" class="ticket-product-thumb" onerror="this.onerror=null; this.src=(window.location.protocol && window.location.protocol.startsWith('http')) ? '/assets/placeholders/produto-placeholder.svg' : '../../assets/placeholders/produto-placeholder.svg'">
                        
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
    // 6. ABA 2: TICKETS DE SUPORTE AO USUÁRIO (ATENDIMENTO POR E-MAIL)
    // =========================================================================
    const CATEGORIAS_SUPORTE_LABEL = {
        'conta': 'Conta e Acesso',
        'anuncio': 'Anúncio / Publicação',
        'pagamento': 'Pagamento / Transação',
        'seguranca': 'Segurança / Denúncia',
        'bug': 'Erro Técnico / Bug',
        'outro': 'Outros Assuntos'
    };

    async function carregarTicketsSuporte() {
        const listaEl = document.getElementById('lista-tickets-suporte-admin');
        if (!listaEl) return;

        // 1. Coleta tickets locais de suporte unificados
        const tickets = obterTodosTicketsSuporteLocais();
        todosTicketsSuporte = tickets;

        // 2. Calcula resumo de estatísticas
        const total = tickets.length;
        const abertos = tickets.filter(t => t.status === 'ABERTO').length;
        const emAtendimento = tickets.filter(t => t.status === 'EM_ATENDIMENTO').length;
        const concluidos = tickets.filter(t => t.status === 'CONCLUIDO').length;

        // 3. Atualiza contadores visuais
        setText('stat-support-conversations', total);
        setText('tab-count-suporte', abertos + emAtendimento);
        setText('count-sup-all', total);
        setText('count-sup-open', abertos);
        setText('count-sup-progress', emAtendimento);
        setText('count-sup-resolved', concluidos);

        // 4. Renderiza a grade de tickets de suporte
        renderizarFilaSuporte();
    }

    function obterTodosTicketsSuporteLocais() {
        const mapa = new Map();

        // A. Carrega de itaim_conversas_suporte
        try {
            const rawConv = localStorage.getItem('itaim_conversas_suporte');
            if (rawConv) {
                const parsed = JSON.parse(rawConv);
                if (Array.isArray(parsed)) {
                    parsed.forEach(c => {
                        const t = normalizarTicketSuporte(c, 'itaim_conversas_suporte');
                        if (t && !mapa.has(t.protocol || t.id)) {
                            mapa.set(t.protocol || t.id, t);
                        }
                    });
                }
            }
        } catch (e) {
            console.warn('[Tickets] Erro ao ler itaim_conversas_suporte:', e);
        }

        // B. Varre todas as chaves de usuários itaim_suporte_tickets_*
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (k && k.startsWith('itaim_suporte_tickets_')) {
                    try {
                        const raw = localStorage.getItem(k);
                        if (raw) {
                            const arr = JSON.parse(raw);
                            if (Array.isArray(arr)) {
                                arr.forEach(item => {
                                    const t = normalizarTicketSuporte(item, k);
                                    if (t) {
                                        const chave = t.protocol || t.id;
                                        if (!mapa.has(chave)) {
                                            mapa.set(chave, t);
                                        } else {
                                            const exist = mapa.get(chave);
                                            if (item.descricao && !exist.description) exist.description = item.descricao;
                                            if (item.categoria && !exist.category) {
                                                exist.category = item.categoria;
                                                exist.categoryLabel = CATEGORIAS_SUPORTE_LABEL[item.categoria] || item.categoria;
                                            }
                                            if (Array.isArray(item.anexos) && item.anexos.length > 0) {
                                                exist.anexos = item.anexos;
                                            }
                                        }
                                    }
                                });
                            }
                        }
                    } catch (errKey) {}
                }
            }
        } catch (e) {
            console.warn('[Tickets] Erro ao varrer chaves de suporte:', e);
        }

        // C. Caso não exista nenhum ticket registrado, provê dados iniciais padrão
        if (mapa.size === 0) {
            const suportePadrao = [
                {
                    id: 'sup_tkt_101',
                    protocol: 'TK-SUP-101',
                    userName: 'Cláudio Ferreira',
                    userEmail: 'claudio.ferreira@gmail.com',
                    userCity: 'Paulistana - PI',
                    userAvatar: 'assets/icons/icon-user.png',
                    category: 'pagamento',
                    categoryLabel: 'Pagamento / Transação',
                    subject: 'Dúvida sobre taxa de entrega para Acauã',
                    description: 'Gostaria de saber se a taxa de entrega e o frete para a cidade de Acauã podem ser combinados diretamente com o anunciante no momento da retirada ou pela plataforma.',
                    anexos: [],
                    status: 'EM_ATENDIMENTO',
                    statusLabel: 'Em Atendimento',
                    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString()
                },
                {
                    id: 'sup_tkt_102',
                    protocol: 'TK-SUP-102',
                    userName: 'Ana Paula Santos',
                    userEmail: 'anapaula.santos@hotmail.com',
                    userCity: 'Betânia do Piauí',
                    userAvatar: 'assets/icons/icon-user.png',
                    category: 'anuncio',
                    categoryLabel: 'Anúncio / Publicação',
                    subject: 'Meu anúncio foi pausado indevidamente',
                    description: 'Vocês poderiam verificar porque as fotos da minha moto não estão carregando e o anúncio acabou sendo pausado pelo sistema?',
                    anexos: [],
                    status: 'ABERTO',
                    statusLabel: 'Aberto',
                    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString()
                },
                {
                    id: 'sup_tkt_103',
                    protocol: 'TK-SUP-103',
                    userName: 'Raimundo Nonato',
                    userEmail: 'raimundo.agro@bol.com.br',
                    userCity: 'Jacobina do Piauí',
                    userAvatar: 'assets/icons/icon-user.png',
                    category: 'conta',
                    categoryLabel: 'Conta e Acesso',
                    subject: 'Ajuda com cadastro de caprinos e animais',
                    description: 'Muito obrigado pelo suporte! Consegui cadastrar o lote com sucesso e já está ativo.',
                    anexos: [],
                    status: 'CONCLUIDO',
                    statusLabel: 'Concluído',
                    createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
                }
            ];
            try {
                localStorage.setItem('itaim_conversas_suporte', JSON.stringify(suportePadrao));
            } catch (e) {}
            return suportePadrao;
        }

        return Array.from(mapa.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    function normalizarTicketSuporte(raw, storageKey) {
        if (!raw) return null;

        const id = raw.id || raw.protocol || ('TKT-' + Math.random().toString(36).substring(2, 7).toUpperCase());
        const protocol = raw.protocol || (id.startsWith('TK-') ? id : (id.startsWith('TKT-') ? `TK-SUP-${id.replace('TKT-', '')}` : `TK-SUP-${id.slice(-5).toUpperCase()}`));

        let status = (raw.status || 'ABERTO').toUpperCase();
        if (status === 'PENDENTE' || status === 'PENDING') status = 'ABERTO';
        if (status === 'EM_ANDAMENTO' || status === 'IN_PROGRESS') status = 'EM_ATENDIMENTO';
        if (status === 'RESOLVIDO' || status === 'RESOLVED' || status === 'FECHADO') status = 'CONCLUIDO';

        const statusLabel = status === 'ABERTO' ? 'Aberto' :
                            status === 'EM_ATENDIMENTO' ? 'Em Atendimento' : 'Concluído';

        let category = (raw.category || raw.categoria || '').toLowerCase().trim();
        if (!category) {
            const sub = (raw.subject || raw.titulo || '').toLowerCase();
            if (sub.includes('conta') || sub.includes('login') || sub.includes('senha') || sub.includes('acesso')) category = 'conta';
            else if (sub.includes('anúncio') || sub.includes('anuncio') || sub.includes('foto') || sub.includes('produto')) category = 'anuncio';
            else if (sub.includes('pagamento') || sub.includes('pix') || sub.includes('taxa') || sub.includes('entrega') || sub.includes('frete')) category = 'pagamento';
            else if (sub.includes('denúncia') || sub.includes('denuncia') || sub.includes('golpe') || sub.includes('segurança')) category = 'seguranca';
            else if (sub.includes('erro') || sub.includes('bug') || sub.includes('travou')) category = 'bug';
            else category = 'outro';
        }
        const categoryLabel = CATEGORIAS_SUPORTE_LABEL[category] || 'Geral / Outros';

        let description = raw.description || raw.descricao || '';
        if (!description && raw.lastMessage) {
            description = raw.lastMessage;
        } else if (!description && Array.isArray(raw.messages) && raw.messages.length > 0) {
            const firstUserMsg = raw.messages.find(m => m.sender === 'user') || raw.messages[0];
            description = firstUserMsg.text || '';
        }
        if (!description) {
            description = 'Solicitação de suporte registrada por usuário.';
        }

        const createdAt = raw.createdAt || raw.criadoEm || raw.lastMessageAt || new Date().toISOString();

        return {
            id,
            protocol,
            userId: raw.userId || null,
            userName: raw.userName || raw.nome || raw.name || 'Usuário da Plataforma',
            userEmail: raw.userEmail || raw.email || 'usuario@itaimvende.com.br',
            userCity: raw.userCity || raw.cidade || raw.city || 'Paulistana - PI',
            userAvatar: raw.userAvatar || raw.avatar || raw.foto || 'assets/icons/icon-user.png',
            category,
            categoryLabel,
            subject: raw.subject || raw.titulo || 'Atendimento ao Usuário',
            description,
            anexos: Array.isArray(raw.anexos) ? raw.anexos : [],
            status,
            statusLabel,
            createdAt,
            storageKey: storageKey || 'itaim_conversas_suporte'
        };
    }

    function renderizarFilaSuporte() {
        const listaEl = document.getElementById('lista-tickets-suporte-admin');
        if (!listaEl) return;

        const filtrados = todosTicketsSuporte.filter(item => {
            if (filtroStatusSuporte !== 'ALL' && item.status !== filtroStatusSuporte) {
                return false;
            }

            if (filtroCategoriaSuporte && item.category !== filtroCategoriaSuporte) {
                return false;
            }

            if (termoBuscaSuporte) {
                const q = termoBuscaSuporte.toLowerCase();
                const matchProt = (item.protocol || '').toLowerCase().includes(q);
                const matchName = (item.userName || '').toLowerCase().includes(q);
                const matchEmail = (item.userEmail || '').toLowerCase().includes(q);
                const matchSub = (item.subject || '').toLowerCase().includes(q);
                const matchDesc = (item.description || '').toLowerCase().includes(q);
                if (!matchProt && !matchName && !matchEmail && !matchSub && !matchDesc) {
                    return false;
                }
            }

            return true;
        });

        if (filtrados.length === 0) {
            listaEl.innerHTML = `
                <div class="tickets-empty-box">
                    <i class="fa-solid fa-headset tickets-empty-icon" style="color: #64748B;"></i>
                    <h3>Nenhum ticket de suporte encontrado</h3>
                    <p>Nenhum chamado corresponde aos filtros aplicados no momento.</p>
                </div>
            `;
            return;
        }

        listaEl.innerHTML = filtrados.map(t => {
            const statusClass = t.status.toLowerCase();
            const tempoFmt = formatarTempoRelativo(t.createdAt);
            const avatarUrl = resolverUrlImagem(t.userAvatar);
            const catBadgeClass = t.category || 'outro';

            let anexosHtml = '';
            if (Array.isArray(t.anexos) && t.anexos.length > 0) {
                anexosHtml = `
                    <div class="ticket-attachments-row">
                        <span style="font-size: 0.76rem; font-weight: 700; color: var(--tk-text-muted);"><i class="fa-solid fa-paperclip"></i> Anexos (${t.anexos.length}):</span>
                        ${t.anexos.map(a => {
                            const nome = typeof a === 'string' ? a : (a.nome || a.name || 'Arquivo');
                            return `<span class="ticket-attachment-tag"><i class="fa-solid fa-file"></i> ${escapeHtml(nome)}</span>`;
                        }).join('')}
                    </div>
                `;
            }

            const emailSubject = `[Itaim Vende - Suporte] Chamado #${t.protocol || t.id} - ${t.subject || 'Atendimento'}`;
            const emailBody = `Olá, ${t.userName}!\n\nRecebemos seu chamado #${t.protocol || t.id} referente a "${t.subject}".\n\nA respeito do seu relato:\n"${t.description}"\n\nGostaríamos de informar que:\n\n\n\nCaso tenha novas dúvidas, basta responder a este e-mail.\n\nAtenciosamente,\nEquipe de Moderação e Atendimento\nItaim Vende • Paulistana - PI`;
            const mailtoUrl = `mailto:${encodeURIComponent(t.userEmail)}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

            return `
                <div class="ticket-card status-${statusClass}" id="card-suporte-${t.id}">
                    <div class="ticket-card-header">
                        <div class="ticket-protocol-row">
                            <span class="ticket-protocol-badge">
                                <i class="fa-solid fa-hashtag"></i> ${t.protocol || t.id}
                                <button type="button" class="btn-copy-protocol" data-copy="${t.protocol || t.id}" title="Copiar protocolo">
                                    <i class="fa-regular fa-copy"></i>
                                </button>
                            </span>
                            <span class="ticket-category-badge ${catBadgeClass}">
                                <i class="fa-solid fa-tag"></i> ${t.categoryLabel}
                            </span>
                            <span class="ticket-status-pill ${statusClass}">
                                ${t.statusLabel}
                            </span>
                        </div>
                        <div class="ticket-meta-right">
                            <span><i class="fa-regular fa-clock"></i> ${tempoFmt}</span>
                        </div>
                    </div>

                    <div class="ticket-card-body support-card-body">
                        <div class="ticket-user-summary">
                            <img src="${avatarUrl}" alt="Avatar" class="ticket-user-avatar" onerror="this.src='../../assets/icons/icon-user.png'">
                            <div class="ticket-user-meta">
                                <span class="ticket-user-name">${escapeHtml(t.userName)}</span>
                                <span class="ticket-user-email">
                                    <i class="fa-regular fa-envelope"></i> <code>${escapeHtml(t.userEmail)}</code>
                                </span>
                                ${t.userCity ? `<span class="ticket-user-city"><i class="fa-solid fa-location-dot"></i> ${escapeHtml(t.userCity)}</span>` : ''}
                            </div>
                        </div>

                        <div class="ticket-content-summary">
                            <h3 class="ticket-support-title">${escapeHtml(t.subject)}</h3>
                            <div class="ticket-description-quote">
                                <strong>Relato do Usuário:</strong> "${escapeHtml(t.description)}"
                            </div>
                            ${anexosHtml}
                        </div>
                    </div>

                    <div class="ticket-card-footer">
                        <div class="ticket-status-select-wrap">
                            <label for="select-status-sup-${t.id}">Alterar Status:</label>
                            <select class="select-tk-custom select-alterar-status-suporte" data-id="${t.id}" id="select-status-sup-${t.id}">
                                <option value="ABERTO" ${t.status === 'ABERTO' ? 'selected' : ''}>🟡 Aberto</option>
                                <option value="EM_ATENDIMENTO" ${t.status === 'EM_ATENDIMENTO' ? 'selected' : ''}>🔵 Em Atendimento</option>
                                <option value="CONCLUIDO" ${t.status === 'CONCLUIDO' ? 'selected' : ''}>🟢 Concluído</option>
                            </select>
                        </div>

                        <div class="ticket-actions-group">
                            <a href="${mailtoUrl}" class="btn-mod-action btn-email" title="Abrir cliente de e-mail para responder ao usuário">
                                <i class="fa-solid fa-envelope"></i> Responder por E-mail
                            </a>
                            <button type="button" class="btn-mod-action btn-copy-email" data-email="${escapeHtml(t.userEmail)}" title="Copiar e-mail do usuário">
                                <i class="fa-regular fa-copy"></i> Copiar E-mail
                            </button>
                            <button type="button" class="btn-mod-action btn-view" data-action="detalhes-suporte" data-id="${t.id}" title="Ver dossiê do chamado">
                                <i class="fa-solid fa-circle-info"></i> Detalhes
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        vincularEventosCardsSuporte();
    }

    function vincularEventosCardsSuporte() {
        // Cópia de protocolo
        document.querySelectorAll('#lista-tickets-suporte-admin .btn-copy-protocol').forEach(btn => {
            btn.addEventListener('click', () => {
                const cod = btn.dataset.copy;
                if (cod && navigator.clipboard) {
                    navigator.clipboard.writeText(cod).then(() => {
                        mostrarToast(`Protocolo #${cod} copiado para a área de transferência!`);
                    });
                }
            });
        });

        // Cópia de e-mail do usuário
        document.querySelectorAll('#lista-tickets-suporte-admin .btn-copy-email').forEach(btn => {
            btn.addEventListener('click', () => {
                const email = btn.dataset.email;
                if (email && navigator.clipboard) {
                    navigator.clipboard.writeText(email).then(() => {
                        mostrarToast(`E-mail "${email}" copiado para a área de transferência!`);
                    });
                }
            });
        });

        // Alteração de status do ticket de suporte
        document.querySelectorAll('.select-alterar-status-suporte').forEach(sel => {
            sel.addEventListener('change', async () => {
                const id = sel.dataset.id;
                const novoStatus = sel.value;
                await executarMudancaStatusSuporte(id, novoStatus);
            });
        });

        // Detalhes do ticket de suporte
        document.querySelectorAll('#lista-tickets-suporte-admin .btn-mod-action[data-action="detalhes-suporte"]').forEach(btn => {
            btn.addEventListener('click', () => {
                abrirModalDossieSuporte(btn.dataset.id);
            });
        });
    }

    async function executarMudancaStatusSuporte(id, novoStatus) {
        const ticket = todosTicketsSuporte.find(t => t.id === id || t.protocol === id);
        if (!ticket) return;

        ticket.status = novoStatus;
        ticket.statusLabel = novoStatus === 'ABERTO' ? 'Aberto' :
                             novoStatus === 'EM_ATENDIMENTO' ? 'Em Atendimento' : 'Concluído';

        // 1. Atualiza na lista de conversas de suporte
        try {
            const raw = localStorage.getItem('itaim_conversas_suporte');
            if (raw) {
                const list = JSON.parse(raw);
                if (Array.isArray(list)) {
                    const idx = list.findIndex(c => c.id === id || c.protocol === ticket.protocol || c.protocol === id);
                    if (idx >= 0) {
                        list[idx].status = novoStatus;
                        localStorage.setItem('itaim_conversas_suporte', JSON.stringify(list));
                    }
                }
            }
        } catch (e) {}

        // 2. Mapeamento para status do perfil do usuário: 'aberto' | 'em_andamento' | 'resolvido'
        const statusPerfilUsuario = novoStatus === 'ABERTO' ? 'aberto' :
                                   novoStatus === 'EM_ATENDIMENTO' ? 'em_andamento' : 'resolvido';

        try {
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (k && k.startsWith('itaim_suporte_tickets_')) {
                    const raw = localStorage.getItem(k);
                    if (raw) {
                        const arr = JSON.parse(raw);
                        if (Array.isArray(arr)) {
                            let alterou = false;
                            arr.forEach(uTkt => {
                                if (uTkt.id === ticket.id || uTkt.id === ticket.protocol || (ticket.protocol && ticket.protocol.includes(uTkt.id))) {
                                    uTkt.status = statusPerfilUsuario;
                                    alterou = true;
                                }
                            });
                            if (alterou) {
                                localStorage.setItem(k, JSON.stringify(arr));
                            }
                        }
                    }
                }
            }
        } catch (e) {}

        mostrarToast(`Status do chamado atualizado para "${ticket.statusLabel}".`);
        await carregarTicketsSuporte();
    }

    function configurarEventosSuporte() {
        // Filtro por Status (Pills de Suporte)
        document.querySelectorAll('#filtro-status-suporte-pills .filter-pill').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('#filtro-status-suporte-pills .filter-pill').forEach(b => b.classList.remove('ativo'));
                btn.classList.add('ativo');
                filtroStatusSuporte = btn.dataset.status;
                renderizarFilaSuporte();
            });
        });

        // Busca Textual de Suporte
        const inputBusca = document.getElementById('input-busca-suporte');
        if (inputBusca) {
            inputBusca.addEventListener('input', (e) => {
                termoBuscaSuporte = e.target.value.trim();
                renderizarFilaSuporte();
            });
        }

        // Filtro por Categoria de Suporte
        const selectCategoria = document.getElementById('select-categoria-suporte-filtro');
        if (selectCategoria) {
            selectCategoria.addEventListener('change', (e) => {
                filtroCategoriaSuporte = e.target.value;
                renderizarFilaSuporte();
            });
        }
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
        const tituloEl = document.getElementById('modal-titulo-tipo');
        const iconeEl = document.getElementById('modal-icone-tipo');
        const conteudoEl = document.getElementById('modal-ticket-conteudo');
        const rodapeAcoesEl = document.getElementById('modal-ticket-rodape-acoes');

        if (tituloEl) tituloEl.textContent = 'Dossiê do Ticket de Denúncia';
        if (iconeEl) iconeEl.className = 'fa-solid fa-file-shield';
        if (protEl) protEl.textContent = `#${ticket.protocol || ticket.id}`;

        if (conteudoEl) {
            conteudoEl.innerHTML = `
                <div style="background: var(--tk-surface-alt); padding: 14px; border-radius: var(--tk-radius-sm);">
                    <div style="font-weight: 800; margin-bottom: 6px;">Anúncio Sob Investigação:</div>
                    <div style="font-size: 1rem; color: var(--tk-text);">${escapeHtml(ticket.productTitle || 'Anúncio')}</div>
                    <div style="color: var(--tk-primary); font-weight: 700; margin-top: 4px;">
                        ${ticket.productPrice != null ? Number(ticket.productPrice).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '--'}
                    </div>
                </div>

                <div style="background: var(--tk-surface-alt); padding: 14px; border-radius: var(--tk-radius-sm);">
                    <div style="font-weight: 800; margin-bottom: 6px;">Dados do Vendedor Denunciado:</div>
                    <div>Nome: <strong>${escapeHtml(ticket.sellerName || 'Anônimo')}</strong></div>
                    <div>E-mail: <code>${escapeHtml(ticket.sellerEmail || '--')}</code></div>
                    <div>Status da Conta: <span style="font-weight: 700;">${escapeHtml(ticket.sellerStatus || 'Ativo')}</span></div>
                </div>

                <div style="background: var(--tk-surface-alt); padding: 14px; border-radius: var(--tk-radius-sm);">
                    <div style="font-weight: 800; margin-bottom: 6px;">Motivo e Evidências da Denúncia:</div>
                    <div>Classificação: <span class="ticket-reason-badge other">${escapeHtml(ticket.reasonLabel || ticket.reason)}</span></div>
                    <div style="margin-top: 8px; line-height: 1.5; color: var(--tk-text);">
                        "${escapeHtml(ticket.description || 'Nenhum detalhe adicional informado pelo denunciante.')}"
                    </div>
                    <div style="margin-top: 8px; font-size: 0.78rem; color: var(--tk-text-dim);">
                        Registrado em: ${new Date(ticket.createdAt).toLocaleString('pt-BR')}
                    </div>
                </div>
            `;
        }

        if (rodapeAcoesEl) {
            rodapeAcoesEl.innerHTML = `
                <button type="button" class="btn-tk-nav" id="btn-fechar-modal-acao">Fechar</button>
            `;
            document.getElementById('btn-fechar-modal-acao')?.addEventListener('click', () => {
                if (modal) modal.style.display = 'none';
            });
        }

        if (modal) modal.style.display = 'flex';
    }

    function abrirModalDossieSuporte(id) {
        const ticket = todosTicketsSuporte.find(t => t.id === id || t.protocol === id);
        if (!ticket) return;

        const modal = document.getElementById('modal-detalhes-ticket');
        const protEl = document.getElementById('modal-ticket-protocol');
        const tituloEl = document.getElementById('modal-titulo-tipo');
        const iconeEl = document.getElementById('modal-icone-tipo');
        const conteudoEl = document.getElementById('modal-ticket-conteudo');
        const rodapeAcoesEl = document.getElementById('modal-ticket-rodape-acoes');

        if (tituloEl) tituloEl.textContent = 'Dossiê do Chamado de Suporte';
        if (iconeEl) iconeEl.className = 'fa-solid fa-headset';
        if (protEl) protEl.textContent = `#${ticket.protocol || ticket.id}`;

        const emailSubject = `[Itaim Vende - Suporte] Chamado #${ticket.protocol || ticket.id} - ${ticket.subject}`;
        const emailBody = `Olá, ${ticket.userName}!\n\nRecebemos seu chamado #${ticket.protocol || ticket.id} com o assunto "${ticket.subject}".\n\nReferente ao seu relato:\n"${ticket.description}"\n\nGostaríamos de esclarecer que:\n\n\n\nCaso tenha dúvidas adicionais, basta responder a este e-mail.\n\nAtenciosamente,\nEquipe de Suporte e Administração\nItaim Vende`;
        const mailtoUrl = `mailto:${encodeURIComponent(ticket.userEmail)}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

        if (conteudoEl) {
            let anexosList = 'Nenhum anexo enviado neste chamado.';
            if (Array.isArray(ticket.anexos) && ticket.anexos.length > 0) {
                anexosList = ticket.anexos.map(a => `
                    <div style="padding: 4px 0; display: flex; align-items: center; gap: 6px;">
                        <i class="fa-solid fa-file"></i>
                        <span>${escapeHtml(typeof a === 'string' ? a : (a.nome || a.name || 'Arquivo'))}</span>
                    </div>
                `).join('');
            }

            conteudoEl.innerHTML = `
                <div style="background: var(--tk-surface-alt); padding: 14px; border-radius: var(--tk-radius-sm);">
                    <div style="font-weight: 800; margin-bottom: 6px;">Dados do Usuário Solicitante:</div>
                    <div>Nome: <strong>${escapeHtml(ticket.userName)}</strong></div>
                    <div>E-mail de Contato: <code>${escapeHtml(ticket.userEmail)}</code></div>
                    <div>Localidade / Cidade: <span>${escapeHtml(ticket.userCity)}</span></div>
                </div>

                <div style="background: var(--tk-surface-alt); padding: 14px; border-radius: var(--tk-radius-sm);">
                    <div style="font-weight: 800; margin-bottom: 6px;">Classificação & Assunto:</div>
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px; flex-wrap: wrap;">
                        <span class="ticket-category-badge ${ticket.category || 'outro'}"><i class="fa-solid fa-tag"></i> ${ticket.categoryLabel}</span>
                        <span class="ticket-status-pill ${ticket.status.toLowerCase()}">${ticket.statusLabel}</span>
                    </div>
                    <div style="font-size: 1.05rem; font-weight: 700; color: var(--tk-text);">${escapeHtml(ticket.subject)}</div>
                </div>

                <div style="background: var(--tk-surface-alt); padding: 14px; border-radius: var(--tk-radius-sm);">
                    <div style="font-weight: 800; margin-bottom: 6px;">Relato Completo do Chamado:</div>
                    <div style="line-height: 1.55; color: var(--tk-text); white-space: pre-wrap;">
                        ${escapeHtml(ticket.description)}
                    </div>
                    <div style="margin-top: 10px; font-size: 0.78rem; color: var(--tk-text-dim);">
                        Registrado em: ${new Date(ticket.createdAt).toLocaleString('pt-BR')}
                    </div>
                </div>

                <div style="background: var(--tk-surface-alt); padding: 14px; border-radius: var(--tk-radius-sm);">
                    <div style="font-weight: 800; margin-bottom: 6px;">Anexos do Usuário:</div>
                    <div style="font-size: 0.85rem; color: var(--tk-text-muted);">
                        ${anexosList}
                    </div>
                </div>
            `;
        }

        if (rodapeAcoesEl) {
            rodapeAcoesEl.innerHTML = `
                <a href="${mailtoUrl}" class="btn-mod-action btn-email" style="text-decoration: none;">
                    <i class="fa-solid fa-envelope"></i> Responder por E-mail
                </a>
                <button type="button" class="btn-mod-action btn-copy-email" id="modal-btn-copiar-email" data-email="${escapeHtml(ticket.userEmail)}">
                    <i class="fa-regular fa-copy"></i> Copiar E-mail
                </button>
                <button type="button" class="btn-tk-nav" id="btn-fechar-modal-acao">Fechar</button>
            `;

            document.getElementById('modal-btn-copiar-email')?.addEventListener('click', () => {
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(ticket.userEmail).then(() => {
                        mostrarToast(`E-mail "${ticket.userEmail}" copiado para a área de transferência!`);
                    });
                }
            });

            document.getElementById('btn-fechar-modal-acao')?.addEventListener('click', () => {
                if (modal) modal.style.display = 'none';
            });
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
        const isHttp = (window.location.protocol && window.location.protocol.startsWith('http'));
        const defaultPlaceholder = isHttp
            ? '/assets/placeholders/produto-placeholder.svg'
            : '../../assets/placeholders/produto-placeholder.svg';

        if (!url) return defaultPlaceholder;
        if (url.startsWith('http') || url.startsWith('data:')) return url;
        if (window.ItaimApi && typeof window.ItaimApi.resolverUrlImagem === 'function') {
            return window.ItaimApi.resolverUrlImagem(url);
        }
        if (isHttp) {
            return `/${url.replace(/^\/+/, '')}`;
        }
        return `../../${url.replace(/^\/+/, '')}`;
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
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

