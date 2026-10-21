/**
 * ITAIM VENDE - PERFIL PÚBLICO DO VENDEDOR (BUNDLE UNIFICADO)
 * Arquivo: frontend/js/pages/perfil/vendedor.bundle.js
 * Gerado automaticamente via: node scripts/build-vendedor.js
 */

// ==========================================================================
// MÓDULO: UTILITÁRIOS E PARÂMETROS (vendedor-utils.js)
// ==========================================================================

/**
 * ITAIM VENDE - VENDEDOR: UTILITÁRIOS E PARÂMETROS DE ROTA
 * Arquivo: frontend/js/pages/perfil/vendedor/vendedor-utils.js
 */

(function () {
    'use strict';

    const params = new URLSearchParams(window.location.search);
    const paramId = params.get('id') || params.get('sellerId') || params.get('userId');
    const paramEmail = (params.get('email') || '').toLowerCase().trim();
    const paramNome = (params.get('vendedor') || params.get('nome') || '').trim();
    const paramUsername = (params.get('username') || '').trim();

    const identificador = paramId || paramEmail || paramUsername || paramNome;

    const fallbackAvatar = (window.ItaimRotas && typeof window.ItaimRotas.obterAsset === 'function')
        ? window.ItaimRotas.obterAsset('assets/icons/icon-user.png')
        : '../../assets/icons/icon-user.png';

    function formatarPreco(val) {
        if (val === 0 || val === '0' || val === null || val === undefined) {
            return '<span style="color: #44BD32; font-weight: 800;">Grátis / Doação</span>';
        }
        return Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    function exibirToast(msg) {
        const toast = document.getElementById('vendedor-toast');
        if (!toast) return;
        const txt = toast.querySelector('.toast-texto');
        if (txt) txt.textContent = msg;
        toast.classList.add('visivel');
        setTimeout(() => {
            toast.classList.remove('visivel');
        }, 3200);
    }

    window.ItaimVendedorUtils = {
        paramId,
        paramEmail,
        paramNome,
        paramUsername,
        identificador,
        fallbackAvatar,
        formatarPreco,
        exibirToast
    };
})();

// ==========================================================================
// MÓDULO: DADOS DO VENDEDOR E HEADER (vendedor-dados.js)
// ==========================================================================

/**
 * ITAIM VENDE - VENDEDOR: DADOS DO VENDEDOR E HEADER
 * Arquivo: frontend/js/pages/perfil/vendedor/vendedor-dados.js
 */

(function () {
    'use strict';

    let vendedor = null;
    let anunciosVendedor = [];

    async function inicializar() {
        const {
            paramId,
            paramEmail,
            paramNome,
            paramUsername,
            identificador,
            fallbackAvatar,
            exibirToast
        } = window.ItaimVendedorUtils;

        // 1. Tentar buscar dados reais do vendedor e seus anúncios no Backend
        if (identificador && window.ItaimApi && window.ItaimApi.produtos && typeof window.ItaimApi.produtos.doVendedor === 'function') {
            try {
                const resVendedor = await window.ItaimApi.produtos.doVendedor(identificador);
                if (resVendedor && resVendedor.success && resVendedor.seller) {
                    vendedor = resVendedor.seller;
                    if (Array.isArray(resVendedor.products)) {
                        anunciosVendedor = resVendedor.products;
                    }
                }
            } catch (errApi) {
                console.info('[Vendedor] Busca direta por doVendedor falhou:', errApi.message);
            }
        }

        // Se não foi encontrado pelo endpoint do vendedor, tenta obter o perfil público por ID/Email
        if (!vendedor && (paramId || paramEmail) && window.ItaimApi && window.ItaimApi.auth && typeof window.ItaimApi.auth.obterUsuario === 'function') {
            try {
                const resUser = await window.ItaimApi.auth.obterUsuario(paramId || paramEmail);
                if (resUser && resUser.success && resUser.user) {
                    vendedor = resUser.user;
                    try {
                        const resAds = await window.ItaimApi.produtos.doVendedor(vendedor.id);
                        if (resAds && resAds.success && Array.isArray(resAds.products)) {
                            anunciosVendedor = resAds.products;
                        }
                    } catch (eAds) {}
                }
            } catch (errUser) {
                console.info('[Vendedor] Busca de usuário falhou:', errUser.message);
            }
        }

        // 2. Fallback: busca em sessão local ou memória se o backend estiver offline
        let todosProdutosLocais = [];
        if (window.ItaimSessao && typeof window.ItaimSessao.obterTodosProdutos === 'function') {
            todosProdutosLocais = window.ItaimSessao.obterTodosProdutos();
        } else {
            try {
                todosProdutosLocais = JSON.parse(localStorage.getItem('itaim_produtos_cadastrados') || '[]');
            } catch(e) {}
        }

        if (!vendedor) {
            if (window.ItaimSessao && typeof window.ItaimSessao.obterTodosUsuarios === 'function') {
                const usuarios = window.ItaimSessao.obterTodosUsuarios();
                if (paramId) {
                    vendedor = usuarios.find(u => String(u.id) === String(paramId));
                }
                if (!vendedor && paramEmail) {
                    vendedor = usuarios.find(u => (u.email || '').toLowerCase() === paramEmail);
                }
                if (!vendedor && paramNome) {
                    const busca = paramNome.toLowerCase().trim();
                    vendedor = usuarios.find(u => 
                        (u.name || u.nome || '').toLowerCase() === busca ||
                        (u.username || '').toLowerCase() === busca
                    );
                }
            }

            if (!vendedor) {
                try {
                    const db = JSON.parse(localStorage.getItem('itaim_usuarios_db') || '[]');
                    if (Array.isArray(db)) {
                        vendedor = db.find(u => 
                            (paramId && String(u.id) === String(paramId)) ||
                            (paramEmail && (u.email || '').toLowerCase() === paramEmail) ||
                            (paramNome && (u.nome || u.name || '').toLowerCase() === paramNome.toLowerCase())
                        );
                    }
                } catch(e) {}
            }

            if (!vendedor && todosProdutosLocais.length > 0) {
                const prodMatch = todosProdutosLocais.find(p => {
                    const pEmail = (p.vendedorEmail || '').toLowerCase();
                    const pNome = (p.vendedorNome || p.vendedor || '').toLowerCase();
                    const pId = String(p.vendedorId || p.sellerId || '');

                    return (paramId && pId === String(paramId)) ||
                           (paramEmail && pEmail === paramEmail) || 
                           (paramNome && pNome === paramNome.toLowerCase());
                });

                if (prodMatch) {
                    vendedor = {
                        id: prodMatch.vendedorId || prodMatch.sellerId || Date.now(),
                        name: prodMatch.vendedorNome || prodMatch.vendedor || 'Vendedor do Itaim Vende',
                        nome: prodMatch.vendedorNome || prodMatch.vendedor || 'Vendedor do Itaim Vende',
                        username: prodMatch.vendedorUsername || (prodMatch.vendedorEmail ? prodMatch.vendedorEmail.split('@')[0] : 'vendedor'),
                        email: prodMatch.vendedorEmail || '',
                        phone: prodMatch.vendedorTelefone || '(89) 99999-9999',
                        city: prodMatch.vendedorCidade || prodMatch.cidade || 'Paulistana',
                        avatar: prodMatch.vendedorAvatar || 'assets/icons/icon-user.png',
                        bio: `Vendedor(a) na região de ${prodMatch.vendedorCidade || prodMatch.cidade || 'Paulistana'} e cidades vizinhas no Itaim Vende.`,
                        createdAt: '2024-01-01',
                        ratingAverage: 5.0,
                        ratingCount: 18,
                        salesCount: 12
                    };
                }
            }
        }

        // Se ainda não tem anúncios carregados mas tem produtos locais
        if ((!anunciosVendedor || anunciosVendedor.length === 0) && todosProdutosLocais.length > 0) {
            anunciosVendedor = todosProdutosLocais.filter(p => {
                const pEmail = (p.vendedorEmail || '').toLowerCase().trim();
                const pNome = (p.vendedorNome || p.vendedor || '').toLowerCase().trim();
                const pId = String(p.vendedorId || p.sellerId || '');

                const vEmail = (vendedor?.email || paramEmail || '').toLowerCase().trim();
                const vNome = (vendedor?.name || vendedor?.nome || paramNome || '').toLowerCase().trim();
                const vId = String(vendedor?.id || paramId || '');

                return (vId && pId === vId) || 
                       (vEmail && pEmail === vEmail) || 
                       (vNome && pNome === vNome);
            });

            if (anunciosVendedor.length === 0 && (vendedor?.email === 'admin@gmail.com' || vendedor?.name === 'Admin' || paramNome.toLowerCase() === 'admin')) {
                anunciosVendedor = todosProdutosLocais;
            }
        }

        if (!vendedor) {
            const nomeFinal = paramNome || (paramEmail ? paramEmail.split('@')[0] : 'Vendedor');
            vendedor = {
                id: paramId || Date.now(),
                name: nomeFinal,
                nome: nomeFinal,
                username: paramNome ? paramNome.toLowerCase().replace(/\s+/g, '') : (paramEmail ? paramEmail.split('@')[0] : 'vendedor'),
                email: paramEmail || '',
                phone: '(89) 99999-9999',
                city: 'Paulistana',
                avatar: 'assets/icons/icon-user.png',
                bio: `Perfil de ${nomeFinal} na plataforma Itaim Vende.`,
                createdAt: '2024-01-01',
                ratingAverage: 5.0,
                ratingCount: 0,
                salesCount: 0
            };
        }

        // Resolução da foto do vendedor
        let rawAvatar = vendedor.avatar;
        if (!rawAvatar || rawAvatar === 'assets/icons/icon-user.png') {
            try {
                const perfilSalvo = JSON.parse(localStorage.getItem('itaim_perfil_usuario') || 'null');
                if (perfilSalvo && perfilSalvo.avatar && perfilSalvo.avatar !== 'assets/icons/icon-user.png') {
                    const pEmail = (perfilSalvo.email || '').toLowerCase().trim();
                    const vEmail = (vendedor.email || '').toLowerCase().trim();
                    const pId = String(perfilSalvo.id || '');
                    const vId = String(vendedor.id || '');
                    if ((vEmail && pEmail === vEmail) || (vId && pId === vId)) {
                        rawAvatar = perfilSalvo.avatar;
                    }
                }
            } catch(e) {}
        }

        const finalAvatar = (window.ItaimApi && typeof window.ItaimApi.resolverUrlImagem === 'function' && rawAvatar)
            ? window.ItaimApi.resolverUrlImagem(rawAvatar)
            : ((window.ItaimRotas && typeof window.ItaimRotas.obterAsset === 'function' && rawAvatar)
                ? window.ItaimRotas.obterAsset(rawAvatar)
                : (rawAvatar || fallbackAvatar));

        const elAvatar = document.getElementById('vendedor-avatar-img');
        if (elAvatar) {
            elAvatar.src = finalAvatar;
            elAvatar.alt = `Foto de ${vendedor.name || vendedor.nome}`;
            elAvatar.onerror = function() {
                this.onerror = null;
                this.src = fallbackAvatar;
            };
        }

        // Preencher dados visuais do Vendedor
        const nomeExibido = vendedor.name || vendedor.nome || 'Vendedor';
        document.title = `${nomeExibido} - Perfil do Vendedor - Itaim Vende`;

        const elBreadcrumbNome = document.getElementById('vendedor-breadcrumb-nome');
        if (elBreadcrumbNome) elBreadcrumbNome.textContent = nomeExibido;

        const elNome = document.getElementById('vendedor-nome-display');
        if (elNome) elNome.textContent = nomeExibido;

        const elUsername = document.getElementById('vendedor-username-display');
        if (elUsername) {
            const userSlug = vendedor.username || (vendedor.email ? vendedor.email.split('@')[0] : 'vendedor');
            elUsername.textContent = `@${userSlug}`;
        }

        const elSeloVerificado = document.getElementById('vendedor-selo-verificado');
        if (elSeloVerificado) {
            elSeloVerificado.style.display = (vendedor.isVerified || vendedor.role === 'ADMIN') ? 'inline-flex' : 'none';
        }

        const elBio = document.getElementById('vendedor-bio-display');
        if (elBio) {
            if (vendedor.bio) {
                elBio.textContent = vendedor.bio;
                elBio.style.display = 'block';
            } else {
                elBio.style.display = 'none';
            }
        }

        const elCidade = document.getElementById('vendedor-cidade-display');
        if (elCidade) {
            const cidadeNome = vendedor.city || vendedor.cidade || 'Paulistana';
            const estadoNome = vendedor.state || vendedor.estado || 'PI';
            elCidade.textContent = `${cidadeNome} - ${estadoNome}`;
        }

        const elData = document.getElementById('vendedor-data-display');
        if (elData) {
            const anoCriacao = vendedor.createdAt ? new Date(vendedor.createdAt).getFullYear() : '2024';
            elData.textContent = `Membro desde ${anoCriacao}`;
        }

        // Botão WhatsApp
        const btnWpp = document.getElementById('btn-vendedor-wpp');
        if (btnWpp) {
            let foneLimpo = String(vendedor.phone || vendedor.telefone || '8999985858').replace(/\D/g, '');
            if (foneLimpo.length === 10 || foneLimpo.length === 11) foneLimpo = '55' + foneLimpo;
            const msg = encodeURIComponent(`Olá ${nomeExibido}! Vi seu perfil de vendedor no portal Itaim Vende e gostaria de conversar sobre seus anúncios.`);
            btnWpp.href = `https://wa.me/${foneLimpo}?text=${msg}`;
        }

        // Botão Compartilhar Perfil
        const btnCompartilhar = document.getElementById('btn-vendedor-compartilhar');
        if (btnCompartilhar) {
            btnCompartilhar.addEventListener('click', () => {
                const link = window.location.href;
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(link).then(() => {
                        exibirToast('Link do perfil copiado para a área de transferência! 📋');
                    }).catch(() => {
                        exibirToast('Perfil compartilhado com sucesso!');
                    });
                } else {
                    exibirToast('Link do perfil disponível na barra de endereços!');
                }
            });
        }

        // Botão Denunciar Perfil
        const btnDenunciarPerfil = document.getElementById('btn-denunciar-perfil');
        if (btnDenunciarPerfil) {
            btnDenunciarPerfil.addEventListener('click', () => {
                exibirToast('Denúncia recebida. Nossa equipe irá analisar este perfil.');
            });
        }

        window.ItaimVendedorDados.vendedor = vendedor;
        window.ItaimVendedorDados.anunciosVendedor = anunciosVendedor;
        return { vendedor, anunciosVendedor };
    }

    window.ItaimVendedorDados = {
        inicializar,
        obterVendedor: () => vendedor,
        obterAnuncios: () => anunciosVendedor,
        vendedor: null,
        anunciosVendedor: []
    };
})();

