/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Username already exists
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current authenticated user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user
 *       401:
 *         description: Invalid or missing token
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { Usuario, Cliente } = require('../models/index');
const { authenticate, generateToken } = require('../middleware/auth');
const { ValidationError, UnauthorizedError, ConflictError } = require('../utils/errors');

const router = express.Router();

const publicUser = (usuario, cliente = null) => ({
  id: usuario.id,
  username: usuario.username,
  rol: usuario.rol,
  clienteId: usuario.clienteId,
  ...(cliente && { cliente })
});

const assertUniqueRegistration = async ({ username, email, identificacion }) => {
  const existingUser = await Usuario.findOne({ where: { username } });
  if (existingUser) {
    throw new ConflictError('Username already exists');
  }

  const existingCliente = await Cliente.findOne({
    where: {
      [Op.or]: [
        { email },
        { identificacion }
      ]
    }
  });

  if (existingCliente?.email === email) {
    throw new ConflictError('Email already exists');
  }

  if (existingCliente?.identificacion === identificacion) {
    throw new ConflictError('Identificacion already exists');
  }
};

router.post(
  '/register',
  [
    body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('nombre').notEmpty().withMessage('Nombre is required'),
    body('apellido').notEmpty().withMessage('Apellido is required'),
    body('telefono').notEmpty().withMessage('Telefono is required'),
    body('direccion').notEmpty().withMessage('Direccion is required'),
    body('identificacion').optional().notEmpty().withMessage('Identificacion cannot be empty'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new ValidationError('Validation failed', errors.array());
      }

      const { username, password, email, nombre, apellido, telefono, direccion } = req.body;
      const identificacion = req.body.identificacion || Date.now().toString();

      await assertUniqueRegistration({ username, email, identificacion });

      const hashedPassword = await bcrypt.hash(password, 10);

      const cliente = await Cliente.create({
        identificacion,
        nombre,
        apellido,
        email,
        telefono,
        direccion
      });

      const usuario = await Usuario.create({
        username,
        password: hashedPassword,
        rol: 'user',
        clienteId: cliente.id
      });

      const token = generateToken({
        id: usuario.id,
        username: usuario.username,
        rol: usuario.rol
      });

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: publicUser(usuario)
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/login',
  [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new ValidationError('Validation failed', errors.array());
      }

      const { username, password } = req.body;

      const usuario = await Usuario.findOne({ where: { username } });
      if (!usuario) {
        throw new UnauthorizedError('Invalid credentials');
      }

      const isValidPassword = await bcrypt.compare(password, usuario.password);
      if (!isValidPassword) {
        throw new UnauthorizedError('Invalid credentials');
      }

      const token = generateToken({
        id: usuario.id,
        username: usuario.username,
        rol: usuario.rol
      });

      res.json({
        message: 'Login successful',
        token,
        user: publicUser(usuario)
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const usuario = await Usuario.findByPk(req.user.id, {
      include: [{ model: Cliente, as: 'cliente' }]
    });

    if (!usuario) {
      throw new UnauthorizedError('Invalid token');
    }

    res.json({
      user: publicUser(usuario, usuario.cliente)
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
