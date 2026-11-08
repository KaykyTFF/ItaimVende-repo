# Log de Execução e Relatórios de Defeitos — Fase 3

**Projeto:** Itaim Vende (API RESTful de Comércio Regional)  
**Disciplina:** Engenharia de Software  
**Docente:** Prof. Me. Julian Rodrigues Valério  
**Documento de Engenharia de Testes:** Fase 3 — Execução e Gestão de Defeitos  
**Data da Execução Consolidada:** 08/11/2026  

---

## 1. Log Consolidado de Execução dos 20 Casos de Teste

| ID | Data/Hora | Ambiente | Modo de Execução | Resultado Esperado | Resultado Obtido | Status |
| :---: | :---: | :---: | :---: | :--- | :--- | :---: |
| **CT-01** | 08/11/2026 14:10 | Local / CI | Automatizado (`api.test.js`) | HTTP `201 Created` com Bearer JWT | HTTP 201 retornado com token e payload do usuário | **Aprovado** |
| **CT-02** | 08/11/2026 14:10 | Local / CI | Automatizado (`unit/schemas.test.js`) | HTTP `409 Conflict` (E-mail duplicado) | HTTP 409 com código `DUPLICATE_ENTRY` | **Aprovado** |
| **CT-03** | 08/11/2026 14:11 | Local / CI | Automatizado (`api.test.js`) | HTTP `401 Unauthorized` | HTTP 401 com mensagem de credenciais incorretas | **Aprovado** |
| **CT-04** | 08/11/2026 14:11 | Local / Postman | Manual (`itaim-vende.postman`) | HTTP `200 OK` + `Cache-Control` | HTTP 200 retornado e cabeçalho `public, max-age=300` presente | **Aprovado** |
| **CT-05** | 08/11/2026 14:12 | Local / CI | Automatizado (`api.test.js`) | HTTP `401 Unauthorized` sem token | HTTP 401 retornado barrando a persistência | **Aprovado** |
| **CT-06** | 08/11/2026 14:12 | Local / CI | Automatizado (`unit/schemas.test.js`) | Rejeição no Zod com HTTP `400` (< 3 chars) | Rejeitado com mensagem "mínimo 3 caracteres" | **Aprovado** |
| **CT-07** | 08/11/2026 14:13 | Local / CI | Automatizado (`unit/schemas.test.js`) | Aprovação no Zod (= 3 chars) | Aprovado com sucesso no schema | **Aprovado** |
| **CT-08** | 08/11/2026 14:13 | Local / CI | Automatizado (`unit/schemas.test.js`) | Rejeição no Zod com HTTP `400` (< 0) | Rejeitado com mensagem "maior ou igual a zero" | **Aprovado** |
| **CT-09** | 08/11/2026 14:14 | Local / CI | Automatizado (`unit/schemas.test.js`) | Aprovação no Zod (= 0.00 para doação) | Aprovado com sucesso no schema | **Aprovado** |
| **CT-10** | 08/11/2026 14:15 | Local / CI | Automatizado (`api.test.js`) | Busca unaccent localiza "Eletrônicos" | Item localizado com sucesso pelo PostgreSQL | **Aprovado** |
| **CT-11** | 08/11/2026 14:15 | Local / Postman | Manual (`itaim-vende.postman`) | Paginação com 5 itens e ordenação | Array de 5 itens retornado com metadados de página | **Aprovado** |
| **CT-12** | 08/11/2026 14:16 | Local / CI | Automatizado (`rest-conformance.test.js`) | HTTP `403 Forbidden` (Não proprietário) | HTTP 403 retornado impedindo exclusão indevida | **Aprovado** |
| **CT-13** | 08/11/2026 14:16 | Local / CI | Automatizado (`rest-conformance.test.js`) | HTTP `204 No Content` + Purga Storage | HTTP 204 retornado e arquivo purgado no storage | **Aprovado** |
| **CT-14** | 08/11/2026 14:17 | Local / CI | Automatizado (`api.test.js`) | HTTP `201 Created` + Evento WebSocket | HTTP 201 retornado e evento emitido no socket | **Aprovado** |
| **CT-15** | 08/11/2026 14:17 | Local / CI | Automatizado (`rest-conformance.test.js`) | HTTP `200 OK` (Status de proposta) | HTTP 200 retornado e status atualizado para ACCEPTED | **Aprovado** |
| **CT-16** | 08/11/2026 14:18 | Local / CI | Automatizado (`unit/rules.test.js`) | Preço do banco prevalece sobre cliente | Recálculo confinado ao servidor, valor travado | **Aprovado** |
| **CT-17** | 08/11/2026 14:18 | Local / CI | Automatizado (`api.test.js`) | HTTP `403 Forbidden` para BUYER em reports | HTTP 403 retornado pelo middleware RBAC | **Aprovado** |
| **CT-18** | 08/11/2026 14:19 | Local / Postman | Manual (`itaim-vende.postman`) | HTTP `200 OK` para MODERATOR em reports | HTTP 200 com array de denúncias para triagem | **Aprovado** |
| **CT-19** | 08/11/2026 14:19 | Local / CI | Automatizado (`username-cooldown.test.js`) | HTTP `403 Forbidden` (< 30 dias) | HTTP 403 retornado com código `USERNAME_COOLDOWN_ACTIVE` | **Aprovado** |
| **CT-20** | 08/11/2026 14:20 | Local / CI | Automatizado (`unit/schemas.test.js`) | Aprovação no Zod (= 20 chars) | Aprovado com sucesso no schema | **Aprovado** |

---

## 2. Relatórios Formais de Defeitos (Bug Reports)

