/**
 * ITAIM VENDE - CHAT & CONVERSAS: MÓDULO DO FEED DE MENSAGENS (COLUNA 2 & 3)
 * Arquivo: frontend/js/pages/mensagens/conversas-feed.js
 * 
 * Gerencia a seleção de conversas ativas, carregamento do histórico, renderização
 * do feed com balões de texto, fotos, cards de propostas e detalhes do anúncio.
 */

(function (window, document) {
    'use strict';

    window.ItaimChatFeed = {
        exibirSkeletonMensagens: function () {
            const feedMensagens = window.ItaimChatEstado?.dom?.feedMensagens;
            if (!feedMensagens) return;
            feedMensagens.innerHTML = `
                <div class="chat-skeleton-feed">
                    <div class="chat-skeleton-balao recebida" style="width: 48%;"></div>
                    <div class="chat-skeleton-balao enviada" style="width: 62%;"></div>
                    <div class="chat-skeleton-balao recebida" style="width: 40%;"></div>
                    <div class="chat-skeleton-balao enviada" style="width: 54%;"></div>
                </div>
            `;
        },

        carregarMensagens: async function (convId, manterPosicaoScroll = false) {
            const estado = window.ItaimChatEstado;
            const utils = window.ItaimChatUtils;
            const feedMensagens = estado?.dom?.feedMensagens;
            if (!feedMensagens || !convId) return;

            // Cache local para abertura imediata (0ms de latência)
            let msgsEmCache = estado.mensagensCache.get(convId) || utils.carregarMensagensCacheLocal(convId, estado.STORAGE_KEY_MSGS_PREFIX);
            if (msgsEmCache && !manterPosicaoScroll) {
                estado.mensagensAtivas = msgsEmCache;
                estado.mensagensCache.set(convId, msgsEmCache);
                this.renderizarFeedMensagens(estado.mensagensAtivas, false);
            } else if (!manterPosicaoScroll && estado.mensagensAtivas.length === 0) {
                this.exibirSkeletonMensagens();
            }

            try {
                let msgsObtidas = null;

                if (window.ItaimApi && window.ItaimApi.chat && typeof window.ItaimApi.chat.obterMensagens === 'function') {
                    const resp = await window.ItaimApi.chat.obterMensagens(convId);
                    if (resp && resp.success && Array.isArray(resp.data)) {
                        msgsObtidas = resp.data;
                    }
                }

                // Fallback para Modo Dev / Live Server se a API estiver desconectada
                if (!msgsObtidas || msgsObtidas.length === 0) {
                    const isDev = (window.ItaimSessao && typeof window.ItaimSessao.isModoDevFrontend === 'function' && window.ItaimSessao.isModoDevFrontend())
                        || (window.ItaimSessaoAuth && typeof window.ItaimSessaoAuth.isModoDevFrontend === 'function' && window.ItaimSessaoAuth.isModoDevFrontend());
                    if (isDev && (!msgsEmCache || msgsEmCache.length === 0)) {
                        msgsObtidas = [
                            {
                                id: 'msg_dev_01',
                                senderId: 'cmv5iacmv0000ttiwu9wtemar',
                                content: 'Olá! Obrigado pelo interesse no anúncio. Como posso te ajudar?',
                                eMeu: false,
                                messageType: 'TEXT',
                                isRead: true,
                                createdAt: new Date(Date.now() - 3600000).toISOString()
                            },
                            {
                                id: 'msg_dev_02',
                                senderId: estado.meuUserId,
                                content: 'Olá! Ainda está disponível para entrega no Centro de Paulistana?',
                                eMeu: true,
                                messageType: 'TEXT',
                                isRead: true,
                                createdAt: new Date(Date.now() - 1800000).toISOString()
                            },
                            {
                                id: 'msg_dev_03',
                                senderId: 'cmv5iacmv0000ttiwu9wtemar',
                                content: 'Sim, está disponível! Podemos combinar no ponto de encontro seguro da praça.',
                                eMeu: false,
                                messageType: 'TEXT',
                                isRead: true,
                                createdAt: new Date(Date.now() - 600000).toISOString()
                            }
                        ];
                    }
                }

                if (msgsObtidas && Array.isArray(msgsObtidas)) {
                    if (estado.conversaAtivaId !== convId) return;
                    estado.mensagensAtivas = msgsObtidas;
                    estado.mensagensCache.set(convId, msgsObtidas);
                    utils.salvarMensagensCacheLocal(convId, msgsObtidas, estado.STORAGE_KEY_MSGS_PREFIX);
                    this.renderizarFeedMensagens(estado.mensagensAtivas, manterPosicaoScroll);
                }
            } catch (err) {
                console.error('[Chat Feed] Erro ao carregar mensagens:', err);
            }
        },

        renderizarFeedMensagens: function (msgs, manterPosicaoScroll = false) {
            const estado = window.ItaimChatEstado;
            const utils = window.ItaimChatUtils;
            const feedMensagens = estado?.dom?.feedMensagens;
            if (!feedMensagens) return;

            const conv = estado.conversas.find(c => c.id === estado.conversaAtivaId);
            const outroNome = conv?.outroParticipante?.nome || 'Contato';
            const prodTitulo = conv?.product?.titulo || conv?.product?.title || 'este anúncio';

            const alturaAnterior = feedMensagens.scrollHeight;
            const scrollAnterior = feedMensagens.scrollTop;
            const estavaNoFinal = (alturaAnterior - scrollAnterior - feedMensagens.clientHeight) < 60;

            feedMensagens.innerHTML = '';

            if (!msgs || msgs.length === 0) {
                feedMensagens.innerHTML = `
                    <div class="chat-aviso-inicio">
                        <div class="chat-aviso-inicio-icone">
                            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                        </div>
                        <p>Você iniciou uma conversa com <strong>${outroNome}</strong> sobre <strong>"${prodTitulo}"</strong>.</p>
                        <p class="chat-aviso-sub">Envie uma mensagem abaixo para tirar dúvidas e combinar os detalhes da negociação com segurança!</p>
                    </div>
                `;
                return;
            }

            // Divisor de Data
            const divisor = document.createElement('div');
            divisor.className = 'chat-data-divisor';
            divisor.textContent = 'Mensagens';
            feedMensagens.appendChild(divisor);

            msgs.forEach(m => {
                const souEu = (m.eMeu === true || m.senderId === estado.meuUserId);

                // 1. Mensagem de Sistema
                if (m.messageType === 'SYSTEM') {
                    const balaoSistema = document.createElement('div');
                    balaoSistema.className = 'msg-balao sistema';
                    balaoSistema.textContent = m.content || '';
                    feedMensagens.appendChild(balaoSistema);
                    return;
                }

                const balao = document.createElement('div');
                balao.className = `msg-balao ${souEu ? 'enviada' : 'recebida'}`;
                if (m.tempId) balao.setAttribute('data-temp-id', m.tempId);

                // 2. Foto / Imagem Anexada
                if (m.messageType === 'IMAGE') {
                    const fotoWrap = document.createElement('div');
                    fotoWrap.className = 'msg-foto-wrap';
                    const fotoImg = document.createElement('img');
                    const imgUrl = utils.resolverFoto(m.content, 'produto');
                    fotoImg.src = imgUrl;
                    fotoImg.alt = 'Foto compartilhada';
                    fotoImg.className = 'msg-foto-img';
                    fotoImg.loading = 'lazy';
                    fotoImg.addEventListener('click', () => {
                        if (window.ItaimChatEnvio && typeof window.ItaimChatEnvio.abrirLightbox === 'function') {
                            window.ItaimChatEnvio.abrirLightbox(imgUrl);
                        }
                    });
                    fotoWrap.appendChild(fotoImg);
                    balao.appendChild(fotoWrap);
                } 
                // 3. Proposta de Preço
                else if (m.messageType === 'OFFER_PROPOSAL') {
                    const propostaCard = document.createElement('div');
                    propostaCard.className = 'msg-proposta-card';

                    const propHeader = document.createElement('div');
                    propHeader.className = 'msg-proposta-header';
                    propHeader.innerHTML = `
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                            <line x1="7" y1="7" x2="7.01" y2="7"></line>
                        </svg>
                        <span>Proposta de Preço</span>
                    `;
                    propostaCard.appendChild(propHeader);

                    const propValor = document.createElement('div');
                    propValor.className = 'msg-proposta-valor';
                    propValor.innerHTML = utils.formatarPreco(m.offerValue);
                    propostaCard.appendChild(propValor);

                    if (m.content && m.content.trim() && !m.content.startsWith('Proposta de R$')) {
                        const propNota = document.createElement('p');
                        propNota.className = 'msg-texto';
                        propNota.style.fontSize = '13px';
                        propNota.style.opacity = '0.9';
                        propNota.textContent = m.content;
                        propostaCard.appendChild(propNota);
                    }

                    const statusBadge = document.createElement('div');
                    const st = (m.offerStatus || 'PENDING').toUpperCase();

                    if (st === 'ACCEPTED') {
                        statusBadge.className = 'msg-proposta-status-badge aceita';
                        statusBadge.innerHTML = '✅ Proposta Aceita';
                        propostaCard.appendChild(statusBadge);
                    } else if (st === 'REJECTED') {
                        statusBadge.className = 'msg-proposta-status-badge recusada';
                        statusBadge.innerHTML = '❌ Proposta Recusada';
                        propostaCard.appendChild(statusBadge);
                    } else {
                        if (souEu) {
                            statusBadge.className = 'msg-proposta-status-badge pendente';
                            statusBadge.innerHTML = '⏳ Proposta Enviada (Aguardando resposta)';
                            propostaCard.appendChild(statusBadge);
                        } else {
                            statusBadge.className = 'msg-proposta-status-badge pendente';
                            statusBadge.innerHTML = '🔔 Proposta Recebida';
                            propostaCard.appendChild(statusBadge);

                            const acoesBox = document.createElement('div');
                            acoesBox.className = 'msg-proposta-acoes';

                            const btnAceitar = document.createElement('button');
                            btnAceitar.type = 'button';
                            btnAceitar.className = 'btn-proposta-acao btn-proposta-aceitar';
                            btnAceitar.innerHTML = '✓ Aceitar';
                            btnAceitar.addEventListener('click', async (e) => {
                                e.stopPropagation();
                                btnAceitar.disabled = true;
                                if (window.ItaimChatEnvio && typeof window.ItaimChatEnvio.responderProposta === 'function') {
                                    await window.ItaimChatEnvio.responderProposta(m.id, true);
                                }
                            });

                            const btnRecusar = document.createElement('button');
                            btnRecusar.type = 'button';
                            btnRecusar.className = 'btn-proposta-acao btn-proposta-recusar';
                            btnRecusar.innerHTML = '✕ Recusar';
                            btnRecusar.addEventListener('click', async (e) => {
                                e.stopPropagation();
                                btnRecusar.disabled = true;
                                if (window.ItaimChatEnvio && typeof window.ItaimChatEnvio.responderProposta === 'function') {
                                    await window.ItaimChatEnvio.responderProposta(m.id, false);
                                }
                            });

                            acoesBox.appendChild(btnAceitar);
                            acoesBox.appendChild(btnRecusar);
                            propostaCard.appendChild(acoesBox);
                        }
                    }
                    balao.appendChild(propostaCard);
                } 
                // 4. Mensagem de Texto Normal
                else {
                    const textoP = document.createElement('p');
                    textoP.className = 'msg-texto';
                    textoP.textContent = m.content || '';
                    balao.appendChild(textoP);
                }

                const metadadosBox = document.createElement('div');
                metadadosBox.className = 'msg-metadados';

                const horaSpan = document.createElement('span');
                horaSpan.className = 'msg-hora';
                horaSpan.textContent = utils.formatarHora(m.createdAt || new Date());
                metadadosBox.appendChild(horaSpan);

                if (souEu) {
                    const checkWrap = document.createElement('span');
                    checkWrap.innerHTML = utils.criarSvgCheck(m.isRead);
                    metadadosBox.appendChild(checkWrap);
                }

                balao.appendChild(metadadosBox);
                feedMensagens.appendChild(balao);
            });

            if (!manterPosicaoScroll || estavaNoFinal) {
                feedMensagens.scrollTop = feedMensagens.scrollHeight;
            }
        },

        selecionarConversa: async function (id) {
            const estado = window.ItaimChatEstado;
            const utils = window.ItaimChatUtils;
            const dom = estado.dom;

            if (!id) {
                estado.exibirEstadoSemConversa();
                return;
            }

            if (estado.conversaAtivaId && estado.conversaAtivaId !== id && window.ItaimSocket) {
                window.ItaimSocket.sairConversa(estado.conversaAtivaId);
            }

            estado.conversaAtivaId = id;
            if (window.ItaimSocket && typeof window.ItaimSocket.entrarConversa === 'function') {
                window.ItaimSocket.entrarConversa(id);
            }

            try {
                localStorage.setItem(estado.STORAGE_KEY_ATIVA, id);
            } catch (e) {}

            try {
                const url = new URL(window.location.href);
                url.searchParams.set('id', id);
                window.history.replaceState({}, '', url.toString());
            } catch (e) {}

            if (dom.chatCentroVazio) dom.chatCentroVazio.style.display = 'none';
            if (dom.chatTopoAtivo) dom.chatTopoAtivo.style.display = 'flex';
            if (dom.feedMensagens) dom.feedMensagens.style.display = 'flex';
            if (dom.formEnvio) dom.formEnvio.style.display = 'flex';

            if (window.ItaimChatLista && typeof window.ItaimChatLista.destacarCardAtivo === 'function') {
                window.ItaimChatLista.destacarCardAtivo(id);
            }

            const promiseMensagens = this.carregarMensagens(id);

            let conv = estado.conversas.find(c => c.id === id);

            if (!conv && window.ItaimApi && window.ItaimApi.chat && typeof window.ItaimApi.chat.obterConversa === 'function') {
                try {
                    const resp = await window.ItaimApi.chat.obterConversa(id);
                    if (resp && resp.success && resp.data) {
                        conv = resp.data;
                        if (!estado.conversas.some(c => c.id === conv.id)) {
                            estado.conversas.unshift(conv);
                            try {
                                localStorage.setItem(estado.STORAGE_KEY_LISTA, JSON.stringify(estado.conversas));
                            } catch (e) {}
                            if (window.ItaimChatLista) window.ItaimChatLista.renderizarListaConversas();
                        }
                    }
                } catch (err) {
                    console.error('[Chat Feed] Erro ao buscar conversa por ID:', err);
                }
            }

            if (!conv) {
                await promiseMensagens;
                if (!estado.mensagensAtivas || estado.mensagensAtivas.length === 0) {
                    estado.exibirEstadoSemConversa();
                }
                return;
            }

            conv.naoLidas = 0;
            if (window.ItaimChatLista) window.ItaimChatLista.destacarCardAtivo(conv.id);

            // 1. Bloqueio visual
            const ehBloqueado = conv.status === 'BLOCKED' || conv.isBlocked;
            const bloqueadoPorMim = conv.blockedById === estado.meuUserId || conv.blockedByMe;

            if (ehBloqueado) {
                if (dom.formEnvio) dom.formEnvio.style.display = 'none';
                if (dom.avisoBloqueio) {
                    dom.avisoBloqueio.style.display = 'flex';
                    if (bloqueadoPorMim) {
                        if (dom.avisoBloqueioTxt) dom.avisoBloqueioTxt.textContent = 'Você bloqueou esta conversa.';
                        if (dom.btnDesbloquearBanner) dom.btnDesbloquearBanner.style.display = 'inline-block';
                    } else {
                        if (dom.avisoBloqueioTxt) dom.avisoBloqueioTxt.textContent = 'Esta conversa foi bloqueada pelo outro usuário.';
                        if (dom.btnDesbloquearBanner) dom.btnDesbloquearBanner.style.display = 'none';
                    }
                }
                if (dom.txtBtnBloquear) dom.txtBtnBloquear.textContent = bloqueadoPorMim ? 'Desbloquear' : 'Bloqueado';
                if (dom.btnToggleBloqueio) {
                    dom.btnToggleBloqueio.classList.add('bloqueado');
                    dom.btnToggleBloqueio.disabled = !bloqueadoPorMim;
                }
            } else {
                if (dom.formEnvio) dom.formEnvio.style.display = 'flex';
                if (dom.avisoBloqueio) dom.avisoBloqueio.style.display = 'none';
                if (dom.txtBtnBloquear) dom.txtBtnBloquear.textContent = 'Bloquear';
                if (dom.btnToggleBloqueio) {
                    dom.btnToggleBloqueio.classList.remove('bloqueado');
                    dom.btnToggleBloqueio.disabled = false;
                }
            }

            // 2. Painel da Direita (Desktop)
            if (dom.painelVazio) dom.painelVazio.style.display = 'none';
            if (dom.painelCard) dom.painelCard.style.display = 'flex';

            // 3. Topo do Contato
            const outro = conv.outroParticipante || {};
            const avatarUrl = utils.resolverFoto(outro.avatar, 'avatar');

            if (dom.headerNome) dom.headerNome.textContent = outro.nome || 'Contato';
            if (dom.headerStatusTxt) dom.headerStatusTxt.textContent = outro.papel || 'Vendedor(a)';
            if (dom.headerAvatar) {
                dom.headerAvatar.src = avatarUrl;
                dom.headerAvatar.onerror = function() {
                    this.onerror = null;
                    this.src = utils.fallbackAvatar;
                };
            }

            const paramsOutro = new URLSearchParams();
            if (outro.id) paramsOutro.set('id', outro.id);
            if (outro.nome) paramsOutro.set('vendedor', outro.nome);
            if (outro.email) paramsOutro.set('email', outro.email);
            if (outro.username) paramsOutro.set('username', outro.username);

            const urlPerfilOutro = window.ItaimRotas
                ? window.ItaimRotas.obterUrl('vendedor', paramsOutro.toString())
                : `../perfil/vendedor.html?${paramsOutro.toString()}`;

            if (dom.linkPerfilConversa) {
                dom.linkPerfilConversa.href = urlPerfilOutro;
                dom.linkPerfilConversa.title = `Ver perfil de ${outro.nome || 'usuário'}`;
            }

            // 4. Painel Detalhes do Produto (Direita)
            const prod = conv.product || {};
            const fotoProd = utils.resolverFoto(prod.imagem || prod.image, 'produto');
            const urlAnuncio = window.ItaimRotas
                ? window.ItaimRotas.obterUrl('produto', `id=${encodeURIComponent(prod.id || conv.productId || '')}`)
                : `../produtos/produto.html?id=${encodeURIComponent(prod.id || conv.productId || '')}`;

            if (dom.painelProdutoFoto) {
                dom.painelProdutoFoto.src = fotoProd;
                dom.painelProdutoFoto.onerror = function() {
                    this.onerror = null;
                    this.src = utils.fallbackProdutoImg;
                };
            }
            if (dom.painelProdutoNome) dom.painelProdutoNome.textContent = prod.titulo || prod.title || 'Produto';
            if (dom.painelProdutoPreco) dom.painelProdutoPreco.innerHTML = utils.formatarPreco(prod.preco ?? prod.price);
            if (dom.painelCidadeTxt) dom.painelCidadeTxt.textContent = `${prod.cidade || 'Paulistana'}, PI`;
            if (dom.painelEspecCondicao) dom.painelEspecCondicao.textContent = prod.condicao || 'USADO';
            if (dom.painelEspecCategoria) dom.painelEspecCategoria.textContent = prod.categoria || 'Geral';
            if (dom.painelProdutoDesc) dom.painelProdutoDesc.textContent = prod.descricao || 'Sem descrição detalhada.';
            if (dom.btnPainelVerAnuncio) dom.btnPainelVerAnuncio.href = urlAnuncio;
            const btnPainelDenunciar = document.getElementById('btn-painel-denunciar-anuncio');
            if (btnPainelDenunciar) {
                const sep = urlAnuncio.includes('?') ? '&' : '?';
                btnPainelDenunciar.href = `${urlAnuncio}${sep}denunciar=1`;
            }

            // 5. Mini Resumo Mobile
            if (dom.mobileResumoBox) {
                dom.mobileResumoBox.style.display = 'flex';
                if (dom.mobileMiniFoto) {
                    dom.mobileMiniFoto.src = fotoProd;
                    dom.mobileMiniFoto.onerror = function() { this.src = utils.fallbackProdutoImg; };
                }
                if (dom.mobileMiniTitulo) dom.mobileMiniTitulo.textContent = prod.titulo || prod.title || 'Produto';
                if (dom.mobileMiniPreco) dom.mobileMiniPreco.innerHTML = utils.formatarPreco(prod.preco ?? prod.price);
                if (dom.mobileMiniLink) dom.mobileMiniLink.href = urlAnuncio;
            }

            // 6. Mobile View
            if (dom.layoutGrid) {
                dom.layoutGrid.classList.add('conversa-aberta-mobile');
            }

            // 7. Focar input no Desktop
            if (window.innerWidth > 768 && dom.inputTexto) {
                dom.inputTexto.disabled = false;
                dom.inputTexto.focus();
            }

            await promiseMensagens;
        }
    };

})(window, document);
