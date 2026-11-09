/**
 * ITAIM VENDE - ESTILOS E TEMA DO AJUSTADOR DE FOTO
 * Arquivo: frontend/js/core/ajustar-foto/foto-estilos.js
 * 
 * Responsabilidades:
 * - Injeção dinâmica de CSS com tema moderno, responsivo e dark-backdrop
 * - Estilização do modal, viewport de corte 1:1 (quadrado ou circular para perfil),
 *   sliders de zoom e botões de ação
 * - Bloqueio de scroll de fundo e suporte a toque móvel (touch-action)
 */

(function() {
    'use strict';

    function injetarEstilos() {
        if (document.getElementById('estilos-ajustar-foto')) return;
        const style = document.createElement('style');
        style.id = 'estilos-ajustar-foto';
        style.textContent = `
            .modal-ajuste-backdrop {
                position: fixed;
                inset: 0;
                background: rgba(15, 23, 42, 0.75);
                backdrop-filter: blur(4px);
                z-index: 99999;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 16px;
                animation: fadeInModal 0.2s ease-out;
                overscroll-behavior: contain;
                touch-action: none;
            }
            @keyframes fadeInModal {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            .modal-ajuste-card {
                background: #ffffff;
                width: 100%;
                max-width: 440px;
                max-height: 94vh;
                border-radius: 16px;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
                overflow: hidden;
                display: flex;
                flex-direction: column;
                user-select: none;
                -webkit-user-select: none;
                overscroll-behavior: contain;
                touch-action: manipulation;
            }
            .modal-ajuste-topo {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 16px 20px;
                border-bottom: 1px solid #E2E8F0;
                flex-shrink: 0;
            }
            .modal-ajuste-titulo {
                font-size: 17px;
                font-weight: 700;
                color: #0F172A;
                margin: 0;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .modal-ajuste-fechar {
                background: none;
                border: none;
                color: #64748B;
                font-size: 22px;
                cursor: pointer;
                padding: 4px;
                line-height: 1;
                border-radius: 6px;
                transition: all 0.2s;
            }
            .modal-ajuste-fechar:hover {
                color: #0F172A;
                background: #F1F5F9;
            }
            .modal-ajuste-corpo {
                padding: 20px;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 16px;
                background: #F8FAFC;
                overflow-y: auto;
                overscroll-behavior: contain;
            }
            /* Área de visualização do corte (quadrada) */
            .modal-ajuste-viewport {
                width: 280px;
                height: 280px;
                position: relative;
                overflow: hidden;
                background: #0F172A;
                border-radius: 12px;
                cursor: grab;
                touch-action: none;
                -webkit-user-select: none;
                user-select: none;
                box-shadow: inset 0 0 0 2px rgba(255,255,255,0.2), 0 8px 20px rgba(0,0,0,0.15);
            }
            .modal-ajuste-viewport.modo-perfil {
                border-radius: 50%;
            }
            .modal-ajuste-viewport:active {
                cursor: grabbing;
            }
            .modal-ajuste-canvas {
                position: absolute;
                top: 0;
                left: 0;
                pointer-events: none;
            }
            .modal-ajuste-grade {
                position: absolute;
                inset: 0;
                border: 2px dashed rgba(255, 255, 255, 0.4);
                pointer-events: none;
                border-radius: inherit;
            }
            .modal-ajuste-dica {
                font-size: 12.5px;
                color: #64748B;
                text-align: center;
                margin: 0;
                line-height: 1.4;
            }
            /* Controles de Zoom e Rotação */
            .modal-ajuste-controles {
                width: 100%;
                display: flex;
                align-items: center;
                gap: 12px;
                background: #ffffff;
                padding: 10px 14px;
                border-radius: 10px;
                border: 1px solid #E2E8F0;
                flex-shrink: 0;
            }
            .modal-ajuste-controles svg {
                color: #64748B;
                flex-shrink: 0;
            }
            .modal-ajuste-slider {
                flex: 1;
                accent-color: #38A129;
                cursor: pointer;
                touch-action: pan-x;
            }
            .modal-ajuste-btn-girar {
                background: #F1F5F9;
                border: 1px solid #CBD5E1;
                border-radius: 8px;
                padding: 6px 10px;
                font-size: 13px;
                font-weight: 600;
                color: #334155;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 6px;
                transition: background 0.2s;
            }
            .modal-ajuste-btn-girar:hover {
                background: #E2E8F0;
            }
            /* Rodapé com Botões de Ação */
            .modal-ajuste-rodape {
                display: flex;
                align-items: center;
                justify-content: flex-end;
                gap: 10px;
                padding: 14px 20px;
                border-top: 1px solid #E2E8F0;
                background: #ffffff;
                flex-shrink: 0;
            }
            .modal-ajuste-btn-cancelar {
                padding: 9px 16px;
                background: #F1F5F9;
                border: 1px solid #CBD5E1;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 600;
                color: #475569;
                cursor: pointer;
                transition: all 0.2s;
            }
            .modal-ajuste-btn-cancelar:hover {
                background: #E2E8F0;
                color: #0F172A;
            }
            .modal-ajuste-btn-salvar {
                padding: 9px 20px;
                background: #38A129;
                border: none;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 700;
                color: #ffffff;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 6px;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.18);
                transition: all 0.2s;
            }
            .modal-ajuste-btn-salvar:hover {
                background: #2E8B22;
                transform: translateY(-1px);
                box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
            }
            /* Suporte ao Modo Escuro */
            [data-theme="dark"] .modal-ajuste-card {
                background: #1F2831;
                border: 1px solid #2C3946;
                color: #F1F5F9;
                box-shadow: 0 20px 48px rgba(0, 0, 0, 0.55);
            }
            [data-theme="dark"] .modal-ajuste-topo {
                border-bottom: 1px solid #2C3946;
            }
            [data-theme="dark"] .modal-ajuste-titulo {
                color: #F1F5F9;
            }
            [data-theme="dark"] .modal-ajuste-fechar {
                color: #94A3B8;
            }
            [data-theme="dark"] .modal-ajuste-fechar:hover {
                color: #F1F5F9;
                background: #242E38;
            }
            [data-theme="dark"] .modal-ajuste-corpo {
                background: #161C22;
            }
            [data-theme="dark"] .modal-ajuste-dica {
                color: #94A3B8;
            }
            [data-theme="dark"] .modal-ajuste-controles {
                background: #1F2831;
                border: 1px solid #2C3946;
            }
            [data-theme="dark"] .modal-ajuste-controles svg {
                color: #94A3B8;
            }
            [data-theme="dark"] .modal-ajuste-btn-girar {
                background: #242E38;
                border-color: #2C3946;
                color: #F1F5F9;
            }
            [data-theme="dark"] .modal-ajuste-btn-girar:hover {
                background: #2D3945;
                color: #4ADE80;
                border-color: #4ADE80;
            }
            [data-theme="dark"] .modal-ajuste-rodape {
                background: #1F2831;
                border-top: 1px solid #2C3946;
            }
            [data-theme="dark"] .modal-ajuste-btn-cancelar {
                background: #242E38;
                border-color: #2C3946;
                color: #F1F5F9;
            }
            [data-theme="dark"] .modal-ajuste-btn-cancelar:hover {
                background: #2D3945;
                color: #FFFFFF;
            }
            [data-theme="dark"] .modal-ajuste-btn-salvar,
            .dark-theme .modal-ajuste-btn-salvar {
                background: #38A129 !important;
                background-color: #38A129 !important;
                color: #FFFFFF !important;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35) !important;
            }
            [data-theme="dark"] .modal-ajuste-btn-salvar:hover,
            .dark-theme .modal-ajuste-btn-salvar:hover {
                background: #2E8B22 !important;
                background-color: #2E8B22 !important;
                box-shadow: 0 4px 10px rgba(0, 0, 0, 0.45) !important;
            }
        `;
        document.head.appendChild(style);
    }

    window.ItaimFotoEstilos = {
        injetarEstilos
    };

})();