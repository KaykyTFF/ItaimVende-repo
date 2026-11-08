# Sprint 2 Review e Retrospectiva (08/11/2026)

**Data da Sessao:** 08/11/2026  
**Duracao Total:** 60 minutos (Review: 30 min | Retrospectiva: 30 min)  
**Scrum Master Facilitadora:** Giselly *(alternancia de papeis conforme metodologia Scrum)*  
**Product Owner:** Kayky  
**Participantes:** Kayky, Pedro Ravy, Josimar, Raili, Giselly  
**Stakeholder Convidado:** Prof. Me. Julian Rodrigues Valério  

---

## 1. Sprint Review (Inspecao do Incremento Final do Produto)

### 1.1. Recordacao do Sprint Goal da Sprint 2
> "Consolidar a experiencia de uso do Itaim Vende com as funcionalidades de inovacao (busca unaccent sem acentos, sistema de seguranca com cooldown de 30 dias para @), eliminando atritos de usabilidade (redesign da pagina 404, correcao de bugs de sessao/deslogamento, painel de moderacao e refinamentos visuais de perfil e filtros)."

### 1.2. Demonstracao dos Incrementos Funcionais (Swagger UI, Postman e Navegador)
1. **Sistema de Seguranca com Cooldown de 30 Dias para Username (H13):** Demonstracao da regra de negocio no backend em que o `@username` so pode ser alterado uma vez a cada 30 dias (HTTP 403 `USERNAME_COOLDOWN_ACTIVE`), com bloqueio contextual e contador de dias na tela de configuracoes, permitindo a edicao de nome completo e biografia a qualquer momento.
2. **Correcao de Deslogamento Involuntario (BUG-1):** Demonstracao de navegacao continua na aba de notificacoes e alteracao de perfil sem que o usuario seja desconectado indevidamente por respostas HTTP 403 no interceptor de requisicoes.
3. **Redesign Oficial da Pagina 404 (UI-2):** Demonstracao da tela de rota nao encontrada com identidade visual exclusiva do Itaim Vende (mascote tatu com mapa de Paulistana) e botoes de navegacao funcionais.
4. **Central de Tickets de Moderacao Assincrona (MOD-1):** Demonstracao da tela `tickets.html` carregando ocorrencias de denuncias de forma assincrona logo ao carregar, sem spinners bloqueados.
5. **Dinamismo na Secao de Anuncios da Regiao (BUG-2):** Demonstracao da substituicao do card estatico de controle remoto por anuncios reais consultados no PostgreSQL.
6. **Busca Fonetica Sem Acentos com Extensao Unaccent (H5):** Demonstracao no endpoint `GET /api/v1/products?search=eletronicos` retornando itens cadastrados com grafia acentuada.
7. **Pagina Dedicada de Pesquisa e Filtros Combinados (UI-6 e UI-7):** Demonstracao de busca sem redirecionamentos forçados, com slider de faixa de preco e layout integrado.
8. **Refinamento de Perfil e Configuracoes (PRF-1, PRF-2, PRF-3, CFG-1):** Inclusao de biografia no perfil publico, padronizacao cromatica branco-acinzentada e gestao estruturada de enderecos com campos separados de logradouro, numero e validacao de formato de CEP.
9. **Canais de Contato e Propostas no Chat (UI-8, UI-9, UI-3):** Botao de WhatsApp renderizado condicionalmente a presenca de telefone cadastrado com icone oficial, e baloes simetricos de negociacao de valor no chat.

---

### 1.3. Homologacao das Entregas pelo Product Owner

O Product Owner (Kayky) inspecionou individualmente as entregas frente aos criterios de aceitacao e a Definition of Done:

| Item (ID) | Descricao do Item de Trabalho | Responsavel | Pontos | Veredito do PO | Justificativa Tecnica |
| :---: | :--- | :--- | :---: | :---: | :--- |
| **H13** | Cooldown de 30 dias para username (@) com persistencia no banco e bloqueio visual | Kayky & Giselly | 5 pts | **Aceito** | Regra no servidor, suite de 9 testes automatizados passando e bloqueio amigavel na UI. |
| **BUG-1** | Correcao de deslogamento indevido em respostas 403 | Kayky | 3 pts | **Aceito** | Interceptor ajustado em `api-core.js`; sessao estabilizada. |
| **CFG-1** | Salvar endereco em Configuracoes, separando campos e validando CEP | Kayky | 2 pts | **Aceito** | Persistencia correta no PostgreSQL com schemas Zod. |
| **PRF-1** | Remocao de dados sensiveis do perfil publico (enderecos isolados) | Kayky | 2 pts | **Aceito** | Conformidade de privacidade e remocao de campos redundantes. |
| **H5** | Busca fonetica unaccent: consultas sem acento encontram itens acentuados | Pedro Ravy | 5 pts | **Aceito** | Inovacao com extensao nativa PostgreSQL homologada nos testes. |
| **PRF-2** | Inclusao do campo Biografia no perfil e modal de edicao rapida | Pedro Ravy | 2 pts | **Aceito** | Persistencia relacional e renderizacao na interface validadas. |
| **PRF-3** | Substituicao do fundo verde do perfil pelo padrao neutro | Pedro Ravy | 1 pt | **Aceito** | Padronizacao cromatica consistente em todo o portal. |
| **UI-1** | Botoes solidos de alto contraste na aba Meus Anuncios | Pedro Ravy | 1 pt | **Aceito** | Criterios de contraste e acessibilidade aprovados. |
| **CAT-1** | Estruturacao da taxonomia completa com 19 categorias | Josimar | 2 pts | **Aceito** | Navegacao intuitiva cobrindo os segmentos comerciais da regiao. |
| **MOD-1** | Central de tickets de moderacao (`tickets.html`) com carga assincrona | Josimar | 3 pts | **Aceito** | Ocorrencias carregadas automaticamente na abertura da tela. |
| **BUG-2** | Remocao de anuncio mockado e recomendacoes reais dinamicas | Josimar | 2 pts | **Aceito** | Substituicao definitiva de mocks por queries reais no banco. |
| **UI-2** | Redesign da pagina 404 com identidade visual regional | Giselly | 2 pts | **Aceito** | Layout acolhedor com arte do mascote tatu e links funcionais. |
| **UI-3** | Baloes de proposta financeira e acoes de negociacao no chat | Giselly | 2 pts | **Aceito** | Componentes de proposta limpos e responsivos. |
| **UI-4** | Remocao do indicador de tempo de resposta no perfil do vendedor | Giselly | 1 pt | **Aceito** | Eliminacao de metrica estatica sem valor de negocio atual. |
| **UI-5** | Correcao de rota do modal de cadastro para a tela vigente | Giselly | 1 pt | **Aceito** | Fluxo de navegacao redirecionado para o cadastro correto. |
| **UI-6** | Fluxo de pesquisa dedicada sem redirecionamento para categorias | Giselly | 2 pts | **Aceito** | Tela `/pesquisa.html` operacional com filtros combinados. |
| **UI-7** | Remocao de container branco e inclusao de slider de preco | Giselly | 2 pts | **Aceito** | Filtro dinamico por faixa de valor perfeitamente integrado. |
| **UI-8** | Ocultacao do botao de WhatsApp quando ausente o telefone | Giselly | 1 pt | **Aceito** | Eliminacao de links quebrados para numeros inexistentes. |
| **UI-9** | Icone oficial do WhatsApp e ajuste de espacamento dos botoes | Giselly | 1 pt | **Aceito** | Iconografia padronizada e simetria visual do menu superior. |
| **MELH-1**| **Melhoria da Retro 1:** Validacao previa com debounce de 400ms no frontend | Giselly & Pedro | 2 pts | **Aceito** | Feedback instantaneo ao usuario evitando respostas 400. |
| **THM-1** | Correcao do efeito FOUC (flash de fundo claro) no modo escuro | Raili | 2 pts | **Aceito** | Script sincrono no `<head>` eliminou a piscada de tela no reload. |
| **THM-2** | Harmonizacao cromatica do chat e notificacoes no dark theme | Raili & Giselly | 2 pts | **Aceito** | Legibilidade e contraste validados em todas as resolucoes. |
| **MOB-1** | Trava de rolagem de fundo e zoom de pinça no recorte de fotos | Pedro Ravy | 2 pts | **Aceito** | Controle de eventos touch mobile aperfeicoado. |

* **Total de Pontos Entregues e Aceitos:** 28 pontos.
* **Velocidade Consolidada da Sprint 2 ($V_2$):** **28 pontos**.

---

## 2. Sprint Retrospective (Respostas Obrigatorias da Atividade)

Em conformidade estrita com o roteiro pedagogico da disciplina (Item 5 da Atividade de Scrum), a Retrospectiva da Sprint 2 responde objetivamente as tres perguntas obrigatorias:

### Pergunta 1: Nossa velocidade da Sprint 2 foi maior, igual ou menor que a da Sprint 1? Por que?

**Resposta da Equipe:**  
A velocidade da equipe na Sprint 2 foi **maior** do que na Sprint 1, totalizando **28 pontos entregues e aceitos contra 24 pontos na primeira sprint**, evidenciando ganho de produtividade e maturidade operacional do time.

