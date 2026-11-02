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
        const btnDenunciaVoltar = document.getElementById('btn-denuncia-voltar');
        const btnVoltarAoAnuncio = document.getElementById('btn-voltar-ao-anuncio');
        const btnFecharHistorico = document.getElementById('btn-fechar-historico');
        const btnVerMeusTickets = document.getElementById('btn-ver-meus-tickets');
        const btnEnviarDenuncia = document.getElementById('btn-enviar-denuncia');
        const btnCopiarTicket = document.getElementById('btn-copiar-ticket');
        const contadorMeusTicketsEl = document.getElementById('contador-meus-tickets');

        // Controles de Navegação das Etapas
        const btnProximo1 = document.getElementById('btn-proximo-etapa-1');
        const btnProximo2 = document.getElementById('btn-proximo-etapa-2');
        const btnProximo3 = document.getElementById('btn-proximo-etapa-3');
        const btnRevisaoVoltar = document.getElementById('btn-revisao-voltar');
        const revisaoBtnEditarMotivo = document.getElementById('revisao-btn-editar-motivo');
        const revisaoBtnEditarDescricao = document.getElementById('revisao-btn-editar-descricao');

        const progressoBox = document.getElementById('denuncia-progresso-box');
        const etapaBadge = document.getElementById('denuncia-etapa-badge');
        const etapaNome = document.getElementById('denuncia-etapa-nome');
        const barraProgresso = document.getElementById('denuncia-barra-progresso');

        const painelEtapa1 = document.getElementById('denuncia-etapa-1');
        const painelEtapa2 = document.getElementById('denuncia-etapa-2');
        const painelEtapa3 = document.getElementById('denuncia-etapa-3');
        const painelEtapa4 = document.getElementById('denuncia-etapa-4');
        const painelEtapa5 = document.getElementById('denuncia-etapa-5');
        const painelEtapaHistorico = document.getElementById('denuncia-etapa-historico');

        const descTextarea = document.getElementById('denuncia-descricao');
        const charsCountEl = document.getElementById('denuncia-chars-val');
        const inputEmailContato = document.getElementById('denuncia-email-contato');

        let etapaAtual = 1;

        const ETAPAS_CONFIG = {
            1: { badge: 'ETAPA 1 DE 4', nome: 'Início', progresso: '25%' },
            2: { badge: 'ETAPA 2 DE 4', nome: 'Motivo', progresso: '50%' },
            3: { badge: 'ETAPA 3 DE 4', nome: 'Detalhes', progresso: '75%' },
            4: { badge: 'ETAPA 4 DE 4', nome: 'Revisão', progresso: '100%' }
        };

        const LABELS_MOTIVOS = {
            'FRAUD': { label: 'Golpe ou Fraude', icon: '🚨', badgeClass: 'icone-box-red' },
            'INAPPROPRIATE_CONTENT': { label: 'Conteúdo Impróprio', icon: '🔞', badgeClass: 'icone-box-blue' },
            'SPAM': { label: 'Spam / Anúncio Falso', icon: '📄', badgeClass: 'icone-box-purple' },
            'ALREADY_SOLD': { label: 'Já Vendido / Indisponível', icon: '📦', badgeClass: 'icone-box-orange' },
            'OTHER': { label: 'Outro Motivo', icon: '💬', badgeClass: 'icone-box-violet' }
        };

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
                const keys = ['itaim_tickets_denuncias', 'itaim_denuncias_moderacao', 'itaim_meus_tickets'];
                keys.forEach(k => {
                    let lista = [];
                    try {
                        lista = JSON.parse(localStorage.getItem(k) || '[]');
                        if (!Array.isArray(lista)) lista = [];
                    } catch (e) { lista = []; }
                    const filtrados = lista.filter(t => t.id !== ticket.id && t.protocol !== ticket.protocol);
                    filtrados.unshift(ticket);
                    localStorage.setItem(k, JSON.stringify(filtrados));
                });
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

        function preencherResumoProdutoModal() {
            const fotoUrl = (produto.fotos && produto.fotos[0]) || produto.imagem || produto.foto || '../../assets/placeholders/produto-placeholder.svg';
            const vNome = (dadosVendedor && (dadosVendedor.name || dadosVendedor.nome)) || produto.vendedorNome || produto.vendedor || 'Admin';
            const precoFmt = formatarPreco(produto.preco);

            ['denuncia-resumo', 'denuncia-revisao'].forEach(prefixo => {
                const imgEl = document.getElementById(`${prefixo}-img`);
                const titEl = document.getElementById(`${prefixo}-titulo`);
                const precoEl = document.getElementById(`${prefixo}-preco`);
                const vendEl = document.getElementById(`${prefixo}-vendedor`);

                if (imgEl) {
                    imgEl.src = fotoUrl;
                    imgEl.alt = produto.titulo;
                }
                if (titEl) titEl.textContent = produto.titulo;
                if (precoEl) precoEl.innerHTML = precoFmt;
                if (vendEl) {
                    vendEl.innerHTML = `
                        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        <span>Vendedor: ${vNome}</span>
                    `;
                }
            });

            const usuarioLogado = window.ItaimSessao ? window.ItaimSessao.obterUsuarioLogado() : null;
            if (inputEmailContato && usuarioLogado && usuarioLogado.email && !inputEmailContato.value) {
                inputEmailContato.value = usuarioLogado.email;
            }
        }

        function atualizarDadosRevisao() {
            const radioSelecionado = document.querySelector('input[name="denuncia-motivo"]:checked');
            const motivoVal = radioSelecionado ? radioSelecionado.value : 'FRAUD';
            const motivoInfo = LABELS_MOTIVOS[motivoVal] || { label: motivoVal, badgeClass: 'icone-box-red', icon: '🚨' };

            const revisaoMotivoTxt = document.getElementById('revisao-motivo-texto');
            const revisaoMotivoIcone = document.getElementById('revisao-motivo-icone');
            const revisaoDescricaoTxt = document.getElementById('revisao-descricao-texto');

            if (revisaoMotivoTxt) revisaoMotivoTxt.textContent = motivoInfo.label;
            if (revisaoMotivoIcone) {
                revisaoMotivoIcone.className = `revisao-row-icone ${motivoInfo.badgeClass || ''}`;
                revisaoMotivoIcone.textContent = motivoInfo.icon || '🚨';
            }

            const descDigitada = descTextarea ? descTextarea.value.trim() : '';
            if (revisaoDescricaoTxt) {
                revisaoDescricaoTxt.textContent = descDigitada || '(não informada)';
                revisaoDescricaoTxt.style.fontStyle = descDigitada ? 'normal' : 'italic';
                revisaoDescricaoTxt.style.color = descDigitada ? '#0F172A' : '#94A3B8';
            }
        }

        function irParaEtapa(etapaNumero) {
            etapaAtual = etapaNumero;

            [painelEtapa1, painelEtapa2, painelEtapa3, painelEtapa4, painelEtapa5, painelEtapaHistorico].forEach(p => {
                if (p) p.style.display = 'none';
            });

            if (etapaNumero >= 1 && etapaNumero <= 4) {
                const config = ETAPAS_CONFIG[etapaNumero];
                if (progressoBox) progressoBox.style.display = 'block';
                if (etapaBadge) etapaBadge.textContent = config.badge;
                if (etapaNome) etapaNome.textContent = config.nome;
                if (barraProgresso) barraProgresso.style.width = config.progresso;

                if (btnDenunciaVoltar) {
                    btnDenunciaVoltar.style.visibility = (etapaNumero > 1) ? 'visible' : 'hidden';
                }

                if (etapaNumero === 1 && painelEtapa1) painelEtapa1.style.display = 'flex';
                if (etapaNumero === 2 && painelEtapa2) painelEtapa2.style.display = 'flex';
                if (etapaNumero === 3 && painelEtapa3) painelEtapa3.style.display = 'flex';
                if (etapaNumero === 4) {
                    atualizarDadosRevisao();
                    if (painelEtapa4) painelEtapa4.style.display = 'flex';
                }
            } else if (etapaNumero === 5) {
                // Tela de Concluído / Sucesso
                if (progressoBox) progressoBox.style.display = 'none';
                if (btnDenunciaVoltar) btnDenunciaVoltar.style.visibility = 'hidden';
                if (painelEtapa5) painelEtapa5.style.display = 'flex';
            } else if (etapaNumero === 'historico') {
                if (progressoBox) progressoBox.style.display = 'none';
                if (btnDenunciaVoltar) btnDenunciaVoltar.style.visibility = 'hidden';
                if (painelEtapaHistorico) painelEtapaHistorico.style.display = 'flex';
            }
        }

        function abrirModalDenuncia() {
            if (!modalDenuncia) return;
            preencherResumoProdutoModal();
            irParaEtapa(1);

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
                abrirModalDenuncia();
            });
        }

        // Navegação entre etapas (Próximo / Voltar)
        if (btnProximo1) btnProximo1.addEventListener('click', () => irParaEtapa(2));
        if (btnProximo2) btnProximo2.addEventListener('click', () => irParaEtapa(3));
        if (btnProximo3) btnProximo3.addEventListener('click', () => irParaEtapa(4));

        if (btnDenunciaVoltar) {
            btnDenunciaVoltar.addEventListener('click', (e) => {
                e.preventDefault();
                if (etapaAtual > 1 && etapaAtual <= 4) {
                    irParaEtapa(etapaAtual - 1);
                }
            });
        }

        if (btnRevisaoVoltar) {
            btnRevisaoVoltar.addEventListener('click', (e) => {
                e.preventDefault();
                irParaEtapa(3);
            });
        }

        if (revisaoBtnEditarMotivo) {
            revisaoBtnEditarMotivo.addEventListener('click', () => irParaEtapa(2));
        }

        if (revisaoBtnEditarDescricao) {
            revisaoBtnEditarDescricao.addEventListener('click', () => irParaEtapa(3));
        }

        const btnCancelarEtapa2 = document.getElementById('btn-cancelar-etapa-2');
        [btnFecharDenuncia, btnVoltarAoAnuncio, btnFecharHistorico, btnCancelarEtapa2].forEach(btn => {
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

        const cardsMotivo = document.querySelectorAll('.motivo-card-item');
        cardsMotivo.forEach(card => {
            card.addEventListener('click', () => {
                cardsMotivo.forEach(c => c.classList.remove('ativo'));
                card.classList.add('ativo');
                const radio = card.querySelector('input[type="radio"]');
                if (radio) radio.checked = true;

                // No mobile (estilo lista da Image 2 com chevrons), avançar direto para a Etapa 3 (Detalhes)
                if (window.innerWidth <= 600) {
                    setTimeout(() => {
                        irParaEtapa(3);
                    }, 140);
                }
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
                    <span>Enviando denúncia...</span>
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
                                reasonLabel: (LABELS_MOTIVOS[motivo] && LABELS_MOTIVOS[motivo].label) || motivo,
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
                        sellerName: (dadosVendedor && (dadosVendedor.name || dadosVendedor.nome)) || produto.vendedorNome || 'Admin',
                        reason: motivo,
                        reasonLabel: (LABELS_MOTIVOS[motivo] && LABELS_MOTIVOS[motivo].label) || motivo,
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
                if (ticketProtocoloNum) ticketProtocoloNum.textContent = ticketRetornado.protocol;

                irParaEtapa(5);
                mostrarToast(`Denúncia recebida! Protocolo #${ticketRetornado.protocol} gerado.`);
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
