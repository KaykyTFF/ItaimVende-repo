# Daily Scrums, Impedimentos e Burndown — Sprint 1

**Periodo da Sprint 1:** 29/10/2026 a 03/11/2026  
**Scrum Master:** Josimar  
**Canal de Comunicacao:** Grupo da equipe no WhatsApp (acompanhamento assincrono por listas de tarefas) e encontros presenciais nos dias de aula no IFPI Campus Paulistana  
**Dinamica Operacional:** Compartilhamento diario do progresso no WhatsApp por meio de listas de afazeres e reunioes no laboratorio do campus para discutir adicoes, procurar bugs e pensar na evolucao da plataforma  
**Rastreabilidade Tecnica:** Todos os relatos diarios estao fundamentados nos registros de commits do repositorio Git.  

---

## 1. Registros das Reunioes Diarias (Daily Scrum)

### Registro 1 — 29/10/2026 (Quarta-feira)

| Integrante | O que fiz desde a ultima Daily | O que farei ate a proxima Daily | Impedimento identificado |
| :--- | :--- | :--- | :--- |
| **Raili** | Implementei o tema escuro global, iniciei a reestruturacao do menu lateral e fiz correcoes de contraste visual. *(Commit: `91f7b86`)* | Mapear telas com textos de baixo contraste e padronizar botoes de login. | Arquivos CSS legados continham estilizacoes sobrepostas dificeis de isolar. |
| **Josimar** | Configurei animacoes de transicao de tela e estruturei o formulario de publicacao de anuncios em etapas. *(Commit: `706dd01`)* | Integrar envio do formulario com a API e planejar os cards com efeito shimmer de carregamento. | Nenhum impedimento. |
| **Kayky** | Refatorei o CSS de temas centralizando regras essenciais; implementei suporte a multiplos enderecos e liberei navegacao publica do catalogo para visitantes. *(Commits: `bfde56e`, `8889b22`, `c81e193`)* | Conectar servidor WebSocket para mensagens instantaneas e estruturar autenticacao segura JWT. | Nenhum impedimento. |
| **Pedro Ravy** | Modelei as queries iniciais no Prisma ORM para filtros de localizacao no catalogo regional. | Conectar rotas com cidades vizinhas do Vale do Itaim e desenhar a tabela de avaliacoes. | Nenhum impedimento. |
| **Giselly** | Iniciei o levantamento das telas de autenticacao e navegacao para padronizar botoes e modais. | Implementar modal interativo de login para acoes restritas e botao Entrar no cabecalho. | Nenhum impedimento. |

---

### Registro 2 — 30/10/2026 (Quinta-feira)

| Integrante | O que fiz desde a ultima Daily | O que farei ate a proxima Daily | Impedimento identificado |
| :--- | :--- | :--- | :--- |
| **Giselly** | Implementei modal de login para visitantes *(Commits: `9572216`, `77c872b`)*; adicionei botao Entrar no cabecalho *(Commit: `7923cbf`)*; padronizei botao Vender com `scrollbar-gutter` *(Commit: `1325fb6`)*; reposicionei tags de categoria e condicao *(Commit: `5e5a4f2`)*; ajustei botoes de denuncia *(Commits: `bfab504`, `abc7318`)*; adicionei denuncia no perfil *(Commit: `f5c5db3`)*. | Padronizar menus dropdown em todo o site e implementar a barra lateral de filtros avancados. | A barra de rolagem causava deslocamento horizontal na tela ao abrir janelas *(Solucionado com `scrollbar-gutter: stable`)*. |
| **Pedro Ravy** | Implementei filtro avancado por cidades e bairros do Vale do Itaim no Prisma e criei estrutura de avaliacoes de vendedores com limite de uma avaliacao por comprador. *(Commits: `60d3359`, `77a4290`, `88b8d40`, `c0b6e1e`)* | Modelar integridade financeira no checkout de pedidos. | Nenhum impedimento. |
| **Kayky** | Conclui a camada de cadastro de usuarios com hash Bcrypt e emissao de JWT; refatorei os arquivos JavaScript separando regras de negocio e rotas. *(Commits: `7230a8f`, `2f3b4f5`, `044ab9d`, `00910f7`, `1c32a34`)* | Padronizar rotas Express e conectar eventos do chat com WebSocket. | Bloqueio de CORS ao consumir a API a partir da aplicacao web local *(Registrado como Impedimento 1)*. |
| **Josimar** | Ajustei as transicoes de tela e auxiliei na revisao dos formularios de login e cadastro. | Simplificar sincronizacao das etapas e fotos no cadastro de produtos. | Nenhum impedimento. |
| **Raili** | Apliquei correcoes de contraste no modo escuro nos novos modais criados pela equipe. | Substituir o emoji de engrenagem por icone SVG no menu lateral. | Nenhum impedimento. |

---

### Registro 3 — 31/10 e 01/11/2026 (Sexta e Sabado)

