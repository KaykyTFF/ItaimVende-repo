import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';
import { ENV } from '../config/env.js';

/**
 * Registro de novo usuário
 */
export async function register(req, res, next) {
  try {
    const { name, username, email, password, phone, city, neighborhood, role } = req.body;

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          ...(username ? [{ username }] : []),
        ],
      },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Já existe um cadastro com este e-mail ou nome de usuário.',
      });
    }

    // Hash seguro da senha com salt de 10 rounds
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        username: username || email.split('@')[0],
        email: email.toLowerCase(),
        password: hashedPassword,
        phone: phone || null,
        city: city || 'Paulistana',
        neighborhood: neighborhood || 'Centro',
        role: role || 'buyer',
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        city: true,
        neighborhood: true,
        phone: true,
        avatar: true,
        createdAt: true,
      },
    });

    // Emissão do token JWT
    const token = jwt.sign(
      { userId: newUser.id, role: newUser.role },
      ENV.JWT_SECRET,
      { expiresIn: ENV.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      success: true,
      message: 'Usuário cadastrado com sucesso!',
      user: newUser,
      token,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Autenticação / Login de usuário
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'E-mail ou senha incorretos.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'E-mail ou senha incorretos.',
      });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      ENV.JWT_SECRET,
      { expiresIn: ENV.JWT_EXPIRES_IN }
    );

    const safeUser = {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      city: user.city,
      neighborhood: user.neighborhood,
      phone: user.phone,
      avatar: user.avatar,
      bio: user.bio,
    };

    res.status(200).json({
      success: true,
      message: 'Login realizado com sucesso!',
      user: safeUser,
      token,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Obtém perfil do usuário logado
 */
export async function getProfile(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        phone: true,
        city: true,
        neighborhood: true,
        bio: true,
        avatar: true,
        createdAt: true,
        _count: {
          select: {
            products: true,
            orders: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Atualização dos dados do perfil
 */
export async function updateProfile(req, res, next) {
  try {
    const userId = req.user.id;
    const { name, username, phone, city, neighborhood, bio, avatar } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(username && { username }),
        ...(phone !== undefined && { phone }),
        ...(city !== undefined && { city }),
        ...(neighborhood !== undefined && { neighborhood }),
        ...(bio !== undefined && { bio }),
        ...(avatar !== undefined && { avatar }),
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        phone: true,
        city: true,
        neighborhood: true,
        bio: true,
        avatar: true,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Perfil atualizado com sucesso!',
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
}
