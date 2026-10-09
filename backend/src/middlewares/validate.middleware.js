/**
 * Middleware genérico para validação de esquemas Zod
 * @param {import('zod').ZodSchema} schema 
 * @param {'body' | 'query' | 'params'} source 
 */
export function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const formattedErrors = result.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      return res.status(400).json({
        success: false,
        message: 'Falha na validação dos dados enviados.',
        errors: formattedErrors,
      });
    }

    req[source] = result.data;
    next();
  };
}
