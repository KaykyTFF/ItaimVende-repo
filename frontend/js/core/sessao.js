/**
 * ITAIM VENDE - GERENCIADOR CENTRAL DE SESSÃO & CONTAS
 * Suporta o perfil Admin padrão e criação/login de novos perfis de usuários reais.
 */

(function() {
    'use strict';

    // 1. USUÁRIO ADMIN PADRÃO DO SISTEMA
    const USUARIO_ADMIN = {
        id: 1,
        nome: "Raili",
        username: "rsstore",
        email: "admin@gmail.com",
        telefone: "(85) 99985-8585",
        cidade: "Paulistana",
        bairro: "Centro",
        avatar: "assets/icon-user.png",
        bio: "Perfil de Raili no Itaim Vende.",
        dataCadastro: "Membro desde 2024",
        avaliacao: "5.0",
        totalAvaliacoes: 0,
        vendasConcluidas: 0
    };

    // Inicializa a base de usuários com Admin e mantém novos perfis criados
    function carregarUsuarios() {
        let lista = [USUARIO_ADMIN];
        try {
            let perfilCustom = null;
            try {
                perfilCustom = JSON.parse(localStorage.getItem('itaim_perfil_usuario') || 'null');
            } catch(e) {}

            const salvos = JSON.parse(localStorage.getItem('itaim_usuarios_db') || '[]');
            if (Array.isArray(salvos) && salvos.length > 0) {
                // Filtra perfis mock antigos de teste (Giselly, Railton, João)
                const filtrados = salvos.filter(u => {
                    const em = (u.email || '').toLowerCase();
                    return em !== 'giselly@itaimvende.com' && 
                           em !== 'railton@itaimvende.com' && 
                           em !== 'joao@itaimvende.com';
                });

                // Garante que o Admin existe
                const adminIdx = filtrados.findIndex(u => (u.email || '').toLowerCase() === 'admin@gmail.com' || u.id === 1);
                if (adminIdx !== -1) {
                    filtrados[adminIdx] = { ...USUARIO_ADMIN, ...filtrados[adminIdx] };
                    if (perfilCustom && (perfilCustom.nome || perfilCustom.usuario || perfilCustom.telefone || perfilCustom.avatar)) {
                        filtrados[adminIdx] = {
                            ...filtrados[adminIdx],
                            nome: perfilCustom.nome || filtrados[adminIdx].nome,
                            username: perfilCustom.usuario || perfilCustom.username || filtrados[adminIdx].username,
                            telefone: perfilCustom.telefone || filtrados[adminIdx].telefone,
                            cidade: perfilCustom.cidade || filtrados[adminIdx].cidade,
                            bairro: perfilCustom.bairro || filtrados[adminIdx].bairro,
                            email: perfilCustom.email || filtrados[adminIdx].email,
                            avatar: perfilCustom.avatar || filtrados[adminIdx].avatar
                        };
                    }
                    lista = filtrados;
                } else {
                    let adminObj = { ...USUARIO_ADMIN };
                    if (perfilCustom && (perfilCustom.nome || perfilCustom.usuario || perfilCustom.telefone || perfilCustom.avatar)) {
                        adminObj = {
                            ...adminObj,
                            nome: perfilCustom.nome || adminObj.nome,
                            username: perfilCustom.usuario || perfilCustom.username || adminObj.username,
                            telefone: perfilCustom.telefone || adminObj.telefone,
                            cidade: perfilCustom.cidade || adminObj.cidade,
                            bairro: perfilCustom.bairro || adminObj.bairro,
                            email: perfilCustom.email || adminObj.email,
                            avatar: perfilCustom.avatar || adminObj.avatar
                        };
                    }
                    lista = [adminObj, ...filtrados];
                }

                // Sincroniza também se perfilCustom pertencer a outro usuário cadastrado
                if (perfilCustom && perfilCustom.avatar && perfilCustom.avatar !== 'assets/icon-user.png') {
                    const customEmail = (perfilCustom.email || '').toLowerCase().trim();
                    const customNome = (perfilCustom.nome || '').toLowerCase().trim();
                    const outroIdx = lista.findIndex(u => 
                        (customEmail && (u.email || '').toLowerCase() === customEmail) ||
                        (customNome && (u.nome || '').toLowerCase() === customNome)
                    );
                    if (outroIdx !== -1) {
                        lista[outroIdx].avatar = perfilCustom.avatar;
                    }
                }
            } else if (perfilCustom && (perfilCustom.nome || perfilCustom.usuario || perfilCustom.telefone || perfilCustom.avatar)) {
                lista = [{
                    ...USUARIO_ADMIN,
                    nome: perfilCustom.nome || USUARIO_ADMIN.nome,
                    username: perfilCustom.usuario || perfilCustom.username || USUARIO_ADMIN.username,
                    telefone: perfilCustom.telefone || USUARIO_ADMIN.telefone,
                    cidade: perfilCustom.cidade || USUARIO_ADMIN.cidade,
                    bairro: perfilCustom.bairro || USUARIO_ADMIN.bairro,
                    email: perfilCustom.email || USUARIO_ADMIN.email,
                    avatar: perfilCustom.avatar || USUARIO_ADMIN.avatar
                }];
            }
        } catch (e) {}

        localStorage.setItem('itaim_usuarios_db', JSON.stringify(lista));
        return lista;
    }

    // Retorna todos os usuários cadastrados
    function obterTodosUsuarios() {
        return carregarUsuarios();
    }

    // Busca usuário por email
    function obterUsuarioPorEmail(email) {
        if (!email) return USUARIO_ADMIN;
        const lista = carregarUsuarios();
        const busca = email.toLowerCase().trim();
        return lista.find(u => (u.email || '').toLowerCase() === busca) || null;
    }

    // Busca usuário por username
    function obterUsuarioPorUsername(username) {
        if (!username) return null;
        const lista = carregarUsuarios();
        const limpo = username.replace('@', '').toLowerCase().trim();
        return lista.find(u => (u.username || '').toLowerCase() === limpo) || null;
    }

    // Retorna o usuário logado na sessão atual
    function obterUsuarioLogado() {
        let emailAtivo = localStorage.getItem('itaim_usuario_logado_email');
        if (!emailAtivo) {
            emailAtivo = 'admin@gmail.com';
            localStorage.setItem('itaim_usuario_logado_email', emailAtivo);
        }
        
        let user = obterUsuarioPorEmail(emailAtivo);
        if (!user) {
            const lista = carregarUsuarios();
            user = lista[0] || USUARIO_ADMIN;
            localStorage.setItem('itaim_usuario_logado_email', user.email);
        }
        return user;
    }

    // Define o usuário logado e atualiza a interface
    function definirUsuarioLogado(emailOuUser) {
        if (!emailOuUser) return USUARIO_ADMIN;
        let user = obterUsuarioPorEmail(emailOuUser) || obterUsuarioPorUsername(emailOuUser);
        
        // Se for admin ou admin@admin.com
        if (!user && (emailOuUser.toLowerCase() === 'admin' || emailOuUser.toLowerCase() === 'admin@gmail.com')) {
            user = USUARIO_ADMIN;
        }

        // Se for um novo e-mail válido que ainda não estava cadastrado, cadastra-o automaticamente
        if (!user && emailOuUser.includes('@')) {
            const res = cadastrarNovoUsuario({
                nome: emailOuUser.split('@')[0],
                email: emailOuUser
            });
            user = res.usuario;
        }

        if (user) {
            // Se a conta estava suspensa, reativa automaticamente no login
            if (user.status === 'suspenso' || user.suspenso) {
                user.status = 'ativo';
                delete user.suspenso;
                const todos = carregarUsuarios();
                const uIdx = todos.findIndex(u => (u.email || '').toLowerCase() === (user.email || '').toLowerCase());
                if (uIdx !== -1) {
                    todos[uIdx].status = 'ativo';
                    delete todos[uIdx].suspenso;
                    localStorage.setItem('itaim_usuarios_db', JSON.stringify(todos));
                }
            }
            localStorage.setItem('itaim_usuario_logado_email', user.email);
            localStorage.setItem('itaim_ultimo_email', user.email);
            atualizarHeaderUsuario();
            return user;
        }
        return null;
    }

    // Cadastra um novo perfil de usuário
    function cadastrarNovoUsuario(dados) {
        const lista = carregarUsuarios();
        const emailLower = (dados.email || '').toLowerCase().trim();

        // Verifica se já existe
        const existente = lista.find(u => (u.email || '').toLowerCase() === emailLower);
        if (existente) {
            // Se já existe, apenas atualiza dados e ativa a sessão
            definirUsuarioLogado(existente.email);
            return { sucesso: true, usuario: existente, jaExistia: true };
        }

        const novoUser = {
            id: Date.now(),
            nome: dados.nome || 'Novo Usuário',
            username: (dados.username || dados.email.split('@')[0]).replace('@', '').toLowerCase().trim(),
            email: emailLower,
            telefone: dados.telefone || '(89) 99999-9999',
            cidade: dados.cidade || 'Paulistana',
            bairro: dados.bairro || 'Centro',
            avatar: 'assets/icon-user.png',
            bio: `Perfil de ${dados.nome || 'usuário'} no Itaim Vende.`,
            dataCadastro: 'Membro desde ' + new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(new Date()),
            avaliacao: '5.0',
            totalAvaliacoes: 0,
            vendasConcluidas: 0
        };

        lista.push(novoUser);
        localStorage.setItem('itaim_usuarios_db', JSON.stringify(lista));
        definirUsuarioLogado(novoUser.email);
        return { sucesso: true, usuario: novoUser };
    }

    // Atualiza os dados de um usuário (perfil próprio)
    function atualizarDadosUsuario(email, novosDados) {
        const lista = carregarUsuarios();
        let idx = lista.findIndex(u => (u.email || '').toLowerCase() === (email || '').toLowerCase());
        if (idx === -1 && novosDados && novosDados.id) {
            idx = lista.findIndex(u => u.id === novosDados.id);
        }
        if (idx === -1 && lista.length > 0) {
            idx = 0;
        }
        if (idx !== -1) {
            const antigoEmail = lista[idx].email;
            lista[idx] = { ...lista[idx], ...novosDados };
            if (novosDados.username && !novosDados.usuario) {
                lista[idx].usuario = novosDados.username;
            }
            const novoEmail = lista[idx].email || antigoEmail;
            
            // Persiste usuário ativo e email ativo
            localStorage.setItem('itaim_usuario_logado_email', novoEmail);
            localStorage.setItem('itaim_ultimo_email', novoEmail);
            localStorage.setItem('itaim_usuarios_db', JSON.stringify(lista));

            // Sincroniza itaim_perfil_usuario para compatibilidade total
            try {
                localStorage.setItem('itaim_perfil_usuario', JSON.stringify({
                    ...lista[idx],
                    usuario: lista[idx].username || lista[idx].usuario
                }));
            } catch(e) {}

            // Atualiza produtos cadastrados pelo usuário para manter dados sincronizados
            try {
                const prods = JSON.parse(localStorage.getItem('itaim_produtos_cadastrados') || '[]');
                if (Array.isArray(prods) && prods.length > 0) {
                    let alterou = false;
                    prods.forEach(p => {
                        const pEm = (p.vendedorEmail || '').toLowerCase();
                        const pNome = (p.vendedorNome || '').toLowerCase();
                        const uNome = (lista[idx].nome || '').toLowerCase();
                        const uAntigoNome = (antigoEmail || '').toLowerCase();
                        
                        if (pEm === (antigoEmail || '').toLowerCase() || 
                            pEm === (novoEmail || '').toLowerCase() || 
                            p.vendedorId === lista[idx].id ||
                            (uNome && pNome === uNome)) {
                            p.vendedorEmail = novoEmail;
                            if (novosDados.nome) p.vendedorNome = novosDados.nome;
                            if (novosDados.username) p.vendedorUsername = novosDados.username;
                            if (novosDados.telefone) p.vendedorTelefone = novosDados.telefone.replace(/\D/g, '');
                            if (novosDados.cidade) p.vendedorCidade = novosDados.cidade;
                            if (novosDados.bairro) p.bairro = novosDados.bairro;
                            if (novosDados.avatar) p.vendedorAvatar = novosDados.avatar;
                            alterou = true;
                        }
                    });
                    if (alterou) {
                        localStorage.setItem('itaim_produtos_cadastrados', JSON.stringify(prods));
                    }
                }
            } catch(e) {}

            atualizarHeaderUsuario();
            return lista[idx];
        }
        return null;
    }

    // Obter preferências de privacidade e notificações
    function obterConfiguracoes() {
        try {
            const raw = localStorage.getItem('itaim_configuracoes');
            return raw ? JSON.parse(raw) : { 'priv-telefone': true, 'priv-bairro': true, 'priv-online': false };
        } catch(e) {
            return { 'priv-telefone': true, 'priv-bairro': true, 'priv-online': false };
        }
    }

    // Suspender conta do usuário (desativa conta e pausa todos os anúncios)
    function suspenderConta(email) {
        const user = email ? obterUsuarioPorEmail(email) : obterUsuarioLogado();
        if (!user) return false;
        const uEm = (user.email || '').toLowerCase();
        
        // 1. Marca status como suspenso na base de usuários
        const todos = carregarUsuarios();
        const uIdx = todos.findIndex(u => (u.email || '').toLowerCase() === uEm || u.id === user.id);
        if (uIdx !== -1) {
            todos[uIdx].status = 'suspenso';
            todos[uIdx].suspenso = true;
            todos[uIdx].dataSuspensao = new Date().toISOString();
            localStorage.setItem('itaim_usuarios_db', JSON.stringify(todos));
        }

        // 2. Pausa todos os anúncios publicados pelo usuário
        try {
            const prods = JSON.parse(localStorage.getItem('itaim_produtos_cadastrados') || '[]');
            let alterou = false;
            prods.forEach(p => {
                if ((p.vendedorEmail || '').toLowerCase() === uEm || p.vendedorId === user.id) {
                    p.status = 'pausado';
                    alterou = true;
                }
            });
            if (alterou) {
                localStorage.setItem('itaim_produtos_cadastrados', JSON.stringify(prods));
            }
        } catch(e) {}

        // 3. Desconecta o usuário
        try {
            localStorage.removeItem('itaim_usuario_logado_email');
        } catch(e) {}

        return true;
    }

    // Excluir conta permanentemente (apaga usuário, anúncios e dados locais)
    function excluirContaPermanentemente(email) {
        const user = email ? obterUsuarioPorEmail(email) : obterUsuarioLogado();
        if (!user) return false;
        const uEm = (user.email || '').toLowerCase();

        // 1. Remove anúncios publicados pelo usuário
        try {
            const prods = JSON.parse(localStorage.getItem('itaim_produtos_cadastrados') || '[]');
            const restantes = prods.filter(p => (p.vendedorEmail || '').toLowerCase() !== uEm && p.vendedorId !== user.id);
            localStorage.setItem('itaim_produtos_cadastrados', JSON.stringify(restantes));
        } catch(e) {}

        // 2. Remove avaliações do vendedor
        try {
            localStorage.removeItem('itaim_avaliacoes_' + uEm);
            if (user.username) {
                localStorage.removeItem('itaim_avaliacoes_' + user.username.toLowerCase());
            }
        } catch(e) {}

        // 3. Remove o usuário da base de dados
        try {
            const todos = carregarUsuarios();
            const novos = todos.filter(u => (u.email || '').toLowerCase() !== uEm && u.id !== user.id);
            localStorage.setItem('itaim_usuarios_db', JSON.stringify(novos));
        } catch(e) {}

        // 4. Limpa sessões e rastros locais
        try {
            localStorage.removeItem('itaim_usuario_logado_email');
            localStorage.removeItem('itaim_perfil_usuario');
            localStorage.removeItem('itaim_ultimo_email');
            localStorage.removeItem('itaim_favoritos');
            localStorage.removeItem('itaim_enderecos');
        } catch(e) {}

        return true;
    }

    // ==========================================================================
    // 2. GERENCIAMENTO DE PRODUTOS E PERSISTÊNCIA
    // ==========================================================================
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
                const setExcluidos = new Set(excluidos.map(id => parseInt(id, 10)));
                todos = todos.filter(p => !setExcluidos.has(parseInt(p.id, 10)));
            }
        } catch (e) {}

        // Sincronizar status modificado (ativo/pausado/vendido)
        try {
            const statusMap = JSON.parse(localStorage.getItem('itaim_produtos_status_map') || '{}');
            todos = todos.map(p => {
                if (statusMap[p.id]) {
                    return { ...p, status: statusMap[p.id] };
                }
                return p;
            });
        } catch (e) {}

        return todos;
    }

    // Retorna todos os anúncios pertencentes ao usuário solicitado
    function obterAnunciosDoUsuario(emailOuUsername) {
        const todos = obterTodosProdutos();
        if (!emailOuUsername) return [];

        const raw = emailOuUsername.toLowerCase().trim();
        const semArroba = raw.replace('@', '');
        const isUserAdmin = raw === 'admin@gmail.com' || semArroba === 'admin';

        if (isUserAdmin) {
            // Admin gerencia todos os produtos do catálogo e seus próprios
            return todos;
        }

        // Outro perfil de usuário: retorna estritamente os anúncios que ele publicou
        return todos.filter(p => {
            const pEmail = (p.vendedorEmail || '').toLowerCase().trim();
            const pUser = (p.vendedorUsername || '').toLowerCase().trim();
            return pEmail === raw || pEmail === semArroba || (pUser && (pUser === semArroba || pUser === raw));
        });
    }

    // Adiciona um novo anúncio criado pelo usuário logado
    function adicionarNovoAnuncio(dados) {
        const user = obterUsuarioLogado();
        const novoId = Date.now();
        const novoAnuncio = {
            id: novoId,
            titulo: dados.titulo,
            preco: Number(dados.preco) || 0,
            categoria: dados.categoria || 'Geral',
            condicao: dados.condicao || 'Usado',
            cidade: dados.cidade || user.cidade || 'Paulistana',
            bairro: dados.bairro || user.bairro || 'Centro',
            imagem: (dados.imagens && dados.imagens[0]) || 'assets/produto-placeholder.svg',
            fotos: dados.imagens && dados.imagens.length > 0 ? dados.imagens : ['assets/produto-placeholder.svg'],
            descricao: dados.descricao || '',
            status: 'ativo',
            data: new Intl.DateTimeFormat('pt-BR').format(new Date()),
            visualizacoes: 1,
            conversas: 0,
            favorito: false,
            vendedorId: user.id,
            vendedorNome: user.nome,
            vendedorEmail: user.email,
            vendedorUsername: user.username || (user.email ? user.email.split('@')[0] : 'usuario'),
            vendedorTelefone: user.telefone ? user.telefone.replace(/\D/g, '') : '5589999999999',
            vendedorCidade: user.cidade,
            vendedorAvatar: user.avatar || 'assets/icon-user.png'
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
        id = parseInt(id, 10);
        
        let locais = JSON.parse(localStorage.getItem('itaim_produtos_cadastrados') || '[]');
        locais = locais.map(p => {
            if (parseInt(p.id, 10) === id) {
                return { ...p, status: novoStatus };
            }
            return p;
        });
        localStorage.setItem('itaim_produtos_cadastrados', JSON.stringify(locais));

        let statusMap = JSON.parse(localStorage.getItem('itaim_produtos_status_map') || '{}');
        statusMap[id] = novoStatus;
        localStorage.setItem('itaim_produtos_status_map', JSON.stringify(statusMap));

        return true;
    }

    // Exclui um anúncio
    function excluirAnuncio(id) {
        id = parseInt(id, 10);
        
        let locais = JSON.parse(localStorage.getItem('itaim_produtos_cadastrados') || '[]');
        locais = locais.filter(p => parseInt(p.id, 10) !== id);
        localStorage.setItem('itaim_produtos_cadastrados', JSON.stringify(locais));

        let excluidos = JSON.parse(localStorage.getItem('itaim_produtos_excluidos') || '[]');
        if (!excluidos.includes(id)) {
            excluidos.push(id);
            localStorage.setItem('itaim_produtos_excluidos', JSON.stringify(excluidos));
        }

        return true;
    }

    // Limpa produtos em venda e notificações a pedido do usuário, e remove comentários de enfeite
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

    // ==========================================================================
    // SISTEMA CENTRAL DE NOTIFICAÇÕES REAIS POR USUÁRIO (NADA DE MENTIRINHA)
    // ==========================================================================
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
            const u = obterUsuarioLogado();
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
        
        const todos = carregarUsuarios();
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
    function criarNotificacao({ destinatario, tipo = 'aviso', titulo, texto, link = 'notificacoes.html', icone, tempo = 'Agora' }) {
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
            link: link || 'notificacoes.html',
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
                const todos = obterTodosProdutos();
                produto = todos.find(p => String(p.id) === String(produtoOuId));
            }
            if (!produto) return false;

            const remetente = usuarioQueSalvou || obterUsuarioLogado();
            const emailVendedor = resolverEmailDestinatario(produto.vendedorEmail || produto.vendedorUsername || produto.vendedorNome);
            const emailQuemSalvou = (remetente?.email || obterEmailUsuarioAtivo()).toLowerCase().trim();

            // Evita notificar o próprio usuário se ele curtir o anúncio dele mesmo
            if (emailVendedor === emailQuemSalvou) {
                return false;
            }

            return criarNotificacao({
                destinatario: emailVendedor,
                tipo: 'favorito',
                titulo: 'Anúncio salvo por outro usuário',
                texto: `${remetente.nome || 'Um usuário'} salvou seu anúncio "${produto.titulo}" nos favoritos.`,
                link: `produto.html?id=${produto.id}`,
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
            const userRemetente = remetente || obterUsuarioLogado();
            const emailDestino = resolverEmailDestinatario(destinatario);
            const emailRemetente = (userRemetente?.email || obterEmailUsuarioAtivo()).toLowerCase().trim();

            if (emailDestino === emailRemetente) return false;

            const previewTexto = (textoMensagem || '').length > 60 
                ? (textoMensagem || '').substring(0, 57) + '...' 
                : textoMensagem;

            const tit = produtoTitulo ? `Nova mensagem sobre "${produtoTitulo}"` : `Nova mensagem de ${userRemetente.nome}`;

            return criarNotificacao({
                destinatario: emailDestino,
                tipo: 'mensagem',
                titulo: tit,
                texto: `${userRemetente.nome}: "${previewTexto}"`,
                link: conversaId ? `conversas.html?id=${conversaId}` : 'conversas.html',
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
                const todos = obterTodosProdutos();
                produto = todos.find(p => String(p.id) === String(produtoOuId));
            }
            if (!produto) return false;

            const userVendedor = vendedor || obterUsuarioLogado();

            // 1. Notifica o vendedor
            criarNotificacao({
                destinatario: userVendedor.email,
                tipo: 'compra',
                titulo: 'Venda finalizada com sucesso!',
                texto: `Parabéns! Seu anúncio "${produto.titulo}" foi finalizado e marcado como vendido.`,
                link: 'meus-anuncios.html',
                icone: 'sucesso',
                tempo: 'Agora'
            });

            // 2. Notifica outros usuários que tinham salvo esse produto nos favoritos
            const todosUsuarios = carregarUsuarios();
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
                            link: `produto.html?id=${produto.id}`,
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
                const todos = obterTodosProdutos();
                produto = todos.find(p => String(p.id) === String(produtoOuId));
            }
            if (!produto) return false;

            const formatMoeda = val => Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            const textoPreco = precoAntigo && precoAntigo !== precoNovo
                ? `O preço do anúncio "${produto.titulo}" mudou de ${formatMoeda(precoAntigo)} para ${formatMoeda(precoNovo)}.`
                : `O anúncio "${produto.titulo}" teve seu preço atualizado para ${formatMoeda(precoNovo)}.`;

            const todosUsuarios = carregarUsuarios();
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
                            link: `produto.html?id=${produto.id}`,
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

            const userLogado = obterUsuarioLogado();
            const autorNome = review.autor || userLogado?.nome || 'Um usuário';
            const emailRemetente = (userLogado?.email || '').toLowerCase().trim();

            // Evita auto-notificação se for o mesmo usuário (exceto quando testando localmente com admin)
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
                link: 'perfil.html#perfil-secao-avaliacoes',
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

    // ==========================================================================
    // 3. SINCRONIZAÇÃO VISUAL GLOBAL DO HEADER & NAVBAR
    // ==========================================================================
    function atualizarHeaderUsuario() {
        const user = obterUsuarioLogado();
        if (!user) return;

        // Avatar
        const avatarImgs = document.querySelectorAll('#img-avatar-user, .avatar-img, .perfil-avatar-view, #drawer-user-avatar');
        avatarImgs.forEach(img => {
            const avatarPadrao = window.ItaimRotas ? window.ItaimRotas.obterAsset('assets/icon-user.png') : 'assets/icon-user.png';
            const avatarUrl = user.avatar ? (window.ItaimRotas ? window.ItaimRotas.obterAsset(user.avatar) : user.avatar) : avatarPadrao;
            img.src = avatarUrl;
            img.onerror = () => { img.src = avatarPadrao; };
        });

        // Nome no dropdown e no drawer
        const nomeEl = document.getElementById('dropdown-user-name');
        if (nomeEl) nomeEl.textContent = user.nome;
        const drawerNomeEl = document.getElementById('drawer-user-name');
        if (drawerNomeEl) drawerNomeEl.textContent = user.nome;

        // E-mail no dropdown e no drawer
        const emailEl = document.getElementById('dropdown-user-email');
        if (emailEl) emailEl.textContent = user.email;
        const drawerEmailEl = document.getElementById('drawer-user-email');
        if (drawerEmailEl) drawerEmailEl.textContent = user.email;

        // Atualizar badges dinâmicos de notificações
        atualizarBadgesNotificacoes();
    }

    /**
     * API SIMPLES DE AJUSTE AUTOMÁTICO DE FOTO (1:1 QUADRADO PERFEITO)
     * Ajusta, centraliza e corta no formato 1:1 sem distorcer e sem deixar espaços cinzas,
     * redimensionando para a resolução ideal (ex: 800x800 para produtos, 400x400 para perfil).
     */
    function ajustarFotoSimples(arquivoOuSrc, tamanho = 800, callback) {
        if (!arquivoOuSrc) return;

        function renderizarCanvas(dataUrl) {
            const img = new Image();
            img.onload = () => {
                const w = img.naturalWidth || img.width;
                const h = img.naturalHeight || img.height;
                const minSide = Math.min(w, h);
                const startX = (w - minSide) / 2;
                const startY = (h - minSide) / 2;

                const canvas = document.createElement('canvas');
                canvas.width = tamanho;
                canvas.height = tamanho;
                const ctx = canvas.getContext('2d');
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';

                // Recorte centralizado 1:1 exato cobrindo 100% da área útil sem sobrar espaços cinzas
                ctx.drawImage(img, startX, startY, minSide, minSide, 0, 0, tamanho, tamanho);

                const resultado = canvas.toDataURL('image/jpeg', 0.82);
                if (typeof callback === 'function') {
                    callback(resultado);
                }
            };
            img.onerror = () => {
                if (typeof callback === 'function') callback(dataUrl);
            };
            img.src = dataUrl;
        }

        if (typeof arquivoOuSrc === 'string') {
            renderizarCanvas(arquivoOuSrc);
        } else if (arquivoOuSrc instanceof Blob || arquivoOuSrc instanceof File) {
            const reader = new FileReader();
            reader.onload = (e) => renderizarCanvas(e.target.result);
            reader.onerror = () => {};
            reader.readAsDataURL(arquivoOuSrc);
        }
    }

    window.ItaimFoto = {
        ajustar: ajustarFotoSimples
    };

    // ========================================================================
    // API GLOBAL DE AVALIAÇÕES (0 A 5 ESTRELAS) TOTALMENTE FUNCIONAL
    // ========================================================================
    const ItaimAvaliacoes = {
        obterChave: function(vendedor) {
            if (!vendedor) return 'seller_admin';
            
            // Se for string
            if (typeof vendedor === 'string') {
                const s = vendedor.toLowerCase().trim();
                const todos = carregarUsuarios();
                const u = todos.find(user => 
                    (user.email || '').toLowerCase() === s || 
                    (user.username || '').toLowerCase() === s ||
                    (user.nome || '').toLowerCase() === s
                );
                if (u) return 'seller_' + (u.username || u.id || 'admin').toLowerCase();
                return 'seller_' + s.replace(/[^a-z0-9]/g, '_');
            }

            // Se for objeto
            if (typeof vendedor === 'object') {
                const todos = carregarUsuarios();
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
                const todos = carregarUsuarios();
                const chaveVend = this.obterChave(vendedor);
                const uIdx = todos.findIndex(u => this.obterChave(u) === chaveVend);
                if (uIdx !== -1) {
                    todos[uIdx].avaliacao = stats.media;
                    todos[uIdx].totalAvaliacoes = stats.total;
                    localStorage.setItem('itaim_usuarios_db', JSON.stringify(todos));
                }
            } catch(e) {}

            // Dispara notificação de avaliação para o vendedor
            try {
                notificarNovaAvaliacao(vendedor, novaAvaliacao);
            } catch(e) {}

            return lista;
        },

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
                const todos = carregarUsuarios();
                const chaveVend = this.obterChave(vendedor);
                const uIdx = todos.findIndex(u => this.obterChave(u) === chaveVend);
                if (uIdx !== -1) {
                    todos[uIdx].avaliacao = stats.media;
                    todos[uIdx].totalAvaliacoes = stats.total;
                    localStorage.setItem('itaim_usuarios_db', JSON.stringify(todos));
                }
            } catch(e) {}

            return lista;
        },

        calcularMedia: function(lista) {
            if (!lista || !Array.isArray(lista) || lista.length === 0) {
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

    window.ItaimAvaliacoes = ItaimAvaliacoes;

    // Exporta API global ItaimSessao
    window.ItaimSessao = {
        obterUsuarioLogado,
        definirUsuarioLogado,
        obterTodosUsuarios,
        obterUsuarioPorEmail,
        obterUsuarioPorUsername,
        cadastrarNovoUsuario,
        atualizarDadosUsuario,
        obterTodosProdutos,
        obterAnunciosDoUsuario,
        adicionarNovoAnuncio,
        atualizarStatusAnuncio,
        excluirAnuncio,
        atualizarHeaderUsuario,
        ajustarFoto: (window.ItaimFoto && window.ItaimFoto.ajustar) || ajustarFotoSimples,
        avaliacoes: ItaimAvaliacoes,
        obterConfiguracoes,
        suspenderConta,
        excluirContaPermanentemente,
        obterNotificacoes,
        salvarNotificacoes,
        criarNotificacao,
        atualizarBadgesNotificacoes,
        obterConfiguracoesNotificacoes,
        notificarItemSalvo,
        notificarNovaMensagem,
        notificarVendaFinalizada,
        notificarMudancaPreco,
        notificarNovaAvaliacao
    };

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
        notificarNovaAvaliacao
    };

    /**
     * INICIALIZAÇÃO GLOBAL UNIFICADA DO CABEÇALHO E MENU LATERAL (DRAWER)
     * Gerencia hambúrguer, drawer deslizante, acordeão de categorias, dropdown do perfil e busca.
     */
    function inicializarHeaderGlobal() {
        const backdrop = document.getElementById('drawer-backdrop') || document.querySelector('.drawer-backdrop');
        const btnAbrirDrawer = document.getElementById('btn-abrir-drawer');
        const btnFecharDrawer = document.getElementById('btn-fechar-drawer');
        const btnToggleCategorias = document.getElementById('btn-toggle-categorias');
        const drawerCategoriasConteudo = document.getElementById('drawer-categorias-conteudo');
        const btnAvatarDropdown = document.getElementById('btn-avatar-dropdown');
        const dropdownPerfil = document.getElementById('dropdown-perfil');
        const formBusca = document.getElementById('form-busca');
        const campoBusca = document.getElementById('campo-busca');
        const btnSubmitBusca = document.getElementById('btn-submit-busca');

        // Alternar Drawer Lateral
        function alternarDrawer(abrir) {
            const currentBackdrop = document.getElementById('drawer-backdrop') || document.querySelector('.drawer-backdrop');
            if (!currentBackdrop) return;
            const estado = typeof abrir === 'boolean' ? abrir : !currentBackdrop.classList.contains('aberto');
            currentBackdrop.classList.toggle('aberto', estado);
            currentBackdrop.classList.toggle('ativo', estado);
            document.body.style.overflow = estado ? 'hidden' : '';
        }

        window.alternarDrawer = alternarDrawer;

        if (btnAbrirDrawer) {
            btnAbrirDrawer.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                alternarDrawer(true);
            };
        }

        if (btnFecharDrawer) {
            btnFecharDrawer.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                alternarDrawer(false);
            };
        }

        if (backdrop) {
            backdrop.onclick = (e) => {
                if (e.target === backdrop) alternarDrawer(false);
            };
        }

        // Acordeão de Categorias no Drawer
        if (btnToggleCategorias && drawerCategoriasConteudo) {
            btnToggleCategorias.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                const isOpen = drawerCategoriasConteudo.classList.toggle('aberto');
                btnToggleCategorias.classList.toggle('aberto', isOpen);
                btnToggleCategorias.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            };
        }

        // Clique no botão de perfil vai DIRETO para o perfil sem abrir mini aba
        const btnAvatarHeader = document.getElementById('btn-avatar-dropdown') || document.querySelector('.btn-avatar-header');
        if (btnAvatarHeader) {
            btnAvatarHeader.setAttribute('title', 'Ir para Meu Perfil');
            btnAvatarHeader.setAttribute('aria-label', 'Ir para Meu Perfil');
            btnAvatarHeader.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                window.location.href = window.ItaimRotas ? window.ItaimRotas.obterUrl('perfil') : 'perfil.html';
            };
        }

        // Garante que o dropdown de perfil nunca abra
        if (dropdownPerfil) {
            dropdownPerfil.classList.remove('aberto');
            dropdownPerfil.style.display = 'none';
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                alternarDrawer(false);
                dropdownPerfil?.classList.remove('aberto');
            }
        });

        // Submissão da Pesquisa Global
        function executarBusca(e) {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            const inputBusca = document.getElementById('campo-busca') || campoBusca;
            if (!inputBusca) return;
            const termo = (inputBusca.value || '').trim();
            // Se estiver na página de favoritos, deixa o script de favoritos cuidar do filtro em tempo real
            if (window.location.pathname.includes('favoritos.html')) {
                return;
            }
            if (termo) {
                window.location.href = window.ItaimRotas ? window.ItaimRotas.obterUrl('categoria', `q=${encodeURIComponent(termo)}`) : `categoria.html?q=${encodeURIComponent(termo)}`;
            } else {
                window.location.href = window.ItaimRotas ? window.ItaimRotas.obterUrl('categoria') : 'categoria.html';
            }
        }

        if (formBusca) {
            formBusca.onsubmit = executarBusca;
        }
        if (btnSubmitBusca) {
            btnSubmitBusca.onclick = executarBusca;
        }

        // Contador de favoritos no dropdown
        try {
            const favs = JSON.parse(localStorage.getItem('itaim_favoritos') || '[]');
            const badgeFav = document.getElementById('favoritos-contador-badge');
            if (badgeFav) badgeFav.textContent = favs.length;
        } catch(e) {}

        // Destaque de link ativo no Drawer e no botão mobile
        try {
            const path = window.location.pathname.toLowerCase();
            document.querySelectorAll('.drawer-link').forEach(link => link.classList.remove('ativo'));

            if (path.includes('meus-anuncios.html')) {
                document.getElementById('drawer-link-anuncios')?.classList.add('ativo');
                document.getElementById('btn-meus-anuncios-mobile')?.classList.add('ativo');
            } else if (path.includes('perfil.html')) {
                document.getElementById('drawer-link-perfil')?.classList.add('ativo');
            } else if (path.includes('favoritos.html')) {
                document.getElementById('drawer-link-favoritos')?.classList.add('ativo');
            } else if (path.includes('vender.html')) {
                document.getElementById('drawer-link-vender')?.classList.add('ativo');
            } else if (path.includes('notificacoes.html')) {
                document.getElementById('drawer-link-notificacoes')?.classList.add('ativo');
            } else if (path.includes('conversas.html') || path.includes('chat.html')) {
                document.getElementById('drawer-link-chat')?.classList.add('ativo');
                document.getElementById('btn-chat')?.classList.add('ativo-icone');
            } else if (path.includes('configuracoes.html')) {
                document.getElementById('drawer-link-configuracoes')?.classList.add('ativo');
            } else if (path.includes('home.html') || path.endsWith('/') || path.endsWith('index.html')) {
                document.getElementById('drawer-link-home')?.classList.add('ativo');
            }
        } catch(e) {}
    }

    function bootstrap() {
        limparDadosZerados();
        carregarUsuarios();
        atualizarHeaderUsuario();
        inicializarHeaderGlobal();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootstrap);
    } else {
        bootstrap();
    }

    // Logout limpa a sessão ativa para permitir trocar de conta facilmente
    document.addEventListener('click', (e) => {
        const btnSair = e.target.closest('.item-sair, #btn-sair-banner');
        if (btnSair) {
            try {
                localStorage.removeItem('itaim_usuario_logado_email');
            } catch(err) {}
        }
    });

})();
