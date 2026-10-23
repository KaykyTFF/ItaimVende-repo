/**
 * CONTRATO BASE DO ADAPTER DE ARMAZENAMENTO (STORAGE ADAPTER)
 * 
 * Permite alternar de forma transparente entre provedores de armazenamento em nuvem:
 * - Supabase Storage (Oficial)
 * - Amazon S3 / Cloudflare R2 / Cloudinary
 * - Local Disk Storage (Desenvolvimento local / Fallback seguro)
 */
export class StorageAdapter {
  /**
   * Nome identificador do provedor (ex: 'supabase', 'local', 's3')
   */
  get provider() {
    throw new Error('Método provider deve ser implementado pelo adapter');
  }

  /**
   * Envia um arquivo para o armazenamento
   * @param {Object} params
   * @param {Buffer} params.buffer - Conteúdo binário do arquivo
   * @param {string} params.filename - Nome final do arquivo (ex: 'venda-171000-xyz.webp')
   * @param {string} params.category - Categoria/pasta ('perfil', 'vendas', 'chat')
   * @param {string} [params.contentType] - Tipo MIME do arquivo (padrão: 'image/webp')
   * @returns {Promise<{
   *   url: string,
   *   path: string,
   *   filename: string,
   *   category: string,
   *   provider: string
   * }>}
   */
  async upload(params) {
    throw new Error('Método upload deve ser implementado pelo adapter');
  }

  /**
   * Remove um arquivo do armazenamento
   * @param {string} pathOrUrl - Caminho ou URL pública do arquivo
   * @returns {Promise<boolean>}
   */
  async delete(pathOrUrl) {
    throw new Error('Método delete deve ser implementado pelo adapter');
  }

  /**
   * Retorna a URL pública completa para o arquivo
   * @param {string} path - Caminho relativo do arquivo (ex: 'vendas/foto.webp')
   * @returns {string}
   */
  getPublicUrl(path) {
    throw new Error('Método getPublicUrl deve ser implementado pelo adapter');
  }

  /**
   * Executa teste de conectividade e permissão no provedor
   * @returns {Promise<{
   *   status: 'online' | 'warning' | 'offline',
   *   provider: string,
   *   message: string,
   *   details?: any
   * }>}
   */
  async healthCheck() {
    throw new Error('Método healthCheck deve ser implementado pelo adapter');
  }
}
