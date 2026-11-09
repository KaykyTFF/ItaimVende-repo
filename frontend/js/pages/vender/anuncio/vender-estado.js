/**
 * ITAIM VENDE - VENDER: ESTADO GLOBAL E UTILITÁRIOS COMPARTILHADOS
 * Arquivo: frontend/js/pages/vender/anuncio/vender-estado.js
 */

(function () {
    'use strict';

    const estado = {
        fotosLista: [],
        etapaAtual: 1,
        isModoDoacao: false,
        ultimoAnuncioCriadoId: null,
        modoEdicao: false,
        idEdicao: null,
    };

    const NOMES_ETAPAS = {
        1: 'Fotos',
        2: 'Detalhes',
        3: 'Preço e Localização',
        4: 'Revisão'
    };

    const PORCENTAGEM_ETAPAS = {
        1: '25%',
        2: '50%',
        3: '75%',
        4: '100%'
    };

    const CATEGORIA_MAPA = {
        'veículos': 1, 'veiculos': 1,
        'autopeças': 2, 'autopecas': 2, 'peças automotivas': 2, 'pecas automotivas': 2, 'motocicletas': 1,
        'imóveis': 3, 'imoveis': 3,
        'terrenos': 4,
        'agro': 5, 'agro e campo': 5,
        'pecuária': 6, 'pecuaria': 6,
        'celulares': 7,
        'telefonia': 8,
        'eletrônicos': 9, 'eletronicos': 9, 'tecnologia': 9,
        'áudio & vídeo': 10, 'audio & video': 10, 'áudio e vídeo': 10, 'audio e video': 10, 'audio-video': 10,
        'informática': 11, 'informatica': 11, 'informática e acessórios': 11, 'informatica e acessorios': 11,
        'games': 12,
        'móveis': 13, 'moveis': 13, 'casa e móveis': 13, 'casa e moveis': 13,
        'decoração': 14, 'decoracao': 14,
        'eletrodomésticos': 15, 'eletrodomesticos': 15,
        'moda': 16, 'moda e beleza': 16,
        'calçados': 17, 'calcados': 17,
        'acessórios': 18, 'acessorios': 18, 'relógios e joias': 18, 'relogios e joias': 18, 'bolsas e malas': 18,
        'beleza': 19,
        'cuidado pessoal': 20, 'cuidado-pessoal': 20, 'saúde e cuidados': 20, 'saude e cuidados': 20,
        'infantil': 21, 'brinquedos': 21,
        'bebês': 22, 'bebes': 22, 'bebês e cia': 22, 'bebes e cia': 22,
        'esportes': 23, 'esportes e lazer': 23, 'bicicletas': 23,
        'fitness': 24,
        'lazer': 25, 'jardim e piscina': 25, 'náutica': 25, 'nautica': 25,
        'construção': 26, 'construcao': 26, 'construção e reforma': 26, 'construcao e reforma': 26,
        'ferramentas': 27,
        'comércio': 28, 'comercio': 28, 'alimentos e bebidas': 28,
        'escritório': 29, 'escritorio': 29, 'livros e papelaria': 29,
        'serviços': 30, 'servicos': 30,
        'música': 31, 'musica': 31, 'música e instrumentos': 31, 'musica e instrumentos': 31, 'instrumentos musicais': 31,
        'hobbies': 32, 'antiguidades e coleções': 32, 'antiguidades e colecoes': 32, 'arte e artesanato': 32, 'fotografia': 32,
        'animais de estimação': 33, 'animais de estimacao': 33, 'animais e pets': 33, 'pets': 33,
        'pet shop': 34, 'pet-shop': 34,
        'doações': 35, 'doacoes': 35,
        'trocas': 36,
        'outros': 37,
        'geral': 37
    };

    const PADROES_SUSPEITOS = /(https?:\/\/|www\.|bit\.ly|tinyurl|t\.me|cutt\.ly|is\.gd|<\s*script)/i;

    function normalizarTextoCategoria(str) {
        return String(str || '')
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function obterCategoriaId(nome) {
        if (!nome) return 37;
        const norm = String(nome).toLowerCase().replace(/\s+/g, ' ').trim();
        if (CATEGORIA_MAPA[norm]) return CATEGORIA_MAPA[norm];

        const semAcento = normalizarTextoCategoria(nome);
        if (CATEGORIA_MAPA[semAcento]) return CATEGORIA_MAPA[semAcento];

        for (const [key, id] of Object.entries(CATEGORIA_MAPA)) {
            if (normalizarTextoCategoria(key) === semAcento) return id;
        }

        for (const [key, id] of Object.entries(CATEGORIA_MAPA)) {
            const keyNorm = normalizarTextoCategoria(key);
            if (semAcento.includes(keyNorm) || keyNorm.includes(semAcento)) return id;
        }
        return 37;
    }

    function normalizarUrlImagemParaBackend(url) {
        if (!url || typeof url !== 'string') return '';
        const limpo = url.trim();
        if (limpo.startsWith('data:')) return limpo;

        const idxUploads = limpo.indexOf('/uploads/');
        if (idxUploads !== -1) {
            return limpo.substring(idxUploads);
        }

        const idxAssets = limpo.indexOf('assets/');
        if (idxAssets !== -1 && (!limpo.startsWith('http') || limpo.startsWith('http://localhost') || limpo.startsWith('http://127.0.0.1'))) {
            return limpo.substring(idxAssets);
        }

        return limpo;
    }

    function normalizarCondicao(cond) {
        if (!cond) return 'USADO';
        const c = cond.toUpperCase();
        if (c.includes('NOVO') && !c.includes('SEMI')) return 'NOVO';
        if (c.includes('SEMINOVO')) return 'SEMINOVO';
        if (c.includes('DEFEITO')) return 'DEFEITO';
        return 'USADO';
    }

    function mostrarToast(mensagem) {
        let toastEl = document.getElementById('vender-toast-flutuante');
        if (!toastEl) {
            toastEl = document.createElement('div');
            toastEl.id = 'vender-toast-flutuante';
            toastEl.style.cssText = 'position: fixed; bottom: 24px; right: 24px; background: #2D3236; color: #FFFFFF; padding: 12px 20px; border-radius: 10px; box-shadow: 0 6px 20px rgba(0,0,0,0.22); font-size: 14px; font-weight: 600; z-index: 999999; opacity: 0; transition: all 0.3s ease; pointer-events: none;';
            document.body.appendChild(toastEl);
        }
        toastEl.textContent = mensagem;
        toastEl.style.opacity = '1';
        toastEl.style.transform = 'translateY(0)';
        clearTimeout(toastEl._timer);
        toastEl._timer = setTimeout(() => {
            toastEl.style.opacity = '0';
            toastEl.style.transform = 'translateY(10px)';
        }, 3000);
    }

    function exibirFeedback(mensagem) {
        const feedbackValidacao = document.getElementById('feedback-validacao');
        if (!feedbackValidacao) return;
        feedbackValidacao.textContent = mensagem;
        feedbackValidacao.classList.add('visivel');
        setTimeout(() => {
            feedbackValidacao.classList.remove('visivel');
        }, 4000);
    }

    function validarFotos() {
        const feedbackFotos = document.getElementById('feedback-fotos');
        const btnAddFoto = document.getElementById('btn-add-foto');

        if (!estado.fotosLista || estado.fotosLista.length === 0) {
            if (feedbackFotos) feedbackFotos.style.display = 'flex';
            if (btnAddFoto) {
                btnAddFoto.classList.add('com-erro-shake');
                setTimeout(() => btnAddFoto.classList.remove('com-erro-shake'), 600);
            }
            mostrarToast('Adicione pelo menos 1 foto do produto para continuar.');
            return false;
        }
        if (feedbackFotos) feedbackFotos.style.display = 'none';
        return true;
    }

    window.ItaimVenderEstado = {
        estado,
        NOMES_ETAPAS,
        PORCENTAGEM_ETAPAS,
        CATEGORIA_MAPA,
        PADROES_SUSPEITOS,
        obterCategoriaId,
        normalizarTextoCategoria,
        normalizarUrlImagemParaBackend,
        normalizarCondicao,
        mostrarToast,
        exibirFeedback,
        validarFotos
    };
})();

