# Sprint 2 Review e Retrospectiva (08/11/2026)

**Data da Sessao:** 08/11/2026  
**Duracao Total:** 60 minutos (Review: 30 min e Retrospectiva: 30 min)  
**Scrum Master Facilitadora:** Giselly (alternando papel com Josimar)  
**Product Owner:** Kayky  
**Participantes:** Kayky, Pedro Ravy, Josimar, Raili, Giselly  

---

## 1. Sprint Review — Inspecao do Incremento Final do Produto

### 1.1. Sprint Goal da Sprint 2
> "Consolidar a experiencia de uso do Itaim Vende com as funcionalidades de inovacao (busca unaccent sem acentos e regra de seguranca com cooldown de 30 dias para o @), eliminando atritos de usabilidade com a nova pagina 404, correcao de deslogamento indevido, painel de moderacao e tickets de suporte, e refinamentos visuais de perfil e filtros."

### 1.2. Demonstracao dos Incrementos Funcionais
Na nossa Review final, demonstramos tudo funcionando no navegador integrado com a API, e tambem testamos diretamente no Swagger UI e no Postman:

1. **Seguranca com Cooldown de 30 Dias para Username (H13):** Mostramos a regra no backend em que o `@username` so pode ser alterado uma vez a cada 30 dias (HTTP 403 `USERNAME_COOLDOWN_ACTIVE`), com o campo bloqueado e um aviso mostrando quantos dias faltam na tela de configuracoes, enquanto o nome completo e a biografia continuam liberados para edicao a qualquer momento.
2. **Correcao de Deslogamento Involuntario (BUG-1):** Mostramos a navegacao tranquila pelas notificacoes e pelo perfil sem que o usuario seja desconectado indevidamente por respostas HTTP 403.
3. **Nova Pagina 404 (UI-2):** Mostramos a tela de rota inexistente com a ilustracao do tatu e o mapa regional de Paulistana, com botoes que levam o usuario de volta para o inicio.
4. **Central de Tickets e Suporte (MOD-1):** Apresentamos a aba de suporte nas configuracoes e a persistencia em banco desenvolvidas pelo Pedro Ravy, integradas a tela administrativa e controle de acesso criados pelo Josimar (`tickets.html`), permitindo aos usuarios abrir chamados e a moderacao gerenciar os tickets de forma assincrona.
5. **Anuncios Reais da Regiao (BUG-2):** Mostramos a remocao do card estatico de controle remoto e a exibicao dos anuncios reais cadastrados no PostgreSQL.
6. **Busca Fonetica Sem Acentos com Extensao Unaccent (H5):** Demonstramos a normalizacao fonetica desenvolvida no backend pelo Kayky combinada aos filtros regionais por cidades do Pedro Ravy, trazendo produtos como `Eletrônicos` ao buscar `eletronicos`, facilitando a vida de quem pesquisa no celular.
7. **Pagina de Pesquisa e Filtros Combinados (UI-6 e UI-7):** Mostramos a pesquisa em tela dedicada sem redirecionamentos forcados, com controle deslizante de preco e filtros por cidade e categoria.
8. **Perfil e Configuracoes (PRF-1, PRF-2, PRF-3 e CFG-1):** Campo de biografia no perfil, fundo neutro suave e cadastro de enderecos com logradouro, numero e CEP separados.
9. **Contato e Negociacao no Chat (UI-8, UI-9 e UI-3):** Botao de WhatsApp que so aparece quando o vendedor cadastrou o telefone, icone oficial e baloes de proposta de preco no chat com botoes de aceitar ou recusar.

---

### 1.3. Homologacao das Entregas pelo Product Owner

O Kayky, como PO, testou cada item entregue conferindo os criterios de aceitacao e os dez pontos da Definition of Done:

