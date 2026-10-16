/**
 * ITAIM VENDE - API UNIFICADA DE AJUSTE DE FOTOS (ORQUESTRADOR)
 * Arquivo: frontend/js/core/ajustar-foto/index.js
 * 
 * Unifica todos os submódulos da pasta ajustar-foto/ sob a interface global:
 * - foto-estilos.js: Tema e injeção de CSS
 * - foto-canvas.js: Motor geométrico Canvas e corte 1:1
 * - foto-modal.js: Interface e gestos interativos
 * 
 * Exportações Globais:
 * - window.ItaimFoto
 * - window.AjustarFoto
 */

(function(window) {
    'use strict';

    const Estilos = window.ItaimFotoEstilos || { injetarEstilos: () => {} };
    const CanvasMotor = window.ItaimFotoCanvas || { cortarAutomatico: () => {} };
    const ModalMotor = window.ItaimFotoModal || { montarModal: () => {} };

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
            Estilos.injetarEstilos();

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
                ModalMotor.montarModal(e.target.result, tipo, tamanho, aoSalvar, aoCancelar);
            };

            if (typeof arquivo === 'string') {
                ModalMotor.montarModal(arquivo, tipo, tamanho, aoSalvar, aoCancelar);
            } else if (arquivo instanceof Blob || arquivo instanceof File) {
                leitor.readAsDataURL(arquivo);
            }
        },

        /**
         * Atalho direto para foto de Perfil (400x400)
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
         * Atalho direto para foto de Produto (800x800)
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
            CanvasMotor.cortarAutomatico(arquivoOuUrl, tamanho, callback);
        },

        _montarModal: function (srcImagem, tipo, tamanhoFinal, aoSalvar, aoCancelar) {
            ModalMotor.montarModal(srcImagem, tipo, tamanhoFinal, aoSalvar, aoCancelar);
        }
    };

    // Disponibiliza as APIs globalmente
    window.ItaimFoto = ItaimFoto;
    window.AjustarFoto = ItaimFoto;

})(typeof window !== 'undefined' ? window : this);
