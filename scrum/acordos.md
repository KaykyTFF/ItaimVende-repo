# 📋 Acordos de Trabalho, Papéis, Visão do Produto e Definition of Done (DoD)

> **Instituto Federal do Piauí (IFPI) — Campus Paulistana**  
> **Disciplina:** Engenharia de Software III  
> **Professor:** Prof. Me. Julian Rodrigues Valério  
> **Projeto:** Itaim Vende — API RESTful Própria de Comércio Regional  
> **Data de Criação:** 19/10/2026 (Sprint 0)  

---

## 👥 1. Identificação da Equipe e Papéis

| Integrante | Papel Principal | Foco Técnico Primário | Papel Scrum Sprint 1 | Papel Scrum Sprint 2 |
| :--- | :--- | :--- | :--- | :--- |
| **Kayky** | Líder da Equipe | **Backend Developer** | **Product Owner (PO)** | **Product Owner (PO)** |
| **Pedro Ravy** | Desenvolvedor | **Backend Developer** | Developer | Developer |
| **Josimar** | Desenvolvedor | **Frontend Developer** | **Scrum Master (SM)** | Developer |
| **Raili** | Desenvolvedora | **Frontend Developer** | Developer | Developer |
| **Giselly** | Desenvolvedora | **Frontend Developer** | Developer | **Scrum Master (SM)** |

* **Stakeholder Oficial:** Prof. Me. Julian Rodrigues Valério (valida requisitos, direciona visão de negócio e avalia os incrementos nas Reviews).
* **Regra de Alternância do Scrum Master:** Em conformidade com o guia da disciplina, o Product Owner (Kayky) permaneceu o mesmo ao longo de todo o ciclo para preservar a visão do produto, enquanto o papel de Scrum Master foi alternado entre Josimar (Sprint 1) e Giselly (Sprint 2).
* **Visão Coletiva de Qualidade:** Todos os integrantes atuam como Developers multidisciplinares. Não existe a figura isolada de "testador"; a garantia de testes automatizados e critérios de aceitação é de responsabilidade coletiva.

---

## 🎯 2. Product Goal (Visão do Produto)

> **Nossa API ajuda** pequenos produtores rurais, artesãos, comerciantes, prestadores de serviços e a comunidade de Paulistana e demais municípios do Vale do Itaim **a** negociar, anunciar, comprar e vender produtos e serviços regionais com segurança, velocidade e autonomia digital, **porque** centraliza a economia local em um ecossistema próprio que elimina intermediários abusivos, oferece busca tolerante a variações ortográficas, chat em tempo real com proposta de preços e verificação de vendedores.  
>  
> **Diferente de** plataformas nacionais genéricas como OLX e Mercado Livre, **a nossa API e plataforma** é moldada especificamente para as particularidades logísticas, linguísticas e geográficas do semiárido piauiense, suportando busca fonética sem acentos (`unaccent`), segmentação precisa por municípios e bairros vizinhos, integridade de preços travada no servidor, regras comunitárias de moderação com purga de arquivos em nuvem e sistema de segurança com cooldown de 30 dias para alteração de nome de usuário.

---

## ✅ 3. Definition of Done (DoD) — Critério de "Pronto"

Uma história de usuário do Product Backlog ou Sprint Backlog só é considerada **"Pronta" (Done)** quando atende cumulativamente a **todos** os seguintes requisitos:

- [x] **Revisão por Pares (Pull Request):** O código foi integrado por Pull Request revisado e aprovado formalmente por outro integrante da equipe, sem merges diretos na branch principal (`main`).
- [x] **Testes Automatizados Verificados:** Os testes automatizados da história foram escritos, executados localmente e passam integralmente (suíte com 23 testes passando sem falhas).
- [x] **Critérios de Aceitação Validados:** Todos os cenários em formato *Dado / Quando / Então* foram verificados e validados em conjunto com o Product Owner.
- [x] **Especificação OpenAPI Atualizada:** O endpoint, seus parâmetros, schemas de entrada e todas as respostas (sucesso e erros) estão documentados no OpenAPI 3.0.3 (`/api-docs`).
- [x] **Coleção Postman Funcional:** A coleção oficial (`itaim-vende.postman_collection.json`) contém a requisição de sucesso e ao menos um exemplo de erro tratado (ex: `400`, `401`, `403`, `404` ou `409`).
- [x] **Segurança e Higiene de Repositório:** Nenhum segredo, chave de API privada, token JWT estático ou senha foi commitado no repositório (uso estrito de `.env` e `.gitignore`).
- [x] **Execução Conforme README:** A API continua subindo e rodando perfeitamente a partir das instruções descritas no `README.md`.
- [x] **Item da Equipe 1 — Validação e Erros Padronizados:** Toda entrada de dados deve possuir schema Zod correspondente e retornar respostas de erro no formato padronizado com `code`, `message` e `details`.
- [x] **Item da Equipe 2 — Integração Completa Frontend-Backend:** As telas do frontend devem consumir os endpoints reais da API sem disparar exceções no console do navegador, tratando estados de carregamento, erros e sucesso.
- [x] **Item da Equipe 3 — Limpeza e Integridade de Mídia em Nuvem:** Operações de exclusão ou moderação de anúncios devem obrigatoriamente acionar a purga automatizada de arquivos no bucket do Supabase Storage para evitar custos e arquivos órfãos.

---

## 🤝 4. Acordos de Trabalho (Working Agreements)

Os acordos abaixo foram decididos democraticamente na Sprint 0 e vigoram durante todo o projeto:

1. **Horário e Canal das Dailies:**  
   * As reuniões diárias (Daily Scrum) ocorrem de forma assíncrona às **19h30** no canal `#daily-scrum` do Discord e grupo do WhatsApp, com consolidação presencial de 15 minutos no laboratório de informática do IFPI nos dias de aula presencial.
   * Todos os membros devem responder obrigatoriamente às três perguntas: *O que fiz desde a última daily? O que farei até a próxima? Existe algum impedimento travando meu progresso?*

2. **Fluxo de Branches e Revisão de Pull Requests:**  
   * É terminantemente proibido commitar diretamente na branch `main`.
   * Branches de funcionalidade devem seguir o padrão `feat/H<numero>-descricao` ou `fix/descricao`.
   * Todo Pull Request deve ser revisado por pelo menos um colega com foco na área oposta (ex: Backend revisa Frontend e vice-versa) para garantir conhecimento compartilhado.

3. **Regra de Escalação de Impedimentos (Regra das 4 Horas):**  
   * Caso algum membro fique bloqueado por mais de 4 horas em um problema técnico (banco de dados, integração de rotas, CORS, etc.), deve sinalizar o Scrum Master imediatamente.
   * O Scrum Master tem a obrigação de organizar uma sessão de pareamento (*Pair Programming*) entre o membro travado e o especialista da área em até 12 horas.

4. **Commits Rastreáveis e Semânticos:**  
   * Mensagens de commit devem citar o ID da história correspondente para garantir rastreabilidade, por exemplo:  
     `feat(auth): implementar cooldown de 30 dias para alteracao de username (#H13)`  
     `test(products): adicionar teste de busca unaccent sem acentuacao (#H4)`

5. **Responsabilidade Coletiva sobre Testes:**  
   * Nenhuma história é marcada como "Em Revisão" sem que o teste automatizado correspondente tenha sido criado e validado no ambiente local.

