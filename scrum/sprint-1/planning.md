# Sprint 1 Planning — Planejamento da Sprint 1

**Periodo da Sprint 1:** 29/10/2026 a 03/11/2026  
**Duracao da Sessao:** 45 minutos (29/10/2026)  
**Scrum Master da Sprint 1:** Josimar  
**Product Owner:** Kayky  
**Equipe de Desenvolvimento:** Kayky, Pedro Ravy, Josimar, Raili, Giselly  

---

## 1. Sprint Goal — Objetivo da Sprint 1

> "Disponibilizar o esqueleto funcional e seguro da API v1 do Itaim Vende (cadastro com JWT, login com limitador de taxa, categorias com cache HTTP e publicacao de anuncios com upload na nuvem), acompanhado de uma experiencia padronizada no frontend com carregamento em esqueleto, suporte ao modo escuro, avisos visuais de login e consistencia de navegacao e denuncias."

---

## 2. Capacidade e Estimativa Inicial

* **Historico da equipe:** Esta foi a nossa primeira sprint formal de desenvolvimento no projeto da disciplina.
* **Criterio de planejamento:** Decidimos trabalhar em fatias verticais completas. Cada historia selecionada precisava englobar desde as tabelas no PostgreSQL e rotas HTTP no Express com validacao em Zod, ate a integracao nas telas do frontend e a criacao de testes automatizados.
* **Capacidade planejada:** Estimamos a nossa capacidade inicial em 24 pontos de historia, dividindo o trabalho entre a espinha dorsal da API e as primeiras correcoes e padronizacoes visuais do frontend.

---

## 3. Escopo Selecionado — Sprint Backlog da Sprint 1

Selecionamos para o backlog da primeira sprint os servicos essenciais de autenticacao, catalogo basico, pedidos e melhorias estruturantes de interface:

| ID | Item de Trabalho | Area Tecnica | Estimativa | Responsaveis | Status ao Fim da Sprint |
| :---: | :--- | :--- | :---: | :--- | :---: |
| **H1** | Cadastro de usuario com hash Bcrypt e emissao de token JWT | Backend e Autenticacao | 4 pts | Kayky | Concluido |
| **H2** | Login seguro com limitador de taxa contra forca bruta e Google Auth | Backend e Autenticacao | 3 pts | Pedro Ravy e Giselly | Concluido |
| **H3** | Catalogo de categorias com principio REST e cabecalho `Cache-Control` | Backend e Cache | 2 pts | Pedro Ravy | Concluido |
| **H4** | Publicacao de anuncios com upload multipart e conversao Sharp para WebP | Backend e Nuvem | 4 pts | Kayky | Concluido |
| **H8** | Checkout de pedidos com calculo financeiro travado no servidor | Backend e Pedidos | 2 pts | Pedro Ravy | Concluido |
| **H10**| Gestao de enderecos do usuario com operacoes completas em `/addresses` | Backend e Perfil | 2 pts | Pedro Ravy | Concluido |
| **UI-S1-01** | Revisao e correcao do modo escuro em todas as telas da plataforma | Interface e Tema | 2 pts | Raili | Concluido |
| **UI-S1-02** | Substituicao de emoji por icone SVG no menu lateral de configuracoes | Interface e Icones | 1 pt | Raili | Concluido |
| **UI-S1-03** | Padronizacao dos botoes da pagina Meus Anuncios com cores solidas | Interface e Botoes | 1 pt | Raili | Concluido |
| **UI-S1-04** | Implementacao de Skeleton Loading universal em listagens assincronas | Experiencia do Usuario | 2 pts | Josimar | Concluido |
| **UI-S1-05** | Correcao de contraste na exibicao do nome do avaliador no modo escuro | Correcao de Bug | 1 pt | Josimar | Concluido |
| **UI-S1-06** | Ajuste da pagina de novo anuncio (`vender.html`) ao tema escuro | Interface e Formularios | 1 pt | Josimar | Concluido |
| **UI-S1-07** | Modal interativo de aviso de login para visitantes em acoes restritas | Experiencia do Usuario | 2 pts | Giselly | Concluido |
| **UI-S1-08** | Inclusao do botao Entrar no cabecalho para visitantes deslogados | Interface de Cabecalho | 1 pt | Giselly | Concluido |
| **UI-S1-09** | Padronizacao de tamanho do botao Vender em todas as telas e no chat | Interface e Layout | 1 pt | Giselly | Concluido |
| **UI-S1-10** | Eliminacao do deslocamento horizontal com `scrollbar-gutter: stable` | Estilizacao e Layout | 1 pt | Giselly | Concluido |
| **UI-S1-11** | Unificacao visual de todos os menus suspensos da interface | Componentes de Interface | 1 pt | Giselly | Concluido |
| **UI-S1-12** | Correcao de alinhamento das setas e filtros avancados na pagina inicial | Interface e Filtros | 1 pt | Giselly | Concluido |
| **UI-S1-13** | Reordenacao de categorias e condicao acima da descricao do produto | Interface de Produto | 1 pt | Giselly | Concluido |
| **UI-S1-14** | Redesenho da interface de denuncias de irregularidades | Interface e Moderacao | 1 pt | Giselly | Concluido |
| **UI-S1-15** | Ajuste discreto do botao Denunciar e remocao de texto redundante | Experiencia do Usuario | 1 pt | Giselly | Concluido |
| **UI-S1-16** | Denuncia direta de vendedor a partir da pagina publica de perfil | Funcionalidade e Seguranca | 1 pt | Giselly | Concluido |
| **UI-S1-17** | Redesenho visual das propostas financeiras no chat | Interface e Negociacao | 2 pts | Giselly | Concluido |
| **UI-S1-18** | Criacao de barra lateral para aplicacao de filtros combinados de busca | Funcionalidade e Busca | 2 pts | Giselly | Concluido |

