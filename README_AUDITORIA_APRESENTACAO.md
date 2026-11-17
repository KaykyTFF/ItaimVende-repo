# Auditoria Técnica Completa — Validação do Roteiro de Apresentação (Itaim Vende)

**Data da Auditoria:** 17/11/2026  
**Escopo:** Código-fonte (`backend/` e `frontend/`), `backend/prisma/schema.prisma`, suítes de testes automatizados (`backend/tests/`), documentação OpenAPI, coleção Postman e roteiro de apresentação ([slides-e-roteiro-5-integrantes.md](docs/apresentacao/slides-e-roteiro-5-integrantes.md) e [documentacao-tecnica-apresentacao.md](docs/apresentacao/documentacao-tecnica-apresentacao.md)).  
**Padrão de Classificação:** `CONFIRMADO`, `PARCIAL`, `NÃO IMPLEMENTADO`, `NÃO VERIFICADO`, `INCORRETO`.

---

## 1. Objetivo da Auditoria

Este documento valida tecnicamente todas as afirmações, tecnologias, números, fluxos de segurança, rotas, regras de negócio e métricas de qualidade contidas no roteiro de apresentação de 12 slides da equipe do **Itaim Vende**, confrontando-as diretamente com a implementação real do código-fonte e com execuções práticas controladas no ambiente local.

O foco desta auditoria é garantir transparência e rigor técnico na defesa perante a banca da disciplina, separando o que está plenamente implementado e testado do que é parcial, não verificado ou divergente no roteiro.

---

## 2. Ambiente Analisado

### 2.1 Runtime e Ferramentas
- **Node.js:** `v24.15.0` (ES Modules `"type": "module"`)
- **npm:** `11.12.1`
- **Runner de Testes:** Nativo `node --test` (`node:test` + `node:assert/strict`)

### 2.2 Dependências Principais (`backend/package.json`)
- **Express.js:** `^5.2.1`
- **Prisma Client & CLI:** `^6.19.3`
- **PostgreSQL (Supabase):** Hospedado externamente via `DATABASE_URL` / `DIRECT_URL` (conexão validada em boot)
- **Supabase JS SDK:** `^2.118.0` (`@supabase/supabase-js`)
- **Socket.IO:** `^4.8.4`
- **Zod:** `^4.6.5`
- **JSON Web Token:** `^9.0.3` (`jsonwebtoken`)
- **bcryptjs:** `^3.0.3`
- **Helmet:** `^8.3.0`
- **CORS:** `^2.8.6`
- **Express Rate Limit:** `^8.7.1`
- **Multer:** `^2.4.0`
- **Sharp:** `^0.35.5`
- **Resend:** `^6.34.1` e **Nodemailer:** `^10.2.1`
- **Swagger UI Express:** `^5.0.1`

### 2.3 Estrutura do Projeto
- **`backend/`**: API RESTful em camadas (`src/routes/`, `src/middlewares/`, `src/controllers/`, `src/services/`, `src/schemas/`, `src/adapters/storage/`, `src/sockets/`, `src/docs/`, `prisma/`, `tests/`).
- **`frontend/`**: Interface estática modular em HTML5/CSS3/Vanilla JS (`pages/`, `js/core/`, `js/pages/`).
- **`docs/`**: Documentação de engenharia de testes (`docs/testes/`) e materiais da apresentação (`docs/apresentacao/`).
- **Raiz**: `README.md`, `RELATORIO_INOVACAO.md`, `itaim-vende.postman_collection.json`, `package.json`, `scripts/`.

---

## 3. Resultado Geral

O projeto possui uma base backend e frontend robusta, modular e funcional, com conexão real ao PostgreSQL (Supabase), Supabase Storage ativo, WebSockets inicializados e **150 testes automatizados passando (100%) quando o servidor local está em execução**.

Entretanto, a auditoria identificou **divergências concretas** entre o roteiro dos slides e o código real que devem ser ajustadas antes da apresentação:
1. **Quantidade de módulos da API:** Existem **14 módulos** registrados via `v1Router.use(...)` (o roteiro listou 13 nomes deixando `/account` de fora da lista textual, embora o módulo exista com 17 rotas).
2. **Tempo de validade do JWT:** O roteiro afirma `24h`, mas o código define padrão de `2h` (`backend/src/config/env.js`) e o `.env` local de desenvolvimento define `7d`.
3. **Diferenciação RBAC entre `BUYER` e `SELLER`:** No backend, não há bloqueio de rota por `requireRole('SELLER')`; qualquer usuário autenticado (`BUYER` ou `SELLER`) pode publicar anúncios (`POST /api/v1/products`) e responder avaliações no próprio perfil. A segregação real por papel no backend ocorre apenas entre usuários comuns e `ADMIN`/`MODERATOR`.
4. **Nomenclatura REST (zero verbos na URI):** Embora os recursos principais usem substantivos no plural, há diversos endpoints de compatibilidade e ação com verbos na URI (ex.: `/login`, `/register`, `/toggle`, `/accept`, `/reject`, `/read-all`, `/contact`).
5. **Segurança administrativa e de desenvolvimento:** Existem credenciais hardcoded em JavaScript client-side (`frontend/js/pages/admin/login-painel.js`), um bypass de loopback para `127.0.0.1` em modo `development` na rota `/api/v1/system/*` (`system.routes.js`), CSP desabilitado no `helmet` e bypass de rate-limit via cabeçalho `x-test-runner` em `/account`.
6. **Rastreamento de contatos (`/products/:id/contact`):** O endpoint existe no backend e incrementa o contador numérico `contactsCount` no produto, porém **nenhum arquivo de página no frontend invoca essa função** (`registrarContato` está definido em `api-produtos.js`, mas sem chamadas na UI) e não há tabela individual de leads.
7. **Compartilhamento WhatsApp:** Inclui título, preço/doação, URL canônica e assinatura regional, mas **não inclui cidade/bairro na mensagem do popover** (a localização dinâmica aparece apenas nas tags Open Graph/Twitter injetadas por `server.js`).
8. **Envio de e-mails offline no ambiente atual:** A infraestrutura de e-mail (Resend + Nodemailer + fallback) está implementada, porém `RESEND_API_KEY` e `SMTP_HOST` não estão configurados no `.env` local; logo, o disparo real para caixas externas não foi verificado (executa em modo simulado no terminal).
9. **Migrações Prisma:** O projeto não possui pasta `backend/prisma/migrations/`; utiliza `prisma db push` (`npm run prisma:push`) e scripts SQL diretos (`setup-unaccent.js`).
10. **Módulo `orders` vs discurso "sem intermediação":** Apesar da proposta de vitrine sem intermediação financeira/logística, o sistema implementa `/api/v1/orders` e os modelos `Order`/`OrderItem` com `shippingAddress` e enum `OrderStatus` contendo `SHIPPED`/`DELIVERED`, calculando totais no servidor sem cobrança de comissão.
11. **Contagem de testes:** Em versões anteriores do roteiro constavam 92 testes; após a auditoria constatou-se que o repositório contém **150 testes** (82 unitários + 68 integração/E2E), todos passando quando o servidor está ativo.

