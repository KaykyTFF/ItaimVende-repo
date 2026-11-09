import sharp from 'sharp';
import { ENV } from '../../config/env.js';

/**
 * SERVIÇO DE OTIMIZAÇÃO E COMPRESSÃO DE IMAGENS COM SHARP
 * 
 * Benefícios:
 * - Reduz fotos de smartphones (3 a 5MB) para arquivos ultraleves .webp (~80 a 250KB)
 * - Corrige automaticamente a rotação EXIF de fotos tiradas em celulares
 * - Redimensiona proporcionalmente preservando aspecto e nitidez
 * - Remove metadados sensíveis (EXIF/GPS) mantendo o perfil de cor sRGB
 */

// Configurações padrão por categoria de imagem
const CATEGORY_PRESETS = {
  perfil: {
    maxWidth: 600,
    maxHeight: 600,
    quality: 85,
    fit: 'cover', // Foto de perfil pode ser cortada no centro se necessário
  },
  vendas: {
    maxWidth: ENV.IMAGE_MAX_WIDTH || 1600,
    maxHeight: ENV.IMAGE_MAX_WIDTH || 1600,
    quality: ENV.IMAGE_QUALITY || 82,
    fit: 'inside', // Fotos de produtos mantêm 100% da área sem corte
  },
  chat: {
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 80,
    fit: 'inside',
  },
  default: {
    maxWidth: 1600,
    maxHeight: 1600,
    quality: 82,
    fit: 'inside',
  },
};

/**
 * Otimiza e converte um buffer de imagem para .webp com compressão inteligente
 * 
 * @param {Buffer} inputBuffer - Buffer bruto da imagem recebida via Multer
 * @param {Object} options - Opções adicionais de processamento
 * @param {string} options.category - 'perfil' | 'vendas' | 'chat'
 * @param {string} options.originalName - Nome original do arquivo
 * @returns {Promise<{
 *   buffer: Buffer,
 *   info: {
 *     format: string,
 *     mimetype: string,
 *     width: number,
 *     height: number,
 *     size: number,
 *     originalSize: number,
 *     savingsPercent: number,
 *     savingsFormatted: string
 *   }
 * }>}
 */
export async function optimizeImage(inputBuffer, options = {}) {
  const originalSize = inputBuffer.length;
  const category = (options.category || 'default').toLowerCase();
  const preset = CATEGORY_PRESETS[category] || CATEGORY_PRESETS.default;

  // Se a otimização estiver desabilitada por configuração
  if (ENV.IMAGE_OPTIMIZATION_ENABLED === false) {
    return {
      buffer: inputBuffer,
      info: {
        format: 'original',
        mimetype: options.mimetype || 'image/jpeg',
        width: null,
        height: null,
        size: originalSize,
        originalSize,
        savingsPercent: 0,
        savingsFormatted: '0%',
      },
    };
  }

  try {
    // 1. Instância do Sharp com rotação automática baseada em EXIF (crucial para celular)
    let pipeline = sharp(inputBuffer, { failOnError: false }).rotate();

    // 2. Coleta metadados originais
    const metadata = await pipeline.metadata();

    // 3. Redimensionamento inteligente proporcional (sem esticar imagens menores)
    pipeline = pipeline.resize({
      width: preset.maxWidth,
      height: preset.maxHeight,
      fit: preset.fit,
      withoutEnlargement: true,
    });

    // 4. Conversão para WebP de alta eficiência
    pipeline = pipeline.webp({
      quality: preset.quality,
      effort: 4, // Equilíbrio ótimo entre velocidade de CPU e compressão
      smartSubsample: true,
    });

    // 5. Gera o buffer otimizado e extrai estatísticas
    const { data: optimizedBuffer, info } = await pipeline.toBuffer({ resolveWithObject: true });

    const newSize = optimizedBuffer.length;
    const savingsBytes = Math.max(0, originalSize - newSize);
    const savingsPercent = originalSize > 0 ? Math.round((savingsBytes / originalSize) * 100) : 0;

    return {
      buffer: optimizedBuffer,
      info: {
        format: 'webp',
        mimetype: 'image/webp',
        width: info.width,
        height: info.height,
        size: newSize,
        originalSize,
        savingsPercent,
        savingsFormatted: `${savingsPercent}% (${(savingsBytes / 1024).toFixed(1)} KB economizados)`,
        channels: info.channels,
      },
    };
  } catch (error) {
    console.warn(`[ImageOptimizer] Falha ao processar com Sharp, usando arquivo original: ${error.message}`);
    // Fallback seguro caso a imagem tenha algum formato exótico corrompido
    return {
      buffer: inputBuffer,
      info: {
        format: 'original',
        mimetype: options.mimetype || 'image/jpeg',
        width: null,
        height: null,
        size: originalSize,
        originalSize,
        savingsPercent: 0,
        savingsFormatted: '0%',
      },
    };
  }
}

/**
 * Gera uma miniatura (thumbnail) quadrada leve para listagens rápidas
 * 
 * @param {Buffer} inputBuffer 
 * @param {number} size - Largura e altura da thumbnail (padrão: 320px)
 */
export async function generateThumbnail(inputBuffer, size = 320) {
  try {
    const { data, info } = await sharp(inputBuffer, { failOnError: false })
      .rotate()
      .resize({
        width: size,
        height: size,
        fit: 'cover',
        position: 'centre',
      })
      .webp({ quality: 78, effort: 3 })
      .toBuffer({ resolveWithObject: true });

    return { buffer: data, info };
  } catch (err) {
    return null;
  }
}
