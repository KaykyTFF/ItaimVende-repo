import rateLimit from 'express-rate-limit';

/**
 * Rate Limiter Global para proteção contra DDoS, flood e scraping
 * Permite até 120 requisições por minuto por endereço IP
 */
export const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 120, // 120 requisições por minuto
  standardHeaders: true, // Retorna RateLimit-Limit e RateLimit-Remaining nos headers
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Muitas requisições originadas deste dispositivo. Por favor, aguarde um minuto antes de continuar.',
  },
});

/**
 * Rate Limiter estrito para Uploads de Imagens
 * Impede exaustão de armazenamento no disco (máximo 30 uploads por 15 min por IP)
 */
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 30, // Máximo 30 chamadas de upload a cada 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Limite de envio de imagens atingido. Por favor, aguarde 15 minutos antes de enviar novas fotos.',
  },
});
