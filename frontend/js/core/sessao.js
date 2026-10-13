/**
 * ITAIM VENDE - GERENCIADOR CENTRAL DE SESSÃO & CONTAS
 * Suporta o perfil Admin padrão e criação/login de novos perfis de usuários reais.
 */

(function() {
    'use strict';

    // Formata telefone padrão brasileiro para visualização
    function formatarTelefoneBR(tel) {
        if (!tel) return '(89) 99998-5858';
        const num = String(tel).replace(/\D/g, '');
        if (num.length === 11) {
            return `(${num.substring(0, 2)}) ${num.substring(2, 7)}-${num.substring(7)}`;
        }
        if (num.length === 10) {
            return `(${num.substring(0, 2)}) ${num.substring(2, 6)}-${num.substring(6)}`;
        }
        return tel;
    }

    // 1. USUÁRIO ADMIN PADRÃO DO SISTEMA (DADOS EXATOS DO SEED DO BANCO DE DADOS)
    const USUARIO_ADMIN = {
        id: "cmv5iacmv0000ttiwu9wtemar",
        nome: "Raili",
        name: "Raili",
        username: "rsstore",
        usuario: "rsstore",
        email: "admin@gmail.com",
        telefone: "(89) 99998-5858",
        phone: "89999858585",
        cidade: "Paulistana",
        city: "Paulistana",
        bairro: "Centro",
        neighborhood: "Centro",
        estado: "PI",
        state: "PI",
        avatar: "assets/icon-user.png",
        bio: "Perfil oficial e verificado da administração do Itaim Vende.",
        role: "ADMIN",
        isVerified: true,
        dataCadastro: "Membro desde 2024",
        avaliacao: "5.0",
        ratingAverage: 5.0,
        totalAvaliacoes: 18,
        ratingCount: 18,
        vendasConcluidas: 12,
        salesCount: 12
    };

    // Inicializa a base de usuários com Admin e mantém novos perfis criados
    function carregarUsuarios() {
        let lista = [USUARIO_ADMIN];
        try {
            let perfilCustom = null;
            try {
                perfilCustom = JSON.parse(localStorage.getItem('itaim_usuario_logado') || localStorage.getItem('itaim_perfil_usuario') || 'null');
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

                // Garante que o Admin existe com todos os dados oficiais
                const adminIdx = filtrados.findIndex(u => (u.email || '').toLowerCase() === 'admin@gmail.com' || u.id === 'cmv5iacmv0000ttiwu9wtemar' || u.id === 1);
                if (adminIdx !== -1) {
                    filtrados[adminIdx] = { ...USUARIO_ADMIN, ...filtrados[adminIdx] };
                    if (perfilCustom && (perfilCustom.nome || perfilCustom.name || perfilCustom.usuario || perfilCustom.username)) {
                        filtrados[adminIdx] = {
                            ...filtrados[adminIdx],
                            nome: perfilCustom.nome || perfilCustom.name || filtrados[adminIdx].nome,
                            name: perfilCustom.name || perfilCustom.nome || filtrados[adminIdx].name,
                            username: perfilCustom.username || perfilCustom.usuario || filtrados[adminIdx].username,
                            telefone: perfilCustom.telefone || (perfilCustom.phone ? formatarTelefoneBR(perfilCustom.phone) : filtrados[adminIdx].telefone),
                            phone: perfilCustom.phone || filtrados[adminIdx].phone,
                            cidade: perfilCustom.cidade || perfilCustom.city || filtrados[adminIdx].cidade,
                            bairro: perfilCustom.bairro || perfilCustom.neighborhood || filtrados[adminIdx].bairro,
                            bio: perfilCustom.bio || filtrados[adminIdx].bio,
                            email: perfilCustom.email || filtrados[adminIdx].email,
                            avatar: perfilCustom.avatar || filtrados[adminIdx].avatar,
                            isVerified: perfilCustom.isVerified !== undefined ? perfilCustom.isVerified : filtrados[adminIdx].isVerified,
                            salesCount: perfilCustom.salesCount !== undefined ? perfilCustom.salesCount : filtrados[adminIdx].salesCount,
                            vendasConcluidas: perfilCustom.salesCount !== undefined ? perfilCustom.salesCount : filtrados[adminIdx].vendasConcluidas,
                            ratingAverage: perfilCustom.ratingAverage !== undefined ? perfilCustom.ratingAverage : filtrados[adminIdx].ratingAverage,
                            ratingCount: perfilCustom.ratingCount !== undefined ? perfilCustom.ratingCount : filtrados[adminIdx].ratingCount,
                            totalAvaliacoes: perfilCustom.ratingCount !== undefined ? perfilCustom.ratingCount : filtrados[adminIdx].totalAvaliacoes
                        };
                    }
                    lista = filtrados;
                } else {
                    let adminObj = { ...USUARIO_ADMIN };
                    if (perfilCustom && (perfilCustom.nome || perfilCustom.name || perfilCustom.usuario || perfilCustom.username)) {
                        adminObj = {
                            ...adminObj,
                            nome: perfilCustom.nome || perfilCustom.name || adminObj.nome,
                            name: perfilCustom.name || perfilCustom.nome || adminObj.name,
                            username: perfilCustom.username || perfilCustom.usuario || adminObj.username,
                            telefone: perfilCustom.telefone || (perfilCustom.phone ? formatarTelefoneBR(perfilCustom.phone) : adminObj.telefone),
                            phone: perfilCustom.phone || adminObj.phone,
                            cidade: perfilCustom.cidade || perfilCustom.city || adminObj.cidade,
                            bairro: perfilCustom.bairro || perfilCustom.neighborhood || adminObj.bairro,
                            bio: perfilCustom.bio || adminObj.bio,
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

        // Incorpora dados reais e atualizados do backend salvos na sessão
        try {
            const backendUser = JSON.parse(localStorage.getItem('itaim_usuario_logado') || 'null');
            if (backendUser && (backendUser.email || '').toLowerCase() === (user.email || '').toLowerCase()) {
                user = {
                    ...user,
                    id: backendUser.id || user.id,
                    nome: backendUser.name || backendUser.nome || user.nome,
                    name: backendUser.name || backendUser.nome || user.name,
                    username: backendUser.username || user.username,
                    usuario: backendUser.username || user.usuario,
                    telefone: backendUser.phone ? formatarTelefoneBR(backendUser.phone) : (user.telefone || '(89) 99998-5858'),
                    phone: backendUser.phone || user.phone || '89999858585',
                    cidade: backendUser.city || user.cidade || 'Paulistana',
                    city: backendUser.city || user.city || 'Paulistana',
                    bairro: backendUser.neighborhood || user.bairro || 'Centro',
                    neighborhood: backendUser.neighborhood || user.neighborhood || 'Centro',
                    bio: backendUser.bio || user.bio || 'Perfil oficial e verificado da administração do Itaim Vende.',
                    avatar: backendUser.avatar || user.avatar || 'assets/icon-user.png',
                    role: backendUser.role || user.role || 'ADMIN',
                    isVerified: backendUser.isVerified !== undefined ? backendUser.isVerified : true,
                    ratingAverage: backendUser.ratingAverage !== undefined ? Number(backendUser.ratingAverage) : 5.0,
                    avaliacao: (Number(backendUser.ratingAverage || user.ratingAverage || 5)).toFixed(1),
                    ratingCount: backendUser.ratingCount !== undefined ? backendUser.ratingCount : (user.totalAvaliacoes || 18),
                    totalAvaliacoes: backendUser.ratingCount !== undefined ? backendUser.ratingCount : (user.totalAvaliacoes || 18),
                    salesCount: backendUser.salesCount !== undefined ? backendUser.salesCount : (user.vendasConcluidas || 12),
                    vendasConcluidas: backendUser.salesCount !== undefined ? backendUser.salesCount : (user.vendasConcluidas || 12)
                };
            }
        } catch(e) {}

        return user;
    }

    // Define o usuário logado e atualiza a interface
    function definirUsuarioLogado(emailOuUser, dadosCompletos = null) {
        if (!emailOuUser && !dadosCompletos) return USUARIO_ADMIN;
        const chaveBusca = dadosCompletos?.email || emailOuUser || '';
        let user = obterUsuarioPorEmail(chaveBusca) || obterUsuarioPorUsername(chaveBusca);
        
        // Se for admin ou admin@gmail.com
        if (!user && (chaveBusca.toLowerCase() === 'admin' || chaveBusca.toLowerCase() === 'admin@gmail.com')) {
            user = { ...USUARIO_ADMIN };
        }

        // Se forneceu dados completos do backend, mescla imediatamente
        if (dadosCompletos && typeof dadosCompletos === 'object') {
            user = {
                ...(user || USUARIO_ADMIN),
                id: dadosCompletos.id || user?.id || USUARIO_ADMIN.id,
                nome: dadosCompletos.name || dadosCompletos.nome || user?.nome || USUARIO_ADMIN.nome,
                name: dadosCompletos.name || dadosCompletos.nome || user?.name || USUARIO_ADMIN.name,
                username: dadosCompletos.username || user?.username || USUARIO_ADMIN.username,
                usuario: dadosCompletos.username || user?.usuario || USUARIO_ADMIN.usuario,
                email: dadosCompletos.email || user?.email || USUARIO_ADMIN.email,
                telefone: dadosCompletos.phone ? formatarTelefoneBR(dadosCompletos.phone) : (dadosCompletos.telefone || user?.telefone || USUARIO_ADMIN.telefone),
                phone: dadosCompletos.phone || user?.phone || USUARIO_ADMIN.phone,
                cidade: dadosCompletos.city || dadosCompletos.cidade || user?.cidade || USUARIO_ADMIN.cidade,
                city: dadosCompletos.city || dadosCompletos.cidade || user?.city || USUARIO_ADMIN.city,
                bairro: dadosCompletos.neighborhood || dadosCompletos.bairro || user?.bairro || USUARIO_ADMIN.bairro,
                neighborhood: dadosCompletos.neighborhood || dadosCompletos.bairro || user?.neighborhood || USUARIO_ADMIN.neighborhood,
                avatar: dadosCompletos.avatar || user?.avatar || USUARIO_ADMIN.avatar,
                bio: dadosCompletos.bio || user?.bio || USUARIO_ADMIN.bio,
                role: dadosCompletos.role || user?.role || USUARIO_ADMIN.role,
                isVerified: dadosCompletos.isVerified !== undefined ? dadosCompletos.isVerified : true,
                ratingAverage: dadosCompletos.ratingAverage !== undefined ? Number(dadosCompletos.ratingAverage) : 5.0,
                avaliacao: (Number(dadosCompletos.ratingAverage || 5)).toFixed(1),
                ratingCount: dadosCompletos.ratingCount !== undefined ? dadosCompletos.ratingCount : 18,
                totalAvaliacoes: dadosCompletos.ratingCount !== undefined ? dadosCompletos.ratingCount : 18,
                salesCount: dadosCompletos.salesCount !== undefined ? dadosCompletos.salesCount : 12,
                vendasConcluidas: dadosCompletos.salesCount !== undefined ? dadosCompletos.salesCount : 12
            };
        }

        // Se for um novo e-mail válido que ainda não estava cadastrado, cadastra-o automaticamente
        if (!user && chaveBusca.includes('@')) {
            const res = cadastrarNovoUsuario({
                nome: chaveBusca.split('@')[0],
                email: chaveBusca
            });
            user = res.usuario;
        }

        if (user) {
            // Se a conta estava suspensa, reativa automaticamente no login
            if (user.status === 'suspenso' || user.suspenso) {
                user.status = 'ativo';
                delete user.suspenso;
            }

            const todos = carregarUsuarios();
            const uIdx = todos.findIndex(u => (u.email || '').toLowerCase() === (user.email || '').toLowerCase());
            if (uIdx !== -1) {
                todos[uIdx] = { ...todos[uIdx], ...user };
            } else {
                todos.push(user);
            }
            localStorage.setItem('itaim_usuarios_db', JSON.stringify(todos));
            localStorage.setItem('itaim_usuario_logado_email', user.email);
            localStorage.setItem('itaim_ultimo_email', user.email);

            // Persiste também o perfil detalhado em itaim_perfil_usuario
            try {
                localStorage.setItem('itaim_perfil_usuario', JSON.stringify(user));
            } catch(e) {}

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

            // Sincroniza itaim_usuario_logado para não ser sobrescrito pelo cache
            try {
                const bUser = JSON.parse(localStorage.getItem('itaim_usuario_logado') || 'null');
                if (bUser) {
                    const bEmail = (bUser.email || '').toLowerCase();
                    if (bEmail === (antigoEmail || '').toLowerCase() || 
                        bEmail === (novoEmail || '').toLowerCase() || 
                        bUser.id === lista[idx].id) {
                        localStorage.setItem('itaim_usuario_logado', JSON.stringify({
                            ...bUser,
                            ...novosDados,
                            email: novoEmail
                        }));
                    }
                }
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

        return todos;
    }

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
            if (raw === 'admin@gmail.com' || semArroba === 'admin' || semArroba === 'rsstore') {
                return pEmail === 'admin@gmail.com' || pUser === 'admin' || pUser === 'rsstore' || pNome.includes('raili') || pId === 'cmv5iacmv0000ttiwu9wtemar';
            }
            return pEmail === raw || pEmail === semArroba || (pUser && (pUser === semArroba || pUser === raw)) || pId === raw;
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
                link: (window.ItaimRotas ? window.ItaimRotas.obterUrl('meus-anuncios') : 'meus-anuncios.html'),
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

    // ==========================================================================
    // 3. SINCRONIZAÇÃO VISUAL GLOBAL DO HEADER & NAVBAR
    // ==========================================================================
    function atualizarHeaderUsuario() {
        const user = obterUsuarioLogado();
        if (!user) return;

        // Avatar
        const avatarPadrao = (window.ItaimRotas && typeof window.ItaimRotas.obterAsset === 'function')
            ? window.ItaimRotas.obterAsset('assets/icon-user.png')
            : (window.location.pathname.toLowerCase().includes('/pages/') ? '../../assets/icon-user.png' : './assets/icon-user.png');
        
        const rawAvatar = user.avatar || 'assets/icon-user.png';
        const avatarUrl = (window.ItaimApi && typeof window.ItaimApi.resolverUrlImagem === 'function')
            ? window.ItaimApi.resolverUrlImagem(rawAvatar)
            : ((window.ItaimRotas && typeof window.ItaimRotas.obterAsset === 'function')
                ? window.ItaimRotas.obterAsset(rawAvatar)
                : (rawAvatar.startsWith('data:') || rawAvatar.startsWith('http') ? rawAvatar : avatarPadrao));

        const avatarImgs = document.querySelectorAll('#img-avatar-user, .avatar-img, #perfil-avatar-view, .perfil-avatar-view, .perfil-avatar-img, #drawer-user-avatar, #vendedor-avatar-img');
        avatarImgs.forEach(img => {
            img.src = avatarUrl;
            img.onerror = function() {
                this.onerror = null;
                this.src = avatarPadrao;
            };
        });

        // Nome no dropdown e no drawer
        const nomeFinal = user.nome || user.name || 'Raili';
        const nomeEl = document.getElementById('dropdown-user-name');
        if (nomeEl) nomeEl.textContent = nomeFinal;
        const drawerNomeEl = document.getElementById('drawer-user-name');
        if (drawerNomeEl) drawerNomeEl.textContent = nomeFinal;

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

        calcularMedia: function(lista, perfil = null) {
            if (!lista || !Array.isArray(lista) || lista.length === 0) {
                if (perfil && (perfil.totalAvaliacoes || perfil.ratingCount || (perfil.email && perfil.email.toLowerCase() === 'admin@gmail.com'))) {
                    const totalRatings = perfil.ratingCount || perfil.totalAvaliacoes || 18;
                    const mediaVal = Number(perfil.ratingAverage || perfil.avaliacao || 5.0).toFixed(1);
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

    window.ItaimAvaliacoes = ItaimAvaliacoes;

    // ========================================================================
    // GUARDIÃO DE PÁGINAS PROTEGIDAS (TELA EM BRANCO COM BOTÃO DE LOGIN)
    // ========================================================================
    function protegerPagina(motivo = 'Para sua segurança e privacidade, faça login para acessar os dados desta página.') {
        const token = localStorage.getItem('itaim_token');
        if (!token) {
            document.documentElement.classList.add('bloqueado-sem-sessao');
            document.title = 'Acesso Restrito - Itaim Vende';

            // Injeta estilo global se necessário
            if (!document.getElementById('estilo-bloqueio-sessao')) {
                const st = document.createElement('style');
                st.id = 'estilo-bloqueio-sessao';
                st.textContent = `
                    .bloqueado-sem-sessao body > *:not(#tela-bloqueio-sessao) {
                        display: none !important;
                    }
                    .bloqueado-sem-sessao body {
                        background: #FFFFFF !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        overflow: hidden !important;
                    }
                    .bloqueado-sem-sessao #tela-bloqueio-sessao {
                        display: flex !important;
                    }
                `;
                document.head.appendChild(st);
            }

            let telaBloqueio = document.getElementById('tela-bloqueio-sessao');
            if (!telaBloqueio) {
                const logoSrc = (window.ItaimRotas && typeof window.ItaimRotas.obterAsset === 'function')
                    ? window.ItaimRotas.obterAsset('assets/header1-logo.png')
                    : (window.location.pathname.toLowerCase().includes('/pages/') ? '../../assets/header1-logo.png' : './assets/header1-logo.png');

                const loginUrl = (window.ItaimRotas && typeof window.ItaimRotas.obterUrl === 'function')
                    ? window.ItaimRotas.obterUrl('login')
                    : (window.location.pathname.toLowerCase().includes('/pages/') ? '../../index.html' : './index.html');

                telaBloqueio = document.createElement('div');
                telaBloqueio.id = 'tela-bloqueio-sessao';
                telaBloqueio.style.cssText = 'display: flex; position: fixed; inset: 0; width: 100vw; height: 100vh; background: #FFFFFF; z-index: 9999999; flex-direction: column; align-items: center; justify-content: center; padding: 24px; box-sizing: border-box; text-align: center;';
                telaBloqueio.innerHTML = `
                    <div style="max-width: 440px; width: 100%; display: flex; flex-direction: column; align-items: center;">
                        <a href="${loginUrl}" style="display: inline-block; margin-bottom: 26px;">
                            <img src="${logoSrc}" alt="Itaim Vende" style="height: 52px; object-fit: contain;">
                        </a>
                        <div style="width: 80px; height: 80px; border-radius: 50%; background: #F8FAFC; border: 1.5px solid #E2E8F0; display: flex; align-items: center; justify-content: center; margin-bottom: 22px; box-shadow: 0 4px 16px rgba(0,0,0,0.04);">
                            <svg viewBox="0 0 24 24" width="38" height="38" fill="none" stroke="#44BD32" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                        </div>
                        <h1 style="font-size: 24px; font-weight: 800; color: #0F172A; margin: 0 0 10px; letter-spacing: -0.5px;">Acesso Restrito</h1>
                        <p style="font-size: 15px; color: #64748B; margin: 0 0 28px; line-height: 1.6; max-width: 360px;">${motivo}</p>
                        <a href="${loginUrl}" class="btn-voltar-login" style="display: inline-flex; align-items: center; justify-content: center; gap: 10px; background: #44BD32; color: #FFFFFF; font-weight: 700; font-size: 15.5px; padding: 14px 34px; border-radius: 30px; text-decoration: none; box-shadow: 0 4px 18px rgba(68,189,50,0.35); transition: transform 0.2s, background 0.2s; width: 100%; max-width: 280px; box-sizing: border-box;">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                                <polyline points="10 17 15 12 10 7"></polyline>
                                <line x1="15" y1="12" x2="3" y2="12"></line>
                            </svg>
                            <span>Voltar para o Login</span>
                        </a>
                    </div>
                `;
                document.body.appendChild(telaBloqueio);
            } else {
                telaBloqueio.style.display = 'flex';
            }
            return false;
        }
        return true;
    }

    // Exporta API global ItaimSessao
    window.ItaimSessao = {
        protegerPagina,
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

        // Sincroniza dados e foto real do usuário com o banco de dados se autenticado
        if (window.ItaimApi && window.ItaimApi.auth && typeof window.ItaimApi.auth.obterToken === 'function' && window.ItaimApi.auth.obterToken()) {
            window.ItaimApi.auth.perfil().then(res => {
                if (res && res.user) {
                    localStorage.setItem('itaim_usuario_logado', JSON.stringify(res.user));
                    localStorage.setItem('itaim_usuario_logado_email', res.user.email);
                    definirUsuarioLogado(res.user.email, res.user);
                    atualizarHeaderUsuario();
                    window.dispatchEvent(new CustomEvent('itaim:usuario-atualizado', { detail: res.user }));
                }
            }).catch(() => {});
        }
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
                localStorage.removeItem('itaim_usuario_logado');
                localStorage.removeItem('itaim_token');
                localStorage.removeItem('itaim_ultima_atividade');
            } catch(err) {}
        }
    });

})();
