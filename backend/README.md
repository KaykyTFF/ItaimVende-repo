<div align="center">
  <img src="../assets/logos/header-logo.png" alt="Itaim Vende Logo" width="320">

  <p><strong>API RESTful de Marketplace e Intermediacao Comercial — Paulistana e regiao do Vale do Itaim (PI)</strong></p>

  <p>
    <img src="https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js">
    <img src="https://img.shields.io/badge/Express.js-5.2-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js">
    <img src="https://img.shields.io/badge/PostgreSQL-15+-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
    <img src="https://img.shields.io/badge/Prisma-6.x-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma ORM">
    <img src="https://img.shields.io/badge/Socket.io-Real--Time-010101?style=for-the-badge&logo=socketdotio&logoColor=white" alt="Socket.io">
    <img src="https://img.shields.io/badge/Zod-Validacao-3E67B1?style=for-the-badge&logo=zod&logoColor=white" alt="Zod">
    <img src="https://img.shields.io/badge/OpenAPI-3.0.3-85EA2D?style=for-the-badge&logo=openapiinitiative&logoColor=black" alt="OpenAPI 3.0.3">
    <img src="https://img.shields.io/badge/Plataforma-REST_API-44BD32?style=for-the-badge" alt="Plataforma">
    <img src="https://img.shields.io/badge/Testes-88_Aprovados-10B981?style=for-the-badge" alt="Testes Automatizados">
  </p>
</div>

---

# Itaim Vende API - Modulo Backend (v2.0.0)

API RESTful completa desenvolvida para a plataforma de marketplace e intermediacao comercial **Itaim Vende**, construida com arquitetura modular em camadas, persistencia relacional com Prisma ORM e PostgreSQL, validacao estrita via Zod e seguranca baseada em tokens JWT.

---

## 1. Visao Geral

O backend do Itaim Vende prove a camada de servicos e regras de negocio para operacoes de comercio eletronico regional, abrangendo autenticacao segura, gestao de anuncios com busca fonetica regional, intermediacao de pedidos com validacao financeira no servidor, comunicacao em tempo real via WebSockets e governanca de dados cadastrais.

### Links Rapidos de Documentacao

