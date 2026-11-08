/**
 * ITAIM VENDE - VENDER: GESTÃO DINÂMICA DE FOTOS E UPLOAD
 * Arquivo: frontend/js/pages/vender/anuncio/vender-fotos.js
 */

(function () {
    'use strict';

    function getEstado() {
        return window.ItaimVenderEstado.estado;
    }

    const { exibirFeedback, validarFotos } = window.ItaimVenderEstado;

    let galeriaFotos = null;
    let btnAddFoto = null;
    let inputFotosUpload = null;
    let badgeContadorFotos = null;
    let feedbackFotos = null;

    function atualizarContadorFotos() {
        if (badgeContadorFotos) {
            badgeContadorFotos.textContent = `${getEstado().fotosLista.length} de 6 fotos`;
        }
    }

    function renderizarGaleriaFotos() {
        if (!galeriaFotos) return;

        // Limpa fotos anteriores mantendo o botão de adicionar
        galeriaFotos.querySelectorAll('.item-foto-preview').forEach(el => el.remove());

        const fotos = getEstado().fotosLista;

        fotos.forEach((fotoSrc, idx) => {
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
            btnAddFoto.style.display = fotos.length >= 6 ? 'none' : 'flex';
        }

        atualizarContadorFotos();

        if (feedbackFotos && fotos.length > 0) {
            feedbackFotos.style.display = 'none';
        }
    }

    function removerFotoPorIndice(index) {
        const fotos = getEstado().fotosLista;
        if (index >= 0 && index < fotos.length) {
            fotos.splice(index, 1);
            renderizarGaleriaFotos();

            if (window.ItaimVenderPublicacao?.atualizarPreviewRevisao && getEstado().etapaAtual === 4) {
                window.ItaimVenderPublicacao.atualizarPreviewRevisao();
            }
        }
    }

    function processarArquivoImagem(file) {
        return new Promise((resolve) => {
            if (window.ItaimFoto && typeof window.ItaimFoto.ajustarProduto === 'function') {
                window.ItaimFoto.ajustarProduto(
                    file,
                    (dataUrl) => resolve(dataUrl),
                    () => resolve(null)
                );
            } else if (window.ItaimFoto && typeof window.ItaimFoto.abrir === 'function') {
                window.ItaimFoto.abrir({
                    arquivo: file,
                    tipo: 'produto',
                    tamanho: 800,
                    aoSalvar: (dataUrl) => resolve(dataUrl),
                    aoCancelar: () => resolve(null)
                });
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
        const fotos = getEstado().fotosLista;
        const vagas = 6 - fotos.length;
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
            if (dataUrl && fotos.length < 6) {
                fotos.push(dataUrl);
            }
        }

        renderizarGaleriaFotos();
    }

    function inicializar() {
        galeriaFotos = document.getElementById('galeria-fotos-vender');
        btnAddFoto = document.getElementById('btn-add-foto');
        inputFotosUpload = document.getElementById('input-fotos-upload');
        badgeContadorFotos = document.getElementById('badge-contador-fotos');
        feedbackFotos = document.getElementById('feedback-fotos');

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

            // Drag and Drop
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
    }

    window.ItaimVenderFotos = {
        inicializar,
        renderizarGaleriaFotos,
        adicionarArquivosFotos,
        atualizarContadorFotos
    };
})();

