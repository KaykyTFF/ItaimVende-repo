/**
 * ITAIM VENDE - CHAT & CONVERSAS: MÓDULO DE AÇÕES, BLOQUEIO E POLLING
 * Arquivo: frontend/js/pages/mensagens/conversas-acoes.js
 * 
 * Gerencia o bloqueio/desbloqueio de conversas, sincronização em tempo real (polling),
 * controles responsivos mobile e leitura dos parâmetros de URL (?id=... / ?produtoId=...).
 */

(function (window, document) {
    'use strict';

    window.ItaimChatAcoes = {
        alternarBloqueioConversa: async function () {
            const estado = window.ItaimChatEstado;
            if (!estado.conversaAtivaId) return;
            const conv = estado.conversas.find(c => c.id === estado.conversaAtivaId);
            if (!conv) return;

            const isBlocked = conv.status === 'BLOCKED' || conv.isBlocked;
            const confirmMsg = isBlocked
                ? 'Deseja desbloquear esta conversa para voltar a receber e enviar mensagens?'
                : 'Tem certeza que deseja bloquear esta conversa? Mensagens não poderão ser trocadas enquanto ela estiver bloqueada.';

            if (!confirm(confirmMsg)) return;

            try {
                let resp = null;
                if (window.ItaimApi && window.ItaimApi.chat && typeof window.ItaimApi.chat.bloquearConversa === 'function') {
                    resp = await window.ItaimApi.chat.bloquearConversa(estado.conversaAtivaId);
                } else {
                    resp = {
                        success: true,
                        data: {
                            status: isBlocked ? 'ACTIVE' : 'BLOCKED',
                            isBlocked: !isBlocked,
                            blockedById: isBlocked ? null : estado.meuUserId
                        }
                    };
                }

                if (resp && resp.success && resp.data) {
                    conv.status = resp.data.status;
                    conv.isBlocked = resp.data.isBlocked;
                    conv.blockedById = resp.data.blockedById;
                    conv.blockedByMe = resp.data.blockedById === estado.meuUserId;

                    if (window.ItaimChatFeed) await window.ItaimChatFeed.selecionarConversa(estado.conversaAtivaId);
                    if (window.ItaimChatLista) window.ItaimChatLista.renderizarListaConversas(estado.dom.buscaInput?.value || '');
                } else {
                    alert(resp?.message || 'Falha ao alterar o status da conversa.');
                }
            } catch (err) {
                console.error('[Chat Ações] Erro ao bloquear/desbloquear conversa:', err);
                alert(err.message || 'Erro ao alterar o status da conversa.');
            }
        },

        iniciarPolling: function () {
            const estado = window.ItaimChatEstado;
            const utils = window.ItaimChatUtils;

            if (estado.intervaloPolling) clearInterval(estado.intervaloPolling);

            estado.intervaloPolling = setInterval(async () => {
                if (document.hidden) return;
                estado.contadorTicks++;

                // A cada 3s: Atualiza mensagens da conversa ativa
                if (estado.conversaAtivaId && !estado.enviandoMensagem) {
                    try {
                        if (window.ItaimApi && window.ItaimApi.chat && typeof window.ItaimApi.chat.obterMensagens === 'function') {
                            const resp = await window.ItaimApi.chat.obterMensagens(estado.conversaAtivaId);
                            if (resp && resp.success && Array.isArray(resp.data)) {
                                const novas = resp.data;
                                if (novas.length !== estado.mensagensAtivas.length || 
                                    JSON.stringify(novas.map(m => ({ id: m.id, r: m.isRead, os: m.offerStatus }))) !== 
                                    JSON.stringify(estado.mensagensAtivas.map(m => ({ id: m.id, r: m.isRead, os: m.offerStatus })))) {
                                    estado.mensagensAtivas = novas;
                                    utils.salvarMensagensCacheLocal(estado.conversaAtivaId, estado.mensagensAtivas, estado.STORAGE_KEY_MSGS_PREFIX);
                                    if (window.ItaimChatFeed) window.ItaimChatFeed.renderizarFeedMensagens(estado.mensagensAtivas, true);
                                }
                            }
                        }
                    } catch (e) {}
                }

                // A cada 6s: Atualiza a lista lateral de conversas
                if (estado.contadorTicks % 2 === 0) {
                    try {
                        if (window.ItaimApi && window.ItaimApi.chat && typeof window.ItaimApi.chat.listarConversas === 'function') {
                            const resp = await window.ItaimApi.chat.listarConversas();
                            if (resp && resp.success && Array.isArray(resp.data)) {
                                const listaNova = resp.data;
                                const mudou = JSON.stringify(listaNova.map(c => ({ id: c.id, msg: c.ultimaMensagem, nl: c.naoLidas, st: c.status }))) !==
                                              JSON.stringify(estado.conversas.map(c => ({ id: c.id, msg: c.ultimaMensagem, nl: c.naoLidas, st: c.status })));
                                if (mudou) {
                                    estado.conversas = listaNova;
                                    try {
                                        localStorage.setItem(estado.STORAGE_KEY_LISTA, JSON.stringify(estado.conversas));
                                    } catch (e) {}
                                    if (window.ItaimChatLista) window.ItaimChatLista.renderizarListaConversas(estado.dom.buscaInput?.value || '');
                                }
                            }
                        }
                    } catch (e) {}
                }
            }, 3000);
        },

        inicializarEventos: function () {
            const self = this;
            const estado = window.ItaimChatEstado;
            const dom = estado.dom;

            // Voltar no Mobile
            if (dom.btnVoltarMobile && dom.layoutGrid) {
                dom.btnVoltarMobile.addEventListener('click', (e) => {
                    e.preventDefault();
                    dom.layoutGrid.classList.remove('conversa-aberta-mobile');
                });
            }

            // Botões de Bloqueio
            if (dom.btnToggleBloqueio) dom.btnToggleBloqueio.addEventListener('click', () => self.alternarBloqueioConversa());
            if (dom.btnDesbloquearBanner) dom.btnDesbloquearBanner.addEventListener('click', () => self.alternarBloqueioConversa());
        },

        processarInicializacaoRotas: async function () {
            const estado = window.ItaimChatEstado;
            const urlParams = new URLSearchParams(window.location.search);
            const paramId = urlParams.get('id') || urlParams.get('conversaId');
            const paramProdutoId = urlParams.get('produtoId');
            const cachedAtivaId = localStorage.getItem(estado.STORAGE_KEY_ATIVA);

            // Carrega cache prévio para 0ms de espera no F5
            try {
                const rawCachedLista = localStorage.getItem(estado.STORAGE_KEY_LISTA);
                if (rawCachedLista) {
                    const parsed = JSON.parse(rawCachedLista);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        estado.conversas = parsed;
                        if (window.ItaimChatLista) window.ItaimChatLista.renderizarListaConversas();
                    }
                }
            } catch (e) {}

            let idParaAbrir = paramId;
            if (!idParaAbrir && !paramProdutoId) {
                if (cachedAtivaId && estado.conversas.some(c => c.id === cachedAtivaId)) {
                    idParaAbrir = cachedAtivaId;
                } else if (estado.conversas.length > 0 && window.innerWidth >= 992) {
                    idParaAbrir = estado.conversas[0].id;
                }
            }

            if (idParaAbrir) {
                if (window.ItaimChatFeed) window.ItaimChatFeed.selecionarConversa(idParaAbrir);
                if (window.ItaimChatLista) await window.ItaimChatLista.carregarListaConversas();
            } else if (paramProdutoId) {
                try {
                    let resp = null;
                    if (window.ItaimApi && window.ItaimApi.chat && typeof window.ItaimApi.chat.iniciarConversa === 'function') {
                        resp = await window.ItaimApi.chat.iniciarConversa(paramProdutoId);
                    }
                    if (resp && resp.success && resp.data) {
                        if (window.ItaimChatFeed) window.ItaimChatFeed.selecionarConversa(resp.data.id);
                        if (window.ItaimChatLista) window.ItaimChatLista.carregarListaConversas();
                    } else {
                        if (window.ItaimChatLista) await window.ItaimChatLista.carregarListaConversas();
                        estado.exibirEstadoSemConversa();
                    }
                } catch (err) {
                    console.warn('[Chat Ações] Falha ao iniciar chat por produtoId:', err);
                    if (window.ItaimChatLista) await window.ItaimChatLista.carregarListaConversas();
                    estado.exibirEstadoSemConversa();
                }
            } else {
                if (window.ItaimChatLista) await window.ItaimChatLista.carregarListaConversas();
                if (estado.conversas.length > 0 && window.innerWidth >= 992) {
                    if (window.ItaimChatFeed) window.ItaimChatFeed.selecionarConversa(estado.conversas[0].id);
                } else {
                    estado.exibirEstadoSemConversa();
                }
            }

            this.iniciarPolling();
        }
    };

})(window, document);
