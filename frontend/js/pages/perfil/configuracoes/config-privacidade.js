/**
 * ITAIM VENDE - CONFIGURAÇÕES: CENTRO DE PRIVACIDADE E DIREITOS DO TITULAR (LGPD)
 * Arquivo: frontend/js/pages/perfil/configuracoes/config-privacidade.js
 */

(function () {
    'use strict';

    function inicializar() {
        const { $, toast } = window.ItaimConfigUtils || {
            $: id => document.getElementById(id),
            toast: msg => alert(msg)
        };

        const modalDossie = $('modal-dossie-dados');
        const modalExcluir = $('modal-excluir-conta-seguro');

        // 1. Abertura do Dossiê de Dados do Titular (LGPD Art. 18, II)
        const btnAbrirDossie = $('btn-abrir-dossie-dados');
        if (btnAbrirDossie) {
            btnAbrirDossie.addEventListener('click', carregarDossie);
        }

        const btnFecharDossie = $('btn-fechar-modal-dossie');
        if (btnFecharDossie) {
            btnFecharDossie.addEventListener('click', () => fecharModal(modalDossie));
        }

        const btnFecharDossieRodape = $('btn-fechar-dossie-rodape');
        if (btnFecharDossieRodape) {
            btnFecharDossieRodape.addEventListener('click', () => fecharModal(modalDossie));
        }

        async function carregarDossie() {
            if (!modalDossie) return;
            abrirModal(modalDossie);

            const loading = $('cfg-dossie-loading');
            const containerDados = $('cfg-dossie-dados');
            if (loading) loading.style.display = 'flex';
            if (containerDados) {
                containerDados.style.display = 'none';
                containerDados.innerHTML = '';
            }

            try {
                if (!window.ItaimApi?.auth?.obterDossiePrivacidade) {
                    throw new Error('Módulo de API não inicializado.');
                }

                const res = await window.ItaimApi.auth.obterDossiePrivacidade();
                const d = res?.dossier;

                if (!d || !d.titular) {
                    throw new Error('Não foi possível obter os dados do titular.');
                }

                renderizarDossie(d);
            } catch (err) {
                if (containerDados) {
                    containerDados.innerHTML = `
                        <div class="cfg-erro-box" style="padding: 20px; text-align: center; color: #EB3B5A;">
                            <p><strong>Erro ao consultar dossiê:</strong> ${err.message || 'Falha de comunicação com o servidor.'}</p>
                            <button type="button" class="cfg-btn cfg-btn-neutro" id="btn-tentar-novamente-dossie" style="margin-top: 10px;">Tentar novamente</button>
                        </div>
                    `;
                    const btnTentar = $('btn-tentar-novamente-dossie');
                    if (btnTentar) btnTentar.addEventListener('click', carregarDossie);
                    containerDados.style.display = 'block';
                }
            } finally {
                if (loading) loading.style.display = 'none';
            }
        }

        function renderizarDossie(d) {
            const containerDados = $('cfg-dossie-dados');
            if (!containerDados) return;

            const t = d.titular || {};
            const loc = t.localizacao || {};
            const met = t.metricas || {};
            const aud = t.auditoria || {};

            const dataCadastro = aud.data_cadastro ? new Date(aud.data_cadastro).toLocaleDateString('pt-BR') : 'Não informado';
            const ultimoLogin = aud.ultimo_login ? new Date(aud.ultimo_login).toLocaleString('pt-BR') : 'Sem registros recentes';

            containerDados.innerHTML = `
                <!-- Seção 1: Identificação Cadastral -->
                <div class="cfg-dossie-secao">
                    <h4>Identificação Cadastral</h4>
                    <div class="cfg-dossie-grid">
                        <div class="cfg-dossie-dado">
                            <span>Nome Completo</span>
                            <strong>${t.nome_completo || 'Não informado'}</strong>
                        </div>
                        <div class="cfg-dossie-dado">
                            <span>Nome de Usuário</span>
                            <strong>${t.nome_usuario || 'Não definido'}</strong>
                        </div>
                        <div class="cfg-dossie-dado">
                            <span>E-mail</span>
                            <strong>${t.email || 'Não informado'} ${t.email_verificado ? '<em style="color:var(--primary); font-size:11px;">(Verificado)</em>' : ''}</strong>
                        </div>
                        <div class="cfg-dossie-dado">
                            <span>Telefone / WhatsApp</span>
                            <strong>${t.telefone || 'Não cadastrado'} ${t.telefone_verificado ? '<em style="color:var(--primary); font-size:11px;">(Validado OTP)</em>' : ''}</strong>
                        </div>
                        <div class="cfg-dossie-dado">
                            <span>Localização</span>
                            <strong>${loc.bairro ? loc.bairro + ', ' : ''}${loc.cidade || 'Paulistana'} - ${loc.state || 'PI'}</strong>
                        </div>
                        <div class="cfg-dossie-dado">
                            <span>Papel e Status</span>
                            <strong>${t.papel_usuario || 'BUYER'} (${t.status_conta || 'ACTIVE'})</strong>
                        </div>
                        <div class="cfg-dossie-dado">
                            <span>Data de Registro</span>
                            <strong>${dataCadastro}</strong>
                        </div>
                        <div class="cfg-dossie-dado">
                            <span>Último Acesso Registrado</span>
                            <strong>${ultimoLogin}</strong>
                        </div>
                    </div>
                </div>

                <!-- Seção 2: Registros de Atividade no Marketplace -->
                <div class="cfg-dossie-secao">
                    <h4>Atividades e Registros Transacionais</h4>
                    <div class="cfg-dossie-grid">
                        <div class="cfg-dossie-dado">
                            <span>Anúncios Publicados</span>
                            <strong>${(d.anuncios_publicados || []).length} anúncios</strong>
                        </div>
                        <div class="cfg-dossie-dado">
                            <span>Histórico de Pedidos</span>
                            <strong>${(d.pedidos_e_transacoes || []).length} transações</strong>
                        </div>
                        <div class="cfg-dossie-dado">
                            <span>Locais de Entrega</span>
                            <strong>${(d.enderecos_entrega || []).length} endereços</strong>
                        </div>
                        <div class="cfg-dossie-dado">
                            <span>Reputação Comercial</span>
                            <strong>${met.reputacao_media ? met.reputacao_media.toFixed(2) : '5.00'} (${met.total_avaliacoes || 0} avaliações)</strong>
                        </div>
                    </div>
                </div>

                <!-- Seção 3: Preferências e Privacidade Ativas -->
                <div class="cfg-dossie-secao">
                    <h4>Preferências de Privacidade Ativas</h4>
                    <div class="cfg-dossie-grid">
                        <div class="cfg-dossie-dado">
                            <span>Telefone nos Anúncios</span>
                            <strong>${d.preferencias_privacidade?.['priv-telefone'] !== false ? 'Visível aos compradores' : 'Oculto'}</strong>
                        </div>
                        <div class="cfg-dossie-dado">
                            <span>Bairro nos Anúncios</span>
                            <strong>${d.preferencias_privacidade?.['priv-bairro'] !== false ? 'Visível' : 'Oculto (apenas Paulistana)'}</strong>
                        </div>
                        <div class="cfg-dossie-dado">
                            <span>Status Online no Chat</span>
                            <strong>${d.preferencias_privacidade?.['priv-online'] ? 'Ativo' : 'Desativado'}</strong>
                        </div>
                        <div class="cfg-dossie-dado">
                            <span>Encarregado pelo Tratamento</span>
                            <strong>${d.metadados_lgpd?.canal_privacidade_dpo || 'privacidade@itaimvende.com.br'}</strong>
                        </div>
                    </div>
                </div>
            `;

            containerDados.style.display = 'flex';
        }

        // 2. Exportação / Portabilidade de Dados em JSON (LGPD Art. 18, V)
        async function executarExportacaoJson(btnDisparador) {
            if (!btnDisparador) return;
            const originalHtml = btnDisparador.innerHTML;
            btnDisparador.disabled = true;
            btnDisparador.innerHTML = '<span class="cfg-spinner" style="display:inline-block; width:14px; height:14px; border:2px solid currentColor; border-top-color:transparent; border-radius:50%; animation:cfgSpin 0.7s linear infinite;"></span> Baixando...';

            try {
                if (!window.ItaimApi?.auth?.baixarExportacaoDados) {
                    throw new Error('Recurso de exportação não disponível.');
                }
                await window.ItaimApi.auth.baixarExportacaoDados();
                toast('Cópia dos dados pessoais exportada com sucesso (JSON).');
            } catch (err) {
                alert('Erro ao exportar dados: ' + (err.message || 'Falha na conexão.'));
            } finally {
                btnDisparador.disabled = false;
                btnDisparador.innerHTML = originalHtml;
            }
        }

        const btnExportarCard = $('btn-exportar-dados-json');
        if (btnExportarCard) {
            btnExportarCard.addEventListener('click', () => executarExportacaoJson(btnExportarCard));
        }

        const btnBaixarDossie = $('btn-baixar-dossie-json');
        if (btnBaixarDossie) {
            btnBaixarDossie.addEventListener('click', () => executarExportacaoJson(btnBaixarDossie));
        }

        // 3. Atalhos rápidos para retificação de informações (LGPD Art. 18, III)
        document.querySelectorAll('.cfg-link-atalho[data-ir-aba]').forEach(btn => {
            btn.addEventListener('click', () => {
                const alvo = btn.dataset.irAba;
                if (window.ItaimConfigNavegacao?.abrirSecao) {
                    window.ItaimConfigNavegacao.abrirSecao(alvo);
                }
            });
        });

        // 4. Central de Preferências de Cookies
        const btnGerenciarCookies = $('btn-gerenciar-cookies-cfg');
        if (btnGerenciarCookies) {
            btnGerenciarCookies.addEventListener('click', () => {
                if (window.ItaimCookies?.abrirCentral) {
                    window.ItaimCookies.abrirCentral();
                }
            });
        }

        // 5. Exclusão e Anonimização Segura com Confirmação de Senha (LGPD Art. 18, VI)
        const btnExcluirConta = $('btn-excluir-conta');
        if (btnExcluirConta) {
            btnExcluirConta.addEventListener('click', () => {
                const modalExclusao = $('modal-excluir-conta-seguro');
                if (!modalExclusao) return;

                const inputSenha = $('input-excluir-conta-senha');
                const erroSenha = $('erro-excluir-conta-senha');
                const blocoSenha = $('bloco-excluir-conta-senha');
                const blocoGoogle = $('bloco-excluir-conta-google');

                if (inputSenha) inputSenha.value = '';
                if (erroSenha) erroSenha.textContent = '';

                // Verifica se o usuário autenticado usa login Google sem senha local
                const user = (window.ItaimSessao && typeof window.ItaimSessao.obterUsuarioLogado === 'function')
                    ? window.ItaimSessao.obterUsuarioLogado()
                    : null;

                const isGoogle = user && (!user.temSenhaLocal && user.googleId);
                if (isGoogle) {
                    if (blocoSenha) blocoSenha.style.display = 'none';
                    if (blocoGoogle) blocoGoogle.style.display = 'flex';
                } else {
                    if (blocoSenha) blocoSenha.style.display = 'block';
                    if (blocoGoogle) blocoGoogle.style.display = 'none';
                }

                abrirModal(modalExclusao);
            });
        }

        const btnCancelarExclusao = $('btn-cancelar-exclusao-conta');
        if (btnCancelarExclusao) {
            btnCancelarExclusao.addEventListener('click', () => fecharModal($('modal-excluir-conta-seguro')));
        }

        const btnFecharModalExcluir = $('btn-fechar-modal-excluir-conta');
        if (btnFecharModalExcluir) {
            btnFecharModalExcluir.addEventListener('click', () => fecharModal($('modal-excluir-conta-seguro')));
        }

        const btnConfirmarExclusao = $('btn-confirmar-exclusao-conta');
        if (btnConfirmarExclusao) {
            btnConfirmarExclusao.addEventListener('click', async () => {
                const inputSenha = $('input-excluir-conta-senha');
                const erroSenha = $('erro-excluir-conta-senha');
                const senha = inputSenha ? inputSenha.value.trim() : '';

                const blocoSenha = $('bloco-excluir-conta-senha');
                const precisaSenha = blocoSenha && blocoSenha.style.display !== 'none';

                if (precisaSenha && !senha) {
                    if (erroSenha) erroSenha.textContent = 'Digite sua senha atual para autorizar a exclusão definitiva.';
                    if (inputSenha) inputSenha.focus();
                    return;
                }

                btnConfirmarExclusao.disabled = true;
                const originalText = btnConfirmarExclusao.textContent;
                btnConfirmarExclusao.textContent = 'Excluindo conta...';

                try {
                    if (window.ItaimApi?.auth?.excluirConta) {
                        await window.ItaimApi.auth.excluirConta(senha);
                    }

                    // Limpa sessão local
                    const user = window.ItaimSessao?.obterUsuarioLogado ? window.ItaimSessao.obterUsuarioLogado() : null;
                    if (window.ItaimSessao?.excluirContaPermanentemente) {
                        window.ItaimSessao.excluirContaPermanentemente(user ? user.email : '');
                    }

                    try {
                        localStorage.setItem('itaim_aviso_auth', 'Sua conta e dados pessoais foram excluídos com sucesso em cumprimento à LGPD.');
                    } catch (e) {}

                    window.location.href = '../../index.html?msg=conta_excluida';
                } catch (err) {
                    btnConfirmarExclusao.disabled = false;
                    btnConfirmarExclusao.textContent = originalText;

                    if (erroSenha) {
                        erroSenha.textContent = err.message || 'Senha incorreta ou falha na exclusão da conta.';
                    } else {
                        alert(err.message || 'Falha ao excluir conta.');
                    }
                }
            });
        }

        // Funções utilitárias de modal
        function abrirModal(modal) {
            if (modal) {
                modal.classList.add('aberto');
                document.body.style.overflow = 'hidden';
            }
        }

        function fecharModal(modal) {
            if (modal) {
                modal.classList.remove('aberto');
                document.body.style.overflow = '';
            }
        }

        // Fecha modais com clique fora e tecla ESC
        [modalDossie, modalExcluir].forEach(m => {
            if (m) {
                m.addEventListener('click', (e) => {
                    if (e.target === m) fecharModal(m);
                });
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                fecharModal(modalDossie);
                fecharModal(modalExcluir);
            }
        });
    }

    window.ItaimConfigPrivacidade = {
        inicializar
    };
})();

