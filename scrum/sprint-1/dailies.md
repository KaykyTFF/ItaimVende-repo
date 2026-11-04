# ☀️ Daily Scrums e Burndown — Sprint 1 (Baseado nos Commits Reais)

> **Scrum Master:** Josimar  
> **Canal de Comunicação:** Discord (`#daily-scrum`) & WhatsApp  
> **Horário Regular:** 19h30  
> **Rastreabilidade Técnica:** Cada entrega diária está vinculada diretamente aos hashes de commit registrados no repositório Git do projeto.

---

## 📅 Registro 1 — 20/10/2026 (Segunda-feira)

### Raili (Frontend)
* **O que fiz:** Implementei o tema escuro global no marketplace, estruturei as melhorias na barra de navegação lateral e realizei as primeiras correções de contraste visual.  
  *(Git Commit: `91f7b86` — "feat: implementa tema escuro global, melhorias no menu lateral e correcoes visuais")*
* **O que farei:** Identificar páginas onde o texto ainda fica com baixo contraste e padronizar os botões de ação de login.
* **O que me impede:** Arquivos CSS continham mais de duas mil linhas com estilos sobrepostos.

### Josimar (Frontend / SM)
* **O que fiz:** Criei as animações de transição de tela e iniciei a estruturação do wizard de criação de anúncios dividido em etapas sequenciais.  
  *(Git Commit: `706dd01` — "feat: adicionar animacoes de transicao e criacao de anuncios em etapas")*
* **O que farei:** Integrar o envio de dados do wizard com a API e planejar os componentes de Skeleton Loading.
* **O que me impede:** Nenhum impedimento no momento.

### Kayky (Backend / PO)
* **O que fiz:** Refatorei o arquivo monolítico de temas centralizando regras essenciais; implementei o suporte a múltiplos endereços por usuário e permiti que visitantes não autenticados naveguem pelo catálogo sem quebras.  
  *(Git Commits: `bfde56e` — "refatorei o arquivo theme.css com mais de 2 mil linhas", `8889b22` — "funcionando adicionar mais de um endereço pro usuario", `c81e193` — "ajuste para usuarios não cadastrados poderem acessar o site")*
* **O que farei:** Conectar o servidor WebSocket para chat em tempo real e estruturar a autenticação segura com JWT.
* **O que me impede:** Nenhum impedimento.

### Pedro Ravy (Backend)
* **O que fiz:** Estruturei as queries iniciais no Prisma ORM para filtros de localização no catálogo regional do Vale do Itaim.
* **O que farei:** Conectar as rotas com busca por cidades vizinhas (Paulistana, Acauã, Betânia, Jacobina) e criar a tabela de avaliações.
* **O que me impede:** Nenhum impedimento.

### Giselly (Frontend)
* **O que fiz:** Iniciei o levantamento das telas de autenticação e navegação para padronizar botões e modais de login.
* **O que farei:** Desenvolver o pop-up de login para ações restritas e o botão Entrar no cabeçalho.
* **O que me impede:** Nenhum impedimento.

---

## 📅 Registro 2 — 21/10/2026 (Terça-feira)

### Giselly (Frontend)
* **O que fiz:** Concluí um grande pacote de melhorias visuais e usabilidade na Home, produto e perfil:
  * Implementei o pop-up de login/cadastro exibido quando visitantes tentam executar ações restritas. *(Git Commits: `9572216`, `77c872b` — "pop up adicionado", "ajuste pop up")*
  * Adicionei o botão "Entrar" no cabeçalho para usuários desconectados. *(Git Commit: `7923cbf` — "botao de entrar para quem nao esta cadastrado")*
  * Padronizei o botão "Vender" e corrigi o salto de tela com `scrollbar-gutter`. *(Git Commit: `1325fb6` — "ajuste no botão de vender e scrollbas")*
  * Reposicionei as tags de "categoria" e "condição" imediatamente acima da descrição do anúncio. *(Git Commit: `5e5a4f2` — "mudança de posição 'categoria' e 'condição'")*
  * Discretizei o botão Denunciar e removi a menção de ticket abaixo. *(Git Commits: `bfab504`, `abc7318` — "ajuste no botão denunciar", "remoçao do botao ticket")*
  * Adicionei o botão para denunciar vendedor diretamente pelo perfil. *(Git Commit: `f5c5db3` — "adicionado o botão de denunciar vendedor")*
  * Removi elementos desnecessários da barra lateral e ajustei botões da Home. *(Git Commits: `bf6e5a8`, `e7073d4` — "retirada de elementos da barra lateral", "ajuste nos botões da home")*
