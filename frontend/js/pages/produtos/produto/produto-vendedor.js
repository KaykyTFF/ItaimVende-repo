/**
 * ITAIM VENDE - PRODUTO: DADOS DO VENDEDOR NO SIDEBAR
 * Arquivo: frontend/js/pages/produtos/produto/produto-vendedor.js
 */

(function () {
    'use strict';

    let dadosVendedor = null;

    function inicializar() {
        const produto = window.ItaimProdutoDados?.obterProduto();
        if (!produto) return;

        const fallbackAvatarVendedor = (window.ItaimRotas && typeof window.ItaimRotas.obterAsset === 'function')
            ? window.ItaimRotas.obterAsset('assets/icons/icon-user.png')
            : '../../assets/icons/icon-user.png';
        let avatarVendedor = fallbackAvatarVendedor;

        const boxVendedor = document.querySelector('.box-vendedor-sidebar');
        if (!boxVendedor) return;

        const nomeVendedorEl = document.getElementById('vendedor-nome-txt') || boxVendedor.querySelector('.vendedor-nome-selo strong');
        const cidadeVendedorEl = document.getElementById('vendedor-cidade-txt') || boxVendedor.querySelector('.vendedor-cidade-txt');
        const avatarVendedorEl = document.getElementById('vendedor-avatar-img') || boxVendedor.querySelector('.vendedor-avatar-circulo img');
        const linkPerfilVendedor = document.getElementById('link-perfil-vendedor') || boxVendedor.querySelector('.link-perfil-vendedor');
        const linkTopoVendedor = document.getElementById('link-vendedor-topo') || boxVendedor.querySelector('.vendedor-topo-row-link');

        if (produto.seller && typeof produto.seller === 'object') {
            dadosVendedor = produto.seller;
        }

        const vId = produto.vendedorId ? String(produto.vendedorId) : null;
        const vEmail = (produto.vendedorEmail || '').toLowerCase().trim();
        const vNome = (produto.vendedorNome || '').toLowerCase().trim();
        const vUsername = (produto.vendedorUsername || '').toLowerCase().trim();

        // 1. Procura em todos os usuários gerenciados pela sessão
        if (!dadosVendedor && window.ItaimSessao && typeof window.ItaimSessao.obterTodosUsuarios === 'function') {
            const todosUsuarios = window.ItaimSessao.obterTodosUsuarios();
            dadosVendedor = todosUsuarios.find(u => {
                const uId = String(u.id || '');
                const uEmail = (u.email || '').toLowerCase().trim();
                const uNome = (u.nome || '').toLowerCase().trim();
                const uUser = (u.username || '').toLowerCase().trim();
                return (vId && uId === vId) ||
                       (vEmail && uEmail === vEmail) ||
                       (vNome && (uNome === vNome || uUser === vNome)) ||
                       (vUsername && (uUser === vUsername || uNome === vUsername));
            });
        }

        // 2. Se não achou na lista em memória, busca no localStorage (itaim_usuarios_db)
        if (!dadosVendedor) {
            try {
                const db = JSON.parse(localStorage.getItem('itaim_usuarios_db') || '[]');
                if (Array.isArray(db)) {
                    dadosVendedor = db.find(u => {
                        const uId = String(u.id || '');
                        const uEmail = (u.email || '').toLowerCase().trim();
                        const uNome = (u.nome || '').toLowerCase().trim();
                        const uUser = (u.username || '').toLowerCase().trim();
                        return (vId && uId === vId) ||
                               (vEmail && uEmail === vEmail) ||
                               (vNome && (uNome === vNome || uUser === vNome)) ||
                               (vUsername && (uUser === vUsername || uNome === vUsername));
                    });
                }
            } catch(e) {}
        }

        // 3. Se ainda não achou, checa itaim_perfil_usuario
        if (!dadosVendedor) {
            try {
                const perfilLocal = JSON.parse(localStorage.getItem('itaim_perfil_usuario') || 'null');
                if (perfilLocal) {
                    const uId = String(perfilLocal.id || '');
                    const uEmail = (perfilLocal.email || '').toLowerCase().trim();
                    const uNome = (perfilLocal.nome || '').toLowerCase().trim();
                    const uUser = (perfilLocal.usuario || perfilLocal.username || '').toLowerCase().trim();
                    if ((vId && uId === vId) ||
                        (vEmail && uEmail === vEmail) ||
                        (vNome && (uNome === vNome || uUser === vNome)) ||
                        (vUsername && (uUser === vUsername || uNome === vUsername))) {
                        dadosVendedor = perfilLocal;
                    }
                }
            } catch(e) {}
        }

        // 4. Se o usuário logado for o criador do anúncio
        if (!dadosVendedor && window.ItaimSessao && typeof window.ItaimSessao.obterUsuarioLogado === 'function') {
            const userLogado = window.ItaimSessao.obterUsuarioLogado();
            if (userLogado) {
                const uId = String(userLogado.id || '');
                const uEmail = (userLogado.email || '').toLowerCase().trim();
                const uNome = (userLogado.nome || '').toLowerCase().trim();
                const uUser = (userLogado.username || '').toLowerCase().trim();
                if ((vId && uId === vId) ||
                    (vEmail && uEmail === vEmail) ||
                    (vNome && (uNome === vNome || uUser === vNome)) ||
                    (vUsername && (uUser === vUsername || uNome === vUsername))) {
                    dadosVendedor = userLogado;
                }
            }
        }

        const nomeVendedor = (dadosVendedor && (dadosVendedor.name || dadosVendedor.nome)) || produto.vendedorNome || produto.vendedor || 'Vendedor';
        const cidadeVendedor = (dadosVendedor && (dadosVendedor.city || dadosVendedor.cidade)) || produto.vendedorCidade || produto.cidade || 'Paulistana';

        // Foto de perfil do vendedor
        const avatarBruto = (dadosVendedor && dadosVendedor.avatar) || produto.vendedorAvatar || fallbackAvatarVendedor;
        if (avatarBruto && avatarBruto !== 'assets/icons/icon-user.png') {
            avatarVendedor = (window.ItaimApi && typeof window.ItaimApi.resolverUrlImagem === 'function')
                ? window.ItaimApi.resolverUrlImagem(avatarBruto)
                : ((window.ItaimRotas && typeof window.ItaimRotas.obterAsset === 'function')
                    ? window.ItaimRotas.obterAsset(avatarBruto)
                    : avatarBruto);
        } else {
            avatarVendedor = fallbackAvatarVendedor;
        }

        if (nomeVendedorEl) nomeVendedorEl.textContent = nomeVendedor;
        if (cidadeVendedorEl) cidadeVendedorEl.textContent = `${cidadeVendedor} - PI`;
        if (avatarVendedorEl) {
            avatarVendedorEl.src = avatarVendedor || fallbackAvatarVendedor;
            avatarVendedorEl.alt = `Foto de ${nomeVendedor}`;
            avatarVendedorEl.onerror = function() {
                this.onerror = null;
                this.src = fallbackAvatarVendedor;
            };
        }

        // URL para o perfil público do vendedor
        const emailParam = (dadosVendedor && dadosVendedor.email) || produto.vendedorEmail || '';
        const idParam = (dadosVendedor && dadosVendedor.id) || produto.vendedorId || '';
        const queryParams = new URLSearchParams();
        if (idParam) queryParams.set('id', idParam);
        if (emailParam) queryParams.set('email', emailParam);
        if (nomeVendedor) queryParams.set('vendedor', nomeVendedor);

        const urlVendedor = (window.ItaimRotas ? window.ItaimRotas.obterUrl('vendedor', queryParams.toString()) : `../perfil/vendedor.html?${queryParams.toString()}`);

        // Nota e total de avaliações do vendedor no topo do card
        const notaEl = document.getElementById('vendedor-card-nota');
        const totalAvaliacoesEl = document.getElementById('vendedor-card-total-avaliacoes');
        const cardAvaliacaoTopo = document.getElementById('vendedor-card-avaliacao-topo');

        let mediaNota = '5.0';
        let totalAvaliacoes = 18;

        if (window.ItaimAvaliacoes && typeof window.ItaimAvaliacoes.obter === 'function') {
            const listaReviews = window.ItaimAvaliacoes.obter(dadosVendedor || nomeVendedor);
            if (listaReviews && listaReviews.length > 0) {
                const stats = window.ItaimAvaliacoes.calcularMedia(listaReviews);
                mediaNota = stats.media.toFixed(1);
                totalAvaliacoes = stats.total;
            } else if (dadosVendedor && dadosVendedor.avaliacao) {
                mediaNota = parseFloat(dadosVendedor.avaliacao).toFixed(1);
                if (dadosVendedor.totalAvaliacoes) totalAvaliacoes = dadosVendedor.totalAvaliacoes;
            }
        } else if (dadosVendedor && dadosVendedor.avaliacao) {
            mediaNota = parseFloat(dadosVendedor.avaliacao).toFixed(1);
            if (dadosVendedor.totalAvaliacoes) totalAvaliacoes = dadosVendedor.totalAvaliacoes;
        }

        if (notaEl) notaEl.innerHTML = `${mediaNota} ★`;
        if (totalAvaliacoesEl) totalAvaliacoesEl.textContent = `Avaliações (${totalAvaliacoes})`;

        if (cardAvaliacaoTopo) {
            cardAvaliacaoTopo.style.cursor = 'pointer';
            cardAvaliacaoTopo.onclick = (e) => {
                e.preventDefault();
                window.location.href = `${urlVendedor}#avaliacoes`;
            };
        }

        window.ItaimProdutoVendedor.dadosVendedor = dadosVendedor;
    }

    function verificarSeUsuarioEhVendedor() {
        const produto = window.ItaimProdutoDados?.obterProduto();
        if (!produto) return false;

        const usuarioLogado = window.ItaimSessao ? window.ItaimSessao.obterUsuarioLogado() : null;
        if (!usuarioLogado) return false;

        const uId = String(usuarioLogado.id || usuarioLogado.userId || '').trim();
        const uEmail = String(usuarioLogado.email || '').toLowerCase().trim();
        const uUsername = String(usuarioLogado.username || usuarioLogado.usuario || '').toLowerCase().trim();

        const vId = String(
            (dadosVendedor && (dadosVendedor.id || dadosVendedor.userId)) ||
            produto.vendedorId ||
            produto.sellerId ||
            (produto.seller && (produto.seller.id || produto.seller.userId)) ||
            ''
        ).trim();

        const vEmail = String(
            (dadosVendedor && dadosVendedor.email) ||
            produto.vendedorEmail ||
            (produto.seller && produto.seller.email) ||
            ''
        ).toLowerCase().trim();

        const vUsername = String(
            (dadosVendedor && (dadosVendedor.username || dadosVendedor.usuario)) ||
            produto.vendedorUsername ||
            (produto.seller && (produto.seller.username || produto.seller.usuario)) ||
            ''
        ).toLowerCase().trim();

        return Boolean(
            (uId && vId && uId === vId) ||
            (uEmail && vEmail && uEmail === vEmail) ||
            (uUsername && vUsername && uUsername === vUsername)
        );
    }

    window.ItaimProdutoVendedor = {
        inicializar,
        obterDadosVendedor: () => dadosVendedor,
        verificarSeUsuarioEhVendedor,
        dadosVendedor: null
    };
})();
