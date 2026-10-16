/**
 * ITAIM VENDE - CENTRAL DE MENSAGENS E CHAT (CONVERSAS.JS)
 * Integração 100% Real com a API do Backend & Banco de Dados PostgreSQL
 * Suporte a multiusuários, mensagens em tempo real, proteção contra XSS e responsividade total
 */

document.addEventListener('DOMContentLoaded', async () => {
    'use strict';

    // -------------------------------------------------------------------------
    // 1. ELEMENTOS DA INTERFACE (DOM)
    // -------------------------------------------------------------------------
    const layoutGrid = document.getElementById('chat-layout-grid');
    const listaScroll = document.getElementById('chat-lista-scroll');
    const buscaInput = document.getElementById('input-busca-conversas');

    // Coluna Central - Topo Ativo
    const chatTopoAtivo = document.getElementById('chat-topo-ativo');
    const headerAvatar = document.getElementById('chat-header-avatar');
    const headerNome = document.getElementById('chat-header-nome');
    const headerStatusTxt = document.getElementById('chat-header-status-txt');
    const linkPerfilConversa = document.getElementById('chat-perfil-conversa');
    const btnVoltarMobile = document.getElementById('btn-voltar-mobile-chat');

    // Mini Resumo do Produto no Topo (Mobile)
    const mobileResumoBox = document.getElementById('mobile-resumo-produto-topo');
    const mobileMiniFoto = document.getElementById('mobile-mini-foto');
    const mobileMiniTitulo = document.getElementById('mobile-mini-titulo');
    const mobileMiniPreco = document.getElementById('mobile-mini-preco');
    const mobileMiniLink = document.getElementById('mobile-mini-link-anuncio');

    // Coluna Central - Feed e Formulário de Envio
    const chatCentroVazio = document.getElementById('chat-centro-vazio');
    const feedMensagens = document.getElementById('chat-feed-mensagens');
    const formEnvio = document.getElementById('form-chat-envio');
    const inputTexto = document.getElementById('chat-input-texto');
    const btnEnviarMsg = document.getElementById('btn-enviar-mensagem');

    // Coluna Direita - Detalhes do Produto (Desktop)
    const painelVazio = document.getElementById('chat-produto-vazio-estado');
    const painelCard = document.getElementById('chat-produto-card');
    const painelProdutoFoto = document.getElementById('painel-produto-foto');
    const painelProdutoNome = document.getElementById('painel-produto-nome');
    const painelProdutoPreco = document.getElementById('painel-produto-preco');
    const painelCidadeTxt = document.getElementById('painel-produto-cidade-txt');
    const painelEspecCondicao = document.getElementById('painel-espec-condicao');
    const painelEspecCategoria = document.getElementById('painel-espec-categoria');
    const painelProdutoDesc = document.getElementById('painel-produto-desc');
    const btnPainelVerAnuncio = document.getElementById('btn-painel-ver-anuncio');

    // -------------------------------------------------------------------------
    // 2. ESTADO DO CHAT
    // -------------------------------------------------------------------------
    let conversas = [];
    let conversaAtivaId = null;
    let mensagensAtivas = [];
    let enviandoMensagem = false;
    let intervaloPolling = null;
    let contadorTicks = 0;

    const fallbackAvatar = (window.ItaimRotas && typeof window.ItaimRotas.obterAsset === 'function')
        ? window.ItaimRotas.obterAsset('assets/icons/icon-user.png')
        : '../../assets/icons/icon-user.png';

    const fallbackProdutoImg = (window.ItaimRotas && typeof window.ItaimRotas.obterAsset === 'function')
        ? window.ItaimRotas.obterAsset('assets/placeholders/produto-placeholder.svg')
        : '../../assets/placeholders/produto-placeholder.svg';

    // Obtém usuário logado do cliente
    const token = window.ItaimApi?.auth?.obterToken();
    const usuarioLogado = window.ItaimSessao ? window.ItaimSessao.obterUsuarioLogado() : null;
    const meuUserId = usuarioLogado?.id || null;

    // -------------------------------------------------------------------------
    // 3. HELPERS DE FORMATAÇÃO E RESOLUÇÃO
    // -------------------------------------------------------------------------
    function formatarPreco(val) {
        if (val === 0 || val === '0' || val === null || val === undefined) {
            return '<span style="color: #44BD32; font-weight: 800;">Grátis / Doação</span>';
        }
        return Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    function formatarHora(dataIso) {
        if (!dataIso) return '';
        try {
            const data = new Date(dataIso);
            if (isNaN(data.getTime())) return '';
            const hoje = new Date();
            const ehHoje = data.getDate() === hoje.getDate() &&
                           data.getMonth() === hoje.getMonth() &&
                           data.getFullYear() === hoje.getFullYear();

            if (ehHoje) {
                return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            }
            return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        } catch (e) {
            return '';
        }
    }

    function resolverFoto(url, tipo = 'avatar') {
        if (!url) return tipo === 'avatar' ? fallbackAvatar : fallbackProdutoImg;
        if (window.ItaimApi && typeof window.ItaimApi.resolverUrlImagem === 'function') {
            return window.ItaimApi.resolverUrlImagem(url);
        }
        if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
        if (window.ItaimRotas && typeof window.ItaimRotas.obterAsset === 'function') {
            return window.ItaimRotas.obterAsset(url);
        }
        return url;
    }

    function criarSvgCheck(lida) {
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
    }

    // -------------------------------------------------------------------------
    // 4. VERIFICAÇÃO DE AUTENTICAÇÃO
    // -------------------------------------------------------------------------
    if (!token) {
        exibirEstadoNaoAutenticado();
        return;
    }

    function exibirEstadoNaoAutenticado() {
        if (listaScroll) {
            listaScroll.innerHTML = `
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

        if (chatCentroVazio) {
            chatCentroVazio.innerHTML = `
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
            chatCentroVazio.style.display = 'flex';
        }

        if (chatTopoAtivo) chatTopoAtivo.style.display = 'none';
        if (feedMensagens) feedMensagens.style.display = 'none';
        if (formEnvio) formEnvio.style.display = 'none';
        if (painelVazio) painelVazio.style.display = 'flex';
        if (painelCard) painelCard.style.display = 'none';
    }

    // -------------------------------------------------------------------------
    // 5. CARREGAR CONVERSAS DO BACKEND
    // -------------------------------------------------------------------------
    async function carregarListaConversas(selecionarIdAposCarga = null) {
        try {
            if (!listaScroll) return;

            // Se for a primeira carga e a lista estiver vazia, exibe shimmer sutil
            if (conversas.length === 0) {
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

            const resp = await window.ItaimApi.chat.listarConversas();
            if (resp && resp.success && Array.isArray(resp.data)) {
                conversas = resp.data;
                renderizarListaConversas(buscaInput?.value || '');

                if (selecionarIdAposCarga) {
                    selecionarConversa(selecionarIdAposCarga);
                } else if (conversaAtivaId) {
                    // Mantém a conversa ativa atualizada
                    const aindaExiste = conversas.find(c => c.id === conversaAtivaId);
                    if (aindaExiste) {
                        destacarCardAtivo(conversaAtivaId);
                    }
                }
            } else {
                throw new Error(resp?.message || 'Falha ao buscar conversas');
            }
        } catch (err) {
            console.error('Erro ao listar conversas da API:', err);
            if (conversas.length === 0) {
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
                document.getElementById('btn-recarregar-conversas')?.addEventListener('click', () => carregarListaConversas());
            }
        }
    }

    // -------------------------------------------------------------------------
    // 6. RENDERIZAR LISTA LATERAL DE CONVERSAS (COLUNA 1)
    // -------------------------------------------------------------------------
    function renderizarListaConversas(filtro = '') {
        if (!listaScroll) return;
        listaScroll.innerHTML = '';

        const termo = filtro.toLowerCase().trim();
        const filtradas = conversas.filter(c => {
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
            card.className = `chat-card-item ${c.id === conversaAtivaId ? 'ativo' : ''}`;
            card.setAttribute('data-conv-id', c.id);

            const outro = c.outroParticipante || {};
            const prod = c.product || {};
            const avatarUrl = resolverFoto(outro.avatar, 'avatar');
            const horaFormatada = formatarHora(c.dataUltimaMensagem);
            const naoLidas = Number(c.naoLidas) || 0;

            const avatarWrap = document.createElement('div');
            avatarWrap.className = 'chat-avatar-wrap';

            const avatarImg = document.createElement('img');
            avatarImg.src = avatarUrl;
            avatarImg.alt = outro.nome || 'Contato';
            avatarImg.className = 'chat-card-avatar';
            avatarImg.onerror = function() {
                this.onerror = null;
                this.src = fallbackAvatar;
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
                selecionarConversa(c.id);
            });

            listaScroll.appendChild(card);
        });
    }

    function destacarCardAtivo(id) {
        if (!listaScroll) return;
        listaScroll.querySelectorAll('.chat-card-item').forEach(el => {
            if (el.getAttribute('data-conv-id') === id) {
                el.classList.add('ativo');
                // Remove badge de não lidas visualmente ao abrir
                const badge = el.querySelector('.chat-badge-nao-lida');
                if (badge) badge.remove();
            } else {
                el.classList.remove('ativo');
            }
        });
    }

    // -------------------------------------------------------------------------
    // 7. EXIBIR ESTADO SEM CONVERSA SELECIONADA
    // -------------------------------------------------------------------------
    function exibirEstadoSemConversa() {
        conversaAtivaId = null;

        if (chatTopoAtivo) chatTopoAtivo.style.display = 'none';
        if (feedMensagens) feedMensagens.style.display = 'none';
        if (formEnvio) formEnvio.style.display = 'none';
        if (mobileResumoBox) mobileResumoBox.style.display = 'none';
        if (chatCentroVazio) chatCentroVazio.style.display = 'flex';

        if (painelVazio) painelVazio.style.display = 'flex';
        if (painelCard) painelCard.style.display = 'none';

        destacarCardAtivo(null);
    }

    // -------------------------------------------------------------------------
    // 8. SELECIONAR E ABRIR UMA CONVERSA
    // -------------------------------------------------------------------------
    async function selecionarConversa(id) {
        if (!id) {
            exibirEstadoSemConversa();
            return;
        }

        conversaAtivaId = id;
        let conv = conversas.find(c => c.id === id);

        // Se a conversa não estava na lista (ex: recém-criada via produto), busca na API
        if (!conv) {
            try {
                const resp = await window.ItaimApi.chat.obterConversa(id);
                if (resp && resp.success && resp.data) {
                    conv = resp.data;
                    conversas.unshift(conv);
                    renderizarListaConversas(buscaInput?.value || '');
                }
            } catch (err) {
                console.error('Erro ao buscar conversa por ID:', err);
            }
        }

        if (!conv) {
            exibirEstadoSemConversa();
            return;
        }

        // Zera o contador de não lidas localmente
        conv.naoLidas = 0;
        destacarCardAtivo(conv.id);

        // Atualiza URL sem recarregar a página para permitir compartilhamento ou refresh
        try {
            const url = new URL(window.location.href);
            url.searchParams.set('id', conv.id);
            window.history.replaceState({}, '', url.toString());
        } catch (e) {}

        // 1. Exibir componentes centrais
        if (chatCentroVazio) chatCentroVazio.style.display = 'none';
        if (chatTopoAtivo) chatTopoAtivo.style.display = 'flex';
        if (feedMensagens) feedMensagens.style.display = 'flex';
        if (formEnvio) formEnvio.style.display = 'flex';

        // 2. Exibir painel da direita (Desktop)
        if (painelVazio) painelVazio.style.display = 'none';
        if (painelCard) painelCard.style.display = 'flex';

        // 3. Atualizar dados do Contato no Topo
        const outro = conv.outroParticipante || {};
        const avatarUrl = resolverFoto(outro.avatar, 'avatar');

        if (headerNome) headerNome.textContent = outro.nome || 'Contato';
        if (headerStatusTxt) headerStatusTxt.textContent = outro.papel || 'Vendedor(a)';
        if (headerAvatar) {
            headerAvatar.src = avatarUrl;
            headerAvatar.onerror = function() {
                this.onerror = null;
                this.src = fallbackAvatar;
            };
        }

        // Link para o perfil do interlocutor
        const urlPerfilOutro = window.ItaimRotas
            ? window.ItaimRotas.obterUrl('vendedor', `id=${encodeURIComponent(outro.id || '')}&vendedor=${encodeURIComponent(outro.nome || '')}`)
            : `../perfil/vendedor.html?id=${encodeURIComponent(outro.id || '')}&vendedor=${encodeURIComponent(outro.nome || '')}`;

        if (linkPerfilConversa) {
            linkPerfilConversa.href = urlPerfilOutro;
            linkPerfilConversa.title = `Ver perfil de ${outro.nome || 'usuário'}`;
        }

        // 4. Atualizar Painel de Detalhes do Produto (Direita)
        const prod = conv.product || {};
        const fotoProd = resolverFoto(prod.imagem || prod.image, 'produto');
        const urlAnuncio = window.ItaimRotas
            ? window.ItaimRotas.obterUrl('produto', `id=${encodeURIComponent(prod.id || conv.productId || '')}`)
            : `../produtos/produto.html?id=${encodeURIComponent(prod.id || conv.productId || '')}`;

        if (painelProdutoFoto) {
            painelProdutoFoto.src = fotoProd;
            painelProdutoFoto.onerror = function() {
                this.onerror = null;
                this.src = fallbackProdutoImg;
            };
        }
        if (painelProdutoNome) painelProdutoNome.textContent = prod.titulo || prod.title || 'Produto';
        if (painelProdutoPreco) painelProdutoPreco.innerHTML = formatarPreco(prod.preco ?? prod.price);
        if (painelCidadeTxt) painelCidadeTxt.textContent = `${prod.cidade || 'Paulistana'}, PI`;
        if (painelEspecCondicao) painelEspecCondicao.textContent = prod.condicao || 'USADO';
        if (painelEspecCategoria) painelEspecCategoria.textContent = prod.categoria || 'Geral';
        if (painelProdutoDesc) painelProdutoDesc.textContent = prod.descricao || 'Sem descrição detalhada.';
        if (btnPainelVerAnuncio) btnPainelVerAnuncio.href = urlAnuncio;
        const btnPainelDenunciar = document.getElementById('btn-painel-denunciar-anuncio');
        if (btnPainelDenunciar) {
            const sep = urlAnuncio.includes('?') ? '&' : '?';
            btnPainelDenunciar.href = `${urlAnuncio}${sep}denunciar=1`;
        }

        // 5. Atualizar Mini Resumo no Topo (Mobile)
        if (mobileResumoBox) {
            mobileResumoBox.style.display = 'flex';
            if (mobileMiniFoto) {
                mobileMiniFoto.src = fotoProd;
                mobileMiniFoto.onerror = function() { this.src = fallbackProdutoImg; };
            }
            if (mobileMiniTitulo) mobileMiniTitulo.textContent = prod.titulo || prod.title || 'Produto';
            if (mobileMiniPreco) mobileMiniPreco.innerHTML = formatarPreco(prod.preco ?? prod.price);
            if (mobileMiniLink) mobileMiniLink.href = urlAnuncio;
        }

        // 6. No Celular: Ativa a visão de mensagens
        if (layoutGrid) {
            layoutGrid.classList.add('conversa-aberta-mobile');
        }

        // 7. Focar campo de texto no Desktop
        if (window.innerWidth > 768 && inputTexto) {
            inputTexto.disabled = false;
            inputTexto.focus();
        }

        // 8. Carregar mensagens da conversa
        await carregarMensagens(conv.id);
    }

    // -------------------------------------------------------------------------
    // 9. CARREGAR E RENDERIZAR MENSAGENS (COLUNA 2)
    // -------------------------------------------------------------------------
    async function carregarMensagens(convId, manterPosicaoScroll = false) {
        if (!feedMensagens || !convId) return;

        try {
            const resp = await window.ItaimApi.chat.obterMensagens(convId);
            if (resp && resp.success && Array.isArray(resp.data)) {
                // Confirma se o usuário não mudou de conversa enquanto a requisição acontecia
                if (conversaAtivaId !== convId) return;

                mensagensAtivas = resp.data;
                renderizarFeedMensagens(mensagensAtivas, manterPosicaoScroll);
            }
        } catch (err) {
            console.error('Erro ao carregar mensagens:', err);
        }
    }

    function renderizarFeedMensagens(msgs, manterPosicaoScroll = false) {
        if (!feedMensagens) return;

        const conv = conversas.find(c => c.id === conversaAtivaId);
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
            const souEu = (m.eMeu === true || m.senderId === meuUserId);
            const balao = document.createElement('div');
            balao.className = `msg-balao ${souEu ? 'enviada' : 'recebida'}`;
            if (m.tempId) balao.setAttribute('data-temp-id', m.tempId);

            const textoP = document.createElement('p');
            textoP.className = 'msg-texto';
            textoP.textContent = m.content || ''; // Previne XSS com textContent

            const metadadosBox = document.createElement('div');
            metadadosBox.className = 'msg-metadados';

            const horaSpan = document.createElement('span');
            horaSpan.className = 'msg-hora';
            horaSpan.textContent = formatarHora(m.createdAt || new Date());
            metadadosBox.appendChild(horaSpan);

            if (souEu) {
                const checkWrap = document.createElement('span');
                checkWrap.innerHTML = criarSvgCheck(m.isRead);
                metadadosBox.appendChild(checkWrap);
            }

            balao.appendChild(textoP);
            balao.appendChild(metadadosBox);
            feedMensagens.appendChild(balao);
        });

        if (!manterPosicaoScroll || estavaNoFinal) {
            feedMensagens.scrollTop = feedMensagens.scrollHeight;
        }
    }

    // -------------------------------------------------------------------------
    // 10. ENVIO DE MENSAGEM
    // -------------------------------------------------------------------------
    if (formEnvio) {
        formEnvio.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!conversaAtivaId || enviandoMensagem) return;
            const texto = inputTexto?.value.trim();
            if (!texto) return;

            enviandoMensagem = true;
            if (inputTexto) inputTexto.value = '';

            const conv = conversas.find(c => c.id === conversaAtivaId);
            const agoraIso = new Date().toISOString();
            const tempId = 'temp_' + Date.now();

            // Atualização otimista na interface para resposta imediata
            const msgOtimista = {
                tempId,
                id: tempId,
                eMeu: true,
                senderId: meuUserId,
                content: texto,
                isRead: false,
                createdAt: agoraIso,
            };

            mensagensAtivas.push(msgOtimista);
            renderizarFeedMensagens(mensagensAtivas, false);

            // Atualiza o preview na lista lateral e move conversa para o topo
            if (conv) {
                conv.ultimaMensagem = texto;
                conv.dataUltimaMensagem = agoraIso;
                conversas = conversas.filter(c => c.id !== conv.id);
                conversas.unshift(conv);
                renderizarListaConversas(buscaInput?.value || '');
            }

            try {
                const resp = await window.ItaimApi.chat.enviarMensagem(conversaAtivaId, texto);
                if (resp && resp.success && resp.data) {
                    // Substitui a mensagem temporária pela mensagem real salva no banco
                    const idx = mensagensAtivas.findIndex(m => m.tempId === tempId);
                    if (idx !== -1) {
                        mensagensAtivas[idx] = resp.data;
                    }
                    renderizarFeedMensagens(mensagensAtivas, true);
                } else {
                    throw new Error(resp?.message || 'Falha ao enviar mensagem');
                }
            } catch (err) {
                console.error('Erro ao enviar mensagem:', err);
                // Marca erro no balão ou remove
                const balaoErro = feedMensagens.querySelector(`[data-temp-id="${tempId}"]`);
                if (balaoErro) {
                    balaoErro.style.opacity = '0.7';
                    balaoErro.title = 'Erro ao enviar. Tente novamente.';
                }
            } finally {
                enviandoMensagem = false;
                if (inputTexto) inputTexto.focus();
            }
        });
    }

    // -------------------------------------------------------------------------
    // 11. POLLING EM TEMPO REAL (MENSAGENS & STATUS)
    // -------------------------------------------------------------------------
    function iniciarPolling() {
        if (intervaloPolling) clearInterval(intervaloPolling);

        intervaloPolling = setInterval(async () => {
            // Se a aba estiver em segundo plano, reduz o consumo de rede
            if (document.hidden) return;

            contadorTicks++;

            // A cada 3s: Atualiza a conversa ativa para novas mensagens recebidas
            if (conversaAtivaId && !enviandoMensagem) {
                try {
                    const resp = await window.ItaimApi.chat.obterMensagens(conversaAtivaId);
                    if (resp && resp.success && Array.isArray(resp.data)) {
                        const novas = resp.data;
                        // Compara se houve nova mensagem ou alteração de status de leitura
                        if (novas.length !== mensagensAtivas.length || 
                            JSON.stringify(novas.map(m => m.isRead)) !== JSON.stringify(mensagensAtivas.map(m => m.isRead))) {
                            mensagensAtivas = novas;
                            renderizarFeedMensagens(mensagensAtivas, true);
                        }
                    }
                } catch (e) {
                    // Silencioso em polling de fundo
                }
            }

            // A cada 6s (2 ticks): Atualiza lista lateral de conversas (novas conversas e badges)
            if (contadorTicks % 2 === 0) {
                try {
                    const resp = await window.ItaimApi.chat.listarConversas();
                    if (resp && resp.success && Array.isArray(resp.data)) {
                        const listaNova = resp.data;
                        const mudou = JSON.stringify(listaNova.map(c => ({ id: c.id, msg: c.ultimaMensagem, nl: c.naoLidas }))) !==
                                      JSON.stringify(conversas.map(c => ({ id: c.id, msg: c.ultimaMensagem, nl: c.naoLidas })));
                        if (mudou) {
                            conversas = listaNova;
                            renderizarListaConversas(buscaInput?.value || '');
                        }
                    }
                } catch (e) {
                    // Silencioso em polling de fundo
                }
            }
        }, 3000);
    }

    // -------------------------------------------------------------------------
    // 12. CONTROLES MOBILE & EVENTOS
    // -------------------------------------------------------------------------
    if (btnVoltarMobile && layoutGrid) {
        btnVoltarMobile.addEventListener('click', (e) => {
            e.preventDefault();
            layoutGrid.classList.remove('conversa-aberta-mobile');
        });
    }

    if (buscaInput) {
        buscaInput.addEventListener('input', (e) => {
            renderizarListaConversas(e.target.value);
        });
    }

    // -------------------------------------------------------------------------
    // 13. INICIALIZAÇÃO VIA PARÂMETROS DE URL
    // -------------------------------------------------------------------------
    const urlParams = new URLSearchParams(window.location.search);
    const paramId = urlParams.get('id') || urlParams.get('conversaId');
    const paramProdutoId = urlParams.get('produtoId');

    await carregarListaConversas();

    if (paramId) {
        selecionarConversa(paramId);
    } else if (paramProdutoId) {
        try {
            const resp = await window.ItaimApi.chat.iniciarConversa(paramProdutoId);
            if (resp && resp.success && resp.data) {
                selecionarConversa(resp.data.id);
            } else {
                exibirEstadoSemConversa();
            }
        } catch (err) {
            console.warn('Não foi possível abrir chat pelo produtoId:', err);
            exibirEstadoSemConversa();
        }
    } else if (conversas.length > 0 && window.innerWidth >= 992) {
        // No Desktop grande, se nenhuma conversa foi especificada, seleciona a primeira por conveniência
        selecionarConversa(conversas[0].id);
    } else {
        exibirEstadoSemConversa();
    }

    // Inicia escuta em tempo real
    iniciarPolling();
});