* **O que farei:** Padronizar todos os menus dropdown do site e criar a barra lateral de filtros avançados.
* **O que me impede:** O surgimento da barra de rolagem causava deslocamento horizontal indesejado no layout *(Resolvido com `scrollbar-gutter: stable`)*.

### Pedro Ravy (Backend)
* **O que fiz:** Implementei o filtro avançado por cidades e bairros do Vale do Itaim direto no Prisma e criei a estrutura de avaliações de vendedores com limite de uma avaliação por usuário.  
  *(Git Commits: `60d3359` — "feat(catalog): adicionar filtro avancado por cidades e bairros do Vale do Itaim", `77a4290` — "fix(home): tornar filtro de bairros dinamico", `88b8d40`, `c0b6e1e` — "Ajeitar o back para poder avaliar vendedores", "ajuste de detalhes na parte de avaliações")*
* **O que farei:** Modelar a integridade financeira no checkout de pedidos (`Order`).
* **O que me impede:** Nenhum impedimento.

### Kayky (Backend / PO)
* **O que fiz:** Concluí a nova camada de cadastro de usuários com hashing e autenticação funcional; refatorei os arquivos JavaScript que estavam com excesso de linhas, separando regras de domínio.  
  *(Git Commits: `7230a8f`, `2f3b4f5` — "cadastro funcionando com o novo cadastro", `044ab9d`, `00910f7`, `1c32a34` — "Ajustei os arquivos js pois estavam com muitas linhas", "refatoração do js")*
