/**
 * @swagger
 * /api/clientes:
 *   get:
 *     summary: Get all clientes
 *     tags: [Clientes]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of clientes
 *   post:
 *     summary: Create cliente
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - identificacion
 *               - nombre
 *               - apellido
 *               - email
 *               - telefono
 *               - direccion
 *             properties:
 *               identificacion:
 *                 type: string
 *               nombre:
 *                 type: string
 *               apellido:
 *                 type: string
 *               email:
 *                 type: string
 *               telefono:
 *                 type: string
 *               direccion:
 *                 type: string
 *     responses:
 *       201:
 *         description: Cliente created
 *
 * /api/clientes/{id}:
 *   get:
 *     summary: Get cliente by ID
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cliente found
 *   put:
 *     summary: Update cliente
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cliente updated
 *   delete:
 *     summary: Delete cliente
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Cliente deleted
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { Cliente } = require('../models/index');
const { authenticate, authorize } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/error-handler');
const { ValidationError, NotFoundError, ForbiddenError, ConflictError } = require('../utils/errors');

const router = express.Router();

router.use(authenticate);

const getPagination = (page, limit) => {
  const p = parseInt(page) || 1;
  const l = parseInt(limit) || 10;
  const offset = (p - 1) * l;
  return { limit: l, offset };
};

const clienteValidators = (partial = false) => {
  const maybeOptional = (validator) => partial ? validator.optional() : validator;

  return [
    maybeOptional(body('identificacion')).notEmpty().withMessage('Identificacion is required'),
    maybeOptional(body('nombre')).notEmpty().withMessage('Nombre is required'),
    maybeOptional(body('apellido')).notEmpty().withMessage('Apellido is required'),
    maybeOptional(body('email')).isEmail().withMessage('Valid email is required'),
    maybeOptional(body('telefono')).notEmpty().withMessage('Telefono is required'),
    maybeOptional(body('direccion')).notEmpty().withMessage('Direccion is required')
  ];
};

const assertUniqueCliente = async ({ email, identificacion }, currentId = null) => {
  const uniqueChecks = [];
  if (email) uniqueChecks.push({ email });
  if (identificacion) uniqueChecks.push({ identificacion });
  if (uniqueChecks.length === 0) return;

  const where = { [Op.or]: uniqueChecks };
  if (currentId) {
    where.id = { [Op.ne]: currentId };
  }

  const existingCliente = await Cliente.findOne({ where });
  if (!existingCliente) return;

  if (email && existingCliente.email === email) {
    throw new ConflictError('Email already exists');
  }

  if (identificacion && existingCliente.identificacion === identificacion) {
    throw new ConflictError('Identificacion already exists');
  }
};

router.get('/', authorize('admin', 'vendedor'), asyncHandler(async (req, res, next) => {
  const { page, limit, search } = req.query;
  const { limit: l, offset } = getPagination(page, limit);

  const where = {};
  if (search) {
    where[Op.or] = [
      { nombre: { [Op.iLike]: `%${search}%` } },
      { apellido: { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } },
      { identificacion: { [Op.iLike]: `%${search}%` } }
    ];
  }

  const { count, rows } = await Cliente.findAndCountAll({
    where,
    limit: l,
    offset,
    order: [['createdAt', 'DESC']]
  });

  res.json({
    data: rows,
    pagination: {
      total: count,
      page: parseInt(page) || 1,
      limit: l,
      totalPages: Math.ceil(count / l)
    }
  });
}));

router.post(
  '/',
  authorize('admin', 'vendedor'),
  clienteValidators(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed', errors.array());
    }

    await assertUniqueCliente(req.body);

    const cliente = await Cliente.create(req.body);
    res.status(201).json(cliente);
  })
);

router.get('/:id', asyncHandler(async (req, res, next) => {
  const requestedId = Number(req.params.id);
  const isOwnCliente = req.user.rol === 'user' && req.user.clienteId === requestedId;
  const canReadAnyCliente = ['admin', 'vendedor'].includes(req.user.rol);

  if (!isOwnCliente && !canReadAnyCliente) {
    throw new ForbiddenError('Insufficient permissions');
  }

  const cliente = await Cliente.findByPk(req.params.id);
  if (!cliente) {
    throw new NotFoundError('Cliente not found');
  }
  res.json(cliente);
}));

router.put(
  '/:id',
  authorize('admin', 'vendedor'),
  clienteValidators(true),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed', errors.array());
    }

    const cliente = await Cliente.findByPk(req.params.id);
    if (!cliente) {
      throw new NotFoundError('Cliente not found');
    }

    await assertUniqueCliente(req.body, cliente.id);

    await cliente.update(req.body);
    res.json(cliente);
  })
);

router.delete(
  '/:id',
  authorize('admin'),
  asyncHandler(async (req, res, next) => {
    const cliente = await Cliente.findByPk(req.params.id);
    if (!cliente) {
      throw new NotFoundError('Cliente not found');
    }

    await cliente.destroy();
    res.status(204).send();
  })
);

module.exports = router;
