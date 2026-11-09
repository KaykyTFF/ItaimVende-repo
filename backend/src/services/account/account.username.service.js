import prisma from '../../config/prisma.js';
import { AppError } from '../../utils/errors.js';
import { RESERVED_USERNAMES, USERNAME_REGEX } from '../../schemas/account/account.schema.js';

export const USERNAME_COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000; // 30 dias exatos

/**
 * Calcula o status de liberação da alteração do nome de usuário (@) com base na regra de 30 dias
 */
export function calcularStatusUsername(usernameLastChangedAt) {
  const now = new Date();
  if (!usernameLastChangedAt) {
    return {
      usernameLastChangedAt: null,
      canChangeUsername: true,
      nextUsernameChangeAt: null,
      daysUntilNextUsernameChange: 0,
    };
  }

  const lastChanged = new Date(usernameLastChangedAt).getTime();
  const elapsedMs = now.getTime() - lastChanged;

  if (elapsedMs < USERNAME_COOLDOWN_MS) {
    const nextDate = new Date(lastChanged + USERNAME_COOLDOWN_MS);
    const diffMs = nextDate.getTime() - now.getTime();
    const daysRemaining = Math.max(1, Math.ceil(diffMs / (24 * 60 * 60 * 1000)));
    return {
      usernameLastChangedAt: new Date(usernameLastChangedAt).toISOString(),
      canChangeUsername: false,
      nextUsernameChangeAt: nextDate.toISOString(),
      daysUntilNextUsernameChange: daysRemaining,
    };
  }

  return {
    usernameLastChangedAt: new Date(usernameLastChangedAt).toISOString(),
    canChangeUsername: true,
    nextUsernameChangeAt: null,
    daysUntilNextUsernameChange: 0,
  };
}

/**
 * Checa a disponibilidade prévia de um username (@), validando formato, termos reservados e colisão
 */
export async function checkUsernameAvailability(userId, rawUsername) {
  if (!rawUsername || typeof rawUsername !== 'string') {
    return {
      available: false,
      valid: false,
      message: 'Nome de usuário não informado.',
    };
  }

  const clean = rawUsername.trim().toLowerCase();

  // 1. Validação de formato (3-20 caracteres alfanuméricos, ponto e underline, sem símbolo nas pontas)
  if (!USERNAME_REGEX.test(clean)) {
    return {
      available: false,
      valid: false,
      message: 'O @ deve ter de 3 a 20 caracteres (apenas letras minúsculas, números, . ou _), sem começar nem terminar com símbolos.',
    };
  }

  // 2. Validação de nomes reservados
  if (RESERVED_USERNAMES.includes(clean)) {
    return {
      available: false,
      valid: false,
      reserved: true,
      message: 'Este nome de usuário é reservado pelo sistema e não pode ser utilizado.',
    };
  }

  // 3. Checagem de cooldown do usuário autenticado (se fornecido)
  let cooldownInfo = { canChangeUsername: true, daysUntilNextUsernameChange: 0 };
  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { username: true, usernameLastChangedAt: true },
    });

    if (user) {
      if (user.username && user.username.toLowerCase() === clean) {
        return {
          available: true,
          valid: true,
          current: true,
          canChangeUsername: true,
          message: 'Este já é o seu nome de usuário atual.',
        };
      }

      cooldownInfo = calcularStatusUsername(user.usernameLastChangedAt);
      if (!cooldownInfo.canChangeUsername) {
        const dataFormatada = cooldownInfo.nextUsernameChangeAt
          ? new Date(cooldownInfo.nextUsernameChangeAt).toLocaleDateString('pt-BR')
          : '';
        return {
          available: true,
          valid: true,
          cooldownActive: true,
          canChangeUsername: false,
          daysUntilNextUsernameChange: cooldownInfo.daysUntilNextUsernameChange,
          nextUsernameChangeAt: cooldownInfo.nextUsernameChangeAt,
          message: `Alteração bloqueada: você só poderá alterar seu @ novamente em ${dataFormatada} (restam ${cooldownInfo.daysUntilNextUsernameChange} dias).`,
        };
      }
    }
  }

  // 4. Verificação de unicidade case-insensitive no banco de dados
  const existing = await prisma.user.findFirst({
    where: {
      username: { equals: clean, mode: 'insensitive' },
      ...(userId ? { NOT: { id: userId } } : {}),
    },
    select: { id: true },
  });

  if (existing) {
    return {
      available: false,
      valid: true,
      message: 'Este nome de usuário já está em uso por outro perfil.',
    };
  }

  return {
    available: true,
    valid: true,
    canChangeUsername: cooldownInfo.canChangeUsername,
    message: 'Nome de usuário disponível!',
  };
}

