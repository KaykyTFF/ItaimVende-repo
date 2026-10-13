import dotenv from 'dotenv';
dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

// Em produção, a chave JWT deve ser obrigatoriamente definida no arquivo .env
if (isProduction && !process.env.JWT_SECRET) {
  throw new Error('CONFIGURAÇÃO CRÍTICA: A variável JWT_SECRET deve ser definida no arquivo .env para o ambiente de produção.');
}

export const ENV = {
  PORT: Number(process.env.PORT) || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'dev-local-jwt-secret-inseguro-apenas-para-testes',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '2h',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
};

