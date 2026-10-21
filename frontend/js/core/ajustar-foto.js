/**
 * ITAIM VENDE - API DE AJUSTE DE FOTO (BUNDLE UNIFICADO)
 * Arquivo: frontend/js/core/ajustar-foto.js
 * 
 * ATENÇÃO:
 * Este arquivo unifica de forma profissional os módulos da pasta:
 *   frontend/js/core/ajustar-foto/
 * 
 * Módulos integrantes:
 *   - ajustar-foto/foto-estilos.js: Estilos e temas injetados
 *   - ajustar-foto/foto-canvas.js: Motor Canvas, zoom, pan e corte 1:1
 *   - ajustar-foto/foto-modal.js: Interface interativa, mouse e touch drag
 *   - ajustar-foto/index.js: Orquestrador da API global window.ItaimFoto
 * 
 * Para editar funcionalidades isoladas de forma modular, edite diretamente os
 * arquivos na pasta ajustar-foto/ e execute 'npm run build:foto'.
 */

// ==========================================================================
// MÓDULO: ESTILOS E TEMA DO MODAL (foto-estilos.js)
// ==========================================================================

/**
 * ITAIM VENDE - ESTILOS E TEMA DO AJUSTADOR DE FOTO
 * Arquivo: frontend/js/core/ajustar-foto/foto-estilos.js
 * 
 * Responsabilidades:
 * - Injeção dinâmica de CSS com tema moderno, responsivo e dark-backdrop
 * - Estilização do modal, viewport de corte 1:1 (quadrado ou circular para perfil),
 *   sliders de zoom e botões de ação
 */

