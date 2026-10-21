/**
 * ITAIM VENDE - PERFIL: UTILITÁRIOS E FORMATAÇÃO
 * Arquivo: frontend/js/pages/perfil/perfil/perfil-utils.js
 */

(function () {
    'use strict';

    const urlParams = new URLSearchParams(window.location.search);
    const paramEmail = (urlParams.get('email') || '').toLowerCase().trim();
    const paramNome = (urlParams.get('vendedor') || urlParams.get('nome') || '').trim();
    const paramId = urlParams.get('id');

    const isPerfilProprio = !paramEmail && !paramNome && !paramId;

    const fallbackAvatarPerfil = (window.ItaimRotas && typeof window.ItaimRotas.obterAsset === 'function')
        ? window.ItaimRotas.obterAsset('assets/icons/icon-user.png')
        : '../../assets/icons/icon-user.png';

    function formatarTelefoneBR(tel) {
        if (!tel) return '';
        const num = String(tel).replace(/\D/g, '');
        if (num.length === 11) {
            return `(${num.substring(0, 2)}) ${num.substring(2, 7)}-${num.substring(7)}`;
        }
        if (num.length === 10) {
            return `(${num.substring(0, 2)}) ${num.substring(2, 6)}-${num.substring(6)}`;
        }
        return tel;
    }

    function formatarPreco(val) {
        if (val === 0 || val === '0' || val === null || val === undefined) {
            return '<span style="color: #44BD32; font-weight: 800;">Grátis / Doação</span>';
        }
        return Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    function exibirToast(mensagem = 'Informações salvas com sucesso!') {
        const toast = document.getElementById('toast-sucesso');
        if (!toast) return;
        const span = toast.querySelector('span');
        if (span) span.textContent = mensagem;
        toast.classList.add('visivel');
        setTimeout(() => {
            toast.classList.remove('visivel');
        }, 3500);
    }

    window.ItaimPerfilUtils = {
        paramEmail,
        paramNome,
        paramId,
        isPerfilProprio,
        fallbackAvatarPerfil,
        formatarTelefoneBR,
        formatarPreco,
        exibirToast
    };
})();
