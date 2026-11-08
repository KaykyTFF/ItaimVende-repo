# Acordos de Trabalho, Papeis, Visao do Produto e Definition of Done (DoD)

**Instituto Federal do Piauí (IFPI) — Campus Paulistana**  
**Disciplina:** Engenharia de Software III  
**Professor:** Me. Julian Rodrigues Valério  
**Projeto:** Itaim Vende — API RESTful Propria de Comercio Regional  
**Periodo de Planejamento (Sprint 0):** 27/10/2026 e 28/10/2026  

---

## 1. Identificacao da Equipe e Distribuicao de Papeis

Conforme as diretrizes metodologicas do Scrum estabelecidas para o projeto, todos os membros da equipe atuam como Desenvolvedores multidisciplinares. Em adicao, foram designadas as funcoes de Product Owner e Scrum Master, com alternancia formal do Scrum Master entre as sprints para distribuicao da experiencia de facilitacao.

| Integrante | Atuacao Tecnica Principal | Papel Scrum na Sprint 1 | Papel Scrum na Sprint 2 |
| :--- | :--- | :--- | :--- |
| **Kayky** | Lider Tecnico / Backend | **Product Owner (PO)** | **Product Owner (PO)** |
| **Pedro Ravy** | Backend Developer | Desenvolvedor | Desenvolvedor |
| **Josimar** | Frontend Developer | **Scrum Master (SM)** | Desenvolvedor |
| **Giselly** | Frontend Developer | Desenvolvedora | **Scrum Master (SM)** |
| **Raili** | Frontend Developer | Desenvolvedora | Desenvolvedora |

* **Stakeholder Oficial:** Prof. Me. Julian Rodrigues Valério (responsavel pela homologacao de requisitos de negocio, avaliacao de valor agregado e aprovacao dos incrementos durante as sessoes de Sprint Review).
* **Permanencia do Product Owner:** O integrante Kayky permaneceu no papel de PO em ambas as sprints a fim de assegurar a integridade da visao arquitetural, coerencia dos criterios de aceitacao e priorizacao estrita do Product Backlog.
* **Alternancia do Scrum Master:** O integrante Josimar atuou como Scrum Master na Sprint 1 (29/10 a 03/11), transferindo a funcao para a integrante Giselly na Sprint 2 (04/11 a 08/11), garantindo conformidade com a regra pedagogica da disciplina.
* **Responsabilidade Compartilhada por Qualidade:** A elaboracao e execucao de testes automatizados e responsabilidade de todos os desenvolvedores. Nao ha divisao isolada de testador na equipe.

---

## 2. Product Goal (Visao do Produto)

Em estrito atendimento ao modelo textual obrigatorio da disciplina:

> **Nossa API ajuda** pequenos produtores rurais, comerciantes locais, prestadores de servicos e moradores de Paulistana e dos municipios que compoem o Vale do Itaim **a** negociar, anunciar, comprar e vender produtos e servicos de maneira direta, confiavel e sem taxas intermediarias, **porque** disponibiliza uma plataforma digital regional com busca tolerante a variacoes ortograficas, chat em tempo real com negociacao de precos, politicas rigidas de seguranca cadastral e integridade financeira calculada no servidor.  
>  
> **Diferente de** plataformas genericas de escala nacional como OLX e Mercado Livre, **a nossa API e plataforma** e projetada para as condicoes socioeconomicas e linguisticas do semiárido piauiense, suportando busca fonetica sem acentos (`unaccent`), segmentacao geografica por bairros e municipios vizinhos, moderacao ativa de denuncias com purga de arquivos em nuvem e protecao contra fraudes via regra de restricao temporal (cooldown de 30 dias) para alteracao de nomes de usuario (`@`).

---

## 3. Definition of Done (DoD) — Criterios de Conclusao

Uma historia de usuario ou item de trabalho so e considerado formalmente "Pronto" (Done) e aceito no incremento da sprint caso atenda cumulativamente a todos os dez criterios abaixo:

1. **Integracao por Pull Request com Code Review:** Todo codigo-fonte deve ser submetido via Pull Request, revisado e aprovado por ao menos um colega da equipe antes do merge na branch `main`. Commits diretos na branch principal sao bloqueados.
2. **Suíte Automatizada de Testes sem Regressoes:** Todos os testes automatizados da historia (unitarios e de integracao) devem ser implementados, executados localmente e no pipeline de Integracao Continua (CI), finalizando com 100% de sucesso em toda a suite do projeto (88 testes automatizados).
3. **Validacao Formal de Criterios de Aceitacao:** Todos os cenarios descritos no formato *Dado / Quando / Entao* devem ser executados e homologados junto ao Product Owner.
4. **Atualizacao da Especificacao OpenAPI 3.0.3:** Endpoints, parametros de consulta, corpos de requisicao, schemas de entrada e codigos de resposta HTTP (sucesso e erros) devem estar documentados no Swagger UI (`/api-docs`) e no arquivo `docs/openapi.json`.
5. **Colecao de Testes de API Atualizada:** A colecao Postman (`itaim-vende.postman_collection.json`) deve conter as chamadas da historia organizadas por pasta, incluindo no minimo uma requisicao de sucesso (200/201/204) e ao menos um cenario de erro documentado (400, 401, 403, 404 ou 409).
6. **Higiene de Seguranca do Repositorio:** Nenhuma credencial privada, senha, chave de API de servicos externos (Supabase, Resend, JWT Secret) ou arquivo de ambiente local (`.env`) pode ser enviado ao controle de versao Git.
7. **Instrucoes de Execucao Operacionais:** A aplicacao deve iniciar, executar as migracoes e responder normalmente a partir das etapas descritas no arquivo `README.md`.
8. **Item da Equipe 1 — Validacao Rigorosa Zod e Formato Padronizado de Erro:** Toda entrada de dados de rotas POST, PUT ou PATCH deve ser validada por schemas Zod dedicados, retornando respostas de erro no padrao estruturado contendo os campos `code`, `message` e `details`.
9. **Item da Equipe 2 — Integracao Visual e Ausencia de Falhas no Console:** As telas do frontend que consom a funcionalidade devem tratar os estados de carregamento (Skeleton Shimmer), sucesso e excecoes sem emitir erros no console do navegador.
10. **Item da Equipe 3 — Integridade e Purga de Midia em Nuvem:** Operacoes de exclusao ou moderacao de anuncios contendo fotos devem compulsoriamente disparar a exclusao fisica do arquivo no bucket do Supabase Storage para evitar acumulacao de arquivos orfaos.

---

## 4. Acordos de Trabalho (Working Agreements)

Os acordos operacionais estabelecidos pela equipe durante a Sprint 0 possuem vigencia permanente ao longo de todo o ciclo de desenvolvimento:

1. **Canal de Comunicacao e Dinamica da Daily Scrum:**  
   - O alinhamento diario assincrono ocorre atraves do **grupo da equipe no WhatsApp**, adaptado a rotina academica dos integrantes (comunicacao ao longo do dia, respeitando o horario das aulas noturnas no campus).
   - A distribuicao de demandas e feita via listas de tarefas no WhatsApp: cada integrante acompanha seus afazeres e vai compartilhando continuamente o que esta desenvolvendo, o que ja concluiu e eventuais duvidas ou bloqueios.
   - Nos dias de aula presencial no IFPI Campus Paulistana, a equipe se reune fisicamente no laboratorio/sala para consolidar o status das tarefas, discutir novas funcionalidades a adicionar, realizar testes conjuntos a procura de bugs e planejar a evolucao da plataforma.

2. **Fluxo de Trabalho Git, Branches e Pull Requests:**  
   - Branches devem seguir o padrao semantico: `feat/H<id>-descricao`, `fix/<descricao>` ou `docs/<descricao>`.
   - Nenhum merge pode ser concluido sem a aprovacao de ao menos um revisor de area complementar (ex.: desenvolvedor de frontend revisa alteracoes de backend e vice-versa), garantindo disseminacao de conhecimento sobre o codebase.

3. **Politica de Escalacao de Impedimentos (Regra das 4 Horas):**  
   - Caso um membro da equipe permaneca impedido por mais de 4 horas de trabalho em um obstaculo tecnico (ex.: configuracao de banco de dados, falha de CORS, tipagem de schemas ou autenticacao), deve formalizar o bloqueio no canal da equipe.
   - O Scrum Master e responsavel por viabilizar imediatamente uma sessao de programacao em par (*Pair Programming*) com outro integrante capacitado para solucionar o problema em ate 12 horas.

4. **Padronizacao Semantica de Commits Rastreaveis:**  
   - Todo commit deve adotar a convencao Conventional Commits citando obrigatoriamente a historia correspondente no titulo ou corpo da mensagem (ex.: `feat(auth): implementar cooldown de 30 dias para alteracao de username (#H13)` ou `test(catalog): adicionar teste de busca unaccent sem acentuacao (#H5)`).

5. **Responsabilidade Coletiva por Qualidade e Nao Regressao:**  
   - E expressamente vedado mover uma historia para o status "Em Revisao" ou "Pronto" sem que a suite de testes automatizados associada aos criterios de aceitacao esteja escrita e executando com sucesso localmente.
