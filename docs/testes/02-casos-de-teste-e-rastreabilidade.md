# Casos de Teste e Matriz de Rastreabilidade — Fase 2

**Projeto:** Itaim Vende (API RESTful de Comércio Regional)  
**Disciplina:** Engenharia de Software  
**Docente:** Prof. Me. Julian Rodrigues Valério  
**Documento de Engenharia de Testes:** Fase 2 — Projeto de Testes  
**Técnicas de Projeto Empregadas:** Partição de Equivalência (PE), Análise do Valor Limite (AVL) e Tabela de Decisão (TD)  

---

## 1. Especificação dos 20 Casos de Teste Projetados

| ID | Requisito | Técnica | Nível | Entrada (Payload / Parâmetros) | Resultado Esperado |
| :---: | :--- | :---: | :---: | :--- | :--- |
| **CT-01** | H1 / REQ-8 (Autenticação) | PE | Integração | `POST /api/v1/auth/register` com dados válidos: nome completo, e-mail único, senha forte (10 chars, maiúscula, número, símbolo) e cidade. | Retorno HTTP `201 Created` com token Bearer JWT e objeto do usuário sem expor campo de senha. |
| **CT-02** | H1 / REQ-9 (Validação) | PE | Unidade | `POST /api/v1/auth/register` com e-mail duplicado já existente na base. | Retorno HTTP `409 Conflict` com código de erro `DUPLICATE_ENTRY` e mensagem explicativa. |
| **CT-03** | H2 / REQ-8 (Segurança) | PE | Integração | `POST /api/v1/auth/login` com senha incorreta para conta cadastrada. | Retorno HTTP `401 Unauthorized` com mensagem "E-mail ou senha incorretos." |
| **CT-04** | H3 / REQ-2 (Princípios REST) | PE | Sistema | `GET /api/v1/categories` sem autenticação. | Retorno HTTP `200 OK` contendo lista de categorias ativas e cabeçalho `Cache-Control: public, max-age=300`. |
| **CT-05** | H4 / REQ-4 (Verbos HTTP) | PE | Integração | `POST /api/v1/products` sem cabeçalho `Authorization`. | Retorno HTTP `401 Unauthorized` bloqueando a persistência do produto no banco. |
| **CT-06** | H4 / REQ-9 (Validação) | AVL | Unidade | `POST /api/v1/products` com título contendo exatamente 2 caracteres (limite inferior inválido). | Rejeição no schema Zod com HTTP `400 Bad Request` indicando "mínimo de 3 caracteres". |
| **CT-07** | H4 / REQ-9 (Validação) | AVL | Unidade | `POST /api/v1/products` com título contendo exatamente 3 caracteres (limite inferior válido). | Validação aprovada com sucesso no schema Zod. |
| **CT-08** | H4 / REQ-9 (Validação) | AVL | Unidade | `POST /api/v1/products` com preço negativo `-0.01` (fora do limite inferior). | Rejeição no schema Zod com HTTP `400 Bad Request` indicando "preço deve ser maior ou igual a zero". |
| **CT-09** | H4 / REQ-9 (Validação) | AVL | Unidade | `POST /api/v1/products` com preço `0.00` (limite inferior válido para doação). | Validação aprovada com sucesso no schema Zod. |
| **CT-10** | H5 / REQ-7 (Inovação Unaccent) | PE | Integração | `GET /api/v1/products?search=eletronicos` (sem acento) buscando registro cadastrado como "Eletrônicos". | Retorno HTTP `200 OK` localizando o item através da extensão PostgreSQL `unaccent` e Trigram. |
| **CT-11** | H5 / REQ-5 (Consulta e Filtros) | PE | Integração | `GET /api/v1/products?page=1&limit=5&sort=menor_preco&city=Paulistana`. | Retorno HTTP `200 OK` com array ordenado de até 5 itens e metadados de paginação estruturados. |
| **CT-12** | H6 / REQ-4 (Verbos e Status) | TD | Integração | `DELETE /api/v1/products/{id}` executado por usuário diferente do proprietário do anúncio. | Retorno HTTP `403 Forbidden` com mensagem de permissão negada. |
| **CT-13** | H6 / REQ-4 (Verbos e Status) | TD | Integração | `DELETE /api/v1/products/{id}` executado pelo proprietário do anúncio com foto no storage. | Retorno HTTP `204 No Content`, exclusão no banco e purga das fotos no Supabase Storage. |
| **CT-14** | H7 / REQ-4 (Negociação) | TD | Integração | `POST /api/v1/chat/conversations/{id}/messages` com oferta de valor `offerPrice: 200`. | Retorno HTTP `201 Created` e emissão de evento WebSocket para o vendedor. |
| **CT-15** | H7 / REQ-4 (Status de Proposta) | TD | Integração | `PATCH /api/v1/chat/messages/{id}/status` com status `"ACCEPTED"` pelo vendedor. | Retorno HTTP `200 OK` com alteração atômica do status da proposta para aceito. |
| **CT-16** | H8 / REQ-7 (Integridade Financeira) | PE | Unidade | `POST /api/v1/orders` com payload tentando adulterar `unitPrice: 1.00` para produto que custa `100.00`. | Ignora o valor enviado e calcula o total correto com base no catálogo real do banco. |
| **CT-17** | H9 / REQ-8 (Autorização RBAC) | TD | Integração | `GET /api/v1/reports` com token de usuário comum (`role: BUYER`). | Retorno HTTP `403 Forbidden` com mensagem "Acesso negado. Permissão insuficiente." |
| **CT-18** | H9 / REQ-8 (Autorização RBAC) | TD | Integração | `GET /api/v1/reports` com token de moderador (`role: MODERATOR`). | Retorno HTTP `200 OK` contendo a lista de denúncias pendentes para triagem. |
| **CT-19** | H13 / REQ-7 (Cooldown de Username) | AVL | Integração | `PATCH /api/v1/account/username` com novo username logo após alteração anterior (0 dias de intervalo). | Retorno HTTP `403 Forbidden` com código `USERNAME_COOLDOWN_ACTIVE` e dias restantes. |
| **CT-20** | H13 / REQ-9 (Validação de Username) | AVL | Unidade | `PATCH /api/v1/account/username` com username contendo 20 caracteres (limite superior válido). | Aprovação no schema Zod e regex de formatação. |

