/**
 * ITAIM VENDE - COMPONENTE GLOBAL DE DROPDOWNS CUSTOMIZADOS
 * Arquivo: frontend/js/core/sessao/sessao-dropdown.js
 * 
 * Cria e gerencia dropdowns customizados com design moderno e consistente em todo o site.
 * O botão mantém o estilo pílula e o painel de opções suspenso possui cantos bem arredondados.
 * Totalmente sincronizado bidirecionalmente com os elementos <select> nativos subjacentes.
 */

(function (window, document) {
    'use strict';

    const ItaimDropdown = {
        // Seletor dos selects que devem ser automaticamente customizados
        seletorAlvos: 'select.select-filtro, select.vendedor-select-ordem, select.cfg-select, select.custom-dropdown',

        instancias: new WeakMap(),

        /**
         * Inicializa o sistema de dropdowns padronizados
         */
        inicializar: function () {
            this.converterTodos();

            // Fecha dropdowns ao clicar fora
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.itaim-dropdown-container')) {
                    this.fecharTodos();
                }
            });

            // Fecha dropdown ao pressionar ESC
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' || e.key === 'Esc') {
                    this.fecharTodos();
                }
            });

            // Observador para detectar novos selects injetados dinamicamente no DOM
            this.iniciarObservadorDom();
        },

        /**
         * Fecha todos os dropdowns abertos no documento
         */
        fecharTodos: function () {
            document.querySelectorAll('.itaim-dropdown-container.aberto').forEach((container) => {
                container.classList.remove('aberto');
                const btn = container.querySelector('.itaim-dropdown-gatilho');
                if (btn) btn.setAttribute('aria-expanded', 'false');
            });
        },

        /**
         * Converte todos os selects correspondentes no documento
         */
        converterTodos: function () {
            const selects = document.querySelectorAll(this.seletorAlvos);
            selects.forEach((select) => this.converterSelect(select));
        },

        /**
         * Converte um único elemento <select> nativo em um dropdown customizado padronizado
         */
        converterSelect: function (select) {
            if (!select || !(select instanceof HTMLSelectElement)) return;
            if (this.instancias.has(select)) return; // Já foi convertido

            // Cria o container do dropdown customizado
            const container = document.createElement('div');
            container.className = 'itaim-dropdown-container';
            if (select.id) container.setAttribute('data-origem-id', select.id);
            if (select.disabled) container.classList.add('desabilitado');

            // Botão Gatilho (Estilo Pílula com o texto e a seta verde)
            const btnGatilho = document.createElement('button');
            btnGatilho.type = 'button';
            btnGatilho.className = 'itaim-dropdown-gatilho';
            btnGatilho.setAttribute('aria-haspopup', 'listbox');
            btnGatilho.setAttribute('aria-expanded', 'false');
            if (select.getAttribute('aria-label')) {
                btnGatilho.setAttribute('aria-label', select.getAttribute('aria-label'));
            }

            const rotuloTexto = document.createElement('span');
            rotuloTexto.className = 'itaim-dropdown-rotulo';

            const iconeSeta = document.createElement('span');
            iconeSeta.className = 'itaim-dropdown-seta';
            iconeSeta.innerHTML = `
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
            `;

            btnGatilho.appendChild(rotuloTexto);
            btnGatilho.appendChild(iconeSeta);
            container.appendChild(btnGatilho);

            // Painel Flutuante com Cantos Bem Arredondados
            const painel = document.createElement('div');
            painel.className = 'itaim-dropdown-painel';
            painel.setAttribute('role', 'listbox');

            const lista = document.createElement('ul');
            lista.className = 'itaim-dropdown-lista';
            painel.appendChild(lista);
            container.appendChild(painel);

            // Função para reconstruir as opções do menu conforme os <option> do select
            const reconstruirOpcoes = () => {
                lista.innerHTML = '';
                const opcoes = Array.from(select.options);
                const valorAtual = select.value;

                let textoSelecionado = '';

                opcoes.forEach((opt) => {
                    const li = document.createElement('li');
                    li.className = 'itaim-dropdown-opcao';
                    li.setAttribute('role', 'option');
                    li.setAttribute('data-value', opt.value);

                    const isSelected = opt.value === valorAtual;
                    if (isSelected) {
                        li.classList.add('selecionada');
                        li.setAttribute('aria-selected', 'true');
                        textoSelecionado = opt.text;
                    }

                    const spanTexto = document.createElement('span');
                    spanTexto.textContent = opt.text;
                    li.appendChild(spanTexto);

                    const checkmark = document.createElement('span');
                    checkmark.className = 'itaim-dropdown-check';
                    checkmark.innerHTML = `
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    `;
                    li.appendChild(checkmark);

                    // Evento de clique na opção
                    li.addEventListener('click', (e) => {
                        e.stopPropagation();
                        if (select.disabled) return;

                        const novoValor = opt.value;
                        if (select.value !== novoValor) {
                            select.value = novoValor;
                            // Dispara evento 'change' no select nativo para que os filtros da página reajam normalmente
                            select.dispatchEvent(new Event('change', { bubbles: true }));
                        }

                        // Atualiza visual
                        lista.querySelectorAll('.itaim-dropdown-opcao').forEach((item) => {
                            item.classList.remove('selecionada');
                            item.removeAttribute('aria-selected');
                        });
                        li.classList.add('selecionada');
                        li.setAttribute('aria-selected', 'true');
                        rotuloTexto.textContent = opt.text;

                        // Fecha o dropdown
                        container.classList.remove('aberto');
                        btnGatilho.setAttribute('aria-expanded', 'false');
                    });

                    lista.appendChild(li);
                });

                if (!textoSelecionado && select.selectedOptions && select.selectedOptions[0]) {
                    textoSelecionado = select.selectedOptions[0].text;
                }
                rotuloTexto.textContent = textoSelecionado || (opcoes[0] ? opcoes[0].text : '');
                container.classList.toggle('desabilitado', select.disabled);
            };

            reconstruirOpcoes();

            // Toggle de abertura no botão
            btnGatilho.addEventListener('click', (e) => {
                e.stopPropagation();
                if (select.disabled) return;

                const estavaAberto = container.classList.contains('aberto');
                ItaimDropdown.fecharTodos();

                if (!estavaAberto) {
                    container.classList.add('aberto');
                    btnGatilho.setAttribute('aria-expanded', 'true');
                }
            });

            // Sincronização quando o select for alterado por código externo (ex: reset de filtros)
            select.addEventListener('change', () => {
                const valor = select.value;
                lista.querySelectorAll('.itaim-dropdown-opcao').forEach((item) => {
                    const match = item.getAttribute('data-value') === valor;
                    item.classList.toggle('selecionada', match);
                    if (match) {
                        rotuloTexto.textContent = item.querySelector('span')?.textContent || '';
                    }
                });
            });

            // MutationObserver no select nativo para atualizar opções ou estado disabled dinamicamente
            const observer = new MutationObserver(() => {
                reconstruirOpcoes();
            });

            observer.observe(select, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['disabled']
            });

            // Insere o dropdown customizado imediatamente após o select nativo e oculta o select
            select.classList.add('itaim-select-oculto');
            select.parentNode.insertBefore(container, select.nextSibling);

            // Registra a instância
            this.instancias.set(select, { container, observer, reconstruirOpcoes });
        },

        /**
         * Observa inclusão dinâmica de selects
         */
        iniciarObservadorDom: function () {
            const bodyObserver = new MutationObserver((mutations) => {
                let precisaRevisar = false;
                for (const m of mutations) {
                    if (m.addedNodes.length > 0) {
                        precisaRevisar = true;
                        break;
                    }
                }
                if (precisaRevisar) {
                    this.converterTodos();
                }
            });

            if (document.body) {
                bodyObserver.observe(document.body, { childList: true, subtree: true });
            }
        }
    };

    // Exporta globalmente
    window.ItaimDropdown = ItaimDropdown;

    // Inicializa assim que o DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => ItaimDropdown.inicializar());
    } else {
        ItaimDropdown.inicializar();
    }

})(window, document);
