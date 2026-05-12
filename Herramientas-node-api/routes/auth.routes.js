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

const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const Usuario = require('../models/usuario');
const Cliente = require('../models/cliente');
const { generateToken } = require('../middleware/auth');
const { ValidationError, UnauthorizedError, ConflictError } = require('../utils/errors');

const router = express.Router();

router.post(
  '/register',
  [
    body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('nombre').notEmpty().withMessage('Nombre is required'),
    body('apellido').notEmpty().withMessage('Apellido is required'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new ValidationError('Validation failed', errors.array());
      }

      const { username, password, email, nombre, apellido, telefono, direccion, rol } = req.body;

      const existingUser = await Usuario.findOne({ where: { username } });
      if (existingUser) {
        throw new ConflictError('Username already exists');
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const cliente = await Cliente.create({
        identificacion: Date.now().toString(),
        nombre,
        apellido,
        email,
        telefono: telefono || '',
        direccion: direccion || ''
      });

      const usuario = await Usuario.create({
        username,
        password: hashedPassword,
        rol: rol || 'user',
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
        user: {
          id: usuario.id,
          username: usuario.username,
          rol: usuario.rol,
          clienteId: cliente.id
        }
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
        user: {
          id: usuario.id,
          username: usuario.username,
          rol: usuario.rol
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;