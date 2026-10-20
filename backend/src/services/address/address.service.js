import prisma from '../../config/prisma.js';
import { AppError } from '../../utils/errors.js';

/**
 * Formata o objeto de endereço para resposta da API
 */
function formatAddress(addr) {
  return {
    id: addr.id,
    userId: addr.userId,
    nickname: addr.nickname,
    street: addr.street,
    number: addr.number,
    complement: addr.complement,
    neighborhood: addr.neighborhood,
    city: addr.city,
    state: addr.state,
    postalCode: addr.postalCode,
    isDefault: addr.isDefault,
    createdAt: addr.createdAt,
    updatedAt: addr.updatedAt,
    // Propriedades amigáveis para retrocompatibilidade com o frontend
    apelido: addr.nickname,
    rua: addr.number ? `${addr.street}, ${addr.number}` : addr.street,
    logradouro: addr.street,
    numero: addr.number,
    complemento: addr.complement,
    bairro: addr.neighborhood,
    cidade: addr.city,
    estado: addr.state,
    cep: addr.postalCode,
    principal: addr.isDefault,
  };
}

/**
 * Lista todos os endereços do usuário autenticado
 */
export async function listUserAddresses(userId) {
  const addresses = await prisma.address.findMany({
    where: { userId },
    orderBy: [
      { isDefault: 'desc' },
      { createdAt: 'asc' },
    ],
  });

  return addresses.map(formatAddress);
}

/**
 * Obtém detalhes de um endereço específico do usuário
 */
export async function getUserAddressById(userId, addressId) {
  const address = await prisma.address.findFirst({
    where: { id: addressId, userId },
  });

  if (!address) {
    throw new AppError('Endereço não encontrado.', 404);
  }

  return formatAddress(address);
}

/**
 * Cria um novo endereço para o usuário
 */
export async function createUserAddress(userId, data) {
  const totalCount = await prisma.address.count({ where: { userId } });
  
  // Se for o primeiro endereço ou se foi marcado explicitamente como principal
  const shouldBeDefault = totalCount === 0 || data.isDefault === true;

  const result = await prisma.$transaction(async (tx) => {
    if (shouldBeDefault && totalCount > 0) {
      await tx.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const created = await tx.address.create({
      data: {
        userId,
        nickname: data.nickname || data.apelido || 'Casa',
        street: data.street || data.rua || '',
        number: data.number || data.numero || null,
        complement: data.complement || data.complemento || null,
        neighborhood: data.neighborhood || data.bairro || 'Centro',
        city: data.city || data.cidade || 'Paulistana',
        state: data.state || data.estado || 'PI',
        postalCode: data.postalCode || data.cep || null,
        isDefault: shouldBeDefault,
      },
    });

    // Se for o endereço principal, sincroniza com os dados de localização padrão do usuário
    if (shouldBeDefault) {
      await tx.user.update({
        where: { id: userId },
        data: {
          city: created.city,
          state: created.state,
          neighborhood: created.neighborhood,
          postalCode: created.postalCode,
        },
      });
    }

    return created;
  });

  return formatAddress(result);
}

/**
 * Atualiza um endereço existente do usuário
 */
export async function updateUserAddress(userId, addressId, data) {
  const existing = await prisma.address.findFirst({
    where: { id: addressId, userId },
  });

  if (!existing) {
    throw new AppError('Endereço não encontrado.', 404);
  }

  const shouldBeDefault = data.isDefault === true;

  const result = await prisma.$transaction(async (tx) => {
    if (shouldBeDefault && !existing.isDefault) {
      await tx.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const updated = await tx.address.update({
      where: { id: addressId },
      data: {
        nickname: data.nickname !== undefined ? data.nickname : (data.apelido !== undefined ? data.apelido : undefined),
        street: data.street !== undefined ? data.street : (data.rua !== undefined ? data.rua : undefined),
        number: data.number !== undefined ? data.number : (data.numero !== undefined ? data.numero : undefined),
        complement: data.complement !== undefined ? data.complement : (data.complemento !== undefined ? data.complemento : undefined),
        neighborhood: data.neighborhood !== undefined ? data.neighborhood : (data.bairro !== undefined ? data.bairro : undefined),
        city: data.city !== undefined ? data.city : (data.cidade !== undefined ? data.cidade : undefined),
        state: data.state !== undefined ? data.state : (data.estado !== undefined ? data.estado : undefined),
        postalCode: data.postalCode !== undefined ? data.postalCode : (data.cep !== undefined ? data.cep : undefined),
        isDefault: shouldBeDefault ? true : (data.isDefault !== undefined ? data.isDefault : undefined),
      },
    });

    if (updated.isDefault) {
      await tx.user.update({
        where: { id: userId },
        data: {
          city: updated.city,
          state: updated.state,
          neighborhood: updated.neighborhood,
          postalCode: updated.postalCode,
        },
      });
    }

    return updated;
  });

  return formatAddress(result);
}

/**
 * Remove um endereço do usuário
 */
export async function deleteUserAddress(userId, addressId) {
  const existing = await prisma.address.findFirst({
    where: { id: addressId, userId },
  });

  if (!existing) {
    throw new AppError('Endereço não encontrado.', 404);
  }

  await prisma.$transaction(async (tx) => {
    await tx.address.delete({ where: { id: addressId } });

    // Se o endereço removido era o principal, promove o próximo endereço mais antigo a principal
    if (existing.isDefault) {
      const nextDefault = await tx.address.findFirst({
        where: { userId },
        orderBy: { createdAt: 'asc' },
      });

      if (nextDefault) {
        await tx.address.update({
          where: { id: nextDefault.id },
          data: { isDefault: true },
        });

        await tx.user.update({
          where: { id: userId },
          data: {
            city: nextDefault.city,
            state: nextDefault.state,
            neighborhood: nextDefault.neighborhood,
            postalCode: nextDefault.postalCode,
          },
        });
      }
    }
  });

  return { success: true, message: 'Endereço removido com sucesso.' };
}

/**
 * Define um endereço específico como principal (default)
 */
export async function setPrimaryUserAddress(userId, addressId) {
  const existing = await prisma.address.findFirst({
    where: { id: addressId, userId },
  });

  if (!existing) {
    throw new AppError('Endereço não encontrado.', 404);
  }

  const result = await prisma.$transaction(async (tx) => {
    await tx.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    });

    const updated = await tx.address.update({
      where: { id: addressId },
      data: { isDefault: true },
    });

    await tx.user.update({
      where: { id: userId },
      data: {
        city: updated.city,
        state: updated.state,
        neighborhood: updated.neighborhood,
        postalCode: updated.postalCode,
      },
    });

    return updated;
  });

  return formatAddress(result);
}