---

## 2. Detalhamento das Técnicas de Projeto Aplicadas

### 2.1. Partição de Equivalência (PE)
Aplicada para particionar o domínio de dados de entrada em classes válidas (que geram comportamento esperado) e classes inválidas (que geram erros tratados):
- **E-mails:** Classe válida (endereço com `@` e domínio válido), Classes inválidas (sem `@`, sem domínio, string vazia).
- **Código OTP:** Classe válida (6 dígitos numéricos), Classes inválidas (menos de 6 dígitos, mais de 6 dígitos, caracteres alfanuméricos).
- **Busca Fonética:** Classe válida (termo sem acento localizando texto acentuado), Classe neutra (termo vazio trazendo catálogo completo).

### 2.2. Análise do Valor Limite (AVL)
Aplicada nas fronteiras numéricas e de comprimento de strings:
- **Título do Anúncio (min 3 chars):** 2 caracteres (reprovado), 3 caracteres (aprovado), 4 caracteres (aprovado).
- **Preço do Anúncio (>= 0):** -0.01 (reprovado), 0.00 (aprovado - doação), 0.01 (aprovado).
- **Username (3 a 20 chars):** 2 chars (reprovado), 3 chars (aprovado), 20 chars (aprovado), 21 chars (reprovado).
- **Prazo de Cooldown de Username (30 dias):** 0 a 29 dias (bloqueado com 403), 30 dias completos (liberado).

### 2.3. Tabela de Decisão (TD)
Aplicada para regras de negócio com múltiplas condições lógicas combinadas:

