/**
 * ITAIM VENDE - CONFIGURAÇÕES DO USUÁRIO (BUNDLE UNIFICADO)
 * Arquivo: frontend/js/pages/perfil/configuracoes.bundle.js
 * Gerado automaticamente via: node scripts/build-configuracoes.js
 */

// ==========================================================================
// MÓDULO: UTILITÁRIOS E PERSISTÊNCIA (config-utils.js)
// ==========================================================================

/**
 * ITAIM VENDE - CONFIGURAÇÕES: UTILITÁRIOS E PERSISTÊNCIA
 * Arquivo: frontend/js/pages/perfil/configuracoes/config-utils.js
 */

(function () {
    'use strict';

    const CHAVE_PERFIL = 'itaim_perfil_usuario';
    const CHAVE_ENDERECOS = 'itaim_enderecos';
    const CHAVE_CONFIG = 'itaim_configuracoes';

    const PADROES = {
        'seg-alerta-login': true,
        'not-mensagens': true,
        'not-avaliacoes': true,
        'not-compras': true,
        'not-favoritos': true,
        'not-precos': true,
        'not-expiracao': true,
        'not-avisos': true,
        'priv-telefone': true,
        'priv-bairro': true,
        'priv-online': false
    };

    function ler(chave, padrao) {
        try {
            const bruto = localStorage.getItem(chave);
            return bruto ? JSON.parse(bruto) : padrao;
        } catch (e) {
            return padrao;
        }
    }

    function gravar(chave, valor) {
        try {
            localStorage.setItem(chave, JSON.stringify(valor));
            return true;
        } catch (e) {
            return false;
        }
    }

    const $ = (id) => document.getElementById(id);
    const soDigitos = (v) => (v || '').replace(/\D/g, '');

    let temporizadorToast = null;
    function toast(msg, erro = false) {
        const el = $('cfg-toast');
        if (!el) return;
        el.textContent = msg;
        el.classList.toggle('erro', erro);
        el.classList.add('visivel');
        clearTimeout(temporizadorToast);
        temporizadorToast = setTimeout(() => el.classList.remove('visivel'), 3200);
    }

    function marcarErro(inputId, erroId, mensagem) {
        const input = $(inputId), erro = $(erroId);
        if (input) input.classList.toggle('invalido', !!mensagem);
        if (erro) erro.textContent = mensagem || '';
        return !mensagem;
    }

    function maskTelefone(v) {
        v = soDigitos(v).slice(0, 11);
        if (v.length > 6) return v.replace(/^(\d{2})(\d{4,5})(\d{0,4}).*/, '($1) $2-$3').replace(/-$/, '');
        if (v.length > 2) return v.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
        if (v.length > 0) return `(${v}`;
        return '';
    }

    function maskCep(v) {
        v = soDigitos(v).slice(0, 8);
        return v.length > 5 ? v.replace(/^(\d{5})(\d{0,3})/, '$1-$2') : v;
    }

    const emailValido = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

    function criarElemento(tag, classe, texto) {
        const el = document.createElement(tag);
        if (classe) el.className = classe;
        if (texto !== undefined) el.textContent = texto;
        return el;
    }

    window.ItaimConfigUtils = {
        CHAVE_PERFIL,
        CHAVE_ENDERECOS,
        CHAVE_CONFIG,
        PADROES,
        ler,
        gravar,
        $,
        soDigitos,
        toast,
        marcarErro,
        maskTelefone,
        maskCep,
        emailValido,
        criarElemento
    };
})();

// ==========================================================================
// MÓDULO: NAVEGAÇÃO POR ABAS (config-navegacao.js)
// ==========================================================================

/**
 * ITAIM VENDE - CONFIGURAÇÕES: NAVEGAÇÃO ENTRE ABAS E SEÇÕES
 * Arquivo: frontend/js/pages/perfil/configuracoes/config-navegacao.js
 */

(function () {
    'use strict';

    function inicializar() {
        const abas = document.querySelectorAll('.cfg-nav-item');
        const paineis = document.querySelectorAll('.cfg-painel');

        function abrirSecao(nome, atualizarHash = true) {
            if (!document.getElementById('painel-' + nome)) nome = 'conta';
            abas.forEach(a => {
                const ativo = a.dataset.alvo === nome;
                a.classList.toggle('ativo', ativo);
                a.setAttribute('aria-selected', ativo ? 'true' : 'false');
            });
            paineis.forEach(p => p.classList.toggle('ativo', p.id === 'painel-' + nome));
            if (atualizarHash) history.replaceState(null, '', '#' + nome);
        }

        abas.forEach(a => a.addEventListener('click', () => abrirSecao(a.dataset.alvo)));
        window.addEventListener('hashchange', () => abrirSecao(location.hash.slice(1), false));

        abrirSecao(location.hash.slice(1) || 'conta', false);

        window.ItaimConfigNavegacao.abrirSecao = abrirSecao;
    }

    window.ItaimConfigNavegacao = {
        inicializar,
        abrirSecao: null
    };
})();

// ==========================================================================
// MÓDULO: ZONA DE RISCO E MODAL (config-risco.js)
// ==========================================================================

/**
 * ITAIM VENDE - CONFIGURAÇÕES: ZONA DE RISCO E MODAL DE CONFIRMAÇÃO
 * Arquivo: frontend/js/pages/perfil/configuracoes/config-risco.js
 */

