/**
 * Componente: Filter Bar (Itaim Vende)
 * Gerencia filtros de categorias oficiais, cidades da região, faixa de preço e ordenação.
 */

import { sanitizeHTML } from '../utils/formatters.js';

export class FilterBar {
  constructor(containerElement, { categories = [], onFilterChange } = {}) {
    this.container = containerElement;
    this.categories = categories;
    this.onFilterChange = onFilterChange;

    this.state = {
      category: 'todos',
      cidade: 'todas',
      minPrice: '',
      maxPrice: '',
      sortBy: 'recentes',
    };

    this.cidades = [
      'Todas',
      'Paulistana',
      'Acauã',
      'Betânia do Piauí',
      'Jacobina do Piauí',
      'Queimada Nova',
    ];

    this.render();
    this.bindEvents();
  }

  render() {
    this.container.innerHTML = `
      <div class="filter-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
        <h3 style="font-size: 1.1rem; font-weight: 800; display: flex; align-items: center; gap: 0.5rem;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
          </svg>
          Filtros
        </h3>
        <button type="button" class="btn btn-sm btn-outline" id="btn-clear-filters" style="font-size: 0.8rem; padding: 0.25rem 0.6rem;">
          Limpar
        </button>
      </div>

      <!-- Ordenação -->
      <div class="filter-group">
        <label for="filter-sort-select" class="filter-title">Ordenar por</label>
        <select id="filter-sort-select" class="sort-select">
          <option value="recentes">Mais Recentes</option>
          <option value="price-asc">Menor Preço</option>
          <option value="price-desc">Maior Preço</option>
          <option value="name">Nome (A - Z)</option>
        </select>
      </div>

      <!-- Cidades da Região -->
      <div class="filter-group">
        <label for="filter-cidade-select" class="filter-title">Localização / Cidade</label>
        <select id="filter-cidade-select" class="sort-select">
          ${this.cidades
            .map(
              (cid) => `
            <option value="${cid.toLowerCase()}" ${this.state.cidade === cid.toLowerCase() ? 'selected' : ''}>
              ${cid}
            </option>
          `
            )
            .join('')}
        </select>
      </div>

      <!-- Categorias -->
      <div class="filter-group">
        <div class="filter-title">Categorias</div>
        <div class="filter-categories-list" id="filter-categories-list">
          ${this.categories
            .map(
              (cat) => `
            <div 
              class="filter-category-item ${this.state.category.toLowerCase() === cat.nome.toLowerCase() ? 'active' : ''}" 
              data-category="${sanitizeHTML(cat.nome)}"
            >
              <span>${sanitizeHTML(cat.nome)}</span>
            </div>
          `
            )
            .join('')}
        </div>
      </div>

      <!-- Faixa de Preço -->
      <div class="filter-group">
        <div class="filter-title">Faixa de Preço (R$)</div>
        <div class="price-inputs">
          <div class="price-input-wrapper">
            <span>R$</span>
            <input 
              type="number" 
              id="price-min" 
              class="price-input" 
              placeholder="Mín" 
              min="0"
              value="${this.state.minPrice}"
            >
          </div>
          <div class="price-input-wrapper">
            <span>R$</span>
            <input 
              type="number" 
              id="price-max" 
              class="price-input" 
              placeholder="Máx" 
              min="0"
              value="${this.state.maxPrice}"
            >
          </div>
        </div>
        <button type="button" class="btn btn-outline btn-sm" id="btn-apply-price" style="width: 100%;">
          Aplicar Preço
        </button>
      </div>
    `;
  }

  bindEvents() {
    // Clique em categoria
    const catList = this.container.querySelector('#filter-categories-list');
    catList.addEventListener('click', (e) => {
      const item = e.target.closest('[data-category]');
      if (!item) return;

      const categoryName = item.dataset.category;
      this.state.category = categoryName;

      this.container.querySelectorAll('.filter-category-item').forEach((el) => {
        el.classList.remove('active');
      });
      item.classList.add('active');

      this.triggerChange();
    });

    // Filtro por cidade
    const cidadeSelect = this.container.querySelector('#filter-cidade-select');
    cidadeSelect.addEventListener('change', (e) => {
      this.state.cidade = e.target.value;
      this.triggerChange();
    });

    // Ordenação
    const sortSelect = this.container.querySelector('#filter-sort-select');
    sortSelect.addEventListener('change', (e) => {
      this.state.sortBy = e.target.value;
      this.triggerChange();
    });

    // Aplicar Preço
    const applyPriceBtn = this.container.querySelector('#btn-apply-price');
    applyPriceBtn.addEventListener('click', () => {
      const minInput = this.container.querySelector('#price-min');
      const maxInput = this.container.querySelector('#price-max');

      this.state.minPrice = minInput.value ? Number(minInput.value) : 0;
      this.state.maxPrice = maxInput.value ? Number(maxInput.value) : Infinity;

      this.triggerChange();
    });

    // Limpar filtros
    const clearBtn = this.container.querySelector('#btn-clear-filters');
    clearBtn.addEventListener('click', () => {
      this.reset();
    });
  }

  setCategory(categoryName) {
    this.state.category = categoryName;
    const catList = this.container.querySelectorAll('.filter-category-item');
    catList.forEach((el) => {
      if (el.dataset.category.toLowerCase() === categoryName.toLowerCase()) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });
    this.triggerChange();
  }

  reset() {
    this.state = {
      category: 'todos',
      cidade: 'todas',
      minPrice: '',
      maxPrice: '',
      sortBy: 'recentes',
    };

    const minInput = this.container.querySelector('#price-min');
    const maxInput = this.container.querySelector('#price-max');
    const sortSelect = this.container.querySelector('#filter-sort-select');
    const cidadeSelect = this.container.querySelector('#filter-cidade-select');

    if (minInput) minInput.value = '';
    if (maxInput) maxInput.value = '';
    if (sortSelect) sortSelect.value = 'recentes';
    if (cidadeSelect) cidadeSelect.value = 'todas';

    this.container.querySelectorAll('.filter-category-item').forEach((el) => {
      el.classList.remove('active');
      if (el.dataset.category.toLowerCase() === 'todos') {
        el.classList.add('active');
      }
    });

    this.triggerChange();
  }

  triggerChange() {
    if (this.onFilterChange) {
      this.onFilterChange({ ...this.state });
    }
  }
}
