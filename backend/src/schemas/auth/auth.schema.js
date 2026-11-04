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

export const googleAuthSchema = z.object({
  credential: z.string().optional(),
  idToken: z.string().optional(),
  email: z.string().email('E-mail informado é inválido.').optional(),
  name: z.string().optional(),
  avatar: z.string().optional(),
  googleId: z.string().optional(),
}).refine(data => Boolean(data.credential || data.idToken || data.email), {
  message: 'Credencial ou e-mail Google é obrigatório para autenticação.',
});

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres.').optional().nullable(),
  username: z.string().min(3, 'O nome de usuário deve ter pelo menos 3 caracteres.').optional().nullable().or(z.literal('')),
  phone: z.string().optional().nullable().or(z.literal('')),
  city: z.string().optional().nullable().or(z.literal('')),
  state: z.string().optional().nullable().or(z.literal('')),
  neighborhood: z.string().optional().nullable().or(z.literal('')),
  postalCode: z.string().optional().nullable().or(z.literal('')),
  bio: z.string().max(80, 'A biografia não pode exceder 80 caracteres.').optional().nullable().or(z.literal('')),
  avatar: z.string().optional().nullable().or(z.literal('')),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'A senha atual é obrigatória.'),
  newPassword: z
    .string()
    .min(6, 'A nova senha deve possuir pelo menos 6 caracteres.')
    .regex(/^(?=.*[A-Za-z])(?=.*\d)/, 'A nova senha deve conter pelo menos uma letra e um número para sua segurança.'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('E-mail informado é inválido.'),
});

export const verifyResetCodeSchema = z.object({
  email: z.string().email('E-mail informado é inválido.'),
  code: z
    .string()
    .min(6, 'O código deve conter 6 dígitos.')
    .max(6, 'O código deve conter 6 dígitos.')
    .regex(/^\d{6}$/, 'O código deve conter apenas números.'),
});

export const resetPasswordSchema = z.object({
  email: z.string().email('E-mail informado é inválido.'),
  token: z.string().optional(),
  code: z.string().optional(),
  newPassword: z
    .string()
    .min(6, 'A nova senha deve possuir pelo menos 6 caracteres.')
    .regex(/^(?=.*[A-Za-z])(?=.*\d)/, 'A nova senha deve conter pelo menos uma letra e um número para sua segurança.'),
}).refine(data => data.token || data.code, {
  message: 'É necessário fornecer o código de 6 dígitos ou o token de recuperação.',
  path: ['token'],
});
