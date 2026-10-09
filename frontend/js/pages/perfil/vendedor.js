/**
 * ITAIM VENDE - LÓGICA DA PÁGINA PÚBLICA DO VENDEDOR (VENDEDOR.HTML)
 * Exibe dados do vendedor, reputação, contato WhatsApp e vitrine de todos os seus anúncios.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Obter parâmetros da URL
    const params = new URLSearchParams(window.location.search);
    const paramEmail = (params.get('email') || '').toLowerCase().trim();
    const paramNome = (params.get('vendedor') || params.get('nome') || '').trim();
    const paramId = params.get('id');

    // 2. Carregar produtos globais do sistema
    let todosProdutos = [];
    if (window.ItaimSessao && typeof window.ItaimSessao.obterTodosProdutos === 'function') {
        todosProdutos = window.ItaimSessao.obterTodosProdutos();
    } else {
        try {
            todosProdutos = JSON.parse(localStorage.getItem('itaim_produtos_cadastrados') || '[]');
        } catch(e) {}
    }

    // 3. Localizar o Vendedor (no banco de usuários ou nos anúncios)
    let vendedor = null;

    if (window.ItaimSessao && typeof window.ItaimSessao.obterTodosUsuarios === 'function') {
        const usuarios = window.ItaimSessao.obterTodosUsuarios();
        
        if (paramEmail) {
            vendedor = usuarios.find(u => (u.email || '').toLowerCase() === paramEmail);
        }
        if (!vendedor && paramNome) {
            const busca = paramNome.toLowerCase().trim();
            vendedor = usuarios.find(u => 
                (u.nome || '').toLowerCase() === busca ||
                (u.username || '').toLowerCase() === busca ||
                (u.email || '').toLowerCase().startsWith(busca + '@') ||
                (u.email || '').toLowerCase() === busca
            );
        }
        if (!vendedor && paramId) {
            vendedor = usuarios.find(u => String(u.id) === String(paramId));
        }
    }

    // Se não encontrou no banco de usuários, tenta reconstituir pelos metadados dos produtos
    if (!vendedor && todosProdutos.length > 0) {
        const prodMatch = todosProdutos.find(p => {
            const pEmail = (p.vendedorEmail || '').toLowerCase();
            const pNome = (p.vendedorNome || '').toLowerCase();
            const pId = String(p.vendedorId || '');

            return (paramEmail && pEmail === paramEmail) || 
                   (paramNome && pNome === paramNome.toLowerCase()) || 
                   (paramId && pId === String(paramId));
        });

        if (prodMatch) {
            vendedor = {
                id: prodMatch.vendedorId || Date.now(),
                nome: prodMatch.vendedorNome || 'Vendedor do Itaim Vende',
                username: prodMatch.vendedorUsername || (prodMatch.vendedorEmail ? prodMatch.vendedorEmail.split('@')[0] : 'vendedor'),
                email: prodMatch.vendedorEmail || '',
                telefone: prodMatch.vendedorTelefone || '(89) 99999-9999',
                cidade: prodMatch.vendedorCidade || prodMatch.cidade || 'Paulistana',
                avatar: prodMatch.vendedorAvatar || 'assets/icon-user.png',
                bio: `Vendedor(a) na região de ${prodMatch.vendedorCidade || prodMatch.cidade || 'Paulistana'} e cidades vizinhas no Itaim Vende.`,
                dataCadastro: 'Membro desde 2024',
                avaliacao: '5.0',
                vendasConcluidas: 1
            };
        }
    }

    // Tenta resgatar foto real de perfil se o avatar for o padrão
    if (vendedor && (!vendedor.avatar || vendedor.avatar === 'assets/icon-user.png')) {
        try {
            const perfilLocal = JSON.parse(localStorage.getItem('itaim_perfil_usuario') || 'null');
            if (perfilLocal && perfilLocal.avatar && perfilLocal.avatar !== 'assets/icon-user.png') {
                const busca = (paramNome || vendedor.nome || '').toLowerCase().trim();
                const pNome = (perfilLocal.nome || '').toLowerCase().trim();
                const pUser = (perfilLocal.usuario || perfilLocal.username || '').toLowerCase().trim();
                const pEmail = (perfilLocal.email || '').toLowerCase().trim();
                const vEmail = (vendedor.email || '').toLowerCase().trim();
                if ((paramEmail && pEmail === paramEmail) || 
                    (vEmail && pEmail === vEmail) ||
                    (busca && (pNome === busca || pUser === busca))) {
                    vendedor.avatar = perfilLocal.avatar;
                }
            }
        } catch(e) {}
    }

    // Fallback: se nenhum vendedor ou usuário for localizado no banco, cria com base nos parâmetros da URL
    if (!vendedor) {
        if (paramNome || paramEmail) {
            vendedor = {
                id: paramId || Date.now(),
                nome: paramNome || (paramEmail ? paramEmail.split('@')[0] : 'Usuário'),
                username: paramNome ? paramNome.toLowerCase().replace(/\s+/g, '') : (paramEmail ? paramEmail.split('@')[0] : 'usuario'),
                email: paramEmail || '',
                telefone: '(89) 99999-9999',
                cidade: 'Paulistana',
                avatar: 'assets/icon-user.png',
                bio: `Perfil de ${paramNome || 'usuário'} na plataforma Itaim Vende.`,
                dataCadastro: 'Membro desde 2024',
                avaliacao: '5.0',
                vendasConcluidas: 0
            };
        } else {
            vendedor = {
                id: 1,
                nome: "Raili",
                username: "admin",
                email: "admin@gmail.com",
                telefone: "(89) 99999-9999",
                cidade: "Paulistana",
                avatar: "assets/icon-user.png",
                bio: "Administrador e vendedor oficial da plataforma Itaim Vende na região de Paulistana e cidades vizinhas.",
                dataCadastro: "Membro desde 2024",
                avaliacao: "5.0",
                vendasConcluidas: 12
            };
        }
    }

    // 4. Filtrar todos os anúncios ativos deste vendedor
    let anunciosVendedor = todosProdutos.filter(p => {
        const pEmail = (p.vendedorEmail || '').toLowerCase().trim();
        const pNome = (p.vendedorNome || '').toLowerCase().trim();
        const pId = String(p.vendedorId || '');

        const vEmail = (vendedor.email || '').toLowerCase().trim();
        const vNome = (vendedor.nome || '').toLowerCase().trim();
        const vId = String(vendedor.id || '');

        return (vEmail && pEmail === vEmail) || 
               (vNome && pNome === vNome) || 
               (vId && pId === vId);
    });

    // Se o vendedor for o admin e a lista estiver vazia por ser catálogo inicial
    if (anunciosVendedor.length === 0 && (vendedor.email === 'admin@gmail.com' || vendedor.nome === 'Raili')) {
        anunciosVendedor = todosProdutos;
    }

    // 5. Preencher dados visuais do Vendedor na Página
    document.title = `${vendedor.nome} - Perfil do Vendedor - Itaim Vende`;

    const elBreadcrumbNome = document.getElementById('vendedor-breadcrumb-nome');
    if (elBreadcrumbNome) elBreadcrumbNome.textContent = vendedor.nome;

    const elAvatar = document.getElementById('vendedor-avatar-img');
    if (elAvatar) {
        elAvatar.src = vendedor.avatar || 'assets/icon-user.png';
        elAvatar.onerror = () => { elAvatar.src = 'assets/icon-user.png'; };
    }

    const elNome = document.getElementById('vendedor-nome-display');
    if (elNome) elNome.textContent = vendedor.nome;

    const elUsername = document.getElementById('vendedor-username-display');
    if (elUsername) elUsername.textContent = `@${vendedor.username || (vendedor.email ? vendedor.email.split('@')[0] : 'vendedor')}`;

    const elCidade = document.getElementById('vendedor-cidade-display');
    if (elCidade) elCidade.textContent = `${vendedor.cidade || 'Paulistana'} - PI`;

    const elData = document.getElementById('vendedor-data-display');
    if (elData) elData.textContent = vendedor.dataCadastro || 'Membro desde 2024';

    const elBio = document.getElementById('vendedor-bio-display');
    if (elBio && vendedor.bio) elBio.textContent = vendedor.bio;

    // Estatísticas nos cards
    const elStatAtivos = document.getElementById('stat-anuncios-ativos');
    if (elStatAtivos) elStatAtivos.textContent = anunciosVendedor.length;

    const elStatVendas = document.getElementById('stat-vendas-concluidas');
    if (elStatVendas) elStatVendas.textContent = (vendedor.vendasConcluidas || 0) + anunciosVendedor.filter(a => a.status === 'vendido').length;

    const elBadgeQtd = document.getElementById('vendedor-badge-qtd');
    if (elBadgeQtd) elBadgeQtd.textContent = `${anunciosVendedor.length} ${anunciosVendedor.length === 1 ? 'anúncio' : 'anúncios'}`;

    // Botão WhatsApp com mensagem pré-configurada
    const btnWpp = document.getElementById('btn-vendedor-wpp');
    if (btnWpp) {
        const foneLimpo = (vendedor.telefone || '5589999999999').replace(/\D/g, '');
        const msg = encodeURIComponent(`Olá ${vendedor.nome}! Vi seu perfil de vendedor no portal Itaim Vende e gostaria de conversar sobre seus anúncios.`);
        btnWpp.href = `https://wa.me/${foneLimpo}?text=${msg}`;
    }

    // Botão Compartilhar Perfil
    const btnCompartilhar = document.getElementById('btn-vendedor-compartilhar');
    const toast = document.getElementById('vendedor-toast');

    btnCompartilhar?.addEventListener('click', () => {
        const link = window.location.href;
        navigator.clipboard.writeText(link).then(() => {
            exibirToast('Link do perfil copiado para a área de transferência! 📋');
        }).catch(() => {
            exibirToast('Perfil compartilhado com sucesso!');
        });
    });

    function exibirToast(msg) {
        if (!toast) return;
        toast.querySelector('.toast-texto').textContent = msg;
        toast.classList.add('visivel');
        setTimeout(() => {
            toast.classList.remove('visivel');
        }, 3200);
    }

    // 6. Renderização da Vitrine de Anúncios do Vendedor
    const containerGrade = document.getElementById('grade-produtos-vendedor');
    const selectOrdem = document.getElementById('select-ordem-vendedor');

    function formatarPreco(val) {
        if (val === 0 || val === '0' || val === null || val === undefined) {
            return '<span style="color: #44BD32; font-weight: 800;">Grátis / Doação</span>';
        }
        return Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    function renderizarAnuncios() {
        if (!containerGrade) return;
        containerGrade.innerHTML = '';

        let lista = [...anunciosVendedor];

        // Ordenação
        const ordem = selectOrdem?.value || 'recentes';
        if (ordem === 'menor-preco') {
            lista.sort((a, b) => (Number(a.preco) || 0) - (Number(b.preco) || 0));
        } else if (ordem === 'maior-preco') {
            lista.sort((a, b) => (Number(b.preco) || 0) - (Number(a.preco) || 0));
        }

        if (lista.length === 0) {
            containerGrade.innerHTML = `
                <div class="vendedor-anuncios-vazio">
                    <div class="vendedor-anuncios-vazio-icon">📦</div>
                    <h3>Nenhum anúncio ativo no momento</h3>
                    <p>Este vendedor ainda não tem outros produtos anunciados ou os itens já foram vendidos.</p>
                </div>
            `;
            return;
        }

        lista.forEach(item => {
            const card = document.createElement('a');
            card.href = `produto.html?id=${item.id}`;
            card.className = 'card-produto-vendedor';
            card.title = item.titulo;

            const fotoImg = item.imagem || (item.fotos && item.fotos[0]) || 'assets/produto-placeholder.svg';

            card.innerHTML = `
                <div class="card-prod-foto-box">
                    <img src="${fotoImg}" alt="${item.titulo}" onerror="this.src='assets/produto-placeholder.svg'" loading="lazy">
                    <span class="card-prod-badge-cat">${item.categoria || 'Geral'}</span>
                </div>
                <div class="card-prod-conteudo">
                    <div class="card-prod-preco">${formatarPreco(item.preco)}</div>
                    <h3 class="card-prod-titulo">${item.titulo}</h3>
                    <div class="card-prod-footer">
                        <span class="card-prod-loc">
                            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                            ${item.cidade || vendedor.cidade || 'Paulistana'} - PI
                        </span>
                        <span>${item.data || 'Recente'}</span>
                    </div>
                </div>
            `;

            containerGrade.appendChild(card);
        });
    }

    selectOrdem?.addEventListener('change', renderizarAnuncios);
    renderizarAnuncios();

    // ========================================================================
    // 7. SISTEMA FUNCIONAL DE AVALIAÇÕES (0 A 5 ESTRELAS) E COMENTÁRIOS
    // ========================================================================
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

    if (inputAutor && usuarioLogado && usuarioLogado.nome) {
        inputAutor.value = usuarioLogado.nome;
    }

    function atualizarReputacaoELista() {
        if (!window.ItaimAvaliacoes) return;

        const lista = window.ItaimAvaliacoes.obter(vendedor);
        const stats = window.ItaimAvaliacoes.calcularMedia(lista);

        // Atualiza métricas (0 a 5 com base nas avaliações reais)
        const mediaTexto = stats.total > 0 ? stats.estrelasFormatadas : '0.0 ★';
        if (elReputacaoMedia) elReputacaoMedia.textContent = mediaTexto;
        if (elReputacaoLegenda) elReputacaoLegenda.textContent = `Avaliações (${stats.total})`;
        if (elBadgeAvaliacoes) elBadgeAvaliacoes.textContent = `${mediaTexto} (${stats.total})`;

        // Renderiza lista de comentários
        if (containerAvaliacoes) {
            if (lista.length === 0) {
                containerAvaliacoes.innerHTML = `
                    <div class="avaliacoes-vazio" style="text-align: center; padding: 32px 18px; background: #F8FAFC; border-radius: 12px; border: 1px dashed #CBD5E1; margin-top: 10px;">
                        <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="#94A3B8" stroke-width="1.8" style="margin-bottom: 8px;">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                        <h4 style="font-size: 15px; font-weight: 700; color: #1E293B; margin: 0 0 6px;">Nenhuma avaliação ainda</h4>
                        <p style="font-size: 13.5px; color: #64748B; margin: 0;">Seja o primeiro a deixar uma avaliação e comentário sobre este vendedor!</p>
                    </div>
                `;
            } else {
                containerAvaliacoes.innerHTML = lista.map(item => {
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
                                    <button type="button" class="btn-excluir-avaliacao" data-id="${item.id}" title="Excluir este comentário">
                                        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                        <span>Excluir</span>
                                    </button>
                                </div>
                            </div>
                            <p class="avaliacao-comentario-txt" style="font-size: 13.5px; color: #475569; line-height: 1.5; margin: 4px 0 0 44px;">
                                ${item.comentario}
                            </p>
                        </div>
                    `;
                }).join('');

                // Adiciona ouvinte para exclusão de comentários (com confirmação inline elegante)
                containerAvaliacoes.querySelectorAll('.btn-excluir-avaliacao').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const id = btn.getAttribute('data-id');
                        if (btn.getAttribute('data-confirming') === 'true') {
                            if (window.ItaimAvaliacoes) {
                                window.ItaimAvaliacoes.excluir(vendedor, id);
                                atualizarReputacaoELista();
                                if (typeof exibirToast === 'function') {
                                    exibirToast('Comentário excluído com sucesso!');
                                }
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

    // Configura o seletor visual de estrelas (1 a 5)
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

                // Atualiza a tela imediatamente
                atualizarReputacaoELista();

                // Limpa o comentário
                if (textareaComentario) textareaComentario.value = '';

                // Exibe confirmação amigável sem emojis
                exibirToast('Avaliação enviada com sucesso!');
            }
        });
    }

    // Sincroniza nome do autor logado no formulário de avaliação do vendedor
    const usuarioAtual = (window.ItaimSessao && window.ItaimSessao.obterUsuarioLogado()) || {};
    const nomeLogadoVendedor = usuarioAtual.nome || usuarioAtual.username || 'Raili';
    const labelAutorVendedor = document.getElementById('vendedor-nome-autor-logado');
    if (labelAutorVendedor) labelAutorVendedor.textContent = nomeLogadoVendedor;
    const inputAutorVendedor = document.getElementById('input-autor-avaliacao');
    if (inputAutorVendedor) inputAutorVendedor.value = nomeLogadoVendedor;

    // Carrega avaliações ao iniciar a página
    atualizarReputacaoELista();

    // 8. Sincronização do Header / Dropdown Usuário Logado
    if (window.ItaimSessao && typeof window.ItaimSessao.atualizarHeaderUsuario === 'function') {
        window.ItaimSessao.atualizarHeaderUsuario();
    }

    // Header e Menu Lateral (Drawer) são gerenciados de forma centralizada e global por sessao.js
});
