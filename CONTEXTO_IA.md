# 🚀 Contexto do Projeto e Transição de Ambiente (Handoff)

> **Instrução para a IA no novo computador:**  
> Leia este documento para entender exatamente o estado atual do **Itaim Vende**, as decisões de arquitetura tomadas, os testes validados e qual é o próximo passo a ser executado.

---

## 📌 1. Visão Geral do Produto
* **Nome:** Itaim Vende
* **Objetivo:** Marketplace regional para a comunidade de **Paulistana e microrregião (Piauí)**.
* **Stack:**
  * **Frontend:** HTML5, CSS3 modular e JavaScript puro (ES6+).
  * **Backend:** Node.js (v24), Express.js (v5), Prisma ORM (v6).
  * **Banco de Dados:** Modelagem relacional projetada para **PostgreSQL** (com migrations preparadas via Prisma).

---

## 🏛️ 2. Arquitetura Atual do Backend (`Controller -> Service -> Prisma`)

O backend foi completamente refatorado e desacoplado em camadas profissionais:

```text
backend/
├── prisma/
│   ├── schema.prisma          # Modelos completos: User, Product, ProductImage, Conversation, Message, Order, OrderItem, Favorite, Review, Report, AuditLog
│   └── seed.js                # Seed oficial de categorias e produtos de exemplo de Paulistana/PI
├── src/
│   ├── config/
│   │   ├── env.js             # Variáveis de ambiente
│   │   ├── prisma.js          # Conexão singleton Prisma
│   │   └── upload.js          # Configuração Multer (disco, 5MB, JPG/PNG/WEBP com extensão sanitizada)
│   ├── controllers/           # Apenas orquestração HTTP (req, res, status codes)
│   │   ├── auth.controller.js
│   │   ├── product.controller.js
│   │   ├── category.controller.js
│   │   ├── order.controller.js
│   │   ├── chat.controller.js
│   │   ├── favorite.controller.js
│   │   ├── upload.controller.js
│   │   ├── review.controller.js
│   │   └── report.controller.js
│   ├── services/              # Cérebro do sistema: Regras de negócio puras
│   │   ├── auth.service.js    # Login, registro, Bcrypt, JWT, suspensão de conta
│   │   ├── product.service.js # Vitrine, slugs amigáveis, soft-delete, meus anúncios, filtros
│   │   ├── category.service.js# Listagem de departamentos ativos
│   │   ├── order.service.js   # Checkout com cálculo seguro no banco e snapshot de itens
│   │   ├── chat.service.js    # Conversas 1-a-1, mensagens, ofertas e marcação de leitura
│   │   ├── favorite.service.js# Toggle atômico de favoritos e contadores
│   │   ├── review.service.js  # Avaliações com recálculo atômico da média do vendedor
│   │   └── report.service.js  # Denúncias de anúncios impróprios
│   ├── middlewares/
│   │   ├── auth.middleware.js     # JWT e bloqueio em tempo real de contas BANNED/SUSPENDED
│   │   ├── rateLimiter.middleware.js # Anti-DDoS global (120 req/min) e anti-flood upload (30/15min)
│   │   ├── sanitize.middleware.js # Anti-XSS automático em todas as requisições (body, query, params)
│   │   ├── error.middleware.js    # Tratamento central com AppError
│   │   └── logger.middleware.js   # Observabilidade em tempo real com indicador de status
│   ├── routes/                # Definição das URLs da API
│   ├── schemas/               # Validações Zod (senhas com letras+números, roles, produtos)
│   └── utils/
│       ├── errors.js          # Classe AppError com statusCode
│       └── sanitize.js        # Desinfecção recursiva de scripts/tags preservando senhas
└── server.js                  # Inicialização do servidor na porta 3000
```

---

## 🛡️ 3. Segurança e LGPD Concluídas e Testadas
1. **Anti-DDoS / Rate Limiting:** Testado e comprovado (`RateLimit-Limit: 120`, `RateLimit-Remaining: 119`).
2. **Anti-XSS:** `sanitizeInput` destrói scripts e iframes em títulos, bios e mensagens antes de salvar no banco. Senhas são preservadas intactas para o Bcrypt.
3. **Privacidade LGPD:** O seletor público de produtos **NUNCA vaza o e-mail pessoal** do vendedor. Apenas dados autorizados (nome, WhatsApp, bairro/cidade e reputação) são expostos.
4. **Força Bruta / Senhas:** Registro exige obrigatoriamente letras e números, bloqueando senhas triviais como `123456`.
5. **Upload Seguro:** Extensão dos arquivos forçada a partir do MIME type validado, impedindo upload de arquivos executáveis disfarçados.

---

## 🗄️ 4. Banco de Dados Oficial em Produção (Supabase PostgreSQL)
* **Instância Conectada:** PostgreSQL gerenciado no Supabase (`db.pgrznndtajjzpwqgtkkz.supabase.co`).
* **Migrations e Tabelas:** Sincronizadas com sucesso via `prisma db push`.
* **Seed Oficial:** Executado com sucesso (`node prisma/seed.js`), cadastrando 10 categorias regionais oficiais, contas iniciais e produtos modelo.

---

## 🎯 5. Status da Integração Frontend <-> Backend

1. **Cliente Central de API (`frontend/js/core/api.js`):** ✅ **CONCLUÍDO**
   * Configuração de URL base inteligente (`http://localhost:3000/api` local / `/api` nuvem).
   * Headers de autorização JWT automáticos (`Bearer Token`).
   * Mapeamento completo: produtos, categorias, autenticação, favoritos e uploads multipart.
2. **Conexão da Vitrine Home (`home.js` e `home.html`):** ✅ **CONCLUÍDO**
   * Carrega os anúncios reais diretamente do PostgreSQL com fallback offline resiliente.
3. **Conexão da Criação de Anúncios (`vender.js` e `vender.html`):** ✅ **CONCLUÍDO**
   * Upload real de fotos para `/api/upload/multiple` e criação do anúncio no banco com validações Zod.
4. **Conexão de Detalhes do Produto (`produto.js` e `produto.html`):** ✅ **CONCLUÍDO**
   * Busca dinâmica de produto por ID via API e resolução de URLs de imagem.
5. **Conexão de Meus Anúncios (`meus-anuncios.js` e `meus-anuncios.html`):** ✅ **CONCLUÍDO**
   * Listagem de anúncios próprios, pausa/reativação, marcação de vendido e exclusão via API.
6. **Conexão de Favoritos (`favoritos.js` e `favoritos.html`):** ✅ **CONCLUÍDO**
   * Sincronização em nuvem via `/api/favorites` com toggle atômico.
7. **Conexão de Categorias (`categoria.js` e `categoria.html`):** ✅ **CONCLUÍDO**
   * Vitrine filtrada consumindo API e resolução de imagens.
