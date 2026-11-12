<div align="center">
  <img src="assets/logos/header-logo.png" alt="Itaim Vende Logo" width="340">

  <p><strong>Plataforma de marketplace regional e intermediacao comercial de Paulistana e regiao do Vale do Itaim (PI).</strong></p>

  <p>
    <img src="https://img.shields.io/badge/NODE.JS-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js">
    <img src="https://img.shields.io/badge/EXPRESS.JS-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js">
    <img src="https://img.shields.io/badge/POSTGRESQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
    <img src="https://img.shields.io/badge/PLATAFORMA-WEB_%7C_REST_API-44BD32?style=for-the-badge" alt="Plataforma">
  </p>
</div>

---

# Itaim Vende

Plataforma digital de marketplace voltada para a comercializacao e intermediacao de produtos novos, seminovos e usados.

---

## Sumario

- [1. Nome e Apresentacao do Projeto](#1-nome-e-apresentacao-do-projeto)
- [2. Funcionalidades do Marketplace](#2-funcionalidades-do-marketplace)
- [3. Diferenciais da Plataforma](#3-diferenciais-da-plataforma)
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

O **Itaim Vende** e uma plataforma de marketplace desenvolvida para conectar compradores e vendedores de forma direta, promovendo a circulacao comercial em polos regionais do interior do Piaui, com foco em Paulistana e nos municipios que integram o Vale do Itaim.

### Proposito da Plataforma

A solucao oferece um canal proprio e acessivel para que comerciantes locais, pequenos produtores rurais, prestadores de servicos e moradores possam divulgar mercadorias, negociar precos em tempo real e concluir transacoes sem a cobranca de tarifas abusivas de intermediarios genericos, respeitando a realidade logistica e os habitos de retirada presencial da regiao.

### Perfis de Usuarios no Marketplace

- **Compradores (`BUYER`):** Navegam pelo catalogo, utilizam busca com tolerancia a erros de digitacao, enviam contrapropostas no chat, salvam itens favoritos, avaliam vendedores e gerenciam seus pedidos e enderecos.
- **Vendedores (`SELLER`):** Publicam e gerenciam anuncios com fotos, definem condicoes de venda, recebem propostas de compradores e acompanham o status de pedidos.
- **Moderadores e Administradores (`MODERATOR` / `ADMIN`):** Realizam a triagem de denuncias, revisao cautelar e remocao preventiva de anuncios irregulares, zelando pela conformidade e seguranca da comunidade.

---

## 2. Funcionalidades do Marketplace

A plataforma entrega uma experiencia completa de marketplace estruturada nas seguintes areas funcionais:

1. **Cadastro, Login e Gestao de Usuarios:**
   - Registro de conta com criptografia de senha e suporte a login rapido com Google OAuth2.
   - Gestao de perfil pessoal com biografia, foto de avatar, telefone e multiplos enderecos de entrega ou retirada.
   - Fluxos de seguranca para recuperacao de senha e confirmacao de e-mail e celular por codigo OTP de 6 digitos.
   - Intervalo compulsorio de 30 dias para alteracao do nome de usuario (`@username`) e token de reversao emergencial de seguranca.

2. **Criacao, Edicao e Gestao de Anuncios:**
   - Publicacao de produtos com titulo, descricao detalhada, preco, condicao de uso (novo, seminovo, usado ou com defeito) e localizacao.
   - Upload de multiplas imagens com conversao automatica para WebP e armazenamento em nuvem.
   - Painel "Meus Anuncios" para atualizacao de dados, fotos e encerramento de publicacoes ativas com controle estrito de propriedade.

3. **Pesquisa e Navegacao por Categorias:**
   - Catalogo estruturado por departamentos comerciais com carregamento otimizado via cache HTTP.
   - Filtros combinados por categoria, faixa de preco, condicao de uso e localizacao (municipios e bairros do Vale do Itaim).
   - Busca fonetica tolerante a acentos (`unaccent`), garantindo que buscas por "eletronicos" encontrem anuncios cadastrados como "Eletrônicos".

4. **Visualizacao de Produtos:**
   - Pagina de detalhes do anuncio com galeria de fotos, especificacoes, dados de localizacao, perfil publico do anunciante e reputacao.
   - Slugs semanticos amigaveis para compartilhamento e navegacao.

5. **Conversas e Negociacao em Tempo Real:**
   - Central de mensagens instantaneas integrada entre comprador e vendedor via WebSockets.
   - Envio formal de contrapropostas de preco com botoes para aceite ou recusa direta no chat.
   - Disparo automatico de notificacao por e-mail quando o usuario de destino estiver desconectado.

6. **Favoritos e Avaliacoes:**
   - Lista de desejos para salvar e gerenciar anuncios favoritos com operacoes idempotentes.
   - Sistema de reputacao com notas de 1 a 5 estrelas e comentarios descritivos sobre vendedores, com limite de uma avaliacao por comprador.

7. **Gerenciamento e Acompanhamento de Pedidos:**
   - Emissao de pedidos de compra com recalculo de valores obrigatoriamente no servidor, prevenindo adulteracoes no navegador.
   - Painel de historico para consulta de pedidos emitidos, itens vinculados, endereco selecionado e status de atendimento.

8. **Notificacoes:**
   - Central de avisos transacionais para atualizacoes de negociacoes, novos pedidos, mensagens e marcacao de leitura em lote.

9. **Denuncias e Moderacao:**
   - Canal de reporte de irregularidades com geracao de protocolo para acompanhamento.
   - Painel exclusivo para moderadores e administradores realizarem triagem, revisao e exclusao cautelar de anuncios fraudulentos com expurgo automatico de fotos na nuvem.

---

## 3. Diferenciais da Plataforma

- **Busca Regional Fonetica:** Pesquisa otimizada com extensao nativa PostgreSQL `unaccent`, permitindo localizar mercadorias digitando termos sem acentuacao no celular.
- **Negociacao Dinamica no Chat:** Baloes interativos de proposta financeira integrados a conversa, permitindo fechar combinados de valor de forma agil.
- **Seguranca Financeira no Servidor:** O checkout recalcula compulsoriamente os precos consultando a base de dados, ignorando quaisquer valores adulterados client-side.
- **Governanca Contra Fraudes:** Janela de seguranca de 30 dias para mudanca de nome de usuario (`@username`) e mecanismo de reversao emergencial de telefone para coibir golpes cadastrais.
- **Interface Responsiva e Tema Escuro:** Design limpo adaptado a dispositivos moveis, com carregamento suave via Skeleton Shimmer e suporte completo a modo escuro.

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

O backend utiliza arquitetura em camadas, separando o recebimento das requisições, as regras de negócio e o acesso aos dados.

```text
Cliente HTTP
    |
Routes
    |
Middlewares
    |
Controllers
    |
Services
    |
Prisma Client
    |
PostgreSQL
```

- **Routes:** definem os endpoints da API.
- **Middlewares:** tratam autenticação, autorização, validação e erros.
- **Controllers:** recebem as requisições e encaminham as operações.
- **Services:** concentram as regras de negócio.
- **Prisma:** realiza o acesso ao banco de dados.
- **Schemas e Utils:** apoiam a validação dos dados e funções compartilhadas.

---

## 6. Estrutura de Diretorios

O repositório está organizado em módulos de frontend, backend e documentação:

```text
ItaimVende-repo/
├── backend/
│   ├── prisma/          # Modelos e configuração do banco
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── sockets/
│   │   └── utils/
│   ├── tests/           # Testes automatizados
│   └── .env.example
├── frontend/
│   ├── assets/
│   ├── css/
│   ├── js/
│   └── pages/
├── scrum/               # Registros das sprints
├── docs/testes/         # Documentação do processo de testes
├── itaim-vende.postman_collection.json
├── package.json
└── README.md
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

### Exemplo de Resposta de Erro (400 Bad Request)

```json
{
  "success": false,
  "code": "VALIDATION_ERROR",
  "message": "Falha na validacao dos dados enviados.",
  "details": [
    {
      "field": "email",
      "message": "Informe um endereco de e-mail valido."
    }
  ]
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

O projeto possui **88 testes automatizados**, executados com o Node.js Test Runner (`node:test`).

Para executar os testes pela raiz do projeto:

```bash
npm test
```

Ou diretamente no backend:

```bash
npm --prefix backend run test
```

A suíte cobre autenticação, validação de dados, regras de negócio, notificações, operações da API e conformidade REST.

**Último resultado registrado no projeto:**

| Indicador | Resultado |
| :--- | :---: |
| Testes executados | 88 |
| Aprovados | 88 |
| Falhas | 0 |
| Cobertura de regras de negócio | 97,03% |

Os planos, casos de teste, registros de execução e métricas estão disponíveis em [`docs/testes/`](docs/testes/).

---

## 18. Colecao Postman

A colecao para testes manuais esta disponivel na raiz do repositorio:

[`itaim-vende.postman_collection.json`](itaim-vende.postman_collection.json)

Para utilizar:

1. Abra o Postman ou Insomnia e importe o arquivo.
2. Configure `baseUrl` como `http://localhost:3000/api/v1`.
3. Apos o login, informe o token JWT na variavel `token` para acessar as rotas protegidas.

---

## 19. Declaracao de Uso de Inteligencia Artificial

Foram utilizadas ferramentas de Inteligencia Artificial Generativa como apoio tecnico ao desenvolvimento e a documentacao deste projeto. Todas as decisoes de projeto, regras de negocio, arquitetura e validacoes foram concebidas, implementadas e homologadas pelos integrantes da equipe.

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

O processo de testes está documentado em [`docs/testes/`](docs/testes/) e dividido em cinco etapas:

1. **Planejamento:** escopo, objetivos, estratégia, riscos e critérios de entrada e saída.
2. **Projeto:** casos de teste e matriz de rastreabilidade.
3. **Execução:** resultados dos testes e registro de defeitos.
4. **Monitoramento:** métricas e acompanhamento da qualidade.
5. **Encerramento:** consolidação dos resultados e parecer final.
