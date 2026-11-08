# Itaim Vende API - Plataforma de Marketplace e Intermediação Comercial

Versão da API: 2.0.0  
Padrão de Especificação: OpenAPI 3.0.3  
Ambiente Base: Node.js (ES Modules) com Express.js e PostgreSQL  

---

## 1. Apresentação

O **Itaim Vende API** é uma solução de backend RESTful projetada para viabilizar operações de comércio eletrônico, intermediação de compras e vendas locais, negociação em tempo real e gestão de catálogos de produtos em microrregiões geográficas.

O projeto resolve o problema da ausência de infraestrutura digital direcionada a pequenos polos comerciais e produtores regionais, que habitualmente dependem de plataformas globais genéricas com elevados custos de intermediação e sem filtros contextualizados por cidades, bairros e hábitos locais.

### Proposta de Valor e Diferenciais

- **Arquitetura Orientada ao Domínio:** Modelagem de 12 recursos integrados com integridade relacional estrita e transações ACID.
- **Busca Fonética e Resiliente:** Mecanismo de busca textual com PostgreSQL `unaccent` e `pg_trgm`, garantindo relevância de resultados mesmo com variações ortográficas e supressão de acentuação.
- **Governança de Identidade e Segurança Ativa:** Regras de negócio restritivas para alteração de credenciais, incluindo cooldown de 30 dias para troca de nome de usuário, confirmação de contato via código OTP com limitação de tentativas e token criptografado para rollback emergencial.
- **Integridade Transacional Financeira:** Recálculo e validação compulsória de preços, quantidades e frete no servidor durante a criação de ordens de pedido, prevenindo inconsistências originadas no cliente.
- **Comunicação em Tempo Real:** Camada WebSocket bidirecional para negociações instantâneas de propostas de valor com mecanismo de contingência para envio assíncrono de notificações.

---

## 2. Funcionalidades

### Principais Recursos da API

1. **Gestão de Identidade e Autenticação:**
   - Registro de contas com validação estrita de campos e requisitos de complexidade de senha.
   - Autenticação stateless com JSON Web Token (JWT) e proteção contra força bruta.
   - Suporte a provedores de autenticação externa (Google OAuth2).
   - Fluxo de recuperação de senha via código OTP temporário de 6 dígitos.

2. **Segurança de Conta e Governança:**
   - Alteração controlada de nome de usuário (`@username`) com verificação de unicidade, bloqueio de termos reservados e janela de retenção de 30 dias entre alterações.
   - Atualização de e-mail e telefone/WhatsApp condicionada a desafio de senha e validação de código OTP.
   - Mecanismo de reversão imediata de telefone via token assinado (`/account/phone/revert`) para mitigação de acessos indevidos.
   - Histórico e auditoria de ações sensíveis na conta.

3. **Catálogo de Produtos e Anúncios:**
   - Criação, atualização, consulta e exclusão de anúncios com upload múltiplo de fotos.
   - Categorização hierárquica por departamentos.
   - Busca textual fonética e filtros combinados por cidade, bairro, faixa de preço, condição de uso e status.
   - Paginação baseada em cursores/páginas e múltiplas opções de ordenação.

4. **Intermediação de Pedidos e Checkout:**
   - Criação de pedidos com verificação de disponibilidade de estoque e recálculo total no servidor.
   - Acompanhamento de status de ordens (pendente, aprovado, entregue, cancelado).
   - Associação de opções de entrega e endereços cadastrados.

5. **Negociação e Mensagens em Tempo Real:**
   - Abertura de conversas vinculadas a produtos específicos.
   - Envio de mensagens de texto e envio formal de propostas de preço (ofertas).
   - Aceitação ou rejeição de contrapropostas com atualização instantânea de estado.
   - Fallback automatizado para notificação via e-mail quando o usuário destinatário estiver desconectado.

6. **Avaliações, Favoritos e Moderação:**
   - Registro de avaliações com notas numéricas (1 a 5) e comentários para vendedores.
   - Marcação de anúncios favoritos por usuário.
   - Sistema de denúncias de anúncios suspeitos com painel exclusivo para perfis administrativos e moderadores.
   - Purga automatizada de imagens do armazenamento em nuvem no descarte de produtos ou anúncios penalizados.

7. **Pipeline de Mídia:**
   - Upload de imagens via formulário multipart com processamento automático em pipeline Sharp.
   - Redimensionamento proporcional, rotação baseada em metadados EXIF e conversão para WebP de alta eficiência.
   - Armazenamento em nuvem via Supabase Storage com fallback para sistema de arquivos local em desenvolvimento.

---

## 3. Tecnologias Utilizadas

- **Ambiente de Execução:** Node.js (versão 20.x LTS ou superior), utilizando módulos ECMAScript nativos (`"type": "module"`).
- **Framework Web:** Express.js 5.
- **Banco de Dados Relacional:** PostgreSQL 15+ (hospedado no Supabase).
- **Mapeamento Objeto-Relacional (ORM):** Prisma ORM v6 com migrations e cliente fortemente tipado.
- **Extensões de Banco de Dados:** `unaccent` e `pg_trgm` (PostgreSQL Trigram Search).
- **Autenticação e Criptografia:**
  - `jsonwebtoken`: Emissão e verificação de tokens Bearer JWT com algoritmo HS256.
  - `bcryptjs`: Hash criptográfico de senhas com geração de salt (10 rounds).
- **Validação de Dados:** `zod` para declaração de contratos de entrada e sanitização em tempo de execução.
- **Comunicação em Tempo Real:** `socket.io` (WebSockets) integrado ao servidor HTTP Express.
- **Processamento de Imagens:** `sharp` para redimensionamento e conversão WebP.
- **Armazenamento de Objetos:** `@supabase/supabase-js` para persistência em bucket público de CDN.
- **Envio de Notificações:** `resend` e `nodemailer` para mensagens transacionais.
- **Segurança HTTP:**
  - `helmet`: Aplicação de cabeçalhos de segurança (CSP, HSTS, X-Frame-Options).
  - `cors`: Gerenciamento de políticas de compartilhamento de recursos entre origens.
  - `express-rate-limit`: Limitação de requisições por endereço IP em endpoints sensíveis.
