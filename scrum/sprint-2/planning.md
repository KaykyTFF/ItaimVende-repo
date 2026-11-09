# Sprint 2 Planning — Planejamento da Sprint 2

**Periodo da Sprint 2:** 04/11/2026 a 08/11/2026  
**Duracao da Sessao:** 30 minutos (04/11/2026)  
**Scrum Master da Sprint 2:** Giselly (alternando papel com Josimar)  
**Product Owner:** Kayky  
**Equipe de Desenvolvimento:** Kayky, Pedro Ravy, Josimar, Raili, Giselly  

---

## 1. Sprint Goal — Objetivo da Sprint 2

> "Consolidar a experiencia de uso do Itaim Vende com as funcionalidades de inovacao (busca unaccent sem acentos e regra de seguranca com cooldown de 30 dias para o @), eliminando atritos de usabilidade com a nova pagina 404, correcao de deslogamento indevido, painel de moderacao e tickets de suporte, e refinamentos visuais de perfil e filtros."

---

## 2. Capacidade e Estimativa da Sprint 2

* **Nossa velocidade na Sprint 1:** Conseguimos entregar e aprovar 24 pontos na primeira sprint.
* **Por que aumentamos a capacidade:** Como já tínhamos a base técnica do projeto pronta (PostgreSQL rodando no Supabase, Prisma ORM, rotas no Express e autenticação com JWT), não precisamos gastar tempo configurando o ambiente. Além disso, com a melhoria MELH-1 alinhamos o frontend e o backend, o que reduziu retrabalho.
* **Capacidade planejada para a Sprint 2:** Nos sentimos seguros para assumir 28 pontos de história, distribuídos entre as funcionalidades inovadoras do projeto, correções de interface e a melhoria de processo da nossa retrospectiva anterior.

---

## 3. Escopo Selecionado — Sprint Backlog da Sprint 2

O backlog da segunda sprint contemplou as inovações exigidas, a melhoria MELH-1 e correções prioritárias de interface e estabilidade:

| ID | Item de Trabalho | Categoria Tecnica | Estimativa | Responsaveis | Status ao Fim da Sprint |
| :---: | :--- | :--- | :---: | :--- | :---: |
| **H13** | Cooldown de 30 dias para username (@) com gravacao no PostgreSQL e bloqueio visual | Inovacao e Seguranca | 5 pts | Kayky (Backend/Testes) e Giselly (Frontend UI) | Concluido |
| **BUG-1** | Correcao de deslogamento indevido ao navegar em notificacoes ou receber 403 | Correcao de Sessao | 3 pts | Kayky | Concluido |
| **CFG-1** | Salvar enderecos em Configuracoes com campos separados de rua e numero e validacao de CEP | Backend e Formularios | 2 pts | Kayky | Concluido |
| **PRF-1** | Remocao de dados cadastrais do perfil publico com enderecos em aba dedicada | Privacidade e Perfil | 2 pts | Kayky | Concluido |
| **H5** | Busca fonetica sem acentos com unaccent: buscas como `eletronicos` acham `Eletrônicos` | Inovacao e Backend | 5 pts | Kayky (Backend/unaccent) e Pedro Ravy (Filtros Regionais) | Concluido |
| **PRF-2** | Inclusao do campo Biografia no perfil com modal de edicao rapida | Funcionalidade de Perfil | 2 pts | Pedro Ravy | Concluido |
| **PRF-3** | Troca do fundo verde do perfil pelo padrao visual neutro | Interface e Perfil | 1 pt | Pedro Ravy e Kayky | Concluido |
| **UI-1** | Botoes de acao da aba Meus Anuncios com cores solidas e alto contraste | Interface e Botoes | 1 pt | Pedro Ravy e Raili | Concluido |
| **CAT-1** | Organizacao de 19 categorias completas para navegacao no catalogo | Catalogo e Conteudo | 2 pts | Josimar (Estrutura/Header) e Raili (Estilizacao e Filtros) | Concluido |
| **MOD-1** | Central de tickets e suporte (`tickets.html`) com carregamento de chamados | Moderacao e Suporte | 3 pts | Pedro Ravy (Tickets/Persistencia) e Josimar (Admin/Sessao) | Concluido |
| **BUG-2** | Remocao do anuncio de teste de controle remoto e exibicao de anuncios reais | Correcao de Catalogo | 2 pts | Kayky | Concluido |
| **UI-2** | Redesign da pagina 404 com ilustracao do mascote tatu e mapa de Paulistana | Interface e Identidade | 2 pts | Giselly | Concluido |
| **UI-3** | Ajuste visual dos baloes de proposta financeira e botoes de acao no chat | Interface e Negociacao | 2 pts | Giselly (Propostas/Componentes) e Raili (Estilo e Cores) | Concluido |
| **UI-4** | Remocao do indicador estatico de tempo de resposta do perfil do vendedor | Interface de Perfil | 1 pt | Giselly | Concluido |
| **UI-5** | Correcao de redirecionamento no modal de cadastro para a tela correta | Navegacao | 1 pt | Giselly | Concluido |
| **UI-6** | Fluxo de pesquisa dedicada sem redirecionamento automatico para categorias | Funcionalidade de Busca | 2 pts | Giselly | Concluido |
| **UI-7** | Remocao de container branco redundante e insercao de slider de preco nos filtros | Interface e Filtros | 2 pts | Giselly | Concluido |
| **UI-8** | Ocultacao do botao de WhatsApp quando o anunciante nao cadastrou telefone | Seguranca de Contato | 1 pt | Giselly | Concluido |
| **UI-9** | Insercao do icone oficial do WhatsApp e ajuste de espacamento dos botoes | Icones e Menus | 1 pt | Giselly | Concluido |
| **MELH-1**| **Melhoria da Retro 1:** Validacao previa de @ com debounce de 400ms no frontend | Processo e Qualidade | 2 pts | Giselly (Frontend/Debounce) e Kayky (Endpoint API) | Concluido |
| **THM-1** | Eliminacao do flash claro de tela ao transitar entre paginas no tema escuro | Desempenho e Tema | 2 pts | Raili | Concluido |
| **THM-2** | Harmonizacao visual do chat e das notificacoes no tema escuro | Tema Escuro | 2 pts | Raili (Chat/Notificacoes) e Giselly (Modais Mobile) | Concluido |
| **MOB-1** | Ajuste de zoom automatico no celular e trava de fundo no recorte de fotos | Mobile e Responsividade | 2 pts | Pedro Ravy | Concluido |

* **Total de Pontos Planejados:** 28 pontos.

---

## 4. Mapa de Testes nos Quadrantes Ageis (Q1 a Q4)

Organizamos os testes da Sprint 2 nos quatro quadrantes ageis, unindo testes automatizados no backend e testes manuais que fizemos no laboratorio:

* **Q1 (Testes Tecnicos de Suporte):**
  * Teste da extensao `unaccent` no PostgreSQL garantindo consultas normalizadas sem lentidao.
  * Validacao dos schemas Zod na rota `PUT /api/v1/auth/me` impedindo campos invalidos.
* **Q2 (Testes Funcionais e de Negocio):**
  * Suite automatizada de testes da regra de negocio de seguranca (`backend/tests/username-cooldown.test.js` com 9 cenarios cobrindo ativacao do cooldown, gravacao no banco, rejeicao 403 com tempo restante e permissao de edicao de nome completo).
  * Validacao do endpoint `/api/v1/auth/check-username` para checagem assincrona de disponibilidade (MELH-1).
* **Q3 (Testes Manuais de Usabilidade):**
  * Verificacao no navegador na pagina de configuracoes: campo @ bloqueado mostrando a data exata de desbloqueio durante o periodo de cooldown.
  * Teste da ferramenta de corte de foto em aparelhos touch, garantindo que o fundo nao role durante o toque.
  * Inspecao visual da nova pagina 404 no computador e no celular.
* **Q4 (Testes de Seguranca e Integridade):**
  * Teste do controle de acesso no endpoint `GET /api/v1/reports`, garantindo que usuarios comuns (BUYER) recebem HTTP 403 Forbidden.
  * Teste de resiliencia no frontend garantindo que erros 403 nao desloguem o usuario da conta.
