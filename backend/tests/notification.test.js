import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { ENV } from '../src/config/env.js';
import prisma from '../src/config/prisma.js';
import { createNotification } from '../src/services/notification/index.js';

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:3000/api/v1';

let userA = null;
let userB = null;
let tokenA = '';
let tokenB = '';

let notifIdA1 = null;
let notifIdA2 = null;
let notifIdB1 = null;

describe('Suite de Testes Automatizados - Sistema de Notificações Itaim Vende', () => {

  before(async () => {
    // Busca ou cria dois usuários reais para validação de isolamento e RBAC
    userA = await prisma.user.findFirst({
      where: { role: 'BUYER' },
    });

    if (!userA) {
      userA = await prisma.user.create({
        data: {
          name: 'Usuario Notif A',
          email: 'notif_test_a@itaimvende.local',
          password: 'hash_placeholder',
          role: 'BUYER',
        },
      });
    }

    userB = await prisma.user.findFirst({
      where: {
        role: 'SELLER',
        id: { not: userA.id },
      },
    });

    if (!userB) {
      userB = await prisma.user.create({
        data: {
          name: 'Usuario Notif B',
          email: 'notif_test_b@itaimvende.local',
          password: 'hash_placeholder',
          role: 'SELLER',
        },
      });
    }

    tokenA = jwt.sign(
      { id: userA.id, email: userA.email, role: userA.role },
      ENV.JWT_SECRET,
      { expiresIn: '1h' }
    );

    tokenB = jwt.sign(
      { id: userB.id, email: userB.email, role: userB.role },
      ENV.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Cria notificações de teste no banco para o Usuário A
    const nA1 = await createNotification({
      userId: userA.id,
      title: 'Nova mensagem de Carlos',
      message: 'Ola, o produto ainda esta disponivel?',
      type: 'mensagem',
      link: '/pages/mensagens/conversas.html?id=c123',
    });
    notifIdA1 = nA1.id;

    const nA2 = await createNotification({
      userId: userA.id,
      title: 'Nova avaliacao recebida',
      message: 'Carlos avaliou seu perfil com 5 estrelas.',
      type: 'avaliacao',
      link: `/pages/perfil/vendedor.html?id=${userA.id}&stars=5`,
    });
    notifIdA2 = nA2.id;

    // Cria notificação para o Usuário B (para teste de isolamento de segurança)
    const nB1 = await createNotification({
      userId: userB.id,
      title: 'Anuncio salvo nos favoritos',
      message: 'Alguem salvou seu anuncio.',
      type: 'favorito',
      link: '/pages/produtos/produto.html?id=p456',
    });
    notifIdB1 = nB1.id;
  });

  after(async () => {
    // Limpeza das notificações de teste geradas
    const ids = [notifIdA1, notifIdA2, notifIdB1].filter(Boolean);
    if (ids.length > 0) {
      await prisma.notification.deleteMany({
        where: { id: { in: ids } },
      }).catch(() => {});
    }
  });

  // 1. Autenticação e Autorização (Controle de Acesso)
  it('1. Seguranca: GET /notifications sem token deve retornar 401 Unauthorized', async () => {
    const res = await fetch(`${BASE_URL}/notifications`);
    assert.equal(res.status, 401, 'Requisição sem token deve ser rejeitada com HTTP 401');
  });

  // 2. Listagem de Notificações do Usuário Autenticado
  it('2. Listagem: GET /notifications deve retornar notificacoes estruturadas do usuario A', async () => {
    const res = await fetch(`${BASE_URL}/notifications`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });

    assert.equal(res.status, 200, 'Deveria retornar status 200 OK');
    const data = await res.json();

    assert.equal(data.success, true, 'Resposta deve indicar success: true');
    assert.ok(Array.isArray(data.notifications), 'notifications deve ser um array');
    assert.ok(data.total >= 2, 'Total deve ser no mínimo as 2 notificações criadas');

    const ids = data.notifications.map(n => n.id);
    assert.ok(ids.includes(notifIdA1), 'Deve conter a notificação A1');
    assert.ok(ids.includes(notifIdA2), 'Deve conter a notificação A2');
    assert.ok(!ids.includes(notifIdB1), 'NÃO deve conter notificação do Usuário B (isolamento)');
  });

  // 3. Filtro por Categoria: Mensagens
  it('3. Filtro Categoria: GET /notifications?type=mensagem deve retornar apenas mensagens', async () => {
    const res = await fetch(`${BASE_URL}/notifications?type=mensagem`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });

    assert.equal(res.status, 200, 'Deveria retornar 200');
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(Array.isArray(data.notifications));

    const tipos = data.notifications.map(n => n.type);
    assert.ok(tipos.every(t => t === 'mensagem' || t === 'proposta' || t === 'oferta'), 'Todos os itens devem ser do tipo mensagem');
    assert.ok(data.notifications.some(n => n.id === notifIdA1), 'Deve conter a notificação de mensagem criada');
  });

  // 4. Filtro por Categoria: Avaliações
  it('4. Filtro Categoria: GET /notifications?type=avaliacao deve retornar apenas avaliações', async () => {
    const res = await fetch(`${BASE_URL}/notifications?type=avaliacao`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });

    assert.equal(res.status, 200, 'Deveria retornar 200');
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.notifications.some(n => n.id === notifIdA2), 'Deve conter a notificação de avaliação');
    assert.ok(!data.notifications.some(n => n.id === notifIdA1), 'Não deve conter notificação de mensagem');
  });

  // 5. Ordenação: Não lidas primeiro e Mais antigas
  it('5. Ordenacao: GET /notifications?sort=nao-lidas e ?sort=antigas devem responder 200', async () => {
    const resNaoLidas = await fetch(`${BASE_URL}/notifications?sort=nao-lidas`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert.equal(resNaoLidas.status, 200);

    const resAntigas = await fetch(`${BASE_URL}/notifications?sort=antigas`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert.equal(resAntigas.status, 200);
  });

  // 6. Contagens de Não Lidas por Categoria (GET /notifications/counts)
  it('6. Contagens: GET /notifications/counts deve calcular contagens reais por categoria', async () => {
    const res = await fetch(`${BASE_URL}/notifications/counts`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });

    assert.equal(res.status, 200, 'Deveria responder com 200');
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.data, 'Objeto data deve existir');
    assert.ok(typeof data.data.unreadTotal === 'number', 'unreadTotal deve ser numérico');
    assert.ok(typeof data.data.messages === 'number', 'messages deve ser numérico');
    assert.ok(typeof data.data.reviews === 'number', 'reviews deve ser numérico');
    assert.ok(typeof data.data.favorites === 'number', 'favorites deve ser numérico');
    assert.ok(typeof data.data.notices === 'number', 'notices deve ser numérico');
    assert.ok(data.data.unreadTotal >= 2, 'unreadTotal deve contabilizar pelo menos as duas notificações criadas');
  });

  // 7. Marcação Individual como Lida (PATCH /notifications/:id/read)
  it('7. Marcar individual: PATCH /notifications/:id/read deve alterar isRead para true', async () => {
    const res = await fetch(`${BASE_URL}/notifications/${notifIdA1}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenA}` },
    });

    assert.equal(res.status, 200, 'Deveria responder com status 200');
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.isRead, true);

    const checarNoBanco = await prisma.notification.findUnique({
      where: { id: notifIdA1 },
    });
    assert.equal(checarNoBanco.isRead, true, 'isRead no banco deve ser true');
  });

  // 8. Isolamento de Segurança: Usuário A não pode marcar nem excluir notificação do Usuário B
  it('8. Seguranca/Isolamento: Usuario A nao pode alterar nem deletar notificacao do Usuario B', async () => {
    const resPatch = await fetch(`${BASE_URL}/notifications/${notifIdB1}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert.equal(resPatch.status, 404, 'Usuario A nao deve encontrar nem alterar notificacao de outro usuario');

    const resDelete = await fetch(`${BASE_URL}/notifications/${notifIdB1}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert.equal(resDelete.status, 404, 'Usuario A nao pode deletar notificacao de outro usuario');
  });

  // 9. Marcar Todas como Lidas (PATCH /notifications/read-all)
  it('9. Marcar todas como lidas: PATCH /notifications/read-all deve zerar nao lidas do usuario', async () => {
    const res = await fetch(`${BASE_URL}/notifications/read-all`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenA}` },
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);

    const resCounts = await fetch(`${BASE_URL}/notifications/counts`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const countsData = await resCounts.json();
    assert.equal(countsData.data.unreadTotal, 0, 'unreadTotal deve ser 0 apos marcar todas como lidas');
  });

  // 10. Exclusão Individual (DELETE /notifications/:id)
  it('10. Exclusao individual: DELETE /notifications/:id deve remover a notificacao do banco', async () => {
    const res = await fetch(`${BASE_URL}/notifications/${notifIdA1}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenA}` },
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);

    const checarNoBanco = await prisma.notification.findUnique({
      where: { id: notifIdA1 },
    });
    assert.equal(checarNoBanco, null, 'Notificacao deve ter sido removida do banco');
    notifIdA1 = null;
  });

  // 11. Limpar Todas as Notificações (DELETE /notifications)
  it('11. Limpar todas: DELETE /notifications deve remover todas as notificacoes do usuario', async () => {
    const res = await fetch(`${BASE_URL}/notifications`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenA}` },
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);

    const resList = await fetch(`${BASE_URL}/notifications`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const listData = await resList.json();
    assert.equal(listData.total, 0, 'Total de notificacoes deve ser 0');
    notifIdA2 = null;
  });
});