- **Documentacao Interativa (Swagger UI):** [`http://localhost:3000/api-docs`](http://localhost:3000/api-docs) ou [`http://localhost:3000/api/v1/docs`](http://localhost:3000/api/v1/docs)
- **Especificacao OpenAPI 3.0.3 (JSON):** [`http://localhost:3000/api/v1/docs/openapi.json`](http://localhost:3000/api/v1/docs/openapi.json)
- **Colecao Postman Oficial:** [`../itaim-vende.postman_collection.json`](../itaim-vende.postman_collection.json)

---

## 2. Tecnologias Utilizadas

- **Runtime:** Node.js (versao 20 LTS ou superior) com ECMAScript Modules (`"type": "module"`)
- **Framework Web:** Express.js 5
- **ORM & Banco de Dados:** Prisma ORM v6 sobre PostgreSQL (Supabase)
- **Extensoes de Banco:** `unaccent` e `pg_trgm` para busca textual fonetica resiliente
- **Autenticacao:** JSON Web Token (`jsonwebtoken`) e criptografia de senhas com `bcryptjs` (10 rounds)
- **Validacao de Entrada:** `zod` com schemas declarativos por dominio
- **Seguranca:** `helmet`, `cors`, `express-rate-limit`
- **Tempo Real:** `socket.io` para negociacoes instantaneas de chat
- **Processamento de Midia:** `sharp` com conversao para formato WebP e auto-rotacao EXIF
- **Armazenamento:** Provedor Supabase Storage com fallback local para desenvolvimento
- **Testes:** Node.js Test Runner nativo (`node:test`, `node:assert/strict`)

---

## 3. Arquitetura e Organizacao do Codigo

O modulo backend adota uma arquitetura em camadas estruturada por responsabilidade:

```
backend/
├── prisma/
│   ├── schema.prisma              # Definicao dos modelos relacionais e indices
│   └── seed.js                    # Script de povoamento inicial do banco
├── scripts/
│   └── setup-unaccent.js          # Configuracao de extensoes unaccent/trigram
├── src/
│   ├── config/
│   │   ├── env.js                 # Validacao de variaveis de ambiente
│   │   ├── prisma.js              # Conexao singleton com o PostgreSQL
│   │   └── supabase.js            # Cliente do servico de armazenamento
│   ├── controllers/               # Controladores HTTP desacoplados por recurso
│   │   ├── account/
│   │   ├── auth/
│   │   ├── category/
│   │   ├── chat/
│   │   ├── favorite/
│   │   ├── order/
│   │   ├── product/
│   │   ├── report/
│   │   ├── review/
│   │   └── upload/
│   ├── docs/                      # Especificacao OpenAPI 3.0.3 e rotas Swagger
│   ├── middlewares/               # auth, error, rateLimiter, validate
│   ├── routes/                    # Rotas mapeadas por recurso sob /api/v1
│   ├── schemas/                   # Schemas de validacao Zod por recurso
│   ├── services/                  # Logica de negocio, regras de dominio e transacoes
│   ├── utils/                     # Utilitarios (AppError, sanitize)
│   └── server.js                  # Ponto de entrada do servidor HTTP e WebSocket
├── tests/                         # Suite de 47 testes automatizados
│   ├── account-email.test.js
│   ├── account-phone.test.js
│   ├── api.test.js
│   ├── rest-conformance.test.js
│   └── username-cooldown.test.js
├── .env.example                   # Modelo de configuracao das variaveis locais
└── package.json                   # Dependencias e scripts de execucao
```

### Fluxo de Execucao de uma Requisicao:

1. **Entrada:** A requisicao atinge o Express Router sob o prefixo `/api/v1/`.
2. **Seguranca e Interceptacao:** Middlewares globais (`helmet`, `cors`, `rateLimiter`) avaliam as restricoes de trafego.
3. **Autenticacao e RBAC:** Se a rota for protegida, `authenticateToken` valida a assinatura do JWT e confere o status e nivel do usuario (`BUYER`, `SELLER`, `MODERATOR`, `ADMIN`).
4. **Validacao de Schema:** O middleware `validate(schema)` avalia o payload atraves do Zod. Violacoes retornam `400 Bad Request` padronizado.
5. **Controlador:** O Controller extrai os parametros e invoca o Service competente.
6. **Servico de Dominio:** O Service aplica regras de negocio, executa operacoes transacionais via Prisma ORM e emite eventos quando aplicavel.
7. **Resposta:** O Controller devolve a resposta no padrao JSON com codigo de status HTTP condizente (`200`, `201`, `204`).
8. **Tratamento de Excecoes:** Erros de negocio lancam `AppError`, capturados pelo `error.middleware.js` sem vazamento de stacktraces em producao.

---

## 4. Instalacao e Execucao

### Pre-requisitos:
- Node.js >= 20.0.0
- Instancia PostgreSQL ativa

### Passo a Passo:

1. **Instale as dependencias:**
   ```bash
   npm install
   ```

2. **Configure o arquivo de ambiente:**
   ```bash
   cp .env.example .env
   ```
   Preencha as variaveis de banco de dados (`DATABASE_URL`, `DIRECT_URL`), `JWT_SECRET` e configuracoes de nuvem.

3. **Prepare o banco de dados:**
   ```bash
   # Gera os tipos do Prisma Client
   npm run prisma:generate

   # Sincroniza o schema com o banco
   npm run prisma:push

   # Cria a extensao unaccent e indices Trigram no PostgreSQL
   npm run db:indexes

   # Popula o banco com os dados iniciais
   npm run seed
   ```

4. **Inicie o servidor:**
   ```bash
   # Modo de desenvolvimento com live-reload:
   npm run dev

   # Modo de producao:
   npm run start
   ```

O servidor iniciara na porta configurada (padrao: 3000).

---

## 5. Endpoints Disponiveis (/api/v1)

A API disponibiliza endpoints organizados por dominios funcionais com padronizacao RESTful:

- **Diagnostico:** `GET /health`
- **Autenticacao:** `POST /auth/register`, `POST /auth/login`, `POST /auth/google`, `POST /auth/forgot-password`, `POST /auth/verify-reset-code`, `POST /auth/reset-password`, `GET /auth/me`, `PUT /auth/profile`, `PUT /auth/password`
- **Usuarios e Nomes de Usuario:** `GET /users/:id`, `GET /users/:userId/reviews`, `POST /users/:userId/reviews`, `GET /usernames/availability`
- **Conta e Governanca:** `PATCH /account/username`, `POST /account/email/change-request`, `POST /account/email/confirm`, `POST /account/phone/change-request`, `POST /account/phone/confirm`, `POST /account/phone-reversals`, `DELETE /account/phone`, `GET /account/preferences`, `PATCH /account/preferences`
- **Produtos:** `GET /products`, `GET /products/:id`, `POST /products`, `PUT /products/:id`, `DELETE /products/:id`
- **Categorias:** `GET /categories` (com cabecalho HTTP `Cache-Control`)
- **Pedidos:** `POST /orders`, `GET /orders`, `GET /orders/:id`, `PATCH /orders/:id/status`
- **Chat:** `GET /chat/conversations`, `POST /chat/conversations`, `GET /chat/conversations/:id/messages`, `POST /chat/conversations/:id/messages`, `PATCH /chat/messages/:id/status`
- **Favoritos:** `GET /favorites`, `GET /favorites/:productId`, `PUT /favorites/:productId`, `DELETE /favorites/:productId`
- **Avaliacoes:** `DELETE /reviews/:id`
- **Denuncias e Moderacao:** `POST /reports/:productId`, `GET /reports`, `DELETE /reports/:id/product`
- **Enderecos:** `GET /addresses`, `POST /addresses`, `DELETE /addresses/:id`
- **Notificacoes:** `GET /notifications`, `PATCH /notifications/read-all`
- **Upload:** `POST /upload` (multipart/form-data com compressao WebP)

Consulte a documentacao Swagger em [`http://localhost:3000/api-docs`](http://localhost:3000/api-docs) para esquemas completos de payloads e contratos.

---

## 6. Testes Automatizados

O backend conta com 47 testes de integracao automatizados executados nativamente pelo Node.js:

```bash
# Com o servidor em execucao na porta 3000:
npm test
```

### Resultados da Suite:
- **Total de Testes:** 47
- **Suites Executadas:** 5 (`rest-conformance.test.js`, `account-email.test.js`, `account-phone.test.js`, `api.test.js`, `username-cooldown.test.js`)
- **Taxa de Sucesso:** 100% de aprovacao (47 testes aprovados, 0 falhas).

---

## 7. Declaracao de Uso de Ferramentas de IA

Ferramentas de Inteligencia Artificial Generativa foram utilizadas como instrumento de apoio ao desenvolvimento para auxilio na estruturacao modular das camadas de arquitetura, identificacao de salvaguardas de seguranca defensiva, parametrizacao de compressao de midia com Sharp e formatacao da especificacao formal OpenAPI 3.0.3. Toda a implementacao foi revisada, homologada e validada pela equipe tecnica responsavel.
