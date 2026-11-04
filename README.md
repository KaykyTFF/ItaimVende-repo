# 🛒 Itaim Vende v2.0.0 — API & Plataforma Regional de Comércio

> **Versão Oficial:** `v2.0.0` | 📋 [Consulte o Histórico Completo de Alterações (CHANGELOG.md)](CHANGELOG.md)  
> **Instituto Federal de Educação, Ciência e Tecnologia do Piauí (IFPI) — Campus Paulistana**  
> **Disciplina:** Programação para Internet II  
> **Professor:** Prof. Me. Julian Rodrigues Valério  
> **Atividade:** Projeto de API Própria (Avaliação Oficial)  
> **Apresentação:** 09/11/2026

---

## 📌 1. Visão Geral e Problema Resolvido

O **Itaim Vende** é uma plataforma e API RESTful original criada para conectar produtores rurais, artesãos, comerciantes e consumidores de **Paulistana - PI** e municípios vizinhos do **Vale do Itaim** (semiárido piauiense).

Diferente de grandes plataformas de e-commerce genéricas (Mercado Livre, OLX) que não atendem as especificidades logísticas nem as variações linguísticas do semiárido, nossa API oferece um ecossistema completo para compras, vendas e negociação em tempo real, valorizando o comércio de proximidade.

---

## 💡 2. Eixos de Inovação da API (Além do CRUD)

Conforme os critérios de avaliação da disciplina, a API não se limita a operações de CRUD, inovando em quatro eixos centrais:

1. **Dados e Domínio (Semiárido Piauiense):** Cobertura de produtos regionais (mel silvestre, queijo artesanal, caprinocultura, artesanato local) e localização precisa por bairros e cidades do Vale do Itaim.
2. **Regra de Negócio (Busca Fonética e Integridade de Pedidos):**
   - Motor de busca com tolerância a acentos via extensão PostgreSQL `unaccent` e índices Trigram. Consultas como `?search=eletronicos` ou `?search=chapeu` encontram registros cadastrados como `"Eletrônicos"` e `"Chapéu"`.
   - Garantia de integridade financeira: preços de pedidos no checkout (`POST /api/v1/orders`) são recalculados e travados diretamente no banco de dados pelo servidor.
3. **Tempo Real e Eventos (WebSockets + E-mails Transacionais):**
   - Canal de chat bidirecional em tempo real via **Socket.IO** com suporte a propostas e contrapropostas de preço.
   - Detecção de presença com fallback: se o destinatário estiver offline no momento (`isUserOnline(userId) === false`), a API enfileira e dispara um e-mail transacional avisando sobre a nova mensagem/oferta.
4. **Moderação Automatizada com Purga de Nuvem:**
   - Painel administrativo com controle de acesso RBAC (`BUYER`, `SELLER`, `MODERATOR`, `ADMIN`).
   - Ao deferir denúncia de fraude ou excluir um anúncio, a API aciona hooks que removem automaticamente as imagens do bucket do **Supabase Storage**, evitando arquivos órfãos e custos de armazenamento.

