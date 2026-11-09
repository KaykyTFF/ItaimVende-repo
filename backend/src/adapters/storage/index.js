import { ENV } from '../../config/env.js';
import { StorageAdapter } from './storage.adapter.interface.js';
import { SupabaseStorageAdapter } from './supabase.storage.adapter.js';
import { LocalStorageAdapter } from './local.storage.adapter.js';

let cachedAdapter = null;

/**
 * Cria ou retorna o adapter de armazenamento configurado para o ambiente
 * 
 * @param {boolean} [forceNew=false] 
 * @returns {StorageAdapter}
 */
export function getStorageAdapter(forceNew = false) {
  if (cachedAdapter && !forceNew) {
    return cachedAdapter;
  }

  const provider = (ENV.STORAGE_PROVIDER || 'supabase').toLowerCase();

  if (provider === 'local') {
    cachedAdapter = new LocalStorageAdapter();
    console.log('📦 [Storage] Provedor ativo: Local Disk Storage (/uploads/)');
    return cachedAdapter;
  }

  // Padrão ou explícito: Supabase Storage
  cachedAdapter = new SupabaseStorageAdapter({
    supabaseUrl: ENV.SUPABASE_URL,
    supabaseKey: ENV.SUPABASE_KEY,
    bucketName: ENV.SUPABASE_BUCKET || 'marketplace',
    enableFallback: true,
  });

  if (cachedAdapter.isConfigured) {
    console.log(`☁️ [Storage] Provedor ativo: Supabase Cloud Storage (Bucket: "${ENV.SUPABASE_BUCKET || 'marketplace'}")`);
  } else {
    console.log('📦 [Storage] Provedor ativo: Local Disk Storage com otimização WebP (Modo desenvolvimento/fallback)');
  }

  return cachedAdapter;
}

export const storageAdapter = getStorageAdapter();

export {
  StorageAdapter,
  SupabaseStorageAdapter,
  LocalStorageAdapter,
};