| Integrante | O que fiz desde a ultima Daily | O que farei ate a proxima Daily | Impedimento identificado |
| :--- | :--- | :--- | :--- |
| **Josimar** | Simplifiquei o fluxo de criacao de anuncios, corrigindo sincronizacao de etapas e preview de fotos. *(Commit: `b28683d`)* | Implementar a padronizacao do Skeleton Loading em todo o marketplace. | Nenhum impedimento. |
| **Giselly** | Padronizei os menus suspensos com estilo visual unico *(Commit: `ddb1ef1`)*; inseri barra de filtros e botoes de login rapido *(Commit: `dd5f3b0`)*; refatorei tela de denuncias *(Commit: `9d10cc8`)*; e atualizei icone de avaliacao *(Commit: `6a01c6a`)*. | Redesenhar os baloes de propostas financeiras no chat para manter simetria entre as partes. | Nenhum impedimento. |
| **Kayky** | Padronizei rotas REST da aplicacao; ativei comunicacao bidirecional assincrona no chat via Socket.IO; e tratei excecoes de fotos apagadas. *(Commits: `c4a922c`, `a23bd60`, `0381915`, `2cf3299`)* | Desenvolver endpoints de recuperacao de senha por e-mail e reforcar controle de rotas privadas. | Nenhum impedimento. |
| **Pedro Ravy** | Finalizei a validacao financeira no servidor em `POST /orders`, recalculando valores no banco. | Documentar schemas de pedidos no OpenAPI e preparar colecao Postman. | Nenhum impedimento. |
| **Raili** | Ajustei o icone de configuracoes da barra lateral e revisei o contraste das janelas de conversa no modo escuro. | Validar persistencia do token JWT na sessao do navegador. | Nenhum impedimento. |

---

### Registro 4 — 02/11 e 03/11/2026 (Domingo e Segunda-feira)

| Integrante | O que fiz desde a ultima Daily | O que farei ate a proxima Daily | Impedimento identificado |
| :--- | :--- | :--- | :--- |
| **Josimar** | Implementei a padronizacao do Skeleton Loading em todas as listagens do site e corrigi bug onde o nome do avaliador ficava ilegivel no tema escuro. *(Commits: `14ba64a`, `5e59cdc`)* | Consolidar dados e metricas da sprint para conduzir a Review e a Retrospectiva. | O texto do avaliador nao utilizava as variaveis de cor do tema escuro *(Corrigido no CSS)*. |
| **Kayky** | Implementei fluxo de recuperacao de senha por e-mail com codigo OTP; corrigi seguranca em rotas; e ajustei configuracoes de rede para funcionamento fora do campus. *(Commits: `39bbdb5`, `c170c74`, `f9721d0`, `5ceeb9a`)* | Validar criterios da Definition of Done e conduzir a sessao de Sprint Review com a equipe. | Nenhum impedimento. |
| **Raili** | Defini o modo claro como padrao visual inicial da plataforma e ajustei as cores dos botoes de login sob o modo escuro. *(Commit: `7fef6a3`)* | Conduzir testes manuais exploratorios integrados em todos os navegadores. | Nenhum impedimento. |
| **Pedro Ravy** | Conclui testes de integracao das rotas de pedidos, catalogo de categorias e autenticacao de sessao. | Apoiar o PO na demonstracao tecnica ao vivo via Swagger UI e Postman. | Nenhum impedimento. |
| **Giselly** | Validei a usabilidade dos modais de login, caixas de selecao e botoes de denuncia em telas de celular. | Estruturar a dinamica da Retrospectiva da Sprint 1 e tabular as melhorias propostas. | Nenhum impedimento. |

---

## 2. Registro e Tratamento de Impedimentos

Conforme os problemas iam aparecendo no dia a dia, o Josimar registrava e nos ajudavamos a resolver diretamente no laboratorio ou pelo grupo do WhatsApp:

| # | Descricao do Impedimento | Impacto no Projeto | Acao de Resolucao e Commit | Responsavel pelo Apoio | Data de Resolucao |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **1** | Bloqueio de CORS ao consumir a API localmente pelo frontend | Impedia chamadas HTTP assincronas | Configuracao do middleware `cors()` no Express com whitelist de origens (`c4a922c`) | Kayky | 30/10/2026 |
| **2** | Deslocamento horizontal provocado pela barra de rolagem | Trepidacao visual ao abrir certas telas | Aplicacao da regra CSS `scrollbar-gutter: stable` no seletor `:root` (`1325fb6`) | Giselly | 30/10/2026 |
| **3** | Inconsistencia na leitura do nome do avaliador no modo escuro | Dificultava a identificacao de quem avaliou | Vinculacao de variavel semantica de contraste no tema escuro (`5e59cdc`) | Josimar | 02/11/2026 |
| **4** | Falha de comunicacao de rede ao executar fora da rede do campus | Backend recusava conexoes externas | Ajuste de bind de endereco IP e variaveis de ambiente de rede (`5ceeb9a`) | Kayky | 03/11/2026 |

---

## 3. Burndown da Sprint 1

* **Meta inicial planejada:** 24 pontos de trabalho  
* **Periodo:** 29/10/2026 a 03/11/2026 (6 dias de sprint)  

| Dia da Sprint | Dia 1 (29/10) | Dia 2 (30/10) | Dia 3 (31/10) | Dia 4 (01/11) | Dia 5 (02/11) | Dia 6 (03/11) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Linha Ideal (Pontos)** | 24.0 | 19.2 | 14.4 | 9.6 | 4.8 | 0.0 |
| **Pontos Restantes Reais** | 24 | 18 | 11 | 7 | 2 | 0 |

Concluimos todos os **24 pontos planejados** no prazo estimado, e na nossa Sprint Review de 03/11/2026 revisamos e validamos cada entrega junto com o PO.
