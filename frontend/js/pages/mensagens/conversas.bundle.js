/**
 * ITAIM VENDE - CENTRAL DE MENSAGENS E CHAT (BUNDLE UNIFICADO)
 * Arquivo: frontend/js/pages/mensagens/conversas.js
 * 
 * ATENÇÃO:
 * Este arquivo unifica de forma modular os componentes da pasta:
 *   frontend/js/pages/mensagens/
 * 
 * Módulos integrantes:
 *   - conversas-utils.js: Formatações, horários, fotos e cache local
 *   - conversas-estado.js: Mapeamento de DOM, dados de sessão e telas vazias
 *   - conversas-lista.js: Lista lateral de conversas e busca
 *   - conversas-feed.js: Painel de mensagens, balões e detalhes do produto
 *   - conversas-envio.js: Envio de texto, anexos, lightbox e propostas
 *   - conversas-acoes.js: Bloqueio, polling em tempo real e rotas
 * 
 * Para editar funcionalidades isoladas, edite os arquivos específicos
 * e execute 'npm run build:conversas'.
 */

// ==========================================================================
// MÓDULO: UTILITÁRIOS & FORMATAÇÃO (conversas-utils.js)
// ==========================================================================

/**
 * ITAIM VENDE - CHAT & CONVERSAS: MÓDULO DE UTILITÁRIOS E FORMATAÇÃO
 * Arquivo: frontend/js/pages/mensagens/conversas-utils.js
 * 
 * Funções auxiliares para formatação de moeda, horas amigáveis, resolução de URLs de mídia,
 * ícones de status de envio/leitura e persistência de cache local.
 */

(function (window) {
    'use strict';

    const fallbackAvatar = (window.ItaimRotas && typeof window.ItaimRotas.obterAsset === 'function')
        ? window.ItaimRotas.obterAsset('assets/icons/icon-user.png')
        : '../../assets/icons/icon-user.png';

    const fallbackProdutoImg = (window.ItaimRotas && typeof window.ItaimRotas.obterAsset === 'function')
        ? window.ItaimRotas.obterAsset('assets/placeholders/produto-placeholder.svg')
        : '../../assets/placeholders/produto-placeholder.svg';

    window.ItaimChatUtils = {
        fallbackAvatar,
        fallbackProdutoImg,

        formatarPreco: function (val) {
            const num = Number(val);
            if (isNaN(num) || num <= 0) return 'A combinar';
            return 'R$ ' + num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        },

        formatarHora: function (dataIso) {
            if (!dataIso) return '';
            try {
                const d = new Date(dataIso);
                if (isNaN(d.getTime())) return '';
                const agora = new Date();
                const ehHoje = d.getDate() === agora.getDate() &&
                               d.getMonth() === agora.getMonth() &&
                               d.getFullYear() === agora.getFullYear();

                const horaFormatada = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                if (ehHoje) {
                    return horaFormatada;
                }

                const ontem = new Date(agora);
                ontem.setDate(agora.getDate() - 1);
                const ehOntem = d.getDate() === ontem.getDate() &&
                                d.getMonth() === ontem.getMonth() &&
                                d.getFullYear() === ontem.getFullYear();

                if (ehOntem) {
                    return `Ontem, ${horaFormatada}`;
                }

                return `${d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}, ${horaFormatada}`;
            } catch (e) {
                return '';
            }
        },

        resolverFoto: function (url, tipo = 'avatar') {
            if (!url) return tipo === 'avatar' ? fallbackAvatar : fallbackProdutoImg;
            if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
                return url;
            }
            if (window.ItaimApi && typeof window.ItaimApi.resolverUrlImagem === 'function') {
                return window.ItaimApi.resolverUrlImagem(url);
            }
            if (window.ItaimRotas && typeof window.ItaimRotas.obterAsset === 'function') {
                return window.ItaimRotas.obterAsset(url);
            }
            return url;
        },

        criarSvgCheck: function (lida) {
            if (lida) {
                return `
                    <span class="msg-check-status lida" title="Lida pelo destinatário">
                        <svg viewBox="0 0 16 11" width="14" height="11" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="1.5 5.5 5 9 11 2"></polyline>
                            <polyline points="6 5.5 8.5 8 14.5 2"></polyline>
                        </svg>
                    </span>
                `;
            }
            return `
                <span class="msg-check-status pendente" title="Enviada">
                    <svg viewBox="0 0 16 11" width="11" height="11" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="2 6 6 9.5 14 2"></polyline>
                    </svg>
                </span>
            `;
        },

        carregarMensagensCacheLocal: function (convId, storagePrefix) {
            if (!convId || !storagePrefix) return null;
            try {
                const raw = localStorage.getItem(storagePrefix + convId);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
                }
            } catch (e) {}
            return null;
        },

        salvarMensagensCacheLocal: function (convId, msgs, storagePrefix) {
            if (!convId || !storagePrefix || !Array.isArray(msgs)) return;
            try {
                // Guarda até 50 mensagens por conversa para evitar extrapolar cota
                const slice = msgs.slice(-50);
                localStorage.setItem(storagePrefix + convId, JSON.stringify(slice));
            } catch (e) {}
        }
    };

})(window);


