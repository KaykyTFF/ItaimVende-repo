/**
 * ==========================================================================
 * ITAIM VENDE - LÓGICA DA PÁGINA "CRIAR ANÚNCIO / VENDER"
 * Processo interativo por 4 etapas (Wizard), Uploads 1:1, Máscaras e Preview.
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTOS DO DOM ---
    const formCardsWrapper = document.getElementById('vender-cards-wrapper');
    const secaoAcao = document.getElementById('secao-acao-anunciar');
    const telaSucesso = document.getElementById('tela-sucesso-container');
    const btnAnunciar = document.getElementById('btn-anunciar');
    const feedbackValidacao = document.getElementById('feedback-validacao');
    const linkVerAnuncio = document.getElementById('link-ver-anuncio');
    const btnCriarOutro = document.getElementById('btn-criar-outro');

    // Inputs do formulário
    const inputTitulo = document.getElementById('input-titulo');
    const textareaDesc = document.getElementById('textarea-descricao');
    const inputPreco = document.getElementById('input-preco');
    const contadorChar = document.getElementById('contador-desc');

    // Dropdowns
    const dropdownCategoria = document.getElementById('dropdown-categoria');
    const btnDropdownCategoria = document.getElementById('btn-dropdown-categoria');
    const labelCategoria = document.getElementById('label-categoria-texto');
    const menuCategoriaOpcoes = document.getElementById('menu-categoria-opcoes');

    const dropdownCondicao = document.getElementById('dropdown-condicao');
    const btnDropdownCondicao = document.getElementById('btn-dropdown-condicao');
    const labelCondicao = document.getElementById('label-condicao-texto');
    const menuCondicaoOpcoes = document.getElementById('menu-condicao-opcoes');

    // Chips de seleção rápida
    const chipsCategoria = document.querySelectorAll('#chips-categorias-container .chip-opcao');
    const chipsCondicao = document.querySelectorAll('#chips-condicao-container .chip-opcao');

    // Localização
    const textoLocalizacao = document.getElementById('texto-localizacao');
    const btnEditarLoc = document.getElementById('btn-editar-localizacao');
    const modalLoc = document.getElementById('modal-localizacao');
    const btnFecharModalLoc = document.getElementById('btn-fechar-modal-loc');
    const btnSalvarLoc = document.getElementById('btn-salvar-loc');
    const selectCidade = document.getElementById('select-cidade-modal');
    const inputCep = document.getElementById('input-cep-modal');

    // Elementos da galeria de fotos dinâmica
    const galeriaFotos = document.getElementById('galeria-fotos-vender');
    const btnAddFoto = document.getElementById('btn-add-foto');
    const inputFotosUpload = document.getElementById('input-fotos-upload');
    const badgeContadorFotos = document.getElementById('badge-contador-fotos');
    let fotosLista = [];

    // Barra de Progresso Limpa
    const wizardEtapaBadge = document.getElementById('wizard-etapa-badge');
    const wizardEtapaNome = document.getElementById('wizard-etapa-nome');
    const wizardBarraProgresso = document.getElementById('wizard-barra-progresso');

    // Botões de Navegação do Wizard
    const btnPasso1Proximo = document.getElementById('btn-passo1-proximo');
    const btnPasso2Anterior = document.getElementById('btn-passo2-anterior');
    const btnPasso2Proximo = document.getElementById('btn-passo2-proximo');
    const btnPasso3Anterior = document.getElementById('btn-passo3-anterior');
    const btnPasso3Proximo = document.getElementById('btn-passo3-proximo');
    const btnPasso4Anterior = document.getElementById('btn-passo4-anterior');
    const btnsEditarEtapaLink = document.querySelectorAll('.btn-editar-etapa-link');

    // ==========================================================================
    // 1. SISTEMA DINÂMICO DE UPLOAD E GALERIA DE FOTOS (1ª É A CAPA)
    // ==========================================================================
    function atualizarContadorFotos() {
        if (badgeContadorFotos) {
            badgeContadorFotos.textContent = `${fotosLista.length} de 6 fotos`;
        }
    }

    function renderizarGaleriaFotos() {
        if (!galeriaFotos) return;

        // Remove previews anteriores, mantendo o botão de adicionar
        const itensExistentes = galeriaFotos.querySelectorAll('.item-foto-preview');
        itensExistentes.forEach(el => el.remove());

        // Renderiza cada foto da lista
        fotosLista.forEach((fotoSrc, idx) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'item-foto-preview' + (idx === 0 ? ' item-foto-capa' : '');
            itemDiv.setAttribute('data-index', idx);

            const img = document.createElement('img');
            img.src = fotoSrc;
            img.alt = idx === 0 ? 'Foto de Capa do anúncio' : `Foto ${idx + 1}`;
            itemDiv.appendChild(img);

            // A primeira foto sempre recebe o badge de Capa
            if (idx === 0) {
                const tagCapa = document.createElement('span');
                tagCapa.className = 'tag-foto-capa';
                tagCapa.textContent = 'Capa';
                itemDiv.appendChild(tagCapa);
            }

            // Botão de remover foto individual
            const btnRemover = document.createElement('button');
            btnRemover.type = 'button';
            btnRemover.className = 'btn-remover-foto';
            btnRemover.title = 'Remover foto';
            btnRemover.setAttribute('aria-label', 'Remover foto');
            btnRemover.innerHTML = '&times;';
            btnRemover.addEventListener('click', (e) => {
                e.stopPropagation();
                removerFotoPorIndice(idx);
            });
            itemDiv.appendChild(btnRemover);

            // Insere antes do quadrado com o + (as fotos vão aparecendo nos lados)
            if (btnAddFoto) {
                galeriaFotos.insertBefore(itemDiv, btnAddFoto);
            } else {
                galeriaFotos.appendChild(itemDiv);
            }
        });

        // Se atingiu o limite de 6 fotos, esconde o quadrado +
        if (btnAddFoto) {
            btnAddFoto.style.display = fotosLista.length >= 6 ? 'none' : 'flex';
        }

        atualizarContadorFotos();
    }

    function removerFotoPorIndice(index) {
        if (index >= 0 && index < fotosLista.length) {
            fotosLista.splice(index, 1);
            renderizarGaleriaFotos();
            if (typeof etapaAtual !== 'undefined' && etapaAtual === 4) {
                atualizarPreviewRevisao();
            }
        }
    }

    function processarArquivoImagem(file) {
        return new Promise((resolve) => {
            if (window.ItaimFoto && typeof window.ItaimFoto.ajustarProduto === 'function') {
                window.ItaimFoto.ajustarProduto(file, (dataUrl) => resolve(dataUrl));
            } else if (window.ItaimFoto && typeof window.ItaimFoto.ajustar === 'function') {
                window.ItaimFoto.ajustar(file, 800, (dataUrl) => resolve(dataUrl));
            } else {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.onerror = () => resolve(null);
                reader.readAsDataURL(file);
            }
        });
    }

    async function adicionarArquivosFotos(files) {
        if (!files || files.length === 0) return;
        const vagas = 6 - fotosLista.length;
        if (vagas <= 0) {
            exibirFeedback('Você já atingiu o limite máximo de 6 fotos.');
            return;
        }

        const arquivosValidos = Array.from(files)
            .filter(f => f.type.startsWith('image/'))
            .slice(0, vagas);

        if (arquivosValidos.length === 0) return;

        for (const file of arquivosValidos) {
            const dataUrl = await processarArquivoImagem(file);
            if (dataUrl && fotosLista.length < 6) {
                fotosLista.push(dataUrl);
            }
        }

        renderizarGaleriaFotos();
    }

    if (btnAddFoto && inputFotosUpload) {
        btnAddFoto.addEventListener('click', () => {
            inputFotosUpload.click();
        });

        btnAddFoto.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                inputFotosUpload.click();
            }
        });

        inputFotosUpload.addEventListener('change', (e) => {
            adicionarArquivosFotos(e.target.files);
            inputFotosUpload.value = '';
        });

        // Eventos de Drag and Drop
        ['dragenter', 'dragover'].forEach(eventName => {
            btnAddFoto.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                btnAddFoto.classList.add('drag-over');
            });
            if (galeriaFotos) {
                galeriaFotos.addEventListener(eventName, (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                });
            }
        });

        ['dragleave', 'drop'].forEach(eventName => {
            btnAddFoto.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                btnAddFoto.classList.remove('drag-over');
            });
        });

        btnAddFoto.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            btnAddFoto.classList.remove('drag-over');
            if (e.dataTransfer && e.dataTransfer.files) {
                adicionarArquivosFotos(e.dataTransfer.files);
            }
        });
    }

    renderizarGaleriaFotos();

    // ==========================================================================
    // 2. MÁSCARA DINÂMICA DE PREÇO (R$ 0,00) E CONTADOR DE CARACTERES
    // ==========================================================================
    if (inputPreco) {
        inputPreco.addEventListener('input', (e) => {
            let valor = e.target.value.replace(/\D/g, '');
            if (!valor) {
                e.target.value = '';
                return;
            }
            valor = (parseFloat(valor) / 100).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            });
            e.target.value = valor;
        });
    }

    if (textareaDesc && contadorChar) {
        textareaDesc.addEventListener('input', () => {
            const tam = textareaDesc.value.length;
            contadorChar.textContent = `${tam} / 1000`;
        });
    }

    // ==========================================================================
    // 3. SELETORES DE CATEGORIA E CONDIÇÃO (CHIPS E DROPDOWNS SINCRONIZADOS)
    // ==========================================================================
    function configurarDropdownPill(container, btn, label, menu, onSelect) {
        if (!container || !btn || !menu) return;

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            document.querySelectorAll('.dropdown-pill-container').forEach(d => {
                if (d !== container) d.classList.remove('aberto');
            });
            container.classList.toggle('aberto');
        });

        menu.querySelectorAll('.item-opcao-dropdown').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const valor = item.getAttribute('data-valor') || item.textContent.trim();
                label.textContent = valor.toUpperCase();
                
                menu.querySelectorAll('.item-opcao-dropdown').forEach(i => i.classList.remove('selecionado'));
                item.classList.add('selecionado');
                container.classList.remove('aberto');

                if (typeof onSelect === 'function') onSelect(valor);
            });
        });
    }

    configurarDropdownPill(dropdownCategoria, btnDropdownCategoria, labelCategoria, menuCategoriaOpcoes, (valor) => {
        chipsCategoria.forEach(chip => {
            if (chip.getAttribute('data-valor') === valor) {
                chip.classList.add('ativo');
            } else {
                chip.classList.remove('ativo');
            }
        });
    });

    configurarDropdownPill(dropdownCondicao, btnDropdownCondicao, labelCondicao, menuCondicaoOpcoes, (valor) => {
        chipsCondicao.forEach(chip => {
            if (chip.getAttribute('data-valor') === valor) {
                chip.classList.add('ativo');
            } else {
                chip.classList.remove('ativo');
            }
        });
    });

    // Chips de Categoria
    chipsCategoria.forEach(chip => {
        chip.addEventListener('click', () => {
            chipsCategoria.forEach(c => c.classList.remove('ativo'));
            chip.classList.add('ativo');
            const valor = chip.getAttribute('data-valor');
            if (labelCategoria) labelCategoria.textContent = valor.toUpperCase();
            if (menuCategoriaOpcoes) {
                menuCategoriaOpcoes.querySelectorAll('.item-opcao-dropdown').forEach(item => {
                    item.classList.toggle('selecionado', item.getAttribute('data-valor') === valor);
                });
            }
        });
    });

    // Chips de Condição
    chipsCondicao.forEach(chip => {
        chip.addEventListener('click', () => {
            chipsCondicao.forEach(c => c.classList.remove('ativo'));
            chip.classList.add('ativo');
            const valor = chip.getAttribute('data-valor');
            if (labelCondicao) labelCondicao.textContent = valor.toUpperCase();
            if (menuCondicaoOpcoes) {
                menuCondicaoOpcoes.querySelectorAll('.item-opcao-dropdown').forEach(item => {
                    item.classList.toggle('selecionado', item.getAttribute('data-valor') === valor);
                });
            }
        });
    });

    // Fecha dropdowns ao clicar fora
    document.addEventListener('click', () => {
        document.querySelectorAll('.dropdown-pill-container').forEach(d => d.classList.remove('aberto'));
    });

    // ==========================================================================
    // 4. EDIÇÃO DE LOCALIZAÇÃO (MODAL)
    // ==========================================================================
    btnEditarLoc?.addEventListener('click', () => {
        modalLoc?.classList.add('ativo');
    });

    btnFecharModalLoc?.addEventListener('click', () => {
        modalLoc?.classList.remove('ativo');
    });

    modalLoc?.addEventListener('click', (e) => {
        if (e.target === modalLoc) modalLoc.classList.remove('ativo');
    });

    btnSalvarLoc?.addEventListener('click', () => {
        const cidade = selectCidade?.value || 'Paulistana';
        const cep = inputCep?.value.trim() || '64750-000';
        if (textoLocalizacao) {
            textoLocalizacao.textContent = `${cidade} - ${cep}`;
        }
        modalLoc?.classList.remove('ativo');
    });

    // ==========================================================================
    // 5. NAVEGAÇÃO INTERATIVA DO WIZARD POR ETAPAS
    // ==========================================================================
    let etapaAtual = 1;

    const NOMES_ETAPAS = {
        1: 'Fotos',
        2: 'Detalhes',
        3: 'Preço e Localização',
        4: 'Revisão'
    };

    const PORCENTAGEM_ETAPAS = {
        1: '25%',
        2: '50%',
        3: '75%',
        4: '100%'
    };

    function atualizarPreviewRevisao() {
        const previewFotoCapa = document.getElementById('preview-foto-capa');
        const previewFotosMiniaturas = document.getElementById('preview-fotos-miniaturas');
        const previewTitulo = document.getElementById('preview-titulo');
        const previewPreco = document.getElementById('preview-preco');
        const previewTagCat = document.getElementById('preview-tag-cat');
        const previewTagCond = document.getElementById('preview-tag-cond');
        const previewLocal = document.getElementById('preview-local');
        const previewDescricao = document.getElementById('preview-descricao');

        // Coleta fotos atuais da lista dinâmica
        const fotos = fotosLista;
        const placeholder = '../../assets/placeholders/produto-placeholder.svg';

        if (previewFotoCapa) {
            previewFotoCapa.src = fotos.length > 0 ? fotos[0] : placeholder;
        }

        if (previewFotosMiniaturas) {
            previewFotosMiniaturas.innerHTML = '';
            if (fotos.length > 1) {
                fotos.forEach((fotoSrc, idx) => {
                    const thumb = document.createElement('img');
                    thumb.className = 'preview-thumb-item' + (idx === 0 ? ' ativo' : '');
                    thumb.src = fotoSrc;
                    thumb.alt = `Foto ${idx + 1}`;
                    thumb.addEventListener('click', () => {
                        if (previewFotoCapa) previewFotoCapa.src = fotoSrc;
                        previewFotosMiniaturas.querySelectorAll('.preview-thumb-item').forEach(t => t.classList.remove('ativo'));
                        thumb.classList.add('ativo');
                    });
                    previewFotosMiniaturas.appendChild(thumb);
                });
            }
        }

        // Título
        if (previewTitulo) {
            previewTitulo.textContent = inputTitulo?.value.trim() || 'Título não informado';
        }

        // Preço
        if (previewPreco) {
            previewPreco.textContent = inputPreco?.value.trim() || 'R$ 0,00';
        }

        // Categoria (prioriza chip ativo ou dropdown)
        let catTexto = 'GERAL';
        const chipCatAtivo = document.querySelector('#chips-categorias-container .chip-opcao.ativo');
        if (chipCatAtivo) {
            catTexto = chipCatAtivo.getAttribute('data-valor') || chipCatAtivo.textContent.trim();
        } else if (labelCategoria && labelCategoria.textContent.trim() !== 'SELECIONAR CATEGORIA') {
            catTexto = labelCategoria.textContent.trim();
        }
        if (previewTagCat) {
            previewTagCat.textContent = catTexto.toUpperCase();
        }

        // Condição (prioriza chip ativo ou dropdown)
        let condTexto = 'USADO';
        const chipCondAtivo = document.querySelector('#chips-condicao-container .chip-opcao.ativo');
        if (chipCondAtivo) {
            condTexto = chipCondAtivo.getAttribute('data-valor') || chipCondAtivo.textContent.trim();
        } else if (labelCondicao && labelCondicao.textContent.trim() !== 'SELECIONAR CONDIÇÃO') {
            condTexto = labelCondicao.textContent.trim();
        }
        if (previewTagCond) {
            previewTagCond.textContent = condTexto.toUpperCase();
        }

        // Localização
        if (previewLocal && textoLocalizacao) {
            previewLocal.textContent = textoLocalizacao.textContent.trim() || 'Paulistana - 64750-000';
        }

        // Descrição
        if (previewDescricao) {
            const desc = textareaDesc?.value.trim();
            previewDescricao.textContent = desc || 'Nenhuma descrição adicionada.';
        }
    }

    function irParaEtapa(novaEtapa) {
        if (novaEtapa < 1 || novaEtapa > 4) return false;

        // Se estiver avançando, valida as informações da etapa anterior
        if (novaEtapa > etapaAtual) {
            // Validação ao sair da Etapa 2 (Detalhes)
            if (etapaAtual === 2 || (etapaAtual < 2 && novaEtapa > 2)) {
                const tit = inputTitulo?.value.trim() || '';
                if (tit.length < 3) {
                    exibirFeedback('O título do anúncio deve ter no mínimo 3 caracteres.');
                    if (etapaAtual !== 2) irParaEtapa(2);
                    inputTitulo?.focus();
                    return false;
                }
            }

            // Validação ao sair da Etapa 3 (Preço)
            if (etapaAtual === 3 || (etapaAtual < 3 && novaEtapa === 4)) {
                const precoRaw = inputPreco?.value.replace(/\D/g, '') || '0';
                const precoVal = parseFloat(precoRaw) / 100;
                if (precoVal <= 0) {
                    exibirFeedback('Por favor, informe um preço de venda válido.');
                    if (etapaAtual !== 3) irParaEtapa(3);
                    inputPreco?.focus();
                    return false;
                }
            }
        }

        etapaAtual = novaEtapa;

        // Atualiza painéis visíveis
        for (let i = 1; i <= 4; i++) {
            const painel = document.getElementById(`painel-etapa-${i}`);
            if (painel) {
                if (i === etapaAtual) {
                    painel.classList.add('etapa-ativa');
                } else {
                    painel.classList.remove('etapa-ativa');
                }
            }
        }

        // Atualiza a barra de progresso limpa no cabeçalho
        if (wizardEtapaBadge) {
            wizardEtapaBadge.textContent = `Etapa ${etapaAtual} de 4`;
        }
        if (wizardEtapaNome) {
            wizardEtapaNome.textContent = NOMES_ETAPAS[etapaAtual] || '';
        }
        if (wizardBarraProgresso) {
            wizardBarraProgresso.style.width = PORCENTAGEM_ETAPAS[etapaAtual] || '25%';
        }

        // Se chegou na etapa de revisão, atualiza os dados em tempo real
        if (etapaAtual === 4) {
            atualizarPreviewRevisao();
        }

        // Scroll suave até o topo do formulário
        window.scrollTo({ top: 100, behavior: 'smooth' });
        return true;
    }

    // Botões de Avançar e Voltar
    btnPasso1Proximo?.addEventListener('click', () => irParaEtapa(2));
    btnPasso2Anterior?.addEventListener('click', () => irParaEtapa(1));
    btnPasso2Proximo?.addEventListener('click', () => irParaEtapa(3));
    btnPasso3Anterior?.addEventListener('click', () => irParaEtapa(2));
    btnPasso3Proximo?.addEventListener('click', () => irParaEtapa(4));
    btnPasso4Anterior?.addEventListener('click', () => irParaEtapa(3));

    // Links de atalho "Editar" na etapa de revisão
    btnsEditarEtapaLink.forEach(link => {
        link.addEventListener('click', () => {
            const etapa = parseInt(link.getAttribute('data-ir-etapa'), 10);
            if (etapa) irParaEtapa(etapa);
        });
    });

    // ==========================================================================
    // 6. TRANSIÇÃO PARA TELA DE SUCESSO
    // ==========================================================================
    function alternarParaSucesso() {
        if (formCardsWrapper) {
            formCardsWrapper.style.opacity = '0';
            formCardsWrapper.style.transform = 'translateY(-15px)';
        }

        setTimeout(() => {
            if (formCardsWrapper) formCardsWrapper.style.display = 'none';
            telaSucesso?.classList.add('ativo');
            window.scrollTo({ top: 120, behavior: 'smooth' });
        }, 300);
    }

    function alternarParaFormulario() {
        telaSucesso?.classList.remove('ativo');
        if (formCardsWrapper) {
            formCardsWrapper.style.display = 'block';
            setTimeout(() => {
                formCardsWrapper.style.opacity = '1';
                formCardsWrapper.style.transform = 'translateY(0)';
            }, 50);
        }
        irParaEtapa(1);
    }

    let ultimoAnuncioCriadoId = null;

    // Mapeamento auxiliar de categorias
    const CATEGORIA_MAPA = {
        'veiculos': 1,
        'carros e motos': 1,
        'imoveis': 2,
        'imoveis & terrenos': 2,
        'eletronicos': 3,
        'celulares e smartphones': 3,
        'eletronicos e audio': 3,
        'computadores e informatica': 3,
        'informatica & pc': 3,
        'moda': 4,
        'moda e acessorios': 4,
        'moda e calcados': 4,
        'moveis': 5,
        'moveis e decoracao': 5,
        'moveis & casa': 5,
        'agro': 6,
        'esportes': 7,
        'esportes & lazer': 7,
        'infantil': 8,
        'infantil & brinquedos': 8,
        'games e brinquedos': 8,
        'servicos': 9,
        'servicos e trabalhos': 9,
        'servicos e negocios': 9,
        'outros': 10,
        'outros produtos': 10,
        'geral': 10
    };

    function obterCategoriaId(nome) {
        if (!nome) return 10;
        const limpo = nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
        for (const [chave, id] of Object.entries(CATEGORIA_MAPA)) {
            if (limpo.includes(chave) || chave.includes(limpo)) {
                return id;
            }
        }
        return 10;
    }

    function normalizarCondicao(texto) {
        const t = (texto || '').toUpperCase();
        if (t.includes('NOVO')) return 'NOVO';
        if (t.includes('EXCELENTE') || t.includes('SEMINOVO')) return 'SEMINOVO';
        if (t.includes('PEÇAS') || t.includes('PECAS') || t.includes('DEFEITO')) return 'DEFEITO';
        return 'USADO';
    }

    // ==========================================================================
    // 7. PUBLICAÇÃO FINAL DO ANÚNCIO (AO CLICAR NO BOTÃO DA ETAPA 4)
    // ==========================================================================
    btnAnunciar?.addEventListener('click', async () => {
        const titulo = inputTitulo?.value.trim();
        const precoRaw = inputPreco?.value.replace(/\D/g, '') || '0';
        const preco = parseFloat(precoRaw) / 100;
        let categoria = labelCategoria?.textContent.trim() || 'Geral';
        let condicao = labelCondicao?.textContent.trim() || 'Usado';
        const descricao = textareaDesc?.value.trim() || '';

        if (!categoria || categoria.toUpperCase() === 'CATEGORIA' || categoria.toUpperCase() === 'SELECIONAR CATEGORIA') {
            categoria = 'Geral';
        }

        if (!condicao || condicao.toUpperCase() === 'CONDIÇÃO' || condicao.toUpperCase() === 'SELECIONAR CONDIÇÃO') {
            condicao = 'Usado';
        }

        if (!titulo || titulo.length < 3) {
            exibirFeedback('O título do anúncio deve ter no mínimo 3 caracteres.');
            irParaEtapa(2);
            inputTitulo?.focus();
            return;
        }

        if (preco <= 0) {
            exibirFeedback('Por favor, defina um preço de venda válido.');
            irParaEtapa(3);
            inputPreco?.focus();
            return;
        }

        const descricaoFinal = (descricao && descricao.length >= 5) 
            ? descricao 
            : `${titulo} anunciado para venda no Itaim Vende.`;

        // Coleta fotos da lista dinâmica
        const fotosColetadas = [...fotosLista];

        // Estado de carregamento na interface
        btnAnunciar.classList.add('carregando');
        const spanTexto = btnAnunciar.querySelector('.texto-btn-anunciar');
        if (spanTexto) spanTexto.textContent = 'Publicando...';

        let cidadeAnuncio = 'Paulistana';
        let cepAnuncio = '64750-000';
        if (textoLocalizacao && textoLocalizacao.textContent) {
            const partes = textoLocalizacao.textContent.split('-');
            if (partes[0]) cidadeAnuncio = partes[0].trim();
            if (partes[1]) cepAnuncio = partes[1].trim();
        }

        let fotosUrlsBackend = [];

        // 1. Upload de fotos multipart para o Backend caso autenticado
        if (window.ItaimApi && fotosColetadas.length > 0 && window.ItaimApi.auth?.obterToken()) {
            try {
                if (spanTexto) spanTexto.textContent = 'Enviando fotos...';
                const uploadRes = await window.ItaimApi.upload.vendas(fotosColetadas);
                if (uploadRes && Array.isArray(uploadRes.urls) && uploadRes.urls.length > 0) {
                    fotosUrlsBackend = uploadRes.urls;
                }
            } catch (upErr) {
                console.warn('[Vender] Falha no upload multipart, usando armazenamento local:', upErr.message);
            }
        }

        let idCriado = null;

        // 2. Publica o anúncio na API central do Backend se autenticado
        if (window.ItaimApi && window.ItaimApi.auth?.obterToken()) {
            try {
                if (spanTexto) spanTexto.textContent = 'Salvando no banco...';
                const dadosPayload = {
                    title: titulo,
                    description: descricaoFinal,
                    price: isNaN(preco) ? 0 : preco,
                    categoryId: obterCategoriaId(categoria),
                    condition: normalizarCondicao(condicao),
                    city: cidadeAnuncio,
                    neighborhood: cepAnuncio,
                    images: fotosUrlsBackend.length > 0 ? fotosUrlsBackend : ['assets/placeholders/produto-placeholder.svg']
                };

                const resProduto = await window.ItaimApi.produtos.criar(dadosPayload);
                if (resProduto && resProduto.data && resProduto.data.id) {
                    idCriado = resProduto.data.id;
                }
            } catch (apiErr) {
                console.warn('[Vender] Falha na API do backend:', apiErr.message);
            }
        }

        // 3. Sincroniza localmente para fallback garantido e cache offline
        try {
            if (window.ItaimSessao && typeof window.ItaimSessao.adicionarNovoAnuncio === 'function') {
                const novoAnuncio = window.ItaimSessao.adicionarNovoAnuncio({
                    id: idCriado || undefined,
                    titulo: titulo,
                    preco: preco,
                    categoria: categoria,
                    condicao: condicao,
                    descricao: descricaoFinal,
                    cidade: cidadeAnuncio,
                    bairro: cepAnuncio,
                    imagens: fotosUrlsBackend.length > 0 
                        ? fotosUrlsBackend 
                        : (fotosColetadas.length > 0 ? fotosColetadas : ['assets/placeholders/produto-placeholder.svg'])
                });
                ultimoAnuncioCriadoId = idCriado || novoAnuncio.id;
            } else {
                ultimoAnuncioCriadoId = idCriado || Date.now();
            }

            btnAnunciar.classList.remove('carregando');
            if (spanTexto) spanTexto.textContent = 'Publicar Anúncio';
            alternarParaSucesso();
        } catch (err) {
            console.error('Erro ao anunciar:', err);
            btnAnunciar.classList.remove('carregando');
            if (spanTexto) spanTexto.textContent = 'Publicar Anúncio';
            exibirFeedback('Ocorreu um erro ao salvar o anúncio. Tente novamente.');
        }
    });

    function exibirFeedback(mensagem) {
        if (!feedbackValidacao) return;
        feedbackValidacao.textContent = mensagem;
        feedbackValidacao.classList.add('visivel');
        setTimeout(() => {
            feedbackValidacao.classList.remove('visivel');
        }, 4000);
    }

    // Clique para ver o anúncio publicado
    linkVerAnuncio?.addEventListener('click', (e) => {
        e.preventDefault();
        if (ultimoAnuncioCriadoId) {
            window.location.href = (window.ItaimRotas ? window.ItaimRotas.obterUrl('produto', `id=${ultimoAnuncioCriadoId}`) : `../produtos/produto.html?id=${ultimoAnuncioCriadoId}`);
        } else {
            window.location.href = (window.ItaimRotas ? window.ItaimRotas.obterUrl('home') : '../home/home.html');
        }
    });

    // Botão criar outro anúncio
    btnCriarOutro?.addEventListener('click', () => {
        if (inputTitulo) inputTitulo.value = '';
        if (textareaDesc) textareaDesc.value = '';
        if (inputPreco) inputPreco.value = '';
        if (contadorChar) contadorChar.textContent = '0 / 1000';
        
        // Limpa fotos da lista dinâmica
        fotosLista = [];
        renderizarGaleriaFotos();

        // Reseta chips
        chipsCategoria.forEach(c => c.classList.remove('ativo'));
        chipsCondicao.forEach(c => c.classList.remove('ativo'));
        if (labelCategoria) labelCategoria.textContent = 'SELECIONAR CATEGORIA';
        if (labelCondicao) labelCondicao.textContent = 'SELECIONAR CONDIÇÃO';

        alternarParaFormulario();
    });
});
