/**
 * ITAIM VENDE - PRODUTO: AÇÕES (CHAT, WHATSAPP E FAVORITOS)
 * Arquivo: frontend/js/pages/produtos/produto/produto-acoes.js
 */

(function () {
    'use strict';

    function mostrarToast(mensagem) {
        let toastEl = document.getElementById('toast-feedback-produto');
        if (!toastEl) {
            toastEl = document.createElement('div');
            toastEl.id = 'toast-feedback-produto';
            toastEl.style.position = 'fixed';
            toastEl.style.bottom = '24px';
            toastEl.style.right = '24px';
            toastEl.style.backgroundColor = '#2D3236';
            toastEl.style.color = '#FFFFFF';
            toastEl.style.padding = '12px 20px';
            toastEl.style.borderRadius = '10px';
            toastEl.style.boxShadow = '0 6px 20px rgba(0,0,0,0.18)';
            toastEl.style.fontSize = '14px';
            toastEl.style.fontWeight = '600';
            toastEl.style.zIndex = '99999';
            toastEl.style.opacity = '0';
            toastEl.style.transition = 'all 0.3s ease';
            document.body.appendChild(toastEl);
        }

        toastEl.textContent = mensagem;
        toastEl.style.opacity = '1';
        toastEl.style.transform = 'translateY(0)';

        setTimeout(() => {
            toastEl.style.opacity = '0';
            toastEl.style.transform = 'translateY(10px)';
        }, 2600);
    }

    function inicializar() {
        const produto = window.ItaimProdutoDados?.obterProduto();
        if (!produto) return;

        const dadosVendedor = window.ItaimProdutoVendedor?.obterDadosVendedor();
        const verificarSeUsuarioEhVendedor = window.ItaimProdutoVendedor?.verificarSeUsuarioEhVendedor || (() => false);

        // 1. Botão Iniciar Chat com o Vendedor
        const btnChatVendedor = document.getElementById('btn-chat-vendedor');
        if (btnChatVendedor) {
            btnChatVendedor.addEventListener('click', async (e) => {
                e.preventDefault();

                if (verificarSeUsuarioEhVendedor()) {
                    mostrarToast('Você é o vendedor deste anúncio');
                    return;
                }

                const estaLogado = (window.ItaimSessao && typeof window.ItaimSessao.usuarioEstaAutenticado === 'function')
                    ? window.ItaimSessao.usuarioEstaAutenticado()
                    : !!(window.ItaimApi?.auth?.obterToken() && localStorage.getItem('itaim_usuario_logado'));

                if (!estaLogado) {
                    if (window.ItaimSessao && typeof window.ItaimSessao.abrirModalAuth === 'function') {
                        window.ItaimSessao.abrirModalAuth('Faça login para conversar com o vendedor.');
                    } else if (window.ItaimSessao && typeof window.ItaimSessao.redirecionarParaLogin === 'function') {
                        window.ItaimSessao.redirecionarParaLogin('Faça login para conversar com o vendedor.');
                    } else {
                        const urlLogin = window.ItaimRotas ? window.ItaimRotas.obterUrl('login', 'returnTo=' + encodeURIComponent(window.location.href)) : '../../index.html';
                        window.location.href = urlLogin;
                    }
                    return;
                }

                const textoOriginal = btnChatVendedor.innerHTML;
                btnChatVendedor.disabled = true;
                btnChatVendedor.innerHTML = `
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" style="animation: spin 0.8s linear infinite;">
                        <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
                        <path d="M12 2a10 10 0 0 1 10 10"></path>
                    </svg>
                    <span>Conectando...</span>
                `;

                try {
                    const prodIdParaChat = produto.id || produto.slug;
                    const resp = await window.ItaimApi.chat.iniciarConversa(prodIdParaChat);

                    if (resp && resp.success && resp.data) {
                        const convId = resp.data.id;
                        const urlDestino = window.ItaimRotas 
                            ? window.ItaimRotas.obterUrl('conversas', `id=${encodeURIComponent(convId)}`)
                            : `../mensagens/conversas.html?id=${encodeURIComponent(convId)}`;
                        window.location.href = urlDestino;
                        return;
                    }
                    throw new Error(resp?.message || 'Não foi possível iniciar o chat.');
                } catch (err) {
                    console.error('Erro ao iniciar chat com vendedor:', err);
                    const msgErro = err?.message || 'Erro ao abrir chat com o vendedor.';

                    btnChatVendedor.disabled = false;
                    btnChatVendedor.innerHTML = textoOriginal;

                    if (msgErro.includes('anunciante') || msgErro.includes('vendedor')) {
                        mostrarToast('Você é o vendedor deste anúncio');
                        return;
                    }

                    mostrarToast(msgErro);
                }
            });
        }

        // 2. Botão WhatsApp com mensagem personalizada (somente se o vendedor tiver telefone cadastrado)
        const btnWpp = document.getElementById('btn-comprar-wpp');
        if (btnWpp) {
            const telRaw = (produto.vendedorTelefone || produto.telefone || (dadosVendedor && (dadosVendedor.phone || dadosVendedor.telefone)) || '');
            let telVendedor = String(telRaw).replace(/\D/g, '');

            // Se o usuário não tiver cadastrado número de telefone/WhatsApp válido, oculta o botão
            if (!telVendedor || telVendedor.length < 10) {
                btnWpp.style.display = 'none';
            } else {
                if (telVendedor.length === 10 || telVendedor.length === 11) {
                    telVendedor = '55' + telVendedor;
                }
                const precoTexto = (produto.preco && produto.preco > 0) 
                    ? `por R$ ${Number(produto.preco).toFixed(2).replace('.', ',')}` 
                    : 'para doação/troca';
                const msg = encodeURIComponent(
                    `Olá! Vi seu anúncio no Itaim Vende:\n"${produto.titulo}" (${precoTexto})\n` +
                    `Ainda está disponível? Tenho interesse!`
                );
                btnWpp.href = `https://wa.me/${telVendedor}?text=${msg}`;
                btnWpp.style.display = 'flex';
            }

            btnWpp.addEventListener('click', (e) => {
                if (verificarSeUsuarioEhVendedor()) {
                    e.preventDefault();
                    mostrarToast('Você é o vendedor deste anúncio');
                }
            });
        }

        // 3. Sistema de Favoritos (somente autenticado)
        const estaAutenticado = (window.ItaimSessao && typeof window.ItaimSessao.usuarioEstaAutenticado === 'function')
            ? window.ItaimSessao.usuarioEstaAutenticado()
            : !!(localStorage.getItem('itaim_token') && localStorage.getItem('itaim_usuario_logado'));

        let favoritosSet = new Set();
        if (estaAutenticado) {
            try {
                const salvos = JSON.parse(localStorage.getItem('itaim_favoritos') || '[]');
                if (Array.isArray(salvos)) favoritosSet = new Set(salvos.map(String));
            } catch (e) {}
        } else {
            try {
                localStorage.removeItem('itaim_favoritos');
            } catch (e) {}
        }

        const btnFavorito = document.getElementById('btn-favoritar-detalhe');

        function atualizarEstadoFavorito() {
            const estaLogado = (window.ItaimSessao && typeof window.ItaimSessao.usuarioEstaAutenticado === 'function')
                ? window.ItaimSessao.usuarioEstaAutenticado()
                : !!(localStorage.getItem('itaim_token') && localStorage.getItem('itaim_usuario_logado'));
            const isFav = estaLogado && favoritosSet.has(String(produto.id));
            btnFavorito?.classList.toggle('ativo', isFav);
        }
        atualizarEstadoFavorito();

        function alternarFavorito() {
            if (favoritosSet.has(produto.id)) {
                favoritosSet.delete(produto.id);
                mostrarToast('Removido dos favoritos');
            } else {
                favoritosSet.add(produto.id);
                mostrarToast('Salvo nos seus favoritos! ❤️');
                if (window.ItaimNotificacoes && typeof window.ItaimNotificacoes.notificarItemSalvo === 'function') {
                    window.ItaimNotificacoes.notificarItemSalvo(produto);
                }
            }
            try {
                const favArr = Array.from(favoritosSet);
                localStorage.setItem('itaim_favoritos', JSON.stringify(favArr));
                const userEmail = window.ItaimSessao ? window.ItaimSessao.obterUsuarioLogado()?.email : null;
                if (userEmail) {
                    localStorage.setItem('itaim_favoritos_' + userEmail.toLowerCase().trim(), JSON.stringify(favArr));
                }
            } catch (e) {}
            atualizarEstadoFavorito();

            const badgeFav = document.getElementById('favoritos-contador-badge');
            if (badgeFav) badgeFav.textContent = favoritosSet.size;
        }

        btnFavorito?.addEventListener('click', (e) => {
            e.preventDefault();
            alternarFavorito();
        });
    }

    window.ItaimProdutoAcoes = {
        inicializar,
        mostrarToast
    };
})();
