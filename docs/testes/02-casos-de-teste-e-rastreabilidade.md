# Casos de Teste e Matriz de Rastreabilidade — Fase 2

**Projeto:** Itaim Vende (API RESTful de Comércio Regional do Semiárido Piauiense)  
**Disciplina:** Engenharia de Software  
**Docente:** Prof. Me. Julian Rodrigues Valério  
**Documento de Engenharia de Testes:** Fase 2 — Projeto de Testes e Rastreabilidade  
**Técnicas de Projeto Empregadas:** Partição de Equivalência (PE), Análise do Valor Limite (AVL) e Tabela de Decisão (TD)  

---

## 1. Especificação dos 20 Casos de Teste Projetados (12 Colunas Formais)

A tabela a seguir apresenta os 20 casos de teste da Fase 2, estruturados segundo o padrão formal da disciplina, contemplando casos positivos e negativos, níveis de teste (Unidade, Integração e Sistema) e vinculação direta aos testes automatizados implementados no repositório (`backend/tests/`).

| ID do Caso | Requisito / História | Técnica | Nível | Tipo | Título / Cenário de Teste | Pré-condições | Dados de Entrada | Passos de Execução | Resultado Esperado | Status | Arquivo de Teste Vinculado |
| :---: | :---: | :---: | :---: | :---: | :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| **CT-01** | REQ-8 / H1 | PE | Integração | Positivo | Cadastro de novo usuário com dados completos e geração de Bearer JWT | PostgreSQL ativo e e-mail não existente na base | Payload `POST /api/v1/auth/register` com name, email, password forte e city | 1. Submeter requisição POST de registro; 2. Avaliar status e corpo retornado | HTTP 201 Created com token JWT e objeto do usuário sem hash de senha | **Aprovado** | `backend/tests/api.test.js` |
| **CT-02** | REQ-9 / H1 | PE | Unidade | Negativo | Bloqueio de cadastro com e-mail duplicado já registrado no sistema | Usuário previamente registrado com o mesmo e-mail | Payload `POST /api/v1/auth/register` com email já existente | 1. Executar validação de unicidade de e-mail; 2. Avaliar resposta de erro | HTTP 409 Conflict com código `DUPLICATE_ENTRY` e mensagem descritiva | **Aprovado** | `backend/tests/unit/schemas.test.js` |
| **CT-03** | REQ-8 / H2 | PE | Integração | Negativo | Tentativa de autenticação com senha incorreta para conta existente | Usuário previamente registrado no banco | Payload `POST /api/v1/auth/login` com email válido e senha incorreta | 1. Submeter POST com senha incorreta; 2. Inspecionar rejeição | HTTP 401 Unauthorized com mensagem "E-mail ou senha incorretos" | **Aprovado** | `backend/tests/api.test.js` |
| **CT-04** | REQ-2 / H3 | PE | Sistema | Positivo | Consulta pública de categorias com cabeçalho de cacheabilidade REST | Categorias ativas cadastradas no banco | Requisição `GET /api/v1/categories` sem token de autenticação | 1. Executar GET no endpoint público; 2. Validar cabeçalhos HTTP | HTTP 200 OK com array de categorias e cabeçalho `Cache-Control: public, max-age=300` | **Aprovado** | `backend/tests/api.test.js` |
| **CT-05** | REQ-4 / H4 | PE | Integração | Negativo | Bloqueio de publicação de anúncio sem envio de token de autorização | Servidor ativo sem sessão autenticada | Payload `POST /api/v1/products` sem cabeçalho `Authorization` | 1. Submeter POST sem Bearer token; 2. Verificar barreira de autenticação | HTTP 401 Unauthorized com código `UNAUTHORIZED` e bloqueio de gravação no banco | **Aprovado** | `backend/tests/api.test.js` |
| **CT-06** | REQ-9 / H4 | AVL | Unidade | Negativo | Rejeição de título de anúncio abaixo do limite mínimo (2 caracteres) | Schema Zod de produto instanciado em memória | Objeto com `title: "TV"` (2 caracteres, limite inferior inválido) | 1. Validar objeto no schema `productCreateSchema` | Rejeição com HTTP 400 Bad Request indicando "mínimo de 3 caracteres" | **Aprovado** | `backend/tests/unit/schemas.test.js` |
| **CT-07** | REQ-9 / H4 | AVL | Unidade | Positivo | Aprovação de título de anúncio no limite mínimo permitido (3 caracteres) | Schema Zod de produto instanciado em memória | Objeto com `title: "Mel"` (3 caracteres, limite inferior válido) | 1. Validar objeto no schema `productCreateSchema` | Aprovação com sucesso no schema Zod sem emissão de erros | **Aprovado** | `backend/tests/unit/schemas.test.js` |
| **CT-08** | REQ-9 / H4 | AVL | Unidade | Negativo | Rejeição de preço negativo em cadastro de anúncio (-0.01) | Schema Zod de produto instanciado em memória | Objeto com `price: -0.01` (fora do limite inferior aceitável) | 1. Validar objeto no schema `productCreateSchema` | Rejeição com HTTP 400 Bad Request indicando que preço deve ser >= 0 | **Aprovado** | `backend/tests/unit/schemas.test.js` |
| **CT-09** | REQ-9 / H4 | AVL | Unidade | Positivo | Aprovação de anúncio gratuito no limite inferior de preço (0.00 - Doação) | Schema Zod de produto instanciado em memória | Objeto com `price: 0.00` (limite exato para modalidade de doação) | 1. Validar objeto no schema `productCreateSchema` | Aprovação com sucesso no schema Zod habilitando anúncio gratuito | **Aprovado** | `backend/tests/unit/schemas.test.js` |
| **CT-10** | REQ-7 / H5 | PE | Integração | Positivo | Busca fonética e textual ignorando acentos gráficos via unaccent | Produto cadastrado com título "Chapéu de Couro" | Query param `GET /api/v1/products?search=chapeu` (sem acento) | 1. Executar GET de busca sem acentuação gráfica | HTTP 200 OK com localização do anúncio "Chapéu de Couro" pelo PostgreSQL | **Aprovado** | `backend/tests/api.test.js` |
| **CT-11** | REQ-5 / H5 | PE | Sistema | Positivo | Consulta de produtos com paginação estruturada e filtro de cidade | Produtos cadastrados no polo regional de Paulistana | Query params `page=1&limit=5&sort=menor_preco&city=Paulistana` | 1. Executar GET com parâmetros de paginação e filtro | HTTP 200 OK com array ordenado de até 5 itens e metadados de paginação | **Aprovado** | `backend/tests/api.test.js` |
| **CT-12** | REQ-4 / H6 | TD | Integração | Negativo | Bloqueio de exclusão de anúncio por usuário não proprietário nem moderador | Anúncio pertencente ao Usuário A; requisitante é o Usuário B (BUYER) | Requisição `DELETE /api/v1/products/{id}` com token do Usuário B | 1. Submeter DELETE com token de usuário não proprietário | HTTP 403 Forbidden com código `FORBIDDEN` e mensagem de permissão negada | **Aprovado** | `backend/tests/rest-conformance.test.js` |
| **CT-13** | REQ-4 / H6 | TD | Integração | Positivo | Exclusão de anúncio pelo proprietário com purga física no Supabase Storage | Anúncio ativo pertencente ao usuário autenticado com fotos no bucket | Requisição `DELETE /api/v1/products/{id}` com token do proprietário | 1. Submeter DELETE autenticado como dono; 2. Verificar storage | HTTP 204 No Content com deleção no banco e purga física de arquivos no storage | **Aprovado** | `backend/tests/rest-conformance.test.js` |
| **CT-14** | REQ-4 / H7 | TD | Integração | Positivo | Envio de mensagem de chat com contraproposta de preço em tempo real | Conversa aberta entre comprador e anunciante | Payload `POST /api/v1/chat/conversations/{id}/messages` com `offerPrice: 180.00` | 1. Submeter mensagem com proposta; 2. Monitorar evento socket | HTTP 201 Created com status `PENDING` e emissão de evento WebSocket para o vendedor | **Aprovado** | `backend/tests/api.test.js` |
| **CT-15** | REQ-4 / H7 | TD | Integração | Positivo | Aceite formal de proposta de preço pelo vendedor e notificação | Proposta no estado `PENDING` na conversa do vendedor | Payload `PATCH /api/v1/chat/messages/{id}/status` com `status: "ACCEPTED"` | 1. Submeter PATCH como vendedor destinatário da oferta | HTTP 200 OK com status atualizado atomicamente para `ACCEPTED` e notificação enviada | **Aprovado** | `backend/tests/rest-conformance.test.js` |
| **CT-16** | REQ-7 / H8 | PE | Unidade | Negativo | Travamento de preço no servidor e descarte de valor adulterado no cliente | Preço cadastrado no catálogo do banco em R$ 100.00 | Payload `POST /api/v1/orders` com `unitPrice: 1.00` manipulado | 1. Submeter payload adulterado para o motor de checkout | Total calculado compulsoriamente a R$ 100.00, ignorando o preço forjado | **Aprovado** | `backend/tests/unit/formatters-and-rules.test.js` |
| **CT-17** | REQ-8 / H9 | TD | Integração | Negativo | Bloqueio de acesso à listagem de denúncias para usuário comum (BUYER) | Usuário autenticado com perfil comum (`role: BUYER`) | Requisição `GET /api/v1/reports` com token de comprador | 1. Submeter GET de denúncias com credencial sem prerrogativa | HTTP 403 Forbidden com código `FORBIDDEN` e bloqueio pelo middleware RBAC | **Aprovado** | `backend/tests/api.test.js` |
| **CT-18** | REQ-8 / H9 | TD | Sistema | Positivo | Acesso à fila de denúncias para usuário com papel de moderador (MODERATOR) | Usuário autenticado com perfil moderador (`role: MODERATOR`) | Requisição `GET /api/v1/reports` com token de moderador | 1. Submeter GET autenticado como moderador do sistema | HTTP 200 OK com array estruturado de denúncias pendentes de triagem | **Aprovado** | `backend/tests/api.test.js` |
| **CT-19** | REQ-7 / H13 | AVL | Integração | Negativo | Bloqueio de alteração de username dentro do prazo de carência de 30 dias | Usuário com `usernameLastChangedAt` há 10 dias no banco | Payload `PATCH /api/v1/account/username` com novo username | 1. Submeter PATCH com novo username antes de 30 dias | HTTP 403 Forbidden com código `USERNAME_COOLDOWN_ACTIVE` e dias restantes | **Aprovado** | `backend/tests/username-cooldown.test.js` |
| **CT-20** | REQ-9 / H13 | AVL | Unidade | Positivo | Aprovação de username no limite máximo permitido (20 caracteres) | Schema Zod de validação de conta instanciado em memória | String de username com exatamente 20 caracteres alfanuméricos válidos | 1. Validar string no schema `usernameSchema` | Aprovação no schema Zod com regex de formatação aceitando 20 caracteres | **Aprovado** | `backend/tests/unit/schemas.test.js` |