// ==========================================================================
// MÓDULO: VITRINE DE PRODUTOS (vendedor-vitrine.js)
// ==========================================================================

/**
 * ITAIM VENDE - VENDEDOR: VITRINE DE PRODUTOS E FILTROS
 * Arquivo: frontend/js/pages/perfil/vendedor/vendedor-vitrine.js
 */

(function () {
    'use strict';

    function inicializar() {
        const { formatarPreco } = window.ItaimVendedorUtils;
        const vendedor = window.ItaimVendedorDados?.obterVendedor() || {};
        const anunciosVendedor = window.ItaimVendedorDados?.obterAnuncios() || [];

        const containerGrade = document.getElementById('grade-produtos-vendedor');
        const selectOrdem = document.getElementById('select-ordem-vendedor');

        // Estatísticas nos cards
        const elStatAtivos = document.getElementById('stat-anuncios-ativos');
        if (elStatAtivos) elStatAtivos.textContent = anunciosVendedor.length;

        const elStatVendas = document.getElementById('stat-vendas-concluidas');
        if (elStatVendas) {
            const vendas = vendedor.salesCount !== undefined ? vendedor.salesCount : (vendedor.vendasConcluidas || 0);
            elStatVendas.textContent = vendas;
        }

        const elBadgeQtd = document.getElementById('vendedor-badge-qtd');
        if (elBadgeQtd) {
            elBadgeQtd.textContent = `${anunciosVendedor.length} ${anunciosVendedor.length === 1 ? 'anúncio' : 'anúncios'}`;
        }

        function renderizarAnuncios() {
            if (!containerGrade) return;
            containerGrade.innerHTML = '';

            let lista = [...anunciosVendedor];

            // Ordenação
            const ordem = selectOrdem?.value || 'recentes';
            if (ordem === 'menor-preco') {
                lista.sort((a, b) => (Number(a.preco || a.price) || 0) - (Number(b.preco || b.price) || 0));
            } else if (ordem === 'maior-preco') {
                lista.sort((a, b) => (Number(b.preco || b.price) || 0) - (Number(a.preco || a.price) || 0));
            }

            if (lista.length === 0) {
                containerGrade.innerHTML = `
                    <div class="vendedor-anuncios-vazio" style="grid-column: 1 / -1; text-align: center; padding: 48px 20px; border-radius: 14px; border: 1px dashed #CBD5E1;">
                        <div class="anuncios-vazio-icone" style="width: 60px; height: 60px; margin: 0 auto 14px; border-radius: 50%; background: rgba(68, 189, 50, 0.12); display: inline-flex; align-items: center; justify-content: center; color: #44BD32;">
                            <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                                <line x1="12" y1="22.08" x2="12" y2="12"></line>
                            </svg>
                        </div>
                        <h3 style="font-size: 17px; font-weight: 800; margin-bottom: 6px;">Nenhum anúncio ativo no momento</h3>
                        <p style="color: #64748B; font-size: 14px; margin: 0 auto; max-width: 420px;">Este anunciante ainda não possui outros produtos cadastrados ou os itens já foram vendidos.</p>
                    </div>
                `;
                return;
            }

            const placeholderSrc = (window.ItaimRotas && typeof window.ItaimRotas.obterAsset === 'function')
                ? window.ItaimRotas.obterAsset('assets/placeholders/produto-placeholder.svg')
                : '../../assets/placeholders/produto-placeholder.svg';

            lista.forEach(item => {
                const card = document.createElement('a');
                const linkUrl = window.ItaimRotas 
                    ? window.ItaimRotas.obterUrl('produto', `id=${item.id}`) 
                    : `../produtos/produto.html?id=${item.id}`;
                card.href = linkUrl;
                card.className = 'card-produto-vendedor fade-in-content';

                const fotoBruta = item.imagem || (item.fotos && item.fotos[0]) || (item.images && item.images[0]) || '';
                const fotoImg = (window.ItaimApi && typeof window.ItaimApi.resolverUrlImagem === 'function' && fotoBruta)
                    ? window.ItaimApi.resolverUrlImagem(fotoBruta)
                    : (fotoBruta || placeholderSrc);

                const titulo = item.titulo || item.title || 'Anúncio';
                const precoFormatado = formatarPreco(item.preco !== undefined ? item.preco : item.price);
                const categoria = item.categoria || (item.category && item.category.name) || 'Geral';
                const cidadeItem = item.cidade || item.city || vendedor.city || 'Paulistana';

                card.innerHTML = `
                    <div class="card-prod-foto-box">
                        <img src="${fotoImg}" alt="${titulo}" onerror="this.onerror=null; this.src='${placeholderSrc}'" loading="lazy">
                        <span class="card-prod-badge-cat">${categoria}</span>
                    </div>
                    <div class="card-prod-conteudo">
                        <div class="card-prod-preco">${precoFormatado}</div>
                        <h3 class="card-prod-titulo" title="${titulo}">${titulo}</h3>
                        <div class="card-prod-footer">
                            <span class="card-prod-loc">
                                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                ${cidadeItem} - PI
                            </span>
                            <span style="color: #44BD32; font-weight: 700; font-size: 12px;">Ver anúncio &rarr;</span>
                        </div>
                    </div>
                `;

                containerGrade.appendChild(card);
            });
        }

        if (selectOrdem) {
            selectOrdem.addEventListener('change', renderizarAnuncios);
        }
        renderizarAnuncios();

        window.ItaimVendedorVitrine.renderizarAnuncios = renderizarAnuncios;
    }

    window.ItaimVendedorVitrine = {
        inicializar,
        renderizarAnuncios: null
    };
})();

