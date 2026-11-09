# Relatório de Inovação Técnica — API Itaim Vende

**Disciplina:** Programação para Internet II | **Instituição:** Instituto Federal do Piauí (IFPI)  
**Docente:** Prof. Me. Julian Rodrigues Valério | **Data de Apresentação:** 09/11/2026  
**Repositório:** `marketplace-frontend` | **Padrão:** RESTful / OpenAPI 3.0.3 / Node.js & PostgreSQL  

---

## 1. O Problema Real

No semiárido piauiense, em especial na microrregião de **Paulistana - PI (Vale do Itaim)** e municípios circunvizinhos (Acauã, Betânia, Jacobina, Queimada Nova), pequenos agricultores familiares, artesãos e prestadores de serviços enfrentam sérias barreiras para inserção comercial digital. Plataformas de abrangência nacional impõem tarifas onerosas, dependem de malhas logísticas rodoviárias incompatíveis com produtos regionais perecíveis (como mel silvestre, queijo artesanal e ovinocaprinos) e desconsideram particularidades geográficas locais. O **Itaim Vende** resolve essa carência fornecendo uma infraestrutura digital confiável, ágil e contextualizada para conectar compradores e vendedores da região.

---

## 2. APIs Comparadas

| Critério | Mercado Livre Developers API | OLX Brasil (Classificados) | Itaim Vende API (Solução Proposta) |
| :--- | :--- | :--- | :--- |
| **Público e Nicho** | Grandes varejistas e marcas nacionais | Classificados generalistas estaduais | **Comunidades e produtores do semiárido piauiense** |
| **Busca Textual** | Rígida por keywords padronizadas | Busca textual básica exata | **PostgreSQL `unaccent` (tolerante a acentos e termos locais)** |
| **Negociação** | Transação direta de preço fixo | Chat comum sem proposta vinculada | **Propostas formais com status e recálculo no servidor** |
| **Eventos Offline** | Push notifications via aplicativo | Apenas via login periódico no portal | **WebSockets em tempo real + fallback por e-mail transacional** |
| **Gestão de Mídia** | Storage fechado proprietário | Servidores internos proprietários | **Sharp WebP + Purga de mídias órfãs no Supabase Storage** |

---

## 3. O Que a Nossa API Faz de Diferente (Eixos de Inovação)

1. **Eixo Dados e Domínio & Impacto Social:** Atendimento a um nicho regional desprovido de cobertura por APIs públicas comerciais, catalogando produtores, bairros e categorias típicas do Vale do Itaim, estimulando a economia circular do semiárido piauiense.
2. **Eixo Regra de Negócio:**
   - **Busca Fonética Normalizada:** Utilização de extensão nativa do PostgreSQL `unaccent` combinada a índices Trigram (`pg_trgm`). Consultas como `"eletronicos"` ou `"chapeu"` localizam `"Eletrônicos"` e `"Chapéu de Couro"`, reduzindo drasticamente falhas de conversão em dispositivos móveis.
   - **Integridade Financeira Rígida no Servidor:** No checkout (`POST /orders`), a API descarta preços enviados pelo cliente e recalcula integralmente os valores vigentes a partir do banco de dados, prevenindo fraudes de adulteração de requisições.
   - **Moderação com Higienização de Storage:** Ao deferir uma denúncia (`DELETE /reports/:id/product`), a API remove os registros do banco e executa a purga física dos arquivos binários no bucket do Supabase Storage, impedindo custos e acúmulo de mídias órfãs.
3. **Eixo Tempo Real e Eventos:** A API gerencia conexões bidirecionais via Socket.IO para mensagens de chat, propostas de negociação e notificações. Caso o destinatário não esteja conectado (`isUserOnline(userId) === false`), um pipeline assíncrono dispara automaticamente e-mail transacional de contingência.
4. **Eixo Experiência do Consumidor:** Implementação de cache HTTP inteligente com cabeçalho `Cache-Control: public, max-age=300` para recursos públicos de categorias, além de paginação e filtragem multidimensional em coleções de produtos e notificações.

---

## 4. Como a Inovação Aparece nos Endpoints da API

| Endpoint | Verbo | Inovação / Regra de Negócio Implementada |
| :--- | :---: | :--- |
| `/api/v1/products` | `GET` | Busca fonética `unaccent` com filtros geográficos (`city`, `neighborhood`) e paginação combinada. |
| `/api/v1/categories` | `GET` | Cache HTTP inteligente (`Cache-Control: public, max-age=300`) com contagem agregada de anúncios ativos. |
| `/api/v1/chat/conversations/:id/messages` | `POST` | Mensagens e ofertas em tempo real via WebSocket com disparo de e-mail de alerta caso usuário esteja offline. |
| `/api/v1/chat/messages/:id/status` | `PATCH` | Fechamento de acordo comercial: transição atômica de status de contraproposta e emissão de eventos. |
| `/api/v1/orders` | `POST` | Validação de estoque e cálculo de montante financeiro apurado 100% no servidor via Prisma ORM. |
| `/api/v1/reports/:id/product` | `DELETE` | Moderação restrita (RBAC) com encerramento de denúncia e purga física de fotos no Supabase Storage. |
| `/api/v1/notifications/counts` | `GET` | Agregação analítica em tempo real de contadores de notificações não lidas por categoria de evento. |

---

*Conclusão:* A **Itaim Vende API** transcende o modelo de CRUD básico, resolvendo um desafio socioeconômico real por meio de princípios arquiteturais RESTful rigorosos, governança de dados, observabilidade e integração em nuvem.
