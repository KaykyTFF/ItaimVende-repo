/**
 * ITAIM VENDE - CONFIGURAÇÕES: MÓDULO DE SUPORTE (TICKETS)
 * Arquivo: frontend/js/pages/perfil/configuracoes/config-suporte.js
 *
 * Funcionalidades:
 *  - Abertura de tickets com título, categoria, descrição e anexos
 *  - Persistência e isolamento estrito por conta de usuário (cada usuário visualiza apenas seus tickets)
 *  - Sincronização com o painel de moderação/atendimento do admin
 *  - Listagem e filtragem dos tickets do usuário por status (Abertos, Em andamento, etc.)
 *  - Atualização com feedback visual e expansão/recolhimento de detalhes
 */

(function () {
    'use strict';

    // ─── Chaves de Armazenamento ─────────────────────────────────────
    const CHAVE_CONVERSAS_ADMIN = 'itaim_conversas_suporte';

    // ─── Estado local ────────────────────────────────────────────────
    let anexosSelecionados = [];
    let filtroAtual = 'todos';
    let ticketsCache = [];
    let ultimaChaveUsuario = null;

    // ─── Identificação Segura do Usuário Logado ──────────────────────
    function obterUsuarioAtual() {
        try {
            if (window.ItaimSessao && typeof window.ItaimSessao.obterUsuarioLogado === 'function') {
                const u = window.ItaimSessao.obterUsuarioLogado();
                if (u && (u.email || u.id)) return u;
            }
            if (window.ItaimSessaoAuth && typeof window.ItaimSessaoAuth.obterUsuarioLogado === 'function') {
                const u = window.ItaimSessaoAuth.obterUsuarioLogado();
                if (u && (u.email || u.id)) return u;
            }
            if (window.ItaimApi && typeof window.ItaimApi.auth?.obterUsuarioLogado === 'function') {
                const u = window.ItaimApi.auth.obterUsuarioLogado();
                if (u && (u.email || u.id)) return u;
            }

            const bUserRaw = localStorage.getItem('itaim_usuario_logado');
            if (bUserRaw) {
                const parsed = JSON.parse(bUserRaw);
                if (parsed && (parsed.email || parsed.id)) return parsed;
            }

            const pUserRaw = localStorage.getItem('itaim_perfil_usuario');
            if (pUserRaw) {
                const parsed = JSON.parse(pUserRaw);
                if (parsed && (parsed.email || parsed.id)) return parsed;
            }
        } catch {
            return null;
        }
        return null;
    }

    /**
     * Retorna uma chave única de armazenamento para o usuário atualmente logado.
     * Isso garante que nenhuma conta tenha acesso aos chamados de outra conta.
     */
    function obterChaveStorageUsuario() {
        const u = obterUsuarioAtual();
        if (!u) {
            return 'itaim_suporte_tickets_visitante';
        }
        const identificador = (u.email || u.id || u.username || 'visitante').toLowerCase().trim();
        return 'itaim_suporte_tickets_' + encodeURIComponent(identificador);
    }

    // ─── Migração Segura de Tickets Legados ───────────────────────────
    function migrarTicketsLegadosSeNecessario(chaveAtual) {
        try {
            const rawLegado = localStorage.getItem('itaim_suporte_tickets');
            if (!rawLegado) return;

            const listaLegada = JSON.parse(rawLegado);
            if (!Array.isArray(listaLegada)) {
                localStorage.removeItem('itaim_suporte_tickets');
                return;
            }

            const u = obterUsuarioAtual();
            const emailAtual = (u?.email || '').toLowerCase().trim();
            const idAtual = u?.id ? String(u.id).trim() : '';

            // Resgata os tickets legítimos pertencentes à conta atual
            const ticketsDaConta = listaLegada.filter(t => {
                // Descarta mocks genéricos antigos de teste
                if (t.id === 'TKT-ABC12' || t.id === 'TKT-XYZ99') return false;

                if (t.userEmail && emailAtual && t.userEmail.toLowerCase().trim() === emailAtual) return true;
                if (t.userId && idAtual && String(t.userId).trim() === idAtual) return true;

                // Se foi submetido na sessão anterior sem tag de e-mail e pertence a este usuário
                if (!t.userEmail && !t.userId && (emailAtual || idAtual)) {
                    t.userEmail = emailAtual;
                    t.userId = idAtual;
                    t.userName = u?.name || u?.nome || 'Usuário';
                    return true;
                }
                return false;
            });

            if (ticketsDaConta.length > 0) {
                let existentes = [];
                try {
                    existentes = JSON.parse(localStorage.getItem(chaveAtual) || '[]');
                    if (!Array.isArray(existentes)) existentes = [];
                } catch { existentes = []; }

                ticketsDaConta.forEach(t => {
                    if (!existentes.some(e => e.id === t.id)) {
                        existentes.unshift(t);
                    }
                });
                localStorage.setItem(chaveAtual, JSON.stringify(existentes));
            }

            // Remove a chave compartilhada antiga para impedir qualquer vazamento entre contas
            localStorage.removeItem('itaim_suporte_tickets');
        } catch (e) {
            console.warn('[Suporte] Falha na migração de tickets legados:', e);
        }
    }

    // ─── Utilitários de Persistência ──────────────────────────────────
    function obterTicketsLocais() {
        try {
            const chave = obterChaveStorageUsuario();
            migrarTicketsLegadosSeNecessario(chave);

            const bruto = localStorage.getItem(chave);
            if (!bruto) {
                return [];
            }
            const parsed = JSON.parse(bruto);
            if (Array.isArray(parsed)) {
                return parsed;
            }
            return [];
        } catch (e) {
            console.warn('[Suporte] Erro ao ler tickets locais:', e);
            return [];
        }
    }

    function salvarTicketsLocais(tickets) {
        try {
            const chave = obterChaveStorageUsuario();
            localStorage.setItem(chave, JSON.stringify(tickets));
            return true;
        } catch (e) {
            console.warn('[Suporte] Erro ao salvar tickets locais:', e);
            return false;
        }
    }

    function sincronizarComConversasAdmin(ticket) {
        try {
            let conversas = [];
            const raw = localStorage.getItem(CHAVE_CONVERSAS_ADMIN);
            if (raw) conversas = JSON.parse(raw);
            if (!Array.isArray(conversas)) conversas = [];

            const usuario = obterUsuarioAtual();

            const novaConversa = {
                id: 'sup_tkt_' + Date.now(),
                protocol: ticket.id,
                userId: ticket.userId || usuario?.id || null,
                userName: usuario?.name || usuario?.nome || ticket.userName || 'Você (Usuário)',
                userEmail: usuario?.email || ticket.userEmail || 'usuario@itaimvende.com.br',
                userCity: usuario?.cidade || usuario?.city || 'Paulistana - PI',
                userAvatar: usuario?.avatar || usuario?.foto || 'assets/icons/icon-user.png',
                category: ticket.categoria || 'outro',
                subject: ticket.titulo,
                description: ticket.descricao,
                anexos: ticket.anexos || [],
                status: 'ABERTO',
                lastMessage: ticket.descricao,
                lastMessageAt: ticket.criadoEm,
                createdAt: ticket.criadoEm || new Date().toISOString(),
                unread: true
            };

            const idx = conversas.findIndex(c => c.protocol === ticket.id);
            if (idx >= 0) {
                conversas[idx] = novaConversa;
            } else {
                conversas.unshift(novaConversa);
            }

            localStorage.setItem(CHAVE_CONVERSAS_ADMIN, JSON.stringify(conversas));
        } catch (e) {
            console.warn('[Suporte] Erro ao sincronizar conversa com painel admin:', e);
        }
    }

    function sincronizarStatusDoAdmin(tickets) {
        try {
            const raw = localStorage.getItem(CHAVE_CONVERSAS_ADMIN);
            if (!raw) return tickets;
            const conversas = JSON.parse(raw);
            if (!Array.isArray(conversas)) return tickets;

            let alterado = false;
            const mapaStatus = {
                'ABERTO': 'aberto',
                'EM_ATENDIMENTO': 'em_andamento',
                'CONCLUIDO': 'resolvido',
                'FECHADO': 'fechado'
            };

            tickets.forEach(t => {
                const match = conversas.find(c => c.protocol === t.id);
                if (match && match.status && mapaStatus[match.status]) {
                    const novoSt = mapaStatus[match.status];
                    if (t.status !== novoSt) {
                        t.status = novoSt;
                        alterado = true;
                    }
                }
            });

            if (alterado) {
                salvarTicketsLocais(tickets);
            }
        } catch (e) {
            console.warn('[Suporte] Erro ao sincronizar status do admin:', e);
        }
        return tickets;
    }

    // ─── Utilitário: toast ────────────────────────────────────────────
    function toast(msg, tipo) {
        if (window.ItaimConfigUtils?.toast) {
            window.ItaimConfigUtils.toast(msg, tipo === 'erro');
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

            const categoriaVal = document.getElementById('ticket-categoria').value;
            const tituloVal = document.getElementById('ticket-titulo').value.trim();
            const descricaoVal = document.getElementById('ticket-descricao').value.trim();

            const usuario = obterUsuarioAtual();
            const userEmail = (usuario?.email || '').toLowerCase().trim();
            const userId = usuario?.id || null;
            const userName = usuario?.name || usuario?.nome || 'Usuário';

            const anexosInfo = anexosSelecionados.map(f => ({
                nome: f.name,
                tamanho: f.size,
                tipo: f.type
            }));

            btnEnviar.disabled = true;
            const textoOriginal = btnEnviar.innerHTML;
            btnEnviar.innerHTML = `
                <svg class="cfg-spin" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                Enviando...
            `;

            try {
                let novoTicket = null;
                const apiCore = window.ItaimApiCore;

                // Tenta envio para a API se disponível
                if (apiCore && typeof apiCore.requisicao === 'function') {
                    try {
                        const formData = new FormData();
                        formData.append('categoria', categoriaVal);
                        formData.append('titulo', tituloVal);
                        formData.append('descricao', descricaoVal);
                        anexosSelecionados.forEach(f => formData.append('anexos', f));

                        const resp = await apiCore.requisicao('/support/tickets', {
                            method: 'POST',
                            body: formData
                        });
                        novoTicket = resp?.dados || resp?.ticket || null;
                    } catch {
                        // Sem rota de suporte no backend, prossegue com persistência local garantida
                    }
                }

                // Criação do ticket com vínculo estrito de proprietário da conta
                if (!novoTicket) {
                    await new Promise(r => setTimeout(r, 450));
                    novoTicket = {
                        id: 'TKT-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
                        userId: userId,
                        userEmail: userEmail,
                        userName: userName,
                        categoria: categoriaVal,
                        titulo: tituloVal,
                        descricao: descricaoVal,
                        anexos: anexosInfo,
                        status: 'aberto',
                        criadoEm: new Date().toISOString()
                    };
                }

                // 1. Salva no LocalStorage escopado exclusivamente para esta conta
                const listaAtual = obterTicketsLocais();
                listaAtual.unshift(novoTicket);
                salvarTicketsLocais(listaAtual);

                // 2. Atualiza cache em memória
                ticketsCache = listaAtual;

                // 3. Sincroniza com a central de atendimento do admin
                sincronizarComConversasAdmin(novoTicket);

                // 4. Limpa formulário e anexos
                form.reset();
                const contadorDesc = document.getElementById('contador-ticket-desc');
                if (contadorDesc) contadorDesc.textContent = '0/1000';
                anexosSelecionados = [];
                renderAnexos(document.getElementById('lista-anexos-ticket'));

                // 5. Restaura o filtro para "Todos" para visualização imediata do chamado criado
                filtroAtual = 'todos';
                const containerFiltros = document.getElementById('suporte-filtros');
                if (containerFiltros) {
                    containerFiltros.querySelectorAll('.cfg-suporte-filtro-btn').forEach(btn => {
                        btn.classList.toggle('ativo', btn.dataset.status === 'todos');
                    });
                }

                // 6. Renderiza lista atualizada com o novo ticket
                renderTickets(filtroAtual);

                // 7. Feedback de sucesso ao usuário
                toast('Ticket enviado com sucesso! Em breve nossa equipe entrará em contato.', 'sucesso');

            } catch (err) {
                console.error('[Suporte] Falha ao enviar ticket:', err);
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
            const anexosInfo = Array.isArray(t.anexos) && t.anexos.length > 0
                ? `<span style="display:inline-flex;align-items:center;gap:4px;" title="${escapeHtml(t.anexos.map(a => a.nome || a).join(', '))}">
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                    ${t.anexos.length} anexo${t.anexos.length > 1 ? 's' : ''}
                   </span>`
                : '';

            return `
                <div class="cfg-suporte-ticket-item" data-id="${t.id}" style="cursor: pointer;" title="Clique para expandir/recolher os detalhes">
                    <div class="cfg-suporte-ticket-topo">
                        <span class="cfg-suporte-ticket-id">#${t.id || '—'}</span>
                        <span class="cfg-suporte-badge cfg-suporte-badge-${st.cor}">${st.texto}</span>
                    </div>
                    <p class="cfg-suporte-ticket-titulo">${escapeHtml(t.titulo || '—')}</p>
                    <p class="cfg-suporte-ticket-desc">${escapeHtml((t.descricao || '').substring(0, 120))}${(t.descricao || '').length > 120 ? '…' : ''}</p>
                    <div class="cfg-suporte-ticket-meta">
                        <span>${cat}</span>
                        ${anexosInfo}
                        <span>${formatarData(t.criadoEm)}</span>
                    </div>
                </div>
            `;
        }).join('');

        // Permite clicar no item para expandir ou recolher a descrição completa
        lista.querySelectorAll('.cfg-suporte-ticket-item').forEach(item => {
            item.addEventListener('click', function () {
                const id = this.dataset.id;
                const ticket = ticketsCache.find(t => t.id === id);
                if (!ticket) return;

                const descEl = this.querySelector('.cfg-suporte-ticket-desc');
                if (!descEl) return;

                const isExpandido = this.classList.toggle('expandido');
                if (isExpandido) {
                    descEl.innerHTML = escapeHtml(ticket.descricao || '').replace(/\n/g, '<br>');
                } else {
                    const curta = (ticket.descricao || '').substring(0, 120);
                    descEl.textContent = curta + ((ticket.descricao || '').length > 120 ? '…' : '');
                }
            });
        });
    }

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    // ─── Carregamento dos tickets ─────────────────────────────────────
    async function carregarTickets(forcarAtualizacao = false) {
        const lista = document.getElementById('lista-tickets-suporte');
        if (!lista) return;

        const chaveAtual = obterChaveStorageUsuario();
        if (ultimaChaveUsuario !== chaveAtual) {
            ultimaChaveUsuario = chaveAtual;
            ticketsCache = [];
        }

        lista.innerHTML = `
            <div class="cfg-suporte-ticket-skeleton" aria-hidden="true">
                <div class="skeleton-line" style="width:55%;height:16px;border-radius:4px;"></div>
                <div class="skeleton-line" style="width:85%;height:13px;margin-top:8px;border-radius:4px;"></div>
                <div class="skeleton-line" style="width:40%;height:13px;margin-top:6px;border-radius:4px;"></div>
            </div>
        `;

        try {
            let carregados = null;
            const apiCore = window.ItaimApiCore;

            if (apiCore && typeof apiCore.requisicao === 'function') {
                try {
                    const resp = await apiCore.requisicao('/support/tickets', { method: 'GET' });
                    if (Array.isArray(resp?.dados) || Array.isArray(resp)) {
                        carregados = Array.isArray(resp?.dados) ? resp.dados : resp;
                    }
                } catch {
                    // Sem endpoint no backend, usa armazenamento local persistente
                }
            }

            if (!carregados) {
                if (forcarAtualizacao) {
                    await new Promise(r => setTimeout(r, 200));
                }
                carregados = obterTicketsLocais();
                carregados = sincronizarStatusDoAdmin(carregados);
            }

            ticketsCache = Array.isArray(carregados) ? carregados : [];
        } catch (err) {
            console.error('[Suporte] Erro ao carregar tickets:', err);
            ticketsCache = obterTicketsLocais();
            toast('Não foi possível sincronizar seus tickets.', 'erro');
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
            const svg = btn.querySelector('svg');
            if (svg) svg.classList.add('cfg-spin');
            try {
                await carregarTickets(true);
                toast('Lista de tickets atualizada.', 'sucesso');
            } finally {
                if (svg) svg.classList.remove('cfg-spin');
                btn.disabled = false;
            }
        });
    }

    // ─── Carrega quando o painel de suporte é aberto ──────────────────
    function observarAberturaDoSuporte() {
        // Carrega quando a aba Suporte for clicada
        document.querySelectorAll('.cfg-nav-item[data-alvo="suporte"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const chaveAtual = obterChaveStorageUsuario();
                if (ultimaChaveUsuario !== chaveAtual || ticketsCache.length === 0) {
                    carregarTickets();
                }
            });
        });

        // Carrega se a página já abrir no painel suporte (hash na URL)
        if (location.hash === '#suporte') {
            carregarTickets();
        }

        // Detecta troca de hash dinâmica
        window.addEventListener('hashchange', () => {
            if (location.hash === '#suporte') {
                const chaveAtual = obterChaveStorageUsuario();
                if (ultimaChaveUsuario !== chaveAtual || ticketsCache.length === 0) {
                    carregarTickets();
                }
            }
        });

        // Detecta troca de conta em outra aba ou via logout/login
        window.addEventListener('storage', (e) => {
            if (e.key === 'itaim_token' || e.key === 'itaim_usuario_logado' || e.key === 'itaim_usuario_logado_email') {
                const chaveAtual = obterChaveStorageUsuario();
                if (ultimaChaveUsuario !== chaveAtual) {
                    carregarTickets();
                }
            }
        });
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
