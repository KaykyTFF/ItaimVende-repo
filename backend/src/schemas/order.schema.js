import { z } from 'zod';

export const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.number().int().positive('ID do produto inválido.'),
    quantity: z.number().int().positive('A quantidade deve ser de no mínimo 1.').default(1),
  })).min(1, 'O pedido precisa conter ao menos um item.'),
  shippingAddress: z.union([
    z.string().min(5, 'Endereço deve ser especificado.'),
    z.record(z.any()),
  ]),
  paymentMethod: z.enum(['pix', 'credit_card', 'boleto']).default('pix'),
});
