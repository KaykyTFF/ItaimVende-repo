# Roteiro Definitivo da Apresentacao (12 Slides — 5 Integrantes) — Itaim Vende API

Documento revisado e alinhado estritamente ao codigo-fonte atual do projeto e aos 13 requisitos da atividade **Projeto de API Propria** (Disciplina: Programacao para Internet II — IFPI Campus Paulistana — Prof. Me. Julian Rodrigues Valerio).

---

## Divisao Entre os 5 Integrantes

| Integrante | Slides | Eixo da Fala |
| :--- | :---: | :--- |
| **Integrante 1** | **1, 2 e 3** | Capa, problema regional, solucao e posicionamento/inovacao |
| **Integrante 2** | **4 e 5** | Arquitetura em camadas do backend, middlewares, autenticacao e seguranca |
| **Integrante 3** | **6 e 7** | Recursos e endpoints (`/api/v1`), principios REST, paginacao, filtros e ordenacao |
| **Integrante 4** | **8 e 9** | Regras de negocio alem do CRUD, banco PostgreSQL, Prisma ORM e persistencia |
| **Integrante 5** | **10, 11 e 12** | Testes automatizados, documentacao OpenAPI/Postman, demonstracao ao vivo e conclusao |

---

## PARTE 1: CONTEUDO DOS 12 SLIDES

---

### SLIDE 1 — Capa (Integrante 1)
**Titulo:** Itaim Vende API  
**Subtitulo:** API RESTful para Marketplace Regional no Semiarido Piauiense  
**Identificacao:** Instituto Federal do Piaui (IFPI) — Campus Paulistana | Programacao para Internet II | Prof. Me. Julian Rodrigues Valerio  
**Tecnologias:** Node.js (v24) | Express 5.2 | PostgreSQL (Supabase) | Prisma ORM 6.19 | Socket.IO 4.8 | Zod 4.6 | OpenAPI 3.0.3

---

### SLIDE 2 — Problema e Motivacao (Integrante 1)
**Topicos para o slide:**
- **Contexto observado pela equipe:** Pequenos produtores e lojistas de Paulistana e municipios vizinhos (Acaua, Betania do Piaui, Jacobina, Queimada Nova) divulgam produtos de forma dispersa em grupos de mensagens.
- **Dificuldades locais:**
  - Falta de catalogo estruturado por cidade, bairro e categoria.
  - Barreiras praticas de frete e comissoes para produtos locais e pereciveis.
- **Motivacao:** Criar uma API propria e vitrine regional para aproximar compradores e anunciantes locais com negociacao direta.

**Sugestao visual:** Fluxo simples em 3 etapas: `Produtor / Comerciante Local -> Catalogo Regional Itaim Vende -> Contato Direto (Chat / WhatsApp)`.

---

### SLIDE 3 — Solucao e Inovacao (Integrante 1)
**Como o marketplace funciona:**
- Vitrine regional focada em Paulistana e cidades do Vale do Itaim, com filtros por cidade e bairro.
- Negociacao direta por chat em tempo real (com contrapropostas formais) e link de contato via WhatsApp.
- Sem intermediacao financeira: a API nao integra gateway de pagamento nem cobra comissao sobre vendas.

**Comparativo (conforme `RELATORIO_INOVACAO.md`):**

| Criterio | Referencias Pesquisadas (Mercado Livre API / OLX) | Itaim Vende API |
| :--- | :--- | :--- |
| **Foco geografico** | Ampla escala nacional/estadual | Hiperlocal: municipios e bairros do Vale do Itaim |
| **Negociacao** | Foco em checkout integrado ou chat sem proposta formal | Propostas formais de valor no chat + contato WhatsApp |
| **Tempo real e offline** | Fluxos atrelados a portal ou apps proprios | Socket.IO + notificacao persistida e gatilho por e-mail para offline |
| **Busca regional** | Busca textual convencional | PostgreSQL `unaccent` para tolerar digitacao sem acentos |

