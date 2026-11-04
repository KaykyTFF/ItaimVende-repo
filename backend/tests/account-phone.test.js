import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { ENV } from '../src/config/env.js';
import prisma from '../src/config/prisma.js';

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:3000/api/v1';

describe('Suite de Testes do Fluxo Exclusivo de WhatsApp / Telefone (/account/phone)', () => {
  let testUser = null;
  let testToken = '';
  const testPassword = 'Password123!';
  const uniqueSuffix = Date.now().toString(36);

  before(async () => {
    const hashedPassword = await bcrypt.hash(testPassword, 10);

    testUser = await prisma.user.create({
      data: {
        name: 'Usuário Teste Telefone',
        username: `test_tel_${uniqueSuffix.substring(0, 10)}`,
        email: `test_tel_${uniqueSuffix}@itaimvende.test`,
        password: hashedPassword,
        phone: '89999990000',
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
      await prisma.phoneHistory.deleteMany({ where: { userId: testUser.id } }).catch(() => {});
      await prisma.user.delete({ where: { id: testUser.id } }).catch(() => {});
    }
  });

  // Teste 1: Alteração válida de WhatsApp com máscara
  it('1. PATCH /account/phone com número formatado deve salvar apenas dígitos e retornar 200', async () => {
    const res = await fetch(`${BASE_URL}/account/phone`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testToken}`,
        'x-test-runner': 'true',
      },
      body: JSON.stringify({
        phone: '(89) 99988-7766',
      }),
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.user.phone, '89999887766');
    assert.equal(data.user.phoneFormatted, '(89) 99988-7766');

    // Valida no banco de dados e no histórico PhoneHistory
    const userNoBanco = await prisma.user.findUnique({ where: { id: testUser.id } });
    assert.equal(userNoBanco.phone, '89999887766');

    const history = await prisma.phoneHistory.findFirst({
      where: { userId: testUser.id, newPhone: '89999887766' },
    });
    assert.ok(history, 'Deve registrar a alteração no histórico PhoneHistory');
    assert.equal(history.oldPhone, '89999990000');
  });

  // Teste 2: Rejeição de DDD inválido
  it('2. PATCH /account/phone com DDD inválido deve retornar 400', async () => {
    const res = await fetch(`${BASE_URL}/account/phone`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testToken}`,
        'x-test-runner': 'true',
      },
      body: JSON.stringify({
        phone: '(05) 99988-7766',
      }),
    });

    assert.equal(res.status, 400);
    const data = await res.json();
    assert.equal(data.success, false);
  });

  // Teste 3: Rejeição de celular com 11 dígitos sem prefixo 9
  it('3. PATCH /account/phone com celular sem iniciar com 9 deve retornar 400', async () => {
    const res = await fetch(`${BASE_URL}/account/phone`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testToken}`,
        'x-test-runner': 'true',
      },
      body: JSON.stringify({
        phone: '89333334444', // 11 dígitos com 3 no início
      }),
    });

    assert.equal(res.status, 400);
    const data = await res.json();
    assert.equal(data.success, false);
  });

  // Teste 4: Remoção / Desvinculação de telefone
  it('4. PATCH /account/phone com null deve desvincular o telefone e salvar histórico', async () => {
    const res = await fetch(`${BASE_URL}/account/phone`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testToken}`,
        'x-test-runner': 'true',
      },
      body: JSON.stringify({
        phone: null,
      }),
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.user.phone, null);

    const userNoBanco = await prisma.user.findUnique({ where: { id: testUser.id } });
    assert.equal(userNoBanco.phone, null);
  });

  // Teste 5: Tentativa de alterar telefone no endpoint geral de perfil é bloqueada
  it('5. PUT /auth/profile tentando alterar telefone deve retornar 400', async () => {
    const res = await fetch(`${BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testToken}`,
        'x-test-runner': 'true',
      },
      body: JSON.stringify({
        phone: '89999554433',
      }),
    });

    assert.equal(res.status, 400);
    const data = await res.json();
    assert.equal(data.code, 'USE_DEDICATED_PHONE_ENDPOINT');
  });

});

