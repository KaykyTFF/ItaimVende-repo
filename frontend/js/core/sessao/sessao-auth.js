/**
 * ITAIM VENDE - MÓDULO DE AUTENTICAÇÃO E SESSÃO DO USUÁRIO
 * Arquivo: frontend/js/core/sessao/sessao-auth.js
 * 
 * Responsabilidades:
 * - Gerenciamento de credenciais e contas de usuários
 * - Isolamento total entre contas (impede sobreposição de perfis)
 * - Identidade oficial da conta Administrador (USUARIO_ADMIN)
 * - Persistência segura em itaim_usuarios_db e itaim_usuario_logado
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
    const USUARIO_ADMIN = Object.freeze({
        id: "cmv5iacmv0000ttiwu9wtemar",
        nome: "Admin",
        name: "Admin",
        username: "adminfreefire",
        usuario: "adminfreefire",
        email: "admin@gmail.com",
        telefone: "(89) 99998-5858",
        phone: "89999858585",
        cidade: "Paulistana",
        city: "Paulistana",
        bairro: "Centro",
        neighborhood: "Centro",
        estado: "PI",
        state: "PI",
        avatar: "/uploads/perfil/itaim-1791903382039-jwd9lvb.jpg",
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
    });

    // Inicializa a base de usuários garantindo integridade estrita e isolamento total entre contas
    function carregarUsuarios() {
        let lista = [];
        try {
            const salvos = JSON.parse(localStorage.getItem('itaim_usuarios_db') || '[]');
            if (Array.isArray(salvos)) {
                // Filtra perfis mock legados de teste
                lista = salvos.filter(u => {
                    if (!u || typeof u !== 'object') return false;
                    const em = (u.email || '').toLowerCase().trim();
                    return em !== 'giselly@itaimvende.com' && 
                           em !== 'railton@itaimvende.com' && 
                           em !== 'joao@itaimvende.com';
                });
            }
        } catch (e) {
            lista = [];
        }

        // Garante que o Admin oficial existe e NUNCA é contaminado por dados de outros perfis
        const adminIdx = lista.findIndex(u => (u.email || '').toLowerCase().trim() === 'admin@gmail.com' || u.id === 'cmv5iacmv0000ttiwu9wtemar');
        if (adminIdx !== -1) {
            lista[adminIdx] = {
                ...lista[adminIdx],
                ...USUARIO_ADMIN
            };
        } else {
            lista.unshift({ ...USUARIO_ADMIN });
        }

        // Garante deduplicação estrita por e-mail para não duplicar contas
        const mapa = new Map();
        const listaUnica = [];
        for (const u of lista) {
            if (!u || !u.email) continue;
            const key = u.email.toLowerCase().trim();
            if (!mapa.has(key)) {
                mapa.set(key, true);
                listaUnica.push(u);
            }
        }

        localStorage.setItem('itaim_usuarios_db', JSON.stringify(listaUnica));
        return listaUnica;
    }

    // Retorna todos os usuários cadastrados
    function obterTodosUsuarios() {
        return carregarUsuarios();
    }

    // Busca usuário por email
    function obterUsuarioPorEmail(email) {
        if (!email) return null;
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

    // 1.1 USUÁRIO DEV FRONT-END (PARA TESTES RÁPIDOS NO LIVE SERVER SEM PRECISAR DE BACKEND)
    const USUARIO_DEV = Object.freeze({
        id: "usr_dev_frontend_001",
        nome: "Dev Front-End",
        name: "Dev Front-End",
        username: "dev_front",
        usuario: "dev_front",
        email: "dev@itaimvende.com",
        telefone: "(89) 99400-0000",
        phone: "89994000000",
        cidade: "Paulistana",
        city: "Paulistana",
        bairro: "Centro",
        neighborhood: "Centro",
        estado: "PI",
        state: "PI",
        avatar: "assets/icons/icon-user.png",
        bio: "Ambiente de Desenvolvimento Front-End ativo (Live Server).",
        role: "ADMIN",
        isVerified: true,
        dataCadastro: "Membro Dev",
        avaliacao: "5.0",
        ratingAverage: 5.0,
        totalAvaliacoes: 14,
        ratingCount: 14,
        vendasConcluidas: 9,
        salesCount: 9
    });

    // Detecta se a página está explicitamente configurada em Modo Dev Front-End
    function isModoDevFrontend() {
        return localStorage.getItem('itaim_modo_dev') === 'true';
    }

    // Garante que visitantes nunca sejam autenticados como Dev Front-End automaticamente
    function garantirSessaoDevFrontend() {
        // Desativado por completo
    }

    function ativarModoDevFrontend() {
        localStorage.setItem('itaim_modo_dev', 'true');
        localStorage.setItem('itaim_token', 'token_mock_dev_frontend');
        localStorage.setItem('itaim_usuario_logado', JSON.stringify(USUARIO_DEV));
        localStorage.setItem('itaim_usuario_logado_email', USUARIO_DEV.email);
    }

    function desativarModoDevFrontend() {
        localStorage.removeItem('itaim_modo_dev');
    }

    // Retorna se há um usuário autenticado com credenciais válidas (ou false para visitantes)
    function usuarioEstaAutenticado() {
        const token = localStorage.getItem('itaim_token');
        const bUserRaw = localStorage.getItem('itaim_usuario_logado');
        if (!token || !bUserRaw) return false;
        if (token === 'token_mock_dev_frontend') return false;
        return true;
    }

    // Retorna o usuário logado na sessão atual (ou null se for visitante / não logado)
    function obterUsuarioLogado() {
        const token = localStorage.getItem('itaim_token');
        const bUserRaw = localStorage.getItem('itaim_usuario_logado');
        if (!token || !bUserRaw) {
            return null;
        }

        let backendUser = null;
        try {
            backendUser = JSON.parse(bUserRaw);
        } catch(e) {
            return null;
        }

        if (!backendUser) {
            return null;
        }

        let emailAtivo = localStorage.getItem('itaim_usuario_logado_email') || backendUser.email;
        if (!emailAtivo) {
            emailAtivo = backendUser.email;
            localStorage.setItem('itaim_usuario_logado_email', emailAtivo);
        }

        let user = obterUsuarioPorEmail(emailAtivo) || backendUser;

        return {
            ...user,
            ...backendUser,
            id: backendUser.id || user.id,
            nome: backendUser.name || backendUser.nome || user.nome,
            name: backendUser.name || backendUser.nome || user.name,
            username: backendUser.username || user.username,
            usuario: backendUser.username || user.usuario,
            email: backendUser.email || user.email,
            telefone: backendUser.phone ? formatarTelefoneBR(backendUser.phone) : (user.telefone || '(89) 99998-5858'),
            phone: backendUser.phone || user.phone || '89999858585',
            cidade: backendUser.city || user.cidade || 'Paulistana',
            city: backendUser.city || user.city || 'Paulistana',
            bairro: backendUser.neighborhood || user.bairro || 'Centro',
            neighborhood: backendUser.neighborhood || user.neighborhood || 'Centro',
                    bio: backendUser.bio !== undefined ? backendUser.bio : user.bio,
                    avatar: backendUser.avatar || user.avatar || 'assets/icons/icon-user.png',
                    role: backendUser.role || user.role || 'ADMIN',
                    isVerified: backendUser.isVerified !== undefined ? backendUser.isVerified : true,
                    ratingAverage: (Number(backendUser.ratingCount || 0) > 0 && backendUser.ratingAverage !== undefined) ? Number(backendUser.ratingAverage) : 0.0,
                    avaliacao: ((Number(backendUser.ratingCount || 0) > 0 && backendUser.ratingAverage !== undefined) ? Number(backendUser.ratingAverage) : 0.0).toFixed(1),
                    ratingCount: backendUser.ratingCount !== undefined ? Number(backendUser.ratingCount) : 0,
                    totalAvaliacoes: backendUser.ratingCount !== undefined ? Number(backendUser.ratingCount) : 0,
                    salesCount: backendUser.salesCount !== undefined ? backendUser.salesCount : (user.vendasConcluidas || 12),
                    vendasConcluidas: backendUser.salesCount !== undefined ? backendUser.salesCount : (user.vendasConcluidas || 12)
                };
    }

    // Define o usuário logado e atualiza a interface com isolamento estrito
    function definirUsuarioLogado(emailOuUser, dadosCompletos = null) {
        if (!emailOuUser && !dadosCompletos) return null;
        const chaveBusca = dadosCompletos?.email || emailOuUser || '';
        const chaveLower = chaveBusca.toLowerCase().trim();

        let user = null;
        if (chaveLower === 'admin' || chaveLower === 'admin@gmail.com') {
            user = { ...USUARIO_ADMIN };
        } else {
            user = obterUsuarioPorEmail(chaveLower) || obterUsuarioPorUsername(chaveLower);
        }

        // Se forneceu dados completos do backend, mescla sobre os dados DESTE usuário
        if (dadosCompletos && typeof dadosCompletos === 'object') {
            const baseUser = user || {
                id: dadosCompletos.id || ('usr_' + Date.now()),
                nome: dadosCompletos.name || dadosCompletos.nome || chaveBusca.split('@')[0],
                name: dadosCompletos.name || dadosCompletos.nome || chaveBusca.split('@')[0],
                username: dadosCompletos.username || chaveBusca.split('@')[0],
                email: dadosCompletos.email || chaveLower,
                role: dadosCompletos.role || 'BUYER',
                avatar: dadosCompletos.avatar || 'assets/icons/icon-user.png',
                city: dadosCompletos.city || 'Paulistana',
                cidade: dadosCompletos.city || 'Paulistana',
                neighborhood: dadosCompletos.neighborhood || 'Centro',
                bairro: dadosCompletos.neighborhood || 'Centro',
                phone: dadosCompletos.phone || '',
                telefone: dadosCompletos.phone ? formatarTelefoneBR(dadosCompletos.phone) : ''
            };

            user = {
                ...baseUser,
                id: dadosCompletos.id || baseUser.id,
                nome: dadosCompletos.name || dadosCompletos.nome || baseUser.nome,
                name: dadosCompletos.name || dadosCompletos.nome || baseUser.name,
                username: dadosCompletos.username || baseUser.username,
                usuario: dadosCompletos.username || baseUser.usuario,
                email: (dadosCompletos.email || baseUser.email).toLowerCase().trim(),
                telefone: dadosCompletos.phone ? formatarTelefoneBR(dadosCompletos.phone) : (dadosCompletos.telefone || baseUser.telefone),
                phone: dadosCompletos.phone || baseUser.phone,
                cidade: dadosCompletos.city || dadosCompletos.cidade || baseUser.cidade,
                city: dadosCompletos.city || dadosCompletos.cidade || baseUser.city,
                bairro: dadosCompletos.neighborhood || dadosCompletos.bairro || baseUser.bairro,
                neighborhood: dadosCompletos.neighborhood || dadosCompletos.bairro || baseUser.neighborhood,
                avatar: dadosCompletos.avatar || baseUser.avatar,
                bio: dadosCompletos.bio !== undefined ? dadosCompletos.bio : (baseUser.bio || ''),
                role: dadosCompletos.role || baseUser.role,
                isVerified: dadosCompletos.isVerified !== undefined ? dadosCompletos.isVerified : baseUser.isVerified,
                ratingAverage: dadosCompletos.ratingAverage !== undefined ? Number(dadosCompletos.ratingAverage) : (baseUser.ratingAverage || 5.0),
                avaliacao: (Number(dadosCompletos.ratingAverage || baseUser.ratingAverage || 5)).toFixed(1),
                ratingCount: dadosCompletos.ratingCount !== undefined ? dadosCompletos.ratingCount : (baseUser.ratingCount || 0),
                totalAvaliacoes: dadosCompletos.ratingCount !== undefined ? dadosCompletos.ratingCount : (baseUser.totalAvaliacoes || 0),
                salesCount: dadosCompletos.salesCount !== undefined ? dadosCompletos.salesCount : (baseUser.salesCount || 0),
                vendasConcluidas: dadosCompletos.salesCount !== undefined ? dadosCompletos.salesCount : (baseUser.vendasConcluidas || 0)
            };
        }

        if (user) {
            const todos = carregarUsuarios();
            const uIdx = todos.findIndex(u => (u.email || '').toLowerCase().trim() === (user.email || '').toLowerCase().trim());
            if (uIdx !== -1) {
                todos[uIdx] = { ...todos[uIdx], ...user };
            } else {
                todos.push(user);
            }
            localStorage.setItem('itaim_usuarios_db', JSON.stringify(todos));
            localStorage.setItem('itaim_usuario_logado_email', user.email);
            localStorage.setItem('itaim_usuario_logado', JSON.stringify(user));
            localStorage.setItem('itaim_ultimo_email', user.email);

            if (window.ItaimSessao && typeof window.ItaimSessao.atualizarHeaderUsuario === 'function') {
                window.ItaimSessao.atualizarHeaderUsuario();
            }
            return user;
        }
        return null;
    }

    // Cadastra um novo perfil de usuário com garantia total de isolamento
    function cadastrarNovoUsuario(dados) {
        if (!dados || !dados.email) return { sucesso: false, erro: 'E-mail é obrigatório.' };
        const lista = carregarUsuarios();
        const emailLower = (dados.email || '').toLowerCase().trim();
        const usernameLower = (dados.username || emailLower.split('@')[0]).replace('@', '').toLowerCase().trim();

        // 1. Verifica se já existe por e-mail ou username
        const existenteEmail = lista.find(u => (u.email || '').toLowerCase().trim() === emailLower);
        if (existenteEmail) {
            return { sucesso: false, jaExistia: true, erro: 'Já existe uma conta cadastrada com este e-mail.', usuario: existenteEmail };
        }

        const existenteUser = lista.find(u => (u.username || '').toLowerCase().trim() === usernameLower);
        if (existenteUser) {
            return { sucesso: false, jaExistia: true, erro: 'Este nome de usuário já está em uso.', usuario: existenteUser };
        }

        // 2. Cria conta única e independente
        const novoUser = {
            id: dados.id || ('usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7)),
            nome: dados.nome || dados.name || 'Novo Usuário',
            name: dados.nome || dados.name || 'Novo Usuário',
            username: usernameLower,
            usuario: usernameLower,
            email: emailLower,
            telefone: dados.telefone || (dados.phone ? formatarTelefoneBR(dados.phone) : ''),
            phone: dados.phone || dados.telefone || '',
            cidade: dados.cidade || dados.city || 'Paulistana',
            city: dados.cidade || dados.city || 'Paulistana',
            bairro: dados.bairro || dados.neighborhood || 'Centro',
            neighborhood: dados.bairro || dados.neighborhood || 'Centro',
            estado: dados.estado || dados.state || 'PI',
            state: dados.estado || dados.state || 'PI',
            avatar: dados.avatar || 'assets/icons/icon-user.png',
            bio: dados.bio || `Perfil de ${dados.nome || 'usuário'} no Itaim Vende.`,
            role: dados.role || 'BUYER',
            status: 'ativo',
            isVerified: false,
            dataCadastro: 'Membro desde ' + new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(new Date()),
            avaliacao: '5.0',
            ratingAverage: 5.0,
            totalAvaliacoes: 0,
            ratingCount: 0,
            vendasConcluidas: 0,
            salesCount: 0
        };

        lista.push(novoUser);
        localStorage.setItem('itaim_usuarios_db', JSON.stringify(lista));
        return { sucesso: true, usuario: novoUser };
    }

    // Atualiza os dados de um perfil de usuário existente com proteção estrita (NUNCA altera index 0 inadvertidamente)
    function atualizarDadosUsuario(email, novosDados) {
        if (!email && !novosDados) return null;
        const lista = carregarUsuarios();
        const emailLower = (email || (novosDados && novosDados.email) || '').toLowerCase().trim();
        
        let idx = -1;
        if (emailLower) {
            idx = lista.findIndex(u => (u.email || '').toLowerCase().trim() === emailLower);
        }
        if (idx === -1 && novosDados && novosDados.id) {
            idx = lista.findIndex(u => String(u.id) === String(novosDados.id));
        }

        // Se NÃO encontrou, NUNCA atualiza o index 0!
        if (idx === -1) {
            console.warn('[ItaimSessaoAuth] Conta não encontrada para atualização:', emailLower);
            return null;
        }

        const antigoEmail = lista[idx].email;
        lista[idx] = {
            ...lista[idx],
            ...novosDados,
            email: emailLower || lista[idx].email
        };

        if (novosDados.username && !novosDados.usuario) {
            lista[idx].usuario = novosDados.username;
        }

        const novoEmail = lista[idx].email || antigoEmail;
        localStorage.setItem('itaim_usuarios_db', JSON.stringify(lista));

        // Se este usuário for o usuário logado ativo, sincroniza a sessão
        const emailLogado = (localStorage.getItem('itaim_usuario_logado_email') || '').toLowerCase().trim();
        if (emailLogado === (antigoEmail || '').toLowerCase().trim() || emailLogado === (novoEmail || '').toLowerCase().trim()) {
            localStorage.setItem('itaim_usuario_logado_email', novoEmail);
            localStorage.setItem('itaim_usuario_logado', JSON.stringify(lista[idx]));
            if (window.ItaimSessao && typeof window.ItaimSessao.atualizarHeaderUsuario === 'function') {
                window.ItaimSessao.atualizarHeaderUsuario();
            }
        }

        return lista[idx];
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
        deslogarUsuario();
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
        deslogarUsuario();
        return true;
    }

    // Desloga o usuário e limpa completamente a sessão ativa sem apagar a conta
    function deslogarUsuario() {
        try {
            localStorage.removeItem('itaim_usuario_logado_email');
            localStorage.removeItem('itaim_usuario_logado');
            localStorage.removeItem('itaim_token');
            localStorage.removeItem('itaim_perfil_usuario');
            localStorage.removeItem('itaim_perfil_customizado');
            localStorage.removeItem('itaim_ultima_atividade');
            localStorage.removeItem('itaim_ultimo_email');
            localStorage.removeItem('itaim_modo_dev');
        } catch(e) {}
        if (window.ItaimSessao && typeof window.ItaimSessao.atualizarHeaderUsuario === 'function') {
            window.ItaimSessao.atualizarHeaderUsuario();
        }
        window.dispatchEvent(new CustomEvent('itaim:logout'));
    }

    // Exporta API no namespace de Autenticação
    window.ItaimSessaoAuth = {
        USUARIO_ADMIN,
        USUARIO_DEV,
        isModoDevFrontend,
        garantirSessaoDevFrontend,
        ativarModoDevFrontend,
        desativarModoDevFrontend,
        formatarTelefoneBR,
        carregarUsuarios,
        obterTodosUsuarios,
        obterUsuarioPorEmail,
        obterUsuarioPorUsername,
        usuarioEstaAutenticado,
        obterUsuarioLogado,
        definirUsuarioLogado,
        cadastrarNovoUsuario,
        atualizarDadosUsuario,
        obterConfiguracoes,
        suspenderConta,
        excluirContaPermanentemente,
        deslogarUsuario
    };

})();