| Item (ID) | Descricao do Item de Trabalho | Responsavel | Pontos | Veredito do PO | Justificativa |
| :---: | :--- | :--- | :---: | :---: | :--- |
| **H13** | Cooldown de 30 dias para username (@) com gravacao no banco e bloqueio visual | Kayky (Backend/Testes) e Giselly (Frontend UI) | 5 pts | **Aceito** | Regra no servidor, suite de 9 testes automatizados passando e aviso claro na interface. |
| **BUG-1** | Correcao de deslogamento indevido em respostas 403 | Kayky | 3 pts | **Aceito** | Ajuste no interceptor de requisicoes; sessao estavel sem quedas. |
| **CFG-1** | Salvar endereco em Configuracoes separando campos e validando CEP | Kayky | 2 pts | **Aceito** | Gravacao correta no PostgreSQL com validacao do Zod. |
| **PRF-1** | Remocao de dados sensiveis do perfil publico com enderecos isolados | Kayky | 2 pts | **Aceito** | Protecao de privacidade e remocao de campos expostos. |
| **H5** | Busca unaccent: buscas sem acento acham produtos com acento | Kayky (Backend/unaccent) e Pedro Ravy (Filtros Regionais) | 5 pts | **Aceito** | Extensao nativa do PostgreSQL funcionando e aprovada nos testes. |
| **PRF-2** | Inclusao do campo Biografia no perfil e modal de edicao rapida | Pedro Ravy | 2 pts | **Aceito** | Gravacao relacional e exibicao na tela funcionando. |
| **PRF-3** | Troca do fundo verde do perfil pelo padrao neutro | Pedro Ravy e Kayky | 1 pt | **Aceito** | Cores consistentes em todo o sistema. |
| **UI-1** | Botoes solidos na aba Meus Anuncios | Pedro Ravy e Raili | 1 pt | **Aceito** | Contraste e acessibilidade aprovados. |
| **CAT-1** | Organizacao de 19 categorias completas no catalogo | Josimar (Estrutura/Header) e Raili (Estilizacao e Filtros) | 2 pts | **Aceito** | Navegacao cobrindo o comercio e servicos da regiao. |
| **MOD-1** | Central de tickets e suporte (`tickets.html`) com carga automatica | Pedro Ravy (Tickets/Persistencia) e Josimar (Admin/Sessao) | 3 pts | **Aceito** | Denuncias e chamados de suporte operacionais com isolamento de sessao. |
| **BUG-2** | Remocao do anuncio de teste e recomendacoes reais dinamicas | Kayky | 2 pts | **Aceito** | Lista dinamica conectada ao banco de dados real. |
| **UI-2** | Redesign da pagina 404 com arte regional | Giselly | 2 pts | **Aceito** | Layout acolhedor com ilustracao do tatu e links funcionando. |
| **UI-3** | Baloes de proposta financeira e acoes de negociacao no chat | Giselly (Propostas/Componentes) e Raili (Estilo e Cores) | 2 pts | **Aceito** | Componentes de proposta limpos e responsivos. |
| **UI-4** | Remocao do tempo de resposta no perfil do vendedor | Giselly | 1 pt | **Aceito** | Eliminacao de informacao estatica que nao agregava valor. |
| **UI-5** | Correcao de rota do modal de cadastro para a tela correta | Giselly | 1 pt | **Aceito** | Direcionamento direto para a tela de registro ativa. |
| **UI-6** | Pagina de pesquisa sem redirecionamento automatico para categorias | Giselly | 2 pts | **Aceito** | Tela de pesquisa funcionando com filtros combinados. |
| **UI-7** | Remocao de container branco e inclusao de slider de preco | Giselly | 2 pts | **Aceito** | Filtro deslizante por faixa de preco integrado. |
| **UI-8** | Ocultacao do botao de WhatsApp quando nao houver telefone cadastrado | Giselly | 1 pt | **Aceito** | Eliminou links quebrados para numeros inexistentes. |
| **UI-9** | Icone oficial do WhatsApp e ajuste de espacamento dos botoes | Giselly | 1 pt | **Aceito** | Icones padronizados e menu superior alinhado. |
| **MELH-1**| **Melhoria da Retro 1:** Validacao previa com debounce de 400ms no frontend | Giselly (Frontend/Debounce) e Kayky (Endpoint API) | 2 pts | **Aceito** | Orientacao imediata ao usuario antes de enviar o formulario. |
| **THM-1** | Correcao de tela piscando no modo escuro | Raili | 2 pts | **Aceito** | Script no topo da pagina acabou com a piscada ao recarregar. |
| **THM-2** | Harmonizacao visual do chat e notificacoes no tema escuro | Raili (Chat/Notificacoes) e Giselly (Modais Mobile) | 2 pts | **Aceito** | Leitura e cores aprovadas no tema escuro. |
| **MOB-1** | Trava de rolagem de fundo e zoom responsivo no recorte de fotos | Pedro Ravy | 2 pts | **Aceito** | Melhoria no controle de toque na versao mobile. |

* **Total de pontos entregues e aceitos:** 28 pontos.
* **Velocidade alcancada na Sprint 2:** **28 pontos**.

---

## 2. Sprint Retrospective — Respostas Obrigatorias da Atividade

Seguindo o roteiro da atividade pratica da disciplina (Item 5), respondemos as tres perguntas obrigatorias com base no que vivenciamos no desenvolvimento da Sprint 2:

### Pergunta 1: Nossa velocidade da Sprint 2 foi maior, igual ou menor que a da Sprint 1? Por que?

**Nossa resposta:**  
A nossa velocidade na Sprint 2 foi **maior** do que na Sprint 1. Conseguimos entregar e aprovar **28 pontos contra 24 pontos na primeira sprint**.

