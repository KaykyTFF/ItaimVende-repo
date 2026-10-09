/**
 * Utilitários de Formatação e Helpers Gerais
 */

/**
 * Formata um valor numérico para a moeda Real Brasileiro (BRL)
 * @param {number} value - Valor numérico
 * @returns {string} String formatada como R$ 0,00
 */
export function formatCurrency(value) {
  if (value === null || value === undefined || isNaN(value)) {
    return 'R$ 0,00';
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Formata uma string de data para o padrão pt-BR
 * @param {string|Date} dateInput - Data de entrada
 * @returns {string}
 */
export function formatDate(dateInput) {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

/**
 * Sanitiza strings para inserção segura no DOM contra XSS
 * @param {string} str - Texto não confiável
 * @returns {string} Texto seguro
 */
export function sanitizeHTML(str) {
  if (!str) return '';
  const temp = document.createElement('div');
  temp.textContent = str;
  return temp.innerHTML;
}

/**
 * Limita o tamanho de uma string adicionando reticências
 * @param {string} str - Texto original
 * @param {number} length - Limite de caracteres
 * @returns {string}
 */
export function truncate(str, length = 80) {
  if (!str) return '';
  if (str.length <= length) return str;
  return str.substring(0, length) + '...';
}

/**
 * Função utilitária para aplicar Debounce em buscas e eventos de digitação
 * @param {Function} func - Função a ser executada
 * @param {number} wait - Tempo de espera em ms
 * @returns {Function}
 */
export function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Exibe notificação flutuante (Toast)
 * @param {string} message - Mensagem a ser exibida
 * @param {'success'|'error'|'info'} type - Tipo da notificação
 * @param {number} duration - Duração em ms
 */
export function showToast(message, type = 'success', duration = 3000) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${sanitizeHTML(message)}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'toastOut 0.3s forwards';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, duration);
}
