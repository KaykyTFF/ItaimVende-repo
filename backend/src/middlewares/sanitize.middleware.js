import { sanitizeObject } from '../utils/sanitize.js';

/**
 * Middleware global de higienização de entradas (req.body, req.query, req.params)
 * Elimina scripts e tags HTML maliciosas antes que cheguem aos schemas, services e banco de dados
 */
export function sanitizeInput(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    try {
      req.body = sanitizeObject(req.body);
    } catch {
      Object.assign(req.body, sanitizeObject(req.body));
    }
  }

  // No Express 5, req.query e req.params possuem apenas getter no IncomingMessage
  // Portanto, sanitizamos as chaves in-place
  if (req.query && typeof req.query === 'object') {
    try {
      const sanitized = sanitizeObject(req.query);
      for (const key of Object.keys(req.query)) {
        delete req.query[key];
      }
      Object.assign(req.query, sanitized);
    } catch (e) {
      // Ignora caso req.query seja imutável
    }
  }

  if (req.params && typeof req.params === 'object') {
    try {
      const sanitized = sanitizeObject(req.params);
      for (const key of Object.keys(req.params)) {
        delete req.params[key];
      }
      Object.assign(req.params, sanitized);
    } catch (e) {
      // Ignora caso req.params seja imutável
    }
  }

  next();
}
