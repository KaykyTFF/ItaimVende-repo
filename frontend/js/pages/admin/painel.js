/**
 * ITAIM VENDE - CONTROLADOR DO PAINEL DE CONTROLE & OBSERVABILIDADE
 * Gerencia diagnóstico em tempo real, matriz de integridade e console de testes.
 */

(function () {
    'use strict';

    // Determina a URL base da API
    const BACKEND_HOST = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://localhost:3000'
        : '';
    const API_BASE = window.ITAI_API_URL || `${BACKEND_HOST}/api`;

    let refreshTimer = null;
    let ultimoRelatorio = null;

    // Elementos da UI
    const el = {
        badgeEnv: document.getElementById('badge-env'),
        badgeTunnel: document.getElementById('badge-tunnel'),
        tunnelText: document.getElementById('tunnel-text'),
        btnAtualizar: document.getElementById('btn-atualizar-status'),
        iconRefresh: document.getElementById('icon-refresh'),
        btnExecutar: document.getElementById('btn-executar-diagnostico'),
        btnCopiar: document.getElementById('btn-copiar-relatorio'),
        selectRefresh: document.getElementById('select-refresh'),

        // Hero
        heroPulseRing: document.getElementById('hero-pulse-ring'),
        heroPulseDot: document.getElementById('hero-pulse-dot'),
        heroStatusText: document.getElementById('hero-status-text'),
        heroStatusDesc: document.getElementById('hero-status-subtext'),
        metricDbLatency: document.getElementById('metric-db-latency'),
        metricUptime: document.getElementById('metric-uptime'),
        metricMemory: document.getElementById('metric-memory'),
        metricBootId: document.getElementById('metric-boot-id'),

        // Card DB
        dbBadgeStatus: document.getElementById('db-badge-status'),
        statUsersCount: document.getElementById('stat-users-count'),
        statActiveProducts: document.getElementById('stat-active-products'),
        statTotalProducts: document.getElementById('stat-total-products'),
        statCategoriesCount: document.getElementById('stat-categories-count'),
        statChatCount: document.getElementById('stat-chat-count'),
        statOrdersCount: document.getElementById('stat-orders-count'),
        dbLatencyNote: document.getElementById('db-latency-note'),
        btnTestarDb: document.getElementById('btn-testar-db'),

        // Card Storage
        storageBadgeStatus: document.getElementById('storage-badge-status'),
        statFilesPerfil: document.getElementById('stat-files-perfil'),
        statFilesVendas: document.getElementById('stat-files-vendas'),
        statFilesTotal: document.getElementById('stat-files-total'),
        statSizeTotal: document.getElementById('stat-size-total'),
        statStorageWritable: document.getElementById('stat-storage-writable'),
        btnTestarStorage: document.getElementById('btn-testar-storage'),

        // Card Runtime
        nodeBadgeVersion: document.getElementById('node-badge-version'),
        statPort: document.getElementById('stat-port'),
        statPlatform: document.getElementById('stat-platform'),
        statPid: document.getElementById('stat-pid'),
        statMemRss: document.getElementById('stat-mem-rss'),
        statCors: document.getElementById('stat-cors'),
        serverUptimeNote: document.getElementById('server-uptime-note'),
        btnTestarHealth: document.getElementById('btn-testar-health'),

        // Card Rede
        networkBadgeType: document.getElementById('network-badge-type'),
        statHostName: document.getElementById('stat-host-name'),
        statProtocol: document.getElementById('stat-protocol'),
        statClientLatency: document.getElementById('stat-client-latency'),
        statTunnelState: document.getElementById('stat-tunnel-state'),
        statApiBase: document.getElementById('stat-api-base'),
        btnTestarRede: document.getElementById('btn-testar-rede'),

        // Matriz de Testes
        btnRodarMatriz: document.getElementById('btn-rodar-matriz'),
        tbodyTestes: document.getElementById('tbody-testes'),

        // Console Manual
        formConsole: document.getElementById('form-console-api'),
        consoleMethod: document.getElementById('console-method'),
        consoleEndpoint: document.getElementById('console-endpoint'),
        consoleStatusBadge: document.getElementById('console-status-badge'),
        consoleTimeBadge: document.getElementById('console-time-badge'),
        consoleOutputCode: document.getElementById('console-output-code'),

        // Logs
        logsFeed: document.getElementById('logs-feed'),
        btnLimparLogs: document.getElementById('btn-limpar-logs'),

        // Toast
        toast: document.getElementById('painel-toast'),

        // Seção Cloudflare Tunnel
        btnHeaderTunnel: document.getElementById('btn-header-tunnel'),
        btnHeaderTunnelText: document.getElementById('btn-header-tunnel-text'),
        btnIniciarTunnel: document.getElementById('btn-iniciar-tunnel'),
        textIniciarTunnel: document.getElementById('text-iniciar-tunnel'),
        btnDesligarTunnel: document.getElementById('btn-desligar-tunnel'),
        inputTunnelUrl: document.getElementById('input-tunnel-url'),
        btnCopiarTunnelUrl: document.getElementById('btn-copiar-tunnel-url'),
        btnAbrirTunnel: document.getElementById('btn-abrir-tunnel'),
        btnQrcodeTunnel: document.getElementById('btn-qrcode-tunnel'),
        btnTestarTunnelLink: document.getElementById('btn-testar-tunnel-link'),
        tunnelStatusIcon: document.getElementById('tunnel-status-icon'),
        tunnelBadgeState: document.getElementById('tunnel-badge-state'),
        modalQrcode: document.getElementById('modal-qrcode-tunnel'),
        imgQrcode: document.getElementById('img-qrcode'),
        qrcodeUrlText: document.getElementById('qrcode-url-text'),
        btnFecharQrcode: document.getElementById('btn-fechar-qrcode'),

        // Gráfico de Telemetria Dinâmica
        canvasChart: document.getElementById('canvas-telemetry-chart'),

        // Operações & Manutenção
        opStorageDisk: document.getElementById('op-storage-disk'),
        opStorageLinked: document.getElementById('op-storage-linked'),
        opStorageOrphans: document.getElementById('op-storage-orphans'),
        opStorageFreed: document.getElementById('op-storage-freed'),
        btnAuditarStorage: document.getElementById('btn-auditar-storage'),
        btnLimparOrfaos: document.getElementById('btn-limpar-orfaos'),
        btnSeedDemo: document.getElementById('btn-seed-demo'),
        btnCleanDemo: document.getElementById('btn-clean-demo'),

        // Central de Moderação Rápida
        countModeracaoAds: document.getElementById('count-moderacao-ads'),
        countModeracaoUsers: document.getElementById('count-moderacao-users'),
        listaModeracaoAnuncios: document.getElementById('lista-moderacao-anuncios'),
        listaModeracaoUsuarios: document.getElementById('lista-moderacao-usuarios'),
        btnAtualizarModeracao: document.getElementById('btn-atualizar-moderacao'),
    };

    /**
     * Exibe notificação temporária no painel
     */
    function mostrarToast(mensagem, tipo = 'info') {
        if (!el.toast) return;
        el.toast.textContent = mensagem;
        el.toast.className = `painel-toast visible ${tipo}`;
        setTimeout(() => {
            el.toast.className = 'painel-toast';
        }, 3200);
    }

    /**
     * Adiciona registro ao feed de logs visual
     */
    function adicionarLog(mensagem, status = 'pass', duracaoMs = null) {
        if (!el.logsFeed) return;
        const now = new Date();
        const hora = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');

        const item = document.createElement('div');
        item.className = `log-entry ${status}`;
        item.innerHTML = `
            <div class="log-left">
                <span class="log-time">[${hora}]</span>
                <span class="log-text">${mensagem}</span>
            </div>
            ${duracaoMs !== null ? `<span class="log-duration">${duracaoMs}ms</span>` : ''}
        `;

        el.logsFeed.prepend(item);

        // Limita a 50 logs na tela
        while (el.logsFeed.children.length > 50) {
            el.logsFeed.removeChild(el.logsFeed.lastChild);
        }
    }

    /**
     * Detecta o ambiente de conexão (Localhost vs Túnel Cloudflare)
     */
    function detectarAmbienteRede() {
        const host = window.location.hostname;
        const protocol = window.location.protocol.replace(':', '').toUpperCase();

        if (el.statHostName) el.statHostName.textContent = host;
        if (el.statProtocol) el.statProtocol.textContent = protocol;
        if (el.statApiBase) el.statApiBase.textContent = API_BASE;

        const isTunnel = host.includes('trycloudflare.com') || host.includes('cloudflare') || host.includes('loca.lt') || host.includes('ngrok');

        if (isTunnel) {
            if (el.tunnelText) el.tunnelText.textContent = 'Túnel Cloudflare Ativo';
            if (el.badgeTunnel) el.badgeTunnel.className = 'badge-tunnel badge-green';
            if (el.statTunnelState) el.statTunnelState.textContent = 'Conectado via Quick Tunnel';
            if (el.networkBadgeType) el.networkBadgeType.textContent = 'Público / Cloudflare';
        } else {
            if (el.tunnelText) el.tunnelText.textContent = 'Conexão Local (3000)';
            if (el.badgeTunnel) el.badgeTunnel.className = 'badge-tunnel badge-blue';
            if (el.statTunnelState) el.statTunnelState.textContent = 'Rede Local / Loopback';
            if (el.networkBadgeType) el.networkBadgeType.textContent = 'Rede Local';
        }
    }

    /**
     * Carrega os dados de status e métricas do sistema
     */
    async function carregarStatusSistema() {
        if (el.iconRefresh) el.iconRefresh.classList.add('fa-spin');

        const inicio = performance.now();
        try {
            const res = await fetch(`${API_BASE}/system/status`, {
                cache: 'no-store',
                headers: { 'Cache-Control': 'no-cache' }
            });

            const duracao = Math.round(performance.now() - inicio);
            if (el.statClientLatency) el.statClientLatency.textContent = `${duracao} ms`;

            if (!res.ok) {
                throw new Error(`Servidor respondeu com HTTP ${res.status}`);
            }

            const json = await res.json();
            const data = json.data || {};
            ultimoRelatorio = data;

            atualizarInterfaceStatus(data, duracao);
            adicionarLog('Status do sistema atualizado com sucesso', 'pass', duracao);
        } catch (error) {
            atualizarInterfaceErro(error.message);
            adicionarLog(`Erro ao obter status: ${error.message}`, 'fail');
        } finally {
            if (el.iconRefresh) el.iconRefresh.classList.remove('fa-spin');
        }
    }

    /**
     * Atualiza a interface gráfica com os dados reais recebidos
     */
    function atualizarInterfaceStatus(data, clientLatencyMs) {
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
        if (el.heroPulseDot) el.heroPulseDot.className = 'status-pulse-dot critical';
        if (el.heroStatusText) el.heroStatusText.textContent = 'Servidor Inacessível ou Offline';
        if (el.heroStatusDesc) el.heroStatusDesc.textContent = `Não foi possível contatar ${API_BASE}. Verifique se o backend está ativo na porta 3000.`;
        if (el.dbBadgeStatus) {
            el.dbBadgeStatus.textContent = 'Desconectado';
            el.dbBadgeStatus.className = 'stat-badge badge-red';
        }
        if (el.statClientLatency) el.statClientLatency.textContent = 'Timeout / Erro';
    }

    // =========================================================================
    // GERENCIAMENTO DO TÚNEL CLOUDFLARE & PUBLICAÇÃO DO SITE
    // =========================================================================
    let tunnelAtivoUrl = null;

    /**
     * Consulta o status do túnel Cloudflare
     */
    async function carregarStatusTunnel() {
        try {
            const res = await fetch(`${API_BASE}/system/tunnel`, {
                cache: 'no-store',
                headers: { 'Cache-Control': 'no-cache' }
            });
            if (!res.ok) return;
            const json = await res.json();
            const data = json.data || {};
            atualizarInterfaceTunnel(data);
        } catch (err) {
            // Silencioso se backend estiver reiniciando
        }
    }

    /**
     * Atualiza a interface gráfica do túnel
     */
    function atualizarInterfaceTunnel(data) {
        const { running = false, url = null } = data;
        tunnelAtivoUrl = url;

        if (running && url) {
            // Online
            if (el.tunnelBadgeState) {
                el.tunnelBadgeState.className = 'tunnel-pill-badge online';
                el.tunnelBadgeState.innerHTML = '<i class="fa-solid fa-circle-check"></i> Site Online na Nuvem';
            }
            if (el.tunnelStatusIcon) el.tunnelStatusIcon.className = 'tunnel-icon-wrapper active';
            if (el.inputTunnelUrl) el.inputTunnelUrl.value = url;
            if (el.btnIniciarTunnel) {
                el.btnIniciarTunnel.style.display = 'none';
            }
            if (el.btnDesligarTunnel) {
                el.btnDesligarTunnel.style.display = 'inline-flex';
            }
            if (el.btnAbrirTunnel) {
                el.btnAbrirTunnel.style.display = 'inline-flex';
                el.btnAbrirTunnel.href = url;
            }
            if (el.btnQrcodeTunnel) el.btnQrcodeTunnel.style.display = 'inline-flex';
            if (el.btnTestarTunnelLink) el.btnTestarTunnelLink.style.display = 'inline-flex';

            // Top Header Button
            if (el.btnHeaderTunnel) {
                el.btnHeaderTunnel.className = 'btn-painel btn-cloud-tunnel active';
                if (el.btnHeaderTunnelText) el.btnHeaderTunnelText.textContent = 'Site Conectado (Cloud)';
            }
            if (el.badgeTunnel) {
                el.badgeTunnel.className = 'badge-tunnel badge-green';
                if (el.tunnelText) el.tunnelText.textContent = 'Cloudflare: ' + url.replace('https://', '');
            }
        } else {
            // Offline
            if (el.tunnelBadgeState) {
                el.tunnelBadgeState.className = 'tunnel-pill-badge offline';
                el.tunnelBadgeState.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> Túnel Desconectado';
            }
            if (el.tunnelStatusIcon) el.tunnelStatusIcon.className = 'tunnel-icon-wrapper';
            if (el.inputTunnelUrl) el.inputTunnelUrl.value = 'Nenhum link ativo no momento. Clique no botão ao lado para ligar o site.';
            if (el.btnIniciarTunnel) {
                el.btnIniciarTunnel.style.display = 'inline-flex';
                el.btnIniciarTunnel.disabled = false;
                if (el.textIniciarTunnel) el.textIniciarTunnel.textContent = 'Ligar Site & Gerar Link';
            }
            if (el.btnDesligarTunnel) el.btnDesligarTunnel.style.display = 'none';
            if (el.btnAbrirTunnel) el.btnAbrirTunnel.style.display = 'none';
            if (el.btnQrcodeTunnel) el.btnQrcodeTunnel.style.display = 'none';
            if (el.btnTestarTunnelLink) el.btnTestarTunnelLink.style.display = 'none';

            // Top Header Button
            if (el.btnHeaderTunnel) {
                el.btnHeaderTunnel.className = 'btn-painel btn-cloud-tunnel';
                if (el.btnHeaderTunnelText) el.btnHeaderTunnelText.textContent = 'Ligar Site (Cloud)';
            }
        }
    }

    /**
     * Ação de ligar o site e gerar link público
     */
    async function ligarSiteCloudAction() {
        if (el.btnIniciarTunnel) el.btnIniciarTunnel.disabled = true;
        if (el.textIniciarTunnel) el.textIniciarTunnel.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Ligando site na nuvem...';
        if (el.btnHeaderTunnelText) el.btnHeaderTunnelText.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Ligando...';

        mostrarToast('Iniciando Cloudflare Quick Tunnel...', 'info');
        adicionarLog('Iniciando Cloudflare Quick Tunnel na porta 3000...', 'pass');

        const inicio = performance.now();
        try {
            const res = await fetch(`${API_BASE}/system/tunnel/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            const duracao = Math.round(performance.now() - inicio);
            const json = await res.json();

            if (!res.ok || !json.success) {
                throw new Error(json.message || 'Falha ao iniciar túnel');
            }

            const data = json.data || {};
            atualizarInterfaceTunnel(data);

            mostrarToast(`Site ligado com sucesso! Link gerado: ${data.url}`, 'success');
            adicionarLog(`Túnel Cloudflare online: ${data.url}`, 'pass', duracao);

            // Rola suavemente até o card do túnel
            document.getElementById('section-cloud-tunnel')?.scrollIntoView({ behavior: 'smooth' });
        } catch (err) {
            mostrarToast(`Erro ao ligar site: ${err.message}`, 'warn');
            adicionarLog(`Erro ao ligar túnel: ${err.message}`, 'fail');
            carregarStatusTunnel();
        }
    }

    /**
     * Ação de desligar o túnel Cloudflare
     */
    async function desligarTunnelAction() {
        if (el.btnDesligarTunnel) el.btnDesligarTunnel.disabled = true;
        mostrarToast('Desconectando túnel...', 'info');

        try {
            const res = await fetch(`${API_BASE}/system/tunnel/stop`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            const json = await res.json();
            atualizarInterfaceTunnel({ running: false, url: null });
            mostrarToast('Túnel encerrado com sucesso.', 'info');
            adicionarLog('Túnel Cloudflare desconectado pelo operador', 'pass');
        } catch (err) {
            mostrarToast(`Erro ao encerrar túnel: ${err.message}`, 'warn');
        } finally {
            if (el.btnDesligarTunnel) el.btnDesligarTunnel.disabled = false;
        }
    }

    /**
     * Abre modal de QR Code para leitura no celular
     */
    function abrirModalQrcode() {
        if (!tunnelAtivoUrl) {
            mostrarToast('Nenhum link ativo no momento.', 'warn');
            return;
        }

        const qrApi = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(tunnelAtivoUrl)}`;
        if (el.imgQrcode) el.imgQrcode.src = qrApi;
        if (el.qrcodeUrlText) el.qrcodeUrlText.textContent = tunnelAtivoUrl;
        if (el.modalQrcode) el.modalQrcode.style.display = 'flex';
        adicionarLog('QR Code para smartphone exibido na tela', 'pass');
    }

    function fecharModalQrcode() {
        if (el.modalQrcode) el.modalQrcode.style.display = 'none';
    }

    /**
     * Testa conectividade do link gerado
     */
    async function testarLinkTunnel() {
        if (!tunnelAtivoUrl) return;
        mostrarToast('Testando resposta do link na nuvem...', 'info');
        const start = performance.now();
        try {
            const res = await fetch(`${tunnelAtivoUrl}/api/health`, { cache: 'no-store' });
            const dur = Math.round(performance.now() - start);
            if (res.ok) {
                mostrarToast(`Link público 100% acessível! (${dur}ms)`, 'success');
                adicionarLog(`Teste do link público [${tunnelAtivoUrl}/api/health]: 200 OK (${dur}ms)`, 'pass', dur);
            } else {
                mostrarToast(`Resposta inesperada: HTTP ${res.status}`, 'warn');
            }
        } catch (err) {
            mostrarToast(`Não foi possível acessar via túnel: ${err.message}`, 'warn');
            adicionarLog(`Falha no teste do túnel: ${err.message}`, 'fail');
        }
    }

    // =========================================================================
    // MOTOR DO GRÁFICO DE TELEMETRIA AO VIVO (CANVAS SPARKLINE)
    // =========================================================================
    const MAX_PONTOS_TELEMETRIA = 24;
    const historicoTelemetria = [];

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

    function desenharGraficoTelemetria() {
        const canvas = el.canvasChart;
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

    // =========================================================================
    // OPERAÇÕES DE MANUTENÇÃO (STORAGE CLEANUP & SEED DEMO)
    // =========================================================================
    async function auditarStorageAction() {
        if (el.btnAuditarStorage) el.btnAuditarStorage.disabled = true;
        mostrarToast('Auditando integridade das imagens no storage...', 'info');

        try {
            const res = await ItaimApi.sistema.auditarStorage();
            const data = res.data || {};

            if (el.opStorageDisk) el.opStorageDisk.textContent = `${data.totalFilesOnDisk || 0} arquivos`;
            if (el.opStorageLinked) el.opStorageLinked.textContent = `${data.referencedCount || 0} fotos ativas`;
            if (el.opStorageOrphans) el.opStorageOrphans.textContent = `${data.orphanCount || 0} órfãs`;
            if (el.opStorageFreed) el.opStorageFreed.textContent = `${data.totalOrphanMb || 0} MB`;

            if (el.btnLimparOrfaos) {
                el.btnLimparOrfaos.disabled = (data.orphanCount === 0);
            }

            if (data.orphanCount > 0) {
                mostrarToast(`Auditoria concluída: ${data.orphanCount} foto(s) órfã(s) encontrada(s) (${data.totalOrphanMb} MB).`, 'warn');
                adicionarLog(`Auditoria de Storage: ${data.orphanCount} arquivos órfãos (${data.totalOrphanMb} MB)`, 'fail');
            } else {
                mostrarToast('Auditoria concluída: O storage está 100% limpo e íntegro!', 'success');
                adicionarLog('Auditoria de Storage: 0 arquivos órfãos detectados', 'pass');
            }
        } catch (err) {
            mostrarToast(`Erro ao auditar storage: ${err.message}`, 'warn');
            adicionarLog(`Erro na auditoria de storage: ${err.message}`, 'fail');
        } finally {
            if (el.btnAuditarStorage) el.btnAuditarStorage.disabled = false;
        }
    }

    async function limparStorageAction() {
        if (!confirm('Deseja realmente excluir todas as fotos órfãs sem vínculo no banco?')) return;

        if (el.btnLimparOrfaos) el.btnLimparOrfaos.disabled = true;
        mostrarToast('Excluindo arquivos órfãos com segurança...', 'info');

        try {
            const res = await ItaimApi.sistema.limparStorageOrfaos();
            const data = res.data || {};

            mostrarToast(`Sucesso! ${data.deletedCount} arquivo(s) excluído(s), ${data.freedMb} MB liberados.`, 'success');
            adicionarLog(`Limpeza de Storage executada: ${data.deletedCount} arquivos excluídos (${data.freedMb} MB)`, 'pass');

            // Re-audita
            auditarStorageAction();
            carregarStatusSistema();
        } catch (err) {
            mostrarToast(`Erro ao limpar storage: ${err.message}`, 'warn');
            adicionarLog(`Erro na limpeza de storage: ${err.message}`, 'fail');
            if (el.btnLimparOrfaos) el.btnLimparOrfaos.disabled = false;
        }
    }

    async function seedDemoAction() {
        if (el.btnSeedDemo) el.btnSeedDemo.disabled = true;
        mostrarToast('Criando 3 anúncios demo com categorias oficiais...', 'info');

        try {
            const res = await ItaimApi.sistema.gerarProdutosDemo();
            const data = res.data || {};

            mostrarToast(`${data.count || 3} anúncios criados com sucesso!`, 'success');
            adicionarLog(`Massa de teste gerada: ${data.count} anúncios [DEMO]`, 'pass');

            carregarStatusSistema();
            carregarDadosModeracao();
        } catch (err) {
            mostrarToast(`Erro ao gerar anúncios demo: ${err.message}`, 'warn');
            adicionarLog(`Falha no seed demo: ${err.message}`, 'fail');
        } finally {
            if (el.btnSeedDemo) el.btnSeedDemo.disabled = false;
        }
    }

    async function cleanDemoAction() {
        if (!confirm('Deseja remover todos os anúncios com a tag [DEMO]?')) return;

        if (el.btnCleanDemo) el.btnCleanDemo.disabled = true;
        mostrarToast('Removendo anúncios de demonstração...', 'info');

        try {
            const res = await ItaimApi.sistema.limparProdutosDemo();
            const data = res.data || {};

            mostrarToast(`${data.deletedCount || 0} anúncio(s) demo removido(s).`, 'info');
            adicionarLog(`Limpeza de dados de teste: ${data.deletedCount} anúncios [DEMO] removidos`, 'pass');

            carregarStatusSistema();
            carregarDadosModeracao();
        } catch (err) {
            mostrarToast(`Erro ao limpar demo: ${err.message}`, 'warn');
            adicionarLog(`Falha na limpeza demo: ${err.message}`, 'fail');
        } finally {
            if (el.btnCleanDemo) el.btnCleanDemo.disabled = false;
        }
    }

    // =========================================================================
    // CENTRAL DE MODERAÇÃO RÁPIDA (ÚLTIMOS ANÚNCIOS & USUÁRIOS)
    // =========================================================================
    async function carregarDadosModeracao() {
        try {
            const res = await ItaimApi.sistema.obterVisaoGeralDados();
            const { products = [], users = [] } = res.data || {};

            if (el.countModeracaoAds) el.countModeracaoAds.textContent = `${products.length} recentes`;
            if (el.countModeracaoUsers) el.countModeracaoUsers.textContent = `${users.length} recentes`;

            // Renderiza Anúncios
            if (el.listaModeracaoAnuncios) {
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
            if (el.listaModeracaoUsuarios) {
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
            if (el.listaModeracaoAnuncios) el.listaModeracaoAnuncios.innerHTML = `<div class="moderacao-empty text-red">Erro ao carregar anúncios: ${err.message}</div>`;
            if (el.listaModeracaoUsuarios) el.listaModeracaoUsuarios.innerHTML = `<div class="moderacao-empty text-red">Erro ao carregar usuários: ${err.message}</div>`;
        }
    }

    // Handlers globais de clique chamados pelo onclick inline
    window.painelAlternarAnuncio = async (id) => {
        mostrarToast('Alterando status do anúncio...', 'info');
        try {
            const res = await ItaimApi.sistema.alternarStatusProduto(id);
            mostrarToast(res.message || 'Status alterado com sucesso!', 'success');
            adicionarLog(`Moderação: Anúncio #${id} agora está ${res.data?.status}`, 'pass');
            carregarDadosModeracao();
            carregarStatusSistema();
        } catch (err) {
            mostrarToast(`Erro ao alterar anúncio: ${err.message}`, 'warn');
        }
    };

    window.painelAlternarUsuario = async (id) => {
        mostrarToast('Alterando status do usuário...', 'info');
        try {
            const res = await ItaimApi.sistema.alternarStatusUsuario(id);
            mostrarToast(res.message || 'Status alterado com sucesso!', 'success');
            adicionarLog(`Moderação: Usuário #${id} agora está ${res.data?.status}`, 'pass');
            carregarDadosModeracao();
            carregarStatusSistema();
        } catch (err) {
            mostrarToast(`Erro ao alterar usuário: ${err.message}`, 'warn');
        }
    };

    // =========================================================================
    // MATRIZ COMPLETA DE TESTES DE INTEGRIDADE
    // =========================================================================
    const MODULOS_TESTE = [
        {
            id: 'health',
            nome: 'Servidor HTTP & Healthcheck',
            icone: 'fa-server',
            endpoint: '/health',
            metodo: 'GET',
            esperado: 200,
        },
        {
            id: 'system_status',
            nome: 'Telemetria do Sistema & Métricas',
            icone: 'fa-chart-line',
            endpoint: '/system/status',
            metodo: 'GET',
            esperado: 200,
        },
        {
            id: 'categories',
            nome: 'Catálogo de Categorias Oficiais',
            icone: 'fa-tags',
            endpoint: '/categories',
            metodo: 'GET',
            esperado: 200,
        },
        {
            id: 'products',
            nome: 'Vitrine de Produtos & Busca Paginada',
            icone: 'fa-bag-shopping',
            endpoint: '/products?page=1&limit=2',
            metodo: 'GET',
            esperado: 200,
        },
        {
            id: 'auth_validate',
            nome: 'Segurança de Autenticação & Validação',
            icone: 'fa-shield-halved',
            endpoint: '/auth/login',
            metodo: 'POST',
            corpo: { email: 'invalid@email.com', password: 'wrong' },
            esperado: 401, // 401 esperado por credenciais incorretas (rota viva)
        },
        {
            id: 'chat_guard',
            nome: 'Proteção de Conversas do Chat (JWT Guard)',
            icone: 'fa-comments',
            endpoint: '/chat/conversations',
            metodo: 'GET',
            esperado: 401, // 401 esperado para requisição sem token
        },
        {
            id: 'favorites_guard',
            nome: 'Proteção de Favoritos (JWT Guard)',
            icone: 'fa-heart',
            endpoint: '/favorites',
            metodo: 'GET',
            esperado: 401,
        },
        {
            id: 'orders_guard',
            nome: 'Proteção de Checkout e Pedidos (JWT Guard)',
            icone: 'fa-receipt',
            endpoint: '/orders',
            metodo: 'GET',
            esperado: 401,
        },
        {
            id: 'reviews',
            nome: 'Módulo de Avaliações e Reputação',
            icone: 'fa-star',
            endpoint: '/reviews/vendedor/check_availability',
            metodo: 'GET',
            esperado: [200, 404],
        },
        {
            id: 'uploads_storage',
            nome: 'Acesso Estático a Fotos de Produtos',
            icone: 'fa-image',
            endpoint: '/../uploads/vendas/nonexistent.jpg',
            metodo: 'GET',
            esperado: [200, 404], // 200 se retornar placeholder SVG ou 404
        }
    ];

    /**
     * Renderiza o esqueleto inicial da tabela de testes
     */
    function renderizarTabelaTestes() {
        if (!el.tbodyTestes) return;

        el.tbodyTestes.innerHTML = MODULOS_TESTE.map((m) => `
            <tr id="test-row-${m.id}">
                <td>
                    <div class="module-title-cell">
                        <span class="module-icon"><i class="fa-solid ${m.icone}"></i></span>
                        <span>${m.nome}</span>
                    </div>
                </td>
                <td><span class="endpoint-tag">${m.metodo} /api${m.endpoint.replace('/..', '')}</span></td>
                <td><span class="status-cell-badge loading" id="status-badge-${m.id}"><i class="fa-solid fa-circle-notch fa-spin"></i> Pronto</span></td>
                <td class="code-font" id="time-cell-${m.id}">-- ms</td>
                <td id="desc-cell-${m.id}">Aguardando teste...</td>
                <td class="text-right">
                    <button class="btn-test-row" data-test-id="${m.id}"><i class="fa-solid fa-play"></i> Testar</button>
                </td>
            </tr>
        `).join('');

        // Vincula cliques aos botões individuais
        el.tbodyTestes.querySelectorAll('.btn-test-row').forEach((btn) => {
            btn.addEventListener('click', () => {
                const testId = btn.getAttribute('data-test-id');
                const testDef = MODULOS_TESTE.find((x) => x.id === testId);
                if (testDef) executarTesteIndividual(testDef);
            });
        });
    }

    /**
     * Executa um teste individual e atualiza sua linha na tabela
     */
    async function executarTesteIndividual(m) {
        const row = document.getElementById(`test-row-${m.id}`);
        const badge = document.getElementById(`status-badge-${m.id}`);
        const timeCell = document.getElementById(`time-cell-${m.id}`);
        const descCell = document.getElementById(`desc-cell-${m.id}`);

        if (badge) {
            badge.className = 'status-cell-badge loading';
            badge.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Testando...';
        }

        const start = performance.now();
        const url = `${API_BASE}${m.endpoint}`;

        try {
            const options = {
                method: m.metodo,
                cache: 'no-store',
                headers: { 'Content-Type': 'application/json' },
            };
            if (m.corpo) {
                options.body = JSON.stringify(m.corpo);
            }

            const res = await fetch(url, options);
            const duration = Math.round(performance.now() - start);

            if (timeCell) timeCell.textContent = `${duration} ms`;

            const esperados = Array.isArray(m.esperado) ? m.esperado : [m.esperado];
            const passou = esperados.includes(res.status);

            if (passou) {
                if (badge) {
                    badge.className = 'status-cell-badge pass';
                    badge.innerHTML = `<i class="fa-solid fa-check"></i> Operacional (${res.status})`;
                }
                if (descCell) descCell.textContent = `Resposta íntegra em ${duration}ms com código esperado HTTP ${res.status}.`;
                adicionarLog(`[${m.nome}] Teste aprovado: HTTP ${res.status}`, 'pass', duration);
            } else {
                if (badge) {
                    badge.className = 'status-cell-badge warn';
                    badge.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Status ${res.status}`;
                }
                if (descCell) descCell.textContent = `Recebido HTTP ${res.status} (esperava ${esperados.join(' ou ')}).`;
                adicionarLog(`[${m.nome}] Alerta: Código inesperado HTTP ${res.status}`, 'warn', duration);
            }
        } catch (err) {
            const duration = Math.round(performance.now() - start);
            if (timeCell) timeCell.textContent = `${duration} ms`;
            if (badge) {
                badge.className = 'status-cell-badge fail';
                badge.innerHTML = '<i class="fa-solid fa-xmark"></i> Falha';
            }
            if (descCell) descCell.textContent = `Erro de conexão: ${err.message}`;
            adicionarLog(`[${m.nome}] Falha no teste: ${err.message}`, 'fail', duration);
        }
    }

    /**
     * Executa todos os testes da matriz em sequência
     */
    async function executarTodosOsTestes() {
        mostrarToast('Iniciando bateria completa de testes...', 'info');
        adicionarLog('Iniciando bateria automatizada de testes...', 'pass');

        for (const m of MODULOS_TESTE) {
            await executarTesteIndividual(m);
        }

        // Executa também o autodiagnóstico no backend
        try {
            const res = await fetch(`${API_BASE}/system/diagnostics`, { method: 'POST' });
            if (res.ok) {
                const report = await res.json();
                adicionarLog(`Autodiagnóstico concluído: ${report.data?.summary?.passed || 0}/${report.data?.summary?.total || 0} testes aprovados`, 'pass');
            }
        } catch (e) {
            // Ignora
        }

        mostrarToast('Todos os testes foram concluídos!', 'success');
    }

    // =========================================================================
    // CONSOLE DE TESTE MANUAL DE ROTAS (API PLAYGROUND)
    // =========================================================================
    async function dispararConsultaManual() {
        const metodo = el.consoleMethod.value || 'GET';
        let endpoint = (el.consoleEndpoint.value || '').trim();

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
            adicionarLog(`Console API [${metodo} ${endpoint}] -> ${res.status} (${duration}ms)`, res.ok ? 'pass' : 'warn');
        } catch (err) {
            const duration = Math.round(performance.now() - start);
            if (el.consoleTimeBadge) el.consoleTimeBadge.textContent = `${duration} ms`;
            if (el.consoleStatusBadge) {
                el.consoleStatusBadge.textContent = 'Erro de Conexão';
                el.consoleStatusBadge.className = 'output-badge badge-red';
            }
            if (el.consoleOutputCode) el.consoleOutputCode.textContent = `Erro na requisição: ${err.message}`;
            adicionarLog(`Console API [${metodo} ${endpoint}] Falha: ${err.message}`, 'fail', duration);
        }
    }

    // =========================================================================
    // EXPORTAÇÃO DE RELATÓRIO
    // =========================================================================
    async function copiarRelatorio() {
        if (!ultimoRelatorio) {
            await carregarStatusSistema();
        }

        const texto = `
=========================================
RELATÓRIO DE SAÚDE - ITAIM VENDE
Gerado em: ${new Date().toLocaleString()}
Host: ${window.location.href}
=========================================
STATUS GERAL: ${ultimoRelatorio?.status || 'N/A'}
UPTIME: ${ultimoRelatorio?.server?.uptimeFormatted || 'N/A'}
BOOT ID: ${ultimoRelatorio?.server?.bootId || 'N/A'}
PORTA: ${ultimoRelatorio?.server?.port || 3000}
NODE: ${ultimoRelatorio?.server?.nodeVersion || 'N/A'} (${ultimoRelatorio?.server?.platform})
MEMÓRIA HEAP: ${ultimoRelatorio?.server?.memory?.heapUsedMb || 0} MB

--- BANCO DE DADOS ---
STATUS: ${ultimoRelatorio?.database?.status || 'N/A'} (Latência: ${ultimoRelatorio?.database?.latencyMs || 0}ms)
USUÁRIOS: ${ultimoRelatorio?.database?.stats?.users || 0}
PRODUTOS ATIVOS: ${ultimoRelatorio?.database?.stats?.activeProducts || 0} / ${ultimoRelatorio?.database?.stats?.products || 0}
CATEGORIAS: ${ultimoRelatorio?.database?.stats?.categories || 0}
CONVERSAS: ${ultimoRelatorio?.database?.stats?.conversations || 0}
PEDIDOS: ${ultimoRelatorio?.database?.stats?.orders || 0}

--- ARMAZENAMENTO (UPLOADS) ---
STATUS: ${ultimoRelatorio?.storage?.status || 'N/A'}
TOTAL ARQUIVOS: ${ultimoRelatorio?.storage?.totalFiles || 0}
ESPAÇO DISCO: ${ultimoRelatorio?.storage?.totalSizeMb || 0} MB
PASTA PERFIL: ${ultimoRelatorio?.storage?.folders?.perfil?.count || 0} arquivos
PASTA VENDAS: ${ultimoRelatorio?.storage?.folders?.vendas?.count || 0} arquivos
=========================================
`.trim();

        try {
            await navigator.clipboard.writeText(texto);
            mostrarToast('Relatório copiado para a área de transferência!', 'success');
            adicionarLog('Relatório de saúde exportado para clipboard', 'pass');
        } catch {
            mostrarToast('Não foi possível copiar automaticamente.', 'warn');
        }
    }

    // =========================================================================
    // INICIALIZAÇÃO E EVENTOS
    // =========================================================================
    function configurarEventos() {
        // Botão Atualizar
        if (el.btnAtualizar) {
            el.btnAtualizar.addEventListener('click', carregarStatusSistema);
        }

        // Botão Executar Todos os Testes
        if (el.btnExecutar) {
            el.btnExecutar.addEventListener('click', executarTodosOsTestes);
        }
        if (el.btnRodarMatriz) {
            el.btnRodarMatriz.addEventListener('click', executarTodosOsTestes);
        }

        // Botão Copiar Relatório
        if (el.btnCopiar) {
            el.btnCopiar.addEventListener('click', copiarRelatorio);
        }

        // Atalhos de teste nos cards
        if (el.btnTestarDb) {
            el.btnTestarDb.addEventListener('click', () => {
                const t = MODULOS_TESTE.find(x => x.id === 'system_status');
                if (t) executarTesteIndividual(t);
            });
        }
        if (el.btnTestarStorage) {
            el.btnTestarStorage.addEventListener('click', () => {
                const t = MODULOS_TESTE.find(x => x.id === 'uploads_storage');
                if (t) executarTesteIndividual(t);
            });
        }
        if (el.btnTestarHealth) {
            el.btnTestarHealth.addEventListener('click', () => {
                const t = MODULOS_TESTE.find(x => x.id === 'health');
                if (t) executarTesteIndividual(t);
            });
        }
        if (el.btnTestarRede) {
            el.btnTestarRede.addEventListener('click', carregarStatusSistema);
        }

        // Console Manual Form
        if (el.formConsole) {
            el.formConsole.addEventListener('submit', (e) => {
                e.preventDefault();
                dispararConsultaManual();
            });
        }

        // Quick Links do Console
        document.querySelectorAll('.quick-link-btn').forEach((btn) => {
            btn.addEventListener('click', () => {
                const method = btn.getAttribute('data-method') || 'GET';
                const path = btn.getAttribute('data-path') || '';
                if (el.consoleMethod) el.consoleMethod.value = method;
                if (el.consoleEndpoint) el.consoleEndpoint.value = path;
                dispararConsultaManual();
            });
        });

        // Limpar logs
        if (el.btnLimparLogs) {
            el.btnLimparLogs.addEventListener('click', () => {
                if (el.logsFeed) el.logsFeed.innerHTML = '';
                adicionarLog('Logs limpos pelo operador', 'pass');
            });
        }

        // Eventos do Túnel Cloudflare
        if (el.btnIniciarTunnel) {
            el.btnIniciarTunnel.addEventListener('click', ligarSiteCloudAction);
        }
        if (el.btnHeaderTunnel) {
            el.btnHeaderTunnel.addEventListener('click', () => {
                if (tunnelAtivoUrl) {
                    // Se já estiver online, foca na seção do túnel
                    document.getElementById('section-cloud-tunnel')?.scrollIntoView({ behavior: 'smooth' });
                } else {
                    ligarSiteCloudAction();
                }
            });
        }
        if (el.btnDesligarTunnel) {
            el.btnDesligarTunnel.addEventListener('click', desligarTunnelAction);
        }
        if (el.btnCopiarTunnelUrl) {
            el.btnCopiarTunnelUrl.addEventListener('click', async () => {
                if (!tunnelAtivoUrl) return;
                try {
                    await navigator.clipboard.writeText(tunnelAtivoUrl);
                    mostrarToast('Link público copiado com sucesso!', 'success');
                    adicionarLog(`Link ${tunnelAtivoUrl} copiado para clipboard`, 'pass');
                } catch {
                    mostrarToast('Copie manualmente o link selecionado.', 'warn');
                }
            });
        }
        if (el.btnQrcodeTunnel) {
            el.btnQrcodeTunnel.addEventListener('click', abrirModalQrcode);
        }
        if (el.btnFecharQrcode) {
            el.btnFecharQrcode.addEventListener('click', fecharModalQrcode);
        }
        if (el.modalQrcode) {
            el.modalQrcode.addEventListener('click', (e) => {
                if (e.target === el.modalQrcode) fecharModalQrcode();
            });
        }
        if (el.btnTestarTunnelLink) {
            el.btnTestarTunnelLink.addEventListener('click', testarLinkTunnel);
        }

        // Eventos de Operações & Manutenção
        if (el.btnAuditarStorage) {
            el.btnAuditarStorage.addEventListener('click', auditarStorageAction);
        }
        if (el.btnLimparOrfaos) {
            el.btnLimparOrfaos.addEventListener('click', limparStorageAction);
        }
        if (el.btnSeedDemo) {
            el.btnSeedDemo.addEventListener('click', seedDemoAction);
        }
        if (el.btnCleanDemo) {
            el.btnCleanDemo.addEventListener('click', cleanDemoAction);
        }

        // Eventos de Moderação Rápida
        if (el.btnAtualizarModeracao) {
            el.btnAtualizarModeracao.addEventListener('click', carregarDadosModeracao);
        }

        // Seletor de Auto-Refresh
        if (el.selectRefresh) {
            el.selectRefresh.addEventListener('change', () => {
                const segs = parseInt(el.selectRefresh.value, 10);
                if (refreshTimer) clearInterval(refreshTimer);
                if (segs > 0) {
                    refreshTimer = setInterval(() => {
                        carregarStatusSistema();
                        carregarStatusTunnel();
                        carregarDadosModeracao();
                    }, segs * 1000);
                    mostrarToast(`Auto-atualização ativa a cada ${segs}s`, 'info');
                } else {
                    mostrarToast('Auto-atualização pausada', 'info');
                }
            });
        }
    }

    // Inicialização da Página
    document.addEventListener('DOMContentLoaded', () => {
        detectarAmbienteRede();
        renderizarTabelaTestes();
        configurarEventos();

        // Primeira carga de status, túnel, storage e moderação
        carregarStatusSistema();
        carregarStatusTunnel();
        auditarStorageAction();
        carregarDadosModeracao();

        // Dispara auto-teste inicial após 500ms
        setTimeout(() => {
            executarTodosOsTestes();
        }, 600);

        // Inicia auto-refresh padrão (10s)
        refreshTimer = setInterval(() => {
            carregarStatusSistema();
            carregarStatusTunnel();
            carregarDadosModeracao();
        }, 10000);
    });

})();
