# 🚀 Itaim Vende - Backend API

API RESTful completa, funcional e segura desenvolvida para a plataforma **Itaim Vende**, com arquitetura em camadas, autenticação JWT, integridade relacional com Prisma ORM e proteção contra ataques comuns da web.

---

## 🛠️ Tecnologias Utilizadas

- **Node.js (v20+)** com **ES Modules** (`import`/`export`)
- **Express.js (v5)**: Framework HTTP rápido e flexível
- **Prisma ORM (v6)**: Modelagem e controle relacional de banco de dados
- **SQLite (Local)** / **PostgreSQL (Nuvem / Produção)**
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
│   ├── controllers/
│   │   ├── auth.controller.js     # Registro, login e perfil
│   │   ├── product.controller.js  # Busca, filtros e CRUD de anúncios
│   │   ├── category.controller.js # Listagem de categorias
│   │   └── order.controller.js    # Pedidos com cálculo seguro de preços
│   ├── middlewares/
│   │   ├── auth.middleware.js     # Validação de token JWT e roles
│   │   ├── error.middleware.js    # Tratamento central de erros
│   │   └── validate.middleware.js # Validador automático com esquemas Zod
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── product.routes.js
│   │   ├── category.routes.js
│   │   └── order.routes.js
│   ├── schemas/
│   │   ├── auth.schema.js
│   │   ├── product.schema.js
│   │   └── order.schema.js
│   └── server.js          # Ponto de entrada do servidor HTTP
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

## 🌐 Endpoints da API

### 1. Diagnóstico
- `GET /api/health` -> Status da API e tempo de atividade.

### 2. Autenticação & Usuários
- `POST /api/auth/register` -> Cria nova conta (validação Zod + Bcrypt).
- `POST /api/auth/login` -> Autentica e retorna token JWT (com proteção de taxa).
- `GET /api/auth/me` -> Retorna dados do usuário autenticado (requer Bearer token).
- `PUT /api/auth/me` -> Atualiza dados do perfil (requer Bearer token).

### 3. Anúncios & Produtos
- `GET /api/products` -> Lista produtos com filtros (`search`, `category`, `minPrice`, `maxPrice`, `sort`, `page`).
- `GET /api/products/:id` -> Detalhes do anúncio com informações do vendedor.
- `POST /api/products` -> Cria novo anúncio (requer Bearer token).
- `PUT /api/products/:id` -> Atualiza anúncio (apenas dono ou admin).
- `DELETE /api/products/:id` -> Exclui anúncio (apenas dono ou admin).

### 4. Categorias
- `GET /api/categories` -> Lista todas as categorias e contagem de anúncios.

### 5. Pedidos & Checkout
- `POST /api/orders` -> Cria novo pedido (preços validados diretamente no banco de dados).
- `GET /api/orders` -> Lista pedidos do comprador logado.
- `GET /api/orders/:id` -> Consulta detalhes de um pedido específico.

---

## 🔒 Segurança Implementada

1. **Nenhum preço confiado ao cliente:** No checkout, o backend consulta o valor real de cada produto no banco de dados e calcula o total no servidor.
2. **Proteção contra Brute Force:** Limite de 15 tentativas a cada 15 minutos por endereço IP nas rotas de login/registro.
3. **Senhas com Hash:** Senhas nunca são salvas em texto puro; utiliza-se salt de 10 rounds do `bcryptjs`.
4. **Proteção de Cabeçalhos HTTP:** `helmet` ativo com políticas seguras contra injeção e clickjacking.
5. **CORS Restrito:** Permite especificar origens permitidas em `.env`.

---

## 🚀 Como Colocar no Ar (Produção)

1. **Crie um Banco PostgreSQL gratuito** no [Neon.tech](https://neon.tech) ou [Supabase](https://supabase.com).
2. No arquivo `prisma/schema.prisma`, altere o datasource:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
3. Suba o código no **GitHub**.
4. Crie um Web Service no [Render.com](https://render.com) ou [Railway.app](https://railway.app):
   - **Build Command**: `npm install && npx prisma db push && npm run seed`
   - **Start Command**: `npm start`
   - Configure a variável `DATABASE_URL` com a URL do seu PostgreSQL da nuvem e defina `JWT_SECRET`.
