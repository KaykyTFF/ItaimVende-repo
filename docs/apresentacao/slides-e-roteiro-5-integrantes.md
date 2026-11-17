# Divisao da Apresentacao para 5 Pessoas — Itaim Vende API

Divisao equilibrada dos 12 slides entre 5 integrantes (cerca de 1m30 a 2m de fala para cada membro, totalizando 8 a 10 minutos com a demonstracao ao vivo), 100% revisada conforme a auditoria tecnica ([README_AUDITORIA_APRESENTACAO.md](../../README_AUDITORIA_APRESENTACAO.md)).

---

## QUADRO RESUMO DA EQUIPE

| Integrante | Responsabilidade | Slides | Tema de Dominio na Arguicao |
| :--- | :--- | :---: | :--- |
| **Integrante 1** | Negocio e Inovacao Regional | **1, 2 e 3** | Problema regional, zero comissao/frete, posicionamento frente a grandes plataformas |
| **Integrante 2** | Arquitetura e Seguranca de Acesso | **4 e 5** | Camadas Express, Helmet, Cache-Control, JWT (`JWT_EXPIRES_IN`), posse e RBAC `ADMIN` |
| **Integrante 3** | Mapa de Rotas e Padrao REST | **6 e 7** | Clean URLs, 14 modulos `/api/v1/` (122 rotas), verbos, status codes e erros Zod |
| **Integrante 4** | Regras de Negocio e Banco | **8 e 9** | Transacao ACID (`$transaction`), chat offline, WhatsApp/Storage e Prisma `db push` |
| **Integrante 5** | Qualidade, Demo ao Vivo e Fechamento | **10, 11 e 12** | Swagger OpenAPI 3.0.3, Postman (47 reqs), 150 testes (`node:test`), demo ao vivo e conclusao |

---

## INTEGRANTE 1: Negocio e Inovacao Regional (Slides 1, 2 e 3)

### SLIDE 1: Capa
**No slide:**
- **Titulo:** Itaim Vende API
- **Subtitulo:** Infraestrutura RESTful para o Comercio Regional do Semiarido Piauiense
- **Rodape:** IFPI Campus Paulistana | Programacao para Internet II | Prof. Me. Julian Rodrigues Valerio
- **Stack:** Node.js (v24) | Express 5.2 | PostgreSQL | Prisma ORM 6.19 | Socket.IO 4.8 | OpenAPI 3.0.3

**Fala do Integrante 1 (Slide 1):**
> "Bom dia, professor Julian e colegas. Nossa equipe vai apresentar hoje o projeto final da disciplina de Programacao para Internet II: a **Itaim Vende API**. Nosso objetivo foi construir uma API RESTful original voltada para o comercio local de Paulistana e da microrregiao do Vale do Itaim, indo muito alem de um CRUD simples."

---

### SLIDE 2: O Problema Real e a Solucao
**No slide:**
- **Contexto Observado pela Equipe:** Na vivencia local, pequenos vendedores divulgam ofertas em grupos informais de mensagens, sem catalogo por cidade e bairro.
- **Necessidades Locais:** Organizacao regional das ofertas e liberdade para combinar retirada ou entrega direta.
- **Nossa Proposta:** Vitrine digital e negociacao direta (modelo sem intermediacao financeira, sem comissao e sem logistica imposta).
- **Foco:** Comercio local de Paulistana e municipios vizinhos do Vale do Itaim.

**Fala do Integrante 1 (Slide 2):**
> "Para comecar, partimos de um contexto observado pela equipe no comercio de Paulistana e cidades vizinhas: pequenos produtores e lojistas costumam divulgar mercadorias em grupos informais de mensagens, onde as ofertas se perdem e falta um catalogo estruturado por cidade e bairro. O Itaim Vende nasce para suprir essa lacuna: ele funciona como uma vitrine digital e canal direto de negociacao, sem intermediacao financeira, sem cobrar comissao pelo marketplace e sem exigir um sistema de frete."

---

### SLIDE 3: Posicionamento Regional e Inovacao
**No slide:**

| Eixo de Valor | Solucao no Itaim Vende API |
| :--- | :--- |
| **Foco Regional** | Filtros nativos por cidades e bairros do Vale do Itaim |
| **Modelo sem intermediacao financeira** | Zero comissao e sem gateway de pagamento |
| **Negociacao Direta** | Contrapropostas formais no chat + contato via WhatsApp |
| **Notificacoes** | Aviso interno no banco + gatilho e-mail offline (Resend/SMTP ou log em dev) |
| **Reputacao Independente** | Calculada no PostgreSQL via transacao (`prisma.$transaction`) |

