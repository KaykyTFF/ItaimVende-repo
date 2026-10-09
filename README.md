# 🛒 Itaim Vende

A plataforma digital que conecta a comunidade de **Paulistana e região (Piauí)** para compras, vendas e negociações seguras.

---

## 🏛️ Arquitetura do Repositório

O repositório adota uma separação limpa entre **Frontend** e **Backend**, com arquitetura modular orientada a funcionalidades:

```
ItaimVende-repo/
├── frontend/                     # Interface Web Moderna e Modular
│   ├── index.html                # Portal de Entrada (Autenticação)
│   │
│   ├── pages/                    # Telas separadas por funcionalidade/domínio
│   │   ├── home/                 # Vitrine e Feed Principal (home.html)
│   │   ├── produtos/             # Anúncios e Departamentos (produto.html, categoria.html)
│   │   ├── vender/               # Criação e Gestão (vender.html, meus-anuncios.html)
│   │   ├── mensagens/            # Inbox e Chat (conversas.html, chat.html)
│   │   ├── perfil/               # Usuário e Segurança (perfil.html, vendedor.html, configuracoes.html)
│   │   ├── favoritos/            # Anúncios Salvos (favoritos.html)
│   │   ├── notificacoes/         # Central de Alertas (notificacoes.html)
│   │   └── auth/                 # Cadastro Dedicado (cadastro.html)
│   │
│   ├── js/                       # Camada Lógica Separada
│   │   ├── core/                 # Módulos centrais (rotas.js, sessao.js, componentes-globais.js, etc.)
│   │   └── pages/                # Scripts específicos de cada página
│   │
│   ├── css/                      # Estilos organizados por tela e componentes
│   └── assets/                   # Banners, logotipos, ícones e fotos de produtos
│
├── backend/                      # API RESTful (Node.js + Express + Prisma ORM)
│   ├── prisma/                   # Banco de dados (SQLite/PostgreSQL) e seed
│   └── src/                      # Controllers, routes, middlewares e validações
│
├── legacy/                       # Arquivos legados arquivados com segurança
├── package.json                  # Scripts unificados na raiz do projeto
└── README.md                     # Documentação geral
```

---

## ⚡ Comandos de Inicialização

Na raiz do projeto:

```bash
# Executar o Frontend
npm run dev:frontend

# Executar a API Backend
npm run dev:backend
```