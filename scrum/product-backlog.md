# 📦 Product Backlog do Itaim Vende

> **Projeto:** Itaim Vende — API RESTful Própria e Plataforma de Comércio Regional  
> **Disciplina:** Engenharia de Software III | Prof. Me. Julian Rodrigues Valério | IFPI – Campus Paulistana  
> **Product Owner:** Kayky  

O Product Backlog foi construído na **Sprint 0** (27/10 e 28/10) e refinado ao longo das Sprints 1 e 2. Todas as histórias utilizam a convenção de papéis variados, estimativas com a sequência de Fibonacci do Planning Poker (1, 2, 3, 5, 8) e priorização MoSCoW (*Must Have, Should Have, Could Have*).

---

## 📑 Histórias de Usuário e Critérios de Aceitação

### H1 — Cadastro de Usuário e Autenticação JWT
* **Como** novo morador ou comerciante do Vale do Itaim,  
* **quero** criar uma conta com meus dados e receber um token de acesso seguro,  
* **para** poder anunciar meus produtos e interagir na plataforma com identidade verificada.  
* **Prioridade:** Must Have | **Estimativa:** 5 pontos | **Sprint:** Sprint 1  

```gherkin
Cenário 1 — Cadastro com sucesso
  Dado que preencho nome, e-mail não cadastrado, senha forte e cidade da região
  Quando envio uma requisição POST /api/v1/auth/register com os dados válidos
  Então recebo status HTTP 201 Created com o token JWT e os dados do usuário cadastrado

Cenário 2 — Tentativa de cadastro com e-mail já existente
  Dado que informo um endereço de e-mail que já pertence a outra conta
  Quando envio a requisição POST /api/v1/auth/register
  Então recebo status HTTP 409 Conflict com código "DUPLICATE_ENTRY" e mensagem clara de conflito
```

---

### H2 — Login Seguro e Rate Limiting Anti-Brute Force
* **Como** usuário cadastrado,  
* **quero** me autenticar informando e-mail e senha,  
* **para** acessar meu painel administrativo com proteção contra ataques de força bruta.  
* **Prioridade:** Must Have | **Estimativa:** 3 pontos | **Sprint:** Sprint 1  

```gherkin
Cenário 1 — Login com credenciais válidas
  Dado que possuo conta ativa e informo meu e-mail e senha corretos
  Quando envio POST /api/v1/auth/login
  Então recebo status HTTP 200 OK com o token JWT e tempo de expiração

Cenário 2 — Tentativa com senha incorreta
  Dado que informo a senha incorreta para um usuário cadastrado
  Quando envio POST /api/v1/auth/login
  Então recebo status HTTP 401 Unauthorized com a mensagem "E-mail ou senha incorretos."
```

---

### H3 — Catálogo de Categorias com Princípio REST e Cache HTTP
* **Como** desenvolvedor consumidor da API ou comprador,  
* **quero** consultar as categorias de produtos disponíveis com cabeçalho de cache HTTP,  
* **para** carregar a navegação do marketplace instantaneamente sem sobrecarregar o banco de dados.  
* **Prioridade:** Must Have | **Estimativa:** 2 pontos | **Sprint:** Sprint 1  

```gherkin
Cenário 1 — Consulta de categorias com cacheabilidade REST
  Dado que a API está em execução com as categorias cadastradas no banco
  Quando envio uma requisição GET /api/v1/categories
  Então recebo status HTTP 200 OK com array de categorias e cabeçalho "Cache-Control: public, max-age=3600"

Cenário 2 — Verificação de método inválido
  Dado que envio uma requisição POST para a coleção /api/v1/categories sem permissão de admin
  Quando o servidor processa a requisição
  Então recebo status HTTP 401 Unauthorized ou 405 Method Not Allowed
```

---

### H4 — Publicação e Gestão de Anúncios com Upload de Mídia
* **Como** vendedor local de Paulistana,  
* **quero** cadastrar um anúncio com título, descrição, preço, categoria e foto,  
* **para** divulgar meus itens para os compradores do município e região.  
* **Prioridade:** Must Have | **Estimativa:** 5 pontos | **Sprint:** Sprint 1  

