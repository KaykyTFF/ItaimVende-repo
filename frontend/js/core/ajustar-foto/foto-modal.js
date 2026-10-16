/**
 * ITAIM VENDE - INTERFACE E GESTÃO DO MODAL DE AJUSTE (FOTO MODAL)
 * Arquivo: frontend/js/core/ajustar-foto/foto-modal.js
 * 
 * Responsabilidades:
 * - Montagem e desmontagem do DOM do modal de enquadramento
 * - Suporte a mouse drag e touch drag/gestos móveis
 * - Controles de zoom slider e rotação 90°
 * - Integração com o motor Canvas para renderização e exportação
 */

(function() {
    'use strict';

    function getCanvasMotor() {
        return window.ItaimFotoCanvas || {
            renderizarPreview: () => {},
            exportarFotoFinal: () => ''
        };
    }

    /**
     * Cria a interface do Modal de Ajuste na tela
     */
    function montarModal(srcImagem, tipo, tamanhoFinal, aoSalvar, aoCancelar) {
        // Remove modal anterior caso exista
        const modalAntigo = document.getElementById('modal-ajuste-foto-container');
        if (modalAntigo) modalAntigo.remove();

        const backdrop = document.createElement('div');
        backdrop.id = 'modal-ajuste-foto-container';
        backdrop.className = 'modal-ajuste-backdrop';

        const titulo = tipo === 'perfil' ? 'Ajustar Foto de Perfil' : 'Ajustar Foto do Produto';
        const classeModo = tipo === 'perfil' ? 'modo-perfil' : 'modo-produto';

        backdrop.innerHTML = `
            <div class="modal-ajuste-card" role="dialog" aria-modal="true">
                <div class="modal-ajuste-topo">
                    <h3 class="modal-ajuste-titulo">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#44BD32" stroke-width="2.2">
                            <circle cx="6" cy="6" r="3"></circle>
                            <circle cx="6" cy="18" r="3"></circle>
                            <line x1="20" y1="4" x2="8.12" y2="15.88"></line>
                            <line x1="14.47" y1="14.48" x2="20" y2="20"></line>
                            <line x1="8.12" y1="8.12" x2="12" y2="12"></line>
                        </svg>
                        ${titulo}
                    </h3>
                    <button type="button" class="modal-ajuste-fechar" id="btn-fechar-ajuste" title="Fechar">&times;</button>
                </div>

                <div class="modal-ajuste-corpo">
                    <div class="modal-ajuste-viewport ${classeModo}" id="viewport-ajuste">
                        <canvas class="modal-ajuste-canvas" id="canvas-ajuste"></canvas>
                        <div class="modal-ajuste-grade"></div>
                    </div>

                    <p class="modal-ajuste-dica">
                        Arraste a foto com o mouse ou dedo para enquadrar
                    </p>

                    <div class="modal-ajuste-controles">
                        <!-- Ícone Lupa Menos -->
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            <line x1="8" y1="11" x2="14" y2="11"></line>
                        </svg>
                        <input type="range" class="modal-ajuste-slider" id="slider-zoom" min="1" max="3" step="0.05" value="1" title="Aproximar">
                        <!-- Ícone Lupa Mais -->
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            <line x1="11" y1="8" x2="11" y2="14"></line>
                            <line x1="8" y1="11" x2="14" y2="11"></line>
                        </svg>
                        <button type="button" class="modal-ajuste-btn-girar" id="btn-girar-foto" title="Girar 90 graus">
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="23 4 23 10 17 10"></polyline>
                                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                            </svg>
                            Girar
                        </button>
                    </div>
                </div>

                <div class="modal-ajuste-rodape">
                    <button type="button" class="modal-ajuste-btn-cancelar" id="btn-cancelar-ajuste">Cancelar</button>
                    <button type="button" class="modal-ajuste-btn-salvar" id="btn-salvar-ajuste">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        Aplicar Foto
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(backdrop);

        const viewport = document.getElementById('viewport-ajuste');
        const canvas = document.getElementById('canvas-ajuste');
        const ctx = canvas.getContext('2d');
        const sliderZoom = document.getElementById('slider-zoom');
        const btnGirar = document.getElementById('btn-girar-foto');
        const btnSalvar = document.getElementById('btn-salvar-ajuste');
        const btnCancelar = document.getElementById('btn-cancelar-ajuste');
        const btnFechar = document.getElementById('btn-fechar-ajuste');

        const viewLargura = 280;
        const viewAltura = 280;
        canvas.width = viewLargura;
        canvas.height = viewAltura;

        const img = new Image();
        img.crossOrigin = 'anonymous';

        // Estado de transformação da foto
        const estado = {
            zoom: 1.0,
            angulo: 0,
            posX: 0,
            posY: 0
        };

        let arrastando = false;
        let inicioX = 0;
        let inicioY = 0;

        function desenhar() {
            getCanvasMotor().renderizarPreview(ctx, img, estado, viewLargura, viewAltura);
        }

        img.onload = function () {
            desenhar();
        };
        img.src = srcImagem;

        // Slider de Zoom
        sliderZoom.addEventListener('input', function (e) {
            estado.zoom = parseFloat(e.target.value);
            desenhar();
        });

        // Botão Girar
        btnGirar.addEventListener('click', function () {
            estado.angulo = (estado.angulo + 90) % 360;
            desenhar();
        });

        // Arrastar com Mouse
        viewport.addEventListener('mousedown', function (e) {
            arrastando = true;
            inicioX = e.clientX - estado.posX;
            inicioY = e.clientY - estado.posY;
        });

        const onMouseMove = function (e) {
            if (!arrastando) return;
            estado.posX = e.clientX - inicioX;
            estado.posY = e.clientY - inicioY;
            desenhar();
        };

        const onMouseUp = function () {
            arrastando = false;
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);

        // Arrastar com Toque (Touch / Mobile)
        viewport.addEventListener('touchstart', function (e) {
            if (e.touches.length === 1) {
                arrastando = true;
                inicioX = e.touches[0].clientX - estado.posX;
                inicioY = e.touches[0].clientY - estado.posY;
            }
        }, { passive: true });

        viewport.addEventListener('touchmove', function (e) {
            if (!arrastando || e.touches.length !== 1) return;
            estado.posX = e.touches[0].clientX - inicioX;
            estado.posY = e.touches[0].clientY - inicioY;
            desenhar();
        }, { passive: true });

        viewport.addEventListener('touchend', function () {
            arrastando = false;
        });

        // Fechar Modal
        function fechar() {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            backdrop.remove();
        }

        btnFechar.addEventListener('click', () => {
            fechar();
            if (typeof aoCancelar === 'function') aoCancelar();
        });

        btnCancelar.addEventListener('click', () => {
            fechar();
            if (typeof aoCancelar === 'function') aoCancelar();
        });

        // Salvar e gerar imagem final em alta qualidade
        btnSalvar.addEventListener('click', function () {
            const fotoAjustada = getCanvasMotor().exportarFotoFinal(
                img,
                estado,
                viewLargura,
                viewAltura,
                tamanhoFinal,
                0.88
            );

            fechar();
            if (typeof aoSalvar === 'function') {
                aoSalvar(fotoAjustada);
            }
        });
    }

    window.ItaimFotoModal = {
        montarModal
    };

})();
