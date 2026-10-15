/**
 * ==========================================================================
 * ITAIM VENDE - LÓGICA DA PÁGINA "CRIAR ANÚNCIO / VENDER"
 * Uploads de fotos, máscaras, dropdowns customizados e transição de sucesso.
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

    // Localização
    const textoLocalizacao = document.getElementById('texto-localizacao');
    const btnEditarLoc = document.getElementById('btn-editar-localizacao');
    const modalLoc = document.getElementById('modal-localizacao');
    const btnFecharModalLoc = document.getElementById('btn-fechar-modal-loc');
    const btnSalvarLoc = document.getElementById('btn-salvar-loc');
    const selectCidade = document.getElementById('select-cidade-modal');
    const inputCep = document.getElementById('input-cep-modal');

    // Slots de fotos
    const slotsFoto = document.querySelectorAll('.slot-foto-upload');

    // Botões da Toolbar de Teste Rápido
    const btnTabForm = document.getElementById('btn-tab-form');
    const btnTabSucesso = document.getElementById('btn-tab-sucesso');

    // ==========================================================================
    // 1. SISTEMA SIMPLES DE UPLOAD E AJUSTE DE FOTOS (1:1 SEM ESPAÇOS CINZAS)
    // ==========================================================================
    slotsFoto.forEach((slot, index) => {
        const fileInput = slot.querySelector('input[type="file"]');
        const overlayRemover = slot.querySelector('.slot-overlay-remover');

        // Clique no slot aciona o input file se não clicou no botão de remover
        slot.addEventListener('click', (e) => {
            if (e.target === fileInput) return;
            if (e.target.closest('.slot-overlay-remover')) return;
            fileInput.click();
        });

        // Quando o usuário escolhe um arquivo
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                processarArquivoFoto(slot, file);
            }
        });

        // Eventos de Drag and Drop
        ['dragenter', 'dragover'].forEach(eventName => {
            slot.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                slot.classList.add('drag-over');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            slot.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                slot.classList.remove('drag-over');
            });
        });

        slot.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            if (files && files.length > 0) {
                const file = files[0];
                if (file.type.startsWith('image/')) {
                    fileInput.files = files;
                    processarArquivoFoto(slot, file);
                }
            }
        });

        // Botão para remover foto do slot
        overlayRemover?.addEventListener('click', (e) => {
            e.stopPropagation();
            removerFotoDoSlot(slot, fileInput);
        });
    });

    // Processa a foto com a API simples de ajuste (permite ao usuário enquadrar e cortar 1:1)
    function processarArquivoFoto(slot, file) {
        if (window.ItaimFoto && typeof window.ItaimFoto.ajustarProduto === 'function') {
            window.ItaimFoto.ajustarProduto(file, (dataUrlAjustada) => {
                renderizarFotoNoSlot(slot, dataUrlAjustada);
            });
        } else if (window.ItaimFoto && typeof window.ItaimFoto.ajustar === 'function') {
            window.ItaimFoto.ajustar(file, 800, (dataUrlAjustada) => {
                renderizarFotoNoSlot(slot, dataUrlAjustada);
            });
        } else {
            const reader = new FileReader();
            reader.onload = (e) => {
                renderizarFotoNoSlot(slot, e.target.result);
            };
            reader.readAsDataURL(file);
        }
    }

    // Aplica a imagem ajustada no slot com acabamento estético perfeito
    function renderizarFotoNoSlot(slot, dataUrl) {
        let img = slot.querySelector('.slot-preview-img');
        if (!img) {
            img = document.createElement('img');
            img.className = 'slot-preview-img';
            slot.prepend(img);
        }
        img.src = dataUrl;
        img.style.display = 'block';

        slot.classList.add('com-foto');

        // Oculta ícones e textos
        const icone = slot.querySelector('.icone-slot') || slot.querySelector('.icone-slot-plus');
        const rotulos = slot.querySelectorAll('.rotulo-slot, .subrotulo-slot');
        if (icone) icone.style.display = 'none';
        rotulos.forEach(r => r.style.display = 'none');

        // Exibe botão de remover
        const overlay = slot.querySelector('.slot-overlay-remover');
        if (overlay) overlay.style.display = 'flex';
    }

    function removerFotoDoSlot(slot, fileInput) {
        if (fileInput) fileInput.value = '';

        const img = slot.querySelector('.slot-preview-img');
        if (img) img.remove();

        slot.classList.remove('com-foto');

        const icone = slot.querySelector('.icone-slot') || slot.querySelector('.icone-slot-plus');
        const rotulos = slot.querySelectorAll('.rotulo-slot, .subrotulo-slot');
        if (icone) icone.style.display = '';
        rotulos.forEach(r => r.style.display = '');

        const overlay = slot.querySelector('.slot-overlay-remover');
        if (overlay) overlay.style.display = 'none';
    }

    // ==========================================================================
    // 2. MÁSCARA DINÂMICA DE PREÇO (R$ 0,00)
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

    // Contador de caracteres na descrição
    if (textareaDesc && contadorChar) {
        textareaDesc.addEventListener('input', () => {
            const tam = textareaDesc.value.length;
            contadorChar.textContent = `${tam} / 1000`;
        });
    }

    // ==========================================================================
    // 3. DROPDOWNS EM PÍLULA (CATEGORIA E CONDIÇÃO)
    // ==========================================================================
    function configurarDropdownPill(container, btn, label, menu) {
        if (!container || !btn || !menu) return;

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            // Fecha outros abertos
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
            });
        });
    }

    configurarDropdownPill(dropdownCategoria, btnDropdownCategoria, labelCategoria, menuCategoriaOpcoes);
    configurarDropdownPill(dropdownCondicao, btnDropdownCondicao, labelCondicao, menuCondicaoOpcoes);

    // Fecha dropdown ao clicar fora
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
    // 5. TRANSIÇÃO PARA TELA DE SUCESSO AO CLICAR EM "ANUNCIAR"
    // ==========================================================================
    function alternarParaSucesso() {
        formCardsWrapper.style.opacity = '0';
        formCardsWrapper.style.transform = 'translateY(-15px)';
        secaoAcao.style.opacity = '0';

        setTimeout(() => {
            formCardsWrapper.style.display = 'none';
            secaoAcao.style.display = 'none';
            telaSucesso.classList.add('ativo');

            // Scroll suave até o topo da tela
            window.scrollTo({ top: 120, behavior: 'smooth' });

            // Atualiza toolbar se existir
            btnTabForm?.classList.remove('ativo');
            btnTabSucesso?.classList.add('ativo');
        }, 300);
    }

    function alternarParaFormulario() {
        telaSucesso.classList.remove('ativo');
        formCardsWrapper.style.display = 'grid';
        secaoAcao.style.display = 'flex';

        setTimeout(() => {
            formCardsWrapper.style.opacity = '1';
            formCardsWrapper.style.transform = 'translateY(0)';
            secaoAcao.style.opacity = '1';

            btnTabForm?.classList.add('ativo');
            btnTabSucesso?.classList.remove('ativo');
        }, 50);
    }

    let ultimoAnuncioCriadoId = null;

    // Mapeamento auxiliar de categorias do formulário para IDs do banco de dados
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

    btnAnunciar?.addEventListener('click', async () => {
        // Validação simples dos campos
        const titulo = inputTitulo?.value.trim();
        const precoRaw = inputPreco?.value.replace(/\D/g, '') || '0';
        const preco = parseFloat(precoRaw) / 100;
        let categoria = labelCategoria?.textContent.trim() || 'Eletrônicos';
        let condicao = labelCondicao?.textContent.trim() || 'Usado';
        const descricao = textareaDesc?.value.trim() || '';

        // Se categoria ainda for o texto do botão inicial
        if (!categoria || categoria.toUpperCase() === 'CATEGORIA') {
            categoria = 'Geral';
        }

        // Se condição ainda for o texto do botão inicial
        if (!condicao || condicao.toUpperCase() === 'CONDIÇÃO') {
            condicao = 'Usado';
        }

        if (!titulo || titulo.length < 3) {
            exibirFeedback('O título do anúncio deve ter no mínimo 3 caracteres.');
            inputTitulo?.focus();
            inputTitulo?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        // Descrição mínima de segurança para o Zod / Banco
        const descricaoFinal = (descricao && descricao.length >= 5) 
            ? descricao 
            : `${titulo} anunciado para venda no Itaim Vende.`;

        // Coleta fotos carregadas nos slots
        const fotosColetadas = [];
        slotsFoto.forEach(slot => {
            const img = slot.querySelector('.slot-preview-img');
            if (img && img.src) {
                fotosColetadas.push(img.src);
            }
        });

        // Estado de carregamento na interface
        btnAnunciar.classList.add('carregando');
        const spanTexto = btnAnunciar.querySelector('.texto-btn-anunciar');
        if (spanTexto) spanTexto.textContent = 'PUBLICANDO...';

        let cidadeAnuncio = 'Paulistana';
        let cepAnuncio = '64750-000';
        if (textoLocalizacao && textoLocalizacao.textContent) {
            const partes = textoLocalizacao.textContent.split('-');
            if (partes[0]) cidadeAnuncio = partes[0].trim();
            if (partes[1]) cepAnuncio = partes[1].trim();
        }

        let fotosUrlsBackend = [];

        // 1. Tenta upload de fotos reais no Backend se houver conexão e token
        if (window.ItaimApi && fotosColetadas.length > 0 && window.ItaimApi.auth.obterToken()) {
            try {
                if (spanTexto) spanTexto.textContent = 'ENVIANDO FOTOS...';
                const uploadRes = await window.ItaimApi.upload.vendas(fotosColetadas);
                if (uploadRes && Array.isArray(uploadRes.urls) && uploadRes.urls.length > 0) {
                    fotosUrlsBackend = uploadRes.urls;
                }
            } catch (upErr) {
                console.warn('[Vender] Falha no upload multipart para o backend, mantendo fotos locais:', upErr.message);
            }
        }

        let idCriado = null;

        // 2. Publica o anúncio na API central do Backend se autenticado
        if (window.ItaimApi && window.ItaimApi.auth.obterToken()) {
            try {
                if (spanTexto) spanTexto.textContent = 'SALVANDO NO BANCO...';
                const dadosPayload = {
                    title: titulo,
                    description: descricaoFinal,
                    price: isNaN(preco) ? 0 : preco,
                    categoryId: obterCategoriaId(categoria),
                    condition: normalizarCondicao(condicao),
                    city: cidadeAnuncio,
                    neighborhood: cepAnuncio,
                    images: fotosUrlsBackend.length > 0 ? fotosUrlsBackend : ['assets/images/produtos/anuncio_11.jpg']
                };

                const resProduto = await window.ItaimApi.produtos.criar(dadosPayload);
                if (resProduto && resProduto.data && resProduto.data.id) {
                    idCriado = resProduto.data.id;
                }
            } catch (apiErr) {
                console.warn('[Vender] Falha ao salvar produto na API do backend:', apiErr.message);
            }
        }

        // 3. Sincroniza também localmente como cache offline e fallback garantido
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
                        : (fotosColetadas.length > 0 ? fotosColetadas : ['assets/produtos/anuncio_11.jpg'])
                });
                ultimoAnuncioCriadoId = idCriado || novoAnuncio.id;
            } else {
                ultimoAnuncioCriadoId = idCriado || Date.now();
            }

            btnAnunciar.classList.remove('carregando');
            if (spanTexto) spanTexto.textContent = 'ANUNCIAR';
            alternarParaSucesso();
        } catch (err) {
            console.error('Erro ao anunciar:', err);
            btnAnunciar.classList.remove('carregando');
            if (spanTexto) spanTexto.textContent = 'ANUNCIAR';
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
        // Limpa inputs
        if (inputTitulo) inputTitulo.value = '';
        if (textareaDesc) textareaDesc.value = '';
        if (inputPreco) inputPreco.value = '';
        if (contadorChar) contadorChar.textContent = '0 / 1000';
        alternarParaFormulario();
    });

    // Toolbar de visualização rápida (para demonstração)
    btnTabForm?.addEventListener('click', alternarParaFormulario);
    btnTabSucesso?.addEventListener('click', alternarParaSucesso);

    // Header e Menu Lateral (Drawer) são gerenciados de forma centralizada e global por sessao.js
});