/**
 * Realiza a alteração exclusiva do nome de usuário (@) com controle rigoroso de 30 dias e histórico
 */
export async function changeUsername(userId, newUsername, meta = {}) {
  if (!newUsername || typeof newUsername !== 'string') {
    throw new AppError('Nome de usuário é obrigatório.', 400, 'INVALID_USERNAME');
  }

  const clean = newUsername.trim().toLowerCase();

  // Validação de formato
  if (!USERNAME_REGEX.test(clean)) {
    throw new AppError(
      'Nome de usuário inválido. O @ deve conter de 3 a 20 caracteres (apenas letras minúsculas, números, ponto ou sublinhado) e não pode começar nem terminar com símbolos.',
      400,
      'INVALID_USERNAME_FORMAT'
    );
  }

  // Validação de termos reservados
  if (RESERVED_USERNAMES.includes(clean)) {
    throw new AppError('Este nome de usuário é reservado pelo sistema e não pode ser utilizado.', 400, 'RESERVED_USERNAME');
  }

  // Busca dados atuais do usuário
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      usernameLastChangedAt: true,
      avatar: true,
    },
  });

  if (!user) {
    throw new AppError('Usuário não encontrado.', 404);
  }

  const oldUsername = user.username || null;
  const oldUsernameClean = (oldUsername || '').trim().toLowerCase();

  if (clean === oldUsernameClean) {
    throw new AppError('Você já está utilizando este nome de usuário.', 400, 'SAME_USERNAME');
  }

  // Aplicação da regra dos 30 dias com base no horário do servidor
  const statusCooldown = calcularStatusUsername(user.usernameLastChangedAt);
  if (!statusCooldown.canChangeUsername) {
    const dataFormatada = statusCooldown.nextUsernameChangeAt
      ? new Date(statusCooldown.nextUsernameChangeAt).toLocaleDateString('pt-BR')
      : '';
    throw new AppError(
      `Você poderá alterar seu nome de usuário novamente em ${dataFormatada} (restam ${statusCooldown.daysUntilNextUsernameChange} ${
        statusCooldown.daysUntilNextUsernameChange === 1 ? 'dia' : 'dias'
      }).`,
      403,
      'USERNAME_COOLDOWN_ACTIVE',
      {
        nextAllowedDate: statusCooldown.nextUsernameChangeAt,
        daysRemaining: statusCooldown.daysUntilNextUsernameChange,
        lastChangedAt: statusCooldown.usernameLastChangedAt,
      }
    );
  }

  // Checagem de colisão case-insensitive
  const existing = await prisma.user.findFirst({
    where: {
      username: { equals: clean, mode: 'insensitive' },
      NOT: { id: userId },
    },
    select: { id: true },
  });

  if (existing) {
    throw new AppError('Este nome de usuário já está em uso por outra conta.', 409, 'USERNAME_TAKEN');
  }

  const agora = new Date();

  // Executa transação: salva no histórico e atualiza o usuário
  const [updatedUser] = await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        username: clean,
        usernameLastChangedAt: agora,
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        avatar: true,
        usernameLastChangedAt: true,
      },
    }),
    prisma.usernameHistory.create({
      data: {
        userId,
        oldUsername,
        newUsername: clean,
        ipAddress: meta.ipAddress || null,
        userAgent: meta.userAgent || null,
      },
    }),
  ]);

  const novoStatus = calcularStatusUsername(updatedUser.usernameLastChangedAt);

  import('../notification/index.js').then(({ createNotification }) => {
    createNotification({
      userId,
      title: 'Nome de usuário atualizado',
      message: `Seu nome de usuário foi atualizado com sucesso para @${clean}.`,
      type: 'aviso',
      link: '/pages/perfil/configuracoes.html',
    }).catch(() => {});
  }).catch(() => {});

  return {
    success: true,
    message: 'Nome de usuário alterado com sucesso! Próxima alteração disponível em 30 dias.',
    user: {
      ...updatedUser,
      ...novoStatus,
    },
  };
}