```gherkin
Cenário 1 — Criação de anúncio com token válido
  Dado que estou autenticado como usuário ativo e informo dados válidos do produto
  Quando envio POST /api/v1/products com cabeçalho de autorização Bearer Token
  Então recebo status HTTP 201 Created com o ID gerado e status "ATIVO"

Cenário 2 — Tentativa de cadastro sem autenticação
  Dado que tento cadastrar um produto sem enviar o cabeçalho Authorization
  Quando a requisição POST /api/v1/products chega à API
  Então recebo status HTTP 401 Unauthorized com código "UNAUTHORIZED"
```

---

### H5 — Consulta Paginada e Busca Fonética Sem Acentos (Inovação Unaccent)
* **Como** comprador que utiliza termos e variações ortográficas regionais,  
* **quero** buscar produtos por nome mesmo digitando sem acentos (ex: "eletronicos" para achar "Eletrônicos"),  
* **para** encontrar rapidamente as ofertas sem depender de acentuação precisa no teclado do celular.  
* **Prioridade:** Must Have | **Estimativa:** 5 pontos | **Sprint:** Sprint 2  

```gherkin
Cenário 1 — Busca unaccent com acentuação ignorada
  Dado que existem produtos cadastrados com nomes acentuados no PostgreSQL (ex: "Chapéu de Couro")
  Quando envio GET /api/v1/products?search=chapeu&page=1&limit=10&sort=price_asc
  Então recebo status HTTP 200 OK com os itens encontrados, metadados de paginação e contagem total

Cenário 2 — Busca com parâmetros de ordenação inválidos
  Dado que envio o parâmetro de ordenação incorreto "?sort=invalido"
  Quando a API executa a validação do schema Zod
  Então recebo status HTTP 400 Bad Request com detalhes do campo inválido
```

---

### H6 — Detalhes do Produto e Exclusão com Purga de Mídia em Nuvem
* **Como** vendedor,  
* **quero** excluir um anúncio que já foi vendido,  
* **para** manter meu catálogo atualizado e remover automaticamente a foto do Supabase Storage.  
* **Prioridade:** Should Have | **Estimativa:** 5 pontos | **Sprint:** Sprint 2  

```gherkin
Cenário 1 — Exclusão bem-sucedida pelo proprietário do anúncio
  Dado que sou o dono do anúncio cadastrado com foto no bucket
  Quando envio DELETE /api/v1/products/{id} com meu token autenticado
  Então recebo status HTTP 204 No Content e o arquivo no Supabase Storage é purgado com sucesso

Cenário 2 — Tentativa de exclusão de anúncio alheio
  Dado que estou autenticado com um usuário diferente do vendedor original
  Quando envio DELETE /api/v1/products/{id} para um anúncio de outro vendedor
  Então recebo status HTTP 403 Forbidden com a mensagem "Permissão negada para alterar este produto."
```

---

### H7 — Negociação em Tempo Real via Chat com Proposta de Preço
* **Como** comprador interessado em um produto,  
* **quero** abrir uma conversa com o vendedor e enviar mensagens e propostas de preço em tempo real,  
* **para** negociar um desconto diretamente pelo marketplace.  
* **Prioridade:** Should Have | **Estimativa:** 5 pontos | **Sprint:** Sprint 2  

```gherkin
Cenário 1 — Envio de mensagem e proposta em tempo real
  Dado que estou autenticado e inicio conversa com o vendedor de um anúncio
  Quando envio POST /api/v1/chat/conversations/{id}/messages com { content: "Aceita R$ 250?", offerPrice: 250 }
  Então recebo status HTTP 201 Created e o evento WebSocket é emitido para o vendedor conectado

Cenário 2 — Tentativa de enviar mensagem em conversa que não participo
  Dado que tento enviar uma mensagem para um conversationId pertencente a outros dois usuários
  Quando envio a requisição POST
  Então recebo status HTTP 403 Forbidden por violação de privacidade
```

---

### H8 — Checkout com Integridade Financeira de Pedidos no Servidor
* **Como** comprador,  
* **quero** finalizar o pedido de compra de um produto anunciado,  
* **para** registrar a transação com garantia de que o valor cobrado é exatamente o cadastrado no banco.  
* **Prioridade:** Must Have | **Estimativa:** 3 pontos | **Sprint:** Sprint 1  

```gherkin
Cenário 1 — Criação de pedido com validação no servidor
  Dado que estou autenticado e escolho um produto ativo no valor de R$ 100,00
  Quando envio POST /api/v1/orders com { productId: "id_valido" }
  Então recebo status HTTP 201 Created com o pedido confirmado e o valor travado pelo backend

Cenário 2 — Tentativa de compra de produto inexistente
  Dado que envio uma requisição POST /api/v1/orders com um ID de produto que não existe
  Quando o backend pesquisa o registro no banco
  Então recebo status HTTP 404 Not Found com a mensagem "Produto não encontrado."
```

