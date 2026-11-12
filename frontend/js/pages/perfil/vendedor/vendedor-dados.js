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

            // Fallback secundário no backend por email ou username caso a busca por ID falhe
            if (!vendedor && (paramEmail || paramUsername)) {
                const fallbackId = (identificador === paramId) ? (paramEmail || paramUsername) : (paramId || paramUsername);
                if (fallbackId && fallbackId !== identificador) {
                    try {
                        const resFb = await window.ItaimApi.produtos.doVendedor(fallbackId);
                        if (resFb && resFb.success && resFb.seller) {
                            vendedor = resFb.seller;
                            if (Array.isArray(resFb.products)) {
                                anunciosVendedor = resFb.products;
                            }
                        }
                    } catch (_) {}
                }
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
                    const prodCount = Number(prodMatch.vendedorTotalAvaliacoes || prodMatch.seller?.ratingCount || 0);
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
                        ratingAverage: prodCount > 0 ? Number(prodMatch.vendedorAvaliacao || prodMatch.seller?.ratingAverage || 0) : 0.0,
                        ratingCount: prodCount,
                        salesCount: Number(prodMatch.vendedorVendas || 0)
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
        }

        if (!vendedor) {
            // Se NÃO especificou nenhum parâmetro na URL, verifica se há usuário logado para exibir o próprio perfil
            const temParametrosVendedor = Boolean(paramId || paramEmail || paramNome || paramUsername || identificador);

            let usuarioLogado = (window.ItaimSessao && typeof window.ItaimSessao.obterUsuarioLogado === 'function')
                ? window.ItaimSessao.obterUsuarioLogado()
                : null;
            if (!usuarioLogado) {
                try { usuarioLogado = JSON.parse(localStorage.getItem('itaim_usuario_logado') || 'null'); } catch (_) {}
            }
            if (!usuarioLogado) {
                try { usuarioLogado = JSON.parse(localStorage.getItem('itaim_perfil_usuario') || 'null'); } catch (_) {}
            }

            if (!temParametrosVendedor && usuarioLogado && (usuarioLogado.id || usuarioLogado.email)) {
                vendedor = { ...usuarioLogado };
            } else {
                const nomeFinal = paramNome || (paramEmail ? paramEmail.split('@')[0] : 'Vendedor');
                vendedor = {
                    id: paramId || Date.now(),
                    name: nomeFinal,
                    nome: nomeFinal,
                    username: paramUsername || (paramNome ? paramNome.toLowerCase().replace(/\s+/g, '') : (paramEmail ? paramEmail.split('@')[0] : 'vendedor')),
                    email: paramEmail || '',
                    phone: '(89) 99999-9999',
                    city: 'Paulistana',
                    avatar: 'assets/icons/icon-user.png',
                    bio: `Perfil de ${nomeFinal} na plataforma Itaim Vende.`,
                    createdAt: '2024-01-01',
                    ratingAverage: 0.0,
                    ratingCount: 0,
                    salesCount: 0
                };
            }
        }

        // Garante que se ratingCount for 0, ratingAverage é 0.0
        if (vendedor) {
            const rCount = Number(vendedor.ratingCount || 0);
            if (rCount === 0) {
                vendedor.ratingAverage = 0.0;
                vendedor.ratingCount = 0;
            } else {
                vendedor.ratingAverage = Number(vendedor.ratingAverage || 0);
            }
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

        // Botão WhatsApp (somente se tiver número cadastrado)
        const btnWpp = document.getElementById('btn-vendedor-wpp');
        if (btnWpp) {
            const telRaw = vendedor.phone || vendedor.telefone || '';
            let foneLimpo = String(telRaw).replace(/\D/g, '');
            if (!foneLimpo || foneLimpo.length < 10) {
                btnWpp.style.display = 'none';
            } else {
                if (foneLimpo.length === 10 || foneLimpo.length === 11) {
                    foneLimpo = '55' + foneLimpo;
                }
                const msg = encodeURIComponent(`Olá ${nomeExibido}! Vi seu perfil de vendedor no portal Itaim Vende e gostaria de conversar sobre seus anúncios.`);
                btnWpp.href = `https://wa.me/${foneLimpo}?text=${msg}`;
                btnWpp.style.display = 'inline-flex';
            }
        }

        // Botão Compartilhar Perfil
        const btnCompartilhar = document.getElementById('btn-vendedor-compartilhar');
        if (btnCompartilhar) {
            btnCompartilhar.addEventListener('click', () => {
                const link = window.location.href;
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(link).then(() => {
                        exibirToast('Link do perfil copiado para a área de transferência!');
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
