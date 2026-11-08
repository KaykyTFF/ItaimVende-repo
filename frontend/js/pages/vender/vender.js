/**
 * ITAIM VENDE - PONTO DE ENTRADA DO PROCESSO DE ANÚNCIO ("CRIAR ANÚNCIO / VENDER")
 * Arquivo: frontend/js/pages/vender/vender.js
 * 
 * Orquestrador modular que carrega os submódulos da pasta anuncio/:
 * - vender-estado.js: Estado compartilhado, mapeamentos, validações de foto e toasts
 * - vender-fotos.js: Upload dinâmico, drag-and-drop, galeria e contador
 * - vender-localizacao.js: Modal de locais de retirada com endereços salvos e cadastro
 * - vender-wizard.js: Navegação por etapas (1 a 4), dropdowns em pílula e máscara de preço
 * - vender-publicacao.js: Live preview da revisão, modo de edição e publicação final
 * - index.js: Orquestrador do ciclo de vida da página
 */

(function () {
    'use strict';

    const scriptAtual = document.currentScript;
    const base = scriptAtual ? scriptAtual.src.substring(0, scriptAtual.src.lastIndexOf('/') + 1) : '';

    // Se os módulos já não tiverem sido carregados individualmente pelo HTML
    if (!window.ItaimVenderOrquestrador) {
        const arquivos = [
            'anuncio/vender-estado.js',
            'anuncio/vender-fotos.js',
            'anuncio/vender-localizacao.js',
            'anuncio/vender-wizard.js',
            'anuncio/vender-publicacao.js',
            'anuncio/index.js'
        ];

        arquivos.forEach(function (arquivo) {
            document.write('<script src="' + base + arquivo + '?v=2"><\/script>');
        });
    }

    document.addEventListener('DOMContentLoaded', async () => {
        if (window.ItaimVenderOrquestrador?.inicializar) {
            await window.ItaimVenderOrquestrador.inicializar();
        }
    });
})();
