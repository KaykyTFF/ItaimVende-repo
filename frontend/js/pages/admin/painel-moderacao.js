/**
 * ITAIM VENDE - PAINEL DE CONTROLE: MODERAÇÃO RÁPIDA DE ANÚNCIOS E USUÁRIOS
 * Arquivo: frontend/js/pages/admin/painel-moderacao.js
 */

(function () {
    'use strict';

    window.ItaimAdminModeracao = window.ItaimAdminModeracao || {};

    function getUtils() {
        return window.ItaimAdminUtils || {};
    }

    /**
     * Carrega a visão geral de dados para moderação rápida
     */
    async function carregarDadosModeracao() {
        const { el } = getUtils();
        try {
            const res = await ItaimApi.sistema.obterVisaoGeralDados();
            const { products = [], users = [] } = res.data || {};

            if (el?.countModeracaoAds) el.countModeracaoAds.textContent = `${products.length} recentes`;
            if (el?.countModeracaoUsers) el.countModeracaoUsers.textContent = `${users.length} recentes`;

            // Renderiza Anúncios
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

            // Renderiza Usuários
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

    // Exportação do Módulo
    window.ItaimAdminModeracao = {
        carregarDadosModeracao,
        alternarStatusProduto,
        alternarStatusUsuario
    };

})();
