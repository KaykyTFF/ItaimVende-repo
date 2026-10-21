/**
 * ITAIM VENDE - CHAT & CONVERSAS: MÓDULO DE ENVIO, FOTOS E PROPOSTAS
 * Arquivo: frontend/js/pages/mensagens/conversas-envio.js
 * 
 * Gerencia o envio de mensagens de texto, anexos de fotos com upload,
 * modal de propostas de valor com descontos sugeridos e lightbox de imagens.
 */

(function (window, document) {
    'use strict';

    window.ItaimChatEnvio = {
        abrirLightbox: function (url) {
            const modalLightbox = document.getElementById('modal-lightbox-chat');
            const imgLightbox = document.getElementById('img-lightbox-zoom');
            if (modalLightbox && imgLightbox) {
                imgLightbox.src = url;
                modalLightbox.classList.add('aberto');
            }
        },

        fecharLightbox: function () {
            const modalLightbox = document.getElementById('modal-lightbox-chat');
            if (modalLightbox) modalLightbox.classList.remove('aberto');
        },

        responderProposta: async function (messageId, aceitar) {
            const estado = window.ItaimChatEstado;
            try {
                let resp = null;
                if (window.ItaimApi && window.ItaimApi.chat) {
                    resp = aceitar
                        ? await window.ItaimApi.chat.aceitarProposta(messageId)
                        : await window.ItaimApi.chat.recusarProposta(messageId);
                } else {
                    resp = { success: true };
                }

                if (resp && resp.success) {
                    const idx = estado.mensagensAtivas.findIndex(m => m.id === messageId);
                    if (idx !== -1) {
                        estado.mensagensAtivas[idx].offerStatus = aceitar ? 'ACCEPTED' : 'REJECTED';
                    }
                    if (window.ItaimChatFeed) {
                        await window.ItaimChatFeed.carregarMensagens(estado.conversaAtivaId, true);
                    }
                } else {
                    alert(resp?.message || 'Não foi possível responder à proposta.');
                }
            } catch (err) {
                console.error('[Chat Envio] Erro ao responder proposta:', err);
                alert(err.message || 'Erro ao responder à proposta.');
            }
        },

        abrirModalProposta: function () {
            const estado = window.ItaimChatEstado;
            const utils = window.ItaimChatUtils;
            const conv = estado.conversas.find(c => c.id === estado.conversaAtivaId);
            if (!conv) return;

            const prod = conv.product || {};
            const precoOriginal = Number(prod.preco ?? prod.price ?? 0);

            const foto = document.getElementById('modal-proposta-foto');
            const nome = document.getElementById('modal-proposta-produto-nome');
            const precoEl = document.getElementById('modal-proposta-produto-preco');
            const inputValor = document.getElementById('input-proposta-valor');
            const inputMsg = document.getElementById('input-proposta-msg');
            const sugestoesBox = document.getElementById('chat-sugestoes-proposta');
            const modalProposta = document.getElementById('modal-proposta-preco');

            if (foto) foto.src = utils.resolverFoto(prod.imagem || prod.image, 'produto');
            if (nome) nome.textContent = prod.titulo || prod.title || 'Produto';
            if (precoEl) precoEl.textContent = `Valor original: ${utils.formatarPreco(precoOriginal)}`;

            if (inputValor) {
                const sugestaoPadrao = precoOriginal > 0 ? (precoOriginal * 0.9).toFixed(2) : '';
                inputValor.value = sugestaoPadrao;
            }
            if (inputMsg) inputMsg.value = '';

            if (sugestoesBox && precoOriginal > 0) {
                sugestoesBox.innerHTML = '';
                const percentuais = [5, 10, 15, 20];
                percentuais.forEach(pct => {
                    const valDesconto = Math.max(1, (precoOriginal * (1 - pct / 100)).toFixed(2));
                    const btnSugestao = document.createElement('button');
                    btnSugestao.type = 'button';
                    btnSugestao.className = 'btn-sugestao-valor';
                    btnSugestao.textContent = `-${pct}% (R$ ${Number(valDesconto).toLocaleString('pt-BR', { minimumFractionDigits: 2 })})`;
                    btnSugestao.addEventListener('click', () => {
                        if (inputValor) inputValor.value = valDesconto;
                    });
                    sugestoesBox.appendChild(btnSugestao);
                });
            }

            if (modalProposta) modalProposta.classList.add('aberto');
        },

        fecharModalProposta: function () {
            const modalProposta = document.getElementById('modal-proposta-preco');
            if (modalProposta) modalProposta.classList.remove('aberto');
        },

        inicializar: function () {
            const self = this;
            const estado = window.ItaimChatEstado;
            const utils = window.ItaimChatUtils;
            const dom = estado.dom;

            // 1. Envio de Texto do Chat
            if (dom.formEnvio) {
                dom.formEnvio.addEventListener('submit', async (e) => {
                    e.preventDefault();

                    if (!estado.conversaAtivaId || estado.enviandoMensagem) return;
                    const texto = dom.inputTexto?.value.trim();
                    if (!texto) return;

                    estado.enviandoMensagem = true;
                    if (dom.inputTexto) dom.inputTexto.value = '';

                    const conv = estado.conversas.find(c => c.id === estado.conversaAtivaId);
                    const agoraIso = new Date().toISOString();
                    const tempId = 'temp_' + Date.now();

                    // Mensagem Otimista na tela
                    const msgOtimista = {
                        tempId,
                        id: tempId,
                        eMeu: true,
                        senderId: estado.meuUserId,
                        content: texto,
                        isRead: false,
                        createdAt: agoraIso,
                    };

                    estado.mensagensAtivas.push(msgOtimista);
                    if (window.ItaimChatFeed) window.ItaimChatFeed.renderizarFeedMensagens(estado.mensagensAtivas, false);

                    if (conv) {
                        conv.ultimaMensagem = texto;
                        conv.dataUltimaMensagem = agoraIso;
                        estado.conversas = estado.conversas.filter(c => c.id !== conv.id);
                        estado.conversas.unshift(conv);
                        if (window.ItaimChatLista) window.ItaimChatLista.renderizarListaConversas(dom.buscaInput?.value || '');
                    }

                    try {
                        let resp = null;
                        if (window.ItaimApi && window.ItaimApi.chat && typeof window.ItaimApi.chat.enviarMensagem === 'function') {
                            resp = await window.ItaimApi.chat.enviarMensagem(estado.conversaAtivaId, texto);
                        } else {
                            resp = {
                                success: true,
                                data: {
                                    id: 'msg_' + Date.now(),
                                    senderId: estado.meuUserId,
                                    content: texto,
                                    eMeu: true,
                                    isRead: false,
                                    createdAt: agoraIso
                                }
                            };
                        }

                        if (resp && resp.success && resp.data) {
                            const idx = estado.mensagensAtivas.findIndex(m => m.tempId === tempId);
                            if (idx !== -1) {
                                estado.mensagensAtivas[idx] = resp.data;
                            }
                            utils.salvarMensagensCacheLocal(estado.conversaAtivaId, estado.mensagensAtivas, estado.STORAGE_KEY_MSGS_PREFIX);
                            if (window.ItaimChatFeed) window.ItaimChatFeed.renderizarFeedMensagens(estado.mensagensAtivas, true);
                        } else {
                            throw new Error(resp?.message || 'Falha ao enviar mensagem');
                        }
                    } catch (err) {
                        console.error('[Chat Envio] Erro ao enviar mensagem:', err);
                        const balaoErro = dom.feedMensagens?.querySelector(`[data-temp-id="${tempId}"]`);
                        if (balaoErro) {
                            balaoErro.style.opacity = '0.7';
                            balaoErro.title = 'Erro ao enviar. Tente novamente.';
                        }
                    } finally {
                        estado.enviandoMensagem = false;
                        if (dom.inputTexto) dom.inputTexto.focus();
                    }
                });
            }

            // 2. Anexo de Fotos / Upload
            const btnAnexo = document.getElementById('btn-anexo-chat');
            const inputAnexo = document.getElementById('input-anexo-chat');

            if (btnAnexo && inputAnexo) {
                btnAnexo.addEventListener('click', () => {
                    if (!estado.conversaAtivaId || estado.enviandoMensagem) return;
                    inputAnexo.click();
                });

                inputAnexo.addEventListener('change', async (e) => {
                    const file = e.target.files?.[0];
                    if (!file || !estado.conversaAtivaId) return;

                    if (file.size > 5 * 1024 * 1024) {
                        alert('A foto selecionada excede o limite máximo permitido de 5MB.');
                        inputAnexo.value = '';
                        return;
                    }

                    estado.enviandoMensagem = true;
                    btnAnexo.disabled = true;

                    try {
                        let fotoUrl = null;
                        if (window.ItaimApi && window.ItaimApi.upload && typeof window.ItaimApi.upload.chat === 'function') {
                            const respUpload = await window.ItaimApi.upload.chat(file);
                            fotoUrl = respUpload?.data?.url || respUpload?.url;
                        } else {
                            // Fallback FileReader local
                            fotoUrl = await new Promise((resolve) => {
                                const reader = new FileReader();
                                reader.onload = (ev) => resolve(ev.target.result);
                                reader.readAsDataURL(file);
                            });
                        }

                        if (!fotoUrl) {
                            throw new Error('Falha ao processar a imagem.');
                        }

                        let respMsg = null;
                        if (window.ItaimApi && window.ItaimApi.chat && typeof window.ItaimApi.chat.enviarMensagem === 'function') {
                            respMsg = await window.ItaimApi.chat.enviarMensagem(
                                estado.conversaAtivaId,
                                fotoUrl,
                                'IMAGE'
                            );
                        } else {
                            respMsg = {
                                success: true,
                                data: {
                                    id: 'msg_img_' + Date.now(),
                                    senderId: estado.meuUserId,
                                    content: fotoUrl,
                                    messageType: 'IMAGE',
                                    eMeu: true,
                                    isRead: false,
                                    createdAt: new Date().toISOString()
                                }
                            };
                        }

                        if (respMsg && respMsg.success && respMsg.data) {
                            estado.mensagensAtivas.push(respMsg.data);
                            utils.salvarMensagensCacheLocal(estado.conversaAtivaId, estado.mensagensAtivas, estado.STORAGE_KEY_MSGS_PREFIX);
                            if (window.ItaimChatFeed) window.ItaimChatFeed.renderizarFeedMensagens(estado.mensagensAtivas, false);
                        } else {
                            throw new Error(respMsg?.message || 'Falha ao enviar a foto');
                        }
                    } catch (err) {
                        console.error('[Chat Envio] Erro ao enviar imagem:', err);
                        alert(err.message || 'Erro ao enviar a imagem. Tente novamente.');
                    } finally {
                        estado.enviandoMensagem = false;
                        btnAnexo.disabled = false;
                        inputAnexo.value = '';
                    }
                });
            }

            // 3. Modais de Proposta
            const btnAbrirProposta = document.getElementById('btn-abrir-modal-proposta');
            const btnFecharProposta = document.getElementById('btn-fechar-modal-proposta');
            const btnCancelarProposta = document.getElementById('btn-cancelar-proposta');
            const formProposta = document.getElementById('form-enviar-proposta');

            if (btnAbrirProposta) btnAbrirProposta.addEventListener('click', () => self.abrirModalProposta());
            if (btnFecharProposta) btnFecharProposta.addEventListener('click', () => self.fecharModalProposta());
            if (btnCancelarProposta) btnCancelarProposta.addEventListener('click', () => self.fecharModalProposta());

            if (formProposta) {
                formProposta.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    if (!estado.conversaAtivaId || estado.enviandoMensagem) return;

                    const inputValor = document.getElementById('input-proposta-valor');
                    const inputMsg = document.getElementById('input-proposta-msg');
                    const valor = parseFloat(inputValor?.value);
                    const msgTexto = inputMsg?.value.trim() || 'Fiz uma proposta de valor.';

                    if (isNaN(valor) || valor <= 0) {
                        alert('Informe um valor de proposta válido maior que zero.');
                        return;
                    }

                    estado.enviandoMensagem = true;
                    try {
                        let resp = null;
                        if (window.ItaimApi && window.ItaimApi.chat && typeof window.ItaimApi.chat.enviarMensagem === 'function') {
                            resp = await window.ItaimApi.chat.enviarMensagem(
                                estado.conversaAtivaId,
                                msgTexto,
                                'OFFER_PROPOSAL',
                                valor
                            );
                        } else {
                            resp = {
                                success: true,
                                data: {
                                    id: 'msg_prop_' + Date.now(),
                                    senderId: estado.meuUserId,
                                    content: msgTexto,
                                    messageType: 'OFFER_PROPOSAL',
                                    offerValue: valor,
                                    offerStatus: 'PENDING',
                                    eMeu: true,
                                    isRead: false,
                                    createdAt: new Date().toISOString()
                                }
                            };
                        }

                        if (resp && resp.success && resp.data) {
                            estado.mensagensAtivas.push(resp.data);
                            utils.salvarMensagensCacheLocal(estado.conversaAtivaId, estado.mensagensAtivas, estado.STORAGE_KEY_MSGS_PREFIX);
                            if (window.ItaimChatFeed) window.ItaimChatFeed.renderizarFeedMensagens(estado.mensagensAtivas, false);
                            self.fecharModalProposta();
                        } else {
                            throw new Error(resp?.message || 'Falha ao enviar proposta');
                        }
                    } catch (err) {
                        console.error('[Chat Envio] Erro ao enviar proposta:', err);
                        alert(err.message || 'Erro ao enviar a proposta. Tente novamente.');
                    } finally {
                        estado.enviandoMensagem = false;
                    }
                });
            }

            // 4. Lightbox de Imagem
            const btnFecharLightbox = document.getElementById('btn-fechar-lightbox');
            const modalLightbox = document.getElementById('modal-lightbox-chat');

            if (btnFecharLightbox) btnFecharLightbox.addEventListener('click', () => self.fecharLightbox());
            if (modalLightbox) {
                modalLightbox.addEventListener('click', (e) => {
                    if (e.target === modalLightbox) self.fecharLightbox();
                });
            }
        }
    };

})(window, document);