(function () {
    'use strict';

    function inicializar() {
        const { $ } = window.ItaimConfigUtils;
        const modal = $('cfg-modal');
        let aoConfirmar = null;

        function confirmar(titulo, texto, fn, textoBotao = 'Confirmar', isPerigo = true) {
            if (!modal) {
                if (window.confirm(`${titulo}\n\n${texto}`)) fn();
                return;
            }
            if ($('cfg-modal-titulo')) $('cfg-modal-titulo').textContent = titulo;
            if ($('cfg-modal-texto')) $('cfg-modal-texto').textContent = texto;
            const btnConf = $('cfg-modal-confirmar');
            if (btnConf) {
                btnConf.textContent = textoBotao;
                btnConf.className = isPerigo ? 'cfg-btn cfg-btn-perigo' : 'cfg-btn cfg-btn-suspender';
                btnConf.style.background = '';
                btnConf.style.color = '';
            }
            aoConfirmar = fn;
            modal.classList.add('aberto');
            if ($('cfg-modal-cancelar')) $('cfg-modal-cancelar').focus();
        }

        function fecharModal() {
            if (modal) modal.classList.remove('aberto');
            aoConfirmar = null;
        }

        if ($('cfg-modal-cancelar')) $('cfg-modal-cancelar').addEventListener('click', fecharModal);
        if ($('cfg-modal-confirmar')) {
            $('cfg-modal-confirmar').addEventListener('click', () => {
                const fn = aoConfirmar;
                fecharModal();
                if (fn) fn();
            });
        }
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) fecharModal();
            });
        }
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') fecharModal();
        });

        // Suspender conta
        const btnSuspender = $('btn-suspender-conta');
        if (btnSuspender) {
            btnSuspender.addEventListener('click', () => {
                confirmar(
                    'Suspender conta temporariamente?',
                    'Ao suspender sua conta, todos os seus anúncios publicados ficarão pausados e invisíveis para compradores. Você poderá reativar sua conta e seus anúncios a qualquer momento simplesmente fazendo login com seu e-mail e senha.',
                    () => {
                        const user = (window.ItaimSessao && typeof window.ItaimSessao.obterUsuarioLogado === 'function')
                            ? window.ItaimSessao.obterUsuarioLogado()
                            : null;
                        if (window.ItaimSessao && typeof window.ItaimSessao.suspenderConta === 'function') {
                            window.ItaimSessao.suspenderConta(user ? user.email : '');
                        }
                        try {
                            localStorage.setItem('itaim_aviso_auth', 'Sua conta foi suspensa temporariamente. Para reativá-la e voltar a negociar, basta fazer login.');
                        } catch (e) {}
                        window.location.href = '../index.html?msg=conta_suspensa';
                    },
                    'Sim, suspender conta',
                    false
                );
            });
        }

        // Excluir conta definitivamente
        const btnExcluir = $('btn-excluir-conta');
        if (btnExcluir) {
            btnExcluir.addEventListener('click', () => {
                confirmar(
                    'Excluir conta permanentemente?',
                    'ATENÇÃO: Esta ação é definitiva e não poderá ser desfeita! Todos os seus dados cadastrais, seus anúncios publicados, fotos, favoritos e avaliações serão apagados para sempre do Itaim Vende. Tem certeza de que deseja excluir sua conta?',
                    () => {
                        const user = (window.ItaimSessao && typeof window.ItaimSessao.obterUsuarioLogado === 'function')
                            ? window.ItaimSessao.obterUsuarioLogado()
                            : null;
                        if (window.ItaimSessao && typeof window.ItaimSessao.excluirContaPermanentemente === 'function') {
                            window.ItaimSessao.excluirContaPermanentemente(user ? user.email : '');
                        }
                        try {
                            localStorage.setItem('itaim_aviso_auth', 'Sua conta foi excluída permanentemente. Todos os seus dados foram apagados com sucesso.');
                        } catch (e) {}
                        window.location.href = '../index.html?msg=conta_excluida';
                    },
                    'Excluir definitivamente',
                    true
                );
            });
        }

        window.ItaimConfigRisco.confirmar = confirmar;
        window.ItaimConfigRisco.fecharModal = fecharModal;
    }

    window.ItaimConfigRisco = {
        inicializar,
        confirmar: null,
        fecharModal: null
    };
})();

// ==========================================================================
// MÓDULO: DADOS DA CONTA E AVATAR (config-conta.js)
// ==========================================================================

/**
 * ITAIM VENDE - CONFIGURAÇÕES: DADOS DA CONTA E AVATAR
 * Arquivo: frontend/js/pages/perfil/configuracoes/config-conta.js
 */