---

## 2. Detalhamento das Técnicas de Projeto Aplicadas

### 2.1. Partição de Equivalência (PE)
A técnica de Partição de Equivalência divide o domínio de entrada dos dados em classes de equivalência mutuamente exclusivas, assumindo que todos os membros de uma classe são tratados de forma idêntica pelo sistema:
- **E-mails de Cadastro:**
  - *Classe Válida:* Formato RFC 5322 (`nome@dominio.com`), string sem espaços, não cadastrado previamente.
  - *Classe Inválida:* String sem caractere `@`, string sem domínio, string vazia, ou e-mail já persistido na base relacional.
- **Formato de Telefone Regional (DDD 89):**
  - *Classe Válida:* 11 dígitos numéricos com DDD 89 e nono dígito móvel (`899XXXXXXXX`).
  - *Classe Inválida:* Menos de 10 dígitos, DDD inexistente ou caracteres alfanuméricos misturados.
- **Busca Fonética e Flexibilização Textual:**
  - *Classe Válida:* Expressão de busca sem acento correspondendo a registros foneticamente equivalentes com acento (ex.: "chapeu" -> "Chapéu").
  - *Classe Neutra:* String vazia ou em branco, retornando o catálogo sem filtro de busca.

### 2.2. Análise do Valor Limite (AVL)
A técnica de Análise do Valor Limite concentra o projeto de testes nas fronteiras imediatas das partições de entrada, onde estatisticamente reside a maior densidade de defeitos por erros de operadores relacionais (`<` vs `<=`, `>` vs `>=`):
- **Comprimento do Título do Anúncio (Mínimo de 3 Caracteres):**
  - Fronteira inferior inválida: 2 caracteres ("TV") -> Rejeição com HTTP 400 Bad Request.
  - Fronteira inferior válida: 3 caracteres ("Mel") -> Aprovação com HTTP 201/200.
  - Ponto nominal: 4 caracteres ("Bode") -> Aprovação com sucesso.
