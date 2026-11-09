# Sprint 1 Review e Retrospectiva (03/11/2026)

**Data da Sessao:** 03/11/2026  
**Duracao Total:** 60 minutos (Review: 30 min e Retrospectiva: 30 min)  
**Scrum Master Facilitador:** Josimar  
**Product Owner:** Kayky  
**Participantes:** Kayky, Pedro Ravy, Josimar, Raili, Giselly  

---

## 1. Sprint Review — Inspecao do Incremento do Produto

### 1.1. Sprint Goal da Sprint 1
> "Disponibilizar o esqueleto funcional e seguro da API v1 do Itaim Vende (cadastro com JWT, login com rate limiting e Google Auth, categorias com cache HTTP e publicacao de anuncios com upload em nuvem), acompanhado de filtros regionais, avaliacoes e uma experiencia de frontend padronizada (Skeleton Loading universal, suporte refinado ao modo escuro, pop-ups de autenticacao e consistencia de navegacao e denuncias)."

### 1.2. Demonstracao dos Incrementos
Na nossa Review, demonstramos as funcionalidades funcionando ao vivo na integracao entre o frontend e a nossa API, alem de testar chamadas no Swagger UI e no Postman:

1. **Autenticacao e Seguranca (H1 e H2):** Mostramos o cadastro com hash Bcrypt, emissao de token JWT, protecao com limitador de taxa retornando HTTP 429 apos tentativas em excesso e login rapido com Google OAuth implementados no backend pelo Kayky, integrados as telas e ao layout de login refinados pela Giselly.
2. **Catalogo de Categorias e Cache HTTP (H3):** Mostramos o cabecalho `Cache-Control: public, max-age=300` na rota `GET /api/v1/categories`, acelerando as consultas seguintes no navegador.
3. **Publicacao de Anuncios com Imagem na Nuvem (H4):** Upload de foto real no formulario `vender.html`, conversao automatica para WebP com Sharp e salvamento no bucket do Supabase Storage.
4. **Filtro Regional e Avaliacoes (FILT-01 e EVAL-01):** Mostramos o filtro avancado por cidades e bairros vizinhos no Prisma feito pelo Pedro Ravy, alem do sistema de avaliacao de vendedores com limite de 1 nota por comprador.
5. **Checkout com Calculo Financeiro no Servidor (H8):** Mostramos a criacao de pedidos na rota `POST /api/v1/orders` puxando o preco original direto do banco, impedindo qualquer tentativa de alterar o valor pelo navegador.
6. **Multiplos Enderecos do Usuario (H10):** Operacoes completas de cadastro, edicao e remocao de enderecos na rota `/api/v1/addresses` integradas na pagina de configuracoes.
7. **Carregamento Suave com Skeleton Loading (UI-S1-04):** Apresentamos o efeito de carregamento shimmer em todas as listagens da plataforma enquanto os dados sao buscados.
8. **Modo Escuro Global (UI-S1-01, UI-S1-05 e UI-S1-06):** Conferimos o contraste em todas as telas, a leitura do nome de avaliadores e a adaptacao da tela de criacao de anuncios ao tema escuro.
9. **Fluxo de Navegacao (UI-S1-07 a UI-S1-11):** Janela de aviso de login para visitantes, botao Entrar no topo, botao Vender com proporcoes certas, remocao de trepidacoes com `scrollbar-gutter: stable` e menus suspensos com o mesmo padrao visual.
10. **Denuncias e Negociacao no Chat (UI-S1-12 a UI-S1-18):** Botao de denuncia no perfil de vendedores, botoes discretos nos anuncios, baloes de proposta de preco no chat e barra lateral de filtros avancados.

---

### 1.3. Homologacao das Entregas pelo Product Owner

O Kayky, no papel de PO, conferiu cada entrega com base nos criterios de aceitacao e nos itens da nossa Definition of Done:

| Item (ID) | Descricao do Item de Trabalho | Responsavel | Pontos | Veredito do PO | Justificativa |
| :---: | :--- | :--- | :---: | :---: | :--- |
| **H1** | Cadastro de usuario com Bcrypt e emissao de JWT | Kayky | 4 pts | **Aceito** | Criterios de seguranca cumpridos e validacao em Zod funcionando. |
| **H2** | Login com limitador de taxa e Google Auth | Kayky (Backend/Google Auth) e Giselly (UI de Login) | 3 pts | **Aceito** | Protecao contra tentativas continuas, OAuth e telas operacionais. |
| **H3** | Catalogo de categorias com cabecalho `Cache-Control` | Kayky | 2 pts | **Aceito** | Regra de cacheabilidade REST atendida conforme o requisito. |
| **H4** | Publicacao de anuncios com foto na nuvem e WebP | Kayky | 4 pts | **Aceito** | Upload e gravacao no banco funcionando de ponta a ponta. |
| **H8** | Checkout seguro com calculo de preco no servidor | Kayky | 2 pts | **Aceito** | Teste automatizado confirma que precos alterados pelo cliente sao rejeitados. |
| **H10**| Gestao de multiplos enderecos do usuario | Kayky | 2 pts | **Aceito** | Operacoes no PostgreSQL e telas funcionando perfeitamente. |
| **FILT-01** | Filtro de cidades e bairros do Vale do Itaim no Prisma | Pedro Ravy | 2 pts | **Aceito** | Mapeamento regional funcional no catalogo. |
| **EVAL-01** | Sistema de avaliacao de vendedor com trava de 1 por usuario | Pedro Ravy | 2 pts | **Aceito** | Regra de negocio salva no banco impedindo duplicidade. |
| **UI-S1-01** | Revisao do modo escuro em todas as paginas | Raili | 2 pts | **Aceito** | Contraste e cores ajustadas sem perda de legibilidade. |
| **UI-S1-02** | Troca de emoji por icone SVG na barra lateral | Raili | 1 pt | **Aceito** | Padrao visual consistente com o resto do sistema. |
| **UI-S1-03** | Botoes solidos na tela Meus Anuncios | Raili | 1 pt | **Aceito** | Estilo visual sem distorcoes luminosas. |
| **UI-S1-04** | Padronizacao do Skeleton Loading no site todo | Josimar | 2 pts | **Aceito** | Eliminou telas em branco durante a busca de dados. |
| **UI-S1-05** | Correcao de contraste do nome do avaliador no tema escuro | Josimar | 1 pt | **Aceito** | Variavel de cor corrigida no CSS. |
| **UI-S1-06** | Ajuste do formulario de novo anuncio ao tema escuro | Josimar | 1 pt | **Aceito** | Campos de texto e seletores claros no modo escuro. |
| **UI-S1-07** | Modal de aviso de login para visitantes | Giselly | 2 pts | **Aceito** | Bloqueio amigavel direcionando para o login. |
| **UI-S1-08** | Botao Entrar no cabecalho para visitantes | Giselly | 1 pt | **Aceito** | Facilita a identificacao de quem ainda nao entrou na conta. |
| **UI-S1-09** | Padronizacao de tamanho do botao Vender | Giselly | 1 pt | **Aceito** | Alinhamento e tamanho uniforme em todas as telas. |
| **UI-S1-10** | Eliminacao de saltos de tela com `scrollbar-gutter` | Giselly | 1 pt | **Aceito** | Rolagem estavel sem saltos laterais. |
| **UI-S1-11** | Unificacao visual de menus suspensos | Giselly | 1 pt | **Aceito** | Consistencia de bordas e tipografia nos menus de selecao. |
| **UI-S1-12** | Correcao de filtros e setas na pagina inicial | Giselly | 1 pt | **Aceito** | Alinhamentos corrigidos na busca. |
| **UI-S1-13** | Reordenacao de tags de categoria e condicao no produto | Giselly | 1 pt | **Aceito** | Hierarquia de leitura melhorada nos detalhes do produto. |
| **UI-S1-14** | Redesenho da interface de denuncias | Giselly | 1 pt | **Aceito** | Modal limpo, direto e intuitivo. |
| **UI-S1-15** | Ajuste discreto do botao Denunciar | Giselly | 1 pt | **Aceito** | Menor poluicao visual na tela do anuncio. |
| **UI-S1-16** | Denuncia de vendedor direto pelo perfil publico | Giselly | 1 pt | **Aceito** | Canal de alerta da comunidade facil de encontrar. |
| **UI-S1-17** | Redesenho das propostas de preco no chat | Giselly | 2 pts | **Aceito** | Baloes organizados com opcoes de aceitar e recusar propostas. |
| **UI-S1-18** | Barra lateral de filtros avancados na busca | Giselly | 2 pts | **Aceito** | Filtragem precisa por condicao, preco e localidade. |