- **Como a regionalizacao ajuda:** Da visibilidade direta a pequenos comerciantes e produtores locais no catalogo da microrregiao.
- **Eixos do Edital:** Dados e Dominio | Impacto Social | Regra de Negocio | Tempo Real

**Fala do Integrante 1 (Slide 3 + Passagem):**
> "Nosso diferencial esta no alinhamento completo a realidade regional do Vale do Itaim. Estruturamos uma API sob medida com filtros por cidade e bairro, contato direto via chat com contrapropostas e WhatsApp, modelo sem intermediacao financeira nem cobranca de comissao pelo marketplace, reputacao calculada em transacao no PostgreSQL e notificacoes persistidas no sistema com integracao de envio por e-mail quando o usuario esta offline via Resend/SMTP — ou log simulado no terminal sem chaves configuradas. Agora passo a palavra para o [Integrante 2], que vai explicar a arquitetura e a seguranca do sistema."

---

## INTEGRANTE 2: Arquitetura e Seguranca de Acesso (Slides 4 e 5)

### SLIDE 4: Arquitetura da API
**No slide:**
```
[ Cliente REST (Browser / Swagger) ]          [ Socket.IO Client (WebSocket) ]
               |                                             |
               v                                             v
[ 1. Middlewares Globais (server.js) ]        [ Canal Complementar Socket.IO ]
  Helmet (CSP off) -> CORS -> Logger ->         Handshake JWT (io.use), salas
  Rate-Limit (/api) -> JSON 5MB -> Sanitize     user:<id> e conversation:<id>
               |
               v
[ 2. Roteamento (/api/v1: 122 Endpoints = 14 Modulos + 2 Raiz) ]
  (+ 4 Swagger: /api/v1/docs, /api-docs, /api/v1/docs/openapi.json, /api-docs/openapi.json)
               |
               v
[ 3. Middlewares de Rota -> Controller -> Service -> Prisma / Supabase ]
  Rate-limit rota -> Auth/RBAC -> Multer/Zod -> Controller -> Service -> PostgreSQL (errorHandler ao final)
```
- **Principios REST:** Stateless | Cliente-Servidor | Cacheable (`Cache-Control: public, max-age=300` em `/categories`) | Camadas | Interface Uniforme

**Fala do Integrante 2 (Slide 4):**
> "Obrigado, [Integrante 1]. Este e o fluxo real de execucao em `server.js`. Primeiro rodam os middlewares globais: Helmet (sem CSP para servir os scripts locais), CORS, logger, rate limiter em `/api`, parser JSON de 5MB e `sanitizeInput`. Depois o `v1Router` resolve entre 122 endpoints (14 modulos + 2 rotas raiz, alem de 4 rotas Swagger), executando os middlewares proprios da rota antes do controller — limitadores especificos, autenticacao JWT, `requireRole`, Multer em `/upload` e validacao Zod — para entao chamar Service e Prisma ORM no PostgreSQL, com `errorHandler` ao final. Paralelamente, o Socket.IO atua como canal complementar em tempo real separado do fluxo REST stateless."

---

### SLIDE 5: Esquema de Acesso e Seguranca (RBAC)
**No slide:**

**1. Visitante (Publico)**
- Acessa vitrine, categorias, anuncios e perfil publico.
- Ao clicar para interagir: Modal de Login preserva o destino (`returnTo`).

**2. Usuario Autenticado (`BUYER` / `SELLER`)**
- Token JWT (`HS256`, expiracao configuravel via `JWT_EXPIRES_IN` — padrao `2h`, `7d` em dev) + guarda anti-FOUC (`protegerPagina` — apenas UX, nao substitui o backend).
- `authenticateToken` bloqueia contas `BANNED`/`SUSPENDED` (`403`) e operacoes comuns exigem posse do recurso (`sellerId`/`targetId`).

**3. Administrador / Moderador (`ADMIN` / `MODERATOR`)**
- `/api/v1/reports`: acesso restrito a `ADMIN` e `MODERATOR` (`403 Forbidden` para usuarios comuns).
- `/api/v1/system`: acesso exclusivo de `ADMIN` via `requireRole('ADMIN')`.
- *(Ressalvas de dev: perfis locais em `login-painel.js`, fallback de `JWT_SECRET` em `env.js` e bypass loopback `127.0.0.1` em `/system`).*

