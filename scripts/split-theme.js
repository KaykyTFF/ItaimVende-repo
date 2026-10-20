/**
 * Script de automação para modularização de theme.css
 */
const fs = require('fs');
const path = require('path');

const baseDir = path.resolve(__dirname, '../frontend/css/core');
const themeCssPath = path.join(baseDir, 'theme.css');
const targetDir = path.join(baseDir, 'theme');

if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

const content = fs.readFileSync(themeCssPath, 'utf8');
const lines = content.split(/\r?\n/);

const sections = [
  { name: 'theme-variables.css', title: 'VARIÁVEIS DE TEMA (CLARO & ESCURO)', startPattern: '1. VARIÁVEIS CSS DE TEMA' },
  { name: 'theme-base.css', title: 'ESTILOS BASE E COMPONENTES GLOBAIS NO MODO ESCURO', startPattern: '2. ESTILOS DO MODO ESCURO NOS COMPONENTES DA PLATAFORMA' },
  { name: 'theme-drawer.css', title: 'BOTÃO DE TEMA NO MENU LATERAL (DRAWER)', startPattern: '3. BOTÃO DE TEMA NO MENU LATERAL (DRAWER)' },
  { name: 'theme-configuracoes.css', title: 'MÓDULO DE TEMA NAS CONFIGURAÇÕES', startPattern: '4. ESTILIZAÇÃO DO MÓDULO DE TEMA NAS CONFIGURAÇÕES' },
  { name: 'theme-meus-anuncios.css', title: 'MEUS ANÚNCIOS NO MODO ESCURO', startPattern: 'MEUS ANÚNCIOS (MEUS-ANUNCIOS.HTML) - MODO ESCURO' },
  { name: 'theme-vender.css', title: 'PÁGINA VENDER NO MODO ESCURO', startPattern: 'PÁGINA VENDER / CRIAR ANÚNCIO (VENDER.HTML) - MODO ESCURO' },
  { name: 'theme-foto-modal.css', title: 'MODAL DE AJUSTAR FOTO NO MODO ESCURO', startPattern: 'MODAL DE AJUSTAR FOTO (FOTO-MODAL) - MODO ESCURO' },
  { name: 'theme-conversas.css', title: 'CHAT E MENSAGENS NO MODO ESCURO', startPattern: 'PÁGINA DE MENSAGENS / CHAT (CONVERSAS.HTML) - MODO ESCURO' },
  { name: 'theme-notificacoes.css', title: 'NOTIFICAÇÕES NO MODO ESCURO', startPattern: 'PÁGINA DE NOTIFICAÇÕES (NOTIFICACOES.HTML) - MODO ESCURO' },
  { name: 'theme-favoritos.css', title: 'FAVORITOS NO MODO ESCURO', startPattern: 'PÁGINA DE FAVORITOS (FAVORITOS.HTML) - MODO ESCURO' },
  { name: 'theme-perfil.css', title: 'PERFIL E VENDEDOR NO MODO ESCURO', startPattern: 'PÁGINA DE PERFIL (PERFIL.HTML & VENDEDOR.HTML) - MODO ESCURO' },
  { name: 'theme-produto.css', title: 'DETALHES DO PRODUTO NO MODO ESCURO', startPattern: 'PÁGINA DE DETALHES DO PRODUTO / ANÚNCIO (PRODUTO.HTML) - MODO ESCURO' },
  { name: 'theme-categoria.css', title: 'CATEGORIA E VITRINE NO MODO ESCURO', startPattern: 'PÁGINA DE CATEGORIA (CATEGORIA.HTML) - MODO ESCURO' },
  { name: 'theme-skeleton.css', title: 'SKELETON SCREENS E SHIMMER NO MODO ESCURO', startPattern: 'SKELETON SCREENS (PLACEHOLDERS E SHIMMER) - MODO ESCURO' }
];

const startIndices = [];
for (let i = 0; i < sections.length; i++) {
  const s = sections[i];
  const idx = lines.findIndex(l => l.includes(s.startPattern));
  let sectionStart = idx;
  if (idx > 0 && lines[idx - 1].includes('/* ===')) {
    sectionStart = idx - 1;
  }
  startIndices.push(sectionStart);
}

// Escreve cada submódulo
sections.forEach((sec, idx) => {
    const start = startIndices[idx];
    const end = (idx + 1 < sections.length) ? startIndices[idx + 1] : lines.length;
    const body = lines.slice(start, end).join('\n').trim();
    
    const fileHeader = `/**\n * ITAIM VENDE - ${sec.title}\n * Arquivo: frontend/css/core/theme/${sec.name}\n */\n\n`;
    const fullContent = fileHeader + body + '\n';
    
    const dest = path.join(targetDir, sec.name);
    fs.writeFileSync(dest, fullContent, 'utf8');
    console.log(`Gerado: ${sec.name} (${body.split('\n').length} linhas)`);
});

// Gera o theme.css orquestrador
const orquestradorHeader = `/**
 * ITAIM VENDE - SISTEMA GLOBAL DE TEMAS (CLARO & ESCURO)
 * Arquivo: frontend/css/core/theme.css
 * Arquivo orquestrador / modular unificado
 */

/* 1. Variáveis de Tema (Modo Claro & Escuro) */
@import url('./theme/theme-variables.css');

/* 2. Estilos Base e Componentes Globais */
@import url('./theme/theme-base.css');

/* 3. Componentes Compartilhados de Interface */
@import url('./theme/theme-drawer.css');
@import url('./theme/theme-configuracoes.css');
@import url('./theme/theme-foto-modal.css');
@import url('./theme/theme-skeleton.css');

/* 4. Módulos Específicos por Página */
@import url('./theme/theme-categoria.css');
@import url('./theme/theme-produto.css');
@import url('./theme/theme-perfil.css');
@import url('./theme/theme-meus-anuncios.css');
@import url('./theme/theme-vender.css');
@import url('./theme/theme-conversas.css');
@import url('./theme/theme-notificacoes.css');
@import url('./theme/theme-favoritos.css');
`;

// Backup antes de substituir
fs.writeFileSync(themeCssPath + '.bak', content, 'utf8');
fs.writeFileSync(themeCssPath, orquestradorHeader, 'utf8');
console.log('theme.css orquestrador gerado com sucesso!');
