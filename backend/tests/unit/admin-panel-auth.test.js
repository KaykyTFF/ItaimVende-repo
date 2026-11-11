import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../..');

describe('Suíte de Testes Unitários — Autenticação Administrativa e Proteção do Painel (RBAC)', () => {

    describe('1. Verificação de Arquivos e Componentes de Interface do Login do Painel', () => {
        const caminhoLoginPainel = path.join(projectRoot, 'frontend/pages/admin/login-painel.html');
        const caminhoJsLoginPainel = path.join(projectRoot, 'frontend/js/pages/admin/login-painel.js');
        const caminhoCssLoginPainel = path.join(projectRoot, 'frontend/css/pages/admin/login-painel.css');

        test('CT-ADM01: login-painel.html deve existir com formulário, contador de tentativas e card de bloqueio', () => {
            assert.ok(fs.existsSync(caminhoLoginPainel), 'O arquivo login-painel.html deve existir');
            const conteudoHtml = fs.readFileSync(caminhoLoginPainel, 'utf-8');

            assert.ok(conteudoHtml.includes('id="form-login-painel"'), 'Deve conter form-login-painel');
            assert.ok(conteudoHtml.includes('id="input-usuario-adm"'), 'Deve conter input de usuário');
            assert.ok(conteudoHtml.includes('id="input-senha-adm"'), 'Deve conter input de senha');
            assert.ok(conteudoHtml.includes('id="btn-entrar-adm"'), 'Deve conter botão de entrar');
            assert.ok(conteudoHtml.includes('id="badge-tentativas"'), 'Deve conter badge de tentativas restantes');
            assert.ok(conteudoHtml.includes('id="card-bloqueio-alerta"'), 'Deve conter card de bloqueio temporário');
            assert.ok(conteudoHtml.includes('login-painel.js'), 'Deve carregar login-painel.js');
        });

        test('CT-ADM02: login-painel.js deve conter a lista dos 5 desenvolvedores autorizados e bloqueio contra força bruta', () => {
            assert.ok(fs.existsSync(caminhoJsLoginPainel), 'O arquivo login-painel.js deve existir');
            const conteudoJs = fs.readFileSync(caminhoJsLoginPainel, 'utf-8');

            assert.ok(conteudoJs.includes('josimar'), 'Deve conter Josimar na lista');
            assert.ok(conteudoJs.includes('kayky'), 'Deve conter Kayky na lista');
            assert.ok(conteudoJs.includes('pedroravy'), 'Deve conter Pedro Ravy na lista');
            assert.ok(conteudoJs.includes('giselly'), 'Deve conter Giselly na lista');
            assert.ok(conteudoJs.includes('raili'), 'Deve conter Raili na lista');
            assert.ok(conteudoJs.includes('MAX_TENTATIVAS = 5'), 'Deve limitar a 5 tentativas');
            assert.ok(conteudoJs.includes('TEMPO_BLOQUEIO_MS = 15 * 60 * 1000'), 'Bloqueio de 15 minutos');
        });

        test('CT-ADM03: login-painel.css deve existir e conter customização de badge e tema escuro', () => {
            assert.ok(fs.existsSync(caminhoCssLoginPainel), 'O arquivo login-painel.css deve existir');
            const conteudoCss = fs.readFileSync(caminhoCssLoginPainel, 'utf-8');

            assert.ok(conteudoCss.includes('.auth-painel-badge'), 'Deve estilizar o badge do painel');
            assert.ok(conteudoCss.includes('[data-theme="dark"]'), 'Deve conter suporte a tema escuro');
        });
    });

    describe('2. Guarda de Acesso Estrito no Painel de Controle (painel.html)', () => {
        const caminhoPainel = path.join(projectRoot, 'frontend/pages/admin/painel.html');
        const conteudoPainel = fs.readFileSync(caminhoPainel, 'utf-8');

        test('CT-ADM04: painel.html deve conter guarda anti-FOUC no <head> redirecionando visitantes sem permissão', () => {
            assert.ok(conteudoPainel.includes('itaim_painel_auth'), 'Deve checar sessão itaim_painel_auth');
            assert.ok(conteudoPainel.includes('login-painel.html'), 'Deve redirecionar para login-painel.html caso não autenticado');
            assert.ok(conteudoPainel.includes('window.location.replace'), 'Deve utilizar replace para não poluir histórico');
        });

        test('CT-ADM05: painel.html deve exibir identificação do administrador logado e botão de logout', () => {
            assert.ok(conteudoPainel.includes('id="admin-user-pill"'), 'Deve conter o pill de identificação do admin');
            assert.ok(conteudoPainel.includes('id="admin-user-nome"'), 'Deve conter elemento do nome do admin');
            assert.ok(conteudoPainel.includes('id="admin-user-role"'), 'Deve conter elemento do cargo/role');
            assert.ok(conteudoPainel.includes('id="btn-logout-painel"'), 'Deve conter botão de logout');
        });
    });

    describe('3. Proteção no Orquestrador de Sessão (sessao-ui.js)', () => {
        const caminhoSessaoUi = path.join(projectRoot, 'frontend/js/core/sessao/sessao-ui.js');
        const conteudoSessaoUi = fs.readFileSync(caminhoSessaoUi, 'utf-8');

        test('CT-ADM06: protegerPagina deve interceptar /painel e redirecionar usuários comuns ou deslogados', () => {
            assert.ok(conteudoSessaoUi.includes("rotaAtual === 'painel'"), 'Deve tratar rota painel');
            assert.ok(conteudoSessaoUi.includes('login-painel'), 'Deve redirecionar para login-painel');
            assert.ok(conteudoSessaoUi.includes("role === 'ADMIN' || role === 'MODERATOR'"), 'Deve validar papel de admin ou moderador');
        });

        test('CT-ADM07: login-painel e login-admin devem ser reconhecidos como rotas públicas de autenticação', () => {
            assert.ok(conteudoSessaoUi.includes("rotaAtual === 'login-painel'"), 'login-painel não deve sofrer loop de redirect');
            assert.ok(conteudoSessaoUi.includes("rotaAtual === 'login-admin'"), 'login-admin não deve sofrer loop de redirect');
        });
    });

    describe('4. Roteamento no Backend e Mapa Canônico (server.js e rotas-mapa.js)', () => {
        const caminhoServer = path.join(projectRoot, 'backend/src/server.js');
        const conteudoServer = fs.readFileSync(caminhoServer, 'utf-8');

        const caminhoRotasMapa = path.join(projectRoot, 'frontend/js/core/rotas/rotas-mapa.js');
        const conteudoRotasMapa = fs.readFileSync(caminhoRotasMapa, 'utf-8');

        test('CT-ADM08: server.js deve registrar rotas limpas /login-painel e /login-admin', () => {
            assert.ok(conteudoServer.includes("'login-painel': 'pages/admin/login-painel.html'"), 'Deve rotear /login-painel');
            assert.ok(conteudoServer.includes("'login-admin': 'pages/admin/login-painel.html'"), 'Deve rotear /login-admin');
        });

        test('CT-ADM09: rotas-mapa.js deve catalogar login-painel como rota pública e canônica', () => {
            assert.ok(conteudoRotasMapa.includes("'login-painel': 'pages/admin/login-painel.html'"), 'Mapeamento físico');
            assert.ok(conteudoRotasMapa.includes("'login-painel': '/login-painel'"), 'Mapeamento canônico');
            assert.ok(conteudoRotasMapa.includes("'login-painel'"), 'Lista de rotas públicas');
        });
    });

    describe('5. Regra Pura de Bloqueio RBAC contra Usuários Comuns (Role Restriction)', () => {
        function validarAcessoAdminMock(userRole) {
            const role = (userRole || '').toUpperCase();
            if (role === 'ADMIN' || role === 'MODERATOR') {
                return { autorizado: true };
            }
            return {
                autorizado: false,
                motivo: 'Acesso negado: sua conta é de usuário comum. Somente Administradores e Moderadores têm acesso ao Painel.'
            };
        }

        test('CT-ADM10: Usuários com role BUYER ou SELLER devem ter acesso estritamente recusado', () => {
            assert.equal(validarAcessoAdminMock('BUYER').autorizado, false);
            assert.equal(validarAcessoAdminMock('buyer').autorizado, false);
            assert.equal(validarAcessoAdminMock('SELLER').autorizado, false);
            assert.equal(validarAcessoAdminMock('seller').autorizado, false);
            assert.equal(validarAcessoAdminMock('').autorizado, false);
            assert.equal(validarAcessoAdminMock(null).autorizado, false);

            assert.equal(validarAcessoAdminMock('ADMIN').autorizado, true);
            assert.equal(validarAcessoAdminMock('MODERATOR').autorizado, true);
        });
    });
});

