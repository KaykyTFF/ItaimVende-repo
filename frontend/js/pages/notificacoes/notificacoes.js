/**
 * Itaim Vende - Central de Notificações (js/notificacoes.js)
 * Design moderno com cards ricos, badges, thumbnails e botões de ação dedicados.
 * Totalmente integrada com a API (/api/v1/notifications) e sincronizada com o banco de dados.
 */

document.addEventListener('DOMContentLoaded', async () => {
    const lista = document.getElementById('lista-notificacoes');
    const btnMarcarTodas = document.getElementById('btn-marcar-todas-lidas');
    const btnLimparTodas = document.getElementById('btn-limpar-todas');
    const abas = document.querySelectorAll('.tab-notif-btn');
    const selectOrdem = document.getElementById('select-ordem-notifs');

    let filtroAtivo = 'todas';
    let ordemAtiva = 'recentes';
    let todasNotifs = [];

    // Notificações de demonstração padrão fiéis ao mockup caso o usuário ainda não tenha histórico
    const NOTIFICACOES_DEMO_PADRAO = [
        {
            id: 'demo_prop_1',
            tipo: 'proposta',
            type: 'proposta',
            titulo: 'Nova proposta de R$ 270,00 de Gisa Paula',
            texto: 'Gisa Paula fez uma proposta de R$ 270,00 para o seu produto.',
            tempo: '13 min atrás',
            criadoEm: Date.now() - 13 * 60 * 1000,
            lida: false,
            isRead: false,
            avatar: '../../assets/usuarios/perfil-giselly.jpg',
            avatarRing: 'avatar-ring-verde',
            produtoImagem: '../../assets/produtos/anuncio_8.jpg',
            link: '../mensagens/conversas.html',
            textoBotao: 'Ver proposta',
            tipoAcao: 'proposta'
        },
        {
            id: 'demo_prop_2',
            tipo: 'mensagem',
            type: 'mensagem',
            titulo: 'Proposta Aceita!',
            texto: 'Sua proposta de R$ 270,00 foi aceita! Agora é só combinar a entrega.',
            tempo: '45 min atrás',
            criadoEm: Date.now() - 45 * 60 * 1000,
            lida: true,
            isRead: true,
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
            badgePonto: 'mensagem',
            produtoImagem: '../../assets/produtos/anuncio_8.jpg',
            link: '../mensagens/conversas.html',
            textoBotao: 'Conversar',
            temIconeChat: true,
            temSeta: true,
            tipoAcao: 'conversar'
        },
        {
            id: 'demo_aval_3',
            tipo: 'avaliacao',
            type: 'avaliacao',
            titulo: 'Avaliação recebida',
            texto: 'Você recebeu uma avaliação de 5 estrelas no seu produto.',
            tempo: '2 h atrás',
            criadoEm: Date.now() - 2 * 60 * 60 * 1000,
            lida: true,
            isRead: true,
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
            badgePonto: 'avaliacao',
            estrelas: 5,
            link: '../perfil/perfil.html#avaliacoes',
            textoBotao: 'Ver avaliação',
            temIconeEstrela: true,
            tipoAcao: 'avaliacao'
        },
        {
            id: 'demo_fav_4',
            tipo: 'favorito',
            type: 'favorito',
            titulo: 'Produto adicionado aos favoritos',
            texto: 'Seu produto foi adicionado aos favoritos por um usuário.',
            tempo: '3 h atrás',
            criadoEm: Date.now() - 3 * 60 * 60 * 1000,
            lida: true,
            isRead: true,
            avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
            badgePonto: 'favorito',
            link: '../produtos/categoria.html',
            textoBotao: 'Enviar oferta',
            tipoAcao: 'oferta'
        }
    ];

    function estaAutenticado() {
        return !!(window.ItaimApi && window.ItaimApi.auth && window.ItaimApi.auth.obterToken());
    }

    async function carregarNotificacoes() {
        if (lista && todasNotifs.length === 0 && window.ItaimSkeleton && typeof window.ItaimSkeleton.renderizarNotificacoes === 'function') {
            window.ItaimSkeleton.renderizarNotificacoes(lista, 4);
        }

        if (estaAutenticado() && window.ItaimApi.notificacoes) {
            try {
                const res = await window.ItaimApi.notificacoes.listar();
                if (res && res.success && Array.isArray(res.notifications) && res.notifications.length > 0) {
                    todasNotifs = res.notifications;
                    if (window.ItaimNotificacoes && typeof window.ItaimNotificacoes.salvarNotificacoes === 'function') {
                        window.ItaimNotificacoes.salvarNotificacoes(todasNotifs);
                    }
                    renderizar();
                    return;
                }
            } catch (err) {
                console.warn('[Notificações] Falha ao carregar da API, usando cache local:', err);
            }
        }

        const locais = (window.ItaimNotificacoes && typeof window.ItaimNotificacoes.obterNotificacoes === 'function')
            ? window.ItaimNotificacoes.obterNotificacoes()
            : JSON.parse(localStorage.getItem('itaim_notificacoes') || '[]');

        if (Array.isArray(locais) && locais.length > 0) {
            todasNotifs = locais;
        } else {
            // Inicializa dados demo realistas caso ainda não existam notificações
            todasNotifs = [...NOTIFICACOES_DEMO_PADRAO];
            if (window.ItaimNotificacoes && typeof window.ItaimNotificacoes.salvarNotificacoes === 'function') {
                window.ItaimNotificacoes.salvarNotificacoes(todasNotifs);
            }
        }

        renderizar();
    }

    function atualizarBadgesAbas() {
        const countTodas = document.getElementById('count-todas');
        const countMensagens = document.getElementById('count-mensagens');
        const countAvaliacoes = document.getElementById('count-avaliacoes');
        const countFavoritos = document.getElementById('count-favoritos');
        const countAvisos = document.getElementById('count-avisos');

        const totalNaoLidas = todasNotifs.filter(n => !(n.lida || n.isRead)).length;
        const totalMsgs = todasNotifs.filter(n => {
            const t = String(n.tipo || n.type || '').toLowerCase();
            return (t === 'mensagem' || t === 'proposta' || t === 'message');
        }).length;
        const totalAval = todasNotifs.filter(n => {
            const t = String(n.tipo || n.type || '').toLowerCase();
            return (t === 'avaliacao' || t === 'review' || t === 'rating');
        }).length;
        const totalFavs = todasNotifs.filter(n => {
            const t = String(n.tipo || n.type || '').toLowerCase();
            return (t === 'favorito' || t === 'favorite');
        }).length;
        const totalAvisos = todasNotifs.filter(n => {
            const t = String(n.tipo || n.type || '').toLowerCase();
            return (t === 'aviso' || t === 'preco' || t === 'sistema' || t === 'compra');
        }).length;

        if (countTodas) {
            countTodas.textContent = totalNaoLidas > 0 ? totalNaoLidas : todasNotifs.length;
            countTodas.style.display = 'inline-block';
        }
        if (countMensagens) {
            countMensagens.textContent = totalMsgs;
            countMensagens.style.display = totalMsgs > 0 ? 'inline-block' : 'none';
        }
        if (countAvaliacoes) {
            countAvaliacoes.textContent = totalAval;
            countAvaliacoes.style.display = totalAval > 0 ? 'inline-block' : 'none';
        }
        if (countFavoritos) {
            countFavoritos.textContent = totalFavs;
            countFavoritos.style.display = totalFavs > 0 ? 'inline-block' : 'none';
        }
        if (countAvisos) {
            countAvisos.textContent = totalAvisos;
            countAvisos.style.display = totalAvisos > 0 ? 'inline-block' : 'none';
        }
    }

    function renderizar() {
        if (!lista) return;

        atualizarBadgesAbas();

        const prefs = (() => {
            try { return JSON.parse(localStorage.getItem('itaim_configuracoes') || '{}'); } catch (e) { return {}; }
        })();

        let filtradas = todasNotifs.filter(n => {
            const t = String(n.tipo || n.type || '').toLowerCase();
            if ((t === 'mensagem' || t === 'message' || t === 'proposta') && prefs['not-mensagens'] === false) return false;
            if ((t === 'avaliacao' || t === 'review' || t === 'rating') && prefs['not-avaliacoes'] === false) return false;
            if ((t === 'favorito' || t === 'favorite') && prefs['not-favoritos'] === false) return false;
            if ((t === 'aviso' || t === 'preco' || t === 'sistema' || t === 'compra') && prefs['not-avisos'] === false) return false;
            return true;
        });

        // Filtragem por abas
        if (filtroAtivo === 'mensagem') {
            filtradas = filtradas.filter(n => {
                const t = String(n.tipo || n.type || '').toLowerCase();
                return t === 'mensagem' || t === 'proposta' || t === 'message';
            });
        } else if (filtroAtivo === 'avaliacao') {
            filtradas = filtradas.filter(n => {
                const t = String(n.tipo || n.type || '').toLowerCase();
                return t === 'avaliacao' || t === 'review' || t === 'rating';
            });
        } else if (filtroAtivo === 'favorito') {
            filtradas = filtradas.filter(n => {
                const t = String(n.tipo || n.type || '').toLowerCase();
                return t === 'favorito' || t === 'favorite';
            });
        } else if (filtroAtivo === 'aviso') {
            filtradas = filtradas.filter(n => {
                const t = String(n.tipo || n.type || '').toLowerCase();
                return t === 'aviso' || t === 'preco' || t === 'sistema' || t === 'compra';
            });
        }

        // Ordenação
        if (ordemAtiva === 'antigas') {
            filtradas.sort((a, b) => (a.criadoEm || 0) - (b.criadoEm || 0));
        } else if (ordemAtiva === 'nao-lidas') {
            filtradas.sort((a, b) => {
                const aLida = !!(a.lida || a.isRead);
                const bLida = !!(b.lida || b.isRead);
                if (aLida === bLida) {
                    return (b.criadoEm || 0) - (a.criadoEm || 0);
                }
                return aLida ? 1 : -1;
            });
        } else {
            // 'recentes' (padrão)
            filtradas.sort((a, b) => (b.criadoEm || 0) - (a.criadoEm || 0));
        }

        lista.innerHTML = '';

        if (filtradas.length === 0) {
            lista.innerHTML = `
                <div class="notificacoes-vazio">
                    <div class="notificacoes-vazio-icone" aria-hidden="true">
                        <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                        </svg>
                    </div>
                    <h2>Nenhuma notificação por enquanto</h2>
                    <p>Você será avisado aqui assim que houver novas mensagens, propostas, avaliações ou favoritos.</p>
                </div>
            `;
            return;
        }

        filtradas.forEach(item => {
            const card = document.createElement('div');
            const estaLida = !!(item.lida || item.isRead);
            card.className = `notificacao-card ${estaLida ? 'lida' : 'nao-lida'}`;
            card.dataset.id = item.id;

            const tipo = String(item.tipo || item.type || 'aviso').toLowerCase();
            let titulo = item.titulo || item.title || 'Notificação';
            // Remove quaisquer emojis residuais de títulos antigos em cache
            titulo = titulo.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim();
            const texto = item.texto || item.message || '';
            const tempo = item.tempo || 'Hoje';

            // Determina avatar e badges (ícones clean outline conforme design de abas)
            let avatarUrl = item.avatar || item.remetenteAvatar || '../../assets/icons/icon-user.png';
            let avatarRingClass = item.avatarRing || '';
            let badgePontoClass = '';
            let badgePontoIcone = '';

            // Se for nova proposta e não tiver anel definido
            const ehPropostaNova = (!estaLida && (tipo === 'proposta' || titulo.toLowerCase().includes('proposta de')));
            if (ehPropostaNova && !avatarRingClass) {
                avatarRingClass = 'avatar-ring-verde';
            }

            const badgeOrig = String(item.badgePonto || '').toLowerCase();
            if (tipo === 'mensagem' || tipo === 'conversar' || titulo.toLowerCase().includes('proposta aceita') || badgeOrig === 'laranja' || badgeOrig === 'mensagem' || badgeOrig === 'chat') {
                badgePontoClass = 'badge-tipo-mensagem';
                badgePontoIcone = `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`;
            } else if (tipo === 'avaliacao' || badgeOrig === 'roxa' || badgeOrig === 'avaliacao' || badgeOrig === 'estrela') {
                badgePontoClass = 'badge-tipo-avaliacao';
                badgePontoIcone = `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
            } else if (tipo === 'favorito' || badgeOrig === 'vermelha' || badgeOrig === 'favorito' || badgeOrig === 'coracao') {
                badgePontoClass = 'badge-tipo-favorito';
                badgePontoIcone = `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`;
            } else if (item.badgePonto) {
                badgePontoClass = 'badge-tipo-outline';
            }

            // Mídia central (Thumbnail ou Estrelas)
            let midiaHtml = '';
            if (tipo === 'avaliacao' || item.estrelas) {
                const totalStars = item.estrelas || 5;
                let estrelasSvg = '';
                for (let s = 0; s < totalStars; s++) {
                    estrelasSvg += `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
                }
                midiaHtml = `<div class="notif-estrelas-avaliacao" aria-label="${totalStars} estrelas">${estrelasSvg}</div>`;
            } else if (item.produtoImagem || item.imagem || (tipo === 'proposta' || tipo === 'mensagem' || tipo === 'favorito')) {
                const fotoSrc = item.produtoImagem || item.imagem || '../../assets/produtos/anuncio_8.jpg';
                midiaHtml = `<img src="${fotoSrc}" alt="Produto relacionado" class="notif-thumb-produto">`;
            }

            // Botão de ação à direita
            let textoBotao = item.textoBotao;
            let iconeBotao = '';
            let setaBotao = '';

            if (!textoBotao) {
                if (tipo === 'proposta' || titulo.toLowerCase().includes('proposta de')) {
                    textoBotao = 'Ver proposta';
                } else if (titulo.toLowerCase().includes('proposta aceita') || tipo === 'mensagem') {
                    textoBotao = 'Conversar';
                    iconeBotao = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`;
                    setaBotao = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>`;
                } else if (tipo === 'avaliacao') {
                    textoBotao = 'Ver avaliação';
                    iconeBotao = `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
                } else if (tipo === 'favorito') {
                    textoBotao = 'Enviar oferta';
                } else {
                    textoBotao = 'Ver detalhes';
                }
            } else {
                if (item.temIconeChat) {
                    iconeBotao = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`;
                }
                if (item.temIconeEstrela) {
                    iconeBotao = `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
                }
                if (item.temSeta) {
                    setaBotao = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>`;
                }
            }

            const linkDestino = item.link && item.link !== 'notificacoes.html' ? item.link : '#';

            card.innerHTML = `
                <div class="notif-corpo-principal">
                    <div class="notif-avatar-wrapper ${avatarRingClass}">
                        <img src="${avatarUrl}" alt="Avatar" class="notif-avatar-img">
                        ${badgePontoClass ? `<span class="avatar-badge-ponto ${badgePontoClass}">${badgePontoIcone}</span>` : ''}
                    </div>
                    <div class="notif-conteudo-central">
                        ${!estaLida ? `<span class="notif-tag-nova">Nova</span>` : ''}
                        <h3 class="notif-titulo">${titulo}</h3>
                        <p class="notif-descricao">${texto}</p>
                        <div class="notif-tempo-meta">
                            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                            <span>${tempo}</span>
                        </div>
                    </div>
                </div>

                <div class="notif-lado-direito">
                    ${midiaHtml ? `<div class="notif-midia-preview">${midiaHtml}</div>` : ''}
                    <div class="notif-divisor-vertical"></div>
                    <div class="notif-coluna-acao">
                        <a href="${linkDestino}" class="btn-notif-acao-primaria">
                            ${iconeBotao}
                            <span>${textoBotao}</span>
                            ${setaBotao}
                        </a>
                        <button type="button" class="btn-excluir-notif-card" data-id="${item.id}" title="Excluir notificação">&times;</button>
                    </div>
                </div>
            `;

            // Clique no corpo do card para marcar como lida e redirecionar
            card.addEventListener('click', async (e) => {
                if (e.target.closest('.btn-excluir-notif-card')) return;

                item.lida = true;
                item.isRead = true;

                if (estaAutenticado() && window.ItaimApi.notificacoes) {
                    try {
                        await window.ItaimApi.notificacoes.marcarComoLida(item.id);
                    } catch (err) { }
                }

                if (window.ItaimNotificacoes) {
                    window.ItaimNotificacoes.salvarNotificacoes(todasNotifs);
                }

                if (linkDestino && linkDestino !== '#' && !e.target.closest('.btn-notif-acao-primaria')) {
                    window.location.href = linkDestino;
                } else if (!e.target.closest('.btn-notif-acao-primaria')) {
                    renderizar();
                }
            });

            lista.appendChild(card);
        });

        // Eventos do botão excluir individual
        lista.querySelectorAll('.btn-excluir-notif-card').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const id = e.currentTarget.dataset.id;
                todasNotifs = todasNotifs.filter(n => String(n.id) !== String(id));

                if (estaAutenticado() && window.ItaimApi.notificacoes) {
                    try {
                        await window.ItaimApi.notificacoes.remover(id);
                    } catch (err) { }
                }

                if (window.ItaimNotificacoes) {
                    window.ItaimNotificacoes.salvarNotificacoes(todasNotifs);
                } else {
                    localStorage.setItem('itaim_notificacoes', JSON.stringify(todasNotifs));
                }

                renderizar();
            });
        });
    }

    // Abas de Filtros
    abas.forEach(aba => {
        aba.addEventListener('click', () => {
            abas.forEach(a => a.classList.remove('ativo'));
            aba.classList.add('ativo');
            filtroAtivo = aba.dataset.filtro;
            renderizar();
        });
    });

    // Seletor de Ordenação
    if (selectOrdem) {
        selectOrdem.addEventListener('change', (e) => {
            ordemAtiva = e.target.value;
            renderizar();
        });
    }

    // Marcar todas como lidas
    if (btnMarcarTodas) {
        btnMarcarTodas.addEventListener('click', async () => {
            todasNotifs.forEach(n => {
                n.lida = true;
                n.isRead = true;
            });

            if (estaAutenticado() && window.ItaimApi.notificacoes) {
                try {
                    await window.ItaimApi.notificacoes.marcarTodasComoLidas();
                } catch (err) { }
            }

            if (window.ItaimNotificacoes) {
                window.ItaimNotificacoes.salvarNotificacoes(todasNotifs);
            }
            renderizar();
        });
    }

    // Limpar todas as notificações
    if (btnLimparTodas) {
        btnLimparTodas.addEventListener('click', async () => {
            if (confirm('Deseja limpar todas as notificações?')) {
                todasNotifs = [];

                if (estaAutenticado() && window.ItaimApi.notificacoes) {
                    try {
                        await window.ItaimApi.notificacoes.limparTodas();
                    } catch (err) { }
                }

                if (window.ItaimNotificacoes) {
                    window.ItaimNotificacoes.salvarNotificacoes([]);
                } else {
                    localStorage.setItem('itaim_notificacoes', JSON.stringify([]));
                }
                renderizar();
            }
        });
    }

    // Atualização em tempo real via WebSockets (Push instantâneo)
    window.addEventListener('itaim:notification_new', (e) => {
        if (e.detail) {
            const notif = e.detail;
            if (!todasNotifs.some(n => n.id === notif.id)) {
                todasNotifs.unshift(notif);
                if (window.ItaimNotificacoes) {
                    window.ItaimNotificacoes.salvarNotificacoes(todasNotifs);
                }
                renderizar();
            }
        }
    });

    await carregarNotificacoes();
});
