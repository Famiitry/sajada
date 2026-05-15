const express = require('express');
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { Cliente, Venta, DetalleVenta, Producto } = require('../models/index');
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

router.get('/', authorize('admin', 'vendedor'), asyncHandler(async (req, res, next) => {
  const { page, limit, clienteId, startDate, endDate } = req.query;
  const { limit: l, offset } = getPagination(page, limit);

  const where = {};
  const include = [
    { model: Cliente, as: 'cliente' },
    { model: DetalleVenta, as: 'detalles', include: [{ model: Producto, as: 'producto' }] }
  ];

  if (clienteId) {
    where.clienteId = clienteId;
  }

  if (startDate || endDate) {
    where.fecha = {};
    if (startDate) where.fecha[Op.gte] = new Date(startDate);
    if (endDate) where.fecha[Op.lte] = new Date(endDate);
  }

  const { count, rows } = await Venta.findAndCountAll({
    where,
    include,
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
  authorize('vendedor'),
  [
    body('clienteId').isInt().withMessage('Cliente ID is required'),
    body('productos').isArray({ min: 1 }).withMessage('Productos array is required')
  ],
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed', errors.array());
    }

    const { clienteId, productos } = req.body;

    const cliente = await Cliente.findByPk(clienteId);
    if (!cliente) {
      throw new NotFoundError('Cliente not found');
    }

    let total = 0;
    const detalles = [];

    for (const item of productos) {
      const producto = await Producto.findByPk(item.productoId);
      if (!producto) {
        throw new NotFoundError(`Producto ${item.productoId} not found`);
      }

      if (producto.stock < item.cantidad) {
        throw new ValidationError(`Insufficient stock for producto ${producto.nombre}`);
      }

      const subtotal = parseFloat(producto.precio) * item.cantidad;
      total += subtotal;

      await producto.update({ stock: producto.stock - item.cantidad });

      detalles.push({
        cantidad: item.cantidad,
        precioUnitario: producto.precio,
        subtotal: subtotal,
        productoId: item.productoId
      });
    }

    const venta = await Venta.create({
      fecha: new Date(),
      total: total,
      clienteId
    });

    for (const detalle of detalles) {
      await DetalleVenta.create({ ...detalle, ventaId: venta.id });
    }

    const ventaCompleta = await Venta.findByPk(venta.id, {
      include: [
        { model: Cliente, as: 'cliente' },
        { model: DetalleVenta, as: 'detalles', include: [{ model: Producto, as: 'producto' }] }
      ]
    });

    res.status(201).json(ventaCompleta);
  })
);

router.get('/:id', authorize('admin', 'vendedor'), asyncHandler(async (req, res, next) => {
  const venta = await Venta.findByPk(req.params.id, {
    include: [
      { model: Cliente, as: 'cliente' },
      { model: DetalleVenta, as: 'detalles', include: [{ model: Producto, as: 'producto' }] }
    ]
  });
  if (!venta) {
    throw new NotFoundError('Venta not found');
  }
  res.json(venta);
}));

module.exports = router;