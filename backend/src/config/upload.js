import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { AppError } from '../utils/errors.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Diretório público de uploads na raiz do backend
export const UPLOAD_DIR = path.resolve(__dirname, '../../uploads');
export const UPLOAD_PERFIL_DIR = path.resolve(UPLOAD_DIR, 'perfil');
export const UPLOAD_VENDAS_DIR = path.resolve(UPLOAD_DIR, 'vendas');

// Garante que todos os diretórios existam
[UPLOAD_DIR, UPLOAD_PERFIL_DIR, UPLOAD_VENDAS_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * Determina a categoria de upload ('perfil' ou 'vendas') de forma inteligente e segura
 */
export function resolverCategoriaUpload(req, file) {
  // 1. Categoria definida explicitamente no request (ex: middleware de rota)
  if (req.uploadCategory) {
    const cat = String(req.uploadCategory).toLowerCase();
    if (cat.includes('perfil') || cat.includes('avatar')) return 'perfil';
    if (cat.includes('venda') || cat.includes('produto')) return 'vendas';
  }

  // 2. Parâmetro de rota ou query string (ex: ?tipo=perfil ou ?tipo=venda ou /:categoria)
  const param = (req.params?.categoria || req.query?.tipo || req.query?.folder || req.query?.categoria || '').toLowerCase();
  if (param.includes('perfil') || param.includes('avatar')) return 'perfil';
  if (param.includes('venda') || param.includes('produto')) return 'vendas';

  // 3. Pelo nome do campo no formulário
  const field = (file?.fieldname || '').toLowerCase();
  if (field === 'avatar' || field === 'foto_perfil' || field === 'perfil') return 'perfil';
  if (field === 'venda' || field === 'vendas' || field === 'produtos' || field === 'images') return 'vendas';

  // 4. Pela URL acessada
  const url = (req.originalUrl || req.url || '').toLowerCase();
  if (url.includes('perfil') || url.includes('avatar')) return 'perfil';
  if (url.includes('venda') || url.includes('produto')) return 'vendas';

  // 5. Fallback padrão: upload único assume 'perfil', upload múltiplo assume 'vendas'
  return (req.path?.includes('single') || field === 'image') ? 'perfil' : 'vendas';
}

// Configuração de armazenamento no disco com separação por pastas
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const categoria = resolverCategoriaUpload(req, file);
    const targetDir = categoria === 'perfil' ? UPLOAD_PERFIL_DIR : UPLOAD_VENDAS_DIR;

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    file.uploadCategory = categoria;
    cb(null, targetDir);
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
    const categoria = file.uploadCategory || resolverCategoriaUpload(req, file);
    const prefixo = categoria === 'perfil' ? 'perfil' : 'venda';
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    cb(null, `${prefixo}-${uniqueSuffix}${safeExt}`);
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