**Fala do Integrante 2 (Slide 5 + Passagem):**
> "Dentro dessa arquitetura, como controlamos quem pode acessar o que? No frontend, `protegerPagina()` em `sessao-ui.js` impede que visitantes visualizem telas privadas, mas deixamos claro que a protecao visual no navegador nao substitui a autorizacao do backend. Toda seguranca efetiva esta no servidor: o login emite um token JWT HS256 com validade configuravel (padrao de 2 horas) e `authenticateToken` confere no banco se a conta esta ativa. Usuarios comuns acessam os recursos sob checagem de posse; ja o RBAC separa moderacao em `/api/v1/reports` (para ADMIN e MODERATOR) e gestao em `/api/v1/system` (exclusivo ADMIN). Passo agora a palavra para o [Integrante 3], que vai mostrar o mapa completo de rotas."

---

## INTEGRANTE 3: Mapa de Rotas e Padrao REST (Slides 6 e 7)

### SLIDE 6: Mapa de Rotas do Sistema
**No slide:**

**Frontend (Clean URLs sem `.html`)**
- **Publicas:** `/home`, `/categoria`, `/produto`, `/vendedor`, `/termos`, `/privacidade`, `/cookies`
- **Protegidas (UI):** `/vender`, `/meus-anuncios`, `/conversas`, `/perfil`, `/configuracoes`, `/favoritos`, `/notificacoes`
- **Admin:** `/login-painel`, `/painel`, `/tickets`

**Backend (122 Endpoints sob `/api/v1/`: 14 Modulos + 2 Rotas Raiz + 4 Swagger)**
- `/auth`, `/account` e `/users` (Identidade, OTP, LGPD e perfis)
- `/products` e `/categories` (Catalogo regional e contatos)
- `/reviews` (Avaliacoes e reputacao ACID)
- `/chat` e `/notifications` (Tempo real, propostas e alertas)
- `/favorites`, `/orders`, `/addresses` (Interacoes e pedidos sem taxas)
- `/reports` (`ADMIN`, `MODERATOR`), `/upload`, `/system` (`ADMIN`)
- Raiz `/api/v1`: `/health` e `/usernames/availability` | Docs: `/api/v1/docs`, `/api-docs`, `/api/v1/docs/openapi.json`, `/api-docs/openapi.json`

**Fala do Integrante 3 (Slide 6):**
> "Obrigado, [Integrante 2]. Todo esse controle de acesso se reflete no nosso mapa de rotas. No frontend, usamos Clean URLs mapeadas em `rotas-mapa.js` e no `server.js`: o usuario navega por `/home`, `/vender` ou `/conversas` sem precisar expor extensoes `.html`. Ja no backend, o edital exigia no minimo 4 recursos; nos implementamos 122 endpoints registrados sob `/api/v1/`, distribuidos em 14 modulos especializados (incluindo `/account`) e 2 rotas na raiz do roteador (`/health` e `/usernames/availability`), alem de 4 rotas Swagger. Os recursos principais seguem substantivos no plural em minusculo, mantendo tambem rotas com verbos consumidas diretamente pelo frontend atual e pelos testes."

---

### SLIDE 7: Padrao REST, Verbos, Status e Erros
**No slide:**
- **Verbos Semanticos:** `GET` (Consultar) | `POST` (Criar) | `PUT` (Substituir) | `PATCH` (Status/Leitura) | `DELETE` (Remover)
- **Status Codes Implementados:**
  - Sucesso: `200 OK` | `201 Created` | `204 No Content`
  - Erro: `400 Bad Request` | `401 Unauthorized` | `403 Forbidden` | `404 Not Found` | `409 Conflict`
- **Erro Padronizado Real (Zod / `validate.middleware.js`):**
  ```json
  {
    "success": false,
    "code": "VALIDATION_ERROR",
    "message": "Falha na validação dos dados enviados.",
    "detalhes": [{ "field": "email", "message": "Invalid input..." }]
  }
  ```

