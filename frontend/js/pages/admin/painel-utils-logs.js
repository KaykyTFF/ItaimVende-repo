/**
 * ITAIM VENDE - PAINEL DE CONTROLE: UTILITÁRIOS, ELEMENTOS E LOGS
 * Arquivo: frontend/js/pages/admin/painel-utils-logs.js
 */

(function () {
    'use strict';

    window.ItaimAdminUtils = window.ItaimAdminUtils || {};

    const BACKEND_HOST = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://localhost:3000'
        : '';
    const API_BASE = window.ITAI_API_URL || `${BACKEND_HOST}/api`;

    let refreshTimer = null;
    let ultimoRelatorio = null;

    // Elementos da UI mapeados dinamicamente
    const el = {};

    function inicializarElementos() {
        el.badgeEnv = document.getElementById('badge-env');
        el.badgeTunnel = document.getElementById('badge-tunnel');
        el.tunnelText = document.getElementById('tunnel-text');
        el.btnAtualizar = document.getElementById('btn-atualizar-status');
        el.iconRefresh = document.getElementById('icon-refresh');
        el.btnExecutar = document.getElementById('btn-executar-diagnostico');
        el.btnCopiar = document.getElementById('btn-copiar-relatorio');
        el.selectRefresh = document.getElementById('select-refresh');

        // Hero
        el.heroPulseRing = document.getElementById('hero-pulse-ring');
        el.heroPulseDot = document.getElementById('hero-pulse-dot');
        el.heroStatusText = document.getElementById('hero-status-text');
        el.heroStatusDesc = document.getElementById('hero-status-subtext');
        el.metricDbLatency = document.getElementById('metric-db-latency');
        el.metricUptime = document.getElementById('metric-uptime');
        el.metricMemory = document.getElementById('metric-memory');
        el.metricBootId = document.getElementById('metric-boot-id');

        // Card DB
        el.dbBadgeStatus = document.getElementById('db-badge-status');
        el.statUsersCount = document.getElementById('stat-users-count');
        el.statActiveProducts = document.getElementById('stat-active-products');
        el.statTotalProducts = document.getElementById('stat-total-products');
        el.statCategoriesCount = document.getElementById('stat-categories-count');
        el.statChatCount = document.getElementById('stat-chat-count');
        el.statOrdersCount = document.getElementById('stat-orders-count');
        el.dbLatencyNote = document.getElementById('db-latency-note');
        el.btnTestarDb = document.getElementById('btn-testar-db');

        // Card Storage
        el.storageBadgeStatus = document.getElementById('storage-badge-status');
        el.statFilesPerfil = document.getElementById('stat-files-perfil');
        el.statFilesVendas = document.getElementById('stat-files-vendas');
        el.statFilesTotal = document.getElementById('stat-files-total');
        el.statSizeTotal = document.getElementById('stat-size-total');
        el.statStorageWritable = document.getElementById('stat-storage-writable');
        el.btnTestarStorage = document.getElementById('btn-testar-storage');

        // Card Runtime
        el.nodeBadgeVersion = document.getElementById('node-badge-version');
        el.statPort = document.getElementById('stat-port');
        el.statPlatform = document.getElementById('stat-platform');
        el.statPid = document.getElementById('stat-pid');
        el.statMemRss = document.getElementById('stat-mem-rss');
        el.statCors = document.getElementById('stat-cors');
        el.serverUptimeNote = document.getElementById('server-uptime-note');
        el.btnTestarHealth = document.getElementById('btn-testar-health');

        // Card Rede
        el.networkBadgeType = document.getElementById('network-badge-type');
        el.statHostName = document.getElementById('stat-host-name');
        el.statProtocol = document.getElementById('stat-protocol');
        el.statClientLatency = document.getElementById('stat-client-latency');
        el.statTunnelState = document.getElementById('stat-tunnel-state');
        el.statApiBase = document.getElementById('stat-api-base');
        el.btnTestarRede = document.getElementById('btn-testar-rede');

        // Matriz de Testes
        el.btnRodarMatriz = document.getElementById('btn-rodar-matriz');
        el.tbodyTestes = document.getElementById('tbody-testes');

        // Console Manual
        el.formConsole = document.getElementById('form-console-api');
        el.consoleMethod = document.getElementById('console-method');
        el.consoleEndpoint = document.getElementById('console-endpoint');
        el.consoleStatusBadge = document.getElementById('console-status-badge');
        el.consoleTimeBadge = document.getElementById('console-time-badge');
        el.consoleOutputCode = document.getElementById('console-output-code');

        // Logs
        el.logsFeed = document.getElementById('logs-feed');
        el.btnLimparLogs = document.getElementById('btn-limpar-logs');

        // Toast
        el.toast = document.getElementById('painel-toast');

        // Seção Cloudflare Tunnel
        el.btnHeaderTunnel = document.getElementById('btn-header-tunnel');
        el.btnHeaderTunnelText = document.getElementById('btn-header-tunnel-text');
        el.btnIniciarTunnel = document.getElementById('btn-iniciar-tunnel');
        el.textIniciarTunnel = document.getElementById('text-iniciar-tunnel');
        el.btnDesligarTunnel = document.getElementById('btn-desligar-tunnel');
        el.inputTunnelUrl = document.getElementById('input-tunnel-url');
        el.btnCopiarTunnelUrl = document.getElementById('btn-copiar-tunnel-url');
        el.btnAbrirTunnel = document.getElementById('btn-abrir-tunnel');
        el.btnQrcodeTunnel = document.getElementById('btn-qrcode-tunnel');
        el.btnTestarTunnelLink = document.getElementById('btn-testar-tunnel-link');
        el.tunnelStatusIcon = document.getElementById('tunnel-status-icon');
        el.tunnelBadgeState = document.getElementById('tunnel-badge-state');
        el.modalQrcode = document.getElementById('modal-qrcode-tunnel');
        el.imgQrcode = document.getElementById('img-qrcode');
        el.qrcodeUrlText = document.getElementById('qrcode-url-text');
        el.btnFecharQrcode = document.getElementById('btn-fechar-qrcode');

        // Gráfico de Telemetria Dinâmica
        el.canvasChart = document.getElementById('canvas-telemetry-chart');

        // Operações & Manutenção
        el.opStorageDisk = document.getElementById('op-storage-disk');
        el.opStorageLinked = document.getElementById('op-storage-linked');
        el.opStorageOrphans = document.getElementById('op-storage-orphans');
        el.opStorageFreed = document.getElementById('op-storage-freed');
        el.btnAuditarStorage = document.getElementById('btn-auditar-storage');
        el.btnLimparOrfaos = document.getElementById('btn-limpar-orfaos');
        el.btnSeedDemo = document.getElementById('btn-seed-demo');
        el.btnCleanDemo = document.getElementById('btn-clean-demo');

        // Central de Moderação Rápida
        el.countModeracaoAds = document.getElementById('count-moderacao-ads');
        el.countModeracaoUsers = document.getElementById('count-moderacao-users');
        el.listaModeracaoAnuncios = document.getElementById('lista-moderacao-anuncios');
        el.listaModeracaoUsuarios = document.getElementById('lista-moderacao-usuarios');
        el.btnAtualizarModeracao = document.getElementById('btn-atualizar-moderacao');
    }

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
     * Copia relatório do sistema para a área de transferência
     */
    async function copiarRelatorio() {
        if (!ultimoRelatorio && window.ItaimAdminStatus) {
            await window.ItaimAdminStatus.carregarStatusSistema();
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

    // Exportação do Módulo
    window.ItaimAdminUtils = {
        BACKEND_HOST,
        API_BASE,
        el,
        inicializarElementos,
        mostrarToast,
        adicionarLog,
        detectarAmbienteRede,
        copiarRelatorio,
        getUltimoRelatorio: () => ultimoRelatorio,
        setUltimoRelatorio: (rel) => { ultimoRelatorio = rel; },
        getRefreshTimer: () => refreshTimer,
        setRefreshTimer: (timer) => { refreshTimer = timer; }
    };

})();
