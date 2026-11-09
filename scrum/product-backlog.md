# Product Backlog — API Itaim Vende

**Projeto:** Itaim Vende — API RESTful Propria e Plataforma de Comercio Regional  
**Disciplina:** Engenharia de Software III | Prof. Me. Julian Rodrigues Valério | IFPI – Campus Paulistana  
**Product Owner:** Kayky  
**Periodo de Consolidacao:** Sprint 0 (27/10 e 28/10/2026), com refinamentos nas Sprints 1 e 2  
**Quadro Kanban:** [GitHub Projects #4 — Itaim Vende](https://github.com/users/KaykyTFF/projects/4)  

O nosso grupo montou o Product Backlog para cobrir todos os requisitos funcionais, tecnicos e de inovacao da disciplina de Engenharia de Software III. Especificamos as historias de usuario variando os perfis de quem usa a nossa plataforma (moradores que compram ou vendem, moderadores e administradores), priorizamos os itens com a tecnica MoSCoW e estimamos o esforco em sessoes de Planning Poker com a sequencia de Fibonacci (1, 2, 3, 5 e 8). Para deixar bem claro o que precisavamos fazer e como testar, detalhamos cada historia com cenarios de aceitacao no formato Dado, Quando e Entao, cobrindo os fluxos de sucesso e os casos de erro com respostas HTTP padronizadas.

---

## 1. Historias de Usuario e Criterios de Aceitacao

### H1 — Cadastro de Usuario e Autenticacao com Hash Bcrypt e Emissao de JWT
* **Como** novo morador ou comerciante do Vale do Itaim,  
* **quero** criar uma conta fornecendo meus dados pessoais e receber um token de autenticacao seguro,  
* **para** poder anunciar produtos e interagir na plataforma com identidade autenticada e protegida.  
* **Prioridade:** Must Have | **Estimativa:** 5 pontos | **Sprint Alocada:** Sprint 1  

```gherkin
Cenario 1 — Cadastro com sucesso
  Dado que informo nome valido, e-mail inedito, senha com requisitos minimos e cidade da regiao
  Quando envio uma requisicao POST /api/v1/auth/register com os dados obrigatorios
  Entao recebo status HTTP 201 Created com o token JWT Bearer e os dados cadastrais do usuario criado

Cenario 2 — Tentativa de cadastro com e-mail ja registrado
  Dado que informo um endereco de e-mail pertencente a um usuario previamente cadastrado
  Quando envio a requisicao POST /api/v1/auth/register
  Entao recebo status HTTP 409 Conflict com codigo de erro "DUPLICATE_ENTRY" e mensagem descritiva
```

---

### H2 — Autenticacao de Sessao e Limitador de Taxa Anti-Brute Force
* **Como** usuario cadastrado,  
* **quero** realizar login com meu e-mail e senha,  
* **para** acessar meus recursos administrativos com protecao ativa contra ataques de forca bruta.  
* **Prioridade:** Must Have | **Estimativa:** 3 pontos | **Sprint Alocada:** Sprint 1  

```gherkin
Cenario 1 — Login com credenciais autenticas
  Dado que possuo conta ativa e submeto meu e-mail e senha validos
  Quando envio POST /api/v1/auth/login
  Entao recebo status HTTP 200 OK com token JWT e tempo de expiracao da sessao

Cenario 2 — Bloqueio de tentativas com senha incorreta
  Dado que submeto uma senha incorreta para um e-mail existente
  Quando envio POST /api/v1/auth/login
  Entao recebo status HTTP 401 Unauthorized com a mensagem padronizada "E-mail ou senha incorretos."
```

---

### H3 — Catalogo de Departamentos e Categorias com Cabecalho de Cache HTTP
* **Como** desenvolvedor consumidor da API ou comprador,  
* **quero** consultar as categorias ativas com suporte a cabecalhos de cacheabilidade HTTP,  
* **para** acelerar o carregamento da navegacao no catalogo sem degradar a capacidade do banco de dados.  
* **Prioridade:** Must Have | **Estimativa:** 2 pontos | **Sprint Alocada:** Sprint 1  

```gherkin
Cenario 1 — Consulta de colecao com cabecalho Cache-Control
  Dado que a aplicacao esta em execucao com a tabela de categorias populada
  Quando envio uma requisicao GET /api/v1/categories
  Entao recebo status HTTP 200 OK contendo a lista de categorias e o cabecalho "Cache-Control: public, max-age=300"

Cenario 2 — Tentativa de operacao nao permitida na colecao
  Dado que envio uma requisicao DELETE para a colecao publica /api/v1/categories sem perfil de administrador
  Quando a requisicao e processada pelo middleware de autorizacao
  Entao recebo status HTTP 401 Unauthorized ou 403 Forbidden
```

---

### H4 — Publicacao e Gestao de Anuncios com Upload e Otimizacao de Imagens
* **Como** vendedor local de Paulistana,  
* **quero** publicar um anuncio contendo titulo, descricao, preco, condicao, categoria e imagem,  
* **para** divulgar meus produtos para compradores da cidade e municipios vizinhos.  
* **Prioridade:** Must Have | **Estimativa:** 5 pontos | **Sprint Alocada:** Sprint 1  

```gherkin
Cenario 1 — Publicacao bem-sucedida com token de autenticacao
  Dado que possuo cadastro ativo e forneco dados validos com imagem nos formatos permitidos
  Quando envio POST /api/v1/products com cabecalho Authorization Bearer Token
  Entao recebo status HTTP 201 Created com o identificador do anuncio gerado e status inicial ATIVO

Cenario 2 — Submissao sem cabecalho de autorizacao
  Dado que envio uma requisicao POST /api/v1/products sem fornecer o token Bearer
  Quando a requisicao interceptada pelo middleware de autenticacao
  Entao recebo status HTTP 401 Unauthorized com codigo "UNAUTHORIZED"
```

---

### H5 — Consulta Paginada e Busca Fonetica Sem Acentos (Extensao Unaccent)
* **Como** comprador que realiza buscas com variacoes ortograficas e abreviacoes no celular,  
* **quero** pesquisar mercadorias ignorando acentuacoes graficas (ex.: "chapeu" para encontrar "Chapéu de Couro"),  
* **para** localizar rapidamente as ofertas desejadas independente de como os caracteres foram digitados.  
* **Prioridade:** Must Have | **Estimativa:** 5 pontos | **Sprint Alocada:** Sprint 2  

```gherkin
Cenario 1 — Busca regional com normalizacao fonetica sem acentos
  Dado que existem produtos cadastrados no banco com caracteres acentuados (ex.: "Eletrônicos")
  Quando envio requisicao GET /api/v1/products?search=eletronicos&page=1&limit=10&sort=price_asc
  Entao recebo status HTTP 200 OK com os itens correspondentes, contagem total de registros e metadados de paginacao

Cenario 2 — Requisicao com parametro de ordenacao fora do schema
  Dado que envio o parametro "?sort=invalido" em desacordo com as opcoes permitidas
  Quando o schema de validacao Zod processa os parametros de query
  Entao recebo status HTTP 400 Bad Request contendo array de detalhes com o campo invalidado
```

---

### H6 — Detalhes do Anuncio e Exclusao com Purga Fisica de Mídia em Nuvem
* **Como** vendedor anunciante,  
* **quero** excluir um anuncio cujo produto ja foi comercializado,  
* **para** desativar a oferta e remover compulsoriamente os arquivos de foto do armazenamento do Supabase Storage.  
* **Prioridade:** Should Have | **Estimativa:** 5 pontos | **Sprint Alocada:** Sprint 2  

```gherkin
Cenario 1 — Exclusao autorizada pelo vendedor proprietario
  Dado que estou autenticado como o criador legitimo do anuncio que possui imagem armazenada no bucket
  Quando envio DELETE /api/v1/products/{id} com token valido
  Entao recebo status HTTP 204 No Content e o arquivo de midia associado e removido do Supabase Storage

Cenario 2 — Tentativa de exclusao por usuario que nao e o dono do anuncio
  Dado que estou autenticado com um usuario diferente do anunciante original e sem perfil ADMIN
  Quando envio DELETE /api/v1/products/{id}
  Entao recebo status HTTP 403 Forbidden com a mensagem "Permissao negada para alterar este produto."
```

---

### H7 — Negociacao Direta via Chat com Proposta Formal de Preco
* **Como** comprador interessado em um produto em exibicao,  
* **quero** iniciar conversa com o vendedor e enviar propostas financeiras formais de contraproposta,  
* **para** transacionar precos com transparencia e registrar o acordo dentro do sistema.  
* **Prioridade:** Should Have | **Estimativa:** 5 pontos | **Sprint Alocada:** Sprint 2  

```gherkin
Cenario 1 — Envio de mensagem com proposta de valor
  Dado que estou autenticado e possuo uma conversa aberta vinculada a um anuncio
  Quando envio POST /api/v1/chat/conversations/{id}/messages com { content: "Aceita R$ 250?", offerPrice: 250 }
  Entao recebo status HTTP 201 Created e o evento WebSocket e disparado em tempo real para o vendedor

Cenario 2 — Tentativa de envio em conversa pertencente a terceiros
  Dado que submeto uma mensagem para um identificador de conversa no qual meu usuario nao e participante
  Quando o backend valida a integridade da conversa
  Entao recebo status HTTP 403 Forbidden por violacao de controle de acesso
```

---

### H8 — Checkout com Integridade Financeira Estrita e Recalculo no Servidor
* **Como** comprador,  
* **quero** concluir o pedido de compra de um item selecionado,  
* **para** registrar a transacao com a garantia de que o valor cobrado e calculado no banco de dados e nao na interface.  
* **Prioridade:** Must Have | **Estimativa:** 3 pontos | **Sprint Alocada:** Sprint 1  

```gherkin
Cenario 1 — Criacao de ordem com validacao compulsoria de valor
  Dado que estou autenticado e seleciono um produto ativo no catalogo
  Quando envio POST /api/v1/orders com o identificador do produto
  Entao recebo status HTTP 201 Created com a ordem gerada e o valor total extraido diretamente do banco de dados

Cenario 2 — Tentativa de compra com produto inexistente
  Dado que envio uma requisicao POST /api/v1/orders com um ID que nao existe na base de dados
  Quando a aplicacao consulta o registro
  Entao recebo status HTTP 404 Not Found com a mensagem "Produto não encontrado."
```

---

### H9 — Painel de Moderacao com Controle de Acesso Baseado em Papeis (RBAC)
* **Como** moderador ou administrador do marketplace regional,  
* **quero** consultar a fila de denuncias de irregularidades e aplicar acoes cautelares,  
* **para** manter a seguranca, integridade e conformidade de todo o ecossistema.  
* **Prioridade:** Should Have | **Estimativa:** 3 pontos | **Sprint Alocada:** Sprint 2  

```gherkin
Cenario 1 — Consulta de denuncias por perfil administrativo
  Dado que estou autenticado com um token contendo a claim role "MODERATOR" ou "ADMIN"
  Quando envio requisicao GET /api/v1/reports
  Entao recebo status HTTP 200 OK com a listagem completa de ocorrencias pendentes de analise

Cenario 2 — Bloqueio de acesso para perfil de comprador comum (BUYER)
  Dado que estou autenticado com credenciais de usuario comum com perfil BUYER
  Quando tento acessar o endpoint GET /api/v1/reports
  Entao recebo status HTTP 403 Forbidden com o codigo "FORBIDDEN" e mensagem de permissao insuficiente
```

---

### H10 — Gerenciamento de Multiplos Enderecos do Usuario
* **Como** morador do semiárido que transita entre a sede do municipio e povoados vizinhos,  
* **quero** cadastrar multiplos enderecos com identificadores personalizados (ex.: Residencia, Comercio, Sitio),  
* **para** vincular com facilidade o endereco adequado aos meus pedidos e anuncios.  
* **Prioridade:** Should Have | **Estimativa:** 3 pontos | **Sprint Alocada:** Sprint 1  

```gherkin
Cenario 1 — Inclusao de endereco com dados obrigatorios validos
  Dado que estou autenticado e informo identificador, bairro, cidade do Vale do Itaim e CEP valido
  Quando envio POST /api/v1/addresses com a carga util
  Entao recebo status HTTP 201 Created com o endereco persistido e vinculado a minha conta

Cenario 2 — Submissao com campos essenciais omitidos
  Dado que envio a requisicao POST /api/v1/addresses sem fornecer bairro e cidade
  Quando o validador Zod analisa a carga util recebida
  Entao recebo status HTTP 400 Bad Request contendo detalhes especificos dos campos obrigatorios ausentes
```

---

### H11 — Documentacao Interativa com Especificacao OpenAPI 3.0.3 e Swagger UI
* **Como** desenvolvedor parceiro ou avaliador tecnico da disciplina,  
* **quero** navegar pela documentacao interativa da API com schemas, rotas e exemplos de payload,  
* **para** compreender os contratos de servico e executar requisicoes de teste de forma autodocumentada.  
* **Prioridade:** Must Have | **Estimativa:** 2 pontos | **Sprint Alocada:** Sprint 2  

```gherkin
Cenario 1 — Acesso a especificacao bruta em formato JSON
  Dado que o servidor HTTP da API esta ativo
  Quando envio requisicao GET /api/v1/docs/openapi.json
  Entao recebo status HTTP 200 OK com documento JSON valido sob o padrao OpenAPI 3.0.3

Cenario 2 — Carregamento da interface grafica interativa Swagger UI
  Dado que acesso a rota /api-docs atraves do navegador
  Quando a interface Swagger UI carrega completamente
  Entao consigo inspecionar os 12 recursos funcionais e seus schemas de entrada e saida
```

---

### H12 — Suite Automatizada de Testes e Colecao de Requisicoes Postman
* **Como** equipe de engenharia e avaliador docente da disciplina,  
* **quero** dispor de comandos automatizados de teste (`npm test`) e uma colecao Postman completa,  
* **para** verificar com repetibilidade a conformidade de todos os endpoints e regras do sistema.  
* **Prioridade:** Must Have | **Estimativa:** 3 pontos | **Sprint Alocada:** Sprint 2  

```gherkin
Cenario 1 — Execucao da suite de testes automatizados
  Dado que as dependencias foram instaladas e o ambiente de testes configurado
  Quando executo `npm --prefix backend test`
  Entao a suite executa 88 testes automatizados (unitarios, integracao e sistema) obtendo 100% de aprovacao

Cenario 2 — Execucao da colecao Postman oficial
  Dado que importo a colecao itaim-vende.postman_collection.json no Postman
  Quando disparo as requisicoes configurando a variavel baseUrl
  Entao as chamadas de sucesso retornam 200/201 e os fluxos de excecao retornam os erros padronizados (400, 401, 403, 404, 409)
```

---

### H13 — Restricao Temporal (Cooldown de 30 Dias) para Alteracao de Username (@)
* **Como** administrador da plataforma e usuario preocupado com integridade contra golpes comerciais,  
* **quero** que a modificacao do nome de usuario (@username) seja restrita a uma vez a cada 30 dias corridos,  
* **para** impedir que estelionatarios alterem constantemente sua identidade para enganar compradores, mantendo livre a atualizacao do nome de exibicao a qualquer instante.  
* **Prioridade:** Must Have | **Estimativa:** 5 pontos | **Sprint Alocada:** Sprint 2  

```gherkin
Cenario 1 — Primeira alteracao de username por usuario elegivel
  Dado que estou autenticado e nunca alterei meu username anteriormente (usernameLastChangedAt e nulo)
  Quando envio requisicao PUT /api/v1/auth/me com { username: "novo_username" }
  Entao recebo status HTTP 200 OK com o carimbo de data registrado no servidor e bloqueio ativado

Cenario 2 — Tentativa de nova alteracao antes de transcorridos os 30 dias
  Dado que alterei meu username ha menos de 30 dias da data atual
  Quando envio requisicao PUT /api/v1/auth/me informando um username diferente
  Entao recebo status HTTP 403 Forbidden com codigo "USERNAME_COOLDOWN_ACTIVE", data de liberacao e dias restantes

Cenario 3 — Atualizacao de campos de perfil sem modificar o username
  Dado que meu usuario esta sob periodo ativo de cooldown do username mas submeto alteracao apenas de nome ou biografia
  Quando envio PUT /api/v1/auth/me mantendo o mesmo username atual
  Entao recebo status HTTP 200 OK e a data do cooldown anterior e preservada sem bloqueios indevidos
```

---

## 2. Matriz de Rastreabilidade dos Requisitos Obrigatorios do Projeto

Relacionamos abaixo os treze requisitos obrigatorios da disciplina com as historias que desenvolvemos no nosso backlog:

| # | Requisito Obrigatorio da Atividade | Historias Associadas (IDs) | Status de Cobertura |
| :---: | :--- | :--- | :--- |
| **1** | No minimo 4 recursos | **H1, H3, H4, H6, H7, H8, H9, H10** (Total de 12 recursos implementados) | Cumprido |
| **2** | Principios REST, com Cache-Control ou ETag em ao menos um endpoint | **H3** (`GET /categories` com `Cache-Control: public, max-age=300`) | Cumprido |
| **3** | Nomenclatura: substantivos no plural, minusculas, hifens | **H1 a H13** (`/api/v1/products`, `/categories`, `/orders`, `/addresses`) | Cumprido |
| **4** | Verbos HTTP e codigos de status corretos | **H1 a H13** (`GET`, `POST`, `PUT`, `PATCH`, `DELETE` e status `200`, `201`, `204`, `400`, `401`, `403`, `404`, `409`) | Cumprido |
| **5** | Paginacao, filtro e ordenacao em uma colecao | **H5** (`GET /products?page=1&limit=10&sort=price_asc&category=Eletronicos`) | Cumprido |
| **6** | Versao na URI (`/api/v1/...`) | **H1 a H13** (Todos os endpoints sao versionados sob o prefixo `/api/v1/`) | Cumprido |
| **7** | Endpoint inovador com regra de negocio | **H5** (Busca fonetica regional `unaccent`) e **H13** (Cooldown de 30 dias para `@`) | Cumprido |
| **8** | Autenticacao por token e 2 papeis ou mais | **H1, H2, H9** (JWT com perfis `BUYER`, `SELLER`, `MODERATOR`, `ADMIN`) | Cumprido |
| **9** | Validacao de entrada e corpo de erro padronizado | **H1, H2, H4, H5, H10, H13** (Schemas Zod estritos e erros com `code`, `message`, `details`) | Cumprido |
| **10** | Banco de dados real com script de criacao | **H1, H4, H8, H10, H13** (PostgreSQL no Supabase via Prisma ORM com schema declarativo) | Cumprido |
| **11** | OpenAPI completo e README detalhado | **H11** (Swagger UI em `/api-docs` e `README.md` exaustivo com instrucoes de deploy) | Cumprido |
| **12** | Pelo menos 10 testes e colecao Postman ou Insomnia | **H12** (88 testes automatizados via `npm test` e colecao `itaim-vende.postman_collection.json`) | Cumprido |
| **13** | Repositorio no GitHub | **H12** (Repositorio publico com historico estruturado de commits e CI configurado) | Cumprido |
