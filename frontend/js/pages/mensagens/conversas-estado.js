/**
 * ITAIM VENDE - CHAT & CONVERSAS: MÓDULO DE ESTADO E TELAS DE VISITA
 * Arquivo: frontend/js/pages/mensagens/conversas-estado.js
 * 
 * Gerencia os elementos do DOM, variáveis de estado centralizadas,
 * chaves de cache e os estados visuais (não autenticado, sem conversa selecionada).
 */

(function (window, document) {
    'use strict';

    window.ItaimChatEstado = {
        // Elementos do DOM mapeados
        dom: {},

        // Estado em memória
        conversas: [],
        conversaAtivaId: null,
        mensagensAtivas: [],
        enviandoMensagem: false,
        intervaloPolling: null,
        contadorTicks: 0,
        mensagensCache: new Map(),

        // Credenciais e Usuário
        token: '',
        usuarioLogado: null,
        meuUserId: null,

        // Chaves de armazenamento
        STORAGE_KEY_LISTA: '',
        STORAGE_KEY_ATIVA: '',
        STORAGE_KEY_MSGS_PREFIX: '',

        inicializar: function () {
            this.dom = {
                layoutGrid: document.getElementById('chat-layout-grid'),
                listaScroll: document.getElementById('chat-lista-scroll'),
                buscaInput: document.getElementById('input-busca-conversas'),

                // Topo da Conversa
                chatTopoAtivo: document.getElementById('chat-topo-ativo'),
                headerAvatar: document.getElementById('chat-header-avatar'),
                headerNome: document.getElementById('chat-header-nome'),
                headerStatusTxt: document.getElementById('chat-header-status-txt'),
                linkPerfilConversa: document.getElementById('chat-perfil-conversa'),
                btnVoltarMobile: document.getElementById('btn-voltar-mobile-chat'),

                // Mini Resumo do Produto (Mobile)
                mobileResumoBox: document.getElementById('mobile-resumo-produto-topo'),
                mobileMiniFoto: document.getElementById('mobile-mini-foto'),
                mobileMiniTitulo: document.getElementById('mobile-mini-titulo'),
                mobileMiniPreco: document.getElementById('mobile-mini-preco'),
                mobileMiniLink: document.getElementById('mobile-mini-link-anuncio'),

                // Centro / Feed / Form
                chatCentroVazio: document.getElementById('chat-centro-vazio'),
                feedMensagens: document.getElementById('chat-feed-mensagens'),
                formEnvio: document.getElementById('form-chat-envio'),
                inputTexto: document.getElementById('chat-input-texto'),
                btnEnviarMsg: document.getElementById('btn-enviar-mensagem'),

                // Detalhes do Produto (Desktop)
                painelVazio: document.getElementById('chat-produto-vazio-estado'),
                painelCard: document.getElementById('chat-produto-card'),
                painelProdutoFoto: document.getElementById('painel-produto-foto'),
                painelProdutoNome: document.getElementById('painel-produto-nome'),
                painelProdutoPreco: document.getElementById('painel-produto-preco'),
                painelCidadeTxt: document.getElementById('painel-produto-cidade-txt'),
                painelEspecCondicao: document.getElementById('painel-espec-condicao'),
                painelEspecCategoria: document.getElementById('painel-espec-categoria'),
                painelProdutoDesc: document.getElementById('painel-produto-desc'),
                btnPainelVerAnuncio: document.getElementById('btn-painel-ver-anuncio'),

                // Avisos e Modais
                avisoBloqueio: document.getElementById('chat-aviso-bloqueio'),
                avisoBloqueioTxt: document.getElementById('chat-aviso-bloqueio-texto'),
                btnDesbloquearBanner: document.getElementById('btn-desbloquear-banner'),
                txtBtnBloquear: document.getElementById('txt-btn-bloquear'),
                btnToggleBloqueio: document.getElementById('btn-toggle-bloqueio-chat')
            };

            // Suporte automático ao Modo Dev Front-End (Live Server)
            if (window.ItaimSessao && typeof window.ItaimSessao.isModoDevFrontend === 'function' && window.ItaimSessao.isModoDevFrontend()) {
                window.ItaimSessao.garantirSessaoDevFrontend();
            }

            this.token = (window.ItaimApi?.auth?.obterToken && window.ItaimApi.auth.obterToken()) ||
                         localStorage.getItem('itaim_token') ||
                         '';

            this.usuarioLogado = (window.ItaimSessao && typeof window.ItaimSessao.obterUsuarioLogado === 'function')
                ? window.ItaimSessao.obterUsuarioLogado()
                : null;

            if (!this.usuarioLogado) {
                try {
                    this.usuarioLogado = JSON.parse(localStorage.getItem('itaim_usuario_logado') || 'null');
                } catch (e) {
                    this.usuarioLogado = null;
                }
            }

            this.meuUserId = this.usuarioLogado?.id || null;

            this.STORAGE_KEY_LISTA = `itaim_chat_conversas_${this.meuUserId || 'anon'}`;
            this.STORAGE_KEY_ATIVA = `itaim_chat_ativa_${this.meuUserId || 'anon'}`;
            this.STORAGE_KEY_MSGS_PREFIX = `itaim_chat_msgs_${this.meuUserId || 'anon'}_`;
        },

        exibirEstadoNaoAutenticado: function () {
            const dom = this.dom;
            if (dom.listaScroll) {
                dom.listaScroll.innerHTML = `
                    <div class="chat-vazio-box" style="padding: 40px 18px; text-align: center;">
                        <div class="chat-vazio-icone">
                            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                        </div>
                        <div class="chat-vazio-titulo">Acesso restrito</div>
                        <p class="chat-vazio-desc">Faça login para ver suas conversas e negociar com compradores e vendedores.</p>
                        <a href="${window.ItaimRotas ? window.ItaimRotas.obterUrl('login') : '../../index.html'}" class="btn-voltar-chat" style="display: inline-flex; justify-content: center; width: auto; margin: 0 auto; background-color: var(--chat-primary); border-color: var(--chat-primary);">
                            Entrar na minha conta
                        </a>
                    </div>
                `;
            }

            if (dom.chatCentroVazio) {
                dom.chatCentroVazio.innerHTML = `
                    <div class="chat-centro-vazio-icone">
                        <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                    </div>
                    <h3>Faça login para continuar</h3>
                    <p>Suas mensagens e negociações seguras ficam armazenadas em sua conta.</p>
                    <a href="${window.ItaimRotas ? window.ItaimRotas.obterUrl('login') : '../../index.html'}" class="btn-centro-explorar">
                        Fazer Login / Cadastrar
                    </a>
                `;
                dom.chatCentroVazio.style.display = 'flex';
            }

            if (dom.chatTopoAtivo) dom.chatTopoAtivo.style.display = 'none';
            if (dom.feedMensagens) dom.feedMensagens.style.display = 'none';
            if (dom.formEnvio) dom.formEnvio.style.display = 'none';
            if (dom.painelVazio) dom.painelVazio.style.display = 'flex';
            if (dom.painelCard) dom.painelCard.style.display = 'none';
        },

        exibirEstadoSemConversa: function () {
            this.conversaAtivaId = null;
            try {
                localStorage.removeItem(this.STORAGE_KEY_ATIVA);
            } catch (e) {}
            document.documentElement.classList.remove('chat-conversa-ativa-esperada');

            const dom = this.dom;
            if (dom.chatTopoAtivo) dom.chatTopoAtivo.style.display = 'none';
            if (dom.feedMensagens) dom.feedMensagens.style.display = 'none';
            if (dom.formEnvio) dom.formEnvio.style.display = 'none';
            if (dom.avisoBloqueio) dom.avisoBloqueio.style.display = 'none';
            if (dom.mobileResumoBox) dom.mobileResumoBox.style.display = 'none';
            if (dom.chatCentroVazio) dom.chatCentroVazio.style.display = 'flex';

            if (dom.painelVazio) dom.painelVazio.style.display = 'flex';
            if (dom.painelCard) dom.painelCard.style.display = 'none';

            if (window.ItaimChatLista && typeof window.ItaimChatLista.destacarCardAtivo === 'function') {
                window.ItaimChatLista.destacarCardAtivo(null);
            }
        }
    };

})(window, document);
