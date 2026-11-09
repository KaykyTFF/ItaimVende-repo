import prisma from '../../config/prisma.js';

export const DEFAULT_PREFERENCES = {
  'not-mensagens': true,
  'not-avaliacoes': true,
  'not-favoritos': true,
  'not-avisos': true,
  'priv-telefone': true,
  'priv-bairro': true,
  'priv-online': false,
};

/**
 * Obtém as preferências do usuário salvas no banco de dados
 */
export async function getUserPreferences(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { preferences: true },
  });

  const saved = (user && user.preferences && typeof user.preferences === 'object')
    ? user.preferences
    : {};

  return {
    ...DEFAULT_PREFERENCES,
    ...saved,
  };
}

/**
 * Atualiza as preferências do usuário de forma atômica
 */
export async function updateUserPreferences(userId, partialPreferences) {
  const current = await getUserPreferences(userId);
  const updated = {
    ...current,
    ...partialPreferences,
  };

  await prisma.user.update({
    where: { id: userId },
    data: { preferences: updated },
  });

  return updated;
}

