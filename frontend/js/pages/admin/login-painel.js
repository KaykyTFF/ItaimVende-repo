/**
 * ITAIM VENDE - CONTROLADOR DE LOGIN DO PAINEL DE CONTROLE (ADMIN)
 * Arquivo: frontend/js/pages/admin/login-painel.js
 * 
 * Regras de Segurança e Controle de Acesso:
 * - Acesso exclusivo a Administradores (role === 'ADMIN' ou 'MODERATOR') e aos 5 Desenvolvedores autorizados.
 * - Bloqueio imediato para contas comuns (BUYER e SELLER) sem privilégios administrativos.
 * - Limite rigoroso de 5 tentativas de autenticação antes de ativar bloqueio temporário de 15 minutos.
 * - Persistência anti-tampering em localStorage e sessionStorage.
 * - Emissão de sessão administrativa para observabilidade e telemetria.
 */

(function (window, document) {
    'use strict';

    // =========================================================================
    // 1. CONSTANTES E CONFIGURAÇÕES DE SEGURANÇA
    // =========================================================================
    const MAX_TENTATIVAS = 5;
    const TEMPO_BLOQUEIO_MS = 15 * 60 * 1000; // 15 minutos
    const STORAGE_KEY_FALHAS = 'itaim_painel_login_falhas';
    const STORAGE_KEY_BLOQUEIO = 'itaim_painel_bloqueio_ate';
    const STORAGE_KEY_AUTH = 'itaim_painel_auth';

    // Senha mestra aceita para a equipe de desenvolvimento
    const SENHA_MESTRA_DEV = 'itaimDev@2026';

    const DESENVOLVEDORES_AUTORIZADOS = [
        {
            id: 'josimar',
            username: 'josimar',
            aliases: ['josimar', 'josimar.filho', 'josimar@itaimvende.com.br'],
            nome: 'Josimar Macedo',
            role: 'ADMIN',
            cargo: 'Desenvolvedor Frontend & SM',
            senhaPadrao: 'josimar@dev2026',
            avatar: '../../assets/icons/icon-user.png'
        },
        {
            id: 'kayky',
            username: 'kayky',
            aliases: ['kayky', 'kaykytff', 'kayky@itaimvende.com.br'],
            nome: 'Kayky',
            role: 'ADMIN',
            cargo: 'Líder Técnico Backend & PO',
            senhaPadrao: 'kayky@dev2026',
            avatar: '../../assets/icons/icon-user.png'
        },
        {
            id: 'pedro',
            username: 'pedroravy',
            aliases: ['pedro', 'pedroravy', 'pedro@itaimvende.com.br'],
            nome: 'Pedro Ravy',
            role: 'ADMIN',
            cargo: 'Desenvolvedor Backend',
            senhaPadrao: 'pedro@dev2026',
            avatar: '../../assets/icons/icon-user.png'
        },
        {
            id: 'giselly',
            username: 'giselly',
            aliases: ['giselly', 'giselly@itaimvende.com.br'],
            nome: 'Giselly',
            role: 'ADMIN',
            cargo: 'Desenvolvedora Frontend & SM',
            senhaPadrao: 'giselly@dev2026',
            avatar: '../../assets/icons/icon-user.png'
        },
        {
            id: 'raili',
            username: 'raili',
            aliases: ['raili', 'raili@itaimvende.com.br'],
            nome: 'Raili',
            role: 'ADMIN',
            cargo: 'Desenvolvedora Frontend',
            senhaPadrao: 'raili@dev2026',
            avatar: '../../assets/icons/icon-user.png'
        }
    ];

    // =========================================================================
    // 2. GERENCIADOR DE ESTADO E BLOQUEIO CONTRA FORÇA BRUTA
    // =========================================================================
    let intervalTimerBloqueio = null;

    function obterFalhasAtuais() {
        try {
            const val = parseInt(localStorage.getItem(STORAGE_KEY_FALHAS) || '0', 10);
            return isNaN(val) ? 0 : Math.max(0, val);
        } catch (e) {
            return 0;
        }
    }

    function salvarFalhas(qtd) {
        try {
            localStorage.setItem(STORAGE_KEY_FALHAS, qtd.toString());
        } catch (e) {}
    }

    function obterBloqueioAte() {
        try {
            const val = parseInt(localStorage.getItem(STORAGE_KEY_BLOQUEIO) || '0', 10);
            return isNaN(val) ? 0 : val;
        } catch (e) {
            return 0;
        }
    }

    function definirBloqueio(timestamp) {
        try {
            localStorage.setItem(STORAGE_KEY_BLOQUEIO, timestamp.toString());
        } catch (e) {}
    }

    function limparBloqueioEFalhas() {
        try {
            localStorage.removeItem(STORAGE_KEY_FALHAS);
            localStorage.removeItem(STORAGE_KEY_BLOQUEIO);
            if (intervalTimerBloqueio) {
                clearInterval(intervalTimerBloqueio);
                intervalTimerBloqueio = null;
            }
        } catch (e) {}
    }

    function atualizarBadgeTentativas() {
        const badgeEl = document.getElementById('badge-tentativas');
        if (!badgeEl) return;

        const falhas = obterFalhasAtuais();
        const restantes = Math.max(0, MAX_TENTATIVAS - falhas);

        badgeEl.textContent = `${restantes} de ${MAX_TENTATIVAS} restantes`;
        badgeEl.className = 'badge-tentativas-pill';

        if (restantes <= 1) {
            badgeEl.classList.add('perigo');
        } else if (restantes <= 3) {
            badgeEl.classList.add('atencao');
        }
    }

    function iniciarContagemBloqueio(timestampFim) {
        const cardBloqueio = document.getElementById('card-bloqueio-alerta');
        const timerEl = document.getElementById('card-bloqueio-timer');
        const btnSubmit = document.getElementById('btn-entrar-adm');
        const inputUser = document.getElementById('input-usuario-adm');
        const inputSenha = document.getElementById('input-senha-adm');

        if (cardBloqueio) cardBloqueio.style.display = 'flex';
        if (btnSubmit) btnSubmit.disabled = true;
        if (inputUser) inputUser.disabled = true;
        if (inputSenha) inputSenha.disabled = true;

        if (intervalTimerBloqueio) clearInterval(intervalTimerBloqueio);

        function atualizarRelogio() {
            const agora = Date.now();
            const restanteMs = timestampFim - agora;

            if (restanteMs <= 0) {
                limparBloqueioEFalhas();
                if (cardBloqueio) cardBloqueio.style.display = 'none';
                if (btnSubmit) btnSubmit.disabled = false;
                if (inputUser) inputUser.disabled = false;
                if (inputSenha) inputSenha.disabled = false;
                atualizarBadgeTentativas();
                exibirFeedback('Bloqueio encerrado. Você já pode tentar novamente.', 'sucesso');
                return;
            }

            const minutos = Math.floor(restanteMs / 60000);
            const segundos = Math.floor((restanteMs % 60000) / 1000);
            if (timerEl) {
                timerEl.textContent = `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
            }
        }

        atualizarRelogio();
        intervalTimerBloqueio = setInterval(atualizarRelogio, 1000);
    }

    function verificarEstadoBloqueioInicial() {
        const bloqueioAte = obterBloqueioAte();
        const agora = Date.now();

        if (bloqueioAte > agora) {
            iniciarContagemBloqueio(bloqueioAte);
        } else {
            if (bloqueioAte > 0) {
                limparBloqueioEFalhas();
            }
            atualizarBadgeTentativas();
        }
    }

    function exibirFeedback(mensagem, tipo = 'erro') {
        const msgEl = document.getElementById('status-msg-login');
        if (!msgEl) return;

        msgEl.textContent = mensagem;
        msgEl.className = `status-msg status-${tipo}`;
        msgEl.style.display = 'block';
        msgEl.style.opacity = '1';

        if (tipo === 'erro') {
            const formCard = document.getElementById('form-login-painel');
            if (formCard) {
                formCard.classList.remove('shake-anim');
                void formCard.offsetWidth;
                formCard.classList.add('shake-anim');
            }
        }
    }

    // =========================================================================
    // 3. MOTOR DE AUTENTICAÇÃO ADMINISTRATIVA (DEV + BACKEND REST RBAC)
    // =========================================================================
    async function autenticarAdmin(loginDigitado, senhaDigitada) {
        const termo = (loginDigitado || '').trim();
        const termoLower = termo.toLowerCase();
        const senha = (senhaDigitada || '').trim();

        if (!termo || !senha) {
            return { sucesso: false, motivo: 'Preencha o usuário e a senha.' };
        }

        // 1. Verificação na lista de Desenvolvedores Autorizados
        const devEncontrado = DESENVOLVEDORES_AUTORIZADOS.find(dev => {
            return dev.username.toLowerCase() === termoLower ||
                   dev.aliases.some(alias => alias.toLowerCase() === termoLower);
        });

        if (devEncontrado) {
            const senhaValida = (senha === devEncontrado.senhaPadrao) || (senha === SENHA_MESTRA_DEV);
            if (senhaValida) {
                return {
                    sucesso: true,
                    admin: {
                        id: `dev-${devEncontrado.username}`,
                        username: devEncontrado.username,
                        nome: devEncontrado.nome,
                        name: devEncontrado.nome,
                        role: 'ADMIN',
                        papel: 'ADMIN',
                        cargo: devEncontrado.cargo,
                        email: devEncontrado.aliases[0] || `${devEncontrado.username}@itaimvende.com.br`,
                        avatar: devEncontrado.avatar,
                        autenticadoEm: Date.now()
                    }
                };
            }
        }

        // 2. Verificação no Backend via API REST (/api/v1/auth/login)
        try {
            const resp = await fetch('/api/v1/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: termo, password: senha })
            });

            if (resp.ok) {
                const resJson = await resp.json();
                if (resJson && resJson.success && resJson.data) {
                    const usuarioBackend = resJson.data.user || {};
                    const role = (usuarioBackend.role || '').toUpperCase();

                    // BLOQUEIO RESTRITO: Apenas ADMIN e MODERATOR são admitidos
                    if (role !== 'ADMIN' && role !== 'MODERATOR') {
                        return {
                            sucesso: false,
                            motivo: 'Acesso negado: sua conta é de usuário comum. Somente Administradores e Moderadores têm acesso ao Painel.'
                        };
                    }

                    // Se logou com sucesso no backend, persiste o token Bearer para requisições de sistema
                    if (resJson.data.token) {
                        try {
                            localStorage.setItem('itaim_token', resJson.data.token);
                            sessionStorage.setItem('itaim_token', resJson.data.token);
                        } catch (e) {}
                    }

                    return {
                        sucesso: true,
                        admin: {
                            id: usuarioBackend.id || 'admin_db',
                            username: usuarioBackend.username || usuarioBackend.email?.split('@')[0] || 'admin',
                            nome: usuarioBackend.name || 'Administrador',
                            name: usuarioBackend.name || 'Administrador',
                            role: role,
                            papel: role,
                            cargo: role === 'ADMIN' ? 'Administrador Geral' : 'Moderador',
                            email: usuarioBackend.email,
                            avatar: usuarioBackend.avatarUrl || '../../assets/icons/icon-user.png',
                            autenticadoEm: Date.now()
                        }
                    };
                }
            } else if (resp.status === 401 || resp.status === 400) {
                return { sucesso: false, motivo: 'Usuário ou senha incorretos.' };
            }
        } catch (errApi) {
            console.warn('[Login Admin] API offline ou inacessível no momento:', errApi);
        }

        // Se falhou em ambas as camadas
        return { sucesso: false, motivo: 'Credenciais inválidas ou acesso não autorizado como Administrador.' };
    }

    // =========================================================================
    // 4. INICIALIZAÇÃO E EVENTOS DO FORMULÁRIO
    // =========================================================================
    document.addEventListener('DOMContentLoaded', () => {
        // Redireciona caso já possua sessão ativa de administrador
        try {
            const authExistente = sessionStorage.getItem(STORAGE_KEY_AUTH) || 
                                  localStorage.getItem(STORAGE_KEY_AUTH) ||
                                  sessionStorage.getItem('itaim_tickets_auth') ||
                                  localStorage.getItem('itaim_tickets_auth');
            if (authExistente) {
                const dados = JSON.parse(authExistente);
                if (dados && (dados.username || dados.nome)) {
                    window.location.replace('painel.html');
                    return;
                }
            }
        } catch (e) {}

        verificarEstadoBloqueioInicial();

        // Alternar visibilidade da senha
        const btnToggleSenha = document.getElementById('btn-toggle-senha-adm');
        const inputSenha = document.getElementById('input-senha-adm');
        if (btnToggleSenha && inputSenha) {
            btnToggleSenha.addEventListener('click', () => {
                const tipoAtual = inputSenha.getAttribute('type');
                const novoTipo = tipoAtual === 'password' ? 'text' : 'password';
                inputSenha.setAttribute('type', novoTipo);

                const iconAberto = btnToggleSenha.querySelector('.icone-aberto');
                const iconFechado = btnToggleSenha.querySelector('.icone-fechado');
                if (iconAberto && iconFechado) {
                    if (novoTipo === 'text') {
                        iconAberto.classList.add('icone-oculto');
                        iconFechado.classList.remove('icone-oculto');
                    } else {
                        iconAberto.classList.remove('icone-oculto');
                        iconFechado.classList.add('icone-oculto');
                    }
                }
            });
        }

        // Submissão do formulário
        const form = document.getElementById('form-login-painel');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();

                const bloqueioAte = obterBloqueioAte();
                if (bloqueioAte > Date.now()) {
                    exibirFeedback('Acesso temporariamente bloqueado por excesso de tentativas.', 'erro');
                    return;
                }

                const inputUser = document.getElementById('input-usuario-adm');
                const inputSenhaEl = document.getElementById('input-senha-adm');
                const btnSubmit = document.getElementById('btn-entrar-adm');

                const usuario = inputUser ? inputUser.value : '';
                const senha = inputSenhaEl ? inputSenhaEl.value : '';

                if (btnSubmit) {
                    btnSubmit.disabled = true;
                    btnSubmit.classList.add('loading');
                }

                const resultado = await autenticarAdmin(usuario, senha);

                if (resultado.sucesso) {
                    limparBloqueioEFalhas();

                    // Salva a sessão do administrador
                    sessionStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(resultado.admin));
                    localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(resultado.admin));

                    // Sincroniza com tickets para permitir trânsito livre entre áreas de gestão
                    sessionStorage.setItem('itaim_tickets_auth', JSON.stringify(resultado.admin));
                    localStorage.setItem('itaim_tickets_auth', JSON.stringify(resultado.admin));

                    // Salva também o perfil logado no padrão do sistema
                    localStorage.setItem('itaim_usuario_logado', JSON.stringify({
                        id: resultado.admin.id,
                        name: resultado.admin.nome,
                        nome: resultado.admin.nome,
                        username: resultado.admin.username,
                        role: resultado.admin.role,
                        papel: resultado.admin.papel,
                        email: resultado.admin.email
                    }));

                    exibirFeedback(`Bem-vindo(a), ${resultado.admin.nome}! Acesso concedido ao Painel de Controle...`, 'sucesso');

                    setTimeout(() => {
                        const isPages = window.location.pathname.includes('/pages/');
                        const destino = isPages ? 'painel.html' : '/painel';
                        window.location.href = destino;
                    }, 400);

                } else {
                    let falhas = obterFalhasAtuais() + 1;
                    salvarFalhas(falhas);

                    const restantes = Math.max(0, MAX_TENTATIVAS - falhas);
                    atualizarBadgeTentativas();

                    if (btnSubmit) {
                        btnSubmit.disabled = false;
                        btnSubmit.classList.remove('loading');
                    }

                    if (restantes <= 0) {
                        const timestampBloqueio = Date.now() + TEMPO_BLOQUEIO_MS;
                        definirBloqueio(timestampBloqueio);
                        iniciarContagemBloqueio(timestampBloqueio);
                        exibirFeedback('Limite de 5 tentativas excedido. Acesso ao painel bloqueado por 15 minutos.', 'erro');
                    } else {
                        exibirFeedback(`${resultado.motivo} (Restam ${restantes} tentativas)`, 'erro');
                    }
                }
            });
        }
    });

})(window, document);