📄 *Consulte o [Relatório de Inovação de 1 Página (RELATORIO_INOVACAO.md)](file:///c:/Users/kayky/Downloads/marketplace-frontend%20%281%29/marketplace-frontend/RELATORIO_INOVACAO.md) para análise comparativa detalhada com APIs de terceiros.*

---

## 📖 3. Documentação Interativa (OpenAPI / Swagger)

A API possui especificação completa no padrão **OpenAPI 3.0.3**:

- **Interface Interativa Swagger UI:**  
  Acesse no navegador: [`http://localhost:3000/api-docs`](http://localhost:3000/api-docs) ou [`http://localhost:3000/api/v1/docs`](http://localhost:3000/api/v1/docs)
- **Especificação OpenAPI JSON:**  
  Disponível em: [`http://localhost:3000/api/v1/docs/openapi.json`](http://localhost:3000/api/v1/docs/openapi.json) ou no arquivo local [`backend/src/docs/openapi.json`](file:///c:/Users/kayky/Downloads/marketplace-frontend%20%281%29/marketplace-frontend/backend/src/docs/openapi.json).

---

## 📮 4. Coleção Postman / Insomnia

O repositório inclui a coleção completa de testes pronta para importação no Postman ou Insomnia:

- **Arquivo:** [`itaim-vende.postman_collection.json`](file:///c:/Users/kayky/Downloads/marketplace-frontend%20%281%29/marketplace-frontend/itaim-vende.postman_collection.json)
- **Conteúdo da Coleção:**
  - Requisições para os **12 recursos** da API.
  - Exemplos de sucesso: `200 OK`, `201 Created`, `204 No Content`.
  - Exemplos de erros tratados: `400 Bad Request` (validação Zod), `401 Unauthorized`, `403 Forbidden` (RBAC), `404 Not Found`, `409 Conflict` (duplicidade) e `429 Too Many Requests` (Rate Limit).
  - Variáveis configuradas dinamicamente (`{{baseUrl}}`, `{{token}}`, `{{adminToken}}`).

---

## ⚙️ 5. Tecnologias Utilizadas

- **Linguagem & Runtime:** Node.js (v20+ / v24) com ES Modules (`"type": "module"`)
- **Framework Web:** Express.js 5
- **Banco de Dados & ORM:** PostgreSQL (Supabase) gerenciado via **Prisma ORM (v6)**
- **Extensões de Banco:** PostgreSQL `unaccent` e `pg_trgm` para busca textual fonética
- **Armazenamento de Mídia:** Sharp (conversão automática WebP) + Supabase Storage Adapter
- **Tempo Real:** Socket.IO (WebSockets)
- **E-mails Transacionais:** Nodemailer e Resend API
- **Validação:** Zod com schemas estritos
- **Segurança:** Helmet, Express Rate Limit, Bcrypt.js, JWT, proteção rigorosa contra Path Traversal e XSS
- **Documentação:** Swagger UI Express & OpenAPI 3.0.3

---

## 🚀 6. Como Instalar e Rodar o Projeto

### Pré-requisitos
- Node.js versão 20 ou superior instalado
- Git instalado

### Passo a Passo

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/KaykyTFF/ItaimVende-repo.git
   cd ItaimVende-repo
   ```

2. **Instale as dependências da raiz e do backend:**
   ```bash
   npm install
   cd backend
   npm install
   ```

3. **Configure as Variáveis de Ambiente:**
   Copie o arquivo de exemplo no backend:
   ```bash
   cp .env.example .env
   ```
   *Preencha as credenciais do banco PostgreSQL, JWT_SECRET e credenciais do Supabase Storage / E-mail.*

4. **Sincronize o Banco de Dados e Crie os Índices de Busca:**
   ```bash
   # Gera o Prisma Client
   npm run prisma:generate

   # Sincroniza a modelagem de tabelas no banco de dados
   npm run prisma:push

   # Cria a extensão unaccent e índices Trigram no PostgreSQL
   npm run db:indexes

   # Popula o banco com categorias, usuário administrador e produtos de exemplo
   npm run seed
   ```

5. **Inicie o Servidor da API:**
   ```bash
   npm run dev
   ```
   *O backend estará rodando em: `http://localhost:3000`*

6. **Inicie o Frontend:**
   Abra um novo terminal na raiz do projeto e execute:
   ```bash
   npm run dev:frontend
   ```
   *O marketplace estará acessível em: `http://localhost:3000` ou `http://localhost:5500`*

---

## 🔐 7. Variáveis de Ambiente (`backend/.env.example`)

| Variável | Descrição | Exemplo |
| :--- | :--- | :--- |
| `PORT` | Porta do servidor HTTP | `3000` |
| `NODE_ENV` | Ambiente de execução | `development` / `production` |
| `DATABASE_URL` | String de conexão PostgreSQL (com pool de conexão PgBouncer) | `postgresql://postgres:...@...:6543/postgres?pgbouncer=true` |
| `DIRECT_URL` | Conexão direta PostgreSQL (para migrações Prisma) | `postgresql://postgres:...@...:5432/postgres` |
| `JWT_SECRET` | Chave secreta de assinatura dos tokens JWT | `sua_chave_secreta_minimo_32_caracteres` |
| `SUPABASE_URL` | URL do projeto no Supabase | `https://xyz.supabase.co` |
| `SUPABASE_KEY` | Chave de serviço ou pública do Supabase | `sua_chave_supabase` |
| `SUPABASE_BUCKET` | Nome do bucket público de imagens | `marketplace` |
| `RESEND_API_KEY` | Chave de API do Resend (para e-mails) | `re_123456...` |

---

## 🗄️ 8. Recursos e Endpoints da API (`/api/v1`)

A API conta com **12 recursos** modelados sob substantivos no plural e versionamento explícito:

| Recurso | Método | Endpoint | Descrição | Status Codes |
| :--- | :---: | :--- | :--- | :---: |
| **Diagnóstico** | `GET` | `/api/v1/health` | Healthcheck, uptime e bootId | `200` |
| **Autenticação** | `POST` | `/api/v1/auth/register` | Criação de conta de usuário | `201`, `400`, `409` |
| **Autenticação** | `POST` | `/api/v1/auth/login` | Login com JWT e rate limiting | `200`, `401`, `429` |
| **Autenticação** | `POST` | `/api/v1/auth/forgot-password` | Envio de código OTP de redefinição | `200`, `400` |
| **Autenticação** | `POST` | `/api/v1/auth/verify-reset-code` | Validação anti-força bruta de código | `200`, `400`, `429` |
| **Autenticação** | `POST` | `/api/v1/auth/reset-password` | Atualização de senha com código | `200`, `400` |
| **Autenticação** | `GET` | `/api/v1/auth/me` | Dados do perfil autenticado | `200`, `401` |
| **Autenticação** | `GET` | `/api/v1/auth/user/:id` | Perfil público de vendedor | `200`, `404` |
| **Produtos** | `GET` | `/api/v1/products` | Busca fonética, filtros e paginação | `200` |
| **Produtos** | `POST` | `/api/v1/products` | Cadastro de novo anúncio | `201`, `400`, `401` |
| **Produtos** | `GET` | `/api/v1/products/:id` | Detalhes do anúncio por ID ou slug | `200`, `404` |
| **Produtos** | `PUT` | `/api/v1/products/:id` | Edição de anúncio | `200`, `401`, `403`, `404` |
| **Produtos** | `DELETE` | `/api/v1/products/:id` | Exclusão e purga de fotos no bucket | `204`, `401`, `403`, `404` |
| **Categorias** | `GET` | `/api/v1/categories` | Lista de departamentos (`Cache-Control`) | `200` |
| **Chat** | `GET` | `/api/v1/chat/conversations` | Conversas ativas do usuário | `200`, `401` |
| **Chat** | `POST` | `/api/v1/chat/conversations` | Inicia negociação para um produto | `201`, `400`, `401` |
| **Chat** | `POST` | `/api/v1/chat/conversations/:id/messages` | Envio de mensagem / oferta | `201`, `400`, `401` |
| **Chat** | `PATCH` | `/api/v1/chat/messages/:id/accept` | Aceitação de proposta de preço | `200`, `401`, `403` |
| **Pedidos** | `POST` | `/api/v1/orders` | Checkout com cálculo 100% no servidor | `201`, `400`, `401` |
| **Pedidos** | `GET` | `/api/v1/orders` | Histórico de compras do comprador | `200`, `401` |
| **Favoritos** | `GET` | `/api/v1/favorites` | Anúncios salvos pelo usuário | `200`, `401` |
| **Favoritos** | `POST` | `/api/v1/favorites/:productId/toggle` | Alternar favorito | `200`, `401` |
| **Avaliações** | `GET` | `/api/v1/reviews/user/:userId` | Reputação e estrelas do vendedor | `200`, `404` |
| **Avaliações** | `POST` | `/api/v1/reviews/user/:userId` | Enviar avaliação e comentário | `201`, `400`, `401` |
| **Avaliações** | `DELETE` | `/api/v1/reviews/:id` | Excluir avaliação | `204`, `401`, `403` |
| **Denúncias** | `POST` | `/api/v1/reports/:productId` | Registrar denúncia contra fraude | `201`, `400` |
| **Denúncias** | `GET` | `/api/v1/reports` | Painel de moderação (Admin/Mod) | `200`, `401`, `403` |
| **Denúncias** | `POST` | `/api/v1/reports/:id/remove-product` | Remover anúncio e purgar fotos | `200`, `401`, `403` |
| **Endereços** | `GET` | `/api/v1/addresses` | Endereços cadastrados do usuário | `200`, `401` |
| **Endereços** | `POST` | `/api/v1/addresses` | Adicionar novo endereço | `201`, `400`, `401` |
| **Endereços** | `DELETE` | `/api/v1/addresses/:id` | Remover endereço | `204`, `401`, `404` |
| **Notificações** | `GET` | `/api/v1/notifications` | Notificações do usuário | `200`, `401` |
| **Upload** | `POST` | `/api/v1/upload` | Upload multipart + conversão Sharp WebP | `201`, `400`, `401` |

---

## 🤖 9. Declaração Obrigatória de Uso de Inteligência Artificial

Em estrito cumprimento às normas da disciplina estabelecidas pelo **Prof. Me. Julian Rodrigues Valério**:

> *"Uso de IA: permitido como apoio, desde que declarado no README (onde e para quê). Cada integrante deve saber explicar qualquer trecho do código."*

Declaramos que ferramentas de Inteligência Artificial foram utilizadas como suporte técnico nos seguintes tópicos do projeto:
1. **Otimização de Arquitetura e Modelagem:** Auxílio na estruturação modular do backend em camadas (*Controllers, Services, Routes, Middlewares e Schemas*) e refinamento do schema relacional do Prisma.
2. **Segurança Defensiva:** Identificação de potenciais vulnerabilidades de Path Traversal no tratamento de arquivos estáticos, implementação de proteção de taxa (*Rate Limiter*) em rotas críticas e reforço anti-enumeração de usuários.
3. **Pipeline de Mídia:** Suporte na implementação da conversão e auto-rotação de fotos de celulares via biblioteca `sharp` e integração com a API do Supabase Storage.
4. **Padronização da Documentação:** Estruturação da especificação formal OpenAPI 3.0.3 e organização da coleção de testes no formato Postman v2.1.

**Nota:** Todos os integrantes da equipe estudaram, testaram, revisaram e têm pleno domínio para explicar detalhadamente qualquer trecho do código-fonte e da arquitetura apresentada em sala.

---

## 👥 Equipe do Projeto
- Discentes do IFPI — Campus Paulistana
- Disciplinas: **Engenharia de Software III** & **Programação para Internet II**
- Professor: **Prof. Me. Julian Rodrigues Valério**
- **Data da Apresentação Oficial:** 09/11/2026

| Integrante | Papel no Projeto | Foco Técnico | Papel Sprint 1 | Papel Sprint 2 |
| :--- | :--- | :--- | :--- | :--- |
| **Kayky** | Líder da Equipe | **Backend Developer** | **Product Owner (PO)** | **Product Owner (PO)** |
| **Pedro Ravy** | Desenvolvedor | **Backend Developer** | Developer | Developer |
| **Josimar** | Desenvolvedor | **Frontend Developer** | **Scrum Master (SM)** | Developer |
| **Raili** | Desenvolvedora | **Frontend Developer** | Developer | Developer |
| **Giselly** | Desenvolvedora | **Frontend Developer** | Developer | **Scrum Master (SM)** |

---

## 🏉 10. Metodologia Ágil (Scrum Aplicado ao Projeto de API Própria)

A gestão do desenvolvimento da API e plataforma Itaim Vende foi conduzida estritamente através do framework **Scrum**, cumprindo todas as diretrizes e entregáveis definidos na disciplina de **Engenharia de Software III**:

* 📌 **Quadro Kanban (GitHub Projects):** [Acessar GitHub Projects da Equipe](https://github.com/KaykyTFF/ItaimVende-repo/projects) *(Colunas: Backlog, Sprint Backlog, Em andamento, Em revisão e Pronto)*
* 📂 **Pasta de Evidências Scrum no Repositório:** [`/scrum`](scrum/acordos.md)

### Estrutura Completa de Documentos Scrum:
```text
/scrum
  ├── acordos.md               # Product Goal, definição de papéis, DoD e acordos de trabalho
  ├── product-backlog.md       # 13 histórias de usuário, critérios em Gherkin e matriz de rastreabilidade
  ├── sprint-1/
  │   ├── planning.md          # Sprint Goal, capacidade (24 pts), fatias verticais e mapa de testes (Q1-Q4)
  │   ├── dailies.md           # 4 registros diários detalhados, tabela de impedimentos e burndown
  │   └── review-retro.md      # Demonstração dos incrementos e melhoria escolhida (debounce + erros)
  └── sprint-2/
      ├── planning.md          # Sprint Goal, capacidade (28 pts), inovação e mapa de testes
      ├── dailies.md           # 3 registros diários detalhados, tabela de impedimentos e burndown
      └── review-retro.md      # Demonstração final e respostas obrigatórias às 3 perguntas da atividade
```
