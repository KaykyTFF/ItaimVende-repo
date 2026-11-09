/**
 * ITAIM VENDE - PAINEL DE CONTROLE: MODERAÇÃO DE DENÚNCIAS, ANÚNCIOS E USUÁRIOS
 * Arquivo: frontend/js/pages/admin/painel-moderacao.js
 * 
 * Centraliza ações administrativas para moderadores:
 * - Listagem e filtragem de denúncias (Tickets de Fraude & Abuso)
 * - Remoção de anúncios fraudulentos com limpeza automática no bucket do Storage
 * - Suspensão e banimento de contas suspeitas
 * - Arquivamento/descarte de denúncias improcedentes
 * - Moderação rápida de anúncios e usuários recentes
 */

(function () {
    'use strict';

    window.ItaimAdminModeracao = window.ItaimAdminModeracao || {};

    let filtroStatusDenunciaAtual = 'ALL';

    function getUtils() {
        return window.ItaimAdminUtils || {};
    }

    /**
     * Formata data/tempo relativo amigável
     */
    function formatarTempoRelativo(isoDate) {
        if (!isoDate) return '--';
        try {
            const data = new Date(isoDate);
            const agora = new Date();
            const diffMs = agora - data;
            const diffMin = Math.floor(diffMs / 60000);
            const diffHoras = Math.floor(diffMin / 60);
            const diffDias = Math.floor(diffHoras / 24);

            if (diffMin < 2) return 'Agora mesmo';
            if (diffMin < 60) return `Há ${diffMin} min`;
            if (diffHoras < 24) return `Há ${diffHoras}h`;
            if (diffDias === 1) return 'Ontem';
            if (diffDias < 30) return `Há ${diffDias} dias`;

            return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
        } catch {
            return String(isoDate).slice(0, 10);
        }
    }

    /**
     * Retorna a classe de estilo para a categoria do motivo da denúncia
     */
    function obterClasseMotivo(reason) {
        const r = (reason || '').toUpperCase();
        if (r.includes('FRAUD') || r.includes('GOLPE')) return 'fraud';
        if (r.includes('ILLEGAL') || r.includes('ILEGAL') || r.includes('PROIBIDO')) return 'illegal';
        if (r.includes('SPAM')) return 'spam';
        return 'other';
    }

    /**
     * Carrega e renderiza a fila de denúncias com filtros de status
     */
    async function carregarDenunciasModeracao(filtro = filtroStatusDenunciaAtual) {
        const { el } = getUtils();
        filtroStatusDenunciaAtual = filtro;

        if (el?.listaModeracaoDenuncias && !el.listaModeracaoDenuncias.children.length) {
            el.listaModeracaoDenuncias.innerHTML = `<div class="moderacao-empty"><i class="fa-solid fa-spinner fa-spin"></i> Carregando fila de denúncias...</div>`;
        }

        try {
            const res = await ItaimApi.reports.listar({
                status: filtro === 'ALL' ? undefined : filtro,
                limit: 50
            });

            const items = res.data || [];
            const summary = res.summary || {};

            // Atualiza contadores dos filtros
            if (el?.countReportsAll) el.countReportsAll.textContent = summary.total ?? items.length;
            if (el?.countReportsPending) el.countReportsPending.textContent = summary.pending ?? 0;
            if (el?.countReportsReview) el.countReportsReview.textContent = summary.underReview ?? 0;
            if (el?.countReportsResolved) el.countReportsResolved.textContent = summary.resolved ?? 0;
            if (el?.countReportsDismissed) el.countReportsDismissed.textContent = summary.dismissed ?? 0;

            if (el?.badgeTotalReports) {
                const totalTickets = summary.total ?? items.length;
                el.badgeTotalReports.textContent = `${totalTickets} denúncia${totalTickets === 1 ? '' : 's'}`;
            }

            if (!el?.listaModeracaoDenuncias) return;

            if (items.length === 0) {
                const rotuloFiltro = filtro === 'ALL' ? 'Nenhuma denúncia registrada.' : `Nenhuma denúncia no status "${filtro}".`;
                el.listaModeracaoDenuncias.innerHTML = `
                    <div class="moderacao-empty">
                        <i class="fa-solid fa-shield-cat" style="font-size: 2rem; color: #64748b; margin-bottom: 8px; display: block;"></i>
                        ${rotuloFiltro}
                    </div>
                `;
                return;
            }

            el.listaModeracaoDenuncias.innerHTML = items.map((item) => {
                const statusLower = (item.status || 'pending').toLowerCase();
                const reasonClass = obterClasseMotivo(item.reason);
                const precoFmt = item.productPrice != null
                    ? Number(item.productPrice).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                    : 'Preço a combinar';
                const tempoFmt = formatarTempoRelativo(item.createdAt);

                const imagemCapaUrl = item.productCover
                    ? ItaimApi.resolverUrlImagem(item.productCover)
                    : null;

                const thumbHtml = imagemCapaUrl
                    ? `<img src="${imagemCapaUrl}" alt="${item.productTitle || 'Produto'}" class="report-product-thumb" onerror="this.outerHTML='<div class=\\'report-product-thumb-placeholder\\'><i class=\\'fa-solid fa-box\\'></i></div>'">`
                    : `<div class="report-product-thumb-placeholder"><i class="fa-solid fa-box"></i></div>`;

                const isPendenteOuReview = item.status === 'PENDING' || item.status === 'UNDER_REVIEW';
                const sellerStatusLower = (item.sellerStatus || 'active').toLowerCase();
                const sellerStatusLabel = item.sellerStatus === 'ACTIVE' ? 'Ativo' : (item.sellerStatus === 'SUSPENDED' ? 'Suspenso' : item.sellerStatus);

                const escapedTitle = (item.productTitle || 'Anúncio').replace(/'/g, "\\'").replace(/"/g, '&quot;');
                const escapedSeller = (item.sellerName || 'Vendedor').replace(/'/g, "\\'").replace(/"/g, '&quot;');

                return `
                    <div class="report-card status-${statusLower}" id="report-ticket-${item.id}">
                        <div class="report-card-top">
                            <div class="report-top-badges">
                                <span class="report-protocol">${item.protocol || '#' + item.id.slice(-6).toUpperCase()}</span>
                                <span class="report-reason-badge ${reasonClass}">
                                    <i class="fa-solid fa-triangle-exclamation"></i> ${item.reasonLabel || item.reason}
                                </span>
                                <span class="report-status-badge ${statusLower}">
                                    ${item.statusLabel || item.status}
                                </span>
                            </div>
                            <span class="report-time"><i class="fa-regular fa-clock"></i> ${tempoFmt}</span>
                        </div>

                        <div class="report-card-body">
                            ${thumbHtml}
                            <div class="report-details">
                                <div class="report-product-title">
                                    <span>${item.productTitle || 'Anúncio sem título'}</span>
                                    <span class="report-product-price">${precoFmt}</span>
                                </div>
                                <div class="report-seller-info">
                                    <span><strong>Vendedor:</strong> ${item.sellerName || 'Desconhecido'}</span>
                                    <span>(${item.sellerEmail || 'Sem email'})</span>
                                    <span class="seller-status-pill ${sellerStatusLower}">${sellerStatusLabel}</span>
                                </div>
                                ${item.description ? `
                                    <div class="report-complaint-box">
                                        <i class="fa-solid fa-quote-left"></i>
                                        <span>${item.description}</span>
                                    </div>
                                ` : ''}
                            </div>
                        </div>

                        <div class="report-card-actions">
                            ${isPendenteOuReview ? `
                                <button type="button" class="btn-report-action btn-report-danger" onclick="window.painelRemoverAnuncioDenuncia('${item.id}', '${escapedTitle}')" title="Aprovar denúncia, rejeitar anúncio e remover imagens do Supabase Storage">
                                    <i class="fa-solid fa-trash-can"></i> Remover Anúncio & Mídias
                                </button>
                                <button type="button" class="btn-report-action btn-report-warning" onclick="window.painelSuspenderContaDenuncia('${item.id}', '${escapedSeller}')" title="Suspender conta do vendedor e arquivar todos os seus produtos">
                                    <i class="fa-solid fa-user-slash"></i> Suspender Conta
                                </button>
                                <button type="button" class="btn-report-action btn-report-secondary" onclick="window.painelDescartarDenuncia('${item.id}')" title="Descartar denúncia como improcedente">
                                    <i class="fa-solid fa-xmark"></i> Descartar
                                </button>
                            ` : `
                                <span class="text-muted" style="font-size: 0.72rem; margin-right: 6px;">
                                    <i class="fa-solid fa-circle-check text-green"></i> Caso finalizado (${item.statusLabel || item.status})
                                </span>
                            `}
                            <a href="/produto?id=${item.productId}" target="_blank" rel="noopener noreferrer" class="btn-report-action btn-report-view" title="Abrir página do produto">
                                <i class="fa-solid fa-arrow-up-right-from-square"></i> Ver Anúncio
                            </a>
                        </div>
                    </div>
                `;
            }).join('');

        } catch (err) {
            if (el?.listaModeracaoDenuncias) {
                el.listaModeracaoDenuncias.innerHTML = `
                    <div class="moderacao-empty text-red">
                        <i class="fa-solid fa-circle-exclamation"></i> Erro ao carregar fila de denúncias: ${err.message}
                    </div>
                `;
            }
        }
    }

    /**
     * Alterna o filtro de status da fila de denúncias
     */
    function filtrarDenuncias(status) {
        filtroStatusDenunciaAtual = status;

        document.querySelectorAll('.btn-filter-report').forEach((btn) => {
            if (btn.getAttribute('data-status') === status) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        carregarDenunciasModeracao(status);
    }

    /**
     * Ação: Moderador remove anúncio fraudulento e limpa o bucket
     */
    async function removerAnuncioDenuncia(reportId, productTitle) {
        const { mostrarToast, adicionarLog } = getUtils();
        const justificativa = window.prompt(
            `Atenção: Deseja aprovar a remoção do anúncio "${productTitle}"?\n\nAs fotos serão excluídas automaticamente do Supabase Storage e o ticket será marcado como RESOLVIDO.\n\nInforme a justificativa da remoção:`,
            'Anúncio fraudulento identificado pela moderação'
        );

        if (justificativa === null) return; // Cancelado

        if (mostrarToast) mostrarToast('Removendo anúncio e limpando mídias...', 'info');

        try {
            const res = await ItaimApi.reports.removerAnuncioFraudulento(reportId, justificativa);
            if (mostrarToast) mostrarToast(res.message || 'Anúncio removido e mídias limpas com sucesso!', 'success');
            if (adicionarLog) adicionarLog(`Moderação: Anúncio de denúncia #${reportId} removido (${res.data?.product?.title || productTitle})`, 'pass');

            // Atualiza denúncias e dados gerais
            await carregarDenunciasModeracao();
            await carregarDadosModeracao();

            if (window.ItaimAdminStatus?.carregarStatusSistema) {
                window.ItaimAdminStatus.carregarStatusSistema();
            }
        } catch (err) {
            if (mostrarToast) mostrarToast(`Erro ao remover anúncio: ${err.message}`, 'warn');
            if (adicionarLog) adicionarLog(`Erro ao remover anúncio #${reportId}: ${err.message}`, 'fail');
        }
    }

    /**
     * Ação: Moderador suspende a conta do vendedor suspeito e arquiva seus anúncios
     */
    async function suspenderContaDenuncia(reportId, sellerName) {
        const { mostrarToast, adicionarLog } = getUtils();
        const justificativa = window.prompt(
            `ATENÇÃO: Deseja suspender a conta de "${sellerName}"?\n\nTodos os anúncios do usuário serão suspensos e a conta ficará bloqueada de acessar a plataforma.\n\nInforme o motivo da suspensão:`,
            'Conta associada a anúncio fraudulento confirmado pela moderação'
        );

        if (justificativa === null) return; // Cancelado

        if (mostrarToast) mostrarToast('Suspendendo conta do vendedor...', 'info');

        try {
            const res = await ItaimApi.reports.suspenderConta(reportId, justificativa, 'SUSPENDED');
            if (mostrarToast) mostrarToast(res.message || 'Conta suspensa com sucesso!', 'success');
            if (adicionarLog) adicionarLog(`Moderação: Conta do vendedor ${sellerName} foi suspensa.`, 'pass');

            await carregarDenunciasModeracao();
            await carregarDadosModeracao();

            if (window.ItaimAdminStatus?.carregarStatusSistema) {
                window.ItaimAdminStatus.carregarStatusSistema();
            }
        } catch (err) {
            if (mostrarToast) mostrarToast(`Erro ao suspender conta: ${err.message}`, 'warn');
            if (adicionarLog) adicionarLog(`Erro ao suspender vendedor da denúncia #${reportId}: ${err.message}`, 'fail');
        }
    }

    /**
     * Ação: Moderador descarta denúncia improcedente
     */
    async function descartarDenuncia(reportId) {
        const { mostrarToast, adicionarLog } = getUtils();
        const justificativa = window.prompt(
            'Deseja descartar esta denúncia como improcedente?\n\nJustificativa da decisão (opcional):',
            'Denúncia improcedente após verificação do anúncio'
        );

        if (justificativa === null) return; // Cancelado

        if (mostrarToast) mostrarToast('Descartando denúncia...', 'info');

        try {
            const res = await ItaimApi.reports.descartarDenuncia(reportId, justificativa);
            if (mostrarToast) mostrarToast(res.message || 'Denúncia descartada com sucesso.', 'success');
            if (adicionarLog) adicionarLog(`Moderação: Denúncia #${reportId} arquivada como improcedente.`, 'pass');

            await carregarDenunciasModeracao();
        } catch (err) {
            if (mostrarToast) mostrarToast(`Erro ao descartar denúncia: ${err.message}`, 'warn');
        }
    }

    /**
     * Carrega a visão geral de dados para moderação rápida de anúncios e usuários
     */
    async function carregarDadosModeracao() {
        const { el } = getUtils();

        // Dispara carregamento das denúncias simultaneamente
        carregarDenunciasModeracao();

        try {
            const res = await ItaimApi.sistema.obterVisaoGeralDados();
            const { products = [], users = [] } = res.data || {};

            if (el?.countModeracaoAds) el.countModeracaoAds.textContent = `${products.length} recentes`;
            if (el?.countModeracaoUsers) el.countModeracaoUsers.textContent = `${users.length} recentes`;

            // Renderiza Anúncios Recentes
            if (el?.listaModeracaoAnuncios) {
                if (products.length === 0) {
                    el.listaModeracaoAnuncios.innerHTML = `<div class="moderacao-empty">Nenhum anúncio cadastrado no momento.</div>`;
                } else {
                    el.listaModeracaoAnuncios.innerHTML = products.map((p) => {
                        const statusClass = (p.status || '').toLowerCase();
                        const isAtivo = p.status === 'ATIVO';
                        const precoFmt = Number(p.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                        return `
                            <div class="moderacao-item" id="mod-ad-${p.id}">
                                <div class="mod-info">
                                    <div class="mod-title" title="${p.title}">${p.title}</div>
                                    <div class="mod-meta">
                                        <span>${precoFmt}</span>
                                        <span>• ${p.category?.name || 'Geral'}</span>
                                        <span>• Por: ${p.seller?.name || 'Vendedor'}</span>
                                        <span class="mod-pill ${statusClass}">${p.status}</span>
                                    </div>
                                </div>
                                <div class="mod-actions">
                                    <button type="button" class="btn-mod-toggle" onclick="window.painelAlternarAnuncio('${p.id}')">
                                        <i class="fa-solid ${isAtivo ? 'fa-pause' : 'fa-play'}"></i> ${isAtivo ? 'Pausar' : 'Ativar'}
                                    </button>
                                </div>
                            </div>
                        `;
                    }).join('');
                }
            }

            // Renderiza Usuários Recentes
            if (el?.listaModeracaoUsuarios) {
                if (users.length === 0) {
                    el.listaModeracaoUsuarios.innerHTML = `<div class="moderacao-empty">Nenhum usuário cadastrado.</div>`;
                } else {
                    el.listaModeracaoUsuarios.innerHTML = users.map((u) => {
                        const statusClass = (u.status || '').toLowerCase();
                        const isActive = u.status === 'ACTIVE';
                        return `
                            <div class="moderacao-item" id="mod-user-${u.id}">
                                <div class="mod-info">
                                    <div class="mod-title">${u.name} <small class="text-muted">(${u.email})</small></div>
                                    <div class="mod-meta">
                                        <span class="mod-pill">${u.role}</span>
                                        <span class="mod-pill ${statusClass}">${u.status}</span>
                                        <span>• ${u._count?.products || 0} anúncio(s)</span>
                                    </div>
                                </div>
                                <div class="mod-actions">
                                    <button type="button" class="btn-mod-toggle" onclick="window.painelAlternarUsuario('${u.id}')">
                                        <i class="fa-solid ${isActive ? 'fa-user-slash' : 'fa-user-check'}"></i> ${isActive ? 'Suspender' : 'Reativar'}
                                    </button>
                                </div>
                            </div>
                        `;
                    }).join('');
                }
            }
        } catch (err) {
            if (el?.listaModeracaoAnuncios) el.listaModeracaoAnuncios.innerHTML = `<div class="moderacao-empty text-red">Erro ao carregar anúncios: ${err.message}</div>`;
            if (el?.listaModeracaoUsuarios) el.listaModeracaoUsuarios.innerHTML = `<div class="moderacao-empty text-red">Erro ao carregar usuários: ${err.message}</div>`;
        }
    }

    /**
     * Alterna status do anúncio (Pausar / Ativar)
     */
    async function alternarStatusProduto(id) {
        const { mostrarToast, adicionarLog } = getUtils();
        if (mostrarToast) mostrarToast('Alterando status do anúncio...', 'info');
        try {
            const res = await ItaimApi.sistema.alternarStatusProduto(id);
            if (mostrarToast) mostrarToast(res.message || 'Status alterado com sucesso!', 'success');
            if (adicionarLog) adicionarLog(`Moderação: Anúncio #${id} agora está ${res.data?.status}`, 'pass');
            carregarDadosModeracao();
            if (window.ItaimAdminStatus?.carregarStatusSistema) {
                window.ItaimAdminStatus.carregarStatusSistema();
            }
        } catch (err) {
            if (mostrarToast) mostrarToast(`Erro ao alterar anúncio: ${err.message}`, 'warn');
        }
    }

    /**
     * Alterna status do usuário (Suspender / Reativar)
     */
    async function alternarStatusUsuario(id) {
        const { mostrarToast, adicionarLog } = getUtils();
        if (mostrarToast) mostrarToast('Alterando status do usuário...', 'info');
        try {
            const res = await ItaimApi.sistema.alternarStatusUsuario(id);
            if (mostrarToast) mostrarToast(res.message || 'Status alterado com sucesso!', 'success');
            if (adicionarLog) adicionarLog(`Moderação: Usuário #${id} agora está ${res.data?.status}`, 'pass');
            carregarDadosModeracao();
            if (window.ItaimAdminStatus?.carregarStatusSistema) {
                window.ItaimAdminStatus.carregarStatusSistema();
            }
        } catch (err) {
            if (mostrarToast) mostrarToast(`Erro ao alterar usuário: ${err.message}`, 'warn');
        }
    }

    // Binds globais chamados diretamente pelas tags inline HTML
    window.painelAlternarAnuncio = alternarStatusProduto;
    window.painelAlternarUsuario = alternarStatusUsuario;
    window.painelFiltrarDenuncias = filtrarDenuncias;
    window.painelRemoverAnuncioDenuncia = removerAnuncioDenuncia;
    window.painelSuspenderContaDenuncia = suspenderContaDenuncia;
    window.painelDescartarDenuncia = descartarDenuncia;

    // Exportação do Módulo
    window.ItaimAdminModeracao = {
        carregarDadosModeracao,
        carregarDenunciasModeracao,
        filtrarDenuncias,
        removerAnuncioDenuncia,
        suspenderContaDenuncia,
        descartarDenuncia,
        alternarStatusProduto,
        alternarStatusUsuario
    };

})();
