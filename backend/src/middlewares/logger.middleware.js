/**
 * Middleware leve e seguro para registrar requisições HTTP e tempo de resposta
 */
export function requestLogger(req, res, next) {
  const start = Date.now();
  const { method, originalUrl } = req;

  // Intercepta o término da resposta
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;

    // Formata o status com indicador de saúde
    let indicator = '🟢';
    if (statusCode >= 400 && statusCode < 500) indicator = '🟡';
    else if (statusCode >= 500) indicator = '🔴';

    const timestamp = new Date().toLocaleTimeString('pt-BR');
    console.log(`[${timestamp}] ${indicator} [${method}] ${originalUrl} - ${statusCode} (${duration}ms)`);
  });

  next();
}
