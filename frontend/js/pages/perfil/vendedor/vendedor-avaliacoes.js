/**
 * ITAIM VENDE - VENDEDOR: AVALIAÇÕES, ESTRELAS E REPUTAÇÃO
 * Arquivo: frontend/js/pages/perfil/vendedor/vendedor-avaliacoes.js
 *
 * Responsabilidades:
 * - Busca avaliações reais da API (/api/v1/reviews/user/:userId)
 * - Exibe lista com dropdown de 3 pontinhos (Editar e Excluir) nas avaliações do próprio usuário logado
 * - Limita a uma avaliação por usuário: oculta o formulário se já avaliou
 * - Mantém a média em 0.0 quando o vendedor não possui avaliações
 * - Remove mensagem de incentivo quando o usuário está no próprio perfil
 * - Permite edição e exclusão funcionais via API real
 * - Permite que o vendedor responda às avaliações recebidas
 */

(function () {
    'use strict';

    /**
     * Formata uma data ISO para exibição legível em pt-BR
     */
    function formatarData(iso) {
        if (!iso) return 'Recente';
        try {
            return new Date(iso).toLocaleDateString('pt-BR', {
                day: '2-digit', month: 'short', year: 'numeric'
            });
        } catch (_) { return 'Recente'; }
    }

    /**
     * Verifica se a avaliação foi feita pelo usuário logado
     */
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

    /**
     * Renderiza o HTML de um único card de avaliação
     */
    function renderizarCard(item, isVendedorLogado, usuarioLogado) {
        const notaNum = Math.min(5, Math.max(1, Math.round(item.nota || 5)));
        const estrelasTxt = '★'.repeat(notaNum) + '☆'.repeat(5 - notaNum);
        const nomeAutor = item.autor?.nome || (typeof item.autor === 'string' ? item.autor : null) || 'Comprador';
        const inicial = nomeAutor.charAt(0).toUpperCase();
        const avatarAutor = item.autor?.avatar
            ? (window.ItaimApi?.resolverUrlImagem?.(item.autor.avatar) || item.autor.avatar)
            : null;

        const isMinha = ehMinhaAvaliacao(item, usuarioLogado);

        const avatarHtml = avatarAutor
            ? `<img src="${avatarAutor}" alt="${nomeAutor}" style="width:34px;height:34px;border-radius:50%;object-fit:cover;" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
               <div class="avaliacao-avatar-mini" style="width:34px;height:34px;border-radius:50%;background:#DCFCE7;color:#166534;font-weight:800;display:none;align-items:center;justify-content:center;font-size:14px;">${inicial}</div>`
            : `<div class="avaliacao-avatar-mini" style="width:34px;height:34px;border-radius:50%;background:#DCFCE7;color:#166534;font-weight:800;display:flex;align-items:center;justify-content:center;font-size:14px;">${inicial}</div>`;

        const respostaHtml = item.resposta
            ? `<div class="avaliacao-resposta" style="margin:8px 0 0 44px;padding:10px 14px;background:#F0FDF4;border-left:3px solid #22C55E;border-radius:0 8px 8px 0;">
                   <div style="font-size:12px;font-weight:700;color:#166534;margin-bottom:4px;">💬 Resposta do Vendedor</div>
                   <p style="font-size:13px;color:#334155;margin:0;line-height:1.5;">${item.resposta}</p>
               </div>`
            : (isVendedorLogado
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

        // Menu Dropdown de 3 pontinhos para a avaliação do próprio usuário
        const menuDropdownHtml = isMinha ? `
            <div class="avaliacao-menu-wrapper" style="position:relative;display:inline-block;">
                <button type="button" class="btn-review-menu" data-id="${item.id}" title="Mais opções" aria-label="Mais opções">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                        <circle cx="12" cy="5" r="2"></circle>
                        <circle cx="12" cy="12" r="2"></circle>
                        <circle cx="12" cy="19" r="2"></circle>
                    </svg>
                </button>
                <div class="dropdown-review-menu" id="dropdown-review-${item.id}">
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
                        <div class="avaliacao-autor-box" style="display:flex;align-items:center;gap:10px;">
                            <div style="display:flex;align-items:center;">${avatarHtml}</div>
                            <div>
                                <div class="avaliacao-autor-nome" style="font-weight:700;font-size:13.5px;display:flex;align-items:center;gap:6px;">
                                    ${nomeAutor}
                                    ${isMinha ? '<span style="font-size:10.5px;background:#E2E8F0;color:#475569;padding:2px 6px;border-radius:4px;font-weight:700;">Você</span>' : ''}
                                </div>
                                <div style="font-size:11.5px;color:#94A3B8;">${formatarData(item.data)}</div>
                            </div>
                        </div>
                        <div style="display:flex;align-items:center;gap:10px;">
                            <div class="avaliacao-estrelas" style="color:#F59E0B;font-size:14px;letter-spacing:2px;">
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
        const { exibirToast } = window.ItaimVendedorUtils;
        const vendedor = window.ItaimVendedorDados?.obterVendedor() || {};
        const vendedorId = vendedor.id || null;

        const elReputacaoMedia = document.getElementById('stat-reputacao-media');
        const elReputacaoLegenda = document.getElementById('stat-reputacao-legenda');
        const elBadgeAvaliacoes = document.getElementById('badge-contador-avaliacoes');
        const containerAvaliacoes = document.getElementById('lista-avaliacoes-vendedor');
        const formAvaliacao = document.getElementById('form-nova-avaliacao');
        const inputNota = document.getElementById('input-nota-avaliacao');
        const inputAutor = document.getElementById('input-autor-avaliacao');
        const textareaComentario = document.getElementById('textarea-comentario');
        const labelNota = document.getElementById('label-nota-selecionada');
        const estrelasContainer = document.getElementById('estrelas-seletor');
        const boxForm = document.getElementById('box-form-avaliacao');

        // Busca usuário logado de forma ultra resiliente
        function obterUsuarioAtual() {
            let u = (window.ItaimSessao && typeof window.ItaimSessao.obterUsuarioLogado === 'function')
                ? window.ItaimSessao.obterUsuarioLogado()
                : null;
            if (!u) {
                try { u = JSON.parse(localStorage.getItem('itaim_usuario_logado') || 'null'); } catch (_) {}
            }
            if (!u) {
                try { u = JSON.parse(localStorage.getItem('itaim_perfil_usuario') || 'null'); } catch (_) {}
            }
            return u;
        }

        const usuarioLogado = obterUsuarioAtual();
        const isLogado = !!(usuarioLogado?.id || localStorage.getItem('itaim_token'));

        // Verifica se o usuário logado é o próprio vendedor
        function verificarProprioPerfil() {
            if (!usuarioLogado) return false;

            const meuId = String(usuarioLogado.id || usuarioLogado.userId || '').trim();
            const vId = String(vendedorId || vendedor?.id || vendedor?.userId || '').trim();
            if (meuId && vId && meuId === vId) return true;

            const meuEmail = (usuarioLogado.email || '').toLowerCase().trim();
            const vEmail = (vendedor?.email || '').toLowerCase().trim();
            if (meuEmail && vEmail && meuEmail === vEmail) return true;

            const meuUser = (usuarioLogado.username || usuarioLogado.usuario || '').toLowerCase().trim();
            const vUser = (vendedor?.username || vendedor?.usuario || '').toLowerCase().trim();
            if (meuUser && vUser && meuUser !== 'admin' && vUser !== 'admin' && meuUser === vUser) return true;

            const meuNome = (usuarioLogado.name || usuarioLogado.nome || '').toLowerCase().trim();
            const vNome = (vendedor?.name || vendedor?.nome || '').toLowerCase().trim();
            if (meuNome && vNome && meuNome !== 'vendedor' && vNome !== 'vendedor' && meuNome !== 'admin' && vNome !== 'admin' && meuNome === vNome) return true;

            // Se não tem parâmetros na URL E o vendedor atual tem os mesmos dados do usuário logado
            const params = new URLSearchParams(window.location.search);
            const temParam = Boolean(params.get('id') || params.get('sellerId') || params.get('userId') || params.get('email') || params.get('vendedor') || params.get('nome') || params.get('username'));
            if (!temParam && meuId && vId && meuId === vId) return true;

            return false;
        }

        const isVendedorLogado = isLogado && verificarProprioPerfil();

        // Preenche nome do autor logado no formulário
        const nomeLogado = usuarioLogado?.name || usuarioLogado?.nome || usuarioLogado?.username || '';
        if (inputAutor && nomeLogado) inputAutor.value = nomeLogado;
        const labelAutorVendedor = document.getElementById('vendedor-nome-autor-logado');
        if (labelAutorVendedor) labelAutorVendedor.textContent = nomeLogado || 'Visitante';

        // =====================================================================
        // BUSCA AVALIAÇÕES DA API REAL
        // =====================================================================
        let avaliacoes = [];
        let totalAvaliacoes = Number(vendedor.ratingCount || 0);
        let mediaGeral = totalAvaliacoes > 0 ? Number(vendedor.ratingAverage || 0) : 0.0;
        let usouApi = false;

        if (vendedorId && window.ItaimApi?.reviews?.listar) {
            try {
                const res = await window.ItaimApi.reviews.listar(vendedorId);
                if (res?.success && Array.isArray(res.avaliacoes)) {
                    avaliacoes = res.avaliacoes;
                    totalAvaliacoes = res.vendedor?.totalAvaliacoes ?? avaliacoes.length;
                    mediaGeral = totalAvaliacoes > 0 ? Number(res.vendedor?.mediaGeral || 0) : 0.0;
                    usouApi = true;
                }
            } catch (err) {
                console.info('[VendedorAvaliacoes] Fallback para dados locais:', err.message);
            }
        }

        // Fallback: dados do localStorage/ItaimAvaliacoes
        if (!usouApi && window.ItaimAvaliacoes) {
            const lista = window.ItaimAvaliacoes.obter(vendedor);
            const stats = window.ItaimAvaliacoes.calcularMedia(lista, vendedor);
            avaliacoes = lista.map(item => ({
                id: item.id,
                nota: item.nota,
                comentario: item.comentario,
                resposta: item.resposta || null,
                data: item.data || null,
                autor: typeof item.autor === 'object' ? item.autor : { nome: item.autor, avatar: null }
            }));
            totalAvaliacoes = stats.total;
            mediaGeral = totalAvaliacoes > 0 ? Number(stats.media || 0) : 0.0;
        }

        // Garante que com 0 avaliações a média seja exatamente 0.0
        if (totalAvaliacoes === 0) {
            mediaGeral = 0.0;
        }

        // =====================================================================
        // ATUALIZA INDICADORES DE REPUTAÇÃO (Média 0.0 quando sem avaliações)
        // =====================================================================
        function atualizarReputacao(media, total) {
            const totalNum = Number(total || 0);
            const mediaNum = totalNum > 0 ? Number(media || 0) : 0.0;
            const mediaText = totalNum > 0 ? `${mediaNum.toFixed(1)} ★` : '0.0 ★';
            const legendaText = `Avaliações (${totalNum})`;
            const badgeText = totalNum > 0 ? `${mediaNum.toFixed(1)} ★ (${totalNum})` : `0.0 ★ (${totalNum})`;

            if (elReputacaoMedia) elReputacaoMedia.textContent = mediaText;
            if (elReputacaoLegenda) elReputacaoLegenda.textContent = legendaText;
            if (elBadgeAvaliacoes) elBadgeAvaliacoes.textContent = badgeText;
        }

        atualizarReputacao(mediaGeral, totalAvaliacoes);

        // =====================================================================
        // CONTROLE DE VISIBILIDADE DO FORMULÁRIO (Limite de 1 avaliação)
        // =====================================================================
        function atualizarVisibilidadeFormulario(lista) {
            if (!boxForm) return;

            // Se for o perfil do próprio usuário vendedor, nunca exibe o formulário de avaliação
            if (isVendedorLogado) {
                boxForm.style.display = 'none';
                return;
            }

            // Limite de 1 avaliação por usuário: se o usuário logado já tiver feito avaliação, esconde o formulário
            const jaAvaliou = isLogado && Array.isArray(lista) && lista.some(item => ehMinhaAvaliacao(item, usuarioLogado));
            if (jaAvaliou) {
                boxForm.style.display = 'none';
            } else {
                boxForm.style.display = 'block';
            }
        }

        atualizarVisibilidadeFormulario(avaliacoes);

        // =====================================================================
        // RENDERIZA LISTA DE AVALIAÇÕES
        // =====================================================================
        function renderizarLista(lista) {
            if (!containerAvaliacoes) return;

            if (!lista || lista.length === 0) {
                // Se for o próprio vendedor, retira a frase de incentivo
                const subMensagemHtml = isVendedorLogado
                    ? '<p style="font-size:13.5px;margin:4px 0 0;color:#64748B;">Você ainda não possui avaliações de compradores.</p>'
                    : '<p style="font-size:13.5px;margin:4px 0 0;color:#64748B;">Seja o primeiro a deixar uma avaliação sobre este vendedor!</p>';

                containerAvaliacoes.innerHTML = `
                    <div class="avaliacoes-vazio" style="text-align:center;padding:32px 18px;border-radius:12px;border:1px dashed #CBD5E1;margin-top:10px;">
                        <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="#94A3B8" stroke-width="1.8" style="margin-bottom:8px;">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                        <h4 style="margin:0;font-size:15px;font-weight:700;">Nenhuma avaliação ainda</h4>
                        ${subMensagemHtml}
                    </div>`;
                return;
            }

            containerAvaliacoes.innerHTML = lista.map(item => renderizarCard(item, isVendedorLogado, usuarioLogado)).join('');
            vincularEventosResposta(lista);
            vincularEventosDropdown(lista);
        }

        // =====================================================================
        // EVENTOS: DROPDOWN DE 3 PONTINHOS (EDITAR E EXCLUIR)
        // =====================================================================
        function vincularEventosDropdown(lista) {
            if (!containerAvaliacoes) return;

            // Abrir / fechar dropdown ao clicar nos 3 pontinhos
            containerAvaliacoes.querySelectorAll('.btn-review-menu').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const id = btn.getAttribute('data-id');
                    const dropdown = document.getElementById(`dropdown-review-${id}`);

                    // Fecha outros dropdowns abertos
                    document.querySelectorAll('.dropdown-review-menu').forEach(d => {
                        if (d !== dropdown) d.classList.remove('aberto');
                    });

                    if (dropdown) {
                        dropdown.classList.toggle('aberto');
                    }
                });
            });

            // Ação: Excluir avaliação
            containerAvaliacoes.querySelectorAll('.btn-acao-excluir-review').forEach(btn => {
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

                        // Remove da lista em memória
                        const idx = lista.findIndex(a => String(a.id) === String(id));
                        if (idx !== -1) {
                            lista.splice(idx, 1);
                        }

                        // Sincroniza também no localStorage caso ItaimAvaliacoes esteja ativo
                        if (window.ItaimAvaliacoes?.excluir) {
                            try { window.ItaimAvaliacoes.excluir(vendedor, id); } catch (_) {}
                        }

                        novoTotalCalc = lista.length;
                        if (novoTotalCalc === 0) {
                            novaMediaCalc = 0.0;
                        } else if (novaMediaCalc === null) {
                            const soma = lista.reduce((acc, c) => acc + (Number(c.nota) || 0), 0);
                            novaMediaCalc = parseFloat((soma / novoTotalCalc).toFixed(1));
                        }

                        mediaGeral = novaMediaCalc;
                        totalAvaliacoes = novoTotalCalc;

                        atualizarReputacao(mediaGeral, totalAvaliacoes);
                        atualizarVisibilidadeFormulario(lista);
                        renderizarLista(lista);
                        exibirToast('Avaliação excluída com sucesso!');
                    } catch (err) {
                        exibirToast(err.message || 'Erro ao excluir avaliação.');
                        btn.disabled = false;
                    }
                });
            });

            // Ação: Iniciar edição inline da avaliação
            containerAvaliacoes.querySelectorAll('.btn-acao-editar-review').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const id = btn.getAttribute('data-id');
                    const dropdown = document.getElementById(`dropdown-review-${id}`);
                    if (dropdown) dropdown.classList.remove('aberto');

                    const item = lista.find(a => String(a.id) === String(id));
                    if (!item) return;

                    iniciarEdicaoInline(item, lista);
                });
            });
        }

        // Fecha menus ao clicar fora
        document.addEventListener('click', () => {
            document.querySelectorAll('.dropdown-review-menu').forEach(d => d.classList.remove('aberto'));
        });

        // =====================================================================
        // MODO EDIÇÃO INLINE DA AVALIAÇÃO
        // =====================================================================
        function iniciarEdicaoInline(item, lista) {
            const card = containerAvaliacoes.querySelector(`.item-avaliacao-card[data-review-id="${item.id}"]`);
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

            // Interação das estrelas na edição
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

            // Botão Cancelar
            boxEdicao.querySelector('.btn-cancelar-edicao')?.addEventListener('click', () => {
                boxEdicao.style.display = 'none';
                boxNormal.style.display = 'block';
            });

            // Botão Salvar
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

                    // Atualiza item em memória
                    item.nota = notaEdicao;
                    item.comentario = novoTexto;

                    if (window.ItaimAvaliacoes?.obterChave) {
                        try {
                            const chave = 'itaim_avaliacoes_' + window.ItaimAvaliacoes.obterChave(vendedor);
                            const salvas = JSON.parse(localStorage.getItem(chave) || '[]');
                            const sIdx = salvas.findIndex(s => String(s.id) === String(item.id));
                            if (sIdx !== -1) {
                                salvas[sIdx].nota = notaEdicao;
                                salvas[sIdx].comentario = novoTexto;
                                localStorage.setItem(chave, JSON.stringify(salvas));
                            }
                        } catch (_) {}
                    }

                    if (novaMediaCalc === null || novoTotalCalc === null) {
                        novoTotalCalc = lista.length;
                        const soma = lista.reduce((acc, c) => acc + (Number(c.nota) || 0), 0);
                        novaMediaCalc = novoTotalCalc > 0 ? parseFloat((soma / novoTotalCalc).toFixed(1)) : 0.0;
                    }

                    mediaGeral = novaMediaCalc;
                    totalAvaliacoes = novoTotalCalc;

                    atualizarReputacao(mediaGeral, totalAvaliacoes);
                    renderizarLista(lista);
                    exibirToast('Avaliação atualizada com sucesso!');
                } catch (err) {
                    exibirToast(err.message || 'Erro ao atualizar avaliação.');
                    if (btnSalvar) { btnSalvar.disabled = false; btnSalvar.textContent = 'Salvar Alterações'; }
                }
            });
        }

        // =====================================================================
        // EVENTOS: RESPONDER AVALIAÇÃO (PARA O PRÓPRIO VENDEDOR)
        // =====================================================================
        function vincularEventosResposta(lista) {
            if (!isVendedorLogado || !containerAvaliacoes) return;

            containerAvaliacoes.querySelectorAll('.btn-responder-avaliacao').forEach(btn => {
                const id = btn.getAttribute('data-id');
                const form = containerAvaliacoes.querySelector(`.form-resposta-inline[data-id="${id}"]`);
                btn.addEventListener('click', () => {
                    btn.style.display = 'none';
                    if (form) form.style.display = 'block';
                });
            });

            containerAvaliacoes.querySelectorAll('.btn-cancelar-resposta').forEach(btn => {
                const id = btn.getAttribute('data-id');
                const form = containerAvaliacoes.querySelector(`.form-resposta-inline[data-id="${id}"]`);
                const btnResponder = containerAvaliacoes.querySelector(`.btn-responder-avaliacao[data-id="${id}"]`);
                btn.addEventListener('click', () => {
                    if (form) form.style.display = 'none';
                    if (btnResponder) btnResponder.style.display = 'inline-block';
                });
            });

            containerAvaliacoes.querySelectorAll('.form-resposta-inline').forEach(form => {
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

        renderizarLista(avaliacoes);

        // =====================================================================
        // SELETOR VISUAL DE ESTRELAS NO FORMULÁRIO (1 a 5)
        // =====================================================================
        if (estrelasContainer) {
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
        // ENVIO DO FORMULÁRIO DE AVALIAÇÃO
        // =====================================================================
        if (formAvaliacao && !isVendedorLogado) {
            formAvaliacao.addEventListener('submit', async (e) => {
                e.preventDefault();

                const nota = parseInt(inputNota?.value || '5', 10);
                const comentario = textareaComentario?.value.trim() || '';

                if (!comentario) {
                    exibirToast('Por favor, escreva um comentário sobre a sua negociação.');
                    return;
                }

                if (!isLogado) {
                    exibirToast('Você precisa estar logado para avaliar este vendedor.');
                    return;
                }

                const btnEnviar = document.getElementById('btn-enviar-avaliacao');
                if (btnEnviar) {
                    btnEnviar.disabled = true;
                    const span = btnEnviar.querySelector('span');
                    if (span) span.textContent = 'Enviando...';
                }

                try {
                    let novaAvaliacao = null;

                    // Tenta via API real
                    if (vendedorId && window.ItaimApi?.reviews?.enviar) {
                        const res = await window.ItaimApi.reviews.enviar(vendedorId, { rating: nota, comment: comentario });
                        if (res?.review) {
                            novaAvaliacao = {
                                id: res.review.id,
                                nota: res.review.rating,
                                comentario: res.review.comment,
                                resposta: res.review.reply || null,
                                data: res.review.createdAt,
                                autor: {
                                    id: res.review.author?.id || usuarioLogado?.id,
                                    nome: res.review.author?.name || nomeLogado,
                                    username: res.review.author?.username || usuarioLogado?.username,
                                    avatar: res.review.author?.avatar || null
                                }
                            };
                            mediaGeral = res.novaMedia ?? mediaGeral;
                            totalAvaliacoes = res.totalAvaliacoes ?? (totalAvaliacoes + 1);
                        }
                    }

                    // Fallback: adiciona localmente
                    if (!novaAvaliacao && window.ItaimAvaliacoes) {
                        window.ItaimAvaliacoes.adicionar(vendedor, { autor: nomeLogado, nota, comentario });
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
                        atualizarReputacao(mediaGeral, totalAvaliacoes);
                        atualizarVisibilidadeFormulario(avaliacoes);
                        renderizarLista(avaliacoes);
                    }

                    if (textareaComentario) textareaComentario.value = '';
                    exibirToast('Avaliação enviada com sucesso!');
                } catch (err) {
                    exibirToast(err.message || 'Erro ao enviar avaliação. Tente novamente.');
                } finally {
                    if (btnEnviar) {
                        btnEnviar.disabled = false;
                        const span = btnEnviar.querySelector('span');
                        if (span) span.textContent = 'Enviar Avaliação';
                    }
                }
            });
        }
    }

    window.ItaimVendedorAvaliacoes = { inicializar };
})();
