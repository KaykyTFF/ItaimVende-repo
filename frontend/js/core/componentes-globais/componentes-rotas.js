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
     * Identifica o nome semântico da página atual a partir da URL (suporta tanto Clean URLs quanto arquivos .html)
     */
    function obterIdentificadorPagina() {
        if (window.ItaimRotas && typeof window.ItaimRotas.identificarRota === 'function') {
            const id = window.ItaimRotas.identificarRota(window.location.pathname);
            if (id) return id;
        }
        if (window.ItaimRotasMapa && typeof window.ItaimRotasMapa.identificarRota === 'function') {
            const id = window.ItaimRotasMapa.identificarRota(window.location.pathname);
            if (id) return id;
        }

        const path = window.location.pathname.toLowerCase();
        if (path.includes('meus-anuncios')) return 'meus-anuncios';
        if (path.includes('perfil')) return 'perfil';
        if (path.includes('favoritos')) return 'favoritos';
        if (path.includes('vender')) return 'vender';
        if (path.includes('notificacoes')) return 'notificacoes';
        if (path.includes('conversas') || path.includes('chat')) return 'conversas';
        if (path.includes('configuracoes')) return 'configuracoes';
        if (path.includes('categoria')) return 'categoria';
        if (path.includes('produto')) return 'produto';
        if (path.includes('vendedor')) return 'vendedor';
        if (path.includes('painel')) return 'painel';
        if (path.includes('tickets') || path.includes('moderacao')) return 'tickets';
        if (path.includes('cadastro')) return 'cadastro';
        if (path.includes('login') || path.includes('index')) return 'login';
        return 'home';
    }

    window.ItaimComponentesRotas = {
        urlPara,
        assetPara,
        obterIdentificadorPagina
    };

})();
