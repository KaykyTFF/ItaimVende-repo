import path from 'path';
import { AppError } from '../../utils/errors.js';
import { UPLOAD_DIR } from '../../config/upload.js';

/**
 * Calcula a URL pública relativa e a categoria de armazenamento do arquivo
 */
function processarArquivoUpload(file) {
  const categoria = file.uploadCategory || (file.destination && file.destination.includes('perfil') ? 'perfil' : 'vendas');
  
  let subpath;
  if (file.path) {
    subpath = path.relative(UPLOAD_DIR, file.path).replace(/\\/g, '/');
  } else {
    subpath = `${categoria}/${file.filename}`;
  }

  return {
    url: `/uploads/${subpath}`,
    categoria,
    filename: file.filename,
    originalName: file.originalname,
    size: file.size,
    mimetype: file.mimetype,
  };
}

/**
 * Upload de uma única imagem (ex: foto de perfil ou foto avulsa)
 */
export async function uploadSingle(req, res, next) {
  try {
    if (!req.file) {
      throw new AppError('Nenhuma imagem foi enviada.', 400);
    }

    const info = processarArquivoUpload(req.file);

    res.status(201).json({
      success: true,
      message: 'Upload realizado com sucesso!',
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

    const uploadedFiles = req.files.map(processarArquivoUpload);
    const urls = uploadedFiles.map((f) => f.url);

    res.status(201).json({
      success: true,
      message: `${uploadedFiles.length} foto(s) enviada(s) com sucesso!`,
      urls,
      files: uploadedFiles,
    });
  } catch (error) {
    next(error);
  }
}
