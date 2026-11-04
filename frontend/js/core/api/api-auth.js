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
         * Altera exclusivamente o nome de usuário (@) com controle de 30 dias
         */
        async alterarUsername(username) {
            return getCore().requisicao('/account/username', {
                method: 'PATCH',
                headers: getCore().obterHeaders(true),
                body: JSON.stringify({ username: (username || '').trim().toLowerCase() })
            });
        },

        /**
         * Verifica disponibilidade e validação de nome de usuário (@) em tempo real
         */
        async verificarDisponibilidadeUsername(username) {
            const clean = encodeURIComponent((username || '').trim().toLowerCase());
            return getCore().requisicao('/account/username/check?username=' + clean, {
                method: 'GET',
                headers: getCore().obterHeaders(true)
            });
        },

        /**
         * Solicita a troca de e-mail com reautenticação por senha atual
         */
        async solicitarTrocaEmail(currentPassword, newEmail) {
            return getCore().requisicao('/account/email/change-request', {
                method: 'POST',
                headers: getCore().obterHeaders(true),
                body: JSON.stringify({
                    currentPassword,
                    newEmail: (newEmail || '').trim().toLowerCase()
                })
            });
        },

        /**
         * Confirma a alteração do e-mail com código OTP de 6 dígitos
         */
        async confirmarTrocaEmail(newEmail, code) {
            return getCore().requisicao('/account/email/confirm', {
                method: 'POST',
                headers: getCore().obterHeaders(true),
                body: JSON.stringify({
                    newEmail: (newEmail || '').trim().toLowerCase(),
                    code: (code || '').trim()
                })
            });
        },

        /**
          * Altera ou remove exclusivamente o número de WhatsApp/celular da conta (Legado)
          */
        async alterarTelefone(phone) {
            const resposta = await getCore().requisicao('/account/phone', {
                method: 'PATCH',
                headers: getCore().obterHeaders(true),
                body: JSON.stringify({
                    phone: phone ? String(phone).trim() : null
                })
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
          * Solicita alteração segura de WhatsApp com envio de código OTP para telefone e e-mail
          */
        async solicitarAlteracaoTelefone(currentPassword, newPhone, channel = 'whatsapp') {
            return getCore().requisicao('/account/phone/change-request', {
                method: 'POST',
                headers: getCore().obterHeaders(true),
                body: JSON.stringify({
                    currentPassword: currentPassword ? String(currentPassword).trim() : undefined,
                    newPhone: String(newPhone).trim(),
                    channel
                })
            });
        },

        /**
          * Confirma alteração de WhatsApp com código OTP de 6 dígitos
          */
        async confirmarAlteracaoTelefone(newPhone, code) {
            const resposta = await getCore().requisicao('/account/phone/confirm', {
                method: 'POST',
                headers: getCore().obterHeaders(true),
                body: JSON.stringify({
                    newPhone: String(newPhone).trim(),
                    code: String(code).trim()
                })
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
          * Remove com segurança o número de WhatsApp da conta
          */
        async removerTelefoneSeguro(currentPassword) {
            const resposta = await getCore().requisicao('/account/phone', {
                method: 'DELETE',
                headers: getCore().obterHeaders(true),
                body: JSON.stringify({
                    currentPassword: currentPassword ? String(currentPassword).trim() : undefined
                })
            });
            if (resposta && resposta.user) {
                try {
                    const atual = JSON.parse(localStorage.getItem('itaim_usuario_logado') || '{}');
                    const fundido = { ...atual, ...resposta.user, phone: null, telefone: null, isPhoneVerified: false, phoneVerifiedAt: null };
                    localStorage.setItem('itaim_usuario_logado', JSON.stringify(fundido));
                    if (window.ItaimSessao && typeof window.ItaimSessao.atualizarDadosUsuario === 'function') {
                        window.ItaimSessao.atualizarDadosUsuario(fundido.email, fundido);
                    }
                } catch(e) {}
            }
            return resposta;
        },

        /**
          * Reverte a alteração de telefone via link de segurança "Não fui eu"
          */
        async reverterAlteracaoTelefone(token) {
            return getCore().requisicao('/account/phone/revert', {
                method: 'POST',
                headers: getCore().obterHeaders(false),
                body: JSON.stringify({ token })
            });
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
         * Consulta as preferências do usuário no backend (GET /account/preferences)
         */
        async obterPreferencias() {
            return getCore().requisicao('/account/preferences', {
                method: 'GET',
                headers: getCore().obterHeaders(true)
            });
        },

        /**
         * Atualiza as preferências do usuário no backend (PATCH /account/preferences)
         */
        async atualizarPreferencias(preferencias) {
            return getCore().requisicao('/account/preferences', {
                method: 'PATCH',
                headers: getCore().obterHeaders(true),
                body: JSON.stringify(preferencias)
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
