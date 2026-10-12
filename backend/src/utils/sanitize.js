/**
 * Utilitário robusto de sanitização de strings para prevenção contra Stored e Reflected XSS
 */
export function sanitizeText(input) {
  if (typeof input !== 'string') return input;

  let clean = input;

  // 1. Remove blocos inteiros de scripts, iframes, svgs e estilos (tag + conteúdo interno perigoso)
  clean = clean.replace(/<\s*script\b[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, '');
  clean = clean.replace(/<\s*style\b[^>]*>[\s\S]*?<\s*\/\s*style\s*>/gi, '');
  clean = clean.replace(/<\s*iframe\b[^>]*>[\s\S]*?<\s*\/\s*iframe\s*>/gi, '');
  clean = clean.replace(/<\s*svg\b[^>]*>[\s\S]*?<\s*\/\s*svg\s*>/gi, '');

  // 2. Remoção recursiva de tags HTML com fechamento (ex: <img ...>, <b>...</b>, <a ...>)
  let prev;
  do {
    prev = clean;
    clean = clean.replace(/<\s*\/?[a-zA-Z][^>]*>/gi, '');
  } while (clean !== prev);

  // 3. Remove caracteres remanescentes de abertura/fechamento de tags para impedir HTML Injection
  clean = clean.replace(/[<>]/g, '');

  // 4. Remove pseudo-protocolos perigosos e manipuladores de eventos inline
  clean = clean
    .replace(/javascript\s*:/gi, '')
    .replace(/vbscript\s*:/gi, '')
    .replace(/data\s*:\s*text\/html/gi, '')
    .replace(/\bon\w+\s*=/gi, '')
    .trim();

  return clean;
}

/**
 * Sanitiza recursivamente todos os campos de um objeto ou array,
 * preservando senhas intactas (pois vão para o hash bcrypt)
 */
export function sanitizeObject(obj) {
  if (!obj || typeof obj !== 'object') {
    return typeof obj === 'string' ? sanitizeText(obj) : obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item));
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    const keyLower = key.toLowerCase();
    // Senhas não são alteradas pois possuem caracteres especiais legítimos e vão para hash bcrypt
    if (keyLower.includes('password') || keyLower.includes('senha')) {
      sanitized[key] = value;
    } else {
      sanitized[key] = sanitizeObject(value);
    }
  }

  return sanitized;
}
