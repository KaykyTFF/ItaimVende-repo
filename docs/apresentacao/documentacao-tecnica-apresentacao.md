# Apresentacao de Projeto de API Propria: Itaim Vende API RESTful

**Instituicao:** Instituto Federal de Educacao, Ciencia e Tecnologia do Piaui (IFPI)  
**Campus:** Campus Paulistana  
**Disciplina:** Programacao para Internet II  
**Docente:** Prof. Me. Julian Rodrigues Valerio  
**Projeto:** Itaim Vende — Plataforma e API RESTful Regional  
**Padrao Arquitetural:** RESTful / OpenAPI 3.0.3 / Node.js & PostgreSQL  
**Repositorio:** [README.md](../../README.md)  
**Relatorio de Inovacao:** [RELATORIO_INOVACAO.md](../../RELATORIO_INOVACAO.md)  
**Auditoria Tecnica:** [README_AUDITORIA_APRESENTACAO.md](../../README_AUDITORIA_APRESENTACAO.md)  
**Colecao Postman:** [itaim-vende.postman_collection.json](../../itaim-vende.postman_collection.json)  
**Dicionario de Rotas Frontend:** [rotas-mapa.js](../../frontend/js/core/rotas/rotas-mapa.js)  
**Servidor Express e Rotas Backend:** [server.js](../../backend/src/server.js)  

---

## Sumario Executivo da Apresentacao

Este documento contem o material de apoio tecnico, arquitetural e verbal atualizado apos auditoria direta do codigo-fonte e execucao real dos testes:
1. **Slide Deck Completo (Slides 1 a 14)**: conteudo visual para tela e roteiro de fala alinhados fielmente ao codigo implementado.
2. **Arquitetura Detalhada da API**: diagrama em camadas, middlewares globais, adapters de storage, fluxo REST e canal complementar em tempo real via Socket.IO.
3. **Esquema de Acesso e Governanca de Sessao**: protecao de interface no frontend (`protegerPagina`, apenas UX) e autorizacao real no backend (JWT configuravel + posse de recursos + RBAC `ADMIN`/`MODERATOR` em `/reports` e exclusivo `ADMIN` em `/system`).
4. **Mapa Completo de Rotas**: URLs limpas do frontend e inventario real de **122 endpoints registrados sob `/api/v1/`** (distribuidos em **14 modulos especializados** e **2 rotas na raiz do roteador `/api/v1`**), alem de **4 endpoints adicionais** para documentacao Swagger.
5. **Matriz de Conformidade dos 13 Requisitos do IFPI**: status real de atendimento com evidencias diretas de arquivos.
6. **Roteiro de Demonstracao Pratica (Live Demo)**: passos testados com contas de teste em execucao local.
7. **Guia de Defesa na Arguicao da Banca**: perguntas tecnicas previsiveis respondidas estritamente com base na implementacao atual.

--- 

## Slide Deck da Apresentacao

### Slide 1: Capa e Identificacao Institucional
- **Titulo Principal:** Itaim Vende API — Infraestrutura RESTful para o Comercio Regional do Semiarido Piauiense
- **Subtitulo:** Projeto de API Propria — Disciplina de Programacao para Internet II
- **Instituicao:** Instituto Federal do Piaui (IFPI) — Campus Paulistana
- **Docente Responsavel:** Prof. Me. Julian Rodrigues Valerio
- **Autores / Equipe:** Desenvolvedores do Projeto Itaim Vende
- **Stack Central:** Node.js (v24), Express 5.2, PostgreSQL (Supabase), Prisma ORM 6.19, Socket.IO 4.8, Zod 4.6, OpenAPI 3.0.3

> [!NOTE]
> **Roteiro de Fala (Slide 1):**
> "Bom dia a todos, professor Julian e colegas. Apresentamos o projeto final da disciplina de Programacao para Internet II: a Itaim Vende API. Projetamos e implementamos uma API RESTful original, concebida para atender as especificidades comerciais da microrregiao de Paulistana e do Vale do Itaim, no semiarido piauiense. Nosso trabalho superou o modelo basico de CRUD, construindo uma arquitetura em camadas com autenticacao JWT, controle administrativo RBAC, filtros regionais por cidade e bairro e operacoes criticas especificas protegidas por transacoes Prisma (`$transaction`)."

---

### Slide 2: O Problema Real e a Motivacao Regional
- **Contexto Observado pela Equipe:** Na vivencia cotidiana em Paulistana e municipios vizinhos (como Acaua, Betania do Piaui, Jacobina e Queimada Nova), observa-se que produtores rurais e pequenos lojistas costumam divulgar mercadorias em grupos informais de mensagens, onde as ofertas se perdem rapidamente no fluxo de conversas.
- **Necessidades Locais Identificadas:**
  - Organizacao de catalogo acessivel por cidade e bairro para que ofertas da comunidade tenham visibilidade regional.
  - Liberdade para negociacao direta e retirada/entrega combinada entre as partes, sem depender de logistica automatizada nem de gateway de pagamento integrado.
- **Proposta do Itaim Vende:** Vitrine digital e canal de aproximacao direta entre interessados e anunciantes locais, **sem cobranca de comissao pelo marketplace** e **sem intermediacao financeira ou frete obrigatorio**. *(Nota tecnica: embora o backend possua o modulo `/api/v1/orders` para formalizacao de registros sem taxas, a interface institucional atua como vitrine e negociacao direta).*

> [!NOTE]
> **Roteiro de Fala (Slide 2):**
> "Antes de projetar endpoints, partimos de um contexto observado pela equipe no comercio local de Paulistana e municipios vizinhos: pequenos produtores e lojistas acabam divulgando ofertas em grupos informais de mensagens, onde os anuncios se perdem e falta organizacao por cidade e bairro. O Itaim Vende foi desenhado como uma vitrine regional e canal direto de negociacao: a plataforma aproxima comprador e anunciante via chat e WhatsApp, sem intermediacao financeira, sem cobrar comissao sobre vendas e sem impor um sistema de frete."

---

### Slide 3: Posicionamento Regional e Eixos de Inovacao
Posicionamento arquitetural e funcional comprovado no codigo-fonte do **Itaim Vende** e contextualizado em [RELATORIO_INOVACAO.md](../../RELATORIO_INOVACAO.md) frente a duas referencias analisadas pela equipe (**Mercado Livre Developers API** e **OLX Brasil** — sem atribuir comportamentos generalizados a todas as plataformas externas):

| Eixo de Valor | Decisao de Projeto no Itaim Vende | Implementacao Verificavel no Codigo |
| :--- | :--- | :--- |
| **Foco no Comercio Regional** | Catalogo voltado a Paulistana e municipios do Vale do Itaim | Filtros por `city`/`cidade` e `neighborhood`/`bairro` com expansao de variantes locais (`expandirVariantesCidade` em `product.query.service.js`) |
| **Negociacao Direta** | Contato livre entre interessado e anunciante | Chat integrado com propostas formais (`OFFER_PROPOSAL`) e botao direto para WhatsApp (`wa.me`) na pagina do produto |
| **Modelo sem intermediacao financeira** | Ausencia de gateway de pagamento, custodia de valores e cobranca de comissao | Nenhuma taxa ou comissao aplicada em `order.creation.service.js` ou nos anuncios; combinacao de pagamento e retirada diretamente entre as partes |
| **Notificacoes e Contingencia** | Avisos internos persistidos no banco + atualizacao em tempo real | Eventos especificos (chat/propostas, favoritos, nova avaliacao, pedidos, moderacao e alteracoes de conta) gravam na tabela `Notification` e emitem `notification_new`/`badge_update` via Socket.IO; gatilho de e-mail externo para offline via Resend/SMTP (ou fallback simulado no terminal sem chave configurada) |
| **Reputacao Independente** | Avaliacao entre usuarios sem depender de pagamento interno | `POST /api/v1/reviews/user/:userId` calcula `ratingAverage` e `ratingCount` via `prisma.$transaction` |