(function () {
    'use strict';

    function inicializar() {
        const {
            CHAVE_PERFIL,
            ler,
            gravar,
            $,
            soDigitos,
            toast,
            marcarErro,
            maskTelefone,
            emailValido
        } = window.ItaimConfigUtils;

        const usuarioAtivo = (window.ItaimSessao && typeof window.ItaimSessao.obterUsuarioLogado === 'function')
            ? window.ItaimSessao.obterUsuarioLogado()
            : ler(CHAVE_PERFIL, {});

        let emailOriginal = usuarioAtivo.email || '';
        if (!emailOriginal) {
            try {
                emailOriginal = localStorage.getItem('itaim_ultimo_email') || '';
            } catch (e) {}
        }

        const inputNome = $('cfg-nome');
        const inputUsuario = $('cfg-usuario');
        const inputEmail = $('cfg-email');
        const inputTelefone = $('cfg-telefone');
        const inputBairro = $('cfg-bairro');
        const selectCidade = $('cfg-cidade');
        const inputFotoCfg = $('cfg-input-foto');
        const btnRemoverFotoCfg = $('cfg-btn-remover-foto');
        const avatarPreviewCfg = $('cfg-avatar-preview');
        const formConta = $('form-conta');

        if (inputNome) inputNome.value = usuarioAtivo.nome || usuarioAtivo.name || '';
        if (inputUsuario) inputUsuario.value = usuarioAtivo.username || usuarioAtivo.usuario || '';
        if (inputEmail) inputEmail.value = usuarioAtivo.email || emailOriginal;
        if (inputTelefone) inputTelefone.value = maskTelefone(usuarioAtivo.telefone || usuarioAtivo.phone || '');
        if (inputBairro) inputBairro.value = usuarioAtivo.bairro || usuarioAtivo.neighborhood || 'Centro';

        if (usuarioAtivo.cidade || usuarioAtivo.city) {
            const cid = usuarioAtivo.cidade || usuarioAtivo.city;
            if (selectCidade) {
                const existe = Array.from(selectCidade.options).some(o => o.value.toLowerCase() === cid.toLowerCase());
                if (!existe) {
                    const opt = document.createElement('option');
                    opt.value = cid;
                    opt.textContent = cid;
                    selectCidade.appendChild(opt);
                }
                selectCidade.value = cid;
            }
        }

        function atualizarCabecalhoUsuario() {
            if (window.ItaimSessao && typeof window.ItaimSessao.atualizarHeaderUsuario === 'function') {
                window.ItaimSessao.atualizarHeaderUsuario();
            }
            const dados = (window.ItaimSessao && typeof window.ItaimSessao.obterUsuarioLogado === 'function')
                ? window.ItaimSessao.obterUsuarioLogado()
                : ler(CHAVE_PERFIL, {});

            const nome = $('dropdown-user-name');
            const email = $('dropdown-user-email');
            if (nome && (dados.nome || dados.name)) nome.textContent = dados.nome || dados.name;
            if (email && dados.email) email.textContent = dados.email;

            if (avatarPreviewCfg) {
                const rawAv = dados.avatar || 'assets/icons/icon-user.png';
                const finalAv = (window.ItaimRotas && typeof window.ItaimRotas.obterAsset === 'function')
                    ? window.ItaimRotas.obterAsset(rawAv)
                    : rawAv;
                avatarPreviewCfg.src = finalAv;
            }
        }
        atualizarCabecalhoUsuario();

        // Upload de foto do perfil
        if (inputFotoCfg && avatarPreviewCfg) {
            inputFotoCfg.addEventListener('change', (e) => {
                const file = e.target.files && e.target.files[0];
                if (!file) return;

                const salvarFoto = async (novaFoto) => {
                    avatarPreviewCfg.src = novaFoto;
                    let avatarFinal = novaFoto;

                    if (window.ItaimApi && window.ItaimApi.upload && window.ItaimApi.auth && window.ItaimApi.auth.obterToken()) {
                        try {
                            const resUpload = await window.ItaimApi.upload.perfil(novaFoto);
                            if (resUpload && resUpload.data && resUpload.data.url) {
                                avatarFinal = resUpload.data.url;
                            }
                            await window.ItaimApi.auth.atualizarPerfil({ avatar: avatarFinal });
                        } catch (err) {
                            console.warn('[Configurações] Upload de imagem falhou, mantendo em cache:', err);
                        }
                    }

                    if (window.ItaimSessao && typeof window.ItaimSessao.atualizarDadosUsuario === 'function') {
                        window.ItaimSessao.atualizarDadosUsuario(emailOriginal, { avatar: avatarFinal });
                    }

                    const perfilAtual = ler(CHAVE_PERFIL, {});
                    perfilAtual.avatar = avatarFinal;
                    gravar(CHAVE_PERFIL, perfilAtual);

                    atualizarCabecalhoUsuario();
                    toast('Foto de perfil atualizada com sucesso!');
                };

                if (window.ItaimFoto && typeof window.ItaimFoto.ajustarPerfil === 'function') {
                    window.ItaimFoto.ajustarPerfil(file, salvarFoto);
                } else if (window.ItaimFoto && typeof window.ItaimFoto.ajustar === 'function') {
                    window.ItaimFoto.ajustar(file, 400, salvarFoto);
                } else {
                    const reader = new FileReader();
                    reader.onload = (evt) => salvarFoto(evt.target.result);
                    reader.readAsDataURL(file);
                }
            });
        }

        // Remover foto do perfil
        if (btnRemoverFotoCfg) {
            btnRemoverFotoCfg.addEventListener('click', async () => {
                const avatarPadrao = 'assets/icons/icon-user.png';
                if (avatarPreviewCfg) {
                    avatarPreviewCfg.src = window.ItaimRotas ? window.ItaimRotas.obterAsset(avatarPadrao) : '../../assets/icons/icon-user.png';
                }

                if (window.ItaimApi && window.ItaimApi.auth && typeof window.ItaimApi.auth.atualizarPerfil === 'function' && window.ItaimApi.auth.obterToken()) {
                    await window.ItaimApi.auth.atualizarPerfil({ avatar: avatarPadrao }).catch(() => {});
                }

                if (window.ItaimSessao && typeof window.ItaimSessao.atualizarDadosUsuario === 'function') {
                    window.ItaimSessao.atualizarDadosUsuario(emailOriginal, { avatar: avatarPadrao });
                }

                const perfilAtual = ler(CHAVE_PERFIL, {});
                perfilAtual.avatar = avatarPadrao;
                gravar(CHAVE_PERFIL, perfilAtual);

                atualizarCabecalhoUsuario();
                toast('Foto de perfil removida.');
            });
        }

        // Formatação de entradas
        if (inputTelefone) {
            inputTelefone.addEventListener('input', (e) => {
                e.target.value = maskTelefone(e.target.value);
            });
        }
        if (inputUsuario) {
            inputUsuario.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/\s+/g, '').toLowerCase();
            });
        }

        function sincronizarCamposConta(dados) {
            if (!dados) return;
            if (inputNome && (dados.name || dados.nome)) inputNome.value = dados.name || dados.nome;
            if (inputUsuario && (dados.username || dados.usuario)) inputUsuario.value = dados.username || dados.usuario;
            if (inputEmail && dados.email) inputEmail.value = dados.email;
            if (inputTelefone && (dados.phone || dados.telefone)) inputTelefone.value = maskTelefone(dados.phone || dados.telefone);
            if (inputBairro && (dados.neighborhood || dados.bairro)) inputBairro.value = dados.neighborhood || dados.bairro;
            if (dados.avatar && avatarPreviewCfg) {
                avatarPreviewCfg.src = window.ItaimRotas ? window.ItaimRotas.obterAsset(dados.avatar) : dados.avatar;
            }
            const cid = dados.city || dados.cidade;
            if (cid && selectCidade) {
                const existe = Array.from(selectCidade.options).some(o => o.value.toLowerCase() === cid.toLowerCase());
                if (!existe) {
                    const opt = document.createElement('option');
                    opt.value = cid;
                    opt.textContent = cid;
                    selectCidade.appendChild(opt);
                }
                selectCidade.value = cid;
            }
        }

        if (window.ItaimApi && window.ItaimApi.auth && typeof window.ItaimApi.auth.perfil === 'function' && window.ItaimApi.auth.obterToken()) {
            window.ItaimApi.auth.perfil().then(res => {
                if (res && res.success && res.user) {
                    sincronizarCamposConta(res.user);
                }
            }).catch(() => {});
        }

        // Submissão do formulário de dados da conta
        if (formConta) {
            formConta.addEventListener('submit', (e) => {
                e.preventDefault();
                const nome = inputNome ? inputNome.value.trim() : '';
                const usuario = inputUsuario ? inputUsuario.value.trim() : '';
                const email = inputEmail ? inputEmail.value.trim() : '';
                const telefone = inputTelefone ? inputTelefone.value.trim() : '';
                const cidade = selectCidade ? selectCidade.value : 'Paulistana';
                const bairro = inputBairro ? inputBairro.value.trim() : 'Centro';

                const okNome = marcarErro('cfg-nome', 'erro-nome', nome.length < 3 ? 'Informe seu nome completo.' : '');
                const okUser = marcarErro('cfg-usuario', 'erro-usuario',
                    usuario && !/^[a-z0-9._]{3,30}$/.test(usuario) ? 'Use de 3 a 30 letras minúsculas, números, ponto ou sublinhado.' : '');
                const okEmail = marcarErro('cfg-email', 'erro-email', !emailValido(email) ? 'Informe um e-mail válido.' : '');
                const dig = soDigitos(telefone).length;
                const okTel = marcarErro('cfg-telefone', 'erro-telefone',
                    telefone && dig !== 10 && dig !== 11 ? 'Informe o DDD e o número completo.' : '');

                if (!(okNome && okUser && okEmail && okTel)) {
                    toast('Corrija os campos destacados.', true);
                    return;
                }

                const userAtual = (window.ItaimSessao && typeof window.ItaimSessao.obterUsuarioLogado === 'function')
                    ? window.ItaimSessao.obterUsuarioLogado()
                    : ler(CHAVE_PERFIL, {});
                const avatarAtual = userAtual.avatar || 'assets/icons/icon-user.png';

                const atualizado = {
                    ...userAtual,
                    nome,
                    name: nome,
                    username: usuario,
                    usuario: usuario,
                    email,
                    telefone,
                    bairro,
                    neighborhood: bairro,
                    cidade,
                    city: cidade,
                    avatar: avatarAtual
                };

                if (window.ItaimSessao && typeof window.ItaimSessao.atualizarDadosUsuario === 'function') {
                    window.ItaimSessao.atualizarDadosUsuario(emailOriginal, atualizado);
                }

                if (window.ItaimApi && window.ItaimApi.auth && typeof window.ItaimApi.auth.atualizarPerfil === 'function' && window.ItaimApi.auth.obterToken()) {
                    window.ItaimApi.auth.atualizarPerfil({
                        name: nome,
                        username: usuario,
                        phone: telefone.replace(/\D/g, ''),
                        city: cidade,
                        neighborhood: bairro,
                        avatar: avatarAtual
                    }).catch(() => {});
                }

                emailOriginal = email;
                try { localStorage.setItem('itaim_usuario_logado', JSON.stringify(atualizado)); } catch (err) {}
                try { localStorage.setItem('itaim_usuario_logado_email', email); } catch (err) {}

                atualizarCabecalhoUsuario();
                toast('Dados da conta salvos com sucesso!');
            });
        }

        window.ItaimConfigConta.atualizarCabecalhoUsuario = atualizarCabecalhoUsuario;
    }

    window.ItaimConfigConta = {
        inicializar,
        atualizarCabecalhoUsuario: null
    };
})();

