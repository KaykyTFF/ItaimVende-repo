/**
 * ITAIM VENDE - PRODUTO: CARROSSEL E GALERIA DE FOTOS (COM VISUALIZADOR EM TELA CHEIA)
 * Arquivo: frontend/js/pages/produtos/produto/produto-galeria.js
 */

(function () {
    'use strict';

    function inicializar() {
        const produto = window.ItaimProdutoDados?.obterProduto();
        if (!produto) return;

        let fotosCarrossel = [];
        const placeholderAsset = (window.ItaimRotas && typeof window.ItaimRotas.obterAsset === 'function')
            ? window.ItaimRotas.obterAsset('assets/placeholders/produto-placeholder.svg')
            : '../../assets/placeholders/produto-placeholder.svg';

        if (Array.isArray(produto.fotos) && produto.fotos.length > 0) {
            fotosCarrossel = [...produto.fotos];
        } else if (Array.isArray(produto.images) && produto.images.length > 0) {
            fotosCarrossel = [...produto.images];
        } else if (produto.imagem) {
            fotosCarrossel = [produto.imagem];
        } else {
            fotosCarrossel = [placeholderAsset];
        }

        if (window.ItaimApi && typeof window.ItaimApi.resolverUrlImagem === 'function') {
            fotosCarrossel = fotosCarrossel.map(src => window.ItaimApi.resolverUrlImagem(src));
        }

        let fotoAtualIndex = 0;
        const fotoDisplay = document.getElementById('foto-principal-img');
        if (fotoDisplay) {
            fotoDisplay.onerror = function() {
                this.onerror = null;
                this.src = placeholderAsset;
            };
        }
        const contadorTexto = document.getElementById('contador-fotos-texto');
        const btnCarrosselPrev = document.getElementById('btn-carrossel-prev');
        const btnCarrosselNext = document.getElementById('btn-carrossel-next');
        const miniaturasRow = document.getElementById('miniaturas-row');
        const btnExpandirFoto = document.getElementById('btn-expandir-foto');

        // Elementos do Modal / Lightbox em Tela Cheia
        const modalLightbox = document.getElementById('modal-lightbox-fotos');
        const lightboxOverlay = document.getElementById('lightbox-overlay');
        const btnFecharLightbox = document.getElementById('btn-lightbox-fechar');
        const lightboxImg = document.getElementById('lightbox-img-principal');
        const lightboxContador = document.getElementById('lightbox-contador');
        const btnLightboxPrev = document.getElementById('btn-lightbox-prev');
        const btnLightboxNext = document.getElementById('btn-lightbox-next');
        const lightboxMiniaturasRow = document.getElementById('lightbox-miniaturas-row');

        // Renderiza miniaturas do carrossel da página
        if (miniaturasRow) {
            miniaturasRow.innerHTML = '';
            fotosCarrossel.forEach((src, idx) => {
                const thumb = document.createElement('div');
                thumb.className = `thumb-box ${idx === 0 ? 'ativa' : ''}`;
                thumb.dataset.index = idx;
                thumb.dataset.src = src;
                thumb.title = `Foto ${idx + 1}`;
                thumb.innerHTML = `<img src="${src}" alt="Miniatura ${idx + 1}" onerror="this.onerror=null; this.src='${placeholderAsset}'">`;
                thumb.addEventListener('click', () => {
                    exibirFotoIndex(idx);
                });
                miniaturasRow.appendChild(thumb);
            });
        }

        function exibirFotoIndex(idx) {
            fotoAtualIndex = (idx + fotosCarrossel.length) % fotosCarrossel.length;
            if (fotoDisplay) {
                fotoDisplay.src = fotosCarrossel[fotoAtualIndex];
                fotoDisplay.alt = produto.titulo;
            }
            const bgBlur = document.getElementById('foto-bg-blur');
            if (bgBlur) {
                bgBlur.style.backgroundImage = `url("${fotosCarrossel[fotoAtualIndex]}")`;
            }
            if (contadorTexto) {
                contadorTexto.textContent = `${fotoAtualIndex + 1}/${fotosCarrossel.length}`;
            }
            const thumbs = miniaturasRow ? miniaturasRow.querySelectorAll('.thumb-box') : [];
            thumbs.forEach((tb) => {
                const tbIdx = parseInt(tb.getAttribute('data-index') || '0', 10);
                tb.classList.toggle('ativa', tbIdx === fotoAtualIndex);
            });
        }

        // =====================================================================
        // CONTROLE DO VISUALIZADOR EM TELA CHEIA (LIGHTBOX ESTILO OLX)
        // =====================================================================
        function renderizarMiniaturasLightbox() {
            if (!lightboxMiniaturasRow) return;
            lightboxMiniaturasRow.innerHTML = '';
            fotosCarrossel.forEach((src, idx) => {
                const thumb = document.createElement('div');
                thumb.className = `lightbox-thumb ${idx === fotoAtualIndex ? 'ativa' : ''}`;
                thumb.dataset.index = idx;
                thumb.title = `Ver foto ${idx + 1}`;
                thumb.innerHTML = `<img src="${src}" alt="Miniatura ${idx + 1}" onerror="this.onerror=null; this.src='${placeholderAsset}'">`;
                thumb.addEventListener('click', (e) => {
                    e.stopPropagation();
                    exibirFotoLightbox(idx);
                });
                lightboxMiniaturasRow.appendChild(thumb);
            });
        }

        function exibirFotoLightbox(idx) {
            fotoAtualIndex = (idx + fotosCarrossel.length) % fotosCarrossel.length;
            if (lightboxImg) {
                lightboxImg.style.opacity = '0.4';
                lightboxImg.src = fotosCarrossel[fotoAtualIndex];
                lightboxImg.alt = produto.titulo || 'Foto do anúncio';
                lightboxImg.onload = () => {
                    lightboxImg.style.opacity = '1';
                };
            }
            if (lightboxContador) {
                lightboxContador.textContent = `${fotoAtualIndex + 1}/${fotosCarrossel.length}`;
            }

            // Atualiza destaque na miniatura ativa do lightbox
            if (lightboxMiniaturasRow) {
                const thumbs = lightboxMiniaturasRow.querySelectorAll('.lightbox-thumb');
                thumbs.forEach((tb) => {
                    const tbIdx = parseInt(tb.getAttribute('data-index') || '0', 10);
                    tb.classList.toggle('ativa', tbIdx === fotoAtualIndex);
                });
            }

            // Sincroniza em segundo plano com a foto da página
            exibirFotoIndex(fotoAtualIndex);
        }

        function abrirLightbox(indexInicial = 0) {
            if (!modalLightbox) return;
            renderizarMiniaturasLightbox();
            modalLightbox.style.display = 'flex';
            document.body.style.overflow = 'hidden';

            // Esconde botões de avançar/voltar se só houver 1 foto
            if (fotosCarrossel.length <= 1) {
                if (btnLightboxPrev) btnLightboxPrev.style.display = 'none';
                if (btnLightboxNext) btnLightboxNext.style.display = 'none';
                if (lightboxMiniaturasRow) lightboxMiniaturasRow.style.display = 'none';
            } else {
                if (btnLightboxPrev) btnLightboxPrev.style.display = 'flex';
                if (btnLightboxNext) btnLightboxNext.style.display = 'flex';
                if (lightboxMiniaturasRow) lightboxMiniaturasRow.style.display = 'flex';
            }

            exibirFotoLightbox(indexInicial);

            // Animação de entrada
            requestAnimationFrame(() => {
                modalLightbox.classList.add('aberto');
            });

            document.addEventListener('keydown', lidarTecladoLightbox);
        }

        function fecharLightbox() {
            if (!modalLightbox) return;
            modalLightbox.classList.remove('aberto');
            document.removeEventListener('keydown', lidarTecladoLightbox);
            setTimeout(() => {
                modalLightbox.style.display = 'none';
                document.body.style.overflow = '';
            }, 250);
        }

        function lidarTecladoLightbox(e) {
            if (e.key === 'Escape') {
                fecharLightbox();
            } else if (e.key === 'ArrowLeft') {
                exibirFotoLightbox(fotoAtualIndex - 1);
            } else if (e.key === 'ArrowRight') {
                exibirFotoLightbox(fotoAtualIndex + 1);
            }
        }

        // Eventos para abrir o Lightbox
        fotoDisplay?.addEventListener('click', (e) => {
            e.preventDefault();
            abrirLightbox(fotoAtualIndex);
        });

        btnExpandirFoto?.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            abrirLightbox(fotoAtualIndex);
        });

        // Eventos para fechar o Lightbox
        btnFecharLightbox?.addEventListener('click', (e) => {
            e.preventDefault();
            fecharLightbox();
        });

        lightboxOverlay?.addEventListener('click', fecharLightbox);

        btnLightboxPrev?.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            exibirFotoLightbox(fotoAtualIndex - 1);
        });

        btnLightboxNext?.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            exibirFotoLightbox(fotoAtualIndex + 1);
        });

        // Exibe primeira foto na página
        exibirFotoIndex(0);

        btnCarrosselPrev?.addEventListener('click', (e) => {
            e.preventDefault();
            exibirFotoIndex(fotoAtualIndex - 1);
        });

        btnCarrosselNext?.addEventListener('click', (e) => {
            e.preventDefault();
            exibirFotoIndex(fotoAtualIndex + 1);
        });

        window.ItaimProdutoGaleria.exibirFotoIndex = exibirFotoIndex;
        window.ItaimProdutoGaleria.abrirLightbox = abrirLightbox;
        window.ItaimProdutoGaleria.fecharLightbox = fecharLightbox;
    }

    window.ItaimProdutoGaleria = {
        inicializar,
        exibirFotoIndex: null,
        abrirLightbox: null,
        fecharLightbox: null
    };
})();
