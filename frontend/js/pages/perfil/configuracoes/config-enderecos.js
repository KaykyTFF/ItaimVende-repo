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
                const bairro = end.bairro || end.neighborhood || '';
                const cidade = end.cidade || end.city || '';
                const estado = end.estado || end.state || 'PI';
                const cep = end.cep || end.postalCode;

                const item = criarElemento('div', 'cfg-endereco' + (isPrincipal ? ' principal' : ''));
                const info = criarElemento('div');
                const titulo = criarElemento('strong', '', apelido);
                if (isPrincipal) titulo.appendChild(criarElemento('span', 'cfg-selo', 'PRINCIPAL'));
                info.appendChild(titulo);
                const partes = [bairro, cidade + (estado ? ' - ' + estado : '')].filter(Boolean).join(', ');
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

        function renderizarSkeletonEnderecos(qtd = 1) {
            const lista = $('lista-enderecos');
            if (!lista) return;
            lista.replaceChildren();

            for (let i = 0; i < qtd; i++) {
                const item = criarElemento('div', 'cfg-endereco-skeleton');
                item.setAttribute('aria-hidden', 'true');

                const info = criarElemento('div');
                info.style.flex = '1';

                const topo = criarElemento('div');
                topo.style.display = 'flex';
                topo.style.alignItems = 'center';
                topo.style.gap = '8px';

                const titulo = criarElemento('div', 'skeleton-line');
                titulo.style.width = i === 0 ? '100px' : '85px';
                titulo.style.height = '18px';
                titulo.style.borderRadius = '4px';
                topo.appendChild(titulo);

                if (i === 0) {
                    const selo = criarElemento('div', 'skeleton-line');
                    selo.style.width = '72px';
                    selo.style.height = '18px';
                    selo.style.borderRadius = '12px';
                    topo.appendChild(selo);
                }

                const subtitulo = criarElemento('div', 'skeleton-line');
                subtitulo.style.width = i === 0 ? '180px' : '150px';
                subtitulo.style.height = '13px';
                subtitulo.style.marginTop = '8px';
                subtitulo.style.borderRadius = '4px';

                info.append(topo, subtitulo);

                const acoes = criarElemento('div', 'cfg-endereco-acoes');
                acoes.style.display = 'flex';
                acoes.style.gap = '8px';
                acoes.style.alignItems = 'center';

                const btn1 = criarElemento('div', 'skeleton-line');
                btn1.style.width = '44px';
                btn1.style.height = '16px';
                btn1.style.borderRadius = '4px';

                const btn2 = criarElemento('div', 'skeleton-line');
                btn2.style.width = '54px';
                btn2.style.height = '16px';
                btn2.style.borderRadius = '4px';

                acoes.append(btn1, btn2);
                item.append(info, acoes);
                lista.appendChild(item);
            }
        }

        async function carregarEnderecosServidor() {
            renderizarSkeletonEnderecos();
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
            // Atualização imediata e otimista na tela (assíncrona)
            enderecos.forEach(e => {
                e.principal = (e.id === id);
                e.isDefault = (e.id === id);
            });
            enderecos.sort((a, b) => (b.principal || b.isDefault ? 1 : 0) - (a.principal || a.isDefault ? 1 : 0));
            salvarEnderecos();
            renderizarEnderecos();
            toast('Endereço principal atualizado.');

            // Persiste no backend de forma assíncrona
            if (window.ItaimApi && window.ItaimApi.enderecos && window.ItaimApi.auth && window.ItaimApi.auth.obterToken()) {
                try {
                    await window.ItaimApi.enderecos.tornarPrincipal(id);
                } catch (err) {
                    console.warn('[Configurações] Erro ao sincronizar principal na API:', err);
                }
            }
        }

        function limparFormEndereco() {
            const form = $('form-endereco');
            if (form) form.reset();
            ['end-apelido', 'end-cep', 'end-bairro', 'end-cidade'].forEach(id => marcarErro(id, 'erro-' + id, ''));
            editandoId = null;
            if ($('titulo-form-endereco')) $('titulo-form-endereco').textContent = 'Adicionar endereço';
            if ($('btn-salvar-endereco')) $('btn-salvar-endereco').textContent = 'Adicionar endereço';
            if ($('btn-cancelar-endereco')) {
                $('btn-cancelar-endereco').hidden = true;
                $('btn-cancelar-endereco').style.display = 'none';
            }
        }

        function iniciarEdicao(id) {
            const end = enderecos.find(e => e.id === id);
            if (!end) return;
            editandoId = id;
            if ($('end-apelido')) $('end-apelido').value = end.apelido || end.nickname || '';
            if ($('end-cep')) $('end-cep').value = end.cep || end.postalCode || '';
            if ($('end-bairro')) $('end-bairro').value = end.bairro || end.neighborhood || '';
            if ($('end-cidade')) $('end-cidade').value = end.cidade || end.city || '';
            if ($('titulo-form-endereco')) $('titulo-form-endereco').textContent = 'Editar endereço';
            if ($('btn-salvar-endereco')) $('btn-salvar-endereco').textContent = 'Salvar endereço';
            if ($('btn-cancelar-endereco')) {
                $('btn-cancelar-endereco').hidden = false;
                $('btn-cancelar-endereco').style.display = 'inline-flex';
            }
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
                const copiaAnterior = [...enderecos];
                const eraPrincipal = end.principal || end.isDefault;

                // 1. Atualização imediata na tela (assíncrona sem precisar de F5)
                enderecos = enderecos.filter(e => e.id !== id);
                if (eraPrincipal && enderecos.length) {
                    enderecos[0].principal = true;
                    enderecos[0].isDefault = true;
                }
                if (editandoId === id) limparFormEndereco();
                salvarEnderecos();
                renderizarEnderecos();
                toast('Endereço removido.');

                // 2. Chamada assíncrona na API em background
                if (window.ItaimApi && window.ItaimApi.enderecos && window.ItaimApi.auth && window.ItaimApi.auth.obterToken()) {
                    try {
                        await window.ItaimApi.enderecos.remover(id);
                    } catch (err) {
                        console.warn('[Configurações] Erro ao remover endereço na API:', err);
                        // Se falhou na API, restaura o estado anterior
                        enderecos = copiaAnterior;
                        salvarEnderecos();
                        renderizarEnderecos();
                        toast(err.message || 'Erro ao remover endereço.', true);
                    }
                }
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
                            if (dadosCep.bairro && $('end-bairro')) {
                                $('end-bairro').value = dadosCep.bairro;
                                marcarErro('end-bairro', 'erro-end-bairro', '');
                            }
                            if (dadosCep.localidade && $('end-cidade')) {
                                $('end-cidade').value = dadosCep.localidade;
                                marcarErro('end-cidade', 'erro-end-cidade', '');
                            }
                            toast('Bairro e cidade preenchidos via CEP!');
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
                const bairro = $('end-bairro') ? $('end-bairro').value.trim() : '';
                const cidade = $('end-cidade') ? $('end-cidade').value.trim() : '';

                const okApelido = marcarErro('end-apelido', 'erro-end-apelido', !apelido ? 'Dê um apelido ao endereço.' : '');
                const okCep = marcarErro('end-cep', 'erro-end-cep', !cep ? 'Informe o CEP.' : (soDigitos(cep).length !== 8 ? 'O CEP tem 8 números.' : ''));
                const okBairro = marcarErro('end-bairro', 'erro-end-bairro', !bairro ? 'Informe o bairro.' : '');
                const okCidade = marcarErro('end-cidade', 'erro-end-cidade', !cidade ? 'Informe a cidade.' : '');

                if (!(okApelido && okCep && okBairro && okCidade)) {
                    toast('Preencha os campos obrigatórios destacados.', true);
                    return;
                }

                const dados = {
                    nickname: apelido,
                    neighborhood: bairro,
                    city: cidade,
                    state: 'PI',
                    postalCode: cep || null,
                    street: '',
                    apelido,
                    cep,
                    bairro,
                    cidade,
                    estado: 'PI'
                };

                const btnSalvar = $('btn-salvar-endereco');
                if (btnSalvar) {
                    btnSalvar.disabled = true;
                    btnSalvar.textContent = 'Salvando...';
                }

                try {
                    if (window.ItaimApi && window.ItaimApi.enderecos && window.ItaimApi.auth && window.ItaimApi.auth.obterToken()) {
                        if (editandoId !== null) {
                            const res = await window.ItaimApi.enderecos.atualizar(editandoId, dados);
                            const atualizado = (res && res.data) ? res.data : { id: editandoId, ...dados };
                            const idx = enderecos.findIndex(x => x.id === editandoId);
                            if (idx !== -1) {
                                enderecos[idx] = atualizado;
                            }
                            toast('Endereço atualizado com sucesso.');
                        } else {
                            const res = await window.ItaimApi.enderecos.criar(dados);
                            const novo = (res && res.data) ? res.data : { id: Date.now(), principal: enderecos.length === 0, ...dados };
                            if (enderecos.length === 0) {
                                novo.principal = true;
                                novo.isDefault = true;
                            }
                            enderecos.push(novo);
                            toast('Endereço adicionado com sucesso.');
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
