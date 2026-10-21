/**
 * ITAIM VENDE - PAINEL DE CONTROLE: TÚNEL CLOUDFLARE E ACESSO REMOTO
 * Arquivo: frontend/js/pages/admin/painel-tunnel.js
 */

(function () {
    'use strict';

    window.ItaimAdminTunnel = window.ItaimAdminTunnel || {};

    let tunnelAtivoUrl = null;

    function getUtils() {
        return window.ItaimAdminUtils || {};
    }

    /**
     * Consulta o status do túnel Cloudflare
     */
    async function carregarStatusTunnel() {
        const { API_BASE } = getUtils();
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
        const { el } = getUtils();
        if (!el) return;
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
        const { el, API_BASE, mostrarToast, adicionarLog } = getUtils();
        if (el?.btnIniciarTunnel) el.btnIniciarTunnel.disabled = true;
        if (el?.textIniciarTunnel) el.textIniciarTunnel.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Ligando site na nuvem...';
        if (el?.btnHeaderTunnelText) el.btnHeaderTunnelText.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Ligando...';

        if (mostrarToast) mostrarToast('Iniciando Cloudflare Quick Tunnel...', 'info');
        if (adicionarLog) adicionarLog('Iniciando Cloudflare Quick Tunnel na porta 3000...', 'pass');

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

            if (mostrarToast) mostrarToast(`Site ligado com sucesso! Link gerado: ${data.url}`, 'success');
            if (adicionarLog) adicionarLog(`Túnel Cloudflare online: ${data.url}`, 'pass', duracao);

            // Rola suavemente até o card do túnel
            document.getElementById('section-cloud-tunnel')?.scrollIntoView({ behavior: 'smooth' });
        } catch (err) {
            if (mostrarToast) mostrarToast(`Erro ao ligar site: ${err.message}`, 'warn');
            if (adicionarLog) adicionarLog(`Erro ao ligar túnel: ${err.message}`, 'fail');
            carregarStatusTunnel();
        }
    }

    /**
     * Ação de desligar o túnel Cloudflare
     */
    async function desligarTunnelAction() {
        const { el, API_BASE, mostrarToast, adicionarLog } = getUtils();
        if (el?.btnDesligarTunnel) el.btnDesligarTunnel.disabled = true;
        if (mostrarToast) mostrarToast('Desconectando túnel...', 'info');

        try {
            const res = await fetch(`${API_BASE}/system/tunnel/stop`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            const json = await res.json();
            atualizarInterfaceTunnel({ running: false, url: null });
            if (mostrarToast) mostrarToast('Túnel encerrado com sucesso.', 'info');
            if (adicionarLog) adicionarLog('Túnel Cloudflare desconectado pelo operador', 'pass');
        } catch (err) {
            if (mostrarToast) mostrarToast(`Erro ao encerrar túnel: ${err.message}`, 'warn');
        } finally {
            if (el?.btnDesligarTunnel) el.btnDesligarTunnel.disabled = false;
        }
    }

    /**
     * Abre modal de QR Code para leitura no celular
     */
    function abrirModalQrcode() {
        const { el, mostrarToast, adicionarLog } = getUtils();
        if (!tunnelAtivoUrl) {
            if (mostrarToast) mostrarToast('Nenhum link ativo no momento.', 'warn');
            return;
        }

        const qrApi = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(tunnelAtivoUrl)}`;
        if (el?.imgQrcode) el.imgQrcode.src = qrApi;
        if (el?.qrcodeUrlText) el.qrcodeUrlText.textContent = tunnelAtivoUrl;
        if (el?.modalQrcode) el.modalQrcode.style.display = 'flex';
        if (adicionarLog) adicionarLog('QR Code para smartphone exibido na tela', 'pass');
    }

    function fecharModalQrcode() {
        const { el } = getUtils();
        if (el?.modalQrcode) el.modalQrcode.style.display = 'none';
    }

    /**
     * Testa conectividade do link gerado
     */
    async function testarLinkTunnel() {
        const { mostrarToast, adicionarLog } = getUtils();
        if (!tunnelAtivoUrl) return;
        if (mostrarToast) mostrarToast('Testando resposta do link na nuvem...', 'info');
        const start = performance.now();
        try {
            const res = await fetch(`${tunnelAtivoUrl}/api/health`, { cache: 'no-store' });
            const dur = Math.round(performance.now() - start);
            if (res.ok) {
                if (mostrarToast) mostrarToast(`Link público 100% acessível! (${dur}ms)`, 'success');
                if (adicionarLog) adicionarLog(`Teste do link público [${tunnelAtivoUrl}/api/health]: 200 OK (${dur}ms)`, 'pass', dur);
            } else {
                if (mostrarToast) mostrarToast(`Resposta inesperada: HTTP ${res.status}`, 'warn');
            }
        } catch (err) {
            if (mostrarToast) mostrarToast(`Não foi possível acessar via túnel: ${err.message}`, 'warn');
            if (adicionarLog) adicionarLog(`Falha no teste do túnel: ${err.message}`, 'fail');
        }
    }

    // Exportação do Módulo
    window.ItaimAdminTunnel = {
        carregarStatusTunnel,
        atualizarInterfaceTunnel,
        ligarSiteCloudAction,
        desligarTunnelAction,
        abrirModalQrcode,
        fecharModalQrcode,
        testarLinkTunnel,
        getTunnelAtivoUrl: () => tunnelAtivoUrl
    };

})();
