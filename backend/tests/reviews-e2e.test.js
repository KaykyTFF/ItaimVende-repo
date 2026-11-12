import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { ENV } from '../src/config/env.js';
import prisma from '../src/config/prisma.js';
import {
  createReview,
  updateReview,
  deleteReview,
} from '../src/services/review/review.mutation.service.js';
import { getUserReviews } from '../src/services/review/review.query.service.js';
import { replyToReview } from '../src/services/review/review.reply.service.js';

describe('Suite de Testes de Integracao e Persistencia — Avaliacoes e Reputacao', () => {
  let testBuyer = null;
  let testSeller = null;
  let createdReviewId = null;

  before(async () => {
    const uid = `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // 1. Cria vendedor de teste com 0 avaliações e média 0.00
    testSeller = await prisma.user.create({
      data: {
        name: 'Vendedor Teste Reputacao',
        username: `seller_rep_${uid}`,
        email: `seller_rep_${uid}@itaimvende.test`,
        password: 'HashPassword123',
        role: 'SELLER',
        status: 'ACTIVE',
        city: 'Paulistana',
        state: 'PI',
        ratingAverage: 0.0,
        ratingCount: 0,
      },
    });

    // 2. Cria comprador de teste
    testBuyer = await prisma.user.create({
      data: {
        name: 'Comprador Teste Reputacao',
        username: `buyer_rep_${uid}`,
        email: `buyer_rep_${uid}@itaimvende.test`,
        password: 'HashPassword123',
        role: 'BUYER',
        status: 'ACTIVE',
        city: 'Paulistana',
        state: 'PI',
      },
    });
  });

  after(async () => {
    // Limpeza de integridade no banco
    if (createdReviewId) {
      await prisma.review.deleteMany({ where: { id: createdReviewId } }).catch(() => {});
    }
    if (testBuyer) {
      await prisma.review.deleteMany({ where: { authorId: testBuyer.id } }).catch(() => {});
      await prisma.user.delete({ where: { id: testBuyer.id } }).catch(() => {});
    }
    if (testSeller) {
      await prisma.review.deleteMany({ where: { targetId: testSeller.id } }).catch(() => {});
      await prisma.user.delete({ where: { id: testSeller.id } }).catch(() => {});
    }
    await prisma.$disconnect();
  });

  it('CT-INT01: Vendedor recém-criado deve iniciar com 0 avaliações e média 0.0', async () => {
    const res = await getUserReviews(testSeller.id);
    assert.equal(res.vendedor.totalAvaliacoes, 0);
    assert.equal(res.vendedor.mediaGeral, 0.0);
    assert.equal(res.avaliacoes.length, 0);
  });

  it('CT-INT02: Bloqueio de autoavaliação (vendedor tentando avaliar seu próprio perfil)', async () => {
    await assert.rejects(
      async () => {
        await createReview(testSeller.id, testSeller.id, {
          rating: 5,
          comment: 'Tentando autoelogio',
        });
      },
      (err) => {
        assert.equal(err.statusCode, 400);
        assert.match(err.message, /Você não pode avaliar o seu próprio perfil/);
        return true;
      }
    );
  });

  it('CT-INT03: Bloqueio de notas inválidas (menor que 1, maior que 5, não inteiras)', async () => {
    for (const notaInvalida of [0, 6, 3.5, -2, 'abc']) {
      await assert.rejects(
        async () => {
          await createReview(testBuyer.id, testSeller.id, {
            rating: notaInvalida,
            comment: 'Nota inválida',
          });
        },
        (err) => {
          assert.equal(err.statusCode, 400);
          assert.match(err.message, /A nota deve ser um número inteiro entre 1 e 5 estrelas/);
          return true;
        }
      );
    }
  });

  it('CT-INT04: Criação de avaliação por comprador autenticado deve persistir no banco e recalcular reputação', async () => {
    const resultado = await createReview(testBuyer.id, testSeller.id, {
      rating: 5,
      comment: 'Negociação rápida e produto entregue conforme combinado em Paulistana.',
    });

    assert.ok(resultado.review);
    assert.equal(resultado.review.authorId, testBuyer.id);
    assert.equal(resultado.review.targetId, testSeller.id);
    assert.equal(resultado.review.rating, 5);
    assert.equal(resultado.novaMedia, 5.0);
    assert.equal(resultado.totalAvaliacoes, 1);

    createdReviewId = resultado.review.id;

    // Verifica persistência no banco de dados
    const reviewDb = await prisma.review.findUnique({
      where: { id: createdReviewId },
    });
    assert.ok(reviewDb);
    assert.equal(reviewDb.rating, 5);

    // Verifica atualização do perfil do vendedor no banco de dados
    const sellerDb = await prisma.user.findUnique({
      where: { id: testSeller.id },
      select: { ratingAverage: true, ratingCount: true },
    });
    assert.equal(Number(sellerDb.ratingAverage), 5.0);
    assert.equal(sellerDb.ratingCount, 1);
  });

  it('CT-INT05: Consulta pública de avaliações do vendedor deve refletir os dados reais persistidos', async () => {
    const res = await getUserReviews(testSeller.id);
    assert.equal(res.vendedor.totalAvaliacoes, 1);
    assert.equal(res.vendedor.mediaGeral, 5.0);
    assert.equal(res.avaliacoes.length, 1);

    const a0 = res.avaliacoes[0];
    assert.equal(a0.id, createdReviewId);
    assert.equal(a0.nota, 5);
    assert.equal(a0.comentario, 'Negociação rápida e produto entregue conforme combinado em Paulistana.');
    assert.equal(a0.autor.id, testBuyer.id);
    assert.equal(a0.autor.nome, testBuyer.name);
    assert.equal(res.vendedor.distribuicao[5], 1);
    assert.equal(res.vendedor.distribuicao[4], 0);
  });

  it('CT-INT06: Bloqueio de duplicidade (mesmo autor tentando avaliar o vendedor novamente)', async () => {
    await assert.rejects(
      async () => {
        await createReview(testBuyer.id, testSeller.id, {
          rating: 4,
          comment: 'Segunda tentativa',
        });
      },
      (err) => {
        assert.equal(err.statusCode, 400);
        assert.match(err.message, /Você já avaliou este vendedor/);
        return true;
      }
    );
  });

  it('CT-INT07: Atualização da avaliação existente pelo autor deve atualizar reputação', async () => {
    const resultado = await updateReview(createdReviewId, testBuyer.id, {
      rating: 4,
      comment: 'Atualizando: atendimento muito bom, recomendo a todos.',
    });

    assert.equal(resultado.review.rating, 4);
    assert.equal(resultado.review.comment, 'Atualizando: atendimento muito bom, recomendo a todos.');
    assert.equal(resultado.novaMedia, 4.0);
    assert.equal(resultado.totalAvaliacoes, 1);

    // Confirma persistência no banco
    const sellerDb = await prisma.user.findUnique({
      where: { id: testSeller.id },
      select: { ratingAverage: true, ratingCount: true },
    });
    assert.equal(Number(sellerDb.ratingAverage), 4.0);
  });

  it('CT-INT08: Vendedor avaliado responde à avaliação recebida', async () => {
    const res = await replyToReview(
      createdReviewId,
      testSeller.id,
      'Muito obrigado pela confiança e preferência! Boas vendas para nós.'
    );

    assert.ok(res.avaliacao);
    assert.equal(res.avaliacao.resposta, 'Muito obrigado pela confiança e preferência! Boas vendas para nós.');

    // Confirma persistência da resposta no banco
    const reviewDb = await prisma.review.findUnique({
      where: { id: createdReviewId },
    });
    assert.equal(reviewDb.reply, 'Muito obrigado pela confiança e preferência! Boas vendas para nós.');
  });

  it('CT-INT09: Outro usuário não pode responder à avaliação que não é dele', async () => {
    await assert.rejects(
      async () => {
        await replyToReview(createdReviewId, testBuyer.id, 'Resposta intrusa');
      },
      (err) => {
        assert.equal(err.statusCode, 403);
        assert.match(err.message, /Você não tem permissão para responder/);
        return true;
      }
    );
  });

  it('CT-INT10: Exclusão da avaliação pelo autor deve atualizar a reputação para 0.0 e total 0', async () => {
    const resultado = await deleteReview(createdReviewId, testBuyer.id, 'BUYER');
    assert.equal(resultado.novaMedia, 0.0);
    assert.equal(resultado.totalAvaliacoes, 0);

    // Confirma remoção no banco
    const reviewDb = await prisma.review.findUnique({
      where: { id: createdReviewId },
    });
    assert.equal(reviewDb, null);

    // Confirma atualização do vendedor no banco
    const sellerDb = await prisma.user.findUnique({
      where: { id: testSeller.id },
      select: { ratingAverage: true, ratingCount: true },
    });
    assert.equal(Number(sellerDb.ratingAverage), 0.0);
    assert.equal(sellerDb.ratingCount, 0);

    createdReviewId = null;
  });
});

