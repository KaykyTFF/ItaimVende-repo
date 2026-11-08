import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  changeUsernameSchema,
  requestEmailChangeSchema,
  confirmEmailChangeSchema,
  requestPhoneChangeSchema,
  confirmPhoneChangeSchema,
  revertPhoneSchema,
} from '../../src/schemas/account/account.schema.js';

import {
  createProductSchema,
  updateProductSchema,
} from '../../src/schemas/product/product.schema.js';

import { createOrderSchema } from '../../src/schemas/order/order.schema.js';

describe('Suíte de Testes Unitários — Schemas e Validações de Entrada (Zod)', () => {

  describe('1. Schema de Alteração de Username (changeUsernameSchema)', () => {
    it('CT-U01: Deve aprovar username válido no meio do limite (5 a 15 caracteres)', () => {
      const res = changeUsernameSchema.safeParse({ username: 'produtor_rural' });
      assert.equal(res.success, true);
      assert.equal(res.data.username, 'produtor_rural');
    });

    it('CT-U02: Limite inferior: Deve aprovar username com exatamente 3 caracteres válidos', () => {
      const res = changeUsernameSchema.safeParse({ username: 'dev' });
      assert.equal(res.success, true);
      assert.equal(res.data.username, 'dev');
    });

    it('CT-U03: Limite superior: Deve aprovar username com exatamente 20 caracteres válidos', () => {
      const res = changeUsernameSchema.safeParse({ username: 'produtor_paulistana1' });
      assert.equal(res.success, true);
      assert.equal(res.data.username, 'produtor_paulistana1');
    });

    it('CT-U04: Fora do limite inferior: Deve rejeitar username com menos de 3 caracteres', () => {
      const res = changeUsernameSchema.safeParse({ username: 'ab' });
      assert.equal(res.success, false);
      assert.match(res.error.issues[0].message, /no mínimo 3 caracteres/i);
    });

    it('CT-U05: Fora do limite superior: Deve rejeitar username com mais de 20 caracteres', () => {
      const res = changeUsernameSchema.safeParse({ username: 'nome_de_usuario_muito_longo_invalido' });
      assert.equal(res.success, false);
      assert.match(res.error.issues[0].message, /no máximo 20 caracteres/i);
    });

    it('CT-U06: Caracteres especiais: Deve rejeitar username iniciando ou terminando com ponto/hífen/underline', () => {
      const resInicio = changeUsernameSchema.safeParse({ username: '.usuario' });
      const resFim = changeUsernameSchema.safeParse({ username: 'usuario_' });
      assert.equal(resInicio.success, false);
      assert.equal(resFim.success, false);
    });

    it('CT-U07: Lista de Nomes Reservados: Deve rejeitar usernames do sistema (ex: admin, suporte, itaimvende)', () => {
      const resAdmin = changeUsernameSchema.safeParse({ username: 'admin' });
      const resSuporte = changeUsernameSchema.safeParse({ username: 'suporte' });
      const resItaim = changeUsernameSchema.safeParse({ username: 'itaimvende' });
      assert.equal(resAdmin.success, false);
      assert.equal(resSuporte.success, false);
      assert.equal(resItaim.success, false);
      assert.match(resAdmin.error.issues[0].message, /reservado/i);
    });
  });

  describe('2. Schemas de E-mail e Telefone Seguro', () => {
    it('CT-U08: Deve validar e-mail formatado corretamente e normalizar para minúsculas', () => {
      const res = requestEmailChangeSchema.safeParse({
        currentPassword: 'SenhaSecreta123!',
        newEmail: '  Produtor.Itaim@Gmail.COM ',
      });
      assert.equal(res.success, true);
      assert.equal(res.data.newEmail, 'produtor.itaim@gmail.com');
    });

    it('CT-U09: Deve rejeitar e-mail com sintaxe inválida', () => {
      const res = requestEmailChangeSchema.safeParse({
        currentPassword: 'SenhaSecreta123!',
        newEmail: 'email_sem_arroba.com',
      });
      assert.equal(res.success, false);
      assert.match(res.error.issues[0].message, /e-mail válido/i);
    });

    it('CT-U10: Código OTP: Deve aprovar código com exatamente 6 dígitos numéricos', () => {
      const res = confirmEmailChangeSchema.safeParse({
        newEmail: 'teste@itaimvende.com',
        code: '123456',
      });
      assert.equal(res.success, true);
    });

    it('CT-U11: Código OTP: Deve rejeitar código com letras ou tamanho diferente de 6', () => {
      const resLetras = confirmEmailChangeSchema.safeParse({ newEmail: 'teste@itaimvende.com', code: '12345A' });
      const resCurto = confirmEmailChangeSchema.safeParse({ newEmail: 'teste@itaimvende.com', code: '123' });
      const resLongo = confirmEmailChangeSchema.safeParse({ newEmail: 'teste@itaimvende.com', code: '1234567' });
      assert.equal(resLetras.success, false);
      assert.equal(resCurto.success, false);
      assert.equal(resLongo.success, false);
    });

    it('CT-U12: Validação de Celular Brasileiro: Deve aceitar número com 11 dígitos iniciando com 9 e DDD válido', () => {
      const res = requestPhoneChangeSchema.safeParse({
        newPhone: '(89) 99456-7890',
      });
      assert.equal(res.success, true);
      assert.equal(res.data.channel, 'whatsapp');
    });

    it('CT-U13: Validação de Celular Brasileiro: Deve rejeitar celular sem nono dígito ou DDD inválido', () => {
      const resSem9 = requestPhoneChangeSchema.safeParse({ newPhone: '(89) 8456-7890' });
      const resDddInvalido = requestPhoneChangeSchema.safeParse({ newPhone: '(05) 99456-7890' });
      assert.equal(resSem9.success, false);
      assert.equal(resDddInvalido.success, false);
    });
  });

  describe('3. Schema de Cadastro e Atualização de Produtos', () => {
    it('CT-U14: Deve aprovar payload completo de anúncio válido com valores dentro das regras', () => {
      const res = createProductSchema.safeParse({
        title: 'Mel Silvestre do Sertão 1L',
        description: 'Mel puro de abelha silvestre colhido no interior de Paulistana - PI.',
        price: 45.0,
        categoryId: 1,
        condition: 'NOVO',
        listingType: 'VENDA',
        city: 'Paulistana',
        neighborhood: 'Centro',
      });
      assert.equal(res.success, true);
      assert.equal(res.data.price, 45.0);
      assert.equal(res.data.condition, 'NOVO');
    });

    it('CT-U15: Análise de Valor Limite (Preço): Preço zero deve ser aceito (doação/divulgação), negativo rejeitado', () => {
      const resZero = createProductSchema.safeParse({
        title: 'Doação de Filhotes',
        description: 'Filhotes de cães para adoção responsável.',
        price: 0,
        categoryId: 2,
      });
      const resNegativo = createProductSchema.safeParse({
        title: 'Produto com Preço Negativo',
        description: 'Descrição de teste com tamanho adequado.',
        price: -10.5,
        categoryId: 2,
      });
      assert.equal(resZero.success, true);
      assert.equal(resNegativo.success, false);
      assert.match(resNegativo.error.issues[0].message, /maior ou igual a zero/i);
    });

    it('CT-U16: Limite de Título e Descrição: Rejeitar títulos com menos de 3 ou descrições com menos de 5 caracteres', () => {
      const resTituloCurto = createProductSchema.safeParse({
        title: 'Oi',
        description: 'Descrição válida de teste.',
        price: 10,
        categoryId: 1,
      });
      const resDescCurta = createProductSchema.safeParse({
        title: 'Título Válido',
        description: '1234',
        price: 10,
        categoryId: 1,
      });
      assert.equal(resTituloCurto.success, false);
      assert.equal(resDescCurta.success, false);
    });

    it('CT-U17: Enum de Condição: Rejeitar opções inválidas e aplicar valor padrão USADO quando omitido', () => {
      const resPadrao = createProductSchema.safeParse({
        title: 'Produto Sem Condicao Informada',
        description: 'Descrição válida para o anúncio.',
        price: 50,
        categoryId: 1,
      });
      const resInvalido = createProductSchema.safeParse({
        title: 'Produto com Condicao Inexistente',
        description: 'Descrição válida para o anúncio.',
        price: 50,
        categoryId: 1,
        condition: 'MUITO_VELHO',
      });
      assert.equal(resPadrao.success, true);
      assert.equal(resPadrao.data.condition, 'USADO');
      assert.equal(resInvalido.success, false);
    });
  });

  describe('4. Schema de Pedidos e Checkout (createOrderSchema)', () => {
    it('CT-U18: Deve aprovar pedido válido com múltiplos itens e endereço de entrega', () => {
      const res = createOrderSchema.safeParse({
        items: [
          { productId: 'prod_123', quantity: 2 },
          { productId: 'prod_456', quantity: 1 },
        ],
        shippingAddress: 'Rua Senador Candido Ferraz, 100 - Centro, Paulistana - PI',
        paymentMethod: 'PIX',
      });
      assert.equal(res.success, true);
      assert.equal(res.data.items.length, 2);
    });

    it('CT-U19: Rejeitar pedido com lista de itens vazia', () => {
      const res = createOrderSchema.safeParse({
        items: [],
        shippingAddress: 'Rua Centro, 50',
      });
      assert.equal(res.success, false);
      assert.match(res.error.issues[0].message, /ao menos um item/i);
    });

    it('CT-U20: Rejeitar pedido com quantidade zero ou negativa', () => {
      const resZero = createOrderSchema.safeParse({
        items: [{ productId: 'prod_123', quantity: 0 }],
        shippingAddress: 'Rua Centro, 50',
      });
      const resNegativo = createOrderSchema.safeParse({
        items: [{ productId: 'prod_123', quantity: -3 }],
        shippingAddress: 'Rua Centro, 50',
      });
      assert.equal(resZero.success, false);
      assert.equal(resNegativo.success, false);
    });
  });

});

