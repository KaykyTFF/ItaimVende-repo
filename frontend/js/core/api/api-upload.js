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
         * Envio de múltiplas fotos para anúncios/vendas (salva em /uploads/vendas/ - máx 6)
         * Aceita Array de File, Blob ou Strings Base64
         */
        async vendas(fotos = []) {
            if (!fotos || fotos.length === 0) {
                return { success: true, urls: [] };
            }

            const formData = new FormData();

            fotos.forEach((foto, index) => {
                let arquivo = foto;
                if (typeof foto === 'string' && foto.startsWith('data:')) {
                    arquivo = getCore().dataURLParaBlob(foto);
                    formData.append('images', arquivo, `venda_${index + 1}.jpg`);
                } else if (foto instanceof File || foto instanceof Blob) {
                    formData.append('images', arquivo, foto.name || `venda_${index + 1}.jpg`);
                }
            });

            return getCore().requisicao('/upload/vendas', {
                method: 'POST',
                headers: getCore().obterHeaders(false),
                body: formData
            });
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
