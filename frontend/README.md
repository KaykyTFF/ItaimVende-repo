# 🛍️ Itaim Vende - Frontend

Interface web modular e profissional da plataforma **Itaim Vende**, o marketplace regional de compra, venda e trocas de Paulistana e região (PI).

---

## 🏛️ Estrutura de Pastas Profissional (Domain-Driven)

```
frontend/
├── index.html                    # Ponto de entrada oficial (Portal de Login & Autenticação)
│
├── pages/                        # Páginas organizadas por Domínio e Funcionalidade
│   ├── home/                     # Vitrine Principal e Feed de Anúncios
│   │   └── home.html
│   │
│   ├── produtos/                 # Catálogo e Detalhes de Produtos
│   │   ├── produto.html          # Página completa de detalhes do produto
│   │   └── categoria.html        # Catálogo com filtros por departamento e busca
│   │
│   ├── vender/                   # Fluxo de Venda e Gestão de Anúncios
│   │   ├── vender.html           # Formulário de publicação de novo anúncio
│   │   └── meus-anuncios.html    # Painel de controle e status dos anúncios do usuário
│   │
│   ├── mensagens/                # Central de Negociações e Mensagens
│   │   ├── conversas.html        # Inbox principal de conversas com compradores/vendedores
│   │   └── chat.html             # Atalho de redirecionamento para o chat ativo
│   │
│   ├── perfil/                   # Gestão de Contas, Vendedores e Configurações
│   │   ├── perfil.html           # Perfil pessoal do usuário autenticado
│   │   ├── vendedor.html         # Perfil público de outros anunciantes
│   │   └── configuracoes.html    # Configurações de segurança, senha e conta
│   │
│   ├── favoritos/                # Lista de Desejos
│   │   └── favoritos.html        # Itens salvos pelo usuário
│   │
│   ├── notificacoes/             # Central de Alertas
│   │   └── notificacoes.html     # Histórico de avisos e notificações do sistema
│   │
│   └── auth/                     # Autenticação Dedicada
│       └── cadastro.html         # Página independente de cadastro de novos usuários
│
├── js/                           # Camada Lógica (JavaScript)
│   ├── core/                     # Módulos Centrais e Estado Global
│   │   ├── rotas.js              # Resolvedor canônico de rotas e assets
│   │   ├── sessao.js             # Gerenciamento central de autenticação e sessão
│   │   ├── produtos-dados.js     # Base inicial de produtos e persistência
│   │   ├── categorias-dados.js   # Relação oficial de categorias e normalização
│   │   ├── componentes-globais.js# Navbar, menu drawer, badges e cards padronizados
│   │   └── ajustar-foto.js       # Utilitário de recorte e ajuste de avatar
│   │
│   └── pages/                    # Scripts de Comportamento Específicos por Tela
│       ├── app.js                # Lógica da tela de login e recuperação de senha
│       ├── home.js               # Vitrine, carrosséis e ordenação
│       ├── categoria.js          # Filtragem dinâmica por departamento
│       ├── produto.js            # Galeria, visualização e contato com vendedor
│       ├── vender.js             # Validação e upload de novos anúncios
│       ├── meus-anuncios.js      # Edição, exclusão e status dos anúncios
│       ├── conversas.js          # Troca de mensagens e negociações
│       ├── perfil.js             # Edição de perfil e anúncios do anunciante
│       ├── vendedor.js           # Visualização de dados de outro anunciante
│       ├── favoritos.js          # Gestão dos anúncios favoritados
│       ├── notificacoes.js       # Exibição e leitura de alertas
│       └── configuracoes.js      # Segurança da conta e suspensão
│
├── css/                          # Folhas de Estilo Modularizadas
│   ├── header-global.css         # Cabeçalho unificado e drawer responsivo
│   ├── home.css                  # Vitrine e banners
│   ├── categoria.css             # Grid de produtos e filtros
│   ├── produto.css               # Página de detalhes e galeria
│   ├── perfil.css                # Painel de perfil
│   ├── vendedor.css              # Perfil público de vendedor
│   ├── vender.css                # Formulário de anúncio
│   ├── meus-anuncios.css         # Painel de gestão
│   ├── favoritos.css             # Grid de salvos
│   ├── conversas.css             # Interface de chat
│   ├── notificacoes.css          # Estilos de notificações
│   ├── configuracoes.css         # Painel de configurações
│   └── style.css                 # Base global e tela de login
│
└── assets/                       # Mídias e Recursos Visuais
    ├── produtos/                 # Fotos reais dos produtos
    └── (logos, ícones svg/png, banners promocionais)
```

---

## 🚀 Como Executar Localmente

### Opção 1: Via npm (Recomendado)
Na raiz do repositório:
```bash
npm run dev:frontend
```
Acesse no navegador:
- Portal de Entrada: `http://localhost:5500/index.html`
- Vitrine / Home: `http://localhost:5500/pages/home/home.html`

### Opção 2: Live Server (VS Code)
Abra o VS Code, clique com o botão direito no `index.html` ou em qualquer arquivo dentro de `pages/` e selecione **Open with Live Server**.
