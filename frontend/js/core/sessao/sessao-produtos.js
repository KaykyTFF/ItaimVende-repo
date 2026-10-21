/**
 * ITAIM VENDE - MÓDULO DE GESTÃO DE ANÚNCIOS E PRODUTOS LOCAIS
 * Arquivo: frontend/js/core/sessao/sessao-produtos.js
 * 
 * Responsabilidades:
 * - Leitura e mescla de produtos iniciais e cadastrados localmente
 * - Filtro de anúncios por vendedor logado
 * - Publicação de novos anúncios locais com proteção de cota
 * - Alteração de status (ativo / pausado / vendido)
 * - Exclusão lógica de anúncios e limpeza de resíduos
 */

(function() {
    'use strict';

    // Retorna todos os produtos do sistema (iniciais + cadastrados localmente)
    function obterTodosProdutos() {
        let todos = [];
        if (typeof PRODUTOS_INICIAIS !== 'undefined' && Array.isArray(PRODUTOS_INICIAIS)) {
            todos = [...PRODUTOS_INICIAIS];
        }
        
        try {
            const locais = JSON.parse(localStorage.getItem('itaim_produtos_cadastrados') || '[]');
            if (Array.isArray(locais)) {
                todos = [...locais, ...todos];
            }
        } catch (e) {}

        // Filtrar produtos excluídos pelo usuário
        try {
            const excluidos = JSON.parse(localStorage.getItem('itaim_produtos_excluidos') || '[]');
            if (Array.isArray(excluidos) && excluidos.length > 0) {
                const setExcluidos = new Set(excluidos.map(id => String(id)));
                todos = todos.filter(p => !setExcluidos.has(String(p.id)));
            }
        } catch (e) {}

        // Sincronizar status modificado (ativo/pausado/vendido)
        try {
            const statusMap = JSON.parse(localStorage.getItem('itaim_produtos_status_map') || '{}');
            todos = todos.map(p => {
                const sId = String(p.id);
                if (statusMap[sId]) {
                    return { ...p, status: statusMap[sId] };
                }
                return p;
            });
        } catch (e) {}

        // Fallback de dados para desenvolvimento no front-end quando a base estiver vazia
        if (todos.length === 0) {
            const isDev = (window.ItaimSessaoAuth && typeof window.ItaimSessaoAuth.isModoDevFrontend === 'function' && window.ItaimSessaoAuth.isModoDevFrontend())
                || (window.ItaimSessao && typeof window.ItaimSessao.isModoDevFrontend === 'function' && window.ItaimSessao.isModoDevFrontend());
            if (isDev) {
                return [...PRODUTOS_MOCK_DEV];
            }
        }

        return todos;
    }

    const PRODUTOS_MOCK_DEV = [
        {
            id: 'mock_1',
            titulo: 'iPhone 13 Pro 128GB Grafite - Impecável com Caixa',
            preco: 3450,
            categoria: 'Eletrônicos',
            condicao: 'Usado - Excelente',
            cidade: 'Paulistana',
            bairro: 'Centro',
            imagem: 'assets/produtos/anuncio_11.jpg',
            fotos: ['assets/produtos/anuncio_11.jpg'],
            descricao: 'Aparelho 100% original, bateria com 89% de saúde, sem marcas ou arranhões. Acompanha cabo e capinha.',
            status: 'ativo',
            data: '20/10/2026',
            visualizacoes: 42,
            conversas: 5,
            favorito: false,
            vendedorId: 'usr_dev_frontend',
            vendedorNome: 'Dev Front-End',
            vendedorEmail: 'dev@itaimvende.com',
            vendedorUsername: 'dev_front',
            vendedorTelefone: '89994000000',
            vendedorCidade: 'Paulistana',
            vendedorAvatar: 'assets/icons/icon-user.png'
        },
        {
            id: 'mock_2',
            titulo: 'Bicicleta Aro 29 Mountain Bike Shimano 24V Freio a Disco',
            preco: 1290,
            categoria: 'Esportes',
            condicao: 'Semi-nova',
            cidade: 'Paulistana',
            bairro: 'Correnteza',
            imagem: 'assets/produtos/anuncio_13.jpg',
            fotos: ['assets/produtos/anuncio_13.jpg'],
            descricao: 'Pouco usada, revisada recentemente. Câmbio Shimano original, pneus com cravos novos.',
            status: 'ativo',
            data: '19/10/2026',
            visualizacoes: 28,
            conversas: 3,
            favorito: true,
            vendedorId: 'cmv5iacmv0000ttiwu9wtemar',
            vendedorNome: 'Admin',
            vendedorEmail: 'admin@gmail.com',
            vendedorUsername: 'adminfreefire',
            vendedorTelefone: '89999985858',
            vendedorCidade: 'Paulistana',
            vendedorAvatar: 'assets/icons/icon-user.png'
        },
        {
            id: 'mock_3',
            titulo: 'Sofá Retrátil e Reclinável 3 Lugares Suede Bege',
            preco: 1100,
            categoria: 'Móveis',
            condicao: 'Usado',
            cidade: 'Paulistana',
            bairro: 'Guarani',
            imagem: 'assets/produtos/anuncio_15.jpg',
            fotos: ['assets/produtos/anuncio_15.jpg'],
            descricao: 'Muito confortável, espuma D28, tecido impermeabilizado. Medidas: 2.10m de largura.',
            status: 'ativo',
            data: '18/10/2026',
            visualizacoes: 19,
            conversas: 2,
            favorito: false,
            vendedorId: 'usr_dev_frontend',
            vendedorNome: 'Dev Front-End',
            vendedorEmail: 'dev@itaimvende.com',
            vendedorUsername: 'dev_front',
            vendedorTelefone: '89994000000',
            vendedorCidade: 'Paulistana',
            vendedorAvatar: 'assets/icons/icon-user.png'
        },
        {
            id: 'mock_4',
            titulo: 'Smart TV 50 Polegadas 4K UHD Wi-Fi Bluetooth HDR',
            preco: 1850,
            categoria: 'Eletrônicos',
            condicao: 'Semi-nova',
            cidade: 'Paulistana',
            bairro: 'Centro',
            imagem: 'assets/produtos/anuncio_12.jpg',
            fotos: ['assets/produtos/anuncio_12.jpg'],
            descricao: 'Perfeito estado, com controle smart magic original e nota fiscal. Apenas 8 meses de uso.',
            status: 'ativo',
            data: '17/10/2026',
            visualizacoes: 56,
            conversas: 7,
            favorito: false,
            vendedorId: 'cmv5iacmv0000ttiwu9wtemar',
            vendedorNome: 'Admin',
            vendedorEmail: 'admin@gmail.com',
            vendedorUsername: 'adminfreefire',
            vendedorTelefone: '89999985858',
            vendedorCidade: 'Paulistana',
            vendedorAvatar: 'assets/icons/icon-user.png'
        }
    ];

    // Retorna todos os anúncios pertencentes ao usuário solicitado
    function obterAnunciosDoUsuario(emailOuUsername) {
        const todos = obterTodosProdutos();
        if (!emailOuUsername) return [];

        const raw = emailOuUsername.toLowerCase().trim();
        const semArroba = raw.replace('@', '');
        return todos.filter(p => {
            const pEmail = (p.vendedorEmail || '').toLowerCase().trim();
            const pUser = (p.vendedorUsername || '').toLowerCase().trim();
            const pId = String(p.vendedorId || p.sellerId || '');
            const pNome = (p.vendedorNome || p.vendedor || '').toLowerCase().trim();
            if (raw === 'admin@gmail.com' || semArroba === 'admin' || semArroba === 'rsstore' || semArroba === 'adminfreefire') {
                return pEmail === 'admin@gmail.com' || pUser === 'admin' || pUser === 'adminfreefire' || pId === 'cmv5iacmv0000ttiwu9wtemar';
            }
            return pEmail === raw || pEmail === semArroba || (pUser && (pUser === semArroba || pUser === raw)) || pId === raw;
        });
    }

    // Adiciona um novo anúncio criado pelo usuário logado
    function adicionarNovoAnuncio(dados) {
        const user = (window.ItaimSessaoAuth && typeof window.ItaimSessaoAuth.obterUsuarioLogado === 'function')
            ? window.ItaimSessaoAuth.obterUsuarioLogado()
            : ((window.ItaimSessao && typeof window.ItaimSessao.obterUsuarioLogado === 'function') ? window.ItaimSessao.obterUsuarioLogado() : {});

        const novoId = Date.now();
        const novoAnuncio = {
            id: novoId,
            titulo: dados.titulo,
            preco: Number(dados.preco) || 0,
            categoria: dados.categoria || 'Geral',
            condicao: dados.condicao || 'Usado',
            cidade: dados.cidade || user.cidade || 'Paulistana',
            bairro: dados.bairro || user.bairro || 'Centro',
            imagem: (dados.imagens && dados.imagens[0]) || 'assets/placeholders/produto-placeholder.svg',
            fotos: dados.imagens && dados.imagens.length > 0 ? dados.imagens : ['assets/placeholders/produto-placeholder.svg'],
            descricao: dados.descricao || '',
            status: 'ativo',
            data: new Intl.DateTimeFormat('pt-BR').format(new Date()),
            visualizacoes: 1,
            conversas: 0,
            favorito: false,
            vendedorId: user.id || 'admin',
            vendedorNome: user.nome || 'Admin',
            vendedorEmail: user.email || 'admin@gmail.com',
            vendedorUsername: user.username || (user.email ? user.email.split('@')[0] : 'adminfreefire'),
            vendedorTelefone: user.telefone ? user.telefone.replace(/\D/g, '') : '5589999999999',
            vendedorCidade: user.cidade || 'Paulistana',
            vendedorAvatar: user.avatar || 'assets/icons/icon-user.png'
        };

        let locais = [];
        try {
            locais = JSON.parse(localStorage.getItem('itaim_produtos_cadastrados') || '[]');
            if (!Array.isArray(locais)) locais = [];
        } catch(e) {
            locais = [];
        }

        locais.unshift(novoAnuncio);

        try {
            localStorage.setItem('itaim_produtos_cadastrados', JSON.stringify(locais));
        } catch (err) {
            console.warn('Alerta de cota no localStorage ao salvar anúncio:', err);
            try {
                // Remove fotos pesadas em base64 de anúncios anteriores para liberar espaço imediatamente
                locais = locais.map((p, idx) => {
                    if (idx > 0 && p.fotos && p.fotos.length > 0 && p.fotos[0].startsWith('data:')) {
                        return { ...p, fotos: ['assets/produtos/anuncio_11.jpg'], imagem: 'assets/produtos/anuncio_11.jpg' };
                    }
                    return p;
                });
                localStorage.setItem('itaim_produtos_cadastrados', JSON.stringify(locais));
            } catch (err2) {
                console.error('Falha crítica de armazenamento:', err2);
            }
        }

        return novoAnuncio;
    }

    // Atualiza status do anúncio ('ativo', 'pausado', 'vendido')
    function atualizarStatusAnuncio(id, novoStatus) {
        const idStr = String(id);
        
        let locais = JSON.parse(localStorage.getItem('itaim_produtos_cadastrados') || '[]');
        locais = locais.map(p => {
            if (String(p.id) === idStr) {
                return { ...p, status: novoStatus };
            }
            return p;
        });
        localStorage.setItem('itaim_produtos_cadastrados', JSON.stringify(locais));

        let statusMap = JSON.parse(localStorage.getItem('itaim_produtos_status_map') || '{}');
        statusMap[idStr] = novoStatus;
        localStorage.setItem('itaim_produtos_status_map', JSON.stringify(statusMap));

        return true;
    }

    // Exclui um anúncio
    function excluirAnuncio(id) {
        const idStr = String(id);
        
        let locais = JSON.parse(localStorage.getItem('itaim_produtos_cadastrados') || '[]');
        locais = locais.filter(p => String(p.id) !== idStr);
        localStorage.setItem('itaim_produtos_cadastrados', JSON.stringify(locais));

        let excluidos = JSON.parse(localStorage.getItem('itaim_produtos_excluidos') || '[]');
        if (!excluidos.includes(idStr)) {
            excluidos.push(idStr);
            localStorage.setItem('itaim_produtos_excluidos', JSON.stringify(excluidos));
        }

        return true;
    }

    // Limpa produtos em venda e notificações a pedido do usuário
    function limparDadosZerados() {
        try {
            if (localStorage.getItem('itaim_zerado_v4') !== 'true') {
                localStorage.setItem('itaim_produtos_cadastrados', JSON.stringify([]));
                localStorage.setItem('itaim_notificacoes', JSON.stringify([]));
                localStorage.setItem('itaim_favoritos', JSON.stringify([]));
                localStorage.removeItem('itaim_produtos_excluidos');
                localStorage.removeItem('itaim_produtos_status_map');
                localStorage.setItem('itaim_zerado_v4', 'true');
            }

            // Remove comentários falsos de enfeite de todas as chaves de avaliações existentes
            const chaves = [];
            for (let i = 0; i < localStorage.length; i++) {
                chaves.push(localStorage.key(i));
            }
            chaves.forEach(k => {
                if (k && k.startsWith('itaim_avaliacoes_')) {
                    try {
                        const lista = JSON.parse(localStorage.getItem(k) || '[]');
                        if (Array.isArray(lista)) {
                            const limpos = lista.filter(item => {
                                if (!item) return false;
                                const autor = (item.autor || '').trim();
                                const com = (item.comentario || '').trim();
                                if (autor === 'Lucas Ribeiro' || autor === 'Ana Paula') return false;
                                if (com.includes('WhatsApp e o produto veio exatamente')) return false;
                                if (com.includes('Negociação tranquila e segura')) return false;
                                return true;
                            });
                            localStorage.setItem(k, JSON.stringify(limpos));
                        }
                    } catch(e) {}
                }
            });
        } catch(e) {}
    }

    // Exporta API no namespace de Produtos
    window.ItaimSessaoProdutos = {
        obterTodosProdutos,
        obterAnunciosDoUsuario,
        adicionarNovoAnuncio,
        atualizarStatusAnuncio,
        excluirAnuncio,
        limparDadosZerados
    };

})();
