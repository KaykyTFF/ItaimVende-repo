/**
 * ITAIM VENDE - VENDEDOR: AVALIAÇÕES, ESTRELAS E REPUTAÇÃO
 * Arquivo: frontend/js/pages/perfil/vendedor/vendedor-avaliacoes.js
 *
 * Busca avaliações reais da API (/api/v1/reviews/user/:userId),
 * exibe lista com resposta do vendedor e envia novas avaliações via POST.
 * Mantém fallback para localStorage (window.ItaimAvaliacoes) quando o
 * backend estiver offline ou o vendedor não tiver ID resolvido.
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
     * Renderiza o HTML de um único card de avaliação
     */
    function renderizarCard(item, isVendedorLogado) {
        const notaNum = Math.min(5, Math.max(1, Math.round(item.nota || 5)));
        const estrelasTxt = '★'.repeat(notaNum) + '☆'.repeat(5 - notaNum);
        const nomeAutor = item.autor?.nome || item.autor || 'Comprador';
        const inicial = nomeAutor.charAt(0).toUpperCase();
        const avatarAutor = item.autor?.avatar
            ? (window.ItaimApi?.resolverUrlImagem?.(item.autor.avatar) || item.autor.avatar)
            : null;

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

        return `
            <div class="item-avaliacao-card" data-review-id="${item.id}" style="padding:14px 0;border-bottom:1px solid #F1F5F9;">
                <div class="avaliacao-topo-row" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;flex-wrap:wrap;gap:8px;">
                    <div class="avaliacao-autor-box" style="display:flex;align-items:center;gap:10px;">
                        <div style="display:flex;align-items:center;">${avatarHtml}</div>
                        <div>
                            <div class="avaliacao-autor-nome" style="font-weight:700;font-size:13.5px;color:#1E293B;">${nomeAutor}</div>
                            <div style="font-size:11.5px;color:#94A3B8;">${formatarData(item.data)}</div>
                        </div>
                    </div>
                    <div class="avaliacao-estrelas" style="color:#F59E0B;font-size:14px;letter-spacing:2px;">
                        ${estrelasTxt} <span style="font-size:12px;font-weight:700;color:#64748B;">(${Number(item.nota).toFixed(1)})</span>
                    </div>
                </div>
                ${item.comentario ? `<p class="avaliacao-comentario-txt" style="font-size:13.5px;color:#475569;line-height:1.5;margin:4px 0 0 44px;">${item.comentario}</p>` : ''}
                ${respostaHtml}
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

        // Usuário logado
        const usuarioLogado = (window.ItaimSessao && typeof window.ItaimSessao.obterUsuarioLogado === 'function')
            ? window.ItaimSessao.obterUsuarioLogado()
            : null;
        const isLogado = !!usuarioLogado?.id;
        // Verifica se o usuário logado é o próprio vendedor (para exibir botão de responder)
        const isVendedorLogado = isLogado && usuarioLogado.id === vendedorId;
        // Esconde formulário de avaliação se for o próprio vendedor
        if (isVendedorLogado && boxForm) {
            boxForm.style.display = 'none';
        }

        // Preenche nome do autor logado
        const nomeLogado = usuarioLogado?.name || usuarioLogado?.nome || usuarioLogado?.username || '';
        if (inputAutor && nomeLogado) inputAutor.value = nomeLogado;
        const labelAutorVendedor = document.getElementById('vendedor-nome-autor-logado');
        if (labelAutorVendedor) labelAutorVendedor.textContent = nomeLogado || 'Visitante';

        // =====================================================================
        // BUSCA AVALIAÇÕES DA API REAL
        // =====================================================================
        let avaliacoes = [];
        let mediaGeral = Number(vendedor.ratingAverage || 5.0);
        let totalAvaliacoes = vendedor.ratingCount || 0;
        let usouApi = false;

        if (vendedorId && window.ItaimApi?.reviews?.listar) {
            try {
                const res = await window.ItaimApi.reviews.listar(vendedorId);
                if (res?.success && Array.isArray(res.avaliacoes)) {
                    avaliacoes = res.avaliacoes;
                    mediaGeral = res.vendedor?.mediaGeral ?? mediaGeral;
                    totalAvaliacoes = res.vendedor?.totalAvaliacoes ?? totalAvaliacoes;
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
        function atualizarReputacao(media, total) {
            const mediaText = total > 0 ? `${Number(media).toFixed(1)} ★` : `${Number(media).toFixed(1)} ★`;
            const legendaText = `Avaliações (${total})`;
            const badgeText = `${Number(media).toFixed(1)} ★ (${total})`;
            if (elReputacaoMedia) elReputacaoMedia.textContent = mediaText;
            if (elReputacaoLegenda) elReputacaoLegenda.textContent = legendaText;
            if (elBadgeAvaliacoes) elBadgeAvaliacoes.textContent = badgeText;
        }

        atualizarReputacao(mediaGeral, totalAvaliacoes);

        // =====================================================================
        // RENDERIZA LISTA DE AVALIAÇÕES
        // =====================================================================
        function renderizarLista(lista) {
            if (!containerAvaliacoes) return;
            if (lista.length === 0) {
                containerAvaliacoes.innerHTML = `
                    <div class="avaliacoes-vazio" style="text-align:center;padding:32px 18px;border-radius:12px;border:1px dashed #CBD5E1;margin-top:10px;">
                        <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="#94A3B8" stroke-width="1.8" style="margin-bottom:8px;">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                        <h4>Nenhuma avaliação ainda</h4>
                        <p style="font-size:13.5px;margin:0;">Seja o primeiro a deixar uma avaliação sobre este vendedor!</p>
                    </div>`;
                return;
            }

            containerAvaliacoes.innerHTML = lista.map(item => renderizarCard(item, isVendedorLogado)).join('');
            vincularEventosResposta(lista);
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
                        // Atualiza localmente sem nova requisição
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
        // SELETOR VISUAL DE ESTRELAS (1 a 5)
        // =====================================================================
        if (estrelasContainer) {
            const estrelas = estrelasContainer.querySelectorAll('.estrela-item');

            function destacarEstrelas(qtd) {
                estrelas.forEach(estrela => {
                    const valor = parseInt(estrela.dataset.valor);
                    estrela.classList.toggle('ativa', valor <= qtd);
                    estrela.style.color = valor <= qtd ? '#F59E0B' : '#CBD5E1';
                });
            }

            estrelas.forEach(estrela => {
                estrela.addEventListener('click', () => {
                    const valor = parseInt(estrela.dataset.valor);
                    if (inputNota) inputNota.value = valor;
                    if (labelNota) labelNota.textContent = `(${valor}.0)`;
                    destacarEstrelas(valor);
                });
                estrela.addEventListener('mouseenter', () => destacarEstrelas(parseInt(estrela.dataset.valor)));
            });
            estrelasContainer.addEventListener('mouseleave', () => {
                destacarEstrelas(parseInt(inputNota?.value || '5'));
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
                if (btnEnviar) { btnEnviar.disabled = true; btnEnviar.querySelector('span').textContent = 'Enviando...'; }

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
                                    id: res.review.author?.id,
                                    nome: res.review.author?.name || nomeLogado,
                                    avatar: res.review.author?.avatar || null
                                }
                            };
                            // Atualiza média localmente
                            mediaGeral = res.novaMedia ?? mediaGeral;
                            totalAvaliacoes = res.totalAvaliacoes ?? (totalAvaliacoes + 1);
                            atualizarReputacao(mediaGeral, totalAvaliacoes);
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
                            autor: { nome: nomeLogado, avatar: null }
                        };
                    }

                    if (novaAvaliacao) {
                        avaliacoes.unshift(novaAvaliacao);
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