**Fala do Integrante 3 (Slide 7 + Passagem):**
> "Alem da organizacao por modulos, aplicamos cada verbo HTTP e codigo de status conforme o protocolo. Usamos PATCH para alteracoes parciais, como pausar um anuncio ou aceitar uma proposta no chat, e DELETE retorna 204 sem corpo quando aplicavel. Nas rotas protegidas com schemas Zod, o `validate.middleware.js` intercepta dados fora do formato antes de chegar ao controller e devolve erro 400 padronizado com `code: VALIDATION_ERROR` e o detalhamento exato dos campos invalidos. Agora o [Integrante 4] vai mostrar as regras de negocio e a estrutura do banco de dados."

---

## INTEGRANTE 4: Regras de Negocio e Banco de Dados (Slides 8 e 9)

### SLIDE 8: Regras de Negocio Alem do CRUD
**No slide:**
1. **Reputacao em `prisma.$transaction` (`POST /reviews/user/:userId`):** Cria, edita ou exclui avaliacao recalculando `ratingAverage` e `ratingCount` em `User`. Duplicidade verificada via `findFirst` no service (sem `@@unique` no banco).
2. **Negociacao no Chat + Notificacao e E-mail Offline:** Contrapropostas (`OFFER_PROPOSAL`) via Socket.IO; notificacao persistida em `Notification`; e-mail externo depende de Resend/SMTP (usa fallback de log no terminal sem chaves configuradas).
3. **Compartilhamento WhatsApp e Contagem de Contatos:** Mensagem para WhatsApp no frontend + endpoint `POST /api/v1/products/:id/contact` no backend *(UI atual ainda nao chama esse endpoint no clique)*.
4. **Moderacao com Limpeza no Storage (`DELETE /reports/:id/product`):** Marca produto como `REJEITADO` (soft delete), remove `ProductImage` e apaga arquivos no Supabase Storage.

**Fala do Integrante 4 (Slide 8):**
> "Obrigado, [Integrante 3]. Aqui estao as regras que mostram o que a API faz alem de um CRUD simples. Primeiro, nas avaliacoes, o service verifica duplicidade com `findFirst` — ressaltando que nao ha constraint `@@unique` no banco — e usa `prisma.$transaction` ao criar, editar ou excluir para atualizar a media e a contagem em `User` no mesmo bloco. Segundo, no chat Socket.IO, eventos mapeados (mensagens/propostas no chat, favoritos, nova avaliacao, pedidos, remocao na moderacao e alteracoes de conta) gravam na tabela `Notification` e atualizam em tempo real via Socket.IO quando habilitados nas preferencias; quando o destinatario esta offline (`!isUserOnline`), o backend aciona o e-mail via Resend/SMTP ou cai em fallback de log no terminal quando nao ha chaves configuradas. Terceiro, temos compartilhamento formatado para WhatsApp e o endpoint `/products/:id/contact` no backend (ressalvando que a UI atual ainda nao dispara essa contagem no clique). Por fim, a moderacao apaga as referencias e exclui as fotos no Supabase Storage."

---

### SLIDE 9: Banco de Dados e Persistencia
**No slide:**
- **SGBD:** PostgreSQL hospedado no Supabase (com extensao `unaccent` ativa)
- **ORM e Sincronizacao:** Prisma Client 6.19.3 com `schema.prisma` aplicado via `prisma db push` + `setup-unaccent.js` (sem migrations versionadas)
- **Relacionamentos Centrais:**
  - `User` 1:N `Product` (com `city`, `state`, `neighborhood`)
  - `User` 1:N `Review` (relacao dupla: autor e vendedor avaliado; unicidade verificada pelo service, sem `@@unique` no banco)
  - `Conversation` 1:N `Message` (`OFFER_PROPOSAL`, `offerValue`, `offerStatus`)
  - `Product` 1:N `Report` (protocolo `TK-...` derivado do ID)
- **Otimizacao:** Indices compostos em `Product`, `User`, `Conversation`, `Message` e indice GIN `Product_title_unaccent_trgm_idx`.

**Fala do Integrante 4 (Slide 9 + Passagem):**
> "Toda essa estrutura roda no PostgreSQL hospedado no Supabase, modelada no `schema.prisma` e sincronizada via `prisma db push` junto com o script `setup-unaccent.js`, sem migrations versionadas. Temos relacionamentos bem definidos entre usuarios, produtos localizados por cidade e bairro, conversas com propostas de preco e tickets de denuncia. Um destaque e a entidade Review, que possui relacao dupla com User para separar o autor da avaliacao do vendedor avaliado — com verificacao de duplicidade na logica do service — alem de indices compostos que mantem as consultas rapidas. Passo agora para o [Integrante 5], que vai apresentar documentacao, testes e a demonstracao ao vivo."

