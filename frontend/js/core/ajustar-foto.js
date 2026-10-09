/**
 * ============================================================================
 * ITAIM VENDE - API SIMPLES DE AJUSTE DE FOTO (PRODUTOS E PERFIL)
 * ============================================================================
 * 
 * Esta API é leve, sem bibliotecas externas (100% JavaScript e HTML5 Canvas).
 * Ela permite ao usuário visualizar e ajustar a foto (zoom, arrastar, girar)
 * antes de salvar, garantindo corte 1:1 perfeito e eliminando espaços cinzas.
 * 
 * COMO USAR:
 * 
 * 1. Para Foto de Produto (800x800):
 *    ItaimFoto.ajustarProduto(arquivo, function(fotoFinal) {
 *        imgElemento.src = fotoFinal;
 *    });
 * 
 * 2. Para Foto de Perfil (400x400):
 *    ItaimFoto.ajustarPerfil(arquivo, function(fotoFinal) {
 *        avatarElemento.src = fotoFinal;
 *    });
 * 
 * 3. Função Direta / Customizada:
 *    ItaimFoto.abrir({
 *        arquivo: file,
 *        tipo: 'produto', // ou 'perfil'
 *        tamanho: 800,
 *        aoSalvar: function(imagemBase64) { ... }
 *    });
 */

