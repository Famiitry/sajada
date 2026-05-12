const sequelize = require('../config/db');
const Categoria = require('./categoria');
const Producto = require('./producto');
const Cliente = require('./cliente');
const Venta = require('./venta');
const DetalleVenta = require('./detalleventa');
const Usuario = require('./usuario');

Categoria.hasMany(Producto, { foreignKey: 'categoriaId', as: 'productos' });
Producto.belongsTo(Categoria, { foreignKey: 'categoriaId', as: 'categoria' });

Cliente.hasMany(Venta, { foreignKey: 'clienteId', as: 'ventas' });
Venta.belongsTo(Cliente, { foreignKey: 'clienteId', as: 'cliente' });

Venta.hasMany(DetalleVenta, { foreignKey: 'ventaId', as: 'detalles' });
DetalleVenta.belongsTo(Venta, { foreignKey: 'ventaId', as: 'venta' });

Producto.hasMany(DetalleVenta, { foreignKey: 'productoId', as: 'detalleVentas' });
DetalleVenta.belongsTo(Producto, { foreignKey: 'productoId', as: 'producto' });

Cliente.hasOne(Usuario, { foreignKey: 'clienteId', as: 'usuario' });
Usuario.belongsTo(Cliente, { foreignKey: 'clienteId', as: 'cliente' });

module.exports = { sequelize, Categoria, Producto, Cliente, Venta, DetalleVenta, Usuario };