**Eixos de Inovacao Atendidos (cf. [RELATORIO_INOVACAO.md](../../RELATORIO_INOVACAO.md)):**
1. **Dados e Dominio:** Cobertura regional do semiarido piauiense com filtros por cidade/bairro e normalizacao de acentos (`unaccent`).
2. **Impacto Social:** Ferramenta regional sem cobranca de comissao para dar visibilidade ao comercio local.
3. **Regra de Negocio Nao-Trivial:** Reputacao em `$transaction`, favoritos com deduplicacao de notificacao em 1 hora (`$transaction` + `favoritesCount`), purga de midias no Storage, cooldown de 30 dias em username e calculo server-side em pedidos.
4. **Tempo Real e Eventos:** Socket.IO com salas por usuario/conversa e persistencia de notificacoes internas para eventos mapeados (com disparo externo de e-mail condicionado a configuracao Resend/SMTP).

> [!NOTE]
> **Roteiro de Fala (Slide 3):**
> "O diferencial do Itaim Vende esta no alinhamento completo a realidade regional do Vale do Itaim. Em vez de exigir gateway de pagamento ou logistica automatizada — ou de diluir anuncios do interior em feeds estaduais amplos — optamos por uma solucao focada em catalogo regional por cidade e bairro, contato direto via chat e WhatsApp, ausencia total de comissao pelo marketplace e reputacao calculada no banco. Alem disso, eventos mapeados — como mensagens e propostas no chat, favoritos, nova avaliacao, pedidos, remocao pela moderacao e alteracoes de conta — geram notificacao persistida na tabela `Notification` e atualizacao em tempo real via Socket.IO, alem de integracao para e-mail externo quando o destinatario esta offline (via Resend ou SMTP, com fallback de log no terminal sem credenciais)."

---

### Slide 4: Arquitetura Geral da API e Fluxo Real de Execucao
Fluxo real de execucao implementado em [server.js](../../backend/src/server.js) e nos sub-roteadores de `backend/src/routes/`:

```
[ Cliente HTTP / Browser / Postman / Swagger ]     [ Socket.IO Client (WebSocket) ]
                     |                                           |
                     v  (HTTP + Bearer JWT)                      v
[ 1. Middlewares Globais do App (server.js) ]      [ Canal Complementar Socket.IO ]
  - Helmet (CORP: false, CSP: false)                 - initSocketServer(httpServer)
  - CORS (ENV.CORS_ORIGIN, expõe X-Server-Boot)      - Handshake JWT proprio (io.use)
  - Header X-Server-Boot + requestLogger             - Salas user:<id> e conversation:<id>
  - Rate Limit Global em /api (120 req/min prod)     - Eventos: notification_new, badge_update,
  - express.json / urlencoded (5MB) + sanitizeInput    new_message, proposal_received
                     |                                           |
                     v                                           |
[ 2. Roteamento (/api/v1 e alias /api) ]                         |
  - v1Router: 122 endpoints (14 Modulos + 2 Raiz)                |
  - + 4 rotas Swagger (/api/v1/docs, /api-docs,                  |
    /api/v1/docs/openapi.json, /api-docs/openapi.json)           |
                     |                                           |
                     v                                           |
[ 3. Middlewares de Rota (antes do Controller) ]                 |
  - Limitadores especificos (auth, upload, account)              |
  - Auth: authenticateToken / optionalAuth / requireSystemAccess |
  - RBAC: requireRole('ADMIN','MODERATOR') em /reports           |
          requireRole('ADMIN') em /system                        |
  - Multer (imagens ate 10MB em /upload) + validate (Zod)        |
                     |                                           |
                     v                                           |
[ 4. Controllers -> Services -> Persistencia ]                   |
  - Controllers extraem dados de req e chamam Services           |
  - Services: regras de negocio, Sharp WebP, EmailService        |
  - Prisma ORM 6.19.3 ($transaction pontual) -> PostgreSQL       |
  - Supabase Cloud Storage (bucket publico)                      |
  - Erros propagados via next(err) -> errorHandler (final do app)|
```

- **Componentes e Responsabilidades no Backend (`backend/src/`):**

| Camada | Diretorio / Arquivo | Responsabilidade Principal |
| :--- | :--- | :--- |
| **Entrada e Middlewares** | `server.js`, `middlewares/` | Seguranca (Helmet, CORS), Rate Limiting, Parsing, `sanitizeInput`, JWT, RBAC e validacao Zod |
| **Routes** | `routes/<modulo>/*.routes.js` | Mapeamento de endpoints sob `/api/v1/` e encadeamento de middlewares |
| **Controllers** | `controllers/<modulo>/` | Extracao de dados de `req`, acionamento dos services e emissao de respostas HTTP |
| **Services** | `services/<modulo>/` | Regras de negocio, `$transaction` pontuais, integracoes e limpeza no Supabase Storage |
| **Persistencia e Adapters** | `prisma/`, `adapters/`, `config/` | PostgreSQL (Prisma ORM `6.19.3`), Supabase Storage, Socket.IO e EmailService (Resend/SMTP) |

