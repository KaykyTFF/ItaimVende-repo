# Daily Scrums, Impedimentos e Burndown — Sprint 2

**Periodo da Sprint 2:** 04/11/2026 a 08/11/2026  
**Scrum Master:** Giselly *(alternancia com Josimar)*  
**Canal de Comunicacao:** Grupo da equipe no WhatsApp (acompanhamento assincrono por listas de tarefas) e reunioes presenciais nos dias de aula no IFPI Campus Paulistana  
**Dinamica Operacional:** Acompanhamento diario de tarefas e testes pelo WhatsApp, com encontros presenciais em aula para caca a bugs, testes de usabilidade e definicao de novas funcionalidades  
**Rastreabilidade Tecnica:** Todos os relatos diarios estao vinculados aos commits correspondentes no repositorio Git.  

---

## 1. Registros das Reunioes Diarias (Daily Scrum)

### Registro 1 — 04/11 e 05/11/2026 (Quarta e Quinta-feira)

| Integrante | O que fiz desde a ultima Daily | O que farei ate a proxima Daily | Impedimento identificado |
| :--- | :--- | :--- | :--- |
| **Kayky** | Corrigi falha critica de sessao onde respostas 403 deslogavam indevidamente o usuario *(Commit: `4dbc041`)*; finalizei login Google *(Commit: `5c61d0a`)*; padronizei fundo do perfil *(Commit: `4fea830`)*; refatorei enderecos em configuracoes com validacao de CEP *(Commits: `9d3fe01`, `bd21120`)*. | Modelar no PostgreSQL e na camada de servico a regra de cooldown de 30 dias para alteracao de username. | O processo do Prisma Client no Windows bloqueou o arquivo binario DLL em execucao pelo nodemon *(Registrado como Impedimento 1)*. |
| **Pedro Ravy** | Inseri o campo Biografia no perfil; padronizei botoes de acao de Meus Anuncios com cores solidas; e ajustei tipografia mobile para conter zoom involuntario. *(Commit: `2ad9c94`)* | Implementar o travamento de scroll do fundo durante a edicao e recorte de imagens de anuncios. | Nenhum impedimento. |
| **Giselly** | Redesenhei a tela 404 com o mascote tatu e mapa regional *(Commit: `aa35766`)*; removi tempo de resposta no perfil do vendedor *(Commit: `5ca640d`)*; reajustei espacamento do menu *(Commit: `2cbfa61`)*; inseri icone oficial do WhatsApp *(Commits: `6bc0921`, `9c3d88e`)*; adicionei slider de preco *(Commit: `9a3d0a9`)*; redesenhei propostas no chat *(Commits: `d45047b`, `58ab4ff`, `e686b50`)*. | Implementar validacao em tempo real com debounce de 400ms no formulario de conta (MELH-1). | Nenhum impedimento. |
| **Josimar** | Iniciei a arquitetura da Central de Tickets para suporte e moderacao e estruturei as 19 categorias do catalogo. | Implementar a interface `tickets.html` e conectar o carregamento das ocorrencias. | Nenhum impedimento. |
| **Raili** | Removi detalhes neon residuais dos botoes *(Commit: `baa77fd`)* e iniciei analise do ciclo de vida do tema escuro no armazenamento local (`localStorage`). | Eliminar o flash claro de 1 segundo (FOUC) ao atualizar telas no modo escuro. | Algumas classes de estilizacao do chat aplicavam cores fixas conflitantes com o dark mode. |

---

### Registro 2 — 06/11 e 07/11/2026 (Sexta-feira e Sabado)

| Integrante | O que fiz desde a ultima Daily | O que farei ate a proxima Daily | Impedimento identificado |
| :--- | :--- | :--- | :--- |
| **Josimar** | Conclui a Central de Tickets de Moderacao (`tickets.html`), inseri 19 categorias na navegacao e ajustei o cabecalho mobile. *(Commit: `249565a`)* | Corrigir a inicializacao assincrona da lista de tickets para evitar dependencia de clique manual. | A listagem de denuncias apresentava carregamento infinito ao abrir a tela diretamente *(Registrado como Impedimento 3)*. |
| **Kayky** | Removi o anuncio fixo de controle remoto, ativando recomendacoes dinamicas da regiao *(Commit: `a569122`)*; restabeleci a listagem de favoritos e corrigi bloqueio de acesso anonimo *(Commits: `7b19535`, `c8670c3`)*. | Desbloquear o executavel do Prisma e finalizar a regra de negocio do cooldown de 30 dias com suite de testes automatizados. | Nenhum impedimento. |
| **Raili** | Solucionei o efeito FOUC no tema escuro inserindo script sincrono de verificacao no `<head>` do HTML antes do render inicial do DOM. *(Commit: `c2a5114`)* | Testar a persistencia do tema em multiplos navegadores e validar contraste semantico do chat. | Nenhum impedimento. |
| **Pedro Ravy** | Habilitei a extensao `unaccent` no PostgreSQL para busca fonetica e iniciei testes de manipulacao de imagens no mobile. | Aplicar trava de rolagem do body ao abrir o modal de recorte de fotos. | O evento de pinça na tela touch acionava a rolagem de fundo involuntariamente *(Registrado como Impedimento 5)*. |
| **Giselly** | Implementei temporizador de debounce de 400ms no campo de username nas configuracoes de conta (MELH-1). | Adicionar indicacao visual clara contendo a data exata de liberacao do `@` quando o usuario estiver em cooldown. | Aguardando integracao da rota de perfil com os campos de data de auditoria. |