* **Total de pontos entregues e aceitos:** 24 pontos.
* **Velocidade alcancada na Sprint 1:** **24 pontos**.
* **Reorganizacao do Backlog:** Apos homologar as entregas, o Kayky reorganizou as prioridades para a Sprint 2, colocando no topo do backlog a funcionalidade inovadora do cooldown de 30 dias para o @, a busca fonetica unaccent e a correcao dos problemas de sessao e usabilidade.

---

## 2. Sprint Retrospective — Inspecao do Processo e Adaptacao

Logo apos a Review, nos reunimos com o Josimar facilitando a Retrospectiva da Sprint 1. Usamos a dinamica de Comecar, Parar e Continuar para avaliar onde estavamos acertando e o que precisavamos mudar no nosso dia a dia:

| Integrante | Comecar a fazer | Parar de fazer | Continuar fazendo |
| :--- | :--- | :--- | :--- |
| **Kayky** | Fazer validacao em tempo real no frontend antes do envio final do formulario. | Deixar revisoes de Pull Requests acumularem para o fim do dia. | Manter os testes automatizados rodando a cada mudanca feita. |
| **Pedro Ravy** | Criar scripts de banco e indices antes de subir endpoints que dependem de consultas mais pesadas. | Escrever mensagens de commit genericas sem citar o que foi feito. | Manter alinhamentos rapidos no WhatsApp quando bater duvida de tabela ou rota. |
| **Josimar** | Adicionar debounce nos campos de digitacao no frontend para nao sobrecarregar a API. | Testar integracoes apenas com dados falsos sem chamar o backend real. | Fazer programacao em dupla no laboratorio para destravar problemas dificeis. |
| **Raili** | Colocar avisos visuais preventivos nos formularios para evitar respostas de erro 400. | Desenvolver telas sem olhar os schemas de validacao definidos no backend. | Seguir rigorosamente o padrao visual e de cores do nosso projeto. |
| **Giselly** | Tratar os codigos de erro da API com mensagens claras para quem esta usando o sistema. | Deixar passar alertas no console do navegador durante os testes manuais. | Fazer testes cruzados de ponta a ponta entre as telas e a API. |

---

## 3. Melhoria Escolhida da Sprint 1 (Acao para a Sprint 2)

Conversando juntos, escolhemos a principal melhoria de processo para colocar em pratica na Sprint 2:

* **Descricao da Melhoria (MELH-1):**  
  *"Colocar validacao previa com debounce de 400ms no frontend e tratar os codigos de erro vindos da API, para que o usuario receba orientacoes claras enquanto digita o seu nome de usuario (@) antes mesmo de enviar o formulario, evitando requisicoes desnecessarias e mensagens de erro genericas."*
* **Responsaveis:** **Giselly** (Frontend) e **Kayky** (Backend).
* **Prazo de aplicacao:** Sprint 2 (entrou como item no Sprint Backlog da Sprint 2 e sera avaliada na Retrospectiva da Sprint 2).
* **Como comprovar:** Presenca do temporizador de debounce no JavaScript e consumo do endpoint `/auth/check-username` na tela de configuracoes de conta, tratando codigos de bloqueio e duplicidade.