**Eixos de inovacao adotados e onde aparecem nos endpoints:**
- **Dados e Dominio / Impacto Social:** `GET /api/v1/products` (`city`, `neighborhood`, `search` com `unaccent`).
- **Tempo Real e Eventos:** `POST /api/v1/chat/conversations/:id/messages` e `PATCH /api/v1/chat/messages/:id/status`.
- **Regra de Negocio:** `POST /api/v1/reviews/user/:userId`, `POST /api/v1/orders`, `DELETE /api/v1/reports/:id/product`.

---

### SLIDE 4 — Arquitetura do Backend (Integrante 2)
**Sugestao de diagrama (Fluxograma):**
```
[ Cliente HTTP ] ---> [ Middlewares Globais (server.js) ] ---> [ Routes (/api/v1) ]
                           |                                          |
                           | (Erro)                                   v (Middlewares de Rota)
                           v                                   [ Rate-limit / Auth / RBAC / Multer / Zod ]
                     [ errorHandler ] <----------------------------------+
                                                                         |
                                                                         v
[ PostgreSQL (Supabase) / Storage / Email ] <--- [ Prisma ORM / Adapters ] <--- [ Services ] <--- [ Controllers ]

[ Canal Complementar: Socket.IO Server (httpServer) ]
  - Handshake JWT proprio (io.use), salas user:<id> e conversation:<id> (separado do fluxo REST)
```

**Tabela — Componentes e Responsabilidades:**

| Componente | Onde Esta | Responsabilidade Real |
| :--- | :--- | :--- |
| **Middlewares Globais** | `server.js` | Executam em todas as requisicoes (ou `/api`): `helmet`, `cors`, `requestLogger`, `globalLimiter`, `json`/`urlencoded` (5MB) e `sanitizeInput`. |
| **Routes (`/api/v1`)** | `src/routes/*.routes.js` | Mapeiam endpoints e aplicam middlewares **especificos da rota** (limitadores por dominio, `authenticateToken`, `requireRole`, `multer`, `validate`). |
| **Controllers** | `src/controllers/` | Recebem `req`/`res`, extraem contexto (`req.user`, `params`, `query`, `body`) e acionam os services. |
| **Services** | `src/services/` | Executam regras de negocio, calculos, checagens de posse e chamadas ao Prisma ou adapters. |
| **Prisma ORM / Adapters** | `src/config/prisma.js`, `src/adapters/storage/` | Persistencia relacional no PostgreSQL e armazenamento em nuvem (Supabase Storage) com fallback local. |
| **errorHandler** | `src/middlewares/error.middleware.js` | Fluxo excepcional centralizado no fim do `app`: converte erros Zod, JWT, Prisma (`P2002`, `P2025`) e `AppError` em JSON padronizado. |
| **Socket.IO** | `src/sockets/socket.manager.js` | Canal complementar em tempo real acoplado ao `httpServer`, com autenticacao JWT propria no handshake (`io.use`). |

---

### SLIDE 5 — Autenticacao e Seguranca (Integrante 2)
**Fluxo de Autenticacao (Diagrama):**
```
POST /api/v1/auth/login -> Valida senha (bcrypt) -> Gera JWT (HS256, ENV.JWT_EXPIRES_IN)
Cliente envia: Authorization: Bearer <token>
  -> authenticateToken verifica assinatura e consulta status no banco:
     - Token ausente/invalido/expirado -> 401 UNAUTHORIZED / TOKEN_EXPIRED
     - Conta BANNED ou SUSPENDED       -> 403 ACCOUNT_SUSPENDED
     - Conta ACTIVE                    -> Injeta req.user e segue
```

**Autenticacao vs Autorizacao (o que o codigo realmente faz):**
- **Autenticacao (`authenticateToken`):** Confirma quem e o usuario pelo JWT e valida status ativo no banco.
- **Autorizacao por posse:** Usuarios comuns (`BUYER` e `SELLER`) compartilham as mesmas permissoes de rotas no backend — nao ha restricao de rota separando `BUYER` de `SELLER`. O controle ocorre por posse (`sellerId === req.user.id`, `targetId === req.user.id`).
- **Autorizacao por papel (`requireRole`):** `/api/v1/reports` (moderacao) aceita `ADMIN` e `MODERATOR`; `/api/v1/system` aceita apenas `ADMIN` *(com ressalva de bypass loopback `127.0.0.1` quando `NODE_ENV !== 'production'`)*.

