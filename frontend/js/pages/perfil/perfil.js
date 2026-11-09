/**
 * ITAIM VENDE - PONTO DE ENTRADA DO PERFIL DO USUÁRIO / VENDEDOR
 * Arquivo: frontend/js/pages/perfil/perfil.js
 * 
 * Carrega dinamicamente os submódulos da pasta perfil/:
 * - perfil-utils.js: Parâmetros de rota, formatações de moeda e telefone
 * - perfil-dados.js: Carregamento do perfil ativo ou de terceiros e banner
 * - perfil-avatar-upload.js: Upload profissional multipart e recorte 1:1
 * - perfil-anuncios.js: Vitrine de produtos do usuário e métricas
 * - perfil-avaliacoes.js: Sistema de avaliações, estrelas e reputação
 * - index.js: Orquestrador do ciclo de vida da página
 */

(function () {
    'use strict';

    const scriptAtual = document.currentScript;
    const base = scriptAtual ? scriptAtual.src.substring(0, scriptAtual.src.lastIndexOf('/') + 1) : '';

    const arquivos = [
        'perfil/perfil-utils.js',
        'perfil/perfil-dados.js',
        'perfil/perfil-avatar-upload.js',
        'perfil/perfil-anuncios.js',
        'perfil/perfil-avaliacoes.js',
        'perfil/index.js'
    ];

    arquivos.forEach(function (arquivo) {
        document.write('<script src="' + base + arquivo + '?v=9"><\/script>');
    });

    document.addEventListener('DOMContentLoaded', async () => {
        if (window.ItaimPerfilOrquestrador?.inicializar) {
            await window.ItaimPerfilOrquestrador.inicializar();
        }
    });

})();
