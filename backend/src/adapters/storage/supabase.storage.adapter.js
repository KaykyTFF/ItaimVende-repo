import { createClient } from '@supabase/supabase-js';
import { StorageAdapter } from './storage.adapter.interface.js';
import { LocalStorageAdapter } from './local.storage.adapter.js';

/**
 * ADAPTER DE ARMAZENAMENTO EM NUVEM (SUPABASE STORAGE)
 * 
 * Envia arquivos diretamente para um bucket público no Supabase Storage.
 * Garante persistência permanente em servidores serverless (Render, Railway, Fly.io, Vercel)
 * onde o disco local é efêmero e apagado a cada deploy/reinicialização.
 */
export class SupabaseStorageAdapter extends StorageAdapter {
  /**
   * @param {Object} config
   * @param {string} config.supabaseUrl - URL do projeto Supabase (ex: https://xyz.supabase.co)
   * @param {string} config.supabaseKey - Chave de API do Supabase (anon ou service_role)
   * @param {string} [config.bucketName] - Nome do bucket público (padrão: 'marketplace')
   * @param {boolean} [config.enableFallback] - Habilita fallback local se a nuvem falhar
   */
  constructor(config = {}) {
    super();
    this.supabaseUrl = (config.supabaseUrl || '').replace(/\/$/, '');
    this.supabaseKey = config.supabaseKey || '';
    this.bucketName = config.bucketName || 'marketplace';
    this.enableFallback = config.enableFallback !== false;

    this.localFallback = new LocalStorageAdapter();
    this.isConfigured = Boolean(this.supabaseUrl && this.supabaseKey);

    if (this.isConfigured) {
      this.supabase = createClient(this.supabaseUrl, this.supabaseKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      this.bucketVerified = false;
    } else {
      console.warn(
        '⚠️ [SupabaseStorageAdapter] Credenciais do Supabase Storage não encontradas (.env). ' +
        'O sistema utilizará o LocalStorageAdapter em modo de compatibilidade/desenvolvimento.'
      );
    }
  }

  get provider() {
    return 'supabase';
  }

  /**
   * Garante que o bucket público exista no Supabase Storage
   */
  async ensureBucketExists() {
    if (!this.isConfigured || this.bucketVerified) return;

    try {
      const { data: buckets, error } = await this.supabase.storage.listBuckets();
      if (!error && Array.isArray(buckets)) {
        const found = buckets.find((b) => b.name === this.bucketName);
        if (!found) {
          // Tenta criar o bucket automaticamente com visibilidade pública
          const { error: createError } = await this.supabase.storage.createBucket(this.bucketName, {
            public: true,
            fileSizeLimit: '15MB',
            allowedMimeTypes: ['image/webp', 'image/jpeg', 'image/png', 'image/jpg'],
          });
          if (createError) {
            console.warn(`[SupabaseStorageAdapter] Aviso ao criar bucket "${this.bucketName}": ${createError.message}`);
          } else {
            console.log(`✅ [SupabaseStorageAdapter] Bucket público "${this.bucketName}" criado com sucesso no Supabase!`);
          }
        }
        this.bucketVerified = true;
      }
    } catch (err) {
      // Ignora erro silenciosamente para não interromper a inicialização
      console.warn(`[SupabaseStorageAdapter] Não foi possível verificar bucket antecipadamente: ${err.message}`);
    }
  }

  /**
   * Faz upload de um buffer otimizado para o Supabase Storage
   */
  async upload({ buffer, filename, category = 'vendas', contentType = 'image/webp' }) {
    // Se não estiver configurado com credenciais válidas, usa fallback local
    if (!this.isConfigured) {
      return this.localFallback.upload({ buffer, filename, category, contentType });
    }

    const cleanCategory = category.toLowerCase().replace(/[^a-z0-9_-]/g, '') || 'vendas';
    const storagePath = `${cleanCategory}/${filename}`;

    try {
      // Garante o bucket na primeira tentativa
      await this.ensureBucketExists();

      // Envia o arquivo para o Supabase Storage
      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .upload(storagePath, buffer, {
          contentType: contentType || 'image/webp',
          upsert: true,
          cacheControl: '31536000', // Cache longo para imagens com hash único
        });

      if (error) {
        throw new Error(`Erro Supabase Storage: ${error.message}`);
      }

      // Obtém a URL pública definitiva
      const { data: publicUrlData } = this.supabase.storage
        .from(this.bucketName)
        .getPublicUrl(storagePath);

      const publicUrl = publicUrlData?.publicUrl || `${this.supabaseUrl}/storage/v1/object/public/${this.bucketName}/${storagePath}`;

      return {
        url: publicUrl,
        path: storagePath,
        filename,
        category: cleanCategory,
        contentType,
        size: buffer.length,
        provider: this.provider,
        bucket: this.bucketName,
      };
    } catch (err) {
      console.error(`❌ [SupabaseStorageAdapter] Falha no upload para o Supabase: ${err.message}`);

      if (this.enableFallback) {
        console.warn('⚠️ [SupabaseStorageAdapter] Redirecionando upload para armazenamento local como contingência...');
        return this.localFallback.upload({ buffer, filename, category, contentType });
      }

      throw err;
    }
  }

  /**
   * Remove um arquivo do bucket
   */
  async delete(pathOrUrl) {
    if (!this.isConfigured) {
      return this.localFallback.delete(pathOrUrl);
    }

    try {
      let storagePath = pathOrUrl;
      // Se for uma URL completa, extrai apenas o path relativo do bucket
      const prefix = `${this.supabaseUrl}/storage/v1/object/public/${this.bucketName}/`;
      if (storagePath.startsWith(prefix)) {
        storagePath = storagePath.substring(prefix.length);
      }

      const { error } = await this.supabase.storage
        .from(this.bucketName)
        .remove([storagePath]);

      return !error;
    } catch (err) {
      console.warn(`[SupabaseStorageAdapter] Erro ao deletar do Supabase: ${err.message}`);
      return false;
    }
  }

  /**
   * Retorna a URL pública completa do arquivo
   */
  getPublicUrl(storagePath) {
    if (!this.isConfigured) {
      return this.localFallback.getPublicUrl(storagePath);
    }
    const clean = storagePath.replace(/^\//, '');
    const { data } = this.supabase.storage.from(this.bucketName).getPublicUrl(clean);
    return data?.publicUrl || `${this.supabaseUrl}/storage/v1/object/public/${this.bucketName}/${clean}`;
  }

  /**
   * Diagnóstico e teste de conectividade com o Supabase Storage
   */
  async healthCheck() {
    if (!this.isConfigured) {
      return {
        status: 'warning',
        provider: this.provider,
        message: 'Supabase Storage não configurado (.env sem SUPABASE_KEY). Operando via LocalStorageAdapter.',
        details: {
          configured: false,
          fallbackActive: true,
        },
      };
    }

    try {
      const { data: buckets, error } = await this.supabase.storage.listBuckets();
      if (error) {
        return {
          status: 'warning',
          provider: this.provider,
          message: `Conexão com Supabase Storage retornou aviso: ${error.message}`,
          details: { configured: true, bucket: this.bucketName, error: error.message },
        };
      }

      const bucketFound = buckets?.some((b) => b.name === this.bucketName);

      return {
        status: 'online',
        provider: this.provider,
        message: bucketFound
          ? `Supabase Storage conectado e bucket "${this.bucketName}" verificado.`
          : `Supabase Storage conectado (bucket "${this.bucketName}" será inicializado no primeiro upload).`,
        details: {
          configured: true,
          supabaseUrl: this.supabaseUrl,
          bucket: this.bucketName,
          bucketExists: bucketFound,
          availableBuckets: buckets?.map((b) => b.name) || [],
        },
      };
    } catch (err) {
      return {
        status: 'offline',
        provider: this.provider,
        message: `Falha ao conectar no Supabase Storage: ${err.message}`,
        details: { configured: true, error: err.message },
      };
    }
  }
}
