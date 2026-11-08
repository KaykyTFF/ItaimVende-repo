# Sprint 1 Planning — Planejamento da Sprint 1

**Periodo da Sprint 1:** 29/10/2026 a 03/11/2026  
**Duracao da Sessao:** 45 minutos (29/10/2026)  
**Scrum Master da Sprint 1:** Josimar  
**Product Owner:** Kayky  
**Equipe de Desenvolvimento:** Kayky, Pedro Ravy, Josimar, Raili, Giselly  

---

## 1. Sprint Goal (Objetivo da Sprint 1)

> "Disponibilizar o esqueleto funcional e seguro da API v1 do Itaim Vende (cadastro com JWT, login com rate limiting, categorias com cache HTTP e publicacao de anuncios com upload em nuvem), acompanhado de uma experiencia de frontend padronizada (Skeleton Loading universal, suporte refinado ao modo escuro, pop-ups de autenticacao e consistencia de navegacao e denuncias)."

---

## 2. Capacidade e Estimativa Inicial

* **Historico da Equipe:** Primeira sprint formal de desenvolvimento do projeto de engenharia.
* **Criterio de Planejamento:** Foi adotada a abordagem de fatias verticais completas (*vertical slices*), assegurando que cada historia selecionada contemple banco de dados relacional, rotas HTTP no Express, validacao com schemas Zod, integracao completa no frontend e cobertura com testes automatizados.
* **Capacidade Planejada para a Sprint 1:** 24 pontos de trabalho, distribuidos entre os servicos essenciais da API e a adequacao da interface de usuario e usabilidade.

---

## 3. Escopo Selecionado (Sprint Backlog da Sprint 1)

O backlog selecionado para a primeira sprint englobou o nucleo de autenticacao, catalogo basico, gestao de pedidos e os componentes estruturantes de interface:

| ID | Item de Trabalho / Historia | Dominio Tecnico | Estimativa | Responsaveis | Status ao Fim da Sprint |
| :---: | :--- | :---: | :---: | :--- | :---: |
| **H1** | Cadastro de usuario com hash Bcrypt e emissao de token JWT | Backend / Auth | 4 pts | Kayky | Concluido |
| **H2** | Login seguro com rate limiting anti-bruteforce e Google Auth rapido | Backend / Auth | 3 pts | Pedro Ravy & Giselly | Concluido |
| **H3** | Catalogo de categorias com principio REST e cabecalho `Cache-Control` | Backend / Cache | 2 pts | Pedro Ravy | Concluido |
| **H4** | Publicacao de anuncios com upload multipart e conversao Sharp WebP | Backend / Nuvem | 4 pts | Kayky | Concluido |
| **H8** | Checkout de pedidos com integridade financeira travada no servidor | Backend / Pedidos | 2 pts | Pedro Ravy | Concluido |
| **H10**| Gestao de enderecos do usuario (CRUD completo em `/addresses`) | Backend / Perfil | 2 pts | Pedro Ravy | Concluido |
| **UI-S1-01** | Revisao e correcao do modo escuro em todas as telas da plataforma | UI / Tema | 2 pts | Raili | Concluido |
| **UI-S1-02** | Substituicao de emoji por icone SVG no menu lateral de configuracoes | UI / Icones | 1 pt | Raili | Concluido |
| **UI-S1-03** | Padronizacao dos botoes da pagina "Meus Anuncios" com cores solidas | UI / Botoes | 1 pt | Raili | Concluido |
| **UI-S1-04** | Implementacao de Skeleton Loading universal em listagens assincronas | UX / Performance | 2 pts | Josimar | Concluido |
| **UI-S1-05** | Correcao de contraste na exibicao do nome do avaliador no modo escuro | Bugfix / Tema | 1 pt | Josimar | Concluido |
| **UI-S1-06** | Ajuste da pagina de publicacao de anuncios (`vender.html`) ao tema escuro | UI / Formulario | 1 pt | Josimar | Concluido |
| **UI-S1-07** | Modal interativo de aviso de login para visitantes em acoes restritas | UX / Auth | 2 pts | Giselly | Concluido |
| **UI-S1-08** | Inclusao do botao "Entrar" no cabecalho para visitantes deslogados | UI / Cabecalho | 1 pt | Giselly | Concluido |
| **UI-S1-09** | Padronizacao dimensional do botao "Vender" em todas as telas e chat | UI / Layout | 1 pt | Giselly | Concluido |
| **UI-S1-10** | Eliminacao do deslocamento horizontal com `scrollbar-gutter: stable` | CSS / Layout | 1 pt | Giselly | Concluido |
| **UI-S1-11** | Unificacao visual de todos os menus suspensos (dropdowns) da interface | UI / Componentes | 1 pt | Giselly | Concluido |
| **UI-S1-12** | Correcao de alinhamento das setas e filtros avancados na pagina inicial | UI / Filtros | 1 pt | Giselly | Concluido |
| **UI-S1-13** | Reordenacao semantica de categorias e condicao acima da descricao | UI / Produto | 1 pt | Giselly | Concluido |
| **UI-S1-14** | Redesenho da interface de denuncias de irregularidades | UI / Moderacao | 1 pt | Giselly | Concluido |
| **UI-S1-15** | Discretizacao do botao Denunciar e remocao de texto redundante de ticket | UX / Moderacao | 1 pt | Giselly | Concluido |
| **UI-S1-16** | Denuncia direta de vendedor a partir da pagina publica de perfil | Feature / Seguranca | 1 pt | Giselly | Concluido |
| **UI-S1-17** | Redesenho dos componentes visuais de propostas financeiras no chat | UI / Negociacao | 2 pts | Giselly | Concluido |
| **UI-S1-18** | Criacao de barra lateral para aplicacao de filtros combinados de busca | Feature / Busca | 2 pts | Giselly | Concluido |

