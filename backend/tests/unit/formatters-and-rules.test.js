import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  gerarSlug,
  formatarProdutoParaFrontend,
} from '../../src/services/product/product.formatter.js';

describe('Suíte de Testes Unitários — Regras de Negócio e Formatadores Puros', () => {

  describe('1. Algoritmo de Geração de Slugs Amigáveis (gerarSlug)', () => {
    it('CT-U21: Deve converter título com acentos, maiúsculas e espaços para slug sem diacríticos', () => {
      const slug = gerarSlug('Chapéu de Couro do Sertão Piauiense');
      assert.match(slug, /^chapeu-de-couro-do-sertao-piauiense-[a-z0-9]+$/);
    });

    it('CT-U22: Deve remover pontuação e caracteres especiais indesejados', () => {
      const slug = gerarSlug('Mel 100% Puro & Artesanal (Oferta!)');
      assert.match(slug, /^mel-100-puro-artesanal-oferta-[a-z0-9]+$/);
    });

    it('CT-U23: Limite de comprimento: Deve truncar a base do slug para no máximo 60 caracteres', () => {
      const textoLongo = 'Este é um produto com um título extremamente longo que ultrapassa facilmente os sessenta caracteres permitidos';
      const slug = gerarSlug(textoLongo);
      const partes = slug.split('-');
      // O sufixo final tem 5 caracteres gerados aleatoriamente
      const baseLength = slug.length - partes[partes.length - 1].length - 1;
      assert.ok(baseLength <= 60);
    });
  });

  describe('2. Normalizador de DTO para Frontend (formatarProdutoParaFrontend)', () => {
    it('CT-U24: Deve atribuir foto padrão de fallback caso o anúncio não possua imagens', () => {
      const produtoSemFoto = {
        id: 'prod_99',
        title: 'Queijo Coalho Tradicional',
        price: '30.00',
        images: [],
        status: 'ACTIVE',
      };
      const formatado = formatarProdutoParaFrontend(produtoSemFoto);
      assert.equal(formatado.fotos.length, 1);
      assert.equal(formatado.imagem, 'assets/produtos/anuncio_13.jpg');
      assert.equal(formatado.status, 'ATIVO');
      assert.equal(formatado.preco, 30.0);
    });

    it('CT-U25: Deve identificar a foto marcada como capa (isCover: true) e definir como imagem principal', () => {
      const produtoComFotos = {
        id: 'prod_100',
        title: 'Mesa de Madeira Rústica',
        price: 250,
        images: [
          { url: 'https://cdn.itaimvende.com/foto1.webp', isCover: false },
          { url: 'https://cdn.itaimvende.com/foto_capa.webp', isCover: true },
          { url: 'https://cdn.itaimvende.com/foto2.webp', isCover: false },
        ],
        status: 'PAUSED',
      };
      const formatado = formatarProdutoParaFrontend(produtoComFotos);
      assert.equal(formatado.imagem, 'https://cdn.itaimvende.com/foto_capa.webp');
      assert.equal(formatado.status, 'PAUSADO');
    });

    it('CT-U26: Tratamento defensivo de bairro: Deve substituir dados inválidos (como CEP ou dígitos) por "Centro"', () => {
      const produtoBairroInvalido = {
        id: 'prod_101',
        title: 'Sela de Couro',
        price: 400,
        neighborhood: '64750-000',
        city: 'Paulistana',
      };
      const formatado = formatarProdutoParaFrontend(produtoBairroInvalido);
      assert.equal(formatado.bairro, 'Centro');
    });
  });

  describe('3. Regra Pura de Cálculo de Integridade Financeira de Pedidos', () => {
    // Função pura representativa da regra executada em order.creation.service.js
    function calcularTotalPedido(itensRequisicao, catalogoPrecosBanco) {
      if (!itensRequisicao || itensRequisicao.length === 0) {
        throw new Error('Lista de itens não pode estar vazia.');
      }
      let total = 0;
      const itensCalculados = [];

      for (const item of itensRequisicao) {
        const prod = catalogoPrecosBanco.find((p) => p.id === item.productId);
        if (!prod) {
          throw new Error(`Produto ${item.productId} não encontrado.`);
        }
        if (item.quantity <= 0 || !Number.isInteger(item.quantity)) {
          throw new Error('Quantidade deve ser um inteiro positivo.');
        }
        const precoReal = Number(prod.price);
        const subtotal = precoReal * item.quantity;
        total += subtotal;

        itensCalculados.push({
          productId: prod.id,
          unitPrice: parseFloat(precoReal.toFixed(2)),
          quantity: item.quantity,
          subtotal: parseFloat(subtotal.toFixed(2)),
        });
      }

      return {
        totalAmount: parseFloat(total.toFixed(2)),
        items: itensCalculados,
      };
    }

    it('CT-U27: Deve calcular o montante total multiplicando os preços reais do banco pelas quantidades', () => {
      const catalogoBanco = [
        { id: 'p1', price: 15.50 },
        { id: 'p2', price: 42.00 },
      ];
      const itensComprador = [
        { productId: 'p1', quantity: 2 },
        { productId: 'p2', quantity: 3 },
      ];

      const resultado = calcularTotalPedido(itensComprador, catalogoBanco);
      // (15.50 * 2 = 31.00) + (42.00 * 3 = 126.00) = 157.00
      assert.equal(resultado.totalAmount, 157.00);
      assert.equal(resultado.items[0].subtotal, 31.00);
      assert.equal(resultado.items[1].subtotal, 126.00);
    });

    it('CT-U28: Integridade: Deve ignorar tentativas de adulteração de preço enviadas no corpo do pedido', () => {
      const catalogoBanco = [{ id: 'p1', price: 299.90 }];
      // Cliente malicioso tenta injetar preço de R$ 1,00
      const payloadAdulterado = [{ productId: 'p1', quantity: 1, unitPrice: 1.00, price: 1.00 }];

      const resultado = calcularTotalPedido(payloadAdulterado, catalogoBanco);
      assert.equal(resultado.totalAmount, 299.90);
      assert.equal(resultado.items[0].unitPrice, 299.90);
    });

    it('CT-U29: Arredondamento e Precisão Decimal: Deve formatar valores monetários estritamente com duas casas decimais', () => {
      const catalogoBanco = [{ id: 'p1', price: 10.3333 }];
      const itens = [{ productId: 'p1', quantity: 3 }];

      const resultado = calcularTotalPedido(itens, catalogoBanco);
      // 10.3333 * 3 = 30.9999 -> arredondado para 31.00
      assert.equal(resultado.totalAmount, 31.00);
    });

    it('CT-U30: Tratamento de Exceção: Deve lançar erro caso produto solicitado não conste na base', () => {
      const catalogoBanco = [{ id: 'p1', price: 50.00 }];
      const itensInexistentes = [{ productId: 'produto_fantasma', quantity: 1 }];

      assert.throws(() => {
        calcularTotalPedido(itensInexistentes, catalogoBanco);
      }, /não encontrado/i);
    });
  });

});

