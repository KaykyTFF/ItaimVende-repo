# Sprint 1 Review e Retrospectiva (03/11/2026)

**Data da Sessao:** 03/11/2026  
**Duracao Total:** 60 minutos (Review: 30 min | Retrospectiva: 30 min)  
**Scrum Master Facilitador:** Josimar  
**Product Owner:** Kayky  
**Participantes:** Kayky, Pedro Ravy, Josimar, Raili, Giselly  
**Stakeholder Convidado:** Prof. Me. Julian Rodrigues Valério  

---

## 1. Sprint Review (Inspecao do Incremento do Produto)

### 1.1. Recordacao do Sprint Goal da Sprint 1
> "Disponibilizar o esqueleto funcional e seguro da API v1 do Itaim Vende (cadastro com JWT, login com rate limiting, categorias com cache HTTP e publicacao de anuncios com upload em nuvem), acompanhado de uma experiencia de frontend padronizada (Skeleton Loading universal, suporte refinado ao modo escuro, pop-ups de autenticacao e consistencia de navegacao e denuncias)."

### 1.2. Demonstracao dos Incrementos Funcionais (Swagger UI, Postman e Frontend Integrado)
1. **Autenticacao e Seguranca de Acesso (H1 e H2):** Demonstracao de registro com hash Bcrypt, emissao de token JWT Bearer, bloqueio por rate limiting com HTTP 429 apos requisicoes excessivas e autenticacao rapida com Google OAuth.
2. **Catalogo de Departamentos e Cache HTTP (H3):** Demonstracao do cabecalho `Cache-Control: public, max-age=300` na chamada `GET /api/v1/categories`, acelerando o tempo de resposta subsequente.
3. **Publicacao de Anuncios com Imagem em Nuvem (H4):** Upload multipart de fotografia atraves de `vender.html`, processamento e conversao em WebP pela biblioteca Sharp e armazenamento no bucket do Supabase Storage.
4. **Checkout com Integridade Financeira no Servidor (H8):** Demonstracao de criacao de pedido via `POST /api/v1/orders` com o valor unitario e total extraido diretamente da base de dados, prevenindo manipulacoes maliciosas pelo cliente.
5. **Multiplos Enderecos do Usuario (H10):** Operacoes de CRUD na rota `/api/v1/addresses` integradas a interface de configuracoes.
6. **Skeleton Loading Universal (UI-S1-04):** Apresentacao do efeito shimmer de carregamento assincrono em todas as listagens de cards da plataforma.
7. **Modo Escuro Global Consistente (UI-S1-01, UI-S1-05, UI-S1-06):** Inspecao de contraste, leitura legivel do nome de avaliadores e estilizacao completa do formulario de publicacao no tema escuro.
8. **Fluxo de Navegacao e Conversao (UI-S1-07 a UI-S1-11):** Modal interativo de login para visitantes, botao Entrar no cabecalho, botao Vender com proporcoes simetricas, supressao de trepidacoes visuais com `scrollbar-gutter: stable` e unificacao de menus suspensos.
9. **Denuncias e Negociacao no Chat (UI-S1-12 a UI-S1-18):** Denuncia direta no perfil de vendedores, botoes discretizados, baloes de proposta financeira no chat e barra lateral de filtros avancados.

---

### 1.3. Homologacao das Entregas pelo Product Owner

O Product Owner (Kayky) inspecionou as funcionalidades apresentadas frente a Definition of Done e aos criterios de aceitacao:

| Item (ID) | Descricao do Item de Trabalho | Responsavel | Pontos | Veredito do PO | Justificativa Tecnica |
| :---: | :--- | :--- | :---: | :---: | :--- |
| **H1** | Cadastro de usuario com Bcrypt e emissao de JWT | Kayky | 4 pts | **Aceito** | Criterios de seguranca cumpridos; testes de schema validados. |
| **H2** | Login com rate limiting anti-bruteforce e Google Auth | Pedro & Giselly | 3 pts | **Aceito** | Protecao contra tentativas excessivas e autenticacao federada operacionais. |
| **H3** | Catalogo de categorias com cabecalho `Cache-Control` | Pedro Ravy | 2 pts | **Aceito** | Principio REST de cacheabilidade atendido estritamente. |
| **H4** | Publicacao de anuncios com foto em nuvem (Sharp WebP) | Kayky | 4 pts | **Aceito** | Upload e persistencia relacional validados de ponta a ponta. |
| **H8** | Checkout seguro com calculo financeiro no servidor | Pedro Ravy | 2 pts | **Aceito** | Teste de integracao atesta rejeicao de precos forjados pelo cliente. |
| **H10**| Gestao de multiplos enderecos do usuario | Pedro Ravy | 2 pts | **Aceito** | CRUD funcional conectado ao PostgreSQL. |
| **UI-S1-01** | Revisao do modo escuro em todas as paginas | Raili | 2 pts | **Aceito** | Contraste semantico aprovado sem quebras de legibilidade. |
| **UI-S1-02** | Substituicao de emoji por icone SVG na barra lateral | Raili | 1 pt | **Aceito** | Padrao vetorial consistente com o restante da interface. |
| **UI-S1-03** | Botoes solidos sem efeito neon na tela Meus Anuncios | Raili | 1 pt | **Aceito** | Identidade visual moderna e sem distorcoes luminosas. |
| **UI-S1-04** | Padronizacao do Skeleton Loading em todo o site | Josimar | 2 pts | **Aceito** | Experiencia assincrona sem telas em branco. |
| **UI-S1-05** | Correcao de contraste do nome do avaliador no dark mode | Josimar | 1 pt | **Aceito** | Variavel semantica corrigida no componente de avaliacoes. |
| **UI-S1-06** | Ajuste do formulario de novo anuncio ao tema escuro | Josimar | 1 pt | **Aceito** | Inputs e seletores perfeitamente visiveis no dark theme. |
| **UI-S1-07** | Modal interativo de aviso de login para visitantes | Giselly | 2 pts | **Aceito** | Bloqueio amigavel com direcionamento correto para o login. |
| **UI-S1-08** | Botao Entrar no cabecalho para visitantes deslogados | Giselly | 1 pt | **Aceito** | Acesso direto a autenticacao na primeira dobra da tela. |
| **UI-S1-09** | Padronizacao dimensional do botao Vender | Giselly | 1 pt | **Aceito** | Alinhamento e proporcoes uniformes entre todas as telas. |
| **UI-S1-10** | Eliminacao do layout shift com `scrollbar-gutter` | Giselly | 1 pt | **Aceito** | Rolagem suave e estavel sem saltos laterais. |
| **UI-S1-11** | Unificacao visual de menus dropdown | Giselly | 1 pt | **Aceito** | Consistencia de bordas e tipografia nos seletores. |
| **UI-S1-12** | Correcao de filtros e setas na pagina inicial | Giselly | 1 pt | **Aceito** | Interacao funcional e alinhamentos milimetricos corrigidos. |
| **UI-S1-13** | Reordenacao de tags de categoria e condicao no produto | Giselly | 1 pt | **Aceito** | Hierarquia de informacoes aprimorada na tela de detalhes. |
| **UI-S1-14** | Redesenho da interface de denuncias | Giselly | 1 pt | **Aceito** | Modal limpo, objetivo e acessivel. |
| **UI-S1-15** | Discretizacao do botao Denunciar | Giselly | 1 pt | **Aceito** | Menor poluicao visual na exibicao do anuncio. |
| **UI-S1-16** | Denuncia de vendedor direto pelo perfil publico | Giselly | 1 pt | **Aceito** | Canal de denuncia comunitario facilmente localizado. |
| **UI-S1-17** | Redesenho das propostas financeiras no chat | Giselly | 2 pts | **Aceito** | Interface bilateral com botoes de aceite e recusa funcionais. |
| **UI-S1-18** | Barra lateral de filtros avancados na busca | Giselly | 2 pts | **Aceito** | Segmentacao precisa por atributos de catalogo. |

* **Total de Pontos Entregues e Aceitos:** 24 pontos.
* **Velocidade Consolidada da Sprint 1 ($V_1$):** **24 pontos**.
* **Reordenacao do Backlog:** O Product Owner refinou as prioridades da Sprint 2, posicionando as funcionalidades inovadoras (cooldown de 30 dias para username e busca fonetica unaccent) e o tratamento de bugs visuais e de sessao no topo do Sprint Backlog subsequente.

---

## 2. Sprint Retrospective (Inspecao do Processo e Adaptacao)

Logo apos a Review, a equipe reuniu-se sob facilitacao do Scrum Master Josimar para conduzir a Retrospectiva atraves da dinamica *Comecar, Parar e Continuar*:

| Integrante | Comecar a fazer | Parar de fazer | Continuar fazendo |
| :--- | :--- | :--- | :--- |
| **Kayky** | Implementar validacao assincrona de dados no frontend antes da submissao formal do formulario. | Deixar revisoes de Pull Requests acumularem para o final do expediente. | Manter a suite de testes automatizados executando em cada incremento. |
| **Pedro Ravy** | Estruturar scripts de migracao e indices no banco antes de subir endpoints que dependem de buscas complexas. | Enviar mensagens de commit genericas sem citar o ID da historia no padrao combinado. | Realizar alinhamentos tecnicos rapidos via Discord quando surgirem duvidas de schema. |
| **Josimar** | Adicionar debounce nos campos de entrada do frontend para evitar requisicoes redundantes. | Testar integracoes apenas com mocks estaticos no navegador sem chamar a API real. | Promover sessoes de Pair Programming para destravar impedimentos de integracao. |
| **Raili** | Incluir validacao visual preventiva nos formularios para reduzir respostas 400 Bad Request. | Codificar componentes sem consultar os schemas de validacao Zod do backend. | Garantir conformidade estrita com o manual de identidade visual do projeto. |
| **Giselly** | Tratar os codigos semanticos de erro (`code`) retornados pela API com mensagens amigaveis e contextuais. | Desconsiderar avisos de alerta no console durante as sessoes de teste manual. | Realizar testes cruzados de ponta a ponta entre frontend e backend. |

---

## 3. Melhoria Escolhida da Sprint 1 (Acao Concreta para a Sprint 2)

A equipe selecionou consensualmente uma melhoria de processo com foco na integracao e experiencia do usuario:

* **Descricao da Melhoria (MELH-1):**  
  *"Implementar validacao previa em tempo real com debounce de 400ms no frontend e tratamento estruturado dos codigos semanticos de erro (`code`) retornados pelo backend, assegurando que o usuario receba orientacoes claras antes de submeter o formulario e prevenindo requisicoes desnecessarias."*
* **Responsaveis Designados:** **Giselly** (Frontend) e **Pedro Ravy** (Backend).
* **Prazo de Aplicacao:** Sprint 2 (a ser incorporada como item de trabalho no Sprint Backlog da Sprint 2 e inspecionada formalmente na Retrospectiva da Sprint 2).
* **Criterio de Evidencia:** Presenca de timer de debounce e consumo do endpoint `/auth/check-username` na tela de configuracoes de conta, tratando codigos de bloqueio e duplicidade.
