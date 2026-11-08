# Documentação do Processo de Testes de Software — Itaim Vende API

**Disciplina:** Engenharia de Software  
**Docente:** Prof. Me. Julian Rodrigues Valério  
**Projeto:** Itaim Vende (Plataforma de Comércio Regional do Semiárido Piauiense)  
**Versão da Suíte de Testes:** v2.0.0  

Este diretório consolida todos os artefatos formais produzidos durante o ciclo de vida do processo de testes da API, cobrindo o planejamento, especificação, execução, monitoramento e encerramento:

---

## Estrutura dos Artefatos de Teste

| Fase do Processo | Artefato Formal | Descrição |
| :---: | :--- | :--- |
| **Fase 1: Planejamento** | [`01-plano-de-testes.md`](01-plano-de-testes.md) | Escopo, objetivos, pirâmide de testes, ambiente, riscos, papéis, cronograma e critérios de entrada/saída. |
| **Fase 2: Projeto** | [`02-casos-de-teste-e-rastreabilidade.md`](02-casos-de-teste-e-rastreabilidade.md) | Especificação de 20 casos de teste (Partição de Equivalência, Valor Limite e Tabela de Decisão) e Matriz de Rastreabilidade. |
| **Fase 3: Execução** | [`03-execucao-e-relatorios-de-defeitos.md`](03-execucao-e-relatorios-de-defeitos.md) | Log de execução dos 20 casos e 5 relatórios formais de defeito (BUG-01 a BUG-05: reais e injetados). |
| **Fase 4: Monitoramento** | [`04-painel-de-metricas.md`](04-painel-de-metricas.md) | Painel comparativo em dois pontos no tempo (T1 meio vs T2 fim) e registro das ações de controle executadas. |
| **Fase 5: Encerramento** | [`05-relatorio-final-de-testes.md`](05-relatorio-final-de-testes.md) | Critérios de saída verificados, consolidação dos resultados, lições aprendidas e parecer formal de liberação. |

---

## Comandos para Execução dos Testes no Repositório

```bash
# 1. Executar apenas os testes unitários (execução ultrarrápida, < 1s)
npm --prefix backend run test:unit

# 2. Executar testes unitários com relatório de cobertura de código
npm --prefix backend run test:unit:coverage

# 3. Executar suíte completa de testes de integração e conformidade REST
npm --prefix backend test

# 4. Executar todos os testes do projeto (Unitários + Integração + Sistema)
npm --prefix backend run test:all
```

---

## Resumo das Métricas Atingidas

- **Total de Testes Automatizados:** **88 testes** (30 unitários + 58 integração/sistema)
- **Taxa de Sucesso:** **100% de aprovação** (0 falhas)
- **Cobertura de Código em Regras de Negócio e Schemas:** **97,03% de linhas** (exigência mínima: 70%)
- **Defeitos Registrados e Corrigidos:** **5 defeitos** (100% saneados)
- **Pipeline de Integração Contínua (CI):** Ativo via GitHub Actions em [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml)

