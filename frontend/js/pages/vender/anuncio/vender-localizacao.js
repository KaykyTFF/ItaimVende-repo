/**
 * ITAIM VENDE - VENDER: GESTÃO DE LOCALIZAÇÃO E ENDEREÇOS SALVOS
 * Arquivo: frontend/js/pages/vender/anuncio/vender-localizacao.js
 */

(function () {
    'use strict';

    const { mostrarToast } = window.ItaimVenderEstado;

    let inicializado = false;

    let modalLoc = null;
    let btnEditarLoc = null;
    let btnFecharModalLoc = null;
    let textoLocalizacao = null;
    let selectCidade = null;
    let inputBairro = null;

    let locListaEnderecos = null;
    let locBadgeQtd = null;
    let btnToggleNovoEnd = null;
    let gavetaNovoEnd = null;
    let locFormNovo = null;
    let inputLocApelido = null;
    let inputLocCep = null;
    let inputLocBairro = null;
    let inputLocCidade = null;
    let btnAddEndLoc = null;
    let btnCancelarEndLoc = null;

    let erroLocApelido = null;
    let erroLocCep = null;
    let erroLocBairro = null;
    let erroLocCidade = null;

    function obterEnderecosLocais() {
        try {
            const raw = localStorage.getItem('itaim_enderecos');
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch (e) {}

        // Fallback: se não houver endereços, usa dados do usuário logado
        let user = null;
        try {
            user = (window.ItaimSessao && typeof window.ItaimSessao.obterUsuarioLogado === 'function')
                ? window.ItaimSessao.obterUsuarioLogado()
                : JSON.parse(localStorage.getItem('itaim_usuario_logado') || 'null');
        } catch (e) {}

        const cidadePadrao = (user && (user.city || user.cidade)) || 'Paulistana';
        let bairroPadrao = (user && (user.neighborhood || user.bairro)) || 'Centro';
        if (!bairroPadrao || /^\d/.test(bairroPadrao) || /\d{5}/.test(bairroPadrao)) bairroPadrao = 'Centro';

        const padrao = [{
            id: 'end_padrao_perfil',
            apelido: 'Principal',
            nickname: 'Principal',
            cidade: cidadePadrao,
            city: cidadePadrao,
            bairro: bairroPadrao,
            neighborhood: bairroPadrao,
            estado: 'PI',
            state: 'PI',
            cep: (user && (user.postalCode || user.cep)) || '64750-000',
            postalCode: (user && (user.postalCode || user.cep)) || '64750-000',
            principal: true,
            isDefault: true
        }];

        try {
            localStorage.setItem('itaim_enderecos', JSON.stringify(padrao));
        } catch (e) {}

        return padrao;
    }

    function salvarEnderecosLocais(lista) {
        try {
            localStorage.setItem('itaim_enderecos', JSON.stringify(lista));
        } catch (e) {}
    }

    function abrirModalLocalizacao() {
        limparErrosNovoEndereco();
        renderizarEnderecosModal();
        fecharGavetaEndereco();
        modalLoc?.classList.add('ativo');
        document.body.classList.add('modal-aberto-bloquear-scroll');
    }

    function fecharModalLocalizacao() {
        modalLoc?.classList.remove('ativo');
        document.body.classList.remove('modal-aberto-bloquear-scroll');
        fecharGavetaEndereco();
        limparErrosNovoEndereco();
    }

    function alternarGavetaEndereco() {
        if (!gavetaNovoEnd || !btnToggleNovoEnd) return;
        const estaAberto = gavetaNovoEnd.classList.contains('aberto');
        if (estaAberto) {
            fecharGavetaEndereco();
        } else {
            abrirGavetaEndereco();
        }
    }

    function abrirGavetaEndereco() {
        if (!gavetaNovoEnd || !btnToggleNovoEnd) return;
        gavetaNovoEnd.classList.add('aberto');
        btnToggleNovoEnd.classList.add('ativo');
        btnToggleNovoEnd.setAttribute('aria-expanded', 'true');

        setTimeout(() => {
            gavetaNovoEnd.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            inputLocApelido?.focus();
        }, 80);
    }

    function fecharGavetaEndereco() {
        if (!gavetaNovoEnd || !btnToggleNovoEnd) return;
        gavetaNovoEnd.classList.remove('aberto');
        btnToggleNovoEnd.classList.remove('ativo');
        btnToggleNovoEnd.setAttribute('aria-expanded', 'false');
        limparErrosNovoEndereco();
        if (locFormNovo) locFormNovo.reset();
    }

    function aplicarLocalizacaoSelecionada(cidade, bairro) {
        const cid = (cidade || 'Paulistana').trim();
        let bar = (bairro || 'Centro').trim();
        if (!bar || /^\d/.test(bar) || /\d{5}/.test(bar)) bar = 'Centro';

        if (textoLocalizacao) {
            textoLocalizacao.textContent = `${cid} - ${bar}`;
        }
        if (selectCidade) selectCidade.value = cid;
        if (inputBairro) inputBairro.value = bar;

        const previewLocal = document.getElementById('preview-local');
        if (previewLocal) previewLocal.textContent = `${cid} - ${bar}`;

        fecharModalLocalizacao();
        mostrarToast(`Localização definida: ${cid} - ${bar}`);
    }

    async function renderizarEnderecosModal() {
        if (!locListaEnderecos) return;

        let enderecos = obterEnderecosLocais();

        // Se autenticado, busca da API para garantir dados mais recentes
        if (window.ItaimApi && window.ItaimApi.enderecos && window.ItaimApi.auth?.obterToken()) {
            try {
                const res = await window.ItaimApi.enderecos.listar();
                if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
                    enderecos = res.data;
                    salvarEnderecosLocais(enderecos);
                }
            } catch (err) {
                console.info('[Vender Localização] Usando lista local:', err.message);
            }
        }

        if (locBadgeQtd) {
            locBadgeQtd.textContent = `${enderecos.length} salvo${enderecos.length === 1 ? '' : 's'}`;
        }

        locListaEnderecos.innerHTML = '';

        if (enderecos.length === 0) {
            locListaEnderecos.innerHTML = `
                <div class="loc-vazio">
                    Você ainda não possui endereços cadastrados. Clique no botão abaixo para adicionar.
                </div>
            `;
            return;
        }

        const textoAtual = (textoLocalizacao?.textContent || '').toLowerCase();

        enderecos.forEach(end => {
            const apelido = end.apelido || end.nickname || 'Endereço';
            const cidade = end.cidade || end.city || 'Paulistana';
            let bairro = end.bairro || end.neighborhood || 'Centro';
            if (!bairro || /^\d/.test(bairro) || /\d{5}/.test(bairro)) bairro = 'Centro';
            const estado = end.estado || end.state || 'PI';
            const cep = end.cep || end.postalCode || '';
            const isPrincipal = !!(end.principal || end.isDefault);

            const isSelecionado = textoAtual.includes(bairro.toLowerCase()) && textoAtual.includes(cidade.toLowerCase());

            const item = document.createElement('div');
            item.className = `loc-endereco-item ${isSelecionado ? 'selecionado' : ''}`;
            item.setAttribute('role', 'button');
            item.setAttribute('tabindex', '0');
            item.title = 'Clique para selecionar este local de retirada';

            item.innerHTML = `
                <div class="loc-endereco-info">
                    <div class="loc-endereco-titulo">
                        <strong>${apelido}</strong>
                        ${isPrincipal ? '<span class="loc-selo-principal">PRINCIPAL</span>' : ''}
                    </div>
                    <p class="loc-endereco-detalhes">${bairro}, ${cidade} - ${estado}${cep ? ' | CEP ' + cep : ''}</p>
                </div>
                <button type="button" class="btn-selecionar-loc-tag" aria-label="Selecionar endereço">
                    ${isSelecionado ? '✓ Selecionado' : 'Selecionar'}
                </button>
            `;

            item.addEventListener('click', () => {
                aplicarLocalizacaoSelecionada(cidade, bairro);
            });

            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    aplicarLocalizacaoSelecionada(cidade, bairro);
                }
            });

            locListaEnderecos.appendChild(item);
        });
    }

    function limparErrosNovoEndereco() {
        [
            { input: inputLocApelido, erro: erroLocApelido },
            { input: inputLocCep, erro: erroLocCep },
            { input: inputLocBairro, erro: erroLocBairro },
            { input: inputLocCidade, erro: erroLocCidade },
        ].forEach(({ input, erro }) => {
            if (input) input.classList.remove('invalido');
            if (erro) erro.textContent = '';
        });
    }

    function inicializar() {
        if (inicializado) return;
        inicializado = true;

        modalLoc = document.getElementById('modal-localizacao');
        btnEditarLoc = document.getElementById('btn-editar-localizacao');
        btnFecharModalLoc = document.getElementById('btn-fechar-modal-loc');
        textoLocalizacao = document.getElementById('texto-localizacao');
        selectCidade = document.getElementById('select-cidade-modal');
        inputBairro = document.getElementById('input-bairro-modal') || document.getElementById('input-cep-modal');

        locListaEnderecos = document.getElementById('loc-lista-enderecos');
        locBadgeQtd = document.getElementById('loc-badge-qtd');

        btnToggleNovoEnd = document.getElementById('btn-toggle-novo-endereco');
        gavetaNovoEnd = document.getElementById('loc-gaveta-novo-endereco');
        locFormNovo = document.getElementById('loc-form-novo-endereco');
        inputLocApelido = document.getElementById('loc-end-apelido');
        inputLocCep = document.getElementById('loc-end-cep');
        inputLocBairro = document.getElementById('loc-end-bairro');
        inputLocCidade = document.getElementById('loc-end-cidade');
        btnAddEndLoc = document.getElementById('btn-adicionar-end-loc');
        btnCancelarEndLoc = document.getElementById('btn-cancelar-end-loc');

        erroLocApelido = document.getElementById('erro-loc-end-apelido');
        erroLocCep = document.getElementById('erro-loc-end-cep');
        erroLocBairro = document.getElementById('erro-loc-end-bairro');
        erroLocCidade = document.getElementById('erro-loc-end-cidade');

        // Abertura e fechamento do modal
        btnEditarLoc?.addEventListener('click', abrirModalLocalizacao);
        btnFecharModalLoc?.addEventListener('click', fecharModalLocalizacao);

        modalLoc?.addEventListener('click', (e) => {
            if (e.target === modalLoc) fecharModalLocalizacao();
        });

        // Bloqueio de scroll por gestos de toque no backdrop
        modalLoc?.addEventListener('touchmove', (e) => {
            if (e.target === modalLoc) {
                e.preventDefault();
            }
        }, { passive: false });

        // Fechamento via tecla Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modalLoc?.classList.contains('ativo')) {
                fecharModalLocalizacao();
            }
        });

        // Abertura / Fechamento da gaveta de novo endereço
        btnToggleNovoEnd?.addEventListener('click', alternarGavetaEndereco);
        btnCancelarEndLoc?.addEventListener('click', fecharGavetaEndereco);

        const btnSalvarLocLegado = document.getElementById('btn-salvar-loc');
        btnSalvarLocLegado?.addEventListener('click', () => {
            const cidade = selectCidade?.value || 'Paulistana';
            const bairro = inputBairro?.value.trim() || 'Centro';
            aplicarLocalizacaoSelecionada(cidade, bairro);
        });

        // Formatação do CEP e busca ViaCEP no modal de localização
        if (inputLocCep) {
            inputLocCep.addEventListener('input', async (e) => {
                let val = e.target.value.replace(/\D/g, '').slice(0, 8);
                if (val.length > 5) {
                    e.target.value = `${val.slice(0, 5)}-${val.slice(5)}`;
                } else {
                    e.target.value = val;
                }

                if (erroLocCep) erroLocCep.textContent = '';
                inputLocCep.classList.remove('invalido');

                if (val.length === 8) {
                    try {
                        const resp = await fetch(`https://viacep.com.br/ws/${val}/json/`);
                        const dadosCep = await resp.json();
                        if (dadosCep && !dadosCep.erro) {
                            if (dadosCep.bairro && inputLocBairro) {
                                inputLocBairro.value = dadosCep.bairro;
                                if (erroLocBairro) erroLocBairro.textContent = '';
                                inputLocBairro.classList.remove('invalido');
                            }
                            if (dadosCep.localidade && inputLocCidade) {
                                inputLocCidade.value = dadosCep.localidade;
                                if (erroLocCidade) erroLocCidade.textContent = '';
                                inputLocCidade.classList.remove('invalido');
                            }
                            mostrarToast('Bairro e cidade preenchidos pelo CEP!');
                        }
                    } catch (errCep) {}
                }
            });
        }

        // Submissão do novo endereço pelo modal
        locFormNovo?.addEventListener('submit', async (e) => {
            e.preventDefault();
            limparErrosNovoEndereco();

            const apelido = (inputLocApelido?.value || '').trim();
            const cepRaw = (inputLocCep?.value || '').trim();
            const cepDigitos = cepRaw.replace(/\D/g, '');
            const bairro = (inputLocBairro?.value || '').trim();
            const cidade = (inputLocCidade?.value || '').trim();

            let temErro = false;

            if (!apelido) {
                if (inputLocApelido) inputLocApelido.classList.add('invalido');
                if (erroLocApelido) erroLocApelido.textContent = 'Dê um apelido ao endereço.';
                temErro = true;
            }

            if (!cepDigitos) {
                if (inputLocCep) inputLocCep.classList.add('invalido');
                if (erroLocCep) erroLocCep.textContent = 'Informe o CEP.';
                temErro = true;
            } else if (cepDigitos.length !== 8) {
                if (inputLocCep) inputLocCep.classList.add('invalido');
                if (erroLocCep) erroLocCep.textContent = 'O CEP tem 8 números.';
                temErro = true;
            }

            if (!bairro) {
                if (inputLocBairro) inputLocBairro.classList.add('invalido');
                if (erroLocBairro) erroLocBairro.textContent = 'Informe o bairro.';
                temErro = true;
            }

            if (!cidade) {
                if (inputLocCidade) inputLocCidade.classList.add('invalido');
                if (erroLocCidade) erroLocCidade.textContent = 'Informe a cidade.';
                temErro = true;
            }

            if (temErro) return;

            if (btnAddEndLoc) {
                btnAddEndLoc.disabled = true;
                btnAddEndLoc.textContent = 'Salvando endereço...';
            }

            const dadosNovoEnd = {
                id: Date.now(),
                apelido,
                nickname: apelido,
                cep: cepRaw,
                postalCode: cepRaw,
                bairro,
                neighborhood: bairro,
                cidade,
                city: cidade,
                estado: 'PI',
                state: 'PI',
                street: '',
                principal: false,
                isDefault: false
            };

            try {
                if (window.ItaimApi && window.ItaimApi.enderecos && window.ItaimApi.auth?.obterToken()) {
                    const resApi = await window.ItaimApi.enderecos.criar(dadosNovoEnd);
                    if (resApi && resApi.data && resApi.data.id) {
                        dadosNovoEnd.id = resApi.data.id;
                    }
                }
            } catch (apiErr) {
                console.warn('[Vender Localização] Falha ao salvar endereço na API:', apiErr.message);
            }

            const enderecosAtuais = obterEnderecosLocais();
            if (enderecosAtuais.length === 0) {
                dadosNovoEnd.principal = true;
                dadosNovoEnd.isDefault = true;
            }
            enderecosAtuais.push(dadosNovoEnd);
            salvarEnderecosLocais(enderecosAtuais);

            if (locFormNovo) locFormNovo.reset();

            if (btnAddEndLoc) {
                btnAddEndLoc.disabled = false;
                btnAddEndLoc.textContent = 'Salvar endereço';
            }

            aplicarLocalizacaoSelecionada(cidade, bairro);
            mostrarToast('Endereço adicionado e selecionado para retirada!');
        });
    }

    window.ItaimVenderLocalizacao = {
        inicializar,
        abrirModalLocalizacao,
        fecharModalLocalizacao,
        alternarGavetaEndereco,
        aplicarLocalizacaoSelecionada,
        renderizarEnderecosModal,
        obterEnderecosLocais
    };
})();
