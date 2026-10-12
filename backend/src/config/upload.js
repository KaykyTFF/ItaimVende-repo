import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { AppError } from '../utils/errors.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Diretório público de uploads na raiz do backend
export const UPLOAD_DIR = path.resolve(__dirname, '../../uploads');

// Garante que o diretório exista
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Configuração de armazenamento no disco
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // Determina a extensão estritamente a partir do MIME type já validado
    const MIME_TO_EXT = {
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
    };
    const safeExt = MIME_TO_EXT[file.mimetype] || '.jpg';
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    cb(null, `itaim-${uniqueSuffix}${safeExt}`);
  },
});

// Filtro estrito de formatos de imagem suportados
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Formato de arquivo inválido. Apenas JPEG, PNG e WEBP são permitidos.', 400), false);
  }
};

// Instância do Multer com limite de 5MB por foto
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 6, // Máximo 6 fotos por envio
  },
});