- **Documentação de API:** `swagger-ui-express` servindo a especificação no padrão OpenAPI 3.0.3.
- **Testes Automatizados:** Node.js Test Runner nativo (`node:test` e `node:assert/strict`).

---

## 4. Arquitetura

O sistema adota uma arquitetura em camadas desacopladas, seguindo os princípios de separação de responsabilidades (SoC) e inversão de controle.

```
┌────────────────────────────────────────────────────────┐
│                   Cliente HTTP / SPA                   │
└───────────────────────────┬────────────────────────────┘
                            │ Requisição HTTP / JSON
                            ▼
┌────────────────────────────────────────────────────────┐
│                   Camada de Entrada                    │
│   • Express Router (/api/v1)                           │
│   • Middlewares Globais (Cors, Helmet, Rate Limit)     │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                 Camada de Middlewares                  │
│   • Autenticação (requireAuth - Bearer JWT)            │
│   • Autorização RBAC (requireRole)                     │
│   • Validação de Contrato (validateSchema - Zod)       │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                  Camada de Controllers                 │
│   • Extração e desestruturação de parâmetros           │
│   • Orquestração do fluxo de resposta HTTP             │
│   • Formatação de códigos de status (200, 201, 204)    │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                   Camada de Services                   │
│   • Lógica de negócio e regras de domínio              │
│   • Validações de integridade e cálculos financeiros   │
│   • Emissão de eventos e despachos assíncronos         │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│              Camada de Acesso a Dados / ORM            │
│   • Prisma Client (Singleton)                          │
│   • Transações ACID ($transaction)                     │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│               Banco de Dados PostgreSQL                │
│   • Tabelas relacionais, Chaves estrangeiras           │
│   • Extensões de texto fonético (unaccent, trigram)    │
└────────────────────────────────────────────────────────┘
```

### Responsabilidade de Cada Camada

- **Config (`src/config`):** Centraliza a validação das variáveis de ambiente na inicialização da aplicação e expõe instâncias singleton do banco de dados (Prisma) e serviços de nuvem.
- **Middlewares (`src/middlewares`):** Realiza a interceptação de requisições para verificação de credenciais JWT, imposição de controle de acesso baseado em papéis (RBAC), validação sintática e semântica com Zod, e captura unificada de exceções através do handler central de erros.
- **Routes (`src/routes`):** Define a estrutura declarativa de endpoints REST sob o prefixo `/api/v1`, associando cada rota aos seus respectivos middlewares de proteção e controladores.
- **Controllers (`src/controllers`):** Recebe o payload validado da requisição, repassa os dados aos serviços correspondentes e retorna a resposta com o código de status HTTP e formato JSON padronizado.
- **Services (`src/services`):** Encapsula todas as regras de negócio da aplicação. É a única camada com autorização para executar validações complexas, gerenciar transações no banco de dados e acionar integrações externas (e-mail, sockets e armazenamento).
- **Schemas (`src/schemas`):** Define os contratos formais de entrada de dados utilizando Zod, garantindo tipagem em tempo de execução e mensagens de erro descritivas.
- **Utils (`src/utils`):** Funções utilitárias e classes customizadas de erro, como a classe `AppError`, responsável por encapsular códigos de status HTTP e identificadores de erro de domínio.

---

## 5. Requisitos para Execução

Antes de executar o projeto, certifique-se de que os seguintes componentes estão instalados e configurados:

- **Node.js:** Versão 20.0.0 ou superior (recomendado v20.x ou v22.x LTS).
- **NPM:** Versão 9.0.0 ou superior.
- **Instância PostgreSQL:** Versão 14 ou superior (localmente ou via serviço gerenciado como Supabase).
- **Acesso à Internet:** Necessário para sincronização de pacotes e comunicação com os serviços de armazenamento e e-mail.

---

## 6. Instalação e Configuração

### 1. Clonagem do Repositório

```bash
git clone https://github.com/KaykyTFF/ItaimVende-repo.git
cd ItaimVende-repo
```

### 2. Instalação de Dependências

Instale as dependências da raiz e do módulo de backend:

```bash
npm install
npm --prefix backend install
```

### 3. Configuração de Variáveis de Ambiente

Crie o arquivo `.env` dentro da pasta `backend/` tomando como referência o modelo `.env.example`:

```bash
cp backend/.env.example backend/.env
```

Edite o arquivo `backend/.env` informando as configurações do seu ambiente:

| Variável | Obrigatória | Descrição | Exemplo |
| :--- | :---: | :--- | :--- |
| `PORT` | Não | Porta do servidor HTTP Express (padrão: 3000) | `3000` |
| `NODE_ENV` | Não | Modo de execução do ambiente | `development` ou `production` |
| `DATABASE_URL` | Sim | URI de conexão com o PostgreSQL (porta com pooling) | `postgresql://user:pass@host:6543/postgres?pgbouncer=true` |
| `DIRECT_URL` | Sim | URI de conexão direta com o PostgreSQL (para migrações) | `postgresql://user:pass@host:5432/postgres` |
| `JWT_SECRET` | Sim | Chave criptográfica para assinatura de tokens JWT (mínimo 32 caracteres) | `c53f888f918fa9074d6c...` |
| `SUPABASE_URL` | Não | URL do endpoint da API do Supabase | `https://xyzproject.supabase.co` |
| `SUPABASE_KEY` | Não | Chave anon ou service_role para operações de bucket | `eyJhbGciOiJIUzI1NiIsInR5cCI...` |
| `SUPABASE_BUCKET` | Não | Nome do bucket público de armazenamento de imagens | `marketplace` |
| `STORAGE_PROVIDER` | Não | Estratégia de armazenamento (`supabase` ou `local`) | `supabase` |
| `RESEND_API_KEY` | Não | Chave de autenticação da API Resend para e-mails | `re_123456789...` |
| `EMAIL_FROM` | Não | Endereço do remetente exibido nas notificações | `contato@seudominio.com.br` |

