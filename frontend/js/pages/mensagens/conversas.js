/**
 * ITAIM VENDE - CENTRAL DE MENSAGENS E CHAT (JS/CONVERSAS.JS)
 * Sistema 100% funcional de comunicação real entre perfis (sem robôs ou simulações)
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Obter usuário logado atual
    const userLogado = (window.ItaimSessao && typeof window.ItaimSessao.obterUsuarioLogado === 'function')
        ? window.ItaimSessao.obterUsuarioLogado()
        : { id: 1, nome: 'Raili', email: 'admin@gmail.com', avatar: 'assets/icon-user.png' };

    const emailLogado = (userLogado.email || 'admin@gmail.com').toLowerCase().trim();

    // 2. Elementos da Interface
    const layoutGrid = document.getElementById('chat-layout-grid');
    const listaScroll = document.getElementById('chat-lista-scroll');
    const buscaInput = document.getElementById('input-busca-conversas');
    
    // Topo da conversa
    const headerAvatar = document.getElementById('chat-header-avatar');
    const headerNome = document.getElementById('chat-header-nome');
    const headerStatusTxt = document.getElementById('chat-header-status-txt');
    const btnVoltarMobile = document.getElementById('btn-voltar-mobile-chat');

    // Mini Resumo do Produto (Mobile)
    const mobileResumoBox = document.getElementById('mobile-resumo-produto-topo');
    const mobileMiniFoto = document.getElementById('mobile-mini-foto');
    const mobileMiniTitulo = document.getElementById('mobile-mini-titulo');
    const mobileMiniPreco = document.getElementById('mobile-mini-preco');
    const mobileMiniLink = document.getElementById('mobile-mini-link-anuncio');

    // Feed de Mensagens & Envio
    const feedMensagens = document.getElementById('chat-feed-mensagens');
    const formEnvio = document.getElementById('form-chat-envio');
    const inputTexto = document.getElementById('chat-input-texto');

    // Coluna Direita (Detalhes do Produto no Desktop)
    const painelProdutoFoto = document.getElementById('painel-produto-foto');
    const painelBadgeFotos = document.getElementById('painel-badge-fotos');
    const painelProdutoNome = document.getElementById('painel-produto-nome');
    const painelProdutoPreco = document.getElementById('painel-produto-preco');
    const painelCidadeTxt = document.getElementById('painel-produto-cidade-txt');
    const painelEspecCondicao = document.getElementById('painel-espec-condicao');
    const painelEspecCategoria = document.getElementById('painel-espec-categoria');
    const painelProdutoDesc = document.getElementById('painel-produto-desc');
    const btnPainelVerAnuncio = document.getElementById('btn-painel-ver-anuncio');

    // 3. Estado Local
    let conversas = carregarConversasDoStorage();
    let conversaAtivaId = null;

    // Helper: Formatação de Preço
    function formatarPreco(val) {
        if (val === 0 || val === '0' || val === null || val === undefined) {
            return '<span style="color: #44BD32; font-weight: 800;">Grátis / Doação</span>';
        }
        return Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    // Helper: Carregar conversas reais do localStorage
    function carregarConversasDoStorage() {
        try {
            const raw = localStorage.getItem('itaim_conversas');
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) return parsed;
            }
        } catch (e) {
            console.error('Erro ao ler conversas:', e);
        }
        return [];
    }

    // Helper: Salvar conversas no localStorage
    function salvarConversasNoStorage() {
        try {
            localStorage.setItem('itaim_conversas', JSON.stringify(conversas));
        } catch (e) {
            console.error('Erro ao salvar conversas:', e);
        }
    }

    // Helper: Obter os dados do interlocutor na conversa (a outra pessoa com quem estou falando)
    function obterInterlocutor(conv) {
        const cCompradorEmail = (conv.compradorEmail || '').toLowerCase().trim();
        const souOComprador = (cCompradorEmail === emailLogado);

        if (souOComprador) {
            return {
                nome: conv.vendedorNome || 'Vendedor',
                email: conv.vendedorEmail,
                avatar: conv.vendedorAvatar || 'assets/icon-user.png',
                papel: 'Vendedor(a)'
            };
        } else {
            return {
                nome: conv.compradorNome || 'Comprador',
                email: conv.compradorEmail,
                avatar: conv.compradorAvatar || 'assets/icon-user.png',
                papel: 'Comprador(a)'
            };
        }
    }

    // Helper: Obter as conversas em que o usuário atual participa
    function obterConversasDoUsuarioAtual() {
        return conversas.filter(c => {
            const comp = (c.compradorEmail || '').toLowerCase().trim();
            const vend = (c.vendedorEmail || '').toLowerCase().trim();
            return comp === emailLogado || vend === emailLogado;
        });
    }

    // 4. Renderizar Lista de Conversas (Coluna da Esquerda)
    function renderizarListaConversas(filtro = '') {
        if (!listaScroll) return;
        listaScroll.innerHTML = '';

        const minhasConversas = obterConversasDoUsuarioAtual();

        const filtradas = minhasConversas.filter(c => {
            const outro = obterInterlocutor(c);
            const tituloProd = (c.produto && c.produto.titulo) || '';
            const busca = filtro.toLowerCase().trim();
            return outro.nome.toLowerCase().includes(busca) || tituloProd.toLowerCase().includes(busca);
        });

        if (filtradas.length === 0) {
            if (filtro.trim() !== '') {
                listaScroll.innerHTML = `
                    <div class="chat-vazio-box">
                        <div class="chat-vazio-icone">
                            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#8E9AA7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        </div>
                        <div class="chat-vazio-titulo">Nenhum resultado</div>
                        <p class="chat-vazio-desc">Nenhuma conversa encontrada para "${filtro}".</p>
                    </div>
                `;
            } else {
                listaScroll.innerHTML = `
                    <div class="chat-vazio-box">
                        <div class="chat-vazio-icone">
                            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                        </div>
                        <div class="chat-vazio-titulo">Nenhuma conversa ainda</div>
                        <p class="chat-vazio-desc">Quando você encontrar um produto e clicar em <strong>"Chat com o vendedor"</strong>, suas conversas aparecerão aqui.</p>
                        <a href="${window.ItaimRotas ? window.ItaimRotas.obterUrl('home') : '../home/home.html'}" class="btn-voltar-chat" style="display: inline-flex; justify-content: center; width: auto; margin: 0 auto;">
                            Explorar anúncios
                        </a>
                    </div>
                `;
            }
            return;
        }

        filtradas.forEach(c => {
            const outro = obterInterlocutor(c);
            const msgs = Array.isArray(c.mensagens) ? c.mensagens : [];
            const ultimaMsg = msgs[msgs.length - 1];
            const textoPreview = ultimaMsg ? ultimaMsg.texto : (c.ultimaMensagemTexto || 'Conversa iniciada');
            const horaPreview = (ultimaMsg && ultimaMsg.hora) ? ultimaMsg.hora : (c.ultimaMensagemHora || '');

            // Contar mensagens não lidas enviadas pelo outro interlocutor
            const naoLidas = msgs.filter(m => {
                const remetente = (m.remetenteEmail || '').toLowerCase().trim();
                return remetente !== emailLogado && !m.lida;
            }).length;

            const card = document.createElement('div');
            card.className = `chat-card-item ${c.id === conversaAtivaId ? 'ativo' : ''}`;
            card.dataset.id = c.id;

            card.innerHTML = `
                <div class="chat-avatar-wrap">
                    <img src="${outro.avatar}" alt="${outro.nome}" class="chat-card-avatar" onerror="this.src='assets/icon-user.png'">
                </div>
                <div class="chat-card-detalhes">
                    <div class="chat-card-linha-topo">
                        <strong class="chat-card-nome">${outro.nome}</strong>
                        <span class="chat-card-hora">${horaPreview}</span>
                    </div>
                    <div class="chat-card-anuncio-tag">${c.produto?.titulo || 'Anúncio'}</div>
                    <div class="chat-card-linha-base">
                        <p class="chat-card-preview">${textoPreview}</p>
                        ${naoLidas > 0 ? `<span class="chat-badge-nao-lida">${naoLidas}</span>` : ''}
                    </div>
                </div>
            `;

            card.addEventListener('click', () => {
                selecionarConversa(c.id);
            });

            listaScroll.appendChild(card);
        });
    }

    // 5. Exibir estado quando nenhuma conversa estiver selecionada ou não houver conversas
    function exibirEstadoSemConversa() {
        conversaAtivaId = null;

        // Painel da Direita (Detalhes do Anúncio)
        const painelVazio = document.getElementById('chat-produto-vazio-estado');
        const painelCard = document.getElementById('chat-produto-card');
        const descVazio = document.getElementById('chat-produto-vazio-desc');
        const tituloVazio = document.getElementById('chat-produto-vazio-titulo');

        if (painelVazio) painelVazio.style.display = 'flex';
        if (painelCard) painelCard.style.display = 'none';

        // Coluna Central: Oculta o cabeçalho com perfil/nome e a barra de digitação
        const chatTopoAtivo = document.getElementById('chat-topo-ativo');
        const chatCentroVazio = document.getElementById('chat-centro-vazio');
        const centroTitulo = document.getElementById('chat-centro-vazio-titulo');
        const centroDesc = document.getElementById('chat-centro-vazio-desc');

        if (chatTopoAtivo) chatTopoAtivo.style.display = 'none';
        if (feedMensagens) feedMensagens.style.display = 'none';
        if (formEnvio) formEnvio.style.display = 'none';
        if (mobileResumoBox) mobileResumoBox.style.display = 'none';
        if (chatCentroVazio) chatCentroVazio.style.display = 'flex';

        const minhas = obterConversasDoUsuarioAtual();
        if (minhas.length === 0) {
            if (tituloVazio) tituloVazio.textContent = 'Nenhuma conversa iniciada';
            if (descVazio) {
                descVazio.innerHTML = 'Você ainda não possui conversas. Encontre um produto de seu interesse e clique em <strong>"Chat com o vendedor"</strong> para iniciar.';
            }
            if (centroTitulo) centroTitulo.textContent = 'Nenhuma conversa ativa';
            if (centroDesc) {
                centroDesc.innerHTML = 'Você ainda não possui conversas abertas. Explore os anúncios da plataforma e clique no botão <strong>"Chat com o vendedor"</strong> para falar diretamente com o anunciante.';
            }
        } else {
            if (tituloVazio) tituloVazio.textContent = 'Nenhuma conversa selecionada';
            if (descVazio) {
                descVazio.innerHTML = 'Selecione uma conversa ao lado para ver os detalhes do produto ou acesse um anúncio e clique em <strong>"Chat com o vendedor"</strong> para iniciar uma negociação.';
            }
            if (centroTitulo) centroTitulo.textContent = 'Selecione uma conversa';
            if (centroDesc) {
                centroDesc.innerHTML = 'Escolha uma conversa na barra lateral para ler as mensagens e responder, ou explore outros anúncios para iniciar novas negociações.';
            }
        }

        // Renderiza lista da esquerda
        renderizarListaConversas(buscaInput?.value || '');
    }

    // 6. Selecionar e Abrir uma Conversa
    function selecionarConversa(id) {
        conversaAtivaId = id;
        const conv = conversas.find(c => c.id === id);
        if (!conv) {
            exibirEstadoSemConversa();
            return;
        }

        // Coluna Central: Exibe o cabeçalho real do contato, o feed de mensagens e o form de envio
        const chatTopoAtivo = document.getElementById('chat-topo-ativo');
        const chatCentroVazio = document.getElementById('chat-centro-vazio');

        if (chatCentroVazio) chatCentroVazio.style.display = 'none';
        if (chatTopoAtivo) chatTopoAtivo.style.display = 'flex';
        if (feedMensagens) feedMensagens.style.display = 'flex';
        if (formEnvio) formEnvio.style.display = 'flex';

        // Alterna painéis da direita: oculta estado vazio e exibe card de detalhes do produto
        const painelVazio = document.getElementById('chat-produto-vazio-estado');
        const painelCard = document.getElementById('chat-produto-card');
        if (painelVazio) painelVazio.style.display = 'none';
        if (painelCard) painelCard.style.display = 'flex';

        // Reabilita o input e botão de envio
        if (inputTexto) {
            inputTexto.placeholder = 'Digite uma mensagem...';
            inputTexto.disabled = false;
        }
        if (formEnvio) {
            const btnSubmit = formEnvio.querySelector('button[type="submit"]');
            if (btnSubmit) btnSubmit.disabled = false;
        }

        const outro = obterInterlocutor(conv);

        // Marca todas as mensagens recebidas como lidas
        if (Array.isArray(conv.mensagens)) {
            let alterou = false;
            conv.mensagens.forEach(m => {
                const remetente = (m.remetenteEmail || '').toLowerCase().trim();
                if (remetente !== emailLogado && !m.lida) {
                    m.lida = true;
                    alterou = true;
                }
            });
            if (alterou) {
                salvarConversasNoStorage();
            }
        }

        // Atualiza cabeçalho central com o papel real (SEM bolinha de online)
        if (headerNome) headerNome.textContent = outro.nome;
        if (headerAvatar) {
            headerAvatar.src = outro.avatar;
            headerAvatar.onerror = () => { headerAvatar.src = 'assets/icon-user.png'; };
        }
        if (headerStatusTxt) {
            headerStatusTxt.textContent = outro.papel || 'Vendedor(a)';
        }

        // Configurar link direto para o perfil do interlocutor (comprador ou vendedor)
        const emailOutro = (outro.email || '').toLowerCase().trim();
        let urlPerfil = (window.ItaimRotas ? window.ItaimRotas.obterUrl('perfil') : '../perfil/perfil.html');
        if (emailOutro && emailOutro !== emailLogado) {
            const paramsPerfil = new URLSearchParams();
            if (outro.email) paramsPerfil.set('email', outro.email);
            if (outro.nome) paramsPerfil.set('vendedor', outro.nome);
            if (outro.id) paramsPerfil.set('id', outro.id);
            urlPerfil = (window.ItaimRotas ? window.ItaimRotas.obterUrl('vendedor', paramsPerfil.toString()) : `../perfil/vendedor.html?${paramsPerfil.toString()}`);
        } else {
            urlPerfil = (window.ItaimRotas ? window.ItaimRotas.obterUrl('perfil') : '../perfil/perfil.html');
        }

        const linkPerfil = document.getElementById('chat-perfil-conversa');
        if (linkPerfil) {
            linkPerfil.href = urlPerfil;
            linkPerfil.setAttribute('title', `Ver perfil de ${outro.nome}`);
            linkPerfil.onclick = (e) => {
                e.preventDefault();
                window.location.href = urlPerfil;
            };
        }
        if (headerAvatar) {
            headerAvatar.style.cursor = 'pointer';
            headerAvatar.title = `Ver perfil de ${outro.nome}`;
            headerAvatar.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                window.location.href = urlPerfil;
            };
        }
        if (headerNome) {
            headerNome.style.cursor = 'pointer';
            headerNome.title = `Ver perfil de ${outro.nome}`;
            headerNome.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                window.location.href = urlPerfil;
            };
        }

        // Atualiza Resumo do Produto (Mobile)
        const prod = conv.produto || {};
        const urlProduto = (window.ItaimRotas ? window.ItaimRotas.obterUrl('produto', `id=${conv.produtoId || prod.id || ''}`) : `../produtos/produto.html?id=${conv.produtoId || prod.id || ''}`);

        if (mobileResumoBox) {
            mobileResumoBox.style.display = 'flex';
            if (mobileMiniFoto) mobileMiniFoto.src = prod.imagem || 'assets/produto-placeholder.svg';
            if (mobileMiniTitulo) mobileMiniTitulo.textContent = prod.titulo || 'Anúncio';
            if (mobileMiniPreco) mobileMiniPreco.innerHTML = formatarPreco(prod.preco);
            if (mobileMiniLink) mobileMiniLink.href = urlProduto;
        }

        // Atualiza Painel de Detalhes do Produto no Desktop (Coluna da Direita)
        if (painelProdutoFoto) {
            painelProdutoFoto.src = prod.imagem || 'assets/produto-placeholder.svg';
            painelProdutoFoto.onerror = () => { painelProdutoFoto.src = 'assets/produto-placeholder.svg'; };
        }
        if (painelProdutoNome) painelProdutoNome.textContent = prod.titulo || 'Produto';
        if (painelProdutoPreco) painelProdutoPreco.innerHTML = formatarPreco(prod.preco);
        if (painelCidadeTxt) painelCidadeTxt.textContent = `${prod.cidade || 'Paulistana'}, PI`;
        if (painelEspecCondicao) painelEspecCondicao.textContent = prod.condicao || 'Usado';
        if (painelEspecCategoria) painelEspecCategoria.textContent = prod.categoria || 'Geral';
        if (painelProdutoDesc) {
            painelProdutoDesc.textContent = prod.descricao || 'Nenhuma descrição detalhada informada.';
        }
        if (btnPainelVerAnuncio) {
            btnPainelVerAnuncio.href = urlProduto;
        }

        // Renderiza as mensagens no feed
        renderizarMensagens(conv);

        // Atualiza a lista da esquerda para marcar o card ativo
        renderizarListaConversas(buscaInput?.value || '');

        // No celular: ativa visualização da conversa
        if (layoutGrid) {
            layoutGrid.classList.add('conversa-aberta-mobile');
        }

        // Foca no campo de digitação em desktop
        if (window.innerWidth > 768 && inputTexto) {
            inputTexto.focus();
        }
    }

    // 6. Renderizar Balões de Mensagens da Conversa Ativa
    function renderizarMensagens(conv) {
        if (!feedMensagens) return;
        feedMensagens.innerHTML = '';

        const msgs = Array.isArray(conv.mensagens) ? conv.mensagens : [];
        const outro = obterInterlocutor(conv);
        const prod = conv.produto || {};

        // Se não houver mensagens ainda, exibe aviso inicial amigável 100% 2D (sem emojis ou imagens 3D)
        if (msgs.length === 0) {
            feedMensagens.innerHTML = `
                <div class="chat-aviso-inicio">
                    <div class="chat-aviso-inicio-icone">
                        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                    </div>
                    <p>Você iniciou uma conversa com <strong>${outro.nome}</strong> sobre <strong>"${prod.titulo || 'este anúncio'}"</strong>.</p>
                    <p class="chat-aviso-sub">Envie uma mensagem abaixo para tirar dúvidas e combinar os detalhes da compra!</p>
                </div>
            `;
            return;
        }

        // Divisor de data inicial
        const divisor = document.createElement('div');
        divisor.className = 'chat-data-divisor';
        divisor.textContent = 'Mensagens';
        feedMensagens.appendChild(divisor);

        msgs.forEach(m => {
            const remetente = (m.remetenteEmail || '').toLowerCase().trim();
            const souEu = (remetente === emailLogado);
            const classeTipo = souEu ? 'enviada' : 'recebida';

            const balao = document.createElement('div');
            balao.className = `msg-balao ${classeTipo}`;

            // Check de entrega/leitura:
            // SÓ MOSTRA 2 RISQUINHOS VERDES SE O OUTRO PERFIL LEU (m.lida === true).
            // Caso contrário, mostra 1 risquinho cinza (enviada, aguardando o destinatário ler).
            let checkSvg = '';
            if (souEu) {
                if (m.lida === true) {
                    checkSvg = `
                        <span class="msg-check-status lida" title="Lida pelo outro perfil">
                            <svg viewBox="0 0 16 11" width="14" height="11" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="1.5 5.5 5 9 11 2"></polyline>
                                <polyline points="6 5.5 8.5 8 14.5 2"></polyline>
                            </svg>
                        </span>
                    `;
                } else {
                    checkSvg = `
                        <span class="msg-check-status pendente" title="Enviada (aguardando leitura)">
                            <svg viewBox="0 0 16 11" width="11" height="11" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="2 6 6 9.5 14 2"></polyline>
                            </svg>
                        </span>
                    `;
                }
            }

            balao.innerHTML = `
                <p class="msg-texto">${m.texto}</p>
                <div class="msg-metadados">
                    <span class="msg-hora">${m.hora || ''}</span>
                    ${checkSvg}
                </div>
            `;

            feedMensagens.appendChild(balao);
        });

        // Rolar automaticamente para o fim da conversa
        feedMensagens.scrollTop = feedMensagens.scrollHeight;
    }

    // 7. Envio de Mensagem Real
    if (formEnvio) {
        formEnvio.addEventListener('submit', (e) => {
            e.preventDefault();
            const texto = inputTexto?.value.trim();
            if (!texto) return;

            const conv = conversas.find(c => c.id === conversaAtivaId);
            if (!conv) return;

            const agora = new Date();
            const horaEnvio = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

            // Mensagem real enviada pelo perfil ativo
            const novaMensagem = {
                id: Date.now(),
                remetenteEmail: userLogado.email || 'admin@gmail.com',
                remetenteNome: userLogado.nome || 'Usuário',
                texto: texto,
                hora: horaEnvio,
                dataHora: agora.toISOString(),
                lida: false
            };

            if (!Array.isArray(conv.mensagens)) {
                conv.mensagens = [];
            }

            conv.mensagens.push(novaMensagem);
            conv.ultimaMensagemTexto = texto;
            conv.ultimaMensagemHora = horaEnvio;

            // Move esta conversa para a primeira posição da lista
            conversas = conversas.filter(c => c.id !== conv.id);
            conversas.unshift(conv);

            salvarConversasNoStorage();

            if (inputTexto) inputTexto.value = '';

            renderizarMensagens(conv);
            renderizarListaConversas(buscaInput?.value || '');

            // Notifica o sistema de notificações se configurado
            if (window.ItaimNotificacoes && typeof window.ItaimNotificacoes.notificarNovaMensagem === 'function') {
                const outro = obterInterlocutor(conv);
                window.ItaimNotificacoes.notificarNovaMensagem({
                    destinatario: outro.email,
                    remetente: userLogado,
                    produtoTitulo: conv.produto?.titulo || 'Anúncio',
                    textoMensagem: texto,
                    conversaId: conv.id
                });
            }
        });
    }

    // 8. Voltar para a lista no celular
    if (btnVoltarMobile && layoutGrid) {
        btnVoltarMobile.addEventListener('click', (e) => {
            e.preventDefault();
            layoutGrid.classList.remove('conversa-aberta-mobile');
        });
    }

    // 9. Campo de Busca de Conversas
    if (buscaInput) {
        buscaInput.addEventListener('input', (e) => {
            renderizarListaConversas(e.target.value);
        });
    }

    // 10. Inicialização e seleção automática via parâmetro URL
    const urlParams = new URLSearchParams(window.location.search);
    const paramId = urlParams.get('id') || urlParams.get('conversaId');
    const paramProdutoId = urlParams.get('produtoId');

    const minhas = obterConversasDoUsuarioAtual();

    if (paramId) {
        const encontrada = conversas.find(c => String(c.id) === String(paramId));
        if (encontrada) {
            selecionarConversa(encontrada.id);
        } else {
            exibirEstadoSemConversa();
        }
    } else if (paramProdutoId) {
        const pIdInt = parseInt(paramProdutoId, 10);
        const encontrada = minhas.find(c => parseInt(c.produtoId, 10) === pIdInt);
        if (encontrada) {
            selecionarConversa(encontrada.id);
        } else {
            exibirEstadoSemConversa();
        }
    } else {
        // Quando nenhuma conversa foi selecionada ou não há conversas, exibe o estado orientando o usuário
        exibirEstadoSemConversa();
    }

    // 11. Sincronização em tempo real (quando outro perfil ou aba ler a mensagem)
    window.addEventListener('storage', (e) => {
        if (e.key === 'itaim_conversas') {
            conversas = carregarConversasDoStorage();
            if (conversaAtivaId) {
                const conv = conversas.find(c => c.id === conversaAtivaId);
                if (conv) renderizarMensagens(conv);
            }
            renderizarListaConversas(buscaInput?.value || '');
        }
    });
});
