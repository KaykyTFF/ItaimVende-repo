/**
 * ITAIM VENDE - VENDER: REVISÃO, PUBLICAÇÃO E MODO DE EDIÇÃO
 * Arquivo: frontend/js/pages/vender/anuncio/vender-publicacao.js
 */

(function () {
    'use strict';

    function getEstado() {
        return window.ItaimVenderEstado.estado;
    }

    const {
        obterCategoriaId,
        normalizarCondicao,
        exibirFeedback,
        validarFotos,
        PADROES_SUSPEITOS
    } = window.ItaimVenderEstado;

    let inicializado = false;

    let previewFotoCapa = null;
    let previewFotosMiniaturas = null;
    let previewBtnPrev = null;
    let previewBtnNext = null;
    let previewBadgeContador = null;
    let fotoRevisaoAtualIndex = 0;

    let previewTitulo = null;
    let previewPreco = null;
    let previewTagCat = null;
    let previewTagCond = null;
    let previewLocal = null;
    let previewDescricao = null;

    let btnAnunciar = null;
    let formCardsWrapper = null;
    let telaSucesso = null;
    let linkVerAnuncio = null;
    let btnCriarOutro = null;

    /**
     * Alterna a imagem principal do preview da revisão sincronizando contador e miniaturas
     */
    function exibirFotoRevisao(idx) {
        const est = getEstado();
        const fotos = est.fotosLista || [];

        if (!fotos || fotos.length === 0) {
            if (previewFotoCapa) previewFotoCapa.src = '../../assets/placeholders/produto-placeholder.svg';
            if (previewBtnPrev) previewBtnPrev.style.display = 'none';
            if (previewBtnNext) previewBtnNext.style.display = 'none';
            if (previewBadgeContador) previewBadgeContador.style.display = 'none';
            if (previewFotosMiniaturas) previewFotosMiniaturas.style.display = 'none';
            return;
        }

        fotoRevisaoAtualIndex = (idx + fotos.length) % fotos.length;

        if (previewFotoCapa) {
            previewFotoCapa.src = fotos[fotoRevisaoAtualIndex];
        }

        if (fotos.length > 1) {
            if (previewBtnPrev) previewBtnPrev.style.display = 'flex';
            if (previewBtnNext) previewBtnNext.style.display = 'flex';
            if (previewBadgeContador) {
                previewBadgeContador.textContent = `${fotoRevisaoAtualIndex + 1} / ${fotos.length}`;
                previewBadgeContador.style.display = 'inline-flex';
            }
            if (previewFotosMiniaturas) previewFotosMiniaturas.style.display = 'flex';
        } else {
            if (previewBtnPrev) previewBtnPrev.style.display = 'none';
            if (previewBtnNext) previewBtnNext.style.display = 'none';
            if (previewBadgeContador) previewBadgeContador.style.display = 'none';
            if (previewFotosMiniaturas) previewFotosMiniaturas.style.display = 'none';
        }

        // Sincroniza destaque nas miniaturas
        if (previewFotosMiniaturas) {
            const thumbs = previewFotosMiniaturas.querySelectorAll('.preview-thumb-item, .preview-miniatura-item');
            thumbs.forEach((t, i) => {
                if (i === fotoRevisaoAtualIndex) {
                    t.classList.add('ativa');
                } else {
                    t.classList.remove('ativa');
                }
            });
        }
    }

    function atualizarPreviewRevisao() {
        const est = getEstado();
        const fotos = est.fotosLista || [];

        // Inicializa ou limpa miniaturas
        if (previewFotosMiniaturas) {
            previewFotosMiniaturas.innerHTML = '';
            if (fotos.length > 1) {
                previewFotosMiniaturas.style.display = 'flex';
                fotos.forEach((fotoSrc, idx) => {
                    const thumb = document.createElement('div');
                    thumb.className = 'preview-thumb-item' + (idx === 0 ? ' ativa' : '');
                    thumb.innerHTML = `<img src="${fotoSrc}" alt="Miniatura ${idx + 1}">`;
                    thumb.addEventListener('click', (e) => {
                        e.stopPropagation();
                        exibirFotoRevisao(idx);
                    });
                    previewFotosMiniaturas.appendChild(thumb);
                });
            } else {
                previewFotosMiniaturas.style.display = 'none';
            }
        }

        exibirFotoRevisao(0);

        // Título
        const inputTitulo = document.getElementById('input-titulo');
        if (previewTitulo) {
            previewTitulo.textContent = inputTitulo?.value.trim() || 'Título não informado';
        }

        // Preço
        const inputPreco = document.getElementById('input-preco');
        if (previewPreco) {
            if (est.isModoDoacao) {
                previewPreco.innerHTML = '<span style="color: #44BD32; font-weight: 800;">Doação</span>';
            } else {
                previewPreco.textContent = inputPreco?.value.trim() || 'R$ 0,00';
            }
        }

        // Categoria
        const labelCategoria = document.getElementById('label-categoria-texto') || document.getElementById('label-cat-selecionada');
        let catTexto = 'GERAL';
        if (labelCategoria && labelCategoria.textContent.trim().toUpperCase() !== 'SELECIONAR CATEGORIA') {
            catTexto = labelCategoria.textContent.trim();
        }
        if (previewTagCat) {
            previewTagCat.textContent = catTexto.toUpperCase();
        }

        // Condição
        const labelCondicao = document.getElementById('label-condicao-texto') || document.getElementById('label-cond-selecionada');
        let condTexto = 'USADO';
        if (labelCondicao && labelCondicao.textContent.trim().toUpperCase() !== 'SELECIONAR CONDIÇÃO') {
            condTexto = labelCondicao.textContent.trim();
        }
        if (previewTagCond) {
            previewTagCond.textContent = condTexto.toUpperCase();
        }

        // Localização
        const textoLocalizacao = document.getElementById('texto-localizacao');
        if (previewLocal && textoLocalizacao) {
            previewLocal.textContent = textoLocalizacao.textContent.trim() || 'Paulistana - Centro';
        }

        // Descrição
        const textareaDesc = document.getElementById('textarea-descricao') || document.getElementById('textarea-desc');
        if (previewDescricao) {
            const desc = textareaDesc?.value.trim();
            previewDescricao.textContent = desc || 'Nenhuma descrição adicionada.';
        }
    }

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

    async function executarPublicacao() {
        const est = getEstado();

        if (!validarFotos()) {
            window.ItaimVenderWizard.irParaEtapa(1);
            exibirFeedback('Adicione pelo menos 1 foto do produto para publicar o anúncio.');
            return;
        }

        const inputTitulo = document.getElementById('input-titulo');
        const inputPreco = document.getElementById('input-preco');
        const labelCategoria = document.getElementById('label-categoria-texto') || document.getElementById('label-cat-selecionada');
        const labelCondicao = document.getElementById('label-condicao-texto') || document.getElementById('label-cond-selecionada');
        const textareaDesc = document.getElementById('textarea-descricao') || document.getElementById('textarea-desc');
        const textoLocalizacao = document.getElementById('texto-localizacao');

        const titulo = inputTitulo?.value.trim();
        let preco = 0;
        let listingType = 'VENDA';

        if (est.isModoDoacao) {
            preco = 0;
            listingType = 'DOACAO';
        } else {
            const precoRaw = inputPreco?.value.replace(/\D/g, '') || '0';
            preco = parseFloat(precoRaw) / 100;
        }

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
            window.ItaimVenderWizard.irParaEtapa(2);
            inputTitulo?.focus();
            return;
        }

        if (PADROES_SUSPEITOS.test(titulo)) {
            exibirFeedback('Por segurança contra fraudes, o título não pode conter links externos ou encurtadores.');
            window.ItaimVenderWizard.irParaEtapa(2);
            inputTitulo?.focus();
            return;
        }

        if (PADROES_SUSPEITOS.test(descricao)) {
            exibirFeedback('Por segurança contra golpes e phishing, a descrição não pode conter links externos ou encurtadores.');
            window.ItaimVenderWizard.irParaEtapa(2);
            textareaDesc?.focus();
            return;
        }

        if (!est.isModoDoacao && preco <= 0) {
            exibirFeedback('Por favor, defina um preço de venda válido ou selecione "Doação".');
            window.ItaimVenderWizard.irParaEtapa(3);
            inputPreco?.focus();
            return;
        }

        const descricaoFinal = (descricao && descricao.length >= 5) 
            ? descricao 
            : (est.isModoDoacao ? `${titulo} anunciado para doação no Itaim Vende.` : `${titulo} anunciado para venda no Itaim Vende.`);

        const fotosColetadas = [...est.fotosLista];

        btnAnunciar.classList.add('carregando');
        const spanTexto = btnAnunciar.querySelector('.texto-btn-anunciar');
        if (spanTexto) spanTexto.textContent = 'Publicando...';

        let cidadeAnuncio = 'Paulistana';
        let bairroAnuncio = 'Centro';
        if (textoLocalizacao && textoLocalizacao.textContent) {
            const partes = textoLocalizacao.textContent.split('-');
            if (partes[0]) cidadeAnuncio = partes[0].trim();
            if (partes[1]) bairroAnuncio = partes[1].trim();
        }
        if (!bairroAnuncio || /^\d/.test(bairroAnuncio) || /\d{5}/.test(bairroAnuncio)) {
            bairroAnuncio = 'Centro';
        }

        let fotosUrlsBackend = [];

        // Upload de fotos multipart se autenticado
        if (window.ItaimApi && fotosColetadas.length > 0 && window.ItaimApi.auth?.obterToken()) {
            try {
                if (spanTexto) spanTexto.textContent = 'Enviando fotos...';
                const uploadRes = await window.ItaimApi.upload.vendas(fotosColetadas);
                if (uploadRes && Array.isArray(uploadRes.urls) && uploadRes.urls.length > 0) {
                    fotosUrlsBackend = uploadRes.urls;
                }
            } catch (upErr) {
                console.warn('[Vender Publicação] Falha no upload multipart, usando local:', upErr.message);
            }
        }

        // MODO DE EDIÇÃO
        if (est.modoEdicao) {
            if (window.ItaimApi && window.ItaimApi.auth?.obterToken()) {
                try {
                    if (spanTexto) spanTexto.textContent = 'Salvando alterações...';
                    const dadosPayload = {
                        title: titulo,
                        description: descricaoFinal,
                        price: isNaN(preco) ? 0 : preco,
                        listingType: listingType,
                        categoryId: obterCategoriaId(categoria),
                        condition: normalizarCondicao(condicao),
                        city: cidadeAnuncio,
                        neighborhood: bairroAnuncio,
                        images: fotosUrlsBackend.length > 0 ? fotosUrlsBackend : (fotosColetadas.length > 0 ? fotosColetadas : ['assets/placeholders/produto-placeholder.svg'])
                    };

                    await window.ItaimApi.produtos.atualizar(est.idEdicao, dadosPayload);
                } catch (apiErr) {
                    console.warn('[Vender Publicação] Falha na API ao atualizar:', apiErr.message);
                }
            }

            if (window.ItaimSessao && typeof window.ItaimSessao.atualizarAnuncio === 'function') {
                window.ItaimSessao.atualizarAnuncio(est.idEdicao, {
                    titulo: titulo,
                    preco: preco,
                    listingType: listingType,
                    isDoacao: est.isModoDoacao,
                    categoria: categoria,
                    condicao: condicao,
                    descricao: descricaoFinal,
                    cidade: cidadeAnuncio,
                    bairro: bairroAnuncio,
                    imagens: fotosUrlsBackend.length > 0 
                        ? fotosUrlsBackend 
                        : (fotosColetadas.length > 0 ? fotosColetadas : ['assets/placeholders/produto-placeholder.svg'])
                });
            }

            est.ultimoAnuncioCriadoId = est.idEdicao;
            btnAnunciar.classList.remove('carregando');
            if (spanTexto) spanTexto.textContent = 'Salvar Alterações';
            alternarParaSucesso();
            return;
        }

        // MODO DE CRIAÇÃO
        let idCriado = null;

        if (window.ItaimApi && window.ItaimApi.auth?.obterToken()) {
            try {
                if (spanTexto) spanTexto.textContent = 'Publicando...';
                const dadosPayload = {
                    title: titulo,
                    description: descricaoFinal,
                    price: isNaN(preco) ? 0 : preco,
                    listingType: listingType,
                    categoryId: obterCategoriaId(categoria),
                    condition: normalizarCondicao(condicao),
                    city: cidadeAnuncio,
                    neighborhood: bairroAnuncio,
                    images: fotosUrlsBackend.length > 0 ? fotosUrlsBackend : ['assets/placeholders/produto-placeholder.svg']
                };

                const resProduto = await window.ItaimApi.produtos.criar(dadosPayload);
                if (resProduto && resProduto.data && resProduto.data.id) {
                    idCriado = resProduto.data.id;
                }
            } catch (apiErr) {
                console.warn('[Vender Publicação] Falha na API do backend:', apiErr.message);
            }
        }

        try {
            if (window.ItaimSessao && typeof window.ItaimSessao.adicionarNovoAnuncio === 'function') {
                const novoAnuncio = window.ItaimSessao.adicionarNovoAnuncio({
                    id: idCriado || undefined,
                    titulo: titulo,
                    preco: preco,
                    listingType: listingType,
                    isDoacao: est.isModoDoacao,
                    categoria: categoria,
                    condicao: condicao,
                    descricao: descricaoFinal,
                    cidade: cidadeAnuncio,
                    bairro: bairroAnuncio,
                    imagens: fotosUrlsBackend.length > 0 
                        ? fotosUrlsBackend 
                        : (fotosColetadas.length > 0 ? fotosColetadas : ['assets/placeholders/produto-placeholder.svg'])
                });
                est.ultimoAnuncioCriadoId = idCriado || novoAnuncio.id;
            } else {
                est.ultimoAnuncioCriadoId = idCriado || Date.now();
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
    }

    async function carregarDadosParaEdicao(id) {
        if (!id) return;
        let produto = null;

        if (window.ItaimApi && window.ItaimApi.produtos && typeof window.ItaimApi.produtos.obter === 'function') {
            try {
                const res = await window.ItaimApi.produtos.obter(id);
                if (res && res.success && res.data) {
                    produto = res.data;
                }
            } catch (err) {
                console.warn('[Vender Edição] Falha ao obter anúncio na API:', err.message);
            }
        }

        if (!produto && window.ItaimSessao && typeof window.ItaimSessao.obterTodosProdutos === 'function') {
            const todos = window.ItaimSessao.obterTodosProdutos(false);
            produto = todos.find(p => String(p.id) === String(id));
        }

        if (!produto) {
            try {
                const locais = JSON.parse(localStorage.getItem('itaim_produtos_cadastrados') || '[]');
                produto = locais.find(p => String(p.id) === String(id));
            } catch (e) {}
        }

        if (!produto) return;

        // Validação de Dono do Anúncio
        const userLogado = (window.ItaimSessao && typeof window.ItaimSessao.obterUsuarioLogado === 'function')
            ? window.ItaimSessao.obterUsuarioLogado()
            : null;
        const meuEmail = userLogado?.email?.toLowerCase()?.trim();
        const meuId = userLogado?.id;
        const vendedorId = produto.sellerId || produto.vendedorId || produto.seller?.id;
        const vendedorEmail = (produto.vendedorEmail || produto.seller?.email || '')?.toLowerCase()?.trim();

        const isDono = !userLogado 
            ? true 
            : ((meuId && vendedorId && String(meuId) === String(vendedorId))
               || (meuEmail && vendedorEmail && meuEmail === vendedorEmail)
               || userLogado?.role === 'ADMIN');

        if (!isDono) {
            exibirFeedback('Você não tem permissão para editar este anúncio porque pertence a outro vendedor.');
            setTimeout(() => {
                window.location.href = window.ItaimRotas ? window.ItaimRotas.obterUrl('meus-anuncios') : 'meus-anuncios.html';
            }, 2500);
            return;
        }

        // Validação Anti-Fraude: Anúncios Vendidos ou Arquivados
        const statusUpper = (produto.status || '').toUpperCase();
        if (statusUpper === 'VENDIDO') {
            exibirFeedback('Este anúncio foi marcado como Vendido e não pode ser editado para resguardar o histórico da transação.');
            setTimeout(() => {
                window.location.href = window.ItaimRotas ? window.ItaimRotas.obterUrl('meus-anuncios') : 'meus-anuncios.html';
            }, 2800);
            return;
        }
        if (statusUpper === 'ARQUIVADO' || produto.deletedAt) {
            exibirFeedback('Este anúncio foi arquivado ou excluído e não pode ser alterado.');
            setTimeout(() => {
                window.location.href = window.ItaimRotas ? window.ItaimRotas.obterUrl('meus-anuncios') : 'meus-anuncios.html';
            }, 2500);
            return;
        }

        // Preenche formulário
        const inputTitulo = document.getElementById('input-titulo');
        const inputPreco = document.getElementById('input-preco');
        const textareaDesc = document.getElementById('textarea-descricao') || document.getElementById('textarea-desc');
        const contadorCaracteres = document.getElementById('contador-desc') || document.getElementById('contador-caracteres');
        const labelCategoria = document.getElementById('label-categoria-texto') || document.getElementById('label-cat-selecionada');
        const menuCategoriaOpcoes = document.getElementById('menu-categoria-opcoes') || document.getElementById('menu-cat-opcoes');
        const labelCondicao = document.getElementById('label-condicao-texto') || document.getElementById('label-cond-selecionada');
        const menuCondicaoOpcoes = document.getElementById('menu-condicao-opcoes') || document.getElementById('menu-cond-opcoes');
        const textoLocalizacao = document.getElementById('texto-localizacao');
        const selectCidade = document.getElementById('select-cidade-modal');
        const inputBairro = document.getElementById('input-bairro-modal') || document.getElementById('input-cep-modal');

        if (inputTitulo) {
            inputTitulo.value = produto.titulo || produto.title || '';
        }

        if (textareaDesc) {
            textareaDesc.value = produto.descricao || produto.description || '';
            if (contadorCaracteres) {
                const maxChars = parseInt(textareaDesc.getAttribute('maxlength'), 10) || 1000;
                contadorCaracteres.textContent = `${textareaDesc.value.length} / ${maxChars}`;
            }
        }

        if (produto.listingType === 'DOACAO' || produto.isDoacao || Number(produto.preco !== undefined ? produto.preco : produto.price) === 0) {
            window.ItaimVenderWizard.definirModoDoacao(true);
        } else {
            window.ItaimVenderWizard.definirModoDoacao(false);
            if (inputPreco) {
                const num = Number(produto.preco !== undefined ? produto.preco : produto.price) || 0;
                inputPreco.value = num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            }
        }

        const catNome = produto.categoria || (produto.category && produto.category.name) || 'Geral';
        if (labelCategoria) {
            labelCategoria.textContent = catNome;
            if (menuCategoriaOpcoes) {
                menuCategoriaOpcoes.querySelectorAll('.item-opcao-dropdown, .dropdown-item').forEach(item => {
                    const val = item.textContent.trim().toLowerCase();
                    const dataVal = (item.getAttribute('data-valor') || '').trim().toLowerCase();
                    const match = val === catNome.toLowerCase() || dataVal === catNome.toLowerCase() || catNome.toLowerCase().includes(val) || val.includes(catNome.toLowerCase());
                    item.classList.toggle('selecionado', match);
                });
            }
        }

        const condNome = produto.condicao || produto.condition || 'Usado';
        if (labelCondicao) {
            labelCondicao.textContent = condNome;
            if (menuCondicaoOpcoes) {
                menuCondicaoOpcoes.querySelectorAll('.item-opcao-dropdown, .dropdown-item').forEach(item => {
                    const val = item.textContent.trim().toLowerCase();
                    const dataVal = (item.getAttribute('data-valor') || '').trim().toLowerCase();
                    const match = val === condNome.toLowerCase() || dataVal === condNome.toLowerCase() || condNome.toLowerCase().includes(val);
                    item.classList.toggle('selecionado', match);
                });
            }
        }

        const cid = produto.cidade || produto.city || 'Paulistana';
        let cepBairro = produto.bairro || produto.neighborhood || 'Centro';
        if (!cepBairro || /^\d/.test(cepBairro) || /\d{5}/.test(cepBairro)) cepBairro = 'Centro';
        if (textoLocalizacao) {
            textoLocalizacao.textContent = `${cid} - ${cepBairro}`;
        }
        if (selectCidade) selectCidade.value = cid;
        if (inputBairro) inputBairro.value = cepBairro;

        const rawFotos = Array.isArray(produto.images) && produto.images.length > 0
            ? produto.images
            : (Array.isArray(produto.fotos) && produto.fotos.length > 0
                ? produto.fotos
                : (produto.imagem ? [produto.imagem] : []));

        getEstado().fotosLista = rawFotos.map(img => (window.ItaimApi && typeof window.ItaimApi.resolverUrlImagem === 'function') ? window.ItaimApi.resolverUrlImagem(img) : img);
        window.ItaimVenderFotos.renderizarGaleriaFotos();
    }

    function inicializar() {
        if (inicializado) return;
        inicializado = true;

        previewFotoCapa = document.getElementById('preview-foto-capa');
        previewFotosMiniaturas = document.getElementById('preview-fotos-miniaturas');
        previewBtnPrev = document.getElementById('preview-btn-prev');
        previewBtnNext = document.getElementById('preview-btn-next');
        previewBadgeContador = document.getElementById('preview-badge-contador');

        // Se por ventura os controles não estiverem pré-renderizados no DOM, injeta dinamicamente
        const wrapperFoto = previewFotoCapa?.parentElement;
        if (wrapperFoto) {
            if (!previewBtnPrev) {
                previewBtnPrev = document.createElement('button');
                previewBtnPrev.type = 'button';
                previewBtnPrev.className = 'preview-seta-nav preview-seta-prev';
                previewBtnPrev.id = 'preview-btn-prev';
                previewBtnPrev.setAttribute('aria-label', 'Foto anterior');
                previewBtnPrev.style.display = 'none';
                previewBtnPrev.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                `;
                wrapperFoto.appendChild(previewBtnPrev);
            }

            if (!previewBtnNext) {
                previewBtnNext = document.createElement('button');
                previewBtnNext.type = 'button';
                previewBtnNext.className = 'preview-seta-nav preview-seta-next';
                previewBtnNext.id = 'preview-btn-next';
                previewBtnNext.setAttribute('aria-label', 'Próxima foto');
                previewBtnNext.style.display = 'none';
                previewBtnNext.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                `;
                wrapperFoto.appendChild(previewBtnNext);
            }

            if (!previewBadgeContador) {
                previewBadgeContador = document.createElement('span');
                previewBadgeContador.className = 'preview-badge-contador';
                previewBadgeContador.id = 'preview-badge-contador';
                previewBadgeContador.style.display = 'none';
                wrapperFoto.appendChild(previewBadgeContador);
            }
        }

        previewBtnPrev?.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            exibirFotoRevisao(fotoRevisaoAtualIndex - 1);
        });

        previewBtnNext?.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            exibirFotoRevisao(fotoRevisaoAtualIndex + 1);
        });

        previewTitulo = document.getElementById('preview-titulo');
        previewPreco = document.getElementById('preview-preco');
        previewTagCat = document.getElementById('preview-tag-cat');
        previewTagCond = document.getElementById('preview-tag-cond');
        previewLocal = document.getElementById('preview-local');
        previewDescricao = document.getElementById('preview-descricao');

        btnAnunciar = document.getElementById('btn-anunciar');
        formCardsWrapper = document.getElementById('vender-cards-wrapper');
        telaSucesso = document.getElementById('tela-sucesso-container');
        linkVerAnuncio = document.getElementById('link-ver-anuncio');
        btnCriarOutro = document.getElementById('btn-criar-outro');

        btnAnunciar?.addEventListener('click', executarPublicacao);

        linkVerAnuncio?.addEventListener('click', (e) => {
            e.preventDefault();
            const est = getEstado();
            if (est.ultimoAnuncioCriadoId) {
                window.location.href = window.ItaimRotas ? window.ItaimRotas.obterUrl('produto', `id=${est.ultimoAnuncioCriadoId}`) : `../produtos/produto.html?id=${est.ultimoAnuncioCriadoId}`;
            } else {
                window.location.href = window.ItaimRotas ? window.ItaimRotas.obterUrl('home') : '../home/home.html';
            }
        });

        btnCriarOutro?.addEventListener('click', () => {
            const inputTitulo = document.getElementById('input-titulo');
            const inputPreco = document.getElementById('input-preco');
            const textareaDesc = document.getElementById('textarea-descricao') || document.getElementById('textarea-desc');
            const contadorCaracteres = document.getElementById('contador-desc') || document.getElementById('contador-caracteres');
            const labelCategoria = document.getElementById('label-categoria-texto') || document.getElementById('label-cat-selecionada');
            const labelCondicao = document.getElementById('label-condicao-texto') || document.getElementById('label-cond-selecionada');
            const menuCategoriaOpcoes = document.getElementById('menu-categoria-opcoes') || document.getElementById('menu-cat-opcoes');
            const menuCondicaoOpcoes = document.getElementById('menu-condicao-opcoes') || document.getElementById('menu-cond-opcoes');

            if (inputTitulo) inputTitulo.value = '';
            if (inputPreco) inputPreco.value = '';
            if (textareaDesc) {
                textareaDesc.value = '';
                if (contadorCaracteres) {
                    const maxChars = parseInt(textareaDesc.getAttribute('maxlength'), 10) || 1000;
                    contadorCaracteres.textContent = `0 / ${maxChars}`;
                }
            }

            if (labelCategoria) labelCategoria.textContent = 'Selecionar Categoria';
            if (labelCondicao) labelCondicao.textContent = 'Selecionar Condição';
            if (menuCategoriaOpcoes) {
                menuCategoriaOpcoes.querySelectorAll('.item-opcao-dropdown, .dropdown-item').forEach(i => i.classList.remove('selecionado'));
            }
            if (menuCondicaoOpcoes) {
                menuCondicaoOpcoes.querySelectorAll('.item-opcao-dropdown, .dropdown-item').forEach(i => i.classList.remove('selecionado'));
            }

            fotoRevisaoAtualIndex = 0;
            getEstado().fotosLista = [];
            window.ItaimVenderFotos.renderizarGaleriaFotos();
            window.ItaimVenderWizard.definirModoDoacao(false);

            if (telaSucesso) telaSucesso.classList.remove('ativo');
            if (formCardsWrapper) {
                formCardsWrapper.style.display = 'block';
                setTimeout(() => {
                    formCardsWrapper.style.opacity = '1';
                    formCardsWrapper.style.transform = 'translateY(0)';
                }, 50);
            }
            window.ItaimVenderWizard.irParaEtapa(1);
        });

        // Detecção de Modo de Edição (?editar=:id ou ?id=:id)
        const urlParams = new URLSearchParams(window.location.search);
        const idEdicao = urlParams.get('editar') || urlParams.get('id');

        if (idEdicao) {
            getEstado().modoEdicao = true;
            getEstado().idEdicao = idEdicao;

            document.title = 'Editar Anúncio - Itaim Vende';
            const tit = document.querySelector('.vender-titulo-pagina');
            if (tit) tit.textContent = 'Editar Anúncio';
            const spanTxt = btnAnunciar?.querySelector('.texto-btn-anunciar');
            if (spanTxt) spanTxt.textContent = 'Salvar Alterações';

            carregarDadosParaEdicao(idEdicao);
        }
    }

    window.ItaimVenderPublicacao = {
        inicializar,
        atualizarPreviewRevisao,
        carregarDadosParaEdicao,
        alternarParaSucesso,
        executarPublicacao
    };
})();