### 4. Configuração e Sincronização do Banco de Dados

Com o banco de dados PostgreSQL acessível, execute os comandos de sincronização do Prisma e criação dos índices textuais:

```bash
# 1. Gerar os artefatos do Prisma Client
npm --prefix backend run prisma:generate

# 2. Aplicar o schema relacional diretamente ao banco
npm --prefix backend run prisma:push

# 3. Criar a extensão unaccent e índices Trigram no PostgreSQL
npm --prefix backend run db:indexes

# 4. Executar o script de seed para criar categorias e dados iniciais
npm --prefix backend run seed
```

### 5. Inicialização da Aplicação

Para iniciar o servidor em ambiente de desenvolvimento com reinicialização automática:

```bash
npm --prefix backend run dev
```

Para inicialização em modo de produção:

```bash
npm --prefix backend run start
```

Após a inicialização, a API estará acessível em: `http://localhost:3000/api/v1/health`

---

## 7. Autenticação e Autorização

A API utiliza o modelo de autenticação **stateless baseada em JSON Web Token (Bearer JWT)**.

### Estrutura e Ciclo de Vida do Token

- **Geração:** O token é emitido nos endpoints `POST /api/v1/auth/login`, `POST /api/v1/auth/register` e `POST /api/v1/auth/google`.
- **Payload:** Contém o identificador único do usuário (`id`), endereço de e-mail (`email`) e papel atribuído (`role`).
- **Validade:** Tokens possuem expiração configurada para 7 dias em login padrão ou 24 horas para sessões de desenvolvimento.
- **Envio:** Deve ser encaminhado pelo cliente em todas as rotas protegidas através do cabeçalho padrão:
  ```http
  Authorization: Bearer <seu_token_jwt>
  ```

### Papéis do Sistema (RBAC)

O controle de acesso baseado em papéis restringe as operações por nível de privilégio:

| Papel | Permissões e Acesso |
| :--- | :--- |
| `BUYER` | Perfil padrão de cliente. Permite consulta a catálogos, envio de pedidos, cadastro de endereços, adição de favoritos, participação em conversas e emissão de avaliações. |
| `SELLER` | Produtor ou lojista. Possui todas as permissões de `BUYER` e autorização para cadastro, edição e exclusão de anúncios de produtos próprios. |
| `MODERATOR` | Agente moderador. Permite visualização do painel de denúncias (`GET /reports`) e aplicação de medidas cautelares sobre anúncios em análise. |
| `ADMIN` | Administrador pleno. Acesso irrestrito a todos os endpoints, incluindo auditoria do sistema, remoção definitiva de conteúdos e gestão de privilégios. |

---

## 8. Endpoints da API

Todas as rotas estão versionadas sob o prefixo canônico `/api/v1`.

### Diagnóstico e Monitoramento

| Método | Endpoint | Finalidade | Autenticação | Status |
| :---: | :--- | :--- | :---: | :---: |
| `GET` | `/health` | Retorna o status de operação da API, versão ativa, uptime e identificador de inicialização. | Pública | `200` |

### Autenticação e Gestão de Sessão (`/auth`)

| Método | Endpoint | Finalidade | Autenticação | Status |
| :---: | :--- | :--- | :---: | :---: |
| `POST` | `/auth/register` | Cadastra novo usuário no sistema com hash de senha. | Pública | `201`, `400`, `409` |
| `POST` | `/auth/login` | Autentica o usuário mediante e-mail/senha e emite JWT. | Pública | `200`, `400`, `401`, `429` |
| `POST` | `/auth/google` | Autentica ou cadastra usuário via token Google OAuth2. | Pública | `200`, `400`, `401` |
| `POST` | `/auth/forgot-password` | Dispara e-mail com código OTP de 6 dígitos para recuperação. | Pública | `200`, `400`, `429` |
| `POST` | `/auth/verify-reset-code` | Valida código de recuperação com proteção anti-força bruta. | Pública | `200`, `400`, `429` |
| `POST` | `/auth/reset-password` | Conclui a redefinição de senha utilizando o código validado. | Pública | `200`, `400` |
| `GET` | `/auth/me` | Obtém o perfil cadastral completo do usuário logado. | Bearer JWT | `200`, `401` |
| `PUT` | `/auth/profile` | Atualiza informações cadastrais básicas (nome, bio, avatar). | Bearer JWT | `200`, `400`, `401` |
| `PUT` | `/auth/password` | Altera a senha do usuário mediante validação da senha atual. | Bearer JWT | `200`, `400`, `401` |
| `GET` | `/auth/user/:id` | Retorna dados públicos do perfil de um anunciante/vendedor. | Pública | `200`, `404` |

### Governança e Segurança de Conta (`/account`)

| Método | Endpoint | Finalidade | Autenticação | Status |
| :---: | :--- | :--- | :---: | :---: |
| `PATCH` | `/account/username` | Altera o identificador `@username` aplicando cooldown de 30 dias. | Bearer JWT | `200`, `400`, `403`, `409` |
| `GET` | `/account/username/check` | Verifica disponibilidade de um username em tempo real. | Pública | `200`, `400` |
| `POST` | `/account/email/change-request` | Inicia solicitação de troca de e-mail enviando OTP ao novo endereço. | Bearer JWT | `200`, `400`, `401`, `409` |
| `POST` | `/account/email/confirm` | Confirma alteração de e-mail validando código OTP de 6 dígitos. | Bearer JWT | `200`, `400`, `404`, `429` |
| `POST` | `/account/phone/change-request` | Solicita alteração de telefone/WhatsApp com envio de código OTP. | Bearer JWT | `200`, `400`, `401`, `409` |
| `POST` | `/account/phone/confirm` | Confirma novo número, valida OTP e emite token de reversão. | Bearer JWT | `200`, `400`, `429` |
| `POST` | `/account/phone/revert` | Restaura imediatamente o número anterior via token criptografado. | Pública | `200`, `400`, `404` |
| `DELETE` | `/account/phone` | Desvincula o número de telefone da conta do usuário. | Bearer JWT | `200`, `400`, `401` |
| `GET` | `/account/preferences` | Consulta preferências de notificação do usuário. | Bearer JWT | `200`, `401` |
| `PATCH` | `/account/preferences` | Atualiza opções de notificação por e-mail e push. | Bearer JWT | `200`, `400`, `401` |

