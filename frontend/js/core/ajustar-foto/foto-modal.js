/**
 * ITAIM VENDE - INTERFACE E GESTÃO DO MODAL DE AJUSTE (FOTO MODAL)
 * Arquivo: frontend/js/core/ajustar-foto/foto-modal.js
 * 
 * Responsabilidades:
 * - Montagem e desmontagem do DOM do modal de enquadramento
 * - Bloqueio estrito de rolagem do fundo (body/html lock) durante o ajuste
 * - Suporte a mouse drag e zoom por roda do mouse no desktop
 * - Suporte completo a gestos touch no celular: arrasto (pan) e pinça de 2 dedos (pinch-to-zoom)
 * - Sincronização bidirecional em tempo real com o slider de zoom
 * - Suporte a rotação de 90° e atalho de toque duplo (double-tap zoom)
 * - Integração com o motor Canvas para renderização e exportação de alta qualidade
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

        // 1. Bloqueia a rolagem do fundo da página (Prevenção de mexer o fundo)
        const overflowBodyOriginal = document.body.style.overflow;
        const overflowHtmlOriginal = document.documentElement.style.overflow;
        const touchActionBodyOriginal = document.body.style.touchAction;

        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
        document.body.style.touchAction = 'none';

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
                        Arraste para reposicionar e use pinça com os dedos (ou o slider) para aproximar
                    </p>

                    <div class="modal-ajuste-controles">
                        <!-- Ícone Lupa Menos -->
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            <line x1="8" y1="11" x2="14" y2="11"></line>
                        </svg>
                        <input type="range" class="modal-ajuste-slider" id="slider-zoom" min="1" max="3" step="0.01" value="1" title="Aproximar" aria-label="Controle de Zoom">
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

        // Botão Girar (90 graus)
        btnGirar.addEventListener('click', function () {
            estado.angulo = (estado.angulo + 90) % 360;
            desenhar();
        });

        // -------------------------------------------------------------
        // 2. ARRASTAR COM MOUSE (DESKTOP) E ZOOM COM SCROLL DA RODA
        // -------------------------------------------------------------
        let arrastandoMouse = false;
        let inicioMouseX = 0;
        let inicioMouseY = 0;

        viewport.addEventListener('mousedown', function (e) {
            e.preventDefault();
            arrastandoMouse = true;
            inicioMouseX = e.clientX - estado.posX;
            inicioMouseY = e.clientY - estado.posY;
        });

        const onMouseMove = function (e) {
            if (!arrastandoMouse) return;
            estado.posX = e.clientX - inicioMouseX;
            estado.posY = e.clientY - inicioMouseY;
            desenhar();
        };

        const onMouseUp = function () {
            arrastandoMouse = false;
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);

        // Zoom com a roda do mouse (Desktop) sem rolar a página
        viewport.addEventListener('wheel', function (e) {
            e.preventDefault();
            const sensibilidade = 0.0015;
            const delta = -e.deltaY * sensibilidade;
            const minZoom = parseFloat(sliderZoom.min) || 1.0;
            const maxZoom = parseFloat(sliderZoom.max) || 3.0;
            const novoZoom = Math.min(Math.max(estado.zoom + delta, minZoom), maxZoom);
            estado.zoom = Math.round(novoZoom * 100) / 100;
            sliderZoom.value = estado.zoom;
            desenhar();
        }, { passive: false });

        // -------------------------------------------------------------
        // 3. GESTOS DE TOQUE (TOUCH / CELULAR): ARRASTO E PINÇA (PINCH-TO-ZOOM)
        // -------------------------------------------------------------
        function getDistancia(t1, t2) {
            const dx = t1.clientX - t2.clientX;
            const dy = t1.clientY - t2.clientY;
            return Math.hypot(dx, dy);
        }

        function getCentro(t1, t2) {
            return {
                x: (t1.clientX + t2.clientX) / 2,
                y: (t1.clientY + t2.clientY) / 2
            };
        }

        let emGestoTouch = false;
        let emPinca = false;
        let toqueInicioX = 0;
        let toqueInicioY = 0;
        let distPincaInicial = 0;
        let zoomBasePinca = 1.0;
        let centroPincaInicial = { x: 0, y: 0 };
        let posBasePincaX = 0;
        let posBasePincaY = 0;
        let ultimoTapTime = 0;
        let movimentoOcorreu = false;

        const onTouchStart = function (e) {
            // Previne imediatamente qualquer scroll do browser no canvas
            e.preventDefault();
            e.stopPropagation();

            movimentoOcorreu = false;

            if (e.touches.length === 1) {
                // Toque com 1 dedo: arrastar
                emGestoTouch = true;
                emPinca = false;
                toqueInicioX = e.touches[0].clientX - estado.posX;
                toqueInicioY = e.touches[0].clientY - estado.posY;
            } else if (e.touches.length >= 2) {
                // Toque com 2 dedos: início do zoom de pinça (pinch)
                emGestoTouch = true;
                emPinca = true;
                distPincaInicial = getDistancia(e.touches[0], e.touches[1]);
                zoomBasePinca = estado.zoom;
                centroPincaInicial = getCentro(e.touches[0], e.touches[1]);
                posBasePincaX = estado.posX;
                posBasePincaY = estado.posY;
            }
        };

        const onTouchMove = function (e) {
            if (!emGestoTouch) return;
            // Prevenção crítica: nunca permitir que o fundo role
            e.preventDefault();
            e.stopPropagation();

            movimentoOcorreu = true;

            if (e.touches.length >= 2 && emPinca) {
                // Gesto de Pinça Ativo: Ajuste fino de Zoom proporcional
                const distAtual = getDistancia(e.touches[0], e.touches[1]);
                if (distPincaInicial > 10) {
                    const fator = distAtual / distPincaInicial;
                    let novoZoom = zoomBasePinca * fator;
                    const minZoom = parseFloat(sliderZoom.min) || 1.0;
                    const maxZoom = parseFloat(sliderZoom.max) || 3.0;
                    novoZoom = Math.min(Math.max(novoZoom, minZoom), maxZoom);
                    estado.zoom = Math.round(novoZoom * 100) / 100;
                    sliderZoom.value = estado.zoom;
                }

                // Ajusta simultaneamente o enquadramento conforme os dedos se movem
                const centroAtual = getCentro(e.touches[0], e.touches[1]);
                estado.posX = posBasePincaX + (centroAtual.x - centroPincaInicial.x);
                estado.posY = posBasePincaY + (centroAtual.y - centroPincaInicial.y);
                desenhar();

            } else if (e.touches.length === 1 && !emPinca) {
                // Arrasto com 1 dedo (Pan)
                estado.posX = e.touches[0].clientX - toqueInicioX;
                estado.posY = e.touches[0].clientY - toqueInicioY;
                desenhar();
            }
        };

        const onTouchEnd = function (e) {
            if (!emGestoTouch) return;

            if (e.touches.length >= 2) {
                // Ainda há 2 dedos na tela: recalibra base para evitar pulos
                distPincaInicial = getDistancia(e.touches[0], e.touches[1]);
                zoomBasePinca = estado.zoom;
                centroPincaInicial = getCentro(e.touches[0], e.touches[1]);
                posBasePincaX = estado.posX;
                posBasePincaY = estado.posY;
            } else if (e.touches.length === 1) {
                // Usuário levantou 1 dedo: transição suave para arrasto simples
                emPinca = false;
                toqueInicioX = e.touches[0].clientX - estado.posX;
                toqueInicioY = e.touches[0].clientY - estado.posY;
            } else {
                // Todos os dedos levantados: fim do gesto
                emGestoTouch = false;
                emPinca = false;
                distPincaInicial = 0;

                // Toque Duplo Rápido (Double-Tap) para alternar zoom (1x <-> 2x)
                if (!movimentoOcorreu) {
                    const agora = Date.now();
                    if (agora - ultimoTapTime < 300) {
                        if (estado.zoom > 1.05) {
                            estado.zoom = 1.0;
                            estado.posX = 0;
                            estado.posY = 0;
                        } else {
                            estado.zoom = 2.0;
                        }
                        sliderZoom.value = estado.zoom;
                        desenhar();
                        ultimoTapTime = 0;
                    } else {
                        ultimoTapTime = agora;
                    }
                }
            }
        };

        viewport.addEventListener('touchstart', onTouchStart, { passive: false });
        window.addEventListener('touchmove', onTouchMove, { passive: false });
        window.addEventListener('touchend', onTouchEnd, { passive: false });
        window.addEventListener('touchcancel', onTouchEnd, { passive: false });

        // -------------------------------------------------------------
        // 4. BLOQUEIO DE ROLAGEM NO BACKDROP
        // -------------------------------------------------------------
        const onBackdropTouchMove = function (e) {
            e.preventDefault();
        };
        backdrop.addEventListener('touchmove', onBackdropTouchMove, { passive: false });

        const onBackdropWheel = function (e) {
            if (!e.target.closest('#viewport-ajuste')) {
                e.preventDefault();
            }
        };
        backdrop.addEventListener('wheel', onBackdropWheel, { passive: false });

        // Fechar ao clicar fora do card
        backdrop.addEventListener('click', function (e) {
            if (e.target === backdrop) {
                fechar();
                if (typeof aoCancelar === 'function') aoCancelar();
            }
        });

        // -------------------------------------------------------------
        // 5. FECHAMENTO DO MODAL E RESTAURAÇÃO
        // -------------------------------------------------------------
        const onKeyDown = function (e) {
            if (e.key === 'Escape') {
                fechar();
                if (typeof aoCancelar === 'function') aoCancelar();
            }
        };
        window.addEventListener('keydown', onKeyDown);

        function fechar() {
            // Remove listeners globais
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('touchend', onTouchEnd);
            window.removeEventListener('touchcancel', onTouchEnd);
            window.removeEventListener('keydown', onKeyDown);

            // Restaura o scroll e touch do body/html original
            document.body.style.overflow = overflowBodyOriginal;
            document.documentElement.style.overflow = overflowHtmlOriginal;
            document.body.style.touchAction = touchActionBodyOriginal;

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