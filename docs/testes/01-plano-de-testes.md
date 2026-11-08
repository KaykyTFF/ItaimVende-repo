# Plano de Testes de Software — API Itaim Vende

**Projeto:** Itaim Vende (Plataforma e API RESTful de Comércio Regional)  
**Disciplina:** Engenharia de Software  
**Docente:** Prof. Me. Julian Rodrigues Valério  
**Responsável Técnico:** Equipe de Engenharia do Itaim Vende  
**Versão do Documento:** 2.0.0 | **Data:** 08/11/2026  

---

## 1. Escopo de Testes

### 1.1. Itens no Escopo
O escopo deste plano abrange a verificação e validação da API RESTful `Itaim Vende` (versão `/api/v1`), contemplando:
- **Módulo de Identidade e Autenticação (IAM):** Registro de usuários, autenticação via Bearer JWT, login Google OAuth2 e recuperação de senha via código OTP de 6 dígitos.
- **Governança de Conta e Segurança:** Validação de username (`@`), política de retenção (*cooldown* de 30 dias), alteração segura de e-mail e telefone e reversão emergencial via token criptografado.
- **Catálogo de Produtos:** Publicação de anúncios, sanitização de dados, enriquecimento de DTOs, geração de slugs semânticos e busca fonética normalizada com a extensão PostgreSQL `unaccent` e Trigram (`pg_trgm`).
- **Checkout e Integridade Financeira:** Emissão de pedidos com recálculo compulsório de preços no servidor via Prisma ORM, prevenindo manipulação de valores no frontend.
- **Negociação e Mensageria:** Chat em tempo real via WebSockets (`socket.io`), contrapropostas de valor e despacho assíncrono de e-mails transacionais.
- **Notificações:** Central de notificações transacionais com contagens agregadas por categoria e operações de leitura/exclusão.
- **Moderação e Limpeza de Nuvem:** Painel RBAC (`MODERATOR`/`ADMIN`) com exclusão cautelar de produtos e purga física de arquivos no Supabase Storage.

### 1.2. Itens Fora do Escopo
- Testes de carga extrema com mais de 10.000 requisições simultâneas por segundo (fora dos limites da infraestrutura educacional).
- Testes de penetração em hardware físico e gateways de pagamento externos homologados por terceiros.

---

## 2. Objetivos de Qualidade