### Catálogo de Produtos e Anúncios (`/products`)

| Método | Endpoint | Finalidade | Autenticação | Status |
| :---: | :--- | :--- | :---: | :---: |
| `GET` | `/products` | Lista produtos com paginação, ordenação e filtros compostos. | Pública | `200` |
| `GET` | `/products/:id` | Obtém dados detalhados de um produto por ID numérico ou slug. | Pública | `200`, `404` |
| `POST` | `/products` | Registra novo anúncio no catálogo com upload de fotos. | Bearer JWT (`SELLER`+) | `201`, `400`, `401` |
| `PUT` | `/products/:id` | Atualiza dados de anúncio existente (proprietário ou admin). | Bearer JWT | `200`, `400`, `403`, `404` |
| `DELETE` | `/products/:id` | Remove anúncio e expurga mídias associadas no bucket. | Bearer JWT | `204`, `401`, `403`, `404` |

### Categorias (`/categories`)

| Método | Endpoint | Finalidade | Autenticação | Status |
| :---: | :--- | :--- | :---: | :---: |
| `GET` | `/categories` | Lista todos os departamentos ativos (com header `Cache-Control`). | Pública | `200` |

### Pedidos e Checkout (`/orders`)

| Método | Endpoint | Finalidade | Autenticação | Status |
| :---: | :--- | :--- | :---: | :---: |
| `POST` | `/orders` | Cria nova ordem com cálculo financeiro garantido no servidor. | Bearer JWT | `201`, `400`, `401` |
| `GET` | `/orders` | Lista histórico de pedidos efetuados pelo usuário autenticado. | Bearer JWT | `200`, `401` |
| `GET` | `/orders/:id` | Consulta o detalhamento completo de uma ordem específica. | Bearer JWT | `200`, `401`, `404` |
| `PATCH` | `/orders/:id/status` | Atualiza o estado da ordem (pendente, pago, enviado, entregue). | Bearer JWT | `200`, `400`, `403` |

### Comunicação e Negociação (`/chat`)

| Método | Endpoint | Finalidade | Autenticação | Status |
| :---: | :--- | :--- | :---: | :---: |
| `GET` | `/chat/conversations` | Lista todas as negociações em andamento do usuário. | Bearer JWT | `200`, `401` |
| `POST` | `/chat/conversations` | Abre nova conversa de negociação vinculada a um anúncio. | Bearer JWT | `201`, `400`, `401` |
| `GET` | `/chat/conversations/:id/messages` | Recupera o histórico de mensagens de uma negociação. | Bearer JWT | `200`, `401`, `403` |
| `POST` | `/chat/conversations/:id/messages` | Envia mensagem textual ou proposta formal de valor. | Bearer JWT | `201`, `400`, `401` |
| `PATCH` | `/chat/messages/:id/accept` | Aceita formalmente uma oferta/proposta financeira recebida. | Bearer JWT | `200`, `401`, `403` |

### Avaliações e Reputação (`/reviews`)

| Método | Endpoint | Finalidade | Autenticação | Status |
| :---: | :--- | :--- | :---: | :---: |
| `GET` | `/reviews/user/:userId` | Consulta métricas de reputação e notas atribuídas a um vendedor. | Pública | `200`, `404` |
| `POST` | `/reviews/user/:userId` | Registra avaliação com nota (1 a 5) e comentário descritivo. | Bearer JWT | `201`, `400`, `401` |
| `DELETE` | `/reviews/:id` | Exclui uma avaliação previamente publicada pelo autor ou admin. | Bearer JWT | `204`, `401`, `403`, `404` |

### Favoritos (`/favorites`)

| Método | Endpoint | Finalidade | Autenticação | Status |
| :---: | :--- | :--- | :---: | :---: |
| `GET` | `/favorites` | Lista os produtos adicionados à lista de favoritos do usuário. | Bearer JWT | `200`, `401` |
| `POST` | `/favorites/:productId/toggle` | Alterna a inclusão ou remoção de um anúncio dos favoritos. | Bearer JWT | `200`, `401`, `404` |

### Denúncias e Moderação (`/reports`)

| Método | Endpoint | Finalidade | Autenticação | Status |
| :---: | :--- | :--- | :---: | :---: |
| `POST` | `/reports/:productId` | Registra denúncia de irregularidade contra anúncio publicado. | Pública / JWT | `201`, `400` |
| `GET` | `/reports` | Painel de controle de denúncias pendentes para moderadores. | Bearer JWT (`MODERATOR`+) | `200`, `401`, `403` |
| `POST` | `/reports/:id/remove-product` | Acata denúncia, cancela anúncio e expurga mídias do storage. | Bearer JWT (`ADMIN`) | `200`, `401`, `403` |

### Endereços (`/addresses`)

| Método | Endpoint | Finalidade | Autenticação | Status |
| :---: | :--- | :--- | :---: | :---: |
| `GET` | `/addresses` | Lista os endereços residenciais cadastrados pelo usuário. | Bearer JWT | `200`, `401` |
| `POST` | `/addresses` | Cadastra novo endereço para recebimento e entregas. | Bearer JWT | `201`, `400`, `401` |
| `DELETE` | `/addresses/:id` | Remove endereço previamente registrado pelo usuário. | Bearer JWT | `204`, `401`, `404` |

### Upload e Mídia (`/upload`)

