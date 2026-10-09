/**
 * Aplicação Principal: App.js (Itaim Vende - Marketplace)
 * Orquestrador central de estado, roteamento de views, carrinho e modais
 */

import { cartState } from './state/cart.state.js';
import { authState } from './state/auth.state.js';
import { getProducts, getCategories } from './services/products.js';
import { createOrder } from './services/orders.js';
import { createProductCard } from './components/product-card.js';
import { CartDrawer } from './components/cart-drawer.js';
import { FilterBar } from './components/filter-bar.js';
import { formatCurrency, debounce, showToast, sanitizeHTML } from './utils/formatters.js';

class MarketplaceApp {
  constructor() {
    this.currentFilters = {
      query: '',
      category: 'todos',
      cidade: 'todas',
      minPrice: 0,
      maxPrice: Infinity,
      sortBy: 'recentes',
    };

    this.cartDrawer = null;
    this.filterBar = null;
  }

  async init() {
    console.log('🚀 Inicializando Itaim Vende Marketplace Frontend...');

    // 1. Inicializa o Cart Drawer
    this.initCart();

    // 2. Inicializa o estado de Autenticação e Usuário
    this.initAuth();

    // 3. Inicializa Contador de Favoritos
    this.initFavoritesBadge();

    // 4. Inicializa Barra de Filtros e Categorias
    await this.initFilters();

    // 5. Carrega Produtos Iniciais
    await this.loadProducts();

    // 6. Configura Busca Global
    this.initSearch();

    // 7. Configura Modais do Sistema
    this.initModals();

    // 8. Controles Mobile
    this.initMobileControls();

    // 9. Roteador simples por Hash (para links como #favoritos, #categoria=Moda)
    this.initRouter();
  }

  initCart() {
    this.cartDrawer = new CartDrawer({
      onCheckout: (cartData) => this.openCheckoutModal(cartData),
    });

    const cartTriggerBtn = document.getElementById('header-cart-btn');
    if (cartTriggerBtn) {
      cartTriggerBtn.addEventListener('click', () => {
        this.cartDrawer.open();
      });
    }

    const updateHeaderBadge = () => {
      const badge = document.getElementById('header-cart-count');
      if (badge) {
        badge.textContent = cartState.getCount();
      }
    };

    updateHeaderBadge();
    cartState.subscribe(updateHeaderBadge);
  }