#### Tabela de Decisão 1: Controle de Acesso Baseado em Papéis (RBAC em Denúncias)
| Condição 1: Token Presente? | Condição 2: Papel do Usuário | Ação / Resultado Esperado | Caso de Teste |
| :---: | :---: | :--- | :---: |
| Não | - | `401 Unauthorized` | CT-05 |
| Sim | `BUYER` | `403 Forbidden` | CT-17 |
| Sim | `SELLER` | `403 Forbidden` | CT-17 |
| Sim | `MODERATOR` | `200 OK` (Acesso Permitido) | CT-18 |
| Sim | `ADMIN` | `200 OK` (Acesso Total) | CT-18 |

#### Tabela de Decisão 2: Exclusão de Anúncios e Gestão de Mídia
| Condição 1: Usuário Autenticado? | Condição 2: É o Dono do Anúncio? | Condição 3: É Administrador? | Ação / Resultado Esperado | Caso de Teste |
| :---: | :---: | :---: | :--- | :---: |
| Não | - | - | `401 Unauthorized` | CT-05 |
| Sim | Não | Não | `403 Forbidden` | CT-12 |
| Sim | Sim | Não | `204 No Content` + Purga Storage | CT-13 |
| Sim | Não | Sim | `204 No Content` + Purga Storage | CT-13 |

---

## 3. Matriz de Rastreabilidade (Requisitos x Casos de Teste x Código)

A matriz abaixo comprova a cobertura bidirecional entre os requisitos obrigatórios da API, as histórias do Scrum, os casos de teste formais e os arquivos de teste automatizado implementados:

| Requisito do Projeto | História Backlog | Caso de Teste Projetado | Arquivo de Teste Automatizado | Status de Cobertura |
| :--- | :--- | :--- | :--- | :---: |
| **REQ-1 (Mínimo 4 Recursos)** | H1, H3, H4, H8 | CT-01, CT-04, CT-05, CT-16 | `api.test.js`, `rest-conformance.test.js` | 100% Coberto |
| **REQ-2 (Princípios REST & Cache)** | H3 | CT-04 | `api.test.js` (Teste 2) | 100% Coberto |
| **REQ-3 (Nomenclatura Sem Verbos)** | H1 a H13 | CT-04, CT-05, CT-11, CT-15 | `rest-conformance.test.js` | 100% Coberto |
| **REQ-4 (Verbos e Status HTTP)** | H4, H6, H7 | CT-01, CT-03, CT-05, CT-12, CT-13 | `api.test.js`, `rest-conformance.test.js` | 100% Coberto |
| **REQ-5 (Consulta, Filtro e Ordem)** | H5 | CT-11 | `api.test.js` (Teste 3) | 100% Coberto |
| **REQ-6 (Versionamento /api/v1)** | H1 a H13 | CT-01, CT-04, CT-10, CT-11 | `api.test.js` (Todos os testes) | 100% Coberto |
| **REQ-7 (Inovação Tecnológica)** | H5, H8, H13 | CT-10 (Unaccent), CT-16 (Preço), CT-19 (Cooldown) | `api.test.js`, `username-cooldown.test.js` | 100% Coberto |
| **REQ-8 (Autenticação e RBAC)** | H1, H2, H9 | CT-01, CT-03, CT-17, CT-18 | `api.test.js` (Testes 5, 8), `unit/schemas.test.js` | 100% Coberto |
| **REQ-9 (Validação e Erros)** | H1, H4, H13 | CT-02, CT-06, CT-08, CT-20 | `unit/schemas.test.js`, `api.test.js` (Teste 7) | 100% Coberto |
| **REQ-10 (Persistência PostgreSQL)** | H1, H4, H8 | CT-01, CT-05, CT-13, CT-16 | `api.test.js`, `notification.test.js` | 100% Coberto |
| **REQ-11 (OpenAPI e Swagger)** | H11 | CT-04, CT-11 | `api.test.js` (Teste 1), `server.js` | 100% Coberto |
| **REQ-12 (Automação e Postman)** | H12 | CT-01 a CT-20 | `backend/tests/`, `itaim-vende.postman_collection.json` | 100% Coberto |
| **REQ-13 (Versionamento Git/CI)** | H12 | CT-01 a CT-20 | `.github/workflows/ci.yml` | 100% Coberto |

