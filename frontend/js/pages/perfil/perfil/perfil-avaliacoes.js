/**
 * ITAIM VENDE - PERFIL: AVALIAÇÕES E REPUTAÇÃO
 * Arquivo: frontend/js/pages/perfil/perfil/perfil-avaliacoes.js
 */

(function () {
    'use strict';

    function inicializar() {
        const { exibirToast } = window.ItaimPerfilUtils;
        const perfilExibido = window.ItaimPerfilDados?.obterPerfil() || {};

        const statAvaliacao = document.getElementById('stat-avaliacoes-texto');
        const statLegenda = document.getElementById('stat-avaliacoes-legenda');
        const badgeAvaliacoes = document.getElementById('perfil-badge-avaliacoes');
        const container = document.getElementById('lista-avaliacoes-perfil');
        const formAvaliacaoPerfil = document.getElementById('perfil-form-nova-avaliacao');

        const qtdAvaliacoes = perfilExibido.ratingCount !== undefined
            ? perfilExibido.ratingCount
            : (perfilExibido.totalAvaliacoes || 0);
        const mediaAvaliacao = Number(perfilExibido.ratingAverage || perfilExibido.avaliacao || 5.0).toFixed(1);
        const avaliacaoFormatada = qtdAvaliacoes > 0 ? `${mediaAvaliacao} ★` : 'Novo';
        const legendaAvaliacao = qtdAvaliacoes > 0 ? `Avaliações (${qtdAvaliacoes})` : 'Sem avaliações';

        if (statAvaliacao) statAvaliacao.textContent = avaliacaoFormatada;
        if (statLegenda) statLegenda.textContent = legendaAvaliacao;
        if (badgeAvaliacoes) badgeAvaliacoes.textContent = `${avaliacaoFormatada} (${qtdAvaliacoes})`;

        function renderizarAvaliacoesPerfil() {
            if (!window.ItaimAvaliacoes) return;
            const avaliacoes = window.ItaimAvaliacoes.obter(perfilExibido);
            const stats = window.ItaimAvaliacoes.calcularMedia(avaliacoes, perfilExibido);
            const totalReviews = stats.total > 0 ? stats.total : qtdAvaliacoes;
            const valorFormatado = stats.total > 0 ? stats.estrelasFormatadas : avaliacaoFormatada;

            if (statAvaliacao) statAvaliacao.textContent = valorFormatado;
            if (statLegenda) statLegenda.textContent = `Avaliações (${totalReviews})`;
            if (badgeAvaliacoes) badgeAvaliacoes.textContent = `${valorFormatado} (${totalReviews})`;

            if (!container) return;

            if (avaliacoes.length === 0) {
                container.innerHTML = `
                    <div class="avaliacoes-vazio" style="text-align: center; padding: 32px 18px; border-radius: 12px; border: 1px dashed #CBD5E1;">
                        <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="#94A3B8" stroke-width="1.8" style="margin-bottom: 8px;">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                        <h4>Nenhuma avaliação ainda</h4>
                        <p style="font-size: 13.5px; margin: 0;">As avaliações e comentários deixados por compradores aparecerão aqui.</p>
                    </div>
                `;
            } else {
                container.innerHTML = avaliacoes.map(item => {
                    const notaNum = Math.round(item.nota || 5);
                    const estrelasTxt = '★'.repeat(notaNum) + '☆'.repeat(5 - notaNum);
                    const inicial = (item.autor || 'C').charAt(0).toUpperCase();

                    return `
                        <div class="item-avaliacao-card" style="padding: 14px 0; border-bottom: 1px solid #F1F5F9;">
                            <div class="avaliacao-topo-row" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; flex-wrap: wrap; gap: 8px;">
                                <div class="avaliacao-autor-box" style="display: flex; align-items: center; gap: 10px;">
                                    <div class="avaliacao-avatar-mini" style="width: 34px; height: 34px; border-radius: 50%; background: #DCFCE7; color: #166534; font-weight: 800; display: flex; align-items: center; justify-content: center; font-size: 14px; border: 1px solid #BBF7D0;">
                                        ${inicial}
                                    </div>
                                    <div>
                                        <div class="avaliacao-autor-nome" style="font-weight: 700; font-size: 13.5px; color: #1E293B;">
                                            ${item.autor}
                                        </div>
                                        <div style="font-size: 11.5px; color: #94A3B8;">
                                            ${item.data || 'Recente'}
                                        </div>
                                    </div>
                                </div>
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <div class="avaliacao-estrelas" style="color: #F59E0B; font-size: 14px; letter-spacing: 2px;">
                                        ${estrelasTxt} <span style="font-size: 12px; font-weight: 700; color: #64748B;">(${Number(item.nota).toFixed(1)})</span>
                                    </div>
                                </div>
                            </div>
                            <p class="avaliacao-comentario-txt" style="font-size: 13.5px; color: #475569; line-height: 1.5; margin: 4px 0 0 44px;">
                                ${item.comentario}
                            </p>
                        </div>
                    `;
                }).join('');
            }
        }

        renderizarAvaliacoesPerfil();

        if (formAvaliacaoPerfil) {
            formAvaliacaoPerfil.addEventListener('submit', (e) => {
                e.preventDefault();
                const inputNotaPerfil = document.getElementById('perfil-input-nota');
                const nota = parseFloat(inputNotaPerfil?.value || '5');
                const inputAutor = document.getElementById('perfil-input-autor');
                const textarea = document.getElementById('perfil-textarea-comentario');
                const autor = inputAutor?.value.trim() || 'Comprador';
                const comentario = textarea?.value.trim() || '';

                if (!comentario) {
                    alert('Por favor, escreva um comentário sobre a sua experiência.');
                    return;
                }

                if (window.ItaimAvaliacoes) {
                    window.ItaimAvaliacoes.adicionar(perfilExibido, {
                        autor: autor,
                        nota: nota,
                        comentario: comentario
                    });

                    renderizarAvaliacoesPerfil();
                    if (textarea) textarea.value = '';
                    exibirToast('Avaliação enviada com sucesso!');
                }
            });
        }
    }

    window.ItaimPerfilAvaliacoes = {
        inicializar
    };
})();
