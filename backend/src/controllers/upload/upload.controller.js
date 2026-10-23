import fs from 'fs';
import { AppError } from '../../utils/errors.js';
import { resolverCategoriaUpload } from '../../config/upload.js';
import { optimizeImage } from '../../services/image/imageOptimizer.service.js';
import { storageAdapter } from '../../adapters/storage/index.js';

/**
 * Processa, otimiza com Sharp (.webp) e envia um arquivo para o Storage Adapter
 * 
 * @param {Express.Request} req 
 * @param {Express.Multer.File} file 
 */
async function processarEOtimizarUpload(req, file) {
  const categoria = resolverCategoriaUpload(req, file);

  // Obtém o buffer da imagem (memória do Multer ou leitura do disco)
  let rawBuffer = file.buffer;
  if (!rawBuffer && file.path && fs.existsSync(file.path)) {
    rawBuffer = await fs.promises.readFile(file.path);
  }

  if (!rawBuffer) {
    throw new AppError('Buffer do arquivo não encontrado para processamento.', 400);
  }

  // 1. Otimização e Compressão inteligente com Sharp (.webp)
  const optimized = await optimizeImage(rawBuffer, {
    category: categoria,
    originalName: file.originalname,
    mimetype: file.mimetype,
  });

  // 2. Gera nome único seguro com extensão .webp
  const prefixo = categoria === 'perfil' ? 'perfil' : (categoria === 'chat' ? 'chat' : 'venda');
  const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const finalFilename = `${prefixo}-${uniqueSuffix}.webp`;

  // 3. Envia para o Storage Adapter ativo (Supabase Storage em nuvem ou Local)
  const uploadResult = await storageAdapter.upload({
    buffer: optimized.buffer,
    filename: finalFilename,
    category: categoria,
    contentType: 'image/webp',
  });

  return {
    url: uploadResult.url,
    categoria,
    filename: finalFilename,
    originalName: file.originalname,
    size: optimized.info.size,
    originalSize: file.size || rawBuffer.length,
    savingsFormatted: optimized.info.savingsFormatted,
    mimetype: 'image/webp',
    width: optimized.info.width,
    height: optimized.info.height,
    provider: uploadResult.provider,
  };
}

/**
 * Upload de uma única imagem (ex: foto de perfil, anexo de chat ou foto avulsa)
 */
export async function uploadSingle(req, res, next) {
  try {
    if (!req.file) {
      throw new AppError('Nenhuma imagem foi enviada.', 400);
    }

    const info = await processarEOtimizarUpload(req, req.file);

    res.status(201).json({
      success: true,
      message: 'Upload e otimização realizados com sucesso!',
      data: info,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Upload de múltiplas imagens (ex: galeria do anúncio / vendas)
 */
export async function uploadMultiple(req, res, next) {
  try {
    if (!req.files || req.files.length === 0) {
      throw new AppError('Nenhuma imagem foi enviada.', 400);
    }

    // Processa todas as fotos em paralelo com Promise.all
    const uploadedFiles = await Promise.all(
      req.files.map((file) => processarEOtimizarUpload(req, file))
    );

    const urls = uploadedFiles.map((f) => f.url);

    res.status(201).json({
      success: true,
      message: `${uploadedFiles.length} foto(s) otimizada(s) e enviada(s) com sucesso!`,
      urls,
      files: uploadedFiles,
    });
  } catch (error) {
    next(error);
  }
}