// ==========================================================================
// MÓDULO: ESTADO & TELAS DE VISITA (conversas-estado.js)
// ==========================================================================

/**
 * ITAIM VENDE - CHAT & CONVERSAS: MÓDULO DE ESTADO E TELAS DE VISITA
 * Arquivo: frontend/js/pages/mensagens/conversas-estado.js
 * 
 * Gerencia os elementos do DOM, variáveis de estado centralizadas,
 * chaves de cache e os estados visuais (não autenticado, sem conversa selecionada).
 */

(function (window, document) {
    'use strict';

    window.ItaimChatEstado = {
        // Elementos do DOM mapeados
        dom: {},

        // Estado em memória
        conversas: [],
        conversaAtivaId: null,
        mensagensAtivas: [],
        enviandoMensagem: false,
        intervaloPolling: null,
        contadorTicks: 0,
        mensagensCache: new Map(),

        // Credenciais e Usuário
        token: '',
        usuarioLogado: null,
        meuUserId: null,

        // Chaves de armazenamento
        STORAGE_KEY_LISTA: '',
        STORAGE_KEY_ATIVA: '',
        STORAGE_KEY_MSGS_PREFIX: '',

        inicializar: function () {
            this.dom = {
                layoutGrid: document.getElementById('chat-layout-grid'),
                listaScroll: document.getElementById('chat-lista-scroll'),
                buscaInput: document.getElementById('input-busca-conversas'),

                // Topo da Conversa
                chatTopoAtivo: document.getElementById('chat-topo-ativo'),
                headerAvatar: document.getElementById('chat-header-avatar'),
                headerNome: document.getElementById('chat-header-nome'),
                headerStatusTxt: document.getElementById('chat-header-status-txt'),
                linkPerfilConversa: document.getElementById('chat-perfil-conversa'),
                btnVoltarMobile: document.getElementById('btn-voltar-mobile-chat'),

                // Mini Resumo do Produto (Mobile)
                mobileResumoBox: document.getElementById('mobile-resumo-produto-topo'),
                mobileMiniFoto: document.getElementById('mobile-mini-foto'),
                mobileMiniTitulo: document.getElementById('mobile-mini-titulo'),
                mobileMiniPreco: document.getElementById('mobile-mini-preco'),
                mobileMiniLink: document.getElementById('mobile-mini-link-anuncio'),

                // Centro / Feed / Form
                chatCentroVazio: document.getElementById('chat-centro-vazio'),
                feedMensagens: document.getElementById('chat-feed-mensagens'),
                formEnvio: document.getElementById('form-chat-envio'),
                inputTexto: document.getElementById('chat-input-texto'),
                btnEnviarMsg: document.getElementById('btn-enviar-mensagem'),

                // Detalhes do Produto (Desktop)
                painelVazio: document.getElementById('chat-produto-vazio-estado'),
                painelCard: document.getElementById('chat-produto-card'),
                painelProdutoFoto: document.getElementById('painel-produto-foto'),
                painelProdutoNome: document.getElementById('painel-produto-nome'),
                painelProdutoPreco: document.getElementById('painel-produto-preco'),
                painelCidadeTxt: document.getElementById('painel-produto-cidade-txt'),
                painelEspecCondicao: document.getElementById('painel-espec-condicao'),
                painelEspecCategoria: document.getElementById('painel-espec-categoria'),
                painelProdutoDesc: document.getElementById('painel-produto-desc'),
                btnPainelVerAnuncio: document.getElementById('btn-painel-ver-anuncio'),

                // Avisos e Modais
                avisoBloqueio: document.getElementById('chat-aviso-bloqueio'),
                avisoBloqueioTxt: document.getElementById('chat-aviso-bloqueio-texto'),
                btnDesbloquearBanner: document.getElementById('btn-desbloquear-banner'),
                txtBtnBloquear: document.getElementById('txt-btn-bloquear'),
                btnToggleBloqueio: document.getElementById('btn-toggle-bloqueio-chat')
            };

            // Suporte automático ao Modo Dev Front-End (Live Server)
            if (window.ItaimSessao && typeof window.ItaimSessao.isModoDevFrontend === 'function' && window.ItaimSessao.isModoDevFrontend()) {
                window.ItaimSessao.garantirSessaoDevFrontend();
            }

            this.token = (window.ItaimApi?.auth?.obterToken && window.ItaimApi.auth.obterToken()) ||
                         localStorage.getItem('itaim_token') ||
                         '';

            this.usuarioLogado = (window.ItaimSessao && typeof window.ItaimSessao.obterUsuarioLogado === 'function')
                ? window.ItaimSessao.obterUsuarioLogado()
                : null;

            if (!this.usuarioLogado) {
                try {
                    this.usuarioLogado = JSON.parse(localStorage.getItem('itaim_usuario_logado') || 'null');
                } catch (e) {
                    this.usuarioLogado = null;
                }
            }

            this.meuUserId = this.usuarioLogado?.id || null;

            this.STORAGE_KEY_LISTA = `itaim_chat_conversas_${this.meuUserId || 'anon'}`;
            this.STORAGE_KEY_ATIVA = `itaim_chat_ativa_${this.meuUserId || 'anon'}`;
            this.STORAGE_KEY_MSGS_PREFIX = `itaim_chat_msgs_${this.meuUserId || 'anon'}_`;
        },

        exibirEstadoNaoAutenticado: function () {
            const dom = this.dom;
            if (dom.listaScroll) {
                dom.listaScroll.innerHTML = `
                    <div class="chat-vazio-box" style="padding: 40px 18px; text-align: center;">
                        <div class="chat-vazio-icone">
                            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                        </div>
                        <div class="chat-vazio-titulo">Acesso restrito</div>
                        <p class="chat-vazio-desc">Faça login para ver suas conversas e negociar com compradores e vendedores.</p>
                        <a href="${window.ItaimRotas ? window.ItaimRotas.obterUrl('login') : '../../index.html'}" class="btn-voltar-chat" style="display: inline-flex; justify-content: center; width: auto; margin: 0 auto; background-color: var(--chat-primary); border-color: var(--chat-primary);">
                            Entrar na minha conta
                        </a>
                    </div>
                `;
            }

            if (dom.chatCentroVazio) {
                dom.chatCentroVazio.innerHTML = `
                    <div class="chat-centro-vazio-icone">
                        <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                    </div>
                    <h3>Faça login para continuar</h3>
                    <p>Suas mensagens e negociações seguras ficam armazenadas em sua conta.</p>
                    <a href="${window.ItaimRotas ? window.ItaimRotas.obterUrl('login') : '../../index.html'}" class="btn-centro-explorar">
                        Fazer Login / Cadastrar
                    </a>
                `;
                dom.chatCentroVazio.style.display = 'flex';
            }

            if (dom.chatTopoAtivo) dom.chatTopoAtivo.style.display = 'none';
            if (dom.feedMensagens) dom.feedMensagens.style.display = 'none';
            if (dom.formEnvio) dom.formEnvio.style.display = 'none';
            if (dom.painelVazio) dom.painelVazio.style.display = 'flex';
            if (dom.painelCard) dom.painelCard.style.display = 'none';
        },

        exibirEstadoSemConversa: function () {
            this.conversaAtivaId = null;
            try {
                localStorage.removeItem(this.STORAGE_KEY_ATIVA);
            } catch (e) {}
            document.documentElement.classList.remove('chat-conversa-ativa-esperada');

            const dom = this.dom;
            if (dom.chatTopoAtivo) dom.chatTopoAtivo.style.display = 'none';
            if (dom.feedMensagens) dom.feedMensagens.style.display = 'none';
            if (dom.formEnvio) dom.formEnvio.style.display = 'none';
            if (dom.avisoBloqueio) dom.avisoBloqueio.style.display = 'none';
            if (dom.mobileResumoBox) dom.mobileResumoBox.style.display = 'none';
            if (dom.chatCentroVazio) dom.chatCentroVazio.style.display = 'flex';

            if (dom.painelVazio) dom.painelVazio.style.display = 'flex';
            if (dom.painelCard) dom.painelCard.style.display = 'none';

            if (window.ItaimChatLista && typeof window.ItaimChatLista.destacarCardAtivo === 'function') {
                window.ItaimChatLista.destacarCardAtivo(null);
            }
        }
    };

})(window, document);


