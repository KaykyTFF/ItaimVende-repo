/**
 * Middleware genérico para validação de esquemas Zod
 * @param {import('zod').ZodSchema} schema 
 * @param {'body' | 'query' | 'params'} source 
 */
export function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const issues = result.error?.issues || result.error?.errors || [];
      const formattedErrors = issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      return res.status(400).json({
        success: false,
        code: 'VALIDATION_ERROR',
        message: 'Falha na validação dos dados enviados.',
        detalhes: formattedErrors,
        details: formattedErrors,
        errors: formattedErrors,
      });
    }

    if (source === 'query') {
      try {
        req.query = result.data;
      } catch {
        for (const key of Object.keys(req.query || {})) {
          delete req.query[key];
        }
        Object.assign(req.query, result.data);
      }
    } else {
      req[source] = result.data;
    }
    next();
  };
}
