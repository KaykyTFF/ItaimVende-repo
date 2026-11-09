/**
 * ITAIM VENDE - SERVIÇO DE UPLOAD DE ARQUIVOS (API UPLOAD)
 * Arquivo: frontend/js/core/api/api-upload.js
 * 
 * Responsabilidades:
 * - Upload multipart de fotos de perfil (salvas em /uploads/perfil/)
 * - Upload multipart de fotos de produtos e vendas (salvas em /uploads/vendas/)
 * - Suporte transparente para File, Blob e Strings Base64 (dataURL)
 * - Compatibilidade com chamadas únicas e em lote
 */

(function() {
    'use strict';

    function getCore() {
        return window.ItaimApiCore || {
            requisicao: () => Promise.reject(new Error('ItaimApiCore não carregado')),
            obterHeaders: () => ({}),
            dataURLParaBlob: (url) => new Blob([url])
        };
    }

    const upload = {
        /**
         * Envio de foto de perfil (salva em /uploads/perfil/)
         * Aceita File, Blob ou String Base64 (dataURL)
         */
        async perfil(foto) {
            const formData = new FormData();
            let arquivo = foto;

            if (typeof foto === 'string' && foto.startsWith('data:')) {
                arquivo = getCore().dataURLParaBlob(foto);
            }

            formData.append('image', arquivo, 'foto_perfil.jpg');

            return getCore().requisicao('/upload/perfil', {
                method: 'POST',
                headers: getCore().obterHeaders(false),
                body: formData
            });
        },

        async avatar(foto) {
            return this.perfil(foto);
        },

        /**
         * Envio de foto / anexo do chat
         */
        async chat(foto) {
            const formData = new FormData();
            let arquivo = foto;

            if (typeof foto === 'string' && foto.startsWith('data:')) {
                arquivo = getCore().dataURLParaBlob(foto);
            }

            formData.append('image', arquivo, 'foto_chat.jpg');

            return getCore().requisicao('/upload/chat', {
                method: 'POST',
                headers: getCore().obterHeaders(false),
                body: formData
            });
        },

        /**
         * Normaliza URLs de imagens já existentes no servidor para o formato canônico do banco
         */
        _normalizarUrlExistente(url) {
            if (!url || typeof url !== 'string') return '';
            const limpo = url.trim();
            if (limpo.startsWith('data:')) return limpo;

            const idxUploads = limpo.indexOf('/uploads/');
            if (idxUploads !== -1) {
                return limpo.substring(idxUploads);
            }

            const idxAssets = limpo.indexOf('assets/');
            if (idxAssets !== -1 && !limpo.startsWith('http://') && !limpo.startsWith('https://')) {
                return limpo.substring(idxAssets);
            }
            if ((limpo.startsWith('http://localhost') || limpo.startsWith('http://127.0.0.1')) && idxAssets !== -1) {
                return limpo.substring(idxAssets);
            }

            return limpo;
        },

        /**
         * Envio de múltiplas fotos para anúncios/vendas (salva em /uploads/vendas/ - máx 6)
         * Aceita Array misto de URLs já salvas, File, Blob ou Strings Base64 (dataURL),
         * preservando as fotos existentes e a ordem exata da galeria.
         */
        async vendas(fotos = []) {
            if (!fotos || fotos.length === 0) {
                return { success: true, urls: [] };
            }

            const formData = new FormData();
            const indicesNovasFotos = [];

            fotos.forEach((foto, index) => {
                if (typeof foto === 'string' && foto.startsWith('data:')) {
                    const arquivo = getCore().dataURLParaBlob(foto);
                    formData.append('images', arquivo, `venda_${index + 1}.jpg`);
                    indicesNovasFotos.push(index);
                } else if (foto instanceof File || foto instanceof Blob) {
                    formData.append('images', foto, foto.name || `venda_${index + 1}.jpg`);
                    indicesNovasFotos.push(index);
                }
            });

            // Se todas as fotos já são URLs existentes (nenhuma foto nova adicionada),
            // retorna as URLs existentes normalizadas sem disparar requisição vazia
            if (indicesNovasFotos.length === 0) {
                const urlsExistentes = fotos
                    .map(f => (typeof f === 'string' ? this._normalizarUrlExistente(f) : ''))
                    .filter(Boolean);
                return { success: true, urls: urlsExistentes };
            }

            const resUpload = await getCore().requisicao('/upload/vendas', {
                method: 'POST',
                headers: getCore().obterHeaders(false),
                body: formData
            });

            const novasUrls = (resUpload && Array.isArray(resUpload.urls)) ? resUpload.urls : [];

            // Mescla as URLs já existentes com as novas URLs enviadas mantendo a ordem original
            let ponteiroNova = 0;
            const urlsFinais = fotos.map((foto, idx) => {
                if (indicesNovasFotos.includes(idx)) {
                    const urlSubida = novasUrls[ponteiroNova++];
                    return urlSubida || (typeof foto === 'string' ? foto : '');
                }
                return typeof foto === 'string' ? this._normalizarUrlExistente(foto) : '';
            }).filter(Boolean);

            return {
                ...(resUpload || {}),
                success: true,
                urls: urlsFinais
            };
        },

        async produtos(fotos = []) {
            return this.vendas(fotos);
        },

        /**
         * Envio de foto única para venda/produto
         */
        async vendaUnica(foto) {
            const formData = new FormData();
            let arquivo = foto;

            if (typeof foto === 'string' && foto.startsWith('data:')) {
                arquivo = getCore().dataURLParaBlob(foto);
            }

            formData.append('image', arquivo, 'foto_venda.jpg');

            return getCore().requisicao('/upload/venda/single', {
                method: 'POST',
                headers: getCore().obterHeaders(false),
                body: formData
            });
        },

        /**
         * Envio de foto única (retrocompatível, padrão: perfil)
         */
        async unico(foto, categoria = 'perfil') {
            if (categoria === 'venda' || categoria === 'vendas' || categoria === 'produto' || categoria === 'produtos') {
                return this.vendaUnica(foto);
            }
            return this.perfil(foto);
        },

        unica(foto, categoria = 'perfil') {
            return this.unico(foto, categoria);
        },

        /**
         * Envio de múltiplas fotos (retrocompatível, padrão: vendas)
         */
        async multiplo(fotos = [], categoria = 'vendas') {
            return this.vendas(fotos);
        },

        multiplos(fotos = [], categoria = 'vendas') {
            return this.multiplo(fotos, categoria);
        }
    };

    window.ItaimApiUpload = upload;

})();
