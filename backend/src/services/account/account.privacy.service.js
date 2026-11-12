import prisma from '../../config/prisma.js';
import { AppError } from '../../utils/errors.js';

/**
 * Monta o Dossiê Completo de Dados Pessoais do Titular em conformidade com o Art. 18 da LGPD
 * @param {string} userId - ID do usuário solicitante autenticado
 */
export async function getUserPrivacyDossier(userId) {
  if (!userId) {
    throw new AppError('Identificador do usuário é obrigatório.', 400);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      addresses: {
        select: {
          id: true,
          nickname: true,
          street: true,
          number: true,
          complement: true,
          neighborhood: true,
          city: true,
          state: true,
          postalCode: true,
          isDefault: true,
          createdAt: true,
        },
      },
      products: {
        where: { deletedAt: null },
        select: {
          id: true,
          title: true,
          price: true,
          condition: true,
          listingType: true,
          status: true,
          city: true,
          state: true,
          neighborhood: true,
          viewsCount: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      orders: {
        select: {
          id: true,
          code: true,
          status: true,
          totalAmount: true,
          createdAt: true,
          payments: {
            select: {
              method: true,
              amount: true,
              status: true,
            },
          },
          items: {
            select: {
              id: true,
              productId: true,
              quantity: true,
              unitPrice: true,
            },
          },
        },
      },
      reviewsGiven: {
        select: {
          id: true,
          targetId: true,
          rating: true,
          comment: true,
          reply: true,
          createdAt: true,
        },
      },
      reviewsReceived: {
        select: {
          id: true,
          authorId: true,
          rating: true,
          comment: true,
          reply: true,
          createdAt: true,
        },
      },
      favorites: {
        select: {
          id: true,
          productId: true,
          createdAt: true,
          product: {
            select: {
              title: true,
              price: true,
            },
          },
        },
      },
      notifications: {
        select: {
          id: true,
          title: true,
          message: true,
          type: true,
          isRead: true,
          createdAt: true,
        },
      },
      usernameHistory: {
        select: {
          oldUsername: true,
          newUsername: true,
          createdAt: true,
        },
      },
      phoneHistory: {
        select: {
          oldPhone: true,
          newPhone: true,
          createdAt: true,
        },
      },
    },
  });

  if (!user) {
    throw new AppError('Usuário titular não encontrado.', 404);
  }

  // Mascara registros telefônicos anteriores preservando a privacidade
  const historicoTelefoneMascarado = (user.phoneHistory || []).map((h) => ({
    ...h,
    oldPhone: h.oldPhone ? h.oldPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) *****-$3') : null,
    newPhone: h.newPhone ? h.newPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) *****-$3') : null,
  }));

  return {
    metadados_lgpd: {
      versao_documento: '1.0',
      data_emissao: new Date().toISOString(),
      legislacao_aplicavel: 'Lei Geral de Proteção de Dados Pessoais (LGPD — Lei nº 13.709/2018)',
      direitos_exercidos: 'Artigo 18, Incisos II (Acesso aos dados) e V (Portabilidade dos dados)',
      controlador: 'Itaim Vende Marketplace',
      canal_privacidade_dpo: 'privacidade@itaimvende.com.br',
      aviso_seguranca: 'Este relatório contém informações pessoais e cadastrais confidenciais sob sua titularidade. Armazene este arquivo em local seguro.',
    },
    titular: {
      id: user.id,
      nome_completo: user.name,
      nome_usuario: user.username ? `@${user.username}` : null,
      email: user.email,
      telefone: user.phone || null,
      telefone_verificado: Boolean(user.phoneVerifiedAt),
      email_verificado: Boolean(user.emailVerifiedAt),
      avatar_url: user.avatar,
      biografia: user.bio,
      papel_usuario: user.role,
      status_conta: user.status,
      localizacao: {
        cidade: user.city,
        estado: user.state,
        bairro: user.neighborhood,
        cep: user.postalCode,
      },
      metricas: {
        reputacao_media: Number(user.ratingAverage),
        total_avaliacoes: user.ratingCount,
        total_vendas: user.salesCount,
      },
      auditoria: {
        data_cadastro: user.createdAt,
        ultima_atualizacao: user.updatedAt,
        ultimo_login: user.lastLoginAt,
      },
    },
    preferencias_privacidade: user.preferences || {},
    enderecos_entrega: user.addresses || [],
    anuncios_publicados: (user.products || []).map((p) => ({
      id: p.id,
      titulo: p.title,
      preco: Number(p.price),
      condicao: p.condition,
      tipo_anuncio: p.listingType,
      status: p.status,
      visualizacoes: p.viewsCount,
      localizacao: `${p.neighborhood ? p.neighborhood + ', ' : ''}${p.city} - ${p.state}`,
      data_criacao: p.createdAt,
    })),
    pedidos_e_transacoes: (user.orders || []).map((o) => ({
      id: o.id,
      codigo: o.code,
      status: o.status,
      valor_total: Number(o.totalAmount),
      forma_pagamento: o.payments?.[0]?.method || 'PIX',
      data_pedido: o.createdAt,
      itens_comprados: o.items || [],
    })),
    avaliacoes: {
      concedidas: user.reviewsGiven || [],
      recebidas: user.reviewsReceived || [],
    },
    favoritos_salvos: (user.favorites || []).map((f) => ({
      id_favorito: f.id,
      produto_id: f.productId,
      titulo_produto: f.product?.title || 'Produto',
      preco: f.product?.price ? Number(f.product.price) : null,
      data_adicao: f.createdAt,
    })),
    notificacoes: user.notifications || [],
    historico_identificadores: {
      historico_username: user.usernameHistory || [],
      historico_telefone: historicoTelefoneMascarado,
    },
  };
}
