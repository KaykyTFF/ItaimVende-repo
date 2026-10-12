/**
 * ITAIM VENDE - LÓGICA DA PÁGINA DE PERFIL (PERFIL.HTML)
 * Perfil Admin (Raili - admin@gmail.com) com gestão de dados, estatísticas reais e grade de anúncios.
 */

document.addEventListener('DOMContentLoaded', () => {
    const usuarioLogado = (window.ItaimSessao && typeof window.ItaimSessao.obterUsuarioLogado === 'function')
        ? window.ItaimSessao.obterUsuarioLogado()
        : { 
            nome: 'Raili', 
            email: 'admin@gmail.com', 
            cidade: 'Paulistana', 
            bairro: 'Centro', 
            telefone: '(89) 99999-9999',
            avatar: 'assets/icon-user.png',
            dataCadastro: 'Membro desde 2024'
        };

    // Parâmetros da URL para visualizar perfil de outros usuários
    const urlParams = new URLSearchParams(window.location.search);
    const paramEmail = (urlParams.get('email') || '').toLowerCase().trim();
    const paramNome = (urlParams.get('vendedor') || urlParams.get('nome') || '').trim();
    const paramId = urlParams.get('id');

    let perfilExibido = usuarioLogado;
    let isPerfilProprio = true;

    if (paramEmail || paramNome || paramId) {
        const todosUsuarios = (window.ItaimSessao && typeof window.ItaimSessao.obterTodosUsuarios === 'function')
            ? window.ItaimSessao.obterTodosUsuarios()
            : [];
        let encontrado = null;
        if (paramEmail) encontrado = todosUsuarios.find(u => (u.email || '').toLowerCase() === paramEmail);
        if (!encontrado && paramNome) {
            const b = paramNome.toLowerCase();
            encontrado = todosUsuarios.find(u => (u.nome || '').toLowerCase() === b || (u.username || '').toLowerCase() === b);
        }
        if (!encontrado && paramId) {
            encontrado = todosUsuarios.find(u => String(u.id) === String(paramId));
        }

        if (encontrado && ((encontrado.email || '').toLowerCase() !== (usuarioLogado.email || '').toLowerCase())) {
            perfilExibido = encontrado;
            isPerfilProprio = false;
        }
    }

    // Elementos DOM do Banner
    const nomeDisplay = document.getElementById('perfil-nome-display');
    const cidadeDisplay = document.getElementById('perfil-cidade-display');
    const dataDisplay = document.getElementById('perfil-data-display');
    const avatarImgView = document.getElementById('perfil-avatar-view');
    const btnCameraAvatar = document.querySelector('.btn-avatar-camera');
    const inputFotoAvatar = document.getElementById('input-foto-avatar');
    const breadcrumbCurrent = document.querySelector('.perfil-breadcrumb-current');
    const btnSairBanner = document.getElementById('btn-sair-banner');
    const boxContatoExterno = document.getElementById('box-contato-vendedor-externo');
    const btnWppExterno = document.getElementById('btn-whatsapp-perfil');
    const boxFormAvaliacao = document.getElementById('perfil-box-form-avaliacao');

    // Elementos de Estatísticas
    const statAtivos = document.getElementById('stat-anuncios-ativos');
    const statAvaliacao = document.getElementById('stat-avaliacoes-texto');
    const statVendas = document.getElementById('stat-vendas-concluidas');

    // Formulário de Dados
    const formDados = document.getElementById('form-dados-perfil');
    const nomeInput = document.getElementById('perfil-nome');
    const usuarioInput = document.getElementById('perfil-usuario');
    const emailInput = document.getElementById('perfil-email');
    const telefoneInput = document.getElementById('perfil-telefone');
    const cidadeInput = document.getElementById('perfil-cidade');
    const bairroInput = document.getElementById('perfil-bairro');
    const toast = document.getElementById('toast-sucesso');

    // Ajustes para visualização do próprio perfil vs perfil de outro usuário
    if (isPerfilProprio) {
        document.title = `${perfilExibido.nome} - Meu Perfil - Itaim Vende`;
        if (breadcrumbCurrent) breadcrumbCurrent.textContent = 'Meu Perfil';
        if (boxContatoExterno) boxContatoExterno.style.display = 'none';
        if (boxFormAvaliacao) boxFormAvaliacao.style.display = 'none';
        if (btnSairBanner) btnSairBanner.style.display = 'inline-flex';
    } else {
        document.title = `${perfilExibido.nome} - Perfil no Itaim Vende`;
        if (breadcrumbCurrent) breadcrumbCurrent.textContent = `Perfil de ${perfilExibido.nome}`;
        if (btnCameraAvatar) btnCameraAvatar.style.display = 'none';
        if (btnSairBanner) btnSairBanner.style.display = 'none';

        // Exibe box de contato WhatsApp para outro perfil
        if (boxContatoExterno && btnWppExterno) {
            boxContatoExterno.style.display = 'block';
            let fone = (perfilExibido.phone || perfilExibido.telefone || '5589999985858').replace(/\D/g, '');
            if (fone.length === 10 || fone.length === 11) fone = '55' + fone;
            const msg = encodeURIComponent(`Olá ${perfilExibido.nome}! Vi seu perfil no Itaim Vende e gostaria de conversar sobre seus anúncios.`);
            btnWppExterno.href = `https://wa.me/${fone}?text=${msg}`;
        }

        // Exibe formulário para deixar avaliação no perfil do outro usuário
        if (boxFormAvaliacao) {
            boxFormAvaliacao.style.display = 'block';
            const inputAutor = document.getElementById('perfil-input-autor');
            if (inputAutor && usuarioLogado && usuarioLogado.nome) {
                inputAutor.value = usuarioLogado.nome;
            }
        }
    }

    const fallbackAvatarPerfil = (window.ItaimRotas && typeof window.ItaimRotas.obterAsset === 'function')
        ? window.ItaimRotas.obterAsset('assets/icon-user.png')
        : '../../assets/icon-user.png';

    if (nomeDisplay) nomeDisplay.textContent = perfilExibido.nome || perfilExibido.name || 'Raili';
    if (cidadeDisplay) cidadeDisplay.textContent = `${perfilExibido.cidade || perfilExibido.city || 'Paulistana'} - PI`;
    if (dataDisplay) dataDisplay.textContent = perfilExibido.dataCadastro || 'Membro desde 2024';
    
    const bioDisplayEl = document.getElementById('perfil-bio-display');
    if (bioDisplayEl && perfilExibido.bio) bioDisplayEl.textContent = perfilExibido.bio;

    const userDisplayEl = document.getElementById('perfil-username-display');
    if (userDisplayEl) userDisplayEl.textContent = `@${perfilExibido.username || perfilExibido.usuario || 'rsstore'}`;

    const seloVerifEl = document.getElementById('perfil-selo-verificado');
    if (seloVerifEl) seloVerifEl.style.display = (perfilExibido.isVerified || perfilExibido.role === 'ADMIN') ? 'inline-flex' : 'none';

    if (avatarImgView) {
        const rawAvatar = perfilExibido.avatar || 'assets/icon-user.png';
        const finalAvatar = (window.ItaimRotas && typeof window.ItaimRotas.obterAsset === 'function')
            ? window.ItaimRotas.obterAsset(rawAvatar)
            : fallbackAvatarPerfil;
        avatarImgView.src = finalAvatar;
        avatarImgView.onerror = function() {
            this.onerror = null;
            this.src = fallbackAvatarPerfil;
        };
    }

    // ------------------------------------------------------------------
    // Configurações de Privacidade e Visibilidade no Perfil
    // ------------------------------------------------------------------
    const configPrivacidade = (window.ItaimSessao && typeof window.ItaimSessao.obterConfiguracoes === 'function')
        ? window.ItaimSessao.obterConfiguracoes()
        : (function() {
            try {
                return JSON.parse(localStorage.getItem('itaim_configuracoes') || '{}');
            } catch(e) { return {}; }
        })();

    const mostrarTelefone = configPrivacidade['priv-telefone'] !== false;
    const mostrarBairro = configPrivacidade['priv-bairro'] !== false;
    const mostrarOnline = !!configPrivacidade['priv-online'];

    // Preenche os campos do formulário de dados (sincronizados com Configurações e respeitando Privacidade)
    if (nomeInput) nomeInput.value = perfilExibido.nome || 'Raili';
    if (usuarioInput) usuarioInput.value = perfilExibido.username || perfilExibido.usuario || 'rsstore';
    if (emailInput) {
        emailInput.value = perfilExibido.email || 'admin@gmail.com';
        emailInput.readOnly = true;
        emailInput.style.backgroundColor = '#F8FAFC';
        emailInput.style.cursor = 'default';
    }

    if (telefoneInput) {
        const telFormatado = perfilExibido.telefone || (perfilExibido.phone ? '(89) 99998-5858' : '(89) 99998-5858');
        if (mostrarTelefone) {
            telefoneInput.value = telFormatado;
            telefoneInput.style.color = '#2d3748';
        } else {
            if (isPerfilProprio) {
                telefoneInput.value = `${telFormatado} (Oculto publicamente)`;
                telefoneInput.style.color = '#94A3B8';
            } else {
                telefoneInput.value = 'Oculto pelo vendedor';
                telefoneInput.style.color = '#94A3B8';
            }
        }
    }

    if (cidadeInput) cidadeInput.value = perfilExibido.cidade || perfilExibido.city || 'Paulistana';

    if (bairroInput) {
        const bairroVal = perfilExibido.bairro || perfilExibido.neighborhood || 'Centro';
        if (mostrarBairro) {
            bairroInput.value = bairroVal;
            bairroInput.style.color = '#2d3748';
        } else {
            if (isPerfilProprio) {
                bairroInput.value = `${bairroVal} (Oculto publicamente)`;
                bairroInput.style.color = '#94A3B8';
            } else {
                bairroInput.value = 'Não informado';
                bairroInput.style.color = '#94A3B8';
            }
        }
    }

    // Se outro usuário estiver vendo o perfil e o telefone estiver oculto nas configurações, não exibe box de WhatsApp externo
    if (!isPerfilProprio && boxContatoExterno) {
        if (!mostrarTelefone) {
            boxContatoExterno.style.display = 'none';
        }
    }

    // Indicador Online no Banner (ativado/desativado pela chave priv-online)
    const detalhesBanner = document.querySelector('.perfil-banner-detalhes');
    if (detalhesBanner) {
        let elOnline = document.getElementById('perfil-badge-online-banner');
        if (!elOnline) {
            elOnline = document.createElement('div');
            elOnline.id = 'perfil-badge-online-banner';
            elOnline.className = 'perfil-detalhe-item';
            detalhesBanner.appendChild(elOnline);
        }
        if (mostrarOnline) {
            elOnline.innerHTML = `
                <span style="display: inline-flex; align-items: center; gap: 6px; font-weight: 700; color: #166534; background: #DCFCE7; padding: 2px 10px; border-radius: 12px; font-size: 12px;">
                    <span style="width: 7px; height: 7px; border-radius: 50%; background: #22C55E; display: inline-block;"></span>
                    Online recentemente
                </span>
            `;
            elOnline.style.display = 'flex';
        } else {
            elOnline.style.display = 'none';
        }
    }

    // 3. Carregar e calcular estatísticas reais a partir dos anúncios do usuário
    const anunciosDoUsuario = (window.ItaimSessao && typeof window.ItaimSessao.obterAnunciosDoUsuario === 'function')
        ? window.ItaimSessao.obterAnunciosDoUsuario(perfilExibido.email)
        : [];

    const totalAtivos = anunciosDoUsuario.filter(a => a.status === 'ativo').length;
    const baseVendas = perfilExibido.salesCount !== undefined ? perfilExibido.salesCount : (perfilExibido.vendasConcluidas !== undefined ? perfilExibido.vendasConcluidas : 12);
    const totalVendidos = anunciosDoUsuario.filter(a => a.status === 'vendido').length + baseVendas;

    if (statAtivos) statAtivos.textContent = totalAtivos;
    if (statVendas) statVendas.textContent = totalVendidos;

    // Avaliação funcional calculada pelas avaliações reais ou dados do perfil
    function renderizarAvaliacoesPerfil() {
        if (!window.ItaimAvaliacoes) return;
        const avaliacoes = window.ItaimAvaliacoes.obter(perfilExibido);
        const stats = window.ItaimAvaliacoes.calcularMedia(avaliacoes, perfilExibido);
        const totalReviews = stats.total > 0 ? stats.total : (perfilExibido.ratingCount || perfilExibido.totalAvaliacoes || 18);
        const valorFormatado = stats.total > 0 ? stats.estrelasFormatadas : `${Number(perfilExibido.ratingAverage || perfilExibido.avaliacao || 5.0).toFixed(1)} ★`;

        if (statAvaliacao) statAvaliacao.textContent = valorFormatado;
        const statLegenda = document.getElementById('stat-avaliacoes-legenda');
        if (statLegenda) statLegenda.textContent = `Avaliações (${totalReviews})`;

        const badgeAvaliacoes = document.getElementById('perfil-badge-avaliacoes');
        if (badgeAvaliacoes) badgeAvaliacoes.textContent = `${valorFormatado} (${totalReviews})`;

        const container = document.getElementById('lista-avaliacoes-perfil');
        if (container) {
            if (avaliacoes.length === 0) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 32px 18px; background: #F8FAFC; border-radius: 12px; border: 1px dashed #CBD5E1;">
                        <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="#94A3B8" stroke-width="1.8" style="margin-bottom: 8px;">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                        <h4 style="font-size: 15px; font-weight: 700; color: #1E293B; margin: 0 0 6px;">Nenhuma avaliação ainda</h4>
                        <p style="font-size: 13.5px; color: #64748B; margin: 0;">As avaliações e comentários deixados por outros usuários aparecerão aqui.</p>
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
                container.querySelectorAll('.btn-excluir-avaliacao').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const id = btn.getAttribute('data-id');
                        if (btn.getAttribute('data-confirming') === 'true') {
                            if (window.ItaimAvaliacoes) {
                                window.ItaimAvaliacoes.excluir(perfilExibido, id);
                                renderizarAvaliacoesPerfil();
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

    // Sincroniza nome do autor logado no formulário de avaliação
    const nomeLogadoPerfil = (usuarioLogado && (usuarioLogado.nome || usuarioLogado.username)) || 'Raili';
    const labelAutorPerfil = document.getElementById('perfil-nome-autor-logado');
    if (labelAutorPerfil) labelAutorPerfil.textContent = nomeLogadoPerfil;
    const inputAutorPerfil = document.getElementById('perfil-input-autor');
    if (inputAutorPerfil) inputAutorPerfil.value = nomeLogadoPerfil;

    renderizarAvaliacoesPerfil();

    // Sincronização em tempo real com o backend (Supabase / Prisma)
    function aplicarDadosPerfilReal(u) {
        if (!u) return;
        perfilExibido = { ...perfilExibido, ...u };
        if (nomeDisplay) nomeDisplay.textContent = u.name || u.nome || 'Raili';
        if (cidadeDisplay) cidadeDisplay.textContent = `${u.city || u.cidade || 'Paulistana'} - PI`;
        
        const bioDisplay = document.getElementById('perfil-bio-display');
        if (bioDisplay && u.bio) bioDisplay.textContent = u.bio;

        const userDisplay = document.getElementById('perfil-username-display');
        if (userDisplay && u.username) userDisplay.textContent = `@${u.username}`;

        const seloVerif = document.getElementById('perfil-selo-verificado');
        if (seloVerif) seloVerif.style.display = (u.isVerified || u.role === 'ADMIN') ? 'inline-flex' : 'none';

        if (avatarImgView) {
            const raw = u.avatar || 'assets/icon-user.png';
            const finalAv = window.ItaimRotas ? window.ItaimRotas.obterAsset(raw) : fallbackAvatarPerfil;
            avatarImgView.src = finalAv;
        }

        if (nomeInput) nomeInput.value = u.name || u.nome || 'Raili';
        if (usuarioInput) usuarioInput.value = u.username || 'rsstore';
        if (emailInput) emailInput.value = u.email || 'admin@gmail.com';
        if (telefoneInput) {
            const tel = u.phone ? (u.phone.length === 11 ? `(${u.phone.slice(0,2)}) ${u.phone.slice(2,7)}-${u.phone.slice(7)}` : u.phone) : '(89) 99998-5858';
            telefoneInput.value = mostrarTelefone ? tel : (isPerfilProprio ? `${tel} (Oculto publicamente)` : 'Oculto');
        }
        if (cidadeInput) cidadeInput.value = u.city || 'Paulistana';
        if (bairroInput) bairroInput.value = u.neighborhood || 'Centro';
        if (statVendas && u.salesCount !== undefined) {
            statVendas.textContent = u.salesCount + anunciosDoUsuario.filter(a => a.status === 'vendido').length;
        }
        renderizarAvaliacoesPerfil();
    }

    if (isPerfilProprio && window.ItaimApi && window.ItaimApi.auth && typeof window.ItaimApi.auth.perfil === 'function' && window.ItaimApi.auth.obterToken()) {
        window.ItaimApi.auth.perfil().then(res => {
            if (res && res.success && res.user) {
                aplicarDadosPerfilReal(res.user);
                try {
                    localStorage.setItem('itaim_usuario_logado', JSON.stringify(res.user));
                } catch(e) {}
            }
        }).catch(() => {});
    }

    // Seletor de estrelas no perfil (se avaliando outro usuário)
    const estrelasContainerPerfil = document.getElementById('perfil-estrelas-seletor');
    const inputNotaPerfil = document.getElementById('perfil-input-nota');
    const labelNotaPerfil = document.getElementById('perfil-label-nota');

    if (estrelasContainerPerfil) {
        const estrelas = estrelasContainerPerfil.querySelectorAll('.estrela-item');
        function destacarEstrelasPerfil(qtd) {
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
                if (inputNotaPerfil) inputNotaPerfil.value = valor;
                if (labelNotaPerfil) labelNotaPerfil.textContent = `(${valor}.0)`;
                destacarEstrelasPerfil(valor);
            });
            estrela.addEventListener('mouseenter', () => {
                const valor = parseInt(estrela.dataset.valor);
                destacarEstrelasPerfil(valor);
            });
        });

        estrelasContainerPerfil.addEventListener('mouseleave', () => {
            const notaAtual = parseInt(inputNotaPerfil?.value || '5');
            destacarEstrelasPerfil(notaAtual);
        });
    }

    // Formulário de submissão de avaliação no perfil
    const formAvaliacaoPerfil = document.getElementById('perfil-form-nova-avaliacao');
    if (formAvaliacaoPerfil) {
        formAvaliacaoPerfil.addEventListener('submit', (e) => {
            e.preventDefault();
            const nota = parseFloat(inputNotaPerfil?.value || '5');
            const inputAutor = document.getElementById('perfil-input-autor');
            const textarea = document.getElementById('perfil-textarea-comentario');
            const autor = inputAutor?.value.trim() || usuarioLogado.nome || 'Comprador';
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

    // 4. Renderizar grade de anúncios deste perfil
    const gradeAnuncios = document.getElementById('grade-anuncios-perfil');
    const tituloSecaoAnuncios = document.getElementById('titulo-secao-anuncios');
    const subtituloSecaoAnuncios = document.getElementById('subtitulo-secao-anuncios');

    if (tituloSecaoAnuncios) {
        tituloSecaoAnuncios.textContent = isPerfilProprio ? 'Meus Anúncios Publicados' : `Anúncios de ${perfilExibido.nome}`;
    }
    if (subtituloSecaoAnuncios) {
        subtituloSecaoAnuncios.textContent = isPerfilProprio 
            ? 'Esses são os anúncios do seu perfil visíveis para outros compradores no Itaim Vende.'
            : `Todos os produtos anunciados por ${perfilExibido.nome} disponíveis para negociação.`;
    }

    function formatarPreco(val) {
        if (val === 0 || val === '0' || val === null || val === undefined) {
            return '<span style="color: #44BD32; font-weight: 800;">Grátis / Doação</span>';
        }
        return Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    if (gradeAnuncios) {
        if (anunciosDoUsuario.length === 0) {
            gradeAnuncios.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; background: #F8FAFC; border-radius: 14px; border: 1px dashed #CBD5E1;">
                    <div style="font-size: 40px; margin-bottom: 8px;">📦</div>
                    <h3 style="font-size: 17px; font-weight: 800; color: #1E293B; margin-bottom: 6px;">Nenhum anúncio ativo no momento</h3>
                    <p style="color: #64748B; font-size: 13.5px; margin-bottom: 16px;">
                        Você ainda não possui anúncios publicados.
                    </p>
                    <a href="${window.ItaimRotas ? window.ItaimRotas.obterUrl('vender') : '../vender/vender.html'}" style="background: #44BD32; color: #FFFFFF; font-weight: 700; padding: 10px 20px; border-radius: 20px; text-decoration: none; font-size: 14px; display: inline-block;">
                        + Anunciar um Produto
                    </a>
                </div>
            `;
        } else {
            const placeholderSrc = (window.ItaimRotas && typeof window.ItaimRotas.obterAsset === 'function')
                ? window.ItaimRotas.obterAsset('assets/produto-placeholder.svg')
                : '../../assets/produto-placeholder.svg';

            gradeAnuncios.innerHTML = anunciosDoUsuario.map(item => {
                const foto = (window.ItaimApi && typeof window.ItaimApi.resolverUrlImagem === 'function')
                    ? window.ItaimApi.resolverUrlImagem(item.imagem || (item.fotos && item.fotos[0]) || '')
                    : (item.imagem || placeholderSrc);

                return `
                <article class="card-produto" onclick="window.location.href='${window.ItaimRotas ? window.ItaimRotas.obterUrl('produto', `id=${item.id}`) : `../produtos/produto.html?id=${item.id}`}'" style="cursor: pointer;">
                    <div class="card-img-box">
                        <img src="${foto}" alt="${item.titulo}" class="card-img" onerror="this.onerror=null; this.src='${placeholderSrc}'">
                        <span class="badge-card-condicao" style="position: absolute; bottom: 8px; left: 8px; background: rgba(0,0,0,0.7); color: #fff; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;">
                            ${item.categoria || 'Geral'}
                        </span>
                    </div>
                    <div class="card-info" style="padding: 14px;">
                        <h3 class="card-titulo" title="${item.titulo}" style="font-size: 14.5px; font-weight: 700; color: #1E293B; margin-bottom: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                            ${item.titulo}
                        </h3>
                        <div class="card-preco" style="font-size: 17px; font-weight: 800; color: #44BD32; margin-bottom: 8px;">
                            ${formatarPreco(item.preco)}
                        </div>
                        <div class="card-rodape" style="display: flex; justify-content: space-between; font-size: 12px; color: #64748B;">
                            <span class="card-local"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: -1px; margin-right: 2px;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>${item.cidade || perfilExibido.cidade || 'Paulistana'}</span>
                            <span style="color: #44BD32; font-weight: 600;">Ver anúncio &rarr;</span>
                        </div>
                    </div>
                </article>
                `;
            }).join('');
        }
    }

    // 5. Upload de foto de perfil (API simples de ajuste e corte circular 1:1)
    if (inputFotoAvatar && avatarImgView) {
        inputFotoAvatar.addEventListener('change', (e) => {
            const file = e.target.files && e.target.files[0];
            if (!file) return;

            const salvarFoto = async (novaFoto) => {
                avatarImgView.src = novaFoto;
                let avatarFinal = novaFoto;

                // Upload profissional para o backend Express / Supabase
                if (window.ItaimApi && window.ItaimApi.upload && window.ItaimApi.auth && window.ItaimApi.auth.obterToken()) {
                    try {
                        const resUpload = await window.ItaimApi.upload.unico(novaFoto);
                        if (resUpload && resUpload.data && resUpload.data.url) {
                            avatarFinal = resUpload.data.url;
                        }
                        await window.ItaimApi.auth.atualizarPerfil({ avatar: avatarFinal });
                    } catch (errUpload) {
                        console.warn('[Perfil] Upload de imagem falhou, mantendo em cache:', errUpload);
                    }
                }

                if (window.ItaimSessao && typeof window.ItaimSessao.atualizarDadosUsuario === 'function') {
                    window.ItaimSessao.atualizarDadosUsuario(perfilExibido.email, { avatar: avatarFinal });
                }

                if (window.ItaimSessao && typeof window.ItaimSessao.atualizarHeaderUsuario === 'function') {
                    window.ItaimSessao.atualizarHeaderUsuario();
                }

                perfilExibido.avatar = avatarFinal;
                exibirToast('Foto de perfil atualizada com sucesso!');
            };

            if (window.ItaimFoto && typeof window.ItaimFoto.ajustarPerfil === 'function') {
                window.ItaimFoto.ajustarPerfil(file, salvarFoto);
            } else if (window.ItaimFoto && typeof window.ItaimFoto.ajustar === 'function') {
                window.ItaimFoto.ajustar(file, 400, salvarFoto);
            } else {
                const reader = new FileReader();
                reader.onload = (event) => salvarFoto(event.target.result);
                reader.readAsDataURL(file);
            }
        });
    }

    function exibirToast(mensagem = 'Informações salvas com sucesso!') {
        if (!toast) return;
        const span = toast.querySelector('span');
        if (span) span.textContent = mensagem;
        toast.classList.add('visivel');
        setTimeout(() => {
            toast.classList.remove('visivel');
        }, 3500);
    }



    // Header e Menu Lateral (Drawer) são gerenciados de forma centralizada e global por sessao.js
});
