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
