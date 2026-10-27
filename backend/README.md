# 🚀 Itaim Vende v2.0.0 - Backend API

API RESTful completa, funcional e segura desenvolvida para a plataforma **Itaim Vende**, com arquitetura em camadas, autenticação JWT, integridade relacional com Prisma ORM e proteção contra ataques comuns da web.

> **IFPI - Programação para Internet II | Prof. Me. Julian Rodrigues Valério**  
> 🏷️ **Versão:** `v2.0.0` | 📋 [Changelog Completo (CHANGELOG.md)](../CHANGELOG.md)  
> 📄 **OpenAPI / Swagger UI:** `http://localhost:3000/api-docs` | `http://localhost:3000/api/v1/docs`  
> 📬 **Coleção Postman:** [`../itaim-vende.postman_collection.json`](file:///c:/Users/kayky/Downloads/marketplace-frontend%20%281%29/marketplace-frontend/itaim-vende.postman_collection.json)  
> 💡 **Relatório de Inovação:** [`../RELATORIO_INOVACAO.md`](file:///c:/Users/kayky/Downloads/marketplace-frontend%20%281%29/marketplace-frontend/RELATORIO_INOVACAO.md)  

---

## 🛠️ Tecnologias Utilizadas

- **Node.js (v20+)** com **ES Modules** (`import`/`export`)
- **Express.js (v5)**: Framework HTTP rápido e flexível
- **Swagger UI Express & OpenAPI 3.0.3**: Documentação interativa em `/api-docs`
- **Prisma ORM (v6)**: Modelagem e controle relacional de banco de dados
- **PostgreSQL (Supabase)** com extensões `unaccent` e `pg_trgm` para busca fonética regional
- **Bcrypt.js**: Hash unidirecional de senhas com salt
- **JSON Web Token (jsonwebtoken)**: Autenticação stateless com expiração
- **Zod**: Validação e sanitização estrita de dados de entrada
- **Helmet**: Cabeçalhos HTTP de segurança avançados
- **Express Rate Limit**: Proteção contra ataques de força bruta no login
- **CORS**: Controle de origens autorizadas

---

## 📁 Estrutura de Pastas

```
backend/
├── prisma/
│   ├── schema.prisma      # Modelagem relacional do banco de dados
│   └── seed.js            # Povoamento inicial (categorias, admin e anúncios)
├── src/
│   ├── config/
│   │   ├── env.js         # Variáveis de ambiente validadas
│   │   └── prisma.js      # Conexão singleton com o banco
│   ├── controllers/       # Subpastas modulares por domínio (auth, product, chat, etc.)
│   │   ├── auth/          # auth.identity.controller.js, auth.profile.controller.js, index.js
│   │   ├── product/       # product.query.controller.js, product.mutation.controller.js, index.js
│   │   ├── chat/          # conversation.controller.js, message.controller.js, index.js
│   │   ├── category/      # category.controller.js, index.js
│   │   ├── order/         # order.controller.js, index.js
│   │   ├── favorite/      # favorite.controller.js, index.js
│   │   ├── review/        # review.controller.js, index.js
│   │   ├── report/        # report.controller.js, index.js
│   │   └── upload/        # upload.controller.js, index.js
│   ├── services/          # Regras de negócio modulares e atômicas por domínio
│   │   ├── auth/          # auth.identity.service.js, auth.profile.service.js, index.js
│   │   ├── product/       # product.query.service.js, product.mutation.service.js, product.seller.service.js, index.js
│   │   ├── chat/          # conversation.service.js, message.service.js, index.js
│   │   ├── category/      # category.query.service.js, index.js
│   │   ├── order/         # order.creation.service.js, order.query.service.js, index.js
│   │   ├── favorite/      # favorite.query.service.js, favorite.mutation.service.js, index.js
│   │   ├── review/        # review.query.service.js, review.mutation.service.js, index.js
│   │   └── report/        # report.mutation.service.js, index.js
│   ├── routes/            # Roteadores modulares organizados por pasta de domínio
│   │   └── [dominio]/     # [dominio].routes.js e index.js
│   ├── schemas/           # Validações Zod organizadas por pasta de domínio
│   │   └── [dominio]/     # [dominio].schema.js e index.js
│   ├── middlewares/       # Middlewares globais (auth, error, logger, rateLimiter, sanitize, validate)
│   ├── utils/             # Utilitários (AppError, sanitize)
│   └── server.js          # Ponto de entrada do servidor HTTP com bootstrap dinâmico
├── .env                   # Variáveis locais
├── .env.example           # Modelo para produção
└── package.json
```

---

## 🏃 Como Rodar Localmente

1. **Acesse a pasta do backend:**
   ```bash
   cd backend
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Sincronize o banco de dados (SQLite local):**
   ```bash
   npm run prisma:push
   ```

4. **Popule o banco com dados iniciais:**
   ```bash
   npm run seed
   ```

5. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

O servidor estará ouvindo em: `http://localhost:3000`

---

## 🌐 Endpoints da API (Versão 1 - /api/v1)

### 1. Diagnóstico
- `GET /api/v1/health` -> Status da API, versão (`v1`), bootId e tempo de atividade.

### 2. Autenticação & Usuários
- `POST /api/v1/auth/register` -> Cria nova conta (validação Zod + Bcrypt).
- `POST /api/v1/auth/login` -> Autentica e retorna token JWT (com proteção de taxa).
- `GET /api/v1/auth/me` -> Retorna dados do usuário autenticado (requer Bearer token).
- `PUT /api/v1/auth/me` -> Atualiza dados cadastrais do perfil (requer Bearer token).
- `PUT /api/v1/auth/password` -> Altera a senha do usuário com validação da senha atual.

### 3. Anúncios & Produtos
- `GET /api/v1/products` -> Lista produtos com filtros (`search`, `category`, `minPrice`, `maxPrice`, `sort`, `page`).
- `GET /api/v1/products/:id` -> Detalhes do anúncio com informações do vendedor.
- `POST /api/v1/products` -> Cria novo anúncio (requer Bearer token).
- `PUT /api/v1/products/:id` -> Atualiza anúncio (apenas dono ou admin).
- `DELETE /api/v1/products/:id` -> Exclui anúncio (apenas dono ou admin).

### 4. Categorias
- `GET /api/v1/categories` -> Lista todas as categorias e contagem de anúncios.

### 5. Chat & Mensagens
- `GET /api/v1/chat/conversations` -> Lista conversas do usuário.
- `POST /api/v1/chat/conversations` -> Inicia nova negociação para um produto.
- `GET /api/v1/chat/conversations/:id/messages` -> Histórico de mensagens.
- `POST /api/v1/chat/conversations/:id/messages` -> Envia mensagem de texto ou proposta de oferta.

### 6. Pedidos & Checkout
- `POST /api/v1/orders` -> Cria novo pedido (preços validados diretamente no banco de dados).
- `GET /api/v1/orders` -> Lista pedidos do comprador logado.
- `GET /api/v1/orders/:id` -> Consulta detalhes de um pedido específico.


---

## 🔒 Segurança Implementada

1. **Nenhum preço confiado ao cliente:** No checkout, o backend consulta o valor real de cada produto no banco de dados e calcula o total no servidor.
2. **Proteção contra Brute Force:** Limite de 15 tentativas a cada 15 minutos por endereço IP nas rotas de login/registro.
3. **Senhas com Hash:** Senhas nunca são salvas em texto puro; utiliza-se salt de 10 rounds do `bcryptjs`.
4. **Proteção de Cabeçalhos HTTP:** `helmet` ativo com políticas seguras contra injeção e clickjacking.
5. **CORS Restrito:** Permite especificar origens permitidas em `.env`.

---

---

## ☁️ Armazenamento em Nuvem e Otimização de Imagens (Sharp + Supabase Storage)

O sistema conta com um **Storage Adapter Pattern** desacoplado e compressão inteligente em tempo de execução:

1. **Otimização Inteligente com Sharp (`.webp`):**
   - Reduz imagens pesadas de smartphones (3 a 5MB) para arquivos ultraotimizados de ~80 a 250KB (economia média de 75% a 93%).
   - Auto-rotação via flags EXIF de fotos de celulares.
   - Redimensionamento proporcional (máx. 1600px para produtos, 600px para avatares).
   - Conversão automática para formato `.webp` com controle de qualidade sRGB.

2. **Supabase Storage Adapter:**
   - Envia arquivos diretamente para o bucket público do Supabase (`marketplace`).
   - Salva a URL pública definitiva no banco de dados.
   - Ideal para deploys serverless/efêmeros (Render, Railway, Fly.io, Vercel).
   - **Fallback Automático**: Se `SUPABASE_KEY` não for informada no ambiente local, o sistema ativa automaticamente o `LocalStorageAdapter` (salvando em `uploads/`), garantindo que o desenvolvimento nunca quebre.

### Variáveis no `.env`:
```env
SUPABASE_URL="https://pgrznndtajjzpwqgtkkz.supabase.co"
SUPABASE_KEY="sua_chave_anon_ou_service_role"
SUPABASE_BUCKET="marketplace"
STORAGE_PROVIDER="supabase"
IMAGE_OPTIMIZATION_ENABLED="true"
IMAGE_MAX_WIDTH="1600"
IMAGE_QUALITY="82"
```

---

## 🚀 Como Colocar no Ar (Produção)

1. **Banco PostgreSQL Supabase:** Já configurado nativamente com a pooler URL.
2. **Supabase Storage:** Adicione `SUPABASE_KEY` no painel da hospedagem (ex: Render/Railway).
3. Suba o código no **GitHub**.
4. Crie um Web Service no [Render.com](https://render.com) ou [Railway.app](https://railway.app):
   - **Build Command**: `npm install && npx prisma db push && npm run seed`
   - **Start Command**: `npm start`
   - Configure as variáveis de ambiente baseadas no `.env.example`.

---

## 🤖 Declaração Obrigatória de Uso de Inteligência Artificial

Em estrito cumprimento às normas da disciplina estabelecidas pelo **Prof. Me. Julian Rodrigues Valério**:

> *"Uso de IA: permitido como apoio, desde que declarado no README (onde e para quê). Cada integrante deve saber explicar qualquer trecho do código."*

Declaramos que ferramentas de Inteligência Artificial foram utilizadas como suporte técnico nos seguintes tópicos do projeto:
1. **Otimização de Arquitetura e Modelagem:** Auxílio na estruturação modular do backend em camadas (*Controllers, Services, Routes, Middlewares e Schemas*) e refinamento do schema relacional do Prisma.
2. **Segurança Defensiva:** Identificação de potenciais vulnerabilidades de Path Traversal no tratamento de arquivos estáticos, implementação de proteção de taxa (*Rate Limiter*) em rotas críticas e reforço anti-enumeração de usuários.
3. **Pipeline de Mídia:** Suporte na implementação da conversão e auto-rotação de fotos de celulares via biblioteca `sharp` e integração com a API do Supabase Storage.
4. **Padronização da Documentação:** Estruturação da especificação formal OpenAPI 3.0.3 e organização da coleção de testes no formato Postman v2.1.

**Nota:** Todos os integrantes da equipe estudaram, testaram, revisaram e têm pleno domínio para explicar detalhadamente qualquer trecho do código-fonte e da arquitetura apresentada em sala.