// ==========================================================================
// MÓDULO: SEGURANÇA E SENHA (config-seguranca.js)
// ==========================================================================

/**
 * ITAIM VENDE - CONFIGURAÇÕES: SEGURANÇA E ALTERAÇÃO DE SENHA
 * Arquivo: frontend/js/pages/perfil/configuracoes/config-seguranca.js
 */

(function () {
    'use strict';

    function inicializar() {
        const { $, toast, marcarErro } = window.ItaimConfigUtils;

        // Alternância de visibilidade das senhas
        document.querySelectorAll('.cfg-ver-senha').forEach(btn => {
            btn.addEventListener('click', () => {
                const input = $(btn.dataset.alvo);
                if (!input) return;
                const mostrar = input.type === 'password';
                input.type = mostrar ? 'text' : 'password';
                btn.textContent = mostrar ? 'Ocultar' : 'Mostrar';
            });
        });

        // Cálculo de força da senha
        function forcaSenha(s) {
            let pontos = 0;
            if (s.length >= 8) pontos++;
            if (s.length >= 12) pontos++;
            if (/[a-z]/.test(s) && /[A-Z]/.test(s)) pontos++;
            if (/\d/.test(s)) pontos++;
            if (/[^A-Za-z0-9]/.test(s)) pontos++;
            return pontos; // 0 a 5
        }

        const inputSenhaNova = $('cfg-senha-nova');
        if (inputSenhaNova) {
            inputSenhaNova.addEventListener('input', (e) => {
                const s = e.target.value;
                const barra = $('forca-barra'), texto = $('forca-texto');
                if (!barra || !texto) return;

                if (!s) {
                    barra.style.width = '0';
                    texto.textContent = 'Digite uma nova senha';
                    return;
                }
                const p = forcaSenha(s);
                const niveis = [
                    { w: '20%', cor: '#DC2626', t: 'Muito fraca' },
                    { w: '20%', cor: '#DC2626', t: 'Muito fraca' },
                    { w: '40%', cor: '#F97316', t: 'Fraca' },
                    { w: '60%', cor: '#EAB308', t: 'Razoável' },
                    { w: '80%', cor: '#65A30D', t: 'Boa' },
                    { w: '100%', cor: '#44BD32', t: 'Forte' }
                ];
                const n = niveis[p] || niveis[0];
                barra.style.width = n.w;
                barra.style.background = n.cor;
                texto.textContent = 'Força: ' + n.t;
            });
        }

        const formSenha = $('form-senha');
        if (formSenha) {
            formSenha.addEventListener('submit', async (e) => {
                e.preventDefault();
                const atual = $('cfg-senha-atual') ? $('cfg-senha-atual').value : '';
                const nova = $('cfg-senha-nova') ? $('cfg-senha-nova').value : '';
                const confirma = $('cfg-senha-confirma') ? $('cfg-senha-confirma').value : '';

                const okAtual = marcarErro('cfg-senha-atual', 'erro-senha-atual', !atual ? 'Informe sua senha atual.' : '');
                let msgNova = '';
                if (nova.length < 8) {
                    msgNova = 'A nova senha precisa ter pelo menos 8 caracteres.';
                } else if (!/[A-Za-z]/.test(nova) || !/\d/.test(nova)) {
                    msgNova = 'Misture letras e números.';
                } else if (nova === atual) {
                    msgNova = 'A nova senha deve ser diferente da atual.';
                }

                const okNova = marcarErro('cfg-senha-nova', 'erro-senha-nova', msgNova);
                const okConf = marcarErro('cfg-senha-confirma', 'erro-senha-confirma', nova !== confirma ? 'As senhas não coincidem.' : '');

                if (!(okAtual && okNova && okConf)) {
                    toast('Corrija os campos destacados.', true);
                    return;
                }

                const btnSalvar = formSenha.querySelector('button[type="submit"]');
                const textoOriginal = btnSalvar ? btnSalvar.textContent : 'Salvar nova senha';
                if (btnSalvar) {
                    btnSalvar.disabled = true;
                    btnSalvar.textContent = 'Salvando...';
                }

                try {
                    if (window.ItaimApi && window.ItaimApi.auth && window.ItaimApi.auth.obterToken()) {
                        await window.ItaimApi.auth.alterarSenha(atual, nova);
                    }

                    formSenha.reset();
                    const barra = $('forca-barra'), texto = $('forca-texto');
                    if (barra) barra.style.width = '0';
                    if (texto) texto.textContent = 'Digite uma nova senha';

                    document.querySelectorAll('.cfg-ver-senha').forEach(b => { b.textContent = 'Mostrar'; });
                    ['cfg-senha-atual', 'cfg-senha-nova', 'cfg-senha-confirma'].forEach(id => {
                        const el = $(id);
                        if (el) el.type = 'password';
                    });

                    toast('Senha atualizada com sucesso!');
                } catch (err) {
                    console.warn('[Configurações] Erro ao alterar senha:', err);
                    const msgErro = err.message || 'Erro ao alterar senha. Verifique os dados.';
                    if (msgErro.toLowerCase().includes('atual')) {
                        marcarErro('cfg-senha-atual', 'erro-senha-atual', msgErro);
                    }
                    toast(msgErro, true);
                } finally {
                    if (btnSalvar) {
                        btnSalvar.disabled = false;
                        btnSalvar.textContent = textoOriginal;
                    }
                }
            });
        }
    }

    window.ItaimConfigSeguranca = {
        inicializar
    };
})();