---

### Registro 3 — 08/11/2026 (Domingo)

| Integrante | O que fiz desde a ultima Daily | O que farei ate a proxima Daily | Impedimento identificado |
| :--- | :--- | :--- | :--- |
| **Pedro Ravy** | Apliquei `overflow: hidden` no body durante recorte de fotos e habilitei zoom de pinça responsivo no upload de anuncios. *(Commit: `73ba8a7`)* | Apoiar na revisao da documentacao OpenAPI e atualizar a colecao Postman. | Nenhum impedimento. |
| **Kayky** | Solucionei o carregamento automatico assincrono na tela de tickets *(Commit: `1a0a030`)*; implementei a regra completa de Cooldown de 30 dias para username com persistencia relacional, bloqueio HTTP 403 e suite de 9 testes automatizados passando 100%. *(Commit: `5cb6f68`)* | Conduzir ensaio geral da demonstracao ao vivo para a Sprint Review final. | Nenhum impedimento. |
| **Josimar** | Homologuei a exibicao automatica de tickets de moderacao e removi atalhos administrativos da interface de usuarios comuns. | Auditar rotas estaticas para assegurar ausencia de erros 404 em fluxos convencionais. | Nenhum impedimento. |
| **Raili** | Conclui a harmonizacao cromatica das caixas de mensagem do chat no tema escuro e conferi a eliminacao do FOUC em todos os fluxos. | Participar dos testes cruzados finais com toda a equipe. | Nenhum impedimento. |
| **Giselly** | Conectei a resposta do backend ao componente visual de perfil: campo de `@` desabilitado exibindo mensagem contextual com data de desbloqueio quando sob cooldown ativo; elaborei as atas de Review e Retrospectiva da Sprint 2. | Consolidar a documentacao tecnica na pasta `/scrum`. | Nenhum impedimento. |

---

## 2. Registro e Tratamento de Impedimentos

Os impedimentos foram acompanhados e solucionados sob coordenacao da Scrum Master Giselly:

| # | Descricao do Impedimento | Impacto no Projeto | Acao de Resolucao e Commit | Responsavel pelo Apoio | Data de Resolucao |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **1** | Bloqueio de arquivo binario do Prisma Client no Windows (`EPERM`) | Impedia a geracao de tipos e schemas para a coluna de cooldown | Encerramento forcado de instancias ativas do Node e regeneracao do client via `npx prisma generate` | Kayky | 05/11/2026 |
| **2** | Deslogamento automatico indevido em `api-core.js` ao receber status 403 | Desconectava usuarios autenticados ao carregar notificacoes | Restricao do logout automatico exclusivamente para respostas HTTP 401 originadas da rota `/auth/me` (`4dbc041`) | Kayky | 05/11/2026 |
| **3** | Tela de tickets de moderacao travada em carregamento infinito | Moderador nao visualizava denuncias sem interagir com filtros | Correcao do gatilho de busca assincrona e ajuste de placeholders (`1a0a030`) | Kayky | 07/11/2026 |
| **4** | Flash claro de 1s (FOUC) ao navegar no tema escuro | Desconforto visual e inconsistencia de carregamento | Inclusao de script sincrono de resolucao de tema no `<head>` do documento (`c2a5114`) | Raili | 07/11/2026 |
| **5** | Rolagem de tela involuntaria durante ajuste de recorte de foto mobile | Dificultava o enquadramento de imagens em aparelhos celulares | Bloqueio de overflow no body e controle de eventos de toque (`73ba8a7`) | Pedro Ravy | 08/11/2026 |

---

## 3. Burndown da Sprint 2

* **Meta Inicial Planejada:** 28 pontos de trabalho  
* **Periodo:** 04/11/2026 a 08/11/2026 (5 dias corridos de sprint)  

| Dia da Sprint | Dia 1 (04/11) | Dia 2 (05/11) | Dia 3 (06/11) | Dia 4 (07/11) | Dia 5 (08/11) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Linha Ideal (Pontos)** | 28.0 | 21.0 | 14.0 | 7.0 | 0.0 |
| **Pontos Restantes Reais** | 28 | 19 | 11 | 6 | 0 |

A equipe concluiu com exito a totalidade dos **28 pontos planejados**, homologados na Sprint Review de encerramento em 08/11/2026.
