import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { ENV } from '../src/config/env.js';
import prisma from '../src/config/prisma.js';
import { USERNAME_COOLDOWN_MS, calcularStatusUsername } from '../src/services/account/account.username.service.js';

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:3000/api/v1';

describe('Suite de Testes da Regra de Cooldown de 30 Dias e Histórico para Username (@)', () => {
  let testUser = null;
  let anotherUser = null;
  let testToken = '';
  const testPassword = 'Password123!';

  before(async () => {
    // 1. Cria usuário de teste com usernameLastChangedAt = null (sem histórico)
    const uniqueSuffix = Date.now().toString(36);
    const hashedPassword = await bcrypt.hash(testPassword, 10);

    testUser = await prisma.user.create({
      data: {
        name: 'Usuário Teste Cooldown',
        username: `test_initial_${uniqueSuffix}`,
        email: `test_cooldown_${uniqueSuffix}@itaimvende.test`,
        password: hashedPassword,
        city: 'Paulistana',
        state: 'PI',
        role: 'BUYER',
        status: 'ACTIVE',
        usernameLastChangedAt: null, // Sem histórico de alteração
      },
    });

    // 2. Cria segundo usuário para testar colisão / username já em uso
    anotherUser = await prisma.user.create({
      data: {
        name: 'Segundo Usuário',
        username: `occ_${uniqueSuffix.substring(0, 10)}`,
        email: `test_occupied_${uniqueSuffix}@itaimvende.test`,
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
    // Limpeza dos usuários de teste e históricos
    if (testUser?.id) {
      await prisma.usernameHistory.deleteMany({ where: { userId: testUser.id } }).catch(() => {});
      await prisma.user.delete({ where: { id: testUser.id } }).catch(() => {});
    }
    if (anotherUser?.id) {
      await prisma.usernameHistory.deleteMany({ where: { userId: anotherUser.id } }).catch(() => {});
      await prisma.user.delete({ where: { id: anotherUser.id } }).catch(() => {});
    }
  });

  // Cenário 1: Usuário sem histórico de alteração consegue mudar o username pelo endpoint dedicado PATCH /account/username
  it('Cenário 1: Usuário sem histórico de alteração consegue mudar o username via PATCH /account/username e salva histórico', async () => {
    const novoUsername = `chg1_${Date.now().toString(36).substring(0, 10)}`;

    const res = await fetch(`${BASE_URL}/account/username`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testToken}`,
      },
      body: JSON.stringify({
        username: novoUsername,
      }),
    });

    assert.equal(res.status, 200, 'Alteração inicial deve responder com HTTP 200');
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.user.username, novoUsername.toLowerCase());
    assert.ok(data.user.usernameLastChangedAt, 'Data de última alteração deve ser preenchida');
    assert.equal(data.user.canChangeUsername, false, 'Deve bloquear novas alterações imediatas');
    assert.ok(data.user.nextUsernameChangeAt, 'Deve informar data da próxima liberação');
    assert.equal(data.user.daysUntilNextUsernameChange, 30, 'Deve faltar 30 dias');

    // Valida que foi registrado na tabela de histórico
    const history = await prisma.usernameHistory.findFirst({
      where: { userId: testUser.id, newUsername: novoUsername.toLowerCase() },
    });
    assert.ok(history, 'Deve registrar a alteração no histórico UsernameHistory');
  });

  // Cenário 2: Após alterar, uma segunda tentativa é bloqueada
  it('Cenário 2: Após alterar, uma segunda tentativa imediata de mudar o username é bloqueada com 403', async () => {
    const segundoUsername = `chg2_${Date.now().toString(36).substring(0, 10)}`;

    const res = await fetch(`${BASE_URL}/account/username`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testToken}`,
      },
      body: JSON.stringify({
        username: segundoUsername,
      }),
    });

    assert.equal(res.status, 403, 'Segunda alteração antes do prazo deve retornar HTTP 403 Forbidden');
    const data = await res.json();
    assert.equal(data.success, false);
    assert.equal(data.code, 'USERNAME_COOLDOWN_ACTIVE');
    assert.ok(data.message.includes('Você poderá alterar seu nome de usuário novamente'));
    assert.ok(data.detalhes || data.details, 'Deve fornecer detalhes do bloqueio');
  });

  // Cenário 3: O bloqueio permanece após logout e login
  it('Cenário 3: O bloqueio permanece após logout e login (retornado no payload de autenticação)', async () => {
    const resLogin = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: testPassword,
      }),
    });

    assert.equal(resLogin.status, 200, 'Login deve ser bem-sucedido');
    const dataLogin = await resLogin.json();
    assert.equal(dataLogin.success, true);
    assert.equal(dataLogin.user.canChangeUsername, false, 'canChangeUsername deve continuar false após login');
    assert.ok(dataLogin.user.nextUsernameChangeAt, 'nextUsernameChangeAt deve estar presente');
    assert.ok(dataLogin.user.daysUntilNextUsernameChange > 0, 'daysUntilNextUsernameChange deve ser maior que zero');
  });

  // Cenário 4: O bloqueio permanece em outros dispositivos (consulta via GET /auth/me com novo token)
  it('Cenário 4: O bloqueio permanece em outros dispositivos (consulta via GET /auth/me com novo token)', async () => {
    const tokenOutroDispositivo = jwt.sign(
      { id: testUser.id, userId: testUser.id, email: testUser.email, role: testUser.role },
      ENV.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${tokenOutroDispositivo}` },
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.user.canChangeUsername, false, 'Bloqueio persiste no banco e reflete em qualquer dispositivo');
    assert.ok(data.user.usernameLastChangedAt);
  });

  // Cenário 5: Tentativa de alterar username diretamente no endpoint genérico de perfil é rejeitada
  it('Cenário 5: Tentativa de mudar username no endpoint geral PUT /auth/profile é rejeitada com 400', async () => {
    const res = await fetch(`${BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testToken}`,
      },
      body: JSON.stringify({
        username: 'tentativaburlar',
      }),
    });

    assert.equal(res.status, 400, 'Endpoint geral deve rejeitar alteração de username');
    const data = await res.json();
    assert.equal(data.code, 'USE_DEDICATED_USERNAME_ENDPOINT');
  });

  // Cenário 6: Após completar os 30 dias, a alteração é liberada automaticamente
  it('Cenário 6: Após completar os 30 dias, a alteração é liberada automaticamente via PATCH /account/username', async () => {
    const data31DiasAtras = new Date(Date.now() - (31 * 24 * 60 * 60 * 1000));
    await prisma.user.update({
      where: { id: testUser.id },
      data: { usernameLastChangedAt: data31DiasAtras },
    });

    // 1. Verifica se /auth/me informa canChangeUsername = true
    const resPerfil = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${testToken}` },
    });
    const dataPerfil = await resPerfil.json();
    assert.equal(dataPerfil.user.canChangeUsername, true, 'canChangeUsername deve voltar a ser true após 30 dias');
    assert.equal(dataPerfil.user.daysUntilNextUsernameChange, 0);

    // 2. Realiza a nova alteração com sucesso
    const novoUsernameLiberado = `rel_${Date.now().toString(36).substring(0, 10)}`;
    const resUpdate = await fetch(`${BASE_URL}/account/username`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testToken}`,
      },
      body: JSON.stringify({
        username: novoUsernameLiberado,
      }),
    });

    assert.equal(resUpdate.status, 200, 'Deve permitir alteração após transcorridos os 30 dias');
    const dataUpdate = await resUpdate.json();
    assert.equal(dataUpdate.user.username, novoUsernameLiberado.toLowerCase());
    assert.equal(dataUpdate.user.canChangeUsername, false, 'Deve reativar o bloqueio de 30 dias após nova alteração');
  });

  // Cenário 7: Uma tentativa com username já utilizado não consome o prazo
  it('Cenário 7: Tentativa com username já utilizado retorna 409 e NÃO consome o prazo de alteração', async () => {
    const dataAntiga = new Date(Date.now() - (35 * 24 * 60 * 60 * 1000));
    await prisma.user.update({
      where: { id: testUser.id },
      data: { usernameLastChangedAt: dataAntiga },
    });

    // Tenta usar o username de anotherUser
    const res = await fetch(`${BASE_URL}/account/username`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testToken}`,
      },
      body: JSON.stringify({
        username: anotherUser.username,
      }),
    });

    assert.equal(res.status, 409, 'Tentativa com username duplicado deve responder com 409 Conflict');

    // Confirma no banco que usernameLastChangedAt continua intacto
    const userNoBanco = await prisma.user.findUnique({ where: { id: testUser.id } });
    assert.equal(
      userNoBanco.usernameLastChangedAt.toISOString(),
      dataAntiga.toISOString(),
      'O carimbo de última alteração NÃO pode ter sido consumido por erro de validação'
    );
  });

  // Cenário 8: Alterar apenas o nome de perfil não ativa nem reinicia o bloqueio
  it('Cenário 8: Alterar apenas o nome de perfil (ou bio, telefone) NÃO ativa nem reinicia o bloqueio de 30 dias', async () => {
    await prisma.user.update({
      where: { id: testUser.id },
      data: { usernameLastChangedAt: null },
    });

    const userAtual = await prisma.user.findUnique({ where: { id: testUser.id } });
    const res = await fetch(`${BASE_URL}/auth/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testToken}`,
      },
      body: JSON.stringify({
        name: 'Nome Atualizado Sem Restrição',
        username: userAtual.username, // Mesmo username ignorado com segurança
        bio: 'Nova biografia de teste',
      }),
    });

    assert.equal(res.status, 200, 'Atualização de nome de perfil deve responder com 200 OK');
    const data = await res.json();
    assert.equal(data.user.name, 'Nome Atualizado Sem Restrição');
    assert.equal(data.user.canChangeUsername, true, 'canChangeUsername deve continuar true');
    assert.equal(data.user.usernameLastChangedAt, null, 'usernameLastChangedAt deve continuar null');
  });

  // Cenário 9: A data de liberação apresentada corresponde exatamente à validação do backend
  it('Cenário 9: A data de liberação e os dias restantes retornados pelo backend batem exatamente com o cálculo de 30 dias', async () => {
    const timestampAlvo = new Date(Date.now() - (12 * 24 * 60 * 60 * 1000)); // 12 dias atrás
    await prisma.user.update({
      where: { id: testUser.id },
      data: { usernameLastChangedAt: timestampAlvo },
    });

    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${testToken}` },
    });

    assert.equal(res.status, 200);
    const data = await res.json();

    const dataEsperada = new Date(timestampAlvo.getTime() + USERNAME_COOLDOWN_MS);
    assert.equal(data.user.canChangeUsername, false);
    assert.equal(new Date(data.user.nextUsernameChangeAt).getTime(), dataEsperada.getTime());
    assert.equal(data.user.daysUntilNextUsernameChange, 18, 'Devem restar exatamente 18 dias (30 - 12)');

    // Testa endpoint de checagem prévia /account/username/check
    const resCheck = await fetch(`${BASE_URL}/account/username/check?username=novo_user_check`, {
      headers: { Authorization: `Bearer ${testToken}` },
    });

    assert.equal(resCheck.status, 200);
    const dataCheck = await resCheck.json();
    assert.equal(dataCheck.cooldownActive, true);
    assert.equal(dataCheck.canChangeUsername, false);
    assert.equal(dataCheck.daysUntilNextUsernameChange, 18);
    assert.ok(dataCheck.message.includes('Alteração bloqueada'));
  });

});
