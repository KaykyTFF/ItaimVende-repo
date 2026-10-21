/**
 * ITAIM VENDE - PERFIL: AVALIAÇÕES E REPUTAÇÃO
 * Arquivo: frontend/js/pages/perfil/perfil/perfil-avaliacoes.js
 *
 * Busca avaliações reais da API (/api/v1/reviews/user/:userId),
 * conecta o formulário de avaliação para visitantes (#perfil-form-nova-avaliacao)
 * e permite que o próprio vendedor responda cada avaliação via PATCH /reviews/:id/reply.
 * Mantém fallback para ItaimAvaliacoes (localStorage) quando offline.
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

    function renderizarCard(item, isProprioUsuario) {
        const notaNum = Math.min(5, Math.max(1, Math.round(item.nota || 5)));
        const estrelasTxt = '★'.repeat(notaNum) + '☆'.repeat(5 - notaNum);
        const nomeAutor = item.autor?.nome || item.autor || 'Comprador';
        const inicial = nomeAutor.charAt(0).toUpperCase();
        const avatarAutor = item.autor?.avatar
            ? (window.ItaimApi?.resolverUrlImagem?.(item.autor.avatar) || item.autor.avatar)
            : null;

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

        return `
            <div class="item-avaliacao-card" data-review-id="${item.id}" style="padding:14px 0;border-bottom:1px solid #F1F5F9;">
                <div class="avaliacao-topo-row" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;flex-wrap:wrap;gap:8px;">
                    <div style="display:flex;align-items:center;gap:10px;">
                        <div style="display:flex;align-items:center;">${avatarHtml}</div>
                        <div>
                            <div style="font-weight:700;font-size:13.5px;color:#1E293B;">${nomeAutor}</div>
                            <div style="font-size:11.5px;color:#94A3B8;">${formatarData(item.data)}</div>
                        </div>
                    </div>
                    <div style="color:#F59E0B;font-size:14px;letter-spacing:2px;">
                        ${estrelasTxt} <span style="font-size:12px;font-weight:700;color:#64748B;">(${Number(item.nota).toFixed(1)})</span>
                    </div>
                </div>
                ${item.comentario ? `<p style="font-size:13.5px;color:#475569;line-height:1.5;margin:4px 0 0 44px;">${item.comentario}</p>` : ''}
                ${respostaHtml}
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
        // ou se o ID/email do logado coincidir com o perfil exibido
        const isProprioUsuario = !!isPerfilProprio || (!!usuarioLogado?.id && !!perfilExibido?.id && usuarioLogado.id === perfilExibido.id);

        // Se for o próprio perfil, esconde formulário de autoavaliação
        if (boxForm) {
            boxForm.style.display = isProprioUsuario ? 'none' : 'block';
        }

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
        let mediaGeral = Number(perfilExibido.ratingAverage || perfilExibido.avaliacao || 5.0);
        let totalAvaliacoes = perfilExibido.ratingCount || perfilExibido.totalAvaliacoes || 0;
        let usouApi = false;

        const idBusca = userId || perfilExibido.email || perfilExibido.username;
        if (idBusca && window.ItaimApi?.reviews?.listar) {
            try {
                const res = await window.ItaimApi.reviews.listar(idBusca);
                if (res?.success && Array.isArray(res.avaliacoes)) {
                    avaliacoes = res.avaliacoes;
                    mediaGeral = res.vendedor?.mediaGeral ?? mediaGeral;
                    totalAvaliacoes = res.vendedor?.totalAvaliacoes ?? totalAvaliacoes;
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
            if (stats.total > 0) {
                mediaGeral = stats.media;
                totalAvaliacoes = stats.total;
            }
        }

        // =====================================================================
        // ATUALIZA INDICADORES DE REPUTAÇÃO
        // =====================================================================
        function atualizarIndicadores(media, total) {
            const mediaStr = total > 0 ? `${Number(media).toFixed(1)} ★` : 'Novo';
            const legendaStr = total > 0 ? `Avaliações (${total})` : 'Sem avaliações';
            if (statAvaliacao) statAvaliacao.textContent = mediaStr;
            if (statLegenda) statLegenda.textContent = legendaStr;
            if (badgeAvaliacoes) badgeAvaliacoes.textContent = `${mediaStr} (${total})`;
        }

        atualizarIndicadores(mediaGeral, totalAvaliacoes);

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
                        <h4 style="font-size:14px;color:#1E293B;margin:0 0 4px;">Nenhuma avaliação ainda</h4>
                        <p style="font-size:13px;color:#64748B;margin:0;">As avaliações e comentários deixados por compradores aparecerão aqui.</p>
                    </div>`;
                return;
            }

            container.innerHTML = lista.map(item => renderizarCard(item, isProprioUsuario)).join('');
            vincularEventosResposta(lista);
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
        // SELETOR VISUAL DE ESTRELAS (1 a 5) NO FORMULÁRIO DO PERFIL
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

                    // 1. Tenta envio via API real
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
                                    id: res.review.author?.id,
                                    nome: res.review.author?.name || usuarioLogado?.name || 'Comprador',
                                    avatar: res.review.author?.avatar || null
                                }
                            };

                            // Recalcula média atômica
                            mediaGeral = res.novaMedia ?? mediaGeral;
                            totalAvaliacoes = res.totalAvaliacoes ?? (totalAvaliacoes + 1);
                            atualizarIndicadores(mediaGeral, totalAvaliacoes);
                        }
                    }

                    // 2. Fallback local se a API estiver indisponível
                    if (!novaAvaliacao && window.ItaimAvaliacoes) {
                        const nomeLogado = usuarioLogado?.name || usuarioLogado?.nome || 'Comprador';
                        window.ItaimAvaliacoes.adicionar(perfilExibido, { autor: nomeLogado, nota, comentario });
                        novaAvaliacao = {
                            id: Date.now().toString(),
                            nota,
                            comentario,
                            resposta: null,
                            data: new Date().toISOString(),
                            autor: { nome: nomeLogado, avatar: null }
                        };
                        totalAvaliacoes += 1;
                        atualizarIndicadores(mediaGeral, totalAvaliacoes);
                    }

                    if (novaAvaliacao) {
                        avaliacoes.unshift(novaAvaliacao);
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
