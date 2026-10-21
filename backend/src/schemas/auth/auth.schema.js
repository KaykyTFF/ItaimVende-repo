import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres.'),
  username: z.string().min(3, 'O username deve ter pelo menos 3 caracteres.').optional().or(z.literal('')),
  email: z.string().email('E-mail informado é inválido.'),
  password: z
    .string()
    .min(6, 'A senha deve possuir pelo menos 6 caracteres.')
    .regex(/^(?=.*[A-Za-z])(?=.*\d)/, 'A senha deve conter pelo menos uma letra e um número para sua segurança.'),
  phone: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  state: z.string().optional().or(z.literal('')),
  neighborhood: z.string().optional().or(z.literal('')),
  postalCode: z.string().optional().or(z.literal('')),
  role: z.enum(['buyer', 'seller', 'admin', 'BUYER', 'SELLER', 'ADMIN']).optional(),
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

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'A senha atual é obrigatória.'),
  newPassword: z
    .string()
    .min(6, 'A nova senha deve possuir pelo menos 6 caracteres.')
    .regex(/^(?=.*[A-Za-z])(?=.*\d)/, 'A nova senha deve conter pelo menos uma letra e um número para sua segurança.'),
});

