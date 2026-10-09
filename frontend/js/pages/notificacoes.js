/**
 * Itaim Vende - Central de Notificações (js/notificacoes.js)
 * Totalmente integrada com o sistema global de preferências, mensagens, compras e avisos.
 */

document.addEventListener('DOMContentLoaded', () => {
    const lista = document.getElementById('lista-notificacoes');
    const btnMarcarTodas = document.getElementById('btn-marcar-todas-lidas');
    const btnLimparTodas = document.getElementById('btn-limpar-todas');
    const abas = document.querySelectorAll('.tab-notif-btn');

    let filtroAtivo = 'todas';

    function obterIconeSVG(tipo) {
        switch (tipo) {
            case 'mensagem':
                return `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`;
            case 'avaliacao':
                return `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
            case 'compra':
                return `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>`;
            case 'favorito':
                return `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`;
            case 'preco':
                return `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>`;
            case 'aviso':
            default:
                return `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`;
        }
    }

    function obterClasseIcone(tipo) {
        switch (tipo) {
            case 'mensagem': return 'icone-chat';
            case 'avaliacao': return 'icone-avaliacao';
            case 'compra': return 'icone-sucesso';
            case 'favorito': return 'icone-favorito';
            case 'preco': return 'icone-preco';
            case 'aviso':
            default: return 'icone-seguranca';
        }
    }

    function renderizar() {
        if (!lista) return;

        const todasNotifs = (window.ItaimNotificacoes && typeof window.ItaimNotificacoes.obterNotificacoes === 'function')
            ? window.ItaimNotificacoes.obterNotificacoes()
            : JSON.parse(localStorage.getItem('itaim_notificacoes') || '[]');

        let filtradas = todasNotifs;
        if (filtroAtivo === 'nao-lidas') {
            filtradas = todasNotifs.filter(n => !n.lida);
        } else if (filtroAtivo === 'mensagem') {
            filtradas = todasNotifs.filter(n => n.tipo === 'mensagem');
        } else if (filtroAtivo === 'avaliacao') {
            filtradas = todasNotifs.filter(n => n.tipo === 'avaliacao');
        } else if (filtroAtivo === 'compra') {
            filtradas = todasNotifs.filter(n => n.tipo === 'compra');
        } else if (filtroAtivo === 'favorito') {
            filtradas = todasNotifs.filter(n => n.tipo === 'favorito');
        } else if (filtroAtivo === 'aviso') {
            filtradas = todasNotifs.filter(n => n.tipo === 'aviso' || n.tipo === 'preco');
        }

        lista.innerHTML = '';

        if (filtradas.length === 0) {
            lista.innerHTML = `
                <div class="notificacoes-vazio">
                    <div class="notificacoes-vazio-icon">🔔</div>
                    <h2>Nenhuma notificação por enquanto</h2>
                    <p>Você será avisado aqui assim que houver novas mensagens, compras finalizadas ou novidades.</p>
                </div>
            `;
            return;
        }

        filtradas.forEach(item => {
            const card = document.createElement('div');
            card.className = `notificacao-card ${item.lida ? '' : 'nao-lida'}`;
            card.dataset.id = item.id;

            const iconeSVG = obterIconeSVG(item.tipo);
            const classeIcone = item.classeIcone || obterClasseIcone(item.tipo);

            card.innerHTML = `
                <div class="notificacao-icone-circulo ${classeIcone}">
                    ${iconeSVG}
                </div>
                <div class="notificacao-info">
                    <h3 class="notificacao-titulo">${item.titulo}</h3>
                    <p class="notificacao-texto">${item.texto}</p>
                    <span class="notificacao-data">${item.tempo || item.data || 'Hoje'}</span>
                </div>
                <div class="notificacao-acoes">
                    ${!item.lida ? `<button type="button" class="btn-acao-notif btn-marcar-lida" data-id="${item.id}" title="Marcar como lida">✓</button>` : ''}
                    <button type="button" class="btn-acao-notif btn-excluir-notif" data-id="${item.id}" title="Excluir notificação">&times;</button>
                </div>
            `;

            // Clique no corpo do card para marcar como lida e redirecionar
            card.addEventListener('click', (e) => {
                if (e.target.closest('.btn-acao-notif')) return;
                item.lida = true;
                if (window.ItaimNotificacoes) {
                    window.ItaimNotificacoes.salvarNotificacoes(todasNotifs);
                }
                if (item.link && item.link !== 'notificacoes.html') {
                    window.location.href = item.link;
                } else {
                    renderizar();
                }
            });

            lista.appendChild(card);
        });

        // Eventos dos botões de ação nos cards
        lista.querySelectorAll('.btn-marcar-lida').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(e.currentTarget.dataset.id, 10);
                const notif = todasNotifs.find(n => n.id === id);
                if (notif) {
                    notif.lida = true;
                    if (window.ItaimNotificacoes) {
                        window.ItaimNotificacoes.salvarNotificacoes(todasNotifs);
                    }
                    renderizar();
                }
            });
        });

        lista.querySelectorAll('.btn-excluir-notif').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(e.currentTarget.dataset.id, 10);
                const novas = todasNotifs.filter(n => n.id !== id);
                if (window.ItaimNotificacoes) {
                    window.ItaimNotificacoes.salvarNotificacoes(novas);
                } else {
                    localStorage.setItem('itaim_notificacoes', JSON.stringify(novas));
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

    // Marcar todas como lidas
    if (btnMarcarTodas) {
        btnMarcarTodas.addEventListener('click', () => {
            const todas = (window.ItaimNotificacoes && typeof window.ItaimNotificacoes.obterNotificacoes === 'function')
                ? window.ItaimNotificacoes.obterNotificacoes()
                : JSON.parse(localStorage.getItem('itaim_notificacoes') || '[]');
            todas.forEach(n => n.lida = true);
            if (window.ItaimNotificacoes) {
                window.ItaimNotificacoes.salvarNotificacoes(todas);
            }
            renderizar();
        });
    }

    // Limpar todas as notificações
    if (btnLimparTodas) {
        btnLimparTodas.addEventListener('click', () => {
            if (confirm('Deseja limpar todas as notificações?')) {
                if (window.ItaimNotificacoes) {
                    window.ItaimNotificacoes.salvarNotificacoes([]);
                } else {
                    localStorage.setItem('itaim_notificacoes', JSON.stringify([]));
                }
                renderizar();
            }
        });
    }

    renderizar();
});