**Tabela — Mecanismos de Seguranca Confirmados:**

| Mecanismo | Implementacao Real | Observacao / Ressalva |
| :--- | :--- | :--- |
| **JWT Bearer** | `jsonwebtoken` (`HS256`), padrao `2h` em `env.js` (`7d` no `.env` local) | Fallback de `JWT_SECRET` existe apenas fora de producao. |
| **Validacao Zod** | `validate.middleware.js` (`body`, `params`, `query`) | Retorna HTTP `400` (`code: VALIDATION_ERROR`, `message`, `detalhes`/`details`/`errors`). |
| **Rate Limiting** | `globalLimiter` (120 req/min prod), `authLimiter` (20/15min), `uploadLimiter` (30/15min) | Rotas `/account` possuem skip para header `x-test-runner`. |
| **Helmet & Sanitizacao** | `helmet` + `sanitizeInput` in-place | `helmet` roda com `contentSecurityPolicy: false` e `crossOriginResourcePolicy: false`. |

**Exemplo real de erro padronizado (Zod):**
```json
{
  "success": false,
  "code": "VALIDATION_ERROR",
  "message": "Falha na validação dos dados enviados.",
  "detalhes": [{ "field": "email", "message": "Invalid input: expected string, received undefined" }]
}
```

---

### SLIDE 6 — Recursos e Endpoints da API (Integrante 3)
**Visao Geral Quantitativa (verificada em `backend/src/server.js` e `backend/src/routes/`):**
- **122 endpoints da API** registrados sob `/api/v1/` (tambem acessiveis via alias `/api`):
  - Distribuidos em **14 modulos especializados** + **2 rotas na raiz do roteador `/api/v1`** (`GET /health` e `GET /usernames/availability`).
- **4 caminhos adicionais de documentacao Swagger/OpenAPI** (fora da contagem dos 122 endpoints da API): `/api/v1/docs`, `/api-docs`, `/api/v1/docs/openapi.json` e `/api-docs/openapi.json`.

**Tabela — Modulos e Exemplos Reais de Endpoints:**