- **Preço Nominal do Produto (Mínimo de 0.00):**
  - Fronteira inferior inválida: -0.01 -> Rejeição no schema Zod com HTTP 400 Bad Request.
  - Fronteira inferior válida: 0.00 -> Aprovação para modalidade de doação regional.
  - Ponto nominal: 0.01 -> Aprovação para comércio com valor monetário positivo.
- **Comprimento do Nome de Usuário `@username` (3 a 20 Caracteres):**
  - Limite inferior inválido: 2 caracteres -> Reprovado no Zod.
  - Limite inferior válido: 3 caracteres -> Aprovado no Zod.
  - Limite superior válido: 20 caracteres -> Aprovado no Zod.
  - Limite superior inválido: 21 caracteres -> Reprovado no Zod.
- **Janela Temporal de Cooldown de Username (30 Dias):**
  - Limite de bloqueio: 0 a 29 dias decorridos -> Rejeição com HTTP 403 Forbidden e código `USERNAME_COOLDOWN_ACTIVE`.
  - Limite de liberação: 30 dias completos decorridos -> Autorização para nova alteração.

### 2.3. Tabela de Decisão (TD)
A técnica de Tabela de Decisão é essencial para modelar combinações complexas de regras de negócio, precondições booleanas e múltiplos papéis de autorização.

