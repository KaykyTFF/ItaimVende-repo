# Daily Scrums, Impedimentos e Burndown — Sprint 2

**Periodo da Sprint 2:** 04/11/2026 a 08/11/2026  
**Scrum Master:** Giselly (alternando papel com Josimar)  
**Canal de Comunicacao:** Grupo da equipe no WhatsApp (acompanhamento assincrono por listas de tarefas) e encontros presenciais nos dias de aula no IFPI Campus Paulistana  
**Dinamica Operacional:** Acompanhamento diario de tarefas e testes pelo WhatsApp, com encontros presenciais no laboratorio para cacar bugs, fazer testes juntos e definir novas melhorias  
**Rastreabilidade Tecnica:** Todos os relatos diarios estao vinculados aos commits correspondentes no repositorio Git.  

---

## 1. Registros das Reunioes Diarias (Daily Scrum)

### Registro 1 — 04/11 e 05/11/2026 (Quarta e Quinta-feira)

| Integrante | O que fiz desde a ultima Daily | O que farei ate a proxima Daily | Impedimento identificado |
| :--- | :--- | :--- | :--- |
| **Kayky** | Corrigi o problema de sessao em que respostas 403 deslogavam o usuario *(Commit: `4dbc041`)*; finalizei login com Google *(Commit: `5c61d0a`)*; padronizei o fundo neutro do perfil *(Commit: `4fea830`)*; refatorei os enderecos em configuracoes com validacao de CEP *(Commits: `9d3fe01`, `bd21120`)*. | Criar no PostgreSQL e no backend a regra de cooldown de 30 dias para mudar o username. | O processo do Prisma no Windows travou o arquivo DLL em uso pelo nodemon *(Registrado como Impedimento 1)*. |
| **Pedro Ravy** | Coloquei o campo Biografia no perfil; padronizei os botoes de acao de Meus Anuncios com cores solidas; ajustei tipografia mobile; e travei a rolagem de fundo ao abrir modal *(Commits: `2ad9c94`, `9849f71`, `9f8a4ca`)*. | Criar a aba de suporte e envio de tickets pelo menu de configuracoes do usuario. | Nenhum impedimento. |
| **Giselly** | Redesenhei a tela 404 com o tatu e o mapa de Paulistana *(Commit: `aa35766`)*; tirei o tempo de resposta no perfil do vendedor *(Commit: `5ca640d`)*; reajustei espacos do menu *(Commit: `2cbfa61`)*; inseri o icone oficial do WhatsApp *(Commits: `6bc0921`, `9c3d88e`)*; adicionei slider de preco *(Commit: `9a3d0a9`)*; redesenhei propostas no chat *(Commits: `d45047b`, `58ab4ff`, `e686b50`)*. | Implementar validacao em tempo real com debounce de 400ms no formulario de conta (MELH-1). | Nenhum impedimento. |
| **Josimar** | Estruturei o painel de tickets de moderacao, as 19 categorias na navegacao e o header mobile *(Commit: `249565a`)*. | Implementar a tela de login exclusiva da administracao e isolar a sessao de moderacao. | Nenhum impedimento. |
| **Raili** | Removi detalhes neon dos botoes de meus anuncios *(Commit: `25a9149`)*, ajustei categorias do filtro *(Commit: `59addff`)* e corrigi o modo escuro no botao editar *(Commit: `14816fa`)*. | Eliminar o flash claro na tela (FOUC) ao recarregar a pagina no modo escuro. | Algumas classes de estilizacao do chat aplicavam cores fixas conflitantes com o tema escuro. |

---

### Registro 2 — 06/11 e 07/11/2026 (Sexta-feira e Sabado)

| Integrante | O que fiz desde a ultima Daily | O que farei ate a proxima Daily | Impedimento identificado |
| :--- | :--- | :--- | :--- |
| **Pedro Ravy** | Implementei a aba 'Meus Tickets' nas configuracoes, permitindo abrir chamados de suporte persistidos no banco e ajustei fontes no modo escuro *(Commits: `675dd47`, `7387adf`, `86cafad`)*. | Mudar o formato de exibicao dos tickets de chat para cards no painel. | Nenhum impedimento. |
| **Josimar** | Criei a tela de login administrativa exclusiva para tickets e isolei a sessao de moderacao da loja publica *(Commits: `3e000a9`, `1b83bc9`)*. | Ajustar o carregamento assincrono das ocorrencias para nao depender de clique manual. | A listagem de denuncias ficava carregando infinitamente ao abrir a tela diretamente *(Registrado como Impedimento 3)*. |
| **Kayky** | Removi o anuncio fixo de teste de controle remoto, ativando anuncios reais da regiao *(Commit: `a569122`)*; restabeleci a listagem de favoritos e corrigi acesso anonimo *(Commits: `7b19535`, `c8670c3`)*. | Desbloquear o arquivo do Prisma e finalizar a regra do cooldown de 30 dias com suite de testes automatizados. | Nenhum impedimento. |
| **Raili** | Resolvi o efeito de tela piscando no tema escuro (FOUC) colocando um script sincrono no cabecalho do HTML antes da renderizacao *(Commit: `c2a5114`)* e atualizei estilizacoes da tela vender *(Commits: `777f704`, `672064a`)*. | Testar a persistencia do tema em varios navegadores e validar o contraste do chat. | Nenhum impedimento. |
| **Giselly** | Coloquei o temporizador de debounce de 400ms no campo de username nas configuracoes de conta (MELH-1). | Adicionar aviso visual com a data exata em que o @ sera liberado caso o usuario esteja em cooldown. | Esperando a conexao da rota de perfil com os campos de data do banco. |

