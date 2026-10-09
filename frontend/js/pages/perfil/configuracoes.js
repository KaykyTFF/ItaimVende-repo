/**
 * ITAIM VENDE - LÓGICA DA PÁGINA DE CONFIGURAÇÕES (configuracoes.html)
 * Tudo é salvo no localStorage do navegador (o projeto ainda não tem servidor).
 * Chaves usadas:
 *   itaim_perfil_usuario  dados da conta (compartilhada com perfil.js)
 *   itaim_enderecos       lista de endereços
 *   itaim_configuracoes   interruptores de segurança, notificações e privacidade
 * A senha nunca é guardada.
 */
document.addEventListener('DOMContentLoaded', () => {
    const CHAVE_PERFIL = 'itaim_perfil_usuario';
    const CHAVE_ENDERECOS = 'itaim_enderecos';
    const CHAVE_CONFIG = 'itaim_configuracoes';

    const PADROES = {
        'seg-alerta-login': true,
        'not-mensagens': true, 'not-avaliacoes': true, 'not-compras': true, 'not-favoritos': true, 'not-precos': true, 'not-expiracao': true, 'not-avisos': true,
        'priv-telefone': true, 'priv-bairro': true, 'priv-online': false
    };

    // ------------------------------------------------------------------
    // Armazenamento seguro (localStorage pode falhar em modo privado)
    // ------------------------------------------------------------------
    function ler(chave, padrao) {
        try {
            const bruto = localStorage.getItem(chave);
            return bruto ? JSON.parse(bruto) : padrao;
        } catch (e) { return padrao; }
    }
    function gravar(chave, valor) {
        try { localStorage.setItem(chave, JSON.stringify(valor)); return true; }
        catch (e) { return false; }
    }

    // ------------------------------------------------------------------
    // Utilitários
    // ------------------------------------------------------------------
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

    // ------------------------------------------------------------------
    // 1. Navegação entre seções (abas, com suporte a #hash)
    // ------------------------------------------------------------------
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

    // ------------------------------------------------------------------
    // 2. Conta
    // ------------------------------------------------------------------
    const usuarioAtivo = (window.ItaimSessao && typeof window.ItaimSessao.obterUsuarioLogado === 'function')
        ? window.ItaimSessao.obterUsuarioLogado()
        : ler(CHAVE_PERFIL, {});

    let emailOriginal = usuarioAtivo.email || '';
    if (!emailOriginal) {
        try { emailOriginal = localStorage.getItem('itaim_ultimo_email') || ''; } catch (e) {}
    }

    $('cfg-nome').value = usuarioAtivo.nome || '';
    $('cfg-usuario').value = usuarioAtivo.username || usuarioAtivo.usuario || '';
    $('cfg-email').value = usuarioAtivo.email || emailOriginal;
    $('cfg-telefone').value = usuarioAtivo.telefone || '';
    $('cfg-bairro').value = usuarioAtivo.bairro || 'Centro';

    if (usuarioAtivo.cidade) {
        const selectCidade = $('cfg-cidade');
        if (selectCidade) {
            const existe = Array.from(selectCidade.options).some(o => o.value.toLowerCase() === usuarioAtivo.cidade.toLowerCase());
            if (!existe) {
                const opt = document.createElement('option');
                opt.value = usuarioAtivo.cidade;
                opt.textContent = usuarioAtivo.cidade;
                selectCidade.appendChild(opt);
            }
            selectCidade.value = usuarioAtivo.cidade;
        }
    }

    function atualizarCabecalhoUsuario() {
        if (window.ItaimSessao && typeof window.ItaimSessao.atualizarHeaderUsuario === 'function') {
            window.ItaimSessao.atualizarHeaderUsuario();
        }
        const dados = (window.ItaimSessao && typeof window.ItaimSessao.obterUsuarioLogado === 'function')
            ? window.ItaimSessao.obterUsuarioLogado()
            : ler(CHAVE_PERFIL, {});
        const nome = $('dropdown-user-name'), email = $('dropdown-user-email');
        if (nome && dados.nome) nome.textContent = dados.nome;
        if (email && dados.email) email.textContent = dados.email;
    }
    atualizarCabecalhoUsuario();

    $('cfg-telefone').addEventListener('input', (e) => { e.target.value = maskTelefone(e.target.value); });
    $('cfg-usuario').addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\s+/g, '').toLowerCase();
    });

    $('form-conta').addEventListener('submit', (e) => {
        e.preventDefault();
        const nome = $('cfg-nome').value.trim();
        const usuario = $('cfg-usuario').value.trim();
        const email = $('cfg-email').value.trim();
        const telefone = $('cfg-telefone').value.trim();
        const cidade = $('cfg-cidade').value;
        const bairro = $('cfg-bairro').value.trim();

        const okNome = marcarErro('cfg-nome', 'erro-nome', nome.length < 3 ? 'Informe seu nome completo.' : '');
        const okUser = marcarErro('cfg-usuario', 'erro-usuario',
            usuario && !/^[a-z0-9._]{3,30}$/.test(usuario) ? 'Use de 3 a 30 letras minúsculas, números, ponto ou sublinhado.' : '');
        const okEmail = marcarErro('cfg-email', 'erro-email', !emailValido(email) ? 'Informe um e-mail válido.' : '');
        const dig = soDigitos(telefone).length;
        const okTel = marcarErro('cfg-telefone', 'erro-telefone',
            telefone && dig !== 10 && dig !== 11 ? 'Informe o DDD e o número completo.' : '');
        if (!(okNome && okUser && okEmail && okTel)) { toast('Corrija os campos destacados.', true); return; }

        const atualizado = {
            ...ler(CHAVE_PERFIL, {}),
            nome,
            username: usuario,
            usuario: usuario,
            email,
            telefone,
            bairro,
            cidade
        };

        if (window.ItaimSessao && typeof window.ItaimSessao.atualizarDadosUsuario === 'function') {
            window.ItaimSessao.atualizarDadosUsuario(emailOriginal, atualizado);
        }

        if (!gravar(CHAVE_PERFIL, atualizado)) { toast('Não foi possível salvar neste navegador.', true); return; }
        emailOriginal = email;
        try { localStorage.setItem('itaim_ultimo_email', email); } catch (err) {}
        try { localStorage.setItem('itaim_usuario_logado_email', email); } catch (err) {}

        atualizarCabecalhoUsuario();
        toast('Dados da conta salvos com sucesso!');
    });

    // ------------------------------------------------------------------
    // 3. Segurança: senha
    // ------------------------------------------------------------------
    document.querySelectorAll('.cfg-ver-senha').forEach(btn => {
        btn.addEventListener('click', () => {
            const input = $(btn.dataset.alvo);
            const mostrar = input.type === 'password';
            input.type = mostrar ? 'text' : 'password';
            btn.textContent = mostrar ? 'Ocultar' : 'Mostrar';
        });
    });

    function forcaSenha(s) {
        let pontos = 0;
        if (s.length >= 8) pontos++;
        if (s.length >= 12) pontos++;
        if (/[a-z]/.test(s) && /[A-Z]/.test(s)) pontos++;
        if (/\d/.test(s)) pontos++;
        if (/[^A-Za-z0-9]/.test(s)) pontos++;
        return pontos; // 0 a 5
    }
    $('cfg-senha-nova').addEventListener('input', (e) => {
        const s = e.target.value;
        const barra = $('forca-barra'), texto = $('forca-texto');
        if (!s) { barra.style.width = '0'; texto.textContent = 'Digite uma nova senha'; return; }
        const p = forcaSenha(s);
        const niveis = [
            { w: '20%', cor: '#DC2626', t: 'Muito fraca' },
            { w: '20%', cor: '#DC2626', t: 'Muito fraca' },
            { w: '40%', cor: '#F97316', t: 'Fraca' },
            { w: '60%', cor: '#EAB308', t: 'Razoável' },
            { w: '80%', cor: '#65A30D', t: 'Boa' },
            { w: '100%', cor: '#44BD32', t: 'Forte' }
        ];
        const n = niveis[p];
        barra.style.width = n.w; barra.style.background = n.cor; texto.textContent = 'Força: ' + n.t;
    });

    $('form-senha').addEventListener('submit', (e) => {
        e.preventDefault();
        const atual = $('cfg-senha-atual').value;
        const nova = $('cfg-senha-nova').value;
        const confirma = $('cfg-senha-confirma').value;

        const okAtual = marcarErro('cfg-senha-atual', 'erro-senha-atual', !atual ? 'Informe sua senha atual.' : '');
        let msgNova = '';
        if (nova.length < 8) msgNova = 'A nova senha precisa ter pelo menos 8 caracteres.';
        else if (!/[A-Za-z]/.test(nova) || !/\d/.test(nova)) msgNova = 'Misture letras e números.';
        else if (nova === atual) msgNova = 'A nova senha deve ser diferente da atual.';
        const okNova = marcarErro('cfg-senha-nova', 'erro-senha-nova', msgNova);
        const okConf = marcarErro('cfg-senha-confirma', 'erro-senha-confirma', nova !== confirma ? 'As senhas não coincidem.' : '');
        if (!(okAtual && okNova && okConf)) { toast('Corrija os campos destacados.', true); return; }

        // Sem servidor ainda: aqui entraria a chamada à API que troca a senha.
        $('form-senha').reset();
        $('forca-barra').style.width = '0';
        $('forca-texto').textContent = 'Digite uma nova senha';
        document.querySelectorAll('.cfg-ver-senha').forEach(b => { b.textContent = 'Mostrar'; });
        ['cfg-senha-atual', 'cfg-senha-nova', 'cfg-senha-confirma'].forEach(id => { $(id).type = 'password'; });
        toast('Senha atualizada.');
    });

    // ------------------------------------------------------------------
    // 4. Endereços
    // ------------------------------------------------------------------
    let enderecos = ler(CHAVE_ENDERECOS, []);
    if (!Array.isArray(enderecos)) enderecos = [];
    let editandoId = null;

    function salvarEnderecos() { return gravar(CHAVE_ENDERECOS, enderecos); }

    function criar(tag, classe, texto) {
        const el = document.createElement(tag);
        if (classe) el.className = classe;
        if (texto !== undefined) el.textContent = texto;
        return el;
    }

    function renderizarEnderecos() {
        const lista = $('lista-enderecos');
        lista.replaceChildren();
        if (enderecos.length === 0) {
            lista.appendChild(criar('div', 'cfg-vazio', 'Você ainda não cadastrou nenhum endereço.'));
            return;
        }
        enderecos.forEach(end => {
            const item = criar('div', 'cfg-endereco' + (end.principal ? ' principal' : ''));
            const info = criar('div');
            const titulo = criar('strong', '', end.apelido);
            if (end.principal) titulo.appendChild(criar('span', 'cfg-selo', 'PRINCIPAL'));
            info.appendChild(titulo);
            const partes = [end.rua, end.bairro, end.cidade + ' - PI'].filter(Boolean).join(', ');
            info.appendChild(criar('p', '', partes + (end.cep ? ' | CEP ' + end.cep : '')));

            const acoes = criar('div', 'cfg-endereco-acoes');
            const botao = (rotulo, classe, fn) => {
                const b = criar('button', 'cfg-link-acao ' + classe, rotulo);
                b.type = 'button';
                b.addEventListener('click', fn);
                acoes.appendChild(b);
            };
            if (!end.principal) botao('Tornar principal', '', () => tornarPrincipal(end.id));
            botao('Editar', '', () => iniciarEdicao(end.id));
            botao('Remover', 'perigo', () => pedirRemocao(end.id));

            item.append(info, acoes);
            lista.appendChild(item);
        });
    }

    function tornarPrincipal(id) {
        enderecos.forEach(e => { e.principal = e.id === id; });
        salvarEnderecos(); renderizarEnderecos();
        toast('Endereço principal atualizado.');
    }

    function limparFormEndereco() {
        $('form-endereco').reset();
        ['end-apelido', 'end-cep', 'end-rua'].forEach(id => marcarErro(id, 'erro-' + id, ''));
        editandoId = null;
        $('titulo-form-endereco').textContent = 'Adicionar endereço';
        $('btn-salvar-endereco').textContent = 'Adicionar endereço';
        $('btn-cancelar-endereco').hidden = true;
    }

    function iniciarEdicao(id) {
        const end = enderecos.find(e => e.id === id);
        if (!end) return;
        editandoId = id;
        $('end-apelido').value = end.apelido;
        $('end-cep').value = end.cep || '';
        $('end-rua').value = end.rua;
        $('end-bairro').value = end.bairro || '';
        $('end-cidade').value = end.cidade;
        $('titulo-form-endereco').textContent = 'Editar endereço';
        $('btn-salvar-endereco').textContent = 'Salvar endereço';
        $('btn-cancelar-endereco').hidden = false;
        $('form-endereco').scrollIntoView({ behavior: 'smooth', block: 'center' });
        $('end-apelido').focus();
    }

    function pedirRemocao(id) {
        const end = enderecos.find(e => e.id === id);
        if (!end) return;
        confirmar('Remover endereço', `Deseja remover o endereço "${end.apelido}"?`, () => {
            const eraPrincipal = end.principal;
            enderecos = enderecos.filter(e => e.id !== id);
            if (eraPrincipal && enderecos.length) enderecos[0].principal = true;
            if (editandoId === id) limparFormEndereco();
            salvarEnderecos(); renderizarEnderecos();
            toast('Endereço removido.');
        });
    }

    $('end-cep').addEventListener('input', (e) => { e.target.value = maskCep(e.target.value); });
    $('btn-cancelar-endereco').addEventListener('click', limparFormEndereco);

    $('form-endereco').addEventListener('submit', (e) => {
        e.preventDefault();
        const apelido = $('end-apelido').value.trim();
        const cep = $('end-cep').value.trim();
        const rua = $('end-rua').value.trim();
        const okApelido = marcarErro('end-apelido', 'erro-end-apelido', !apelido ? 'Dê um apelido ao endereço.' : '');
        const okCep = marcarErro('end-cep', 'erro-end-cep', cep && soDigitos(cep).length !== 8 ? 'O CEP tem 8 números.' : '');
        const okRua = marcarErro('end-rua', 'erro-end-rua', !rua ? 'Informe a rua e o número.' : '');
        if (!(okApelido && okCep && okRua)) { toast('Corrija os campos destacados.', true); return; }

        const dados = {
            apelido, cep, rua,
            bairro: $('end-bairro').value.trim(),
            cidade: $('end-cidade').value
        };
        if (editandoId !== null) {
            const alvo = enderecos.find(x => x.id === editandoId);
            if (alvo) Object.assign(alvo, dados);
            toast('Endereço atualizado.');
        } else {
            enderecos.push({ id: Date.now(), principal: enderecos.length === 0, ...dados });
            toast('Endereço adicionado.');
        }
        salvarEnderecos(); renderizarEnderecos(); limparFormEndereco();
    });

    renderizarEnderecos();

    // ------------------------------------------------------------------
    // 5. Interruptores (notificações, privacidade, segurança)
    // ------------------------------------------------------------------
    let config = { ...PADROES, ...ler(CHAVE_CONFIG, {}) };
    const interruptores = document.querySelectorAll('input[data-chave]');
    function aplicarConfigNaTela() {
        interruptores.forEach(i => { i.checked = !!config[i.dataset.chave]; });
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



    // ------------------------------------------------------------------
    // 6. Modal de confirmação e zona de risco (Suspender e Excluir Conta)
    // ------------------------------------------------------------------
    const modal = $('cfg-modal');
    let aoConfirmar = null;
    function confirmar(titulo, texto, fn, textoBotao = 'Confirmar', isPerigo = true) {
        $('cfg-modal-titulo').textContent = titulo;
        $('cfg-modal-texto').textContent = texto;
        const btnConf = $('cfg-modal-confirmar');
        if (btnConf) {
            btnConf.textContent = textoBotao;
            btnConf.className = isPerigo ? 'cfg-btn cfg-btn-perigo' : 'cfg-btn';
            if (!isPerigo) {
                btnConf.style.background = '#F59E0B';
                btnConf.style.color = '#FFFFFF';
            } else {
                btnConf.style.background = '';
                btnConf.style.color = '';
            }
        }
        aoConfirmar = fn;
        modal.classList.add('aberto');
        $('cfg-modal-cancelar').focus();
    }
    function fecharModal() { modal.classList.remove('aberto'); aoConfirmar = null; }
    $('cfg-modal-cancelar').addEventListener('click', fecharModal);
    $('cfg-modal-confirmar').addEventListener('click', () => {
        const fn = aoConfirmar; fecharModal(); if (fn) fn();
    });
    modal.addEventListener('click', (e) => { if (e.target === modal) fecharModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') fecharModal(); });

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
                    } catch(e) {}
                    window.location.href = '../index.html?msg=conta_suspensa';
                },
                'Sim, suspender conta',
                false
            );
        });
    }

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
                    } catch(e) {}
                    window.location.href = '../index.html?msg=conta_excluida';
                },
                'Excluir definitivamente',
                true
            );
        });
    }

    // Header e Menu Lateral (Drawer) são gerenciados de forma centralizada e global por sessao.js
});