| Modulo | Qtd. Rotas | Exemplos Reais de Rotas (`/api/v1/...`) |
| :--- | :-: | :--- |
| `auth` e `account` | 18 + 17 | `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, `PATCH /account/username`, `GET /account/privacy/export` |
| `products` e `categories` | 9 + 1 | `GET /products`, `POST /products`, `PATCH /products/:id/status`, `DELETE /products/:id`, `GET /categories` |
| `reviews` e `users` | 6 + 3 | `GET /reviews/user/:userId`, `POST /reviews/user/:userId`, `POST /reviews/:id/replies`, `GET /users/:id` |
| `chat` e `notifications` | 11 + 7 | `POST /chat/conversations`, `POST /chat/conversations/:id/messages`, `PATCH /chat/messages/:id/status`, `GET /notifications` |
| `favorites`, `orders`, `addresses` | 7 + 3 + 6 | `PUT/DELETE /favorites/:productId`, `POST /orders`, `GET /addresses`, `PATCH /addresses/:id/primary` |
| `reports`, `upload`, `system` | 10 + 9 + 13 | `POST /reports/:productId`, `DELETE /reports/:id/product`, `POST /upload/vendas`, `GET /system/status` |
| Raiz `v1Router` | 2 | `GET /api/v1/health`, `GET /api/v1/usernames/availability` |

---

### SLIDE 7 — Principios REST e Comunicacao HTTP (Integrante 3)
**Tabela — Principios REST vs Implementacao Real:**

| Principio / Criterio REST | Situacao no Projeto | Evidencia Real no Codigo |
| :--- | :--- | :--- |
| **Cliente-Servidor** | Aplicado | Backend Express serve JSON sob `/api/v1`; frontend estatico consome via `fetch` (`api-*.js`). |
| **Stateless** | Aplicado no REST | Nenhuma sessao HTTP guardada no servidor; toda requisicao autenticada envia `Bearer <JWT>`. |
| **Cacheable** | Aplicado em `/categories` | `category.controller.js:6` define `Cache-Control: public, max-age=300`. |
| **Interface Uniforme** | Parcialmente aplicado | Respostas JSON padronizadas e verbos semanticos; porem coexistem rotas com verbos (`/auth/login`, `/favorites/:id/toggle`, `/system/data/*/:id/toggle`). |
| **Arquitetura em Camadas** | Aplicado | Fluxo isolado entre middlewares globais, roteadores, controllers, services e Prisma ORM. |
| **Versionamento** | Aplicado | Prefixo oficial `/api/v1/` em todas as rotas da API. |
| **Verbos e Status HTTP** | Aplicado | `GET`, `POST`, `PUT`, `PATCH`, `DELETE`; codigos `200`, `201`, `204`, `400`, `401`, `403`, `404` e `409` confirmados no codigo. |

**Exemplo real de Paginacao, Filtros e Ordenacao (`GET /api/v1/products`):**
- **Parametros reais suportados em `product.query.service.js`:**
  - **Paginacao:** `page` (padrao `1`), `limit` (padrao `24`, maximo `50`) -> retorna `pagination: { total, page, limit, totalPages }`.
  - **Filtros:** `search`, `category`, `categoryId`, `city` (ou `cidade`), `neighborhood` (ou `bairro`), `minPrice`, `maxPrice`, `condition`.
  - **Ordenacao (`sort`):** `newest` (padrao), `oldest`, `price_asc`, `price_desc`, `popular`.
- **Requisicao de exemplo:** `GET /api/v1/products?city=Paulistana&condition=NOVO&minPrice=100&sort=price_asc&page=1&limit=12`

---

### SLIDE 8 — Regras de Negocio e Inovacao (Integrante 4)
**Funcionalidades alem do CRUD implementadas nos services:**

1. **Avaliacoes e Reputacao (Diferencial de confianca sem pagamento online):**
   - `POST /api/v1/reviews/user/:userId`: identifica o autor pelo JWT (`req.user.id`), impede autoavaliacao (`400`) e checa duplicidade no service via `findFirst` *(sem `@@unique` fisico no banco)*.
   - Em `createReview`, `updateReview` e `deleteReview`, `prisma.$transaction` agrupa: gravacao/edicao/exclusao em `Review` -> consulta de todas as notas do vendedor -> calculo da media -> atualizacao de `ratingAverage` e `ratingCount` em `User`.
2. **Pedidos com Integridade no Servidor (`POST /api/v1/orders`):**
   - Cliente envia apenas IDs e quantidades; `order.creation.service.js` busca os precos vigentes no PostgreSQL e calcula `totalAmount` dentro de `prisma.$transaction` (sem cobrar comissao).
3. **Chat com Propostas, Notificacoes e E-mail Offline (Eixo Tempo Real e Inovacao):**
   - `POST /api/v1/chat/conversations/:id/messages` persiste mensagens/`OFFER_PROPOSAL`, atualiza `lastMessageAt` em `$transaction` e emite via Socket.IO; `PATCH /api/v1/chat/messages/:id/status` trata aceite/recusa impedindo aceitar a propria proposta.
   - Eventos mapeados (chat/propostas, favoritos, nova avaliacao, pedidos, moderacao e mudancas de conta) gravam em `Notification`. Se destinatario offline (`!isUserOnline`), dispara e-mail via Resend/SMTP *(ou log simulado no terminal sem chave configurada no `.env`)*.
4. **Moderacao e Anuncios com Limpeza no Storage:**
   - Criacao de anuncio resolve categoria por nome/slug/`orderIndex` e gera slug unico; `DELETE /api/v1/reports/:id/product` (`ADMIN`/`MODERATOR`) marca anuncio como `REJEITADO`, apaga `ProductImage` e remove os arquivos no Supabase Storage.
5. **Favoritos com Cooldown Anti-Spam (`PUT`/`DELETE`/`toggle`):**
   - Alterna registro em `prisma.$transaction` atualizando `favoritesCount` em `Product`, com janela de 1 hora para evitar notificacoes repetidas ao vendedor.

**Sugestao de fluxograma (para Avaliacao / Reputacao):**
`POST /reviews/user/:id (JWT) -> Checa autoavaliacao e findFirst -> prisma.$transaction [Grava Review -> Le notas -> Recalcula media -> Atualiza User] -> 201 Created`

---

### SLIDE 9 — Banco de Dados e Persistencia (Integrante 4)
**Tecnologia e Entidades (`backend/prisma/schema.prisma`):**
- **SGBD:** PostgreSQL hospedado no Supabase (com extensao `unaccent` ativa no boot para buscas sem acentos).
- **ORM:** Prisma Client `6.19.3`.
- **Principais Modelos e Relacionamentos:**
  - `User` 1:N `Product` (`sellerId`, `onDelete: Cascade`), com campos regionais (`city`, `state`, `neighborhood`).
  - `User` 1:N `Review` em relacao dupla (`authorId` e `targetId`, sem `@@unique([authorId, targetId])`).
  - `Conversation` (uniqueness `[productId, buyerId, sellerId]`) 1:N `Message` (`offerValue`, `offerStatus`).
  - `Order` 1:N `OrderItem` N:1 `Product`; `Favorite` (`@@unique([userId, productId])`); `Report`; `Notification`; `Category`; `Address`; `AuditLog`.
- **Uso real de `$transaction`:** Aplicado em operacoes especificas que envolvem multiplas tabelas/contadores (avaliacoes, pedidos, chat/propostas, favoritos, enderecos e alteracoes de conta), nao em todo o sistema.
- **Estrategia de Sincronizacao e Pendencia do Edital:**
  - O projeto utiliza `schema.prisma` aplicado com `npm run prisma:push` (`prisma db push`), script `backend/scripts/setup-unaccent.js` (indices + `unaccent`) e `backend/prisma/seed.js`.
  - **Pendencia transparente:** Nao existem arquivos na pasta `backend/prisma/migrations/` nem script SQL `CREATE TABLE` completo separado.

---

### SLIDE 10 — Testes e Documentacao (Integrante 5)
**Tabela — Resumo Real de Testes (`node --test`) e Documentacao:**

| Artefato / Suite | Quantidade / Padrao | Condicao de Execucao / Observacao |
| :--- | :--- | :--- |
| **Testes Unitarios** (`tests/unit/*.test.js`) | **82 testes** em 31 suites (6 arquivos) | Executam offline (`npm run test:unit`) sem servidor HTTP; 82 aprovados. |
| **Testes de Integracao** (`tests/*.test.js`) | **68 testes** em 7 arquivos | 10 (`reviews-e2e.test.js`) acessam o Prisma direto; 58 exigem **servidor HTTP ativo em `localhost:3000`** + PostgreSQL conectado. |
| **Total Consolidado** | **150 testes** em 38 suites | **150/150 aprovados** quando executados com servidor local ativo e banco acessivel (`ECONNREFUSED` nos 58 HTTP se servidor desligado). |
| **OpenAPI / Swagger** | OpenAPI `3.0.3` (`v2.0.0`) | `backend/src/docs/openapi.js` e `openapi.json`; Swagger UI em `/api/v1/docs` e `/api-docs`. |
| **Colecao Postman** | **11 pastas / 47 requisicoes** | `itaim-vende.postman_collection.json` na raiz, com casos de sucesso e erro. |
| **README.md** | Completo | Contem instalacao, variaveis de ambiente (`.env`), comandos e declaracao de uso de IA (Secao 19). |

---

### SLIDE 11 — Demonstracao Pratica (Integrante 5)
**Roteiro objetivo ao vivo (7 passos usando endpoints reais):**
1. **Consulta de anuncios (com filtro regional e paginacao):**
   `GET /api/v1/products?city=Paulistana&page=1&limit=5&sort=newest` -> `200 OK`
2. **Login com conta de teste:**
   `POST /api/v1/auth/login` (`{ "email": "...", "password": "..." }`) -> `200 OK`
3. **Obtencao do JWT:**
   Copiar o valor do campo `token` retornado no corpo JSON da resposta de login.
4. **Acesso a rota protegida com Bearer Token:**
   `GET /api/v1/auth/me` com header `Authorization: Bearer <token>` -> `200 OK` *(e `401` sem token)*.
5. **Criacao de anuncio:**
   `POST /api/v1/products` com `Authorization: Bearer <token>` e payload validado por Zod (`title`, `description`, `price`, `condition`, `city`) -> `201 Created`.
6. **Funcionalidade com regra de negocio:**
   `POST /api/v1/reviews/user/:userId` com conta compradora -> grava avaliacao e recalcula `ratingAverage` e `ratingCount` do vendedor via `prisma.$transaction` (ou `GET /api/v1/reports` com token `BUYER` retornando `403 Forbidden`).
7. **Consulta da documentacao Swagger:**
   Abrir `http://localhost:3000/api/v1/docs` mostrando a especificacao OpenAPI `3.0.3` e testar um endpoint pela interface.

---

### SLIDE 12 — Conclusao (Integrante 5)
- **Problema e Solucao:** Entregamos uma API RESTful orientada ao comercio regional de Paulistana e Vale do Itaim, conectando compradores e vendedores sem cobranca de comissao nem intermediacao de pagamento.
- **Arquitetura e Resultados Alcançados:**
  - Arquitetura em camadas no Express 5, Prisma ORM e PostgreSQL (Supabase), com canal complementar Socket.IO e Supabase Storage.
  - **122 endpoints** sob `/api/v1/` (14 modulos + 2 rotas na raiz), **150 testes automatizados** (`82 unitarios + 68 de integracao`), Swagger OpenAPI `3.0.3` e colecao Postman com 47 requisicoes.
- **Visao Critica e Evolucoes Futuras:** Reconhecemos com transparencia pontos de amadurecimento identificados no codigo (criacao de `migrations/` versionadas, indice `@@unique` em `Review`, remocao de credenciais/bypasses de desenvolvimento em `login-painel.js`/`system.routes.js` e reducao gradual de rotas com verbos nas URIs).

---

## PARTE 2: ROTEIRO DE APRESENTACAO ORAL (DIVISAO ENTRE OS 5 INTEGRANTES)

### Integrante 1 (Slides 1, 2 e 3)
- **Slide 1:** "Bom dia, professor Julian e colegas. Hoje vamos apresentar o projeto **Itaim Vende API**, desenvolvido para a disciplina de Programacao para Internet II no IFPI Campus Paulistana. Construimos uma API RESTful original voltada a um marketplace regional, usando Node.js, Express 5, PostgreSQL com Prisma ORM, Socket.IO, Zod e OpenAPI 3.0.3."
- **Slide 2:** "O projeto nasceu de um contexto observado pela nossa equipe aqui em Paulistana e cidades vizinhas como Acaua, Betania, Jacobina e Queimada Nova: muitos produtores rurais e pequenos comerciantes divulgam suas ofertas em grupos informais de mensagens, onde os anuncios se perdem e nao ha busca organizada por cidade ou bairro. Nossa motivacao foi oferecer um catalogo estruturado e um canal direto para aproximar compradores e vendedores da regiao, sem impor frete nem reter pagamentos."
- **Slide 3:** "Comparado a referencia de grandes plataformas que analisamos no nosso relatorio de inovacao — Mercado Livre e OLX — o Itaim Vende foca na escala hiperlocal do Vale do Itaim. Nosso diferencial aparece diretamente nos endpoints: em `GET /api/v1/products`, suportamos filtros especificos por cidade e bairro com normalizacao `unaccent`; no chat, permitimos contrapropostas formais com notificacoes persistidas e gatilho por e-mail para usuarios offline; e nas avaliacoes calculamos a reputacao no banco sem depender de pagamento online. Passo agora a palavra para o **[Integrante 2]**, que vai detalhar a arquitetura do backend e a seguranca."

### Integrante 2 (Slides 4 e 5)
- **Slide 4:** "Obrigado, **[Integrante 1]**. Este diagrama mostra o fluxo real do nosso backend em `server.js`. Toda requisicao passa primeiro pelos middlewares globais — Helmet, CORS, logger de requisicoes, limitador global em `/api`, parser JSON de 5MB e `sanitizeInput`. Em seguida, o roteador `/api/v1` direciona para a rota correspondente, onde atuam os middlewares especificos daquele endpoint (como limitadores de rota, autenticacao JWT, RBAC com `requireRole`, Multer para imagens e validacao Zod). Só entao o Controller aciona o Service e o Prisma ORM para acessar o PostgreSQL ou o Supabase Storage. Qualquer excecao propagada com `next(err)` cai no `errorHandler` ao final da aplicacao. Em paralelo, o Socket.IO opera no mesmo servidor HTTP como um canal complementar em tempo real, com handshake JWT proprio e separado do fluxo REST stateless."
- **Slide 5:** "Na camada de seguranca, diferenciamos bem autenticacao de autorizacao. No login em `POST /api/v1/auth/login`, a senha e comparada com `bcrypt` e emitimos um token JWT assinado com `HS256` (validade configuravel via `JWT_EXPIRES_IN`, com padrao de 2 horas em `env.js`). Nas rotas protegidas, `authenticateToken` valida o token e confirma no PostgreSQL se a conta nao esta banida ou suspensa. Ja na autorizacao, `BUYER` e `SELLER` compartilham o mesmo nivel de acesso as rotas comuns mediante checagem de posse do dado; o RBAC por papel atua especificamente na area administrativa: `/api/v1/reports` exige `ADMIN` ou `MODERATOR`, e `/api/v1/system` exige apenas `ADMIN`. Tambem protegemos entradas com Zod e rate limiting, reconhecendo com transparencia pontos de melhoria de dev mapeados em auditoria, como credenciais de desenvolvimento em `login-painel.js` e o bypass de loopback em `/system` fora de producao. Passo agora para o **[Integrante 3]**."

### Integrante 3 (Slides 6 e 7)
- **Slide 6:** "Obrigado, **[Integrante 2]**. No nosso levantamento direto do codigo, a API possui **122 endpoints registrados** sob o prefixo `/api/v1/`, distribuidos em **14 modulos especializados** — incluindo `auth`, `account`, `products`, `categories`, `reviews`, `chat`, `notifications`, `favorites`, `orders`, `addresses`, `reports`, `upload`, `system` e `users` — mais **2 rotas na raiz** do roteador (`/health` e `/usernames/availability`). Separadamente disso, temos **4 caminhos para documentacao Swagger/OpenAPI**: `/api/v1/docs`, `/api-docs`, `/api/v1/docs/openapi.json` e `/api-docs/openapi.json`."
- **Slide 7:** "Nesta tabela relacionamos cada principio REST a sua implementacao real. Somos cliente-servidor e stateless no REST; aplicamos o principio `Cacheable` na rota `GET /api/v1/categories`, que responde com o cabecalho `Cache-Control: public, max-age=300`; usamos todos os verbos semanticos e os codigos de status 200, 201, 204, 400, 401, 403, 404 e 409. Sobre a nomenclatura das URIs, os recursos centrais usam substantivos no plural, mas reconhecemos um desvio parcial onde endpoints com verbos como `/auth/login`, `/favorites/:productId/toggle` e `/system/data/*/:id/toggle` foram mantidos por serem consumidos pelo frontend. Por fim, na coleta de produtos, `GET /api/v1/products` implementa paginacao (`page`, `limit`), filtros (`city`, `neighborhood`, `category`, `condition`, `minPrice`, `maxPrice`, `search`) e ordenacao (`sort=newest|oldest|price_asc|price_desc|popular`). Passo a palavra para o **[Integrante 4]**."

### Integrante 4 (Slides 8 e 9)
- **Slide 8:** "Obrigado, **[Integrante 3]**. Para atender ao requisito de regras alem do CRUD, selecionamos nossos fluxos principais. Nas avaliacoes (`POST /api/v1/reviews/user/:userId`), o autor vem exclusivamente do JWT, bloqueamos autoavaliacao e verificamos duplicidade via `findFirst` no service; dentro de `prisma.$transaction`, gravamos a avaliacao, consultamos todas as notas do vendedor e recalculamos `ratingAverage` e `ratingCount` na tabela `User`. Em `POST /api/v1/orders`, o servidor ignora precos do cliente e recalcula o total diretamente do banco dentro de uma transacao. No chat e favoritos, atualizamos contadores e propostas atomicamente, com janela de 1 hora contra spam de notificacoes de favoritos e gatilho por e-mail quando o destinatario esta offline (via Resend/SMTP, ou log simulado no terminal sem chave configurada). Na moderacao, `DELETE /api/v1/reports/:id/product` marca o anuncio como `REJEITADO` e remove as imagens no Supabase Storage."
- **Slide 9:** "Na persistencia, usamos PostgreSQL hospedado no Supabase e Prisma ORM 6.19.3. O `schema.prisma` modela usuarios, produtos localizados por cidade e bairro, relacionamentos duplos de `Review`, conversas, mensagens com `offerValue` e `offerStatus`, pedidos, favoritos e tickets de denuncia. Usamos `prisma.$transaction` nas operacoes criticas que coordenam multiplas tabelas, embora nem toda rotina do sistema seja transacional. Como estrategia de sincronizacao, utilizamos `prisma db push` junto ao script `setup-unaccent.js` e `seed.js` — registrando com transparencia a pendencia de ainda nao termos uma pasta `migrations/` versionadas nem script SQL de criacao completo. Agora passo para o **[Integrante 5]**."

### Integrante 5 (Slides 10, 11 e 12)
- **Slide 10:** "Obrigado, **[Integrante 4]**. Na parte de qualidade e documentacao, entregamos o Swagger UI em `/api/v1/docs` com OpenAPI 3.0.3, `README.md` com instrucoes e declaracao de uso de IA, e colecao Postman com 11 pastas e 47 requisicoes. Nos testes automatizados com `node:test`, temos **150 testes** no total: **82 unitarios**, que rodam offline sem servidor, e **68 de integracao** — sendo 10 em `reviews-e2e.test.js` direto no Prisma e 58 testes HTTP que exigem o servidor ativo na porta 3000 e conexao com o PostgreSQL. Com o servidor ligado, todos os 150 testes passam."
- **Slide 11:** "Para demonstracao pratica agora ao vivo, seguiremos sete passos diretos com o servidor conectado: consultar `GET /api/v1/products` com filtro regional; fazer login em `POST /api/v1/auth/login`; extrair o token JWT da resposta; acessar a rota protegida `GET /api/v1/auth/me` com Bearer Token; publicar um anuncio em `POST /api/v1/products`; demonstrar uma regra de negocio nao-CRUD com avaliacao/reputacao (ou bloqueio `403` em `/reports`); e abrir o Swagger UI em `/api/v1/docs`."
- **Slide 12:** "Concluimos mostrando que a Itaim Vende API resolve uma necessidade regional concreta em Paulistana e microrregiao, com arquitetura em camadas organizada, 122 endpoints sob `/api/v1/`, documentacao OpenAPI e 150 testes automatizados. Tambem mapeamos com rigor tecnico o que ainda precisa evoluir — como migrations versionadas no Prisma, restricao unica em `Review` no banco, ajustes de seguranca para ambiente produtivo e padronizacao das poucas URIs com verbos. Muito obrigado ao professor Julian e colegas; estamos prontos para a arguicao."
