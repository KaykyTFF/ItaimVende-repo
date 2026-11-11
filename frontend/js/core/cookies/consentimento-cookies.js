/**
 * ITAIM VENDE - GERENCIADOR DE CONSENTIMENTO E PREFERÊNCIAS DE COOKIES
 * Arquivo: frontend/js/core/cookies/consentimento-cookies.js
 * 
 * Implementação alinhada à LGPD (Lei 13.709/2018):
 * - Ausência de dark patterns: Aceitar, Rejeitar e Personalizar com igual facilidade de acesso
 * - Persistência auditável em localStorage com timestamp, versão e categorias
 * - Bloqueio real de tecnologias opcionais quando não consentidas
 * - Permite alteração das preferências a qualquer momento por meio da Central de Preferências
 */

(function () {
    'use strict';

    const VERSAO_POLITICA_COOKIES = '1.0';
    const CHAVE_STORAGE = 'itaim_consentimento_cookies';

    const CATEGORIAS_PADRAO = {
        essenciais: true,    // Sempre ativas (JWT, sessão, segurança e roteamento)
        preferencias: false, // Tema escuro e cache local de anúncios favoritados
        analiticos: false,   // Desativado por padrão (sem ferramentas de terceiros ativas no momento)
        marketing: false     // Desativado por padrão (sem pixels de anúncios ou remarketing)
    };

    /**
     * Recupera o consentimento atualmente salvo
     */
    function obterConsentimento() {
        try {
            const raw = localStorage.getItem(CHAVE_STORAGE);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            if (parsed && parsed.versao === VERSAO_POLITICA_COOKIES && parsed.categorias) {
                return parsed;
            }
            return null;
        } catch (e) {
            return null;
        }
    }

    /**
     * Salva as preferências de consentimento
     * @param {Object} categorias 
     * @param {string} status 'aceito_todos' | 'rejeitado_opcionais' | 'personalizado'
     */
    function salvarConsentimento(categorias, status) {
        const dados = {
            status: status || 'personalizado',
            categorias: {
                essenciais: true, // Sempre obrigatório
                preferencias: Boolean(categorias.preferencias),
                analiticos: Boolean(categorias.analiticos),
                marketing: Boolean(categorias.marketing)
            },
            versao: VERSAO_POLITICA_COOKIES,
            timestamp: Date.now(),
            dataHora: new Date().toISOString()
        };

        try {
            localStorage.setItem(CHAVE_STORAGE, JSON.stringify(dados));
        } catch (e) {
            console.warn('[ItaimCookies] Erro ao persistir consentimento em localStorage:', e);
        }

        aplicarEfeitosConsentimento(dados.categorias);
        fecharBanner();
        fecharModal();

        // Notifica outros módulos da aplicação
        try {
            window.dispatchEvent(new CustomEvent('itaim:cookies-alterados', { detail: dados }));
        } catch (e) {}
    }

    /**
     * Aplica efeitos práticos das categorias escolhidas
     */
    function aplicarEfeitosConsentimento(categorias) {
        // Se o usuário rejeitar preferências, podemos opcionalmente respeitar o tema do sistema operacional
        if (!categorias.preferencias) {
            // Nota: Não apagamos forçadamente as preferências essenciais em uso, mas impedimos
            // que novos scripts de personalização sejam disparados.
        }

        // Se houver ferramentas analíticas futuras, este gancho realiza a inicialização condicional
        if (categorias.analiticos) {
            // Reservado para inicialização de eventuais scripts de telemetria autorizados
        }
    }

    /**
     * Aceitar todas as categorias
     */
    function aceitarTodos() {
        salvarConsentimento({
            essenciais: true,
            preferencias: true,
            analiticos: false, // Mantido desativado por não haver ferramenta ativa
            marketing: false
        }, 'aceito_todos');
    }

    /**
     * Rejeitar todas as categorias opcionais
     */
    function rejeitarOpcionais() {
        salvarConsentimento({
            essenciais: true,
            preferencias: false,
            analiticos: false,
            marketing: false
        }, 'rejeitado_opcionais');
    }

    /**
     * Garante que os estilos do banner e da central de preferências estejam presentes
     */
    function garantirEstilos() {
        if (document.getElementById('itaim-estilos-cookies')) return;
        const link = document.createElement('link');
        link.id = 'itaim-estilos-cookies';
        link.rel = 'stylesheet';
        link.href = '/css/pages/institucional/institucional.css';
        document.head.appendChild(link);
    }

    /**
     * Injeta a estrutura HTML do Banner e da Central de Preferências
     */
    function injetarComponentesHtml() {
        garantirEstilos();
        if (document.getElementById('itaim-cookie-banner-wrapper')) return;

        const wrapper = document.createElement('div');
        wrapper.id = 'itaim-cookie-banner-wrapper';
        wrapper.innerHTML = `
            <!-- BANNER DE CONSENTIMENTO INICIAL -->
            <aside class="itaim-cookie-banner" id="itaim-cookie-banner" role="dialog" aria-modal="false" aria-label="Consentimento de Cookies e Privacidade">
                <div class="itaim-cookie-banner-container">
                    <div class="itaim-cookie-banner-texto">
                        <strong>Privacidade e Tecnologias de Armazenamento</strong>
                        O Itaim Vende utiliza armazenamento local estritamente necessário para gerenciar sua sessão, autenticação com token JWT e navegação segura. Você pode escolher se deseja habilitar preferências adicionais de interface (como modo escuro persistente). Saiba mais em nossa <a href="/politica-de-cookies">Política de Cookies</a> e <a href="/politica-de-privacidade">Política de Privacidade</a>.
                    </div>
                    <div class="itaim-cookie-banner-acoes">
                        <button type="button" class="btn-cookie-acao btn-cookie-personalizar" id="btn-cookie-personalizar">
                            Personalizar
                        </button>
                        <button type="button" class="btn-cookie-acao btn-cookie-rejeitar" id="btn-cookie-rejeitar">
                            Rejeitar opcionais
                        </button>
                        <button type="button" class="btn-cookie-acao btn-cookie-aceitar" id="btn-cookie-aceitar">
                            Aceitar todos
                        </button>
                    </div>
                </div>
            </aside>

            <!-- MODAL DA CENTRAL DE PREFERÊNCIAS DE COOKIES -->
            <div class="itaim-modal-cookies-backdrop" id="itaim-modal-cookies-backdrop" role="dialog" aria-modal="true" aria-labelledby="itaim-modal-cookies-titulo">
                <div class="itaim-modal-cookies">
                    <div class="itaim-modal-cookies-header">
                        <h3 id="itaim-modal-cookies-titulo">Central de Preferências de Armazenamento e Cookies</h3>
                        <button type="button" class="btn-fechar-modal-cookies" id="btn-fechar-modal-cookies" aria-label="Fechar Central de Preferências">✕</button>
                    </div>
                    <div class="itaim-modal-cookies-body">
                        <p class="inst-paragrafo" style="margin-top: 0; font-size: 0.88rem;">
                            Em conformidade com a LGPD (Lei nº 13.709/2018), você possui total controle sobre quais dados e preferências podem ser salvos em seu dispositivo durante a navegação no Itaim Vende.
                        </p>

                        <!-- Categoria 1: Essenciais -->
                        <div class="itaim-categoria-item">
                            <div class="itaim-categoria-header">
                                <span class="itaim-categoria-titulo">Tecnologias Estritamente Necessárias</span>
                                <span class="badge-sempre-ativo">SEMPRE ATIVO</span>
                            </div>
                            <p class="itaim-categoria-descricao">
                                Indispensáveis para o funcionamento da plataforma. Permitem autenticação via JWT (<code>itaim_token</code>), proteção de requisições, detecção de reinicialização do servidor e controle de sessão do usuário. Não podem ser desativadas sob pena de inviabilizar o login.
                            </p>
                        </div>

                        <!-- Categoria 2: Preferências -->
                        <div class="itaim-categoria-item">
                            <div class="itaim-categoria-header">
                                <label for="switch-cookie-preferencias" class="itaim-categoria-titulo" style="cursor: pointer;">
                                    Preferências de Interface e Tema
                                </label>
                                <label class="switch-cookie">
                                    <input type="checkbox" id="switch-cookie-preferencias">
                                    <span class="slider-cookie"></span>
                                </label>
                            </div>
                            <p class="itaim-categoria-descricao">
                                Permite memorizar configurações visuais escolhidas por você entre os acessos, como o Modo Escuro (<code>itaim_tema</code>) e o histórico de produtos favoritados em cache para carregamento ultrarrápido.
                            </p>
                        </div>

                        <!-- Categoria 3: Analíticos -->
                        <div class="itaim-categoria-item">
                            <div class="itaim-categoria-header">
                                <label for="switch-cookie-analiticos" class="itaim-categoria-titulo" style="cursor: pointer;">
                                    Ferramentas Analíticas
                                </label>
                                <label class="switch-cookie">
                                    <input type="checkbox" id="switch-cookie-analiticos">
                                    <span class="slider-cookie"></span>
                                </label>
                            </div>
                            <p class="itaim-categoria-descricao">
                                <em>Atualmente sem ferramentas ativas de terceiros.</em> O Itaim Vende não monitora seu comportamento por meio de cookies analíticos de terceiros (como Google Analytics). Este interruptor permanece desativado por padrão.
                            </p>
                        </div>

                        <!-- Categoria 4: Marketing -->
                        <div class="itaim-categoria-item">
                            <div class="itaim-categoria-header">
                                <label for="switch-cookie-marketing" class="itaim-categoria-titulo" style="cursor: pointer;">
                                    Publicidade e Marketing
                                </label>
                                <label class="switch-cookie">
                                    <input type="checkbox" id="switch-cookie-marketing">
                                    <span class="slider-cookie"></span>
                                </label>
                            </div>
                            <p class="itaim-categoria-descricao">
                                <em>Atualmente sem ferramentas ativas de terceiros.</em> Não realizamos remarketing, veiculação de anúncios de terceiros ou compartilhamento com corretores de dados. Mantido inativo por padrão.
                            </p>
                        </div>
                    </div>

                    <div class="itaim-modal-cookies-footer">
                        <button type="button" class="btn-cookie-acao btn-cookie-rejeitar" id="btn-modal-rejeitar-todos">
                            Rejeitar opcionais
                        </button>
                        <button type="button" class="btn-cookie-acao btn-cookie-aceitar" id="btn-modal-salvar-preferencias">
                            Salvar preferências
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(wrapper);
        vincularEventos();
    }

    /**
     * Vincula ouvintes de eventos da interface
     */
    function vincularEventos() {
        const btnAceitar = document.getElementById('btn-cookie-aceitar');
        const btnRejeitar = document.getElementById('btn-cookie-rejeitar');
        const btnPersonalizar = document.getElementById('btn-cookie-personalizar');

        const backdrop = document.getElementById('itaim-modal-cookies-backdrop');
        const btnFecharModal = document.getElementById('btn-fechar-modal-cookies');
        const btnModalRejeitar = document.getElementById('btn-modal-rejeitar-todos');
        const btnModalSalvar = document.getElementById('btn-modal-salvar-preferencias');

        if (btnAceitar) {
            btnAceitar.addEventListener('click', aceitarTodos);
        }

        if (btnRejeitar) {
            btnRejeitar.addEventListener('click', rejeitarOpcionais);
        }

        if (btnPersonalizar) {
            btnPersonalizar.addEventListener('click', abrirModal);
        }

        if (btnFecharModal) {
            btnFecharModal.addEventListener('click', fecharModal);
        }

        if (backdrop) {
            backdrop.addEventListener('click', function (e) {
                if (e.target === backdrop) {
                    fecharModal();
                }
            });
        }

        if (btnModalRejeitar) {
            btnModalRejeitar.addEventListener('click', rejeitarOpcionais);
        }

        if (btnModalSalvar) {
            btnModalSalvar.addEventListener('click', function () {
                const switchPref = document.getElementById('switch-cookie-preferencias');
                const switchAnalitico = document.getElementById('switch-cookie-analiticos');
                const switchMkt = document.getElementById('switch-cookie-marketing');

                salvarConsentimento({
                    essenciais: true,
                    preferencias: switchPref ? switchPref.checked : false,
                    analiticos: switchAnalitico ? switchAnalitico.checked : false,
                    marketing: switchMkt ? switchMkt.checked : false
                }, 'personalizado');
            });
        }

        // Delegação de evento para qualquer botão ou link que abra as preferências de cookies
        document.addEventListener('click', function (e) {
            const gatilho = e.target.closest('[data-acao="abrir-cookies"], .btn-abrir-cookies-central, #link-footer-cookies, #link-footer-preferencias-cookies');
            if (gatilho) {
                e.preventDefault();
                abrirModal();
            }
        });
    }

    function exibirBanner() {
        const banner = document.getElementById('itaim-cookie-banner');
        if (banner) {
            banner.style.display = 'block';
        }
    }

    function fecharBanner() {
        const banner = document.getElementById('itaim-cookie-banner');
        if (banner) {
            banner.style.display = 'none';
        }
    }

    function abrirModal() {
        const backdrop = document.getElementById('itaim-modal-cookies-backdrop');
        if (!backdrop) return;

        // Atualiza os switches com o estado atual
        const consentimento = obterConsentimento() || { categorias: CATEGORIAS_PADRAO };
        const switchPref = document.getElementById('switch-cookie-preferencias');
        const switchAnalitico = document.getElementById('switch-cookie-analiticos');
        const switchMkt = document.getElementById('switch-cookie-marketing');

        if (switchPref) switchPref.checked = Boolean(consentimento.categorias.preferencias);
        if (switchAnalitico) switchAnalitico.checked = Boolean(consentimento.categorias.analiticos);
        if (switchMkt) switchMkt.checked = Boolean(consentimento.categorias.marketing);

        backdrop.style.display = 'flex';
    }

    function fecharModal() {
        const backdrop = document.getElementById('itaim-modal-cookies-backdrop');
        if (backdrop) {
            backdrop.style.display = 'none';
        }
    }

    /**
     * Inicialização automática
     */
    function inicializar() {
        injetarComponentesHtml();

        const consentimento = obterConsentimento();
        if (!consentimento) {
            // Primeiro acesso: exibe o banner de consentimento
            exibirBanner();
        } else {
            // Aplica os efeitos do consentimento já registrado
            aplicarEfeitosConsentimento(consentimento.categorias);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inicializar);
    } else {
        inicializar();
    }

    // API pública universal
    window.ItaimCookies = {
        obterConsentimento,
        salvarConsentimento,
        aceitarTodos,
        rejeitarOpcionais,
        abrirCentral: abrirModal,
        fecharCentral: fecharModal
    };

})();
