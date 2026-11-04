# ☀️ Daily Scrums e Burndown — Sprint 2 (Baseado nos Commits Reais)

> **Scrum Master:** Giselly  
> **Canal de Comunicação:** Discord (`#daily-scrum`) & WhatsApp  
> **Horário Regular:** 19h30  
> **Rastreabilidade Técnica:** Cada relato diário está formalmente fundamentado nos commits registrados no histórico Git do projeto.

---

## 📅 Registro 1 — 29/10 e 30/10/2026 (Quinta e Sexta-feira)

### Kayky (Backend / PO)
* **O que fiz:** 
  * Corrigi a falha crítica de autenticação onde clicar em notificações ou receber 403 deslogava a sessão do usuário. *(Git Commit: `4dbc041` — "corrigido problema no site de não conseguir entrar direito")*
  * Finalizei o fluxo de login rápido via Google OAuth. *(Git Commit: `5c61d0a` — "funcionando google login")*
  * Removi o fundo verde do perfil, padronizando o background branco-acinzentado em todo o site. *(Git Commit: `4fea830` — "ajuste na cor de fundo do perfil e padronização do background no site inteiro")*
  * Refatorei a gestão de endereços em configurações (rua, número e validação de CEP) e criei regras de edição de anúncios. *(Git Commits: `9d3fe01`, `bd21120` — "ajuste na parte de endereços em configurações", "botão de doação adicionado, regras de negocios na edição de um anuncio...")*
