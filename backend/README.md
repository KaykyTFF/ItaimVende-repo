# Itaim Vende API - Módulo Backend (v2.0.0)

API RESTful completa desenvolvida para a plataforma de marketplace e intermediação comercial **Itaim Vende**, construída com arquitetura modular em camadas, persistência relacional com Prisma ORM e PostgreSQL, validação estrita via Zod e segurança baseada em tokens JWT.

---

## 1. Visão Geral

O backend do Itaim Vende provê a camada de serviços e regras de negócio para operações de comércio eletrônico, abrangendo autenticação segura, gestão de anúncios com busca fonética regional, intermediação de pedidos com validação financeira no servidor, comunicação em tempo real via WebSockets e governança de dados cadastrais.

### Links Rápidos de Documentação

- **Documentação Interativa (Swagger UI):** [`http://localhost:3000/api-docs`](http://localhost:3000/api-docs) ou [`http://localhost:3000/api/v1/docs`](http://localhost:3000/api/v1/docs)
- **Especificação OpenAPI 3.0.3 (JSON):** [`http://localhost:3000/api/v1/docs/openapi.json`](http://localhost:3000/api/v1/docs/openapi.json)
- **Coleção Postman Oficial:** [`../itaim-vende.postman_collection.json`](../itaim-vende.postman_collection.json)

---

## 2. Tecnologias Utilizadas

- **Runtime:** Node.js (versão 20 LTS ou superior) com ECMAScript Modules (`"type": "module"`)
- **Framework Web:** Express.js 5
- **ORM & Banco de Dados:** Prisma ORM v6 sobre PostgreSQL (Supabase)
- **Extensões de Banco:** `unaccent` e `pg_trgm` para busca textual fonética resiliente
- **Autenticação:** JSON Web Token (`jsonwebtoken`) e criptografia de senhas com `bcryptjs`
- **Validação de Entrada:** `zod` com schemas declarativos por domínio
- **Segurança:** `helmet`, `cors`, `express-rate-limit`
- **Tempo Real:** `socket.io` para negociações instantâneas de chat
- **Processamento de Mídia:** `sharp` com conversão para formato WebP e auto-rotação EXIF
- **Armazenamento:** Provedor Supabase Storage com fallback local para desenvolvimento
- **Testes:** Node.js Test Runner nativo (`node:test`, `node:assert/strict`)

---

## 3. Arquitetura e Organização do Código

O módulo backend adota uma arquitetura em camadas estruturada por responsabilidade:

```
backend/
├── prisma/
│   ├── schema.prisma              # Definição dos modelos relacionais e índices
│   └── seed.js                    # Script de povoamento inicial do banco
├── scripts/
│   └── setup-unaccent.js          # Configuração de extensões unaccent/trigram
├── src/
│   ├── config/
│   │   ├── env.js                 # Validação de variáveis de ambiente
│   │   ├── prisma.js              # Conexão singleton com o PostgreSQL
│   │   └── supabase.js            # Cliente do serviço de armazenamento
│   ├── controllers/               # Controladores HTTP desacoplados por recurso
│   │   ├── account/
│   │   ├── auth/
│   │   ├── category/
│   │   ├── chat/
│   │   ├── order/
│   │   ├── product/
│   │   ├── report/
│   │   ├── review/
│   │   └── upload/
│   ├── docs/                      # Especificação OpenAPI 3.0.3 e rotas Swagger
│   ├── middlewares/               # auth, error, rateLimiter, validate
│   ├── routes/                    # Rotas mapeadas por recurso sob /api/v1
│   ├── schemas/                   # Schemas de validação Zod por recurso
│   ├── services/                  # Lógica de negócio, regras de domínio e transações
│   ├── utils/                     # Utilitários (AppError, sanitize)
│   └── server.js                  # Ponto de entrada do servidor HTTP e WebSocket
├── tests/                         # Suíte de 38 testes de integração automatizados
├── .env.example                   # Modelo de configuração das variáveis locais
└── package.json                   # Dependências e scripts de execução
```

### Fluxo de Execução de uma Requisição

1. **Entrada:** A requisição atinge o Express Router sob o prefixo `/api/v1/`.
2. **Segurança e Interceptação:** Middlewares globais (`helmet`, `cors`, `rateLimiter`) avaliam as restrições de tráfego.
3. **Autenticação e RBAC:** Se a rota for protegida, `requireAuth` valida a assinatura do JWT e `requireRole` confere o nível do usuário (`BUYER`, `SELLER`, `MODERATOR`, `ADMIN`).
4. **Validação de Schema:** O middleware `validate(schema)` avalia o payload através do Zod. Violações retornam `400 Bad Request` padronizado.
5. **Controlador:** O Controller extrai os parâmetros e invoca o Service competente.
6. **Serviço de Domínio:** O Service aplica regras de negócio, executa operações transacionais via Prisma ORM e emite eventos quando aplicável.
7. **Resposta:** O Controller devolve a resposta no padrão JSON com código de status HTTP condizente (`200`, `201`, `204`).
8. **Tratamento de Exceções:** Erros de negócio lançam `AppError`, capturados pelo `error.middleware.js` sem vazamento de stacktraces em produção.

---

## 4. Instalação e Execução

### Pré-requisitos
- Node.js >= 20.0.0
- Instância PostgreSQL ativa

### Passo a Passo

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Configure o arquivo de ambiente:**
   ```bash
   cp .env.example .env
   ```
   Preencha as variáveis de banco de dados (`DATABASE_URL`, `DIRECT_URL`), `JWT_SECRET` e configurações de nuvem.

3. **Prepare o banco de dados:**
   ```bash
   # Gera os tipos do Prisma Client
   npm run prisma:generate

   # Sincroniza o schema com o banco
   npm run prisma:push

   # Cria a extensão unaccent e índices Trigram no PostgreSQL
   npm run db:indexes

   # Popula o banco com os dados iniciais
   npm run seed
   ```

4. **Inicie o servidor:**
   ```bash
   # Modo de desenvolvimento com live-reload:
   npm run dev

   # Modo de produção:
   npm run start
   ```

O servidor iniciará na porta configurada (padrão: 3000).

---

## 5. Endpoints Disponíveis (/api/v1)

A API possui 12 recursos principais:

- **Diagnóstico:** `GET /api/v1/health`
- **Autenticação:** `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `POST /api/v1/auth/google`, `POST /api/v1/auth/forgot-password`, `POST /api/v1/auth/verify-reset-code`, `POST /api/v1/auth/reset-password`, `GET /api/v1/auth/me`, `PUT /api/v1/auth/profile`, `PUT /api/v1/auth/password`, `GET /api/v1/auth/user/:id`
- **Conta e Governança:** `PATCH /api/v1/account/username`, `GET /api/v1/account/username/check`, `POST /api/v1/account/email/change-request`, `POST /api/v1/account/email/confirm`, `POST /api/v1/account/phone/change-request`, `POST /api/v1/account/phone/confirm`, `POST /api/v1/account/phone/revert`, `DELETE /api/v1/account/phone`, `GET /api/v1/account/preferences`, `PATCH /api/v1/account/preferences`
- **Produtos:** `GET /api/v1/products`, `GET /api/v1/products/:id`, `POST /api/v1/products`, `PUT /api/v1/products/:id`, `DELETE /api/v1/products/:id`
- **Categorias:** `GET /api/v1/categories` (com cabeçalho HTTP `Cache-Control`)
- **Pedidos:** `POST /api/v1/orders`, `GET /api/v1/orders`, `GET /api/v1/orders/:id`, `PATCH /api/v1/orders/:id/status`
- **Chat:** `GET /api/v1/chat/conversations`, `POST /api/v1/chat/conversations`, `GET /api/v1/chat/conversations/:id/messages`, `POST /api/v1/chat/conversations/:id/messages`, `PATCH /api/v1/chat/messages/:id/accept`
- **Avaliações:** `GET /api/v1/reviews/user/:userId`, `POST /api/v1/reviews/user/:userId`, `DELETE /api/v1/reviews/:id`
- **Favoritos:** `GET /api/v1/favorites`, `POST /api/v1/favorites/:productId/toggle`
- **Denúncias e Moderação:** `POST /api/v1/reports/:productId`, `GET /api/v1/reports`, `POST /api/v1/reports/:id/remove-product`
- **Endereços:** `GET /api/v1/addresses`, `POST /api/v1/addresses`, `DELETE /api/v1/addresses/:id`
- **Upload:** `POST /api/v1/upload` (multipart/form-data com compressão WebP)

Consulte a documentação Swagger em [`http://localhost:3000/api-docs`](http://localhost:3000/api-docs) para obter esquemas completos de payloads e contratos.

---

## 6. Testes Automatizados

O backend conta com 38 testes de integração automatizados executados nativamente pelo Node.js:

```bash
# Com o servidor em execução na porta 3000:
npm test
```

### Resultados da Suíte:
- **Total de Testes:** 38
- **Suítes Executadas:** 4 (`account-email.test.js`, `account-phone.test.js`, `api.test.js`, `username-cooldown.test.js`)
- **Taxa de Sucesso:** 100% de aprovação (38 testes aprovados, 0 falhas).

---

## 7. Declaração de Uso de Ferramentas de IA

Ferramentas de Inteligência Artificial Generativa foram utilizadas como instrumento de apoio ao desenvolvimento para auxílio na estruturação modular das camadas de arquitetura, identificação de salvaguardas de segurança defensiva, parametrização de compressão de mídia com Sharp e formatação da especificação formal OpenAPI 3.0.3. Toda a implementação foi revisada, homologada e validada pela equipe técnica responsável.