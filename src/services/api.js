/**
 * Configuração Base do Cliente HTTP (Fetch API)
 */

export const API_CONFIG = {
  BASE_URL: window.__API_URL__ || 'http://localhost:3000/api',
  TIMEOUT: 8000,
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

/**
 * Cliente HTTP unificado com suporte a timeout, tratamento de erros e autenticação
 * @param {string} endpoint - Caminho relativo do recurso (ex: '/products')
 * @param {RequestInit} options - Opções do fetch
 * @returns {Promise<any>}
 */
export async function apiRequest(endpoint, options = {}) {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

  // Recupera token de autenticação caso disponível
  let authHeaders = {};
  try {
    const rawAuth = localStorage.getItem('marketplace_auth_session');
    if (rawAuth) {
      const auth = JSON.parse(rawAuth);
      if (auth && auth.token) {
        authHeaders['Authorization'] = `Bearer ${auth.token}`;
      }
    }
  } catch (e) {
    // Silently continue
  }

  const mergedHeaders = {
    ...API_CONFIG.HEADERS,
    ...authHeaders,
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers: mergedHeaders,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorBody.message || `Erro HTTP: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('A requisição excedeu o tempo limite (Timeout).');
    }
    throw error;
  }
}
