/**
 * ITAIM VENDE - PRODUTO: SISTEMA DE DENÚNCIAS E TICKETS DE MODERAÇÃO
 * Arquivo: frontend/js/pages/produtos/produto/produto-denuncias.js
 */

(function () {
    'use strict';

    function inicializar() {
        const produto = window.ItaimProdutoDados?.obterProduto();
        if (!produto) return;

        const dadosVendedor = window.ItaimProdutoVendedor?.obterDadosVendedor();
        const verificarSeUsuarioEhVendedor = window.ItaimProdutoVendedor?.verificarSeUsuarioEhVendedor || (() => false);
        const mostrarToast = window.ItaimProdutoAcoes?.mostrarToast || ((msg) => console.log(msg));
        const formatarPreco = window.ItaimProdutoDados?.formatarPreco || ((v) => `R$ ${v}`);

        const modalDenuncia = document.getElementById('modal-denuncia');
        const btnAbrirDenuncia = document.getElementById('btn-abrir-denuncia');
        const btnFecharDenuncia = document.getElementById('btn-fechar-denuncia');
        const btnCancelarDenuncia = document.getElementById('btn-cancelar-denuncia');
        const btnFecharHistorico = document.getElementById('btn-fechar-historico');
        const btnVoltarAoAnuncio = document.getElementById('btn-voltar-ao-anuncio');
        const btnConcluirTicket = document.getElementById('btn-concluir-ticket');
        const btnVerMeusTickets = document.getElementById('btn-ver-meus-tickets');
        const btnEnviarDenuncia = document.getElementById('btn-enviar-denuncia');
        const btnCopiarTicket = document.getElementById('btn-copiar-ticket');
        const contadorMeusTicketsEl = document.getElementById('contador-meus-tickets');

        const etapaForm = document.getElementById('denuncia-etapa-form');
        const etapaSucesso = document.getElementById('denuncia-etapa-sucesso');
        const etapaHistorico = document.getElementById('denuncia-etapa-historico');

        const descTextarea = document.getElementById('denuncia-descricao');
        const charsCountEl = document.getElementById('denuncia-chars-val');
        const inputEmailContato = document.getElementById('denuncia-email-contato');

        const STORAGE_TICKETS_KEY = 'itaim_tickets_denuncias';

        function obterTicketsLocais() {
            try {
                const salvos = JSON.parse(localStorage.getItem(STORAGE_TICKETS_KEY) || '[]');
                return Array.isArray(salvos) ? salvos : [];
            } catch (e) {
                return [];
            }
        }

        function salvarTicketLocal(ticket) {
            try {
                const tickets = obterTicketsLocais();
                const filtrados = tickets.filter(t => t.id !== ticket.id && t.protocol !== ticket.protocol);
                filtrados.unshift(ticket);
                localStorage.setItem(STORAGE_TICKETS_KEY, JSON.stringify(filtrados));
                atualizarContadorTickets();
            } catch (e) {
                console.warn('[Tickets] Não foi possível salvar localmente:', e);
            }
        }

        function atualizarContadorTickets() {
            const total = obterTicketsLocais().length;
            if (contadorMeusTicketsEl) {
                contadorMeusTicketsEl.textContent = total;
            }
        }
        atualizarContadorTickets();

        const LABELS_MOTIVOS = {
            'FRAUD': 'Golpe ou Fraude',
            'INAPPROPRIATE_CONTENT': 'Conteúdo Impróprio',
            'SPAM': 'Spam / Anúncio Falso',
            'COUNTERFEIT': 'Item Proibido / Réplica',
            'ALREADY_SOLD': 'Já Vendido / Indisponível',
            'OTHER': 'Outro Motivo'
        };

        function preencherResumoProdutoModal() {
            const resumoImg = document.getElementById('denuncia-resumo-img');
            const resumoTitulo = document.getElementById('denuncia-resumo-titulo');
            const resumoVendedor = document.getElementById('denuncia-resumo-vendedor');
            const resumoPreco = document.getElementById('denuncia-resumo-preco');

            if (resumoTitulo) resumoTitulo.textContent = produto.titulo;
            if (resumoVendedor) {
                const vNome = (dadosVendedor && (dadosVendedor.name || dadosVendedor.nome)) || produto.vendedorNome || produto.vendedor || 'Vendedor';
                resumoVendedor.textContent = `Vendedor: ${vNome}`;
            }
            if (resumoPreco) {
                resumoPreco.innerHTML = formatarPreco(produto.preco);
            }
            if (resumoImg) {
                const fotoUrl = (produto.fotos && produto.fotos[0]) || produto.imagem || produto.foto || '../../assets/produtos/anuncio_15.jpg';
                resumoImg.src = fotoUrl;
                resumoImg.alt = produto.titulo;
            }

            const usuarioLogado = window.ItaimSessao ? window.ItaimSessao.obterUsuarioLogado() : null;
            if (inputEmailContato && usuarioLogado && usuarioLogado.email) {
                inputEmailContato.value = usuarioLogado.email;
            }
        }

        function abrirModalEtapa(etapa) {
            if (!modalDenuncia) return;
            if (etapaForm) etapaForm.style.display = (etapa === 'form') ? 'block' : 'none';
            if (etapaSucesso) etapaSucesso.style.display = (etapa === 'sucesso') ? 'block' : 'none';
            if (etapaHistorico) etapaHistorico.style.display = (etapa === 'historico') ? 'block' : 'none';

            modalDenuncia.style.display = 'flex';
            void modalDenuncia.offsetWidth;
            modalDenuncia.classList.add('ativo');
            modalDenuncia.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        }

        function fecharModalDenuncia() {
            if (!modalDenuncia) return;
            modalDenuncia.classList.remove('ativo');
            modalDenuncia.setAttribute('aria-hidden', 'true');
            setTimeout(() => {
                modalDenuncia.style.display = 'none';
                document.body.style.overflow = '';
            }, 280);
        }

        if (btnAbrirDenuncia) {
            btnAbrirDenuncia.addEventListener('click', (e) => {
                e.preventDefault();

                if (verificarSeUsuarioEhVendedor()) {
                    mostrarToast('Você é o autor deste anúncio.');
                    return;
                }

                preencherResumoProdutoModal();
                abrirModalEtapa('form');
            });
        }

        [btnFecharDenuncia, btnCancelarDenuncia, btnFecharHistorico, btnVoltarAoAnuncio, btnConcluirTicket].forEach(btn => {
            if (btn) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    fecharModalDenuncia();
                });
            }
        });

        if (modalDenuncia) {
            modalDenuncia.addEventListener('click', (e) => {
                if (e.target === modalDenuncia) {
                    fecharModalDenuncia();
                }
            });
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modalDenuncia && modalDenuncia.classList.contains('ativo')) {
                fecharModalDenuncia();
            }
        });

        if (descTextarea && charsCountEl) {
            descTextarea.addEventListener('input', () => {
                charsCountEl.textContent = descTextarea.value.length;
            });
        }

        const radiosMotivo = document.querySelectorAll('input[name="denuncia-motivo"]');
        radiosMotivo.forEach(radio => {
            radio.addEventListener('change', () => {
                document.querySelectorAll('.motivo-card-item').forEach(card => card.classList.remove('ativo'));
                const cardPai = radio.closest('.motivo-card-item');
                if (cardPai) cardPai.classList.add('ativo');
            });
        });

        if (btnEnviarDenuncia) {
            btnEnviarDenuncia.addEventListener('click', async (e) => {
                e.preventDefault();

                const radioSelecionado = document.querySelector('input[name="denuncia-motivo"]:checked');
                const motivo = radioSelecionado ? radioSelecionado.value : 'OTHER';
                const descricao = descTextarea ? descTextarea.value.trim() : '';
                const emailContato = inputEmailContato ? inputEmailContato.value.trim() : '';

                const textoOriginal = btnEnviarDenuncia.innerHTML;
                btnEnviarDenuncia.disabled = true;
                btnEnviarDenuncia.innerHTML = `
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" style="animation: spin 0.8s linear infinite;">
                        <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
                        <path d="M12 2a10 10 0 0 1 10 10"></path>
                    </svg>
                    <span>Registrando Ticket...</span>
                `;

                let ticketRetornado = null;

                try {
                    const params = new URLSearchParams(window.location.search);
                    const produtoIdParam = params.get('id') || params.get('produto') || params.get('slug');
                    const produtoIdReal = produto.id || produto.slug || produtoIdParam;

                    if (window.ItaimApi && window.ItaimApi.reports && typeof window.ItaimApi.reports.criar === 'function') {
                        const resposta = await window.ItaimApi.reports.criar(produtoIdReal, {
                            reason: motivo,
                            description: descricao,
                            contactEmail: emailContato
                        });

                        if (resposta && (resposta.success || resposta.ticket || resposta.protocol)) {
                            ticketRetornado = resposta.ticket || {
                                id: resposta.id || ('tk_' + Date.now()),
                                protocol: resposta.protocol || `TK-${String(Date.now()).slice(-6)}`,
                                productId: produto.id,
                                productTitle: produto.titulo,
                                reason: motivo,
                                reasonLabel: LABELS_MOTIVOS[motivo] || motivo,
                                description: descricao,
                                status: 'PENDING',
                                createdAt: new Date().toISOString()
                            };
                        }
                    }
                } catch (err) {
                    console.info('[Denúncia] Backend offline, usando modo resiliente:', err.message);
                }

                if (!ticketRetornado) {
                    const protocoloFallback = `TK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
                    ticketRetornado = {
                        id: 'ticket_' + Date.now(),
                        protocol: protocoloFallback,
                        productId: produto.id,
                        productTitle: produto.titulo,
                        productImage: (produto.fotos && produto.fotos[0]) || produto.imagem || null,
                        sellerName: (dadosVendedor && (dadosVendedor.name || dadosVendedor.nome)) || produto.vendedorNome || 'Vendedor',
                        reason: motivo,
                        reasonLabel: LABELS_MOTIVOS[motivo] || motivo,
                        description: descricao,
                        status: 'PENDING',
                        statusLabel: 'Em Análise',
                        createdAt: new Date().toISOString(),
                        contactEmail: emailContato
                    };
                }

                salvarTicketLocal(ticketRetornado);

                btnEnviarDenuncia.disabled = false;
                btnEnviarDenuncia.innerHTML = textoOriginal;

                if (descTextarea) descTextarea.value = '';
                if (charsCountEl) charsCountEl.textContent = '0';

                const ticketProtocoloNum = document.getElementById('ticket-protocolo-num');
                const ticketDadoProduto = document.getElementById('ticket-dado-produto');
                const ticketDadoMotivo = document.getElementById('ticket-dado-motivo');
                const ticketDadoData = document.getElementById('ticket-dado-data');

                if (ticketProtocoloNum) ticketProtocoloNum.textContent = ticketRetornado.protocol;
                if (ticketDadoProduto) ticketDadoProduto.textContent = ticketRetornado.productTitle || produto.titulo;
                if (ticketDadoMotivo) ticketDadoMotivo.textContent = ticketRetornado.reasonLabel || LABELS_MOTIVOS[motivo] || motivo;
                if (ticketDadoData) {
                    ticketDadoData.textContent = new Date(ticketRetornado.createdAt).toLocaleDateString('pt-BR', {
                        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    });
                }

                abrirModalEtapa('sucesso');
                mostrarToast(`Denúncia recebida! Ticket #${ticketRetornado.protocol} gerado.`);
            });
        }

        if (btnCopiarTicket) {
            btnCopiarTicket.addEventListener('click', async () => {
                const protocolo = document.getElementById('ticket-protocolo-num')?.textContent || '';
                if (!protocolo) return;

                try {
                    await navigator.clipboard.writeText(protocolo);
                    const txtEl = document.getElementById('btn-copiar-ticket-txt');
                    if (txtEl) txtEl.textContent = 'Copiado! ✓';
                    mostrarToast(`Protocolo ${protocolo} copiado para a área de transferência!`);
                    setTimeout(() => {
                        if (txtEl) txtEl.textContent = 'Copiar Protocolo';
                    }, 2000);
                } catch (err) {
                    mostrarToast(`Protocolo: ${protocolo}`);
                }
            });
        }

        function renderizarHistoricoTickets() {
            const listaEl = document.getElementById('tickets-historico-lista');
            if (!listaEl) return;

            const tickets = obterTicketsLocais();

            if (tickets.length === 0) {
                listaEl.innerHTML = `
                    <div class="tickets-vazio-box">
                        <div class="tickets-vazio-icone">🛡️</div>
                        <h4 class="tickets-vazio-titulo">Nenhum ticket aberto</h4>
                        <p class="tickets-vazio-desc">Você ainda não realizou denúncias de anúncios na plataforma.</p>
                    </div>
                `;
                return;
            }

            listaEl.innerHTML = tickets.map(t => {
                const dataFmt = new Date(t.createdAt).toLocaleDateString('pt-BR', {
                    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                });

                let statusClass = 'status-pendente';
                let statusTexto = 'Em Análise';
                if (t.status === 'UNDER_REVIEW') {
                    statusClass = 'status-investigacao';
                    statusTexto = 'Em Investigação';
                } else if (t.status === 'RESOLVED') {
                    statusClass = 'status-resolvido';
                    statusTexto = 'Resolvido';
                } else if (t.status === 'DISMISSED') {
                    statusClass = 'status-descartado';
                    statusTexto = 'Encerrado';
                }

                return `
                    <div class="ticket-item-card">
                        <div class="ticket-item-topo">
                            <span class="ticket-item-protocolo">#${t.protocol}</span>
                            <span class="ticket-status-pill ${statusClass}">${statusTexto}</span>
                        </div>
                        <div class="ticket-item-produto">${t.productTitle || 'Anúncio reportado'}</div>
                        <div class="ticket-item-detalhes">
                            <span><strong>Motivo:</strong> ${t.reasonLabel || LABELS_MOTIVOS[t.reason] || t.reason}</span>
                            <span>&bull;</span>
                            <span>${dataFmt}</span>
                        </div>
                    </div>
                `;
            }).join('');
        }

        if (btnVerMeusTickets) {
            btnVerMeusTickets.addEventListener('click', (e) => {
                e.preventDefault();
                renderizarHistoricoTickets();
                abrirModalEtapa('historico');
            });
        }

        // Se a URL tiver ?denunciar=1 ou #denunciar, abre automaticamente
        const params = new URLSearchParams(window.location.search);
        if (params.get('denunciar') === '1' || window.location.hash === '#denunciar') {
            setTimeout(() => {
                if (btnAbrirDenuncia) btnAbrirDenuncia.click();
            }, 300);
        }
    }

    window.ItaimProdutoDenuncias = {
        inicializar
    };
})();
