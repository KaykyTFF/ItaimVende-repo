/**
 * ITAIM VENDE - PONTO DE ENTRADA DA PÁGINA PÚBLICA DO VENDEDOR
 * Arquivo: frontend/js/pages/perfil/vendedor.js
 * 
 * Carrega dinamicamente os submódulos da pasta vendedor/:
 * - vendedor-utils.js: Parâmetros de rota, formatação de moeda e notificações toast
 * - vendedor-dados.js: Busca resiliente do vendedor, fallback local e cabeçalho
 * - vendedor-vitrine.js: Vitrine de produtos ativos e ordenação por preço/data
 * - vendedor-avaliacoes.js: Sistema de avaliações 5 estrelas e moderação de comentários
 * - index.js: Orquestrador do ciclo de vida da página
 */

(function () {
    'use strict';

    const scriptAtual = document.currentScript;
    const base = scriptAtual ? scriptAtual.src.substring(0, scriptAtual.src.lastIndexOf('/') + 1) : '';

    const arquivos = [
        'vendedor/vendedor-utils.js',
        'vendedor/vendedor-dados.js',
        'vendedor/vendedor-vitrine.js',
        'vendedor/vendedor-avaliacoes.js',
        'vendedor/index.js'
    ];

    arquivos.forEach(function (arquivo) {
        document.write('<script src="' + base + arquivo + '"><\/script>');
    });

    document.addEventListener('DOMContentLoaded', async () => {
        if (window.ItaimVendedorOrquestrador?.inicializar) {
            await window.ItaimVendedorOrquestrador.inicializar();
        }
    });

})();