// ==========================================================================
// MÓDULO: AVALIAÇÕES E COMENTÁRIOS (vendedor-avaliacoes.js)
// ==========================================================================

/**
 * ITAIM VENDE - VENDEDOR: AVALIAÇÕES, ESTRELAS E REPUTAÇÃO
 * Arquivo: frontend/js/pages/perfil/vendedor/vendedor-avaliacoes.js
 *
 * Busca avaliações reais da API (/api/v1/reviews/user/:userId),
 * exibe lista com resposta do vendedor e envia novas avaliações via POST.
 * Mantém fallback para localStorage (window.ItaimAvaliacoes) quando o
 * backend estiver offline ou o vendedor não tiver ID resolvido.
 */

(function () {
    'use strict';

    /**
     * Formata uma data ISO para exibição legível em pt-BR
     */
    function formatarData(iso) {
        if (!iso) return 'Recente';
        try {
            return new Date(iso).toLocaleDateString('pt-BR', {
                day: '2-digit', month: 'short', year: 'numeric'
            });
        } catch (_) { return 'Recente'; }
    }

    /**
     * Renderiza o HTML de um único card de avaliação
     */
    function renderizarCard(item, isVendedorLogado) {
        const notaNum = Math.min(5, Math.max(1, Math.round(item.nota || 5)));
        const estrelasTxt = '★'.repeat(notaNum) + '☆'.repeat(5 - notaNum);
        const nomeAutor = item.autor?.nome || item.autor || 'Comprador';
        const inicial = nomeAutor.charAt(0).toUpperCase();
        const avatarAutor = item.autor?.avatar
            ? (window.ItaimApi?.resolverUrlImagem?.(item.autor.avatar) || item.autor.avatar)
            : null;

        const avatarHtml = avatarAutor
            ? `<img src="${avatarAutor}" alt="${nomeAutor}" style="width:34px;height:34px;border-radius:50%;object-fit:cover;" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
               <div class="avaliacao-avatar-mini" style="width:34px;height:34px;border-radius:50%;background:#DCFCE7;color:#166534;font-weight:800;display:none;align-items:center;justify-content:center;font-size:14px;">${inicial}</div>`
            : `<div class="avaliacao-avatar-mini" style="width:34px;height:34px;border-radius:50%;background:#DCFCE7;color:#166534;font-weight:800;display:flex;align-items:center;justify-content:center;font-size:14px;">${inicial}</div>`;

        const respostaHtml = item.resposta
            ? `<div class="avaliacao-resposta" style="margin:8px 0 0 44px;padding:10px 14px;background:#F0FDF4;border-left:3px solid #22C55E;border-radius:0 8px 8px 0;">
                   <div style="font-size:12px;font-weight:700;color:#166534;margin-bottom:4px;">💬 Resposta do Vendedor</div>
                   <p style="font-size:13px;color:#334155;margin:0;line-height:1.5;">${item.resposta}</p>
               </div>`
            : (isVendedorLogado
                ? `<div style="margin:6px 0 0 44px;">
                       <button type="button" class="btn-responder-avaliacao" data-id="${item.id}"
                           style="font-size:12px;padding:5px 12px;border-radius:6px;border:1px solid #22C55E;background:transparent;color:#16A34A;cursor:pointer;font-weight:600;">
                           Responder
                       </button>
                       <form class="form-resposta-inline" data-id="${item.id}" style="display:none;margin-top:8px;">
                           <textarea placeholder="Escreva sua resposta..." rows="2"
                               style="width:100%;padding:8px 12px;border-radius:8px;border:1px solid #BBF7D0;font-family:inherit;font-size:13px;resize:vertical;box-sizing:border-box;outline:none;"></textarea>
                           <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:6px;">
                               <button type="button" class="btn-cancelar-resposta" data-id="${item.id}"
                                   style="font-size:12px;padding:5px 12px;border-radius:6px;border:1px solid #CBD5E1;background:transparent;color:#64748B;cursor:pointer;">
                                   Cancelar
                               </button>
                               <button type="submit"
                                   style="font-size:12px;padding:5px 14px;border-radius:6px;border:none;background:#22C55E;color:#fff;font-weight:700;cursor:pointer;">
                                   Publicar
                               </button>
                           </div>
                       </form>
                   </div>`
                : '');

        return `
            <div class="item-avaliacao-card" data-review-id="${item.id}" style="padding:14px 0;border-bottom:1px solid #F1F5F9;">
                <div class="avaliacao-topo-row" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;flex-wrap:wrap;gap:8px;">
                    <div class="avaliacao-autor-box" style="display:flex;align-items:center;gap:10px;">
                        <div style="display:flex;align-items:center;">${avatarHtml}</div>
                        <div>
                            <div class="avaliacao-autor-nome" style="font-weight:700;font-size:13.5px;color:#1E293B;">${nomeAutor}</div>
                            <div style="font-size:11.5px;color:#94A3B8;">${formatarData(item.data)}</div>
                        </div>
                    </div>
                    <div class="avaliacao-estrelas" style="color:#F59E0B;font-size:14px;letter-spacing:2px;">
                        ${estrelasTxt} <span style="font-size:12px;font-weight:700;color:#64748B;">(${Number(item.nota).toFixed(1)})</span>
                    </div>
                </div>
                ${item.comentario ? `<p class="avaliacao-comentario-txt" style="font-size:13.5px;color:#475569;line-height:1.5;margin:4px 0 0 44px;">${item.comentario}</p>` : ''}
                ${respostaHtml}
            </div>`;
    }

    async function inicializar() {
        const { exibirToast } = window.ItaimVendedorUtils;
        const vendedor = window.ItaimVendedorDados?.obterVendedor() || {};
        const vendedorId = vendedor.id || null;

        const elReputacaoMedia = document.getElementById('stat-reputacao-media');
        const elReputacaoLegenda = document.getElementById('stat-reputacao-legenda');
        const elBadgeAvaliacoes = document.getElementById('badge-contador-avaliacoes');
        const containerAvaliacoes = document.getElementById('lista-avaliacoes-vendedor');
        const formAvaliacao = document.getElementById('form-nova-avaliacao');
        const inputNota = document.getElementById('input-nota-avaliacao');
        const inputAutor = document.getElementById('input-autor-avaliacao');
        const textareaComentario = document.getElementById('textarea-comentario');
        const labelNota = document.getElementById('label-nota-selecionada');
        const estrelasContainer = document.getElementById('estrelas-seletor');
        const boxForm = document.getElementById('box-form-avaliacao');

        // Usuário logado
        const usuarioLogado = (window.ItaimSessao && typeof window.ItaimSessao.obterUsuarioLogado === 'function')
            ? window.ItaimSessao.obterUsuarioLogado()
            : null;
        const isLogado = !!usuarioLogado?.id;
        // Verifica se o usuário logado é o próprio vendedor (para exibir botão de responder)
        const isVendedorLogado = isLogado && usuarioLogado.id === vendedorId;
        // Esconde formulário de avaliação se for o próprio vendedor
        if (isVendedorLogado && boxForm) {
            boxForm.style.display = 'none';
        }

        // Preenche nome do autor logado
        const nomeLogado = usuarioLogado?.name || usuarioLogado?.nome || usuarioLogado?.username || '';
        if (inputAutor && nomeLogado) inputAutor.value = nomeLogado;
        const labelAutorVendedor = document.getElementById('vendedor-nome-autor-logado');
        if (labelAutorVendedor) labelAutorVendedor.textContent = nomeLogado || 'Visitante';

        // =====================================================================
        // BUSCA AVALIAÇÕES DA API REAL
        // =====================================================================
        let avaliacoes = [];
        let mediaGeral = Number(vendedor.ratingAverage || 5.0);
        let totalAvaliacoes = vendedor.ratingCount || 0;
        let usouApi = false;

        if (vendedorId && window.ItaimApi?.reviews?.listar) {
            try {
                const res = await window.ItaimApi.reviews.listar(vendedorId);
                if (res?.success && Array.isArray(res.avaliacoes)) {
                    avaliacoes = res.avaliacoes;
                    mediaGeral = res.vendedor?.mediaGeral ?? mediaGeral;
                    totalAvaliacoes = res.vendedor?.totalAvaliacoes ?? totalAvaliacoes;
                    usouApi = true;
                }
            } catch (err) {
                console.info('[VendedorAvaliacoes] Fallback para dados locais:', err.message);
            }
        }

        // Fallback: dados do localStorage/ItaimAvaliacoes
        if (!usouApi && window.ItaimAvaliacoes) {
            const lista = window.ItaimAvaliacoes.obter(vendedor);
            const stats = window.ItaimAvaliacoes.calcularMedia(lista, vendedor);
            avaliacoes = lista.map(item => ({
                id: item.id,
                nota: item.nota,
                comentario: item.comentario,
                resposta: item.resposta || null,
                data: item.data || null,
                autor: { nome: item.autor, avatar: null }
            }));
            if (stats.total > 0) {
                mediaGeral = stats.media;
                totalAvaliacoes = stats.total;
            }
        }

        // =====================================================================
        // ATUALIZA INDICADORES DE REPUTAÇÃO
        // =====================================================================
        function atualizarReputacao(media, total) {
            const mediaText = total > 0 ? `${Number(media).toFixed(1)} ★` : `${Number(media).toFixed(1)} ★`;
            const legendaText = `Avaliações (${total})`;
            const badgeText = `${Number(media).toFixed(1)} ★ (${total})`;
            if (elReputacaoMedia) elReputacaoMedia.textContent = mediaText;
            if (elReputacaoLegenda) elReputacaoLegenda.textContent = legendaText;
            if (elBadgeAvaliacoes) elBadgeAvaliacoes.textContent = badgeText;
        }

        atualizarReputacao(mediaGeral, totalAvaliacoes);

        // =====================================================================
        // RENDERIZA LISTA DE AVALIAÇÕES
        // =====================================================================
        function renderizarLista(lista) {
            if (!containerAvaliacoes) return;
            if (lista.length === 0) {
                containerAvaliacoes.innerHTML = `
                    <div class="avaliacoes-vazio" style="text-align:center;padding:32px 18px;border-radius:12px;border:1px dashed #CBD5E1;margin-top:10px;">
                        <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="#94A3B8" stroke-width="1.8" style="margin-bottom:8px;">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                        <h4>Nenhuma avaliação ainda</h4>
                        <p style="font-size:13.5px;margin:0;">Seja o primeiro a deixar uma avaliação sobre este vendedor!</p>
                    </div>`;
                return;
            }

            containerAvaliacoes.innerHTML = lista.map(item => renderizarCard(item, isVendedorLogado)).join('');
            vincularEventosResposta(lista);
        }

        // =====================================================================
        // EVENTOS: RESPONDER AVALIAÇÃO (PARA O PRÓPRIO VENDEDOR)
        // =====================================================================
        function vincularEventosResposta(lista) {
            if (!isVendedorLogado || !containerAvaliacoes) return;

            containerAvaliacoes.querySelectorAll('.btn-responder-avaliacao').forEach(btn => {
                const id = btn.getAttribute('data-id');
                const form = containerAvaliacoes.querySelector(`.form-resposta-inline[data-id="${id}"]`);
                btn.addEventListener('click', () => {
                    btn.style.display = 'none';
                    if (form) form.style.display = 'block';
                });
            });

            containerAvaliacoes.querySelectorAll('.btn-cancelar-resposta').forEach(btn => {
                const id = btn.getAttribute('data-id');
                const form = containerAvaliacoes.querySelector(`.form-resposta-inline[data-id="${id}"]`);
                const btnResponder = containerAvaliacoes.querySelector(`.btn-responder-avaliacao[data-id="${id}"]`);
                btn.addEventListener('click', () => {
                    if (form) form.style.display = 'none';
                    if (btnResponder) btnResponder.style.display = 'inline-block';
                });
            });

            containerAvaliacoes.querySelectorAll('.form-resposta-inline').forEach(form => {
                form.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const id = form.getAttribute('data-id');
                    const textarea = form.querySelector('textarea');
                    const texto = textarea?.value.trim() || '';
                    if (!texto) return;

                    const btnSubmit = form.querySelector('[type="submit"]');
                    if (btnSubmit) { btnSubmit.disabled = true; btnSubmit.textContent = 'Enviando...'; }

                    try {
                        if (window.ItaimApi?.reviews?.responder) {
                            await window.ItaimApi.reviews.responder(id, texto);
                        }
                        // Atualiza localmente sem nova requisição
                        const idx = lista.findIndex(a => a.id === id);
                        if (idx !== -1) lista[idx].resposta = texto;
                        renderizarLista(lista);
                        exibirToast('Resposta publicada com sucesso!');
                    } catch (err) {
                        exibirToast(err.message || 'Erro ao publicar resposta.');
                        if (btnSubmit) { btnSubmit.disabled = false; btnSubmit.textContent = 'Publicar'; }
                    }
                });
            });
        }

        renderizarLista(avaliacoes);

        // =====================================================================
        // SELETOR VISUAL DE ESTRELAS (1 a 5)
        // =====================================================================
        if (estrelasContainer) {
            const estrelas = estrelasContainer.querySelectorAll('.estrela-item');

            function destacarEstrelas(qtd) {
                estrelas.forEach(estrela => {
                    const valor = parseInt(estrela.dataset.valor);
                    estrela.classList.toggle('ativa', valor <= qtd);
                    estrela.style.color = valor <= qtd ? '#F59E0B' : '#CBD5E1';
                });
            }

            estrelas.forEach(estrela => {
                estrela.addEventListener('click', () => {
                    const valor = parseInt(estrela.dataset.valor);
                    if (inputNota) inputNota.value = valor;
                    if (labelNota) labelNota.textContent = `(${valor}.0)`;
                    destacarEstrelas(valor);
                });
                estrela.addEventListener('mouseenter', () => destacarEstrelas(parseInt(estrela.dataset.valor)));
            });
            estrelasContainer.addEventListener('mouseleave', () => {
                destacarEstrelas(parseInt(inputNota?.value || '5'));
            });
        }

        // =====================================================================
        // ENVIO DO FORMULÁRIO DE AVALIAÇÃO
        // =====================================================================
        if (formAvaliacao && !isVendedorLogado) {
            formAvaliacao.addEventListener('submit', async (e) => {
                e.preventDefault();

                const nota = parseInt(inputNota?.value || '5', 10);
                const comentario = textareaComentario?.value.trim() || '';

                if (!comentario) {
                    exibirToast('Por favor, escreva um comentário sobre a sua negociação.');
                    return;
                }

                if (!isLogado) {
                    exibirToast('Você precisa estar logado para avaliar este vendedor.');
                    return;
                }

                const btnEnviar = document.getElementById('btn-enviar-avaliacao');
                if (btnEnviar) { btnEnviar.disabled = true; btnEnviar.querySelector('span').textContent = 'Enviando...'; }

                try {
                    let novaAvaliacao = null;

                    // Tenta via API real
                    if (vendedorId && window.ItaimApi?.reviews?.enviar) {
                        const res = await window.ItaimApi.reviews.enviar(vendedorId, { rating: nota, comment: comentario });
                        if (res?.review) {
                            novaAvaliacao = {
                                id: res.review.id,
                                nota: res.review.rating,
                                comentario: res.review.comment,
                                resposta: res.review.reply || null,
                                data: res.review.createdAt,
                                autor: {
                                    id: res.review.author?.id,
                                    nome: res.review.author?.name || nomeLogado,
                                    avatar: res.review.author?.avatar || null
                                }
                            };
                            // Atualiza média localmente
                            mediaGeral = res.novaMedia ?? mediaGeral;
                            totalAvaliacoes = res.totalAvaliacoes ?? (totalAvaliacoes + 1);
                            atualizarReputacao(mediaGeral, totalAvaliacoes);
                        }
                    }

                    // Fallback: adiciona localmente
                    if (!novaAvaliacao && window.ItaimAvaliacoes) {
                        window.ItaimAvaliacoes.adicionar(vendedor, { autor: nomeLogado, nota, comentario });
                        novaAvaliacao = {
                            id: Date.now().toString(),
                            nota,
                            comentario,
                            resposta: null,
                            data: new Date().toISOString(),
                            autor: { nome: nomeLogado, avatar: null }
                        };
                    }

                    if (novaAvaliacao) {
                        avaliacoes.unshift(novaAvaliacao);
                        renderizarLista(avaliacoes);
                    }

                    if (textareaComentario) textareaComentario.value = '';
                    exibirToast('Avaliação enviada com sucesso!');
                } catch (err) {
                    exibirToast(err.message || 'Erro ao enviar avaliação. Tente novamente.');
                } finally {
                    if (btnEnviar) {
                        btnEnviar.disabled = false;
                        const span = btnEnviar.querySelector('span');
                        if (span) span.textContent = 'Enviar Avaliação';
                    }
                }
            });
        }
    }

    window.ItaimVendedorAvaliacoes = { inicializar };
})();

