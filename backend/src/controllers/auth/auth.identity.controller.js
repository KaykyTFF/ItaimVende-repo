import { registerUser, loginUser, googleAuthUser } from '../../services/auth/index.js';

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

export async function googleAuth(req, res, next) {
  try {
    const result = await googleAuthUser(req.body);
    res.status(200).json({
      success: true,
      message: result.isNewUser
        ? 'Cadastro realizado com sucesso via Google!'
        : 'Login realizado com sucesso via Google!',
      ...result,
    });
  } catch (error) {
    next(error);
  }
}
