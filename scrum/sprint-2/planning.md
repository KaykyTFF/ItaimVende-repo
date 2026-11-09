# 🎯 Sprint 2 Planning — Planejamento da Sprint 2

> **Período da Sprint 2:** 29/10/2026 a 03/11/2026  
> **Scrum Master da Sprint 2:** Giselly *(alternância de papéis conforme regra do Scrum)*  
> **Product Owner:** Kayky  
> **Equipe de Desenvolvimento:** Kayky, Pedro Ravy, Josimar, Raili, Giselly  

---

## 🚀 1. Sprint Goal (Objetivo da Sprint 2)

> *"Consolidar a experiência de uso do Itaim Vende com as funcionalidades de inovação (busca unaccent sem acentos, sistema de segurança com cooldown de 30 dias para @), eliminando atritos de usabilidade (redesign da página 404, correção de bugs de sessão/deslogamento, painel de moderação e refinamentos visuais de perfil e filtros)."*

---

## 📊 2. Capacidade e Estimativa da Sprint 2

* **Velocidade Histórica (Sprint 1):** 24 pontos concluídos.
* **Capacidade Planejada para a Sprint 2:** 28 pontos de trabalho distribuídos entre fatias verticais de novas funcionalidades, correções críticas de usabilidade (UI/UX) e estabilidade de sessão.

---

## 🍰 3. Escopo Selecionado (Sprint Backlog Detalhado com Atribuições Reais)

O Sprint Backlog da Sprint 2 foi estruturado integrando as funcionalidades de inovação exigidas pelo professor e as correções prioritárias levantadas pela equipe:

| ID | Item de Trabalho / História | Tipo | Estimativa | Responsável | Status na Sprint |
| :---: | :--- | :---: | :---: | :--- | :---: |
| **H13** | **Cooldown de 30 dias para Username (@)** com persistência no banco e bloqueio visual | Inovação / Backend / UI | 5 pts | **Kayky** & **Giselly** | ✅ Concluído |
| **BUG-1** | **Correção de deslogamento indevido:** Apertar em notificações pedia login e deslogava | Bugfix / Sessão | 3 pts | **Kayky** | ✅ Concluído |
| **CFG-1** | Salvar endereços em Configurações, remover campos duplicados de rua/número e ajustar CEP | Backend / Form | 2 pts | **Kayky** | ✅ Concluído |
| **PRF-1** | Remover cartão de dados pessoais do perfil público e centralizar endereços em aba própria | Refactor / UI | 2 pts | **Kayky** | ✅ Concluído |
| **H5** | **Busca Fonética Sem Acentos (`unaccent`):** Consultas como `eletronicos` acham `Eletrônicos` | Inovação / Backend | 5 pts | **Pedro Ravy** | ✅ Concluído |
| **PRF-2** | Adicionar campo de **Biografia / Sobre você** no perfil e modal de edição rápida | Feature / UI | 2 pts | **Pedro Ravy** | ✅ Concluído |
| **PRF-3** | Remover fundo verde do perfil, padronizando para o design moderno branco-acinzentado | Refactor / UI | 1 pt | **Pedro Ravy** | ✅ Concluído |
| **UI-1** | Mudar a cor dos botões de "Meus Anúncios" para cores sólidas | UI / Estilo | 1 pt | **Pedro Ravy** | ✅ Concluído |
| **CAT-1** | Criar lista completa e robusta de categorias para navegação no site | Conteúdo / UI | 2 pts | **Josimar** | ✅ Concluído |
| **MOD-1** | Criar **Central de Tickets de Moderação** (`tickets.html`) para gestão de denúncias | Feature / Moderação | 3 pts | **Josimar** | ✅ Concluído |
| **BUG-2** | Corrigir bug do anúncio do controle remoto que aparecia fixo em qualquer anúncio | Bugfix / Frontend | 2 pts | **Josimar** | ✅ Concluído |
| **UI-2** | **Redesign completo da página 404** ("Página Não Encontrada") com a identidade do site (mascote) | UI / Identidade | 2 pts | **Giselly** | ✅ Concluído |
| **UI-3** | Ajustar design da mensagem de proposta de preço no chat e ícones | UI / Chat | 2 pts | **Giselly** | ✅ Concluído |
| **UI-4** | No perfil do vendedor, remover o item "tempo de resposta" | Refactor / Perfil | 1 pt | **Giselly** | ✅ Concluído |
| **UI-5** | Corrigir link do popup de cadastro que direcionava para tela antiga | Bugfix / Rotas | 1 pt | **Giselly** | ✅ Concluído |
| **UI-6** | Criar fluxo de pesquisa dedicada sem redirecionar forçadamente para categorias | Feature / Busca | 2 pts | **Giselly** | ✅ Concluído |
| **UI-7** | Remover card branco das categorias e adicionar slider/barra de preço nos filtros | UI / Catálogo | 2 pts | **Giselly** | ✅ Concluído |
| **UI-8** | Ocultar botão de WhatsApp quando o usuário não tiver número de telefone cadastrado | UX / Segurança | 1 pt | **Giselly** | ✅ Concluído |
| **UI-9** | Colocar ícone oficial do WhatsApp no botão e ajustar espaçamento dos botões do menu | UI / Ícones | 1 pt | **Giselly** | ✅ Concluído |
| **MELH-1**| **Melhoria da Retro 1:** Validação prévia de `@` com debounce de 400ms no frontend | Processo / UX | 2 pts | **Giselly** & **Pedro Ravy** | ✅ Concluído |
| **THM-1** | Corrigir modo escuro que piscava em branco por 1s ao trocar de página/atualizar (FOUC) | Bugfix / Tema | 2 pts | **Raili** | ✅ Concluído |
| **THM-2** | Ajustar design do chat e notificações no tema escuro | UI / Dark Mode | 2 pts | **Raili** & **Giselly** | ✅ Concluído |
| **MOB-1** | Ajustar comportamento de zoom indesejado no celular e trava de fundo no corte de fotos | Mobile / Responsivo | 2 pts | **Pedro Ravy** | ✅ Concluído |

---

## 🗺️ 4. Mapa de Testes e Rastreabilidade Técnica

* **Testes de Segurança e Regras de Negócio (Q4 / Q2):**
  * `backend/tests/username-cooldown.test.js`: 9 cenários validando o cooldown de 30 dias para o `@`, bloqueio com 403, persistência após logout e permissão contínua de alteração do nome de perfil.
  * Teste do middleware RBAC em `/reports` barrando compradores comuns.
  * Teste de consulta unaccent (`GET /products?search=eletronicos`).
* **Testes de Integração de Interface e Usabilidade (Q3):**
  * Verificação de ausência de erros no console ao navegar em notificações.
  * Validação da responsividade do modal de bio e do corte de imagem de perfil.
  * Teste visual da página 404 integrada à navegação principal.
