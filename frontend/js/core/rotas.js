/**
 * ITAIM VENDE - RESOLVEDOR CENTRAL DE ROTAS E ASSETS (JS/CORE/ROTAS.JS)
 * Garante compatibilidade total e navegação fluida em qualquer nível de pasta,
 * com suporte completo a parâmetros de busca (?query), âncoras (#hash) e URLs amigáveis.
 */

(function() {
    'use strict';

    const ItaimRotas = {
        /**
         * Retorna o prefixo relativo para a raiz da pasta frontend ('./' ou '../../')
         */
        obterRaiz() {
            const path = window.location.pathname.replace(/\\/g, '/').toLowerCase();
            if (path.includes('/pages/')) {
                return '../../';
            }
            return './';
        },

        /**
         * Mapeamento canônico das páginas da plataforma
         */
        mapa: {
            'index': 'index.html',
            'login': 'index.html',
            'index.html': 'index.html',
            'home': 'pages/home/home.html',
            'home.html': 'pages/home/home.html',
            'categoria': 'pages/produtos/categoria.html',
            'categoria.html': 'pages/produtos/categoria.html',
            'produto': 'pages/produtos/produto.html',
            'produto.html': 'pages/produtos/produto.html',
            'vender': 'pages/vender/vender.html',
            'vender.html': 'pages/vender/vender.html',
            'meus-anuncios': 'pages/vender/meus-anuncios.html',
            'meus-anuncios.html': 'pages/vender/meus-anuncios.html',
            'conversas': 'pages/mensagens/conversas.html',
            'conversas.html': 'pages/mensagens/conversas.html',
            'chat': 'pages/mensagens/conversas.html',
            'chat.html': 'pages/mensagens/chat.html',
            'perfil': 'pages/perfil/perfil.html',
            'perfil.html': 'pages/perfil/perfil.html',
            'vendedor': 'pages/perfil/vendedor.html',
            'vendedor.html': 'pages/perfil/vendedor.html',
            'configuracoes': 'pages/perfil/configuracoes.html',
            'configuracoes.html': 'pages/perfil/configuracoes.html',
            'favoritos': 'pages/favoritos/favoritos.html',
            'favoritos.html': 'pages/favoritos/favoritos.html',
            'notificacoes': 'pages/notificacoes/notificacoes.html',
            'notificacoes.html': 'pages/notificacoes/notificacoes.html',
            'cadastro': 'pages/auth/cadastro.html',
            'cadastro.html': 'pages/auth/cadastro.html'
        },

        /**
         * Retorna a URL correta a partir de qualquer página, suportando query params e hash
         */
        obterUrl(destino, params = '') {
            const raiz = this.obterRaiz();
            let rotaBase = destino || '';
            let hash = '';

            // 1. Extrai âncora (#hash) caso venha em params ou em destino
            if (params && params.includes('#')) {
                const idxHash = params.indexOf('#');
                hash = params.slice(idxHash);
                params = params.slice(0, idxHash);
            }
            if (rotaBase.includes('#')) {
                const idxHash = rotaBase.indexOf('#');
                if (!hash) hash = rotaBase.slice(idxHash);
                rotaBase = rotaBase.slice(0, idxHash);
            }

            // 2. Extrai parâmetros de busca (?query) do destino
            if (rotaBase.includes('?')) {
                const partes = rotaBase.split('?');
                rotaBase = partes[0];
                const queryEmRota = partes[1];
                params = queryEmRota + (params ? '&' + params.replace(/^\?/, '') : '');
            }

            // 3. Mapeia para a rota canônica
            rotaBase = this.mapa[rotaBase] || rotaBase;

            // 4. Monta a URL final
            let urlFinal = raiz + rotaBase;
            if (params) {
                const prefixo = (params.startsWith('?') || params.startsWith('&')) ? params.charAt(0) : '?';
                const limpo = params.replace(/^[\?&]/, '');
                if (limpo) {
                    urlFinal += '?' + limpo;
                }
            }
            if (hash) {
                urlFinal += (hash.startsWith('#') ? '' : '#') + hash;
            }

            return urlFinal;
        },

        /**
         * Navega diretamente para uma página
         */
        navegarPara(destino, params = '') {
            window.location.href = this.obterUrl(destino, params);
        },

        /**
         * Resolve o caminho de um asset (imagem, ícone, banner, upload)
         */
        obterAsset(caminho) {
            if (!caminho || caminho.startsWith('data:') || caminho.startsWith('http://') || caminho.startsWith('https://')) {
                return caminho;
            }
            const limpo = caminho.replace(/^(\.\.\/)+/, '').replace(/^\.\//, '');
            return this.obterRaiz() + limpo;
        }
    };

    window.ItaimRotas = ItaimRotas;
})();