---

### H9 — Painel de Moderação com Controle de Acesso RBAC
* **Como** moderador ou administrador do Itaim Vende,  
* **quero** consultar a fila de denúncias de fraudes e aplicar sanções,  
* **para** manter o marketplace limpo, confiável e seguro para a comunidade.  
* **Prioridade:** Should Have | **Estimativa:** 3 pontos | **Sprint:** Sprint 2  

```gherkin
Cenário 1 — Consulta de relatórios por usuário com papel MODERATOR ou ADMIN
  Dado que estou autenticado com um token contendo role "MODERATOR" ou "ADMIN"
  Quando envio GET /api/v1/reports
  Então recebo status HTTP 200 OK com a listagem de denúncias pendentes

Cenário 2 — Acesso bloqueado para usuário comum (BUYER)
  Dado que estou autenticado com um token de usuário comum (BUYER)
  Quando tento acessar GET /api/v1/reports
  Então recebo status HTTP 403 Forbidden com a mensagem "Acesso negado. Permissão insuficiente."
```

---

### H10 — Gestão de Múltiplos Endereços do Usuário
* **Como** morador do semiárido com pontos de entrega em Paulistana e povoados vizinhos,  
* **quero** cadastrar diferentes endereços com apelidos (Casa, Trabalho, Sítio),  
* **para** agilizar a seleção do local de retirada nos meus anúncios.  
* **Prioridade:** Should Have | **Estimativa:** 3 pontos | **Sprint:** Sprint 1  

```gherkin
Cenário 1 — Cadastro de novo endereço com sucesso
  Dado que estou autenticado e envio apelido, bairro e cidade do Vale do Itaim
  Quando envio POST /api/v1/addresses
  Então recebo status HTTP 201 Created com o ID do endereço associado ao meu usuário

Cenário 2 — Tentativa com dados obrigatórios incompletos
  Dado que tento cadastrar um endereço sem informar bairro nem cidade
  Quando envio POST /api/v1/addresses
  Então recebo status HTTP 400 Bad Request com array de validação Zod detalhando os campos faltantes
```

---

### H11 — Documentação Viva com OpenAPI 3.0.3 e Swagger UI
* **Como** desenvolvedor parceiro ou avaliador técnico da disciplina,  
* **quero** acessar a documentação interativa com todos os endpoints, esquemas e exemplos,  
* **para** testar e consumir a API de maneira autodocumentada e padronizada.  
* **Prioridade:** Must Have | **Estimativa:** 2 pontos | **Sprint:** Sprint 2  

```gherkin
Cenário 1 — Acesso à especificação OpenAPI
  Dado que o servidor HTTP está em execução
  Quando acesso GET /api/v1/docs/openapi.json
  Então recebo status HTTP 200 OK com o JSON válido no formato OpenAPI 3.0.3

Cenário 2 — Navegação interativa pelo Swagger UI
  Dado que abro a rota /api-docs no navegador
  Quando a interface Swagger carrega
  Então consigo visualizar e executar chamadas de teste em todos os 12 recursos da API
```

---

### H12 — Suíte Automatizada de Testes de Integração e Coleção Postman
* **Como** equipe de engenharia e professor da disciplina,  
* **quero** uma suíte de testes com execução via comando único (`npm test`),  
* **para** certificar que todos os requisitos do projeto funcionam continuamente sem regressão.  
* **Prioridade:** Must Have | **Estimativa:** 3 pontos | **Sprint:** Sprint 2  

```gherkin
Cenário 1 — Execução da suíte completa de testes
  Dado que as dependências e o banco estão configurados
  Quando executo `npm --prefix backend test`
  Então todos os 23 testes automatizados (testes gerais e de regras) executam e passam com 100% de sucesso

Cenário 2 — Validação da coleção Postman
  Dado que importo a coleção itaim-vende.postman_collection.json no Postman
  Quando executo as requisições com variáveis de ambiente configuradas
  Então todas as requisições de sucesso retornam 200/201 e as de erro retornam os códigos esperados
```

---

