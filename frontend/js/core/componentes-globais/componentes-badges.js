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

        // 1. Mensagens Não Lidas no Chat
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
        } catch(e) {}

        // 2. Notificações Não Lidas
        try {
            const rawNotifs = localStorage.getItem('itaim_notificacoes');
            if (rawNotifs) {
                const notifs = JSON.parse(rawNotifs);
                let naoLidas = 0;
                if (Array.isArray(notifs)) {
                    naoLidas = notifs.filter(n => {
                        const dest = (n.destinatario || n.destinatarioEmail || '').toLowerCase().trim();
                        const ehParaMim = (!dest || dest === userEmail || dest === 'todos');
                        return ehParaMim && !n.lida;
                    }).length;
                }

                const badgeNotifs = document.getElementById('badge-notificacoes-header');
                if (badgeNotifs) {
                    if (naoLidas > 0) {
                        badgeNotifs.textContent = naoLidas > 99 ? '99+' : naoLidas;
                        badgeNotifs.style.display = 'inline-block';
                    } else {
                        badgeNotifs.style.display = 'none';
                    }
                }
            }
        } catch(e) {}
    }

    window.ItaimComponentesBadges = {
        atualizarBadgesGlobais
    };

})();
