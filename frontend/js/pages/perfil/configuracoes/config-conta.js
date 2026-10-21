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
