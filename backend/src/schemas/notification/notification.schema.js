import { z } from 'zod';

export const createNotificationSchema = z.object({
  title: z.string().trim().min(1, 'O título é obrigatório.').max(120, 'Título muito longo.'),
  message: z.string().trim().min(1, 'A mensagem é obrigatória.').max(1000, 'Mensagem muito longa.'),
  type: z.enum(['mensagem', 'avaliacao', 'compra', 'favorito', 'preco', 'aviso', 'sistema']).default('aviso'),
  link: z.string().trim().max(300).optional().nullable(),
});

export const listNotificationsQuerySchema = z.object({
  isRead: z.enum(['true', 'false', '1', '0']).optional(),
  type: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(30),
});
