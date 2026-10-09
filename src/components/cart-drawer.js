/**
 * Componente: Cart Drawer (Gaveta Lateral do Carrinho)
 * Itaim Vende - Suporta compra direta, cálculo em tempo real e checkout integrado
 */

import { cartState } from '../state/cart.state.js';
import { formatCurrency, sanitizeHTML } from '../utils/formatters.js';

export class CartDrawer {
  constructor({ onCheckout } = {}) {
    this.onCheckout = onCheckout;
    this.container = null;
    this.backdrop = null;
    this.drawer = null;
    this.isOpen = false;

    this.init();
  }

  init() {
    this.render();
    this.bindEvents();

    cartState.subscribe(() => {
      this.updateView();
    });
  }

  render() {
    this.backdrop = document.createElement('div');
    this.backdrop.className = 'drawer-backdrop';
    this.backdrop.id = 'cart-backdrop';

    this.drawer = document.createElement('aside');
    this.drawer.className = 'cart-drawer';
    this.drawer.id = 'cart-drawer';
    this.drawer.setAttribute('aria-label', 'Carrinho de Compras');

    this.drawer.innerHTML = `
      <div class="drawer-header">
        <h2 class="drawer-title">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          Carrinho de Compras
          <span class="badge badge-primary" id="cart-drawer-count">0</span>
        </h2>
        <button type="button" class="btn-icon" id="btn-close-cart" aria-label="Fechar carrinho">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="drawer-body" id="cart-drawer-items">
        <!-- Renderização dinâmica -->
      </div>

      <div class="drawer-footer" id="cart-drawer-footer">
        <!-- Resumo e botão de finalizar compra -->
      </div>
    `;

    document.body.appendChild(this.backdrop);
    document.body.appendChild(this.drawer);

    this.updateView();
  }

  bindEvents() {
    this.backdrop.addEventListener('click', () => this.close());
    const closeBtn = this.drawer.querySelector('#btn-close-cart');
    closeBtn.addEventListener('click', () => this.close());

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });

    const itemsContainer = this.drawer.querySelector('#cart-drawer-items');
    itemsContainer.addEventListener('click', (e) => {
      const target = e.target.closest('[data-action]');
      if (!target) return;

      const action = target.dataset.action;
      const itemId = target.dataset.id;

      if (action === 'increase') {
        const item = cartState.getItems().find((i) => String(i.id) === String(itemId));
        if (item) cartState.updateQuantity(itemId, item.quantity + 1);
      } else if (action === 'decrease') {
        const item = cartState.getItems().find((i) => String(i.id) === String(itemId));
        if (item) cartState.updateQuantity(itemId, item.quantity - 1);
      } else if (action === 'remove') {
        cartState.removeItem(itemId);
      }
    });
  }

  updateView() {
    const items = cartState.getItems();
    const count = cartState.getCount();
    const total = cartState.getTotal();

    const countBadge = this.drawer.querySelector('#cart-drawer-count');
    if (countBadge) countBadge.textContent = count;

    const itemsContainer = this.drawer.querySelector('#cart-drawer-items');
    const footerContainer = this.drawer.querySelector('#cart-drawer-footer');

    if (items.length === 0) {
      itemsContainer.innerHTML = `
        <div class="cart-empty">
          <svg class="cart-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          <h4>Seu carrinho está vazio</h4>
          <p>Adicione ofertas de vendedores de Paulistana e região!</p>
        </div>
      `;
      footerContainer.style.display = 'none';
      return;
    }

    footerContainer.style.display = 'block';

    itemsContainer.innerHTML = items
      .map(
        (item) => `
        <div class="cart-item" data-item-id="${item.id}">
          <img 
            src="${item.image || item.imagem || 'assets/images/produto-placeholder.svg'}" 
            alt="${sanitizeHTML(item.title || item.titulo)}" 
            class="cart-item-image"
            onerror="this.src='assets/images/produto-placeholder.svg'"
          >
          <div class="cart-item-details">
            <h4 class="cart-item-title" title="${sanitizeHTML(item.title || item.titulo)}">
              ${sanitizeHTML(item.title || item.titulo)}
            </h4>
            <div class="cart-item-price">${formatCurrency(item.price || item.preco || 0)}</div>
            
            <div class="cart-item-controls">
              <div class="qty-control">
                <button type="button" class="qty-btn" data-action="decrease" data-id="${item.id}" aria-label="Diminuir">-</button>
                <span class="qty-value">${item.quantity}</span>
                <button type="button" class="qty-btn" data-action="increase" data-id="${item.id}" aria-label="Aumentar">+</button>
              </div>
              <button type="button" class="btn-remove-item" data-action="remove" data-id="${item.id}" aria-label="Remover">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      `
      )
      .join('');

    footerContainer.innerHTML = `
      <div class="cart-summary-row">
        <span>Subtotal</span>
        <span>${formatCurrency(total)}</span>
      </div>
      <div class="cart-summary-row">
        <span>Retirada / Entrega</span>
        <span style="color: var(--color-accent); font-weight: 700;">A combinar / Grátis</span>
      </div>
      <div class="cart-summary-row total">
        <span>Total</span>
        <span>${formatCurrency(total)}</span>
      </div>
      <button type="button" class="btn btn-primary btn-checkout" id="btn-drawer-checkout">
        Finalizar Pedido (${formatCurrency(total)})
      </button>
    `;

    const checkoutBtn = footerContainer.querySelector('#btn-drawer-checkout');
    checkoutBtn.addEventListener('click', () => {
      this.close();
      if (this.onCheckout) {
        this.onCheckout({ items, total });
      }
    });
  }

  open() {
    this.isOpen = true;
    this.backdrop.classList.add('active');
    this.drawer.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.isOpen = false;
    this.backdrop.classList.remove('active');
    this.drawer.classList.remove('active');
    document.body.style.overflow = '';
  }
}