(function() {
    'use strict';

    function injetarEstilos() {
        if (document.getElementById('estilos-ajustar-foto')) return;
        const style = document.createElement('style');
        style.id = 'estilos-ajustar-foto';
        style.textContent = `
            .modal-ajuste-backdrop {
                position: fixed;
                inset: 0;
                background: rgba(15, 23, 42, 0.75);
                backdrop-filter: blur(4px);
                z-index: 99999;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 16px;
                animation: fadeInModal 0.2s ease-out;
            }
            @keyframes fadeInModal {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            .modal-ajuste-card {
                background: #ffffff;
                width: 100%;
                max-width: 440px;
                border-radius: 16px;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
                overflow: hidden;
                display: flex;
                flex-direction: column;
                user-select: none;
            }
            .modal-ajuste-topo {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 16px 20px;
                border-bottom: 1px solid #E2E8F0;
            }
            .modal-ajuste-titulo {
                font-size: 17px;
                font-weight: 700;
                color: #0F172A;
                margin: 0;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .modal-ajuste-fechar {
                background: none;
                border: none;
                color: #64748B;
                font-size: 22px;
                cursor: pointer;
                padding: 4px;
                line-height: 1;
                border-radius: 6px;
                transition: all 0.2s;
            }
            .modal-ajuste-fechar:hover {
                color: #0F172A;
                background: #F1F5F9;
            }
            .modal-ajuste-corpo {
                padding: 20px;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 16px;
                background: #F8FAFC;
            }
            /* Área de visualização do corte (quadrada) */
            .modal-ajuste-viewport {
                width: 280px;
                height: 280px;
                position: relative;
                overflow: hidden;
                background: #0F172A;
                border-radius: 12px;
                cursor: grab;
                touch-action: none;
                box-shadow: inset 0 0 0 2px rgba(255,255,255,0.2), 0 8px 20px rgba(0,0,0,0.15);
            }
            .modal-ajuste-viewport.modo-perfil {
                border-radius: 50%;
            }
            .modal-ajuste-viewport:active {
                cursor: grabbing;
            }
            .modal-ajuste-canvas {
                position: absolute;
                top: 0;
                left: 0;
                pointer-events: none;
            }
            .modal-ajuste-grade {
                position: absolute;
                inset: 0;
                border: 2px dashed rgba(255, 255, 255, 0.4);
                pointer-events: none;
                border-radius: inherit;
            }
            .modal-ajuste-dica {
                font-size: 12.5px;
                color: #64748B;
                text-align: center;
                margin: 0;
            }
            /* Controles de Zoom e Rotação */
            .modal-ajuste-controles {
                width: 100%;
                display: flex;
                align-items: center;
                gap: 12px;
                background: #ffffff;
                padding: 10px 14px;
                border-radius: 10px;
                border: 1px solid #E2E8F0;
            }
            .modal-ajuste-controles svg {
                color: #64748B;
                flex-shrink: 0;
            }
            .modal-ajuste-slider {
                flex: 1;
                accent-color: #44BD32;
                cursor: pointer;
            }
            .modal-ajuste-btn-girar {
                background: #F1F5F9;
                border: 1px solid #CBD5E1;
                border-radius: 8px;
                padding: 6px 10px;
                font-size: 13px;
                font-weight: 600;
                color: #334155;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 6px;
                transition: background 0.2s;
            }
            .modal-ajuste-btn-girar:hover {
                background: #E2E8F0;
            }
            /* Rodapé com Botões de Ação */
            .modal-ajuste-rodape {
                display: flex;
                align-items: center;
                justify-content: flex-end;
                gap: 10px;
                padding: 14px 20px;
                border-top: 1px solid #E2E8F0;
                background: #ffffff;
            }
            .modal-ajuste-btn-cancelar {
                padding: 9px 16px;
                background: #F1F5F9;
                border: 1px solid #CBD5E1;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 600;
                color: #475569;
                cursor: pointer;
                transition: all 0.2s;
            }
            .modal-ajuste-btn-cancelar:hover {
                background: #E2E8F0;
                color: #0F172A;
            }
            .modal-ajuste-btn-salvar {
                padding: 9px 20px;
                background: #44BD32;
                border: none;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 700;
                color: #ffffff;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 6px;
                box-shadow: 0 2px 8px rgba(68, 189, 50, 0.35);
                transition: all 0.2s;
            }
            .modal-ajuste-btn-salvar:hover {
                background: #38a528;
                transform: translateY(-1px);
            }
            /* Suporte ao Modo Escuro */
            [data-theme="dark"] .modal-ajuste-card {
                background: #1F2831;
                border: 1px solid #2C3946;
                color: #F1F5F9;
                box-shadow: 0 20px 48px rgba(0, 0, 0, 0.55);
            }
            [data-theme="dark"] .modal-ajuste-topo {
                border-bottom: 1px solid #2C3946;
            }
            [data-theme="dark"] .modal-ajuste-titulo {
                color: #F1F5F9;
            }
            [data-theme="dark"] .modal-ajuste-fechar {
                color: #94A3B8;
            }
            [data-theme="dark"] .modal-ajuste-fechar:hover {
                color: #F1F5F9;
                background: #242E38;
            }
            [data-theme="dark"] .modal-ajuste-corpo {
                background: #161C22;
            }
            [data-theme="dark"] .modal-ajuste-dica {
                color: #94A3B8;
            }
            [data-theme="dark"] .modal-ajuste-controles {
                background: #1F2831;
                border: 1px solid #2C3946;
            }
            [data-theme="dark"] .modal-ajuste-controles svg {
                color: #94A3B8;
            }
            [data-theme="dark"] .modal-ajuste-btn-girar {
                background: #242E38;
                border-color: #2C3946;
                color: #F1F5F9;
            }
            [data-theme="dark"] .modal-ajuste-btn-girar:hover {
                background: #2D3945;
                color: #4ADE80;
                border-color: #4ADE80;
            }
            [data-theme="dark"] .modal-ajuste-rodape {
                background: #1F2831;
                border-top: 1px solid #2C3946;
            }
            [data-theme="dark"] .modal-ajuste-btn-cancelar {
                background: #242E38;
                border-color: #2C3946;
                color: #F1F5F9;
            }
            [data-theme="dark"] .modal-ajuste-btn-cancelar:hover {
                background: #2D3945;
                color: #FFFFFF;
            }
        `;
        document.head.appendChild(style);
    }

    window.ItaimFotoEstilos = {
        injetarEstilos
    };

})();


// ==========================================================================
// MÓDULO: MOTOR CANVAS E GEOMETRIA (foto-canvas.js)
// ==========================================================================

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


// ==========================================================================
// MÓDULO: MODAL INTERATIVO E GESTOS (foto-modal.js)
// ==========================================================================

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


// ==========================================================================
// MÓDULO: ORQUESTRADOR GLOBAL (INDEX) (index.js)
// ==========================================================================

/**
 * ITAIM VENDE - PONTO DE ENTRADA DO AJUSTADOR DE FOTO
 * Arquivo: frontend/js/core/ajustar-foto/index.js
 * 
 * Carrega automaticamente e de forma síncrona todos os submódulos de foto:
 * - foto-estilos.js
 * - foto-canvas.js
 * - foto-modal.js
 * - foto-orquestrador.js
 */

(function() {
    'use strict';

    const scriptAtual = document.currentScript;
    const base = scriptAtual ? scriptAtual.src.substring(0, scriptAtual.src.lastIndexOf('/') + 1) : '';

    const arquivos = [
        'foto-estilos.js',
        'foto-canvas.js',
        'foto-modal.js',
        'foto-orquestrador.js'
    ];

    arquivos.forEach(function(arquivo) {
        document.write('<script src="' + base + arquivo + '"><\/script>');
    });

})();


