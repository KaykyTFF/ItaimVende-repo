/**
 * ITAIM VENDE - INICIALIZADOR IMEDIATO DE TEMA (ANTI-FOUC ZERO FLASH)
 * Arquivo: frontend/js/core/sessao/sessao-tema-init.js
 * 
 * Executa de forma síncrona no <head> antes de qualquer renderização visual
 * para garantir que a página nasça com o tema correto (dark ou light) sem piscar.
 */
(function () {
    'use strict';
    try {
        var path = (window.location.pathname || '').toLowerCase();
        var isAuth = path.endsWith('index.html') || path.includes('/auth/') || path.includes('/login') || path.includes('/cadastro');
        var temaSalvo = localStorage.getItem('itaim_tema');
        var tema = (!isAuth && temaSalvo === 'dark') ? 'dark' : 'light';
        var isDark = (tema === 'dark');
        var docEl = document.documentElement;

        docEl.setAttribute('data-theme', tema);
        if (isDark) {
            docEl.classList.add('dark-theme');
        } else {
            docEl.classList.remove('dark-theme');
        }

        // Impede qualquer transição indesejada durante o carregamento inicial da página
        docEl.classList.add('tema-sem-transicao');

        // Sincroniza o body assim que o parser criar o elemento <body>
        var observer = new MutationObserver(function () {
            if (document.body) {
                document.body.setAttribute('data-theme', tema);
                if (isDark) {
                    document.body.classList.add('dark-theme');
                } else {
                    document.body.classList.remove('dark-theme');
                }
                observer.disconnect();
            }
        });
        observer.observe(docEl, { childList: true, subtree: true });

        // Finaliza observer e reativa transições normais após a página renderizar
        window.addEventListener('DOMContentLoaded', function () {
            observer.disconnect();
            if (document.body) {
                document.body.setAttribute('data-theme', tema);
                if (isDark) {
                    document.body.classList.add('dark-theme');
                } else {
                    document.body.classList.remove('dark-theme');
                }
            }
            requestAnimationFrame(function () {
                requestAnimationFrame(function () {
                    docEl.classList.remove('tema-sem-transicao');
                });
            });
        });
    } catch (e) {
        // Fallback gracioso
    }
})();
