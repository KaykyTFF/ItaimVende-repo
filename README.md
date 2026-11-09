# Itaim Vende API - Plataforma de Marketplace e Intermediacao Comercial

Versao da API: 2.0.0  
Padrao de Especificacao: OpenAPI 3.0.3  
Ambiente Base: Node.js (ES Modules) com Express.js e PostgreSQL  

---

## Sumario

- [1. Nome e Apresentacao do Projeto](#1-nome-e-apresentacao-do-projeto)
- [2. Principais Funcionalidades](#2-principais-funcionalidades)
- [3. Diferenciais Tecnicos](#3-diferenciais-tecnicos)
- [4. Tecnologias Utilizadas](#4-tecnologias-utilizadas)
- [5. Arquitetura do Sistema](#5-arquitetura-do-sistema)
- [6. Estrutura de Diretorios](#6-estrutura-de-diretorios)
- [7. Pre-requisitos](#7-pre-requisitos)
- [8. Instalacao e Configuracao](#8-instalacao-e-configuracao)
- [9. Variaveis de Ambiente](#9-variaveis-de-ambiente)
- [10. Configuracao do Banco de Dados](#10-configuracao-do-banco-de-dados)
- [11. Execucao da Aplicacao](#11-execucao-da-aplicacao)
- [12. Autenticacao e Autorizacao](#12-autenticacao-e-autorizacao)
- [13. Endpoints da API](#13-endpoints-da-api)
- [14. Paginacao, Filtros e Ordenacao](#14-paginacao-filtros-e-ordenacao)
- [15. Formato das Respostas e Tratamento de Erros](#15-formato-das-respostas-e-tratamento-de-erros)
- [16. Documentacao Swagger/OpenAPI](#16-documentacao-swaggeropenapi)
- [17. Testes Automatizados](#17-testes-automatizados)
- [18. Colecao Postman](#18-colecao-postman)
- [19. Declaracao de Uso de Inteligencia Artificial](#19-declaracao-de-uso-de-inteligencia-artificial)
- [20. Processo de Gestao Agil (Scrum)](#20-processo-de-gestao-agil-scrum)
- [21. Processo e Engenharia de Testes](#21-processo-e-engenharia-de-testes)

---

## 1. Nome e Apresentacao do Projeto

O **Itaim Vende API** e uma solucao de backend RESTful projetada para intermediacao comercial, compra e venda de mercadorias e negociacao direta em mercados regionais.

### Proposito e Problema Resolvido

A plataforma atende a polos comerciais interioranos e produtores locais que dependem de intermediarios genericos de grande porte, os quais cobram taxas elevadas e nao oferecem filtros contextuais para municipios vizinhos, localidades rurais e habitos de retirada presencial. O Itaim Vende conecta vendedores e compradores de forma direta, com baixa latencia, busca fonetica regional e integridade relacional.

### Usuarios Principais

- **Compradores (BUYER):** Moradores locais que buscam produtos, enviam propostas de preco, avaliam vendedores e gerenciam favoritos e enderecos.
- **Vendedores e Produtores (SELLER):** Comerciantes e produtores rurais que cadastram anuncios, recebem propostas de negociacao e acompanham pedidos.
- **Moderadores e Administradores (MODERATOR / ADMIN):** Equipe responsavel pela triagem de denuncias, remocao preventiva de anuncios fraudulentos, auditoria de contas e conformidade da plataforma.

### Funcionalidades Centrais

A plataforma engloba autenticacao com JWT e Google OAuth2, catalogo com busca fonetica unaccent, pedidos com validacao financeira estrita no servidor, chat em tempo real com WebSockets, avaliacoes com notas e comentarios, lista de favoritos, denuncias com purga de imagens e governanca de dados cadastrais.

---

## 2. Principais Funcionalidades

O sistema implementa 12 dominios funcionais estruturados:

1. **Gestao de Identidade e Autenticacao:**
   - Cadastro de contas com hash bcrypt e validacao de complexidade de senha.
   - Autenticacao stateless via JSON Web Token (Bearer JWT).
   - Suporte a autenticacao federada via Google OAuth2.
   - Recuperacao de senha por e-mail com envio de codigo OTP de 6 digitos e protecao contra tentativas excessivas.
   - Perfil de usuario com suporte a atualizacao cadastral, bio, telefone e foto de avatar.

2. **Governanca e Seguranca de Conta:**
   - Alteracao controlada do nome de usuario (`@username`) com verificacao de termos reservados e janela de retencao (cooldown) de 30 dias entre alteracoes.
   - Verificacao de disponibilidade de nome de usuario em tempo real.
   - Fluxo seguro de alteracao de e-mail com validacao de senha atual e codigo OTP enviado ao novo endereco.
   - Fluxo seguro de alteracao de telefone/WhatsApp com confirmacao por codigo OTP e cooldown de 7 dias.
   - Reversao emergencial de numero de telefone atraves de token assinado de seguranca (`POST /account/phone-reversals`).
   - Preferencias de notificacao do usuario por canal (mensagens, avaliacoes, favoritos e novidades).

3. **Catalogo de Produtos e Anuncios:**
   - Publicacao de anuncios com titulo, descricao, preco, condicao de uso (NOVO, SEMINOVO, USADO, DEFEITO) e localizacao.
   - Upload e vinculacao de multiplas imagens com ordenacao customizada.
   - Consulta publica detalhada de anuncios por identificador ou slug semantico.
   - Edicao e exclusao de anuncios com controle estrito de propriedade (somente o anunciante proprietario ou administradores).
   - Busca textual com normalizacao fonetica e filtros combinados por categoria, cidade, bairro, preco e ordenacao.

4. **Categorias de Mercado:**
   - Consulta de departamentos e categorias ativas com cabecalho HTTP `Cache-Control: public, max-age=300`.

5. **Intermediacao de Pedidos e Checkout:**
   - Criacao de ordens com recalculado compulsorio de valores no servidor, garantindo integridade financeira e impedindo manipulacoes client-side.
   - Consulta de historico de pedidos efetuados pelo comprador com detalhes de itens e endereco de entrega.
   - Acompanhamento de status da ordem (pendente, aprovado, entregue, cancelado).

6. **Chat e Negociacao em Tempo Real:**
   - Abertura de conversas vinculadas a anuncios especificos entre comprador e vendedor.
   - Troca de mensagens instantaneas via WebSockets (`socket.io`).
   - Envio formal de contrapropostas de preco com atualizacao atomica de status (aceitar ou recusar via `PATCH /chat/messages/:id/status`).
   - Contingencia automatica para envio de e-mail transacional caso o destinatario esteja offline no momento da mensagem.

7. **Reputacao e Avaliacoes:**
   - Publicacao de avaliacoes com notas numericas (1 a 5 estrelas) e comentarios descritivos sobre vendedores.
   - Consulta publica da reputacao do vendedor com media ponderada e contagem total de avaliacoes.
   - Exclusao de avaliacoes restrita ao autor da postagem ou moderadores.

8. **Favoritos:**
   - Gerenciamento idempotente de anuncios favoritados (`GET`, `PUT` e `DELETE` em `/favorites/:productId`).
   - Listagem completa dos anuncios salvos pelo usuario logado.

9. **Denuncias e Moderacao:**
   - Registro de denuncias de irregularidades em anuncios por qualquer usuario, com geracao de protocolo de acompanhamento.
   - Painel restrito a moderadores e administradores para triagem e revisao de ocorrencias pendentes.
   - Remocao sumaria de anuncios fraudulentos (`DELETE /reports/:id/product`) com purga automatica de arquivos no armazenamento de nuvem.

10. **Enderecos:**
    - Cadastro, consulta e remocao de multiplos enderecos residenciais e de retirada para o usuario.

11. **Notificacoes:**
    - Central de notificacoes transacionais com listagem e marcacao de leitura em lote (`PATCH /notifications/read-all`).

12. **Pipeline de Midia e Imagens:**
    - Upload via `multipart/form-data` com auto-rotacao baseada em metadados EXIF de smartphones.
    - Redimensionamento proporcional e compressao em formato WebP de alta densidade via biblioteca Sharp.
    - Persistencia no Supabase Storage com fallback para disco local em desenvolvimento.

---

## 3. Diferenciais Tecnicos

- **Busca Fonetica com Extensao PostgreSQL unaccent:** A busca textual da API normaliza caracteres acentuados diretamente na camada de banco de dados (`unaccent_text(lower(...))`), assegurando que termos informados sem diacriticos localizem conteudos cadastrados com acento (por exemplo, "eletronicos" encontra "Eletronicos").
- **Calculo Financeiro Confinado ao Servidor:** Na emissao de pedidos (`POST /orders`), a API ignora precos enviados no corpo da requisicao e consulta os valores reais vigentes na tabela de produtos, prevenindo ataques de adulteracao de parametros financeiros.
- **Governanca de Credenciais com Cooldown e Rollback Token:** Alteracoes no `@username` ativam um bloqueio transacional de 30 dias registrado em tabela historica de auditoria (`UsernameHistory`). Trocas de numero de telefone emitem um token de reversao criptografado com validade temporaria, permitindo desfazer alteracoes nao autorizadas de imediato.
- **Negociacao em Tempo Real com Notificacao Hibrida:** O chat opera sobre conexao WebSocket com baixa latencia. Caso o destinatario nao esteja conectado ao socket no instante do envio, o backend enfileira e dispara um e-mail transacional via Resend ou Nodemailer.
- **Conformidade RESTful Estrita com Aliases de Compatibilidade:** Todas as rotas canonicas utilizam substantivos no plural, verbos HTTP semanticos (`PUT` e `DELETE` para recursos idempotentes, `PATCH` para estados) e identificadores em path parameters, mantendo rotas legadas ativas como aliases para nao interromper clientes existentes.
- **Verificacao de Permissoes em Tempo Real:** O middleware de autenticacao consulta a base de dados em cada requisicao autenticada para atestar se o usuario permanece ativo e com o papel informado, garantindo que suspensoes ou alteracoes de privileges (RBAC) surtam efeito imediato.

---

## 4. Tecnologias Utilizadas

A selecao de tecnologias apoia-se em componentes consolidados do ecossistema Node.js:

| Finalidade | Componente / Pacote | Versao | Descricao |
| :--- | :--- | :---: | :--- |
| **Ambiente de Execucao** | Node.js | >= 20.x | Interpretador JavaScript com modulos ECMAScript nativos (`"type": "module"`). |
| **Framework HTTP** | Express.js | 5.2.1 | Roteamento e orquestracao da camada de controle RESTful. |
| **Banco de Dados** | PostgreSQL | >= 15.x | Banco de dados relacional com suporte a extensoes e transacoes ACID. |
| **Mapeamento ORM** | Prisma Client / CLI | 6.19.3 | Acesso fortemente tipado, definicao de modelos relacionais e migracoes. |
| **Extensoes de Banco** | `unaccent` e `pg_trgm` | - | Extensoes PostgreSQL para busca fonetica e indices Trigram. |
| **Autenticacao e Token** | `jsonwebtoken` | 9.0.3 | Assinatura e decodificacao de tokens Bearer JWT com algoritmo HS256. |
| **Criptografia de Senha** | `bcryptjs` | 3.0.3 | Derivacao de chaves e calculo de hash de senhas (10 salt rounds). |
| **Validacao de Contratos** | `zod` | 4.6.5 | Validacao declarativa de esquemas de entrada para body, params e query. |
| **Tempo Real** | `socket.io` | 4.8.4 | Comunicacao bidirecional via WebSockets para negociacoes de chat. |
| **Processamento de Fotos** | `sharp` | 0.35.5 | Conversao para WebP, redimensionamento proporcional e rotacao EXIF. |
| **Armazenamento de Nuvem** | `@supabase/supabase-js` | 2.118.0 | Integracao com bucket de CDN para persistencia de imagens. |
| **Upload de Arquivos** | `multer` | 2.4.0 | Recepcao de payloads multipart/form-data em memoria. |
| **Notificacoes de E-mail** | `resend` e `nodemailer` | 6.34.1 / 10.2.1 | Despacho de mensagens transacionais e codigos de verificacao OTP. |
| **Seguranca HTTP** | `helmet` | 8.3.0 | Definicao de cabecalhos de protecao (CSP, HSTS, X-Content-Type-Options). |
| **Compartilhamento de Origem** | `cors` | 2.8.6 | Configuracao de politicas de acesso entre origens. |
| **Limitacao de Taxa** | `express-rate-limit` | 8.7.1 | Protecao contra abusos e ataques de forca bruta em rotas criticas. |
| **Documentacao OpenAPI** | `swagger-ui-express` | 5.0.1 | Renderizacao da interface interativa da especificacao OpenAPI 3.0.3. |
| **Testes Automatizados** | Node.js Test Runner | Nativo | Runner de testes nativo (`node:test` e `node:assert/strict`). |

---

## 5. Arquitetura do Sistema

O sistema e estruturado no padrao de arquitetura em camadas desacopladas:

```
+-------------------------------------------------------------+
|                     Cliente HTTP / SPA                      |
+------------------------------+------------------------------+
                               | Requisicao HTTP / JSON
                               v
+-------------------------------------------------------------+
|                      Camada de Entrada                      |
|   - Express Router (/api/v1)                                |
|   - Middlewares Globais (CORS, Helmet, Rate Limit)          |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|                    Camada de Middlewares                    |
|   - Autenticacao (authenticateToken - Bearer JWT)           |
|   - Autorizacao RBAC (requireRole)                          |
|   - Validacao de Esquemas (validate - Zod)                  |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|                    Camada de Controllers                    |
|   - Extracao de parametros (body, params, query)            |
|   - Invocacao dos servicos de dominio                       |
|   - Formatacao de respostas e status HTTP (200, 201, 204)   |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|                     Camada de Services                      |
|   - Logica de negocio, regras de dominio e validacoes       |
|   - Recalculo de precos e operacoes transacionais           |
|   - Despacho de eventos (Sockets e E-mails)                 |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|                Camada de Acesso a Dados / ORM               |
|   - Prisma Client (Instancia Singleton)                     |
|   - Transacoes atomicas ($transaction)                      |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|                  Banco de Dados PostgreSQL                  |
|   - 12 tabelas relacionais com chaves estrangeiras          |
|   - Indices Trigram e extensao unaccent                     |
+-------------------------------------------------------------+
```

### Responsabilidade de Cada Camada

- **Routes (`backend/src/routes`):** Mapeia os endpoints REST sob `/api/v1`, associando middlewares de autenticacao, autorizacao e validacao aos controladores.
- **Middlewares (`backend/src/middlewares`):** Valida tokens JWT, fiscaliza permissoes RBAC, checa contratos Zod e captura excecoes operacionais de forma unificada.
- **Controllers (`backend/src/controllers`):** Extrai dados da requisicao HTTP, direciona a chamada para o servico competente e entrega a resposta padronizada com o status HTTP correto.
- **Services (`backend/src/services`):** Centraliza a totalidade das regras de negocio, integridade de precos, validacao de cooldowns, transacoes no banco e integracoes com APIs de terceiros.
- **Prisma Client (`backend/src/config/prisma.js`):** Gerencia o pool de conexoes com o PostgreSQL e provê consultas relacionais tipadas.
- **Schemas (`backend/src/schemas`):** Define os contratos formais de entrada com Zod para sanitizacao de payloads.
- **Utils (`backend/src/utils`):** Classes e funcoes auxiliares compartilhadas, destacando a classe `AppError`.

---

## 6. Estrutura de Diretorios

O projeto e estruturado como um monorepo contendo os modulos desacoplados de **Backend** (API RESTful), **Frontend** (Interface Web Modular), documentacao do processo agil (**Scrum**) e artefatos de engenharia de software (**Docs**):

```text
marketplace-frontend/ (Itaim Vende Monorepo)
├── backend/                           # Modulo da API RESTful (Node.js, Express, Prisma, PostgreSQL)
│   ├── prisma/
│   │   ├── schema.prisma              # Modelos relacionais, enums e indices de banco
│   │   └── seed.js                    # Script de povoamento inicial de dados
│   ├── scripts/
│   │   └── setup-unaccent.js          # Criacao de extensoes unaccent e indices Trigram no PostgreSQL
│   ├── src/
│   │   ├── adapters/                  # Adaptadores de comunicacao externa
│   │   ├── config/
│   │   │   ├── env.js                 # Validacao rigorosa de variaveis de ambiente
│   │   │   ├── prisma.js              # Instancia singleton do Prisma Client
│   │   │   └── supabase.js            # Cliente Supabase Storage
│   │   ├── controllers/               # Controladores HTTP desacoplados por dominio
│   │   │   ├── account/               # Gestao de credenciais, email, phone e username
│   │   │   ├── auth/                  # Identidade, login, registro, Google OAuth e perfil
│   │   │   ├── category/              # Catalogo de categorias e departamentos
│   │   │   ├── chat/                  # Conversas, mensagens e propostas de negociacao
│   │   │   ├── favorite/              # Gestao idempotente de favoritos
│   │   │   ├── order/                 # Emissao e historico de pedidos com calculo no servidor
│   │   │   ├── product/               # Anuncios, consultas com busca fonetica e mutacoes
│   │   │   ├── report/                # Registro e triagem de denuncias
│   │   │   ├── review/                # Avaliacoes e reputacao de vendedores
│   │   │   └── upload/                # Pipeline de processamento de fotos (Sharp WebP)
│   │   ├── docs/
│   │   │   ├── openapi.js             # Objeto de especificacao OpenAPI 3.0.3
│   │   │   └── openapi.json           # Especificacao OpenAPI 3.0.3 serializada
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js     # Validacao de token Bearer JWT e RBAC em tempo real
│   │   │   ├── error.middleware.js    # Interceptador central e padronizador de erros (RFC 7807)
│   │   │   ├── rateLimiter.js         # Limitador de requisicoes por IP contra forca bruta
│   │   │   └── validate.middleware.js # Validacao de contratos e schemas Zod
│   │   ├── routes/                    # Roteadores Express organizados por recurso (/api/v1)
│   │   │   ├── account/
│   │   │   ├── auth/
│   │   │   ├── category/
│   │   │   ├── chat/
│   │   │   ├── favorite/
│   │   │   ├── order/
│   │   │   ├── product/
│   │   │   ├── report/
│   │   │   ├── review/
│   │   │   ├── upload/
│   │   │   ├── user/                  # Rotas publicas de vendedores (/users)
│   │   │   └── index.js               # Agrupador oficial do prefixo /api/v1
│   │   ├── schemas/                   # Esquemas de validacao Zod declarativos por recurso
│   │   ├── services/                  # Regras de negocio, transacoes e integracoes
│   │   │   ├── account/               # email, phone, username, preferences services
│   │   │   ├── auth/                  # identity, profile, recovery services
│   │   │   ├── category/
│   │   │   ├── chat/
│   │   │   ├── favorite/
│   │   │   ├── order/
│   │   │   ├── product/
│   │   │   ├── report/
│   │   │   └── review/
│   │   ├── sockets/                   # Servidor WebSocket (Socket.io) para chat em tempo real
│   │   ├── utils/
│   │   │   └── AppError.js            # Classe de erro operacional padronizada
│   │   └── server.js                  # Ponto de entrada do servidor HTTP e WebSocket
│   ├── tests/                         # Suite completa de 88 testes automatizados
│   │   ├── unit/                      # Testes unitarios puros (schemas Zod e regras de negocio)
│   │   │   ├── formatters-and-rules.test.js
│   │   │   └── schemas.test.js
│   │   ├── account-email.test.js      # Testes de alteracao segura de e-mail e OTP
│   │   ├── account-phone.test.js      # Testes de alteracao segura de telefone e cooldown
│   │   ├── api.test.js                # Testes de integracao da API
│   │   ├── notification.test.js       # Testes da central de notificacoes
│   │   ├── rest-conformance.test.js   # Testes de conformidade REST e verbos HTTP
│   │   └── username-cooldown.test.js  # Testes de regra de 30 dias para @
│   ├── .env.example                   # Modelo de configuracao das variaveis locais
│   └── package.json                   # Dependencias e scripts do modulo backend
│
├── frontend/                          # Modulo da Interface Web (HTML5, CSS3 Modular, Vanilla JS)
│   ├── assets/                        # Imagens, logotipos, icones e banners
│   ├── css/                           # Folhas de estilo modularizadas por contexto
│   │   ├── header-global.css          # Cabecalho global e drawer responsivo
│   │   ├── home.css                   # Vitrine inicial e banners
│   │   ├── categoria.css              # Catalogo de departamentos e filtros
│   │   ├── produto.css                # Detalhes do anuncio, galeria e contato
│   │   ├── perfil.css                 # Painel do usuario e reputacao
│   │   ├── vendedor.css               # Perfil publico de outros anunciantes
│   │   ├── vender.css                 # Formulario de publicacao em etapas
│   │   ├── meus-anuncios.css          # Gestao de anuncios do vendedor
│   │   ├── favoritos.css              # Grid de anuncios favoritados
│   │   ├── conversas.css              # Inbox de negociacao e chat
│   │   ├── notificacoes.css           # Central de alertas e avisos
│   │   ├── configuracoes.css          # Seguranca, @username, email e telefone
│   │   ├── style.css                  # Folha de estilo base e autenticacao
│   │   └── pages/                     # Modulos especializados (ex: admin/painel/)
│   ├── js/                            # Camada de comportamento logico client-side
│   │   ├── core/                      # Modulos centrais e utilitarios globais
│   │   │   ├── api/                   # Cliente HTTP modular (auth, produtos, chat, upload)
│   │   │   ├── rotas/                 # Resolvedor canonico de rotas e assets
│   │   │   ├── sessao/                # Gestao de estado, token JWT e persistencia
│   │   │   ├── componentes-globais/   # Navbar, drawer e cards unificados
│   │   │   ├── produtos-dados/        # Formato e utilitarios de produtos
│   │   │   ├── categorias/            # Mapeamento oficial de categorias
│   │   │   ├── skeleton/              # Sistema unificado de carregamento shimmer
│   │   │   └── ajustar-foto/          # Utilitario de recorte 1:1 de fotos
│   │   └── pages/                     # Controladores especificos espelhados por pagina
│   │       ├── auth/                  # Logica de login e cadastro
│   │       ├── admin/                 # Painel de controle e observabilidade
│   │       ├── home/                  # Feed principal e ordenacao
│   │       ├── produtos/              # Visualizacao de anuncio e categorias
│   │       ├── vender/                # Formulario e upload de fotos
│   │       ├── mensagens/             # Negociacao, WebSockets e propostas
│   │       ├── perfil/                # Perfil e configuracoes de conta
│   │       ├── favoritos/             # Itens favoritados
│   │       └── notificacoes/          # Gestao de notificacoes
│   ├── pages/                         # Telas HTML organizadas por dominio de negocio
│   │   ├── admin/                     # painel.html (Painel de Saude e Observabilidade)
│   │   ├── auth/                      # cadastro.html
│   │   ├── favoritos/                 # favoritos.html
│   │   ├── home/                      # home.html
│   │   ├── mensagens/                 # conversas.html e chat.html
│   │   ├── notificacoes/              # notificacoes.html
│   │   ├── perfil/                    # perfil.html, vendedor.html e configuracoes.html
│   │   ├── produtos/                  # produto.html e categoria.html
│   │   └── vender/                    # vender.html e meus-anuncios.html
│   ├── 404.html                       # Pagina de erro 404 com arte regional
│   ├── index.html                     # Portal de entrada e autenticacao
│   └── reverter-telefone.html         # Tela de reversao emergencial de telefone
│
├── scrum/                             # Documentacao do Processo Agil (IFPI Campus Paulistana)
│   ├── acordos.md                     # Product Goal, Papeis da Equipe, DoD (10 itens) e Acordos
│   ├── product-backlog.md             # 13 Historias de Usuario (BDD), MoSCoW e Planning Poker
│   ├── sprint-1/
│   │   ├── planning.md                # Sprint Goal, Capacidade (24 pts), Fatias e Quadrantes Q1-Q4
│   │   ├── dailies.md                 # 4 Registros de Daily Scrum e tratamento de impedimentos
│   │   └── review-retro.md            # Demonstracao, Aceite do PO (V1 = 24 pts) e Acao MELH-1
│   └── sprint-2/
│       ├── planning.md                # Sprint Goal, Capacidade (28 pts), Inclusao de MELH-1
│       ├── dailies.md                 # 3 Registros de Daily Scrum e tratamento de impedimentos
│       └── review-retro.md            # Demonstracao, Aceite do PO (V2 = 28 pts) e Questoes Obrigatorias
│
├── docs/                              # Artefatos Formais de Engenharia de Testes
│   └── testes/                        # Processo formal de testes em 5 fases
│       ├── 01-plano-de-testes.md
│       ├── 02-casos-de-teste-e-rastreabilidade.md
│       ├── 03-execucao-e-relatorios-de-defeitos.md
│       ├── 04-painel-de-metricas.md
│       └── 05-relatorio-final-de-testes.md
│
├── itaim-vende.postman_collection.json # Colecao Postman oficial com 11 recursos
├── package.json                       # Scripts orquestradores da raiz do monorepo
├── CHANGELOG.md                       # Historico cronologico de versoes
└── README.md                          # Documentacao tecnica central da aplicacao
```

---

## 7. Pre-requisitos

Antes de instalar e inicializar a aplicacao, verifique a presenca dos componentes abaixo:

- **Node.js:** Versao 20.0.0 LTS ou superior (recomendado 20.x ou 22.x).
- **Gerenciador de Pacotes NPM:** Versao 9.0.0 ou superior.
- **Banco de Dados PostgreSQL:** Versao 14 ou superior acessivel (local ou gerenciado no Supabase).
- **Conexao com a Internet:** Para resolucao de pacotes npm e comunicacao com os servicos de armazenamento e envio de e-mails transacionais.

---

## 8. Instalacao e Configuracao

### 1. Clonagem do Repositorio

```bash
git clone https://github.com/KaykyTFF/ItaimVende-repo.git
cd ItaimVende-repo
```

### 2. Instalacao das Dependencias

Instale as dependencias na raiz do monorepo e no modulo backend:

```bash
npm install
npm --prefix backend install
```

### 3. Configuracao do Arquivo de Ambiente

Gere o arquivo `.env` dentro da pasta `backend/` tomando o modelo `.env.example` como base:

```bash
cp backend/.env.example backend/.env
```

---

## 9. Variaveis de Ambiente

As variaveis de ambiente devem ser informadas no arquivo `backend/.env`:

| Variavel | Descricao | Obrigatoria |
| :--- | :--- | :---: |
| `PORT` | Porta na qual o servidor HTTP Express ira escutar (padrao: 3000). | Nao |
| `NODE_ENV` | Modo de execucao (`development` ou `production`). | Nao |
| `DATABASE_URL` | String de conexao com o PostgreSQL com suporte a pooling (PgBouncer). | Sim |
| `DIRECT_URL` | String de conexao direta com o PostgreSQL sem pooling (usada para migracoes). | Sim |
| `JWT_SECRET` | Chave criptografica privada utilizada na geracao dos tokens JWT (minimo 32 caracteres). | Sim |
| `JWT_EXPIRES_IN` | Tempo limite de validade do token JWT emitido (ex: `2h`, `7d`). | Nao |
| `CORS_ORIGIN` | Origens autorizadas para requisicoes de navegadores (padrao: `*`). | Nao |
| `SUPABASE_URL` | Endpoint da API do projeto Supabase. | Nao |
| `SUPABASE_KEY` | Chave anon ou service_role para manipulacao do Supabase Storage. | Nao |
| `SUPABASE_BUCKET` | Nome do bucket publico para gravacao de fotos de produtos e avatares (padrao: `marketplace`). | Nao |
| `STORAGE_PROVIDER` | Estrategia de gravacao de midias (`supabase` ou `local`). | Nao |
| `IMAGE_OPTIMIZATION_ENABLED` | Habilita pipeline de otimizacao WebP com Sharp (`true` ou `false`). | Nao |
| `IMAGE_MAX_WIDTH` | Largura maxima em pixels aplicada as imagens recebidas (padrao: 1600). | Nao |
| `IMAGE_QUALITY` | Fator de qualidade de compressao WebP (1 a 100, padrao: 82). | Nao |
| `RESEND_API_KEY` | Chave de autenticacao da API do Resend para envio de e-mails transacionais. | Nao |
| `EMAIL_FROM` | Remetente padrao exibido nos e-mails transacionais. | Nao |
| `APP_URL` | URL base da aplicacao utilizada na composicao de links enviados em e-mails. | Nao |

---

## 10. Configuracao do Banco de Dados

Com o PostgreSQL acessivel e as strings de conexao preenchidas no `.env`, execute a sequencia de preparacao do banco:

```bash
# 1. Gerar os artefatos tipados do Prisma Client
npm --prefix backend run prisma:generate

# 2. Sincronizar os esquemas relacionais com o banco de dados
npm --prefix backend run prisma:push

# 3. Criar a extensao unaccent e os indices Trigram para busca fonetica
npm --prefix backend run db:indexes

# 4. Executar o script de seed para criar categorias e dados iniciais
npm --prefix backend run seed
```

---

## 11. Execucao da Aplicacao

### Modo de Desenvolvimento

Inicia o backend com reinicializacao automatica ao alterar arquivos (`nodemon`):

```bash
npm run dev
```

Ou diretamente a partir da pasta `backend/`:

```bash
npm --prefix backend run dev
```

### Modo de Producao

Executa a aplicacao em modo otimizado:

```bash
npm run start
```

### Frontend de Desenvolvimento (Opcional)

Para servir a interface web localmente na porta 5500:

```bash
npm run dev:frontend
```

Apos iniciar o backend, verifique a operacionalidade acessando o endpoint de diagnostico:  
`http://localhost:3000/api/v1/health`

---

## 12. Autenticacao e Autorizacao

A API utiliza o modelo de autenticacao **stateless baseada em Bearer JWT** (JSON Web Token), assinado com o algoritmo **HS256**.

### Ciclo de Emissao e Envio do Token

1. **Emissao:** O token e emitido nos endpoints `POST /auth/login`, `POST /auth/register` e `POST /auth/google`.
2. **Payload:** O token carrega o identificador do usuario (`id`), e-mail (`email`) e o papel atribuido (`role`).
3. **Envio:** O cliente deve anexar o token no cabecalho HTTP `Authorization` em todas as rotas protegidas:

```http
Authorization: Bearer <seu_token_jwt>
```

### Papéis do Sistema (RBAC)

O controle de acesso baseado em papéis define as permissoes de cada operacao:

| Papel | Permissoes e Acesso |
| :--- | :--- |
| `BUYER` | Perfil padrao. Permite consultar produtos, fazer pedidos, enviar mensagens e propostas no chat, avaliar vendedores, salvar favoritos e cadastrar enderecos. |
| `SELLER` | Produtor ou vendedor comercial. Herda as permissoes de `BUYER` e possui autorizacao para criar, editar e excluir anuncios de produtos proprios. |
| `MODERATOR` | Agente moderador. Acessa o painel de denuncias (`GET /reports`) e aplica acoes cautelares de revisao sobre anuncios sob suspeita. |
| `ADMIN` | Administrador pleno. Possui acesso total ao sistema, incluindo remocao definitiva de anuncios fraudulentos (`DELETE /reports/:id/product`), purga de midias e auditoria de contas. |

### Validacao Ativa em Cada Requisicao

O middleware `authenticateToken` consulta o registro correspondente no banco de dados a cada chamada autenticada. Se a conta for suspensa (`SUSPENDED` ou `BANNED`) ou tiver seu papel alterado, o acesso e bloqueado de imediato, sem que seja necessario aguardar a expiracao temporal do token emitido.

---

## 13. Endpoints da API

Todas as rotas estao agrupadas sob o prefixo canônico `/api/v1`. A API segue convencoes RESTful com substantivos no plural, verbos HTTP semanticos e identificadores em path parameters.

### Diagnostico e Monitoramento

| Metodo | URI | Descricao | Autenticacao |
| :---: | :--- | :--- | :---: |
| `GET` | `/health` | Retorna o status operacional, versao ativa e tempo de execucao (uptime). | Publica |

### Autenticacao e Gestao de Sessao (`/auth`)

| Metodo | URI | Descricao | Autenticacao |
| :---: | :--- | :--- | :---: |
| `POST` | `/auth/register` | Cadastra novo usuario no sistema e gera hash de senha. | Publica |
| `POST` | `/auth/login` | Autentica usuario por e-mail e senha, retornando token JWT. | Publica |
| `POST` | `/auth/google` | Autentica ou cadastra usuario a partir de credencial Google OAuth2. | Publica |
| `POST` | `/auth/forgot-password` | Dispara e-mail com codigo OTP de 6 digitos para recuperacao de senha. | Publica |
| `POST` | `/auth/verify-reset-code` | Valida codigo de recuperacao com protecao contra forca bruta. | Publica |
| `POST` | `/auth/reset-password` | Conclui a redefinicao de senha utilizando codigo previamente validado. | Publica |
| `GET` | `/auth/me` | Retorna o perfil completo do usuario logado. | Bearer JWT |
| `PUT` | `/auth/profile` | Atualiza informacoes de perfil (nome, bio, avatar, localizacao). | Bearer JWT |
| `PUT` | `/auth/password` | Altera a senha do usuario mediante confirmacao da senha atual. | Bearer JWT |

### Usuarios e Reputacao (`/users` e `/usernames`)

| Metodo | URI | Descricao | Autenticacao |
| :---: | :--- | :--- | :---: |
| `GET` | `/users/:id` | Retorna os dados publicos do perfil de um anunciante/vendedor. | Publica |
| `GET` | `/users/:userId/reviews` | Lista avaliacoes recebidas e media de estrelas de um vendedor. | Publica |
| `POST` | `/users/:userId/reviews` | Registra nova avaliacao com nota (1 a 5) e comentario para o vendedor. | Bearer JWT |
| `GET` | `/usernames/availability` | Consulta a disponibilidade e o prazo de cooldown de um `@username`. | Publica |

### Governanca e Seguranca de Conta (`/account`)

| Metodo | URI | Descricao | Autenticacao |
| :---: | :--- | :--- | :---: |
| `PATCH` | `/account/username` | Altera o nome de usuario (`@username`) impondo cooldown de 30 dias. | Bearer JWT |
| `POST` | `/account/email/change-request` | Inicia troca de e-mail enviando OTP ao novo endereco. | Bearer JWT |
| `POST` | `/account/email/confirm` | Confirma novo e-mail validando codigo de 6 digitos. | Bearer JWT |
| `POST` | `/account/phone/change-request` | Inicia alteracao de telefone celular com envio de codigo OTP. | Bearer JWT |
| `POST` | `/account/phone/confirm` | Valida codigo OTP, confirma novo telefone e emite token de reversao. | Bearer JWT |
| `POST` | `/account/phone-reversals` | Desfaz a troca de telefone via rollback token assinado. | Publica |
| `DELETE` | `/account/phone` | Desvincula o telefone cadastrado da conta. | Bearer JWT |
| `GET` | `/account/preferences` | Consulta preferencias de notificacao ativas do usuario. | Bearer JWT |
| `PATCH` | `/account/preferences` | Atualiza opcoes e canais de notificacao. | Bearer JWT |

### Catalogo de Produtos e Anuncios (`/products`)

| Metodo | URI | Descricao | Autenticacao |
| :---: | :--- | :--- | :---: |
| `GET` | `/products` | Lista produtos com paginacao, filtros e busca fonetica unaccent. | Publica |
| `GET` | `/products/:id` | Retorna informacoes detalhadas de um anuncio por ID ou slug. | Publica |
| `POST` | `/products` | Publica novo anuncio no catalogo com fotos e localizacao. | Bearer JWT (`SELLER`+) |
| `PUT` | `/products/:id` | Atualiza dados de anuncio existente (autor ou admin). | Bearer JWT |
| `DELETE` | `/products/:id` | Remove anuncio e exclui imagens associadas no storage. | Bearer JWT |

### Categorias (`/categories`)

| Metodo | URI | Descricao | Autenticacao |
| :---: | :--- | :--- | :---: |
| `GET` | `/categories` | Lista departamentos comerciais ativos (com `Cache-Control`). | Publica |

### Pedidos e Checkout (`/orders`)

| Metodo | URI | Descricao | Autenticacao |
| :---: | :--- | :--- | :---: |
| `POST` | `/orders` | Cria ordem de compra com recalculado compulsorio de valores no servidor. | Bearer JWT |
| `GET` | `/orders` | Lista os pedidos efetuados pelo usuario autenticado. | Bearer JWT |
| `GET` | `/orders/:id` | Retorna o detalhamento completo de uma ordem especifica. | Bearer JWT |
| `PATCH` | `/orders/:id/status` | Atualiza o estado da ordem de pedido. | Bearer JWT |

### Negociacao e Mensagens em Tempo Real (`/chat`)

| Metodo | URI | Descricao | Autenticacao |
| :---: | :--- | :--- | :---: |
| `GET` | `/chat/conversations` | Lista todas as conversas ativas do usuario autenticado. | Bearer JWT |
| `POST` | `/chat/conversations` | Inicia ou recupera uma conversa vinculada a um produto. | Bearer JWT |
| `GET` | `/chat/conversations/:id/messages` | Recupera o historico de mensagens trocadas na conversa. | Bearer JWT |
| `POST` | `/chat/conversations/:id/messages` | Envia mensagem textual ou proposta formal de valor. | Bearer JWT |
| `PATCH` | `/chat/messages/:id/status` | Atualiza o status de uma contraproposta (`ACCEPTED` ou `REJECTED`). | Bearer JWT |

### Favoritos (`/favorites`)

| Metodo | URI | Descricao | Autenticacao |
| :---: | :--- | :--- | :---: |
| `GET` | `/favorites` | Lista todos os produtos favoritados pelo usuario autenticado. | Bearer JWT |
| `GET` | `/favorites/:productId` | Verifica se um produto especifico esta favoritado. | Bearer JWT |
| `PUT` | `/favorites/:productId` | Adiciona produto aos favoritos de forma idempotente. | Bearer JWT |
| `DELETE` | `/favorites/:productId` | Remove produto dos favoritos de forma idempotente. | Bearer JWT |

### Avaliacoes (`/reviews`)

| Metodo | URI | Descricao | Autenticacao |
| :---: | :--- | :--- | :---: |
| `DELETE` | `/reviews/:id` | Exclui avaliacao publicada (restrito ao autor ou moderador). | Bearer JWT |

### Denuncias e Moderacao (`/reports`)

| Metodo | URI | Descricao | Autenticacao |
| :---: | :--- | :--- | :---: |
| `POST` | `/reports/:productId` | Registra ocorrencia de denuncia contra um anuncio suspeito. | Publica / JWT |
| `GET` | `/reports` | Painel de controle de denuncias pendentes para moderadores. | Bearer JWT (`MODERATOR`+) |
| `DELETE` | `/reports/:id/product` | Remove anuncio denunciado e purga imagens no bucket CDN. | Bearer JWT (`ADMIN`+) |

### Enderecos (`/addresses`)

| Metodo | URI | Descricao | Autenticacao |
| :---: | :--- | :--- | :---: |
| `GET` | `/addresses` | Lista os enderecos cadastrados pelo usuario logado. | Bearer JWT |
| `POST` | `/addresses` | Cadastra novo endereco de entrega ou retirada. | Bearer JWT |
| `DELETE` | `/addresses/:id` | Remove endereco previamente registrado pelo usuario. | Bearer JWT |

### Notificacoes (`/notifications`)

| Metodo | URI | Descricao | Autenticacao |
| :---: | :--- | :--- | :---: |
| `GET` | `/notifications` | Lista as notificacoes recebidas pelo usuario. | Bearer JWT |
| `PATCH` | `/notifications/read-all` | Marca todas as notificacoes como lidas. | Bearer JWT |

### Pipeline de Midia (`/upload`)

| Metodo | URI | Descricao | Autenticacao |
| :---: | :--- | :--- | :---: |
| `POST` | `/upload` | Recebe arquivo multipart, otimiza para WebP e envia ao storage. | Bearer JWT |

---

## 14. Paginacao, Filtros e Ordenacao

O endpoint de consulta ao catalogo (`GET /api/v1/products`) implementa suporte estruturado a parametros de consulta (*query parameters*):

### Parametros Suportados

| Parametro | Tipo | Descricao | Valores Aceitos |
| :--- | :---: | :--- | :--- |
| `page` | Inteiro | Numero da pagina a retornar (padrao: 1). | `>= 1` |
| `limit` | Inteiro | Quantidade de itens por pagina (padrao: 24, maximo: 50). | `1` a `50` |
| `sort` | String | Criterio de ordenacao da listagem. | `newest`, `oldest`, `price_asc`, `price_desc`, `popular` |
| `search` | String | Termo textual para busca fonetica unaccent em titulo, descricao e categoria. | Qualquer texto |
| `categoryId` | Inteiro | Filtrar por identificador numerico da categoria. | ID numerico |
| `category` | String | Filtrar por slug ou nome da categoria com tolerancia a acentos. | Ex: `eletronicos`, `artesanato` |
| `city` / `cidade` | String | Filtrar por municipio polo ou circunvizinho no Vale do Itaim. | Ex: `Paulistana`, `Acaua`, `Jacobina` |
| `neighborhood` / `bairro` | String | Filtrar por bairro especifico. | Ex: `Centro`, `Cohab`, `Correntezal` |
| `minPrice` | Decimal | Filtro de preco minimo. | `>= 0` |
| `maxPrice` | Decimal | Filtro de preco maximo. | `>= minPrice` |
| `condition` | String | Estado de conservacao do item anunciado. | `NOVO`, `SEMINOVO`, `USADO`, `DEFEITO` |

### Exemplo de Requisicao

```http
GET /api/v1/products?search=eletronicos&city=Paulistana&minPrice=100&maxPrice=1500&sort=price_asc&page=1&limit=10 HTTP/1.1
Host: localhost:3000
Accept: application/json
```

### Exemplo de Resposta Estruturada

```json
{
  "success": true,
  "data": [
    {
      "id": "cmv1234567890",
      "title": "Smartphone 128GB",
      "description": "Aparelho conservado com carregador original.",
      "price": 650.00,
      "condition": "USADO",
      "city": "Paulistana",
      "neighborhood": "Centro",
      "images": [
        "https://xyz.supabase.co/storage/v1/object/public/marketplace/products/cmv1234.webp"
      ],
      "category": {
        "id": 1,
        "name": "Eletronicos",
        "slug": "eletronicos"
      },
      "createdAt": "2026-11-05T14:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

---

## 15. Formato das Respostas e Tratamento de Erros

A API adota respostas uniformes em JSON. Em cenarios de falha, o middleware interceptador global formata a saida com identificador legivel, mensagem explicativa e lista de detalhes.

### Estrutura Padrao de Erro

```json
{
  "success": false,
  "code": "CODIGO_DO_ERRO",
  "message": "Descricao amigavel e explicativa da falha.",
  "details": []
}
```

### Codigos HTTP Empregados

- `200 OK`: Consulta, atualizacao ou acao concluida com sucesso.
- `201 Created`: Recurso criado no servidor (anuncio, usuario, ordem, avaliacao).
- `204 No Content`: Exclusao concluida sem retorno de conteudo no corpo.
- `400 Bad Request`: Falha de validacao de esquema Zod ou parametro invalido.
- `401 Unauthorized`: Requisicao protegida sem token JWT ou com token expirado/invalido.
- `403 Forbidden`: Usuario autenticado sem permissao de papel ou acao bloqueada por regra de dominio.
- `404 Not Found`: Recurso solicitado nao localizado no banco de dados.
- `409 Conflict`: Conflito de integridade relacional ou identificador exclusivo duplicado.
- `429 Too Many Requests`: Limite de taxa excedido no rate limiter.
- `503 Service Unavailable`: Falha de conexao com o banco de dados.

### Exemplos de Resposta de Erro

#### Erro de Validacao de Dados (400 Bad Request)

```json
{
  "success": false,
  "code": "VALIDATION_ERROR",
  "message": "Falha na validacao dos dados enviados.",
  "details": [
    {
      "field": "email",
      "message": "Informe um endereco de e-mail valido."
    },
    {
      "field": "password",
      "message": "A senha deve conter no minimo 6 caracteres."
    }
  ]
}
```

#### Falha de Autenticacao (401 Unauthorized)

```json
{
  "success": false,
  "code": "UNAUTHORIZED",
  "message": "Acesso nao autorizado. Token nao informado."
}
```

#### Bloqueio por Regra de Negocio / Cooldown (403 Forbidden)

```json
{
  "success": false,
  "code": "USERNAME_CHANGE_COOLDOWN",
  "message": "Voce so pode alterar seu nome de usuario a cada 30 dias. Proxima alteracao disponivel em 29 dias.",
  "details": {
    "nextAllowedDate": "2026-12-07T15:00:00.000Z",
    "daysRemaining": 29
  }
}
```

#### Recurso Nao Encontrado (404 Not Found)

```json
{
  "success": false,
  "code": "NOT_FOUND",
  "message": "O registro solicitado nao foi encontrado no banco de dados."
}
```

#### Conflito de Duplicidade (409 Conflict)

```json
{
  "success": false,
  "code": "DUPLICATE_ENTRY",
  "message": "Conflito de dados: ja existe um registro com o valor informado (username)."
}
```

---

## 16. Documentacao Swagger/OpenAPI

A documentacao interativa gerada a partir da especificacao OpenAPI 3.0.3 esta disponivel nas seguintes URIs com o servidor ativo:

- **Interface Swagger UI:** [`http://localhost:3000/api-docs`](http://localhost:3000/api-docs) ou [`http://localhost:3000/api/v1/docs`](http://localhost:3000/api/v1/docs)
- **Arquivo da Especificacao OpenAPI em JSON:** [`http://localhost:3000/api/v1/docs/openapi.json`](http://localhost:3000/api/v1/docs/openapi.json)
- **Arquivo no Repositorio:** [`backend/src/docs/openapi.json`](backend/src/docs/openapi.json)

A interface Swagger documenta integralmente esquemas de dados de entrada e saida, cabecalhos de autenticacao, codigos de status HTTP e exemplos de requisicao para os 37 caminhos mapeados.

---

## 17. Testes Automatizados

A API conta com uma suite de **47 testes automatizados de integracao e conformidade RESTful**, executados diretamente sobre o runner de testes nativo do Node.js (`node:test` e `node:assert/strict`), sem adicao de dependencias externas.

### Como Executar os Testes

Com o servidor backend ativo na porta 3000:

```bash
npm test
```

Ou diretamente a partir da pasta `backend/`:

```bash
npm --prefix backend run test
```

### Distribuicao das 5 Suites de Teste

1. **Conformidade RESTful Canônica (`backend/tests/rest-conformance.test.js` - 9 testes):**
   - Validacao de `GET /users/:id` com retorno 200 de perfil publico ou 404 para ID inexistente.
   - Listagem (`GET /users/:userId/reviews`) e publicacao (`POST /users/:userId/reviews`) de avaliacoes.
   - Checagem em tempo real de disponibilidade de username via `GET /usernames/availability`.
   - Idempotencia na adicao de favoritos (`PUT /favorites/:productId`).
   - Idempotencia na remocao de favoritos (`DELETE /favorites/:productId`).
   - Verificacao de status favoritado (`GET /favorites/:productId`).
   - Aceitacao e rejeicao de propostas via `PATCH /chat/messages/:id/status`.
   - Modificacao de denuncias e protecao de remocao via `DELETE /reports/:id/product`.
   - Validacao de payload no endpoint `POST /account/phone-reversals`.

2. **Integridade da API e Seguranca (`backend/tests/api.test.js` - 14 testes):**
   - Healthcheck operacional com 200 em `GET /health`.
   - Presenca do cabecalho `Cache-Control` em `GET /categories`.
   - Paginacao e ordenacao estruturada em `GET /products`.
   - Busca fonetica regional via extensao PostgreSQL `unaccent`.
   - Rejeicao de credenciais incorretas com 401 em `POST /auth/login`.
   - Bloqueio de rotas privadas sem token com 401 em `GET /auth/me`.
   - Validacao de esquemas Zod com 400 em `POST /auth/register`.
   - Controle de acesso RBAC com 403 em `GET /reports` para perfil BUYER.
   - Protecao contra enumeracao de compradores em `GET /users/:id`.
   - Protecao contra forca bruta em codigos de verificacao OTP.
   - Resposta uniforme 404 em rotas inexistentes.
   - Bloqueio de pedidos nao autenticados com 401 em `POST /orders`.
   - Autenticacao federada Google via `POST /auth/google`.
   - Cadastro real com geracao de hash bcrypt e emissao de JWT em `POST /auth/register`.

3. **Fluxo Seguro de Alteracao de E-mail (`backend/tests/account-email.test.js` - 5 testes):**
   - Rejeicao de solicitacao com senha incorreta (401).
   - Bloqueio ao solicitar o mesmo e-mail atualmente ativo (400).
   - Envio de codigo OTP de 6 digitos sob validacao de credenciais (200).
   - Rejeicao de codigo incorreto com rastreamento de tentativas falhas (400).
   - Confirmacao atômica de novo e-mail no banco e invalidacao de tokens pendentes (200).

4. **Fluxo Seguro de Telefone / WhatsApp (`backend/tests/account-phone.test.js` - 10 testes):**
   - Rejeicao com senha incorreta (401).
   - Bloqueio preventivo sem vazamento de dados para numero em uso (409).
   - Envio de codigo OTP criptografado (200).
   - Bloqueio de codigo incorreto e controle de tentativas (400).
   - Confirmacao de codigo, ativacao do status verificado e persistencia (200).
   - Bloqueio de nova troca dentro da janela de cooldown de 7 dias (403).
   - Reversao imediata de numero via token assinado (200).
   - Suporte a contas originadas do Google OAuth para envio de OTP (200).
   - Desvinculacao segura de telefone mediante confirmacao de credenciais (200).
   - Bloqueio de alteracao indevida de telefone via endpoint geral de perfil (400).

5. **Regra de Cooldown de 30 Dias para Username (`backend/tests/username-cooldown.test.js` - 9 testes):**
   - Alteracao bem-sucedida de `@username` e gravacao em historico de auditoria (200).
   - Bloqueio imediato de segunda tentativa com 403 e dias restantes.
   - Persistencia do bloqueio apos encerramento e reinicio de sessao.
   - Persistencia do bloqueio em multiplos dispositivos via consulta de perfil.
   - Bloqueio de bypass de username via endpoint generico `PUT /auth/profile` (400).
   - Liberacao automatica de alteracao apos transcorridos os 30 dias.
   - Rejeicao com 409 em nome duplicado sem consumir o prazo de alteracao.
   - Alteracao de outros campos de perfil sem ativacao indevida do cooldown.
   - Precisao matematica no calculo de dias restantes e data limite.

6. **Suite de Testes Unitarios — Schemas e Validacoes Zod (`backend/tests/unit/schemas.test.js` - 20 testes):**
   - Validacao de limites de comprimento (AVL) para username (3 a 20 caracteres).
   - Bloqueio de caracteres especiais e lista de palavras reservadas do sistema.
   - Schemas de formatacao estrita para e-mails e codigos OTP de 6 digitos.
   - Schemas de validacao de celulares brasileiros e nono digito obrigatorio.
   - Schemas de cadastro de produtos, regras de preco nao negativo e enums.
   - Schemas de checkout de ordens (`createOrderSchema`) com regras de integridade.

7. **Suite de Testes Unitarios — Regras de Negocio e Formatadores (`backend/tests/unit/formatters-and-rules.test.js` - 10 testes):**
   - Calculo matematico de cooldown de 30 dias com precisao temporal em milissegundos.
   - Sanitizacao e normalizacao de telefones para formato E.164 brasileiro.
   - Calculo compulsorio de totais de pedidos e formatacao monetaria de centavos.
   - Rejeicao de itens inexistentes ou manipulacoes client-side de preco.

8. **Suite de Testes do Fluxo de Notificacoes (`backend/tests/notifications.test.js` - 11 testes):**
   - Listagem paginada, filtros por tipo (mensagem, avaliacao), ordenacao e contadores.
   - Marcacao de leitura individual e em lote.
   - Isolamento de dados entre usuarios (usuario A nao acessa notificacoes do usuario B).

### Resultado Verificado da Suite Automatizada

```text
Suite de Testes Unitarios — Schemas e Validacoes de Entrada (Zod) (20/20)
Suite de Testes Unitarios — Regras de Negocio e Formatadores Puros (10/10)
Suite de Testes Automatizados — Sistema de Notificacoes Itaim Vende (11/11)
Suite de Testes do Fluxo de Alteracao Segura de E-mail (/account/email) (5/5)
Suite de Testes do Fluxo Seguro de WhatsApp / Celular (/account/phone) (10/10)
Suite de Testes de Conformidade REST e Integracao da API Itaim Vende (14/14)
Suite de Testes de Conformidade REST Canonica (Novas Rotas e Metodos) (9/9)
Suite de Testes da Regra de Cooldown de 30 Dias e Historico para Username (@) (9/9)

Total de testes: 88
Suites executadas: 15
Aprovados: 88 (100%)
Falhas: 0
Cobertura em Regras de Negocio: 97,03%
```

---

## 18. Colecao Postman

A colecao oficial de endpoints para realizacao de testes manuais e integracoes encontra-se na raiz do projeto:

[`itaim-vende.postman_collection.json`](itaim-vende.postman_collection.json)

### Pastas e Recursos Contemplados na Colecao

- `01 - Diagnostico & Saude`: Testes do endpoint `GET /health`.
- `02 - Autenticacao & Usuarios`: Registro, login, autenticacao Google, recuperacao de senha por OTP, consulta de perfil autenticado (`/auth/me`), perfil publico do vendedor (`/users/:id`), disponibilidade de username (`/usernames/availability`) e reversao de telefone (`/account/phone-reversals`).
- `03 - Anuncios & Produtos`: Listagem paginada com busca fonetica unaccent, filtros compostos, publicacao de anuncios, consulta individual e exclusao.
- `04 - Categorias`: Listagem de categorias com verificacao do cabecalho `Cache-Control`.
- `05 - Chat & Negociacao`: Abertura de conversas, envio de mensagens e aceitacao/rejeicao de contrapropostas de valor (`PATCH /chat/messages/:id/status`).
- `06 - Pedidos & Checkout`: Emissao de pedidos com calculo no servidor e listagem de ordens.
- `07 - Favoritos`: Consulta de status, adicao idempotente (`PUT`), remocao idempotente (`DELETE`) e listagem de favoritos.
- `08 - Avaliacoes (Reviews)`: Consulta e publicacao de avaliacoes vinculadas a vendedores (`/users/:userId/reviews`).
- `09 - Denuncias & Moderacao`: Registro de denuncia, listagem no painel de moderadores e remocao cautelar de anuncios (`DELETE /reports/:id/product`).
- `10 - Enderecos`: Listagem, cadastro e remocao de enderecos.
- `11 - Notificacoes`: Listagem de avisos e marcacao de leitura em lote.

### Como Utilizar

1. Abra o Postman ou Insomnia.
2. Selecione a opcao **Import** e escolha o arquivo `itaim-vende.postman_collection.json`.
3. Configure a variavel de colecao `baseUrl` com o valor `http://localhost:3000/api/v1`.
4. Ao efetuar login ou registro, o token retornado pode ser atribuido a variavel `token` para autenticar automaticamente as rotas privadas.

---

## 19. Declaracao de Uso de Inteligencia Artificial

Ferramentas de Inteligencia Artificial Generativa baseadas em modelos de linguagem (LLMs) foram empregadas como instrumento de apoio ao desenvolvimento, revisao, documentacao e elaboracao de testes deste projeto.

### Atividades em que a IA foi Utilizada como Apoio

1. **Refatoracao e Modularizacao Arquitetural:** Auxilio no desacoplamento de modulos monoliticos em camadas especializadas (*Controllers, Services, Middlewares e Schemas*), reduzindo acoplamento e reforcando o principio de responsabilidade unica.
2. **Engenharia de Seguranca Defensiva:** Identificacao de vetores de vulnerabilidade em rotas HTTP, estruturacao de limitadores de taxa adaptativos (*rate limiting*) e validacao estrita de entradas contra injecao de parametros e manipulacao client-side de precos.
3. **Pipeline de Imagens:** Parametrizacao dos comandos de manipulacao da biblioteca Sharp, aplicando auto-rotacao com base em flags EXIF de smartphones e compressao em WebP sem perda perceptual de qualidade.
4. **Padronizacao de Contratos e Documentacao:** Apoio na estruturacao da especificacao formal OpenAPI 3.0.3 e consolidacao dos casos de teste para a suite de testes automatizados com o Node Test Runner nativo.

Todas as regras de negocio, decisoes de modelagem de dados, algoritmos de calculo e codigos-fonte foram implementados, testados, validados e homologados diretamente pelos desenvolvedores responsaveis pela aplicacao.

---

## 20. Processo de Gestao Agil (Scrum)

O gerenciamento do ciclo de desenvolvimento do Itaim Vende foi conduzido integralmente sob o framework Scrum, adaptado ao contexto academico da disciplina de Engenharia de Software III no IFPI Campus Paulistana sob orientacao do Prof. Me. Julian Rodrigues Valerio.

### 20.1. Quadro Kanban Oficial no GitHub Projects

O fluxo visual de trabalho foi gerenciado atraves de quadro Kanban integrado ao GitHub Projects, estruturado com as colunas *Backlog, Sprint Backlog, Em andamento, Em revisao e Pronto*:

* **Quadro Kanban do Projeto:** [Quadro de Gestao Agil — Itaim Vende (GitHub Projects #4)](https://github.com/users/KaykyTFF/projects/4)
* **Repositorio de Origem:** [KaykyTFF/ItaimVende-repo](https://github.com/KaykyTFF/ItaimVende-repo)

### 20.2. Equipe, Divisao de Papeis e Contribuicoes Reais (Baseadas em Commits)

Seguindo as diretrizes da disciplina, a equipe estruturou a divisao de papeis mantendo todos os integrantes participando ativamente do desenvolvimento e da homologacao de testes. As atribuicoes refletem com exatidao os commits registrados no historico do Git:

| Integrante | Foco Principal | Papel Sprint 1 | Papel Sprint 2 | Contribuicoes Efetivas Comprovadas por Commits no Git |
| :--- | :--- | :--- | :--- | :--- |
| **Kayky Terles** | Lider Tecnico e Backend | Product Owner | Product Owner | Arquitetura REST em camadas, autenticacao JWT, criptografia Bcrypt, Google OAuth, regras de integridade e calculo financeiro compulsorio de pedidos no servidor (`/orders`), regra de cooldown de 30 dias para username (`@`), extensao PostgreSQL `unaccent` para busca fonetica, pipeline Sharp WebP, integracao Supabase Storage, esteira de 88 testes automatizados e suite unitaria Zod. |
| **Pedro Ravy** | Backend e Usabilidade | Desenvolvedor | Desenvolvedor | Filtros de busca regional no Prisma (cidades e bairros do Vale do Itaim), regra de avaliacoes com trava de uma nota por comprador (EVAL-01), persistencia da central de tickets e suporte em banco (`MOD-1`), inclusao do campo Biografia e fundo neutro no perfil (`PRF-2` e `PRF-3`), botoes solidos em Meus Anuncios (`UI-1`) e trava de rolagem e zoom no recorte mobile de fotos (`MOB-1`). |
| **Josimar** | Frontend | Scrum Master | Desenvolvedor | Padronizacao do Skeleton Shimmer universal em todo o frontend (`UI-S1-04`), correcao de contraste no tema escuro (`UI-S1-05`), suporte do formulario de anuncio ao tema escuro (`UI-S1-06`), integracao da tela administrativa de tickets (`tickets.html` e controle de sessao `MOD-1`), e organizacao do catalogo de 19 categorias (`CAT-1`). |
| **Giselly** | Frontend | Desenvolvedora | Scrum Master | Redesenho das telas de login, modal de aviso para visitantes (`UI-S1-07`), botao Entrar e proporcoes do botao Vender (`UI-S1-08` e `UI-S1-09`), estabilidade visual com `scrollbar-gutter` (`UI-S1-10`), redesign de denuncias (`UI-S1-14`, `UI-S1-15` e `UI-S1-16`), baloes de proposta de negociacao no chat (`UI-S1-17`), implementacao do debounce de 400ms com feedback em tempo real (`MELH-1`), nova pagina 404 regional com arte do tatu (`UI-2`), pagina de busca com slider de preco (`UI-6` e `UI-7`), integracao do botao WhatsApp (`UI-8` e `UI-9`) e bloqueio visual do cooldown de 30 dias para username (`H13`). |
| **Raili** | Frontend | Desenvolvedora | Desenvolvedora | Revisao profunda do modo escuro em todas as paginas do marketplace (`UI-S1-01`), eliminacao de tela piscando no carregamento do tema escuro (`THM-1`), estilizacao de icones SVG na barra lateral (`UI-S1-02`), botoes solidos na aba Meus Anuncios (`UI-S1-03`), harmonizacao visual do chat e notificacoes no tema escuro (`THM-2`), e estilizacao das 19 categorias no catalogo (`CAT-1`). |

* **Product Owner Continuo:** O Kayky atuou como PO em ambas as sprints para assegurar consistencia na visao arquitetural, manutencao da Definition of Done e aceite rigoroso dos criterios BDD.
* **Alternancia do Scrum Master:** Conforme preconizado na disciplina, a facilitacao alternou entre sprints: Josimar atuou como Scrum Master na Sprint 1 e Giselly assumiu a funcao na Sprint 2.
* **Qualidade Coletiva:** A equipe nao adotou o papel isolado de testador; cada desenvolvedor foi compulsoriamente responsavel por criar e executar testes automatizados e manuais para suas respectivas entregas.

### 20.3. Product Goal — Visao do Produto

Definido formalmente na Sprint 0:

> **Nossa API e plataforma ajudam** pequenos produtores rurais, comerciantes locais, prestadores de servicos e moradores de Paulistana e regiao do Vale do Itaim **a** negociar, anunciar, comprar e vender produtos e servicos de maneira direta, confiavel e sem intermediarios, **porque** disponibiliza uma plataforma regional com busca que tolera erros de digitacao e acentos (`unaccent`), chat em tempo real com envio de contrapropostas de preco, regras de seguranca cadastral e calculo financeiro travado compulsoriamente no servidor.  
>  
> **Diferente de** plataformas genericas como OLX e Mercado Livre, **a nossa solucao** foi concebida para a realidade do semiarido piauiense, trazendo busca fonetica regional, filtros por bairros e municipios circunvizinhos, moderacao com expurgo automatico de arquivos na nuvem (Supabase Storage) e protecao contra fraudes com intervalo de 30 dias para alteracao do nome de usuario (`@username`).

### 20.4. Definition of Done (DoD) — Criterios de Conclusao

Uma historia so foi declarada pronta mediante atendimento integral a dez criterios estabelecidos na Sprint 0:

1. **Revisao por Colega:** Codigo integrado a branch principal exclusivamente via Pull Request revisado e aprovado por outro integrante.
2. **Testes Automatizados Aprovados:** 100% dos testes unitarios e de integracao da funcionalidade executando com sucesso no pipeline (mantendo 88 testes aprovados).
3. **Criterios de Aceitacao BDD:** Validacao de todos os cenarios Dado/Quando/Entao junto ao Product Owner.
4. **Documentacao OpenAPI 3.0.3:** Endpoints, schemas e respostas descritos no Swagger UI e serializados no `openapi.json`.
5. **Colecao Postman:** Exemplos de sucesso e casos de erro atualizados na colecao oficial `itaim-vende.postman_collection.json`.
6. **Seguranca de Credenciais:** Nenhuma chave, segredo ou token exposto no repositorio; tudo isolado em `.env`.
7. **Instrucoes do README Funcionais:** Procedimentos de instalacao e inicializacao testados e reproduziveis.
8. **Item da Equipe 1 — Validacao Rigorosa com Zod:** Sanitizacao estrita de todas as entradas de requisicao devolvendo respostas no formato padronizado RFC 7807.
9. **Item da Equipe 2 — Integracao Visual sem Erros no Console:** Interfaces com carregamento Skeleton Shimmer universal e zero excecoes no console do navegador.
10. **Item da Equipe 3 — Limpeza de Fotos na Nuvem:** Exclusao automatica de arquivos no bucket do Supabase Storage na exclusao ou moderacao de anuncios.

### 20.5. Resumo das Sprints e Metricas de Velocidade

| Fase | Periodo | Foco Tecnico | Metas e Incremento | Pontos Planejados | Pontos Entregues | Velocidade Efetiva |
| :---: | :---: | :--- | :--- | :---: | :---: | :---: |
| **Sprint 0** | 27/10 e 28/10 | Planejamento Inicial | Definicao do Product Goal, papeis no time, 10 criterios de DoD, 13 historias no Backlog e acordos operacionais. | — | — | — |
| **Sprint 1** | 29/10 a 03/11 | Nucleo Arquitetural e UI | Esqueleto funcional completo (Auth JWT, Bcrypt, Cache HTTP, Sharp WebP, Orders seguro, Skeleton Shimmer e Dark Mode). | 24 | 24 | **$V_1 = 24$ pts** |
| **Sprint 2** | 04/11 a 08/11 | Inovacao e Estabilidade | Cooldown de 30 dias para username (@), busca unaccent sem acentos, painel de moderacao, estilizacao 404 e MELH-1. | 28 | 28 | **$V_2 = 28$ pts** |

### 20.6. Destaques da Retrospectiva e Respostas Obrigatorias

Conforme deliberado nas sessoes de inspecao e adaptacao:

1. **Aumento de Velocidade ($V_2 = 28 > V_1 = 24$):**
   - Fundacao arquitetural pronta (PostgreSQL, Prisma, Express, Middlewares e CORS estabilizados na Sprint 1).
   - Eficacia da melhoria MELH-1, reduzindo retrabalho de requisicoes invalidas.
   - Divisao equilibrada com trabalho em paralelo entre backend e frontend.
   - Comunicacao continua via WhatsApp e resolucao imediata de impedimentos nos encontros no laboratorio do IFPI.

2. **Historia Devolvida no Primeiro Ciclo de Aceite:**
   - **H13 (Cooldown de 30 dias para alteracao de username):** No primeiro ciclo, o formulario enviava todos os dados em lote. Caso o usuario editasse apenas nome ou biografia, o backend interpretava o username inalterado como tentativa de troca do `@`, bloqueando indevidamente a operacao com HTTP 403.
   - **Correcao Efetuada:** O PO/Lider Tecnico refatorou o servico de perfil (`auth.profile.service.js`) para validar cooldown exclusivamente quando o username informado diferir do cadastrado no banco (`cleanUsername !== currentUser.username.toLowerCase()`), acompanhado da criacao do caso de teste CTM-8 na suite `username-cooldown.test.js`. Apos a correcao, a historia foi homologada com 100% de conformidade.

3. **Eficacia da Acao de Melhoria Continua (MELH-1):**
   - Implementacao de validacao assincrona previa com debounce de 400ms no frontend (`frontend/js/pages/perfil/configuracoes/config-conta.js`), consumindo o endpoint `/api/v1/auth/check-username`. O usuario recebe confirmacao de disponibilidade ou alerta de bloqueio antes do clique de envio, eliminando erros genericos de formulario.

### 20.7. Estrutura de Artefatos na Pasta `/scrum`

A totalidade dos registros documentais do processo agil encontra-se versionada no diretorio [`scrum/`](scrum/):

* [`scrum/acordos.md`](scrum/acordos.md): Product Goal formal, Divisao de Papeis, Definition of Done (10 itens) e Acordos de Trabalho.
* [`scrum/product-backlog.md`](scrum/product-backlog.md): 13 Historias de Usuario em formato BDD (Dado/Quando/Entao), Priorizacao MoSCoW, Estimativas em Story Points (Planning Poker) e Matriz de Rastreabilidade.
* [`scrum/sprint-1/planning.md`](scrum/sprint-1/planning.md): Sprint Goal da Sprint 1, Capacidade (24 pts), Fatias Verticais e Quadrantes Ageis (Q1 a Q4).
* [`scrum/sprint-1/dailies.md`](scrum/sprint-1/dailies.md): 4 Registros de Daily Scrum baseados em commits, tratamento de 4 impedimentos e Grafico de Burndown.
* [`scrum/sprint-1/review-retro.md`](scrum/sprint-1/review-retro.md): Demonstracao ao vivo de 10 incrementos, Homologacao do PO (24 pts aceitos), Retrospectiva Comecar/Parar/Continuar e definicao da acao MELH-1.
* [`scrum/sprint-2/planning.md`](scrum/sprint-2/planning.md): Sprint Goal da Sprint 2, Capacidade (28 pts), Inclusao da melhoria MELH-1 e Mapa de Testes.
* [`scrum/sprint-2/dailies.md`](scrum/sprint-2/dailies.md): 3 Registros de Daily Scrum baseados em commits, tratamento de 5 impedimentos e Grafico de Burndown.
* [`scrum/sprint-2/review-retro.md`](scrum/sprint-2/review-retro.md): Demonstracao de 9 incrementos, Homologacao do PO (28 pts aceitos) e Respostas formais as tres questoes obrigatorias da atividade.

---

## 21. Processo e Engenharia de Testes

A estrategia de garantia da qualidade da API Itaim Vende segue o processo formal de testes em cinco fases documentadas no diretorio [`docs/testes/`](docs/testes/):

1. **Fase 1 — Planejamento ([01-plano-de-testes.md](docs/testes/01-plano-de-testes.md)):** Escopo, objetivos, niveis de teste (unidade, integracao, sistema e aceitacao), estrategia de automacao, riscos mapeados com planos de contingencia e criterios formais de entrada e saida.
2. **Fase 2 — Projeto ([02-casos-de-teste-e-rastreabilidade.md](docs/testes/02-casos-de-teste-e-rastreabilidade.md)):** 20 casos de teste projetados com tecnicas formais de Particao de Equivalencia (PE), Analise de Valor Limite (AVL) e Tabela de Decisao (TD), integrados a Matriz de Rastreabilidade bidirecional.
3. **Fase 3 — Execucao ([03-execucao-e-relatorios-de-defeitos.md](docs/testes/03-execucao-e-relatorios-de-defeitos.md)):** Log completo de execucao da suite de 88 testes automatizados e formalizacao de cinco relatorios de defeitos de engenharia (BUG-01 a BUG-05) com severidade e prioridade.
4. **Fase 4 — Monitoramento e Controle ([04-painel-de-metricas.md](docs/testes/04-painel-de-metricas.md)):** Painel de metricas quantitativas de evolucao (ciclos T1 e T2), densidade de defeitos, velocidade de execucao (~430ms na suíte unitaria pura) e acoes de controle tomadas.
5. **Fase 5 — Encerramento ([05-relatorio-final-de-testes.md](docs/testes/05-relatorio-final-de-testes.md)):** Relatorio final consolidado, avaliacao de cobertura de regras de negocio (97,03%), conformidade com o Modelo V e parecer formal de liberacao para homologacao.

