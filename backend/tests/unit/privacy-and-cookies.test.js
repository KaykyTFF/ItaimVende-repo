import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import { z } from 'zod';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../..');

describe('Suíte de Testes Unitários — Governança de Privacidade e Cookies (LGPD)', () => {
    // 1. Schema de validação do objeto de consentimento de cookies
    const cookieConsentSchema = z.object({
        status: z.enum(['concedido', 'personalizado', 'rejeitado_opcionais']),
        categorias: z.object({
            essenciais: z.literal(true), // Sempre true (estritamente necessários)
            preferencias: z.boolean(),
            analiticos: z.boolean(),
            marketing: z.boolean()
        }),
        versao: z.string().min(1),
        timestamp: z.number().positive(),
        dataHora: z.string().datetime({ offset: true }).optional().or(z.string())
    });

    describe('1. Validação de Estrutura de Consentimento (LGPD Art. 8º)', () => {
        test('CT-LGPD01: Deve aprovar consentimento total ("concedido") com essenciais ativos', () => {
            const consentimento = {
                status: 'concedido',
                categorias: {
                    essenciais: true,
                    preferencias: true,
                    analiticos: false,
                    marketing: false
                },
                versao: '1.0',
                timestamp: Date.now(),
                dataHora: new Date().toISOString()
            };

            const resultado = cookieConsentSchema.safeParse(consentimento);
            assert.equal(resultado.success, true);
        });

        test('CT-LGPD02: Deve aprovar rejeição de opcionais mantendo estritamente necessários', () => {
            const rejeitado = {
                status: 'rejeitado_opcionais',
                categorias: {
                    essenciais: true,
                    preferencias: false,
                    analiticos: false,
                    marketing: false
                },
                versao: '1.0',
                timestamp: Date.now(),
                dataHora: new Date().toISOString()
            };

            const resultado = cookieConsentSchema.safeParse(rejeitado);
            assert.equal(resultado.success, true);
            assert.equal(resultado.data.categorias.essenciais, true);
            assert.equal(resultado.data.categorias.preferencias, false);
        });

        test('CT-LGPD03: Deve rejeitar alteração indevida de essenciais para false', () => {
            const invalido = {
                status: 'personalizado',
                categorias: {
                    essenciais: false, // Ilegal: essenciais não podem ser desativados
                    preferencias: true,
                    analiticos: false,
                    marketing: false
                },
                versao: '1.0',
                timestamp: Date.now()
            };

            const resultado = cookieConsentSchema.safeParse(invalido);
            assert.equal(resultado.success, false);
        });
    });

    describe('2. Verificação de Arquivos Institucionais Físicos e Acessibilidade', () => {
        test('CT-LGPD04: O documento de Política de Privacidade deve existir e conter seções obrigatórias da LGPD', () => {
            const caminhoPrivacidade = path.join(projectRoot, 'frontend/pages/institucional/politica-de-privacidade.html');
            assert.equal(fs.existsSync(caminhoPrivacidade), true, 'politica-de-privacidade.html deve existir');

            const conteudo = fs.readFileSync(caminhoPrivacidade, 'utf-8');
            assert.ok(conteudo.includes('Lei Geral de Proteção de Dados'), 'Deve referenciar expressamente a LGPD');
            assert.ok(conteudo.includes('privacidade@itaimvende.com.br'), 'Deve fornecer canal de contato do encarregado/controlador');
            assert.ok(conteudo.includes('artigo 18 da LGPD'), 'Deve descrever direitos conforme Art. 18 da LGPD');
            assert.ok(conteudo.includes('Bases Legais'), 'Deve fundamentar o tratamento em bases legais (Art. 7º)');
        });

        test('CT-LGPD05: O documento de Política de Cookies deve inventariar apenas armazenamentos reais', () => {
            const caminhoCookies = path.join(projectRoot, 'frontend/pages/institucional/politica-de-cookies.html');
            assert.equal(fs.existsSync(caminhoCookies), true, 'politica-de-cookies.html deve existir');

            const conteudo = fs.readFileSync(caminhoCookies, 'utf-8');
            assert.ok(conteudo.includes('itaim_token'), 'Deve listar a chave de sessão de autenticação');
            assert.ok(conteudo.includes('itaim_consentimento_cookies'), 'Deve listar a chave de consentimento');
            assert.ok(conteudo.includes('itaim_tema'), 'Deve listar a chave de preferência de tema');
            assert.ok(conteudo.includes('Central de Preferências'), 'Deve conter botão ou mecanismo para reabrir preferências');
        });

        test('CT-LGPD06: O script do gerenciador de consentimento deve existir e não conter rastreadores ocultos', () => {
            const caminhoScript = path.join(projectRoot, 'frontend/js/core/cookies/consentimento-cookies.js');
            assert.equal(fs.existsSync(caminhoScript), true, 'consentimento-cookies.js deve existir');

            const script = fs.readFileSync(caminhoScript, 'utf-8');
            assert.ok(!script.includes('google-analytics.com'), 'Não deve carregar Google Analytics clandestino');
            assert.ok(!script.includes('connect.facebook.net'), 'Não deve carregar Meta Pixel clandestino');
            assert.ok(script.includes('itaim_consentimento_cookies'), 'Deve persistir na chave padronizada');
        });
    });

    describe('3. Roteamento e Compatibilidade no Backend (server.js)', () => {
        test('CT-LGPD07: O backend deve registrar rotas limpas para privacidade e cookies', () => {
            const caminhoServer = path.join(projectRoot, 'backend/src/server.js');
            const conteudoServer = fs.readFileSync(caminhoServer, 'utf-8');

            assert.ok(conteudoServer.includes("'politica-de-privacidade': 'pages/institucional/politica-de-privacidade.html'"), 'Deve rotear politica-de-privacidade');
            assert.ok(conteudoServer.includes("'politica-de-cookies': 'pages/institucional/politica-de-cookies.html'"), 'Deve rotear politica-de-cookies');
            assert.ok(conteudoServer.includes("'privacidade': 'pages/institucional/politica-de-privacidade.html'"), 'Deve manter alias privacidade');
            assert.ok(conteudoServer.includes("'cookies': 'pages/institucional/politica-de-cookies.html'"), 'Deve manter alias cookies');
        });
    });
});