// ==========================================================================
// MÓDULO: ENDEREÇOS E VIACEP (config-enderecos.js)
// ==========================================================================

/**
 * ITAIM VENDE - CONFIGURAÇÕES: GESTÃO DE MÚLTIPLOS ENDEREÇOS
 * Arquivo: frontend/js/pages/perfil/configuracoes/config-enderecos.js
 */

(function () {
    'use strict';

    function inicializar() {
        const {
            CHAVE_ENDERECOS,
            ler,
            gravar,
            $,
            soDigitos,
            toast,
            marcarErro,
            maskCep,
            criarElemento
        } = window.ItaimConfigUtils;

        let enderecos = ler(CHAVE_ENDERECOS, []);
        if (!Array.isArray(enderecos)) enderecos = [];
        let editandoId = null;

        function salvarEnderecos() {
            return gravar(CHAVE_ENDERECOS, enderecos);
        }

        function renderizarEnderecos() {
            const lista = $('lista-enderecos');
            if (!lista) return;
            lista.replaceChildren();

            if (enderecos.length === 0) {
                lista.appendChild(criarElemento('div', 'cfg-vazio', 'Você ainda não cadastrou nenhum endereço.'));
                return;
            }

            enderecos.forEach(end => {
                const isPrincipal = !!(end.principal || end.isDefault);
                const apelido = end.apelido || end.nickname || 'Endereço';
                const rua = end.rua || (end.number ? `${end.street}, ${end.number}` : end.street);
                const bairro = end.bairro || end.neighborhood;
                const cidade = end.cidade || end.city || 'Paulistana';
                const estado = end.estado || end.state || 'PI';
                const cep = end.cep || end.postalCode;

                const item = criarElemento('div', 'cfg-endereco' + (isPrincipal ? ' principal' : ''));
                const info = criarElemento('div');
                const titulo = criarElemento('strong', '', apelido);
                if (isPrincipal) titulo.appendChild(criarElemento('span', 'cfg-selo', 'PRINCIPAL'));
                info.appendChild(titulo);
                const partes = [rua, bairro, cidade + ' - ' + estado].filter(Boolean).join(', ');
                info.appendChild(criarElemento('p', '', partes + (cep ? ' | CEP ' + cep : '')));

                const acoes = criarElemento('div', 'cfg-endereco-acoes');
                const botao = (rotulo, classe, fn) => {
                    const b = criarElemento('button', 'cfg-link-acao ' + classe, rotulo);
                    b.type = 'button';
                    b.addEventListener('click', fn);
                    acoes.appendChild(b);
                };

                if (!isPrincipal) botao('Tornar principal', '', () => tornarPrincipal(end.id));
                botao('Editar', '', () => iniciarEdicao(end.id));
                botao('Remover', 'perigo', () => pedirRemocao(end.id));

                item.append(info, acoes);
                lista.appendChild(item);
            });
        }

        async function carregarEnderecosServidor() {
            if (window.ItaimApi && window.ItaimApi.enderecos && window.ItaimApi.auth && window.ItaimApi.auth.obterToken()) {
                try {
                    const res = await window.ItaimApi.enderecos.listar();
                    if (res && res.success && Array.isArray(res.data)) {
                        enderecos = res.data;
                        salvarEnderecos();
                        renderizarEnderecos();
                        return;
                    }
                } catch (err) {
                    console.warn('[Configurações] Falha ao sincronizar endereços da API:', err);
                }
            }
            renderizarEnderecos();
        }

        async function tornarPrincipal(id) {
            if (window.ItaimApi && window.ItaimApi.enderecos && window.ItaimApi.auth && window.ItaimApi.auth.obterToken()) {
                try {
                    await window.ItaimApi.enderecos.tornarPrincipal(id);
                    const res = await window.ItaimApi.enderecos.listar();
                    if (res && res.success && Array.isArray(res.data)) {
                        enderecos = res.data;
                    } else {
                        enderecos.forEach(e => {
                            e.principal = (e.id === id);
                            e.isDefault = (e.id === id);
                        });
                    }
                    salvarEnderecos();
                    renderizarEnderecos();
                    toast('Endereço principal atualizado.');
                    return;
                } catch (err) {
                    console.warn('[Configurações] Erro ao definir principal via API:', err);
                    toast(err.message || 'Erro ao definir endereço principal.', true);
                    return;
                }
            }

            enderecos.forEach(e => {
                e.principal = (e.id === id);
                e.isDefault = (e.id === id);
            });
            salvarEnderecos();
            renderizarEnderecos();
            toast('Endereço principal atualizado.');
        }

        function limparFormEndereco() {
            const form = $('form-endereco');
            if (form) form.reset();
            ['end-apelido', 'end-cep', 'end-rua'].forEach(id => marcarErro(id, 'erro-' + id, ''));
            editandoId = null;
            if ($('titulo-form-endereco')) $('titulo-form-endereco').textContent = 'Adicionar endereço';
            if ($('btn-salvar-endereco')) $('btn-salvar-endereco').textContent = 'Adicionar endereço';
            if ($('btn-cancelar-endereco')) $('btn-cancelar-endereco').hidden = true;
        }

        function iniciarEdicao(id) {
            const end = enderecos.find(e => e.id === id);
            if (!end) return;
            editandoId = id;
            if ($('end-apelido')) $('end-apelido').value = end.apelido || end.nickname || '';
            if ($('end-cep')) $('end-cep').value = end.cep || end.postalCode || '';
            if ($('end-rua')) $('end-rua').value = end.rua || end.street || '';
            if ($('end-bairro')) $('end-bairro').value = end.bairro || end.neighborhood || '';
            if ($('end-cidade')) $('end-cidade').value = end.cidade || end.city || 'Paulistana';
            if ($('titulo-form-endereco')) $('titulo-form-endereco').textContent = 'Editar endereço';
            if ($('btn-salvar-endereco')) $('btn-salvar-endereco').textContent = 'Salvar endereço';
            if ($('btn-cancelar-endereco')) $('btn-cancelar-endereco').hidden = false;
            if ($('form-endereco')) $('form-endereco').scrollIntoView({ behavior: 'smooth', block: 'center' });
            if ($('end-apelido')) $('end-apelido').focus();
        }

        function pedirRemocao(id) {
            const end = enderecos.find(e => e.id === id);
            if (!end) return;

            const confirmarFn = (window.ItaimConfigRisco && window.ItaimConfigRisco.confirmar)
                ? window.ItaimConfigRisco.confirmar
                : ((t, m, fn) => { if (window.confirm(`${t}\n\n${m}`)) fn(); });

            confirmarFn('Remover endereço', `Deseja remover o endereço "${end.apelido || end.nickname}"?`, async () => {
                if (window.ItaimApi && window.ItaimApi.enderecos && window.ItaimApi.auth && window.ItaimApi.auth.obterToken()) {
                    try {
                        await window.ItaimApi.enderecos.remover(id);
                        const res = await window.ItaimApi.enderecos.listar();
                        if (res && res.success && Array.isArray(res.data)) {
                            enderecos = res.data;
                        } else {
                            enderecos = enderecos.filter(e => e.id !== id);
                        }
                        if (editandoId === id) limparFormEndereco();
                        salvarEnderecos();
                        renderizarEnderecos();
                        toast('Endereço removido.');
                        return;
                    } catch (err) {
                        console.warn('[Configurações] Erro ao remover endereço via API:', err);
                        toast(err.message || 'Erro ao remover endereço.', true);
                        return;
                    }
                }

                const eraPrincipal = end.principal || end.isDefault;
                enderecos = enderecos.filter(e => e.id !== id);
                if (eraPrincipal && enderecos.length) {
                    enderecos[0].principal = true;
                    enderecos[0].isDefault = true;
                }
                if (editandoId === id) limparFormEndereco();
                salvarEnderecos();
                renderizarEnderecos();
                toast('Endereço removido.');
            });
        }

        const inputCep = $('end-cep');
        if (inputCep) {
            inputCep.addEventListener('input', async (e) => {
                e.target.value = maskCep(e.target.value);
                const cepLimpo = soDigitos(e.target.value);

                // Auto-preenchimento ViaCEP quando atingir 8 dígitos
                if (cepLimpo.length === 8) {
                    try {
                        const resposta = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
                        const dadosCep = await resposta.json();
                        if (dadosCep && !dadosCep.erro) {
                            if (dadosCep.logradouro && $('end-rua') && !$('end-rua').value) {
                                $('end-rua').value = dadosCep.logradouro;
                            }
                            if (dadosCep.bairro && $('end-bairro') && !$('end-bairro').value) {
                                $('end-bairro').value = dadosCep.bairro;
                            }
                            if (dadosCep.localidade && $('end-cidade')) {
                                $('end-cidade').value = dadosCep.localidade;
                            }
                            toast('Endereço localizado via CEP!');
                        }
                    } catch (errCep) {
                        // Silencioso se offline
                    }
                }
            });
        }

        if ($('btn-cancelar-endereco')) {
            $('btn-cancelar-endereco').addEventListener('click', limparFormEndereco);
        }

        const formEndereco = $('form-endereco');
        if (formEndereco) {
            formEndereco.addEventListener('submit', async (e) => {
                e.preventDefault();
                const apelido = $('end-apelido') ? $('end-apelido').value.trim() : '';
                const cep = $('end-cep') ? $('end-cep').value.trim() : '';
                const rua = $('end-rua') ? $('end-rua').value.trim() : '';
                const bairro = $('end-bairro') ? $('end-bairro').value.trim() : 'Centro';
                const cidade = $('end-cidade') ? $('end-cidade').value : 'Paulistana';

                const okApelido = marcarErro('end-apelido', 'erro-end-apelido', !apelido ? 'Dê um apelido ao endereço.' : '');
                const okCep = marcarErro('end-cep', 'erro-end-cep', cep && soDigitos(cep).length !== 8 ? 'O CEP tem 8 números.' : '');
                const okRua = marcarErro('end-rua', 'erro-end-rua', !rua ? 'Informe a rua e o número.' : '');

                if (!(okApelido && okCep && okRua)) {
                    toast('Corrija os campos destacados.', true);
                    return;
                }

                const dados = {
                    nickname: apelido,
                    street: rua,
                    neighborhood: bairro || 'Centro',
                    city: cidade || 'Paulistana',
                    state: 'PI',
                    postalCode: cep || null,
                    apelido,
                    cep,
                    rua,
                    bairro,
                    cidade
                };

                const btnSalvar = $('btn-salvar-endereco');
                const textoOriginal = btnSalvar ? btnSalvar.textContent : 'Salvar endereço';
                if (btnSalvar) {
                    btnSalvar.disabled = true;
                    btnSalvar.textContent = 'Salvando...';
                }

                try {
                    if (window.ItaimApi && window.ItaimApi.enderecos && window.ItaimApi.auth && window.ItaimApi.auth.obterToken()) {
                        if (editandoId !== null) {
                            await window.ItaimApi.enderecos.atualizar(editandoId, dados);
                            toast('Endereço atualizado com sucesso.');
                        } else {
                            await window.ItaimApi.enderecos.criar(dados);
                            toast('Endereço adicionado com sucesso.');
                        }
                        const res = await window.ItaimApi.enderecos.listar();
                        if (res && res.success && Array.isArray(res.data)) {
                            enderecos = res.data;
                        }
                    } else {
                        if (editandoId !== null) {
                            const alvo = enderecos.find(x => x.id === editandoId);
                            if (alvo) Object.assign(alvo, dados);
                            toast('Endereço atualizado.');
                        } else {
                            enderecos.push({ id: Date.now(), principal: enderecos.length === 0, ...dados });
                            toast('Endereço adicionado.');
                        }
                    }
                    salvarEnderecos();
                    renderizarEnderecos();
                    limparFormEndereco();
                } catch (err) {
                    console.error('[Configurações] Erro ao salvar endereço:', err);
                    toast(err.message || 'Erro ao salvar endereço.', true);
                } finally {
                    if (btnSalvar) {
                        btnSalvar.disabled = false;
                        btnSalvar.textContent = editandoId !== null ? 'Salvar endereço' : 'Adicionar endereço';
                    }
                }
            });
        }

        carregarEnderecosServidor();
    }

    window.ItaimConfigEnderecos = {
        inicializar
    };
})();

