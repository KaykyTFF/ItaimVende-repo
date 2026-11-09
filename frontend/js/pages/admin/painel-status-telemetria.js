/**
 * ITAIM VENDE - PAINEL DE CONTROLE: STATUS DO SISTEMA E TELEMETRIA
 * Arquivo: frontend/js/pages/admin/painel-status-telemetria.js
 */

(function () {
    'use strict';

    window.ItaimAdminStatus = window.ItaimAdminStatus || {};

    const MAX_PONTOS_TELEMETRIA = 24;
    const historicoTelemetria = [];

    function getUtils() {
        return window.ItaimAdminUtils || {};
    }

    /**
     * Adiciona ponto de telemetria ao gráfico
     */
    function adicionarPontoTelemetria(latenciaMs, heapMb) {
        historicoTelemetria.push({
            latencia: Math.max(0, Number(latenciaMs) || 0),
            heap: Math.max(0, Number(heapMb) || 0),
            timestamp: Date.now()
        });

        if (historicoTelemetria.length > MAX_PONTOS_TELEMETRIA) {
            historicoTelemetria.shift();
        }

        desenharGraficoTelemetria();
    }

    /**
     * Desenha o gráfico de telemetria em Canvas Sparkline
     */
    function desenharGraficoTelemetria() {
        const { el } = getUtils();
        const canvas = el?.canvasChart;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        const width = rect.width || canvas.width || 480;
        const height = rect.height || canvas.height || 65;

        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);

        // Limpa fundo
        ctx.clearRect(0, 0, width, height);

        // Linhas de grade sutis
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, height * 0.33); ctx.lineTo(width, height * 0.33);
        ctx.moveTo(0, height * 0.66); ctx.lineTo(width, height * 0.66);
        ctx.stroke();

        if (historicoTelemetria.length < 2) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.font = '11px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Aguardando leituras de telemetria...', width / 2, height / 2 + 4);
            return;
        }

        const maxLat = Math.max(...historicoTelemetria.map(p => p.latencia), 100);
        const maxHeap = Math.max(...historicoTelemetria.map(p => p.heap), 50);

        const stepX = width / (MAX_PONTOS_TELEMETRIA - 1);
        const offsetX = (MAX_PONTOS_TELEMETRIA - historicoTelemetria.length) * stepX;

        // 1. Desenha Linha de Latência (Ciano / Azul Céu #38bdf8)
        ctx.beginPath();
        historicoTelemetria.forEach((p, i) => {
            const x = offsetX + i * stepX;
            const y = height - (p.latencia / maxLat) * (height - 18) - 9;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });

        // Preenchimento gradiente latência
        const gradLat = ctx.createLinearGradient(0, 0, 0, height);
        gradLat.addColorStop(0, 'rgba(56, 189, 248, 0.22)');
        gradLat.addColorStop(1, 'rgba(56, 189, 248, 0.0)');

        ctx.save();
        ctx.lineTo(offsetX + (historicoTelemetria.length - 1) * stepX, height);
        ctx.lineTo(offsetX, height);
        ctx.closePath();
        ctx.fillStyle = gradLat;
        ctx.fill();
        ctx.restore();

        // Linha principal da latência
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 2. Desenha Linha de Memória Heap (Roxo / Lavanda #c084fc)
        ctx.beginPath();
        historicoTelemetria.forEach((p, i) => {
            const x = offsetX + i * stepX;
            const y = height - (p.heap / maxHeap) * (height - 18) - 9;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 3]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Legenda e Últimos Valores no topo
        const ult = historicoTelemetria[historicoTelemetria.length - 1];
        ctx.font = '10px monospace';
        ctx.textAlign = 'right';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText(`• Latência: ${ult.latencia}ms`, width - 120, 14);
        ctx.fillStyle = '#c084fc';
        ctx.fillText(`• Heap: ${ult.heap}MB`, width - 10, 14);
    }

    /**
     * Carrega os dados de status e métricas do sistema
     */
    async function carregarStatusSistema() {
        const { el, API_BASE, setUltimoRelatorio, adicionarLog, obterHeadersAdmin } = getUtils();
        if (el?.iconRefresh) el.iconRefresh.classList.add('fa-spin');

        const inicio = performance.now();
        try {
            const headers = obterHeadersAdmin ? obterHeadersAdmin() : {};
            headers['Cache-Control'] = 'no-cache';
            const res = await fetch(`${API_BASE}/system/status`, {
                cache: 'no-store',
                headers
            });

            const duracao = Math.round(performance.now() - inicio);
            if (el?.statClientLatency) el.statClientLatency.textContent = `${duracao} ms`;

            if (!res.ok) {
                throw new Error(`Servidor respondeu com HTTP ${res.status}`);
            }

            const json = await res.json();
            const data = json.data || {};
            if (setUltimoRelatorio) setUltimoRelatorio(data);

            atualizarInterfaceStatus(data, duracao);
            if (adicionarLog) adicionarLog('Status do sistema atualizado com sucesso', 'pass', duracao);
        } catch (error) {
            atualizarInterfaceErro(error.message);
            if (adicionarLog) adicionarLog(`Erro ao obter status: ${error.message}`, 'fail');
        } finally {
            if (el?.iconRefresh) el.iconRefresh.classList.remove('fa-spin');
        }
    }

    /**
     * Atualiza a interface gráfica com os dados reais recebidos
     */
    function atualizarInterfaceStatus(data, clientLatencyMs) {
        const { el } = getUtils();
        if (!el) return;
        const { server = {}, database = {}, storage = {} } = data;

        // Hero Status
        const dbOk = database.status === 'online';
        const storageOk = storage.status === 'online';
        const isHealthy = dbOk && storageOk;

        if (el.heroPulseDot) {
            el.heroPulseDot.className = `status-pulse-dot ${isHealthy ? '' : (dbOk ? 'warning' : 'critical')}`;
        }

        if (el.heroStatusText) {
            el.heroStatusText.textContent = isHealthy
                ? 'Todos os Sistemas Operacionais'
                : (dbOk ? 'Alerta: Armazenamento Parcial' : 'Atenção: Banco Desconectado');
        }

        if (el.heroStatusDesc) {
            el.heroStatusDesc.textContent = `Backend ativo na porta ${server.port || 3000} • Uptime: ${server.uptimeFormatted || '0s'} • Boot ID: ${server.bootId || 'N/A'}`;
        }

        // Métricas rápidas do Hero
        if (el.metricDbLatency) el.metricDbLatency.textContent = `${database.latencyMs || 0} ms`;
        if (el.metricUptime) el.metricUptime.textContent = server.uptimeFormatted || '--';
        if (el.metricMemory) el.metricMemory.textContent = `${server.memory?.heapUsedMb || 0} MB`;
        if (el.metricBootId) el.metricBootId.textContent = server.bootId ? server.bootId.substring(0, 16) : '--';

        // Gráfico de Telemetria Dinâmica
        adicionarPontoTelemetria(database.latencyMs || 0, server.memory?.heapUsedMb || 0);

        // Card Banco de Dados
        const stats = database.stats || {};
        if (el.dbBadgeStatus) {
            el.dbBadgeStatus.textContent = dbOk ? 'Prisma Conectado' : 'Erro DB';
            el.dbBadgeStatus.className = `stat-badge ${dbOk ? 'badge-green' : 'badge-red'}`;
        }
        if (el.statUsersCount) el.statUsersCount.textContent = `${stats.users || 0} (${stats.verifiedUsers || 0} verificados)`;
        if (el.statActiveProducts) el.statActiveProducts.textContent = stats.activeProducts || 0;
        if (el.statTotalProducts) el.statTotalProducts.textContent = stats.products || 0;
        if (el.statCategoriesCount) el.statCategoriesCount.textContent = `${stats.categories || 0} categorias`;
        if (el.statChatCount) el.statChatCount.textContent = `${stats.conversations || 0} conversas (${stats.messages || 0} msgs)`;
        if (el.statOrdersCount) el.statOrdersCount.textContent = `${stats.orders || 0} pedidos`;
        if (el.dbLatencyNote) el.dbLatencyNote.textContent = `Latência Query: ${database.latencyMs || 0}ms`;

        // Card Armazenamento
        const folders = storage.folders || {};
        if (el.statFilesPerfil) el.statFilesPerfil.textContent = folders.perfil?.count || 0;
        if (el.statFilesVendas) el.statFilesVendas.textContent = folders.vendas?.count || 0;
        if (el.statFilesTotal) el.statFilesTotal.textContent = `${storage.totalFiles || 0} arquivos`;
        if (el.statSizeTotal) el.statSizeTotal.textContent = `${storage.totalSizeMb || '0.00'} MB`;

        const writable = Boolean(folders.perfil?.writable && folders.vendas?.writable);
        if (el.statStorageWritable) {
            el.statStorageWritable.textContent = writable ? 'Leitura & Escrita OK' : 'Bloqueado';
            el.statStorageWritable.className = writable ? 'text-green' : 'text-red';
        }
        if (el.storageBadgeStatus) {
            el.storageBadgeStatus.textContent = writable ? 'Permissão Total' : 'Sem Permissão';
            el.storageBadgeStatus.className = `stat-badge ${writable ? 'badge-green' : 'badge-red'}`;
        }

        // Card Runtime / Servidor
        if (el.nodeBadgeVersion) el.nodeBadgeVersion.textContent = server.nodeVersion || 'Node.js';
        if (el.statPort) el.statPort.textContent = server.port || 3000;
        if (el.statPlatform) el.statPlatform.textContent = `${server.platform} (${server.arch})`;
        if (el.statPid) el.statPid.textContent = server.pid || '--';
        if (el.statMemRss) el.statMemRss.textContent = `${server.memory?.rssMb || 0} MB`;
        if (el.statCors) el.statCors.textContent = server.corsOrigin || '*';
        if (el.serverUptimeNote) el.serverUptimeNote.textContent = `Iniciado: ${server.uptimeFormatted} atrás`;

        // Badge de Ambiente
        if (el.badgeEnv) {
            el.badgeEnv.textContent = (server.environment || 'DEV').toUpperCase();
        }
    }

    /**
     * Atualiza a tela em caso de falha de conexão com o servidor
     */
    function atualizarInterfaceErro(msg) {
        const { el, API_BASE } = getUtils();
        if (!el) return;
        if (el.heroPulseDot) el.heroPulseDot.className = 'status-pulse-dot critical';
        if (el.heroStatusText) el.heroStatusText.textContent = 'Servidor Inacessível ou Offline';
        if (el.heroStatusDesc) el.heroStatusDesc.textContent = `Não foi possível contatar ${API_BASE}. Verifique se o backend está ativo na porta 3000.`;
        if (el.dbBadgeStatus) {
            el.dbBadgeStatus.textContent = 'Desconectado';
            el.dbBadgeStatus.className = 'stat-badge badge-red';
        }
        if (el.statClientLatency) el.statClientLatency.textContent = 'Timeout / Erro';
    }

    // Exportação do Módulo
    window.ItaimAdminStatus = {
        adicionarPontoTelemetria,
        desenharGraficoTelemetria,
        carregarStatusSistema,
        atualizarInterfaceStatus,
        atualizarInterfaceErro
    };

})();
