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

// Configuração de armazenamento em memória (MemoryStorage)
// O buffer é recebido diretamente na memória RAM, processado e compactado pelo Sharp (.webp),
// e em seguida enviado diretamente para a nuvem (Supabase Storage) ou disco local.
const memoryStorage = multer.memoryStorage();

// Filtro estrito de formatos de imagem suportados (incluindo HEIC/HEIF de smartphones)
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif',
    'image/avif',
  ];

  if (allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
    cb(null, true);
  } else {
    cb(new AppError('Formato de arquivo inválido. Apenas JPEG, PNG, WEBP e HEIC são permitidos.', 400), false);
  }
};

// Instância do Multer com limite de 10MB por foto (fotos de smartphones de 3 a 5MB são aceitas e compactadas)
export const upload = multer({
  storage: memoryStorage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB por arquivo (permite receber fotos pesadas de celulares para compressão Sharp)
    files: 6, // Máximo 6 fotos por envio
  },
});

