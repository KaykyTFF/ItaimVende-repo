# 🔍 Sprint 2 Review e Retrospectiva (04/11/2026)

> **Data da Sessão:** 04/11/2026  
> **Scrum Master Facilitadora:** Giselly *(alternância de papéis conforme metodologia Scrum)*  
> **Product Owner:** Kayky  
> **Participantes:** Kayky, Pedro Ravy, Josimar, Raili, Giselly  

---

## 🎪 Parte 1: Sprint Review (Inspeção do Produto Final)

### 1.1. Recordação do Sprint Goal da Sprint 2
> *"Consolidar a experiência de uso do Itaim Vende com as funcionalidades de inovação (busca unaccent sem acentos, sistema de segurança com cooldown de 30 dias para @), eliminando atritos de usabilidade (redesign da página 404, correção de bugs de sessão/deslogamento, painel de moderação e refinamentos visuais de perfil e filtros)."*

### 1.2. Demonstração dos Incrementos (Live Demo no Swagger, Postman e Navegador)
1. **Sistema de Cooldown de 30 Dias para Username (H13):** Demonstração da regra no backend onde o `@` só pode ser alterado a cada 30 dias com HTTP 403 (`USERNAME_COOLDOWN_ACTIVE`), com bloqueio visual e contador de dias na tela de configurações. Alteração do nome de perfil livre a qualquer momento.
2. **Correção de Deslogamento Involuntário (BUG-1):** Demonstração de navegação em notificações e atualização de perfil sem que o usuário seja desconectado indevidamente por respostas 403 no interceptor HTTP.
3. **Redesign Oficial da Página 404 (UI-2):** Demonstração da nova tela "Página Não Encontrada" estilizada com a identidade do Itaim Vende (mascote tatu com mapa de Paulistana) e botões de retorno funcionais.
4. **Painel de Moderação e Tickets Assíncrono (MOD-1):** Demonstração da tela `tickets.html` carregando denúncias assincronamente logo ao entrar, sem spinner travado.
5. **Correção do Anúncio do Controle Remoto (BUG-2):** Demonstração de navegação em produtos onde o anúncio fixo de controle remoto foi removido e substituído por "Outros anúncios da região" dinâmicos.
6. **Busca Fonética Sem Acentos (H5):** Demonstração no endpoint `GET /api/v1/products?search=eletronicos` retornando produtos com acento via extensão `unaccent`.
7. **Página Dedicada de Pesquisa e Filtros (UI-6 e UI-7):** Demonstração da pesquisa sem redirecionar forçadamente para categorias, com slider de preço e sem o card branco nas categorias.
8. **Refinamentos de Perfil e Configurações (PRF-1, PRF-2, PRF-3, CFG-1):** Campo de Biografia integrado, remoção do fundo verde para o padrão branco-acinzentado, salvamento de endereço em configurações com campos separados de rua e número e validação de CEP.
9. **Contato e Chat (UI-8, UI-9, UI-3):** Botão de WhatsApp exibido apenas se houver número cadastrado com ícone oficial, e novo design da caixa de proposta de negociação no chat.

---

### 1.3. Veredito do Product Owner (Aceite das Histórias e Tarefas da Sprint)

O Product Owner (Kayky) inspecionou individualmente cada entrega frente aos critérios de aceitação e à Definition of Done (DoD):

