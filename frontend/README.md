# 🛍️ Itaim Vende - Frontend

Interface web modular, profissional e altamente organizada da plataforma **Itaim Vende**, o marketplace regional de compra, venda e trocas de Paulistana e região (PI).

---

## 🏛️ Arquitetura Espelhada por Domínio (Pages & JS)

Cada domínio/funcionalidade possui correspondência direta de 1 para 1 entre suas **telas (`pages/`)** e seus respectivos **controladores lógicos (`js/pages/`)**:

```
frontend/
├── index.html                    # 🚪 Portal Raiz (Autenticação / Login & Cadastro)
│
├── pages/                        # 📄 Telas agrupadas por Domínio de Negócio
│   ├── home/                     # Vitrine Principal e Feed
│   │   └── home.html
│   ├── produtos/                 # Anúncios e Departamentos
│   │   ├── produto.html          # Detalhes, fotos e contato
│   │   └── categoria.html        # Catálogo filtrado por departamentos
│   ├── vender/                   # Fluxo de Venda
│   │   ├── vender.html           # Cadastro de novo anúncio
│   │   └── meus-anuncios.html    # Gestão dos anúncios do usuário
│   ├── mensagens/                # Central de Negociações
│   │   ├── conversas.html        # Inbox e conversas
│   │   └── chat.html             # Atalho de redirecionamento
│   ├── perfil/                   # Usuário, Vendedores e Ajustes
│   │   ├── perfil.html           # Painel de perfil do usuário
│   │   ├── vendedor.html         # Perfil público de outros anunciantes
│   │   └── configuracoes.html    # Configurações de segurança e conta
│   ├── favoritos/                # Lista de Desejos
│   │   └── favoritos.html        # Anúncios salvos
│   ├── notificacoes/             # Central de Alertas
│   │   └── notificacoes.html     # Histórico de avisos da conta
│   └── auth/                     # Autenticação Dedicada
│       └── cadastro.html         # Tela independente de registro
│
├── js/                           # 🧠 Camada Lógica (JavaScript)
│   ├── core/                     # Módulos Centrais e Estado Global
│   │   ├── rotas.js              # Resolvedor canônico de rotas e assets
│   │   ├── sessao.js             # Gestão de contas, login e persistência
│   │   ├── componentes-globais.js# Navbar, drawer e cards padronizados
│   │   ├── produtos-dados.js     # Base inicial de produtos
│   │   ├── categorias-dados.js   # Lista oficial de categorias
│   │   └── ajustar-foto.js       # Utilitário de recorte de avatar
│   │
│   └── pages/                    # 🎯 Controladores Específicos (Espelhados com pages/)
│       ├── home/
│       │   └── home.js           # Vitrine, carrosséis e ordenação
│       ├── produtos/
│       │   ├── produto.js        # Galeria e interação com anunciante
│       │   └── categoria.js      # Filtragem e busca por departamento
│       ├── vender/
│       │   ├── vender.js         # Validação e upload de anúncios
│       │   └── meus-anuncios.js  # Status e edição de anúncios
│       ├── mensagens/
│       │   └── conversas.js      # Chat e envio de mensagens
│       ├── perfil/
│       │   ├── perfil.js         # Edição de perfil e dados
│       │   ├── vendedor.js       # Visualização de perfil de terceiros
│       │   └── configuracoes.js  # Segurança e suspensão de conta
│       ├── favoritos/
│       │   └── favoritos.js      # Gestão de itens favoritados
│       ├── notificacoes/
│       │   └── notificacoes.js   # Alertas da conta
│       └── auth/
│           └── app.js            # Lógica de login e recuperação de senha
│
├── css/                          # 🎨 Folhas de Estilo Modularizadas
│   ├── header-global.css         # Cabeçalho unificado e drawer responsivo
│   ├── home.css                  # Vitrine e banners
│   ├── categoria.css             # Grid de produtos e filtros
│   ├── produto.css               # Detalhes do anúncio e fotos
│   ├── perfil.css                # Painel de perfil
│   ├── vendedor.css              # Perfil público de vendedor
│   ├── vender.css                # Formulário de anúncio
│   ├── meus-anuncios.css         # Gestão de anúncios
│   ├── favoritos.css             # Grid de salvos
│   ├── conversas.css             # Interface de chat
│   ├── notificacoes.css          # Central de avisos
│   ├── configuracoes.css         # Segurança e senha
│   └── style.css                 # Base global e tela de autenticação
│
└── assets/                       # 🖼️ Imagens, Logotipos, Ícones e Fotos de Produtos
    ├── produtos/                 # Fotos reais dos produtos
    └── (logos, ícones svg/png, banners promocionais)
```

---

## 🚀 Como Executar Localmente

### Via npm (Recomendado)
Na raiz do repositório:
```bash
npm run dev:frontend
```
Acesse no navegador:
- Portal de Entrada: `http://localhost:5500/index.html`
- Vitrine / Home: `http://localhost:5500/pages/home/home.html`