---

## 4. Auditoria dos 12 Slides

| Slide | Afirmação no Roteiro | Status | Evidência Encontrada | Ajuste Recomendado |
| :-: | :--- | :---: | :--- | :--- |
| **1** | Stack: Node.js, Express 5, PostgreSQL, Prisma ORM, Socket.IO, OpenAPI 3.0 | **CONFIRMADO** | `backend/package.json` (`express ^5.2.1`, `@prisma/client ^6.19.3`, `socket.io ^4.8.4`), `backend/src/docs/openapi.js` (`openapi: '3.0.3'`). | Manter. |
| **2** | Vitrine regional sem cobrança de comissão sobre vendas e sem intermediação financeira | **PARCIAL** | Não há cálculo de comissão nem gateway de pagamento em `backend/src/`. Contudo, existe o módulo `/api/v1/orders` e modelos `Order`/`OrderItem` com `shippingAddress` e status `SHIPPED`/`DELIVERED` (`schema.prisma:307-347`, `order.creation.service.js`). | Esclarecer que não há retenção financeira, gateway de pagamento ou taxa/comissão, mesmo existindo entidade `Order` para formalização/registro. |
| **2 e 3** | Filtros e localização por cidade e bairro do semiárido piauiense | **CONFIRMADO** | `product.query.service.js:32-92, 189-215` implementa `expandirVariantesCidade` (Paulistana, Acauã, Betânia, Jacobina, Queimada Nova, etc.) e filtro por `neighborhood`/`bairro`. | Manter. |
| **3** | Comparativo com Mercado Livre / OLX (alcance, taxas, reputação e conectividade) | **PARCIAL** | Os diferenciais técnicos do Itaim Vende (filtros locais, ausência de taxas, reputação sem gateway pago, Socket.IO + fallback e-mail) existem no código; porém afirmações sobre limitações gerais de concorrentes são premissas de negócio/mercado descritas em `RELATORIO_INOVACAO.md`, não testadas por código. | Apresentar as comparações com ML/OLX explicitamente como posicionamento de modelo de negócio, evitando afirmações absolutas sobre funcionamento interno dos concorrentes. |
| **4** | Arquitetura em camadas (`Middlewares -> Rotas -> Controllers -> Services -> Prisma -> PostgreSQL/Storage/Socket.IO`) | **CONFIRMADO** | `backend/src/server.js`, `middlewares/`, `routes/`, `controllers/`, `services/`, `adapters/storage/`, `sockets/socket.manager.js`. | Manter. |
| **4** | Helmet, CORS, Rate-Limit, Sanitize Input e Zod | **CONFIRMADO** | Ativos em `server.js:49-82` e `validate.middleware.js`. Ressalva: `helmet` roda com `contentSecurityPolicy: false` (`server.js:49`) e `/account` possui skip de rate limit para header `x-test-runner` (`account.routes.js:39`). | Citar corretamente que `helmet` está configurado com CSP desabilitado para servir scripts/imagens do frontend no mesmo host. |
| **4** | Princípios REST e `Cache-Control` | **CONFIRMADO** | `category.controller.js:6` define `res.set('Cache-Control', 'public, max-age=300')`, verificado ao vivo na auditoria (`status 200`, header presente). Servidor stateless com JWT. | Manter. |
| **5** | Token JWT assinado em HS256 com validade de `24h` | **INCORRETO** | `jsonwebtoken` usa `HS256` por padrão (`auth.identity.service.js:105-108`), mas `ENV.JWT_EXPIRES_IN` tem padrão `'2h'` em `env.js:55` e `.env.example:11`, e `'7d'` no `.env` local. Não há `'24h'` em nenhum arquivo. | Substituir `"24h"` por `"configurável via JWT_EXPIRES_IN (padrão 2h / 7d em dev)"`. |
| **5** | Separação RBAC entre `BUYER` e `SELLER` (apenas `SELLER` publica anúncios e responde avaliações) | **INCORRETO** | Não existe `requireRole('SELLER')` em nenhuma rota (`product.routes.js:29`, `review.routes.js:26`). Qualquer usuário autenticado (inclusive `BUYER`) pode criar anúncio e responder avaliação feita ao seu próprio `targetId` (`review.reply.service.js:21`). | Corrigir o slide: a separação real no backend é entre **Usuário Autenticado** (com checagem de posse do recurso) e **ADMIN/MODERATOR** (`requireRole`). |
| **5** | Login admin isolado em `/login-painel`, guarda frontend (`protegerPagina`) e bloqueio `403 Forbidden` | **PARCIAL** | `protegerPagina()` (`sessao-ui.js:445`) e guarda em `painel.html:57` existem; `/api/v1/reports` bloqueia com `403` para `BUYER` (`requireRole`). Porém `login-painel.js:28-79, 235-259` valida senhas hardcoded em JS no cliente e `system.routes.js:35-44` permite acesso `ADMIN` via loopback `127.0.0.1` sem token em `development`. | Informar que há proteção RBAC real no backend em produção/rede externa, mas não afirmar isolamento criptográfico completo em dev devido às credenciais client-side e bypass loopback. |
| **6** | Clean URLs no frontend sem `.html` | **CONFIRMADO** | `frontend/js/core/rotas/rotas-mapa.js` e `server.js:291-405` (`FRONTEND_PAGES_MAP` e roteador universal) servem páginas como `/home`, `/vender`, `/conversas`, `/painel`. | Manter. |
| **6** | Backend com 14 módulos sob `/api/v1/` | **PARCIAL** | Há exatamente **14 módulos** montados em `server.js:256-270` (`auth`, `account`, `products`, `categories`, `orders`, `chat`, `favorites`, `upload`, `reviews`, `reports`, `system`, `addresses`, `notifications`, `users`), além de `/health` e `/usernames/availability`. O slide listava apenas 13 nomes (omitia `/account`). | Incluir `/account` explicitamente na lista dos 14 módulos do Slide 6. |
| **6 e 7** | Todas as URIs usam substantivos no plural, minúsculo e nenhum verbo na URI | **PARCIAL** | Os 9 recursos principais canônicos seguem o padrão; porém módulos usam singular (`/auth`, `/account`, `/chat`, `/upload`, `/system`) e várias rotas legadas/ações contêm verbos (`/login`, `/register`, `/toggle`, `/accept`, `/reject`, `/read-all`, `/contact`, etc.). | Ajustar a fala para: "recursos principais modelados com substantivos no plural sem verbos, mantendo rotas de ação/compatibilidade". |
| **7** | Verbos (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`), Status (`200`, `201`, `204`, `400`, `401`, `403`, `404`, `409`) e erros Zod | **CONFIRMADO** | Todos os verbos e status constam em `routes/`, `controllers/`, `error.middleware.js` e `validate.middleware.js`. Nota: o JSON real do `validate.middleware.js:16-23` retorna `message: "Falha na validação dos dados enviados."` (não a string customizada exemplificada no slide). | Atualizar o exemplo de JSON do Slide 7 para o formato real de `validate.middleware.js`. |
| **8** | Reputação atômica (`prisma.$transaction`) em `POST /api/v1/reviews/user/:userId` | **CONFIRMADO** | `review.mutation.service.js:54-93` usa `prisma.$transaction` agrupando criação, busca de notas, cálculo da média e update de `ratingAverage`/`ratingCount` no `User`, impedindo autoavaliação (linha 38) e duplicidade via `findFirst` (linhas 43-52). | Manter (notando que unicidade é validada na aplicação, não por índice `@@unique` no schema). |
| **8** | Contrapropostas no chat via Socket.IO + alerta offline por e-mail | **PARCIAL** | Socket.IO (`socket.manager.js`), `OFFER_PROPOSAL`, aceite/recusa (`message.service.js:233-340`), `isUserOnline(recipientId)` e disparo de `enviarEmailNovaMensagem` estão implementados (`message.service.js:174-191`). Porém, no `.env` local `RESEND_API_KEY` e `SMTP_HOST` não estão configurados, operando em simulação no terminal (`email.service.js:72-86`). | Explicar que o envio externo depende de `RESEND_API_KEY`/`SMTP` configurados; sem chave, opera em fallback simulado no console. |
| **8** | Compartilhamento WhatsApp e rastreio de leads em `/products/:id/contact` | **PARCIAL** | Botão WhatsApp e popover de compartilhamento funcionam no frontend (`produto-acoes.js:205-359`) e `POST /api/v1/products/:id/contact` existe no backend incrementando `contactsCount` (`product.mutation.service.js:418-430`). Porém a UI nunca chama `registrarContato()`, a mensagem de compartilhamento não contém localização dinâmica e não há tabela de leads individuais. | Remover a afirmação de que a interface contabiliza leads automaticamente ao compartilhar no WhatsApp (ou citar apenas o endpoint existente no backend). |
| **8** | Moderação com exclusão de anúncio e purga física no Supabase Storage (`DELETE /reports/:id/product`) | **CONFIRMADO** | `report.routes.js:40` -> `moderateRemoveProduct` (`report.mutation.service.js:142-225`) aplica soft delete no produto, remove `ProductImage` e chama `removerImagensDoStorage()` -> `SupabaseStorageAdapter.delete()` (`supabase.storage.adapter.js:174-221`). Falhas no Storage logam warning sem quebrar a operação. | Manter (citando que o produto sofre soft delete `REJEITADO` e as imagens passam por remoção em lote no bucket). |
| **9** | PostgreSQL 15+ (Supabase), Prisma ORM com migrações versionadas e relacionamentos/índices | **PARCIAL** | PostgreSQL no Supabase conectado; `schema.prisma` define `User`, `Product`, `Review`, `Conversation`, `Message`, `Report`, chaves estrangeiras e índices. Porém **não existem migrações versionadas** (`backend/prisma/migrations/` inexistente; usa `prisma db push`). Além disso, `Report` não possui coluna `protocol` no banco (`TK-...` é derivado do sufixo do `id`). | Trocar "migrações versionadas" por "`schema.prisma` declarativo aplicado via `prisma db push` e script `setup-unaccent.js`". |
| **10** | Swagger UI (`/api/v1/docs`), OpenAPI 3.0.3, Postman, README e **150 testes (82 unit + 68 integr)** | **CONFIRMADO** | Testado ao vivo: `/api/v1/docs` e `/api/v1/docs/openapi.json` (OpenAPI `3.0.3`), `itaim-vende.postman_collection.json` (11 pastas, 47 requisições) e `npm --prefix backend run test` executou **150 testes em 38 suítes (82 unitários + 68 integração), com 150 aprovados e 0 falhas** com servidor ativo. | Manter (lembrar na demo de deixar o servidor rodando para os 68 testes de integração não darem `ECONNREFUSED`). |
| **11** | Roteiro da Demo ao Vivo (Health/Swagger, filtro `city=Paulistana`, WhatsApp, avaliação ACID, painel admin) | **CONFIRMADO** | Endpoints `/api/v1/health`, `/api/v1/docs`, `/api/v1/products?city=Paulistana` e `/api/v1/reviews/user/:id` verificados e funcionais. Ressalva para bloqueio do painel: em `development` via `localhost`, `system/status` libera loopback sem token; para demonstrar `401`/`403`, testar `/api/v1/reports` com token `BUYER`. | Na demo ao vivo, usar `GET /api/v1/reports` com token `BUYER` para comprovar o `403 Forbidden` real no backend. |
| **12** | 13/13 Requisitos do IFPI atendidos e zero segredos expostos | **PARCIAL** | `backend/.env` não está rastreado no Git. Porém `frontend/js/pages/admin/login-painel.js:26-79` contém senhas padrão hardcoded em código versionado, e os Requisitos 3 (verbos nas URIs), 8 (`BUYER` vs `SELLER`) e 10 (ausência de `migrations/`) apresentam atendimento parcial frente ao texto estrito do slide. | Não afirmar "zero segredos expostos" de forma absoluta enquanto houver credenciais de desenvolvimento hardcoded no frontend JS. |

---

## 5. Inventário de Rotas e Módulos

Levantamento exato realizado por inspeção direta de `backend/src/server.js` e de todos os arquivos `*.routes.js` em `backend/src/routes/`:

### 5.1 Resumo Quantitativo da API (`/api/v1` e alias `/api`)
- **Módulos montados via `v1Router.use(...)`:** **14 módulos**
- **Rotas diretas em `v1Router`:** **2 endpoints** (`GET /api/v1/health` e `GET /api/v1/usernames/availability`)
- **Total de handlers HTTP registrados nos módulos + raiz `v1Router`:** **122 endpoints**
- **Rotas de Documentação OpenAPI/Swagger:** **4 endpoints** (`/api/v1/docs`, `/api-docs`, `/api/v1/docs/openapi.json`, `/api-docs/openapi.json`)

| # | Módulo | Prefixo `/api/v1/...` | Arquivo de Rotas | Qtd. Rotas | Status Funcional |
| :-: | :--- | :--- | :--- | :-: | :--- |
| 1 | `auth` | `/api/v1/auth` | `backend/src/routes/auth/auth.routes.js` | 18 | **CONFIRMADO** (inclui aliases `/me`, `/profile`, `/password`, `/change-password`) |
| 2 | `account` | `/api/v1/account` | `backend/src/routes/account/account.routes.js` | 17 | **CONFIRMADO** (username cooldown, OTP e-mail/telefone, LGPD dossier/export, preferências) |
| 3 | `products` | `/api/v1/products` | `backend/src/routes/product/product.routes.js` | 9 | **CONFIRMADO** (CRUD, filtro regional, status, `/contact`) |
| 4 | `categories` | `/api/v1/categories` | `backend/src/routes/category/category.routes.js` | 1 | **CONFIRMADO** (`GET /` com `Cache-Control: public, max-age=300`) |
| 5 | `orders` | `/api/v1/orders` | `backend/src/routes/order/order.routes.js` | 3 | **CONFIRMADO** (`POST /`, `GET /`, `GET /:id`) |
| 6 | `chat` | `/api/v1/chat` | `backend/src/routes/chat/chat.routes.js` | 11 | **CONFIRMADO** (conversas, mensagens, propostas `status`/`accept`/`reject`, bloqueio) |
| 7 | `favorites` | `/api/v1/favorites` | `backend/src/routes/favorite/favorite.routes.js` | 7 | **CONFIRMADO** (coleção, PUT/DELETE idempotentes e aliases `/toggle`, `/status`) |
| 8 | `upload` | `/api/v1/upload` | `backend/src/routes/upload/upload.routes.js` | 9 | **CONFIRMADO** (Multer + Sharp WebP; aliases para perfil, vendas, chat) |
| 9 | `reviews` | `/api/v1/reviews` | `backend/src/routes/review/review.routes.js` | 6 | **CONFIRMADO** (listar, criar, editar, remover, responder) |
| 10 | `reports` | `/api/v1/reports` | `backend/src/routes/report/report.routes.js` | 10 | **CONFIRMADO** (abrir denúncia, ticket por protocolo e ações admin RBAC) |
| 11 | `system` | `/api/v1/system` | `backend/src/routes/system/system.routes.js` | 13 | **PARCIAL** (funcional, porém possui bypass de auth para localhost em `development`) |
| 12 | `addresses` | `/api/v1/addresses` | `backend/src/routes/address/address.routes.js` | 6 | **CONFIRMADO** (CRUD completo + `PATCH /:id/primary`) |
| 13 | `notifications` | `/api/v1/notifications` | `backend/src/routes/notification/notification.routes.js` | 7 | **CONFIRMADO** (listagem filtrada, contagens, leitura individual/em lote, exclusão) |
| 14 | `users` | `/api/v1/users` | `backend/src/routes/user/user.routes.js` | 3 | **CONFIRMADO** (`GET /:id`, `GET /:userId/reviews`, `POST /:userId/reviews`) |
| - | Raiz `v1Router` | `/api/v1/health`, `/api/v1/usernames/availability` | `backend/src/server.js` | 2 | **CONFIRMADO** |

### 5.2 Rotas do Frontend (Clean URLs)
Mapeadas em `server.js:291-345` (`FRONTEND_PAGES_MAP`) e `frontend/js/core/rotas/rotas-mapa.js`:
- **Públicas:** `/`, `/home`, `/categoria`, `/produto`, `/vendedor`, `/login`, `/cadastro`, `/index`, `/reverter-telefone`, `/termos`, `/termos-de-uso`, `/privacidade`, `/politica-de-privacidade`, `/cookies`, `/politica-de-cookies`, `/login-painel`, `/login-admin`, `/login-tickets`, `/404`. *(Nota: `/apresentacao` e `/apresentacao-api` também constam em `FRONTEND_PAGES_MAP` e `rotas-mapa.js`, embora o arquivo HTML correspondente tenha sido removido anteriormente).*
- **Protegidas (usuário autenticado no frontend):** `/vender`, `/meus-anuncios`, `/conversas`, `/chat`, `/perfil`, `/configuracoes`, `/favoritos`, `/notificacoes`.
- **Administrativas:** `/painel`, `/status`, `/tickets`, `/moderacao`.

---

## 6. Auditoria de Segurança

| Mecanismo | Status | Evidência e Comportamento Real |
| :--- | :---: | :--- |
| **Autenticação JWT (`authenticateToken`)** | **CONFIRMADO** | `backend/src/middlewares/auth.middleware.js:8-69`: extrai `Bearer <token>`, valida via `jwt.verify` (`HS256` padrão), consulta o usuário no PostgreSQL, bloqueia contas `BANNED`/`SUSPENDED` com `403` (`ACCOUNT_SUSPENDED`) e trata expiração (`401 TOKEN_EXPIRED`). |
| **Expiração do Token JWT** | **INCORRETO no Roteiro** | `backend/src/config/env.js:55` define padrão `'2h'`; `backend/.env` local define `'7d'`. O roteiro informava `'24h'`. |
| **JWT_SECRET fallback inseguro em Dev** | **PARCIAL** | `env.js:54` possui string padrão de fallback caso `JWT_SECRET` esteja vazio em `development`; em `production` lança erro fatal no boot (`env.js:46-48`). |
| **RBAC (`BUYER` vs `SELLER` vs `ADMIN`)** | **PARCIAL** | `requireRole('ADMIN', 'MODERATOR')` protege `/api/v1/reports` (`report.routes.js:31-50`) e `requireRole('ADMIN')` protege `/api/v1/system` (`system.routes.js:31`). Porém **não existe `requireRole('SELLER')` em nenhum endpoint** — `BUYER` e `SELLER` possuem as mesmas permissões de rota no backend, diferenciando-se apenas por propriedade do registro (`sellerId === userId` ou `targetId === userId`). |
| **Proteção de `/api/v1/system/*`** | **PARCIAL** | `system.routes.js:25-50` exige `ADMIN` quando há token ou cabeçalhos proxy (`x-forwarded-for`, `cf-connecting-ip`), porém em `NODE_ENV !== 'production'` libera acesso `ADMIN` automático para qualquer requisição local sem token vinda de `127.0.0.1` (comprovado em teste prático: `status 200` sem token em loopback, `401` com `x-forwarded-for`). |
| **Login Painel Admin (`/login-painel`)** | **PARCIAL** | `frontend/js/pages/admin/login-painel.js:25-79, 235-259` contém uma lista de 5 perfis de desenvolvedores com senhas padrão e senha mestra hardcoded no JavaScript cliente (autenticação local sem token JWT), antes de recorrer ao backend `/api/v1/auth/login`. |
| **Proteção de páginas no frontend** | **CONFIRMADO (UI)** | `sessao-ui.js:445-556` (`protegerPagina`) e script inline no `<head>` de `painel.html:57-85` redirecionam usuários sem sessão. Trata-se de proteção de interface (UX/anti-FOUC); a segurança efetiva dos dados depende dos middlewares do backend. |
| **Helmet** | **PARCIAL** | `server.js:49`: `helmet({ crossOriginResourcePolicy: false, contentSecurityPolicy: false })`. Protege cabeçalhos padrão (`X-Content-Type-Options`, `X-Frame-Options`, etc.), mas com CSP e CORP explicitamente desabilitados. |
| **CORS** | **CONFIRMADO** | `server.js:52-63`: aceita lista configurada em `ENV.CORS_ORIGIN` (no `.env.example` e padrão de `env.js`, usa `'*'`). |
| **Rate Limiting** | **PARCIAL** | `globalLimiter` (`120 req/min` em produção; `10000` em `NODE_ENV=test`), `authLimiter` (`20 req/15min`), `uploadLimiter` (`30 req/15min`). Entretanto, os limitadores de `account.routes.js:39,52,65,78,91` ignoram limitação se o cliente enviar o cabeçalho HTTP `x-test-runner`. |
| **Sanitização de Entrada** | **CONFIRMADO** | `sanitize.middleware.js` limpa `req.body`, `req.query` e `req.params` em todas as rotas antes dos controllers. |
| **Exposição de segredos no Git** | **PARCIAL** | `backend/.env` não é rastreado no Git (`git ls-files` confirmou apenas `.env.example`), mas existem credenciais hardcoded de desenvolvimento em `frontend/js/pages/admin/login-painel.js` e `JWT_SECRET` fallback em `backend/src/config/env.js`. |

---

## 7. Auditoria das Regras de Negócio

### 7.1 Reputação e Avaliações
- **Endpoint `POST /api/v1/reviews/user/:userId`:** **CONFIRMADO** (`review.routes.js:17`, com `authenticateToken`). Também possui alias em `POST /api/v1/users/:userId/reviews` (`user.routes.js:13`).
- **Autenticação do autor:** **CONFIRMADO** — `review.controller.js` usa `req.user.id` extraído do JWT; o frontend não escolhe o autor.
- **Identificação do vendedor:** **CONFIRMADO** — `review.mutation.service.js:24-36` localiza `targetUser` por `id`, `username` ou `email`.
- **Impedimento de autoavaliação:** **CONFIRMADO** — `review.mutation.service.js:38-40` lança `400` quando `authorId === targetUser.id`.
- **Impedimento de duplicidade:** **CONFIRMADO na aplicação** — `review.mutation.service.js:43-52` verifica com `findFirst` e lança `400` se já existir avaliação; não possui restrição `@@unique([authorId, targetId])` no `schema.prisma`.
- **Recálculo e `prisma.$transaction`:** **CONFIRMADO** — `review.mutation.service.js:54-93` (`createReview`), `147-182` (`updateReview`) e `203-228` (`deleteReview`) agrupam em transação atômica: mutação em `Review`, leitura de todas as notas do vendedor, cálculo da média com `toFixed(2)` e atualização de `ratingAverage` e `ratingCount` em `User`.

### 7.2 Chat e Negociações
- **Comunicação Socket.IO:** **CONFIRMADO** — `socket.manager.js` inicializa o servidor Socket.IO com autenticação JWT no handshake, salas individuais `user:<id>` e salas de conversa `conversation:<id>` com checagem de participação.
- **Mensagens e contrapropostas formais:** **CONFIRMADO** — `message.service.js:79-225` suporta `TEXT`, `IMAGE` e `OFFER_PROPOSAL` (`offerValue`, `offerStatus: 'PENDING'`), e `acceptOfferProposal`/`rejectOfferProposal` (linhas 233-340) via `PATCH /api/v1/chat/messages/:id/status` (além de `/accept` e `/reject`), impedindo aceitar a própria proposta (linha 255).
- **Identificação online/offline:** **CONFIRMADO** — `isUserOnline(userId)` (`socket.manager.js:176-180`) verifica presença de sockets na sala `user:<userId>`.
- **Envio de e-mail quando destinatário está offline:** **PARCIAL** — `message.service.js:174-191` verifica `!isUserOnline(recipientId)` e chama `enviarEmailNovaMensagem`. O mecanismo existe no código, mas no `.env` local `RESEND_API_KEY` e `SMTP_HOST` estão vazios, acionando apenas simulação em log (`email.service.js:72-86`). Envio externo real: **NÃO VERIFICADO**.
- **Criação de notificações:** **CONFIRMADO** — `message.service.js:145-171` grava `Notification` no banco e emite `badge_update` respeitando preferências do usuário (`socket.manager.js:216-246`).

### 7.3 WhatsApp e Rastreamento
- **Compartilhamento pelo WhatsApp:** **PARCIAL** — `produto-acoes.js:241-248` monta link `https://wa.me/?text=...` com **título, preço/doação, URL canônica e texto institucional**, porém **não inclui cidade/bairro na mensagem do popover**.
- **Cópia do link:** **CONFIRMADO** — `produto-acoes.js:280-318` usa `navigator.clipboard.writeText` com fallback via `document.execCommand('copy')` e exibe toast apenas quando bem-sucedido.
- **Endpoint `POST /api/v1/products/:id/contact`:** **PARCIAL** — O backend implementa e incrementa `contactsCount` na tabela `Product` (`product.mutation.service.js:418-430`). Porém não grava histórico individual de leads e **o frontend não invoca `registrarContato()` em nenhum evento de clique** (`api-produtos.js:154` não possui chamadores).

### 7.4 Moderação e Storage
- **Denúncias e tickets:** **CONFIRMADO** — `report.routes.js:21,24` e `report.mutation.service.js:25-131` criam `Report` e geram protocolo derivado `TK-<6 últimos chars do id>`.
- **Exclusão de anúncio e purga de imagens (`DELETE /api/v1/reports/:id/product`):** **CONFIRMADO** — `report.mutation.service.js:142-225` exige `ADMIN`/`MODERATOR`, marca o produto como `REJEITADO` + `deletedAt`, apaga `ProductImage` e chama `removerImagensDoStorage()` -> `SupabaseStorageAdapter.delete()` (`supabase.storage.adapter.js:174-221`).
- **Tratamento de falhas na exclusão das imagens:** **CONFIRMADO (com ressalva)** — `removerImagensDoStorage()` e `SupabaseStorageAdapter.delete()` capturam exceções via `try/catch`, retornam `false` e registram `console.warn`, não bloqueando o deferimento da moderação (ressalva: `ProductImage` já foi apagado no banco antes da remoção física no bucket).

---

## 8. Banco de Dados

Auditoria direta de `backend/prisma/schema.prisma`, `backend/scripts/setup-unaccent.js` e boot real contra Supabase PostgreSQL:

- **Conexão e SGBD:** **CONFIRMADO** — PostgreSQL no Supabase conectado e respondendo no boot (`SELECT 1`), extensão `unaccent` e função `unaccent_text` ativas.
- **Migrações:** **INCORRETO no Roteiro** — Não existe diretório `backend/prisma/migrations/`. O projeto sincroniza o schema com `prisma db push` (`backend/package.json:13`). Existe um arquivo legado `backend/prisma/dev.db` não utilizado pela configuração PostgreSQL atual.
- **Modelos Centrais e Relacionamentos:** **CONFIRMADO**
  - `User` 1:N `Product` (`sellerId` -> `User.id`, `onDelete: Cascade`)
  - `User` 1:N `Review` em relação dupla: `ReviewsGiven` (`authorId`) e `ReviewsReceived` (`targetId`)
  - `Product` 1:N `Conversation`; `User` 1:N `Conversation` (`buyerId`, `sellerId`, `blockedById`); `Conversation` 1:N `Message` (`onDelete: Cascade`)
  - `Product` 1:N `Report` (`onDelete: Cascade`)
  - Demais modelos no schema: `Address`, `Notification`, `Category` (auto-relacionamento `SubCategories`), `ProductImage`, `Order`, `OrderItem`, `Favorite`, `AuditLog`, `UsernameHistory`, `EmailChangeRequest`, `PhoneHistory`, `PhoneChangeRequest`.
- **Restrições de Unicidade (`@@unique` / `@unique`):**
  - `User.email`, `User.username`, `User.resetPasswordToken`
  - `Category.name`, `Category.slug`
  - `Product.slug`
  - `Order.code`
  - `Favorite`: `@@unique([userId, productId])`
  - `Conversation`: `@@unique([productId, buyerId, sellerId])`
  - `PhoneChangeRequest.revertToken`
  - *Observação:* `Review` **não** possui `@@unique([authorId, targetId])` no schema (unicidade aplicada na camada de serviço).
- **Campos de Cidade, Bairro e Propostas:** **CONFIRMADO** — `User` e `Product` possuem `city`, `state`, `neighborhood`; `Message` persiste `messageType` (`MessageType`), `offerValue` (`Decimal(10,2)`) e `offerStatus` (`OfferStatus`).
- **Índices Relevantes no `schema.prisma`:**
  - `User`: `[email]`, `[city, state]`, `[status]`
  - `Product`: `[status, createdAt(Desc)]`, `[city, categoryId]`, `[status, city]`, `[status, categoryId]`, `[status, isFeatured, createdAt(Desc)]`, `[status, city, categoryId, createdAt(Desc)]`, `[sellerId, status]`, `[slug]`, `[price]`
  - `Conversation`: `[buyerId, lastMessageAt(Desc)]`, `[sellerId, lastMessageAt(Desc)]`, `[buyerId]`, `[sellerId]`
  - `Message`: `[conversationId, createdAt]`, `[conversationId, isRead, senderId]`
  - `Review`: `[targetId]`
  - `Report`: `[productId, status]`
  - `setup-unaccent.js`: cria também índice GIN `Product_title_unaccent_trgm_idx` via `pg_trgm` (se permitido pelo PostgreSQL).

---

## 9. Resultados dos Testes

Todas as execuções foram realizadas diretamente neste ambiente com `node --test` (`node:test`).

### 9.1 Execução A — Somente Suíte Unitária (`npm --prefix backend run test:unit`)
- **Comando:** `npm --prefix backend run test:unit` (`node --test tests/unit/*.test.js`)
- **Suítes:** 31
- **Testes executados:** 82
- **Aprovados:** 82
- **Falhos:** 0 | **Ignorados:** 0
- **Cobertura por arquivo (`backend/tests/unit/`):**
  - `admin-panel-auth.test.js`: 10
  - `formatters-and-rules.test.js`: 10
  - `privacy-and-cookies.test.js`: 11
  - `reviews-and-reputation.test.js`: 21
  - `schemas.test.js`: 20
  - `sharing-and-opengraph.test.js`: 10

### 9.2 Execução B — Suíte Completa SEM Servidor Ativo (`npm --prefix backend run test`)
- **Comando:** `npm --prefix backend run test` (`node --test tests/*.test.js tests/unit/*.test.js`)
- **Suítes:** 38
- **Testes executados:** 150
- **Aprovados:** 92 *(82 unitários + 10 de `reviews-e2e.test.js`, que acessa o Prisma diretamente)*
- **Falhos:** 58 *(6 arquivos HTTP de integração falharam com `ECONNREFUSED 127.0.0.1:3000` por ausência de servidor HTTP rodando)*

### 9.3 Execução C — Suíte Completa COM Servidor Local Ativo (`npm --prefix backend run test`)
- **Pré-requisito:** Servidor backend iniciado em `http://localhost:3000` conectado ao Supabase PostgreSQL
- **Comando:** `npm --prefix backend run test`
- **Suítes:** 38
- **Testes executados:** **150**
- **Aprovados:** **150**
- **Falhos:** **0**
- **Cancelados / Ignorados:** **0**
- **Duração observada:** `41.67s` (`41667.3358ms`)
- **Arquivos de integração (`backend/tests/*.test.js` — 68 testes no total):**
  - `account-email.test.js`: 5 (HTTP + PostgreSQL real)
  - `account-phone.test.js`: 10 (HTTP + PostgreSQL real)
  - `api.test.js`: 14 (HTTP + PostgreSQL real)
  - `notification.test.js`: 11 (HTTP + PostgreSQL real)
  - `rest-conformance.test.js`: 9 (HTTP + PostgreSQL real)
  - `reviews-e2e.test.js`: 10 (Prisma + PostgreSQL real)
  - `username-cooldown.test.js`: 9 (HTTP + PostgreSQL real)
- **Qualidade dos testes:** Verificam autenticação JWT, RBAC (`403` em `/reports`), validação Zod (`400`), `Cache-Control` em categorias, busca `unaccent`, cooldown de 30 dias, notificações, privacidade LGPD, compartilhamento WhatsApp/Open Graph e regras de reputação em banco real.

### 9.4 Testes Práticos Adicionais via HTTP (`localhost:3000`)
- `GET /api/v1/health` -> `200 OK` (`version: v2.0.0`, `status: online`)
- `GET /api/v1/docs/` -> `200 OK` (Swagger UI HTML)
- `GET /api/v1/docs/openapi.json` -> `200 OK` (`openapi: 3.0.3`, `version: 2.0.0`)
- `GET /api/v1/categories` -> `200 OK`, header `cache-control: public, max-age=300`
- `GET /api/v1/products?city=Paulistana&limit=2` -> `200 OK` com dados reais do PostgreSQL
- `GET /api/v1/auth/me` (sem token) -> `401 UNAUTHORIZED`
- `POST /api/v1/auth/register` (payload inválido) -> `400 VALIDATION_ERROR` (`detalhes` array)
- `GET /api/v1/reports` (sem token) -> `401 UNAUTHORIZED`
- `GET /api/v1/system/status` (sem token em `127.0.0.1`) -> `200 OK` (bypass loopback dev)
- `GET /api/v1/system/status` (sem token + header `x-forwarded-for`) -> `401`

---

## 10. Pendências e Inconsistências

### 10.1 Inconsistências no Roteiro da Apresentação
1. **Slide 5 (JWT 24h):** O padrão no código é `2h` e o `.env` local usa `7d` (não `24h`).
2. **Slide 5 (RBAC `BUYER` vs `SELLER`):** Não há bloqueio por papel entre `BUYER` e `SELLER` nas rotas do backend.
3. **Slide 6 (14 módulos listando 13 nomes):** Faltou listar `/account` (que possui 17 rotas ativas).
4. **Slide 6 e 7 ("Zero verbos na URI"):** Várias rotas legadas/ações contêm verbos e módulos no singular.
5. **Slide 7 (Exemplo JSON Zod):** O `message` retornado por `validate.middleware.js` é `"Falha na validação dos dados enviados."` (não uma mensagem específica da nota), além de incluir `detalhes`, `details` e `errors`.
6. **Slide 8 (`/products/:id/contact` no frontend e localização no WhatsApp):** O botão WhatsApp/Share na UI não aciona `/products/:id/contact` e a mensagem de compartilhamento do popover não envia cidade/bairro.
7. **Slide 8 (E-mail offline):** No `.env` atual sem `RESEND_API_KEY` ou `SMTP_HOST`, o envio ocorre apenas simulado no terminal.
8. **Slide 9 ("Migrações versionadas"):** Não há pasta `migrations/`; o projeto usa `prisma db push`.
9. **Slide 12 ("Zero segredos expostos"):** Embora `.env` não esteja no Git, `frontend/js/pages/admin/login-painel.js` expõe senhas padrão de acesso administrativo de desenvolvimento no código-fonte cliente.

### 10.2 Pontos de Atenção no Projeto (Para Conhecimento da Equipe)
1. Bypass de autenticação para `127.0.0.1` em `system.routes.js` quando `NODE_ENV !== 'production'`.
2. Credenciais hardcoded no arquivo cliente `frontend/js/pages/admin/login-painel.js`.
3. Bypass de rate limiter via header `x-test-runner` em `account.routes.js`.
4. `helmet` configurado com `contentSecurityPolicy: false` em `server.js`.
5. `Review` sem índice `@@unique([authorId, targetId])` no banco (depende da validação em serviço).
6. Presença do módulo `/api/v1/orders` com `shippingAddress`/`SHIPPED` coexistindo com o discurso institucional de marketplace sem logística.

---

## 11. Informações Corretas para os Slides

Os números e descrições abaixo são **100% comprováveis diretamente no código e nas execuções desta auditoria**:

- **Stack e Versões:** Node.js (`v24.15.0` no ambiente analisado), Express `5.2.1`, Prisma ORM `6.19.3`, PostgreSQL no Supabase, Socket.IO `4.8.4`, Zod `4.6.5`, Sharp `0.35.5`, OpenAPI `3.0.3`.
- **Arquitetura:** Camadas desacopladas (`Middlewares Globais -> Router /api/v1 -> Auth/RBAC -> Controllers + Zod -> Services -> Prisma ORM -> PostgreSQL / Supabase Storage / Socket.IO`).
- **Módulos e Endpoints da API:** **14 módulos de recursos** montados sob `/api/v1/` (`auth`, `account`, `products`, `categories`, `orders`, `chat`, `favorites`, `upload`, `reviews`, `reports`, `system`, `addresses`, `notifications`, `users`), além de `/health` e `/usernames/availability`, totalizando **122 rotas registradas** (mais 4 endpoints Swagger/OpenAPI).
- **Segurança & JWT:** Autenticação stateless via JWT (`HS256`, expiração configurável via `JWT_EXPIRES_IN`, padrão `2h`); RBAC no backend separando usuários autenticados (com checagem de posse dos dados) de `ADMIN`/`MODERATOR` em moderação (`/reports`) e sistema (`/system` com token obrigatório em produção/proxy); sanitização global; `Cache-Control: public, max-age=300` em `GET /api/v1/categories`.
- **Banco de Dados:** Schema declarativo em `backend/prisma/schema.prisma` aplicado via `prisma db push`, com extensões PostgreSQL `unaccent` e `pg_trgm` configuradas por script.
- **Regras de Negócio Comprovadas:**
  1. Cálculo atômico de reputação em `prisma.$transaction` (`POST /api/v1/reviews/user/:userId`), impedindo autoavaliação e duplicidade na regra de serviço.
  2. Negociação em tempo real via Socket.IO com contrapropostas (`OFFER_PROPOSAL`) e gatilho automático de aviso por e-mail quando o destinatário está offline (`isUserOnline` + fallback console/Resend/SMTP).
  3. Moderação administrativa (`DELETE /api/v1/reports/:id/product`) com arquivamento `REJEITADO` e exclusão das fotos no Supabase Storage.
  4. Rastreamento regional por cidade/bairro, compartilhamento formatado para WhatsApp, cópia de link canônico e endpoint `POST /api/v1/products/:id/contact` no backend.
  5. Integridade de preços server-side em `POST /api/v1/orders` (sem comissão ou gateway financeiro).
- **Documentação e Testes:**
  - Swagger UI em `/api/v1/docs` (OpenAPI `3.0.3`, versão `2.0.0`)
  - Coleção Postman com **11 pastas e 47 requisições** (`itaim-vende.postman_collection.json`)
  - **150 testes automatizados (`node:test`) em 38 suítes:** **82 testes unitários** + **68 testes de integração/E2E**, com **150 aprovados e 0 falhas** quando executados com o servidor local ativo.

---

## 12. Conclusão

O projeto **Itaim Vende** possui uma API RESTful real, funcional e tecnicamente bem estruturada, com banco PostgreSQL em nuvem, armazenamento de imagens WebP otimizado, WebSockets e **150 testes automatizados executáveis com 100% de aprovação**.

O roteiro de apresentação **é viável e sólido**, porém **precisa dos ajustes pontuais descritos nas Seções 4 e 10** (principalmente corrigir a validade do JWT, a explicação do RBAC entre `BUYER`/`SELLER` e `ADMIN`, listar os 14 módulos incluindo `/account`, corrigir a menção a `migrations/` e evitar afirmar que a interface já envia leads em `/products/:id/contact` ou que não há senhas de dev no código cliente). Aplicando esses ajustes, tudo o que a equipe afirmar diante da banca estará **100% amparado pelo código-fonte real**.

