import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { ENV } from '../src/config/env.js';
import prisma from '../src/config/prisma.js';

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:3000/api/v1';

describe('Suite de Testes do Fluxo de Alteração Segura de E-mail (/account/email)', () => {
  let testUser = null;
  let testToken = '';
  const testPassword = 'Password123!';
  const uniqueSuffix = Date.now().toString(36);
  const initialEmail = `user_email_test_${uniqueSuffix}@itaimvende.test`;
  const targetEmail = `new_target_email_${uniqueSuffix}@itaimvende.test`;

  before(async () => {
    const hashedPassword = await bcrypt.hash(testPassword, 10);

    testUser = await prisma.user.create({
      data: {
        name: 'Usuário Teste Troca Email',
        username: `test_email_${uniqueSuffix}`,
        email: initialEmail,
        password: hashedPassword,
        city: 'Paulistana',
        state: 'PI',
        role: 'BUYER',
        status: 'ACTIVE',
      },
    });

    testToken = jwt.sign(
      { id: testUser.id, userId: testUser.id, email: testUser.email, role: testUser.role },
      ENV.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  after(async () => {
    if (testUser?.id) {
      await prisma.emailChangeRequest.deleteMany({ where: { userId: testUser.id } }).catch(() => {});
      await prisma.user.delete({ where: { id: testUser.id } }).catch(() => {});
    }
  });

  // Teste 1: Reautenticação falha com senha errada
  it('1. POST /account/email/change-request com senha incorreta deve retornar 401 Unauthorized', async () => {
    const res = await fetch(`${BASE_URL}/account/email/change-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testToken}`,
        'x-test-runner': 'true',
      },
      body: JSON.stringify({
        currentPassword: 'SenhaCompletamenteIncorreta!',
        newEmail: targetEmail,
      }),
    });

    assert.equal(res.status, 401);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.equal(data.code, 'INVALID_PASSWORD');
  });

  // Teste 2: Rejeição ao tentar trocar para o mesmo e-mail atual
  it('2. POST /account/email/change-request com o mesmo e-mail atual deve retornar 400', async () => {
    const res = await fetch(`${BASE_URL}/account/email/change-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testToken}`,
        'x-test-runner': 'true',
      },
      body: JSON.stringify({
        currentPassword: testPassword,
        newEmail: initialEmail,
      }),
    });

    assert.equal(res.status, 400);
    const data = await res.json();
    assert.equal(data.code, 'SAME_EMAIL');
  });

  // Teste 3: Solicitação com senha correta gera código e salva registro no banco
  it('3. POST /account/email/change-request com senha correta envia código de 6 dígitos e retorna 200', async () => {
    const res = await fetch(`${BASE_URL}/account/email/change-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testToken}`,
        'x-test-runner': 'true',
      },
      body: JSON.stringify({
        currentPassword: testPassword,
        newEmail: targetEmail,
      }),
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.message.includes('Código de verificação enviado'));

    // Confere se o registro existe no banco de dados com validade de 15 minutos
    const request = await prisma.emailChangeRequest.findFirst({
      where: { userId: testUser.id, newEmail: targetEmail, confirmedAt: null },
    });
    assert.ok(request, 'Deve existir uma solicitação de troca criada no banco');
    assert.equal(request.code.length, 6, 'Código deve possuir 6 dígitos');
    assert.equal(request.attempts, 0);
  });

  // Teste 4: Confirmação com código inválido reduz tentativas
  it('4. POST /account/email/confirm com código inválido retorna 400 e incrementa tentativas', async () => {
    const res = await fetch(`${BASE_URL}/account/email/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testToken}`,
        'x-test-runner': 'true',
      },
      body: JSON.stringify({
        newEmail: targetEmail,
        code: '000000',
      }),
    });

    assert.equal(res.status, 400);
    const data = await res.json();
    assert.equal(data.code, 'INVALID_CODE');

    // Confere no banco que attempts subiu para 1
    const request = await prisma.emailChangeRequest.findFirst({
      where: { userId: testUser.id, newEmail: targetEmail, confirmedAt: null },
    });
    assert.equal(request.attempts, 1);
  });

  // Teste 5: Confirmação com código válido atualiza e-mail no banco e invalida tokens
  it('5. POST /account/email/confirm com código correto atualiza o e-mail no banco e invalida pendências', async () => {
    // Busca o código real gerado no teste 3
    const request = await prisma.emailChangeRequest.findFirst({
      where: { userId: testUser.id, newEmail: targetEmail, confirmedAt: null },
    });
    assert.ok(request);

    const res = await fetch(`${BASE_URL}/account/email/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testToken}`,
        'x-test-runner': 'true',
      },
      body: JSON.stringify({
        newEmail: targetEmail,
        code: request.code,
      }),
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.user.email, targetEmail);

    // Confere que no banco o e-mail do usuário foi realmente atualizado
    const userNoBanco = await prisma.user.findUnique({ where: { id: testUser.id } });
    assert.equal(userNoBanco.email, targetEmail);

    // Confere que a solicitação foi marcada como confirmada
    const requestConfirmada = await prisma.emailChangeRequest.findUnique({ where: { id: request.id } });
    assert.ok(requestConfirmada.confirmedAt !== null);
  });

});
