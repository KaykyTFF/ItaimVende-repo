/**
 * ITAIM VENDE - PAINEL DE CONTROLE: BANCO DE DADOS, STORAGE E CONSOLE API
 * Arquivo: frontend/js/pages/admin/painel-database-storage.js
 */

(function () {
    'use strict';

    window.ItaimAdminStorage = window.ItaimAdminStorage || {};

    function getUtils() {
        return window.ItaimAdminUtils || {};
    }

    /**
     * Audita a integridade do armazenamento de imagens
     */
    async function auditarStorageAction() {
        const { el, mostrarToast, adicionarLog } = getUtils();
        if (el?.btnAuditarStorage) el.btnAuditarStorage.disabled = true;
        if (mostrarToast) mostrarToast('Auditando integridade das imagens no storage...', 'info');

        try {
            const res = await ItaimApi.sistema.auditarStorage();
            const data = res.data || {};

            if (el?.opStorageDisk) el.opStorageDisk.textContent = `${data.totalFilesOnDisk || 0} arquivos`;
            if (el?.opStorageLinked) el.opStorageLinked.textContent = `${data.referencedCount || 0} fotos ativas`;
            if (el?.opStorageOrphans) el.opStorageOrphans.textContent = `${data.orphanCount || 0} órfãs`;
            if (el?.opStorageFreed) el.opStorageFreed.textContent = `${data.totalOrphanMb || 0} MB`;

            if (el?.btnLimparOrfaos) {
                el.btnLimparOrfaos.disabled = (data.orphanCount === 0);
            }

            if (data.orphanCount > 0) {
                if (mostrarToast) mostrarToast(`Auditoria concluída: ${data.orphanCount} foto(s) órfã(s) encontrada(s) (${data.totalOrphanMb} MB).`, 'warn');
                if (adicionarLog) adicionarLog(`Auditoria de Storage: ${data.orphanCount} arquivos órfãos (${data.totalOrphanMb} MB)`, 'fail');
            } else {
                if (mostrarToast) mostrarToast('Auditoria concluída: O storage está 100% limpo e íntegro!', 'success');
                if (adicionarLog) adicionarLog('Auditoria de Storage: 0 arquivos órfãos detectados', 'pass');
            }
        } catch (err) {
            if (mostrarToast) mostrarToast(`Erro ao auditar storage: ${err.message}`, 'warn');
            if (adicionarLog) adicionarLog(`Erro na auditoria de storage: ${err.message}`, 'fail');
        } finally {
            if (el?.btnAuditarStorage) el.btnAuditarStorage.disabled = false;
        }
    }

    /**
     * Limpa fotos órfãs sem referência no banco
     */
    async function limparStorageAction() {
        const { el, mostrarToast, adicionarLog } = getUtils();
        if (!confirm('Deseja realmente excluir todas as fotos órfãs sem vínculo no banco?')) return;

        if (el?.btnLimparOrfaos) el.btnLimparOrfaos.disabled = true;
        if (mostrarToast) mostrarToast('Excluindo arquivos órfãos com segurança...', 'info');

        try {
            const res = await ItaimApi.sistema.limparStorageOrfaos();
            const data = res.data || {};

            if (mostrarToast) mostrarToast(`Sucesso! ${data.deletedCount} arquivo(s) excluído(s), ${data.freedMb} MB liberados.`, 'success');
            if (adicionarLog) adicionarLog(`Limpeza de Storage executada: ${data.deletedCount} arquivos excluídos (${data.freedMb} MB)`, 'pass');

            // Re-audita e recarrega status
            auditarStorageAction();
            if (window.ItaimAdminStatus?.carregarStatusSistema) {
                window.ItaimAdminStatus.carregarStatusSistema();
            }
        } catch (err) {
            if (mostrarToast) mostrarToast(`Erro ao limpar storage: ${err.message}`, 'warn');
            if (adicionarLog) adicionarLog(`Erro na limpeza de storage: ${err.message}`, 'fail');
            if (el?.btnLimparOrfaos) el.btnLimparOrfaos.disabled = false;
        }
    }

    /**
     * Gera massa de dados de teste (Seed Demo)
     */
    async function seedDemoAction() {
        const { el, mostrarToast, adicionarLog } = getUtils();
        if (el?.btnSeedDemo) el.btnSeedDemo.disabled = true;
        if (mostrarToast) mostrarToast('Criando 3 anúncios demo com categorias oficiais...', 'info');

        try {
            const res = await ItaimApi.sistema.gerarProdutosDemo();
            const data = res.data || {};

            if (mostrarToast) mostrarToast(`${data.count || 3} anúncios criados com sucesso!`, 'success');
            if (adicionarLog) adicionarLog(`Massa de teste gerada: ${data.count} anúncios [DEMO]`, 'pass');

            if (window.ItaimAdminStatus?.carregarStatusSistema) {
                window.ItaimAdminStatus.carregarStatusSistema();
            }
            if (window.ItaimAdminModeracao?.carregarDadosModeracao) {
                window.ItaimAdminModeracao.carregarDadosModeracao();
            }
        } catch (err) {
            if (mostrarToast) mostrarToast(`Erro ao gerar anúncios demo: ${err.message}`, 'warn');
            if (adicionarLog) adicionarLog(`Falha no seed demo: ${err.message}`, 'fail');
        } finally {
            if (el?.btnSeedDemo) el.btnSeedDemo.disabled = false;
        }
    }

    /**
     * Remove todos os anúncios demo cadastrados
     */
    async function cleanDemoAction() {
        const { el, mostrarToast, adicionarLog } = getUtils();
        if (!confirm('Deseja remover todos os anúncios com a tag [DEMO]?')) return;

        if (el?.btnCleanDemo) el.btnCleanDemo.disabled = true;
        if (mostrarToast) mostrarToast('Removendo anúncios de demonstração...', 'info');

        try {
            const res = await ItaimApi.sistema.limparProdutosDemo();
            const data = res.data || {};

            if (mostrarToast) mostrarToast(`${data.deletedCount || 0} anúncio(s) demo removido(s).`, 'info');
            if (adicionarLog) adicionarLog(`Limpeza de dados de teste: ${data.deletedCount} anúncios [DEMO] removidos`, 'pass');

            if (window.ItaimAdminStatus?.carregarStatusSistema) {
                window.ItaimAdminStatus.carregarStatusSistema();
            }
            if (window.ItaimAdminModeracao?.carregarDadosModeracao) {
                window.ItaimAdminModeracao.carregarDadosModeracao();
            }
        } catch (err) {
            if (mostrarToast) mostrarToast(`Erro ao limpar demo: ${err.message}`, 'warn');
            if (adicionarLog) adicionarLog(`Falha na limpeza demo: ${err.message}`, 'fail');
        } finally {
            if (el?.btnCleanDemo) el.btnCleanDemo.disabled = false;
        }
    }

    /**
     * Dispara requisição manual via Console API (Playground)
     */
    async function dispararConsultaManual() {
        const { el, BACKEND_HOST, API_BASE, adicionarLog } = getUtils();
        if (!el) return;

        const metodo = el.consoleMethod?.value || 'GET';
        let endpoint = (el.consoleEndpoint?.value || '').trim();

        if (!endpoint.startsWith('/')) {
            endpoint = '/' + endpoint;
        }

        // Se digitou sem /api, adiciona automaticamente
        const fullUrl = endpoint.startsWith('/api')
            ? `${BACKEND_HOST}${endpoint}`
            : `${API_BASE}${endpoint}`;

        if (el.consoleStatusBadge) {
            el.consoleStatusBadge.textContent = 'Enviando...';
            el.consoleStatusBadge.className = 'output-badge';
        }
        if (el.consoleTimeBadge) el.consoleTimeBadge.textContent = '-- ms';
        if (el.consoleOutputCode) el.consoleOutputCode.textContent = 'Carregando resposta do servidor...';

        const start = performance.now();
        try {
            const token = localStorage.getItem('itaim_token');
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const res = await fetch(fullUrl, {
                method: metodo,
                headers,
            });

            const duration = Math.round(performance.now() - start);
            if (el.consoleTimeBadge) el.consoleTimeBadge.textContent = `${duration} ms`;

            if (el.consoleStatusBadge) {
                el.consoleStatusBadge.textContent = `HTTP ${res.status} ${res.statusText}`;
                el.consoleStatusBadge.className = `output-badge ${res.ok ? 'badge-green' : 'badge-amber'}`;
            }

            const contentType = res.headers.get('content-type') || '';
            let bodyText;

            if (contentType.includes('application/json')) {
                const json = await res.json();
                bodyText = JSON.stringify(json, null, 2);
            } else {
                bodyText = await res.text();
            }

            if (el.consoleOutputCode) el.consoleOutputCode.textContent = bodyText;
            if (adicionarLog) adicionarLog(`Console API [${metodo} ${endpoint}] -> ${res.status} (${duration}ms)`, res.ok ? 'pass' : 'warn');
        } catch (err) {
            const duration = Math.round(performance.now() - start);
            if (el.consoleTimeBadge) el.consoleTimeBadge.textContent = `${duration} ms`;
            if (el.consoleStatusBadge) {
                el.consoleStatusBadge.textContent = 'Erro de Conexão';
                el.consoleStatusBadge.className = 'output-badge badge-red';
            }
            if (el.consoleOutputCode) el.consoleOutputCode.textContent = `Erro na requisição: ${err.message}`;
            if (adicionarLog) adicionarLog(`Console API [${metodo} ${endpoint}] Falha: ${err.message}`, 'fail', duration);
        }
    }

    // Exportação do Módulo
    window.ItaimAdminStorage = {
        auditarStorageAction,
        limparStorageAction,
        seedDemoAction,
        cleanDemoAction,
        dispararConsultaManual
    };

})();
