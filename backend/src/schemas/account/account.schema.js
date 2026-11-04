import { z } from 'zod';

export const RESERVED_USERNAMES = [
  'admin',
  'administrador',
  'suporte',
  'ajuda',
  'itaim',
  'itaimvende',
  'oficial',
  'moderador',
  'mod',
  'root',
  'sistema',
  'system',
  'atendimento',
  'seguranca',
  'contato',
  'api',
  'null',
  'undefined',
  'marketplace',
];

export const USERNAME_REGEX = /^[a-z0-9][a-z0-9._]{1,18}[a-z0-9]$/;

export const changeUsernameSchema = z.object({
  username: z
    .string({ required_error: 'Nome de usuário é obrigatório.' })
    .trim()
    .toLowerCase()
    .min(3, 'O nome de usuário deve conter no mínimo 3 caracteres.')
    .max(20, 'O nome de usuário deve conter no máximo 20 caracteres.')
    .refine((val) => USERNAME_REGEX.test(val), {
      message:
        'O nome de usuário deve conter de 3 a 20 caracteres (apenas letras minúsculas, números, ponto ou sublinhado) e não pode começar nem terminar com símbolos.',
    })
    .refine((val) => !RESERVED_USERNAMES.includes(val), {
      message: 'Este nome de usuário é reservado pelo sistema e não pode ser utilizado.',
    }),
});

export const requestEmailChangeSchema = z.object({
  currentPassword: z.string().min(1, 'A senha atual é obrigatória para autorizar a alteração.'),
  newEmail: z
    .string({ required_error: 'O novo e-mail é obrigatório.' })
    .trim()
    .toLowerCase()
    .email('Informe um endereço de e-mail válido.'),
});

export const confirmEmailChangeSchema = z.object({
  newEmail: z
    .string({ required_error: 'O novo e-mail é obrigatório.' })
    .trim()
    .toLowerCase()
    .email('Informe um endereço de e-mail válido.'),
  code: z
    .string({ required_error: 'O código de confirmação é obrigatório.' })
    .trim()
    .length(6, 'O código de confirmação deve possuir exatamente 6 dígitos.')
    .regex(/^\d{6}$/, 'O código deve conter apenas números.'),
});

export const changePhoneSchema = z.object({
  phone: z
    .string()
    .trim()
    .nullable()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === '') return true; // Permite desvincular telefone
      const digitos = val.replace(/\D/g, '');
      if (digitos.length !== 10 && digitos.length !== 11) return false;
      const ddd = parseInt(digitos.substring(0, 2), 10);
      if (ddd < 11 || ddd > 99) return false;
      if (digitos.length === 11 && digitos[2] !== '9') return false; // Celulares válidos no Brasil
      return true;
    }, {
      message: 'Informe um número de WhatsApp/celular válido com DDD (ex: (89) 99999-9999).',
    }),
});


