/**
 * ITAIM VENDE - VENDEDOR: UTILITÁRIOS E PARÂMETROS DE ROTA
 * Arquivo: frontend/js/pages/perfil/vendedor/vendedor-utils.js
 */

(function () {
    'use strict';

    const params = new URLSearchParams(window.location.search);
    const paramId = params.get('id') || params.get('sellerId') || params.get('userId');
    const paramEmail = (params.get('email') || '').toLowerCase().trim();
    const paramNome = (params.get('vendedor') || params.get('nome') || '').trim();
    const paramUsername = (params.get('username') || '').trim();

    const identificador = paramId || paramEmail || paramUsername || paramNome;

    const fallbackAvatar = (window.ItaimRotas && typeof window.ItaimRotas.obterAsset === 'function')
        ? window.ItaimRotas.obterAsset('assets/icons/icon-user.png')
        : '../../assets/icons/icon-user.png';

    function formatarPreco(val) {
        if (val === 0 || val === '0' || val === null || val === undefined) {
            return '<span style="color: #44BD32; font-weight: 800;">Grátis / Doação</span>';
        }
        return Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    function exibirToast(msg) {
        const toast = document.getElementById('vendedor-toast');
        if (!toast) return;
        const txt = toast.querySelector('.toast-texto');
        if (txt) txt.textContent = msg;
        toast.classList.add('visivel');
        setTimeout(() => {
            toast.classList.remove('visivel');
        }, 3200);
    }

    window.ItaimVendedorUtils = {
        paramId,
        paramEmail,
        paramNome,
        paramUsername,
        identificador,
        fallbackAvatar,
        formatarPreco,
        exibirToast
    };
})();
