import { z } from 'zod';

export const createProductSchema = z.object({
  title: z.string().min(3, 'O título do anúncio deve ter no mínimo 3 caracteres.'),
  description: z.string().min(10, 'A descrição deve ter no mínimo 10 caracteres.'),
  price: z.number().positive('O preço deve ser um valor maior que zero.'),
  originalPrice: z.number().positive().optional(),
  categoryId: z.number().int().positive('Selecione uma categoria válida.'),
  condition: z.enum(['NOVO', 'USADO']).default('NOVO'),
  isFeatured: z.boolean().optional().default(false),
  images: z.array(z.string().url('A imagem deve ser uma URL válida.')).min(1, 'Adicione pelo menos 1 imagem ao anúncio.'),
});

export const updateProductSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  price: z.number().positive().optional(),
  originalPrice: z.number().positive().optional(),
  categoryId: z.number().int().positive().optional(),
  condition: z.enum(['NOVO', 'USADO']).optional(),
  status: z.enum(['ATIVO', 'VENDIDO', 'PAUSADO']).optional(),
  isFeatured: z.boolean().optional(),
  images: z.array(z.string()).optional(),
});