#### Tabela de Decisão 1: Controle de Acesso Baseado em Papéis (RBAC em Denúncias)
| Condição 1: Token Presente? | Condição 2: Papel do Usuário | Ação do Sistema | Código HTTP Retornado | Caso Vinculado |
| :---: | :---: | :--- | :---: | :---: |
| Não | Não aplicável | Bloquear requisição na camada de middleware | `401 Unauthorized` | CT-05 |
| Sim | `BUYER` (Comprador) | Negar acesso à fila de moderação | `403 Forbidden` | CT-17 |
| Sim | `SELLER` (Vendedor) | Negar acesso à fila de moderação | `403 Forbidden` | CT-17 |
| Sim | `MODERATOR` (Moderador) | Autorizar acesso e retornar lista de denúncias | `200 OK` | CT-18 |
| Sim | `ADMIN` (Administrador) | Autorizar acesso irrestrito de governança | `200 OK` | CT-18 |

#### Tabela de Decisão 2: Moderação de Conteúdo e Purga Física no Supabase Storage via `DELETE /api/v1/reports/:id/product` ou `DELETE /api/v1/products/:id`
| Condição 1: Autenticado? | Condição 2: É o Dono do Item? | Condição 3: É Moderador/Admin? | Condição 4: Possui Fotos no Storage? | Ação no Banco | Ação no Storage | Código HTTP | Caso Vinculado |
| :---: | :---: | :---: | :---: | :--- | :--- | :---: | :---: |
| Não | - | - | - | Nenhuma alteração | Nenhuma alteração | `401 Unauthorized` | CT-05 |
| Sim | Não | Não | - | Nenhuma alteração | Nenhuma alteração | `403 Forbidden` | CT-12 |
| Sim | Sim | Não | Não | Exclusão do registro | Não aplicável | `204 No Content` | CT-13 |
| Sim | Sim | Não | Sim | Exclusão do registro | Purga física das imagens no bucket | `204 No Content` | CT-13 |
| Sim | Não | Sim | Sim | Exclusão compulsória | Purga física das imagens no bucket | `204 No Content` | CT-13 |

---

## 3. Matriz de Rastreabilidade Bidirecional

A matriz de rastreabilidade a seguir correlaciona os 13 requisitos do projeto da disciplina, as 13 histórias do backlog Scrum, os 20 casos de teste da Fase 2 e os arquivos de teste automatizado implementados no diretório `backend/tests/`:

| Requisito do Projeto | História Backlog | Casos de Teste Vinculados | Arquivos de Teste Automatizado | Status de Cobertura |
| :--- | :--- | :--- | :--- | :---: |
| **REQ-1 (Mínimo de 4 Recursos)** | H1, H3, H4, H8 | CT-01, CT-04, CT-05, CT-16 | `backend/tests/api.test.js`, `backend/tests/rest-conformance.test.js` | **100% Coberto** |
| **REQ-2 (Princípios REST & Cache)** | H3 | CT-04 | `backend/tests/api.test.js` (Teste de cabeçalho Cache-Control) | **100% Coberto** |
| **REQ-3 (Nomenclatura Sem Verbos)** | H1 a H13 | CT-04, CT-05, CT-11, CT-15 | `backend/tests/rest-conformance.test.js` (Verificação de rotas sem verbos) | **100% Coberto** |
| **REQ-4 (Verbos e Status HTTP)** | H4, H6, H7 | CT-01, CT-03, CT-05, CT-12, CT-13 | `backend/tests/api.test.js`, `backend/tests/rest-conformance.test.js` | **100% Coberto** |
| **REQ-5 (Consulta, Filtro e Ordem)** | H5 | CT-11 | `backend/tests/api.test.js` (Testes de paginação e ordenação) | **100% Coberto** |
| **REQ-6 (Versionamento /api/v1)** | H1 a H13 | CT-01, CT-04, CT-10, CT-11 | `backend/tests/api.test.js` (Todos os endpoints sob /api/v1) | **100% Coberto** |
| **REQ-7 (Inovação Tecnológica)** | H5, H8, H13 | CT-10 (Unaccent), CT-16 (Preço), CT-19 (Cooldown) | `backend/tests/api.test.js`, `backend/tests/username-cooldown.test.js` | **100% Coberto** |
| **REQ-8 (Autenticação e RBAC)** | H1, H2, H9 | CT-01, CT-03, CT-17, CT-18 | `backend/tests/api.test.js`, `backend/tests/unit/schemas.test.js` | **100% Coberto** |
| **REQ-9 (Validação e Erros Zod)** | H1, H4, H13 | CT-02, CT-06, CT-07, CT-08, CT-09, CT-20 | `backend/tests/unit/schemas.test.js` | **100% Coberto** |
| **REQ-10 (Persistência PostgreSQL)** | H1, H4, H8 | CT-01, CT-05, CT-13, CT-16 | `backend/tests/api.test.js`, `backend/tests/notification.test.js` | **100% Coberto** |
| **REQ-11 (OpenAPI e Swagger)** | H11 | CT-04, CT-11 | `backend/tests/api.test.js`, `backend/src/docs/openapi.js` | **100% Coberto** |
| **REQ-12 (Automação e Postman)** | H12 | CT-01 a CT-20 | Suíte Vitest (`backend/tests/`) e `itaim-vende.postman_collection.json` | **100% Coberto** |
| **REQ-13 (Versionamento Git/CI)** | H12 | CT-01 a CT-20 | Pipeline GitHub Actions em `.github/workflows/ci.yml` | **100% Coberto** |

---

## 4. Rastreabilidade Reversa (Código de Teste -> Requisitos)

Para assegurar a bidirecionalidade estrita exigida pelas normas de Engenharia de Software:
- **`backend/tests/unit/schemas.test.js`**: Cobre REQ-9 e REQ-8, validando schemas Zod de entrada, regras de fronteira (CT-06, CT-07, CT-08, CT-09, CT-20) e mensagens de rejeição formal.
- **`backend/tests/unit/formatters-and-rules.test.js`**: Cobre REQ-7 e REQ-9, validando regras de negócio financeiras, formatação telefônica DDD 89 e sanitização recursiva de strings contra ataques XSS.
- **`backend/tests/api.test.js`**: Cobre REQ-1, REQ-2, REQ-4, REQ-5, REQ-6, REQ-7, REQ-8 e REQ-10 em ambiente de integração com PostgreSQL real.
- **`backend/tests/rest-conformance.test.js`**: Cobre REQ-3 e REQ-4, garantindo adesão às diretrizes RESTful, ausência de verbos nos caminhos de URI e semântica estrita dos verbos HTTP (GET, POST, PATCH, DELETE).
- **`backend/tests/username-cooldown.test.js`**: Cobre REQ-7 e REQ-9, testando isoladamente a trava transacional de integridade de identidade regional com carência de 30 dias.