| Método | Endpoint | Finalidade | Autenticação | Status |
| :---: | :--- | :--- | :---: | :---: |
| `POST` | `/upload` | Recebe arquivo via `multipart/form-data`, otimiza e persiste em nuvem. | Bearer JWT | `201`, `400`, `401` |

---

## 9. Paginação, Filtros e Ordenação

O endpoint `GET /api/v1/products` implementa suporte completo a consultas com paginação estruturada, filtros combinados e ordenação por parâmetros de consulta (query parameters).

### Parâmetros Disponíveis

| Parâmetro | Tipo | Descrição | Valores Suportados |
| :--- | :---: | :--- | :--- |
| `page` | Inteiro | Número da página solicitada (padrão: 1) | `>= 1` |
| `limit` | Inteiro | Quantidade máxima de itens por página (padrão: 12) | `1` a `50` |
| `sort` | String | Critério de ordenação da coleção | `recent` (mais novos), `price_asc` (menor preço), `price_desc` (maior preço), `views` (mais visualizados) |
| `search` | String | Termo textual para busca fonética e com unaccent | Ex: `eletronicos`, `queijo`, `artesanato` |
| `categoryId` | String | Filtrar por identificador de categoria específica | Ex: `cat_eletronicos` |
| `city` | String | Filtrar por cidade do anunciante | Ex: `Paulistana`, `Acauã`, `Jacobina` |
| `neighborhood` | String | Filtrar por bairro específico | Ex: `Centro`, `Cohab`, `Correntezal` |
| `minPrice` | Numérico | Filtro de preço mínimo | `>= 0` |
| `maxPrice` | Numérico | Filtro de preço máximo | `>= minPrice` |
| `condition` | String | Condição de uso do item | `NEW` (novo) ou `USED` (usado) |

### Exemplo de Requisição

```http
GET /api/v1/products?search=eletronicos&city=Paulistana&minPrice=100&maxPrice=1500&sort=price_asc&page=1&limit=10 HTTP/1.1
Host: localhost:3000
Accept: application/json
```

### Exemplo de Resposta Estruturada

```json
{
  "products": [
    {
      "id": "cmv1234567890",
      "title": "Smartphone 128GB",
      "description": "Aparelho conservado com capa e carregador original.",
      "price": 650.00,
      "condition": "USED",
      "city": "Paulistana",
      "neighborhood": "Centro",
      "images": [
        "https://xyz.supabase.co/storage/v1/object/public/marketplace/products/cmv1234.webp"
      ],
      "category": {
        "id": "cat_eletronicos",
        "name": "Eletrônicos"
      },
      "createdAt": "2026-11-05T14:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1,
    "hasMore": false
  }
}
```

---

## 10. Tratamento de Erros

A API implementa tratamento unificado de erros através de middleware centralizado. Todas as respostas de erro seguem estritamente o formato padrão com indicação de status HTTP, código de erro interno e detalhes estruturados.

### Estrutura Padrão de Erro

```json
{
  "success": false,
  "code": "CODIGO_DO_ERRO",
  "message": "Descrição amigável e explicativa da falha.",
  "details": []
}
```

### Exemplos Reais de Resposta

#### 1. Erro de Validação de Entrada (400 Bad Request)

Disparado automaticamente pelo validador Zod ao identificar violações nos campos enviados:

```json
{
  "success": false,
  "code": "VALIDATION_ERROR",
  "message": "Erro de validação nos dados fornecidos.",
  "details": [
    {
      "field": "email",
      "message": "Informe um endereço de e-mail válido."
    },
    {
      "field": "password",
      "message": "A senha deve conter no mínimo 6 caracteres."
    }
  ]
}
```

#### 2. Falha de Autenticação (401 Unauthorized)

Disparado em caso de ausência de credenciais, token expirado ou senha incorreta:

```json
{
  "success": false,
  "code": "UNAUTHORIZED",
  "message": "E-mail ou senha incorretos."
}
```

#### 3. Violação de Regra de Negócio / Acesso Negado (403 Forbidden)

Disparado quando a operação é bloqueada por controle de permissão RBAC ou regras de domínio (ex: cooldown de 30 dias para alteração de `@username`):

```json
{
  "success": false,
  "code": "USERNAME_CHANGE_COOLDOWN",
  "message": "Você só pode alterar seu nome de usuário a cada 30 dias. Próxima alteração disponível em 29 dias.",
  "details": {
    "nextAllowedDate": "2026-12-07T15:00:00.000Z",
    "daysRemaining": 29
  }
}
```

#### 4. Recurso Não Encontrado (404 Not Found)

Disparado quando o identificador informado não corresponde a nenhum registro ativo:

```json
{
  "success": false,
  "code": "NOT_FOUND",
  "message": "O produto solicitado não foi encontrado ou já foi finalizado."
}
```

#### 5. Conflito de Integridade (409 Conflict)

Disparado na tentativa de registrar duplicidade de identificador exclusivo (e-mail ou nome de usuário):

```json
{
  "success": false,
  "code": "USERNAME_ALREADY_EXISTS",
  "message": "Este nome de usuário já está sendo utilizado por outra conta."
}
```

---

## 11. Documentação Interativa (OpenAPI / Swagger)

A especificação completa da API está documentada e disponível para consumo interativo via Swagger UI:

- **Interface Swagger UI:** [`http://localhost:3000/api-docs`](http://localhost:3000/api-docs) ou [`http://localhost:3000/api/v1/docs`](http://localhost:3000/api/v1/docs)
- **Arquivo de Especificação OpenAPI 3.0.3 (JSON):** [`http://localhost:3000/api/v1/docs/openapi.json`](http://localhost:3000/api/v1/docs/openapi.json)
- **Arquivo Local no Repositório:** [`backend/src/docs/openapi.json`](backend/src/docs/openapi.json)

A interface Swagger documenta integralmente esquemas de dados, parâmetros aceitos, exemplos de payloads, cabeçalhos de autenticação e códigos de resposta para todos os endpoints.

---

## 12. Testes Automatizados

A API conta com suíte de testes de integração e conformidade REST executada através do runner nativo do Node.js (`node:test`), sem necessidade de dependências pesadas de terceiros.

### Execução dos Testes

Certifique-se de que o servidor backend esteja em execução na porta 3000 e rode o comando na raiz do projeto:

```bash
npm test
```

Ou execute diretamente dentro da pasta `backend/`:

```bash
npm --prefix backend run test
```

### Quantidade Real de Testes e Cobertura

A suíte contém **38 testes automatizados**, divididos em 4 blocos de cobertura:

1. **Conformidade REST e Integridade da API (`api.test.js` - 14 testes):**
   - Diagnóstico e integridade do endpoint `GET /health` (Status 200).
   - Validação de cabeçalho `Cache-Control` no endpoint `GET /categories`.
   - Consulta paginada e ordenação estruturada em `GET /products`.
   - Busca fonética regional resiliente via extensão PostgreSQL `unaccent`.
   - Bloqueio de autenticação incorreta com 401 Unauthorized em `POST /auth/login`.
   - Rejeição de requisições privadas sem token JWT com 401 Unauthorized em `GET /auth/me`.
   - Validação de payload via Zod com retorno 400 Bad Request detalhado.
   - Validação de controle de acesso RBAC com retorno 403 Forbidden em `GET /reports`.
   - Proteção de segurança anti-enumeração de usuários em `GET /auth/user/:id`.
   - Proteção contra força bruta em códigos de verificação OTP com retorno 400/429.
   - Tratamento de rotas inexistentes com 404 Not Found padronizado.
   - Garantia de integridade financeira impedindo ordens não autorizadas com 401 em `POST /orders`.
   - Fluxo completo de cadastro e login Google via `POST /auth/google`.
   - Registro real de usuário válido com geração de hash e emissão de JWT em `POST /auth/register`.

2. **Fluxo Seguro de Alteração de E-mail (`account-email.test.js` - 5 testes):**
   - Rejeição de solicitação com senha incorreta (401).
   - Bloqueio de solicitação informando o mesmo e-mail atual (400).
   - Envio de código OTP de 6 dígitos mediante confirmação de senha (200).
   - Rejeição de código incorreto com incremento de tentativas falhas (400).
   - Validação de código correto, atualização atômica no banco e invalidação de pendências (200).

3. **Fluxo Seguro de WhatsApp / Celular (`account-phone.test.js` - 10 testes):**
   - Rejeição com senha incorreta (401).
   - Bloqueio preventivo sem vazamento de dados para número já em uso (409).
   - Envio de código OTP criptografado (200).
   - Rejeição de código incorreto e rastreamento de tentativas (400).
   - Confirmação de código, ativação do status verificado e registro em banco (200).
   - Bloqueio de novas solicitações dentro da janela de cooldown de 7 dias (403).
   - Reversão emergencial de número através do token criptografado (200).
   - Suporte a contas criadas via Google OAuth sem senha tradicional para envio de OTP (200).
   - Desvinculação segura de telefone mediante confirmação de credenciais (200).
   - Bloqueio de alteração indevida de telefone via endpoint geral de perfil (400).

4. **Regra de Negócio de Cooldown de 30 Dias para Username (`username-cooldown.test.js` - 9 testes):**
   - Alteração bem-sucedida de username e gravação de histórico de auditoria (200).
   - Bloqueio imediato de segunda alteração com 403 Forbidden e dias restantes.
   - Persistência do bloqueio após logout e novo login.
   - Persistência do bloqueio em múltiplos dispositivos via consulta ao perfil.
   - Bloqueio de bypass de username através do endpoint genérico `PUT /auth/profile` (400).
   - Liberação automática de alteração após transcorridos os 30 dias.
   - Tentativa com username duplicado retornando 409 sem consumir o prazo de alteração.
   - Alteração de outros campos de perfil sem ativação indevida do cooldown de username.
   - Precisão matemática do cálculo de dias restantes e data limite retornada pelo servidor.

### Coleção Postman / Insomnia

O repositório inclui a coleção oficial pronta para importação no arquivo:
[`itaim-vende.postman_collection.json`](itaim-vende.postman_collection.json)

A coleção contempla requisições para os 12 recursos da API com exemplos de sucesso (`200`, `201`, `204`) e casos de erro controlados (`400`, `401`, `403`, `404`, `409`, `429`).

---

## 13. Estrutura de Diretórios

```
marketplace-frontend/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma              # Schema relacional de banco de dados
│   │   └── seed.js                    # Script de povoamento inicial de dados
│   ├── scripts/
│   │   └── setup-unaccent.js          # Criação de extensões e índices Trigram no PostgreSQL
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.js                 # Validação estrita de variáveis de ambiente
│   │   │   ├── prisma.js              # Instância singleton do Prisma Client
│   │   │   └── supabase.js            # Cliente Supabase Storage
│   │   ├── controllers/               # Controladores modulares organizados por domínio
│   │   │   ├── account/               # account.controller.js
│   │   │   ├── auth/                  # identity, profile, password controllers
│   │   │   ├── category/              # category.controller.js
│   │   │   ├── chat/                  # conversation.controller.js, message.controller.js
│   │   │   ├── order/                 # order.controller.js
│   │   │   ├── product/               # query, mutation, seller controllers
│   │   │   ├── report/                # report.controller.js
│   │   │   ├── review/                # review.controller.js
│   │   │   └── upload/                # upload.controller.js
│   │   ├── docs/
│   │   │   ├── openapi.js             # Objeto de especificação OpenAPI 3.0.3
│   │   │   └── openapi.json           # Arquivo exportado da especificação OpenAPI
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js     # Validador de token Bearer JWT e controle RBAC
│   │   │   ├── error.middleware.js    # Interceptador global e padronizador de erros
│   │   │   ├── rateLimiter.js         # Limitador de taxa contra abusos e força bruta
│   │   │   └── validate.middleware.js # Validador de esquemas Zod
│   │   ├── routes/                    # Roteadores Express divididos por recurso
│   │   │   ├── account/
│   │   │   ├── auth/
│   │   │   ├── category/
│   │   │   ├── chat/
│   │   │   ├── order/
│   │   │   ├── product/
│   │   │   ├── report/
│   │   │   ├── review/
│   │   │   ├── upload/
│   │   │   └── index.js               # Montagem do prefixo /api/v1
│   │   ├── schemas/                   # Contratos de validação Zod por recurso
│   │   ├── services/                  # Regras de negócio, transações e integrações
│   │   │   ├── account/               # email, phone, username, preferences services
│   │   │   ├── auth/                  # identity, profile, recovery services
│   │   │   ├── category/
│   │   │   ├── chat/
│   │   │   ├── order/
│   │   │   ├── product/
│   │   │   ├── report/
│   │   │   └── review/
│   │   ├── utils/
│   │   │   └── AppError.js            # Classe padronizada de exceção operacional
│   │   └── server.js                  # Ponto de entrada HTTP e inicialização do Socket.IO
│   ├── tests/                         # Suíte de testes automatizados com Node test runner
│   │   ├── account-email.test.js
│   │   ├── account-phone.test.js
│   │   ├── api.test.js
│   │   └── username-cooldown.test.js
│   ├── .env.example                   # Modelo de configuração de ambiente
│   └── package.json                   # Dependências e scripts do backend
├── itaim-vende.postman_collection.json # Coleção Postman oficial da API
├── package.json                       # Scripts globais do monorepo
└── README.md                          # Documentação técnica oficial da aplicação
```

---

## 14. Uso de Inteligência Artificial

Em consonância com as práticas contemporâneas de engenharia de software transparente, declara-se que ferramentas de Inteligência Artificial Generativa baseadas em modelos de linguagem (LLMs) foram empregadas como instrumento de suporte técnico durante fases específicas do desenvolvimento deste projeto.

### Finalidades Específicas do Uso

1. **Refatoração e Modularização Arquitetural:** Auxílio na decomposição de módulos legados em camadas especializadas (*Controllers, Services, Middlewares e Schemas*), promovendo coesão e eliminando acoplamentos indevidos.
2. **Engenharia de Segurança Defensiva:** Identificação de vetores de ataque comuns em rotas HTTP, implementação de rate limiting adaptativo em fluxos de autenticação e validação rigorosa de entradas sintáticas contra injeção e travessia de diretórios.
3. **Pipeline de Imagens e Tratamento de Mídia:** Suporte na parametrização dos pipelines de conversão de imagens da biblioteca `sharp`, garantindo rotação automática via flags EXIF de smartphones e compactação em WebP sem perda perceptual de qualidade.
4. **Padronização de Contratos e Documentação:** Auxílio na estruturação formal dos schemas de dados no padrão OpenAPI 3.0.3 e consolidação dos casos de teste para a suíte de integração e conformidade REST.

Toda a lógica de negócios, decisões de arquitetura de dados, modelos relacionais e código-fonte foram analisados, validados, testados e homologados diretamente pelos desenvolvedores responsáveis pelo projeto.
Ou execute diretamente dentro da pasta `backend/`:

```bash
npm --prefix backend run test
```

### Quantidade Real de Testes e Cobertura

A suíte contém **38 testes automatizados**, divididos em 4 blocos de cobertura:

1. **Conformidade REST e Integridade da API (`api.test.js` - 14 testes):**
   - Diagnóstico e integridade do endpoint `GET /health` (Status 200).
   - Validação de cabeçalho `Cache-Control` no endpoint `GET /categories`.
   - Consulta paginada e ordenação estruturada em `GET /products`.
   - Busca fonética regional resiliente via extensão PostgreSQL `unaccent`.
   - Bloqueio de autenticação incorreta com 401 Unauthorized em `POST /auth/login`.
   - Rejeição de requisições privadas sem token JWT com 401 Unauthorized em `GET /auth/me`.
   - Validação de payload via Zod com retorno 400 Bad Request detalhado.
   - Validação de controle de acesso RBAC com retorno 403 Forbidden em `GET /reports`.
   - Proteção de segurança anti-enumeração de usuários em `GET /auth/user/:id`.
   - Proteção contra força bruta em códigos de verificação OTP com retorno 400/429.
   - Tratamento de rotas inexistentes com 404 Not Found padronizado.
   - Garantia de integridade financeira impedindo ordens não autorizadas com 401 em `POST /orders`.
   - Fluxo completo de cadastro e login Google via `POST /auth/google`.
   - Registro real de usuário válido com geração de hash e emissão de JWT em `POST /auth/register`.

2. **Fluxo Seguro de Alteração de E-mail (`account-email.test.js` - 5 testes):**
   - Rejeição de solicitação com senha incorreta (401).
   - Bloqueio de solicitação informando o mesmo e-mail atual (400).
   - Envio de código OTP de 6 dígitos mediante confirmação de senha (200).
   - Rejeição de código incorreto com incremento de tentativas falhas (400).
   - Validação de código correto, atualização atômica no banco e invalidação de pendências (200).

3. **Fluxo Seguro de WhatsApp / Celular (`account-phone.test.js` - 10 testes):**
   - Rejeição com senha incorreta (401).
   - Bloqueio preventivo sem vazamento de dados para número já em uso (409).
   - Envio de código OTP criptografado (200).
   - Rejeição de código incorreto e rastreamento de tentativas (400).
   - Confirmação de código, ativação do status verificado e registro em banco (200).
   - Bloqueio de novas solicitações dentro da janela de cooldown de 7 dias (403).
   - Reversão emergencial de número através do token criptografado (200).
   - Suporte a contas criadas via Google OAuth sem senha tradicional para envio de OTP (200).
   - Desvinculação segura de telefone mediante confirmação de credenciais (200).
   - Bloqueio de alteração indevida de telefone via endpoint geral de perfil (400).

4. **Regra de Negócio de Cooldown de 30 Dias para Username (`username-cooldown.test.js` - 9 testes):**
   - Alteração bem-sucedida de username e gravação de histórico de auditoria (200).
   - Bloqueio imediato de segunda alteração com 403 Forbidden e dias restantes.
   - Persistência do bloqueio após logout e novo login.
   - Persistência do bloqueio em múltiplos dispositivos via consulta ao perfil.
   - Bloqueio de bypass de username através do endpoint genérico `PUT /auth/profile` (400).
   - Liberação automática de alteração após transcorridos os 30 dias.
   - Tentativa com username duplicado retornando 409 sem consumir o prazo de alteração.
   - Alteração de outros campos de perfil sem ativação indevida do cooldown de username.
   - Precisão matemática do cálculo de dias restantes e data limite retornada pelo servidor.

### Coleção Postman / Insomnia

O repositório inclui a coleção oficial pronta para importação no arquivo:
[`itaim-vende.postman_collection.json`](itaim-vende.postman_collection.json)

A coleção contempla requisições para os 12 recursos da API com exemplos de sucesso (`200`, `201`, `204`) e casos de erro controlados (`400`, `401`, `403`, `404`, `409`, `429`).

---

## 13. Estrutura de Diretórios

```
marketplace-frontend/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma              # Schema relacional de banco de dados
│   │   └── seed.js                    # Script de povoamento inicial de dados
│   ├── scripts/
│   │   └── setup-unaccent.js          # Criação de extensões e índices Trigram no PostgreSQL
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.js                 # Validação estrita de variáveis de ambiente
│   │   │   ├── prisma.js              # Instância singleton do Prisma Client
│   │   │   └── supabase.js            # Cliente Supabase Storage
│   │   ├── controllers/               # Controladores modulares organizados por domínio
│   │   │   ├── account/               # account.controller.js
│   │   │   ├── auth/                  # identity, profile, password controllers
│   │   │   ├── category/              # category.controller.js
│   │   │   ├── chat/                  # conversation.controller.js, message.controller.js
│   │   │   ├── order/                 # order.controller.js
│   │   │   ├── product/               # query, mutation, seller controllers
│   │   │   ├── report/                # report.controller.js
│   │   │   ├── review/                # review.controller.js
│   │   │   └── upload/                # upload.controller.js
│   │   ├── docs/
│   │   │   ├── openapi.js             # Objeto de especificação OpenAPI 3.0.3
│   │   │   └── openapi.json           # Arquivo exportado da especificação OpenAPI
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js     # Validador de token Bearer JWT e controle RBAC
│   │   │   ├── error.middleware.js    # Interceptador global e padronizador de erros
│   │   │   ├── rateLimiter.js         # Limitador de taxa contra abusos e força bruta
│   │   │   └── validate.middleware.js # Validador de esquemas Zod
│   │   ├── routes/                    # Roteadores Express divididos por recurso
│   │   │   ├── account/
│   │   │   ├── auth/
│   │   │   ├── category/
│   │   │   ├── chat/
│   │   │   ├── order/
│   │   │   ├── product/
│   │   │   ├── report/
│   │   │   ├── review/
│   │   │   ├── upload/
│   │   │   └── index.js               # Montagem do prefixo /api/v1
│   │   ├── schemas/                   # Contratos de validação Zod por recurso
│   │   ├── services/                  # Regras de negócio, transações e integrações
│   │   │   ├── account/               # email, phone, username, preferences services
│   │   │   ├── auth/                  # identity, profile, recovery services
│   │   │   ├── category/
│   │   │   ├── chat/
│   │   │   ├── order/
│   │   │   ├── product/
│   │   │   ├── report/
│   │   │   └── review/
│   │   ├── utils/
│   │   │   └── AppError.js            # Classe padronizada de exceção operacional
│   │   └── server.js                  # Ponto de entrada HTTP e inicialização do Socket.IO
│   ├── tests/                         # Suíte de testes automatizados com Node test runner
│   │   ├── account-email.test.js
│   │   ├── account-phone.test.js
│   │   ├── api.test.js
│   │   └── username-cooldown.test.js
│   ├── .env.example                   # Modelo de configuração de ambiente
│   └── package.json                   # Dependências e scripts do backend
├── itaim-vende.postman_collection.json # Coleção Postman oficial da API
├── package.json                       # Scripts globais do monorepo
└── README.md                          # Documentação técnica oficial da aplicação
```

---

## 14. Uso de Inteligência Artificial

Em consonância com as práticas contemporâneas de engenharia de software transparente, declara-se que ferramentas de Inteligência Artificial Generativa baseadas em modelos de linguagem (LLMs) foram empregadas como instrumento de suporte técnico durante fases específicas do desenvolvimento deste projeto.

### Finalidades Específicas do Uso

1. **Refatoração e Modularização Arquitetural:** Auxílio na decomposição de módulos legados em camadas especializadas (*Controllers, Services, Middlewares e Schemas*), promovendo coesão e eliminando acoplamentos indevidos.
2. **Engenharia de Segurança Defensiva:** Identificação de vetores de ataque comuns em rotas HTTP, implementação de rate limiting adaptativo em fluxos de autenticação e validação rigorosa de entradas sintáticas contra injeção e travessia de diretórios.
3. **Pipeline de Imagens e Tratamento de Mídia:** Suporte na parametrização dos pipelines de conversão de imagens da biblioteca `sharp`, garantindo rotação automática via flags EXIF de smartphones e compactação em WebP sem perda perceptual de qualidade.
4. **Padronização de Contratos e Documentação:** Auxílio na estruturação formal dos schemas de dados no padrão OpenAPI 3.0.3 e consolidação dos casos de teste para a suíte de integração e conformidade REST.

Toda a lógica de negócios, decisões de arquitetura de dados, modelos relacionais e código-fonte foram analisados, validados, testados e homologados diretamente pelos desenvolvedores responsáveis pelo projeto.
