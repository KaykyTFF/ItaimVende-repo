/**
 * ITAIM VENDE - CLIENTE WEBSOCKET EM TEMPO REAL (SOCKET.IO)
 * Arquivo: frontend/js/core/api/api-socket.js
 * 
 * Responsabilidades:
 * - Conexão persistente com servidor WebSocket via Socket.IO
 * - Autenticação transparente com JWT Bearer Token
 * - Entrega instantânea de mensagens entre comprador e vendedor
 * - Indicador de "digitando..." em tempo real no Chat
 * - Atualização ao vivo de propostas de valor (aceitar / recusar)
 * - Push notifications e atualização de badges numéricos no cabeçalho em 0ms
 */

(function (window, document) {
    'use strict';

    let socket = null;
    let conectado = false;
    let conversaAtivaId = null;
    let digitandoTimeout = null;
    const ouvintes = {};

    function obterToken() {
        return localStorage.getItem('itaim_token') || '';
    }

    function obterBackendHost() {
        if (window.ItaimApiCore && window.ItaimApiCore.BACKEND_HOST) {
            return window.ItaimApiCore.BACKEND_HOST;
        }
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return 'http://localhost:3000';
        }
        return window.location.origin;
    }

    /**
     * Garante que a biblioteca do cliente Socket.IO esteja carregada
     */
    function carregarBibliotecaSocketIO() {
        return new Promise((resolve) => {
            if (typeof window.io === 'function') {
                return resolve(true);
            }

            const backendHost = obterBackendHost();
            const scriptLocal = document.createElement('script');
            scriptLocal.src = `${backendHost}/socket.io/socket.io.js`;

            scriptLocal.onload = () => resolve(true);
            scriptLocal.onerror = () => {
                // Fallback via CDN confiável se a rota direta não carregar
                const scriptCdn = document.createElement('script');
                scriptCdn.src = 'https://cdn.socket.io/4.7.5/socket.io.min.js';
                scriptCdn.onload = () => resolve(true);
                scriptCdn.onerror = () => {
                    console.warn('[Socket.IO] Falha ao carregar biblioteca Socket.IO.');
                    resolve(false);
                };
                document.head.appendChild(scriptCdn);
            };

            document.head.appendChild(scriptLocal);
        });
    }

    /**
     * Exibe toast discreto e premium para notificações push ao vivo
     */
    function exibirToastPush(notificacao) {
        if (!notificacao || !notificacao.titulo) return;

        // Se o usuário estiver na página de notificações ou de chat específica, pode evitar toast redundante
        const naPaginaNotifs = window.location.pathname.includes('notificacoes.html');
        if (naPaginaNotifs) return;

        let container = document.getElementById('itaim-toast-push-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'itaim-toast-push-container';
            container.style.cssText = `
                position: fixed;
                bottom: 24px;
                right: 24px;
                z-index: 999999;
                display: flex;
                flex-direction: column;
                gap: 12px;
                max-width: 380px;
                pointer-events: none;
            `;
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.style.cssText = `
            pointer-events: auto;
            background: #0f172a;
            color: #ffffff;
            border-left: 4px solid #10b981;
            padding: 14px 18px;
            border-radius: 10px;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2);
            font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
            font-size: 13.5px;
            line-height: 1.45;
            cursor: pointer;
            transform: translateX(100%);
            opacity: 0;
            transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s ease;
        `;

        toast.innerHTML = `
            <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 8px;">
                <strong style="color: #38bdf8; font-weight: 700; font-size: 13px;">${notificacao.titulo}</strong>
                <span style="font-size: 11px; opacity: 0.6;">Agora</span>
            </div>
            <div style="color: #cbd5e1; margin-top: 4px; font-size: 13px;">${notificacao.texto || notificacao.message || ''}</div>
        `;

        toast.addEventListener('click', () => {
            if (notificacao.link) {
                window.location.href = notificacao.link;
            }
        });

        container.appendChild(toast);

        // Animação de entrada
        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(0)';
            toast.style.opacity = '1';
        });

        // Auto remove após 5 segundos
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 400);
        }, 5000);
    }

    /**
     * Aplica contadores nos badges do cabeçalho diretamente em 0ms
     */
    function aplicarBadgesAoVivo(dados) {
        if (!dados) return;

        // 1. Badge de Notificações
        const badgeNotifs = document.getElementById('badge-notificacoes-header');
        const drawerBadgeNotifs = document.querySelector('.drawer-badge-notif, .badge-contador-notif');
        const qtdNotifs = typeof dados.unreadNotifications === 'number' ? dados.unreadNotifications : null;

        if (qtdNotifs !== null) {
            if (badgeNotifs) {
                if (qtdNotifs > 0) {
                    badgeNotifs.textContent = qtdNotifs > 99 ? '99+' : qtdNotifs;
                    badgeNotifs.style.display = 'inline-block';
                } else {
                    badgeNotifs.style.display = 'none';
                }
            }
            if (drawerBadgeNotifs) {
                if (qtdNotifs > 0) {
                    drawerBadgeNotifs.textContent = qtdNotifs > 99 ? '99+' : qtdNotifs;
                    drawerBadgeNotifs.style.display = 'inline-block';
                } else {
                    drawerBadgeNotifs.style.display = 'none';
                }
            }
        }

        // 2. Badge de Conversas / Chat
        const badgeChat = document.getElementById('badge-conversas-header');
        const qtdMsgs = typeof dados.unreadMessages === 'number' ? dados.unreadMessages : null;

        if (qtdMsgs !== null && badgeChat) {
            if (qtdMsgs > 0) {
                badgeChat.textContent = qtdMsgs > 99 ? '99+' : qtdMsgs;
                badgeChat.style.display = 'inline-block';
            } else {
                badgeChat.style.display = 'none';
            }
        }

        // Também dispara atualização no componente global caso precise sincronizar cache
        if (window.ItaimComponentesBadges && typeof window.ItaimComponentesBadges.atualizarBadgesGlobais === 'function') {
            window.ItaimComponentesBadges.atualizarBadgesGlobais();
        }
    }

    /**
     * Objeto exportado com a API do Socket.IO para a aplicação
     */
    const ItaimSocket = {
        /**
         * Inicializa a conexão com o servidor WebSocket
         */
        async conectar() {
            const token = obterToken();
            if (!token) return;

            const carregou = await carregarBibliotecaSocketIO();
            if (!carregou || typeof window.io !== 'function') return;

            if (socket && socket.connected) return;

            const host = obterBackendHost();
            socket = window.io(host, {
                auth: { token },
                transports: ['websocket', 'polling'],
                reconnection: true,
                reconnectionAttempts: 20,
                reconnectionDelay: 1000,
            });

            socket.on('connect', () => {
                conectado = true;
                console.log('⚡ [ItaimSocket] Conectado ao servidor WebSocket com sucesso.');

                // Se houver conversa ativa marcada, reingressa na sala
                if (conversaAtivaId) {
                    this.entrarConversa(conversaAtivaId);
                }
            });

            socket.on('disconnect', (reason) => {
                conectado = false;
                console.log('[ItaimSocket] Desconectado:', reason);
            });

            // 1. Atualização Instantânea de Badges (Contador push)
            socket.on('badge_update', (dados) => {
                aplicarBadgesAoVivo(dados);
                this._emitirLocal('badge_update', dados);
            });

            // 2. Nova Notificação Push Recebida
            socket.on('notification_new', (notificacao) => {
                exibirToastPush(notificacao);
                this._emitirLocal('notification_new', notificacao);

                // Dispara evento DOM para páginas ouvintes (ex: notificacoes.js)
                window.dispatchEvent(new CustomEvent('itaim:notification_new', { detail: notificacao }));
            });

            // 3. Nova Mensagem em Conversa
            socket.on('new_message', (mensagem) => {
                this._emitirLocal('new_message', mensagem);
                window.dispatchEvent(new CustomEvent('itaim:new_message', { detail: mensagem }));
            });

            // 4. Atualização de Conversa (Sidebar Preview)
            socket.on('conversation_updated', (dados) => {
                this._emitirLocal('conversation_updated', dados);
                window.dispatchEvent(new CustomEvent('itaim:conversation_updated', { detail: dados }));
            });

            // 5. Atualização de Status de Proposta ao Vivo
            socket.on('proposal_status_changed', (dados) => {
                this._emitirLocal('proposal_status_changed', dados);
                window.dispatchEvent(new CustomEvent('itaim:proposal_status_changed', { detail: dados }));
            });

            // 6. Indicador de "digitando..."
            socket.on('user_typing', (dados) => {
                this._emitirLocal('user_typing', dados);
                window.dispatchEvent(new CustomEvent('itaim:user_typing', { detail: dados }));
            });
        },

        /**
         * Desconecta o WebSocket
         */
        desconectar() {
            if (socket) {
                socket.disconnect();
                socket = null;
                conectado = false;
            }
        },

        /**
         * Entra na sala de uma conversa para receber mensagens em tempo real
         */
        entrarConversa(conversationId) {
            conversaAtivaId = conversationId;
            if (socket && socket.connected && conversationId) {
                socket.emit('join_conversation', { conversationId });
            }
        },

        /**
         * Sai da sala de uma conversa
         */
        sairConversa(conversationId) {
            if (conversaAtivaId === conversationId) {
                conversaAtivaId = null;
            }
            if (socket && socket.connected && conversationId) {
                socket.emit('leave_conversation', { conversationId });
            }
        },

        /**
         * Envia evento de "digitando..." para o outro participante da conversa
         */
        enviarDigitando(conversationId, isTyping) {
            if (!socket || !socket.connected || !conversationId) return;

            socket.emit('typing', { conversationId, isTyping: Boolean(isTyping) });

            if (isTyping) {
                clearTimeout(digitandoTimeout);
                digitandoTimeout = setTimeout(() => {
                    if (socket && socket.connected) {
                        socket.emit('typing', { conversationId, isTyping: false });
                    }
                }, 2500);
            }
        },

        /**
         * Registra um ouvinte para eventos WebSocket
         */
        on(evento, callback) {
            if (!ouvintes[evento]) ouvintes[evento] = [];
            ouvintes[evento].push(callback);
        },

        /**
         * Remove um ouvinte
         */
        off(evento, callback) {
            if (!ouvintes[evento]) return;
            ouvintes[evento] = ouvintes[evento].filter((cb) => cb !== callback);
        },

        /**
         * Emite evento local para os ouvintes registrados
         */
        _emitirLocal(evento, dados) {
            if (Array.isArray(ouvintes[evento])) {
                ouvintes[evento].forEach((cb) => {
                    try {
                        cb(dados);
                    } catch (e) {
                        console.error('[ItaimSocket] Erro no ouvinte de', evento, e);
                    }
                });
            }
        },

        /**
         * Retorna status de conexão
         */
        estaConectado() {
            return conectado && socket && socket.connected;
        },
    };

    window.ItaimSocket = ItaimSocket;

    // Inicialização automática quando o DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => ItaimSocket.conectar());
    } else {
        ItaimSocket.conectar();
    }

    // Reconecta automaticamente ao logar
    window.addEventListener('storage', (e) => {
        if (e.key === 'itaim_token' && e.newValue) {
            ItaimSocket.conectar();
        } else if (e.key === 'itaim_token' && !e.newValue) {
            ItaimSocket.desconectar();
        }
    });

})(window, document);