---

### Registro 3 — 08/11/2026 (Domingo)

| Integrante | O que fiz desde a ultima Daily | O que farei ate a proxima Daily | Impedimento identificado |
| :--- | :--- | :--- | :--- |
| **Pedro Ravy** | Mudei a visualizacao dos tickets para cards, adicionei suporte a anexos, criei modais de confirmacao em meus anuncios e retirei o selo de anuncio verificado *(Commits: `8b66c06`, `5c149a9`, `2f2f301`, `18f445c`)*. | Apoiar na revisao final dos endpoints e testes da API. | Nenhum impedimento. |
| **Kayky** | Resolvi o carregamento automatico na tela de tickets *(Commit: `1a0a030`)*; implementei a regra completa de Cooldown de 30 dias para o username com bloqueio HTTP 403 e suite de 9 testes automatizados passando com 100% de sucesso *(Commit: `5cb6f68`)*; corrigi esteira do GitHub Actions *(Commits: `94521f9`, `baaa813`)*. | Conduzir a demonstracao ao vivo para a nossa Sprint Review final. | Nenhum impedimento. |
| **Josimar** | Adicionei visualizador de fotos em tela cheia no produto e fiz limpeza na tela Meus Anuncios *(Commit: `1e3c718`)*; removi card de negociacao segura no perfil *(Commit: `a80d75d`)*. | Auditar rotas estaticas para assegurar ausencia de erros 404 em fluxos convencionais. | Nenhum impedimento. |
| **Raili** | Conclui a harmonizacao cromatica das caixas de mensagem do chat, ajustei responsividade do cabecalho e padronizei avaliacoes do perfil com estrelas *(Commits: `dcefebf`, `2f964b0`, `7794429`, `119638a`, `9c3f523`)*. | Participar dos testes cruzados finais com toda a equipe. | Nenhum impedimento. |
| **Giselly** | Conectei a resposta da API na tela de perfil com aviso contextual de dias restantes de cooldown; finalizei os modais de notificacoes mobile *(Commits: `f1e5d16`, `4e8275c`, `e101ce1`, `0932c68`)*; elaborei as atas de Review e Retrospectiva da Sprint 2. | Consolidar a documentacao na pasta do Scrum. | Nenhum impedimento. |

---

## 2. Registro e Tratamento de Impedimentos

Conforme os problemas iam aparecendo, a Giselly anotava os impedimentos e nos ajudavamos a resolver diretamente no laboratorio ou pelo grupo do WhatsApp:

| # | Descricao do Impedimento | Impacto no Projeto | Acao de Resolucao e Commit | Responsavel pelo Apoio | Data de Resolucao |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **1** | Bloqueio de arquivo do Prisma Client no Windows | Impedia a geracao de tipos e schemas para a coluna de cooldown | Encerramento de processos ativos do Node e regeneracao do client com `npx prisma generate` | Kayky | 05/11/2026 |
| **2** | Deslogamento automatico indevido ao receber status 403 | Desconectava usuarios autenticados ao abrir notificacoes | Restricao do logout automatico apenas para respostas 401 vindas da rota `/auth/me` (`4dbc041`) | Kayky | 05/11/2026 |
| **3** | Tela de tickets de moderacao travada em carregamento infinito | Moderador nao conseguia ver as denuncias sem mexer nos filtros | Correcao do gatilho de busca assincrona e ajuste de placeholders (`1a0a030`) | Kayky | 07/11/2026 |
| **4** | Tela piscando em branco rapido ao navegar no tema escuro | Desconforto visual ao recarregar a pagina | Inclusao de script direto no `<head>` resolvendo o tema antes do DOM carregar (`c2a5114`) | Raili | 07/11/2026 |
| **5** | Rolagem da tela involuntaria ao cortar fotos no celular | Dificultava enquadrar fotos em telas touch | Bloqueio de overflow no body e controle de eventos de toque (`73ba8a7`) | Pedro Ravy | 08/11/2026 |

---

## 3. Burndown da Sprint 2

* **Meta inicial planejada:** 28 pontos de trabalho  
* **Periodo:** 04/11/2026 a 08/11/2026 (5 dias de sprint)  

| Dia da Sprint | Dia 1 (04/11) | Dia 2 (05/11) | Dia 3 (06/11) | Dia 4 (07/11) | Dia 5 (08/11) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Linha Ideal (Pontos)** | 28.0 | 21.0 | 14.0 | 7.0 | 0.0 |
| **Pontos Restantes Reais** | 28 | 19 | 11 | 6 | 0 |

Concluimos com sucesso todos os **28 pontos planejados** no prazo da sprint, e na nossa Sprint Review final em 08/11/2026 validamos cada entrega junto com o PO.
