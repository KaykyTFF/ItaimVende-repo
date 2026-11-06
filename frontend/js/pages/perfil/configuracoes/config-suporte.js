/**
 * ITAIM VENDE - CONFIGURAÇÕES: MÓDULO DE SUPORTE (TICKETS)
 * Arquivo: frontend/js/pages/perfil/configuracoes/config-suporte.js
 *
 * Funcionalidades:
 *  - Abertura de tickets com título, categoria, descrição e anexos
 *  - Listagem e filtragem dos tickets do usuário por status
 *  - Atualização e visualização de detalhes de ticket
 */

(function () {
    'use strict';

    // ─── Estado local ────────────────────────────────────────────────
    let anexosSelecionados = [];
    let filtroAtual = 'todos';
    let ticketsCache = [];

    // ─── Utilitário: toast ────────────────────────────────────────────
    function toast(msg, tipo) {
        if (window.ItaimConfigUtils?.toast) {
            window.ItaimConfigUtils.toast(msg, tipo);
            return;
        }
        const el = document.getElementById('cfg-toast');
        if (!el) return;
        el.textContent = msg;
        el.className = 'cfg-toast cfg-toast-' + (tipo || 'sucesso') + ' visivel';
        clearTimeout(el._timer);
        el._timer = setTimeout(() => el.classList.remove('visivel'), 3500);
    }

    // ─── Contador de caracteres na descrição ─────────────────────────
    function iniciarContadorDescricao() {
        const textarea = document.getElementById('ticket-descricao');
        const contador = document.getElementById('contador-ticket-desc');
        if (!textarea || !contador) return;

        textarea.addEventListener('input', function () {
            contador.textContent = this.value.length + '/1000';
        });
    }

    // ─── Upload de anexos ─────────────────────────────────────────────
    function iniciarUploadAnexos() {
        const input = document.getElementById('ticket-anexos');
        const lista = document.getElementById('lista-anexos-ticket');
        if (!input || !lista) return;

        input.addEventListener('change', function () {
            const novos = Array.from(this.files);
            const restantes = 3 - anexosSelecionados.length;
            if (novos.length > restantes) {
                toast('Máximo de 3 arquivos por ticket.', 'erro');
                this.value = '';
                return;
            }
            novos.forEach(f => anexosSelecionados.push(f));
            this.value = '';
            renderAnexos(lista);
        });

        // Drag and drop
        const area = document.getElementById('suporte-upload-area');
        if (area) {
            area.addEventListener('dragover', e => { e.preventDefault(); area.classList.add('dragover'); });
            area.addEventListener('dragleave', () => area.classList.remove('dragover'));
            area.addEventListener('drop', e => {
                e.preventDefault();
                area.classList.remove('dragover');
                const restantes = 3 - anexosSelecionados.length;
                Array.from(e.dataTransfer.files).slice(0, restantes).forEach(f => anexosSelecionados.push(f));
                renderAnexos(lista);
            });
        }
    }

    function renderAnexos(lista) {
        lista.innerHTML = '';
        anexosSelecionados.forEach((f, i) => {
            const item = document.createElement('div');
            item.className = 'cfg-suporte-anexo-item';
            item.innerHTML = `
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
                <span class="cfg-suporte-anexo-nome">${f.name}</span>
                <button type="button" class="cfg-suporte-anexo-remover" aria-label="Remover ${f.name}" data-idx="${i}">&times;</button>
            `;
            lista.appendChild(item);
        });

        lista.querySelectorAll('.cfg-suporte-anexo-remover').forEach(btn => {
            btn.addEventListener('click', function () {
                const idx = parseInt(this.dataset.idx, 10);
                anexosSelecionados.splice(idx, 1);
                renderAnexos(lista);
            });
        });
    }

    // ─── Validação do formulário ──────────────────────────────────────
    function validarFormTicket() {
        let valido = true;

        const categoria = document.getElementById('ticket-categoria');
        const erroCat = document.getElementById('erro-ticket-categoria');
        if (!categoria.value) {
            erroCat.textContent = 'Selecione uma categoria.';
            categoria.classList.add('invalido');
            valido = false;
        } else {
            erroCat.textContent = '';
            categoria.classList.remove('invalido');
        }

        const titulo = document.getElementById('ticket-titulo');
        const erroTitulo = document.getElementById('erro-ticket-titulo');
        if (!titulo.value.trim() || titulo.value.trim().length < 5) {
            erroTitulo.textContent = 'O título deve ter pelo menos 5 caracteres.';
            titulo.classList.add('invalido');
            valido = false;
        } else {
            erroTitulo.textContent = '';
            titulo.classList.remove('invalido');
        }

        const desc = document.getElementById('ticket-descricao');
        const erroDesc = document.getElementById('erro-ticket-descricao');
        if (!desc.value.trim() || desc.value.trim().length < 15) {
            erroDesc.textContent = 'Descreva o problema com pelo menos 15 caracteres.';
            desc.classList.add('invalido');
            valido = false;
        } else {
            erroDesc.textContent = '';
            desc.classList.remove('invalido');
        }

        return valido;
    }

    // ─── Envio do ticket ─────────────────────────────────────────────
    function iniciarFormTicket() {
        const form = document.getElementById('form-ticket');
        const btnEnviar = document.getElementById('btn-enviar-ticket');
        if (!form) return;

        form.addEventListener('submit', async function (e) {
            e.preventDefault();
            if (!validarFormTicket()) return;

            const payload = {
                categoria: document.getElementById('ticket-categoria').value,
                titulo: document.getElementById('ticket-titulo').value.trim(),
                descricao: document.getElementById('ticket-descricao').value.trim(),
            };

            btnEnviar.disabled = true;
            const textoOriginal = btnEnviar.innerHTML;
            btnEnviar.innerHTML = `
                <svg class="cfg-spin" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                Enviando...
            `;

            try {
                const api = window.ItaimAPI;
                let resposta;
                if (api) {
                    const formData = new FormData();
                    Object.entries(payload).forEach(([k, v]) => formData.append(k, v));
                    anexosSelecionados.forEach(f => formData.append('anexos', f));
                    resposta = await api.post('/suporte/tickets', formData, { isFormData: true });
                } else {
                    // Simulação offline (dev)
                    await new Promise(r => setTimeout(r, 1000));
                    resposta = {
                        ok: true,
                        dados: {
                            id: 'TKT-' + Date.now().toString(36).toUpperCase(),
                            ...payload,
                            status: 'aberto',
                            criadoEm: new Date().toISOString()
                        }
                    };
                }

                if (resposta?.ok || resposta?.dados) {
                    toast('Ticket enviado com sucesso! Em breve nossa equipe entrará em contato.', 'sucesso');
                    form.reset();
                    document.getElementById('contador-ticket-desc').textContent = '0/1000';
                    anexosSelecionados = [];
                    renderAnexos(document.getElementById('lista-anexos-ticket'));

                    // Adiciona o ticket simulado no topo da lista (se offline)
                    if (resposta.dados) {
                        ticketsCache.unshift(resposta.dados);
                        renderTickets(filtroAtual);
                    } else {
                        await carregarTickets();
                    }
                } else {
                    throw new Error(resposta?.mensagem || 'Erro ao enviar ticket.');
                }
            } catch (err) {
                toast(err.message || 'Não foi possível enviar o ticket. Tente novamente.', 'erro');
            } finally {
                btnEnviar.disabled = false;
                btnEnviar.innerHTML = textoOriginal;
            }
        });
    }

    // ─── Renderização dos tickets ─────────────────────────────────────
    const LABELS_STATUS = {
        aberto: { texto: 'Aberto', cor: 'azul' },
        em_andamento: { texto: 'Em andamento', cor: 'amarelo' },
        resolvido: { texto: 'Resolvido', cor: 'verde' },
        fechado: { texto: 'Fechado', cor: 'cinza' },
    };

    const LABELS_CATEGORIA = {
        conta: 'Conta e acesso',
        anuncio: 'Anúncio',
        pagamento: 'Pagamento',
        seguranca: 'Segurança',
        bug: 'Erro técnico / Bug',
        outro: 'Outro',
    };

    function formatarData(iso) {
        if (!iso) return '—';
        const d = new Date(iso);
        return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) +
            ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }

    function renderTickets(filtro) {
        const lista = document.getElementById('lista-tickets-suporte');
        if (!lista) return;

        const filtrados = filtro === 'todos'
            ? ticketsCache
            : ticketsCache.filter(t => t.status === filtro);

        if (filtrados.length === 0) {
            lista.innerHTML = `
                <div class="cfg-vazio">
                    <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 8px; opacity: 0.4;"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                    <p>${filtro === 'todos' ? 'Nenhum ticket aberto ainda.' : 'Nenhum ticket com esse status.'}</p>
                </div>
            `;
            return;
        }

        lista.innerHTML = filtrados.map(t => {
            const st = LABELS_STATUS[t.status] || { texto: t.status, cor: 'cinza' };
            const cat = LABELS_CATEGORIA[t.categoria] || t.categoria || '—';
            return `
                <div class="cfg-suporte-ticket-item">
                    <div class="cfg-suporte-ticket-topo">
                        <span class="cfg-suporte-ticket-id">#${t.id || '—'}</span>
                        <span class="cfg-suporte-badge cfg-suporte-badge-${st.cor}">${st.texto}</span>
                    </div>
                    <p class="cfg-suporte-ticket-titulo">${escapeHtml(t.titulo || '—')}</p>
                    <p class="cfg-suporte-ticket-desc">${escapeHtml((t.descricao || '').substring(0, 120))}${(t.descricao || '').length > 120 ? '…' : ''}</p>
                    <div class="cfg-suporte-ticket-meta">
                        <span>${cat}</span>
                        <span>${formatarData(t.criadoEm)}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    // ─── Carregamento dos tickets da API ─────────────────────────────
    async function carregarTickets() {
        const lista = document.getElementById('lista-tickets-suporte');
        if (!lista) return;

        lista.innerHTML = `
            <div class="cfg-suporte-ticket-skeleton" aria-hidden="true">
                <div class="skeleton-line" style="width:55%;height:16px;border-radius:4px;"></div>
                <div class="skeleton-line" style="width:85%;height:13px;margin-top:8px;border-radius:4px;"></div>
                <div class="skeleton-line" style="width:40%;height:13px;margin-top:6px;border-radius:4px;"></div>
            </div>
        `;

        try {
            const api = window.ItaimAPI;
            if (api) {
                const resp = await api.get('/suporte/tickets');
                ticketsCache = Array.isArray(resp?.dados) ? resp.dados : [];
            } else {
                // Dados mockados para desenvolvimento
                await new Promise(r => setTimeout(r, 600));
                ticketsCache = [
                    {
                        id: 'TKT-ABC12',
                        categoria: 'bug',
                        titulo: 'Foto do anúncio não carrega',
                        descricao: 'Ao tentar visualizar a foto do meu anúncio de bicicleta, ela não aparece na listagem.',
                        status: 'em_andamento',
                        criadoEm: new Date(Date.now() - 86400000 * 2).toISOString()
                    },
                    {
                        id: 'TKT-XYZ99',
                        categoria: 'conta',
                        titulo: 'Não consigo redefinir minha senha',
                        descricao: 'O link de redefinição de senha não está chegando no meu e-mail.',
                        status: 'resolvido',
                        criadoEm: new Date(Date.now() - 86400000 * 10).toISOString()
                    }
                ];
            }
        } catch {
            ticketsCache = [];
            toast('Não foi possível carregar seus tickets.', 'erro');
        }

        renderTickets(filtroAtual);
    }

    // ─── Filtros de status ────────────────────────────────────────────
    function iniciarFiltros() {
        const container = document.getElementById('suporte-filtros');
        if (!container) return;

        container.querySelectorAll('.cfg-suporte-filtro-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                container.querySelectorAll('.cfg-suporte-filtro-btn').forEach(b => b.classList.remove('ativo'));
                this.classList.add('ativo');
                filtroAtual = this.dataset.status;
                renderTickets(filtroAtual);
            });
        });
    }

    // ─── Botão atualizar ─────────────────────────────────────────────
    function iniciarBotaoAtualizar() {
        const btn = document.getElementById('btn-atualizar-tickets');
        if (!btn) return;
        btn.addEventListener('click', async () => {
            btn.disabled = true;
            await carregarTickets();
            btn.disabled = false;
        });
    }

    // ─── Carrega quando o painel de suporte é aberto ──────────────────
    function observarAberturaDoSuporte() {
        // Carrega quando a aba Suporte for clicada
        document.querySelectorAll('.cfg-nav-item[data-alvo="suporte"]').forEach(btn => {
            btn.addEventListener('click', () => {
                if (ticketsCache.length === 0) carregarTickets();
            });
        });

        // Carrega se a página já abrir no painel suporte (hash na URL)
        if (location.hash === '#suporte') carregarTickets();
    }

    // ─── Inicialização ────────────────────────────────────────────────
    function inicializar() {
        iniciarContadorDescricao();
        iniciarUploadAnexos();
        iniciarFormTicket();
        iniciarFiltros();
        iniciarBotaoAtualizar();
        observarAberturaDoSuporte();
    }

    window.ItaimConfigSuporte = { inicializar };
})();

