# Sprint 2 Planning — Planejamento da Sprint 2

**Periodo da Sprint 2:** 04/11/2026 a 08/11/2026  
**Duracao da Sessao:** 30 minutos (04/11/2026)  
**Scrum Master da Sprint 2:** Giselly *(alternancia de papeis conforme metodologia Scrum)*  
**Product Owner:** Kayky  
**Equipe de Desenvolvimento:** Kayky, Pedro Ravy, Josimar, Raili, Giselly  

---

## 1. Sprint Goal (Objetivo da Sprint 2)

> "Consolidar a experiencia de uso do Itaim Vende com as funcionalidades de inovacao (busca unaccent sem acentos, sistema de seguranca com cooldown de 30 dias para @), eliminando atritos de usabilidade (redesign da pagina 404, correcao de bugs de sessao/deslogamento, painel de moderacao e refinamentos visuais de perfil e filtros)."

---

## 2. Capacidade e Estimativa da Sprint 2

* **Velocidade Historica Referencial (Sprint 1):** 24 pontos entregues e aceitos ($V_1 = 24$).
* **Fatores de Ajuste de Capacidade:** A equipe considerou a maturidade acumulada sobre a arquitetura (banco, ORM, Express e autenticacao ja consolidados) e a reducao do retrabalho proporcionada pela acao de melhoria MELH-1.
* **Capacidade Planejada para a Sprint 2:** 28 pontos de trabalho, alocados entre funcionalidades inovadoras, resolucao de falhas de usabilidade e implementacao da melhoria de processo originada na Retrospectiva 1.

---

## 3. Escopo Selecionado (Sprint Backlog da Sprint 2)

O backlog da segunda sprint contemplou as inovacoes exigidas, a melhoria MELH-1 e correcoes prioritarias de interface e estabilidade:

| ID | Item de Trabalho / Historia | Categoria Tecnica | Estimativa | Responsaveis | Status ao Fim da Sprint |
| :---: | :--- | :---: | :---: | :--- | :---: |
| **H13** | Cooldown de 30 dias para username (@) com persistencia no PostgreSQL e bloqueio visual | Inovacao / Seguranca | 5 pts | Kayky & Giselly | Concluido |
| **BUG-1** | Correcao de deslogamento indevido ao navegar em notificacoes ou receber 403 | Bugfix / Sessao | 3 pts | Kayky | Concluido |
| **CFG-1** | Persistencia de enderecos em Configuracoes, separacao de rua/numero e validacao de CEP | Backend / Formulario | 2 pts | Kayky | Concluido |
| **PRF-1** | Remocao de dados cadastrais do perfil publico e concentracao de enderecos em aba dedicada | Refactor / Privacidade | 2 pts | Kayky | Concluido |
| **H5** | Busca fonetica sem acentos (`unaccent`): consultas como `eletronicos` retornam `Eletrônicos` | Inovacao / Backend | 5 pts | Pedro Ravy | Concluido |
| **PRF-2** | Inclusao do campo Biografia / Sobre voce no perfil e modal de edicao rapida | Feature / Perfil | 2 pts | Pedro Ravy | Concluido |
| **PRF-3** | Substituicao do fundo verde do perfil pelo padrao visual neutro branco-acinzentado | Refactor / UI | 1 pt | Pedro Ravy | Concluido |
| **UI-1** | Botoes de acao da aba "Meus Anuncios" com cores solidas e alto contraste | UI / Botoes | 1 pt | Pedro Ravy | Concluido |
| **CAT-1** | Estruturacao da taxonomia completa com 19 categorias para navegacao no catalogo | Conteudo / Catalogo | 2 pts | Josimar | Concluido |
| **MOD-1** | Central de tickets de moderacao (`tickets.html`) com carregamento assincrono de denuncias | Feature / Moderacao | 3 pts | Josimar | Concluido |
| **BUG-2** | Remocao do anuncio mockado de controle remoto e exibicao de anuncios reais dinamicos | Bugfix / Catalogo | 2 pts | Josimar | Concluido |
| **UI-2** | Redesign da pagina 404 com ilustracao do mascote tatu e mapa regional | UI / Identidade | 2 pts | Giselly | Concluido |
| **UI-3** | Ajuste visual dos baloes de proposta financeira e botoes de acao no chat | UI / Negociacao | 2 pts | Giselly | Concluido |
| **UI-4** | Remocao do indicador de tempo de resposta da visualizacao publica do vendedor | Refactor / Perfil | 1 pt | Giselly | Concluido |
| **UI-5** | Correcao de redirecionamento no modal de cadastro para a rota autentica | Bugfix / Navegacao | 1 pt | Giselly | Concluido |
| **UI-6** | Fluxo de pesquisa dedicada sem redirecionamento compulsorio para categorias | Feature / Busca | 2 pts | Giselly | Concluido |
| **UI-7** | Remocao de container branco redundante e insercao de slider de preco nos filtros | UI / Catalogo | 2 pts | Giselly | Concluido |
| **UI-8** | Ocultacao do botao de WhatsApp quando o anunciante nao possuir telefone registrado | UX / Seguranca | 1 pt | Giselly | Concluido |
| **UI-9** | Insercao do icone oficial do WhatsApp e ajuste de espacamento dos botoes do menu | UI / Icones | 1 pt | Giselly | Concluido |
| **MELH-1**| **Melhoria da Retro 1:** Validacao previa de `@` com debounce de 400ms no frontend | Processo / Qualidade | 2 pts | Giselly & Pedro Ravy | Concluido |
| **THM-1** | Eliminacao do efeito FOUC (flash de fundo claro) ao transitar entre telas no tema escuro | Bugfix / Performance | 2 pts | Raili | Concluido |
| **THM-2** | Harmonizacao cromatica do chat e notificacoes sob o tema escuro | UI / Dark Mode | 2 pts | Raili & Giselly | Concluido |
| **MOB-1** | Ajuste de zoom automatico no celular e trava de fundo no recorte de fotografias | Mobile / Responsivo | 2 pts | Pedro Ravy | Concluido |

* **Total de Pontos Planejados:** 28 pontos.

---

## 4. Mapa de Testes e Rastreabilidade Tecnica nos Quadrantes Ageis (Q1 a Q4)

* **Q1 (Suporte ao Time / Tecnico):**
  * Teste unitario da extensao `unaccent` no PostgreSQL garantindo consultas normalizadas sem distorcao de desempenho.
  * Validacao dos schemas Zod para a rota `PUT /api/v1/auth/me` impedindo campos nao sanitizados.
* **Q2 (Suporte ao Time / Negocio):**
  * Suíte automatizada de testes da regra de negocio de seguranca (`backend/tests/username-cooldown.test.js` com 9 cenarios cobrindo ativacao do cooldown, persistencia relacional, rejeicao 403 com tempo restante e permissao de edicao de nome completo).
  * Validacao do endpoint `/api/v1/auth/check-username` para consulta assincrona de disponibilidade (MELH-1).
* **Q3 (Critica ao Produto / Negocio):**
  * Verificacao de interface na pagina de configuracoes: campo `@` desabilitado exibindo a data exata de desbloqueio quando sob periodo de cooldown.
  * Teste exploratorio do modal de corte de foto em dispositivos touch, certificando o bloqueio de rolagem do fundo.
  * Inspecao visual da nova tela 404 em resolucoes desktop e mobile.
* **Q4 (Critica ao Produto / Tecnico):**
  * Teste do middleware RBAC no endpoint `GET /api/v1/reports`, assegurando que usuarios comuns (BUYER) recebem HTTP 403 Forbidden.
  * Teste de resiliencia de sessao garantindo que respostas 403 nao acionem o logout automatico do cliente.
