/**
 * ITAIM VENDE - CONFIGURAÇÕES: NAVEGAÇÃO ENTRE ABAS E SEÇÕES
 * Arquivo: frontend/js/pages/perfil/configuracoes/config-navegacao.js
 */

(function () {
    'use strict';

    function inicializar() {
        const abas = document.querySelectorAll('.cfg-nav-item');
        const paineis = document.querySelectorAll('.cfg-painel');

        function abrirSecao(nome, atualizarHash = true) {
            if (!document.getElementById('painel-' + nome)) nome = 'conta';
            abas.forEach(a => {
                const ativo = a.dataset.alvo === nome;
                a.classList.toggle('ativo', ativo);
                a.setAttribute('aria-selected', ativo ? 'true' : 'false');
            });
            paineis.forEach(p => p.classList.toggle('ativo', p.id === 'painel-' + nome));
            if (atualizarHash) history.replaceState(null, '', '#' + nome);
        }

        abas.forEach(a => a.addEventListener('click', () => abrirSecao(a.dataset.alvo)));
        window.addEventListener('hashchange', () => abrirSecao(location.hash.slice(1), false));

        abrirSecao(location.hash.slice(1) || 'conta', false);

        window.ItaimConfigNavegacao.abrirSecao = abrirSecao;
    }

    window.ItaimConfigNavegacao = {
        inicializar,
        abrirSecao: null
    };
})();
