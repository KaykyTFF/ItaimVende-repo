import {
  listUserAddresses,
  getUserAddressById,
  createUserAddress,
  updateUserAddress,
  deleteUserAddress,
  setPrimaryUserAddress,
} from '../../services/address/index.js';

export async function getAddresses(req, res, next) {
  try {
    const addresses = await listUserAddresses(req.user.id);
    res.status(200).json({
      success: true,
      data: addresses,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAddress(req, res, next) {
  try {
    const address = await getUserAddressById(req.user.id, req.params.id);
    res.status(200).json({
      success: true,
      data: address,
    });
  } catch (error) {
    next(error);
  }
}

export async function createAddress(req, res, next) {
  try {
    const address = await createUserAddress(req.user.id, req.body);
    res.status(201).json({
      success: true,
      message: 'Endereço cadastrado com sucesso.',
      data: address,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateAddress(req, res, next) {
  try {
    const address = await updateUserAddress(req.user.id, req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Endereço atualizado com sucesso.',
      data: address,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteAddress(req, res, next) {
  try {
    const result = await deleteUserAddress(req.user.id, req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function setPrimaryAddress(req, res, next) {
  try {
    const address = await setPrimaryUserAddress(req.user.id, req.params.id);
    res.status(200).json({
      success: true,
      message: 'Endereço principal atualizado com sucesso.',
      data: address,
    });
  } catch (error) {
    next(error);
  }
}
