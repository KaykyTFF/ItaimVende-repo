/**
 * ITAIM VENDE - DICIONÁRIO E MAPA CANÔNICO DE ROTAS
 * Arquivo: frontend/js/core/rotas/rotas-mapa.js
 * 
 * Responsabilidades:
 * - Mapeamento canônico das páginas da plataforma (HTTP Clean URLs vs Arquivos Físicos)
 * - Identificação semântica resiliente de qualquer rota, alias ou caminho legado
 * - Categorização de rotas: Públicas, Protegidas (Autenticadas) e Administrativas (RBAC)
 */

(function() {
    'use strict';

    // 1. Arquivos físicos relativos à raiz da pasta frontend (para modo offline file:///)
    const ARQUIVOS_FISICOS = {
        'home': 'pages/home/home.html',
        'categoria': 'pages/produtos/categoria.html',
        'produto': 'pages/produtos/produto.html',
        'vender': 'pages/vender/vender.html',
        'meus-anuncios': 'pages/vender/meus-anuncios.html',
        'conversas': 'pages/mensagens/conversas.html',
        'chat': 'pages/mensagens/conversas.html',
        'perfil': 'pages/perfil/perfil.html',
        'vendedor': 'pages/perfil/vendedor.html',
        'configuracoes': 'pages/perfil/configuracoes.html',
        'favoritos': 'pages/favoritos/favoritos.html',
        'notificacoes': 'pages/notificacoes/notificacoes.html',
        'login': 'index.html',
        'cadastro': 'index.html#cadastro',
        'index': 'index.html',
        'tickets': 'pages/admin/tickets.html',
        'moderacao': 'pages/admin/tickets.html',
        'painel': 'pages/admin/painel.html',
        'status': 'pages/admin/painel.html',
        '404': '404.html'
    };

    // 2. Rotas limpas canônicas para ambiente web (HTTP / HTTPS)
    const ROTAS_CANONICAS = {
        'home': '/home',
        'categoria': '/categoria',
        'produto': '/produto',
        'vender': '/vender',
        'meus-anuncios': '/meus-anuncios',
        'conversas': '/conversas',
        'chat': '/conversas',
        'perfil': '/perfil',
        'vendedor': '/vendedor',
        'configuracoes': '/configuracoes',
        'favoritos': '/favoritos',
        'notificacoes': '/notificacoes',
        'login': '/login',
        'cadastro': '/cadastro',
        'index': '/login',
        'tickets': '/tickets',
        'moderacao': '/tickets',
        'painel': '/painel',
        'status': '/painel',
        '404': '/404'
    };

    // 3. Categorias de Controle de Acesso
    const ROTAS_PUBLICAS = ['home', 'categoria', 'produto', 'vendedor', 'login', 'cadastro', 'index', '404'];
    const ROTAS_PROTEGIDAS = ['vender', 'meus-anuncios', 'perfil', 'configuracoes', 'favoritos', 'notificacoes', 'conversas', 'chat'];
    const ROTAS_ADMIN = ['tickets', 'moderacao', 'painel', 'status'];

    // 4. Identificador semântico universal de rotas
    function identificarRota(caminhoOuUrl) {
        if (!caminhoOuUrl && caminhoOuUrl !== '') return 'home';
        let str = String(caminhoOuUrl).trim().toLowerCase();

        // Extrai apenas o pathname se for URL completa
        try {
            if (str.includes('://')) {
                str = new URL(str, window.location.origin).pathname.toLowerCase();
            }
        } catch (e) {}

        // Remove hash e query params
        str = str.split('?')[0].split('#')[0];

        // Normaliza barras
        str = str.replace(/\\/g, '/').replace(/\/+/g, '/');
        if (str.length > 1 && str.endsWith('/')) {
            str = str.slice(0, -1);
        }

        // Raiz
        if (str === '' || str === '/') return 'home';

        // Mapeamentos específicos por identificadores inequívocos
        if (str.includes('meus-anuncios')) return 'meus-anuncios';
        if (str.includes('categoria')) return 'categoria';
        if (str.includes('produto')) return 'produto';
        if (str.includes('vender')) return 'vender';
        if (str.includes('conversas') || str.includes('chat')) return 'conversas';
        if (str.includes('vendedor')) return 'vendedor';
        if (str.includes('configuracoes')) return 'configuracoes';
        if (str.includes('perfil')) return 'perfil';
        if (str.includes('favoritos')) return 'favoritos';
        if (str.includes('notificacoes')) return 'notificacoes';
        if (str.includes('cadastro')) return 'cadastro';
        if (str.includes('login') || str.includes('index')) return 'login';
        if (str.includes('tickets') || str.includes('moderacao')) return 'tickets';
        if (str.includes('painel') || str.includes('status')) return 'painel';
        if (str.includes('404')) return '404';
        if (str.includes('home')) return 'home';

        // Extrai o último segmento
        const partes = str.split('/').filter(Boolean);
        const ultimo = partes[partes.length - 1];
        if (ultimo) {
            const ultimoSemHtml = ultimo.endsWith('.html') ? ultimo.slice(0, -5) : ultimo;
            if (ROTAS_CANONICAS[ultimoSemHtml]) {
                return ultimoSemHtml;
            }
        }

        return '';
    }

    // Mapa de compatibilidade direta com código legado
    const MAPA_COMPLETO = { ...ARQUIVOS_FISICOS };
    MAPA_COMPLETO['/'] = 'pages/home/home.html';
    MAPA_COMPLETO[''] = 'pages/home/home.html';
    MAPA_COMPLETO['admin/tickets'] = 'pages/admin/tickets.html';

    const ItaimRotasMapa = {
        ARQUIVOS_FISICOS,
        ROTAS_CANONICAS,
        ROTAS_PUBLICAS,
        ROTAS_PROTEGIDAS,
        ROTAS_ADMIN,
        identificarRota,
        ...MAPA_COMPLETO
    };

    window.ItaimRotasMapa = ItaimRotasMapa;

})();
