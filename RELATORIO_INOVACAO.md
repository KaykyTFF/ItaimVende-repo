# 📄 Relatório de Inovação Técnica — API Itaim Vende
**Disciplina:** Programação para Internet II | **Instituição:** Instituto Federal do Piauí (IFPI)  
**Professor:** Prof. Me. Julian Rodrigues Valério | **Data:** Outubro / 2026

---

## 1. O Problema Real
No semiárido piauiense, especialmente na microrregião de **Paulistana - PI (Vale do Itaim)**, pequenos produtores, agricultores familiares, artesãos e prestadores de serviços locais enfrentam dificuldades para comercializar seus produtos. Grandes plataformas de e-commerce impõem taxas elevadas, exigem logística de frete rodoviário inadequada para produtos frescos/regionais (como mel silvestre, queijo artesanal e caprinocultura) e ignoram as particularidades geográficas locais. O **Itaim Vende** resolve essa carência fornecendo uma infraestrutura digital confiável, ágil e customizada para aproximar compradores e vendedores regionais.

---

## 2. APIs Comparadas
Para validar o diferencial competitivo e técnico da nossa solução, analisamos duas referências do mercado:

| Critério | Mercado Livre Developers API | OLX Brasil (Classificados) | **Itaim Vende API (Nossa API)** |
| :--- | :--- | :--- | :--- |
| **Público & Nicho** | Grandes varejistas e marcas em escala nacional | Classificados genéricos com alcance estadual | **Comunidades e produtores do semiárido piauiense** |
| **Busca Textual** | Rígida por keywords padronizadas | Busca básica por texto exato | **PostgreSQL `unaccent` (insensível a acentos e termos locais)** |
| **Negociação** | Inexistente (compra direta fixa) | Chat básico sem contraproposta vinculada | **Propostas formais com status e recálculo no servidor** |
| **Eventos Offline** | Apenas Push Notification em App | Depende de login periódico no portal | **WebSockets em tempo real + fallback por e-mail transacional** |
| **Gestão de Mídia** | Storage fechado proprietário | Imagens mantidas em servidores próprios | **Sharp WebP + Purga de mídias órfãs no Supabase Storage** |

---

## 3. O Que a Nossa API Faz de Diferente (Eixos de Inovação)

1. **Eixo Dados e Domínio (Semiárido Piauiense):** Cobertura de categorias e localidades do Vale do Itaim (Paulistana, Acauã, Betânia, Jacobina, Queimada Nova), preenchendo o vazio de dados públicos abertos para a região.
2. **Eixo Regra de Negócio (Busca Fonética e Integridade Financeira):**
   - Utilização da extensão nativa do PostgreSQL `unaccent` indexada via Trigram (`pg_trgm`). Uma busca por `"eletronicos"` ou `"chapeu"` localiza `"Eletrônicos"` e `"Chapéu de Couro"` sem falhas causadas por digitação em dispositivos móveis.
   - Recálculo de integridade financeira no checkout (`/orders`): o frontend nunca envia preços; os valores unitários são consultados e travados diretamente no banco de dados.
3. **Eixo Tempo Real e Eventos (WebSockets + E-mails Transacionais):** A API estabelece canais bidirecionais via Socket.IO para mensagens e ofertas. Quando o destinatário não possui socket ativo conectado (`isUserOnline(userId) === false`), a API dispara automaticamente um e-mail transacional avisando o vendedor/comprador sobre a nova proposta.
4. **Eixo Moderação e Higienização de Nuvem:** Ao excluir um anúncio ou deferir uma denúncia de fraude, a API aciona o `storageAdapter.delete()`, purgando os arquivos do bucket do Supabase Storage e impedindo custos desnecessários com arquivos órfãos.

---

## 4. Como a Inovação Aparece nos Endpoints da API

| Endpoint | Verbo | Inovação / Regra de Negócio Implementada |
| :--- | :---: | :--- |
| `/api/v1/products` | `GET` | Busca fonética `unaccent` com filtros geográficos (`city`, `neighborhood`) e ordenação combinada. |
| `/api/v1/categories` | `GET` | Cache HTTP inteligente com cabeçalho `Cache-Control: public, max-age=300` e contagem agregada de produtos. |
| `/api/v1/chat/conversations/:id/messages` | `POST` | Mensagens e contrapropostas em tempo real com disparo de e-mail de alerta assíncrono caso o usuário esteja offline. |
| `/api/v1/chat/messages/:id/accept` | `PATCH` | Regra de negócio de fechamento de acordo comercial: altera status da proposta e notifica ambas as partes. |
| `/api/v1/orders` | `POST` | Validação de estoque e cálculo de montante financeiro calculado 100% no servidor via Prisma ORM. |
| `/api/v1/reports/:id/remove-product` | `POST` | Moderação com autorização RBAC (`ADMIN`/`MODERATOR`) e exclusão em cascata das fotos no bucket de nuvem. |
| `/api/v1/auth/verify-reset-code` | `POST` | Proteção contra força bruta em código OTP de 6 dígitos com invalidação automática após 5 erros. |

---
*Conclusão:* A **Itaim Vende API** transcende o modelo de CRUD simples, implementando regras de negócio voltadas a um problema socioeconômico real, garantindo segurança de ponta, observabilidade e escalabilidade em nuvem.