// ==========================================================================
// MÓDULO: ORQUESTRADOR GERAL (index.js)
// ==========================================================================

/**
 * ITAIM VENDE - VENDEDOR: ORQUESTRADOR GERAL
 * Arquivo: frontend/js/pages/perfil/vendedor/index.js
 */

(function () {
    'use strict';

    async function inicializar() {
        if (window.ItaimVendedorDados?.inicializar) {
            await window.ItaimVendedorDados.inicializar();
        }
        if (window.ItaimVendedorVitrine?.inicializar) {
            window.ItaimVendedorVitrine.inicializar();
        }
        if (window.ItaimVendedorAvaliacoes?.inicializar) {
            await window.ItaimVendedorAvaliacoes.inicializar();
        }


        // Sincronização do Header Global
        if (window.ItaimSessao && typeof window.ItaimSessao.atualizarHeaderUsuario === 'function') {
            window.ItaimSessao.atualizarHeaderUsuario();
        }
    }

    window.ItaimVendedorOrquestrador = {
        inicializar
    };
})();


// ==========================================================================
// INICIALIZAÇÃO AUTOMÁTICA DO BUNDLE
// ==========================================================================
document.addEventListener('DOMContentLoaded', async () => {
    if (window.ItaimVendedorOrquestrador?.inicializar) {
        await window.ItaimVendedorOrquestrador.inicializar();
    }
});
