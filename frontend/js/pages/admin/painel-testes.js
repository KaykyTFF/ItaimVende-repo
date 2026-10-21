/**
 * ITAIM VENDE - PAINEL DE CONTROLE: MATRIZ DE TESTES DE INTEGRIDADE
 * Arquivo: frontend/js/pages/admin/painel-testes.js
 */

(function () {
    'use strict';

    window.ItaimAdminTestes = window.ItaimAdminTestes || {};

    const MODULOS_TESTE = [
        {
            id: 'health',
            nome: 'Servidor HTTP & Healthcheck',
            icone: 'fa-server',
            endpoint: '/health',
            metodo: 'GET',
            esperado: 200,
        },
        {
            id: 'system_status',
            nome: 'Telemetria do Sistema & Métricas',
            icone: 'fa-chart-line',
            endpoint: '/system/status',
            metodo: 'GET',
            esperado: 200,
        },
        {
            id: 'categories',
            nome: 'Catálogo de Categorias Oficiais',
            icone: 'fa-tags',
            endpoint: '/categories',
            metodo: 'GET',
            esperado: 200,
        },
        {
            id: 'products',
            nome: 'Vitrine de Produtos & Busca Paginada',
            icone: 'fa-bag-shopping',
            endpoint: '/products?page=1&limit=2',
            metodo: 'GET',
            esperado: 200,
        },
        {
            id: 'auth_validate',
            nome: 'Segurança de Autenticação & Validação',
            icone: 'fa-shield-halved',
            endpoint: '/auth/login',
            metodo: 'POST',
            corpo: { email: 'invalid@email.com', password: 'wrong' },
            esperado: 401, // 401 esperado por credenciais incorretas (rota viva)
        },
        {
            id: 'chat_guard',
            nome: 'Proteção de Conversas do Chat (JWT Guard)',
            icone: 'fa-comments',
            endpoint: '/chat/conversations',
            metodo: 'GET',
            esperado: 401, // 401 esperado para requisição sem token
        },
        {
            id: 'favorites_guard',
            nome: 'Proteção de Favoritos (JWT Guard)',
            icone: 'fa-heart',
            endpoint: '/favorites',
            metodo: 'GET',
            esperado: 401,
        },
        {
            id: 'orders_guard',
            nome: 'Proteção de Checkout e Pedidos (JWT Guard)',
            icone: 'fa-receipt',
            endpoint: '/orders',
            metodo: 'GET',
            esperado: 401,
        },
        {
            id: 'reviews',
            nome: 'Módulo de Avaliações e Reputação',
            icone: 'fa-star',
            endpoint: '/reviews/vendedor/check_availability',
            metodo: 'GET',
            esperado: [200, 404],
        },
        {
            id: 'uploads_storage',
            nome: 'Acesso Estático a Fotos de Produtos',
            icone: 'fa-image',
            endpoint: '/../uploads/vendas/nonexistent.jpg',
            metodo: 'GET',
            esperado: [200, 404], // 200 se retornar placeholder SVG ou 404
        }
    ];

    function getUtils() {
        return window.ItaimAdminUtils || {};
    }

    /**
     * Renderiza o esqueleto inicial da tabela de testes
     */
    function renderizarTabelaTestes() {
        const { el } = getUtils();
        if (!el?.tbodyTestes) return;

        el.tbodyTestes.innerHTML = MODULOS_TESTE.map((m) => `
            <tr id="test-row-${m.id}">
                <td>
                    <div class="module-title-cell">
                        <span class="module-icon"><i class="fa-solid ${m.icone}"></i></span>
                        <span>${m.nome}</span>
                    </div>
                </td>
                <td><span class="endpoint-tag">${m.metodo} /api${m.endpoint.replace('/..', '')}</span></td>
                <td><span class="status-cell-badge loading" id="status-badge-${m.id}"><i class="fa-solid fa-circle-notch fa-spin"></i> Pronto</span></td>
                <td class="code-font" id="time-cell-${m.id}">-- ms</td>
                <td id="desc-cell-${m.id}">Aguardando teste...</td>
                <td class="text-right">
                    <button class="btn-test-row" data-test-id="${m.id}"><i class="fa-solid fa-play"></i> Testar</button>
                </td>
            </tr>
        `).join('');

        // Vincula cliques aos botões individuais
        el.tbodyTestes.querySelectorAll('.btn-test-row').forEach((btn) => {
            btn.addEventListener('click', () => {
                const testId = btn.getAttribute('data-test-id');
                const testDef = MODULOS_TESTE.find((x) => x.id === testId);
                if (testDef) executarTesteIndividual(testDef);
            });
        });
    }

    /**
     * Executa um teste individual e atualiza sua linha na tabela
     */
    async function executarTesteIndividual(m) {
        const { API_BASE, adicionarLog } = getUtils();
        const badge = document.getElementById(`status-badge-${m.id}`);
        const timeCell = document.getElementById(`time-cell-${m.id}`);
        const descCell = document.getElementById(`desc-cell-${m.id}`);

        if (badge) {
            badge.className = 'status-cell-badge loading';
            badge.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Testando...';
        }

        const start = performance.now();
        const url = `${API_BASE}${m.endpoint}`;

        try {
            const options = {
                method: m.metodo,
                cache: 'no-store',
                headers: { 'Content-Type': 'application/json' },
            };
            if (m.corpo) {
                options.body = JSON.stringify(m.corpo);
            }

            const res = await fetch(url, options);
            const duration = Math.round(performance.now() - start);

            if (timeCell) timeCell.textContent = `${duration} ms`;

            const esperados = Array.isArray(m.esperado) ? m.esperado : [m.esperado];
            const passou = esperados.includes(res.status);

            if (passou) {
                if (badge) {
                    badge.className = 'status-cell-badge pass';
                    badge.innerHTML = `<i class="fa-solid fa-check"></i> Operacional (${res.status})`;
                }
                if (descCell) descCell.textContent = `Resposta íntegra em ${duration}ms com código esperado HTTP ${res.status}.`;
                if (adicionarLog) adicionarLog(`[${m.nome}] Teste aprovado: HTTP ${res.status}`, 'pass', duration);
            } else {
                if (badge) {
                    badge.className = 'status-cell-badge warn';
                    badge.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Status ${res.status}`;
                }
                if (descCell) descCell.textContent = `Recebido HTTP ${res.status} (esperava ${esperados.join(' ou ')}).`;
                if (adicionarLog) adicionarLog(`[${m.nome}] Alerta: Código inesperado HTTP ${res.status}`, 'warn', duration);
            }
        } catch (err) {
            const duration = Math.round(performance.now() - start);
            if (timeCell) timeCell.textContent = `${duration} ms`;
            if (badge) {
                badge.className = 'status-cell-badge fail';
                badge.innerHTML = '<i class="fa-solid fa-xmark"></i> Falha';
            }
            if (descCell) descCell.textContent = `Erro de conexão: ${err.message}`;
            if (adicionarLog) adicionarLog(`[${m.nome}] Falha no teste: ${err.message}`, 'fail', duration);
        }
    }

    /**
     * Executa todos os testes da matriz em sequência
     */
    async function executarTodosOsTestes() {
        const { API_BASE, mostrarToast, adicionarLog } = getUtils();
        if (mostrarToast) mostrarToast('Iniciando bateria completa de testes...', 'info');
        if (adicionarLog) adicionarLog('Iniciando bateria automatizada de testes...', 'pass');

        for (const m of MODULOS_TESTE) {
            await executarTesteIndividual(m);
        }

        // Executa também o autodiagnóstico no backend
        try {
            const res = await fetch(`${API_BASE}/system/diagnostics`, { method: 'POST' });
            if (res.ok) {
                const report = await res.json();
                if (adicionarLog) adicionarLog(`Autodiagnóstico concluído: ${report.data?.summary?.passed || 0}/${report.data?.summary?.total || 0} testes aprovados`, 'pass');
            }
        } catch (e) {
            // Ignora
        }

        if (mostrarToast) mostrarToast('Todos os testes foram concluídos!', 'success');
    }

    // Exportação do Módulo
    window.ItaimAdminTestes = {
        MODULOS_TESTE,
        renderizarTabelaTestes,
        executarTesteIndividual,
        executarTodosOsTestes
    };

})();
