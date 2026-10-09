# 🚀 Guia de Contribuição - Itaim Vende Frontend

Este documento contém o passo a passo completo para os membros da equipe de desenvolvimento configurarem o ambiente, alterarem o código e enviarem commits com segurança para o repositório do **Itaim Vende**.

---

## 📋 1. Pré-Requisitos

Antes de começar, certifique-se de ter:
1. **Git instalado** na sua máquina ([Download do Git](https://git-scm.com/)).
2. **Conta no GitHub**.
3. **Convite de Colaborador aceito**: O administrador do projeto deve enviar o convite para o seu usuário do GitHub, e você deve aceitá-lo em [github.com/KaykyTFF/ItaimVende-repo](https://github.com/KaykyTFF/ItaimVende-repo) ou no seu e-mail.

---

## ⚙️ 2. Configuração Inicial do Git (Primeira vez)

Abra o terminal (Git Bash, Prompt de Comando ou PowerShell) e configure sua identificação de autor dos commits:

```bash
git config --global user.name "Seu Nome Completo"
git config --global user.email "seu-email-do-github@exemplo.com"
```

---

## 📥 3. Como Clonar o Repositório

Escolha uma pasta no seu computador onde deseja salvar o projeto e execute:

```bash
git clone https://github.com/KaykyTFF/ItaimVende-repo.git
cd ItaimVende-repo
```

---

## 📂 4. Entendendo a Estrutura de Pastas

Todo o desenvolvimento da interface web deve ser feito dentro da pasta **`frontend/`**:

```text
ItaimVende-repo/
├── frontend/                     <-- SEU FOCO PRINCIPAL
│   ├── assets/                   # Imagens, banners, logotipos e ícones
│   ├── css/                      # Folhas de estilo (style.css, home.css, etc.)
│   ├── js/
│   │   ├── core/                 # Scripts globais (rotas.js, sessao.js, etc.)
│   │   └── pages/                # Lógica JS modular por página
│   ├── pages/                    # Páginas HTML organizadas por domínio
│   │   ├── home/
│   │   ├── produtos/
│   │   ├── vender/
│   │   ├── mensagens/
│   │   └── perfil/
│   ├── index.html                # Página inicial / portal de acesso
│   └── 404.html                  # Página de erro 404 personalizada
├── backend/                      # Servidor Node.js / Prisma (API)
├── netlify.toml                  # Configuração de rotas e publicação no Netlify
└── _redirects                    # Regras de redirecionamento do servidor
```

> ⚠️ **Atenção:** Nunca altere ou delete arquivos de configuração raiz (`netlify.toml`, `_redirects`) sem alinhamento prévio com a equipe.

---

## 💻 5. Testando o Frontend Localmente

Você pode abrir o projeto localmente de duas formas:
- **Opção 1 (VS Code):** Instale a extensão **Live Server**, clique com o botão direito em `frontend/index.html` e selecione **"Open with Live Server"**.
- **Opção 2 (Node.js):** Execute o comando na raiz:
  ```bash
  npx serve frontend -p 5500
  ```
  Acesse no navegador: `http://localhost:5500`

---

## 🔄 6. Passo a Passo para Fazer Commits

Sempre siga a rotina abaixo para evitar conflitos de versão:

### Passo 1: Atualizar seu repositório local
Antes de mexer em qualquer arquivo, puxe o código mais recente do GitHub:
```bash
git pull origin main
```

### Passo 2: Fazer suas alterações no código
Edite os arquivos necessários dentro de `frontend/` (HTML, CSS ou JS).

### Passo 3: Verificar o que foi modificado
Para ver a lista de arquivos alterados:
```bash
git status
```

### Passo 4: Adicionar os arquivos para o commit
```bash
git add .
```
*(Ou especifique os arquivos, ex: `git add frontend/css/home.css`)*

### Passo 5: Criar o commit com mensagem descritiva
Descreva claramente o que você implementou ou corrigiu:
```bash
git commit -m "feat(front): adiciona carrossel de promocoes na home"
```

### Passo 6: Enviar para o GitHub
```bash
git push origin main
```

---

## 🏷️ 7. Padrão Recomendado de Mensagens de Commit

Utilize prefixos padronizados para facilitar o histórico:

| Prefixo | Quando usar | Exemplo |
| :--- | :--- | :--- |
| `feat:` | Nova funcionalidade ou página | `git commit -m "feat(front): cria layout da pagina de categorias"` |
| `fix:` | Correção de erro ou bug visual | `git commit -m "fix(front): corrige alinhamento do banner no mobile"` |
| `style:` | Ajustes de CSS, cores ou tipografia | `git commit -m "style(front): atualiza paleta de cores dos cards"` |
| `refactor:` | Reorganização de código sem mudar a tela | `git commit -m "refactor(front): limpa funcoes duplicadas em rotas.js"` |

---

## 🌐 8. Deploy Automático no Netlify

O repositório está integrado com o **Netlify**:
- Toda vez que você der **`git push origin main`**, o Netlify detecta o novo commit automaticamente.
- O build é executado e o site oficial é atualizado em **menos de 1 minuto** no endereço:  
  👉 **[https://itaimvende.netlify.app/](https://itaimvende.netlify.app/)**

---

## 🛠️ 9. Resolução de Dúvidas e Problemas Frequentes

### Erro: `Permission to KaykyTFF/ItaimVende-repo.git denied`
- **Causa:** Sua conta do GitHub ainda não aceitou o convite de colaborador ou você está logado em outra conta no Git.
- **Solução:** Acesse [github.com/KaykyTFF/ItaimVende-repo](https://github.com/KaykyTFF/ItaimVende-repo) e clique em **Accept Invitation**.

### Erro: `Updates were rejected because the remote contains work...`
- **Causa:** Outro membro enviou um commit antes de você.
- **Solução:** Puxe as atualizações mais recentes primeiro e envie novamente:
  ```bash
  git pull origin main --rebase
  git push origin main
  ```

---

*Em caso de dúvidas sobre a arquitetura ou permissões, procure o mantenedor do repositório (@KaykyTFF).*