---

## INTEGRANTE 5: Qualidade, Demo ao Vivo e Fechamento (Slides 10, 11 e 12)

### SLIDE 10: Documentacao, Colecao e Testes
**No slide:**
- **4 Endpoints Swagger / OpenAPI 3.0.3 (`v2.0.0`):** `/api/v1/docs`, `/api-docs`, `/api/v1/docs/openapi.json` e `/api-docs/openapi.json`
- **README Completo:** Instalacao, variaveis `.env` e declaracao de uso de IA
- **Colecao Postman:** `itaim-vende.postman_collection.json` com **11 pastas e 47 requisicoes**
- **Engenharia de Testes (`node:test`):**
  - **82 testes unitarios** (31 suites) + **68 testes de integracao** (7 arquivos, incluindo fluxo E2E de avaliacoes)
  - **Total: 150 testes executados em 38 suites — 150 aprovados e 0 falhos** *(com servidor local ativo; minimo do edital: 10)*

**Fala do Integrante 5 (Slide 10):**
> "Obrigado, [Integrante 4]. Para documentacao e consumo da API, entregamos quatro endpoints de documentacao seguindo OpenAPI 3.0.3 — `/api/v1/docs` e `/api-docs` com Swagger UI e `/api/v1/docs/openapi.json` e `/api-docs/openapi.json` com a especificacao JSON — alem do README e da colecao Postman com 11 pastas e 47 requisicoes. Na parte de testes, o edital pedia no minimo 10 testes automatizados. Nos implementamos **150 testes** usando o runner nativo `node:test`: sao 82 testes unitarios e 68 testes de integracao, incluindo o fluxo E2E de avaliacoes, contra a API e o PostgreSQL real. Com o servidor local ativo, todos os 150 testes passaram sem nenhuma falha."

---

### SLIDE 11: Demonstracao ao Vivo
**No slide:**
1. **Saude, Docs e Cache:** `/api/v1/health`, `/api/v1/docs` e `Cache-Control: public, max-age=300` em `/categories`
2. **Filtro Regional:** `GET /api/v1/products?city=Paulistana` e compartilhamento no WhatsApp
3. **Avaliacao com Transacao:** `POST /api/v1/reviews/user/:id` usando conta de teste (Recalculo atomico e atualizacao no site)
4. **Seguranca e RBAC (Contas de Teste):** Erro `400` Zod no registro, `401` sem token e **`403 Forbidden` em `GET /api/v1/reports` com conta de teste `BUYER`** *(sem usar bypass local de `/system`)*

**Fala do Integrante 5 (Slide 11):**
> "Agora vamos provar tudo isso funcionando ao vivo com contas de teste e o servidor conectado ao PostgreSQL. *(Executar na tela)*: Primeiro mostramos `/api/v1/health`, o Swagger UI em `/api/v1/docs` e o cabecalho de cache em `/categories`. Depois filtramos anuncios regionais de Paulistana e exibimos o compartilhamento para WhatsApp no produto. Em seguida enviamos uma avaliacao autenticada com conta compradora, vendo a transacao atualizar a media do vendedor no site. Para fechar a demo, mostramos a validacao Zod retornando 400 e uma conta de teste `BUYER` sendo barrada com 403 Forbidden em `/api/v1/reports`."

---

### SLIDE 12: Conclusao
**No slide:**
- **122 Endpoints sob `/api/v1/` (14 Modulos + 2 Raiz) + 4 Swagger | 150 Testes Aprovados**
- **PostgreSQL (`db push`) + Supabase Storage + Socket.IO (canal complementar) + OpenAPI 3.0.3**
- **Impacto Social:** Ferramenta regional sem taxas nem intermediacao financeira para o semiarido
- **Obrigado!** Perguntas da banca

**Fala do Integrante 5 (Slide 12):**
> "Com isso, encerramos nossa apresentacao entregando uma API RESTful funcional com 122 endpoints sob `/api/v1/`, documentacao OpenAPI, 150 testes automatizados aprovados com o servidor local ativo e repositorio versionado no GitHub sem arquivos `.env` expostos — mantendo transparencia tambem sobre os pontos de melhoria identificados na auditoria. Agradecemos ao professor Julian e colegas, e ficamos a disposicao para responder as perguntas da banca."