**Fatores Determinantes:**
1. **Infraestrutura e Base Arquitetural Pronta:** Durante a Sprint 1, parte significativa do esforco foi consumida na inicializacao do projeto (configuracao do Prisma ORM, migrations no PostgreSQL, estrutura de middlewares no Express 5 e resolucao de politicas de CORS). Na Sprint 2, com os alicerces tecnicos consolidados, a equipe dedicou quase a totalidade das horas diretamente a regras de negocio, interfaces e correcoes de usabilidade.
2. **Impacto Positivo da Acao de Melhoria (MELH-1):** A adocao da validacao assincrona previa com debounce e o tratamento de codigos estruturados de erro reduziram significativamente o retrabalho entre as camadas de backend e frontend.
3. **Divisao Clara e Paralelismo de Tarefas:** Enquanto a frente de backend (Kayky e Pedro) focava na logica de banco, seguranca relacional e suíte de testes automatizados, a frente de interface (Josimar, Raili e Giselly) refinava layouts, adaptabilidade ao tema escuro e resolucao de falhas visuais de forma simultanea.
4. **Agilidade na Remocao de Impedimentos:** A atuacao da Scrum Master Giselly proporcionou o destravamento veloz de bloqueios operacionais (como o bloqueio de DLL do Prisma no Windows e o tratamento de sessao no frontend), evitando que integrantes ficassem ociosos.

---

### Pergunta 2: Qual historia foi devolvida ou ficou incompleta, e que criterio de aceitacao ou item da DoD faltou?

**Resposta da Equipe:**  
A historia **H13 (Restricao Temporal de Cooldown de 30 Dias para Username)** foi inicialmente devolvida pelo Product Owner (Kayky) durante a fase de inspecao antes de receber o aceite definitivo, em razao de inconformidade com um dos criterios de aceitacao centrais:

* **Inconformidade Tecnica Identificada:** Na primeira versao entregue para revisao, o formulario de configuracao de conta enviava o payload cadastral completo em qualquer submissao (como salvar a biografia, o nome de exibicao ou atualizar a foto). O servico de backend recebia o campo `username` e interpretava a presenca do valor como uma solicitacao de alteracao do `@`, acionando o bloqueio temporal de 30 dias indevidamente ou impedindo que o usuario salvasse alteracoes simples em sua biografia.
* **Criterio de Aceitacao Violado:** O criterio que estabelece: *"A regra de cooldown deve incidir estritamente sobre a modificacao do nome de usuario (@), sendo garantida a liberdade irrestrita para alteracao do nome de exibicao (nome completo) e biografia a qualquer momento, sem bloqueios nem reinicio de contagem temporal"*.
* **Solucao Adotada para Aceite:** A camada de servico `auth.profile.service.js` foi refatorada para comparar se o username submetido difere efetivamente do username registrado no banco (`cleanUsername !== currentUser.username.toLowerCase()`). Caso sejam identicos, a checagem temporal e dispensada com sucesso. A historia so recebeu o aceite formal do PO apos a implementacao do **Cenario 8** da suite `backend/tests/username-cooldown.test.js`, comprovando que a atualizacao de outros campos de perfil nao ativa indevidamente o cooldown nem consome o prazo.

---

### Pergunta 3: A melhoria da Retro 1 funcionou? Qual evidencia no repositorio mostra isso?

**Resposta da Equipe:**  
**Sim, a melhoria MELH-1 funcionou plenamente**, alcancando o objetivo de orientar o usuario em tempo real e eliminar respostas de erro genericas.

**Evidencias Concretas no Repositorio:**
1. **No Codigo do Frontend (`frontend/js/pages/perfil/configuracoes/config-conta.js`):** Implementacao do manipulador de evento no campo de username associado a variavel de temporizacao com debounce de 400ms (`clearTimeout(timeoutValidacaoUsername)` e `setTimeout`), consumindo o metodo da API `window.ItaimApi.auth.verificarDisponibilidadeUsername(val)`. Isso permite que o comprador ou vendedor receba feedback instantaneo de disponibilidade enquanto digita, antes de acionar a submissao do formulario.
2. **Tratamento Semantico de Codigos de Erro:** O script do frontend passa a capturar especificamente as propriedades `err.data?.code` com valores como `USERNAME_COOLDOWN_ACTIVE` e `USERNAME_TAKEN`, exibindo caixas de texto orientativas contendo os dias restantes para nova alteracao ou sugerindo variacoes, sem provocar falhas ou deslogamentos de sessao.
3. **No Codigo do Backend (`backend/src/services/auth/auth.profile.service.js`):** Criacao da funcao dedicada `checkUsernameAvailability()` associada ao endpoint `GET /api/v1/auth/check-username`, desenvolvida especificamente para dar suporte a checagem assincrona previa definida na Retrospectiva da Sprint 1.