* **Total de Pontos Planejados:** 24 pontos.

---

## 4. Mapa de Testes nos Quadrantes Ageis (Q1 a Q4)

Para garantir que tudo funcionasse bem, organizamos os testes das nossas historias nos quatro quadrantes ageis:

* **Q1 (Testes Tecnicos de Suporte):** Testes unitarios checando schemas Zod, cabecalhos HTTP e validade dos tipos.
* **Q2 (Testes Funcionais e de Negocio):** Testes automatizados de API para criacao de conta, geracao de JWT, upload de imagens e regras de compra e venda.
* **Q3 (Testes Manuais de Usabilidade):** Testes exploratorios que fizemos no laboratorio testando a interface em conjunto (Skeleton Loading, tema escuro e visual no celular).
* **Q4 (Testes de Seguranca e Carga):** Testes de limitador de requisicoes para barrar forca bruta, calculos de pedidos travados no servidor e protecao de rotas privadas.

| Historia (ID) | Tarefas e Responsavel | Teste Derivado dos Criterios | Quadrante |
| :---: | :--- | :--- | :---: |
| **H1** | Criar rota `/auth/register` e schema Zod (Kayky) | Requisicao com dados validos retorna 201 e JWT; e-mail duplicado retorna 409 | **Q2** (Funcional) |
| **H2** | Implementar `POST /auth/login` e limitador de taxa (Pedro Ravy) | Bloqueio de requisicoes excessivas com HTTP 429 apos 20 falhas seguidas | **Q4** (Seguranca) |
| **H3** | Rota `/categories` com cache HTTP (Pedro Ravy) | Requisicao `GET /categories` retorna status 200 com cabecalho `Cache-Control` | **Q1** (Tecnico) |
| **H4** | Integrar Multer, Sharp e Supabase Storage (Kayky) | Publicacao de anuncio com imagem real em WebP e gravacao no banco | **Q2** (Funcional) |
| **H8** | Checkout seguro com consulta no banco de dados (Pedro Ravy) | Requisicao `POST /orders` calcula total no servidor e rejeita itens inexistentes com 404 | **Q4** (Integridade) |
| **H10** | Endpoints de gestao de enderecos (Pedro Ravy) | Gravacao de multiplos enderecos com schemas estritos e validacao de campos | **Q2** (Funcional) |
| **UI-S1-04** | Padronizacao do Skeleton Shimmer (Josimar) | Teste visual confirmando placeholders enquanto os dados carregam | **Q3** (Usabilidade) |
| **UI-S1-01** | Cobertura do tema escuro global (Raili) | Inspecao visual de contraste e tipografia no tema escuro | **Q3** (Acessibilidade) |
| **UI-S1-07** | Pop-up de login para visitantes (Giselly) | Verificacao de bloqueio de acao privada abrindo modal explicativo | **Q3** (Usabilidade) |