Percebemos quatro motivos principais para esse aumento de ritmo:
1. **A base do projeto ja estava pronta:** Na Sprint 1, gastamos bastante tempo configurando o banco no PostgreSQL, criando as tabelas com o Prisma, organizando os middlewares do Express e resolvendo questoes de CORS. Na Sprint 2, como essa fundacao ja estava estavel, focamos direto nas regras de negocio, nas telas e nas correcoes.
2. **A melhoria da Retrospectiva 1 evitou retrabalho:** Na primeira sprint perdiamos tempo investigando por que certas requisicoes voltavam com erro do backend. Com a validacao previa de 400ms no frontend (MELH-1) e as mensagens de erro padronizadas, alinhamos o frontend e o backend de primeira.
3. **Divisao clara e trabalho em paralelo:** O Kayky liderou o backend, regras de banco, cooldown de 30 dias e a esteira de testes automatizados com CI; o Pedro Ravy cuidou dos filtros regionais no Prisma, avaliacoes, suporte por tickets e ajustes mobile; enquanto Josimar, Raili e Giselly atuaram no frontend, formulários de venda em etapas, tema escuro, propostas no chat e modais de notificacoes.
4. **Destravamos impedimentos rapido:** Com a comunicacao constante no grupo do WhatsApp e as reunioes no laboratorio do campus nos dias de aula, resolvemos os problemas no mesmo dia em que surgiram (como o arquivo travado do Prisma e o logout involuntario no erro 403), sem deixar ninguem travado.

---

### Pergunta 2: Qual historia foi devolvida ou ficou incompleta, e que criterio de aceitacao ou item da DoD faltou?

**Nossa resposta:**  
A historia **H13 (Cooldown de 30 dias para alteracao de username)** foi devolvida pelo nosso PO (Kayky) na primeira tentativa de entrega, antes de ser corrigida e aceita de forma definitiva.

* **O que aconteceu:** Na primeira versao que testamos, o formulario de configuracoes enviava todos os campos juntos na requisicao. Se o usuario quisesse apenas atualizar a sua biografia ou o seu nome de exibicao mantendo o mesmo @, o backend recebia o username preenchido e tratava como se fosse um pedido de alteracao do @, disparando o bloqueio de 30 dias indevidamente ou impedindo a pessoa de salvar seu perfil.
* **Criterio que faltou cumprir:** O criterio de aceitacao exigia que a restricao de 30 dias incidisse exclusivamente quando o @ (nome de usuario) fosse efetivamente modificado, e que a edicao do nome completo e da biografia permanecesse livre a qualquer instante sem sofrer bloqueio.
* **Como resolvemos para alcancar o aceite:** O Kayky refatorou a funcao no backend (`auth.profile.service.js`) para comparar se o username recebido era diferente do que ja estava gravado no banco de dados (`cleanUsername !== currentUser.username.toLowerCase()`). Se o username for o mesmo, a verificacao de cooldown e ignorada e os outros campos sao salvos normalmente. Alem disso, criamos um teste automatizado dedicado (o Cenario 8 da suite `username-cooldown.test.js`) comprovando que atualizar nome e biografia nao ativa o cooldown. Depois dessa correcao e dos testes aprovados no laboratorio, a historia foi homologada pelo PO.

---

### Pergunta 3: A melhoria da Retro 1 funcionou? Qual evidencia no repositorio mostra isso?

**Nossa resposta:**  
**Sim, a nossa melhoria funcionou plenamente.** Conseguimos avisar a pessoa em tempo real enquanto ela digita e acabamos com os erros inesperados na hora de salvar.

Temos tres evidencias concretas no nosso codigo:
1. **No frontend (`frontend/js/pages/perfil/configuracoes/config-conta.js`):** Implementamos o temporizador de debounce com 400ms usando `clearTimeout` e `setTimeout`, chamando a funcao `verificarDisponibilidadeUsername(val)`. Quando a pessoa para de digitar por 400ms, o frontend dispara a consulta assincrona para conferir se o @ esta liberado.
2. **Tratamento de codigos de erro da API:** No mesmo arquivo JavaScript, tratamos os codigos especificos que o backend retorna, como `USERNAME_COOLDOWN_ACTIVE` e `USERNAME_TAKEN`. Se o usuario ja trocou de username ha menos de 30 dias, a interface bloqueia o campo e mostra uma mensagem amigavel informando a data exata em que o nome podera ser alterado novamente.
3. **No backend (`backend/src/services/auth/auth.profile.service.js`):** O Kayky criou a funcao `checkUsernameAvailability()` conectada ao endpoint `GET /api/v1/auth/check-username`, desenvolvida especificamente para atender a essa verificacao previa definida na nossa retrospectiva anterior.