// ==========================================================================
// MÓDULO: PREFERÊNCIAS E INTERRUPTORES (config-preferencias.js)
// ==========================================================================

/**
 * ITAIM VENDE - CONFIGURAÇÕES: PREFERÊNCIAS, NOTIFICAÇÕES E PRIVACIDADE
 * Arquivo: frontend/js/pages/perfil/configuracoes/config-preferencias.js
 */

(function () {
    'use strict';

    function inicializar() {
        const { CHAVE_CONFIG, PADROES, ler, gravar, toast } = window.ItaimConfigUtils;

        let config = { ...PADROES, ...ler(CHAVE_CONFIG, {}) };
        const interruptores = document.querySelectorAll('input[data-chave]');

        function aplicarConfigNaTela() {
            interruptores.forEach(i => {
                i.checked = !!config[i.dataset.chave];
            });
        }

        aplicarConfigNaTela();

        interruptores.forEach(i => {
            i.addEventListener('change', () => {
                config[i.dataset.chave] = i.checked;
                gravar(CHAVE_CONFIG, config);
                toast('Preferência salva.');
                if (window.ItaimNotificacoes && typeof window.ItaimNotificacoes.atualizarBadgesNotificacoes === 'function') {
                    window.ItaimNotificacoes.atualizarBadgesNotificacoes();
                }
            });
        });
    }

    window.ItaimConfigPreferencias = {
        inicializar
    };
})();