* **O que farei:** Implementar a lógica de cooldown de 30 dias para alteração do `@` no PostgreSQL e servidor.
* **O que me impede:** O Prisma no Windows bloqueou o arquivo DLL nativo (`.dll.node`) em uso pelo nodemon *(Registrado como Impedimento #1)*.

### Pedro Ravy (Backend)
* **O que fiz:** Adicionei o campo de **Biografia / Sobre você** no perfil; alterei os botões de ação de "Meus Anúncios" para cores sólidas; e ajustei as fontes para atenuar o zoom automático no celular.  
  *(Git Commit: `2ad9c94` — "Ajuste de zoom no celular, cores solidas nos botoes de meus anuncios e adicao de bio no perfil")*
* **O que farei:** Investigar a trava de scroll do fundo durante a manipulação do modal de corte de fotos de anúncios.
* **O que me impede:** Nenhum impedimento.

### Giselly (Frontend / SM)
* **O que fiz:** Entreguei um expressivo pacote de refinamentos de interface e identidade visual:
  * Redesenhei a página 404 com a ilustração do mascote tatu e mapa de Paulistana; corrigi o popup de cadastro que ia para tela antiga; e criei a página de pesquisa dedicada. *(Git Commit: `aa35766` — "ajuste na pagina de erro, no pop up e na pagina de pesquisa")*
  * Removi o card de tempo de resposta no perfil do vendedor. *(Git Commit: `5ca640d` — "remoção do card de tempo de resposta")*
  * Reduzi o espaçamento excessivo entre os botões do menu superior. *(Git Commit: `2cbfa61` — "botoes menu")*
  * Inseri o ícone oficial do WhatsApp e ocultei o botão quando o usuário não tiver número cadastrado. *(Git Commits: `6bc0921`, `9c3d88e` — "icone whats original", "remoção do botão do whats quando o usuario nao cadastrar")*
  * Adicionei a barra de preço nos filtros e tirei o card branco das categorias. *(Git Commit: `9a3d0a9` — "barra de preço")*
  * Redesenhei as mensagens de proposta de preço no chat e atualizei o ícone de bandeira de denúncia. *(Git Commits: `d45047b`, `58ab4ff`, `e686b50` — "mensagem proposta", "proposta", "icone denunciar anuncio no chat")*
* **O que farei:** Implementar a validação em tempo real com debounce de 400ms no formulário de conta (MELH-1).
* **O que me impede:** Nenhum impedimento.

### Josimar (Frontend)
* **O que fiz:** Iniciei o planejamento da Central de Tickets para suporte/moderação e mapeei a taxonomia das 19 categorias do site.
* **O que farei:** Criar a tela `tickets.html` e conectar o carregamento das denúncias.
* **O que me impede:** Nenhum impedimento.

### Raili (Frontend)
* **O que fiz:** Apoiei na remoção de detalhes neon dos botões de meus anúncios *(Git Commit: `baa77fd`)* e iniciei a análise da persistência do tema escuro no `localStorage`.
* **O que farei:** Eliminar o flash claro de 1s ao trocar de tela no modo escuro.
* **O que me impede:** Seletores CSS do chat usavam cores fixas que quebravam no dark theme.

---

## 📅 Registro 2 — 31/10 e 01/11/2026 (Sábado e Domingo)

### Josimar (Frontend)
* **O que fiz:** Criei a **Central de Tickets de Moderação** (`tickets.html`), implementei a lista completa com 19 categorias no catálogo e ajustei o cabeçalho mobile.  
  *(Git Commit: `249565a` — "feat: painel de tickets, 19 categorias, header mobile e formulario de venda")*
* **O que farei:** Corrigir o carregamento da lista de tickets para não depender de clique manual nos botões.
* **O que me impede:** A listagem de tickets ficava travada em carregamento infinito ao entrar na tela *(Registrado como Impedimento #3)*.

### Kayky (Backend / PO)
* **O que fiz:** 
  * Removi o anúncio fixo do controle remoto, fazendo aparecer anúncios reais dinâmicos na seção "Outros anúncios da região". *(Git Commit: `a569122` — "outro anuncios aparecenço dentro do anuncio")*
  * Recuperei o funcionamento da página de favoritos e corrigi o bloqueio para impedir que visitantes não autenticados adicionem favoritos sem login. *(Git Commits: `7b19535`, `c8670c3` — "pagina de favoritos voltando a funcionar", "tava favoritando com usuario não cadastrado")*
* **O que farei:** Destravar o processo do Prisma e finalizar a regra de negócio do cooldown de 30 dias no backend.
* **O que me impede:** Nenhum impedimento.

### Raili (Frontend)
* **O que fiz:** Resolvi o problema crônico do modo escuro eliminando definitivamente o flash claro de 1 segundo (*Flash of Unstyled Content* - FOUC) ao atualizar a página (F5) ou transitar entre telas, inserindo o script síncrono de verificação de tema no `<head>` antes do primeiro render do DOM.  
  *(Git Commit: `c2a5114` — "correcao no modo escuro eliminando flash claro ao atualizar e trocar de pagina" — autoria exclusiva de Raili, commitado pela estação local do projeto)*
* **O que farei:** Testar a persistência da chave de tema no `localStorage` em todos os navegadores e finalizar os contrastes do chat no tema escuro.
* **O que me impede:** Nenhum impedimento.

### Pedro Ravy (Backend)
* **O que fiz:** Finalizei o suporte à extensão `unaccent` no PostgreSQL e iniciei a refatoração do modal de corte de foto.
* **O que farei:** Travar a rolagem de fundo da tela ao ajustar foto no anúncio.
* **O que me impede:** O evento de toque no celular rolava o fundo da página involuntariamente *(Registrado como Impedimento #5)*.

### Giselly (Frontend / SM)
* **O que fiz:** Integrei o timer de debounce de 400ms no input de username das configurações, aplicando a melhoria acordada na Retro 1 (MELH-1).
* **O que farei:** Criar a resposta visual de bloqueio amigável informando a data exata de liberação do `@`.
* **O que me impede:** Aguardando o retorno da rota de perfil com o status de cooldown.

---

## 📅 Registro 3 — 02/11 e 03/11/2026 (Segunda e Terça-feira)

### Pedro Ravy (Backend)
* **O que fiz:** Corrigi o comportamento do modal de imagem: travei a rolagem de fundo (`overflow: hidden`) e implementei zoom de pinça responsivo no ajuste de fotos ao criar anúncios.  
  *(Git Commit: `73ba8a7` — "fix(anuncio): corrige rolagem do fundo e adiciona zoom de pinça no ajuste de fotos")*
* **O que farei:** Apoiar na documentação OpenAPI e na coleção Postman.
* **O que me impede:** Nenhum impedimento.

### Kayky (Backend / PO)
* **O que fiz:** 
  * Solucionei o bug da tela de tickets: ajustei os placeholders e fiz o carregamento ocorrer de forma assíncrona automática ao abrir a página. *(Git Commit: `1a0a030` — "ajuste nos placeholders e na tela de ticket carregar")*
  * Implementei a regra de segurança e inovação completa: **Cooldown de 30 dias para alteração de Username (@)**, com coluna no PostgreSQL, bloqueio HTTP 403 (`USERNAME_COOLDOWN_ACTIVE`), preservação da alteração de nome de perfil e suíte com 9 testes automatizados passando 100%. *(Git Commit: `5cb6f68` — "poder so trocar de usuario acada 30 dias")*
* **O que farei:** Conduzir o ensaio da demonstração ao vivo para a apresentação da disciplina.
* **O que me impede:** Nenhum impedimento.

### Josimar (Frontend)
* **O que fiz:** Validei a tela de tickets após a correção do carregamento assíncrono e removi os atalhos de moderação da barra lateral para compradores comuns.
* **O que farei:** Revisar todas as rotas limpas no servidor para garantir zero erro 404 em navegação normal.
* **O que me impede:** Nenhum impedimento.

### Raili (Frontend)
* **O que fiz:** Concluí a harmonização de cores do chat no tema escuro e conferi a ausência do efeito FOUC em todos os fluxos.
* **O que farei:** Participar dos testes cruzados finais com toda a equipe.
* **O que me impede:** Nenhum impedimento.

### Giselly (Frontend / SM)
* **O que fiz:** Conectei o bloqueio visual do formulário de configurações ao retorno da API: o campo fica desabilitado com a data de liberação (`DD/MM/AAAA`) e dias restantes quando em cooldown de 30 dias; estruturei a ata da Sprint Review e facilitei a Retrospectiva da Sprint 2.
* **O que farei:** Consolidar a documentação final na pasta `/scrum`.
* **O que me impede:** Nenhum impedimento.

---

## 🚧 Registro de Impedimentos (Facilitado pela Scrum Master Giselly)

| # | Impedimento Relatado | Impacto | Resolução Técnica e Commit | Quem Ajudou |
| :-: | :--- | :--- | :--- | :--- |
| **1** | Erro `EPERM` do Prisma no Windows com DLL travada | Bloqueava a geração de tipos para a coluna de cooldown | Finalizado o processo nodemon e regenerado o Prisma Client | **Kayky** |
| **2** | Deslogamento indevido no `api-core.js` em respostas 403 | Desconectava a conta ao clicar em notificações | Restringido o logout estritamente a HTTP 401 em `/auth/me` (`4dbc041`) | **Kayky** |
| **3** | Tela de tickets ficava em carregamento infinito | Moderador não visualizava denúncias sem clicar nos filtros | Ajustado carregamento assíncrono e placeholders (`1a0a030`) | **Kayky** |
| **4** | Flash claro de 1s (FOUC) ao trocar de tela no dark theme | Clarão visual incômodo na vista do usuário | Inserido script síncrono de tema no `<head>` (`c2a5114`) | **Raili** |
| **5** | Rolagem involuntária da página ao cortar foto de anúncio | Usuário perdia a posição do corte no celular | Implementado scroll lock no body e suporte a toque (`73ba8a7`) | **Pedro Ravy** |

---

## 📉 Burndown da Sprint 2

* **Meta Inicial:** 28 pontos de trabalho  
* **Duração:** 6 dias corridos (29/10 a 03/11/2026)  

| Dia da Sprint | 29/10 | 30/10 | 31/10 | 01/11 | 02/11 | 03/11 |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Pontos Ideais** | 28.0 | 22.4 | 16.8 | 11.2 | 5.6 | 0.0 |
| **Pontos Restantes Reais** | 28 | 19 | 11 | 6 | 2 | 0 |

> **Resultado do Burndown:** A equipe concluiu com êxito os **28 pontos planejados**, comprovados pelos 23 commits registrados no repositório durante a segunda sprint.
