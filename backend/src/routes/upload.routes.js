import { Router } from 'express';
import multer from 'multer';
import { upload } from '../config/upload.js';
import { uploadSingle, uploadMultiple } from '../controllers/upload.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { uploadLimiter } from '../middlewares/rateLimiter.middleware.js';
import { AppError } from '../utils/errors.js';

const router = Router();

// Middleware que intercepta e formata erros nativos do Multer de forma amigável
function handleMulterError(multerUpload) {
  return (req, res, next) => {
    multerUpload(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return next(new AppError('A imagem excede o limite máximo permitido de 5MB.', 400));
          }
          if (err.code === 'LIMIT_FILE_COUNT') {
            return next(new AppError('Você pode enviar no máximo 6 fotos por vez.', 400));
          }
          return next(new AppError(`Erro no envio do arquivo: ${err.message}`, 400));
        }
        return next(err);
      }
      next();
    });
  };
}

// Todas as rotas de upload exigem login e proteção contra flood
router.use(authenticateToken);
router.use(uploadLimiter);

// 1. Upload de foto única (campo 'image' ou 'foto')
router.post('/single', handleMulterError(upload.single('image')), uploadSingle);

// 2. Upload de múltiplas fotos para anúncios (campo 'images' ou 'fotos')
router.post('/multiple', handleMulterError(upload.array('images', 6)), uploadMultiple);

export default router;
