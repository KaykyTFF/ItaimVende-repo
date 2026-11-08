import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { ENV } from '../src/config/env.js';
import prisma from '../src/config/prisma.js';

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:3000/api/v1';

let testUser = null;
let testToken = '';
let testProduct = null;

describe('Suite de Testes de Conformidade REST Canônica (Novas Rotas e Métodos)', () => {
  before(async () => {
    // Localiza ou garante um usuário para testes
    testUser = await prisma.user.findFirst({ where: { role: 'BUYER' } });
    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          name: 'Comprador Teste REST',
          email: `buyer_rest_${Date.now()}@test.com`,
          password: 'HashPassword123',
          role: 'BUYER',
          city: 'Paulistana',
          state: 'PI',
        },
      });
    }

    testToken = jwt.sign(
      { id: testUser.id, email: testUser.email, role: testUser.role },
      ENV.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Localiza um produto para os testes de favoritos e denúncia
    testProduct = await prisma.product.findFirst({
      where: { deletedAt: null },
      select: { id: true, sellerId: true },
    });
  });

  // Teste 1: Rota canônica GET /users/:id (perfil público)
  it('1. GET /users/:id deve retornar os dados públicos do perfil com status 200', async () => {
    const res = await fetch(`${BASE_URL}/users/${testUser.id}`);
    assert.equal(res.status, 200, 'GET /users/:id deve responder 200 OK');
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.user, 'Deve conter o objeto user');
    assert.equal(data.user.id, testUser.id);
  });

  // Teste 2: Rota canônica GET /users/:userId/reviews (sub-recurso de avaliações)
  it('2. GET /users/:userId/reviews deve listar avaliações do usuário com status 200', async () => {
    const res = await fetch(`${BASE_URL}/users/${testUser.id}/reviews`);
    assert.equal(res.status, 200, 'GET /users/:userId/reviews deve responder 200 OK');
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(Array.isArray(data.reviews || data.data || []), 'Deve retornar lista de avaliações');
  });

  // Teste 3: Rota canônica GET /usernames/availability (sem verbo na URI)
  it('3. GET /usernames/availability deve retornar disponibilidade do username com status 200', async () => {
    const res = await fetch(`${BASE_URL}/usernames/availability?username=usuario_teste_livre_999`);
    assert.equal(res.status, 200, 'GET /usernames/availability deve responder 200 OK');
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(typeof data.available, 'boolean', 'available deve ser um booleano');
  });

  // Teste 4: Rota canônica PUT /favorites/:productId (adição idempotente)
  it('4. PUT /favorites/:productId deve adicionar o produto aos favoritos com status 200', async () => {
    if (!testProduct) return;
    const res = await fetch(`${BASE_URL}/favorites/${testProduct.id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${testToken}`,
        'Content-Type': 'application/json',
      },
    });

    assert.equal(res.status, 200, 'PUT /favorites/:productId deve responder 200 OK');
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.favorited, true, 'Deve confirmar que o item está favoritado');
  });

  // Teste 5: Rota canônica GET /favorites/:productId (consulta de status)
  it('5. GET /favorites/:productId deve retornar o status do favorito com status 200', async () => {
    if (!testProduct) return;
    const res = await fetch(`${BASE_URL}/favorites/${testProduct.id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${testToken}`,
      },
    });

    assert.equal(res.status, 200, 'GET /favorites/:productId deve responder 200 OK');
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.favorited, true);
  });

  // Teste 6: Rota canônica DELETE /favorites/:productId (remoção idempotente)
  it('6. DELETE /favorites/:productId deve remover o produto dos favoritos com status 200', async () => {
    if (!testProduct) return;
    const res = await fetch(`${BASE_URL}/favorites/${testProduct.id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${testToken}`,
      },
    });

    assert.equal(res.status, 200, 'DELETE /favorites/:productId deve responder 200 OK');
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.favorited, false, 'Deve confirmar que o item foi desfavoritado');
  });

  // Teste 7: Rota canônica PATCH /chat/messages/:id/status (validação de status de proposta)
  it('7. PATCH /chat/messages/:id/status com status inválido deve retornar 400 Bad Request', async () => {
    const res = await fetch(`${BASE_URL}/chat/messages/msg_teste_fake/status`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${testToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'INVALID_STATUS' }),
    });

    assert.equal(res.status, 400, 'Status inválido deve responder 400');
    const data = await res.json();
    assert.equal(data.success, false);
    assert.equal(data.code, 'VALIDATION_ERROR');
  });

  // Teste 8: Rota canônica DELETE /reports/:id/product com papel BUYER deve retornar 403 Forbidden
  it('8. DELETE /reports/:id/product sem privilégios de moderação deve retornar 403 Forbidden', async () => {
    const res = await fetch(`${BASE_URL}/reports/rep_exemplo_1/product`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${testToken}`,
      },
    });

    assert.equal(res.status, 403, 'Usuário BUYER não pode executar moderação (403)');
    const data = await res.json();
    assert.equal(data.success, false);
    assert.equal(data.code, 'FORBIDDEN');
  });

  // Teste 9: Rota canônica POST /account/phone-reversals com token inválido deve retornar 400
  it('9. POST /account/phone-reversals com token mal formatado deve retornar 400 Bad Request', async () => {
    const res = await fetch(`${BASE_URL}/account/phone-reversals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: '' }),
    });

    assert.equal(res.status, 400, 'Token vazio deve responder 400');
    const data = await res.json();
    assert.equal(data.success, false);
    assert.equal(data.code, 'VALIDATION_ERROR');
  });
});

