/**
 * @swagger
 * /api/categorias:
 *   get:
 *     summary: Get all categorias
 *     tags: [Categorias]
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
 *         description: List of categorias
 *   post:
 *     summary: Create categoria
 *     tags: [Categorias]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *             properties:
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *     responses:
 *       201:
 *         description: Categoria created
 *       403:
 *         description: Forbidden
 *
 * /api/categorias/{id}:
 *   get:
 *     summary: Get categoria by ID
 *     tags: [Categorias]
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
 *         description: Categoria found
 *       404:
 *         description: Categoria not found
 *   put:
 *     summary: Update categoria
 *     tags: [Categorias]
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
 *         description: Categoria updated
 *       404:
 *         description: Categoria not found
 *   delete:
 *     summary: Delete categoria
 *     tags: [Categorias]
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
 *         description: Categoria deleted
 *       403:
 *         description: Forbidden
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { Categoria, Producto } = require('../models/index');
const { authenticate, authorize } = require('../middleware/auth');
const { errorHandler, asyncHandler } = require('../middleware/error-handler');
const { ValidationError, NotFoundError, ConflictError } = require('../utils/errors');

const router = express.Router();

router.use(authenticate);

const getPagination = (page, limit) => {
  const p = parseInt(page) || 1;
  const l = parseInt(limit) || 10;
  const offset = (p - 1) * l;
  return { limit: l, offset };
};

router.get('/', asyncHandler(async (req, res, next) => {
  const { page, limit, search } = req.query;
  const { limit: l, offset } = getPagination(page, limit);

  const where = {};
  if (search) {
    where.nombre = { [Op.iLike]: `%${search}%` };
  }

  const { count, rows } = await Categoria.findAndCountAll({
    where,
    include: [{ model: Producto, as: 'productos' }],
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
  [
    body('nombre').trim().notEmpty().withMessage('Nombre is required'),
    body('descripcion').optional({ nullable: true }).trim()
  ],
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed', errors.array());
    }

    const existingCategoria = await Categoria.findOne({ where: { nombre: req.body.nombre } });
    if (existingCategoria) {
      throw new ConflictError('Categoria name already exists');
    }

    const categoria = await Categoria.create(req.body);
    res.status(201).json(categoria);
  })
);

router.get('/:id', asyncHandler(async (req, res, next) => {
  const categoria = await Categoria.findByPk(req.params.id, { include: [{ model: Producto, as: 'productos' }] });
  if (!categoria) {
    throw new NotFoundError('Categoria not found');
  }
  res.json(categoria);
}));

router.put(
  '/:id',
  authorize('admin', 'vendedor'),
  [
    body('nombre').optional().trim().notEmpty().withMessage('Nombre cannot be empty'),
    body('descripcion').optional({ nullable: true }).trim()
  ],
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed', errors.array());
    }

    const categoria = await Categoria.findByPk(req.params.id);
    if (!categoria) {
      throw new NotFoundError('Categoria not found');
    }

    if (req.body.nombre) {
      const existingCategoria = await Categoria.findOne({
        where: {
          nombre: req.body.nombre,
          id: { [Op.ne]: categoria.id }
        }
      });
      if (existingCategoria) {
        throw new ConflictError('Categoria name already exists');
      }
    }

    await categoria.update(req.body);
    res.json(categoria);
  })
);

router.delete(
  '/:id',
  authorize('admin'),
  asyncHandler(async (req, res, next) => {
    const categoria = await Categoria.findByPk(req.params.id);
    if (!categoria) {
      throw new NotFoundError('Categoria not found');
    }

    const productsCount = await Producto.count({ where: { categoriaId: categoria.id } });
    if (productsCount > 0) {
      throw new ConflictError('Cannot delete categoria with associated productos');
    }

    await categoria.destroy();
    res.status(204).send();
  })
);

module.exports = router;
