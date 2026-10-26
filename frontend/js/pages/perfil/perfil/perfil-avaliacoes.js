/**
 * ITAIM VENDE - PERFIL: AVALIAÇÕES E REPUTAÇÃO
 * Arquivo: frontend/js/pages/perfil/perfil/perfil-avaliacoes.js
 *
 * Busca avaliações reais da API (/api/v1/reviews/user/:userId),
 * conecta o formulário de avaliação para visitantes (#perfil-form-nova-avaliacao)
 * com limitação de 1 avaliação por usuário, menu de 3 pontinhos para edição/exclusão,
 * e permite que o próprio vendedor responda cada avaliação.
 */

(function () {
    'use strict';

    function formatarData(iso) {
        if (!iso) return 'Recente';
        try {
            return new Date(iso).toLocaleDateString('pt-BR', {
                day: '2-digit', month: 'short', year: 'numeric'
            });
        } catch (_) { return 'Recente'; }
    }

    function ehMinhaAvaliacao(item, usuarioLogado) {
        if (!usuarioLogado || !item) return false;
        const meuId = String(usuarioLogado.id || '');
        const autorId = item.autor?.id ? String(item.autor.id) : (item.authorId ? String(item.authorId) : (item.autorId ? String(item.autorId) : null));
        if (autorId && meuId && autorId === meuId) return true;

        const meuUser = (usuarioLogado.username || usuarioLogado.usuario || '').toLowerCase().trim();
        const autorUser = (item.autor?.username || item.username || '').toLowerCase().trim();
        if (meuUser && autorUser && meuUser === autorUser) return true;

        const meuNome = (usuarioLogado.name || usuarioLogado.nome || '').toLowerCase().trim();
        const autorNome = (typeof item.autor === 'string' ? item.autor : (item.autor?.nome || item.autor?.name || '')).toLowerCase().trim();
        if (meuNome && autorNome && meuNome === autorNome) return true;
        if (meuUser && autorNome && meuUser === autorNome) return true;
        if (meuNome && autorUser && meuNome === autorUser) return true;

        const meuEmail = (usuarioLogado.email || '').toLowerCase().trim();
        const autorEmail = (item.autor?.email || item.email || '').toLowerCase().trim();
        if (meuEmail && autorEmail && meuEmail === autorEmail) return true;

        return false;
    }

    function renderizarCard(item, isProprioUsuario, usuarioLogado) {
        const notaNum = Math.min(5, Math.max(1, Math.round(item.nota || 5)));
        const estrelasTxt = '★'.repeat(notaNum) + '☆'.repeat(5 - notaNum);
        const nomeAutor = item.autor?.nome || item.autor || 'Comprador';
        const inicial = nomeAutor.charAt(0).toUpperCase();
        const avatarAutor = item.autor?.avatar
            ? (window.ItaimApi?.resolverUrlImagem?.(item.autor.avatar) || item.autor.avatar)
            : null;

        const isMinha = ehMinhaAvaliacao(item, usuarioLogado);

        const avatarHtml = avatarAutor
            ? `<img src="${avatarAutor}" alt="${nomeAutor}" style="width:34px;height:34px;border-radius:50%;object-fit:cover;" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
               <div style="width:34px;height:34px;border-radius:50%;background:#DCFCE7;color:#166534;font-weight:800;display:none;align-items:center;justify-content:center;font-size:14px;border:1px solid #BBF7D0;">${inicial}</div>`
            : `<div style="width:34px;height:34px;border-radius:50%;background:#DCFCE7;color:#166534;font-weight:800;display:flex;align-items:center;justify-content:center;font-size:14px;border:1px solid #BBF7D0;">${inicial}</div>`;

        const respostaHtml = item.resposta
            ? `<div style="margin:8px 0 0 44px;padding:10px 14px;background:#F0FDF4;border-left:3px solid #22C55E;border-radius:0 8px 8px 0;">
                   <div style="font-size:12px;font-weight:700;color:#166534;margin-bottom:4px;">💬 Resposta do Vendedor</div>
                   <p style="font-size:13px;color:#334155;margin:0;line-height:1.5;">${item.resposta}</p>
               </div>`
            : (isProprioUsuario
                ? `<div style="margin:6px 0 0 44px;">
                       <button type="button" class="btn-responder-avaliacao" data-id="${item.id}"
                           style="font-size:12px;padding:5px 12px;border-radius:6px;border:1px solid #22C55E;background:transparent;color:#16A34A;cursor:pointer;font-weight:600;">
                           Responder
                       </button>
                       <form class="form-resposta-inline" data-id="${item.id}" style="display:none;margin-top:8px;">
                           <textarea placeholder="Escreva sua resposta..." rows="2"
                               style="width:100%;padding:8px 12px;border-radius:8px;border:1px solid #BBF7D0;font-family:inherit;font-size:13px;resize:vertical;box-sizing:border-box;outline:none;"></textarea>
                           <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:6px;">
                               <button type="button" class="btn-cancelar-resposta" data-id="${item.id}"
                                   style="font-size:12px;padding:5px 12px;border-radius:6px;border:1px solid #CBD5E1;background:transparent;color:#64748B;cursor:pointer;">
                                   Cancelar
                               </button>
                               <button type="submit"
                                   style="font-size:12px;padding:5px 14px;border-radius:6px;border:none;background:#22C55E;color:#fff;font-weight:700;cursor:pointer;">
                                   Publicar
                               </button>
                           </div>
                       </form>
                   </div>`
                : '');

        // Dropdown de 3 pontinhos para a avaliação do próprio usuário
        const menuDropdownHtml = isMinha ? `
            <div class="avaliacao-menu-wrapper" style="position:relative;display:inline-block;">
                <button type="button" class="btn-review-menu" data-id="${item.id}" title="Mais opções" aria-label="Mais opções">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                        <circle cx="12" cy="5" r="2"></circle>
                        <circle cx="12" cy="12" r="2"></circle>
                        <circle cx="12" cy="19" r="2"></circle>
                    </svg>
                </button>
                <div class="dropdown-review-menu" id="dropdown-perfil-review-${item.id}">
                    <button type="button" class="dropdown-review-item btn-acao-editar-review" data-id="${item.id}">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        <span>Editar</span>
                    </button>
                    <button type="button" class="dropdown-review-item excluir btn-acao-excluir-review" data-id="${item.id}">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        <span>Excluir</span>
                    </button>
                </div>
            </div>
        ` : '';

        return `
            <div class="item-avaliacao-card" data-review-id="${item.id}" style="padding:14px 0;border-bottom:1px solid #F1F5F9;">
                <div class="avaliacao-conteudo-normal">
                    <div class="avaliacao-topo-row" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;flex-wrap:wrap;gap:8px;">
                        <div style="display:flex;align-items:center;gap:10px;">
                            <div style="display:flex;align-items:center;">${avatarHtml}</div>
                            <div>
                                <div class="avaliacao-autor-nome" style="font-weight:700;font-size:13.5px;display:flex;align-items:center;gap:6px;">
                                    <span>${nomeAutor}</span>
                                    ${isMinha ? '<span class="avaliacao-badge-voce" style="font-size:10.5px;padding:2px 6px;border-radius:4px;font-weight:700;">Você</span>' : ''}
                                </div>
                                <div style="font-size:11.5px;color:#94A3B8;">${formatarData(item.data)}</div>
                            </div>
                        </div>
                        <div style="display:flex;align-items:center;gap:10px;">
                            <div style="color:#F59E0B;font-size:14px;letter-spacing:2px;">
                                ${estrelasTxt} <span style="font-size:12px;font-weight:700;color:#64748B;">(${Number(item.nota).toFixed(1)})</span>
                            </div>
                            ${menuDropdownHtml}
                        </div>
                    </div>
                    ${item.comentario ? `<p class="avaliacao-comentario-txt" style="font-size:13.5px;line-height:1.5;margin:4px 0 0 44px;">${item.comentario}</p>` : ''}
                    ${respostaHtml}
                </div>
                <div class="avaliacao-container-edicao" style="display:none;"></div>
            </div>`;
    }

    async function inicializar() {
        const { exibirToast, isPerfilProprio } = window.ItaimPerfilUtils || {};
        const perfilExibido = window.ItaimPerfilDados?.obterPerfil() || {};
        const userId = perfilExibido.id || perfilExibido.username || window.ItaimPerfilUtils?.paramId || null;

        const statAvaliacao = document.getElementById('stat-avaliacoes-texto');
        const statLegenda = document.getElementById('stat-avaliacoes-legenda');
        const badgeAvaliacoes = document.getElementById('perfil-badge-avaliacoes');
        const container = document.getElementById('lista-avaliacoes-perfil');

        // Formulário de nova avaliação
        const boxForm = document.getElementById('perfil-box-form-avaliacao');
        const formAvaliacao = document.getElementById('perfil-form-nova-avaliacao');
        const inputNota = document.getElementById('perfil-input-nota');
        const labelNota = document.getElementById('perfil-label-nota');
        const inputAutor = document.getElementById('perfil-input-autor');
        const labelAutorLogado = document.getElementById('perfil-nome-autor-logado');
        const textareaComentario = document.getElementById('perfil-textarea-comentario');
        const estrelasContainer = document.getElementById('perfil-estrelas-seletor');

        // Usuário atualmente autenticado
        const usuarioLogado = (window.ItaimSessao && typeof window.ItaimSessao.obterUsuarioLogado === 'function')
            ? window.ItaimSessao.obterUsuarioLogado()
            : null;
        const isLogado = !!(usuarioLogado?.id || window.ItaimApi?.auth?.obterToken?.());

        // O usuário está visualizando seu próprio perfil se isPerfilProprio for true
        const isProprioUsuario = !!isPerfilProprio || (!!usuarioLogado?.id && !!perfilExibido?.id && String(usuarioLogado.id) === String(perfilExibido.id));

        // Preenche dados do autor logado no formulário se estiver visitando perfil alheio
        if (!isProprioUsuario && boxForm) {
            const nomeLogado = usuarioLogado?.name || usuarioLogado?.nome || usuarioLogado?.username || 'Comprador';
            if (inputAutor) inputAutor.value = nomeLogado;
            if (labelAutorLogado) labelAutorLogado.textContent = isLogado ? nomeLogado : 'Visitante (faça login)';
        }

        // =====================================================================
        // BUSCA AVALIAÇÕES DA API REAL
        // =====================================================================
        let avaliacoes = [];
        let totalAvaliacoes = Number(perfilExibido.ratingCount || perfilExibido.totalAvaliacoes || 0);
        let mediaGeral = totalAvaliacoes > 0 ? Number(perfilExibido.ratingAverage || perfilExibido.avaliacao || 0) : 0.0;
        let usouApi = false;

        const idBusca = userId || perfilExibido.email || perfilExibido.username;
        if (container && window.ItaimSkeleton && typeof window.ItaimSkeleton.renderizarAvaliacoes === 'function') {
            window.ItaimSkeleton.renderizarAvaliacoes(container, 3);
        }

        if (idBusca && window.ItaimApi?.reviews?.listar) {
            try {
                const res = await window.ItaimApi.reviews.listar(idBusca);
                if (res?.success && Array.isArray(res.avaliacoes)) {
                    avaliacoes = res.avaliacoes;
                    totalAvaliacoes = res.vendedor?.totalAvaliacoes ?? avaliacoes.length;
                    mediaGeral = totalAvaliacoes > 0 ? Number(res.vendedor?.mediaGeral || 0) : 0.0;
                    usouApi = true;
                }
            } catch (err) {
                console.info('[PerfilAvaliacoes] Fallback para dados locais:', err.message);
            }
        }

        // Fallback: localStorage
        if (!usouApi && window.ItaimAvaliacoes) {
            const lista = window.ItaimAvaliacoes.obter(perfilExibido);
            const stats = window.ItaimAvaliacoes.calcularMedia(lista, perfilExibido);
            avaliacoes = lista.map(item => ({
                id: item.id,
                nota: item.nota,
                comentario: item.comentario,
                resposta: item.resposta || null,
                data: item.data || null,
                autor: { nome: item.autor, avatar: null }
            }));
            totalAvaliacoes = stats.total;
            mediaGeral = totalAvaliacoes > 0 ? stats.media : 0.0;
        }

        // =====================================================================
        // ATUALIZA INDICADORES DE REPUTAÇÃO
        // =====================================================================
        function atualizarIndicadores(media, total) {
            const totalNum = Number(total || 0);
            const mediaNum = totalNum > 0 ? Number(media || 0) : 0.0;
            const mediaStr = totalNum > 0 ? `${mediaNum.toFixed(1)} ★` : '0.0 ★';
            const legendaStr = totalNum > 0 ? `Avaliações (${totalNum})` : 'Sem avaliações';
            if (statAvaliacao) statAvaliacao.textContent = mediaStr;
            if (statLegenda) statLegenda.textContent = legendaStr;
            if (badgeAvaliacoes) badgeAvaliacoes.textContent = `${mediaNum.toFixed(1)} ★ (${totalNum})`;
        }

        atualizarIndicadores(mediaGeral, totalAvaliacoes);

        // =====================================================================
        // CONTROLE DE VISIBILIDADE DO FORMULÁRIO (Limite de 1 avaliação)
        // =====================================================================
        function atualizarVisibilidadeFormulario(lista) {
            if (!boxForm) return;

            if (isProprioUsuario) {
                boxForm.style.display = 'none';
                return;
            }

            const jaAvaliou = isLogado && lista.some(item => ehMinhaAvaliacao(item, usuarioLogado));
            boxForm.style.display = jaAvaliou ? 'none' : 'block';
        }

        atualizarVisibilidadeFormulario(avaliacoes);

        // =====================================================================
        // RENDERIZA LISTA
        // =====================================================================
        function renderizarLista(lista) {
            if (!container) return;
            if (lista.length === 0) {
                container.innerHTML = `
                    <div style="text-align:center;padding:32px 18px;border-radius:12px;border:1px dashed #CBD5E1;">
                        <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="#94A3B8" stroke-width="1.8" style="margin-bottom:8px;">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                        <h4 style="font-size:14px;color:#1E293B;margin:0 0 4px;font-weight:700;">Nenhuma avaliação ainda</h4>
                        <p style="font-size:13px;color:#64748B;margin:0;">As avaliações e comentários deixados por compradores aparecerão aqui.</p>
                    </div>`;
                return;
            }

            container.innerHTML = lista.map(item => renderizarCard(item, isProprioUsuario, usuarioLogado)).join('');
            vincularEventosResposta(lista);
            vincularEventosDropdown(lista);
        }

        // =====================================================================
        // EVENTOS: DROPDOWN DE 3 PONTINHOS (EDITAR E EXCLUIR)
        // =====================================================================
        function vincularEventosDropdown(lista) {
            if (!container) return;

            container.querySelectorAll('.btn-review-menu').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const id = btn.getAttribute('data-id');
                    const dropdown = document.getElementById(`dropdown-perfil-review-${id}`);

                    document.querySelectorAll('.dropdown-review-menu').forEach(d => {
                        if (d !== dropdown) d.classList.remove('aberto');
                    });

                    if (dropdown) dropdown.classList.toggle('aberto');
                });
            });

            // Excluir
            container.querySelectorAll('.btn-acao-excluir-review').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const id = btn.getAttribute('data-id');
                    const confirmou = window.confirm('Tem certeza de que deseja excluir sua avaliação?');
                    if (!confirmou) return;

                    btn.disabled = true;
                    try {
                        let novaMediaCalc = null;
                        let novoTotalCalc = null;

                        if (window.ItaimApi?.reviews?.excluir) {
                            const res = await window.ItaimApi.reviews.excluir(id);
                            if (res && res.novaMedia !== undefined) {
                                novaMediaCalc = res.novaMedia;
                                novoTotalCalc = res.totalAvaliacoes;
                            }
                        }

                        const idx = lista.findIndex(a => String(a.id) === String(id));
                        if (idx !== -1) lista.splice(idx, 1);

                        if (novaMediaCalc === null || novoTotalCalc === null) {
                            novoTotalCalc = lista.length;
                            const soma = lista.reduce((acc, c) => acc + (Number(c.nota) || 0), 0);
                            novaMediaCalc = novoTotalCalc > 0 ? (soma / novoTotalCalc) : 0.0;
                        }

                        mediaGeral = novaMediaCalc;
                        totalAvaliacoes = novoTotalCalc;

                        atualizarIndicadores(mediaGeral, totalAvaliacoes);
                        atualizarVisibilidadeFormulario(lista);
                        renderizarLista(lista);
                        exibirToast('Avaliação excluída com sucesso!');
                    } catch (err) {
                        exibirToast(err.message || 'Erro ao excluir avaliação.');
                        btn.disabled = false;
                    }
                });
            });

            // Editar
            container.querySelectorAll('.btn-acao-editar-review').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const id = btn.getAttribute('data-id');
                    const dropdown = document.getElementById(`dropdown-perfil-review-${id}`);
                    if (dropdown) dropdown.classList.remove('aberto');

                    const item = lista.find(a => String(a.id) === String(id));
                    if (!item) return;

                    iniciarEdicaoInline(item, lista);
                });
            });
        }

        // =====================================================================
        // MODO EDIÇÃO INLINE DA AVALIAÇÃO
        // =====================================================================
        function iniciarEdicaoInline(item, lista) {
            const card = container.querySelector(`.item-avaliacao-card[data-review-id="${item.id}"]`);
            if (!card) return;

            const boxNormal = card.querySelector('.avaliacao-conteudo-normal');
            const boxEdicao = card.querySelector('.avaliacao-container-edicao');
            if (!boxNormal || !boxEdicao) return;

            let notaEdicao = Math.min(5, Math.max(1, Math.round(item.nota || 5)));

            boxNormal.style.display = 'none';
            boxEdicao.style.display = 'block';
            boxEdicao.innerHTML = `
                <div class="box-edicao-inline-avaliacao" style="padding:14px;border-radius:12px;border:1px solid #BBF7D0;background:#F0FDF4;">
                    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
                        <span style="font-size:13px;font-weight:700;color:#166534;display:flex;align-items:center;gap:6px;">
                            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                            Editar sua avaliação
                        </span>
                        <div class="estrelas-seletor-edicao" style="display:flex;gap:4px;cursor:pointer;font-size:18px;user-select:none;">
                            ${[1, 2, 3, 4, 5].map(v => `<span class="estrela-edit-item" data-valor="${v}" style="color:${v <= notaEdicao ? '#F59E0B' : '#CBD5E1'};cursor:pointer;">★</span>`).join('')}
                            <span class="label-nota-edit" style="font-size:12.5px;font-weight:700;color:#F59E0B;margin-left:4px;">(${notaEdicao}.0)</span>
                        </div>
                    </div>
                    <textarea class="textarea-edit-comentario" rows="3"
                        style="width:100%;padding:10px 12px;border-radius:8px;border:1px solid #86EFAC;font-family:inherit;font-size:13px;resize:vertical;box-sizing:border-box;outline:none;"
                        placeholder="Edite seu comentário...">${item.comentario || ''}</textarea>
                    <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:10px;">
                        <button type="button" class="btn-cancelar-edicao"
                            style="font-size:12px;padding:6px 14px;border-radius:6px;border:1px solid #CBD5E1;background:transparent;color:#64748B;cursor:pointer;font-weight:600;">
                            Cancelar
                        </button>
                        <button type="button" class="btn-salvar-edicao"
                            style="font-size:12px;padding:6px 16px;border-radius:6px;border:none;background:#22C55E;color:#fff;font-weight:700;cursor:pointer;">
                            Salvar Alterações
                        </button>
                    </div>
                </div>
            `;

            const estrelasEdit = boxEdicao.querySelectorAll('.estrela-edit-item');
            const labelNotaEdit = boxEdicao.querySelector('.label-nota-edit');

            function atualizarVisualEstrelas(qtd) {
                estrelasEdit.forEach(st => {
                    const val = parseInt(st.getAttribute('data-valor'), 10);
                    st.style.color = val <= qtd ? '#F59E0B' : '#CBD5E1';
                });
                if (labelNotaEdit) labelNotaEdit.textContent = `(${qtd}.0)`;
            }

            estrelasEdit.forEach(st => {
                st.addEventListener('mouseenter', () => atualizarVisualEstrelas(parseInt(st.getAttribute('data-valor'), 10)));
                st.addEventListener('click', () => {
                    notaEdicao = parseInt(st.getAttribute('data-valor'), 10);
                    atualizarVisualEstrelas(notaEdicao);
                });
            });

            boxEdicao.querySelector('.estrelas-seletor-edicao')?.addEventListener('mouseleave', () => {
                atualizarVisualEstrelas(notaEdicao);
            });

            boxEdicao.querySelector('.btn-cancelar-edicao')?.addEventListener('click', () => {
                boxEdicao.style.display = 'none';
                boxNormal.style.display = 'block';
            });

            boxEdicao.querySelector('.btn-salvar-edicao')?.addEventListener('click', async () => {
                const textarea = boxEdicao.querySelector('.textarea-edit-comentario');
                const novoTexto = textarea?.value.trim() || '';
                if (!novoTexto) {
                    exibirToast('Por favor, escreva um comentário.');
                    return;
                }

                const btnSalvar = boxEdicao.querySelector('.btn-salvar-edicao');
                if (btnSalvar) { btnSalvar.disabled = true; btnSalvar.textContent = 'Salvando...'; }

                try {
                    let novaMediaCalc = null;
                    let novoTotalCalc = null;

                    if (window.ItaimApi?.reviews?.editar) {
                        const res = await window.ItaimApi.reviews.editar(item.id, {
                            rating: notaEdicao,
                            comment: novoTexto
                        });
                        if (res && res.novaMedia !== undefined) {
                            novaMediaCalc = res.novaMedia;
                            novoTotalCalc = res.totalAvaliacoes;
                        }
                    }

                    item.nota = notaEdicao;
                    item.comentario = novoTexto;

                    if (novaMediaCalc === null || novoTotalCalc === null) {
                        novoTotalCalc = lista.length;
                        const soma = lista.reduce((acc, c) => acc + (Number(c.nota) || 0), 0);
                        novaMediaCalc = novoTotalCalc > 0 ? (soma / novoTotalCalc) : 0.0;
                    }

                    mediaGeral = novaMediaCalc;
                    totalAvaliacoes = novoTotalCalc;

                    atualizarIndicadores(mediaGeral, totalAvaliacoes);
                    renderizarLista(lista);
                    exibirToast('Avaliação atualizada com sucesso!');
                } catch (err) {
                    exibirToast(err.message || 'Erro ao atualizar avaliação.');
                    if (btnSalvar) { btnSalvar.disabled = false; btnSalvar.textContent = 'Salvar Alterações'; }
                }
            });
        }

        // =====================================================================
        // RESPONDER AVALIAÇÃO (PELO PRÓPRIO VENDEDOR)
        // =====================================================================
        function vincularEventosResposta(lista) {
            if (!container || !isProprioUsuario) return;

            container.querySelectorAll('.btn-responder-avaliacao').forEach(btn => {
                const id = btn.getAttribute('data-id');
                const form = container.querySelector(`.form-resposta-inline[data-id="${id}"]`);
                btn.addEventListener('click', () => {
                    btn.style.display = 'none';
                    if (form) form.style.display = 'block';
                });
            });

            container.querySelectorAll('.btn-cancelar-resposta').forEach(btn => {
                const id = btn.getAttribute('data-id');
                const form = container.querySelector(`.form-resposta-inline[data-id="${id}"]`);
                const btnResponder = container.querySelector(`.btn-responder-avaliacao[data-id="${id}"]`);
                btn.addEventListener('click', () => {
                    if (form) form.style.display = 'none';
                    if (btnResponder) btnResponder.style.display = 'inline-block';
                });
            });

            container.querySelectorAll('.form-resposta-inline').forEach(form => {
                form.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const id = form.getAttribute('data-id');
                    const textarea = form.querySelector('textarea');
                    const texto = textarea?.value.trim() || '';
                    if (!texto) return;

                    const btnSubmit = form.querySelector('[type="submit"]');
                    if (btnSubmit) { btnSubmit.disabled = true; btnSubmit.textContent = 'Enviando...'; }

                    try {
                        if (window.ItaimApi?.reviews?.responder) {
                            await window.ItaimApi.reviews.responder(id, texto);
                        }
                        const idx = lista.findIndex(a => a.id === id);
                        if (idx !== -1) lista[idx].resposta = texto;
                        renderizarLista(lista);
                        exibirToast('Resposta publicada com sucesso!');
                    } catch (err) {
                        exibirToast(err.message || 'Erro ao publicar resposta.');
                        if (btnSubmit) { btnSubmit.disabled = false; btnSubmit.textContent = 'Publicar'; }
                    }
                });
            });
        }

        // =====================================================================
        // SELETOR VISUAL DE ESTRELAS NO FORMULÁRIO DO PERFIL
        // =====================================================================
        if (estrelasContainer && !isProprioUsuario) {
            const estrelas = estrelasContainer.querySelectorAll('.estrela-item');

            function destacarEstrelas(qtd) {
                estrelas.forEach(estrela => {
                    const valor = parseInt(estrela.dataset.valor, 10);
                    estrela.classList.toggle('ativa', valor <= qtd);
                    estrela.style.color = valor <= qtd ? '#F59E0B' : '#CBD5E1';
                });
            }

            estrelas.forEach(estrela => {
                estrela.addEventListener('click', () => {
                    const valor = parseInt(estrela.dataset.valor, 10);
                    if (inputNota) inputNota.value = valor;
                    if (labelNota) labelNota.textContent = `(${valor}.0)`;
                    destacarEstrelas(valor);
                });
                estrela.addEventListener('mouseenter', () => destacarEstrelas(parseInt(estrela.dataset.valor, 10)));
            });

            estrelasContainer.addEventListener('mouseleave', () => {
                destacarEstrelas(parseInt(inputNota?.value || '5', 10));
            });
        }

        // =====================================================================
        // ENVIO DO FORMULÁRIO DE AVALIAÇÃO DE PERFIL
        // =====================================================================
        if (formAvaliacao && !isProprioUsuario) {
            formAvaliacao.addEventListener('submit', async (e) => {
                e.preventDefault();

                const nota = parseInt(inputNota?.value || '5', 10);
                const comentario = textareaComentario?.value.trim() || '';

                if (!comentario) {
                    exibirToast('Por favor, escreva um comentário sobre a sua experiência.');
                    return;
                }

                if (!isLogado) {
                    exibirToast('Você precisa estar logado para avaliar este vendedor.');
                    return;
                }

                const btnEnviar = formAvaliacao.querySelector('button[type="submit"]');
                const spanOriginal = btnEnviar?.querySelector('span')?.textContent || 'Enviar Avaliação';
                if (btnEnviar) {
                    btnEnviar.disabled = true;
                    const span = btnEnviar.querySelector('span');
                    if (span) span.textContent = 'Enviando...';
                }

                try {
                    let novaAvaliacao = null;
                    const alvoId = userId || perfilExibido.id || perfilExibido.username;

                    if (alvoId && window.ItaimApi?.reviews?.enviar) {
                        const res = await window.ItaimApi.reviews.enviar(alvoId, {
                            rating: nota,
                            comment: comentario
                        });

                        if (res?.review) {
                            novaAvaliacao = {
                                id: res.review.id,
                                nota: res.review.rating,
                                comentario: res.review.comment,
                                resposta: res.review.reply || null,
                                data: res.review.createdAt,
                                autor: {
                                    id: res.review.author?.id || usuarioLogado?.id,
                                    nome: res.review.author?.name || usuarioLogado?.name || 'Comprador',
                                    username: res.review.author?.username || usuarioLogado?.username,
                                    avatar: res.review.author?.avatar || null
                                }
                            };

                            mediaGeral = res.novaMedia ?? mediaGeral;
                            totalAvaliacoes = res.totalAvaliacoes ?? (totalAvaliacoes + 1);
                        }
                    }

                    if (!novaAvaliacao && window.ItaimAvaliacoes) {
                        const nomeLogado = usuarioLogado?.name || usuarioLogado?.nome || 'Comprador';
                        window.ItaimAvaliacoes.adicionar(perfilExibido, { autor: nomeLogado, nota, comentario });
                        novaAvaliacao = {
                            id: Date.now().toString(),
                            nota,
                            comentario,
                            resposta: null,
                            data: new Date().toISOString(),
                            autor: {
                                id: usuarioLogado?.id,
                                nome: nomeLogado,
                                username: usuarioLogado?.username,
                                avatar: null
                            }
                        };
                        totalAvaliacoes += 1;
                        const soma = avaliacoes.reduce((acc, c) => acc + (Number(c.nota) || 0), 0) + nota;
                        mediaGeral = soma / totalAvaliacoes;
                    }

                    if (novaAvaliacao) {
                        avaliacoes.unshift(novaAvaliacao);
                        atualizarIndicadores(mediaGeral, totalAvaliacoes);
                        atualizarVisibilidadeFormulario(avaliacoes);
                        renderizarLista(avaliacoes);
                    }

                    if (textareaComentario) textareaComentario.value = '';
                    exibirToast('Avaliação enviada com sucesso!');
                } catch (err) {
                    console.error('[PerfilAvaliacoes] Erro ao enviar avaliação:', err);
                    exibirToast(err.message || 'Erro ao enviar avaliação. Tente novamente.');
                } finally {
                    if (btnEnviar) {
                        btnEnviar.disabled = false;
                        const span = btnEnviar.querySelector('span');
                        if (span) span.textContent = spanOriginal;
                    }
                }
            });
        }

        renderizarLista(avaliacoes);
    }

    window.ItaimPerfilAvaliacoes = { inicializar };
})();
