import { z } from 'zod';

/**
 * Esquema de validação para criação ou busca de conversa
 */
export const createConversationSchema = z.object({
  productId: z
    .string({ required_error: 'O ID do anúncio é obrigatório.' })
    .min(1, 'O ID do anúncio não pode estar vazio.'),
});

/**
 * Esquema de validação para envio de mensagem
 */
export const sendMessageSchema = z.object({
  content: z
    .string({ required_error: 'A mensagem não pode estar vazia.' })
    .trim()
    .min(1, 'A mensagem não pode estar vazia.')
    .max(3000, 'Mensagem muito longa (limite máximo de 3.000 caracteres).'),
  messageType: z
    .enum(['TEXT', 'IMAGE', 'OFFER'])
    .default('TEXT')
    .optional(),
  offerValue: z
    .number()
    .positive('O valor da proposta deve ser um número positivo.')
    .optional()
    .nullable(),
});

/**
 * Esquema de validação dos parâmetros de URL de conversa
 */
export const conversationParamsSchema = z.object({
  id: z
    .string({ required_error: 'ID da conversa é obrigatório.' })
    .min(1, 'ID da conversa inválido.'),
});