* **O que farei:** Padronizar as rotas do Express e conectar os eventos do chat com o WebSocket.
* **O que me impede:** Bloqueio de CORS ao tentar consumir a API pelo frontend local *(Registrado como Impedimento #1)*.

### Josimar (Frontend / SM)
* **O que fiz:** Ajustei as transições de tela e apoiei a equipe na revisão dos formulários de login e cadastro.
* **O que farei:** Simplificar a sincronização das etapas e fotos no cadastro de produtos.
* **O que me impede:** Nenhum impedimento.

### Raili (Frontend)
* **O que fiz:** Apliquei as correções de contraste no tema escuro sobre os novos cards criados pela Giselly e pelo Josimar.
* **O que farei:** Substituir o emoji de engrenagem por um ícone adequado na barra lateral.
* **O que me impede:** Nenhum impedimento.

---

## 📅 Registro 3 — 22/10 e 23/10/2026 (Quarta e Quinta-feira)

### Josimar (Frontend / SM)
* **O que fiz:** Simplifiquei o wizard de criação de anúncios, corrigindo a sincronização das etapas de preenchimento e o preview de fotos.  
  *(Git Commit: `b28683d` — "simplifica wizard de criacao de anuncio e corrige sincronizacao de etapas e fotos")*
* **O que farei:** Implementar a padronização do Skeleton Loading universal em todo o marketplace.
* **O que me impede:** Nenhum impedimento.

### Giselly (Frontend)
* **O que fiz:** Padronizei todos os menus dropdown do site com estilo único; adicionei a barra lateral de filtros avançados e os botões de login rápido; refatorei a interface de denúncias para um formato limpo e intuitivo; e atualizei o ícone de avaliações.  
  *(Git Commits: `ddb1ef1` — "dropdowns padronizados", `dd5f3b0` — "adicionado barra de filtros e icones para login", `9d10cc8` — "interface denuncia", `6a01c6a` — "icone de avaliação")*
* **O que farei:** Redesenhar os balões de propostas de valor no chat para manter simetria entre comprador e vendedor.
* **O que me impede:** Nenhum impedimento.

### Kayky (Backend / PO)
* **O que fiz:** Padronizei as rotas REST do backend; implementei a comunicação assíncrona do chat em tempo real via Socket.IO; e corrigi o tratamento de arquivos estáticos apagados.  
  *(Git Commits: `c4a922c` — "AJUSTEI UMAS ROTAS", `a23bd60` — "começando a fazer funcionar de forma assincrona o chat", `0381915` — "chat funcionando em tempo real", `2cf3299` — "corrigido problema de arquivos que ja foram apagados")*
* **O que farei:** Escrever endpoints de recuperação de senha e reforçar a segurança de rotas protegidas.
* **O que me impede:** Nenhum impedimento.

### Pedro Ravy (Backend)
* **O que fiz:** Finalizei o cálculo financeiro seguro em `POST /orders`, garantindo que o preço seja validado no banco de dados.
* **O que farei:** Integrar a coleção Postman e documentar os schemas no OpenAPI.
* **O que me impede:** Nenhum impedimento.

### Raili (Frontend)
* **O que fiz:** Ajustei o ícone de configurações da sidebar e revisei o contraste do chat e inputs de formulário no tema escuro.
* **O que farei:** Validar a persistência do token de sessão no `localStorage`.
* **O que me impede:** Nenhum impedimento.

---

## 📅 Registro 4 — 26/10 e 27/10/2026 (Segunda e Terça-feira)

### Josimar (Frontend / SM)
* **O que fiz:** Implementei a **padronização do Skeleton Loading** em todas as páginas do site e solucionei o bug onde o nome do avaliador ficava invisível no modo escuro.  
  *(Git Commits: `14ba64a` — "feat(ui): padronizar skeleton loading e corrigir modo escuro", `5e59cdc` — "fix(skeleton): corrigir animacao shimmer no modo escuro")*
* **O que farei:** Organizar os dados da Sprint 1 e preparar a facilitação da Review e Retrospectiva.
* **O que me impede:** O texto do avaliador não recebia a variável semântica de cor no dark theme *(Resolvido no CSS de avaliações)*.

### Kayky (Backend / PO)
* **O que fiz:** Implementei a recuperação de senha por e-mail; corrigi vulnerabilidades de segurança; configurei a v2 do site com novas rotas e realizei o ajuste para o app funcionar fora da rede Wi-Fi do campus do IFPI.  
  *(Git Commits: `39bbdb5` — "funcionalidade de recuperar a senha com o email funcionando", `c170c74` — "Ajustado uns erros de segurança", `f9721d0` — "v2 do site", `5ceeb9a` — "Ajuste para funcionar quando n estiver no wifi do ifpi")*
* **O que farei:** Validar a Definition of Done e liderar a Sprint Review com a equipe.
* **O que me impede:** Nenhum impedimento.

### Raili (Frontend)
* **O que fiz:** Configurei o modo claro como padrão do sistema e ajustei as cores dos botões de autenticação no modo escuro.  
  *(Git Commit: `7fef6a3` — "modo claro como padrão e ajuste no modo escuro mudar a cor dos botões de login")*
* **O que farei:** Testes manuais integrados de ponta a ponta na interface.
* **O que me impede:** Nenhum impedimento.

### Pedro Ravy (Backend)
* **O que fiz:** Concluí os testes de integração das rotas de pedidos, catálogo e autenticação, garantindo respostas 200/201 e 400/401/403.
* **O que farei:** Apoiar o PO na demonstração técnica no Swagger e Postman.
* **O que me impede:** Nenhum impedimento.

### Giselly (Frontend)
* **O que fiz:** Concluí a validação visual dos modais de login, dropdowns e botões de denúncia.
* **O que farei:** Consolidar as métricas de entrega e participar da dinâmica da Retrospectiva.
* **O que me impede:** Nenhum impedimento.

---

## 🚧 Registro de Impedimentos (Facilitado pelo Scrum Master Josimar)

| # | Impedimento Relatado | Impacto | Resolução Técnica e Commit | Quem Ajudou |
| :-: | :--- | :--- | :--- | :--- |
| **1** | Erro de CORS no localhost ao comunicar cliente e API | Bloqueava requisições do frontend | Configurado middleware `cors()` no servidor Express (`c4a922c`) | **Kayky** |
| **2** | Deslocamento horizontal (*layout shift*) pelo scroll do navegador | Layout pulava ao carregar páginas longas | Implementado `scrollbar-gutter: stable` no CSS raiz (`1325fb6`) | **Giselly** |
| **3** | Nome do avaliador invisível no modo escuro | Comprador não conseguia ler quem avaliou | Corrigida a variável semântica de cor no tema escuro (`5e59cdc`) | **Josimar** |
| **4** | Bloqueio de IP fixo do Wi-Fi do campus do IFPI | App falhava fora do laboratório | Ajustado bind de host e variáveis de rede (`5ceeb9a`) | **Kayky** |

---

## 📉 Burndown da Sprint 1

* **Meta Inicial:** 24 pontos de trabalho  
* **Duração:** 8 dias corridos (20/10 a 27/10/2026)  

| Dia da Sprint | 20/10 | 21/10 | 22/10 | 23/10 | 26/10 | 27/10 |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Pontos Ideais** | 24.0 | 19.2 | 14.4 | 9.6 | 4.8 | 0.0 |
| **Pontos Restantes Reais** | 24 | 18 | 11 | 7 | 2 | 0 |

> **Resultado do Burndown:** A equipe concluiu com êxito os **24 pontos planejados**, comprovados pelos 22 commits registrados no repositório ao longo da primeira sprint.
