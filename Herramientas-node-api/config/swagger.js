const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Herramientas API',
      version: '1.0.0',
      description: 'API for herramientas programming store',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Categoria: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            nombre: { type: 'string' },
            descripcion: { type: 'string' },
          },
        },
        Producto: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            nombre: { type: 'string' },
            descripcion: { type: 'string' },
            precio: { type: 'number' },
            stock: { type: 'integer' },
            categoriaId: { type: 'integer' },
          },
        },
        Cliente: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            identificacion: { type: 'string' },
            nombre: { type: 'string' },
            apellido: { type: 'string' },
            email: { type: 'string' },
            telefono: { type: 'string' },
            direccion: { type: 'string' },
          },
        },
        Venta: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            fecha: { type: 'string', format: 'date-time' },
            total: { type: 'number' },
            clienteId: { type: 'integer' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            username: { type: 'string' },
            password: { type: 'string' },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['username', 'password', 'email', 'nombre', 'apellido'],
          properties: {
            username: { type: 'string' },
            password: { type: 'string' },
            email: { type: 'string' },
            nombre: { type: 'string' },
            apellido: { type: 'string' },
            telefono: { type: 'string' },
            direccion: { type: 'string' },
            rol: { type: 'string', enum: ['admin', 'vendedor', 'user'] },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = { swaggerSpec };