// ==========================================================================
// MÓDULO: APARÊNCIA E TEMA (config-tema.js)
// ==========================================================================

/**
 * ITAIM VENDE - CONFIGURAÇÕES: APARÊNCIA E TEMA (LIGHT/DARK)
 * Arquivo: frontend/js/pages/perfil/configuracoes/config-tema.js
 */

(function () {
    'use strict';

    function inicializar() {
        const { $, toast } = window.ItaimConfigUtils;

        function sincronizarTelaTema(tema) {
            const isDark = (tema === 'dark');
            const cardClaro = $('card-tema-claro');
            const cardEscuro = $('card-tema-escuro');
            const switchTema = $('switch-tema-escuro');
            const legenda = $('cfg-tema-legenda');

            if (cardClaro) {
                cardClaro.classList.toggle('ativo', !isDark);
                cardClaro.setAttribute('aria-pressed', !isDark ? 'true' : 'false');
            }
            if (cardEscuro) {
                cardEscuro.classList.toggle('ativo', isDark);
                cardEscuro.setAttribute('aria-pressed', isDark ? 'true' : 'false');
            }
            if (switchTema) {
                switchTema.checked = isDark;
            }
            if (legenda) {
                legenda.textContent = isDark ? 'Atualmente no Modo Escuro' : 'Atualmente no Modo Claro';
            }
        }

        const temaInicial = (window.ItaimTema && typeof window.ItaimTema.obterTema === 'function')
            ? window.ItaimTema.obterTema()
            : (localStorage.getItem('itaim_tema') || 'light');
        sincronizarTelaTema(temaInicial);

        // Eventos nos botões e cartões de tema
        document.querySelectorAll('.btn-ativar-tema, .cfg-tema-card').forEach(btn => {
            btn.addEventListener('click', () => {
                const tema = btn.getAttribute('data-tema') || btn.closest('[data-tema]')?.getAttribute('data-tema');
                if (!tema) return;
                if (window.ItaimTema && typeof window.ItaimTema.definirTema === 'function') {
                    window.ItaimTema.definirTema(tema);
                }
                sincronizarTelaTema(tema);
                toast(tema === 'dark' ? 'Modo Escuro ativado.' : 'Modo Claro ativado.');
            });
        });

        const switchTemaEscuro = $('switch-tema-escuro');
        if (switchTemaEscuro) {
            switchTemaEscuro.addEventListener('change', (e) => {
                const novoTema = e.target.checked ? 'dark' : 'light';
                if (window.ItaimTema && typeof window.ItaimTema.definirTema === 'function') {
                    window.ItaimTema.definirTema(novoTema);
                }
                sincronizarTelaTema(novoTema);
                toast(novoTema === 'dark' ? 'Modo Escuro ativado.' : 'Modo Claro ativado.');
            });
        }

        window.addEventListener('itaim:tema-alterado', (e) => {
            if (e.detail && e.detail.tema) {
                sincronizarTelaTema(e.detail.tema);
            }
        });

        window.ItaimConfigTema.sincronizarTelaTema = sincronizarTelaTema;
    }

    window.ItaimConfigTema = {
        inicializar,
        sincronizarTelaTema: null
    };
})();

