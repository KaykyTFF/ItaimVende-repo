/**
 * ITAIM VENDE - PRODUTO: CARROSSEL E GALERIA DE FOTOS
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

        // Renderiza miniaturas do produto atual
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

        // Exibe primeira foto
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
    }

    window.ItaimProdutoGaleria = {
        inicializar,
        exibirFotoIndex: null
    };
})();
