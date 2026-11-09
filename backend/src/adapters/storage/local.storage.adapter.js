import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { StorageAdapter } from './storage.adapter.interface.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_ROOT = path.resolve(__dirname, '../../../uploads');

/**
 * ADAPTER DE ARMAZENAMENTO EM DISCO LOCAL
 * 
 * Utilizado para desenvolvimento local ou como fallback transparente caso o provedor
 * de nuvem esteja temporariamente indisponível.
 */
export class LocalStorageAdapter extends StorageAdapter {
  constructor(options = {}) {
    super();
    this.rootDir = options.rootDir || UPLOAD_ROOT;
    this.ensureDirectories();
  }

  get provider() {
    return 'local';
  }

  /**
   * Garante a existência dos diretórios necessários
   */
  ensureDirectories() {
    ['perfil', 'vendas', 'chat'].forEach((sub) => {
      const target = path.join(this.rootDir, sub);
      if (!fs.existsSync(target)) {
        fs.mkdirSync(target, { recursive: true });
      }
    });
  }

  /**
   * Salva o buffer diretamente no disco local
   */
  async upload({ buffer, filename, category = 'vendas', contentType = 'image/webp' }) {
    const cleanCategory = category.toLowerCase().replace(/[^a-z0-9_-]/g, '') || 'vendas';
    const folder = path.join(this.rootDir, cleanCategory);

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }

    const filePath = path.join(folder, filename);
    await fs.promises.writeFile(filePath, buffer);

    const relativePath = `${cleanCategory}/${filename}`;
    const publicUrl = `/uploads/${relativePath}`;

    return {
      url: publicUrl,
      path: relativePath,
      filename,
      category: cleanCategory,
      contentType,
      size: buffer.length,
      provider: this.provider,
    };
  }

  /**
   * Remove arquivo do disco local (suporta caminho individual ou lista de caminhos)
   * @param {string|string[]} pathOrUrl
   */
  async delete(pathOrUrl) {
    if (Array.isArray(pathOrUrl)) {
      const results = await Promise.all(pathOrUrl.map((p) => this.delete(p)));
      return results.every(Boolean);
    }

    try {
      if (!pathOrUrl || typeof pathOrUrl !== 'string') return false;
      const clean = pathOrUrl.split('?')[0].split('#')[0].trim();
      const relative = clean.replace(/^\/uploads\//, '').replace(/^uploads\//, '');
      const fullPath = path.join(this.rootDir, relative);
      if (fs.existsSync(fullPath)) {
        await fs.promises.unlink(fullPath);
        return true;
      }
      return false;
    } catch (err) {
      console.warn(`[LocalStorageAdapter] Erro ao deletar arquivo: ${err.message}`);
      return false;
    }
  }

  /**
   * Remove múltiplos arquivos do disco local
   * @param {string[]} pathsOrUrls
   */
  async deleteMany(pathsOrUrls) {
    return this.delete(pathsOrUrls);
  }

  /**
   * Retorna a URL pública relativa no servidor
   */
  getPublicUrl(subpath) {
    const clean = subpath.replace(/^\//, '').replace(/^uploads\//, '');
    return `/uploads/${clean}`;
  }

  /**
   * Teste de escrita e leitura no disco
   */
  async healthCheck() {
    try {
      const testFile = path.join(this.rootDir, '.health-check-test');
      await fs.promises.writeFile(testFile, 'ok');
      await fs.promises.unlink(testFile);

      return {
        status: 'online',
        provider: this.provider,
        message: 'Armazenamento em disco local operacional e com permissão total de escrita/leitura.',
        details: {
          rootDir: this.rootDir,
        },
      };
    } catch (err) {
      return {
        status: 'offline',
        provider: this.provider,
        message: `Falha no armazenamento local: ${err.message}`,
        details: { rootDir: this.rootDir },
      };
    }
  }
}
