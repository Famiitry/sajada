/**
 * @swagger
 * /api/productos:
 *   get:
 *     summary: Get all productos
 *     tags: [Productos]
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
 *       - in: query
 *         name: categoriaId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of productos
 *   post:
 *     summary: Create producto
 *     tags: [Productos]
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
 *               - precio
 *               - categoriaId
 *             properties:
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               precio:
 *                 type: number
 *               stock:
 *                 type: integer
 *               categoriaId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Producto created
 *
 * /api/productos/{id}:
 *   get:
 *     summary: Get producto by ID
 *     tags: [Productos]
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
 *         description: Producto found
 *   put:
 *     summary: Update producto
 *     tags: [Productos]
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
 *         description: Producto updated
 *   delete:
 *     summary: Delete producto
 *     tags: [Productos]
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
 *         description: Producto deleted
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { Categoria, Producto } = require('../models/index');
const { authenticate, authorize } = require('../middleware/auth');
const { errorHandler, asyncHandler } = require('../middleware/error-handler');
const { ValidationError, NotFoundError } = require('../utils/errors');

const router = express.Router();

router.use(authenticate);

const getPagination = (page, limit) => {
  const p = parseInt(page) || 1;
  const l = parseInt(limit) || 10;
  const offset = (p - 1) * l;
  return { limit: l, offset };
};

router.get('/', asyncHandler(async (req, res, next) => {
  const { page, limit, search, categoriaId, minPrice, maxPrice } = req.query;
  const { limit: l, offset } = getPagination(page, limit);

  const where = {};
  if (search) {
    where[Op.or] = [
      { nombre: { [Op.iLike]: `%${search}%` } },
      { descripcion: { [Op.iLike]: `%${search}%` } }
    ];
  }

  if (categoriaId) {
    where.categoriaId = categoriaId;
  }

  if (minPrice || maxPrice) {
    where.precio = {};
    if (minPrice) where.precio[Op.gte] = parseFloat(minPrice);
    if (maxPrice) where.precio[Op.lte] = parseFloat(maxPrice);
  }

  const { count, rows } = await Producto.findAndCountAll({
    where,
    include: [{ model: Categoria, as: 'categoria' }],
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
    body('descripcion').optional({ nullable: true }).trim(),
    body('precio').isFloat({ min: 0 }).withMessage('Precio must be a positive number'),
    body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a positive integer'),
    body('categoriaId').isInt().withMessage('Categoria ID is required')
  ],
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed', errors.array());
    }

    const categoria = await Categoria.findByPk(req.body.categoriaId);
    if (!categoria) {
      throw new NotFoundError('Categoria not found');
    }

    const producto = await Producto.create(req.body);
    res.status(201).json(producto);
  })
);

router.get('/:id', asyncHandler(async (req, res, next) => {
  const producto = await Producto.findByPk(req.params.id, { include: [{ model: Categoria, as: 'categoria' }] });
  if (!producto) {
    throw new NotFoundError('Producto not found');
  }
  res.json(producto);
}));

router.put(
  '/:id',
  authorize('admin', 'vendedor'),
  [
    body('nombre').optional().trim().notEmpty().withMessage('Nombre cannot be empty'),
    body('descripcion').optional({ nullable: true }).trim(),
    body('precio').optional().isFloat({ min: 0 }).withMessage('Precio must be a positive number'),
    body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a positive integer'),
    body('categoriaId').optional().isInt().withMessage('Categoria ID must be an integer')
  ],
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed', errors.array());
    }

    const producto = await Producto.findByPk(req.params.id);
    if (!producto) {
      throw new NotFoundError('Producto not found');
    }

    if (req.body.categoriaId) {
      const categoria = await Categoria.findByPk(req.body.categoriaId);
      if (!categoria) {
        throw new NotFoundError('Categoria not found');
      }
    }

    await producto.update(req.body);
    const updatedProducto = await Producto.findByPk(producto.id, {
      include: [{ model: Categoria, as: 'categoria' }]
    });
    res.json(updatedProducto);
  })
);

router.delete(
  '/:id',
  authorize('admin'),
  asyncHandler(async (req, res, next) => {
    const producto = await Producto.findByPk(req.params.id);
    if (!producto) {
      throw new NotFoundError('Producto not found');
    }

    await producto.destroy();
    res.status(204).send();
  })
);

module.exports = router;
