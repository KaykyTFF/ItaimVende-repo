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
        'imóveis': 2, 'imoveis': 2,
        'tecnologia': 3,
        'casa e móveis': 4, 'casa e moveis': 4,
        'eletrodomésticos': 5, 'eletrodomesticos': 5,
        'esportes e lazer': 6,
        'moda e beleza': 7,
        'infantil': 8,
        'ferramentas': 9,
        'outros': 10,
        'geral': 10,
        'agro e campo': 11,
        'games': 12,
        'música e instrumentos': 13, 'musica e instrumentos': 13,
        'livros e papelaria': 14,
        'saúde e cuidados': 15, 'saude e cuidados': 15,
        'construção e reforma': 16, 'construcao e reforma': 16,
        'animais e pets': 17,
        'serviços': 18, 'servicos': 18,
        'antiguidades e coleções': 19, 'antiguidades e colecoes': 19,
        'alimentos e bebidas': 20,
        'arte e artesanato': 21,
        'bebês e cia': 22, 'bebes e cia': 22,
        'fotografia': 23,
        'informática e acessórios': 24, 'informatica e acessorios': 24,
        'telefonia': 25,
        'áudio e vídeo': 26, 'audio e video': 26,
        'relógios e joias': 27, 'relogios e joias': 27,
        'brinquedos': 28,
        'calçados': 29, 'calcados': 29,
        'bolsas e malas': 30,
        'peças automotivas': 31, 'pecas automotivas': 31,
        'motocicletas': 32,
        'bicicletas': 33,
        'náutica': 34, 'nautica': 34,
        'instrumentos musicais': 35,
        'decoração': 36, 'decoracao': 36,
        'jardim e piscina': 37
    };

    const PADROES_SUSPEITOS = /(https?:\/\/|www\.|bit\.ly|tinyurl|t\.me|cutt\.ly|is\.gd|<\s*script)/i;

    function obterCategoriaId(nome) {
        if (!nome) return 10;
        const norm = nome.toLowerCase().trim();
        return CATEGORIA_MAPA[norm] || 10;
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
        normalizarCondicao,
        mostrarToast,
        exibirFeedback,
        validarFotos
    };
})();

