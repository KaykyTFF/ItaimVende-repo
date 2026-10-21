/**
 * ITAIM VENDE - CHAT & CONVERSAS: MÓDULO DE UTILITÁRIOS E FORMATAÇÃO
 * Arquivo: frontend/js/pages/mensagens/conversas-utils.js
 * 
 * Funções auxiliares para formatação de moeda, horas amigáveis, resolução de URLs de mídia,
 * ícones de status de envio/leitura e persistência de cache local.
 */

(function (window) {
    'use strict';

    const fallbackAvatar = (window.ItaimRotas && typeof window.ItaimRotas.obterAsset === 'function')
        ? window.ItaimRotas.obterAsset('assets/icons/icon-user.png')
        : '../../assets/icons/icon-user.png';

    const fallbackProdutoImg = (window.ItaimRotas && typeof window.ItaimRotas.obterAsset === 'function')
        ? window.ItaimRotas.obterAsset('assets/placeholders/produto-placeholder.svg')
        : '../../assets/placeholders/produto-placeholder.svg';

    window.ItaimChatUtils = {
        fallbackAvatar,
        fallbackProdutoImg,

        formatarPreco: function (val) {
            const num = Number(val);
            if (isNaN(num) || num <= 0) return 'A combinar';
            return 'R$ ' + num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        },

        formatarHora: function (dataIso) {
            if (!dataIso) return '';
            try {
                const d = new Date(dataIso);
                if (isNaN(d.getTime())) return '';
                const agora = new Date();
                const ehHoje = d.getDate() === agora.getDate() &&
                               d.getMonth() === agora.getMonth() &&
                               d.getFullYear() === agora.getFullYear();

                const horaFormatada = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                if (ehHoje) {
                    return horaFormatada;
                }

                const ontem = new Date(agora);
                ontem.setDate(agora.getDate() - 1);
                const ehOntem = d.getDate() === ontem.getDate() &&
                                d.getMonth() === ontem.getMonth() &&
                                d.getFullYear() === ontem.getFullYear();

                if (ehOntem) {
                    return `Ontem, ${horaFormatada}`;
                }

                return `${d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}, ${horaFormatada}`;
            } catch (e) {
                return '';
            }
        },

        resolverFoto: function (url, tipo = 'avatar') {
            if (!url) return tipo === 'avatar' ? fallbackAvatar : fallbackProdutoImg;
            if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
                return url;
            }
            if (window.ItaimApi && typeof window.ItaimApi.resolverUrlImagem === 'function') {
                return window.ItaimApi.resolverUrlImagem(url);
            }
            if (window.ItaimRotas && typeof window.ItaimRotas.obterAsset === 'function') {
                return window.ItaimRotas.obterAsset(url);
            }
            return url;
        },

        criarSvgCheck: function (lida) {
            if (lida) {
                return `
                    <span class="msg-check-status lida" title="Lida pelo destinatário">
                        <svg viewBox="0 0 16 11" width="14" height="11" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="1.5 5.5 5 9 11 2"></polyline>
                            <polyline points="6 5.5 8.5 8 14.5 2"></polyline>
                        </svg>
                    </span>
                `;
            }
            return `
                <span class="msg-check-status pendente" title="Enviada">
                    <svg viewBox="0 0 16 11" width="11" height="11" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="2 6 6 9.5 14 2"></polyline>
                    </svg>
                </span>
            `;
        },

        carregarMensagensCacheLocal: function (convId, storagePrefix) {
            if (!convId || !storagePrefix) return null;
            try {
                const raw = localStorage.getItem(storagePrefix + convId);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
                }
            } catch (e) {}
            return null;
        },

        salvarMensagensCacheLocal: function (convId, msgs, storagePrefix) {
            if (!convId || !storagePrefix || !Array.isArray(msgs)) return;
            try {
                // Guarda até 50 mensagens por conversa para evitar extrapolar cota
                const slice = msgs.slice(-50);
                localStorage.setItem(storagePrefix + convId, JSON.stringify(slice));
            } catch (e) {}
        }
    };

})(window);
