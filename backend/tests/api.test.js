import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { ENV } from '../src/config/env.js';
import prisma from '../src/config/prisma.js';

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:3000/api/v1';

let buyerToken = '';
let createdBuyer = null;

describe('Suite de Testes de Conformidade REST e Integração da API Itaim Vende', () => {

  before(async () => {
    // Localiza ou cria um usuário real com papel BUYER para os testes de controle de acesso (RBAC)
    let buyer = await prisma.user.findFirst({ where: { role: 'BUYER' } });
    if (!buyer) {
      buyer = await prisma.user.create({
        data: {
          name: 'Comprador Teste API',
          email: `buyer_api_test_${Date.now()}@itaimvende.local`,
          password: 'SenhaSeguraTeste123',
          role: 'BUYER',
          city: 'Paulistana',
          state: 'PI',
        },
      });
      createdBuyer = buyer;
    }

    buyerToken = jwt.sign(
      { id: buyer.id, email: buyer.email, role: 'BUYER' },
      ENV.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  after(async () => {
    if (createdBuyer?.id) {
      await prisma.user.delete({ where: { id: createdBuyer.id } }).catch(() => {});
    }
  });

  // Teste 1: Diagnóstico e Saúde (Princípio REST)
  it('1. Diagnóstico: GET /health deve retornar status 200, online e versão v2.0.0', async () => {
    const res = await fetch(`${BASE_URL}/health`);
    assert.equal(res.status, 200, 'Healthcheck deve retornar status HTTP 200');
    
    const data = await res.json();
    assert.equal(data.status, 'online', 'Status deve ser "online"');
    assert.ok(data.version === 'v2.0.0' || data.version.startsWith('v2'), 'Versão deve ser "v2.0.0"');
    assert.ok(data.uptime >= 0, 'Uptime deve ser informado');
    assert.ok(data.bootId, 'bootId deve estar presente');
  });

  // Teste 2: Princípio REST de Cacheabilidade (Requisito 2)
  it('2. Princípio REST (Cacheable): GET /categories deve retornar status 200 e header Cache-Control', async () => {
    const res = await fetch(`${BASE_URL}/categories`);
    assert.equal(res.status, 200, 'Endpoint de categorias deve responder com 200 OK');
    
    const cacheHeader = res.headers.get('cache-control');
    assert.ok(cacheHeader, 'Cabeçalho Cache-Control deve existir');
    assert.match(cacheHeader, /public|max-age/i, 'Cache-Control deve especificar diretiva public e tempo');
    
    const data = await res.json();
    assert.equal(data.success, true, 'Resposta deve indicar success: true');
    assert.ok(Array.isArray(data.data), 'data deve ser um array de categorias');
  });

  // Teste 3: Consulta - Paginação e Ordenação (Requisito 5)
  it('3. Consulta REST: GET /products deve suportar paginação e ordenação (limit, page, sort)', async () => {
    const res = await fetch(`${BASE_URL}/products?page=1&limit=5&sort=price_asc`);
    assert.equal(res.status, 200, 'Listagem paginada deve retornar 200 OK');
    
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(Array.isArray(data.data), 'data.data deve ser uma lista de produtos');
    
    const pagination = data.pagination || data.meta;
    assert.ok(pagination, 'Deve conter informações de paginação');
    assert.equal(pagination.page, 1, 'Página atual deve ser 1');
    assert.equal(pagination.limit, 5, 'Limite por página deve ser 5');
  });

  // Teste 4: Inovação - Busca Fonética Unaccent (Requisito 7)
  it('4. Inovação & Regra de Negócio: GET /products?search=eletronicos deve executar busca unaccent sem falhas', async () => {
    const res = await fetch(`${BASE_URL}/products?search=eletronicos`);
    assert.equal(res.status, 200, 'Busca com unaccent deve retornar 200 OK');
    
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(Array.isArray(data.data), 'Resultado de busca deve ser um array');
  });

  // Teste 5: Autenticação - Credenciais Incorretas (Requisito 4 e 8)
  it('5. Autenticação: POST /auth/login com senha incorreta deve retornar 401 Unauthorized', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'usuario.inexistente@itaimvende.com.br',
        password: 'SenhaTotalmenteIncorreta123',
      }),
    });
    
    assert.equal(res.status, 401, 'Credencial inválida deve responder 401');
    const data = await res.json();
    assert.equal(data.success, false);
    assert.ok(data.message, 'Deve retornar mensagem explicativa de erro');
  });

  // Teste 6: Segurança - Rota Protegida Sem Token (Requisito 8)
  it('6. Segurança: GET /auth/me sem token de autorização deve retornar 401 Unauthorized', async () => {
    const res = await fetch(`${BASE_URL}/auth/me`);
    assert.equal(res.status, 401, 'Requisição sem token deve retornar 401 Unauthorized');
    
    const data = await res.json();
    assert.equal(data.success, false);
  });

  // Teste 7: Validação e Erros Padronizados (Requisito 9: código, mensagem, detalhes)
  it('7. Validação Zod & Erro: POST /auth/register com dados inválidos deve retornar 400 com código, mensagem e detalhes', async () => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'A',
        email: 'email_sem_arroba',
        password: '12',
      }),
    });
    
    assert.equal(res.status, 400, 'Payload com falha de validação deve responder 400 Bad Request');
    const data = await res.json();
    assert.equal(data.success, false);
    assert.equal(data.code, 'VALIDATION_ERROR', 'Deve possuir código de erro VALIDATION_ERROR');
    assert.ok(data.message, 'Deve possuir mensagem explicativa');
    
    const detalhes = data.details || data.detalhes;
    assert.ok(Array.isArray(detalhes), 'Deve retornar array de detalhes de validação');
    assert.ok(detalhes.length > 0, 'Deve conter pelo menos um campo com erro identificado');
  });

  // Teste 8: Autorização RBAC com Múltiplos Papéis (Requisito 8: BUYER vs MODERATOR/ADMIN)
  it('8. Autorização RBAC: GET /reports com token de usuário BUYER deve retornar 403 Forbidden', async () => {
    const res = await fetch(`${BASE_URL}/reports`, {
      headers: {
        Authorization: `Bearer ${buyerToken}`,
      },
    });
    
    assert.equal(res.status, 403, 'Usuário BUYER não pode acessar painel de moderação (403)');
    const data = await res.json();
    assert.equal(data.success, false);
  });

  // Teste 9: Segurança Anti-Enumeração de Usuários (Requisito 4)
  it('9. Segurança: GET /auth/user/:id inexistente deve retornar 404 Not Found', async () => {
    const res = await fetch(`${BASE_URL}/auth/user/usuario_totalmente_inexistente_99999`);
    assert.equal(res.status, 404, 'Consulta a usuário inexistente deve retornar 404');
    
    const data = await res.json();
    assert.equal(data.success, false);
  });

  // Teste 10: Inovação e Segurança - Proteção Brute-Force no OTP de Redefinição
  it('10. Inovação & Segurança: POST /auth/verify-reset-code com código errado deve retornar 400 ou 429', async () => {
    const res = await fetch(`${BASE_URL}/auth/verify-reset-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'teste@exemplo.com',
        code: '999999',
      }),
    });
    
    assert.ok([400, 429].includes(res.status), 'Código inválido deve retornar 400 ou 429 por proteção');
    const data = await res.json();
    assert.equal(data.success, false);
  });

  // Teste 11: Princípio REST - Versionamento e Rota Inexistente (Requisito 3 e 6)
  it('11. Princípio REST: GET em endpoint inexistente (/api/v1/recurso-inexistente) deve retornar 404 padronizado', async () => {
    const res = await fetch(`${BASE_URL}/recurso-inexistente`);
    assert.equal(res.status, 404, 'Rota inexistente deve responder 404 Not Found');
    
    const data = await res.json();
    assert.equal(data.success, false);
  });

  // Teste 12: Integridade Financeira - Bloqueio de Pedido sem Login
  it('12. Integridade Financeira: POST /orders sem autenticação deve barrar transação com 401 Unauthorized', async () => {
    const res = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ productId: 'prd_1', quantity: 1 }],
        paymentMethod: 'PIX',
      }),
    });
    
    assert.equal(res.status, 401, 'Tentativa de compra não autenticada deve retornar 401');
    const data = await res.json();
    assert.equal(data.success, false);
  });

  // Teste 13: Google Auth & Cadastro Real com JWT e Boas-Vindas
  it('13. Google Auth & Cadastro Real: POST /auth/google deve autenticar/cadastrar usuário com persistência e emissão de JWT', async () => {
    const testGoogleEmail = `google_test_${Date.now()}@gmail.com`;
    const res = await fetch(`${BASE_URL}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testGoogleEmail,
        name: 'Usuário Teste Google',
        avatar: 'assets/images/icon-user.png',
      }),
    });

    assert.equal(res.status, 200, 'POST /auth/google deve retornar status 200 OK');
    const data = await res.json();
    assert.equal(data.success, true, 'Resposta deve indicar success: true');
    assert.ok(data.token, 'Token JWT deve ser emitido');
    assert.ok(data.user, 'Dados do usuário cadastrado devem ser retornados');
    assert.equal(data.user.email, testGoogleEmail, 'E-mail retornado deve bater com o enviado');
    assert.equal(data.isNewUser, true, 'Primeiro acesso deve indicar isNewUser: true');

    // Limpeza no banco
    await prisma.user.deleteMany({ where: { email: testGoogleEmail } }).catch(() => {});
  });

  // Teste 14: Cadastro Completo com E-mail Real e Disparo de Boas-Vindas
  it('14. Cadastro Real: POST /auth/register deve registrar usuário válido, emitir JWT e acionar fluxo de boas-vindas', async () => {
    const testRegisterEmail = `cadastro_real_${Date.now()}@gmail.com`;
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Cliente Real Paulistana',
        email: testRegisterEmail,
        password: 'SenhaSegura123',
        city: 'Paulistana',
        state: 'PI',
        neighborhood: 'Centro',
      }),
    });

    assert.equal(res.status, 201, 'POST /auth/register deve retornar 201 Created');
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.token, 'Token JWT deve ser emitido');
    assert.equal(data.user.email, testRegisterEmail);

    // Limpeza no banco
    await prisma.user.deleteMany({ where: { email: testRegisterEmail } }).catch(() => {});
  });

});