// ==========================================================================
// MÓDULO: LISTA DE CONVERSAS (COLUNA 1) (conversas-lista.js)
// ==========================================================================

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


// ==========================================================================
// MÓDULO: FEED DE MENSAGENS & PRODUTO (COLUNAS 2 E 3) (conversas-feed.js)
// ==========================================================================

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

            estado.conversaAtivaId = id;
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

            const urlPerfilOutro = window.ItaimRotas
                ? window.ItaimRotas.obterUrl('vendedor', `id=${encodeURIComponent(outro.id || '')}&vendedor=${encodeURIComponent(outro.nome || '')}`)
                : `../perfil/vendedor.html?id=${encodeURIComponent(outro.id || '')}&vendedor=${encodeURIComponent(outro.nome || '')}`;

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


// ==========================================================================
// MÓDULO: ENVIO, FOTOS E PROPOSTAS (conversas-envio.js)
// ==========================================================================

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


// ==========================================================================
// MÓDULO: AÇÕES, BLOQUEIO E POLLING (conversas-acoes.js)
// ==========================================================================

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


// ==========================================================================
// INICIALIZADOR GLOBAL DO CHAT
// ==========================================================================

document.addEventListener('DOMContentLoaded', async () => {
    if (window.ItaimChatEstado) window.ItaimChatEstado.inicializar();
    if (!window.ItaimChatEstado?.token) {
        if (window.ItaimChatEstado) window.ItaimChatEstado.exibirEstadoNaoAutenticado();
        return;
    }
    if (window.ItaimChatLista) window.ItaimChatLista.inicializar();
    if (window.ItaimChatEnvio) window.ItaimChatEnvio.inicializar();
    if (window.ItaimChatAcoes) {
        window.ItaimChatAcoes.inicializarEventos();
        await window.ItaimChatAcoes.processarInicializacaoRotas();
    }
});
