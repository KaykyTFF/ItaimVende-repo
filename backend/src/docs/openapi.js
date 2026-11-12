/**
 * Especificação OpenAPI 3.0.3 Oficial - Itaim Vende API
 */

export const openapiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Itaim Vende API',
    version: '2.0.0',
    description: `API RESTful completa e profissional da plataforma de marketplace regional **Itaim Vende**, projetada para comércio, intermediação de anúncios e negociações seguras.
    
### Eixos de Arquitetura e Inovação:
1. **Dados e Domínio**: Modelo de domínio completo para marketplaces com catálogo de produtos, intermediação de ordens, histórico auditável de segurança e preferências de conta.
2. **Regra de Negócio e Consulta**: Busca fonética resiliente com PostgreSQL \`unaccent\` (ignora acentos em pesquisas como 'eletronicos' vs 'eletrônicos'), filtros combinados (categoria, cidade, bairro, faixa de preço, condição) e cálculo de integridade financeira no servidor.
3. **Tempo Real e Eventos**: Negociação instantânea por WebSockets (Socket.IO) com mecanismo de fallback assíncrono para notificações offline.
4. **Governança de Conta e Segurança**: Cooldown de 30 dias para alteração de username, verificação segura com código OTP de 6 dígitos para e-mail e telefone, controle de tentativas contra força bruta e tokens criptografados de reversão imediata.`,
    contact: {
      name: 'Equipe de Engenharia Itaim Vende',
      email: 'contato@itaimvende.com.br',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000/api/v1',
      description: 'Servidor Local de Desenvolvimento',
    },
    {
      url: 'https://itaim-vende.onrender.com/api/v1',
      description: 'Servidor de Produção (Nuvem)',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Token JWT obtido via POST /auth/login ou POST /auth/register',
      },
    },
    schemas: {
      StandardError: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          code: { type: 'string', example: 'VALIDATION_ERROR' },
          message: { type: 'string', example: 'Falha na validação dos dados enviados.' },
          details: {
            type: 'array',
            nullable: true,
            items: {
              type: 'object',
              properties: {
                field: { type: 'string', example: 'email' },
                message: { type: 'string', example: 'E-mail inválido.' },
              },
            },
          },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'usr_cm39xyz123' },
          name: { type: 'string', example: 'Kayky Ferreira' },
          email: { type: 'string', example: 'kayky@exemplo.com' },
          role: { type: 'string', enum: ['BUYER', 'SELLER', 'MODERATOR', 'ADMIN'], example: 'SELLER' },
          avatarUrl: { type: 'string', nullable: true, example: 'https://pgrznndtajjzpwqgtkkz.supabase.co/storage/v1/object/public/marketplace/avatar.webp' },
          phone: { type: 'string', nullable: true, example: '89994000000' },
          city: { type: 'string', nullable: true, example: 'Paulistana' },
          state: { type: 'string', nullable: true, example: 'PI' },
          verified: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Product: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'prd_cm39abc987' },
          title: { type: 'string', example: 'Mel Orgânico do Sertão 1kg' },
          description: { type: 'string', example: 'Mel puro de abelha produzido no Vale do Itaim, florada silvestre.' },
          price: { type: 'number', example: 45.0 },
          originalPrice: { type: 'number', nullable: true, example: 55.0 },
          categoryId: { type: 'string', example: 'cat_agro' },
          condition: { type: 'string', enum: ['NOVO', 'USADO', 'RECONDICIONADO'], example: 'NOVO' },
          status: { type: 'string', enum: ['ATIVO', 'PAUSADO', 'VENDIDO', 'MODERADO'], example: 'ATIVO' },
          city: { type: 'string', example: 'Paulistana' },
          neighborhood: { type: 'string', example: 'Centro' },
          images: {
            type: 'array',
            items: { type: 'string' },
            example: ['https://pgrznndtajjzpwqgtkkz.supabase.co/storage/v1/object/public/marketplace/mel1.webp'],
          },
          sellerId: { type: 'string', example: 'usr_cm39xyz123' },
          viewsCount: { type: 'integer', example: 124 },
          contactsCount: { type: 'integer', example: 18 },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Category: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'cat_agro' },
          name: { type: 'string', example: 'Agricultura & Produção Local' },
          slug: { type: 'string', example: 'agricultura-producao-local' },
          icon: { type: 'string', example: 'sprout' },
          _count: {
            type: 'object',
            properties: {
              products: { type: 'integer', example: 42 },
            },
          },
        },
      },
      Conversation: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'conv_12345' },
          productId: { type: 'string', example: 'prd_cm39abc987' },
          buyerId: { type: 'string', example: 'usr_buyer1' },
          sellerId: { type: 'string', example: 'usr_seller2' },
          unreadCount: { type: 'integer', example: 2 },
          lastMessageAt: { type: 'string', format: 'date-time' },
        },
      },
      Message: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'msg_98765' },
          conversationId: { type: 'string', example: 'conv_12345' },
          senderId: { type: 'string', example: 'usr_buyer1' },
          content: { type: 'string', example: 'Olá, ainda está disponível?' },
          type: { type: 'string', enum: ['TEXT', 'IMAGE', 'PROPOSAL', 'SYSTEM'], example: 'TEXT' },
          proposalAmount: { type: 'number', nullable: true, example: 40.0 },
          proposalStatus: { type: 'string', nullable: true, enum: ['PENDING', 'ACCEPTED', 'REJECTED'], example: null },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Order: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'ord_777888' },
          buyerId: { type: 'string', example: 'usr_buyer1' },
          status: { type: 'string', enum: ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'], example: 'PENDING' },
          totalAmount: { type: 'number', example: 90.0 },
          paymentMethod: { type: 'string', enum: ['PIX', 'CREDIT_CARD', 'CASH_ON_DELIVERY'], example: 'PIX' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Report: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'rep_555' },
          protocol: { type: 'string', example: 'TK-84A12B' },
          productId: { type: 'string', example: 'prd_cm39abc987' },
          reason: { type: 'string', example: 'FRAUDE' },
          description: { type: 'string', example: 'Preço suspeito e recusa em mostrar o produto.' },
          status: { type: 'string', enum: ['PENDING', 'REVIEWING', 'RESOLVED', 'DISMISSED'], example: 'PENDING' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
  paths: {
    // -------------------------------------------------------------------------
    // DIAGNÓSTICO
    // -------------------------------------------------------------------------
    '/health': {
      get: {
        tags: ['Diagnóstico & Saúde'],
        summary: 'Verifica integridade e status de execução da API',
        description: 'Retorna informações operacionais, tempo de atividade (uptime), versão e identificador de inicialização do servidor.',
        responses: {
          200: {
            description: 'API operando normalmente.',
            content: {
              'application/json': {
                example: {
                  status: 'online',
                  version: 'v1',
                  platform: 'Itaim Vende API',
                  bootId: 'boot_1730000000_abc12',
                  timestamp: '2026-10-27T10:45:00.000Z',
                  uptime: 1450,
                  environment: 'development',
                },
              },
            },
          },
        },
      },
    },

    // -------------------------------------------------------------------------
    // AUTENTICAÇÃO
    // -------------------------------------------------------------------------
    '/auth/register': {
      post: {
        tags: ['Autenticação & Contas'],
        summary: 'Registra novo usuário comprador ou vendedor',
        description: 'Cadastra um novo usuário no banco com hash seguro de senha via Bcrypt e validação de schema Zod.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', example: 'João da Silva' },
                  email: { type: 'string', format: 'email', example: 'joao@valedoitaim.com' },
                  password: { type: 'string', minLength: 6, example: 'SenhaSegura@123' },
                  phone: { type: 'string', example: '89994112233' },
                  city: { type: 'string', example: 'Paulistana' },
                  state: { type: 'string', example: 'PI' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Conta criada com sucesso.',
            content: {
              'application/json': {
                example: {
                  success: true,
                  message: 'Conta criada com sucesso!',
                  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                  user: {
                    id: 'usr_abc123',
                    name: 'João da Silva',
                    email: 'joao@valedoitaim.com',
                    role: 'BUYER',
                  },
                },
              },
            },
          },
          400: {
            description: 'Dados inválidos ou e-mail malformado.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardError' } } },
          },
          409: {
            description: 'E-mail já cadastrado.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardError' } } },
          },
        },
      },
    },

    '/auth/login': {
      post: {
        tags: ['Autenticação & Contas'],
        summary: 'Autentica usuário e emite JWT Bearer Token',
        description: 'Gera token JWT stateless com proteção rate limit contra ataques de força bruta (máx 15 req/15min).',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'admin@itaimvende.com.br' },
                  password: { type: 'string', example: 'Admin@123456' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Login efetuado com sucesso.',
            content: {
              'application/json': {
                example: {
                  success: true,
                  message: 'Login realizado com sucesso.',
                  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                  user: {
                    id: 'usr_admin',
                    name: 'Administrador Itaim',
                    email: 'admin@itaimvende.com.br',
                    role: 'ADMIN',
                  },
                },
              },
            },
          },
          401: {
            description: 'Credenciais inválidas.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardError' } } },
          },
          429: {
            description: 'Limite de tentativas excedido (Rate Limit).',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardError' } } },
          },
        },
      },
    },

    '/auth/forgot-password': {
      post: {
        tags: ['Autenticação & Contas'],
        summary: 'Inicia fluxo de recuperação de senha por e-mail',
        description: 'Gera código numérico de 6 dígitos temporário (expira em 1h) e envia por e-mail transacional.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'usuario@exemplo.com' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Instruções de redefinição processadas (resposta cega contra enumeração).',
            content: {
              'application/json': {
                example: {
                  success: true,
                  message: 'Se o e-mail estiver cadastrado, você receberá um código de redefinição de 6 dígitos em instantes.',
                },
              },
            },
          },
          400: {
            description: 'Formato de e-mail inválido.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardError' } } },
          },
        },
      },
    },

    '/auth/verify-reset-code': {
      post: {
        tags: ['Autenticação & Contas'],
        summary: 'Valida código de 6 dígitos de recuperação de senha',
        description: 'Possui proteção anti-brute-force: bloqueia e descarta o código após 5 tentativas incorretas.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'code'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'usuario@exemplo.com' },
                  code: { type: 'string', example: '123456' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Código validado com sucesso.',
            content: {
              'application/json': {
                example: {
                  success: true,
                  message: 'Código de verificação validado com sucesso.',
                },
              },
            },
          },
          400: {
            description: 'Código incorreto ou expirado.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardError' } } },
          },
          429: {
            description: 'Muitas tentativas falhas. Código invalidado por segurança.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardError' } } },
          },
        },
      },
    },

    '/auth/reset-password': {
      post: {
        tags: ['Autenticação & Contas'],
        summary: 'Define nova senha usando código verificado',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'code', 'newPassword'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'usuario@exemplo.com' },
                  code: { type: 'string', example: '123456' },
                  newPassword: { type: 'string', minLength: 6, example: 'NovaSenha@987' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Senha redefinida com sucesso.',
            content: {
              'application/json': {
                example: {
                  success: true,
                  message: 'Senha alterada com sucesso! Você já pode entrar com a nova credencial.',
                },
              },
            },
          },
          400: {
            description: 'Falha ao redefinir a senha.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardError' } } },
          },
        },
      },
    },

    '/auth/me': {
      get: {
        tags: ['Autenticação & Contas'],
        summary: 'Retorna perfil do usuário autenticado',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Dados do perfil do usuário.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } },
          },
          401: {
            description: 'Não autenticado ou token inválido/expirado.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardError' } } },
          },
        },
      },
      put: {
        tags: ['Autenticação & Contas'],
        summary: 'Atualiza dados cadastrais do perfil',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'João da Silva Sauro' },
                  phone: { type: 'string', example: '89994001122' },
                  city: { type: 'string', example: 'Paulistana' },
                  state: { type: 'string', example: 'PI' },
                  bio: { type: 'string', example: 'Produtor rural no Vale do Itaim' },
                  avatarUrl: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Perfil atualizado com sucesso.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } },
          },
          401: {
            description: 'Não autenticado.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardError' } } },
          },
        },
      },
      delete: {
        tags: ['Autenticação & Contas', 'Privacidade & LGPD'],
        summary: 'Exclui ou anonimiza a própria conta e dados pessoais (LGPD Art. 18, VI)',
        description: 'Exclui a conta e anonimiza os dados pessoais do titular. Requer confirmação da senha atual para contas com senha local.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: false,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  password: { type: 'string', example: 'SenhaSegura@2026' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Conta excluída e dados pessoais anonimizados/eliminados com sucesso.',
            content: {
              'application/json': {
                example: { success: true, message: 'Conta desativada e excluída com sucesso.' },
              },
            },
          },
          400: {
            description: 'Senha incorreta ou pendências impeditivas na conta.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardError' } } },
          },
          401: {
            description: 'Não autenticado.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardError' } } },
          },
        },
      },
    },

    '/account/privacy/dossier': {
      get: {
        tags: ['Privacidade & LGPD'],
        summary: 'Consulta dossiê consolidado de dados pessoais do titular (LGPD Art. 18, II)',
        description: 'Retorna a totalidade dos dados cadastrais, anúncios, endereços, transações, avaliações, favoritos e metadados de privacidade vinculados ao usuário autenticado.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Dossiê do titular retornado com sucesso.',
            content: {
              'application/json': {
                example: {
                  success: true,
                  dossier: {
                    titular: {
                      id: 'usr_123',
                      nome_completo: 'Maria da Silva',
                      nome_usuario: 'mariasilva',
                      email: 'maria@example.com',
                      telefone: '89994001122',
                    },
                    metadados_lgpd: {
                      legislacao: 'Lei Geral de Proteção de Dados (Lei nº 13.709/2018)',
                      canal_privacidade_dpo: 'privacidade@itaimvende.com.br',
                    },
                  },
                },
              },
            },
          },
          401: {
            description: 'Não autenticado.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardError' } } },
          },
        },
      },
    },

    '/account/privacy/export': {
      get: {
        tags: ['Privacidade & LGPD'],
        summary: 'Exportação e portabilidade de dados pessoais em arquivo JSON (LGPD Art. 18, V)',
        description: 'Gera e descarrega um arquivo JSON interoperável com a cópia integral dos dados pessoais do titular.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Arquivo JSON descarregado com sucesso.',
            content: {
              'application/json': {
                schema: { type: 'object' },
              },
            },
          },
          401: {
            description: 'Não autenticado.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardError' } } },
          },
        },
      },
    },

    // -------------------------------------------------------------------------
    // USUÁRIOS & NOMES DE USUÁRIO (CANÔNICA REST)
    // -------------------------------------------------------------------------
    '/account/phone-reversals': {
      post: {
        tags: ['Autenticação & Contas'],
        summary: 'Reverte número de telefone para o anterior utilizando rollback token de segurança',
        description: 'Permite ao proprietário legítimo desfazer troca não autorizada de número telefônico.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['token'],
                properties: {
                  token: { type: 'string', example: 'tok_rev_abc123xyz' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Telefone revertido com sucesso.',
            content: {
              'application/json': {
                example: { success: true, message: 'Número de telefone restaurado com sucesso.' },
              },
            },
          },
          400: { description: 'Token de reversão inválido ou expirado.' },
          404: { description: 'Solicitação ou registro de reversão não encontrado.' },
        },
      },
    },

    '/users/{id}': {
      get: {
        tags: ['Usuários'],
        summary: 'Consulta perfil público de vendedor por ID',
        description: 'Exibe dados públicos do vendedor (nome, cidade, avaliações, anúncios). Protegido contra enumeração de compradores e e-mails.',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID do usuário vendedor',
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Perfil público retornado.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } },
          },
          404: {
            description: 'Vendedor não encontrado.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardError' } } },
          },
        },
      },
    },

    '/users/{userId}/reviews': {
      get: {
        tags: ['Usuários', 'Avaliações (Reviews)'],
        summary: 'Lista avaliações e média de estrelas de um vendedor',
        parameters: [{ name: 'userId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Média de avaliação e comentários retornados.',
            content: {
              'application/json': {
                example: {
                  success: true,
                  averageRating: 4.8,
                  totalReviews: 12,
                  reviews: [
                    {
                      id: 'rev_1',
                      rating: 5,
                      comment: 'Vendedor atencioso e confiável.',
                      author: { name: 'Maria Santos' },
                    },
                  ],
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Usuários', 'Avaliações (Reviews)'],
        summary: 'Envia avaliação e nota para um vendedor',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'userId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['rating'],
                properties: {
                  rating: { type: 'integer', minimum: 1, maximum: 5, example: 5 },
                  comment: { type: 'string', example: 'Excelente produto!' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Avaliação registrada com sucesso.' },
          400: { description: 'Dados inválidos ou autoavaliação.' },
          401: { description: 'Não autenticado.' },
        },
      },
    },

    '/usernames/availability': {
      get: {
        tags: ['Autenticação & Contas'],
        summary: 'Verifica disponibilidade e status de cooldown de um nome de usuário (@)',
        parameters: [
          {
            name: 'username',
            in: 'query',
            required: true,
            description: 'Nome de usuário a consultar',
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Resultado da disponibilidade retornado.',
            content: {
              'application/json': {
                example: {
                  success: true,
                  available: true,
                  valid: true,
                  canChangeUsername: true,
                  message: 'Nome de usuário disponível!',
                },
              },
            },
          },
        },
      },
    },

    '/auth/user/{id}': {
      get: {
        tags: ['Autenticação & Contas'],
        summary: 'Consulta perfil público de vendedor por ID',
        description: 'Exibe dados públicos do vendedor (nome, cidade, avaliações, anúncios). Protegido contra enumeração de compradores e e-mails.',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID do usuário vendedor',
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Perfil público retornado.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } },
          },
          404: {
            description: 'Vendedor não encontrado.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardError' } } },
          },
        },
      },
    },

    // -------------------------------------------------------------------------
    // PRODUTOS & ANÚNCIOS
    // -------------------------------------------------------------------------
    '/products': {
      get: {
        tags: ['Anúncios & Produtos'],
        summary: 'Lista produtos com busca fonética, filtros, ordenação e paginação',
        description: `Endpoint central de consulta do marketplace.
        - **Inovação**: Suporta busca fonética sem acentos com a extensão PostgreSQL \`unaccent\` (ex: buscar por 'eletronicos' encontra 'Eletrônicos').
        - **Filtros**: categoria, preço mínimo/máximo, condição (NOVO/USADO), cidade e bairro do semiárido.
        - **Ordenação**: 'newest', 'price_asc', 'price_desc', 'popular'.`,
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Termo de busca com tolerância a acentos' },
          { name: 'category', in: 'query', schema: { type: 'string' }, description: 'Slug ou ID da categoria' },
          { name: 'city', in: 'query', schema: { type: 'string' }, description: 'Cidade do Vale do Itaim (ex: Paulistana, Acauã, Jacobina)' },
          { name: 'neighborhood', in: 'query', schema: { type: 'string' }, description: 'Bairro local' },
          { name: 'minPrice', in: 'query', schema: { type: 'number' }, description: 'Preço mínimo' },
          { name: 'maxPrice', in: 'query', schema: { type: 'number' }, description: 'Preço máximo' },
          { name: 'condition', in: 'query', schema: { type: 'string', enum: ['NOVO', 'USADO'] } },
          { name: 'sort', in: 'query', schema: { type: 'string', enum: ['newest', 'price_asc', 'price_desc', 'popular'], default: 'newest' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 }, description: 'Número da página' },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 }, description: 'Itens por página' },
        ],
        responses: {
          200: {
            description: 'Lista paginada de produtos retornada com sucesso.',
            content: {
              'application/json': {
                example: {
                  success: true,
                  data: [
                    {
                      id: 'prd_cm39abc987',
                      title: 'Mel Orgânico do Sertão 1kg',
                      price: 45.0,
                      city: 'Paulistana',
                      category: { name: 'Agricultura & Produção Local' },
                      seller: { name: 'Produtor João' },
                    },
                  ],
                  meta: {
                    total: 1,
                    page: 1,
                    limit: 20,
                    totalPages: 1,
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Anúncios & Produtos'],
        summary: 'Publica um novo anúncio no marketplace',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'description', 'price', 'categoryId'],
                properties: {
                  title: { type: 'string', example: 'Queijo de Cabra Artesanal 500g' },
                  description: { type: 'string', example: 'Produção própria no interior de Paulistana.' },
                  price: { type: 'number', example: 28.5 },
                  categoryId: { type: 'string', example: 'cat_agro' },
                  condition: { type: 'string', enum: ['NOVO', 'USADO'], example: 'NOVO' },
                  city: { type: 'string', example: 'Paulistana' },
                  neighborhood: { type: 'string', example: 'Lagoa dos Bois' },
                  images: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['https://pgrznndtajjzpwqgtkkz.supabase.co/storage/v1/object/public/marketplace/queijo.webp'],
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Anúncio publicado com sucesso.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Product' } } },
          },
          400: {
            description: 'Dados inválidos.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardError' } } },
          },
          401: {
            description: 'Não autenticado.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardError' } } },
          },
        },
      },
    },

    '/products/{id}': {
      get: {
        tags: ['Anúncios & Produtos'],
        summary: 'Obtém detalhes de um anúncio específico por ID ou slug',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Detalhes do anúncio.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Product' } } },
          },
          404: {
            description: 'Anúncio não encontrado.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardError' } } },
          },
        },
      },
      put: {
        tags: ['Anúncios & Produtos'],
        summary: 'Atualiza dados de um anúncio existente',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  price: { type: 'number' },
                  condition: { type: 'string', enum: ['NOVO', 'USADO'] },
                  images: { type: 'array', items: { type: 'string' } },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Anúncio atualizado.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Product' } } },
          },
          401: { description: 'Não autenticado.' },
          403: { description: 'Apenas o proprietário ou administrador pode editar.' },
          404: { description: 'Anúncio não encontrado.' },
        },
      },
      delete: {
        tags: ['Anúncios & Produtos'],
        summary: 'Exclui anúncio e purga imagens órfãs do Supabase Storage',
        description: 'Remove o registro do banco de dados e automaticamente invoca o Storage Adapter para deletar os arquivos do bucket do Supabase, evitando custos de armazenamento.',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          204: { description: 'Anúncio removido com sucesso (Sem Conteúdo).' },
          401: { description: 'Não autenticado.' },
          403: { description: 'Sem permissão para excluir anúncio de outro usuário.' },
          404: { description: 'Anúncio não encontrado.' },
        },
      },
    },

    '/products/{id}/status': {
      patch: {
        tags: ['Anúncios & Produtos'],
        summary: 'Altera status do anúncio (ATIVO, PAUSADO, VENDIDO)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: { type: 'string', enum: ['ATIVO', 'PAUSADO', 'VENDIDO'] },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Status alterado com sucesso.' },
          401: { description: 'Não autenticado.' },
          403: { description: 'Não autorizado.' },
          404: { description: 'Anúncio não encontrado.' },
        },
      },
    },

    '/products/{id}/contact': {
      post: {
        tags: ['Anúncios & Produtos'],
        summary: 'Registra métrica de clique para contato (WhatsApp/Telefone)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Métrica incrementada.',
            content: { 'application/json': { example: { success: true, contactsCount: 19 } } },
          },
        },
      },
    },

    // -------------------------------------------------------------------------
    // CATEGORIAS
    // -------------------------------------------------------------------------
    '/categories': {
      get: {
        tags: ['Categorias'],
        summary: 'Lista todas as categorias do marketplace com contagem de produtos',
        description: 'Possui cabeçalho de cache HTTP `Cache-Control: public, max-age=300` para otimizar desempenho de carregamento na vitrine.',
        responses: {
          200: {
            description: 'Lista de categorias retornada com sucesso.',
            headers: {
              'Cache-Control': {
                schema: { type: 'string', example: 'public, max-age=300' },
                description: 'Cache HTTP em clientes e proxies por 5 minutos.',
              },
            },
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Category' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    // -------------------------------------------------------------------------
    // CHAT & NEGOCIAÇÃO EM TEMPO REAL
    // -------------------------------------------------------------------------
    '/chat/conversations': {
      get: {
        tags: ['Chat & Negociação'],
        summary: 'Lista todas as conversas do usuário autenticado',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Conversas ativas do comprador ou vendedor.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { type: 'array', items: { $ref: '#/components/schemas/Conversation' } },
                  },
                },
              },
            },
          },
          401: { description: 'Não autenticado.' },
        },
      },
      post: {
        tags: ['Chat & Negociação'],
        summary: 'Inicia ou recupera negociação existente para um anúncio',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['productId'],
                properties: {
                  productId: { type: 'string', example: 'prd_cm39abc987' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Conversa criada ou recuperada.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Conversation' } } },
          },
          400: { description: 'Não é permitido iniciar negociação consigo mesmo.' },
          401: { description: 'Não autenticado.' },
        },
      },
    },

    '/chat/conversations/{id}/messages': {
      get: {
        tags: ['Chat & Negociação'],
        summary: 'Obtém histórico de mensagens da conversa',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'after', in: 'query', schema: { type: 'string', format: 'date-time' }, description: 'Filtro para mensagens após determinado horário' },
        ],
        responses: {
          200: {
            description: 'Histórico de mensagens.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { type: 'array', items: { $ref: '#/components/schemas/Message' } },
                  },
                },
              },
            },
          },
          401: { description: 'Não autenticado.' },
          403: { description: 'Usuário não faz parte desta negociação.' },
          404: { description: 'Conversa não encontrada.' },
        },
      },
      post: {
        tags: ['Chat & Negociação'],
        summary: 'Envia mensagem de texto ou contraproposta de preço',
        description: 'Entrega em tempo real por WebSockets (Socket.IO). Se o destinatário estiver offline no momento, enfileira e dispara um e-mail transacional notificando sobre a nova mensagem.',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['content'],
                properties: {
                  content: { type: 'string', example: 'Aceita R$ 40,00 para fechar hoje?' },
                  type: { type: 'string', enum: ['TEXT', 'PROPOSAL', 'IMAGE'], default: 'TEXT' },
                  proposalAmount: { type: 'number', example: 40.0 },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Mensagem enviada com sucesso.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } },
          },
          400: { description: 'Conteúdo ou valor inválido.' },
          401: { description: 'Não autenticado.' },
          403: { description: 'Não autorizado ou conversa bloqueada.' },
        },
      },
    },

    '/chat/messages/{id}/status': {
      patch: {
        tags: ['Chat & Negociação'],
        summary: 'Atualiza o status de proposta de negociação (aceitar ou recusar)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: { type: 'string', enum: ['ACCEPTED', 'REJECTED'], example: 'ACCEPTED' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Status da proposta atualizado com sucesso.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } },
          },
          400: { description: 'Status inválido ou mensagem não é do tipo PROPOSAL.' },
          401: { description: 'Não autenticado.' },
          403: { description: 'Apenas o destinatário da proposta pode alterar seu status.' },
          404: { description: 'Mensagem não encontrada.' },
        },
      },
    },

    '/chat/messages/{id}/accept': {
      patch: {
        tags: ['Chat & Negociação'],
        summary: 'Aceita proposta de preço recebida',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Proposta aceita e valor acordado atualizado.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } },
          },
          401: { description: 'Não autenticado.' },
          403: { description: 'Apenas o destinatário da proposta pode aceitá-la.' },
        },
      },
    },

    // -------------------------------------------------------------------------
    // PEDIDOS & CHECKOUT
    // -------------------------------------------------------------------------
    '/orders': {
      post: {
        tags: ['Pedidos & Checkout'],
        summary: 'Gera pedido com cálculo e validação de preços estritamente no servidor',
        description: 'Garante integridade financeira: o cliente não pode manipular os preços de itens; os valores são lidos diretamente do banco de dados.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['items', 'paymentMethod'],
                properties: {
                  items: {
                    type: 'array',
                    items: {
                      type: 'object',
                      required: ['productId', 'quantity'],
                      properties: {
                        productId: { type: 'string', example: 'prd_cm39abc987' },
                        quantity: { type: 'integer', minimum: 1, example: 2 },
                      },
                    },
                  },
                  paymentMethod: { type: 'string', enum: ['PIX', 'CREDIT_CARD', 'CASH_ON_DELIVERY'], example: 'PIX' },
                  addressId: { type: 'string', nullable: true },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Pedido gerado com sucesso.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Order' } } },
          },
          400: { description: 'Produto indisponível ou dados inválidos.' },
          401: { description: 'Não autenticado.' },
        },
      },
      get: {
        tags: ['Pedidos & Checkout'],
        summary: 'Lista pedidos realizados pelo comprador autenticado',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Lista de pedidos.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { type: 'array', items: { $ref: '#/components/schemas/Order' } },
                  },
                },
              },
            },
          },
          401: { description: 'Não autenticado.' },
        },
      },
    },

    '/orders/{id}': {
      get: {
        tags: ['Pedidos & Checkout'],
        summary: 'Consulta detalhes completos de um pedido',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Detalhes do pedido retornado.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Order' } } },
          },
          401: { description: 'Não autenticado.' },
          403: { description: 'Acesso negado.' },
          404: { description: 'Pedido não encontrado.' },
        },
      },
    },

    // -------------------------------------------------------------------------
    // FAVORITOS
    // -------------------------------------------------------------------------
    '/favorites': {
      get: {
        tags: ['Favoritos'],
        summary: 'Lista anúncios favoritados pelo usuário logado',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Lista de anúncios favoritados.',
            content: {
              'application/json': {
                example: {
                  success: true,
                  data: [
                    {
                      id: 'fav_1',
                      product: { id: 'prd_cm39abc987', title: 'Mel Orgânico do Sertão 1kg', price: 45.0 },
                    },
                  ],
                },
              },
            },
          },
          401: { description: 'Não autenticado.' },
        },
      },
    },

    '/favorites/{productId}': {
      get: {
        tags: ['Favoritos'],
        summary: 'Consulta se produto específico está favoritado pelo usuário autenticado',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'productId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Status de favorito retornado com sucesso.',
            content: {
              'application/json': {
                example: { success: true, favorited: true, isFavorited: true },
              },
            },
          },
          401: { description: 'Não autenticado.' },
        },
      },
      put: {
        tags: ['Favoritos'],
        summary: 'Adiciona produto aos favoritos de forma idempotente',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'productId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Produto adicionado aos favoritos com sucesso.',
            content: {
              'application/json': {
                example: { success: true, favorited: true, message: 'Produto adicionado aos favoritos.' },
              },
            },
          },
          401: { description: 'Não autenticado.' },
          404: { description: 'Produto não encontrado.' },
        },
      },
      delete: {
        tags: ['Favoritos'],
        summary: 'Remove produto dos favoritos de forma idempotente',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'productId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Produto removido dos favoritos com sucesso.',
            content: {
              'application/json': {
                example: { success: true, favorited: false, message: 'Produto removido dos favoritos.' },
              },
            },
          },
          401: { description: 'Não autenticado.' },
          404: { description: 'Produto não encontrado.' },
        },
      },
    },

    '/favorites/{productId}/toggle': {
      post: {
        tags: ['Favoritos'],
        summary: 'Alterna status de favorito (adiciona se não tiver, remove se tiver)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'productId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Status de favorito alternado.',
            content: {
              'application/json': {
                example: { success: true, favorited: true, message: 'Produto adicionado aos favoritos.' },
              },
            },
          },
          401: { description: 'Não autenticado.' },
        },
      },
    },

    // -------------------------------------------------------------------------
    // AVALIAÇÕES (REVIEWS)
    // -------------------------------------------------------------------------
    '/reviews/user/{userId}': {
      get: {
        tags: ['Avaliações (Reviews)'],
        summary: 'Lista avaliações e média de estrelas de um vendedor',
        parameters: [{ name: 'userId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Média de avaliação e comentários retornados.',
            content: {
              'application/json': {
                example: {
                  success: true,
                  averageRating: 4.8,
                  totalReviews: 12,
                  reviews: [
                    {
                      id: 'rev_1',
                      rating: 5,
                      comment: 'Vendedor honesto, entregou o mel no prazo no centro de Paulistana!',
                      author: { name: 'Maria Santos' },
                    },
                  ],
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Avaliações (Reviews)'],
        summary: 'Publica uma nova avaliação para um vendedor',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'userId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['rating', 'comment'],
                properties: {
                  rating: { type: 'integer', minimum: 1, maximum: 5, example: 5 },
                  comment: { type: 'string', example: 'Excelente atendimento e produto de muita qualidade.' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Avaliação registrada com sucesso.' },
          400: { description: 'Dados inválidos ou nota fora da escala.' },
          401: { description: 'Não autenticado.' },
        },
      },
    },

    '/reviews/{id}': {
      delete: {
        tags: ['Avaliações (Reviews)'],
        summary: 'Exclui avaliação existente',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          204: { description: 'Avaliação excluída com sucesso (Sem Conteúdo).' },
          401: { description: 'Não autenticado.' },
          403: { description: 'Apenas o autor ou moderador pode excluir.' },
          404: { description: 'Avaliação não encontrada.' },
        },
      },
    },

    // -------------------------------------------------------------------------
    // DENÚNCIAS & MODERAÇÃO
    // -------------------------------------------------------------------------
    '/reports/{productId}': {
      post: {
        tags: ['Denúncias & Moderação'],
        summary: 'Registra denúncia contra anúncio potencialmente fraudulento',
        description: 'Gera protocolo de acompanhamento (ex: TK-84A12B) e notifica o painel administrativo de moderação.',
        parameters: [{ name: 'productId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['reason', 'description'],
                properties: {
                  reason: { type: 'string', enum: ['FRAUDE', 'PRECO_FALSO', 'CONTEUDO_OFENSIVO', 'PRODUTO_ILEGAL'], example: 'FRAUDE' },
                  description: { type: 'string', example: 'Tentou cobrar adiantado por fora da plataforma.' },
                  contactEmail: { type: 'string', format: 'email', nullable: true },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Denúncia registrada.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Report' } } },
          },
          400: { description: 'Dados inválidos.' },
        },
      },
    },

    '/reports': {
      get: {
        tags: ['Denúncias & Moderação'],
        summary: 'Lista tickets de denúncia no painel de moderação',
        description: 'Exige papel de usuário com nível ADMIN ou MODERATOR.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['PENDING', 'REVIEWING', 'RESOLVED', 'DISMISSED'] } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        ],
        responses: {
          200: {
            description: 'Lista de denúncias retornada para a equipe de moderação.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { type: 'array', items: { $ref: '#/components/schemas/Report' } },
                  },
                },
              },
            },
          },
          401: { description: 'Não autenticado.' },
          403: { description: 'Acesso restrito a Moderadores e Administradores.' },
        },
      },
    },

    '/reports/{id}/product': {
      delete: {
        tags: ['Denúncias & Moderação'],
        summary: 'Ação canônica de moderação: Remove produto denunciado e purga mídias',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  reasonNote: { type: 'string', example: 'Produto comprovadamente falso.' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Anúncio removido e mídias deletadas com sucesso.',
            content: {
              'application/json': {
                example: { success: true, message: 'Anúncio removido e mídias deletadas com sucesso.' },
              },
            },
          },
          401: { description: 'Não autenticado.' },
          403: { description: 'Apenas moderadores autorizados.' },
          404: { description: 'Denúncia ou anúncio não encontrado.' },
        },
      },
    },

    '/reports/{id}/remove-product': {
      post: {
        tags: ['Denúncias & Moderação'],
        summary: 'Ação de moderação: Remove anúncio e purga arquivos do bucket',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  reasonNote: { type: 'string', example: 'Produto comprovadamente falso.' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Anúncio removido e bucket higienizado.',
            content: {
              'application/json': {
                example: { success: true, message: 'Anúncio removido e mídias deletadas com sucesso.' },
              },
            },
          },
          403: { description: 'Apenas moderadores autorizados.' },
        },
      },
    },

    // -------------------------------------------------------------------------
    // ENDEREÇOS
    // -------------------------------------------------------------------------
    '/addresses': {
      get: {
        tags: ['Endereços'],
        summary: 'Lista endereços cadastrados do usuário',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Lista de endereços.' },
          401: { description: 'Não autenticado.' },
        },
      },
      post: {
        tags: ['Endereços'],
        summary: 'Adiciona novo endereço de entrega/retirada',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['street', 'neighborhood', 'city', 'state', 'zipCode'],
                properties: {
                  street: { type: 'string', example: 'Rua Senador Cândido Ferraz, 120' },
                  neighborhood: { type: 'string', example: 'Centro' },
                  city: { type: 'string', example: 'Paulistana' },
                  state: { type: 'string', example: 'PI' },
                  zipCode: { type: 'string', example: '64750000' },
                  isPrimary: { type: 'boolean', default: false },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Endereço cadastrado com sucesso.' },
          400: { description: 'Dados inválidos.' },
          401: { description: 'Não autenticado.' },
        },
      },
    },

    '/addresses/{id}': {
      delete: {
        tags: ['Endereços'],
        summary: 'Exclui um endereço cadastrado',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          204: { description: 'Endereço excluído (Sem Conteúdo).' },
          401: { description: 'Não autenticado.' },
          404: { description: 'Endereço não encontrado.' },
        },
      },
    },

    // -------------------------------------------------------------------------
    // NOTIFICAÇÕES
    // -------------------------------------------------------------------------
    '/notifications': {
      get: {
        tags: ['Notificações'],
        summary: 'Lista notificações do usuário',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Lista de notificações recebidas.' },
          401: { description: 'Não autenticado.' },
        },
      },
    },

    '/notifications/read-all': {
      patch: {
        tags: ['Notificações'],
        summary: 'Marca todas as notificações como lidas',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Notificações marcadas como lidas.' },
          401: { description: 'Não autenticado.' },
        },
      },
    },

    // -------------------------------------------------------------------------
    // UPLOADS & MÍDIA
    // -------------------------------------------------------------------------
    '/upload': {
      post: {
        tags: ['Uploads de Mídia'],
        summary: 'Envia e otimiza imagens de produtos ou avatar',
        description: `Recebe arquivo em multipart/form-data. Executa:
        - Auto-rotação EXIF de fotos de smartphone.
        - Redimensionamento e compressão para formato ultraotimizado WebP com Sharp.
        - Envio para o bucket do Supabase Storage.`,
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  file: { type: 'string', format: 'binary' },
                  category: { type: 'string', enum: ['perfil', 'vendas'], default: 'vendas' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Imagem enviada e convertida para WebP.',
            content: {
              'application/json': {
                example: {
                  success: true,
                  url: 'https://pgrznndtajjzpwqgtkkz.supabase.co/storage/v1/object/public/marketplace/upload_abc123.webp',
                },
              },
            },
          },
          400: { description: 'Arquivo não suportado ou excede 10MB.' },
          401: { description: 'Não autenticado.' },
        },
      },
    },
  },
};