| Item (ID) | Descrição do Item / Tarefa | Responsável | Estimativa | Decisão do PO | Justificativa / Observações |
| :---: | :--- | :--- | :---: | :---: | :--- |
| **H13** | **Cooldown de 30 dias para Username (@)** com persistência no banco e bloqueio visual | Kayky & Giselly | 5 pts | ✅ **Aceita** | Cooldown no servidor, 9 testes automatizados passando e bloqueio amigável no frontend. |
| **BUG-1** | **Correção de deslogamento indevido:** Apertar em notificação deslogava da conta | Kayky | 3 pts | ✅ **Aceita** | Interceptor ajustado em `api-core.js`; sessão 100% estável. |
| **CFG-1** | Salvar endereço em Configurações, mudar campos de rua/número e ajustar CEP | Kayky | 2 pts | ✅ **Aceita** | Persistência correta no banco e validação de formato de CEP. |
| **PRF-1** | Remover cartão de dados pessoais do perfil público (endereço exclusivo em endereços) | Kayky | 2 pts | ✅ **Aceita** | Privacidade preservada; dados redundantes removidos. |
| **H5** | **Busca Fonética Unaccent:** Consultas sem acento encontram produtos com acento | Pedro Ravy | 5 pts | ✅ **Aceita** | Inovação com extensão PostgreSQL validada com sucesso. |
| **PRF-2** | Adicionar campo de **Biografia / Sobre você** no perfil e modal de edição rápida | Pedro Ravy | 2 pts | ✅ **Aceita** | Campo persiste no banco e renderiza corretamente no perfil. |
| **PRF-3** | Remover fundo verde do perfil, padronizando para o design moderno branco-acinzentado | Pedro Ravy | 1 pt | ✅ **Aceita** | Interface limpa e padronizada com o restante do site. |
| **UI-1** | Mudar cor dos botões do painel "Meus Anúncios" para cores sólidas | Pedro Ravy | 1 pt | ✅ **Aceita** | Contraste e visibilidade aprovados nos padrões de acessibilidade. |
| **CAT-1** | Criar lista completa e robusta de categorias para navegação no site | Josimar | 2 pts | ✅ **Aceita** | Taxonomia abrangente facilitando a navegação do comprador. |
| **MOD-1** | Criar Central de Tickets de Moderação (`tickets.html`) com carregamento assíncrono | Josimar | 3 pts | ✅ **Aceita** | Tickets carregam automaticamente ao abrir a página sem travar. |
| **BUG-2** | Remover anúncio fixo do controle remoto e exibir anúncios reais da região | Josimar | 2 pts | ✅ **Aceita** | Anúncio mockado eliminado; carrossel de vizinhança dinâmico. |
| **UI-2** | **Redesign completo da página 404** com identidade visual do site (mascote tatu) | Giselly | 2 pts | ✅ **Aceita** | Visual profissional com ilustração exclusiva e botões úteis. |
| **UI-3** | Ajustar design da mensagem de proposta de preço no chat e ícones | Giselly | 2 pts | ✅ **Aceita** | Layout dos balões de negociação limpo e moderno. |
| **UI-4** | Remover o item "tempo de resposta" no perfil do vendedor | Giselly | 1 pt | ✅ **Aceita** | Informação desnecessária removida da visualização pública. |
| **UI-5** | Corrigir link do popup de cadastro que direcionava para tela antiga | Giselly | 1 pt | ✅ **Aceita** | Redirecionamento correto para o fluxo atual de autenticação. |
| **UI-6** | Criar fluxo de pesquisa dedicada sem redirecionar forçadamente para categorias | Giselly | 2 pts | ✅ **Aceita** | Página `/pesquisa.html` funcional com filtros combinados. |
| **UI-7** | Remover card branco das categorias e adicionar barra de preço nos filtros | Giselly | 2 pts | ✅ **Aceita** | Slider de faixa de preço dinâmico e visual integrado. |
| **UI-8** | Ocultar botão de WhatsApp quando usuário não tiver número cadastrado | Giselly | 1 pt | ✅ **Aceita** | Evita links quebrados para `wa.me/undefined`. |
| **UI-9** | Colocar ícone oficial do WhatsApp e ajustar espaçamento dos botões do menu | Giselly | 1 pt | ✅ **Aceita** | Ícone verde oficial e espaçamentos simétricos no menu. |
| **MELH-1**| **Melhoria da Retro 1:** Validação prévia de `@` com debounce de 400ms no frontend | Giselly & Pedro | 2 pts | ✅ **Aceita** | Feedback instantâneo evitando erros 400 no formulário. |
| **THM-1** | Corrigir FOUC (flash de modo claro por 1s) ao atualizar ou trocar de página | Raili | 2 pts | ✅ **Aceita** | Script no head amenizou significativamente o flash inicial. |
| **THM-2** | Ajustar design do chat no modo escuro | Raili & Giselly | 2 pts | ✅ **Aceita** | Contraste e legibilidade das mensagens corrigidos no tema escuro. |
| **MOB-1** | Ajustar zoom involuntário no celular e trava de fundo no recorte de fotos | Pedro Ravy | 2 pts | ✅ **Aceita** | `overflow: hidden` no modal de foto e meta tags de zoom ajustadas. |

* **Total de Pontos Entregues e Aceitos:** **28 pontos**.
* **Velocidade Efetiva da Sprint 2 ($V_2$):** **28 pontos**.

---

## 📋 Parte 2: Retrospectiva da Sprint 2 (Perguntas Obrigatórias da Atividade)

Em estrito atendimento às diretrizes da atividade acadêmica (Página 5 do guia oficial), a Retrospectiva da Sprint 2 responde objetivamente às três questões formuladas pelo professor:

