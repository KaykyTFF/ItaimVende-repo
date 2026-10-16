/**
 * ITAIM VENDE - ROTEAMENTO E IDENTIFICAÇÃO DE PÁGINAS (COMPONENTES ROTAS)
 * Arquivo: frontend/js/core/componentes-globais/componentes-rotas.js
 * 
 * Responsabilidades:
 * - Identificação da página ativa no navegador para destacar menus e abas
 * - Helpers de resolução de URLs e assets relativos/absolutos
 */

(function() {
    'use strict';

    const urlPara = (dest, params = '') => (window.ItaimRotas ? window.ItaimRotas.obterUrl(dest, params) : dest);
    const assetPara = (caminho) => (window.ItaimRotas ? window.ItaimRotas.obterAsset(caminho) : caminho);

    /**
     * Identifica o nome semântico da página atual a partir da URL
     */
    function obterIdentificadorPagina() {
        const path = window.location.pathname.toLowerCase();
        if (path.includes('meus-anuncios.html')) return 'meus-anuncios';
        if (path.includes('perfil.html')) return 'perfil';
        if (path.includes('favoritos.html')) return 'favoritos';
        if (path.includes('vender.html')) return 'vender';
        if (path.includes('notificacoes.html')) return 'notificacoes';
        if (path.includes('conversas.html') || path.includes('chat.html')) return 'conversas';
        if (path.includes('configuracoes.html')) return 'configuracoes';
        if (path.includes('categoria.html')) return 'categoria';
        if (path.includes('produto.html')) return 'produto';
        if (path.includes('vendedor.html')) return 'vendedor';
        if (path.includes('painel.html')) return 'painel';
        return 'home';
    }

    window.ItaimComponentesRotas = {
        urlPara,
        assetPara,
        obterIdentificadorPagina
    };

})();
