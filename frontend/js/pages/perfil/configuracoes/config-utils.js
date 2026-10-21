/**
 * ITAIM VENDE - CONFIGURAÇÕES: UTILITÁRIOS E PERSISTÊNCIA
 * Arquivo: frontend/js/pages/perfil/configuracoes/config-utils.js
 */

(function () {
    'use strict';

    const CHAVE_PERFIL = 'itaim_perfil_usuario';
    const CHAVE_ENDERECOS = 'itaim_enderecos';
    const CHAVE_CONFIG = 'itaim_configuracoes';

    const PADROES = {
        'seg-alerta-login': true,
        'not-mensagens': true,
        'not-avaliacoes': true,
        'not-compras': true,
        'not-favoritos': true,
        'not-precos': true,
        'not-expiracao': true,
        'not-avisos': true,
        'priv-telefone': true,
        'priv-bairro': true,
        'priv-online': false
    };

    function ler(chave, padrao) {
        try {
            const bruto = localStorage.getItem(chave);
            return bruto ? JSON.parse(bruto) : padrao;
        } catch (e) {
            return padrao;
        }
    }

    function gravar(chave, valor) {
        try {
            localStorage.setItem(chave, JSON.stringify(valor));
            return true;
        } catch (e) {
            return false;
        }
    }

    const $ = (id) => document.getElementById(id);
    const soDigitos = (v) => (v || '').replace(/\D/g, '');

    let temporizadorToast = null;
    function toast(msg, erro = false) {
        const el = $('cfg-toast');
        if (!el) return;
        el.textContent = msg;
        el.classList.toggle('erro', erro);
        el.classList.add('visivel');
        clearTimeout(temporizadorToast);
        temporizadorToast = setTimeout(() => el.classList.remove('visivel'), 3200);
    }

    function marcarErro(inputId, erroId, mensagem) {
        const input = $(inputId), erro = $(erroId);
        if (input) input.classList.toggle('invalido', !!mensagem);
        if (erro) erro.textContent = mensagem || '';
        return !mensagem;
    }

    function maskTelefone(v) {
        v = soDigitos(v).slice(0, 11);
        if (v.length > 6) return v.replace(/^(\d{2})(\d{4,5})(\d{0,4}).*/, '($1) $2-$3').replace(/-$/, '');
        if (v.length > 2) return v.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
        if (v.length > 0) return `(${v}`;
        return '';
    }

    function maskCep(v) {
        v = soDigitos(v).slice(0, 8);
        return v.length > 5 ? v.replace(/^(\d{5})(\d{0,3})/, '$1-$2') : v;
    }

    const emailValido = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

    function criarElemento(tag, classe, texto) {
        const el = document.createElement(tag);
        if (classe) el.className = classe;
        if (texto !== undefined) el.textContent = texto;
        return el;
    }

    window.ItaimConfigUtils = {
        CHAVE_PERFIL,
        CHAVE_ENDERECOS,
        CHAVE_CONFIG,
        PADROES,
        ler,
        gravar,
        $,
        soDigitos,
        toast,
        marcarErro,
        maskTelefone,
        maskCep,
        emailValido,
        criarElemento
    };
})();
