# 🎯 Sprint 1 Planning — Planejamento da Sprint 1

> **Período da Sprint 1:** 20/10/2026 a 27/10/2026  
> **Scrum Master da Sprint 1:** Josimar  
> **Product Owner:** Kayky  
> **Equipe de Desenvolvimento:** Kayky, Pedro Ravy, Josimar, Raili, Giselly  

---

## 🚀 1. Sprint Goal (Objetivo da Sprint 1)

> *"Disponibilizar o esqueleto funcional e seguro da API v1 do Itaim Vende (cadastro com JWT, login com rate limiting, categorias com cache HTTP e publicação de anúncios com upload em nuvem), acompanhado de uma experiência de frontend padronizada (Skeleton Loading universal, suporte refinado ao modo escuro, pop-ups de autenticação e consistência de navegação e denúncias)."*

---

## 📊 2. Capacidade e Estimativa Inicial

* **Histórico da Equipe:** Primeira sprint de desenvolvimento do projeto acadêmico.
* **Critério de Planejamento:** Adotou-se o modelo de **fatias verticais completas** (banco relacional, endpoints Express 5, schemas Zod e integração direta no frontend com design refinado).
* **Capacidade Planejada da Sprint 1:** 24 pontos de trabalho distribuídos entre o núcleo de APIs da plataforma e os requisitos visuais e de usabilidade da primeira semana.

---

## 🍰 3. Escopo Selecionado (Sprint Backlog Detalhado com Atribuições Reais)

O Sprint Backlog da Sprint 1 integrou o núcleo dos endpoints obrigatórios da API e o pacote completo de interface, tema escuro e usabilidade desenvolvido na primeira semana:

| ID | Item de Trabalho / História | Tipo | Estimativa | Responsáveis | Status na Sprint |
| :---: | :--- | :---: | :---: | :--- | :---: |
| **H1** | **Cadastro de Usuário** com hashing Bcrypt e emissão de token JWT | Backend / Auth | 4 pts | **Kayky** | ✅ Concluído |
| **H2** | **Login Seguro** com Rate Limiting anti-bruteforce e Google Auth rápido | Backend / Auth | 3 pts | **Pedro Ravy** & **Giselly** | ✅ Concluído |
| **H3** | **Catálogo de Categorias** com princípio REST e cabeçalho `Cache-Control` | Backend / Cache | 2 pts | **Pedro Ravy** | ✅ Concluído |
| **H4** | **Publicação de Anúncios** com upload multipart e conversão Sharp WebP | Backend / Nuvem | 4 pts | **Kayky** | ✅ Concluído |
| **H8** | **Checkout de Pedidos** com integridade financeira travada no servidor | Backend / Checkout | 2 pts | **Pedro Ravy** | ✅ Concluído |
| **H10**| **Gestão de Endereços** do Usuário (CRUD em `/addresses`) | Backend / Perfil | 2 pts | **Pedro Ravy** | ✅ Concluído |
| **UI-S1-01** | **Revisão e correção do Modo Escuro** em todas as páginas do site | UI / Tema | 2 pts | **Raili** | ✅ Concluído |
| **UI-S1-02** | Corrigir ícone de Configurações na barra lateral (substituir emoji) | UI / Ícones | 1 pt | **Raili** | ✅ Concluído |
| **UI-S1-03** | Melhorar botões de "Meus Anúncios" (cores sólidas sem neon) | UI / Botoes | 1 pt | **Raili** | ✅ Concluído |
| **UI-S1-04** | **Padronizar Skeleton Loading** em todas as páginas do site | UX / Performance | 2 pts | **Josimar** | ✅ Concluído |
| **UI-S1-05** | Consertar exibição do nome do avaliador no modo escuro | Bugfix / Tema | 1 pt | **Josimar** | ✅ Concluído |
| **UI-S1-06** | Ajustar página de realizar anúncios (`vender.html`) para o modo escuro | UI / Formulário | 1 pt | **Josimar** | ✅ Concluído |
| **UI-S1-07** | **Pop-up de login/cadastro** ao interagir sem estar autenticado | UX / Auth | 2 pts | **Giselly** | ✅ Concluído |
| **UI-S1-08** | Botão "Entrar" no cabeçalho quando o usuário estiver desconectado | UI / Header | 1 pt | **Giselly** | ✅ Concluído |
| **UI-S1-09** | Padronizar botão "Vender" (tamanho uniforme entre telas e conversas) | UI / Layout | 1 pt | **Giselly** | ✅ Concluído |
| **UI-S1-10** | Corrigir deslocamento de layout causado pelo scroll (`scrollbar-gutter`) | CSS / Layout | 1 pt | **Giselly** | ✅ Concluído |
| **UI-S1-11** | Padronizar menus dropdown com design único em todo o site | UI / Componentes | 1 pt | **Giselly** | ✅ Concluído |
| **UI-S1-12** | Corrigir botão de filtros e alinhamento das setas (^) na Home | UI / Filtros | 1 pt | **Giselly** | ✅ Concluído |
| **UI-S1-13** | Reposicionar categorias e condição acima da descrição do anúncio | UI / Produto | 1 pt | **Giselly** | ✅ Concluído |
| **UI-S1-14** | Melhorar interface de denúncias (design mais limpo e intuitivo) | UI / Moderação | 1 pt | **Giselly** | ✅ Concluído |
| **UI-S1-15** | Discretizar botão Denunciar e remover informação de ticket abaixo | UX / Moderação | 1 pt | **Giselly** | ✅ Concluído |
| **UI-S1-16** | Denunciar vendedor diretamente a partir do perfil do vendedor | Feature / Denúncia | 1 pt | **Giselly** | ✅ Concluído |
| **UI-S1-17** | Redesenhar mensagens de propostas de valor negociado no chat | UI / Negociação | 2 pts | **Giselly** | ✅ Concluído |
| **UI-S1-18** | Criar barra lateral de filtros avançados ao pesquisar | Feature / Busca | 2 pts | **Giselly** | ✅ Concluído |