### H13 — Sistema de Cooldown de 30 Dias para Alteração de Username (@) (Inovação e Segurança)
* **Como** gestor da plataforma e usuário preocupado com segurança contra golpes,  
* **quero** que a alteração do nome de usuário (@) seja restrita a uma vez a cada 30 dias,  
* **para** impedir que vendedores mal-intencionados troquem de identidade constantemente para fraudar compradores, mantendo a liberdade de mudar o nome de exibição a qualquer momento.  
* **Prioridade:** Must Have | **Estimativa:** 5 pontos | **Sprint:** Sprint 2  

```gherkin
Cenário 1 — Alteração inicial de username por usuário sem histórico
  Dado que estou autenticado e nunca alterei meu username anteriormente (usernameLastChangedAt = null)
  Quando envio PUT /api/v1/auth/me com { username: "novo_username" }
  Então recebo status HTTP 200 OK com a data registrada no servidor e o bloqueio de 30 dias ativado

Cenário 2 — Tentativa de nova alteração antes do prazo de 30 dias
  Dado que alterei meu username há menos de 30 dias
  Quando tento enviar PUT /api/v1/auth/me com outro username diferente
  Então recebo status HTTP 403 Forbidden com código "USERNAME_COOLDOWN_ACTIVE", data de liberação e dias restantes

Cenário 3 — Alteração apenas do nome completo de exibição
  Dado que estou em período de cooldown do username mas envio alteração apenas no campo "name"
  Quando envio PUT /api/v1/auth/me mantendo o mesmo @
  Então recebo status HTTP 200 OK e a data de cooldown é preservada sem reiniciar o prazo
```

---

## 🗺️ Tabela de Rastreabilidade dos Requisitos do Projeto

A matriz abaixo comprova que todos os **13 requisitos obrigatórios** do projeto da disciplina de Engenharia de Software III foram atendidos pelas histórias do backlog:

| # | Requisito Obrigatório do Projeto | Histórias Associadas (IDs) | Status de Cumprimento |
| :---: | :--- | :--- | :---: |
| **1** | No mínimo 4 recursos | **H1, H3, H4, H6, H7, H8, H9, H10** (Total de 12 recursos) | ✅ Cumprido |
| **2** | Princípios REST, com Cache-Control ou ETag em ao menos um endpoint | **H3** (`GET /categories` com `Cache-Control: public, max-age=3600`) | ✅ Cumprido |
| **3** | Nomenclatura: substantivos no plural, minúsculas, hifens | **H1 a H13** (`/api/v1/products`, `/categories`, `/orders`, `/addresses`) | ✅ Cumprido |
| **4** | Verbos HTTP e códigos de status corretos | **H1 a H13** (`GET`, `POST`, `PUT`, `PATCH`, `DELETE` / `200`, `201`, `204`, `400`, `401`, `403`, `404`, `409`) | ✅ Cumprido |
| **5** | Paginação, filtro e ordenação em uma coleção | **H5** (`GET /products?page=1&limit=10&sort=price_asc&category=Eletrônicos`) | ✅ Cumprido |
| **6** | Versão na URI (`/api/v1/...`) | **H1 a H13** (Todos os endpoints são versionados sob `/api/v1/`) | ✅ Cumprido |
| **7** | Endpoint inovador com regra de negócio | **H5** (Busca fonética `unaccent` sem acentos) e **H13** (Cooldown de 30 dias para @) | ✅ Cumprido |
| **8** | Autenticação por token e 2 papéis ou mais | **H1, H2, H9** (JWT + papéis `BUYER`, `SELLER`, `MODERATOR`, `ADMIN`) | ✅ Cumprido |
| **9** | Validação de entrada e corpo de erro padronizado | **H1, H2, H4, H5, H10, H13** (Schemas Zod estritos e erros com `code`, `message`, `details`) | ✅ Cumprido |
| **10** | Banco de dados real com script de criação | **H1, H4, H8, H10, H13** (PostgreSQL no Supabase via Prisma ORM com migrations/push) | ✅ Cumprido |
| **11** | OpenAPI completo e README detalhado | **H11** (Swagger UI em `/api-docs` e `README.md` completo com instruções) | ✅ Cumprido |
| **12** | Pelo menos 10 testes e coleção Postman ou Insomnia | **H12** (23 testes automatizados via `npm test` e arquivo `itaim-vende.postman_collection.json`) | ✅ Cumprido |
| **13** | Repositório no GitHub | **H12** (Repositório público com histórico organizado de commits e documentação) | ✅ Cumprido |

