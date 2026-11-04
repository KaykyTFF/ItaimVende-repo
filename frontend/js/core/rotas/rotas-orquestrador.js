/**
 * ITAIM VENDE - RESOLVEDOR CENTRAL DE ROTAS E ASSETS (ROTAS ORQUESTRADOR)
 * Arquivo: frontend/js/core/rotas/rotas-orquestrador.js
 * 
 * Responsabilidades:
 * - Resolução do caminho raiz ('/' vs '../../') com suporte a HTTP/HTTPS e file:///
 * - Geração de links normalizados com suporte a Clean URLs, query params e hashes
 * - Resolução dinâmica de URLs de assets e imagens de uploads
 * - Navegação programática (navegarPara) e preservação segura do fluxo de login (returnTo)
 * - Interceptação inteligente de cliques internos para navegação canônica suave
 */

(function() {
    'use strict';

    const mapaModulo = window.ItaimRotasMapa || {};

    const ItaimRotas = {
        mapa: mapaModulo,

        /**
         * Verifica se o ambiente de execução é HTTP ou HTTPS
         */
        isHttp() {
            return !!(window.location.protocol && window.location.protocol.startsWith('http'));
        },

        /**
         * Verifica se o ambiente está executando diretamente arquivos físicos .html
         * (ex: VS Code Live Server, python http.server, navegação direta por arquivo)
         */
        isAmbienteFisico() {
            if (!this.isHttp()) return true;
            const path = (window.location.pathname || '').toLowerCase();
            if (path.includes('.html')) return true;
            if (window.location.port === '5500' || window.location.port === '5501' || window.location.port === '8080' || window.location.port === '8000') {
                return true;
            }
            return false;
        },

        /**
         * Retorna o prefixo relativo para a raiz da plataforma ('/' em HTTP ou '../../' em file:///)
         */
        obterRaiz() {
            // Em ambiente de servidor web (HTTP/HTTPS)
            if (this.isHttp()) {
                const path = window.location.pathname.replace(/\\/g, '/').toLowerCase();
                const frontendIdx = path.indexOf('/frontend/');
                if (frontendIdx !== -1) {
                    return path.substring(0, frontendIdx) + '/frontend/';
                }
                return '/';
            }

            // Modo local offline (file:///): calcula profundidade relativa estrita
            const path = window.location.pathname.replace(/\\/g, '/').toLowerCase();
            if (path.includes('/pages/')) {
                return '../../';
            }
            return './';
        },

        /**
         * Identifica semanticamente o nome da rota a partir de qualquer string, link ou URL
         */
        identificarRota(caminhoOuUrl) {
            if (typeof mapaModulo.identificarRota === 'function') {
                return mapaModulo.identificarRota(caminhoOuUrl);
            }
            return '';
        },

        /**
         * Retorna a URL correta a partir de qualquer página, suportando query params e hash
         */
        obterUrl(destino, params = '') {
            let hash = '';
            let rotaBase = destino || '';

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
            const rotaId = this.identificarRota(rotaBase) || rotaBase;
            const raiz = this.obterRaiz();
            let urlFinal = '';

            if (this.isAmbienteFisico()) {
                // AMBIENTE COM ARQUIVOS FÍSICOS (Live Server, static server, file:///):
                // Resolve o arquivo físico HTML correspondente para garantir navegação 100% sem 404
                let arqFisico = (mapaModulo.ARQUIVOS_FISICOS && mapaModulo.ARQUIVOS_FISICOS[rotaId]) || (rotaBase.endsWith('.html') ? rotaBase : (rotaBase + '.html'));
                if (arqFisico.includes('#')) {
                    const partes = arqFisico.split('#');
                    arqFisico = partes[0];
                    if (!hash) hash = partes[1];
                }
                urlFinal = raiz + arqFisico.replace(/^\//, '');
            } else {
                // AMBIENTE SERVIDOR COM REESCRITA CANÔNICA (Express Backend):
                if (rotaId === 'home' || rotaBase === '/' || rotaBase === '') {
                    urlFinal = raiz; // Raiz limpa para a Home
                } else if (rotaId === 'cadastro') {
                    urlFinal = raiz + 'cadastro';
                } else if (mapaModulo.ROTAS_CANONICAS && mapaModulo.ROTAS_CANONICAS[rotaId]) {
                    const caminhoLimpo = mapaModulo.ROTAS_CANONICAS[rotaId].replace(/^\//, '');
                    urlFinal = raiz + caminhoLimpo;
                } else {
                    const limpo = rotaBase.replace(/^\//, '').replace(/\.html$/, '');
                    urlFinal = raiz + limpo;
                }
            }

            // 4. Anexa parâmetros de busca (?query)
            if (params) {
                const limpo = params.replace(/^[\?&]/, '');
                if (limpo) {
                    urlFinal += (urlFinal.includes('?') ? '&' : '?') + limpo;
                }
            }

            // 5. Anexa âncora (#hash)
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
            if (document.body) {
                document.body.classList.add('pagina-saindo');
            }

            // Timeout para transição suave antes da navegação do navegador
            setTimeout(() => {
                if (bar) bar.style.width = '95%';
                window.location.href = urlDestino;
            }, 180);
        },

        /**
         * Salva URL de destino pós-login com validação preventiva anti-loop e anti-404
         */
        salvarDestinoLogin(url) {
            try {
                if (!url) return;
                const urlStr = String(url).trim();
                const rotaId = this.identificarRota(urlStr);
                // Nunca salva rotas de autenticação, index ou de erro 404
                if (['login', 'cadastro', 'index', '404'].includes(rotaId)) {
                    return;
                }
                if (!urlStr.includes('index.html') && 
                    !urlStr.includes('login') && 
                    !urlStr.includes('cadastro') && 
                    !urlStr.includes('404')) {
                    sessionStorage.setItem('itaim_return_to', urlStr);
                }
            } catch (e) {}
        },

        /**
         * Recupera o destino pretendido após o login, garantindo rota válida e segura
         */
        obterDestinoPosLogin() {
            try {
                const urlParams = new URLSearchParams(window.location.search);
                let returnTo = urlParams.get('returnTo');
                if (!returnTo) {
                    returnTo = sessionStorage.getItem('itaim_return_to');
                }
                if (returnTo) {
                    sessionStorage.removeItem('itaim_return_to');
                    const returnToDecoded = decodeURIComponent(returnTo).trim();
                    const rotaId = this.identificarRota(returnToDecoded);
                    if (rotaId && !['login', 'cadastro', 'index', '404'].includes(rotaId)) {
                        const query = returnToDecoded.includes('?') ? returnToDecoded.split('?')[1] : '';
                        return this.obterUrl(rotaId, query);
                    }
                    if (!returnToDecoded.includes('index.html') && 
                        !returnToDecoded.includes('login') && 
                        !returnToDecoded.includes('cadastro') && 
                        !returnToDecoded.includes('404')) {
                        return returnToDecoded;
                    }
                }
            } catch (e) {}
            return this.obterUrl('home');
        },

        /**
         * Navega diretamente para uma página com transição suave
         */
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
                'mascote-404.png': 'assets/logos/mascote-404.png',

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

            // Se for o placeholder oficial de produto
            if (nomeBase === 'produto-placeholder.svg' || limpo.includes('produto-placeholder')) {
                limpo = 'assets/placeholders/produto-placeholder.svg';
            } else if (mapaSubpastas[nomeBase] && (limpo === `assets/${nomeBase}` || limpo === nomeBase)) {
                limpo = mapaSubpastas[nomeBase];
            }

            const raiz = this.obterRaiz();
            if (raiz.endsWith('/') && limpo.startsWith('/')) {
                return raiz + limpo.substring(1);
            }
            return raiz + limpo;
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

                // Normaliza o destino usando o orquestrador para evitar 404 em links legados
                e.preventDefault();
                const rotaId = ItaimRotas.identificarRota(destinoUrl.pathname);
                let urlFinal = destinoUrl.href;
                if (rotaId) {
                    const search = destinoUrl.search ? destinoUrl.search.substring(1) : '';
                    const hash = destinoUrl.hash ? destinoUrl.hash.substring(1) : '';
                    urlFinal = ItaimRotas.obterUrl(rotaId, search + (hash ? '#' + hash : ''));
                }

                ItaimRotas.executarTransicao(urlFinal);
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
