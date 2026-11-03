/**
 * ITAIM VENDE - SERVIÇO DE AUTENTICAÇÃO E PERFIL (API AUTH)
 * Arquivo: frontend/js/core/api/api-auth.js
 * 
 * Responsabilidades:
 * - Login com e-mail/senha ou objeto
 * - Cadastro de novos usuários
 * - Autenticação / Cadastro integrado via Google Sign-In
 * - Consulta de perfil autenticado (/auth/me) e dados de usuários (/auth/user/:id)
 * - Atualização cadastral de dados e sincronização com sessão
 * - Encerramento de sessão (logout/expiração)
 */

(function() {
    'use strict';

    function getCore() {
        return window.ItaimApiCore || {
            requisicao: () => Promise.reject(new Error('ItaimApiCore não carregado')),
            obterHeaders: () => ({}),
            obterToken: () => localStorage.getItem('itaim_token') || ''
        };
    }

    function sincronizarFavoritosUsuarioAposAuth(userEmail) {
        if (!userEmail) return;
        try {
            if (window.ItaimApi && window.ItaimApi.favoritos && typeof window.ItaimApi.favoritos.listar === 'function') {
                window.ItaimApi.favoritos.listar().then(resFavs => {
                    if (resFavs && resFavs.success) {
                        const lista = Array.isArray(resFavs.favorites) ? resFavs.favorites : (Array.isArray(resFavs.data) ? resFavs.data : []);
                        const ids = lista.map(f => f.productId || f.product?.id || f.id).filter(Boolean);
                        localStorage.setItem('itaim_favoritos', JSON.stringify(ids));
                        localStorage.setItem('itaim_favoritos_' + userEmail.toLowerCase().trim(), JSON.stringify(ids));
                        if (window.ItaimSessao && typeof window.ItaimSessao.atualizarHeaderUsuario === 'function') {
                            window.ItaimSessao.atualizarHeaderUsuario();
                        }
                    }
                }).catch(() => {});
            }
        } catch(e) {}
    }

    const auth = {
        obterToken() {
            return getCore().obterToken();
        },

        obterUsuarioLogado() {
            try {
                return JSON.parse(localStorage.getItem('itaim_usuario_logado') || 'null');
            } catch {
                return null;
            }
        },

        /**
         * Encerra a sessão imediatamente por expiração ou reset do servidor,
         * notificando o usuário e limpando o armazenamento local.
         */
        expirarSessao(motivo = 'Sua sessão expirou.') {
            localStorage.removeItem('itaim_token');
            localStorage.removeItem('itaim_usuario_logado');
            localStorage.removeItem('itaim_ultima_atividade');
            localStorage.removeItem('itaim_favoritos');

            if (window.ItaimSessao && typeof window.ItaimSessao.deslogarUsuario === 'function') {
                window.ItaimSessao.deslogarUsuario();
            }

            console.info('[ItaimApi] Sessão limpa:', motivo);
        },

        /**
         * Autentica usuário com e-mail e senha
         */
        async login(emailOuDados, passwordParam) {
            const email = typeof emailOuDados === 'object' ? (emailOuDados.email || '') : (emailOuDados || '');
            const password = typeof emailOuDados === 'object' ? (emailOuDados.password || emailOuDados.senha || '') : (passwordParam || '');
            
            const resposta = await getCore().requisicao('/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (resposta.token) {
                localStorage.setItem('itaim_token', resposta.token);
                localStorage.setItem('itaim_ultima_atividade', Date.now().toString());
            }
            if (resposta.user) {
                localStorage.setItem('itaim_usuario_logado', JSON.stringify(resposta.user));
                localStorage.setItem('itaim_usuario_logado_email', resposta.user.email);
                if (window.ItaimSessao && typeof window.ItaimSessao.definirUsuarioLogado === 'function') {
                    window.ItaimSessao.definirUsuarioLogado(resposta.user.email || email, resposta.user);
                }
                sincronizarFavoritosUsuarioAposAuth(resposta.user.email || email);
            }
            return resposta;
        },

        /**
         * Registra nova conta de usuário
         */
        async registrar(dados) {
            const resposta = await getCore().requisicao('/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });

            if (resposta.token) {
                localStorage.setItem('itaim_token', resposta.token);
                localStorage.setItem('itaim_ultima_atividade', Date.now().toString());
            }
            if (resposta.user) {
                localStorage.setItem('itaim_usuario_logado', JSON.stringify(resposta.user));
                localStorage.setItem('itaim_usuario_logado_email', resposta.user.email || dados.email);
                if (window.ItaimSessao && typeof window.ItaimSessao.definirUsuarioLogado === 'function') {
                    window.ItaimSessao.definirUsuarioLogado(resposta.user.email || dados.email, resposta.user);
                }
                sincronizarFavoritosUsuarioAposAuth(resposta.user.email || dados.email);
            }
            return resposta;
        },

        /**
         * Autentica ou cadastra usuário via Google Sign-In (OAuth2 / Identity Services)
         */
        async googleAuth(payload) {
            const resposta = await getCore().requisicao('/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (resposta.token) {
                localStorage.setItem('itaim_token', resposta.token);
                localStorage.setItem('itaim_ultima_atividade', Date.now().toString());
            }
            if (resposta.user) {
                localStorage.setItem('itaim_usuario_logado', JSON.stringify(resposta.user));
                localStorage.setItem('itaim_usuario_logado_email', resposta.user.email);
                if (window.ItaimSessao && typeof window.ItaimSessao.definirUsuarioLogado === 'function') {
                    window.ItaimSessao.definirUsuarioLogado(resposta.user.email, resposta.user);
                }
                sincronizarFavoritosUsuarioAposAuth(resposta.user.email);
            }
            return resposta;
        },

        /**
         * Consulta dados do perfil logado
         */
        async perfil() {
            return getCore().requisicao('/auth/me', {
                method: 'GET',
                headers: getCore().obterHeaders(true)
            });
        },

        /**
         * Consulta dados públicos de um usuário por ID
         */
        async obterUsuario(id) {
            return getCore().requisicao(`/auth/user/${encodeURIComponent(id)}`, {
                method: 'GET',
                headers: getCore().obterHeaders(true)
            });
        },

        /**
         * Verifica disponibilidade e status de cooldown de 30 dias para o username (@)
         */
        async verificarDisponibilidadeUsername(username) {
            return getCore().requisicao(`/auth/check-username?username=${encodeURIComponent((username || '').trim())}`, {
                method: 'GET',
                headers: getCore().obterHeaders(true)
            });
        },

        /**
         * Atualiza informações cadastrais do perfil logado
         */
        async atualizarPerfil(dados) {
            const resposta = await getCore().requisicao('/auth/me', {
                method: 'PUT',
                headers: getCore().obterHeaders(true),
                body: JSON.stringify(dados)
            });
            if (resposta && resposta.user) {
                try {
                    const atual = JSON.parse(localStorage.getItem('itaim_usuario_logado') || '{}');
                    const fundido = { ...atual, ...resposta.user };
                    localStorage.setItem('itaim_usuario_logado', JSON.stringify(fundido));
                    if (window.ItaimSessao && typeof window.ItaimSessao.atualizarDadosUsuario === 'function') {
                        window.ItaimSessao.atualizarDadosUsuario(fundido.email, fundido);
                    }
                } catch(e) {}
            }
            return resposta;
        },

        /**
         * Altera a senha do usuário autenticado no backend
         */
        async alterarSenha(currentPassword, newPassword) {
            return getCore().requisicao('/auth/password', {
                method: 'PUT',
                headers: getCore().obterHeaders(true),
                body: JSON.stringify({ currentPassword, newPassword })
            });
        },

        /**
         * Exclui ou anonimiza permanentemente a conta do usuário autenticado no backend (LGPD)
         */
        async excluirConta() {
            try {
                const resposta = await getCore().requisicao('/auth/me', {
                    method: 'DELETE',
                    headers: getCore().obterHeaders(true)
                });
                this.logout();
                return resposta;
            } catch (err) {
                this.logout();
                throw err;
            }
        },

        /**
         * Solicita código de recuperação de senha por e-mail (POST /auth/forgot-password)
         */
        async solicitarRecuperacao(email) {
            return getCore().requisicao('/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: (email || '').trim() })
            });
        },

        /**
         * Valida o código OTP numérico de 6 dígitos (POST /auth/verify-reset-code)
         */
        async validarCodigoRecuperacao(email, code) {
            return getCore().requisicao('/auth/verify-reset-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: (email || '').trim(),
                    code: (code || '').trim()
                })
            });
        },

        /**
         * Redefine a senha do usuário com código ou token (POST /auth/reset-password)
         */
        async redefinirSenha({ email, token, code, newPassword }) {
            return getCore().requisicao('/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: (email || '').trim(),
                    token: token || undefined,
                    code: code || undefined,
                    newPassword
                })
            });
        },

        /**
         * Encerra a sessão ativa e remove credenciais
         */
        logout() {
            localStorage.removeItem('itaim_token');
            localStorage.removeItem('itaim_usuario_logado');
            localStorage.removeItem('itaim_server_boot');
            localStorage.removeItem('itaim_ultima_atividade');
            if (window.ItaimSessao && typeof window.ItaimSessao.deslogarUsuario === 'function') {
                window.ItaimSessao.deslogarUsuario();
            }
        }
    };

    window.ItaimApiAuth = auth;

})();