  initAuth() {
    const userBtn = document.getElementById('header-user-btn');
    const updateHeaderUser = () => {
      const user = authState.getUser();
      if (!userBtn) return;

      if (user) {
        userBtn.innerHTML = `
          <div class="user-avatar">${(user.nome || user.name || 'U').charAt(0).toUpperCase()}</div>
          <span>${sanitizeHTML(user.nome || user.name || 'Usuário')}</span>
        `;
      } else {
        userBtn.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span>Entrar</span>
        `;
      }
    };

    updateHeaderUser();
    authState.subscribe(updateHeaderUser);

    if (userBtn) {
      userBtn.addEventListener('click', () => {
        const user = authState.getUser();
        if (user && user.email) {
          if (confirm(`Conectado como ${user.nome} (${user.email}). Deseja sair da conta?`)) {
            authState.logout();
            showToast('Você saiu da sua conta.', 'info');
          }
        } else {
          this.openAuthModal();
        }
      });
    }
  }

  initFavoritesBadge() {
    const updateFavCount = () => {
      try {
        const favs = JSON.parse(localStorage.getItem('itaim_favoritos') || '[]');
        const badge = document.getElementById('header-fav-count');
        if (badge) badge.textContent = favs.length;
      } catch (e) {}
    };

    updateFavCount();
    window.addEventListener('favorites:updated', updateFavCount);
  }

  async initFilters() {
    const categories = await getCategories();

    // Carrossel de Categorias Rápidas
    const quickNav = document.getElementById('category-quick-nav');
    if (quickNav) {
      quickNav.innerHTML = categories
        .map(
          (cat) => `
          <button type="button" class="cat-pill ${cat.nome === 'Todos' ? 'active' : ''}" data-cat-name="${cat.nome}">
            <img src="${cat.icon}" alt="${cat.nome}" onerror="this.style.display='none'">
            <span>${cat.nome}</span>
          </button>
        `
        )
        .join('');

      quickNav.addEventListener('click', (e) => {
        const pill = e.target.closest('[data-cat-name]');
        if (!pill) return;

        quickNav.querySelectorAll('.cat-pill').forEach((p) => p.classList.remove('active'));
        pill.classList.add('active');

        const catName = pill.dataset.catName;
        this.currentFilters.category = catName;
        if (this.filterBar) {
          this.filterBar.setCategory(catName);
        } else {
          this.loadProducts();
        }
      });
    }

    // Sidebar de Filtros
    const sidebarEl = document.getElementById('filters-sidebar');
    if (sidebarEl) {
      this.filterBar = new FilterBar(sidebarEl, {
        categories,
        onFilterChange: (filters) => {
          this.currentFilters = {
            ...this.currentFilters,
            ...filters,
          };
          this.loadProducts();

          if (quickNav) {
            quickNav.querySelectorAll('.cat-pill').forEach((p) => {
              p.classList.toggle('active', p.dataset.catName.toLowerCase() === filters.category.toLowerCase());
            });
          }
        },
      });
    }
  }

  async loadProducts() {
    const grid = document.getElementById('products-grid');
    const countEl = document.getElementById('products-count');
    if (!grid) return;

    // Efeito de carregamento Skeleton
    grid.innerHTML = Array(6)
      .fill(0)
      .map(
        () => `
      <div class="product-card" style="min-height: 360px;">
        <div class="skeleton" style="width: 100%; aspect-ratio: 1/1;"></div>
        <div style="padding: 1.25rem; display: flex; flex-direction: column; gap: 0.75rem; flex: 1;">
          <div class="skeleton" style="height: 14px; width: 40%;"></div>
          <div class="skeleton" style="height: 20px; width: 90%;"></div>
          <div class="skeleton" style="height: 16px; width: 50%;"></div>
          <div class="skeleton" style="height: 28px; width: 60%; margin-top: auto;"></div>
        </div>
      </div>
    `
      )
      .join('');

    try {
      const products = await getProducts(this.currentFilters);

      if (countEl) {
        countEl.textContent = `${products.length} anúncio${products.length === 1 ? '' : 's'} encontrado${products.length === 1 ? '' : 's'}`;
      }

      if (products.length === 0) {
        grid.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin: 0 auto 1rem; opacity: 0.4;">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <h3 style="font-size: 1.2rem; color: var(--text-main); margin-bottom: 0.5rem;">Nenhum produto encontrado</h3>
            <p>Tente buscar com outro termo ou redefinir os filtros selecionados.</p>
          </div>
        `;
        return;
      }

      grid.innerHTML = '';
      products.forEach((product) => {
        const cardNode = createProductCard(product, {
          onAddToCart: (p) => {
            cartState.addItem(p, 1);
            showToast(`"${p.titulo || p.title}" adicionado ao carrinho!`, 'success');
          },
          onQuickView: (p) => {
            this.openQuickViewModal(p);
          },
        });
        grid.appendChild(cardNode);
      });
    } catch (error) {
      console.error('Erro ao renderizar vitrine:', error);
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--color-danger);">
          <p>Erro ao carregar os anúncios da plataforma.</p>
        </div>
      `;
    }
  }

  initSearch() {
    const searchInput = document.getElementById('search-input');
    const searchClear = document.getElementById('search-clear');

    if (!searchInput) return;

    const handleSearch = debounce((query) => {
      this.currentFilters.query = query;
      this.loadProducts();
    }, 300);

    searchInput.addEventListener('input', (e) => {
      handleSearch(e.target.value);
    });

    if (searchClear) {
      searchClear.addEventListener('click', () => {
        searchInput.value = '';
        this.currentFilters.query = '';
        this.loadProducts();
      });
    }
  }

  initModals() {
    document.querySelectorAll('.modal-overlay').forEach((overlay) => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay || e.target.closest('[data-modal-close]')) {
          overlay.classList.remove('active');
        }
      });
    });

    // Login Modal
    const authForm = document.getElementById('form-auth-modal');
    if (authForm) {
      authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('auth-email').value;
        const password = document.getElementById('auth-password').value;

        try {
          const user = await authState.login(email, password);
          showToast(`Bem-vindo, ${user.nome}!`, 'success');
          document.getElementById('modal-auth').classList.remove('active');
        } catch (err) {
          showToast(err.message, 'error');
        }
      });
    }

    // Checkout Modal
    const checkoutForm = document.getElementById('form-checkout-modal');
    if (checkoutForm) {
      checkoutForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const address = document.getElementById('checkout-address').value;
        const payment = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'pix';

        try {
          const items = cartState.getItems();
          const total = cartState.getTotal();

          const order = await createOrder({
            items,
            total,
            shippingAddress: { address },
            paymentMethod: payment,
          });

          cartState.clearCart();
          document.getElementById('modal-checkout').classList.remove('active');
          showToast(`Pedido #${order.id} realizado com sucesso!`, 'success', 5000);
        } catch (err) {
          showToast(err.message, 'error');
        }
      });
    }
  }

  openAuthModal() {
    const modal = document.getElementById('modal-auth');
    if (modal) modal.classList.add('active');
  }

  openCheckoutModal(cartData) {
    const modal = document.getElementById('modal-checkout');
    if (!modal) return;

    const summaryEl = document.getElementById('checkout-summary-text');
    if (summaryEl) {
      summaryEl.textContent = `${cartData.items.length} itens - Total: ${formatCurrency(cartData.total)}`;
    }

    modal.classList.add('active');
  }

  openQuickViewModal(product) {
    const modal = document.getElementById('modal-quick-view');
    if (!modal) return;

    const foto = product.imagem || (product.fotos && product.fotos[0]) || product.image || 'assets/images/produto-placeholder.svg';
    const preco = Number(product.preco || product.price || 0);
    const vendedor = product.vendedor || 'Vendedor Itaim';
    const telefone = product.telefone || '(85) 99985-8585';
    const wppLink = `https://wa.me/55${telefone.replace(/\D/g, '')}?text=Ol%C3%A1!%20Vi%20seu%20an%C3%BAncio%20no%20Itaim%20Vende:%20${encodeURIComponent(product.titulo || product.title)}`;

    const body = modal.querySelector('.modal-body');
    body.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; align-items: start;">
        <img 
          src="${foto}" 
          alt="${sanitizeHTML(product.titulo || product.title)}" 
          style="width: 100%; border-radius: var(--radius-md); object-fit: cover; max-height: 320px;"
          onerror="this.src='assets/images/produto-placeholder.svg'"
        >
        <div>
          <span class="badge badge-primary" style="margin-bottom: 0.5rem;">${sanitizeHTML(product.categoria || 'Geral')}</span>
          <h2 style="font-size: 1.3rem; font-weight: 800; margin-bottom: 0.5rem;">${sanitizeHTML(product.titulo || product.title)}</h2>
          <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 1rem;">
            ${sanitizeHTML(product.descricao || product.description || 'Produto em ótimo estado de conservação disponível em Paulistana.')}
          </p>

          <div style="font-size: 1.6rem; font-weight: 800; color: var(--color-primary); margin-bottom: 1rem;">
            ${preco > 0 ? formatCurrency(preco) : 'Doação / Grátis'}
          </div>

          <div style="background: var(--bg-surface-muted); padding: 0.75rem 1rem; border-radius: var(--radius-md); margin-bottom: 1.25rem;">
            <div style="font-size: 0.85rem; color: var(--text-muted);">Vendedor responsável:</div>
            <div style="font-weight: 700; color: var(--text-main); font-size: 0.95rem;">${sanitizeHTML(vendedor)}</div>
            <div style="font-size: 0.8rem; color: var(--text-muted);">${sanitizeHTML(product.cidade || 'Paulistana')}, PI</div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.6rem;">
            <button type="button" class="btn btn-primary" id="btn-quick-buy" style="width: 100%;">
              Adicionar ao Carrinho
            </button>
            <a href="${wppLink}" target="_blank" rel="noopener noreferrer" class="btn btn-outline" style="width: 100%; color: #16a34a; border-color: #86efac;">
              Negociar via WhatsApp
            </a>
          </div>
        </div>
      </div>
    `;

    body.querySelector('#btn-quick-buy').addEventListener('click', () => {
      cartState.addItem(product, 1);
      showToast(`"${product.titulo || product.title}" adicionado ao carrinho!`, 'success');
      modal.classList.remove('active');
    });

    modal.classList.add('active');
  }

  initMobileControls() {
    const toggleFilterBtn = document.getElementById('btn-mobile-filters');
    const sidebar = document.getElementById('filters-sidebar');

    if (toggleFilterBtn && sidebar) {
      toggleFilterBtn.addEventListener('click', () => {
        sidebar.classList.toggle('active');
      });
    }
  }

  initRouter() {
    const handleRoute = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#cat=')) {
        const cat = decodeURIComponent(hash.replace('#cat=', ''));
        this.currentFilters.category = cat;
        if (this.filterBar) this.filterBar.setCategory(cat);
      } else if (hash === '#favoritos') {
        // Exibe apenas favoritados
        try {
          const favs = JSON.parse(localStorage.getItem('itaim_favoritos') || '[]');
          showToast(`Exibindo ${favs.length} produtos favoritados.`, 'info');
        } catch (e) {}
      }
    };

    window.addEventListener('hashchange', handleRoute);
    if (window.location.hash) handleRoute();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new MarketplaceApp();
  app.init();
});
