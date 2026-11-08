/**
 * ITAIM VENDE - VENDER: NAVEGAÇÃO DO WIZARD, DROPDOWNS E VALIDAÇÕES POR ETAPA
 * Arquivo: frontend/js/pages/vender/anuncio/vender-wizard.js
 */

(function () {
    'use strict';

    function getEstado() {
        return window.ItaimVenderEstado.estado;
    }

    const {
        NOMES_ETAPAS,
        PORCENTAGEM_ETAPAS,
        PADROES_SUSPEITOS,
        exibirFeedback,
        validarFotos
    } = window.ItaimVenderEstado;

    let inputTitulo = null;
    let textareaDesc = null;
    let contadorCaracteres = null;
    let inputPreco = null;
    let btnToggleDoacao = null;
    let campoPrecoWrapper = null;

    let dropdownCategoria = null;
    let btnDropdownCategoria = null;
    let labelCategoria = null;
    let menuCategoriaOpcoes = null;

    let dropdownCondicao = null;
    let btnDropdownCondicao = null;
    let labelCondicao = null;
    let menuCondicaoOpcoes = null;

    let wizardEtapaBadge = null;
    let wizardEtapaNome = null;
    let wizardBarraProgresso = null;

    function configurarDropdownPill(container, btn, label, menu) {
        if (!container || !btn || !label || !menu) return;

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const jaAberto = container.classList.contains('aberto');
            document.querySelectorAll('.dropdown-pill-container').forEach(d => d.classList.remove('aberto'));
            if (!jaAberto) container.classList.add('aberto');
        });

        menu.querySelectorAll('.dropdown-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                menu.querySelectorAll('.dropdown-item').forEach(it => it.classList.remove('selecionado'));
                item.classList.add('selecionado');
                label.textContent = item.textContent.trim();
                container.classList.remove('aberto');
            });
        });
    }

    function definirModoDoacao(ativar) {
        getEstado().isModoDoacao = ativar;
        if (btnToggleDoacao) {
            btnToggleDoacao.classList.toggle('ativo', ativar);
        }
        if (campoPrecoWrapper) {
            campoPrecoWrapper.classList.toggle('modo-doacao', ativar);
        }
        if (inputPreco) {
            if (ativar) {
                inputPreco.value = 'Doação';
                inputPreco.readOnly = true;
            } else {
                inputPreco.readOnly = false;
                if (inputPreco.value === 'Doação' || inputPreco.value === '0,00' || inputPreco.value.trim() === '') {
                    inputPreco.value = '';
                }
                inputPreco.focus();
            }
        }
    }

    function formatarValorMoeda(valor) {
        let v = (valor || '').replace(/\D/g, '');
        if (!v || v === '0') return '0,00';
        v = (v / 100).toFixed(2) + '';
        v = v.replace('.', ',');
        v = v.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
        return v;
    }

    function irParaEtapa(novaEtapa) {
        if (novaEtapa < 1 || novaEtapa > 4) return false;

        const est = getEstado();

        // Validação progressiva ao avançar
        if (novaEtapa > est.etapaAtual) {
            // Validação obrigatória da Etapa 1 (Fotos)
            if (est.etapaAtual === 1 || (novaEtapa > 1 && est.fotosLista.length === 0)) {
                if (!validarFotos()) {
                    if (est.etapaAtual !== 1) irParaEtapa(1);
                    return false;
                }
            }

            // Validação ao sair da Etapa 2 (Detalhes)
            if (est.etapaAtual === 2 || (est.etapaAtual < 2 && novaEtapa > 2)) {
                const tit = inputTitulo?.value.trim() || '';
                const desc = textareaDesc?.value.trim() || '';

                if (tit.length < 3) {
                    exibirFeedback('O título do anúncio deve ter no mínimo 3 caracteres.');
                    if (est.etapaAtual !== 2) irParaEtapa(2);
                    inputTitulo?.focus();
                    return false;
                }

                const catSelecionada = (labelCategoria?.textContent || '').trim().toUpperCase();
                if (!catSelecionada || catSelecionada === 'SELECIONAR CATEGORIA') {
                    exibirFeedback('Por favor, selecione uma categoria para o seu anúncio.');
                    if (est.etapaAtual !== 2) irParaEtapa(2);
                    btnDropdownCategoria?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    btnDropdownCategoria?.focus();
                    return false;
                }

                const condSelecionada = (labelCondicao?.textContent || '').trim().toUpperCase();
                if (!condSelecionada || condSelecionada === 'SELECIONAR CONDIÇÃO') {
                    exibirFeedback('Por favor, selecione a condição do produto.');
                    if (est.etapaAtual !== 2) irParaEtapa(2);
                    btnDropdownCondicao?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    btnDropdownCondicao?.focus();
                    return false;
                }

                // Regra Anti-Fraude: Prevenção de Phishing e Links Maliciosos
                if (PADROES_SUSPEITOS.test(tit)) {
                    exibirFeedback('Por segurança contra fraudes, o título não pode conter links externos ou encurtadores.');
                    if (est.etapaAtual !== 2) irParaEtapa(2);
                    inputTitulo?.focus();
                    return false;
                }
                if (PADROES_SUSPEITOS.test(desc)) {
                    exibirFeedback('Por segurança contra golpes e phishing, a descrição não pode conter links externos ou encurtadores.');
                    if (est.etapaAtual !== 2) irParaEtapa(2);
                    textareaDesc?.focus();
                    return false;
                }
            }

            // Validação ao sair da Etapa 3 (Preço)
            if (est.etapaAtual === 3 || (est.etapaAtual < 3 && novaEtapa === 4)) {
                if (!est.isModoDoacao) {
                    const precoRaw = inputPreco?.value.replace(/\D/g, '') || '0';
                    const precoVal = parseFloat(precoRaw) / 100;
                    if (precoVal <= 0) {
                        exibirFeedback('Por favor, informe um preço de venda válido ou clique em "Doação".');
                        if (est.etapaAtual !== 3) irParaEtapa(3);
                        inputPreco?.focus();
                        return false;
                    }
                }
            }
        }

        est.etapaAtual = novaEtapa;

        // Atualiza painéis visíveis
        for (let i = 1; i <= 4; i++) {
            const painel = document.getElementById(`painel-etapa-${i}`);
            if (painel) {
                if (i === est.etapaAtual) {
                    painel.classList.add('etapa-ativa');
                } else {
                    painel.classList.remove('etapa-ativa');
                }
            }
        }

        // Atualiza cabeçalho do wizard
        if (wizardEtapaBadge) {
            wizardEtapaBadge.textContent = `Etapa ${est.etapaAtual} de 4`;
        }
        if (wizardEtapaNome) {
            wizardEtapaNome.textContent = NOMES_ETAPAS[est.etapaAtual] || '';
        }
        if (wizardBarraProgresso) {
            wizardBarraProgresso.style.width = PORCENTAGEM_ETAPAS[est.etapaAtual] || '25%';
        }

        // Se chegou na revisão, atualiza a pré-visualização
        if (est.etapaAtual === 4 && window.ItaimVenderPublicacao?.atualizarPreviewRevisao) {
            window.ItaimVenderPublicacao.atualizarPreviewRevisao();
        }

        window.scrollTo({ top: 100, behavior: 'smooth' });
        return true;
    }

    function inicializar() {
        inputTitulo = document.getElementById('input-titulo');
        textareaDesc = document.getElementById('textarea-desc');
        contadorCaracteres = document.getElementById('contador-caracteres');
        inputPreco = document.getElementById('input-preco');
        btnToggleDoacao = document.getElementById('btn-toggle-doacao');
        campoPrecoWrapper = document.getElementById('campo-preco-wrapper');

        dropdownCategoria = document.getElementById('dropdown-categoria-pill');
        btnDropdownCategoria = document.getElementById('btn-dropdown-cat-pill');
        labelCategoria = document.getElementById('label-cat-selecionada');
        menuCategoriaOpcoes = document.getElementById('menu-cat-opcoes');

        dropdownCondicao = document.getElementById('dropdown-condicao-pill');
        btnDropdownCondicao = document.getElementById('btn-dropdown-cond-pill');
        labelCondicao = document.getElementById('label-cond-selecionada');
        menuCondicaoOpcoes = document.getElementById('menu-cond-opcoes');

        wizardEtapaBadge = document.getElementById('wizard-etapa-badge');
        wizardEtapaNome = document.getElementById('wizard-etapa-nome');
        wizardBarraProgresso = document.getElementById('wizard-barra-progresso');

        // Botão Doação
        btnToggleDoacao?.addEventListener('click', () => {
            definirModoDoacao(!getEstado().isModoDoacao);
        });

        // Máscara de Preço
        if (inputPreco) {
            inputPreco.addEventListener('input', (e) => {
                if (getEstado().isModoDoacao) return;
                const formatted = formatarValorMoeda(e.target.value);
                e.target.value = formatted;
            });
            inputPreco.addEventListener('focus', (e) => {
                if (getEstado().isModoDoacao) return;
                if (e.target.value === '0,00' || e.target.value === '') {
                    e.target.value = '';
                }
            });
            inputPreco.addEventListener('blur', (e) => {
                if (getEstado().isModoDoacao) return;
                if (e.target.value.trim() === '') {
                    e.target.value = '0,00';
                }
            });
        }

        // Contador de caracteres da descrição
        if (textareaDesc && contadorCaracteres) {
            textareaDesc.addEventListener('input', () => {
                const total = textareaDesc.value.length;
                contadorCaracteres.textContent = `${total}/500 caracteres`;
            });
        }

        // Dropdowns em pílula
        configurarDropdownPill(dropdownCategoria, btnDropdownCategoria, labelCategoria, menuCategoriaOpcoes);
        configurarDropdownPill(dropdownCondicao, btnDropdownCondicao, labelCondicao, menuCondicaoOpcoes);

        document.addEventListener('click', () => {
            document.querySelectorAll('.dropdown-pill-container').forEach(d => d.classList.remove('aberto'));
        });

        // Botões de Avançar e Voltar
        document.getElementById('btn-passo1-proximo')?.addEventListener('click', () => {
            if (!validarFotos()) return;
            irParaEtapa(2);
        });

        document.getElementById('btn-passo2-anterior')?.addEventListener('click', () => irParaEtapa(1));
        document.getElementById('btn-passo2-proximo')?.addEventListener('click', () => irParaEtapa(3));
        document.getElementById('btn-passo3-anterior')?.addEventListener('click', () => irParaEtapa(2));
        document.getElementById('btn-passo3-proximo')?.addEventListener('click', () => irParaEtapa(4));
        document.getElementById('btn-passo4-anterior')?.addEventListener('click', () => irParaEtapa(3));

        // Botão Voltar do Topo
        document.getElementById('btn-voltar-vender')?.addEventListener('click', (e) => {
            e.preventDefault();
            const est = getEstado();
            if (est.etapaAtual > 1) {
                irParaEtapa(est.etapaAtual - 1);
            } else {
                window.location.href = window.ItaimRotas ? window.ItaimRotas.obterUrl('home') : '../home/home.html';
            }
        });

        // Links de atalho "Editar" na revisão
        document.querySelectorAll('.btn-editar-etapa-link').forEach(link => {
            link.addEventListener('click', () => {
                const etapa = parseInt(link.getAttribute('data-ir-etapa'), 10);
                if (etapa) irParaEtapa(etapa);
            });
        });
    }

    window.ItaimVenderWizard = {
        inicializar,
        irParaEtapa,
        definirModoDoacao
    };
})();

