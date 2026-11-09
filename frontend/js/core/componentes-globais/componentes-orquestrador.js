/**
 * ITAIM VENDE - COMPONENTES GLOBAIS E CATÁLOGO UNIFICADO (ORQUESTRADOR)
 * Arquivo: frontend/js/core/componentes-globais/index.js
 * 
 * Unifica todos os submódulos da pasta componentes-globais/ sob a interface global:
 * - componentes-rotas.js: Identificação da página ativa e resolução de URLs/assets
 * - componentes-header.js: Navbar superior e formulário de pesquisa
 * - componentes-drawer.js: Menu lateral deslizante e acordeão
 * - componentes-badges.js: Atualização de badges de conversas e notificações
 * - componentes-produtos.js: Catálogo e cards de produtos (window.ItaimProdutos)
 * 
 * Exportações Globais:
 * - window.ItaimComponentes
 * - window.ItaimProdutos
 */

(function() {
    'use strict';

    const Rotas = window.ItaimComponentesRotas || { obterIdentificadorPagina: () => 'home' };
    const Header = window.ItaimComponentesHeader || { gerarHeaderHTML: () => '' };
    const Drawer = window.ItaimComponentesDrawer || { gerarDrawerHTML: () => '' };
    const Badges = window.ItaimComponentesBadges || { atualizarBadgesGlobais: () => {} };

    /**
     * Injeta e sincroniza automaticamente o layout global da plataforma
     */
    function aplicarLayoutGlobal() {
        // Injeta ou substitui o Header Global
        let elHeader = document.querySelector('header.header-principal');
        if (!elHeader) {
            elHeader = document.createElement('header');
            elHeader.className = 'header-principal';
            elHeader.setAttribute('role', 'banner');
            document.body.insertBefore(elHeader, document.body.firstChild);
        }
        elHeader.innerHTML = Header.gerarHeaderHTML();

        // Injeta ou substitui o Menu Lateral (Drawer)
        let elDrawer = document.getElementById('drawer-backdrop');
        if (!elDrawer) {
            elDrawer = document.createElement('div');
            elDrawer.className = 'drawer-backdrop';
            elDrawer.id = 'drawer-backdrop';
            elHeader.insertAdjacentElement('afterend', elDrawer);
        }
        elDrawer.innerHTML = Drawer.gerarDrawerHTML();

        // Atualiza Badges em tempo real
        Badges.atualizarBadgesGlobais();
    }

    // Exporta API pública dos Componentes Globais
    window.ItaimComponentes = {
        obterIdentificadorPagina: Rotas.obterIdentificadorPagina,
        gerarHeaderHTML: Header.gerarHeaderHTML,
        gerarDrawerHTML: Drawer.gerarDrawerHTML,
        aplicarLayoutGlobal,
        atualizarBadgesGlobais: Badges.atualizarBadgesGlobais
    };

    // Bootstrap Automático
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', aplicarLayoutGlobal);
    } else {
        aplicarLayoutGlobal();
    }

    // Sincroniza badges quando o storage sofrer alterações em outras abas
    window.addEventListener('storage', (e) => {
        if (e.key === 'itaim_conversas' || e.key === 'itaim_notificacoes' || e.key === 'itaim_favoritos') {
            Badges.atualizarBadgesGlobais();
        }
    });

})();
