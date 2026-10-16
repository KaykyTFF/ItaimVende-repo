/**
 * ITAIM VENDE - MOTOR DE RENDERIZAÇÃO E PROCESSAMENTO CANVAS (FOTO CANVAS)
 * Arquivo: frontend/js/core/ajustar-foto/foto-canvas.js
 * 
 * Responsabilidades:
 * - Renderização em tempo real no Canvas do modal com interpolação de alta qualidade
 * - Transformações geométricas: translação (pan/arrasto), rotação 90°/180°/270°, zoom proporcional
 * - Eliminação garantida de bordas cinzas ou espaços vazios (preenchimento 1:1 exato)
 * - Cortador automático centralizado (fallback ou modo rápido)
 * - Exportação de JPEG comprimido e otimizado para web
 */

(function() {
    'use strict';

    /**
     * Cortador 100% automático centralizado (sem abrir janela)
     */
    function cortarAutomatico(arquivoOuUrl, tamanho = 800, callback) {
        const processar = (dataUrl) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = tamanho;
                canvas.height = tamanho;
                const ctx = canvas.getContext('2d');
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';

                const menor = Math.min(img.width, img.height);
                const sx = (img.width - menor) / 2;
                const sy = (img.height - menor) / 2;

                ctx.drawImage(img, sx, sy, menor, menor, 0, 0, tamanho, tamanho);
                const resultado = canvas.toDataURL('image/jpeg', 0.88);
                if (typeof callback === 'function') callback(resultado);
            };
            img.src = dataUrl;
        };

        if (typeof arquivoOuUrl === 'string') {
            processar(arquivoOuUrl);
        } else if (arquivoOuUrl instanceof Blob || arquivoOuUrl instanceof File) {
            const r = new FileReader();
            r.onload = (e) => processar(e.target.result);
            r.readAsDataURL(arquivoOuUrl);
        }
    }

    /**
     * Renderiza o quadro de pré-visualização no Canvas interativo
     */
    function renderizarPreview(ctx, img, estado, largura, altura) {
        if (!ctx || !img) return;

        ctx.clearRect(0, 0, largura, altura);
        ctx.save();

        // Move para o centro do viewport
        ctx.translate(largura / 2 + estado.posX, altura / 2 + estado.posY);
        ctx.rotate((estado.angulo * Math.PI) / 180);
        ctx.scale(estado.zoom, estado.zoom);

        // Calcula escala para cobrir o viewport sem espaços vazios
        const escalaBase = Math.max(largura / img.width, altura / img.height);
        const dw = img.width * escalaBase;
        const dh = img.height * escalaBase;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
        ctx.restore();
    }

    /**
     * Gera e exporta a imagem final recortada na resolução desejada (ex: 800x800 ou 400x400)
     */
    function exportarFotoFinal(img, estado, viewLargura, viewAltura, tamanhoFinal, qualidade = 0.88) {
        const canvasSaida = document.createElement('canvas');
        canvasSaida.width = tamanhoFinal;
        canvasSaida.height = tamanhoFinal;
        const ctxSaida = canvasSaida.getContext('2d');

        const escalaFinal = tamanhoFinal / viewLargura;

        ctxSaida.imageSmoothingEnabled = true;
        ctxSaida.imageSmoothingQuality = 'high';

        ctxSaida.save();
        ctxSaida.translate((viewLargura / 2 + estado.posX) * escalaFinal, (viewAltura / 2 + estado.posY) * escalaFinal);
        ctxSaida.rotate((estado.angulo * Math.PI) / 180);
        ctxSaida.scale(estado.zoom * escalaFinal, estado.zoom * escalaFinal);

        const escalaBase = Math.max(viewLargura / img.width, viewAltura / img.height);
        const dw = img.width * escalaBase;
        const dh = img.height * escalaBase;

        ctxSaida.drawImage(img, -dw / 2, -dh / 2, dw, dh);
        ctxSaida.restore();

        return canvasSaida.toDataURL('image/jpeg', qualidade);
    }

    window.ItaimFotoCanvas = {
        cortarAutomatico,
        renderizarPreview,
        exportarFotoFinal
    };

})();
