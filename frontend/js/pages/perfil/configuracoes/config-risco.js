/**
 * ITAIM VENDE - CONFIGURAÇÕES: ZONA DE RISCO E MODAL DE CONFIRMAÇÃO
 * Arquivo: frontend/js/pages/perfil/configuracoes/config-risco.js
 */

(function () {
    'use strict';

    function inicializar() {
        const { $ } = window.ItaimConfigUtils;
        const modal = $('cfg-modal');
        let aoConfirmar = null;

        function confirmar(titulo, texto, fn, textoBotao = 'Confirmar', isPerigo = true) {
            if (!modal) {
                if (window.confirm(`${titulo}\n\n${texto}`)) fn();
                return;
            }
            if ($('cfg-modal-titulo')) $('cfg-modal-titulo').textContent = titulo;
            if ($('cfg-modal-texto')) $('cfg-modal-texto').textContent = texto;
            const btnConf = $('cfg-modal-confirmar');
            if (btnConf) {
                btnConf.textContent = textoBotao;
                btnConf.className = isPerigo ? 'cfg-btn cfg-btn-perigo' : 'cfg-btn cfg-btn-suspender';
                btnConf.style.background = '';
                btnConf.style.color = '';
            }
            aoConfirmar = fn;
            modal.classList.add('aberto');
            if ($('cfg-modal-cancelar')) $('cfg-modal-cancelar').focus();
        }

        function fecharModal() {
            if (modal) modal.classList.remove('aberto');
            aoConfirmar = null;
        }

        if ($('cfg-modal-cancelar')) $('cfg-modal-cancelar').addEventListener('click', fecharModal);
        if ($('cfg-modal-confirmar')) {
            $('cfg-modal-confirmar').addEventListener('click', () => {
                const fn = aoConfirmar;
                fecharModal();
                if (fn) fn();
            });
        }
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) fecharModal();
            });
        }
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') fecharModal();
        });

        // Suspender conta
        const btnSuspender = $('btn-suspender-conta');
        if (btnSuspender) {
            btnSuspender.addEventListener('click', () => {
                confirmar(
                    'Suspender conta temporariamente?',
                    'Ao suspender sua conta, todos os seus anúncios publicados ficarão pausados e invisíveis para compradores. Você poderá reativar sua conta e seus anúncios a qualquer momento simplesmente fazendo login com seu e-mail e senha.',
                    () => {
                        const user = (window.ItaimSessao && typeof window.ItaimSessao.obterUsuarioLogado === 'function')
                            ? window.ItaimSessao.obterUsuarioLogado()
                            : null;
                        if (window.ItaimSessao && typeof window.ItaimSessao.suspenderConta === 'function') {
                            window.ItaimSessao.suspenderConta(user ? user.email : '');
                        }
                        try {
                            localStorage.setItem('itaim_aviso_auth', 'Sua conta foi suspensa temporariamente. Para reativá-la e voltar a negociar, basta fazer login.');
                        } catch (e) {}
                        window.location.href = '../index.html?msg=conta_suspensa';
                    },
                    'Sim, suspender conta',
                    false
                );
            });
        }

        // Excluir conta definitivamente (LGPD)
        const btnExcluir = $('btn-excluir-conta');
        if (btnExcluir) {
            btnExcluir.addEventListener('click', () => {
                confirmar(
                    'Excluir conta permanentemente?',
                    'ATENÇÃO: Esta ação é definitiva e não poderá ser desfeita! Todos os seus dados cadastrais, seus anúncios publicados, fotos, favoritos e avaliações serão apagados para sempre do Itaim Vende. Tem certeza de que deseja excluir sua conta?',
                    async () => {
                        const user = (window.ItaimSessao && typeof window.ItaimSessao.obterUsuarioLogado === 'function')
                            ? window.ItaimSessao.obterUsuarioLogado()
                            : null;

                        // 1. Invoca a rota DELETE /api/v1/auth/me no backend se autenticado
                        if (window.ItaimApi?.auth?.excluirConta && window.ItaimApi?.auth?.obterToken()) {
                            try {
                                await window.ItaimApi.auth.excluirConta();
                            } catch (errApi) {
                                console.warn('[ConfigRisco] Falha ao excluir conta no backend:', errApi.message);
                            }
                        }

                        // 2. Limpa cache e dados locais na sessão
                        if (window.ItaimSessao && typeof window.ItaimSessao.excluirContaPermanentemente === 'function') {
                            window.ItaimSessao.excluirContaPermanentemente(user ? user.email : '');
                        }

                        try {
                            localStorage.setItem('itaim_aviso_auth', 'Sua conta foi excluída permanentemente. Todos os seus dados foram apagados com sucesso.');
                        } catch (e) {}

                        const urlDestino = window.ItaimRotas ? window.ItaimRotas.obterUrl('login', 'msg=conta_excluida') : '../../index.html?msg=conta_excluida';
                        window.location.href = urlDestino;
                    },
                    'Excluir definitivamente',
                    true
                );
            });
        }

        window.ItaimConfigRisco.confirmar = confirmar;
        window.ItaimConfigRisco.fecharModal = fecharModal;
    }

    window.ItaimConfigRisco = {
        inicializar,
        confirmar: null,
        fecharModal: null
    };
})();