// ==========================================================================
// MÓDULO: ORQUESTRADOR GERAL (index.js)
// ==========================================================================

/**
 * ITAIM VENDE - CONFIGURAÇÕES: INICIALIZADOR GERAL
 * Arquivo: frontend/js/pages/perfil/configuracoes/index.js
 */

(function () {
    'use strict';

    function inicializar() {
        if (window.ItaimConfigNavegacao?.inicializar) window.ItaimConfigNavegacao.inicializar();
        if (window.ItaimConfigRisco?.inicializar) window.ItaimConfigRisco.inicializar();
        if (window.ItaimConfigConta?.inicializar) window.ItaimConfigConta.inicializar();
        if (window.ItaimConfigSeguranca?.inicializar) window.ItaimConfigSeguranca.inicializar();
        if (window.ItaimConfigEnderecos?.inicializar) window.ItaimConfigEnderecos.inicializar();
        if (window.ItaimConfigPreferencias?.inicializar) window.ItaimConfigPreferencias.inicializar();
        if (window.ItaimConfigTema?.inicializar) window.ItaimConfigTema.inicializar();
    }

    window.ItaimConfigOrquestrador = {
        inicializar
    };
})();


// ==========================================================================
// INICIALIZAÇÃO AUTOMÁTICA DO BUNDLE
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    if (window.ItaimConfigOrquestrador?.inicializar) {
        window.ItaimConfigOrquestrador.inicializar();
    }
});
