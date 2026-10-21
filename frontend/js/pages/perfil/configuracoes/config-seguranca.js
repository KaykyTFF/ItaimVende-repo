/**
 * ITAIM VENDE - CONFIGURAÇÕES: SEGURANÇA E ALTERAÇÃO DE SENHA
 * Arquivo: frontend/js/pages/perfil/configuracoes/config-seguranca.js
 */

(function () {
    'use strict';

    function inicializar() {
        const { $, toast, marcarErro } = window.ItaimConfigUtils;

        // Alternância de visibilidade das senhas
        document.querySelectorAll('.cfg-ver-senha').forEach(btn => {
            btn.addEventListener('click', () => {
                const input = $(btn.dataset.alvo);
                if (!input) return;
                const mostrar = input.type === 'password';
                input.type = mostrar ? 'text' : 'password';
                btn.textContent = mostrar ? 'Ocultar' : 'Mostrar';
            });
        });

        // Cálculo de força da senha
        function forcaSenha(s) {
            let pontos = 0;
            if (s.length >= 8) pontos++;
            if (s.length >= 12) pontos++;
            if (/[a-z]/.test(s) && /[A-Z]/.test(s)) pontos++;
            if (/\d/.test(s)) pontos++;
            if (/[^A-Za-z0-9]/.test(s)) pontos++;
            return pontos; // 0 a 5
        }

        const inputSenhaNova = $('cfg-senha-nova');
        if (inputSenhaNova) {
            inputSenhaNova.addEventListener('input', (e) => {
                const s = e.target.value;
                const barra = $('forca-barra'), texto = $('forca-texto');
                if (!barra || !texto) return;

                if (!s) {
                    barra.style.width = '0';
                    texto.textContent = 'Digite uma nova senha';
                    return;
                }
                const p = forcaSenha(s);
                const niveis = [
                    { w: '20%', cor: '#DC2626', t: 'Muito fraca' },
                    { w: '20%', cor: '#DC2626', t: 'Muito fraca' },
                    { w: '40%', cor: '#F97316', t: 'Fraca' },
                    { w: '60%', cor: '#EAB308', t: 'Razoável' },
                    { w: '80%', cor: '#65A30D', t: 'Boa' },
                    { w: '100%', cor: '#44BD32', t: 'Forte' }
                ];
                const n = niveis[p] || niveis[0];
                barra.style.width = n.w;
                barra.style.background = n.cor;
                texto.textContent = 'Força: ' + n.t;
            });
        }

        const formSenha = $('form-senha');
        if (formSenha) {
            formSenha.addEventListener('submit', async (e) => {
                e.preventDefault();
                const atual = $('cfg-senha-atual') ? $('cfg-senha-atual').value : '';
                const nova = $('cfg-senha-nova') ? $('cfg-senha-nova').value : '';
                const confirma = $('cfg-senha-confirma') ? $('cfg-senha-confirma').value : '';

                const okAtual = marcarErro('cfg-senha-atual', 'erro-senha-atual', !atual ? 'Informe sua senha atual.' : '');
                let msgNova = '';
                if (nova.length < 8) {
                    msgNova = 'A nova senha precisa ter pelo menos 8 caracteres.';
                } else if (!/[A-Za-z]/.test(nova) || !/\d/.test(nova)) {
                    msgNova = 'Misture letras e números.';
                } else if (nova === atual) {
                    msgNova = 'A nova senha deve ser diferente da atual.';
                }

                const okNova = marcarErro('cfg-senha-nova', 'erro-senha-nova', msgNova);
                const okConf = marcarErro('cfg-senha-confirma', 'erro-senha-confirma', nova !== confirma ? 'As senhas não coincidem.' : '');

                if (!(okAtual && okNova && okConf)) {
                    toast('Corrija os campos destacados.', true);
                    return;
                }

                const btnSalvar = formSenha.querySelector('button[type="submit"]');
                const textoOriginal = btnSalvar ? btnSalvar.textContent : 'Salvar nova senha';
                if (btnSalvar) {
                    btnSalvar.disabled = true;
                    btnSalvar.textContent = 'Salvando...';
                }

                try {
                    if (window.ItaimApi && window.ItaimApi.auth && window.ItaimApi.auth.obterToken()) {
                        await window.ItaimApi.auth.alterarSenha(atual, nova);
                    }

                    formSenha.reset();
                    const barra = $('forca-barra'), texto = $('forca-texto');
                    if (barra) barra.style.width = '0';
                    if (texto) texto.textContent = 'Digite uma nova senha';

                    document.querySelectorAll('.cfg-ver-senha').forEach(b => { b.textContent = 'Mostrar'; });
                    ['cfg-senha-atual', 'cfg-senha-nova', 'cfg-senha-confirma'].forEach(id => {
                        const el = $(id);
                        if (el) el.type = 'password';
                    });

                    toast('Senha atualizada com sucesso!');
                } catch (err) {
                    console.warn('[Configurações] Erro ao alterar senha:', err);
                    const msgErro = err.message || 'Erro ao alterar senha. Verifique os dados.';
                    if (msgErro.toLowerCase().includes('atual')) {
                        marcarErro('cfg-senha-atual', 'erro-senha-atual', msgErro);
                    }
                    toast(msgErro, true);
                } finally {
                    if (btnSalvar) {
                        btnSalvar.disabled = false;
                        btnSalvar.textContent = textoOriginal;
                    }
                }
            });
        }
    }

    window.ItaimConfigSeguranca = {
        inicializar
    };
})();