1. **Garantir a Correção Funcional:** Assegurar que cada endpoint processe os dados conforme o contrato OpenAPI 3.0.3 e atenda aos critérios de aceitação definidos no Product Backlog.
2. **Assegurar Integridade Financeira e de Negócio:** Garantir que nenhuma transação financeira seja processada com valores divergentes dos registrados no catálogo do banco de dados.
3. **Validar Conformidade RESTful:** Verificar se todos os endpoints utilizam substantivos no plural, verbos HTTP semânticos (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`) e códigos de status adequados (`200`, `201`, `204`, `400`, `401`, `403`, `404`, `409`).
4. **Alcançar Cobertura Mínima Exigida:** Atingir no mínimo 70% de cobertura de linhas nos módulos de regra de negócio e validação.
5. **Mitigar Regressões de Software:** Automatizar a suíte de testes em pipeline de Integração Contínua (CI) executado a cada push no repositório.

---

## 3. Níveis e Tipos de Teste

| Nível | Tipo | Abordagem | Ferramentas |
| :--- | :--- | :--- | :--- |
| **Teste de Unidade** | Funcional / Caixa-Branca | Validação isolada de schemas Zod, formatadores DTO, geração de slugs e algoritmos de cálculo financeiro em memória, sem dependência de rede ou I/O de banco. | Node Test Runner (`node:test`, `node:assert/strict`) |
| **Teste de Integração** | Funcional / Caixa-Cinza | Validação de controladores Express, middlewares de autenticação JWT, autorização RBAC e persistência real no PostgreSQL via Prisma. | Node Test Runner, Fetch API, Prisma Client |
| **Teste de Sistema** | Funcional / Caixa-Preta | Validação de fluxos de ponta a ponta da API (ex: cadastro -> login -> emissão de pedido -> verificação de notificação). | Coleção Postman e Node Test Runner |
| **Teste Não Funcional** | Segurança Básica | Validação de barreiras contra requisições não autenticadas (401), permissões insuficientes (403), rate limiting e proteção contra injeção de parâmetros. | Node Test Runner |

---

## 4. Estratégia de Testes

- **Pirâmide de Testes Equilibrada:**
  - **Base (Unidade):** Testes rápidos (execução em < 1 segundo), cobrindo limites de dados, partições de equivalência e transformações puras.
  - **Meio (Integração):** Testes de rotas, middlewares, integridade relacional no banco e validação de contratos HTTP.
  - **Topo (Sistema/E2E):** Testes de fluxos críticos de negócio do usuário e cenários de exceção.
- **Técnicas de Projeto de Testes:** Partição de Equivalência (classes válidas e inválidas), Análise do Valor Limite (fronteiras de tamanho e valores monetários) e Tabela de Decisão (regras de autorização por papéis RBAC).
- **Isolamento de Dados de Teste:** Criação de sufixos únicos (`Date.now().toString(36)`) para evitar colisões entre execuções concorrentes e rotinas de limpeza (`after`) para dados voláteis.

---

## 5. Ambiente de Testes

- **Ambiente de Desenvolvimento Local:**
  - Sistema Operacional: Windows 11 / Linux Ubuntu 22.04 LTS
  - Runtime: Node.js >= 20.x (ES Modules nativos)
  - Banco de Dados: PostgreSQL 15.x local ou instância gerenciada no Supabase
  - Servidor HTTP: Express 5.2.1 na porta local 3000
- **Ambiente de Integração Contínua (CI):**
  - Runner: GitHub Actions (`ubuntu-latest`)
  - Container de Serviço: `postgres:15-alpine` em porta 5432
  - Orquestração: Inicialização assíncrona com healthcheck e execução de suíte automatizada

---

## 6. Riscos e Planos de Mitigação

| Risco Identificado | Impacto | Probabilidade | Estratégia de Mitigação |
| :--- | :---: | :---: | :--- |
| **Indisponibilidade de conexão com o banco de dados durante testes de integração** | Alto | Média | Utilização de container PostgreSQL dedicado no CI e script de fallback com checagem de healthcheck prévio. |
| **Falsos positivos por portas ocupadas (EADDRINUSE)** | Médio | Média | Configuração de porta parametrizada por variável de ambiente (`TEST_PORT` / `PORT`) e scripts de encerramento seguro. |
| **Divergência de fuso horário em testes de cooldown de datas** | Baixo | Baixa | Manipulação de datas baseada em timestamps Unix (`getTime()`) ou ISO 8601 universais (UTC). |

---

## 7. Papéis e Responsabilidades

- **Kayky (Líder Técnico / Backend):** Planejamento da arquitetura de testes, automação de testes de integração, configuração do pipeline de CI e validação das regras de negócio.
- **Pedro Ravy (Backend Developer):** Implementação de testes unitários de schemas Zod, formatadores de DTO e regras de segurança de autenticação.
- **Josimar (Frontend / Testes de Sistema):** Execução de testes manuais com a coleção Postman, verificação de compatibilidade com interfaces e registro de relatórios de defeito.
- **Giselly e Raili (Qualidade / Documentação):** Estruturação da matriz de rastreabilidade, acompanhamento do painel de métricas e consolidação do relatório final de encerramento.

---

## 8. Cronograma de Testes

| Etapa | Período Estimado | Atividades Principais |
| :--- | :---: | :--- |
| **Fase 1: Planejamento** | Sprint 1 (Início) | Definição de escopo, riscos, ambientes e aprovação do Plano de Testes. |
| **Fase 2: Projeto** | Sprint 1 (Meio) | Especificação dos 20 casos de teste com técnicas formais e matriz de rastreabilidade. |
| **Fase 3: Execução** | Sprint 2 (Início) | Execução da suíte automatizada, testes no Postman e abertura dos relatórios de defeitos. |
| **Fase 4: Monitoramento** | Sprint 2 (Meio) | Apuração do painel de métricas nos tempos T1 (meio) e T2 (fim), acompanhamento de correções. |
| **Fase 5: Encerramento** | Sprint 2 (Fim) | Consolidação dos resultados, verificação dos critérios de saída e emissão do parecer final. |

---

## 9. Critérios de Entrada e de Saída

### 9.1. Critérios de Entrada
- API compilando e executando sem erros fatais no servidor HTTP.
- Esquema do banco de dados sincronizado via Prisma ORM.
- Especificação formal OpenAPI 3.0.3 disponível e validada.
- Suíte básica de testes configurada no `package.json`.

### 9.2. Critérios de Saída
- **100% dos testes automatizados aprovados** sem falhas na suíte de regressão.
- **Cobertura de código superior a 70%** nos módulos de regras de negócio e validações.
- **Todos os 20 casos de teste formais executados** e registrados no log de execução.
- **Zero defeitos com severidade Crítica ou Alta em aberto.**
- **Pipeline de Integração Contínua (CI) com status verde** executando automaticamente no GitHub Actions.
- **Relatório final de testes emitido e aprovado pela equipe.**

