/**
 * ITAIM VENDE - MÓDULO DE AVALIAÇÕES E REPUTAÇÃO DO VENDEDOR
 * Arquivo: frontend/js/core/sessao/sessao-avaliacoes.js
 * 
 * Responsabilidades:
 * - Sistema de avaliações (1 a 5 estrelas) por vendedor/usuário
 * - Cálculo dinâmico e em tempo real da média de notas
 * - Purgação de comentários falsos/estáticos de mockup
 * - Atualização da reputação no cadastro do vendedor em itaim_usuarios_db
 * - Disparo de notificação para o vendedor ao receber nova avaliação
 */

(function() {
    'use strict';

    // Helper interno para carregar a base de usuários com segurança
    function obterListaUsuarios() {
        if (window.ItaimSessaoAuth && typeof window.ItaimSessaoAuth.carregarUsuarios === 'function') {
            return window.ItaimSessaoAuth.carregarUsuarios();
        }
        if (window.ItaimSessao && typeof window.ItaimSessao.obterTodosUsuarios === 'function') {
            return window.ItaimSessao.obterTodosUsuarios();
        }
        try {
            return JSON.parse(localStorage.getItem('itaim_usuarios_db') || '[]');
        } catch(e) {
            return [];
        }
    }

    // Helper interno para salvar a base de usuários
    function salvarListaUsuarios(usuarios) {
        try {
            localStorage.setItem('itaim_usuarios_db', JSON.stringify(usuarios));
        } catch(e) {}
    }

    // Helper para disparar notificação de avaliação
    function dispararNotificacaoAvaliacao(vendedor, novaAvaliacao) {
        if (window.ItaimNotificacoes && typeof window.ItaimNotificacoes.notificarNovaAvaliacao === 'function') {
            window.ItaimNotificacoes.notificarNovaAvaliacao(vendedor, novaAvaliacao);
        } else if (window.ItaimSessao && typeof window.ItaimSessao.notificarNovaAvaliacao === 'function') {
            window.ItaimSessao.notificarNovaAvaliacao(vendedor, novaAvaliacao);
        }
    }

    // ========================================================================
    // API GLOBAL DE AVALIAÇÕES (0 A 5 ESTRELAS) TOTALMENTE FUNCIONAL
    // ========================================================================
    const ItaimAvaliacoes = {
        /**
         * Gera chave única e sanitizada de armazenamento para cada vendedor
         */
        obterChave: function(vendedor) {
            if (!vendedor) return 'seller_admin';
            
            // Se for string (email, username ou nome)
            if (typeof vendedor === 'string') {
                const s = vendedor.toLowerCase().trim();
                const todos = obterListaUsuarios();
                const u = todos.find(user => 
                    (user.email || '').toLowerCase() === s || 
                    (user.username || '').toLowerCase() === s ||
                    (user.nome || '').toLowerCase() === s
                );
                if (u) return 'seller_' + (u.username || u.id || 'admin').toLowerCase();
                return 'seller_' + s.replace(/[^a-z0-9]/g, '_');
            }

            // Se for objeto de vendedor/usuário
            if (typeof vendedor === 'object') {
                const todos = obterListaUsuarios();
                const vId = vendedor.id ? String(vendedor.id) : null;
                const vEmail = (vendedor.email || '').toLowerCase().trim();
                const vUser = (vendedor.username || '').toLowerCase().trim();
                const vNome = (vendedor.nome || '').toLowerCase().trim();

                const u = todos.find(user => 
                    (vId && String(user.id) === vId) ||
                    (vEmail && (user.email || '').toLowerCase() === vEmail) ||
                    (vUser && (user.username || '').toLowerCase() === vUser) ||
                    (vNome && (user.nome || '').toLowerCase() === vNome)
                );

                if (u) {
                    return 'seller_' + (u.username || u.id || 'admin').toLowerCase();
                }

                const fallback = vUser || vEmail || vNome || (vId ? 'id_' + vId : 'admin');
                return 'seller_' + fallback.replace(/[^a-z0-9]/g, '_');
            }

            return 'seller_admin';
        },

        /**
         * Obtém lista de avaliações do vendedor, purga comentários falsos de mock
         */
        obter: function(vendedor) {
            const chave = 'itaim_avaliacoes_' + this.obterChave(vendedor);
            let lista = [];
            try {
                const salvo = localStorage.getItem(chave);
                if (salvo) {
                    const parsed = JSON.parse(salvo);
                    if (Array.isArray(parsed)) {
                        // Purga comentários falsos de enfeite
                        lista = parsed.filter(item => {
                            if (!item) return false;
                            const autor = (item.autor || '').trim();
                            const com = (item.comentario || '').trim();
                            if (autor === 'Lucas Ribeiro' || autor === 'Ana Paula') return false;
                            if (com.includes('WhatsApp e o produto veio exatamente')) return false;
                            if (com.includes('Negociação tranquila e segura')) return false;
                            return true;
                        });
                        // Salva se filtrou algum falso
                        if (lista.length !== parsed.length) {
                            localStorage.setItem(chave, JSON.stringify(lista));
                        }
                    }
                }
            } catch(e) {}

            return lista;
        },

        /**
         * Adiciona nova avaliação para o vendedor e recalcula reputação
         */
        adicionar: function(vendedor, review) {
            const chave = 'itaim_avaliacoes_' + this.obterChave(vendedor);
            const lista = this.obter(vendedor);
            const novaNota = Math.min(5, Math.max(1, parseFloat(review.nota) || 5));
            const novoComentario = (review.comentario || '').trim();
            const autorNome = (review.autor || '').trim() || 'Comprador';

            if (!novoComentario) return lista;

            const novaAvaliacao = {
                id: Date.now(),
                autor: autorNome,
                nota: novaNota,
                data: 'Hoje',
                comentario: novoComentario
            };

            lista.unshift(novaAvaliacao);

            try {
                localStorage.setItem(chave, JSON.stringify(lista));
            } catch(e) {}

            // Recalcula média e atualiza permanentemente no cadastro do vendedor
            const stats = this.calcularMedia(lista);
            try {
                const todos = obterListaUsuarios();
                const chaveVend = this.obterChave(vendedor);
                const uIdx = todos.findIndex(u => this.obterChave(u) === chaveVend);
                if (uIdx !== -1) {
                    todos[uIdx].avaliacao = stats.media;
                    todos[uIdx].totalAvaliacoes = stats.total;
                    salvarListaUsuarios(todos);
                }
            } catch(e) {}

            // Dispara notificação de avaliação para o vendedor
            try {
                dispararNotificacaoAvaliacao(vendedor, novaAvaliacao);
            } catch(e) {}

            return lista;
        },

        /**
         * Exclui uma avaliação e recalcula reputação
         */
        excluir: function(vendedor, idAvaliacao) {
            const chave = 'itaim_avaliacoes_' + this.obterChave(vendedor);
            let lista = this.obter(vendedor);
            lista = lista.filter(item => String(item.id) !== String(idAvaliacao));

            try {
                localStorage.setItem(chave, JSON.stringify(lista));
            } catch(e) {}

            // Recalcula média e atualiza permanentemente no cadastro do vendedor
            const stats = this.calcularMedia(lista);
            try {
                const todos = obterListaUsuarios();
                const chaveVend = this.obterChave(vendedor);
                const uIdx = todos.findIndex(u => this.obterChave(u) === chaveVend);
                if (uIdx !== -1) {
                    todos[uIdx].avaliacao = stats.media;
                    todos[uIdx].totalAvaliacoes = stats.total;
                    salvarListaUsuarios(todos);
                }
            } catch(e) {}

            return lista;
        },

        /**
         * Calcula média e total de avaliações formatados
         */
        calcularMedia: function(lista, perfil = null) {
            if (!lista || !Array.isArray(lista) || lista.length === 0) {
                if (perfil && Number(perfil.ratingCount || perfil.totalAvaliacoes || 0) > 0) {
                    const totalRatings = Number(perfil.ratingCount || perfil.totalAvaliacoes);
                    const mediaVal = Number(perfil.ratingAverage || perfil.avaliacao || 0).toFixed(1);
                    return {
                        media: mediaVal,
                        mediaNum: parseFloat(mediaVal),
                        total: totalRatings,
                        estrelasFormatadas: `${mediaVal} ★`
                    };
                }
                return {
                    media: '0.0',
                    mediaNum: 0,
                    total: 0,
                    estrelasFormatadas: '0.0 ★'
                };
            }
            const soma = lista.reduce((acc, curr) => acc + (parseFloat(curr.nota) || 0), 0);
            const mediaNum = soma / lista.length;
            const mediaStr = mediaNum.toFixed(1);
            return {
                media: mediaStr,
                mediaNum: mediaNum,
                total: lista.length,
                estrelasFormatadas: `${mediaStr} ★`
            };
        }
    };

    // Exporta API no namespace global e dedicado
    window.ItaimAvaliacoes = ItaimAvaliacoes;
    window.ItaimSessaoAvaliacoes = ItaimAvaliacoes;

})();
