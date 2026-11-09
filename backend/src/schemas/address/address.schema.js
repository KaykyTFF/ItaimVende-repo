import { z } from 'zod';

export const createAddressSchema = z.object({
  nickname: z.string().trim().min(1, 'Dê um apelido ao endereço.').max(50, 'Apelido muito longo.').default('Casa'),
  street: z.string().trim().max(150, 'Endereço muito longo.').optional().default(''),
  number: z.string().trim().max(20).optional().nullable(),
  complement: z.string().trim().max(100).optional().nullable(),
  neighborhood: z.string().trim().max(80).optional().nullable(),
  city: z.string().trim().min(2, 'Cidade inválida.').max(60).default('Paulistana'),
  state: z.string().trim().min(2).max(2).default('PI'),
  postalCode: z.string().trim().max(15).optional().nullable(),
  isDefault: z.boolean().optional().default(false),
});

export const updateAddressSchema = z.object({
  nickname: z.string().trim().min(1, 'Dê um apelido ao endereço.').max(50, 'Apelido muito longo.').optional(),
  street: z.string().trim().max(150, 'Endereço muito longo.').optional().nullable(),
  number: z.string().trim().max(20).optional().nullable(),
  complement: z.string().trim().max(100).optional().nullable(),
  neighborhood: z.string().trim().max(80).optional().nullable(),
  city: z.string().trim().min(2).max(60).optional(),
  state: z.string().trim().min(2).max(2).optional(),
  postalCode: z.string().trim().max(15).optional().nullable(),
  isDefault: z.boolean().optional(),
});