### ❓ Pergunta 1: Nossa velocidade da Sprint 2 foi maior, igual ou menor que a da Sprint 1? Por quê?
> **Resposta da Equipe:**  
> A nossa velocidade na Sprint 2 foi **maior** (**28 pontos entregues contra 24 pontos na Sprint 1**), demonstrando a evolução da maturidade técnica da equipe.  
>  
> **Por quê?**  
> Quatro motivos explicam esse salto de produtividade:
> 1. **Base Arquitetural Já Pronta:** Na Sprint 1, perdemos tempo configurando Prisma, migrations no PostgreSQL, Express 5 e CORS. Na Sprint 2, a arquitetura já estava rodando, permitindo focar 100% no desenvolvimento de regras de negócio e refinamento visual.
> 2. **Aplicação Imediata da Melhoria da Retro 1:** A adoção de validações assíncronas com debounce (MELH-1) e códigos de erro semânticos reduziu drasticamente o retrabalho entre backend e frontend.
> 3. **Divisão Eficiente de Responsabilidades:** Com Kayky e Pedro focados em segurança e regras de banco, e Josimar, Raili e Giselly focados na experiência do usuário e resolução de bugs de interface, as entregas fluíram em paralelo sem gargalos.
> 4. **Resolução Rápida de Impedimentos:** A Scrum Master Giselly atuou prontamente nos impedimentos do Windows (DLL do Prisma) e nos bugs de sessão do frontend, evitando paradas prolongadas.

---

### ❓ Pergunta 2: Qual história foi devolvida ou ficou incompleta, e que critério de aceitação ou item da DoD faltou?
> **Resposta da Equipe:**  
> Durante o ciclo da Sprint 2, a história **H13 (Cooldown de 30 Dias para Username)** foi inicialmente devolvida pelo Product Owner (Kayky) para refinamento técnico antes de receber o aceite final, por não atender plenamente à Definition of Done e aos critérios de aceitação:
> * **O que faltava:** No primeiro esboço da implementação, qualquer submissão do formulário de perfil (como atualizar apenas o nome completo, a biografia ou a foto) enviava o objeto de usuário completo. O backend interpretava o envio do campo `username` existente como uma nova tentativa de alteração do `@`, disparando o bloqueio de 30 dias indevidamente ou impedindo que o usuário salvasse sua biografia.
> * **Critério violado:** O critério explícito de aceitação: *"Essa regra deve ser aplicada exclusivamente ao nome de usuário (@), não ao nome de perfil (nome completo/exibição). O nome de perfil e demais dados devem continuar podendo ser alterados normalmente, sem qualquer restrição de prazo nem reinício de contagem"*.
> * **Como foi resolvido:** O backend em `auth.profile.service.js` foi corrigido para comparar se o novo username é estritamente diferente do username atual (`cleanUsername !== currentUser.username.toLowerCase()`). Se forem iguais, a verificação de 30 dias é ignorada com sucesso. A história só foi aceita após o **Cenário 8** da suíte automatizada `username-cooldown.test.js` comprovar que alterar nome de perfil não consome nem reinicia o carimbo de data.
> * **Itens de Melhoria Contínua:** Além disso, os ajustes finos de transição de tema escuro e comportamento de zoom em navegadores móveis muito específicos foram mapeados como itens de polimento contínuo para não comprometer a entrega do núcleo funcional da sprint.

---

### ❓ Pergunta 3: A melhoria da Retro 1 funcionou? Qual evidência no repositório mostra isso?
> **Resposta da Equipe:**  
> **Sim, funcionou com excelência.**  
>  
> **Qual evidência no repositório mostra isso?**  
> As evidências concretas registradas no repositório são:
> 1. **No Frontend (`frontend/js/pages/perfil/configuracoes/config-conta.js`):** A implementação da variável `timeoutValidacaoUsername` com debounce de 400ms e chamada ao método `window.ItaimApi.auth.verificarDisponibilidadeUsername(val)`. Isso garante que o usuário receba resposta em tempo real sobre a disponibilidade do seu `@` antes de clicar no botão salvar.
> 2. **Tratamento Específico de Códigos de Erro (`err.data?.code`):** O frontend captura os códigos `USERNAME_COOLDOWN_ACTIVE` e `USERNAME_TAKEN`, exibindo alertas contextuais precisos sem disparar erros genéricos nem causar deslogamentos de sessão.
> 3. **No Backend (`backend/src/services/auth/auth.profile.service.js`):** A rota dedicada `GET /api/v1/auth/check-username` com a função exportada `checkUsernameAvailability()`, desenvolvida sob demanda para atender à melhoria priorizada na Retrospectiva da Sprint 1.