### Defeito 01 (BUG-01) — Real / Corrigido
- **Identificador:** BUG-01
- **Título:** Bloqueio indevido de cooldown ao salvar formulário de perfil sem alteração do `@username`.
- **Severidade:** Alta
- **Prioridade:** Alta
- **Ambiente:** Servidor Backend (`src/services/auth/auth.profile.service.js`) e Tela de Perfil.
- **Passos para Reprodução:**
  1. Acessar a tela de configurações de perfil com usuário autenticado.
  2. Modificar apenas a biografia ou o telefone, mantendo o mesmo nome de usuário.
  3. Clicar em "Salvar Alterações".
- **Resultado Esperado:** O perfil deve ser salvo com sucesso sem acionar a trava de 30 dias.
- **Resultado Obtido:** O backend identificava o campo `username` presente no payload e disparava erro `403 Forbidden` informando que o cooldown estava ativo.
- **Causa Raiz:** O serviço comparava a data da última alteração antes de checar se o username enviado era estritamente diferente do username atual do banco.
- **Resolução:** Inserida checagem `if (cleanUsername !== currentUser.username.toLowerCase())`. Caso idênticos, a trava é ignorada. Validado pelo Cenário 8 de `username-cooldown.test.js`.
- **Status:** **Corrigido e Validado**.

---

### Defeito 02 (BUG-02) — Real / Corrigido
- **Identificador:** BUG-02
- **Título:** Empilhamento vertical e perda de layout no card de revisão quando anúncio possui múltiplas fotos.
- **Severidade:** Média
- **Prioridade:** Alta
- **Ambiente:** Frontend (`frontend/js/pages/vender/anuncio/vender-publicacao.js` e CSS).
- **Passos para Reprodução:**
  1. No fluxo de criação de anúncio (`vender.html`), fazer upload de 2 ou mais fotos.
  2. Preencher os dados de título, categoria, condição e localização.
  3. Avançar para a Etapa 4 ("Revisão").
- **Resultado Esperado:** Exibição da foto principal com carrossel de setas de navegação, contador (ex: "1 de 3") e linha horizontal de miniaturas (52px).
- **Resultado Obtido:** As miniaturas expandiam para 100% da largura do card, quebrando a coluna de dados e empilhando as imagens verticalmente.
- **Causa Raiz:** O elemento `.preview-miniatura-item` não possuía dimensões fixas no CSS, permitindo expansão infinita do container flex.
- **Resolução:** Fixadas dimensões `52px x 52px` com `object-fit: cover`, adicionadas setas de navegação flutuantes e contador dinâmico.
- **Status:** **Corrigido e Validado**.

---

### Defeito 03 (BUG-03) — Injetado para Validação de Teste
- **Identificador:** BUG-03
- **Título:** Supressão do cabeçalho de cache HTTP `Cache-Control` na listagem pública de categorias.
- **Severidade:** Média
- **Prioridade:** Média
- **Ambiente:** Controlador de Categorias (`src/controllers/category/category.controller.js`).
- **Falha Injetada Deliberadamente:** Comentada a linha `res.set('Cache-Control', 'public, max-age=300')` para verificar se os testes automatizados detectavam a regressão de conformidade RESTful.
- **Resultado da Execução do Teste:** O teste `api.test.js` (Teste 2: `GET /categories deve retornar status 200 e header Cache-Control`) **falhou imediatamente**, comprovando a eficácia e sensibilidade do caso de teste.
- **Resolução:** Reestabelecida a diretiva de cache no controlador e reexecutado o teste com status aprovado.
- **Status:** **Corrigido e Validado**.

---

### Defeito 04 (BUG-04) — Injetado para Validação de Teste
- **Identificador:** BUG-04
- **Título:** Retorno indevido de status HTTP `200 OK` com body em operação de exclusão idempotente.
- **Severidade:** Baixa
- **Prioridade:** Média
- **Ambiente:** Rota de Favoritos (`src/controllers/favorite/favorite.controller.js`).
- **Falha Injetada Deliberadamente:** Alterado o status code retornado por `DELETE /favorites/:productId` de `200` (ou `204`) para `201 Created`.
- **Resultado da Execução do Teste:** O teste automatizado `rest-conformance.test.js` (Teste 6) **reprovou de imediato**, acusando divergência de status HTTP esperado (`200 OK`).
- **Resolução:** Restaurado o status code semântico correto conforme as boas práticas RESTful.
- **Status:** **Corrigido e Validado**.

---

### Defeito 05 (BUG-05) — Real / Corrigido
- **Identificador:** BUG-05
- **Título:** Tentativa de injeção client-side de preço adulterado no checkout (`POST /orders`).
- **Severidade:** Crítica
- **Prioridade:** Alta
- **Ambiente:** Serviço de Pedidos (`src/services/order/order.creation.service.js`).
- **Passos para Reprodução:**
  1. Autenticar como comprador no marketplace.
  2. Enviar requisição manual via Postman para `POST /api/v1/orders` contendo `{ productId: "id_real", price: 0.01 }`.
- **Resultado Esperado:** A API deve ignorar qualquer valor monetário enviado pelo cliente e calcular o preço real a partir do registro do produto no PostgreSQL.
- **Resultado Obtido na Versão Legada:** Havia risco de acatar valores passados no corpo da requisição sem validação cruzada.
- **Resolução:** O serviço `order.creation.service.js` foi reescrito para consultar compulsoriamente os registros via `prisma.product.findMany`, multiplicando as quantidades diretamente pelos preços unitários travados no banco. Validado pelo teste `CT-U28` da suíte de testes unitários.
- **Status:** **Corrigido e Validado**.

