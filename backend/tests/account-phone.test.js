import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { ENV } from '../src/config/env.js';
import prisma from '../src/config/prisma.js';
import { getLastSentCode, clearMockCodes } from '../src/adapters/phone/phone.provider.js';

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:3000/api/v1';

describe('Suite de Testes do Fluxo Seguro de WhatsApp / Celular (/account/phone)', () => {
  let testUser = null;
  let otherUser = null;
  let googleUser = null;
  let testToken = '';
  let otherToken = '';
  let googleToken = '';
  const testPassword = 'Password123!';
  const uniqueSuffix = Date.now().toString(36);
  let revertSecurityToken = '';
  let validOtpCode = '';

  before(async () => {
    const hashedPassword = await bcrypt.hash(testPassword, 10);

    // 1. Usuário principal de teste
    testUser = await prisma.user.create({
      data: {
        name: 'Kayky Teste Phone',
        username: `phone_${uniqueSuffix.substring(0, 10)}`,
        email: `phone_${uniqueSuffix}@itaimvende.test`,
        password: hashedPassword,
        phone: '89999990000',
        phoneVerifiedAt: new Date(),
        city: 'Paulistana',
        state: 'PI',
        role: 'BUYER',
        status: 'ACTIVE',
      },
    });

    // 2. Outro usuário com telefone já verificado (para testar unicidade)
    otherUser = await prisma.user.create({
      data: {
        name: 'Outro Usuário Verificado',
        username: `outro_${uniqueSuffix.substring(0, 10)}`,
        email: `outro_${uniqueSuffix}@itaimvende.test`,
        password: hashedPassword,
        phone: '89999887766',
        phoneVerifiedAt: new Date(),
        city: 'Paulistana',
        state: 'PI',
        role: 'BUYER',
        status: 'ACTIVE',
      },
    });

    // 3. Usuário Conta Google (sem senha tradicional)
    googleUser = await prisma.user.create({
      data: {
        name: 'Usuário Google',
        username: `goog_${uniqueSuffix.substring(0, 10)}`,
        email: `goog_${uniqueSuffix}@itaimvende.test`,
        password: 'GOOGLE_OAUTH_USER',
        phone: null,
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

    otherToken = jwt.sign(
      { id: otherUser.id, userId: otherUser.id, email: otherUser.email, role: otherUser.role },
      ENV.JWT_SECRET,
      { expiresIn: '1h' }
    );

    googleToken = jwt.sign(
      { id: googleUser.id, userId: googleUser.id, email: googleUser.email, role: googleUser.role },
      ENV.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  after(async () => {
    clearMockCodes();
    const ids = [testUser?.id, otherUser?.id, googleUser?.id].filter(Boolean);
    if (ids.length > 0) {
      await prisma.phoneChangeRequest.deleteMany({ where: { userId: { in: ids } } }).catch(() => {});
      await prisma.phoneHistory.deleteMany({ where: { userId: { in: ids } } }).catch(() => {});
      await prisma.auditLog.deleteMany({ where: { userId: { in: ids } } }).catch(() => {});
      await prisma.user.deleteMany({ where: { id: { in: ids } } }).catch(() => {});
    }
  });

  // Cenário 1: Reautenticação incorreta
  it('1. POST /account/phone/change-request com senha incorreta deve retornar 401', async () => {
    const res = await fetch(`${BASE_URL}/account/phone/change-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testToken}`,
        'x-test-runner': 'true',
      },
      body: JSON.stringify({
        currentPassword: 'SenhaErrada!',
        newPhone: '(89) 99911-2233',
      }),
    });

    assert.equal(res.status, 401);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.equal(data.code, 'INVALID_PASSWORD');
  });

  // Cenário 2: Número já em uso verificado por outra conta
  it('2. POST /account/phone/change-request com número já em uso deve retornar 409 sem vazar identidade', async () => {
    const res = await fetch(`${BASE_URL}/account/phone/change-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testToken}`,
        'x-test-runner': 'true',
      },
      body: JSON.stringify({
        currentPassword: testPassword,
        newPhone: '(89) 99988-7766', // Telefone de otherUser
      }),
    });

    assert.equal(res.status, 409);
    const data = await res.json();
    assert.equal(data.code, 'PHONE_TAKEN');
  });

  // Cenário 3: Solicitação válida com envio de código OTP
  it('3. POST /account/phone/change-request com senha correta envia código de 6 dígitos e retorna 200', async () => {
    const res = await fetch(`${BASE_URL}/account/phone/change-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testToken}`,
        'x-test-runner': 'true',
      },
      body: JSON.stringify({
        currentPassword: testPassword,
        newPhone: '(89) 99955-4433',
        channel: 'whatsapp',
      }),
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.resendIntervalSeconds, 60);

    // Valida que o código foi gerado no mock ou retornado em ambiente de desenvolvimento
    const codeSent = data.debugCode || getLastSentCode('89999554433');
    assert.ok(codeSent, 'Deve ter gerado um código de 6 dígitos');
    assert.match(codeSent, /^\d{6}$/);
    validOtpCode = codeSent;

    // Valida que foi salvo na tabela PhoneChangeRequest com hash seguro
    const reqDb = await prisma.phoneChangeRequest.findFirst({
      where: { userId: testUser.id, newPhone: '89999554433' },
    });
    assert.ok(reqDb);
    assert.notEqual(reqDb.codeHash, codeSent, 'Código deve estar criptografado com bcrypt');
    assert.ok(reqDb.revertToken, 'Deve gerar um revertToken para segurança');
    revertSecurityToken = reqDb.revertToken;
  });

  // Cenário 4: Validação de código incorreto decrementa tentativas
  it('4. POST /account/phone/confirm com código inválido retorna 400 e incrementa tentativas', async () => {
    const res = await fetch(`${BASE_URL}/account/phone/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testToken}`,
        'x-test-runner': 'true',
      },
      body: JSON.stringify({
        newPhone: '(89) 99955-4433',
        code: '000000',
      }),
    });

    assert.equal(res.status, 400);
    const data = await res.json();
    assert.equal(data.code, 'INVALID_CODE');

    // Checa incremento no banco
    const reqDb = await prisma.phoneChangeRequest.findFirst({
      where: { userId: testUser.id, newPhone: '89999554433' },
    });
    assert.equal(reqDb.attempts, 1);
  });

  // Cenário 5: Confirmação com código correto atualiza número e ativa selo verificado
  it('5. POST /account/phone/confirm com código correto atualiza o telefone e ativa phoneVerifiedAt', async () => {
    const res = await fetch(`${BASE_URL}/account/phone/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testToken}`,
        'x-test-runner': 'true',
      },
      body: JSON.stringify({
        newPhone: '(89) 99955-4433',
        code: validOtpCode,
      }),
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.user.phone, '89999554433');
    assert.equal(data.user.isPhoneVerified, true);

    // Valida atualização no banco
    const userDb = await prisma.user.findUnique({ where: { id: testUser.id } });
    assert.equal(userDb.phone, '89999554433');
    assert.ok(userDb.phoneVerifiedAt);
    assert.ok(userDb.phoneLastChangedAt);

    // Valida registro de histórico e auditoria
    const hist = await prisma.phoneHistory.findFirst({
      where: { userId: testUser.id, newPhone: '89999554433' },
    });
    assert.ok(hist, 'Deve ter salvo o histórico de telefone');
  });

  // Cenário 6: Regra de Cooldown de 7 dias bloqueia alteração imediata
  it('6. POST /account/phone/change-request dentro dos 7 dias deve retornar 403 Forbidden', async () => {
    const res = await fetch(`${BASE_URL}/account/phone/change-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testToken}`,
        'x-test-runner': 'true',
      },
      body: JSON.stringify({
        currentPassword: testPassword,
        newPhone: '(89) 99977-8899',
      }),
    });

    const data = await res.json();
    if (res.status !== 403) {
      console.log('DEBUG TEST 6 ERROR:', res.status, data);
    }
    assert.equal(res.status, 403);
    assert.equal(data.code, 'PHONE_COOLDOWN_ACTIVE');
    assert.match(data.message, /7 dias/);
  });

  // Cenário 7: Link "Não fui eu" reverte para o número anterior e sinaliza segurança
  it('7. POST /account/phone/revert com o token de reversão restaura o número antigo', async () => {
    const res = await fetch(`${BASE_URL}/account/phone/revert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-test-runner': 'true',
      },
      body: JSON.stringify({
        token: revertSecurityToken,
      }),
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);

    // Valida que o número antigo (89999990000) foi restaurado no banco
    const userDb = await prisma.user.findUnique({ where: { id: testUser.id } });
    assert.equal(userDb.phone, '89999990000');

    // Valida log de auditoria de reversão
    const audit = await prisma.auditLog.findFirst({
      where: { userId: testUser.id, action: 'USER_PHONE_REVERTED_SECURITY' },
    });
    assert.ok(audit, 'Deve registrar log de auditoria para proteção da conta');
  });

  // Cenário 8: Conta Google sem senha consegue solicitar alteração com sucesso
  it('8. Conta Google sem senha tradicional consegue solicitar envio de código OTP', async () => {
    const res = await fetch(`${BASE_URL}/account/phone/change-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${googleToken}`,
        'x-test-runner': 'true',
      },
      body: JSON.stringify({
        newPhone: '(89) 99933-2211',
      }),
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
  });

  // Cenário 9: Remoção de telefone com reautenticação
  it('9. DELETE /account/phone com senha correta desvincula telefone e limpa verificação', async () => {
    // Zera phoneLastChangedAt do testUser para liberar o cooldown de 7 dias
    await prisma.user.update({
      where: { id: testUser.id },
      data: { phoneLastChangedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) },
    });

    const res = await fetch(`${BASE_URL}/account/phone`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testToken}`,
        'x-test-runner': 'true',
      },
      body: JSON.stringify({
        currentPassword: testPassword,
      }),
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.user.phone, null);

    const userDb = await prisma.user.findUnique({ where: { id: testUser.id } });
    assert.equal(userDb.phone, null);
    assert.equal(userDb.phoneVerifiedAt, null);
  });

  // Cenário 10: Bloqueio de endpoint geral PUT /auth/profile tentando alterar telefone
  it('10. PUT /auth/profile tentando alterar telefone deve retornar 400', async () => {
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
