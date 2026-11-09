import { z } from 'zod';

export const createProductSchema = z.object({
  title: z.string().min(3, 'O título do anúncio deve ter no mínimo 3 caracteres.'),
  description: z.string().min(5, 'A descrição deve ter no mínimo 5 caracteres.'),
  price: z.number().nonnegative('O preço deve ser maior ou igual a zero.'),
  originalPrice: z.number().positive().optional().nullable(),
  categoryId: z.number().int().positive('Selecione uma categoria válida.').optional(),
  categoryName: z.string().optional(),
  category: z.string().optional(),
  condition: z.enum(['NOVO', 'SEMINOVO', 'USADO', 'DEFEITO']).default('USADO'),
  listingType: z.enum(['VENDA', 'TROCA', 'DOACAO', 'SERVICO']).default('VENDA').optional(),
  city: z.string().optional(),
  neighborhood: z.string().optional(),
  isFeatured: z.boolean().optional().default(false),
  acceptsTrade: z.boolean().optional().default(false),
  images: z.array(z.string()).default([]),
});

export const updateProductSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(5).optional(),
  price: z.number().nonnegative().optional(),
  originalPrice: z.number().positive().optional().nullable(),
  categoryId: z.number().int().positive().optional(),
  categoryName: z.string().optional(),
  category: z.string().optional(),
  condition: z.enum(['NOVO', 'SEMINOVO', 'USADO', 'DEFEITO']).optional(),
  status: z.enum(['RASCUNHO', 'PENDENTE', 'ATIVO', 'PAUSADO', 'VENDIDO', 'REJEITADO', 'EXPIRADO', 'ARQUIVADO']).optional(),
  listingType: z.enum(['VENDA', 'TROCA', 'DOACAO', 'SERVICO']).optional(),
  city: z.string().optional(),
  neighborhood: z.string().optional(),
  isFeatured: z.boolean().optional(),
  acceptsTrade: z.boolean().optional(),
  images: z.array(z.string()).optional(),
});
