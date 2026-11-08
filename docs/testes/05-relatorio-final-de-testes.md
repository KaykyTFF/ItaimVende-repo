# Relatório Final de Testes de Software — Fase 5

**Projeto:** Itaim Vende (API RESTful de Comércio Regional)  
**Disciplina:** Engenharia de Software  
**Docente:** Prof. Me. Julian Rodrigues Valério  
**Documento de Engenharia de Testes:** Fase 5 — Encerramento e Parecer Conclusivo  
**Versão:** 2.0.0 | **Data de Conclusão:** 08/11/2026  

---

## 1. Verificação dos Critérios de Saída do Plano de Testes

| Critério de Saída Definido no Plano | Meta Estabelecida | Resultado Real Atingido | Situação |
| :--- | :---: | :---: | :---: |
| **Taxa de Aprovação dos Testes** | 100% de sucesso | 88 testes aprovados de 88 executados (100%) | **Atendido** |
| **Cobertura de Código em Regras** | Mínimo de 70% de linhas | 97,03% aferido via `--experimental-test-coverage` | **Atendido** |
| **Execução dos Casos de Teste Projetados** | 20 casos formais | 20 casos executados com registro de log | **Atendido** |
| **Resolução de Defeitos Críticos e Altos** | Zero abertos | 0 defeitos críticos ou altos pendentes (100% corrigidos) | **Atendido** |
| **Pipeline de Integração Contínua (CI)** | Automatizado a cada push | Arquivo `.github/workflows/ci.yml` ativo e integrado | **Atendido** |
| **Documentação Formal das Fases** | Fases 1 a 5 completas | Todos os 5 artefatos redigidos e versionados | **Atendido** |

---

## 2. Consolidação Geral dos Resultados

- **Total Geral de Testes Automatizados no Repositório:** **88 testes**
  - Testes Unitários de Regras de Negócio e Schemas: 30 testes (0 falhas)
  - Testes de Integração e Conformidade RESTful: 45 testes (0 falhas)
  - Testes de Sistema e Fluxos Completos: 13 testes (0 falhas)
- **Tempo Médio de Execução:**
  - Suíte Unitária: ~430 milissegundos
  - Suíte de Integração Completa: ~37 segundos
- **Defeitos Identificados e Tratados:** 5 defeitos (1 Crítico, 1 Alto, 2 Médios, 1 Baixo). Todos resolvidos, verificados com testes automatizados dedicados e fechados.
- **Conformidade com a Coleção Postman:** 45 requisições mapeadas com exemplos de sucesso (`200`, `201`, `204`) e casos de erro tratados (`400`, `401`, `403`, `404`, `409`).

---

## 3. Lições Aprendidas

1. **A Importância da Pirâmide de Testes Equilibrada:**
   No início do projeto, a equipe concentrou esforços quase exclusivamente em testes de integração com banco de dados ativo. Isso aumentava o tempo de execução e mascarava a cobertura real de código. A introdução de uma camada unitária focada em schemas Zod, formatadores e regras financeiras permitiu obter feedback em menos de meio segundo, elevando a cobertura de 38,57% para 97,03%.
2. **Injeção Deliberada de Falhas como Técnica de Qualidade:**
   A injeção dos defeitos deliberados (como suprimir o cabeçalho `Cache-Control` ou alterar o status code em favoritos) comprovou que a suíte automatizada era sensível e eficaz para capturar regressões reais antes que chegassem à homologação.
3. **Segurança Financeira Confinada ao Servidor:**
   O recálculo compulsório dos valores de pedidos diretamente a partir do catálogo do banco de dados eliminou a vulnerabilidade de adulteração client-side de preços, estabelecendo uma barreira de integridade indispensável para aplicações de comércio eletrônico.

---

## 4. Recomendações para Evoluções Futuras

1. **Testes de Desempenho e Carga com k6:**
   Embora os testes de segurança básica e integridade atendam integralmente às exigências da disciplina, recomenda-se configurar scripts k6 para simular 200 usuários concorrentes navegando no catálogo de produtos e enviando mensagens no chat WebSocket.
2. **Ampliação do Uso de Mocks no Backend:**
   Para os testes de integração que dependem de serviços de e-mail (Resend/Nodemailer) e armazenamento em nuvem (Supabase Storage), recomenda-se consolidar adaptadores em memória (*in-memory fakes*) para acelerar a execução do pipeline de CI em conexões lentas.

---

## 5. Parecer Conclusivo e Decisão de Liberação

Com base na verificação estrita dos critérios de saída, na taxa de **100% de aprovação dos 88 testes automatizados**, na cobertura de código de **97,03% de linhas** nos módulos de regras de negócio, no saneamento de todos os defeitos encontrados e na ativação do pipeline de Integração Contínua via GitHub Actions:

### **PARECER FINAL: APROVADO PARA LIBERAÇÃO E APRESENTAÇÃO.**

A API **Itaim Vende (v2.0.0)** atende a todos os requisitos de qualidade, confiabilidade, segurança e conformidade da atividade de **Processo de Testes de Software**, encontrando-se apta para demonstração acadêmica e implantação no ambiente de produção.

