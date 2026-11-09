# 🔍 Sprint 1 Review e Retrospectiva (28/10/2026)

> **Data da Sessão:** 28/10/2026  
> **Scrum Master Facilitador:** Josimar  
> **Product Owner:** Kayky  
> **Participantes:** Kayky, Pedro Ravy, Josimar, Raili, Giselly  

---

## 🎪 Parte 1: Sprint Review (Inspeção do Produto)

### 1.1. Recordação do Sprint Goal
> *"Disponibilizar o esqueleto funcional e seguro da API v1 do Itaim Vende (cadastro com JWT, login com rate limiting, categorias com cache HTTP e publicação de anúncios com upload em nuvem), acompanhado de uma experiência de frontend padronizada (Skeleton Loading universal, suporte refinado ao modo escuro, pop-ups de autenticação e consistência de navegação e denúncias)."*

### 1.2. Demonstração dos Incrementos (Live Demo via Swagger UI, Postman e Navegador)
1. **Cadastro e Login Seguro (H1 e H2):** Demonstração do registro com hashing Bcrypt, emissão de JWT, rate limiting com HTTP 429 após 20 tentativas erradas e suporte a login rápido via Google OAuth.
2. **Catálogo de Categorias com Cache HTTP (H3):** Demonstração do cabeçalho `Cache-Control: public, max-age=3600` na rota `GET /api/v1/categories`, acelerando as respostas para menos de 10ms.
3. **Publicação de Anúncios com Foto em Nuvem (H4):** Upload de imagem na tela `vender.html`, conversão automática para WebP via Sharp e salvamento do arquivo no bucket do Supabase Storage.
4. **Checkout com Integridade Financeira (H8):** Demonstração de que o valor do pedido em `POST /api/v1/orders` é consultado diretamente do banco de dados pelo servidor, impedindo manipulações pelo cliente.
5. **Múltiplos Endereços (H10):** CRUD completo na aba de endereços consumindo a API real.
6. **Padronização do Skeleton Loading (UI-S1-04):** Apresentação do efeito visual de carregamento esqueleto em todas as listagens do site durante a busca assíncrona de dados.
7. **Suporte Completo ao Modo Escuro (UI-S1-01, 05, 06):** Demonstração de todo o site no tema escuro, com alto contraste no nome do avaliador e adaptação completa da página de criação de anúncios (`vender.html`).
8. **Fluxo de Autenticação e Navegação (UI-S1-07, 08, 09, 10, 11):** Pop-up de login amigável para ações restritas, botão "Entrar" no header para visitantes, botão "Vender" com dimensões padronizadas em todas as telas, eliminação de saltos de layout causados pelo scroll (`scrollbar-gutter: stable`) e dropdowns com design único.
9. **Interface de Denúncias e Negociação (UI-S1-12, 13, 14, 15, 16, 17, 18):** Botão de denúncia discretizado sem texto redundante de ticket, denúncia de vendedores direto no perfil, balões de proposta redesenhados no chat, reposicionamento das tags de categorias/condição acima da descrição e barra lateral de filtros avançados na busca.

---

### 1.3. Veredito do Product Owner (Aceite das Histórias e Tarefas)

O Product Owner (Kayky) inspecionou todas as entregas frente à Definition of Done (DoD) e aos critérios de aceitação:

| Item (ID) | Descrição do Item de Trabalho | Responsáveis | Estimativa | Decisão do PO | Justificativa / Observações |
| :---: | :--- | :--- | :---: | :---: | :--- |
| **H1** | Cadastro com hashing Bcrypt e emissão de JWT | Kayky | 4 pts | ✅ **Aceita** | Cumpre todos os requisitos de segurança e testes de schema. |
| **H2** | Login Seguro com Rate Limiting e Google Auth | Pedro & Giselly | 3 pts | ✅ **Aceita** | Bloqueio anti-bruteforce validado com sucesso e login rápido funcional. |
| **H3** | Categorias com princípio REST e `Cache-Control` | Pedro Ravy | 2 pts | ✅ **Aceita** | Princípio REST de cacheabilidade cumprido à risca. |
| **H4** | Publicação de Anúncios com foto em nuvem (Sharp WebP) | Kayky | 4 pts | ✅ **Aceita** | Upload em nuvem e otimização WebP funcionando perfeitamente. |
| **H8** | Checkout com integridade financeira no servidor | Pedro Ravy | 2 pts | ✅ **Aceita** | Teste automatizado comprova segurança e travamento de preços. |
| **H10**| Gestão de Múltiplos Endereços do Usuário | Pedro Ravy | 2 pts | ✅ **Aceita** | CRUD integrado ao banco de dados relacional. |
| **UI-S1-01** | Revisão e correção do Modo Escuro em todas as páginas | Raili | 2 pts | ✅ **Aceita** | Contrastes e legibilidade corrigidos em todo o ecossistema. |
| **UI-S1-02** | Corrigir ícone de Configurações na sidebar (substituir emoji) | Raili | 1 pt | ✅ **Aceita** | Ícone SVG padronizado com os demais itens da navegação. |
| **UI-S1-03** | Melhorar botões de Meus Anúncios (cores sólidas sem neon) | Raili | 1 pt | ✅ **Aceita** | Visual moderno com alto contraste e sem brilhos fluorescentes. |
| **UI-S1-04** | Padronizar Skeleton Loading em todas as páginas do site | Josimar | 2 pts | ✅ **Aceita** | Experiência de carregamento consistente e sem telas em branco. |
| **UI-S1-05** | Consertar exibição do nome do avaliador no modo escuro | Josimar | 1 pt | ✅ **Aceita** | Texto perfeitamente legível com tipografia semântica. |
| **UI-S1-06** | Ajustar página de realizar anúncios para o modo escuro | Josimar | 1 pt | ✅ **Aceita** | Formulário de venda 100% harmonizado com o tema escuro. |
| **UI-S1-07** | Pop-up de login/cadastro para ações de usuários deslogados | Giselly | 2 pts | ✅ **Aceita** | Bloqueia ações sensíveis de forma educada e converte o usuário. |
| **UI-S1-08** | Botão "Entrar" no cabeçalho quando o usuário estiver desconectado | Giselly | 1 pt | ✅ **Aceita** | Visibilidade imediata de login para visitantes da plataforma. |
| **UI-S1-09** | Padronizar botão "Vender" uniforme entre páginas e conversas | Giselly | 1 pt | ✅ **Aceita** | Altura e espaçamentos simétricos em toda a aplicação. |
| **UI-S1-10** | Corrigir deslocamento causado pela barra de scroll (`scrollbar-gutter`) | Giselly | 1 pt | ✅ **Aceita** | Layout perfeitamente estável sem trepidação ao rolar. |
| **UI-S1-11** | Padronizar menus dropdown com design único | Giselly | 1 pt | ✅ **Aceita** | Estilo visual consistente em todas as caixas de seleção. |
| **UI-S1-12** | Corrigir botão de filtros e alinhamento das setas na Home | Giselly | 1 pt | ✅ **Aceita** | Alinhamento visual e funcionamento das setas ajustados. |
| **UI-S1-13** | Reposicionar categorias e condição acima da descrição | Giselly | 1 pt | ✅ **Aceita** | Hierarquia de leitura do produto melhorada substancialmente. |
| **UI-S1-14** | Melhorar interface de denúncias (design limpo e intuitivo) | Giselly | 1 pt | ✅ **Aceita** | Modal amigável e direto para o usuário reportar fraudes. |
| **UI-S1-15** | Discretizar botão Denunciar e remover informação de ticket | Giselly | 1 pt | ✅ **Aceita** | Redução de poluição visual na página de produto. |
| **UI-S1-16** | Denunciar vendedor diretamente pelo perfil do vendedor | Giselly | 1 pt | ✅ **Aceita** | Recurso de segurança comunitária acessível no perfil público. |
| **UI-S1-17** | Redesenhar mensagens de propostas de valor negociado no chat | Giselly | 2 pts | ✅ **Aceita** | Apresentação simétrica e moderna para comprador e vendedor. |
| **UI-S1-18** | Criar barra lateral de filtros avançados ao pesquisar | Giselly | 2 pts | ✅ **Aceita** | Filtros rápidos facilitando a navegação no catálogo. |

* **Total de Pontos Entregues e Aceitos:** **24 pontos**.
* **Velocidade da Sprint 1 ($V_1$):** **24 pontos**.

---

## 🔄 Parte 2: Retrospectiva da Sprint 1 (Inspeção do Processo e da Forma de Trabalhar)

A equipe realizou a dinâmica dos três pilares (*Começar, Parar, Continuar*) para avaliar o fluxo de trabalho da primeira semana:

| Membro | 🚀 Começar a Fazer | 🛑 Parar de Fazer | ⭐ Continuar Fazendo |
| :--- | :--- | :--- | :--- |
| **Kayky** | Padronizar checagens de validação com respostas de erro prévias para não sobrecarregar rotas no submit | Deixar revisões de PR acumularem para o final do dia | Manter cobertura de testes automatizados desde a criação da rota |
| **Pedro Ravy** | Criar scripts automatizados de migração e índices antes de subir os endpoints | Submeter branches com commits genéricos sem citar o ID da história | Alinhamento técnico rápido via Discord quando surge dúvida de modelo |
| **Josimar** | Adicionar feedback de validação em tempo real com debounce nos campos do frontend | Testar integração apenas com dados estáticos no navegador | Pareamento rápido para destravar problemas de CORS e autenticação |
| **Raili** | Incluir validações visuais antes de disparar requisições para evitar chamadas 400 desnecessárias | Deixar de ler os schemas Zod do backend antes de fazer o formulário | Manter o layout consistente com a identidade visual do projeto |
| **Giselly** | Criar mensagens de erro amigáveis para o usuário quando o backend rejeitar por regras de negócio | Ignorar mensagens de erro no console durante os testes manuais | Apoiar nos testes cruzados entre frontend e backend |

---

## 🏆 3. Melhoria Escolhida da Sprint 1 (Ação Concreta para a Sprint 2)

Em votação consensual, a equipe definiu a seguinte melhoria de processo:

* **Descrição da Melhoria (MELH-1):** *"Implementar validação prévia em tempo real com debounce no frontend e tratamento padronizado de códigos de erro específicos (`code`) retornados pelo backend, garantindo que o usuário veja mensagens orientativas e claras antes mesmo de submeter o formulário."*
* **Responsáveis:** **Giselly** e **Pedro Ravy**.
* **Prazo de Aplicação:** Sprint 2 (a ser incorporado como item de trabalho no Sprint Backlog da Sprint 2 e verificado na Retro 2).
* **Critério de Sucesso:** Mensagens de erro amigáveis e debounce de 400ms em endpoints críticos (como checagem de username e busca de produtos).
