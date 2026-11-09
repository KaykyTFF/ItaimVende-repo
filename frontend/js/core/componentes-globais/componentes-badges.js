/**
 * ITAIM VENDE - SINCRONIZADOR DE BADGES DINÂMICOS (COMPONENTES BADGES)
 * Arquivo: frontend/js/core/componentes-globais/componentes-badges.js
 * 
 * Responsabilidades:
 * - Leitura e cálculo de mensagens não lidas no Chat (itaim_conversas)
 * - Leitura e cálculo de notificações direcionadas ao usuário ativo (itaim_notificacoes)
 * - Atualização dos badges numéricos no cabeçalho
 */

(function() {
    'use strict';

    function obterEmailUsuarioAtivo() {
        if (window.ItaimSessao && typeof window.ItaimSessao.obterUsuarioLogado === 'function') {
            const u = window.ItaimSessao.obterUsuarioLogado();
            if (u && u.email) return u.email.toLowerCase().trim();
        }
        try {
            const salvo = JSON.parse(localStorage.getItem('itaim_usuario_logado') || '{}');
            if (salvo && salvo.email) return salvo.email.toLowerCase().trim();
        } catch(e) {}
        return 'admin@gmail.com';
    }

    /**
     * Atualiza os contadores numéricos nos ícones do cabeçalho
     */
    function atualizarBadgesGlobais() {
        const userEmail = obterEmailUsuarioAtivo();

        function aplicarBadgeChat(totalNaoLidas) {
            const badgeChat = document.getElementById('badge-conversas-header');
            if (badgeChat) {
                if (totalNaoLidas > 0) {
                    badgeChat.textContent = totalNaoLidas > 99 ? '99+' : totalNaoLidas;
                    badgeChat.style.display = 'inline-block';
                } else {
                    badgeChat.style.display = 'none';
                }
            }
        }

        // 1. Mensagens Não Lidas no Chat via API se autenticado
        if (window.ItaimApi && window.ItaimApi.auth && window.ItaimApi.auth.obterToken() && window.ItaimApi.chat && typeof window.ItaimApi.chat.contarNaoLidas === 'function') {
            window.ItaimApi.chat.contarNaoLidas().then(res => {
                if (res && res.success && res.data && typeof res.data.unreadCount === 'number') {
                    aplicarBadgeChat(res.data.unreadCount);
                }
            }).catch(() => {});
        } else {
            // Fallback para cache local
            try {
                const rawConversas = localStorage.getItem('itaim_conversas');
                if (rawConversas) {
                    const convs = JSON.parse(rawConversas);
                    let totalNaoLidas = 0;
                    if (Array.isArray(convs)) {
                        convs.forEach(c => {
                            const msgs = Array.isArray(c.mensagens) ? c.mensagens : [];
                            totalNaoLidas += msgs.filter(m => {
                                const rem = (m.remetenteEmail || '').toLowerCase().trim();
                                return rem !== userEmail && !m.lida;
                            }).length;
                        });
                    }
                    aplicarBadgeChat(totalNaoLidas);
                }
            } catch(e) {}
        }

        // 2. Notificações Não Lidas
        function aplicarBadgeNotifs(naoLidas) {
            const badgeNotifs = document.getElementById('badge-notificacoes-header');
            if (badgeNotifs) {
                if (naoLidas > 0) {
                    badgeNotifs.textContent = naoLidas > 99 ? '99+' : naoLidas;
                    badgeNotifs.style.display = 'inline-block';
                } else {
                    badgeNotifs.style.display = 'none';
                }
            }
            const drawerBadge = document.querySelector('.drawer-badge-notif, .badge-contador-notif');
            if (drawerBadge) {
                if (naoLidas > 0) {
                    drawerBadge.textContent = naoLidas > 99 ? '99+' : naoLidas;
                    drawerBadge.style.display = 'inline-block';
                } else {
                    drawerBadge.style.display = 'none';
                }
            }
        }

        if (window.ItaimApi && window.ItaimApi.auth && window.ItaimApi.auth.obterToken() && window.ItaimApi.notificacoes) {
            window.ItaimApi.notificacoes.obterContadorNaoLidas().then(res => {
                if (res && res.success && typeof res.unreadCount === 'number') {
                    aplicarBadgeNotifs(res.unreadCount);
                }
            }).catch(() => {});
        } else {
            try {
                const rawNotifs = localStorage.getItem('itaim_notificacoes');
                if (rawNotifs) {
                    const notifs = JSON.parse(rawNotifs);
                    let naoLidas = 0;
                    if (Array.isArray(notifs)) {
                        const prefs = (() => {
                            try { return JSON.parse(localStorage.getItem('itaim_configuracoes') || '{}'); } catch(e) { return {}; }
                        })();
                        naoLidas = notifs.filter(n => {
                            const dest = (n.destinatario || n.destinatarioEmail || '').toLowerCase().trim();
                            const ehParaMim = (!dest || dest === userEmail || dest === 'todos');
                            if (!ehParaMim || n.lida) return false;
                            const t = String(n.tipo || n.type || '').toLowerCase();
                            if ((t === 'mensagem' || t === 'message' || t === 'proposta' || t === 'proposal') && prefs['not-mensagens'] === false) return false;
                            if ((t === 'avaliacao' || t === 'review' || t === 'rating') && prefs['not-avaliacoes'] === false) return false;
                            if ((t === 'favorito' || t === 'favorite') && prefs['not-favoritos'] === false) return false;
                            if ((t === 'aviso' || t === 'preco' || t === 'sistema' || t === 'alert' || t === 'system') && prefs['not-avisos'] === false) return false;
                            return true;
                        }).length;
                    }
                    aplicarBadgeNotifs(naoLidas);
                }
            } catch(e) {}
        }
    }

    window.ItaimComponentesBadges = {
        atualizarBadgesGlobais
    };

})();
