/**
 * Gerenciamento de Estado de Autenticação e Sessão (Itaim Vende)
 * Migrado e consolidado de js/sessao.js
 */

import { apiRequest } from '../services/api.js';

const STORAGE_KEYS = {
  USUARIO_ATIVO: 'itaim_usuario_ativo',
  PERFIL_CUSTOM: 'itaim_perfil_usuario',
  USUARIOS_DB: 'itaim_usuarios_db',
  AUTH_TOKEN: 'itaim_auth_token',
};

// Usuário Admin Padrão da plataforma
export const USUARIO_ADMIN = {
  id: 1,
  nome: 'Raili',
  username: 'rsstore',
  email: 'admin@gmail.com',
  telefone: '(85) 99985-8585',
  cidade: 'Paulistana',
  bairro: 'Centro',
  avatar: 'assets/images/icon-user.png',
  bio: 'Perfil oficial no Itaim Vende.',
  dataCadastro: 'Membro desde 2024',
  avaliacao: '5.0',
  totalAvaliacoes: 0,
  vendasConcluidas: 0,
  role: 'admin',
};

class AuthState {
  constructor() {
    this.user = this.obterUsuarioAtual();
    this.listeners = new Set();
  }

  carregarUsuarios() {
    let lista = [USUARIO_ADMIN];
    try {
      const salvos = JSON.parse(localStorage.getItem(STORAGE_KEYS.USUARIOS_DB) || '[]');
      if (Array.isArray(salvos) && salvos.length > 0) {
        const adminIdx = salvos.findIndex(
          (u) => (u.email || '').toLowerCase() === 'admin@gmail.com' || u.id === 1
        );
        if (adminIdx !== -1) {
          salvos[adminIdx] = { ...USUARIO_ADMIN, ...salvos[adminIdx] };
          lista = salvos;
        } else {
          lista = [USUARIO_ADMIN, ...salvos];
        }
      }
    } catch (e) {
      console.error('Erro ao carregar banco de usuários:', e);
    }
    return lista;
  }

  obterUsuarioAtual() {
    try {
      const salvo = localStorage.getItem(STORAGE_KEYS.USUARIO_ATIVO);
      if (salvo) {
        return JSON.parse(salvo);
      }
    } catch (e) {}

    // Verifica perfil salvo no localStorage
    try {
      const perfilCustom = JSON.parse(localStorage.getItem(STORAGE_KEYS.PERFIL_CUSTOM) || 'null');
      if (perfilCustom && perfilCustom.nome) {
        return { ...USUARIO_ADMIN, ...perfilCustom };
      }
    } catch (e) {}

    return USUARIO_ADMIN;
  }

  salvarUsuarioAtivo(usuario) {
    this.user = usuario;
    try {
      if (usuario) {
        localStorage.setItem(STORAGE_KEYS.USUARIO_ATIVO, JSON.stringify(usuario));
      } else {
        localStorage.removeItem(STORAGE_KEYS.USUARIO_ATIVO);
      }
    } catch (e) {
      console.error('Erro ao salvar sessão ativa:', e);
    }

    window.dispatchEvent(new CustomEvent('auth:changed', { detail: { user: this.user } }));
    this.listeners.forEach((fn) => fn(this.user));
  }

  async login(emailOuUser, senha) {
    const termo = (emailOuUser || '').trim().toLowerCase();
    if (!termo) {
      throw new Error('Informe o e-mail ou usuário para entrar.');
    }

    // Tenta autenticar na API real do backend
    try {
      const res = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: termo.includes('@') ? termo : `${termo}@gmail.com`,
          password: senha || 'admin123',
        }),
      });

      if (res && res.success && res.user) {
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, res.token);
        localStorage.setItem(
          'marketplace_auth_session',
          JSON.stringify({ token: res.token, user: res.user })
        );
        this.salvarUsuarioAtivo(res.user);
        return res.user;
      }
    } catch (apiErr) {
      if (apiErr.message && apiErr.message.includes('incorretos')) {
        throw apiErr;
      }
      // Se for erro de rede/servidor offline, segue com fallback local
    }

    const usuarios = this.carregarUsuarios();
    let encontrado = usuarios.find(
      (u) =>
        (u.email || '').toLowerCase() === termo ||
        (u.username || '').toLowerCase() === termo
    );

    if (!encontrado && (termo === 'admin@gmail.com' || termo === 'raili')) {
      encontrado = USUARIO_ADMIN;
    }

    if (!encontrado) {
      // Cria sessão como novo usuário visitante identificado
      const nomeBase = termo.includes('@') ? termo.split('@')[0] : termo;
      encontrado = {
        id: Date.now(),
        nome: nomeBase.charAt(0).toUpperCase() + nomeBase.slice(1),
        username: nomeBase,
        email: termo.includes('@') ? termo : `${termo}@itaimvende.com`,
        telefone: '',
        cidade: 'Paulistana',
        bairro: 'Centro',
        avatar: 'assets/images/icon-user.png',
        role: 'user',
      };
    }

    this.salvarUsuarioAtivo(encontrado);
    return encontrado;
  }

  async register({ nome, email, telefone, cidade, senha }) {
    if (!nome || !email) {
      throw new Error('Preencha os campos obrigatórios.');
    }

    // Tenta registrar na API do backend
    try {
      const res = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: nome,
          email,
          password: senha || '123456',
          phone: telefone || '',
          city: cidade || 'Paulistana',
        }),
      });

      if (res && res.success && res.user) {
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, res.token);
        localStorage.setItem(
          'marketplace_auth_session',
          JSON.stringify({ token: res.token, user: res.user })
        );
        this.salvarUsuarioAtivo(res.user);
        return res.user;
      }
    } catch (apiErr) {
      if (apiErr.message && apiErr.message.includes('Já existe')) {
        throw apiErr;
      }
    }

    const novo = {
      id: Date.now(),
      nome,
      username: email.split('@')[0],
      email,
      telefone: telefone || '',
      cidade: cidade || 'Paulistana',
      bairro: 'Centro',
      avatar: 'assets/images/icon-user.png',
      role: 'user',
    };

    const usuarios = this.carregarUsuarios();
    usuarios.push(novo);
    try {
      localStorage.setItem(STORAGE_KEYS.USUARIOS_DB, JSON.stringify(usuarios));
    } catch (e) {}

    this.salvarUsuarioAtivo(novo);
    return novo;
  }

  logout() {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem('marketplace_auth_session');
    this.salvarUsuarioAtivo(null);
  }

  getUser() {
    return this.user;
  }

  isAuthenticated() {
    return !!this.user;
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }
}

export const authState = new AuthState();

// Compatibilidade global legada
if (typeof window !== 'undefined') {
  window.ItaimSessao = window.ItaimSessao || {};
  window.ItaimSessao.obterUsuarioAtual = () => authState.getUser();
  window.ItaimSessao.USUARIO_ADMIN = USUARIO_ADMIN;
}
