import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres.'),
  username: z.string().min(3, 'O username deve ter pelo menos 3 caracteres.').optional(),
  email: z.string().email('E-mail informado é inválido.'),
  password: z.string().min(6, 'A senha deve possuir pelo menos 6 caracteres.'),
  phone: z.string().optional(),
  city: z.string().optional(),
  neighborhood: z.string().optional(),
  role: z.enum(['buyer', 'seller', 'admin']).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('E-mail informado é inválido.'),
  password: z.string().min(1, 'A senha é obrigatória.'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres.').optional(),
  username: z.string().min(3).optional(),
  phone: z.string().optional(),
  city: z.string().optional(),
  neighborhood: z.string().optional(),
  bio: z.string().max(300, 'A biografia não pode exceder 300 caracteres.').optional(),
  avatar: z.string().optional(),
});
