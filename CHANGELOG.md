# 📋 Registro de Alterações (Changelog) — Itaim Vende

Todas as mudanças notáveis deste projeto estão documentadas neste arquivo.  
O formato baseia-se nas diretrizes do [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/) e adota o [Versionamento Semântico (SemVer)](https://semver.org/lang/pt-BR/).

---

## [2.0.0] — 2026-10-27

### 🌟 Visão Geral do Lançamento
A versão **2.0.0** representa uma transformação completa do **Itaim Vende**, evoluindo de um protótipo com dados estáticos para uma **plataforma RESTful em produção**, com arquitetura em camadas, banco de dados relacional em nuvem (PostgreSQL / Supabase), testes automatizados, documentação interativa OpenAPI 3.0, WebSockets em tempo real e blindagem de segurança para atender integralmente às exigências da disciplina de *Programação para Internet II (IFPI)*.

---

### 🚀 Novas Funcionalidades (Added)

#### 1. Autenticação, Recuperação de Senha & Sessão
- **Fluxo Completo de Esqueci Minha Senha:** Rotas `POST /api/v1/auth/forgot-password`, `POST /api/v1/auth/verify-reset-code` e `POST /api/v1/auth/reset-password`.
- **Código OTP de 6 Dígitos:** Geração de códigos temporários com validade de 1 hora disparados por e-mail transacional.
- **Proteção Anti-Força Bruta no OTP:** O sistema limita em 5 tentativas erradas por código; ao atingir o limite, o código é descartado e a requisição responde com `429 Too Many Requests`.
- **Anti-Enumeração de Contas:** A consulta de perfil público (`GET /api/v1/auth/user/:id`) bloqueia consultas por e-mail e não vaza histórico de compras de usuários comuns.
- **Rate Limiting Reforçado:** Limitação estrita de requisições por IP nas rotas de login e cadastro (máx. 15 requisições a cada 15 minutos).

#### 2. Busca Fonética & Inteligência Regional (Inovação Técnica)
- **PostgreSQL `unaccent`:** Integração da extensão nativa de remoção de acentos com índices Trigram (`pg_trgm`). Buscas como `?search=eletronicos` ou `?search=chapeu` encontram registros cadastrados como `"Eletrônicos"` e `"Chapéu de Couro"`.
- **Filtros Geográficos do Semiárido:** Segmentação de anúncios por cidades do Vale do Itaim (Paulistana, Acauã, Betânia, Jacobina, etc.) e bairros locais.
- **Filtros Combinados:** Suporte completo na API para ordenação (`newest`, `price_asc`, `price_desc`, `popular`), faixa de preço (`minPrice`, `maxPrice`) e condição do item (`NOVO`, `USADO`).

#### 3. Tempo Real & E-mails Transacionais
- **WebSockets via Socket.IO:** Negociação e troca de mensagens em tempo real no chat.
- **Propostas Formais de Preço:** Sistema de contraproposta no chat com botões de Aceitar/Recusar vinculados a rotas REST (`PATCH /api/v1/chat/messages/:id/accept`).
- **Detecção de Presença & Fallback Offline:** A API detecta quando o usuário está offline (`isUserOnline(userId) === false`) e dispara automaticamente e-mails transacionais (via Resend ou Nodemailer) avisando sobre novas mensagens e ofertas recebidas.

#### 4. Armazenamento em Nuvem & Otimização de Imagens
- **Supabase Storage Adapter:** Envio automático de fotos de anúncios e avatares para o bucket de nuvem `marketplace` do Supabase.
- **Compressão Inteligente com Sharp:** Auto-rotação EXIF de fotos tiradas por smartphones, redimensionamento proporcional (máx. 1600px) e conversão automática para formato `.webp` com compressão sRGB (economia de 75% a 93% no tamanho dos arquivos).
- **Purga Automática de Mídias Órfãs:** Hook implementado no serviço de produtos que invoca `storageAdapter.delete()` para remover fotos do bucket do Supabase quando um anúncio é excluído ou banido por fraude.

#### 5. Painel de Moderação & Gestão de Denúncias
- **Protocolos de Denúncia:** Geração de tickets com protocolo rastreável (ex: `TK-84A12B`) para relatórios de fraude (`POST /api/v1/reports/:productId`).
- **Controle de Acesso RBAC:** Rotas administrativas restritas aos papéis `ADMIN` e `MODERATOR`.
- **Ações de Moderação:** Remoção de anúncios fraudulentos com purga de mídia, suspensão de contas de infratores e encerramento de chamados.

#### 6. Documentação & Testes Automatizados (Critérios IFPI)
- **OpenAPI 3.0.3 & Swagger UI:** Documentação interativa completa disponível nas rotas `/api-docs` e `/api/v1/docs`, além de exportação no arquivo `backend/src/docs/openapi.json`.
- **Suíte de 12 Testes Automatizados:** Implementação com `node:test` e `node:assert/strict` cobrindo 100% dos requisitos do edital (execução via `npm test`).
- **Coleção Postman v2.1 Oficial:** Arquivo `itaim-vende.postman_collection.json` na raiz, cobrindo os 12 recursos da API com exemplos de sucesso (200, 201, 204) e erros controlados (400, 401, 403, 404, 409, 429).
- **Relatório de Inovação de 1 Página:** Documento `RELATORIO_INOVACAO.md` comparando a solução contra as APIs do Mercado Livre e OLX.
- **Declaração Obrigatória de IA:** Seção formal no `README.md` especificando os tópicos de apoio da Inteligência Artificial.

---

### 🔒 Segurança & Blindagem Defensiva (Security)
- **Correção de Path Traversal (LFI):** Blindagem absoluta contra sequências `..`, barras invertidas e caracteres de escape nas rotas de assets estáticos e uploads.
- **Eliminação de Segredos no Código:** Credenciais sensíveis de banco PostgreSQL e chaves de assinatura JWT foram completamente removidas do código-fonte e movidas para variáveis de ambiente com modelo `.env.example`.
- **Isolamento de Bypass em Desenvolvimento:** Remoção de brechas de acesso privilegiado; rotas de diagnóstico do sistema restritas estritamente para `NODE_ENV !== 'production'`.
- **Proteção XSS Universal:** Middleware de higienização de entrada ativo em todas as rotas sanitizando tags HTML e scripts maliciosos.

---

### 🔄 Alterações & Otimizações (Changed)
- **Padronização REST de Verbos e Status:**
  - Operações de exclusão (`DELETE /products/:id`, `DELETE /addresses/:id`, `DELETE /reviews/:id`) ajustadas para retornar status **`204 No Content`**.
  - Padronização de todas as respostas de erro para o formato obrigatório: `{ success: false, code, message, details }`.
  - Cache HTTP ativo em `/api/v1/categories` via cabeçalho `Cache-Control: public, max-age=300`.
- **Integridade Financeira do Checkout:** A rota `POST /api/v1/orders` agora ignora preços enviados pelo frontend e consulta os valores unitários diretamente no banco de dados, garantindo cálculo confiável do montante total.
- **Versionamento Semântico:** Atualização da versão do projeto e das rotas de diagnóstico para `v2.0.0`.

---

## [1.0.0] — Versão Legada Inicial
- Protótipo estático do frontend com dados simulados em `localStorage`.
- Cadastro e login simples sem recuperação de senha.
- Upload de imagens local sem otimização ou suporte a nuvem.
- Ausência de testes automatizados e documentação formal OpenAPI.
