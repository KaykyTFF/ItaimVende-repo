/**
 * Componente: Product Card (Itaim Vende)
 * Migrado e aprimorado de js/componentes-globais.js
 */

import { formatCurrency, sanitizeHTML } from '../utils/formatters.js';

export function createProductCard(product, { onAddToCart, onQuickView, onToggleFavorite } = {}) {
  const card = document.createElement('article');
  card.className = 'product-card';
  card.dataset.id = product.id;

  const foto = product.imagem || (product.fotos && product.fotos[0]) || product.image || 'assets/images/produto-placeholder.svg';
  const condicao = product.condicao || 'Seminovo';
  const cidade = product.cidade || 'Paulistana';
  const preco = Number(product.preco || product.price || 0);

  // Verifica se está nos favoritos
  let isFav = false;
  try {
    const favs = JSON.parse(localStorage.getItem('itaim_favoritos') || '[]');
    isFav = favs.includes(Number(product.id)) || favs.includes(String(product.id));
  } catch (e) {}

  card.innerHTML = `
    <div class="card-image-box">
      <span class="badge badge-primary card-badge">${sanitizeHTML(condicao)}</span>
      
      <button type="button" class="btn-favorito-card ${isFav ? 'ativo' : ''}" aria-label="Favoritar produto" data-fav-id="${product.id}">
        <svg class="icone-coracao" viewBox="0 0 24 24" width="20" height="20">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
      </button>

      <img 
        src="${foto}" 
        alt="${sanitizeHTML(product.titulo || product.title)}" 
        class="card-image"
        loading="lazy"
        onerror="this.src='assets/images/produto-placeholder.svg'"
      >
    </div>

    <div class="card-content">
      <div class="card-meta-top">
        <span class="card-category">${sanitizeHTML(product.categoria || product.category || 'Geral')}</span>
        <span class="card-city">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          ${sanitizeHTML(cidade)}, PI
        </span>
      </div>

      <h3 class="card-title" title="${sanitizeHTML(product.titulo || product.title)}">
        ${sanitizeHTML(product.titulo || product.title)}
      </h3>

      <div class="card-pricing">
        <div class="current-price">
          ${preco > 0 ? formatCurrency(preco) : '<span style="color: var(--color-accent);">Doação / Grátis</span>'}
        </div>
        ${preco > 100 ? `<div class="installments">ou em até 10x sem juros</div>` : ''}
      </div>

      <div class="card-actions">
        <button type="button" class="btn btn-primary btn-add-cart" aria-label="Adicionar ${sanitizeHTML(product.titulo || product.title)} ao carrinho">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          Adicionar ao Carrinho
        </button>
      </div>
    </div>
  `;

  // Botão de Favoritar
  const favBtn = card.querySelector('.btn-favorito-card');
  favBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    try {
      const favs = JSON.parse(localStorage.getItem('itaim_favoritos') || '[]');
      const idNum = Number(product.id);
      const idx = favs.indexOf(idNum);
      if (idx > -1) {
        favs.splice(idx, 1);
        favBtn.classList.remove('ativo');
      } else {
        favs.push(idNum);
        favBtn.classList.add('ativo');
      }
      localStorage.setItem('itaim_favoritos', JSON.stringify(favs));
      window.dispatchEvent(new CustomEvent('favorites:updated', { detail: { count: favs.length } }));
      if (onToggleFavorite) onToggleFavorite(product, favBtn.classList.contains('ativo'));
    } catch (err) {}
  });

  // Botão de Adicionar ao Carrinho
  const addBtn = card.querySelector('.btn-add-cart');
  addBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const originalText = addBtn.innerHTML;
    addBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      Adicionado!
    `;
    addBtn.classList.remove('btn-primary');
    addBtn.classList.add('btn-secondary');

    setTimeout(() => {
      addBtn.innerHTML = originalText;
      addBtn.classList.remove('btn-secondary');
      addBtn.classList.add('btn-primary');
    }, 1200);

    if (onAddToCart) onAddToCart(product);
  });

  // Clique no card para visualização rápida / detalhes
  card.addEventListener('click', () => {
    if (onQuickView) onQuickView(product);
  });

  return card;
}
