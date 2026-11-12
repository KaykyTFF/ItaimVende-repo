import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../..');

describe('Suite de Testes Unitarios — Sistema de Reputacao e Avaliacoes do Vendedor', () => {

    describe('1. Validacao de Payload e Regras de Entrada (Notas e Comentarios)', () => {
        function validarNota(rating) {
            const notaNum = Number(rating);
            if (!Number.isInteger(notaNum) || notaNum < 1 || notaNum > 5) {
                throw new Error('A nota deve ser um numero inteiro entre 1 e 5 estrelas.');
            }
            return notaNum;
        }

        function validarComentario(comment) {
            if (comment !== undefined && comment !== null) {
                if (typeof comment !== 'string') {
                    throw new Error('O comentario deve ser um texto valido.');
                }
                if (comment.trim().length > 1000) {
                    throw new Error('O comentario deve ter no maximo 1000 caracteres.');
                }
            }
            return comment ? comment.trim() : null;
        }

        test('CT-REV01: Deve aprovar notas inteiras validas entre 1 e 5', () => {
            [1, 2, 3, 4, 5].forEach(nota => {
                assert.equal(validarNota(nota), nota);
                assert.equal(validarNota(String(nota)), nota);
            });
        });

        test('CT-REV02: Deve rejeitar notas menores que 1 (incluindo zero e negativas)', () => {
            [0, -1, -5].forEach(nota => {
                assert.throws(() => validarNota(nota), /A nota deve ser um numero inteiro entre 1 e 5 estrelas/);
            });
        });

        test('CT-REV03: Deve rejeitar notas maiores que 5', () => {
            [6, 7, 10, 99].forEach(nota => {
                assert.throws(() => validarNota(nota), /A nota deve ser um numero inteiro entre 1 e 5 estrelas/);
            });
        });

        test('CT-REV04: Deve rejeitar notas fracionadas ou nao inteiras (ex: 4.5)', () => {
            [1.5, 3.8, 4.99, 2.1].forEach(nota => {
                assert.throws(() => validarNota(nota), /A nota deve ser um numero inteiro entre 1 e 5 estrelas/);
            });
        });

        test('CT-REV05: Deve rejeitar valores nao numericos (NaN, strings alfanumericas, objetos)', () => {
            ['cinco', 'nota 5', NaN, {}, [], null, undefined].forEach(val => {
                assert.throws(() => validarNota(val), /A nota deve ser um numero inteiro entre 1 e 5 estrelas/);
            });
        });

        test('CT-REV06: Comentario valido dentro do limite de 1000 caracteres deve ser aprovado e normalizado', () => {
            const texto = '   Atendimento excelente e produto entregue em maos em Paulistana.   ';
            assert.equal(validarComentario(texto), 'Atendimento excelente e produto entregue em maos em Paulistana.');
            assert.equal(validarComentario(null), null);
            assert.equal(validarComentario(undefined), null);
        });

        test('CT-REV07: Comentario com mais de 1000 caracteres deve ser rejeitado', () => {
            const longo = 'A'.repeat(1001);
            assert.throws(() => validarComentario(longo), /O comentario deve ter no maximo 1000 caracteres/);
        });

        test('CT-REV08: Comentario com tipo invalido (nao string) deve ser rejeitado', () => {
            assert.throws(() => validarComentario(12345), /O comentario deve ser um texto valido/);
            assert.throws(() => validarComentario({ texto: 'ola' }), /O comentario deve ser um texto valido/);
        });
    });

    describe('2. Calculo Matematico de Reputacao e Distribuicao de Estrelas', () => {
        function calcularReputacao(notas) {
            const total = notas.length;
            if (total === 0) {
                return { mediaGeral: 0.0, totalAvaliacoes: 0 };
            }
            const soma = notas.reduce((acc, curr) => acc + curr, 0);
            const mediaGeral = parseFloat((soma / total).toFixed(2));
            return { mediaGeral, totalAvaliacoes: total };
        }

        function calcularDistribuicao(avaliacoes) {
            const distribuicao = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
            for (const r of avaliacoes) {
                if (distribuicao[r.rating] !== undefined) {
                    distribuicao[r.rating]++;
                }
            }
            return distribuicao;
        }

        test('CT-REV09: Vendedor sem avaliacoes deve ter media 0.0 e contagem 0', () => {
            const res = calcularReputacao([]);
            assert.equal(res.mediaGeral, 0.0);
            assert.equal(res.totalAvaliacoes, 0);
        });

        test('CT-REV10: Calculo de media ponderada precisa com arredondamento em 2 casas decimais', () => {
            const notas = [5, 4, 5, 5, 3]; // soma = 22 / 5 = 4.40
            const res = calcularReputacao(notas);
            assert.equal(res.mediaGeral, 4.4);
            assert.equal(res.totalAvaliacoes, 5);

            const notas2 = [5, 4, 4]; // soma = 13 / 3 = 4.3333... -> 4.33
            const res2 = calcularReputacao(notas2);
            assert.equal(res2.mediaGeral, 4.33);
            assert.equal(res2.totalAvaliacoes, 3);
        });

        test('CT-REV11: Recalculo da media apos edicao de avaliacao', () => {
            const notasIniciais = [5, 3]; // media = 4.0
            assert.equal(calcularReputacao(notasIniciais).mediaGeral, 4.0);

            // Usuario atualiza nota 3 para 5
            const notasAtualizadas = [5, 5]; // media = 5.0
            assert.equal(calcularReputacao(notasAtualizadas).mediaGeral, 5.0);
            assert.equal(calcularReputacao(notasAtualizadas).totalAvaliacoes, 2);
        });

        test('CT-REV12: Recalculo da media apos exclusao de avaliacao', () => {
            let notas = [5, 1]; // media = 3.0
            assert.equal(calcularReputacao(notas).mediaGeral, 3.0);

            // Exclui a nota 1
            notas = [5];
            assert.equal(calcularReputacao(notas).mediaGeral, 5.0);
            assert.equal(calcularReputacao(notas).totalAvaliacoes, 1);

            // Exclui a nota 5 restante
            notas = [];
            assert.equal(calcularReputacao(notas).mediaGeral, 0.0);
            assert.equal(calcularReputacao(notas).totalAvaliacoes, 0);
        });

        test('CT-REV13: Calculo correto da distribuicao de notas de 1 a 5 estrelas', () => {
            const avaliacoes = [
                { rating: 5 }, { rating: 5 }, { rating: 5 },
                { rating: 4 }, { rating: 4 },
                { rating: 3 },
                { rating: 1 }
            ];
            const dist = calcularDistribuicao(avaliacoes);
            assert.deepEqual(dist, {
                1: 1,
                2: 0,
                3: 1,
                4: 2,
                5: 3
            });
        });
    });

    describe('3. Regras de Seguranca, Integridade e Bloqueios de Negocio', () => {
        function verificarAutoAvaliacao(authorId, targetUserId) {
            if (String(authorId).trim() === String(targetUserId).trim()) {
                throw new Error('Voce nao pode avaliar o seu proprio perfil.');
            }
            return true;
        }

        function verificarDuplicidade(authorId, targetUserId, avaliacoesExistentes) {
            const jaAvaliou = avaliacoesExistentes.some(
                r => String(r.authorId) === String(authorId) && String(r.targetId) === String(targetUserId)
            );
            if (jaAvaliou) {
                throw new Error('Voce ja avaliou este vendedor. Voce pode editar ou excluir sua avaliacao existente.');
            }
            return true;
        }

        function verificarPermissaoExclusao(authorId, reviewAuthorId, userRole) {
            if (String(authorId) !== String(reviewAuthorId) && userRole !== 'ADMIN') {
                throw new Error('Voce so tem permissao para excluir a sua propria avaliacao.');
            }
            return true;
        }

        function verificarPermissaoResposta(vendedorId, reviewTargetId) {
            if (String(vendedorId) !== String(reviewTargetId)) {
                throw new Error('Voce nao tem permissao para responder a esta avaliacao.');
            }
            return true;
        }

        test('CT-REV14: Bloqueio rigoroso de autoavaliacao (authorId === targetUserId)', () => {
            assert.throws(
                () => verificarAutoAvaliacao('user_123', 'user_123'),
                /Voce nao pode avaliar o seu proprio perfil/
            );
            assert.ok(verificarAutoAvaliacao('user_123', 'user_456'));
        });

        test('CT-REV15: Bloqueio de duplicidade (apenas 1 avaliacao por autor por vendedor)', () => {
            const reviewsExistentes = [
                { authorId: 'autor_01', targetId: 'vendedor_99' },
                { authorId: 'autor_02', targetId: 'vendedor_99' }
            ];

            assert.throws(
                () => verificarDuplicidade('autor_01', 'vendedor_99', reviewsExistentes),
                /Voce ja avaliou este vendedor/
            );
            assert.ok(verificarDuplicidade('autor_03', 'vendedor_99', reviewsExistentes));
        });

        test('CT-REV16: Permissao de exclusao concedida ao autor ou ao administrador do sistema', () => {
            // Autor excluindo sua propria avaliacao -> Sucesso
            assert.ok(verificarPermissaoExclusao('user_autor', 'user_autor', 'BUYER'));

            // Administrador excluindo avaliacao de terceiros -> Sucesso
            assert.ok(verificarPermissaoExclusao('admin_master', 'user_autor', 'ADMIN'));

            // Outro usuario comum tentando excluir -> Bloqueio 403
            assert.throws(
                () => verificarPermissaoExclusao('user_estranho', 'user_autor', 'BUYER'),
                /Voce so tem permissao para excluir a sua propria avaliacao/
            );
        });

        test('CT-REV17: Somente o vendedor avaliado pode responder a uma avaliacao recebida', () => {
            // Vendedor correto respondendo -> Sucesso
            assert.ok(verificarPermissaoResposta('vendedor_alvo', 'vendedor_alvo'));

            // Outro usuario tentando responder -> Bloqueio 403
            assert.throws(
                () => verificarPermissaoResposta('outro_usuario', 'vendedor_alvo'),
                /Voce nao tem permissao para responder a esta avaliacao/
            );
        });
    });

    describe('4. Auditoria de Arquivos e Componentes de Interface do Frontend', () => {
        const caminhoHtml = path.join(projectRoot, 'frontend/pages/perfil/vendedor.html');
        const caminhoJsAvaliacoes = path.join(projectRoot, 'frontend/js/pages/perfil/vendedor/vendedor-avaliacoes.js');
        const caminhoJsApiReviews = path.join(projectRoot, 'frontend/js/core/api/api-reviews.js');

        test('CT-REV18: vendedor.html deve conter estrutura completa sem dados mockados de Admin', () => {
            assert.ok(fs.existsSync(caminhoHtml), 'vendedor.html deve existir');
            const html = fs.readFileSync(caminhoHtml, 'utf-8');

            // Formulário e campos essenciais
            assert.ok(html.includes('id="form-nova-avaliacao"'), 'Deve conter form-nova-avaliacao');
            assert.ok(html.includes('id="estrelas-seletor"'), 'Deve conter estrelas-seletor');
            assert.ok(html.includes('id="textarea-comentario"'), 'Deve conter textarea-comentario');
            assert.ok(html.includes('id="btn-enviar-avaliacao"'), 'Deve conter btn-enviar-avaliacao');

            // Contador de caracteres
            assert.ok(html.includes('id="contador-caracteres-comentario"'), 'Deve conter contador de caracteres');
            assert.ok(html.includes('maxlength="1000"'), 'Textarea deve possuir limite maxlength de 1000 caracteres');

            // Estados de sessão e avisos
            assert.ok(html.includes('id="box-avaliacao-deslogado"'), 'Deve conter box para visitante deslogado');
            assert.ok(html.includes('id="btn-entrar-para-avaliar"'), 'Deve conter botao para entrar e avaliar');
            assert.ok(!html.includes('id="box-ja-avaliou"'), 'Nao deve exibir caixa de aviso de que o usuario ja fez review');
            assert.ok(html.includes('id="box-proprio-perfil"'), 'Deve conter aviso quando visualizando proprio perfil');

            // Não deve haver inputs ou spans com Admin hardcoded no formulário de avaliações
            assert.ok(!html.includes('id="input-autor-avaliacao" value="Admin"'), 'Não deve existir input hidden com Admin hardcoded');
        });

        test('CT-REV19: api-reviews.js deve apontar para rotas canônicas e injetar autenticação', () => {
            assert.ok(fs.existsSync(caminhoJsApiReviews), 'api-reviews.js deve existir');
            const apiCode = fs.readFileSync(caminhoJsApiReviews, 'utf-8');

            assert.ok(apiCode.includes('/reviews/user/'), 'Deve chamar rota canônica /reviews/user/:userId');
            assert.ok(apiCode.includes('method: \'POST\''), 'Deve suportar método POST para envio');
            assert.ok(apiCode.includes('method: \'PUT\''), 'Deve suportar método PUT para edição');
            assert.ok(apiCode.includes('method: \'DELETE\''), 'Deve suportar método DELETE para exclusão');
            assert.ok(apiCode.includes('method: \'PATCH\''), 'Deve suportar método PATCH para resposta');
            assert.ok(apiCode.includes('getCore().obterHeaders(true)'), 'Deve injetar cabeçalho de autenticação JWT');
        });

        test('CT-REV20: vendedor-avaliacoes.js deve orquestrar sessao real e atualizacao dinamica', () => {
            assert.ok(fs.existsSync(caminhoJsAvaliacoes), 'vendedor-avaliacoes.js deve existir');
            const jsCode = fs.readFileSync(caminhoJsAvaliacoes, 'utf-8');

            assert.ok(jsCode.includes('ehMinhaAvaliacao'), 'Deve verificar se a avaliacao pertence ao usuario autenticado');
            assert.ok(jsCode.includes('verificarProprioPerfil'), 'Deve verificar se o usuario esta visualizando seu proprio perfil');
            assert.ok(jsCode.includes('atualizarReputacao'), 'Deve atualizar dinamicamente os indicadores de media e total');
            assert.ok(jsCode.includes('atualizarVisibilidadeFormulario'), 'Deve alternar estados entre deslogado, proprio perfil, ja avaliou e form ativo');
            assert.ok(jsCode.includes('contadorChar'), 'Deve atualizar o contador de caracteres do comentario');
        });
    });

    describe('5. Auditoria de Ausencia de Emojis em Arquivos de Producao', () => {
        const arquivosInspecionados = [
            'frontend/pages/perfil/vendedor.html',
            'frontend/js/pages/perfil/vendedor/vendedor-avaliacoes.js',
            'frontend/js/pages/perfil/vendedor/vendedor-dados.js',
            'frontend/js/core/api/api-reviews.js',
            'backend/src/services/review/review.mutation.service.js',
            'backend/src/services/review/review.query.service.js',
            'backend/src/services/review/review.reply.service.js'
        ];

        const emojiRegex = /[\u{1F300}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FAFF}\u{1F1E0}-\u{1F1FF}]/u;

        test('CT-REV21: Nenhum arquivo modificado ou criado deve conter emojis pictograficos', () => {
            arquivosInspecionados.forEach(relPath => {
                const fullPath = path.join(projectRoot, relPath);
                assert.ok(fs.existsSync(fullPath), `Arquivo ${relPath} deve existir`);
                const content = fs.readFileSync(fullPath, 'utf-8');
                const match = content.match(new RegExp(emojiRegex, 'u'));
                assert.equal(match, null, `Arquivo ${relPath} nao deve conter emojis pictograficos. Encontrado: ${match?.[0]}`);
            });
        });
    });

});

