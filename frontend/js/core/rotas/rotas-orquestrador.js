/**
 * ITAIM VENDE - RESOLVEDOR CENTRAL DE ROTAS E ASSETS (ROTAS ORQUESTRADOR)
 * Arquivo: frontend/js/core/rotas/rotas-orquestrador.js
 * 
 * Responsabilidades:
 * - Resolução do caminho raiz ('./' vs '../../')
 * - Geração de links normalizados com suporte a query params e hashes
 * - Resolução dinâmica de URLs de assets e imagens de uploads
 * - Navegação programática (navegarPara)
 */

(function() {
    'use strict';

    const mapa = window.ItaimRotasMapa || {};

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

        mapa: mapa,

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
            if (rotaBase.includes('#')) {
                const idxHash = rotaBase.indexOf('#');
                if (!hash) hash = rotaBase.slice(idxHash);
                rotaBase = rotaBase.slice(0, idxHash);
            }

            // Se o ambiente estiver usando Clean URLs (ex: npx serve sem extensão .html na URL do navegador)
            const usaCleanUrls = !window.location.pathname.toLowerCase().endsWith('.html') && 
                                 window.location.protocol !== 'file:' &&
                                 window.location.pathname !== '/' &&
                                 !window.location.pathname.endsWith('/');
            if (usaCleanUrls && rotaBase.endsWith('.html')) {
                rotaBase = rotaBase.replace(/\.html$/, '');
            }

            let urlFinal = raiz + rotaBase;

            if (params) {
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
         * Executa transição visual e navega para o destino com animação suave
         */
        executarTransicao(urlDestino) {
            if (!urlDestino) return;

            // Se for a mesma URL completa (mesmo caminho e mesma busca e hash), não precisa transicionar
            if (urlDestino === window.location.href) return;

            // Barra de progresso superior
            let bar = document.getElementById('itaim-transition-bar');
            if (!bar) {
                bar = document.createElement('div');
                bar.id = 'itaim-transition-bar';
                document.body.appendChild(bar);
            }
            bar.classList.remove('concluido');
            bar.classList.add('ativo');
            bar.style.width = '70%';

            // Classe de transição de saída no corpo
            document.body.classList.add('pagina-saindo');

            // Timeout para transição suave antes da navegação do navegador
            setTimeout(() => {
                bar.style.width = '95%';
                window.location.href = urlDestino;
            }, 190);
        },

        /**
         * Navega diretamente para uma página com transição suave
         */
        salvarDestinoLogin(url) {
            try {
                if (!url) return;
                const urlStr = String(url);
                if (!urlStr.includes('index.html') && !urlStr.includes('login.html') && !urlStr.includes('cadastro.html')) {
                    sessionStorage.setItem('itaim_return_to', urlStr);
                }
            } catch (e) {}
        },

        obterDestinoPosLogin() {
            try {
                const urlParams = new URLSearchParams(window.location.search);
                let returnTo = urlParams.get('returnTo');
                if (!returnTo) {
                    returnTo = sessionStorage.getItem('itaim_return_to');
                }
                if (returnTo) {
                    sessionStorage.removeItem('itaim_return_to');
                    const returnToDecoded = decodeURIComponent(returnTo);
                    if (!returnToDecoded.includes('index.html') && 
                        !returnToDecoded.includes('login.html') && 
                        !returnToDecoded.includes('cadastro.html')) {
                        return returnToDecoded;
                    }
                }
            } catch (e) {}
            return this.obterUrl('home');
        },

        navegarPara(destino, params = '') {
            const urlFinal = this.obterUrl(destino, params);
            this.executarTransicao(urlFinal);
        },

        /**
         * Resolve o caminho de um asset (imagem, ícone, banner, upload)
         */
        obterAsset(caminho) {
            if (!caminho || caminho.startsWith('data:') || caminho.startsWith('http://') || caminho.startsWith('https://')) {
                return caminho;
            }
            if (caminho.startsWith('/uploads/')) {
                const backendHost = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
                    ? 'http://localhost:3000'
                    : '';
                return `${backendHost}${caminho}`;
            }

            let limpo = caminho.replace(/^(\.\.\/)+/, '').replace(/^\.\//, '');
            const nomeBase = limpo.includes('/') ? limpo.substring(limpo.lastIndexOf('/') + 1) : limpo;

            const mapaSubpastas = {
                // Logos
                'header-logo.png': 'assets/logos/header-logo.png',
                'header1-logo.png': 'assets/logos/header1-logo.png',
                'logo-itaimvende-contorno-branco.png': 'assets/logos/logo-itaimvende-contorno-branco.png',
                'logo-login-dark-bg.png': 'assets/logos/logo-login-dark-bg.png',
                'Logo sem nome.png': 'assets/logos/Logo sem nome.png',
                'mascote-tatu-logo.png': 'assets/logos/mascote-tatu-logo.png',
                'mascote-transparente.png': 'assets/logos/mascote-transparente.png',
                'Mascote Tatu e Logo ItaimVende.png': 'assets/logos/Mascote Tatu e Logo ItaimVende.png',

                // Icons
                'icon-user.png': 'assets/icons/icon-user.png',
                'icon-user-backup.png': 'assets/icons/icon-user-backup.png',
                'icon-chat.png': 'assets/icons/icon-chat.png',
                'icon-sino.png': 'assets/icons/icon-sino.png',
                'icon-carrinho.png': 'assets/icons/icon-carrinho.png',
                'icon-perfil.png': 'assets/icons/icon-perfil.png',
                'icon-pin.png': 'assets/icons/icon-pin.png',
                'icon-security.png': 'assets/icons/icon-security.png',
                'icon-shield.png': 'assets/icons/icon-shield.png',
                'wpp.png': 'assets/icons/wpp.png',
                'chat.png': 'assets/icons/chat.png',
                'chati.png': 'assets/icons/chati.png',
                'acordo.png': 'assets/icons/acordo.png',
                'mega.png': 'assets/icons/mega.png',
                'pc.png': 'assets/icons/pc.png',
                'red.png': 'assets/icons/red.png',
                'white.png': 'assets/icons/white.png',

                // Placeholders
                'produto-placeholder.svg': 'assets/placeholders/produto-placeholder.svg',

                // Categorias
                'cat-decoracao.png': 'assets/categorias/cat-decoracao.png',
                'cat-eletronicos.png': 'assets/categorias/cat-eletronicos.png',
                'cat-esportes.png': 'assets/categorias/cat-esportes.png',
                'cat-hobbies.png': 'assets/categorias/cat-hobbies.png',
                'cat-infantil.png': 'assets/categorias/cat-infantil.png',
                'cat-moda.png': 'assets/categorias/cat-moda.png',
                'cat-moveis.png': 'assets/categorias/cat-moveis.png',
                'cat-servicos.png': 'assets/categorias/cat-servicos.png',

                // Banners
                'Banner1.png': 'assets/banners/Banner1.png',
                'Banner1-mobile.png': 'assets/banners/Banner1-mobile.png',
                'Banner2.png': 'assets/banners/Banner2.png',
                'Banner2-mobile.png': 'assets/banners/Banner2-mobile.png',
                'Banner3.png': 'assets/banners/Banner3.png',
                'Banner3-mobile.png': 'assets/banners/Banner3-mobile.png',
                'banner-controle.png': 'assets/banners/banner-controle.png',

                // Backgrounds
                'curve-background.svg': 'assets/backgrounds/curve-background.svg',
                'fundo-geometrico-verde.png': 'assets/backgrounds/fundo-geometrico-verde.png',
                'fundo-tech-verde.png': 'assets/backgrounds/fundo-tech-verde.png',
                'papel-de-parede-neon-verde.png': 'assets/backgrounds/papel-de-parede-neon-verde.png',
                'Papel de Parede Neon Verde Abstrato (1).png': 'assets/backgrounds/Papel de Parede Neon Verde Abstrato (1).png',
                'crepusculo-sobre-a-cidade-ribeirinha.png': 'assets/backgrounds/crepusculo-sobre-a-cidade-ribeirinha.png',
                'Crepúsculo sobre a cidade ribeirinha_2.png': 'assets/backgrounds/Crepúsculo sobre a cidade ribeirinha_2.png',
                'vila-ribeirinha-ao-entardecer.png': 'assets/backgrounds/vila-ribeirinha-ao-entardecer.png',
                'Vila Ribeirinha ao Entardecer.png': 'assets/backgrounds/Vila Ribeirinha ao Entardecer.png',
                'Design sem nome (5).png': 'assets/backgrounds/Design sem nome (5).png',

                // Usuarios
                'perfil-giselly.jpg': 'assets/usuarios/perfil-giselly.jpg'
            };

            // Se for um asset mapeado para subpasta e o caminho ainda estiver na raiz de assets
            if (mapaSubpastas[nomeBase] && (limpo === `assets/${nomeBase}` || limpo === nomeBase)) {
                limpo = mapaSubpastas[nomeBase];
            }

            return this.obterRaiz() + limpo;
        }
    };

    window.ItaimRotas = ItaimRotas;

    // =========================================================================
    // INICIALIZADOR DE TRANSIÇÃO GLOBAL DE PÁGINAS (ENTRADA, SAÍDA E BFCACHE)
    // =========================================================================
    function inicializarTransicoes() {
        // 1. Animação de entrada suave da página
        if (document.body) {
            document.body.classList.add('pagina-entrando');
            setTimeout(() => {
                document.body.classList.remove('pagina-entrando');
            }, 350);
        }

        // 2. Intercepta cliques em links internos para transição suave de saída
        document.addEventListener('click', (e) => {
            // Se já foi prevenido por outro script (ex: modais, acordeões), ignora
            if (e.defaultPrevented) return;

            // Ignora cliques com botão direito ou teclas modificadoras (abrir em nova aba)
            if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;

            const link = e.target.closest('a[href]');
            if (!link) return;

            const href = link.getAttribute('href');
            if (!href) return;

            // Ignora âncoras locais, javascript:, mailto:, tel:
            if (href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) {
                return;
            }

            // Ignora links que abrem em nova aba ou downloads
            if (link.target === '_blank' || link.hasAttribute('download')) {
                return;
            }

            try {
                // Analisa o destino da URL
                const destinoUrl = new URL(link.href, window.location.href);
                if (destinoUrl.origin !== window.location.origin) {
                    return;
                }

                // Ignora se for apenas âncora na mesma página atual
                const urlSemHashAtual = window.location.href.split('#')[0];
                const destinoSemHash = destinoUrl.href.split('#')[0];
                if (urlSemHashAtual === destinoSemHash && destinoUrl.hash) {
                    return;
                }

                // Executa a transição suave de saída
                e.preventDefault();
                ItaimRotas.executarTransicao(destinoUrl.href);
            } catch (err) {
                // Fallback normal
            }
        });

        // 3. Suporte a bfcache (ao voltar / avançar pelo histórico do navegador)
        window.addEventListener('pageshow', (e) => {
            if (document.body) {
                document.body.classList.remove('pagina-saindo');
                document.body.classList.add('pagina-entrando');
                setTimeout(() => {
                    document.body.classList.remove('pagina-entrando');
                }, 350);
            }
            const bar = document.getElementById('itaim-transition-bar');
            if (bar) {
                bar.classList.add('concluido');
                setTimeout(() => {
                    bar.classList.remove('ativo', 'concluido');
                    bar.style.width = '0%';
                }, 300);
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inicializarTransicoes);
    } else {
        inicializarTransicoes();
    }

})();