(function (window) {
    'use strict';

    // Injeta os estilos do modal de ajuste automaticamente na página
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
        `;
        document.head.appendChild(style);
    }

    const ItaimFoto = {

        /**
         * Abre a janela simples para o usuário ajustar (posicionar, aproximar ou girar) a foto.
         * 
         * @param {Object} opcoes - Configurações:
         *   - arquivo: File ou String (URL/Base64)
         *   - tipo: 'produto' (padrão) ou 'perfil'
         *   - tamanho: tamanho em pixels da foto salva (padrão: 800)
         *   - aoSalvar: function(imagemBase64)
         *   - aoCancelar: function()
         */
        abrir: function (opcoes = {}) {
            injetarEstilos();

            const {
                arquivo,
                tipo = 'produto',
                tamanho = (tipo === 'perfil' ? 400 : 800),
                aoSalvar,
                aoCancelar
            } = opcoes;

            if (!arquivo) {
                console.warn('ItaimFoto: Nenhum arquivo fornecido.');
                return;
            }

            // Lê o arquivo para imagem
            const leitor = new FileReader();
            leitor.onload = function (e) {
                ItaimFoto._montarModal(e.target.result, tipo, tamanho, aoSalvar, aoCancelar);
            };

            if (typeof arquivo === 'string') {
                ItaimFoto._montarModal(arquivo, tipo, tamanho, aoSalvar, aoCancelar);
            } else if (arquivo instanceof Blob || arquivo instanceof File) {
                leitor.readAsDataURL(arquivo);
            }
        },

        /**
         * Atalho direto para foto de Perfil
         */
        ajustarPerfil: function (arquivo, callback) {
            this.abrir({
                arquivo: arquivo,
                tipo: 'perfil',
                tamanho: 400,
                aoSalvar: callback
            });
        },

        /**
         * Atalho direto para foto de Produto
         */
        ajustarProduto: function (arquivo, callback) {
            this.abrir({
                arquivo: arquivo,
                tipo: 'produto',
                tamanho: 800,
                aoSalvar: callback
            });
        },

        /**
         * Ajuste automático sem abrir modal (compatibilidade com chamadas diretas)
         */
        ajustar: function (arquivoOuUrl, tamanho = 800, callback) {
            return new Promise((resolve) => {
                // Abre o ajustador visual interativo
                ItaimFoto.abrir({
                    arquivo: arquivoOuUrl,
                    tamanho: tamanho,
                    tipo: tamanho <= 450 ? 'perfil' : 'produto',
                    aoSalvar: function (foto) {
                        if (typeof callback === 'function') callback(foto);
                        resolve(foto);
                    },
                    aoCancelar: function () {
                        // Se cancelar o ajuste fino, corta automaticamente no centro
                        ItaimFoto.cortarAutomatico(arquivoOuUrl, tamanho, function (fotoAuto) {
                            if (typeof callback === 'function') callback(fotoAuto);
                            resolve(fotoAuto);
                        });
                    }
                });
            });
        },

        /**
         * Cortador 100% automático centralizado (sem abrir janela)
         */
        cortarAutomatico: function (arquivoOuUrl, tamanho = 800, callback) {
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
                    if (callback) callback(resultado);
                };
                img.src = dataUrl;
            };

            if (typeof arquivoOuUrl === 'string') {
                processar(arquivoOuUrl);
            } else {
                const r = new FileReader();
                r.onload = (e) => processar(e.target.result);
                r.readAsDataURL(arquivoOuUrl);
            }
        },

        /**
         * Cria a interface do Modal de Ajuste na tela
         */
        _montarModal: function (srcImagem, tipo, tamanhoFinal, aoSalvar, aoCancelar) {
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

            // Carrega imagem no canvas interativo
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
            let zoom = 1.0;
            let angulo = 0; // em graus: 0, 90, 180, 270
            let posX = 0;
            let posY = 0;

            let arrastando = false;
            let inicioX = 0;
            let inicioY = 0;

            function renderizar() {
                ctx.clearRect(0, 0, viewLargura, viewAltura);
                ctx.save();

                // Move para o centro do viewport
                ctx.translate(viewLargura / 2 + posX, viewAltura / 2 + posY);
                ctx.rotate((angulo * Math.PI) / 180);
                ctx.scale(zoom, zoom);

                // Calcula escala para cobrir o viewport sem espaços vazios
                const escalaBase = Math.max(viewLargura / img.width, viewAltura / img.height);
                const dw = img.width * escalaBase;
                const dh = img.height * escalaBase;

                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';

                ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
                ctx.restore();
            }

            img.onload = function () {
                renderizar();
            };
            img.src = srcImagem;

            // Slider de Zoom
            sliderZoom.addEventListener('input', function (e) {
                zoom = parseFloat(e.target.value);
                renderizar();
            });

            // Botão Girar
            btnGirar.addEventListener('click', function () {
                angulo = (angulo + 90) % 360;
                renderizar();
            });

            // Arrastar com Mouse
            viewport.addEventListener('mousedown', function (e) {
                arrastando = true;
                inicioX = e.clientX - posX;
                inicioY = e.clientY - posY;
            });

            window.addEventListener('mousemove', function (e) {
                if (!arrastando) return;
                posX = e.clientX - inicioX;
                posY = e.clientY - inicioY;
                renderizar();
            });

            window.addEventListener('mouseup', function () {
                arrastando = false;
            });

            // Arrastar com Toque (Touch / Mobile)
            viewport.addEventListener('touchstart', function (e) {
                if (e.touches.length === 1) {
                    arrastando = true;
                    inicioX = e.touches[0].clientX - posX;
                    inicioY = e.touches[0].clientY - posY;
                }
            }, { passive: true });

            viewport.addEventListener('touchmove', function (e) {
                if (!arrastando || e.touches.length !== 1) return;
                posX = e.touches[0].clientX - inicioX;
                posY = e.touches[0].clientY - inicioY;
                renderizar();
            }, { passive: true });

            viewport.addEventListener('touchend', function () {
                arrastando = false;
            });

            // Fechar Modal
            function fechar() {
                backdrop.remove();
            }

            btnFechar.addEventListener('click', () => {
                fechar();
                if (aoCancelar) aoCancelar();
            });

            btnCancelar.addEventListener('click', () => {
                fechar();
                if (aoCancelar) aoCancelar();
            });

            // Salvar e gerar imagem final em alta qualidade
            btnSalvar.addEventListener('click', function () {
                const canvasSaida = document.createElement('canvas');
                canvasSaida.width = tamanhoFinal;
                canvasSaida.height = tamanhoFinal;
                const ctxSaida = canvasSaida.getContext('2d');

                const escalaFinal = tamanhoFinal / viewLargura;

                ctxSaida.imageSmoothingEnabled = true;
                ctxSaida.imageSmoothingQuality = 'high';

                ctxSaida.save();
                ctxSaida.translate((viewLargura / 2 + posX) * escalaFinal, (viewAltura / 2 + posY) * escalaFinal);
                ctxSaida.rotate((angulo * Math.PI) / 180);
                ctxSaida.scale(zoom * escalaFinal, zoom * escalaFinal);

                const escalaBase = Math.max(viewLargura / img.width, viewAltura / img.height);
                const dw = img.width * escalaBase;
                const dh = img.height * escalaBase;

                ctxSaida.drawImage(img, -dw / 2, -dh / 2, dw, dh);
                ctxSaida.restore();

                const fotoAjustada = canvasSaida.toDataURL('image/jpeg', 0.88);

                fechar();
                if (typeof aoSalvar === 'function') {
                    aoSalvar(fotoAjustada);
                }
            });
        }
    };

    // Disponibiliza a API globalmente
    window.ItaimFoto = ItaimFoto;
    window.AjustarFoto = ItaimFoto;

})(window);
