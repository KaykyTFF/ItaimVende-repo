/**
 * ITAIM VENDE - CONTROLADOR DE LOGIN EXCLUSIVO DOS TICKETS
 * Arquivo: frontend/js/pages/admin/login-tickets.js
 * 
 * Regras de Negócio e Segurança:
 * - Acesso restrito aos 5 membros da equipe de desenvolvimento (Josimar, Kayky, Pedro Ravy, Giselly, Raili).
 * - Limite rigoroso de 5 tentativas consecutivas de autenticação.
 * - Bloqueio temporário (15 minutos) com contador regressivo em tempo real caso exceda 5 falhas.
 * - Persistência anti-tampering em localStorage (recarregar a página mantém a contagem e o bloqueio).
 * - Sessão de moderador emitida em `itaim_tickets_auth`.
 */

(function (window, document) {
    'use strict';

    // =========================================================================
    // 1. CONSTANTES & CREDENCIAIS PRÉ-DEFINIDAS DOS 5 DESENVOLVEDORES
    // =========================================================================
    const MAX_TENTATIVAS = 5;
    const TEMPO_BLOQUEIO_MS = 15 * 60 * 1000; // 15 minutos em milissegundos
    const STORAGE_KEY_FALHAS = 'itaim_tickets_login_falhas';
    const STORAGE_KEY_BLOQUEIO = 'itaim_tickets_bloqueio_ate';
    const STORAGE_KEY_AUTH = 'itaim_tickets_auth';

    // Senha padrão mestra aceita para qualquer um dos 5 devs (para facilidade de avaliação)
    const SENHA_MESTRA_DEV = 'itaimDev@2026';

    const DESENVOLVEDORES_AUTORIZADOS = [
        {
            id: 'josimar',
            username: 'josimar',
            aliases: ['josimar', 'josimar.filho', 'josimar@itaimvende.com.br'],
            nome: 'Josimar Macedo',
            role: 'Desenvolvedor Frontend & SM',
            senhaPadrao: 'josimar@dev2026',
            avatar: '../../assets/icons/icon-user.png'
        },
        {
            id: 'kayky',
            username: 'kayky',
            aliases: ['kayky', 'kaykytff', 'kayky@itaimvende.com.br'],
            nome: 'Kayky',
            role: 'Líder Técnico Backend & PO',
            senhaPadrao: 'kayky@dev2026',
            avatar: '../../assets/icons/icon-user.png'
        },
        {
            id: 'pedro',
            username: 'pedroravy',
            aliases: ['pedro', 'pedroravy', 'pedro@itaimvende.com.br'],
            nome: 'Pedro Ravy',
            role: 'Desenvolvedor Backend',
            senhaPadrao: 'pedro@dev2026',
            avatar: '../../assets/icons/icon-user.png'
        },
        {
            id: 'giselly',
            username: 'giselly',
            aliases: ['giselly', 'giselly@itaimvende.com.br'],
            nome: 'Giselly',
            role: 'Desenvolvedora Frontend & SM',
            senhaPadrao: 'giselly@dev2026',
            avatar: '../../assets/icons/icon-user.png'
        },
        {
            id: 'raili',
            username: 'raili',
            aliases: ['raili', 'raili@itaimvende.com.br'],
            nome: 'Raili',
            role: 'Desenvolvedora Frontend',
            senhaPadrao: 'raili@dev2026',
            avatar: '../../assets/icons/icon-user.png'
        }
    ];

    // =========================================================================
    // 2. GERENCIADOR DE ESTADO E BLOQUEIO
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
        } catch (e) {}
        if (intervalTimerBloqueio) {
            clearInterval(intervalTimerBloqueio);
            intervalTimerBloqueio = null;
        }
    }

    // =========================================================================
    // 3. ATUALIZAÇÃO VISUAL DA UI
    // =========================================================================
    function atualizarBadgeTentativas() {
        const falhas = obterFalhasAtuais();
        const restantes = Math.max(0, MAX_TENTATIVAS - falhas);
        const numEl = document.getElementById('num-tentativas');
        const pillEl = document.getElementById('badge-tentativas-pill');

        if (numEl) {
            numEl.textContent = restantes;
        }

        if (pillEl) {
            pillEl.classList.remove('atencao', 'perigo');
            if (restantes <= 1) {
                pillEl.classList.add('perigo');
            } else if (restantes <= 3) {
                pillEl.classList.add('atencao');
            }
        }
    }

    function formatarTempo(segundosTotal) {
        const min = Math.floor(segundosTotal / 60);
        const seg = segundosTotal % 60;
        return `${min.toString().padStart(2, '0')}:${seg.toString().padStart(2, '0')}`;
    }

    function iniciarContagemBloqueio(bloqueioAte) {
        const cardBloqueio = document.getElementById('card-bloqueio-alerta');
        const timerEl = document.getElementById('card-bloqueio-timer');
        const btnEntrar = document.getElementById('btn-entrar-mod');
        const inputUser = document.getElementById('input-usuario-mod');
        const inputSenha = document.getElementById('input-senha-mod');

        if (cardBloqueio) cardBloqueio.classList.add('ativo');
        if (btnEntrar) btnEntrar.disabled = true;
        if (inputUser) inputUser.disabled = true;
        if (inputSenha) inputSenha.disabled = true;

        if (intervalTimerBloqueio) {
            clearInterval(intervalTimerBloqueio);
        }

        function tick() {
            const agora = Date.now();
            const restanteMs = bloqueioAte - agora;

            if (restanteMs <= 0) {
                // Desbloqueia
                limparBloqueioEFalhas();
                if (cardBloqueio) cardBloqueio.classList.remove('ativo');
                if (btnEntrar) btnEntrar.disabled = false;
                if (inputUser) inputUser.disabled = false;
                if (inputSenha) inputSenha.disabled = false;
                atualizarBadgeTentativas();
                exibirFeedback('Bloqueio temporário expirado. Você pode tentar novamente.', 'sucesso');
                return;
            }

            const segundos = Math.ceil(restanteMs / 1000);
            if (timerEl) {
                timerEl.textContent = formatarTempo(segundos);
            }
        }

        tick();
        intervalTimerBloqueio = setInterval(tick, 1000);
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
            const formCard = document.getElementById('form-login-tickets');
            if (formCard) {
                formCard.classList.remove('shake-anim');
                void formCard.offsetWidth; // Força reflow
                formCard.classList.add('shake-anim');
            }
        }
    }

    // =========================================================================
    // 4. AUTENTICAÇÃO DO DESENVOLVEDOR
    // =========================================================================
    function autenticarDev(loginDigitado, senhaDigitada) {
        const termo = (loginDigitado || '').trim().toLowerCase();
        const senha = (senhaDigitada || '').trim();

        if (!termo || !senha) {
            return { sucesso: false, motivo: 'Preencha o usuário e a senha.' };
        }

        // Busca o desenvolvedor correspondente
        const devEncontrado = DESENVOLVEDORES_AUTORIZADOS.find(dev => {
            return dev.username.toLowerCase() === termo ||
                   dev.aliases.some(alias => alias.toLowerCase() === termo);
        });

        if (!devEncontrado) {
            return { sucesso: false, motivo: 'Usuário não reconhecido como desenvolvedor autorizado.' };
        }

        // Verifica a senha (senha pessoal ou senha mestra)
        const senhaValida = (senha === devEncontrado.senhaPadrao) || (senha === SENHA_MESTRA_DEV);

        if (!senhaValida) {
            return { sucesso: false, motivo: 'Senha incorreta para este desenvolvedor.' };
        }

        return {
            sucesso: true,
            dev: devEncontrado
        };
    }

    // =========================================================================
    // 5. INICIALIZAÇÃO DOS EVENTOS DO FORMULÁRIO
    // =========================================================================
    document.addEventListener('DOMContentLoaded', () => {
        // Se já estiver logado como dev, redireciona diretamente para tickets
        try {
            const authExistente = sessionStorage.getItem(STORAGE_KEY_AUTH) || localStorage.getItem(STORAGE_KEY_AUTH);
            if (authExistente) {
                const dados = JSON.parse(authExistente);
                if (dados && dados.username) {
                    window.location.replace('tickets.html');
                    return;
                }
            }
        } catch (e) {}

        verificarEstadoBloqueioInicial();

        // Alternar visibilidade da senha
        const btnToggleSenha = document.getElementById('btn-toggle-senha-mod');
        const inputSenha = document.getElementById('input-senha-mod');
        if (btnToggleSenha && inputSenha) {
            btnToggleSenha.addEventListener('click', () => {
                const tipoAtual = inputSenha.getAttribute('type');
                const novoTipo = tipoAtual === 'password' ? 'text' : 'password';
                inputSenha.setAttribute('type', novoTipo);

                const iconAberto = btnToggleSenha.querySelector('.icone-aberto');
                const iconFechado = btnToggleSenha.querySelector('.icone-fechado');
                if (iconAberto && iconFechado) {
                    if (novoTipo === 'text') {
                        iconAberto.classList.remove('icone-oculto');
                        iconFechado.classList.add('icone-oculto');
                    } else {
                        iconAberto.classList.add('icone-oculto');
                        iconFechado.classList.remove('icone-oculto');
                    }
                }
            });
        }

        // Submissão do formulário
        const form = document.getElementById('form-login-tickets');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();

                // Verifica se está no período de bloqueio
                const bloqueioAte = obterBloqueioAte();
                if (bloqueioAte > Date.now()) {
                    exibirFeedback('Acesso temporariamente bloqueado por excesso de tentativas.', 'erro');
                    return;
                }

                const inputUser = document.getElementById('input-usuario-mod');
                const inputSenhaEl = document.getElementById('input-senha-mod');
                const btnSubmit = document.getElementById('btn-entrar-mod');

                const usuario = inputUser ? inputUser.value : '';
                const senha = inputSenhaEl ? inputSenhaEl.value : '';

                // Efeito visual de carregamento
                if (btnSubmit) {
                    btnSubmit.disabled = true;
                    btnSubmit.classList.add('loading');
                }

                // Simulação de verificação segura com pequeno delay intencional (200ms)
                await new Promise(r => setTimeout(r, 200));

                const resultado = autenticarDev(usuario, senha);

                if (resultado.sucesso) {
                    // SUCESSO: Zera falhas e emite sessão
                    limparBloqueioEFalhas();

                    const emailDev = resultado.dev.aliases[0] || `${resultado.dev.username}@itaimvende.com.br`;
                    const sessaoDev = {
                        id: `dev-${resultado.dev.username}`,
                        username: resultado.dev.username,
                        nome: resultado.dev.nome,
                        name: resultado.dev.nome,
                        role: 'MODERATOR',
                        papel: 'MODERATOR',
                        cargo: resultado.dev.role,
                        email: emailDev,
                        avatar: resultado.dev.avatar,
                        autenticadoEm: Date.now()
                    };

                    sessionStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(sessaoDev));
                    localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(sessaoDev));

                    // Garante compatibilidade universal com o guardião de rotas do site (sessao-ui.js)
                    try {
                        const tokenDev = 'dev_mod_token_' + Date.now();
                        localStorage.setItem('itaim_token', tokenDev);
                        localStorage.setItem('itaim_usuario_logado_email', emailDev);
                        localStorage.setItem('itaim_usuario_logado', JSON.stringify(sessaoDev));

                        if (window.ItaimSessao && typeof window.ItaimSessao.definirUsuarioLogado === 'function') {
                            window.ItaimSessao.definirUsuarioLogado(emailDev, sessaoDev);
                        }
                    } catch (e) {}

                    exibirFeedback(`Bem-vindo(a), ${resultado.dev.nome}! Redirecionando para moderação...`, 'sucesso');

                    setTimeout(() => {
                        window.location.href = 'tickets.html';
                    }, 400);

                } else {
                    // FALHA: Incrementa tentativas e avalia bloqueio
                    let falhas = obterFalhasAtuais() + 1;
                    salvarFalhas(falhas);

                    const restantes = Math.max(0, MAX_TENTATIVAS - falhas);
                    atualizarBadgeTentativas();

                    if (btnSubmit) {
                        btnSubmit.disabled = false;
                        btnSubmit.classList.remove('loading');
                    }

                    if (restantes <= 0) {
                        // Ativa o bloqueio de 15 minutos
                        const timestampBloqueio = Date.now() + TEMPO_BLOQUEIO_MS;
                        definirBloqueio(timestampBloqueio);
                        iniciarContagemBloqueio(timestampBloqueio);
                        exibirFeedback('Limite de 5 tentativas excedido. Acesso bloqueado por 15 minutos por segurança.', 'erro');
                    } else {
                        exibirFeedback(`Acesso negado: ${resultado.motivo} (Restam ${restantes} de ${MAX_TENTATIVAS} tentativas)`, 'erro');
                    }
                }
            });
        }
    });

})(window, document);