* **Total de Pontos Planejados:** **24 pontos**.

---

## 🗺️ 4. Mapa de Testes e Quadrantes Ágeis (Q1 a Q4)

Conforme a metodologia de Testes Ágeis de Lisa Crispin e Janet Gregory, os itens da Sprint 1 foram mapeados nos quatro quadrantes de teste:

* **Q1 (Apoio ao time / Técnico):** Testes unitários de schemas Zod, verificação do cabeçalho de cache e rotas Express.
* **Q2 (Apoio ao time / Negócio):** Testes funcionais de criação de conta, login com JWT, upload de fotos e checkout de ordens.
* **Q3 (Crítica ao produto / Negócio):** Testes de usabilidade da interface: Skeleton Loading, transição para modo escuro, pop-ups de autenticação e responsividade dos filtros.
* **Q4 (Crítica ao produto / Técnico):** Testes de rate limit anti-força bruta, integridade de preços no banco e testes de carga de arquivos multipart.

| História / Item | Tarefas e Responsável | Teste Derivado dos Critérios de Aceitação | Quadrante Ágil |
| :---: | :--- | :--- | :---: |
| **H1** | Criar rota `/auth/register` e validação Zod (**Kayky**) | `POST /auth/register` com dados válidos retorna 201 e JWT; e-mail duplicado retorna 409 | **Q2** (Funcional / Negócio) |
| **H2** | Implementar `POST /auth/login` e rate limiter (**Pedro Ravy**) | Bloqueio de requisições excessivas (HTTP 429) e validação de credenciais | **Q4** (Segurança / Técnico) |
| **H3** | Rota `/categories` com `Cache-Control` (**Pedro Ravy**) | `GET /categories` retorna 200 e header `Cache-Control: public, max-age=3600` | **Q1** (Princípio REST / Técnico) |
| **H4** | Configurar Multer, Sharp WebP e Supabase (**Kayky**) | Upload de anúncio com foto real e status ATIVO | **Q2** (Funcional / Negócio) |
| **H8** | Checkout seguro com trava de preço no banco (**Pedro Ravy**) | `POST /orders` sem autenticação retorna 401; dados adulterados são ignorados | **Q4** (Integridade Financeira) |
| **UI-S1-04** | Skeleton loading universal em listagens (**Josimar**) | Cards cinzas animados exibidos durante o carregamento assíncrono | **Q3** (Usabilidade / UX) |
| **UI-S1-01** | Cobertura do tema escuro em todas as telas (**Raili**) | Textos, fundos e modais legíveis com classe `.dark` ativa | **Q3** (Acessibilidade Visual) |
| **UI-S1-07** | Pop-up de login para ações restritas (**Giselly**) | Clique em favoritar ou comprar sem login abre modal amigável | **Q3** (Conversão / UX) |