- **Principios REST Atendidos:**
  - **Cliente-Servidor e Camadas:** Separacao entre middlewares globais, roteadores, middlewares de rota, controllers, services e persistencia Prisma, com tratamento global de erros ao final do pipeline (`errorHandler`).
  - **Stateless:** Nenhuma sessao HTTP mantida em memoria para rotas REST; autenticacao via Bearer Token JWT.
  - **Cacheable:** `Cache-Control: public, max-age=300` implementado e validado em `GET /api/v1/categories` ([category.controller.js](../../backend/src/controllers/category/category.controller.js#L6)).
  - **Interface Uniforme:** Envelope JSON consistente, recursos identificados por URIs sob `/api/v1/` e codigos de status HTTP semanticos (ressalvando rotas legadas/pragmaticas com verbos consumidas pelo frontend).
  - **Canal Complementar Socket.IO:** O servidor Socket.IO (`initSocketServer(httpServer)`) compartilha o servidor HTTP como canal complementar em tempo real para eventos e badges, operando separado do fluxo HTTP REST stateless.

> [!NOTE]
> **Roteiro de Fala (Slide 4):**
> "Este diagrama reflete a ordem exata de execucao no `server.js`. Primeiro atuam os middlewares globais: Helmet (com CSP e CORP desabilitados para compatibilidade com os assets locais), CORS, logger, rate limiter global em `/api`, parser JSON de 5MB e `sanitizeInput`. Em seguida o `v1Router` casa a rota entre os 122 endpoints registrados (14 modulos + 2 rotas na raiz), aplicando os middlewares proprios de cada endpoint antes do controller: rate limit especifico, autenticacao (`authenticateToken`/`optionalAuth`), RBAC (`requireRole` com `ADMIN`/`MODERATOR` em `/reports` e exclusivo `ADMIN` em `/system`), Multer em `/upload` e validacao Zod nas rotas que declaram `validate`. Controllers acionam Services e o Prisma ORM sobre o PostgreSQL, com o `errorHandler` ao final do app. Paralelamente, o Socket.IO roda no mesmo servidor HTTP com handshake JWT proprio como canal complementar em tempo real, separado do ciclo REST stateless."

---

### Slide 5: Esquema de Acesso e Governanca de Sessao (Frontend e Backend)
Controle de acesso dividido entre interface (UX no navegador) e autorizacao efetiva no servidor — **a guarda de interface do frontend nao substitui a autorizacao realizada pelo backend**:

```
[ USUARIO / NAVEGADOR ]
        |
        +---> Rota Publica (/home, /produto, /categoria, /vendedor)
        |
        +---> Acao/Rota Protegida (/vender, /conversas, /perfil, /painel)
                   |
                   v
           [ Camada 1 - Frontend (Apenas UX / Anti-FOUC): sessao-ui.js ]
           protegerPagina() + Interceptor de cliques
           Sem sessao -> Modal Auth ou redirect /login (com returnTo)
           Com sessao -> Envia "Authorization: Bearer <JWT>"
                   |
                   v
           [ Camada 2 - Backend (Autorizacao Efetiva): auth.middleware.js ]
           jwt.verify(token, JWT_SECRET) [HS256, ENV.JWT_EXPIRES_IN]
           Consulta status do usuario no PostgreSQL
                   |
         +---------+---------+
         |                   |
     [ FALHA ]           [ SUCESSO ]
         |                   |
         v                   v
    HTTP 401/403       Autorizacao por Escopo:
    UNAUTHORIZED        - Usuario Autenticado (BUYER / SELLER):
    TOKEN_EXPIRED         Mesmo nivel de rotas REST com checagem de posse
    ACCOUNT_SUSPENDED   - ADMIN e MODERATOR: acesso a /api/v1/reports
                        - Exclusivo ADMIN: acesso a /api/v1/system
```

1. **Guarda de Interface no Frontend ([sessao-ui.js](../../frontend/js/core/sessao/sessao-ui.js#L445-L556) e [painel.html](../../frontend/pages/admin/painel.html#L57-L85)):**
   - **Apenas Protecao Visual/UX:** `protegerPagina()` e o script inline de `painel.html` evitam flash visual (anti-FOUC) e redirecionam visitantes para `/login` ou `/login-painel`, mas **nao substituem a seguranca de API no backend** (pois qualquer codigo no navegador pode ser inspecionado ou ignorado).
   - **Pontos de Melhoria Identificados no Frontend/Config/Backend:** Em [login-painel.js](../../frontend/js/pages/admin/login-painel.js#L25-L79, L225-L315), alem da chamada a `/api/v1/auth/login`, existem credenciais de desenvolvimento hardcoded no JavaScript de cliente; no backend, [auth.identity.service.js](../../backend/src/services/auth/auth.identity.service.js#L259-L260) contem verificacao de senha padrao em codigo para conta admin semeada, e [account.routes.js](../../backend/src/routes/account/account.routes.js#L39) ignora rate limit quando o cabecalho `x-test-runner` esta presente — pontos mapeados para endurecimento antes de implantacao definitiva em producao.

2. **Governanca no Backend ([auth.middleware.js](../../backend/src/middlewares/auth.middleware.js) e [system.routes.js](../../backend/src/routes/system/system.routes.js)):**
   - **JWT Stateless:** Emitido no login/cadastro usando `jsonwebtoken` (`HS256`), retornando `token` no nivel raiz do JSON em `POST /api/v1/auth/login` (`{ success: true, message, user, token }`), com expiracao configuravel via `ENV.JWT_EXPIRES_IN` (padrao `'2h'` em [env.js](../../backend/src/config/env.js#L55) e `.env.example`; `'7d'` no `.env` local). Em [env.js](../../backend/src/config/env.js#L54), existe fallback de `JWT_SECRET` apenas para ambiente nao produtivo (em `production`, a ausencia da variavel interrompe o boot).
   - **Verificacao Ativa de Conta:** `authenticateToken` consulta o usuario no PostgreSQL e bloqueia contas `BANNED` ou `SUSPENDED` com HTTP `403` (`ACCOUNT_SUSPENDED`).
   - **Segregacao Real de Papeis (RBAC):** O enum `UserRole` define `BUYER`, `SELLER`, `MODERATOR` e `ADMIN`. No codigo atual das rotas:
     - `BUYER` e `SELLER` possuem as mesmas permissoes de acesso a endpoints, operando com **validacao de posse** (`sellerId === req.user.id` ou `targetId === req.user.id`).
     - `/api/v1/reports` (rotas de moderacao) exige `ADMIN` ou `MODERATOR` via `requireRole('ADMIN', 'MODERATOR')`, retornando `403 Forbidden` para usuarios comuns.
     - `/api/v1/system` exige acesso exclusivo de `ADMIN` via `requireRole('ADMIN')`. *(Ressalva de desenvolvimento: em `NODE_ENV !== 'production'`, `system.routes.js:35-44` possui bypass para loopback `127.0.0.1` sem cabecalhos de proxy — ponto de melhoria a endurecer antes de exposicao externa).*

> [!NOTE]
> **Roteiro de Fala (Slide 5):**
> "Nosso esquema de acesso separa experiencia visual de seguranca real. No frontend, `protegerPagina()` faz o redirecionamento anti-FOUC para melhorar a navegacao, mas deixamos claro que a interface nao substitui a autorizacao do servidor. Toda validacao efetiva ocorre no backend: `authenticateToken` confere o JWT HS256 (com validade padrao de 2 horas via `JWT_EXPIRES_IN`) e verifica no banco se a conta esta ativa. Quanto ao RBAC, usuarios comuns (`BUYER` e `SELLER`) atuam sob validacao de posse dos proprios dados; ja `ADMIN` e `MODERATOR` tem acesso a `/api/v1/reports`, enquanto `/api/v1/system` e exclusivo de `ADMIN`. De forma transparente, tambem mapeamos na auditoria pontos de melhoria para producao: remover credenciais de dev hardcoded em `login-painel.js`, eliminar o bypass local de `127.0.0.1` em `/system` e garantir `JWT_SECRET` obrigatorio no ambiente."

---

### Slide 6: Mapa Completo de Rotas do Frontend (Clean URLs)
Mapeadas em [rotas-mapa.js](../../frontend/js/core/rotas/rotas-mapa.js) e servidas pelo roteador universal de [server.js](../../backend/src/server.js#L291-L405):

| URL Limpa (Canonica) | Arquivo Fisico HTML | Acesso UI | Descricao |
| :--- | :--- | :--- | :--- |
| `/` ou `/home` | `frontend/pages/home/home.html` | Publico | Vitrine principal de anuncios e busca regional |
| `/categoria` | `frontend/pages/produtos/categoria.html` | Publico | Catalogo com filtros de categoria, cidade, bairro e preco |
| `/produto` | `frontend/pages/produtos/produto.html` | Publico | Pagina de detalhes com injecao dinamica Open Graph no servidor |
| `/vendedor` | `frontend/pages/perfil/vendedor.html` | Publico | Perfil publico do anunciante, nota media e avaliacoes |
| `/vender` | `frontend/pages/vender/vender.html` | Protegido | Criacao de anuncio e upload de imagens WebP |
| `/meus-anuncios` | `frontend/pages/vender/meus-anuncios.html` | Protegido | Gerenciamento dos proprios anuncios e status |
| `/conversas` ou `/chat` | `frontend/pages/mensagens/conversas.html` | Protegido | Mensagens em tempo real (Socket.IO) e contrapropostas |
| `/perfil` | `frontend/pages/perfil/perfil.html` | Protegido | Dados pessoais, username, e-mail, telefone e avatar |
| `/configuracoes` | `frontend/pages/perfil/configuracoes.html` | Protegido | Preferencias, seguranca e exportacao LGPD |
| `/favoritos` | `frontend/pages/favoritos/favoritos.html` | Protegido | Listagem de anuncios salvos como favoritos |
| `/notificacoes` | `frontend/pages/notificacoes/notificacoes.html` | Protegido | Central de notificacoes e avisos |
| `/login` ou `/cadastro` | `frontend/index.html` | Publico | Autenticacao e cadastro de usuarios |
| `/reverter-telefone` | `frontend/pages/auth/reverter-telefone.html` | Publico | Reversao emergencial de alteracao de telefone via token |
| `/termos` / `/termos-de-uso` | `frontend/pages/institucional/termos-de-uso.html` | Publico | Termos de Uso do classificado regional |
| `/privacidade` | `frontend/pages/institucional/politica-de-privacidade.html` | Publico | Politica de Privacidade (LGPD) |
| `/cookies` | `frontend/pages/institucional/politica-de-cookies.html` | Publico | Politica e consentimento de cookies |
| `/login-painel` / `/login-tickets` | `frontend/pages/admin/login-painel.html` | Publico | Telas dedicadas de entrada administrativa |
| `/painel` / `/status` | `frontend/pages/admin/painel.html` | Admin (UI) | Painel operacional e status do sistema |
| `/tickets` / `/moderacao` | `frontend/pages/admin/tickets.html` | Admin (UI) | Triagem de denuncias e moderacao |
| `/404` | `frontend/404.html` | Publico | Pagina de erro semantico para URLs inexistentes |

> [!NOTE]
> **Roteiro de Fala (Slide 6):**
> "No frontend, implementamos Clean URLs mapeadas tanto em `rotas-mapa.js` quanto no servidor Express em `server.js`. O usuario acessa `/home`, `/produto`, `/vender` ou `/conversas` sem precisar expor caminhos fisicos `.html`. Inclusive, na rota `/produto`, o servidor intercepta a requisicao HTML antes de entregar ao navegador para injetar dinamicamente as meta tags Open Graph do anuncio pesquisado no PostgreSQL."

---

### Slide 7: Mapa Real dos 14 Modulos e 122 Endpoints da API (/api/v1)
Inventario verificado em `backend/src/server.js:244-275` e `backend/src/routes/`: **122 endpoints registrados sob `/api/v1/`** (distribuidos em **14 modulos especializados** e **2 rotas adicionais na raiz do roteador `/api/v1`**: `/health` e `/usernames/availability`), alem de **4 endpoints adicionais** para documentacao Swagger:

| # | Modulo | Rota Canonica (Principais Operacoes) | Metodos | Permissao Backend | Qtd. Endpoints |
| :-: | :--- | :--- | :--- | :--- | :-: |
| 1 | `auth` | `/api/v1/auth/register`, `/login`, `/google`, `/me`, `/password` | `GET, POST, PUT, PATCH, DELETE` | Publico / JWT | 18 |
| 2 | `account` | `/api/v1/account/username`, `/email/*`, `/phone/*`, `/preferences`, `/privacy/*` | `GET, POST, PATCH, DELETE` | Optional / JWT | 17 |
| 3 | `products` | `/api/v1/products`, `/me`, `/seller/:sellerId`, `/:id`, `/:id/status`, `/:id/contact` | `GET, POST, PUT, PATCH, DELETE` | Publico / JWT (Posse) | 9 |
| 4 | `categories` | `/api/v1/categories` | `GET` | Publico (`Cache-Control`) | 1 |
| 5 | `orders` | `/api/v1/orders`, `/:id` | `GET, POST` | JWT | 3 |
| 6 | `chat` | `/api/v1/chat/conversations/*`, `/messages/:id/status` | `GET, POST, PATCH` | JWT (Participante) | 11 |
| 7 | `favorites` | `/api/v1/favorites`, `/:productId` | `GET, POST, PUT, DELETE` | JWT | 7 |
| 8 | `upload` | `/api/v1/upload/perfil`, `/vendas`, `/chat` | `POST` | JWT + RateLimit | 9 |
| 9 | `reviews` | `/api/v1/reviews/user/:userId`, `/:id`, `/:id/replies` | `GET, POST, PUT, PATCH, DELETE` | Publico / JWT (Posse) | 6 |
| 10 | `reports` | `/api/v1/reports/:productId`, `/ticket/:protocolOrId`, `/`, `/:id/product` | `GET, POST, PATCH, DELETE` | Optional / `ADMIN, MODERATOR` | 10 |
| 11 | `system` | `/api/v1/system/status`, `/diagnostics`, `/storage/*`, `/data/*` | `GET, POST, PATCH` | `ADMIN` *(bypass loopback dev)* | 13 |
| 12 | `addresses` | `/api/v1/addresses`, `/:id`, `/:id/primary` | `GET, POST, PUT, DELETE, PATCH` | JWT (Posse) | 6 |
| 13 | `notifications` | `/api/v1/notifications`, `/counts`, `/:id/read`, `/read-all` | `GET, PATCH, DELETE` | JWT | 7 |
| 14 | `users` | `/api/v1/users/:id`, `/:userId/reviews` | `GET, POST` | Publico / JWT | 3 |
| - | Raiz `v1Router` | `/api/v1/health`, `/api/v1/usernames/availability` | `GET` | Publico / Optional | 2 |

**Padroes de Nomenclatura, Consulta e Resposta REST:**
- **Nomenclatura:** Os recursos principais de dados utilizam substantivos no plural em minusculas (`/products`, `/categories`, `/reviews`, `/users`, `/orders`, `/favorites`, `/notifications`, `/reports`, `/addresses`), coexistindo com modulos singulares (`/auth`, `/account`, `/chat`, `/upload`, `/system`) e endpoints com verbos usados diretamente pelo frontend e pelos testes (como `/auth/login`, `/favorites/:productId/toggle` e `/system/data/*/:id/toggle`).
- **Consultas de Colecao (`GET /api/v1/products` em [product.query.service.js](../../backend/src/services/product/product.query.service.js)):** Paginacao (`page`, padrao `1`; `limit`, padrao `24`, teto `50`), filtros (`search` com `unaccent_text`, `categoryId`, `category`, `city`/`cidade`, `neighborhood`/`bairro`, `minPrice`, `maxPrice`, `condition` em `NOVO|SEMINOVO|USADO|DEFEITO`) e ordenacao (`sort=newest|oldest|price_asc|price_desc|popular`).
- **Status Codes Empregados:** `200 OK`, `201 Created`, `204 No Content`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `409 Conflict`, `500/503`. *(Ressalva em codigo: em `product.query.service.js:281-293`, `GET /api/v1/products/:id` possui fallback para retornar o anuncio ativo mais recente caso o identificador nao exista e haja produtos no banco, retornando `404` apenas se a tabela estiver vazia).*

> [!NOTE]
> **Roteiro de Fala (Slide 7):**
> "Enquanto o edital pedia no minimo 4 recursos, nossa API disponibiliza 122 endpoints registrados sob `/api/v1/` — distribuidos entre 14 modulos especializados (incluindo `/account`) e 2 rotas na raiz do roteador (`/health` e `/usernames/availability`) — alem de 4 endpoints adicionais para documentacao Swagger. Os recursos principais seguem substantivos no plural com metodos HTTP semanticos, usando PATCH para mudancas parciais e DELETE com retorno 204, mantendo tambem rotas com verbos que sao consumidas diretamente pelo frontend atual."

---

### Slide 8: Regras de Negocio Complexas (Alem do CRUD)
Regras reais implementadas e comprovadas nos services do backend:

1. **Calculo de Reputacao via `prisma.$transaction` e Controle de Duplicidade ([review.mutation.service.js](../../backend/src/services/review/review.mutation.service.js#L42-L93)):**
   - `POST /api/v1/reviews/user/:userId` obtem o autor exclusivamente pelo JWT (`req.user.id`) e bloqueia autoavaliacao (`400`).
   - **Verificacao na logica do service vs restricao no banco:** Antes da transacao, o service verifica duplicidade por meio de `prisma.review.findFirst({ where: { authorId, targetId } })` (retornando `400`). No `schema.prisma`, a tabela `Review` **nao possui restricao `@@unique([authorId, targetId])`** no PostgreSQL; portanto, o bloqueio de duplicidade decorre da regra de aplicacao no service e nao de unicidade fisica garantida contra requisicoes simultaneas no banco.
   - **Operacoes na transacao:** Em `createReview`, `updateReview` e `deleteReview`, um bloco `prisma.$transaction` agrupa a gravacao/alteracao/exclusao em `Review`, a consulta de todas as notas recebidas pelo vendedor, o calculo da media arredondada em 2 casas e a atualizacao de `ratingAverage` e `ratingCount` em `User`.

2. **Negociacao em Tempo Real, Notificacoes Persistidas e E-mail Offline ([message.service.js](../../backend/src/services/chat/message.service.js#L122-L225), [notification.service.js](../../backend/src/services/notification/notification.service.js#L324-L356)):**
   - Suporta mensagens e propostas formais (`OFFER_PROPOSAL`), entrega em sala Socket.IO (`new_message`, `proposal_received`) e aceite/recusa via `PATCH /api/v1/chat/messages/:id/status`.
   - **Persistencia vs tempo real em notificacoes:** Eventos especificos — envio de mensagens/propostas e aceite/recusa no chat, adicao de favorito, nova avaliacao recebida, criacao de pedido, remocao de anuncio pela moderacao e alteracao de e-mail, telefone ou username — acionam `createNotification()`, persistindo o registro na tabela `Notification` do PostgreSQL. Quando a categoria nao esta desativada nas preferências do usuario, o servidor tambem envia em tempo real os eventos `notification_new` e `badge_update` via Socket.IO. *(Demais acoes, como publicar produto, editar/responder avaliacao ou abrir denuncia, nao geram registros em `Notification`)*.
   - **E-mail offline:** Quando `!isUserOnline(recipientId)` e verdadeiro no envio de mensagem, criacao de pedido ou venda, o backend aciona o envio de e-mail externo, que **depende da configuracao de `RESEND_API_KEY` ou servidor `SMTP`**; sem essas credenciais no `.env`, utiliza apenas o **fallback de log simulado no terminal** (`email.service.js:72-86`).

3. **Compartilhamento WhatsApp e Contagem de Contatos ([produto-acoes.js](../../frontend/js/pages/produtos/produto/produto-acoes.js#L205-L359) e [product.mutation.service.js](../../backend/src/services/product/product.mutation.service.js#L418-L430)):**
   - A interface gera link oficial `https://wa.me/?text=...` com titulo, preco (ou `"Doacao (Gratuito)"`), URL canonica e assinatura regional, alem de copia para clipboard com fallback.
   - No backend, `POST /api/v1/products/:id/contact` incrementa o contador `contactsCount` na tabela `Product`. **Ressalva:** a interface de compartilhamento/WhatsApp (`produto-acoes.js`) **ainda nao aciona esse endpoint** no frontend ao clicar nos botoes, nem inclui cidade/bairro na mensagem do popover (a localizacao aparece nas tags Open Graph geradas por `server.js`).

4. **Moderacao com Limpeza Fisica de Midia no Supabase Storage ([report.mutation.service.js](../../backend/src/services/report/report.mutation.service.js#L142-L225)):**
   - `DELETE /api/v1/reports/:id/product` (restrito a `ADMIN` e `MODERATOR`) marca o anuncio como `REJEITADO` (`deletedAt`), remove `ProductImage`, resolve o ticket e chama `removerImagensDoStorage()` -> `SupabaseStorageAdapter.delete()` em lote, tratando eventuais falhas remotas com aviso em log sem interromper a moderacao. *(Nota: essa rotina executa chamadas sequenciais no Prisma, sem `prisma.$transaction`).*

5. **Integridade de Precos Server-Side ([order.creation.service.js](../../backend/src/services/order/order.creation.service.js#L10-L71)):**
   - Em `POST /api/v1/orders`, o backend ignora valores enviados pelo cliente e consulta os precos vigentes diretamente no banco para calcular `totalAmount` dentro de `prisma.$transaction`, sem adicionar taxas ou comissoes.

6. **Favoritos com Contagem Atomica e Anti-Spam de Notificacao ([favorite.mutation.service.js](../../backend/src/services/favorite/favorite.mutation.service.js#L1-L100)):**
   - Utiliza chave composta `userId_productId` (`@@unique([userId, productId])`) e `prisma.$transaction` para inserir/remover em `Favorite` e incrementar/decrementar `favoritesCount` em `Product`, evitando auto-notificacao ao proprio vendedor (`sellerId !== userId`) e aplicando cooldown de 1 hora (`umaHoraAtras`) contra spam de notificacoes ao favoritar repetidamente.

> [!NOTE]
> **Roteiro de Fala (Slide 8):**
> "Aqui estao as regras que vao alem do CRUD simples. Primeiro, no sistema de avaliacoes, o `findFirst` no service barra avaliacoes duplicadas em fluxo normal — ressaltando que nao ha `@@unique` no banco — e usamos `prisma.$transaction` ao criar, editar ou excluir avaliacoes para manter `ratingAverage` e `ratingCount` sincronizados com a tabela `User`. Segundo, no chat Socket.IO, eventos mapeados (como mensagens/propostas no chat, favoritos, nova avaliacao, pedidos, remocao na moderacao e mudancas na conta) sao persistidos na tabela `Notification` e enviados em tempo real quando habilitados nas preferencias; para usuarios offline, o backend chama o envio de e-mail via Resend/SMTP, operando em fallback simulado no terminal se nao houver chaves configuradas. Terceiro, o compartilhamento no WhatsApp e o endpoint `/products/:id/contact` existem, ressalvando que a UI atual ainda nao aciona essa contagem no clique. Por fim, a moderacao em `DELETE /reports/:id/product` remove imagens no Supabase Storage."

---

### Slide 9: Seguranca, Validacao Zod e Tratamento de Erros
Estrutura verificada em [validate.middleware.js](../../backend/src/middlewares/validate.middleware.js) e [error.middleware.js](../../backend/src/middlewares/error.middleware.js):

- **Validacao Declarativa com Zod:** Rotas configuradas com `validate(schema, source)` validam `body`, `params` e `query` antes de atingir os controllers; outras rotas (como `reviews`) validam regras nos services lancando `AppError`.
- **Estrutura Real de Resposta de Erro de Validacao (comprovada ao vivo):**
  ```json
  {
    "success": false,
    "code": "VALIDATION_ERROR",
    "message": "Falha na validação dos dados enviados.",
    "detalhes": [
      {
        "field": "email",
        "message": "Invalid input: expected string, received undefined"
      }
    ],
    "details": [...],
    "errors": [...]
  }
  ```
- **Mapeamento de Erros do Prisma no Middleware Global:** Trata automaticamente `P2002` -> `409 DUPLICATE_ENTRY`, `P2025` -> `404 NOT_FOUND`, `P2003` -> `400 FOREIGN_KEY_VIOLATION`, `TokenExpiredError` -> `401 TOKEN_EXPIRED` e falhas de conexao -> `503 DATABASE_UNAVAILABLE`.
- **Politica de Credenciais e Pontos de Melhoria Auditados:** `backend/.env` nao e versionado no Git (confirmado via `git ls-files`). Contudo, a auditoria identificou pontos de melhoria no codigo atual antes de producao:
  1. Credenciais de desenvolvimento presentes em texto claro no arquivo cliente [login-painel.js](../../frontend/js/pages/admin/login-painel.js#L25-L79).
  2. Verificacoes de senha padrao de desenvolvimento presentes em [auth.identity.service.js](../../backend/src/services/auth/auth.identity.service.js#L259-L260) para conta admin semeada.
  3. Fallback de `JWT_SECRET` para ambiente nao produtivo em [env.js](../../backend/src/config/env.js#L54) (em `production`, o boot exige a variavel).
  4. Bypass de desenvolvimento para `127.0.0.1` na rota `/api/v1/system/*` em [system.routes.js](../../backend/src/routes/system/system.routes.js#L35-L44) e bypass de rate limit com cabecalho `x-test-runner` em [account.routes.js](../../backend/src/routes/account/account.routes.js#L39).

> [!NOTE]
> **Roteiro de Fala (Slide 9):**
> "As entradas principais da API sao validadas com schemas Zod atraves do `validate.middleware.js`, respondendo com codigo 400 e payload padronizado (`code: VALIDATION_ERROR` e detalhamento dos campos). Alem disso, o `error.middleware.js` centraliza erros de JSON malformado, expiracao de JWT e codigos do Prisma. Quanto a credenciais, o arquivo `backend/.env` esta fora do GitHub, porem mantemos transparencia sobre os pontos de melhoria mapeados na auditoria para endurecimento em producao: credenciais de dev em `login-painel.js` e `auth.identity.service.js`, fallback de `JWT_SECRET` em `env.js` fora de producao e bypasses de desenvolvimento em `/system` (`127.0.0.1`) e `/account` (`x-test-runner`)."

---

### Slide 10: Persistencia e Modelagem de Dados
Verificado diretamente em [schema.prisma](../../backend/prisma/schema.prisma) e [setup-unaccent.js](../../backend/scripts/setup-unaccent.js):

- **Banco de Dados:** PostgreSQL hospedado no Supabase (`CONECTADO E RESPONDENDO` no boot).
- **ORM e Sincronizacao:** Prisma Client `6.19.3` com schema declarativo sincronizado via `prisma db push` (`"prisma:push": "prisma db push"` em `backend/package.json`), extensoes SQL (`unaccent` e `pg_trgm`) via `scripts/setup-unaccent.js` e dados iniciais via `prisma/seed.js`. *(Observacao importante: o projeto nao utiliza pasta `prisma/migrations/` nem script SQL isolado de `CREATE TABLE`; por isso, o requisito de script de criacao ou migracoes e classificado como parcialmente atendido).*
- **Modelos e Relacionamentos Centrais:**
  - `User` 1:N `Product` (`sellerId`, `onDelete: Cascade`), com campos `city`, `state`, `neighborhood`, `ratingAverage`, `ratingCount`.
  - `User` 1:N `Review` em relacao dupla (`ReviewsGiven` via `authorId` e `ReviewsReceived` via `targetId`). *(Nota: a unicidade de uma avaliacao por comprador/vendedor e verificada pela logica do service, sem garantia de unicidade fisica no banco).*
  - `Product` 1:N `Conversation`; `User` 1:N `Conversation`; `Conversation` 1:N `Message` (`messageType`, `offerValue`, `offerStatus`).
  - `Product` 1:N `Report` (protocolo `TK-...` derivado dos ultimos 6 caracteres do `id` em `report.mutation.service.js`).
  - Modelos de apoio e governanca: `Category` (auto-relacionamento hierarquico), `ProductImage`, `Address`, `Notification`, `Favorite`, `Order`, `OrderItem`, `AuditLog`, `UsernameHistory`, `EmailChangeRequest`, `PhoneHistory`, `PhoneChangeRequest`.
- **Indices Implementados no Banco:** Indices compostos em `Product` (`[status, createdAt]`, `[status, city, categoryId, createdAt]`, `[sellerId, status]`, `[slug]`, `[price]`), `User` (`[email]`, `[city, state]`, `[status]`), `Conversation`, `Message`, `Review` (`[targetId]`), `Report` (`[productId, status]`) e indice GIN Trigram `Product_title_unaccent_trgm_idx`.

> [!NOTE]
> **Roteiro de Fala (Slide 10):**
> "Utilizamos PostgreSQL gerenciado no Supabase com o schema declarativo modelado no Prisma ORM 6 e sincronizado via `prisma db push`, complementado pelo script `setup-unaccent.js` para habilitar buscas sem acento. O modelo contempla entidades regionais com cidade e bairro, relacionamento duplo em Review para distinguir quem avalia de quem e avaliado, historico completo de conversas com contrapropostas e indices compostos de consulta rapida em produtos, mensagens e usuarios."

---

### Slide 11: Documentacao Interativa e Colecao Postman
- **Especificacao OpenAPI 3.0.3 Completa:**
  - Definida em [openapi.js](../../backend/src/docs/openapi.js) e [openapi.json](../../backend/src/docs/openapi.json) (`version: 2.0.0`).
  - **4 endpoints de documentacao registrados em [server.js](../../backend/src/server.js#L277-L284):**
    - Swagger UI interativo: `http://localhost:3000/api/v1/docs` e `http://localhost:3000/api-docs`
    - Especificacao JSON OpenAPI: `http://localhost:3000/api/v1/docs/openapi.json` e `http://localhost:3000/api-docs/openapi.json`
- **Colecao Postman Oficial:**
  - Arquivo [itaim-vende.postman_collection.json](../../itaim-vende.postman_collection.json) na raiz do repositorio contendo **11 pastas organizadas** e **47 requisicoes** com exemplos de sucesso e erro.
- **README Principal:**
  - [README.md](../../README.md) com instrucoes de instalacao, variaveis de ambiente e declaracao de uso de IA.

> [!NOTE]
> **Roteiro de Fala (Slide 11):**
> "Para atender integralmente a documentacao, disponibilizamos o Swagger UI interativo em `/api/v1/docs` com especificacao OpenAPI 3.0.3, alem do `README.md` detalhado e da colecao Postman na raiz do projeto com 11 pastas e 47 requisicoes cobrindo fluxos de sucesso e cenarios de erro."

---

### Slide 12: Engenharia de Testes Automatizados
Resultados reais comprovados por execucao direta com `node --test` (`node:test`):

- **Runner Nativo:** `node --test` com `node:assert/strict`.
- **Suíte Unitaria (`npm --prefix backend run test:unit`):**
  - **82 testes unitarios** em **31 suítes** (6 arquivos em `backend/tests/unit/`).
  - Executada de forma isolada sem servidor: **82 aprovados, 0 falhos**.
  - Cobre RBAC do painel admin, formatadores e integridade de pedidos, governanca LGPD e cookies, regras de reputacao, schemas Zod e compartilhamento WhatsApp/Open Graph.
- **Suíte de Integracao (`backend/tests/*.test.js`):**
  - **68 testes de integracao** em **7 arquivos**, incluindo o fluxo E2E de avaliacoes ([reviews-e2e.test.js](../../backend/tests/reviews-e2e.test.js) [10]) alem das suites HTTP (`api.test.js` [14], `notification.test.js` [11], `account-phone.test.js` [10], `rest-conformance.test.js` [9], `username-cooldown.test.js` [9], `account-email.test.js` [5]).
  - Valida endpoints reais contra o PostgreSQL (Supabase), autenticacao JWT, RBAC `403` em `/reports`, validacao Zod `400`, `Cache-Control`, cooldown de 30 dias e transacoes em avaliacoes.
- **Resultado Consolidado (`npm --prefix backend run test` com servidor local em `localhost:3000`):**
  - **150 testes executados em 38 suítes: 150 aprovados, 0 falhos, 0 ignorados** (`~41.67s`). *(Nota: sem o servidor HTTP ligado, os 82 unitarios e os 10 testes de avaliacoes em `reviews-e2e.test.js` passam = 92, enquanto os 58 testes HTTP falham por `ECONNREFUSED`).*

> [!NOTE]
> **Roteiro de Fala (Slide 12):**
> "O edital exigia no minimo 10 testes automatizados. Nos entregamos **150 testes automatizados** usando o runner nativo do Node.js: sao 82 testes unitarios e 68 testes de integracao — incluindo o fluxo E2E de avaliacoes — contra a API e o PostgreSQL real. Executando a suite completa com o servidor local ativo, todos os 150 testes passam sem nenhuma falha."

---

### Slide 13: Roteiro da Demonstracao ao Vivo (Live Demo)
Passo a passo testado para execucao ao vivo com contas de teste e banco PostgreSQL/Supabase ativo:

1. **Passo 1 — Consulta Publica, Filtros e Cache HTTP:**
   - `GET http://localhost:3000/api/v1/health` (`200`, banco conectado).
   - `GET http://localhost:3000/api/v1/categories` mostrando o header `Cache-Control: public, max-age=300`.
   - `GET http://localhost:3000/api/v1/products?city=Paulistana&page=1&limit=5&sort=price_asc` exibindo paginacao, filtro regional e ordenacao reais.
2. **Passo 2 — Login e Extracao de Token JWT:**
   - `POST http://localhost:3000/api/v1/auth/login` com conta de teste (`BUYER`/`SELLER`) retornando `200` e `token` JWT no nivel raiz do JSON (`{ success: true, message, user, token }`).
3. **Passo 3 — Rota Protegida Autenticada:**
   - `GET http://localhost:3000/api/v1/auth/me` enviando `Authorization: Bearer <TOKEN>` (retornando `200` com o usuario autenticado; e `401 UNAUTHORIZED` quando chamado sem token).
4. **Passo 4 — Validacao Zod (400) e Criacao de Recurso (201):**
   - Enviar payload invalido em `POST /api/v1/products` ou `/auth/register` para evidenciar `400 VALIDATION_ERROR` com detalhamento de campos.
   - Enviar `POST /api/v1/products` com `Authorization: Bearer <TOKEN>` e JSON valido (`title`, `description`, `price` obrigatorios; opcionais `city`, `neighborhood`, `condition`), obtendo `201 Created`.
5. **Passo 5 — Regra de Negocio (`$transaction`) e Compartilhamento:**
   - `POST /api/v1/reviews/user/:userId` com token de conta compradora atualizando `ratingAverage` e `ratingCount` em transacao unica, exibido em `GET /api/v1/reviews/user/:userId` e no perfil do vendedor; demonstrar tambem o botao WhatsApp na pagina do produto.
6. **Passo 6 — Segregacao RBAC (`403 Forbidden` Real):**
   - Chamar `GET http://localhost:3000/api/v1/reports` usando token de conta comum (`BUYER`/`SELLER`), comprovando o bloqueio `403 Forbidden`. *(Nao utilizar `/api/v1/system` via `127.0.0.1` em modo `development` como evidencia de RBAC, pois o servidor aplica bypass local para loopback nesse ambiente).*
7. **Passo 7 — Documentacao OpenAPI Interativa:**
   - Abrir `http://localhost:3000/api/v1/docs` no navegador mostrando o Swagger UI `OpenAPI 3.0.3`.

> [!NOTE]
> **Roteiro de Fala (Slide 13):**
> "Agora executaremos a demonstracao ao vivo com o servidor local conectado ao PostgreSQL do Supabase. Seguimos o fluxo completo: consultamos `/health`, o cache HTTP em `/categories` e a listagem paginada e ordenada de `/products` filtrada por Paulistana; fazemos login em `POST /auth/login` obtendo o `token` na raiz da resposta; acessamos `/auth/me` com Bearer JWT (e mostramos o 401 sem token); exibimos a validacao Zod retornando 400 e criamos um anuncio real com 201; demonstramos a regra de negocio de avaliacao com `$transaction`; comprovamos o RBAC com 403 Forbidden ao tentar acessar `/reports` com conta comum; e encerramos no Swagger UI em `/api/v1/docs`."

---

### Slide 14: Conclusao e Resultados
- **Sintese dos Resultados Comprovados:**
  - API RESTful funcional com **122 endpoints registrados sob `/api/v1/`** (distribuidos em **14 modulos especializados** e **2 rotas na raiz do roteador**), alem de **4 endpoints adicionais** para documentacao Swagger.
  - Persistencia real em PostgreSQL (Supabase) via `prisma db push` + armazenamento WebP no Supabase Storage + canal complementar Socket.IO.
  - Documentacao OpenAPI `3.0.3` interativa (Swagger UI) + Colecao Postman (11 pastas, 47 requisicoes) + README.
  - **150 testes automatizados** (`82 unitarios + 68 de integracao`, incluindo fluxo E2E de avaliacoes) aprovados em execucao real com o servidor local ativo.
- **Impacto Social:** Ferramenta desenhada para dar visibilidade e autonomia de negociacao aos produtores e lojistas do semiarido piauiense.

> [!NOTE]
> **Roteiro de Fala (Slide 14):**
> "Concluimos nossa apresentacao com uma API RESTful funcional de ponta a ponta, com 122 endpoints registrados sob `/api/v1/`, conectada a banco relacional real, documentada com OpenAPI, validada por 150 testes automatizados e alinhada a uma necessidade real da comunidade de Paulistana e microrregiao. Agradecemos ao professor Julian pela orientacao e ficamos a disposicao para a arguicao."

---

## Matriz de Conformidade dos 13 Requisitos do IFPI

| # | Requisito Obrigatorio | Status Real | Evidencia Direta no Codigo |
| :-: | :--- | :---: | :--- |
| **1** | **Recursos (min. 4)** | **CONFIRMADO** | 14 modulos especializados e 2 rotas raiz montados em [server.js](../../backend/src/server.js#L244-L270), totalizando 122 endpoints sob `/api/v1/` (mais 4 de documentacao Swagger). |
| **2** | **Principios REST** | **CONFIRMADO** | Stateless via JWT, `Cache-Control: public, max-age=300` em [category.controller.js](../../backend/src/controllers/category/category.controller.js#L6), arquitetura em camadas (com Socket.IO como canal complementar separado do REST). |
| **3** | **Nomenclatura (plural, sem verbos)** | **PARCIAL** | Recursos principais no plural sem verbos (`/products`, `/reviews`, `/users`, etc.); modulos singulares (`/auth`, `/account`, `/chat`, `/upload`, `/system`) e rotas com verbos (`/auth/login`, `/favorites/:productId/toggle`, `/system/data/*/:id/toggle`) sao utilizados diretamente pelo frontend e testes. |
| **4** | **Verbos e Status HTTP** | **CONFIRMADO (com ressalva)** | `GET, POST, PUT, PATCH, DELETE` e codigos `200, 201, 204, 400, 401, 403, 404, 409` tratados nas rotas e em [error.middleware.js](../../backend/src/middlewares/error.middleware.js). *(Ressalva: `GET /api/v1/products/:id` retorna o produto mais recente como fallback em `product.query.service.js:281-293` quando existem anuncios no banco).* |
| **5** | **Paginacao, Filtro e Ordenacao** | **CONFIRMADO** | `GET /api/v1/products` com `page`, `limit` (padrao `24`, teto `50`), `sort` (`newest`, `oldest`, `price_asc`, `price_desc`, `popular`), `city`/`cidade`, `neighborhood`/`bairro`, `category`, `categoryId`, `search`, `minPrice`, `maxPrice`, `condition` em [product.query.service.js](../../backend/src/services/product/product.query.service.js). |
| **6** | **Versionamento na URI** | **CONFIRMADO** | Rotas montadas sob `/api/v1/` em [server.js](../../backend/src/server.js#L273). |
| **7** | **Inovacao Tecnica (nao-CRUD)** | **CONFIRMADO** | Reputacao em `$transaction` ([review.mutation.service.js](../../backend/src/services/review/review.mutation.service.js)), favoritos com deduplicacao 1h e `favoritesCount` ([favorite.mutation.service.js](../../backend/src/services/favorite/favorite.mutation.service.js)), busca `unaccent`, Socket.IO com notificacoes persistidas em `Notification` + gatilho de e-mail offline e cooldown de 30 dias em username. |
| **8** | **Autenticacao e RBAC (min. 2 papeis)** | **CONFIRMADO (com ressalva)** | JWT `authenticateToken` + segregacao real por papel no backend: usuarios comuns autenticados (`BUYER`/`SELLER`, validados por posse) vs `ADMIN`/`MODERATOR` em `/api/v1/reports` ([report.routes.js](../../backend/src/routes/report/report.routes.js)) e exclusivo `ADMIN` em `/api/v1/system` ([system.routes.js](../../backend/src/routes/system/system.routes.js)). |
| **9** | **Validacao e Erros Padronizados** | **CONFIRMADO** | Zod em [validate.middleware.js](../../backend/src/middlewares/validate.middleware.js) + tratamento central em [error.middleware.js](../../backend/src/middlewares/error.middleware.js). |
| **10** | **Persistencia em BD Real** | **PARCIAL** | PostgreSQL real no Supabase via [schema.prisma](../../backend/prisma/schema.prisma), `npm run prisma:push`, [setup-unaccent.js](../../backend/scripts/setup-unaccent.js) e [seed.js](../../backend/prisma/seed.js); **nao ha pasta `prisma/migrations/` nem script SQL isolado de `CREATE TABLE`**. |
| **11** | **Documentacao (OpenAPI + README)** | **CONFIRMADO** | Swagger UI em `/api/v1/docs`, OpenAPI 3.0.3 em [openapi.json](../../backend/src/docs/openapi.json) e [README.md](../../README.md). |
| **12** | **Testes (min. 10) e Postman** | **CONFIRMADO** | **150/150 testes passando** com servidor ativo (`82 unitarios + 68 de integracao`, incluindo fluxo E2E de avaliacoes) + [itaim-vende.postman_collection.json](../../itaim-vende.postman_collection.json) (11 pastas, 47 requisicoes). |
| **13** | **Versionamento no GitHub** | **PARCIAL** | Historico Git ativo e `.env` fora do repositorio; porem ha credenciais de dev hardcoded em `login-painel.js`, senha padrao em `auth.identity.service.js`, fallback de `JWT_SECRET` em `env.js`, bypass de dev `127.0.0.1` em `system.routes.js` e skip `x-test-runner` em `account.routes.js`. |

---

## Guia de Defesa na Arguicao da Banca

### Pergunta 1: "Qual e o principal diferencial da API do Itaim Vende para o comercio regional?"
**Resposta Recomendada:**  
"O foco hiperlocal combinado a negociacao direta sem taxas intermediarias pelo marketplace. Nossa API estrutura filtros por municipios e bairros de Paulistana e cidades do Vale do Itaim (com expansao de variantes em `expandirVariantesCidade`), facilita o contato direto via chat com contrapropostas e WhatsApp, nao cobra comissao nem exige gateway de pagamento, persiste notificacoes internas na tabela `Notification` para eventos mapeados (chat/propostas, favoritos, nova avaliacao, pedidos, moderacao e alteracoes de conta) com integracao de envio por e-mail quando o usuario esta offline (via Resend/SMTP ou fallback simulado em dev) e calcula reputacao no PostgreSQL."

### Pergunta 2: "Como a API garante que o autor de uma avaliacao nao fraudara a identidade de outro usuario?"
**Resposta Recomendada:**  
"O endpoint `POST /api/v1/reviews/user/:userId` recebe apenas `rating` e `comment` no payload. O `authorId` nunca vem do frontend — ele e obtido pelo middleware `authenticateToken` diretamente do token JWT verificado e validado no banco (`req.user.id`). Mesmo que um cliente envie um campo de autor forjado no JSON, o service ignora e utiliza `req.user.id`."

### Pergunta 3: "Como funcionam a transacao de avaliacoes e a prevencao de duplicidade?"
**Resposta Recomendada:**  
"Em `review.mutation.service.js`, a verificacao de avaliacao duplicada e feita na logica do service antes da gravacao usando `prisma.review.findFirst({ where: { authorId, targetId } })`. Importante destacar que a tabela `Review` no `schema.prisma` nao possui uma restricao `@@unique([authorId, targetId])` no banco — portanto, a unicidade e uma regra de servico e nao uma garantia fisica contra duas requisicoes simultaneas antes da primeira gravacao. Ja a transacao `prisma.$transaction` (presente em `createReview`, `updateReview` e `deleteReview`) garante que a escrita/alteracao/exclusao da avaliacao, a leitura de todas as notas do vendedor e a atualizacao de `ratingAverage` e `ratingCount` em `User` ocorram em bloco atomico."

### Pergunta 4: "Como funciona a autenticacao e o RBAC no backend?"
**Resposta Recomendada:**  
"A autenticacao utiliza JWT com algoritmo padrao HS256 e validade configuravel por `JWT_EXPIRES_IN` (padrao de 2 horas em `env.js`). O middleware `authenticateToken` verifica o token, consulta o usuario no PostgreSQL e bloqueia contas `BANNED` ou `SUSPENDED` com HTTP 403. Na autorizacao, usuarios comuns (`BUYER` e `SELLER`) compartilham as permissoes de acesso mediante verificacao de posse dos proprios dados (`sellerId` / `targetId`); ja as rotas administrativas possuem divisao estrita no `requireRole`: `/api/v1/reports` aceita `ADMIN` e `MODERATOR`, enquanto `/api/v1/system` aceita exclusivamente `ADMIN` (ressalvando o bypass de loopback local apenas em ambiente de desenvolvimento)."

### Pergunta 5: "Por que parte das rotas possui verbos na URI se o REST recomenda substantivos?"
**Resposta Recomendada:**  
"Nos recursos centrais modelamos endpoints com substantivos no plural, como `/api/v1/products`, `/api/v1/reviews/user/:userId`, `PUT/DELETE /api/v1/favorites/:productId` e `PATCH /api/v1/chat/messages/:id/status`. Entretanto, endpoints com verbos como `/api/v1/auth/login`, `/api/v1/favorites/:productId/toggle` e `/api/v1/system/data/*/:id/toggle` foram escolhas de implementacao atualmente consumidas diretamente pelos modulos de cliente no frontend (`api-auth.js`, `api-social.js`, `api-sistema.js`, `auth-login.js` e `login-painel.js`) e pelos testes (`api.test.js` e `username-cooldown.test.js`). Reconhecemos essas rotas como uma limitacao parcial frente as convencoes REST estritas de evitar verbos em URIs."
