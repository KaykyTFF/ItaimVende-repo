/**
 * ITAIM VENDE - VENDEDOR: AVALIAÇÕES, ESTRELAS E REPUTAÇÃO
 * Arquivo: frontend/js/pages/perfil/vendedor/vendedor-avaliacoes.js
 */

(function () {
    'use strict';

    function inicializar() {
        const { exibirToast } = window.ItaimVendedorUtils;
        const vendedor = window.ItaimVendedorDados?.obterVendedor() || {};

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

        // Preenche o nome do autor com o usuário logado atualmente (se houver)
        const usuarioLogado = (window.ItaimSessao && typeof window.ItaimSessao.obterUsuarioLogado === 'function')
            ? window.ItaimSessao.obterUsuarioLogado()
            : null;

        if (inputAutor && usuarioLogado && (usuarioLogado.name || usuarioLogado.nome)) {
            inputAutor.value = usuarioLogado.name || usuarioLogado.nome;
        }

        function atualizarReputacaoELista() {
            if (!window.ItaimAvaliacoes) return;

            const lista = window.ItaimAvaliacoes.obter(vendedor);
            const stats = window.ItaimAvaliacoes.calcularMedia(lista, vendedor);

            const mediaTexto = stats.total > 0 ? stats.estrelasFormatadas : `${Number(vendedor.ratingAverage || 5.0).toFixed(1)} ★`;
            const totalReviews = stats.total > 0 ? stats.total : (vendedor.ratingCount || 0);

            if (elReputacaoMedia) elReputacaoMedia.textContent = mediaTexto;
            if (elReputacaoLegenda) elReputacaoLegenda.textContent = `Avaliações (${totalReviews})`;
            if (elBadgeAvaliacoes) elBadgeAvaliacoes.textContent = `${mediaTexto} (${totalReviews})`;

            // Renderiza lista de comentários
            if (containerAvaliacoes) {
                if (lista.length === 0) {
                    containerAvaliacoes.innerHTML = `
                        <div class="avaliacoes-vazio" style="text-align: center; padding: 32px 18px; border-radius: 12px; border: 1px dashed #CBD5E1; margin-top: 10px;">
                            <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="#94A3B8" stroke-width="1.8" style="margin-bottom: 8px;">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                            </svg>
                            <h4>Nenhuma avaliação ainda</h4>
                            <p style="font-size: 13.5px; margin: 0;">Seja o primeiro a deixar uma avaliação e comentário sobre este vendedor!</p>
                        </div>
                    `;
                } else {
                    containerAvaliacoes.innerHTML = lista.map(item => {
                        const notaNum = Math.round(item.nota || 5);
                        const estrelasTxt = '★'.repeat(notaNum) + '☆'.repeat(5 - notaNum);
                        const inicial = (item.autor || 'C').charAt(0).toUpperCase();

                        return `
                            <div class="item-avaliacao-card" style="padding: 14px 0;">
                                <div class="avaliacao-topo-row" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; flex-wrap: wrap; gap: 8px;">
                                    <div class="avaliacao-autor-box" style="display: flex; align-items: center; gap: 10px;">
                                        <div class="avaliacao-avatar-mini" style="width: 34px; height: 34px; border-radius: 50%; font-weight: 800; display: flex; align-items: center; justify-content: center; font-size: 14px;">
                                            ${inicial}
                                        </div>
                                        <div>
                                            <div class="avaliacao-autor-nome" style="font-weight: 700; font-size: 13.5px;">
                                                ${item.autor}
                                            </div>
                                            <div style="font-size: 11.5px; color: #94A3B8;">
                                                ${item.data || 'Recente'}
                                            </div>
                                        </div>
                                    </div>
                                    <div style="display: flex; align-items: center; gap: 12px;">
                                        <div class="avaliacao-estrelas" style="color: #F59E0B; font-size: 14px; letter-spacing: 2px;">
                                            ${estrelasTxt} <span style="font-size: 12px; font-weight: 700;">(${Number(item.nota).toFixed(1)})</span>
                                        </div>
                                        <button type="button" class="btn-excluir-avaliacao" data-id="${item.id}" title="Excluir este comentário">
                                            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                            <span>Excluir</span>
                                        </button>
                                    </div>
                                </div>
                                <p class="avaliacao-comentario-txt" style="font-size: 13.5px; line-height: 1.5; margin: 4px 0 0 44px;">
                                    ${item.comentario}
                                </p>
                            </div>
                        `;
                    }).join('');

                    containerAvaliacoes.querySelectorAll('.btn-excluir-avaliacao').forEach(btn => {
                        btn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            const id = btn.getAttribute('data-id');
                            if (btn.getAttribute('data-confirming') === 'true') {
                                if (window.ItaimAvaliacoes) {
                                    window.ItaimAvaliacoes.excluir(vendedor, id);
                                    atualizarReputacaoELista();
                                    exibirToast('Comentário excluído com sucesso!');
                                }
                            } else {
                                btn.setAttribute('data-confirming', 'true');
                                btn.innerHTML = `
                                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    <span>Confirmar?</span>
                                `;
                                btn.style.backgroundColor = '#DC2626';
                                btn.style.color = '#FFFFFF';
                                btn.style.borderColor = '#B91C1C';

                                setTimeout(() => {
                                    if (btn && btn.getAttribute('data-confirming') === 'true') {
                                        btn.removeAttribute('data-confirming');
                                        btn.innerHTML = `
                                            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                            <span>Excluir</span>
                                        `;
                                        btn.style.backgroundColor = '#FEF2F2';
                                        btn.style.color = '#EF4444';
                                        btn.style.borderColor = '#FECACA';
                                    }
                                }, 4000);
                            }
                        });
                    });
                }
            }
        }

        // Seletor visual de estrelas (1 a 5)
        if (estrelasContainer) {
            const estrelas = estrelasContainer.querySelectorAll('.estrela-item');

            function destacarEstrelas(qtd) {
                estrelas.forEach(estrela => {
                    const valor = parseInt(estrela.dataset.valor);
                    if (valor <= qtd) {
                        estrela.classList.add('ativa');
                        estrela.style.color = '#F59E0B';
                    } else {
                        estrela.classList.remove('ativa');
                        estrela.style.color = '#CBD5E1';
                    }
                });
            }

            estrelas.forEach(estrela => {
                estrela.addEventListener('click', () => {
                    const valor = parseInt(estrela.dataset.valor);
                    if (inputNota) inputNota.value = valor;
                    if (labelNota) labelNota.textContent = `(${valor}.0)`;
                    destacarEstrelas(valor);
                });

                estrela.addEventListener('mouseenter', () => {
                    const valor = parseInt(estrela.dataset.valor);
                    destacarEstrelas(valor);
                });
            });

            estrelasContainer.addEventListener('mouseleave', () => {
                const notaAtual = parseInt(inputNota?.value || '5');
                destacarEstrelas(notaAtual);
            });
        }

        // Envio do formulário de avaliação
        if (formAvaliacao) {
            formAvaliacao.addEventListener('submit', (e) => {
                e.preventDefault();

                const nota = parseFloat(inputNota?.value || '5');
                const autor = inputAutor?.value.trim() || 'Visitante';
                const comentario = textareaComentario?.value.trim() || '';

                if (!comentario) {
                    alert('Por favor, escreva um comentário sobre a sua negociação.');
                    return;
                }

                if (window.ItaimAvaliacoes) {
                    window.ItaimAvaliacoes.adicionar(vendedor, {
                        autor: autor,
                        nota: nota,
                        comentario: comentario
                    });

                    atualizarReputacaoELista();
                    if (textareaComentario) textareaComentario.value = '';
                    exibirToast('Avaliação enviada com sucesso!');
                }
            });
        }

        // Sincroniza nome do autor logado
        const usuarioAtual = (window.ItaimSessao && window.ItaimSessao.obterUsuarioLogado()) || {};
        const nomeLogadoVendedor = usuarioAtual.name || usuarioAtual.nome || usuarioAtual.username || 'Visitante';
        const labelAutorVendedor = document.getElementById('vendedor-nome-autor-logado');
        if (labelAutorVendedor) labelAutorVendedor.textContent = nomeLogadoVendedor;
        const inputAutorVendedor = document.getElementById('input-autor-avaliacao');
        if (inputAutorVendedor) inputAutorVendedor.value = nomeLogadoVendedor;

        atualizarReputacaoELista();
    }

    window.ItaimVendedorAvaliacoes = {
        inicializar
    };
})();
