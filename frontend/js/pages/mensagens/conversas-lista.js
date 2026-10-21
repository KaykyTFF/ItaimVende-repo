/**
 * ITAIM VENDE - CHAT & CONVERSAS: MÓDULO DA LISTA DE CONVERSAS (COLUNA 1)
 * Arquivo: frontend/js/pages/mensagens/conversas-lista.js
 * 
 * Gerencia a listagem de conversas na barra lateral esquerda, busca em tempo real,
 * destaque do card ativo e badges de mensagens não lidas.
 */

(function (window, document) {
    'use strict';

    window.ItaimChatLista = {
        destacarCardAtivo: function (id) {
            const listaScroll = window.ItaimChatEstado?.dom?.listaScroll;
            if (!listaScroll) return;
            listaScroll.querySelectorAll('.chat-card-item').forEach(el => {
                if (el.getAttribute('data-conv-id') === id) {
                    el.classList.add('ativo');
                    const badge = el.querySelector('.chat-badge-nao-lida');
                    if (badge) badge.remove();
                } else {
                    el.classList.remove('ativo');
                }
            });
        },

        carregarListaConversas: async function (selecionarIdAposCarga = null) {
            const estado = window.ItaimChatEstado;
            const listaScroll = estado?.dom?.listaScroll;
            if (!listaScroll) return;

            // Se for a primeira carga e a lista estiver vazia, exibe shimmer sutil
            if (estado.conversas.length === 0) {
                listaScroll.innerHTML = `
                    <div style="padding: 24px 18px; text-align: center; color: #8E9AA7; font-size: 13.5px;">
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" style="animation: spin 0.8s linear infinite; margin-bottom: 8px;">
                            <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
                            <path d="M12 2a10 10 0 0 1 10 10"></path>
                        </svg>
                        <div>Carregando suas mensagens...</div>
                    </div>
                `;
            }

            try {
                let conversasObtidas = null;

                if (window.ItaimApi && window.ItaimApi.chat && typeof window.ItaimApi.chat.listarConversas === 'function') {
                    const resp = await window.ItaimApi.chat.listarConversas();
                    if (resp && resp.success && Array.isArray(resp.data)) {
                        conversasObtidas = resp.data;
                    }
                }

                // Fallback para Modo Dev / Live Server se a API não retornou
                if (!conversasObtidas || conversasObtidas.length === 0) {
                    const isDev = (window.ItaimSessao && typeof window.ItaimSessao.isModoDevFrontend === 'function' && window.ItaimSessao.isModoDevFrontend())
                        || (window.ItaimSessaoAuth && typeof window.ItaimSessaoAuth.isModoDevFrontend === 'function' && window.ItaimSessaoAuth.isModoDevFrontend());
                    if (isDev && (!conversasObtidas || conversasObtidas.length === 0)) {
                        conversasObtidas = [
                            {
                                id: 'conv_dev_01',
                                status: 'ACTIVE',
                                isBlocked: false,
                                dataUltimaMensagem: new Date().toISOString(),
                                ultimaMensagem: 'Olá! Ainda está disponível para negociar?',
                                naoLidas: 1,
                                outroParticipante: {
                                    id: 'cmv5iacmv0000ttiwu9wtemar',
                                    nome: 'Admin',
                                    papel: 'Vendedor Verificado',
                                    avatar: 'assets/icons/icon-user.png'
                                },
                                product: {
                                    id: 'mock_1',
                                    titulo: 'iPhone 13 Pro 128GB Grafite - Impecável com Caixa',
                                    preco: 3450,
                                    cidade: 'Paulistana',
                                    categoria: 'Eletrônicos',
                                    condicao: 'Usado - Excelente',
                                    descricao: 'Aparelho 100% original, bateria com 89% de saúde, sem marcas ou arranhões.',
                                    imagem: 'assets/produtos/anuncio_11.jpg'
                                }
                            }
                        ];
                    }
                }

                if (Array.isArray(conversasObtidas)) {
                    estado.conversas = conversasObtidas;
                    try {
                        localStorage.setItem(estado.STORAGE_KEY_LISTA, JSON.stringify(estado.conversas));
                    } catch (e) {}

                    this.renderizarListaConversas(estado.dom.buscaInput?.value || '');

                    if (selecionarIdAposCarga) {
                        if (window.ItaimChatFeed && typeof window.ItaimChatFeed.selecionarConversa === 'function') {
                            window.ItaimChatFeed.selecionarConversa(selecionarIdAposCarga);
                        }
                    } else if (estado.conversaAtivaId) {
                        const aindaExiste = estado.conversas.find(c => c.id === estado.conversaAtivaId);
                        if (aindaExiste) {
                            this.destacarCardAtivo(estado.conversaAtivaId);
                        }
                    }
                } else {
                    throw new Error('Falha ao obter conversas');
                }
            } catch (err) {
                console.error('[Chat Lista] Erro ao listar conversas:', err);
                if (estado.conversas.length === 0) {
                    listaScroll.innerHTML = `
                        <div class="chat-vazio-box">
                            <div class="chat-vazio-icone">
                                <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                            </div>
                            <div class="chat-vazio-titulo">Erro de conexão</div>
                            <p class="chat-vazio-desc">Não foi possível carregar as conversas no momento.</p>
                            <button type="button" class="btn-voltar-chat" id="btn-recarregar-conversas" style="margin: 0 auto;">Tentar novamente</button>
                        </div>
                    `;
                    document.getElementById('btn-recarregar-conversas')?.addEventListener('click', () => this.carregarListaConversas());
                }
            }
        },

        renderizarListaConversas: function (filtro = '') {
            const estado = window.ItaimChatEstado;
            const listaScroll = estado?.dom?.listaScroll;
            const utils = window.ItaimChatUtils;
            if (!listaScroll) return;

            listaScroll.innerHTML = '';

            const termo = filtro.toLowerCase().trim();
            const filtradas = estado.conversas.filter(c => {
                const nomeOutro = (c.outroParticipante?.nome || '').toLowerCase();
                const tituloProd = (c.product?.titulo || c.product?.title || '').toLowerCase();
                return nomeOutro.includes(termo) || tituloProd.includes(termo);
            });

            if (filtradas.length === 0) {
                if (termo !== '') {
                    listaScroll.innerHTML = `
                        <div class="chat-vazio-box">
                            <div class="chat-vazio-icone">
                                <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                            </div>
                            <div class="chat-vazio-titulo">Nenhum resultado</div>
                            <p class="chat-vazio-desc">Nenhuma conversa encontrada para "${filtro}".</p>
                        </div>
                    `;
                } else {
                    listaScroll.innerHTML = `
                        <div class="chat-vazio-box">
                            <div class="chat-vazio-icone">
                                <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                </svg>
                            </div>
                            <div class="chat-vazio-titulo">Nenhuma conversa ainda</div>
                            <p class="chat-vazio-desc">Quando você encontrar um produto e clicar em <strong>"Chat com o vendedor"</strong>, suas negociações aparecerão aqui.</p>
                            <a href="${window.ItaimRotas ? window.ItaimRotas.obterUrl('home') : '../home/home.html'}" class="btn-voltar-chat" style="display: inline-flex; justify-content: center; width: auto; margin: 0 auto;">
                                Explorar anúncios
                            </a>
                        </div>
                    `;
                }
                return;
            }

            filtradas.forEach(c => {
                const card = document.createElement('div');
                card.className = `chat-card-item ${c.id === estado.conversaAtivaId ? 'ativo' : ''}`;
                card.setAttribute('data-conv-id', c.id);

                const outro = c.outroParticipante || {};
                const prod = c.product || {};
                const avatarUrl = utils.resolverFoto(outro.avatar, 'avatar');
                const horaFormatada = utils.formatarHora(c.dataUltimaMensagem);
                const naoLidas = Number(c.naoLidas) || 0;

                const avatarWrap = document.createElement('div');
                avatarWrap.className = 'chat-avatar-wrap';

                const avatarImg = document.createElement('img');
                avatarImg.src = avatarUrl;
                avatarImg.alt = outro.nome || 'Contato';
                avatarImg.className = 'chat-card-avatar';
                avatarImg.onerror = function() {
                    this.onerror = null;
                    this.src = utils.fallbackAvatar;
                };
                avatarWrap.appendChild(avatarImg);

                const detalhesBox = document.createElement('div');
                detalhesBox.className = 'chat-card-detalhes';

                const linhaTopo = document.createElement('div');
                linhaTopo.className = 'chat-card-linha-topo';

                const nomeEl = document.createElement('strong');
                nomeEl.className = 'chat-card-nome';
                nomeEl.textContent = outro.nome || 'Usuário';

                const horaEl = document.createElement('span');
                horaEl.className = 'chat-card-hora';
                horaEl.textContent = horaFormatada;

                linhaTopo.appendChild(nomeEl);
                linhaTopo.appendChild(horaEl);

                const anuncioTag = document.createElement('div');
                anuncioTag.className = 'chat-card-anuncio-tag';
                anuncioTag.textContent = prod.titulo || prod.title || 'Anúncio';

                const linhaBase = document.createElement('div');
                linhaBase.className = 'chat-card-linha-base';

                const previewMsg = document.createElement('p');
                previewMsg.className = 'chat-card-preview';
                previewMsg.textContent = c.ultimaMensagem || 'Conversa iniciada';

                linhaBase.appendChild(previewMsg);

                if (naoLidas > 0) {
                    const badge = document.createElement('span');
                    badge.className = 'chat-badge-nao-lida';
                    badge.textContent = naoLidas;
                    linhaBase.appendChild(badge);
                }

                detalhesBox.appendChild(linhaTopo);
                detalhesBox.appendChild(anuncioTag);
                detalhesBox.appendChild(linhaBase);

                card.appendChild(avatarWrap);
                card.appendChild(detalhesBox);

                card.addEventListener('click', () => {
                    if (window.ItaimChatFeed && typeof window.ItaimChatFeed.selecionarConversa === 'function') {
                        window.ItaimChatFeed.selecionarConversa(c.id);
                    }
                });

                listaScroll.appendChild(card);
            });
        },

        inicializar: function () {
            const buscaInput = window.ItaimChatEstado?.dom?.buscaInput;
            if (buscaInput) {
                buscaInput.addEventListener('input', (e) => {
                    this.renderizarListaConversas(e.target.value);
                });
            }
        }
    };

})(window, document);
