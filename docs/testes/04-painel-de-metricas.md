# Painel de Métricas e Ações de Controle — Fase 4

**Projeto:** Itaim Vende (API RESTful de Comércio Regional)  
**Disciplina:** Engenharia de Software  
**Docente:** Prof. Me. Julian Rodrigues Valério  
**Documento de Engenharia de Testes:** Fase 4 — Monitoramento e Controle da Qualidade  
**Período de Monitoramento:** Sprint 1 a Sprint 2 (Novembro / 2026)  

---

## 1. Painel Comparativo de Métricas de Teste em Dois Pontos no Tempo

Conforme exigido pelas boas práticas do processo de testes, as medições foram coletadas em dois momentos distintos:
- **Tempo 1 (T1 — Meio da Execução / Sprint 1):** Apuração intermediária após a implementação dos primeiros endpoints da API e testes preliminares.
- **Tempo 2 (T2 — Fim da Execução / Sprint 2):** Apuração final após a introdução da suíte unitária, correção de defeitos e validação de regressão.

| Métrica de Qualidade | Tempo 1 (Meio da Execução) | Tempo 2 (Fim da Execução) | Variação / Meta Atingida |
| :--- | :---: | :---: | :---: |
| **Casos de Teste Projetados** | 20 | 20 | Meta de 20 casos cumprida |
| **Casos de Teste Executados** | 12 (60,0%) | 20 (100,0%) | +40,0% (100% executados) |
| **Casos de Teste Aprovados** | 9 (75,0%) | 20 (100,0%) | +25,0% (Zero falhas residuais) |
| **Casos de Teste Reprovados** | 3 (25,0%) | 0 (0,0%) | -25,0% (Todos corrigidos e validados) |
| **Total de Testes Automatizados no Repo** | 23 testes | 88 testes | +282,6% (Ampliação maciça da suíte) |
| **Cobertura de Código (Regras e Schemas)** | 38,57% | 97,03% | +58,46% (Superou a meta mínima de 70%) |
| **Defeitos Críticos (Abertos / Corrigidos)** | 1 / 0 | 0 / 1 | 100% dos críticos saneados |
| **Defeitos Altos (Abertos / Corrigidos)** | 1 / 0 | 0 / 1 | 100% dos altos saneados |
| **Defeitos Médios (Abertos / Corrigidos)** | 2 / 1 | 0 / 2 | 100% dos médios saneados |
| **Defeitos Baixos (Abertos / Corrigidos)** | 1 / 0 | 0 / 1 | 100% dos baixos saneados |
| **Total de Defeitos Abertos Ativos** | 4 defeitos | **0 defeitos** | **Zero defeitos pendentes** |

---

## 2. Gráfico Textual da Distribuição de Defeitos por Severidade

```text
DISTRIBUIÇÃO DE DEFEITOS IDENTIFICADOS NO PROJETO:
==================================================
Crítica  [■] 1 defeito  (BUG-05: Integridade financeira em orders)
Alta     [■] 1 defeito  (BUG-01: Cooldown indevido de username)
Média    [■■] 2 defeitos (BUG-02: Miniaturas de foto / BUG-03: Header Cache)
Baixa    [■] 1 defeito  (BUG-04: Status code em favoritos)
--------------------------------------------------
Total: 5 defeitos (100% corrigidos e retestados)
```

---

## 3. Registro Formal das Ações de Controle Tomadas

Durante o acompanhamento das métricas no Tempo 1, foram identificados desvios relevantes que exigiram intervenções da equipe de engenharia:

### Ação de Controle 1: Elevação da Cobertura de Código e Criação da Camada Unitária
- **Desvio Identificado em T1:** A cobertura de código reportada pela ferramenta nativa era de apenas 38,57%, pois os testes rodavam exclusivamente via `fetch` contra o servidor HTTP em background, impedindo a instrumentação dos arquivos de regra de negócio.
- **Ação Executada:** Desenvolvida uma suíte especializada de testes unitários em memória (`backend/tests/unit/schemas.test.js` e `backend/tests/unit/formatters-and-rules.test.js`). Essa suíte importa e testa diretamente os schemas Zod, formatadores DTO, geração de slugs e cálculos financeiros.
- **Resultado em T2:** A cobertura de código nas regras de negócio e validações saltou para **97,03% de linhas**, cumprindo com ampla folga o requisito mínimo de 70%.

### Ação de Controle 2: Refatoração da Regra de Cooldown de Username (BUG-01)
- **Desvio Identificado em T1:** A tentativa de salvar apenas a biografia do usuário no frontend disparava erro `403 Forbidden` devido à verificação antecipada do campo `username`.
- **Ação Executada:** Refatoração no serviço `auth.profile.service.js`, garantindo que se o novo username for idêntico ao já existente, a trava de data é ignorada.
- **Resultado em T2:** A história H13 foi aprovada com 9 testes automatizados passando e zero bloqueios indevidos no frontend.

### Ação de Controle 3: Implantação do Pipeline de CI no GitHub Actions
- **Desvio Identificado em T1:** A execução dos testes dependia de inicialização manual e conectividade local com o banco de dados.
- **Ação Executada:** Criação do arquivo `.github/workflows/ci.yml`, provisionando um container PostgreSQL 15 dedicado na nuvem do GitHub Actions com migrações automáticas do Prisma.
- **Resultado em T2:** Pipeline automatizado rodando a cada push e pull request com status verde permanente.

