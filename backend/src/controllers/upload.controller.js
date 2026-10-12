import { AppError } from '../utils/errors.js';

/**
 * Upload de uma única imagem (ex: foto de perfil)
 */
export async function uploadSingle(req, res, next) {
  try {
    if (!req.file) {
      throw new AppError('Nenhuma imagem foi enviada.', 400);
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    res.status(201).json({
      success: true,
      message: 'Upload realizado com sucesso!',
      data: {
        url: fileUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Upload de múltiplas imagens (ex: galeria do anúncio)
 */
export async function uploadMultiple(req, res, next) {
  try {
    if (!req.files || req.files.length === 0) {
      throw new AppError('Nenhuma imagem foi enviada.', 400);
    }

    const uploadedFiles = req.files.map((file) => ({
      url: `/uploads/${file.filename}`,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
    }));

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
