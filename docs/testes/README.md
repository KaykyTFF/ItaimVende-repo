# Documentação do Processo de Testes de Software — Itaim Vende API

**Disciplina:** Engenharia de Software  
**Docente:** Prof. Me. Julian Rodrigues Valério  
**Projeto:** Itaim Vende (Plataforma de Comércio Regional do Semiárido Piauiense)  
**Versão da Suíte de Testes:** v2.0.0  

Este diretório consolida todos os artefatos formais produzidos durante o ciclo de vida do processo de testes da API, cobrindo o Modelo V, metodologias ágeis (Scrum e XP), planejamento, especificação, rastreabilidade, execução, monitoramento e encerramento:

---

## Estrutura dos Artefatos de Teste

| Entregável / Fase | Artefato Formal | Descrição |
| :---: | :--- | :--- |
| **Entregável 1: Modelo V e Métodos Ágeis** | [`00-relatorio-partes-1-e-2.md`](00-relatorio-partes-1-e-2.md) | Relatório acadêmico unificado: Diagrama em V, 8 Casos do Modelo V, Verificação vs. Validação, 4 Histórias BDD, DoD, Ciclos TDD, Pipeline de CI, Pair Programming, Pirâmide de Testes (88 testes) e reflexões críticas. |
| **Fase 1: Planejamento** | [`01-plano-de-testes.md`](01-plano-de-testes.md) | Escopo, objetivos, pirâmide de testes, ambiente de homologação, matriz de riscos, papéis, cronograma e critérios formais de entrada/saída. |
| **Fase 2: Projeto e Rastreabilidade** | [`02-casos-de-teste-e-rastreabilidade.md`](02-casos-de-teste-e-rastreabilidade.md) | Especificação detalhada dos 20 casos de teste (12 colunas), aprofundamento das técnicas (PE, AVL, TD) e Matriz de Rastreabilidade Bidirecional. |
| **Entregável 3: Planilha de Testes (Fase 2)** | [`planilha-casos-de-teste-e-rastreabilidade.csv`](planilha-casos-de-teste-e-rastreabilidade.csv) | Planilha delimitada por ponto e vírgula contendo os 20 casos de teste estruturados nas 12 colunas obrigatórias da atividade. |
| **Fase 3: Execução e Defeitos** | [`03-execucao-e-relatorios-de-defeitos.md`](03-execucao-e-relatorios-de-defeitos.md) | Log de execução dos 20 casos de teste e 5 relatórios formais de defeito (BUG-01 a BUG-05: reais e injetados, 100% saneados). |
| **Fase 4: Monitoramento e Controle** | [`04-painel-de-metricas.md`](04-painel-de-metricas.md) | Painel comparativo em dois pontos temporais (T1 meio vs T2 fim), densidade de defeitos, curva de queima e registro das ações de controle executadas. |
| **Fase 5: Encerramento do Projeto** | [`05-relatorio-final-de-testes.md`](05-relatorio-final-de-testes.md) | Validação dos critérios de saída, consolidação dos resultados, lições aprendidas e parecer formal de liberação para homologação e produção. |

---

## Comandos para Execução dos Testes no Repositório

```bash
# 1. Executar apenas os testes unitários (execução ultrarrápida, < 1s)
npm --prefix backend run test:unit

# 2. Executar testes unitários com relatório de cobertura de código (c8 / v8)
npm --prefix backend run test:unit:coverage

# 3. Executar suíte completa de testes de integração e conformidade REST
npm --prefix backend test

# 4. Executar todos os testes automatizados do projeto (Unitários + Integração + Sistema)
npm --prefix backend run test:all
```

---

## Resumo das Métricas Oficiais Atingidas

- **Total de Testes Automatizados:** **88 testes** (30 unitários + 45 integração + 13 sistema/E2E)
- **Taxa de Sucesso:** **100% de aprovação** (0 falhas pendentes)
- **Cobertura de Código em Regras de Negócio e Schemas:** **97,03% de linhas** (exigência mínima: 70%)
- **Defeitos Registrados e Corrigidos:** **5 defeitos** (BUG-01 a BUG-05, 100% saneados)
- **Pipeline de Integração Contínua (CI):** Ativo via GitHub Actions em [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml) com Node.js 20.x e PostgreSQL 15
