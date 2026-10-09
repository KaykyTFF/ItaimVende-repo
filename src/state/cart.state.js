/**
 * Gerenciamento de Estado do Carrinho de Compras
 * Armazena itens em memória e sincroniza com o localStorage.
 */

const CART_STORAGE_KEY = 'marketplace_cart_items';

class CartState {
  constructor() {
    this.items = this.loadFromStorage();
    this.listeners = new Set();
  }

  /**
   * Carrega itens persistidos no localStorage
   * @private
   */
  loadFromStorage() {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Falha ao carregar carrinho do localStorage:', error);
      return [];
    }
  }

  /**
   * Salva o estado atual no localStorage e notifica os observadores
   * @private
   */
  saveAndNotify() {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(this.items));
    } catch (error) {
      console.error('Falha ao persistir carrinho no localStorage:', error);
    }
    
    // Dispara evento customizado no window para reatividade global
    window.dispatchEvent(new CustomEvent('cart:updated', { detail: { items: this.items } }));

    // Executa listeners inscritos diretamente
    this.listeners.forEach((callback) => callback(this.items));
  }

  /**
   * Retorna os itens atuais do carrinho
   */
  getItems() {
    return [...this.items];
  }

  /**
   * Adiciona um produto ao carrinho ou incrementa quantidade se já existir
   * @param {Object} product - Objeto do produto
   * @param {number} quantity - Quantidade a adicionar (padrão 1)
   */
  addItem(product, quantity = 1) {
    if (!product || !product.id) return;

    const existingIndex = this.items.findIndex((item) => item.id === product.id);

    if (existingIndex > -1) {
      this.items[existingIndex].quantity += quantity;
    } else {
      this.items.push({
        id: product.id,
        title: product.title || product.nome,
        price: Number(product.price || product.preco || 0),
        image: product.image || product.imagem || 'assets/images/produto-placeholder.svg',
        category: product.category || product.categoria || 'Geral',
        seller: product.seller || 'Vendedor Local',
        quantity: Math.max(1, quantity),
      });
    }

    this.saveAndNotify();
  }

  /**
   * Remove um item completamente do carrinho
   * @param {string|number} productId
   */
  removeItem(productId) {
    this.items = this.items.filter((item) => item.id !== productId);
    this.saveAndNotify();
  }

  /**
   * Altera a quantidade de um item específico
   * @param {string|number} productId
   * @param {number} newQuantity
   */
  updateQuantity(productId, newQuantity) {
    const qty = parseInt(newQuantity, 10);
    if (isNaN(qty) || qty <= 0) {
      this.removeItem(productId);
      return;
    }

    const item = this.items.find((i) => i.id === productId);
    if (item) {
      item.quantity = qty;
      this.saveAndNotify();
    }
  }

  /**
   * Limpa todos os itens do carrinho
   */
  clearCart() {
    this.items = [];
    this.saveAndNotify();
  }

  /**
   * Retorna a contagem total de itens no carrinho
   */
  getCount() {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }

  /**
   * Retorna o valor total somado do carrinho
   */
  getTotal() {
    return this.items.reduce((total, item) => total + item.price * item.quantity, 0);
  }

  /**
   * Adiciona um ouvinte para alterações no carrinho
   * @param {Function} callback
   */
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }
}

export const cartState = new CartState();
