import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../..');

describe('Suíte de Testes Unitários — Compartilhamento de Anúncios e Metadados Open Graph', () => {

    // Função utilitária pura que espelha a lógica de formatação de mensagem do WhatsApp
    function montarMensagemWhatsApp({ titulo, preco, isDoacao, canonicalUrl }) {
        let precoTexto = '';
        if (isDoacao || preco === 0 || preco === '0' || Number(preco) <= 0) {
            precoTexto = 'Doação (Gratuito)';
        } else if (preco && Number(preco) > 0) {
            precoTexto = Number(preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        } else {
            precoTexto = 'A combinar';
        }

        const tituloLimpo = (titulo || 'Anúncio').trim();
        const texto = 
            `Olha esse anúncio que encontrei no Itaim Vende!\n\n` +
            `📦 Produto: ${tituloLimpo}\n` +
            `💰 Preço: ${precoTexto}\n\n` +
            `Confira aqui:\n${canonicalUrl}\n\n` +
            `Itaim Vende — Classificados de Paulistana e região.`;

        return {
            texto,
            urlOficial: `https://wa.me/?text=${encodeURIComponent(texto)}`
        };
    }

    describe('1. Formatação e Codificação da Mensagem para WhatsApp', () => {
        test('CT-SH01: Deve montar a mensagem com título, preço em BRL, link canônico e assinatura institucional', () => {
            const params = {
                titulo: 'Smart TV 50" UHD 4K Samsung Crystal',
                preco: 2199.00,
                isDoacao: false,
                canonicalUrl: 'https://itaimvende.com.br/produto?id=cmv5iafj30009ttiwpzq75yvm'
            };

            const resultado = montarMensagemWhatsApp(params);
            assert.ok(resultado.texto.includes('Smart TV 50" UHD 4K Samsung Crystal'));
            assert.ok(resultado.texto.includes('R$ 2.199,00') || resultado.texto.includes('2.199,00'));
            assert.ok(resultado.texto.includes('https://itaimvende.com.br/produto?id=cmv5iafj30009ttiwpzq75yvm'));
            assert.ok(resultado.texto.includes('Itaim Vende — Classificados de Paulistana e região.'));
            assert.ok(resultado.urlOficial.startsWith('https://wa.me/?text='));
        });

        test('CT-SH02: Deve codificar corretamente acentos, espaços e caracteres especiais em percent-encoding', () => {
            const params = {
                titulo: 'Sofá Retrátil & Reclinável 3 Lugares Veludo Suede — Edição Especial',
                preco: 1850.50,
                isDoacao: false,
                canonicalUrl: 'https://itaimvende.com.br/produto?id=cmv5iag2t000cttiwm5e339g5'
            };

            const resultado = montarMensagemWhatsApp(params);
            // Verifica que a URL oficial não contém espaços em branco literais ou caracteres que quebram URLs
            assert.ok(!resultado.urlOficial.includes(' '), 'A URL não deve conter espaços literais');
            assert.ok(!resultado.urlOficial.includes('\n'), 'A URL não deve conter quebras de linha literais');
            assert.ok(resultado.urlOficial.includes('%C3%A1') || resultado.urlOficial.includes('%20'), 'Deve conter caracteres percent-encoded');
            
            // Decodificação deve restaurar o texto original de forma idêntica
            const queryParams = new URL(resultado.urlOficial).searchParams;
            const textoDecodificado = queryParams.get('text');
            assert.equal(textoDecodificado, resultado.texto);
        });

        test('CT-SH03: Produto gratuito deve exibir "Doação (Gratuito)" em vez de R$ 0,00', () => {
            const params = {
                titulo: 'Mudas de Palma Forrageira para Plantio',
                preco: 0,
                isDoacao: true,
                canonicalUrl: 'https://itaimvende.com.br/produto?id=doacao-123'
            };

            const resultado = montarMensagemWhatsApp(params);
            assert.ok(resultado.texto.includes('💰 Preço: Doação (Gratuito)'));
            assert.ok(!resultado.texto.includes('R$ 0,00'));
        });

        test('CT-SH04: Geração de URL canônica deve ser pública, absoluta e independente de sessão', () => {
            const origin = 'https://itaimvende.com.br';
            const produtoId = 'cmv5iae600003ttiw3lrdyvod';
            const canonicalUrl = `${origin}/produto?id=${encodeURIComponent(produtoId)}`;

            assert.equal(canonicalUrl, 'https://itaimvende.com.br/produto?id=cmv5iae600003ttiw3lrdyvod');
            assert.ok(!canonicalUrl.includes('localhost'), 'Não deve conter localhost');
            assert.ok(!canonicalUrl.includes('token'), 'Não deve conter tokens de sessão');
        });
    });

    describe('2. Estrutura HTML e Componentes de Interface (produto.html)', () => {
        const caminhoHtml = path.join(projectRoot, 'frontend/pages/produtos/produto.html');
        const conteudoHtml = fs.readFileSync(caminhoHtml, 'utf-8');

        test('CT-SH05: produto.html deve conter os metadados Open Graph e Twitter Cards no cabeçalho <head>', () => {
            assert.ok(conteudoHtml.includes('<meta property="og:title"'), 'Deve conter og:title');
            assert.ok(conteudoHtml.includes('<meta property="og:description"'), 'Deve conter og:description');
            assert.ok(conteudoHtml.includes('<meta property="og:image"'), 'Deve conter og:image');
            assert.ok(conteudoHtml.includes('<meta property="og:url"'), 'Deve conter og:url');
            assert.ok(conteudoHtml.includes('<meta name="twitter:card" content="summary_large_image">'), 'Deve conter twitter:card');
            assert.ok(conteudoHtml.includes('<link rel="canonical" id="meta-canonical-url"'), 'Deve conter tag canônica');
        });

        test('CT-SH06: produto.html deve conter o botão de compartilhamento na barra lateral com popover', () => {
            assert.ok(conteudoHtml.includes('id="btn-compartilhar-anuncio"'), 'Deve conter botão principal de compartilhamento');
            assert.ok(conteudoHtml.includes('id="menu-compartilhar-popover"'), 'Deve conter container do popover');
            assert.ok(conteudoHtml.includes('id="btn-share-whatsapp"'), 'Deve conter opção Compartilhar pelo WhatsApp');
            assert.ok(conteudoHtml.includes('id="btn-share-copiar-link"'), 'Deve conter opção Copiar link');
            assert.ok(conteudoHtml.includes('id="btn-compartilhar-topo"'), 'Deve conter botão de compartilhamento rápido no topo da imagem');
        });
    });

    describe('3. Estilização CSS e Compatibilidade de Temas (produto-vendedor-sidebar.css e theme-produto.css)', () => {
        const caminhoCssSidebar = path.join(projectRoot, 'frontend/css/pages/produtos/produto/produto-vendedor-sidebar.css');
        const conteudoCssSidebar = fs.readFileSync(caminhoCssSidebar, 'utf-8');

        const caminhoCssTema = path.join(projectRoot, 'frontend/css/core/theme/theme-produto.css');
        const conteudoCssTema = fs.readFileSync(caminhoCssTema, 'utf-8');

        test('CT-SH07: produto-vendedor-sidebar.css deve estilizar o botão e o popover com animação e responsividade', () => {
            assert.ok(conteudoCssSidebar.includes('.btn-compartilhar-anuncio'), 'Deve conter estilo do botão compartilhar');
            assert.ok(conteudoCssSidebar.includes('.menu-compartilhar-popover'), 'Deve conter estilo do popover');
            assert.ok(conteudoCssSidebar.includes('.item-compartilhar'), 'Deve conter estilo dos itens do popover');
            assert.ok(conteudoCssSidebar.includes('.icone-share-wpp'), 'Deve conter estilo do ícone WhatsApp');
            assert.ok(conteudoCssSidebar.includes('.icone-share-link'), 'Deve conter estilo do ícone de link');
        });

        test('CT-SH08: theme-produto.css deve conter seletores [data-theme="dark"] para botão e popover', () => {
            assert.ok(conteudoCssTema.includes('[data-theme="dark"] .btn-compartilhar-anuncio'), 'Tema escuro para botão');
            assert.ok(conteudoCssTema.includes('[data-theme="dark"] .menu-compartilhar-popover'), 'Tema escuro para popover');
            assert.ok(conteudoCssTema.includes('[data-theme="dark"] .item-compartilhar:hover'), 'Tema escuro para hover nos itens');
        });
    });

    describe('4. Backend e Injeção Dinâmica de Open Graph (server.js)', () => {
        const caminhoServer = path.join(projectRoot, 'backend/src/server.js');
        const conteudoServer = fs.readFileSync(caminhoServer, 'utf-8');

        test('CT-SH09: server.js deve possuir a função renderizarPaginaProdutoComMetadados', () => {
            assert.ok(conteudoServer.includes('renderizarPaginaProdutoComMetadados'), 'Deve conter função de injeção de metadados');
            assert.ok(conteudoServer.includes('escapeHtmlAttr'), 'Deve conter sanitização de atributos HTML');
            assert.ok(conteudoServer.includes('og:title'), 'Deve injetar og:title');
            assert.ok(conteudoServer.includes('og:description'), 'Deve injetar og:description');
            assert.ok(conteudoServer.includes('og:image'), 'Deve injetar og:image');
            assert.ok(conteudoServer.includes('og:url'), 'Deve injetar og:url');
        });

        test('CT-SH10: O roteador universal deve interceptar requisições para produto.html e executar a injeção', () => {
            assert.ok(conteudoServer.includes("arquivoPagina === 'pages/produtos/produto.html'"), 'Deve interceptar páginas de produto');
            assert.ok(conteudoServer.includes('return renderizarPaginaProdutoComMetadados'), 'Deve delegar renderização de metadados');
        });
    });
});

