/**
 * ITAIM VENDE - GERENCIADOR GLOBAL DE TEMAS (SESSAO TEMA)
 * Arquivo: frontend/js/core/sessao/sessao-tema.js
 * 
 * Responsabilidades:
 * - Persistência do tema escolhido no localStorage ('itaim_tema': 'light' | 'dark')
 * - Aplicação imediata de atributos e classes para evitar efeito FOUC
 * - Sincronização automática entre o botão do menu lateral (Drawer) e a aba de Configurações
 * - Sincronização em tempo real entre abas do navegador via evento 'storage'
 * - Exportação de API global window.ItaimTema
 */

(function() {
    'use strict';

    const CHAVE_STORAGE = 'itaim_tema';

    // 1. Aplicação imediata para evitar tela piscando ao carregar a página
    function obterTemaInicial() {
        try {
            const temaSalvo = localStorage.getItem(CHAVE_STORAGE);
            if (temaSalvo === 'dark' || temaSalvo === 'light') {
                return temaSalvo;
            }
            // Se não houver tema salvo, verificar preferência do sistema operacional
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                return 'dark';
            }
        } catch (e) {
            console.warn('[ItaimTema] Não foi possível ler preferência do tema:', e);
        }
        return 'light';
    }

    let temaAtual = obterTemaInicial();

    // Aplica no elemento raiz (HTML) o mais cedo possível
    function aplicarClasseRaiz(tema) {
        const isDark = (tema === 'dark');
        document.documentElement.setAttribute('data-theme', tema);
        document.documentElement.classList.toggle('dark-theme', isDark);
        if (document.body) {
            document.body.setAttribute('data-theme', tema);
            document.body.classList.toggle('dark-theme', isDark);
        }
    }

    aplicarClasseRaiz(temaAtual);

    /**
     * Sincroniza o estado visual de todos os botões de tema do site
     */
    function sincronizarBotoes() {
        const isDark = (temaAtual === 'dark');

        // Sincroniza botões no Menu Lateral (Drawer)
        const botoesDrawer = document.querySelectorAll('#btn-tema-drawer, .btn-alternar-tema');
        botoesDrawer.forEach(btn => {
            btn.classList.toggle('tema-escuro-ativo', isDark);
            btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
            btn.setAttribute('title', isDark ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro');

            // Ícones de Sol e Lua
            const iconeLua = btn.querySelector('.icone-tema-lua');
            const iconeSol = btn.querySelector('.icone-tema-sol');
            if (iconeLua && iconeSol) {
                iconeLua.style.display = isDark ? 'none' : 'block';
                iconeSol.style.display = isDark ? 'block' : 'none';
            }

            // Texto do botão
            const textoEl = btn.querySelector('.drawer-tema-texto');
            if (textoEl) {
                textoEl.textContent = isDark ? 'Modo Claro' : 'Modo Escuro';
            }
        });

        // Sincroniza cartões de seleção na página de Configurações
        const cardClaro = document.getElementById('card-tema-claro');
        const cardEscuro = document.getElementById('card-tema-escuro');
        if (cardClaro) {
            cardClaro.classList.toggle('ativo', !isDark);
            cardClaro.setAttribute('aria-pressed', !isDark ? 'true' : 'false');
        }
        if (cardEscuro) {
            cardEscuro.classList.toggle('ativo', isDark);
            cardEscuro.setAttribute('aria-pressed', isDark ? 'true' : 'false');
        }

        // Sincroniza switch direto na página de Configurações
        const switchConfig = document.getElementById('switch-tema-escuro');
        if (switchConfig) {
            switchConfig.checked = isDark;
        }

        const legendaConfig = document.getElementById('cfg-tema-legenda');
        if (legendaConfig) {
            legendaConfig.textContent = isDark ? 'Atualmente no Modo Escuro' : 'Atualmente no Modo Claro';
        }
    }

    /**
     * Define o tema ativo na plataforma
     * @param {'light'|'dark'} novoTema 
     * @param {boolean} dispararEvento 
     */
    function definirTema(novoTema, dispararEvento = true) {
        if (novoTema !== 'dark' && novoTema !== 'light') {
            novoTema = 'light';
        }

        temaAtual = novoTema;

        try {
            localStorage.setItem(CHAVE_STORAGE, novoTema);
        } catch (e) {
            console.warn('[ItaimTema] Erro ao salvar tema no storage:', e);
        }

        aplicarClasseRaiz(novoTema);
        sincronizarBotoes();

        if (dispararEvento) {
            window.dispatchEvent(new CustomEvent('itaim:tema-alterado', {
                detail: { tema: novoTema, isDark: novoTema === 'dark' }
            }));
        }
    }

    /**
     * Alterna entre modo claro e escuro
     */
    function alternarTema() {
        const proximoTema = (temaAtual === 'dark') ? 'light' : 'dark';
        definirTema(proximoTema, true);
        return proximoTema;
    }

    /**
     * Garante que o botão de tema exista no menu lateral, injetando dinamicamente se necessário
     */
    function garantirBotaoNoDrawer() {
        const drawerNav = document.querySelector('.drawer-nav');
        if (!drawerNav) return;

        let btnTema = document.getElementById('btn-tema-drawer');
        if (!btnTema) {
            btnTema = document.createElement('button');
            btnTema.type = 'button';
            btnTema.className = 'drawer-link btn-alternar-tema';
            btnTema.id = 'btn-tema-drawer';
            btnTema.setAttribute('aria-label', 'Alternar tema do site');
            btnTema.innerHTML = `
                <svg class="icone-tema-lua" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
                <svg class="icone-tema-sol" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: none;">
                    <circle cx="12" cy="12" r="5"></circle>
                    <line x1="12" y1="1" x2="12" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="23"></line>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                    <line x1="1" y1="12" x2="3" y2="12"></line>
                    <line x1="21" y1="12" x2="23" y2="12"></line>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
                <span class="drawer-tema-texto">Modo Escuro</span>
                <span class="drawer-tema-switch" aria-hidden="true">
                    <span class="drawer-tema-trilho">
                        <span class="drawer-tema-bolinha"></span>
                    </span>
                </span>
            `;

            // Inserir antes do link de configurações ou no final da navegação
            const linkConfiguracoes = document.getElementById('drawer-link-configuracoes');
            if (linkConfiguracoes) {
                drawerNav.insertBefore(btnTema, linkConfiguracoes);
            } else {
                const linkSair = drawerNav.querySelector('.item-sair');
                if (linkSair) {
                    drawerNav.insertBefore(btnTema, linkSair);
                } else {
                    drawerNav.appendChild(btnTema);
                }
            }
        }

        // Adiciona evento de clique se ainda não vinculado
        if (!btnTema._temaHandlerVinculado) {
            btnTema.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                alternarTema();
            });
            btnTema._temaHandlerVinculado = true;
        }

        sincronizarBotoes();
    }

    /**
     * Vincula ouvintes em botões de configuração e switches da página
     */
    function inicializarOuvintesTema() {
        garantirBotaoNoDrawer();

        // Switch de alternância na página de Configurações
        const switchConfig = document.getElementById('switch-tema-escuro');
        if (switchConfig && !switchConfig._temaVinculado) {
            switchConfig.addEventListener('change', (e) => {
                definirTema(e.target.checked ? 'dark' : 'light');
            });
            switchConfig._temaVinculado = true;
        }

        // Cartões interativos de tema na página de Configurações
        const botoesTema = document.querySelectorAll('.btn-ativar-tema, .cfg-tema-card');
        botoesTema.forEach(el => {
            if (el._temaVinculado) return;
            el.addEventListener('click', (e) => {
                const temaAlvo = el.getAttribute('data-tema') || el.closest('[data-tema]')?.getAttribute('data-tema');
                if (temaAlvo) {
                    definirTema(temaAlvo);
                }
            });
            el._temaVinculado = true;
        });

        sincronizarBotoes();
    }

    // Exportação da API Pública
    window.ItaimTema = {
        obterTema: () => temaAtual,
        isDark: () => temaAtual === 'dark',
        definirTema,
        alternarTema,
        sincronizarBotoes,
        garantirBotaoNoDrawer
    };

    // Inicialização ao carregar o DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            aplicarClasseRaiz(temaAtual);
            inicializarOuvintesTema();
        });
    } else {
        aplicarClasseRaiz(temaAtual);
        inicializarOuvintesTema();
    }

    // Sincronização entre abas em tempo real
    window.addEventListener('storage', (e) => {
        if (e.key === CHAVE_STORAGE && e.newValue) {
            definirTema(e.newValue, false);
        }
    });

})();
