/**
 * ITAIM VENDE - PAINEL DE CONTROLE: BINDING DE EVENTOS E CICLO DE VIDA
 * Arquivo: frontend/js/pages/admin/painel-eventos.js
 */

(function () {
    'use strict';

    window.ItaimAdminEventos = window.ItaimAdminEventos || {};

    function getUtils() {
        return window.ItaimAdminUtils || {};
    }

    /**
     * Configura todos os ouvintes de eventos da interface
     */
    function configurarEventos() {
        const { el, mostrarToast, adicionarLog, copiarRelatorio, setRefreshTimer, getRefreshTimer } = getUtils();
        if (!el) return;

        // Botão Atualizar
        if (el.btnAtualizar) {
            el.btnAtualizar.addEventListener('click', () => {
                if (window.ItaimAdminStatus?.carregarStatusSistema) {
                    window.ItaimAdminStatus.carregarStatusSistema();
                }
            });
        }

        // Botão Executar Todos os Testes
        if (el.btnExecutar) {
            el.btnExecutar.addEventListener('click', () => {
                if (window.ItaimAdminTestes?.executarTodosOsTestes) {
                    window.ItaimAdminTestes.executarTodosOsTestes();
                }
            });
        }
        if (el.btnRodarMatriz) {
            el.btnRodarMatriz.addEventListener('click', () => {
                if (window.ItaimAdminTestes?.executarTodosOsTestes) {
                    window.ItaimAdminTestes.executarTodosOsTestes();
                }
            });
        }

        // Botão Copiar Relatório
        if (el.btnCopiar) {
            el.btnCopiar.addEventListener('click', copiarRelatorio);
        }

        // Atalhos de teste nos cards
        if (el.btnTestarDb) {
            el.btnTestarDb.addEventListener('click', () => {
                const t = window.ItaimAdminTestes?.MODULOS_TESTE.find(x => x.id === 'system_status');
                if (t && window.ItaimAdminTestes?.executarTesteIndividual) {
                    window.ItaimAdminTestes.executarTesteIndividual(t);
                }
            });
        }
        if (el.btnTestarStorage) {
            el.btnTestarStorage.addEventListener('click', () => {
                const t = window.ItaimAdminTestes?.MODULOS_TESTE.find(x => x.id === 'uploads_storage');
                if (t && window.ItaimAdminTestes?.executarTesteIndividual) {
                    window.ItaimAdminTestes.executarTesteIndividual(t);
                }
            });
        }
        if (el.btnTestarHealth) {
            el.btnTestarHealth.addEventListener('click', () => {
                const t = window.ItaimAdminTestes?.MODULOS_TESTE.find(x => x.id === 'health');
                if (t && window.ItaimAdminTestes?.executarTesteIndividual) {
                    window.ItaimAdminTestes.executarTesteIndividual(t);
                }
            });
        }
        if (el.btnTestarRede) {
            el.btnTestarRede.addEventListener('click', () => {
                if (window.ItaimAdminStatus?.carregarStatusSistema) {
                    window.ItaimAdminStatus.carregarStatusSistema();
                }
            });
        }

        // Console Manual Form
        if (el.formConsole) {
            el.formConsole.addEventListener('submit', (e) => {
                e.preventDefault();
                if (window.ItaimAdminStorage?.dispararConsultaManual) {
                    window.ItaimAdminStorage.dispararConsultaManual();
                }
            });
        }

        // Quick Links do Console
        document.querySelectorAll('.quick-link-btn').forEach((btn) => {
            btn.addEventListener('click', () => {
                const method = btn.getAttribute('data-method') || 'GET';
                const path = btn.getAttribute('data-path') || '';
                if (el.consoleMethod) el.consoleMethod.value = method;
                if (el.consoleEndpoint) el.consoleEndpoint.value = path;
                if (window.ItaimAdminStorage?.dispararConsultaManual) {
                    window.ItaimAdminStorage.dispararConsultaManual();
                }
            });
        });

        // Limpar logs
        if (el.btnLimparLogs) {
            el.btnLimparLogs.addEventListener('click', () => {
                if (el.logsFeed) el.logsFeed.innerHTML = '';
                if (adicionarLog) adicionarLog('Logs limpos pelo operador', 'pass');
            });
        }

        // Eventos do Túnel Cloudflare
        if (el.btnIniciarTunnel) {
            el.btnIniciarTunnel.addEventListener('click', () => {
                if (window.ItaimAdminTunnel?.ligarSiteCloudAction) {
                    window.ItaimAdminTunnel.ligarSiteCloudAction();
                }
            });
        }
        if (el.btnHeaderTunnel) {
            el.btnHeaderTunnel.addEventListener('click', () => {
                const ativo = window.ItaimAdminTunnel?.getTunnelAtivoUrl();
                if (ativo) {
                    // Se já estiver online, foca na seção do túnel
                    document.getElementById('section-cloud-tunnel')?.scrollIntoView({ behavior: 'smooth' });
                } else if (window.ItaimAdminTunnel?.ligarSiteCloudAction) {
                    window.ItaimAdminTunnel.ligarSiteCloudAction();
                }
            });
        }
        if (el.btnDesligarTunnel) {
            el.btnDesligarTunnel.addEventListener('click', () => {
                if (window.ItaimAdminTunnel?.desligarTunnelAction) {
                    window.ItaimAdminTunnel.desligarTunnelAction();
                }
            });
        }
        if (el.btnCopiarTunnelUrl) {
            el.btnCopiarTunnelUrl.addEventListener('click', async () => {
                const ativo = window.ItaimAdminTunnel?.getTunnelAtivoUrl();
                if (!ativo) return;
                try {
                    await navigator.clipboard.writeText(ativo);
                    if (mostrarToast) mostrarToast('Link público copiado com sucesso!', 'success');
                    if (adicionarLog) adicionarLog(`Link ${ativo} copiado para clipboard`, 'pass');
                } catch {
                    if (mostrarToast) mostrarToast('Copie manualmente o link selecionado.', 'warn');
                }
            });
        }
        if (el.btnQrcodeTunnel) {
            el.btnQrcodeTunnel.addEventListener('click', () => {
                if (window.ItaimAdminTunnel?.abrirModalQrcode) {
                    window.ItaimAdminTunnel.abrirModalQrcode();
                }
            });
        }
        if (el.btnFecharQrcode) {
            el.btnFecharQrcode.addEventListener('click', () => {
                if (window.ItaimAdminTunnel?.fecharModalQrcode) {
                    window.ItaimAdminTunnel.fecharModalQrcode();
                }
            });
        }
        if (el.modalQrcode) {
            el.modalQrcode.addEventListener('click', (e) => {
                if (e.target === el.modalQrcode && window.ItaimAdminTunnel?.fecharModalQrcode) {
                    window.ItaimAdminTunnel.fecharModalQrcode();
                }
            });
        }
        if (el.btnTestarTunnelLink) {
            el.btnTestarTunnelLink.addEventListener('click', () => {
                if (window.ItaimAdminTunnel?.testarLinkTunnel) {
                    window.ItaimAdminTunnel.testarLinkTunnel();
                }
            });
        }

        // Eventos de Operações & Manutenção
        if (el.btnAuditarStorage) {
            el.btnAuditarStorage.addEventListener('click', () => {
                if (window.ItaimAdminStorage?.auditarStorageAction) {
                    window.ItaimAdminStorage.auditarStorageAction();
                }
            });
        }
        if (el.btnLimparOrfaos) {
            el.btnLimparOrfaos.addEventListener('click', () => {
                if (window.ItaimAdminStorage?.limparStorageAction) {
                    window.ItaimAdminStorage.limparStorageAction();
                }
            });
        }
        if (el.btnSeedDemo) {
            el.btnSeedDemo.addEventListener('click', () => {
                if (window.ItaimAdminStorage?.seedDemoAction) {
                    window.ItaimAdminStorage.seedDemoAction();
                }
            });
        }
        if (el.btnCleanDemo) {
            el.btnCleanDemo.addEventListener('click', () => {
                if (window.ItaimAdminStorage?.cleanDemoAction) {
                    window.ItaimAdminStorage.cleanDemoAction();
                }
            });
        }

        // Eventos de Moderação Rápida
        if (el.btnAtualizarModeracao) {
            el.btnAtualizarModeracao.addEventListener('click', () => {
                if (window.ItaimAdminModeracao?.carregarDadosModeracao) {
                    window.ItaimAdminModeracao.carregarDadosModeracao();
                }
            });
        }

        // Seletor de Auto-Refresh
        if (el.selectRefresh) {
            el.selectRefresh.addEventListener('change', () => {
                const segs = parseInt(el.selectRefresh.value, 10);
                const currentTimer = getRefreshTimer ? getRefreshTimer() : null;
                if (currentTimer) clearInterval(currentTimer);

                if (segs > 0) {
                    const novoTimer = setInterval(() => {
                        if (window.ItaimAdminStatus?.carregarStatusSistema) window.ItaimAdminStatus.carregarStatusSistema();
                        if (window.ItaimAdminTunnel?.carregarStatusTunnel) window.ItaimAdminTunnel.carregarStatusTunnel();
                        if (window.ItaimAdminModeracao?.carregarDadosModeracao) window.ItaimAdminModeracao.carregarDadosModeracao();
                    }, segs * 1000);
                    if (setRefreshTimer) setRefreshTimer(novoTimer);
                    if (mostrarToast) mostrarToast(`Auto-atualização ativa a cada ${segs}s`, 'info');
                } else {
                    if (setRefreshTimer) setRefreshTimer(null);
                    if (mostrarToast) mostrarToast('Auto-atualização pausada', 'info');
                }
            });
        }
    }

    /**
     * Inicializador mestre do painel administrativo
     */
    function iniciarPainel() {
        const { inicializarElementos, detectarAmbienteRede, setRefreshTimer } = getUtils();
        if (inicializarElementos) inicializarElementos();
        if (detectarAmbienteRede) detectarAmbienteRede();

        if (window.ItaimAdminTestes?.renderizarTabelaTestes) {
            window.ItaimAdminTestes.renderizarTabelaTestes();
        }

        configurarEventos();

        // Primeira carga de status, túnel, storage e moderação
        if (window.ItaimAdminStatus?.carregarStatusSistema) {
            window.ItaimAdminStatus.carregarStatusSistema();
        }
        if (window.ItaimAdminTunnel?.carregarStatusTunnel) {
            window.ItaimAdminTunnel.carregarStatusTunnel();
        }
        if (window.ItaimAdminStorage?.auditarStorageAction) {
            window.ItaimAdminStorage.auditarStorageAction();
        }
        if (window.ItaimAdminModeracao?.carregarDadosModeracao) {
            window.ItaimAdminModeracao.carregarDadosModeracao();
        }

        // Dispara auto-teste inicial após 600ms
        setTimeout(() => {
            if (window.ItaimAdminTestes?.executarTodosOsTestes) {
                window.ItaimAdminTestes.executarTodosOsTestes();
            }
        }, 600);

        // Inicia auto-refresh padrão (10s)
        const refreshTimer = setInterval(() => {
            if (window.ItaimAdminStatus?.carregarStatusSistema) window.ItaimAdminStatus.carregarStatusSistema();
            if (window.ItaimAdminTunnel?.carregarStatusTunnel) window.ItaimAdminTunnel.carregarStatusTunnel();
            if (window.ItaimAdminModeracao?.carregarDadosModeracao) window.ItaimAdminModeracao.carregarDadosModeracao();
        }, 10000);
        if (setRefreshTimer) setRefreshTimer(refreshTimer);
    }

    // Exportação do Módulo
    window.ItaimAdminEventos = {
        configurarEventos,
        iniciarPainel
    };

})();
