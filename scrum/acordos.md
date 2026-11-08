# Acordos de Trabalho, Papeis, Visao do Produto e Definition of Done

**Instituto Federal do Piauí — Campus Paulistana**  
**Disciplina:** Engenharia de Software III  
**Professor:** Me. Julian Rodrigues Valério  
**Projeto:** Itaim Vende — API RESTful de Comercio Regional  
**Sprint 0:** 27/10/2026 e 28/10/2026  

---

## 1. Nossa Equipe e Divisao de Papeis

Para organizar o desenvolvimento do Itaim Vende com Scrum, nos dividimos em papeis claros para facilitar os processos, mantendo todo mundo programando e testando no dia a dia.

| Integrante | Foco Principal | Papel na Sprint 1 | Papel na Sprint 2 |
| :--- | :--- | :--- | :--- |
| **Kayky** | Lider Tecnico e Backend | Product Owner | Product Owner |
| **Pedro Ravy** | Backend | Desenvolvedor | Desenvolvedor |
| **Josimar** | Frontend | Scrum Master | Desenvolvedor |
| **Giselly** | Frontend | Desenvolvedora | Scrum Master |
| **Raili** | Frontend | Desenvolvedora | Desenvolvedora |

* **Stakeholder:** Prof. Me. Julian Rodrigues Valério, que atua validando nossas entregas, tirando duvidas de negocio e acompanhando as demonstracoes nas Reviews.
* **Product Owner:** O Kayky ficou como PO nas duas sprints para manter a visao geral do produto alinhada do comeco ao fim.
* **Alternancia do Scrum Master:** Seguindo a regra da atividade, alternamos quem facilitava as sprints. O Josimar foi o Scrum Master da Sprint 1 e a Giselly assumiu a funcao na Sprint 2.
* **Qualidade coletiva:** Nao temos a figura isolada de testador no grupo. Todos nos programamos e somos responsaveis por criar e rodar os testes automatizados das funcionalidades que desenvolvemos.

---

## 2. Product Goal — Visao do Produto

Completando o modelo pedido na atividade:

> **Nossa API ajuda** pequenos produtores rurais, comerciantes locais, prestadores de servicos e moradores de Paulistana e regiao do Vale do Itaim **a** negociar, anunciar, comprar e vender produtos e servicos de maneira direta, confiavel e sem intermediarios, **porque** disponibiliza uma plataforma regional com busca que tolera erros de digitacao, chat com envio de propostas de preco, regras de seguranca cadastral e calculo financeiro travado no servidor.  
>  
> **Diferente de** plataformas genericas como OLX e Mercado Livre, **a nossa API e plataforma** foi pensada para a realidade do semiárido piauiense, trazendo busca fonetica sem acentos (`unaccent`), filtros por bairros e cidades vizinhas, moderacao com limpeza automatica de fotos na nuvem e protecao contra golpes com intervalo de 30 dias para mudar o nome de usuario (`@`).

---

## 3. Definition of Done — Criterios de Conclusao

No nosso time, uma historia so e considerada pronta se cumprir todos os dez itens abaixo:

1. **Revisao por colega:** O codigo so entra na branch principal por meio de Pull Request revisado e aprovado por outro integrante da equipe. Ninguem sobre codigo direto na main.
2. **Testes automatizados passando:** Todos os testes unitarios e de integracao da funcionalidade foram escritos e estao passando com sucesso na esteira do GitHub Actions, mantendo os 88 testes do projeto aprovados.
3. **Criterios de aceitacao conferidos:** Validamos todos os cenarios de Dado, Quando e Entao junto com o Product Owner.
4. **Documentado no OpenAPI:** O endpoint, seus campos de envio e as respostas de sucesso e erro estao descritos na documentacao interativa do Swagger UI e no arquivo openapi.json.
5. **Colecao de testes atualizada:** A colecao do Postman contem os exemplos de chamada de sucesso e os casos de erro da funcionalidade.
6. **Seguranca de chaves e senhas:** Nenhuma senha, token ou chave de servico externo foi enviada para o GitHub. Tudo fica protegido em variaveis de ambiente no arquivo .env.
7. **Instrucoes do README funcionando:** A aplicacao roda normalmente seguindo os passos de instalacao descritos no README.
8. **Item da equipe 1 — Validacao rigorosa com Zod:** Toda entrada de dados em rotas de cadastro ou atualizacao passa por validacao com schemas Zod, devolvendo erros no formato padrao com code, message e details.
9. **Item da equipe 2 — Integracao visual sem erros no console:** As telas do frontend mostram estados de carregamento com efeito shimmer e tratam erros sem quebrar a aplicacao nem exibir mensagens no console do navegador.
10. **Item da equipe 3 — Limpeza de fotos na nuvem:** Quando um anuncio e apagado ou removido pela moderacao, o arquivo de imagem correspondente e excluido do bucket do Supabase Storage para nao deixar lixo na nuvem.

---

## 4. Acordos de Trabalho

Na Sprint 0, nos reunimos e combinamos as regras de trabalho que seguimos durante todo o projeto:

1. **Canal de comunicacao e rotina das Dailies:**  
   - Nosso acompanhamento diario e feito pelo grupo do WhatsApp. Como a noite temos aula no campus, nao fazia sentido marcar chamada fixa nesse horario.
   - A distribuicao de demandas e feita por meio de listas no WhatsApp: passamos o que cada um precisa fazer e vamos mandando no grupo o que estamos fazendo, o que terminamos e se alguem encontrou algum problema.
   - Nos dias de aula presencial no IFPI Campus Paulistana, nos juntamos no laboratorio para conversar sobre o andamento, planejar o que falta adicionar, testar o sistema juntos procurando bugs e pensar na evolucao da plataforma.

2. **Fluxo do Git e revisao de codigo:**  
   - Criamos branches separadas para cada funcionalidade ou correcao e ninguem sobe codigo direto na branch main.
   - Sempre que alguem abre um Pull Request, outro colega revisa o codigo antes de fazer o merge. Sempre que possivel, quem faz backend revisa frontend e vice-versa para que todos conhecam o sistema como um todo.

3. **O que fazer quando alguem travar:**  
   - Se alguem passar mais de 4 horas travado em algum problema de banco, rota, CORS ou integracao, avisa no grupo na mesma hora.
   - O Scrum Master organiza uma sessao de programacao em dupla com outro integrante para destravarmos o problema juntos.

4. **Commits organizados:**  
   - Colocamos mensagens claras citando o que foi feito e a historia correspondente para sabermos exatamente o historico de cada alteracao.

5. **Responsabilidade com a qualidade:**  
   - Nao consideramos uma tarefa finalizada sem antes criar e rodar os testes dela localmente e no pipeline de integracao continua.