* **Total de Pontos Planejados:** 24 pontos.

---

## 4. Mapa de Testes e Classificacao nos Quadrantes Ageis (Q1 a Q4)

Em conformidade com a matriz de Testes Ageis de Lisa Crispin e Janet Gregory, cada historia de usuario foi vinculada a testes derivados dos seus criterios de aceitacao:

* **Q1 (Suporte ao Time / Tecnico):** Testes unitarios de validacao de schemas Zod, cabecalhos HTTP e integridade de tipos.
* **Q2 (Suporte ao Time / Negocio):** Testes automatizados de API para criacao de conta, geracao de JWT, upload de midia e regras de negociacao.
* **Q3 (Critica ao Produto / Negocio):** Testes manuais exploratorios e validacoes de interface (Skeleton Loading, tema escuro, responsividade mobile).
* **Q4 (Critica ao Produto / Tecnico):** Testes de limitacao de requisicoes (rate limiting), integridade de transacoes financeiras e protecao de rotas.

| Historia (ID) | Tarefas e Responsavel | Teste Derivado dos Criterios | Quadrante |
| :---: | :--- | :--- | :---: |
| **H1** | Criar rota `/auth/register` e schema Zod (Kayky) | Requisicao com payload valido retorna 201 e JWT; e-mail duplicado retorna 409 | **Q2** (Negocio / Funcional) |
| **H2** | Implementar `POST /auth/login` e limitador de taxa (Pedro Ravy) | Bloqueio de requisicoes excessivas com HTTP 429 apos 20 falhas seguidas | **Q4** (Seguranca / Tecnico) |
| **H3** | Rota `/categories` com cache HTTP (Pedro Ravy) | Requisicao `GET /categories` retorna status 200 com cabecalho `Cache-Control` | **Q1** (Tecnico / Arquitetura) |
| **H4** | Integrar Multer, Sharp e Supabase Storage (Kayky) | Publicacao de anuncio com imagem real em formato WebP e persistencia relacional | **Q2** (Negocio / Funcional) |
| **H8** | Checkout seguro com consulta compulsoria no banco (Pedro Ravy) | Requisicao `POST /orders` calcula total no servidor e rejeita itens inexistentes com 404 | **Q4** (Integridade / Tecnico) |
| **H10** | Endpoints de gestao de enderecos (Pedro Ravy) | Persistencia de multiplos enderecos com schemas estritos e validacao de campos | **Q2** (Negocio / Funcional) |
| **UI-S1-04** | Padronizacao do Skeleton Shimmer (Josimar) | Teste visual confirmando exibicao de placeholders durante carregamento assincrono | **Q3** (Usabilidade / UX) |
| **UI-S1-01** | Cobertura do tema escuro global (Raili) | Inspecao visual de contraste e tipografia semantica sob a classe `.dark` | **Q3** (Acessibilidade Visual) |
| **UI-S1-07** | Pop-up educacional de login para visitantes (Giselly) | Verificacao de interrupcao de acao privada com abertura de modal explicativo | **Q3** (Conversao / UX) |
