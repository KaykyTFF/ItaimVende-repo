import { registerUser, loginUser } from '../../services/auth.service.js';

export async function register(req, res, next) {
  try {
    const result = await registerUser(req.body);
    res.status(201).json({
      success: true,
      message: 'Usuário cadastrado com sucesso!',
      ...result,
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const result = await loginUser(req.body);
    res.status(200).json({
      success: true,
      message: 'Login realizado com sucesso!',
      ...result,
    });
  } catch (error) {
    next(error);
  }
}
