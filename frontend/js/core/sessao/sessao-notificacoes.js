/**
 * ITAIM VENDE - SISTEMA CENTRAL DE NOTIFICAÇÕES E TOASTS GLOBAIS
 * Arquivo: frontend/js/core/sessao/sessao-notificacoes.js
 * 
 * Responsabilidades:
 * - Persistência e leitura isolada de notificações por usuário (itaim_notificacoes_email)
 * - Toasts globais animados na tela
 * - Disparos de notificações em eventos (curtidas, chat, venda, preço, avaliações)
 * - Atualização dinâmica dos badges de contagem no Header e Drawer
 */

(function() {
    'use strict';

    const NOTIF_CONFIG_PADRAO = {
        'not-mensagens': true,
        'not-avaliacoes': true,
        'not-compras': true,
        'not-favoritos': true,
        'not-precos': true,
        'not-expiracao': true,
        'not-avisos': true
    };

    function obterConfiguracoesNotificacoes() {
        try {
            const raw = localStorage.getItem('itaim_configuracoes');
            return raw ? { ...NOTIF_CONFIG_PADRAO, ...JSON.parse(raw) } : NOTIF_CONFIG_PADRAO;
        } catch(e) {
            return NOTIF_CONFIG_PADRAO;
        }
    }

    function obterEmailUsuarioAtivo() {
        try {
            const getLogado = (window.ItaimSessaoAuth && window.ItaimSessaoAuth.obterUsuarioLogado) || 
                              (window.ItaimSessao && window.ItaimSessao.obterUsuarioLogado);
            const u = getLogado ? getLogado() : null;
            return (u && u.email ? u.email : 'admin@gmail.com').toLowerCase().trim();
        } catch(e) {
            return 'admin@gmail.com';
        }
    }

    function resolverEmailDestinatario(destinatario) {
        if (!destinatario) return obterEmailUsuarioAtivo();
        if (typeof destinatario === 'object') {
            const em = destinatario.email || destinatario.vendedorEmail;
            if (em) return String(em).toLowerCase().trim();
            const nom = destinatario.nome || destinatario.vendedorNome || destinatario.username;
            if (nom) return resolverEmailDestinatario(nom);
            return obterEmailUsuarioAtivo();
        }
        const str = String(destinatario).trim().toLowerCase();
        if (str.includes('@')) return str;
        
        const getUsuarios = (window.ItaimSessaoAuth && window.ItaimSessaoAuth.carregarUsuarios) || 
                            (window.ItaimSessao && window.ItaimSessao.obterTodosUsuarios);
        const todos = getUsuarios ? getUsuarios() : [];
        const u = todos.find(x => 
            String(x.id) === str || 
            (x.username || '').toLowerCase() === str || 
            (x.nome || '').toLowerCase() === str
        );
        if (u && u.email) return u.email.toLowerCase().trim();
        return str;
    }

    // Retorna a lista real de notificações do usuário especificado (ou do usuário logado)
    function obterNotificacoes(destinatario) {
        try {
            const email = resolverEmailDestinatario(destinatario);
            const chave = 'itaim_notificacoes_' + email;
            let lista = JSON.parse(localStorage.getItem(chave) || 'null');
            
            // Limpa qualquer resquício de mock fake antigo da plataforma
            if (localStorage.getItem('itaim_notificacoes')) {
                localStorage.removeItem('itaim_notificacoes');
            }

            if (!Array.isArray(lista)) {
                return [];
            }
            return lista;
        } catch(e) {
            return [];
        }
    }

    // Salva a lista de notificações para o usuário especificado
    function salvarNotificacoes(lista, destinatario) {
        try {
            const email = resolverEmailDestinatario(destinatario);
            const chave = 'itaim_notificacoes_' + email;
            localStorage.setItem(chave, JSON.stringify(Array.isArray(lista) ? lista : []));
            
            if (email === obterEmailUsuarioAtivo()) {
                atualizarBadgesNotificacoes();
            }
        } catch(e) {}
    }

    function exibirToastGlobal(titulo, texto, link) {
        let container = document.getElementById('itaim-toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'itaim-toast-container';
            container.style.cssText = 'position:fixed;top:20px;right:20px;z-index:99999;display:flex;flex-direction:column;gap:10px;pointer-events:none;max-width:360px;width:calc(100% - 40px);';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.style.cssText = 'pointer-events:auto;background:#FFFFFF;border-left:4px solid #44BD32;border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,0.16);padding:14px 16px;cursor:pointer;display:flex;flex-direction:column;gap:4px;transition:all 0.3s ease;transform:translateX(100px);opacity:0;';
        toast.innerHTML = `
            <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
                <strong style="color:#1E272E;font-size:14px;font-weight:700;">${titulo}</strong>
                <button type="button" style="background:none;border:none;color:#94A3B8;cursor:pointer;font-size:16px;line-height:1;padding:2px;">&times;</button>
            </div>
            <p style="color:#57606F;font-size:13px;margin:0;line-height:1.4;">${texto}</p>
        `;

        toast.addEventListener('click', (e) => {
            if (e.target.tagName.toLowerCase() === 'button') {
                toast.remove();
                return;
            }
            if (link) window.location.href = link;
        });

        container.appendChild(toast);
        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(0)';
            toast.style.opacity = '1';
        });

        setTimeout(() => {
            toast.style.transform = 'translateX(100px)';
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 350);
        }, 5000);
    }

    // Cria notificação real para um usuário específico
    function criarNotificacao({ destinatario, tipo = 'aviso', titulo, texto, link = (window.ItaimRotas ? window.ItaimRotas.obterUrl('notificacoes') : 'notificacoes.html'), icone, tempo = 'Agora' }) {
        const cfg = obterConfiguracoesNotificacoes();
        
        // Valida preferências
        if (tipo === 'mensagem' && cfg['not-mensagens'] === false) return false;
        if (tipo === 'avaliacao' && cfg['not-avaliacoes'] === false) return false;
        if (tipo === 'compra' && cfg['not-compras'] === false) return false;
        if (tipo === 'favorito' && cfg['not-favoritos'] === false) return false;
        if (tipo === 'preco' && cfg['not-precos'] === false) return false;
        if (tipo === 'aviso' && cfg['not-avisos'] === false) return false;

        const emailDestinatario = resolverEmailDestinatario(destinatario);
        if (!emailDestinatario) return false;

        const nova = {
            id: Date.now() + Math.floor(Math.random() * 1000),
            tipo,
            titulo: titulo || 'Nova notificação',
            texto: texto || '',
            link: link || (window.ItaimRotas ? window.ItaimRotas.obterUrl('notificacoes') : 'notificacoes.html'),
            icone: icone || tipo,
            tempo: tempo || 'Agora',
            data: 'Hoje',
            lida: false,
            criadoEm: Date.now()
        };

        const lista = obterNotificacoes(emailDestinatario);
        lista.unshift(nova);
        salvarNotificacoes(lista, emailDestinatario);

        // Se o destinatário estiver logado na tela agora, dispara alerta visual
        if (emailDestinatario === obterEmailUsuarioAtivo()) {
            exibirToastGlobal(nova.titulo, nova.texto, nova.link);
            atualizarBadgesNotificacoes();
        }

        return nova;
    }

    // DISPARO 1: Notificar quando outro usuário salvar/curtir um item
    function notificarItemSalvo(produtoOuId, usuarioQueSalvou) {
        try {
            let produto = produtoOuId;
            if (typeof produtoOuId === 'number' || typeof produtoOuId === 'string') {
                const getProds = (window.ItaimSessaoProdutos && window.ItaimSessaoProdutos.obterTodosProdutos) ||
                                 (window.ItaimSessao && window.ItaimSessao.obterTodosProdutos);
                const todos = getProds ? getProds() : [];
                produto = todos.find(p => String(p.id) === String(produtoOuId));
            }
            if (!produto) return false;

            const getLogado = (window.ItaimSessaoAuth && window.ItaimSessaoAuth.obterUsuarioLogado) || 
                              (window.ItaimSessao && window.ItaimSessao.obterUsuarioLogado);
            const remetente = usuarioQueSalvou || (getLogado ? getLogado() : {});
            const emailVendedor = resolverEmailDestinatario(produto.vendedorEmail || produto.vendedorUsername || produto.vendedorNome);
            const emailQuemSalvou = (remetente?.email || obterEmailUsuarioAtivo()).toLowerCase().trim();

            if (emailVendedor === emailQuemSalvou) {
                return false;
            }

            return criarNotificacao({
                destinatario: emailVendedor,
                tipo: 'favorito',
                titulo: 'Anúncio salvo por outro usuário',
                texto: `${remetente.nome || 'Um usuário'} salvou seu anúncio "${produto.titulo}" nos favoritos.`,
                link: (window.ItaimRotas ? window.ItaimRotas.obterUrl('produto', `id=${produto.id}`) : `produto.html?id=${produto.id}`),
                icone: 'favorito',
                tempo: 'Agora'
            });
        } catch(e) {
            console.warn('Erro ao notificar item salvo:', e);
            return false;
        }
    }

    // DISPARO 2: Notificar quando outro usuário enviar mensagem no chat
    function notificarNovaMensagem({ destinatario, remetente, produtoTitulo, textoMensagem, conversaId }) {
        try {
            const getLogado = (window.ItaimSessaoAuth && window.ItaimSessaoAuth.obterUsuarioLogado) || 
                              (window.ItaimSessao && window.ItaimSessao.obterUsuarioLogado);
            const userRemetente = remetente || (getLogado ? getLogado() : {});
            const emailDestino = resolverEmailDestinatario(destinatario);
            const emailRemetente = (userRemetente?.email || obterEmailUsuarioAtivo()).toLowerCase().trim();

            if (emailDestino === emailRemetente) return false;

            const previewTexto = (textoMensagem || '').length > 60 
                ? (textoMensagem || '').substring(0, 57) + '...' 
                : textoMensagem;

            const tit = produtoTitulo ? `Nova mensagem sobre "${produtoTitulo}"` : `Nova mensagem de ${userRemetente.nome || 'Usuário'}`;

            return criarNotificacao({
                destinatario: emailDestino,
                tipo: 'mensagem',
                titulo: tit,
                texto: `${userRemetente.nome || 'Usuário'}: "${previewTexto}"`,
                link: (window.ItaimRotas ? (conversaId ? window.ItaimRotas.obterUrl('conversas', `id=${conversaId}`) : window.ItaimRotas.obterUrl('conversas')) : 'conversas.html'),
                icone: 'chat',
                tempo: 'Agora'
            });
        } catch(e) {
            console.warn('Erro ao notificar nova mensagem:', e);
            return false;
        }
    }

    // DISPARO 3: Notificar quando uma compra e venda for finalizada
    function notificarVendaFinalizada(produtoOuId, vendedor) {
        try {
            let produto = produtoOuId;
            if (typeof produtoOuId === 'number' || typeof produtoOuId === 'string') {
                const getProds = (window.ItaimSessaoProdutos && window.ItaimSessaoProdutos.obterTodosProdutos) ||
                                 (window.ItaimSessao && window.ItaimSessao.obterTodosProdutos);
                const todos = getProds ? getProds() : [];
                produto = todos.find(p => String(p.id) === String(produtoOuId));
            }
            if (!produto) return false;

            const getLogado = (window.ItaimSessaoAuth && window.ItaimSessaoAuth.obterUsuarioLogado) || 
                              (window.ItaimSessao && window.ItaimSessao.obterUsuarioLogado);
            const userVendedor = vendedor || (getLogado ? getLogado() : {});

            // 1. Notifica o vendedor
            criarNotificacao({
                destinatario: userVendedor.email,
                tipo: 'compra',
                titulo: 'Venda finalizada com sucesso!',
                texto: `Parabéns! Seu anúncio "${produto.titulo}" foi finalizado e marcado como vendido.`,
                link: (window.ItaimRotas ? window.ItaimRotas.obterUrl('meus-anuncios') : 'meus-anuncios.html'),
                icone: 'sucesso',
                tempo: 'Agora'
            });

            // 2. Notifica outros usuários que tinham salvo esse produto nos favoritos
            const getUsuarios = (window.ItaimSessaoAuth && window.ItaimSessaoAuth.carregarUsuarios) || 
                                (window.ItaimSessao && window.ItaimSessao.obterTodosUsuarios);
            const todosUsuarios = getUsuarios ? getUsuarios() : [];
            todosUsuarios.forEach(u => {
                const uEmail = (u.email || '').toLowerCase().trim();
                if (uEmail !== (userVendedor.email || '').toLowerCase().trim()) {
                    const favs = JSON.parse(localStorage.getItem('itaim_favoritos_' + uEmail) || '[]');
                    if (Array.isArray(favs) && favs.includes(produto.id)) {
                        criarNotificacao({
                            destinatario: uEmail,
                            tipo: 'compra',
                            titulo: 'Anúncio vendido',
                            texto: `O anúncio "${produto.titulo}" que estava nos seus favoritos foi finalizado/vendido.`,
                            link: (window.ItaimRotas ? window.ItaimRotas.obterUrl('produto', `id=${produto.id}`) : `produto.html?id=${produto.id}`),
                            icone: 'sucesso',
                            tempo: 'Agora'
                        });
                    }
                }
            });

            return true;
        } catch(e) {
            console.warn('Erro ao notificar venda finalizada:', e);
            return false;
        }
    }

    // DISPARO 4: Notificar quando houver mudança de preço de um anúncio
    function notificarMudancaPreco(produtoOuId, precoAntigo, precoNovo) {
        try {
            let produto = produtoOuId;
            if (typeof produtoOuId === 'number' || typeof produtoOuId === 'string') {
                const getProds = (window.ItaimSessaoProdutos && window.ItaimSessaoProdutos.obterTodosProdutos) ||
                                 (window.ItaimSessao && window.ItaimSessao.obterTodosProdutos);
                const todos = getProds ? getProds() : [];
                produto = todos.find(p => String(p.id) === String(produtoOuId));
            }
            if (!produto) return false;

            const formatMoeda = val => Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            const textoPreco = precoAntigo && precoAntigo !== precoNovo
                ? `O preço do anúncio "${produto.titulo}" mudou de ${formatMoeda(precoAntigo)} para ${formatMoeda(precoNovo)}.`
                : `O anúncio "${produto.titulo}" teve seu preço atualizado para ${formatMoeda(precoNovo)}.`;

            const getUsuarios = (window.ItaimSessaoAuth && window.ItaimSessaoAuth.carregarUsuarios) || 
                                (window.ItaimSessao && window.ItaimSessao.obterTodosUsuarios);
            const todosUsuarios = getUsuarios ? getUsuarios() : [];
            const vendedorEmail = (produto.vendedorEmail || '').toLowerCase().trim();

            todosUsuarios.forEach(u => {
                const uEmail = (u.email || '').toLowerCase().trim();
                if (uEmail !== vendedorEmail) {
                    const favs = JSON.parse(localStorage.getItem('itaim_favoritos_' + uEmail) || '[]');
                    if (Array.isArray(favs) && favs.includes(produto.id)) {
                        criarNotificacao({
                            destinatario: uEmail,
                            tipo: 'preco',
                            titulo: 'Mudança de preço em item salvo',
                            texto: textoPreco,
                            link: (window.ItaimRotas ? window.ItaimRotas.obterUrl('produto', `id=${produto.id}`) : `produto.html?id=${produto.id}`),
                            icone: 'preco',
                            tempo: 'Agora'
                        });
                    }
                }
            });

            return true;
        } catch(e) {
            console.warn('Erro ao notificar mudança de preço:', e);
            return false;
        }
    }

    // DISPARO 5: Notificar quando um usuário avaliar o perfil
    function notificarNovaAvaliacao(vendedorOuDestinatario, review) {
        try {
            if (!review) return false;
            const emailDestino = resolverEmailDestinatario(vendedorOuDestinatario);
            if (!emailDestino) return false;

            const getLogado = (window.ItaimSessaoAuth && window.ItaimSessaoAuth.obterUsuarioLogado) || 
                              (window.ItaimSessao && window.ItaimSessao.obterUsuarioLogado);
            const userLogado = getLogado ? getLogado() : {};
            const autorNome = review.autor || userLogado?.nome || 'Um usuário';
            const emailRemetente = (userLogado?.email || '').toLowerCase().trim();

            if (emailDestino === emailRemetente && emailDestino !== 'admin@gmail.com') {
                return false;
            }

            const estrelas = Math.round(Number(review.nota) || 5);
            const estrelasTexto = '★'.repeat(estrelas) + '☆'.repeat(5 - estrelas);
            const comentarioCurto = (review.comentario || '').trim();
            const previewComentario = comentarioCurto.length > 55
                ? comentarioCurto.substring(0, 52) + '...'
                : comentarioCurto;

            const textoNotif = previewComentario 
                ? `${autorNome} avaliou você com ${estrelasTexto}: "${previewComentario}"`
                : `${autorNome} avaliou o seu perfil com ${estrelasTexto}.`;

            return criarNotificacao({
                destinatario: emailDestino,
                tipo: 'avaliacao',
                titulo: 'Nova avaliação no seu perfil',
                texto: textoNotif,
                link: (window.ItaimRotas ? window.ItaimRotas.obterUrl('perfil', '#perfil-secao-avaliacoes') : 'perfil.html#perfil-secao-avaliacoes'),
                icone: 'avaliacao',
                tempo: 'Agora'
            });
        } catch(e) {
            console.warn('Erro ao notificar nova avaliação:', e);
            return false;
        }
    }

    function atualizarBadgesNotificacoes() {
        const lista = obterNotificacoes();
        const naoLidas = lista.filter(n => !n.lida).length;

        // Badge no ícone do cabeçalho
        const btnNotif = document.getElementById('btn-notificacoes');
        if (btnNotif) {
            let badge = btnNotif.querySelector('.badge-contador-notif');
            if (naoLidas > 0) {
                if (!badge) {
                    badge = document.createElement('span');
                    badge.className = 'badge-contador-notif';
                    btnNotif.appendChild(badge);
                }
                badge.textContent = naoLidas > 99 ? '99+' : naoLidas;
                badge.style.display = 'inline-block';
            } else if (badge) {
                badge.remove();
            }
        }

        // Badge no menu lateral (drawer)
        const linkDrawer = document.getElementById('drawer-link-notificacoes');
        if (linkDrawer) {
            let drawerBadge = linkDrawer.querySelector('.drawer-badge-notif');
            if (naoLidas > 0) {
                if (!drawerBadge) {
                    drawerBadge = document.createElement('span');
                    drawerBadge.className = 'drawer-badge-notif';
                    linkDrawer.appendChild(drawerBadge);
                }
                drawerBadge.textContent = naoLidas;
                drawerBadge.style.display = 'inline-block';
            } else if (drawerBadge) {
                drawerBadge.remove();
            }
        }
    }

    // Exporta API de Notificações
    window.ItaimNotificacoes = {
        obterNotificacoes,
        salvarNotificacoes,
        criarNotificacao,
        atualizarBadgesNotificacoes,
        obterConfiguracoesNotificacoes,
        notificarItemSalvo,
        notificarNovaMensagem,
        notificarVendaFinalizada,
        notificarMudancaPreco,
        notificarNovaAvaliacao,
        exibirToastGlobal
    };

})();
