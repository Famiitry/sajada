# Sajada Design

## Vision

Sajada es una aplicacion web para gestionar clientes, productos, categorias y ventas de una tienda. La arquitectura actual separa frontend y backend, con una API REST protegida por JWT y persistencia en PostgreSQL mediante Sequelize.

```text
React App -> REST API -> Sequelize -> PostgreSQL
```

## Estructura Actual

```text
frontend-app/
  src/
    App.tsx
    main.tsx
    App.css
    index.css

Herramientas-node-api/
  server.js
  config/
    db.js
    swagger.js
  middleware/
    auth.js
    error-handler.js
  models/
    usuario.js
    cliente.js
    categoria.js
    producto.js
    venta.js
    detalleventa.js
    index.js
  routes/
    auth.routes.js
    cliente.routes.js
    categoria.routes.js
    producto.routes.js
    venta.routes.js
  utils/
    errors.js
```

## Capas

### Frontend

Responsabilidad:

- Presentar la interfaz de usuario.
- Consumir la API REST.
- Gestionar sesion del usuario.
- Proteger vistas segun autenticacion y rol.

Estado actual:

- Proyecto React + TypeScript + Vite.
- La interfaz aun conserva estructura base de plantilla.

Evolucion recomendada:

```text
src/
  app/
    App.tsx
    routes.tsx
  modules/
    auth/
    clientes/
    categorias/
    productos/
    ventas/
  shared/
    api/
    components/
    layout/
    types/
```

### Backend

Responsabilidad:

- Exponer endpoints REST.
- Validar entradas.
- Aplicar autenticacion y autorizacion.
- Ejecutar reglas de negocio.
- Persistir datos.
- Documentar endpoints con Swagger.

Estado actual:

- Express centralizado en `server.js`.
- Rutas por modulo.
- Modelos Sequelize por entidad.
- Middleware de autenticacion JWT.
- Middleware de errores centralizado.

Evolucion recomendada:

```text
src/
  config/
  modules/
    auth/
      auth.routes.js
      auth.service.js
      auth.validators.js
    clientes/
    categorias/
    productos/
    ventas/
  shared/
    database/
    errors/
    middleware/
```

## Modulos del Dominio

### Auth

Archivos actuales:

- `routes/auth.routes.js`
- `middleware/auth.js`
- `models/usuario.js`

Funciones:

- Registro.
- Login.
- Generacion de JWT.
- Control de roles.

Roles actuales:

```text
admin
vendedor
user
```

Mejoras recomendadas:

- Mover la logica de autenticacion a un servicio.
- Exigir `JWT_SECRET` en produccion.
- Agregar expiracion y renovacion controlada de token.
- Evitar que el cliente pueda asignarse rol privilegiado durante registro publico.

### Clientes

Archivos actuales:

- `routes/cliente.routes.js`
- `models/cliente.js`

Funciones:

- Crear cliente.
- Listar clientes con paginacion.
- Buscar por nombre, apellido, email o identificacion.
- Actualizar cliente.
- Eliminar cliente.

Mejoras recomendadas:

- Validar duplicados con respuestas controladas.
- Separar reglas de validacion del archivo de rutas.
- Definir si un cliente siempre debe tener usuario o puede existir como entidad independiente.

### Categorias

Archivos actuales:

- `routes/categoria.routes.js`
- `models/categoria.js`

Funciones:

- Crear categoria.
- Listar categorias con productos asociados.
- Buscar por nombre.
- Actualizar categoria.
- Eliminar categoria.

Mejoras recomendadas:

- Impedir eliminacion si existen productos asociados, o aplicar una estrategia explicita.
- Agregar normalizacion de nombre para evitar duplicados visuales.

### Productos

Archivos actuales:

- `routes/producto.routes.js`
- `models/producto.js`

Funciones:

- Crear producto.
- Listar productos.
- Filtrar por busqueda, categoria y precio.
- Actualizar producto.
- Eliminar producto.
- Controlar stock.

Mejoras recomendadas:

- Corregir uso de `include` no definido en la consulta de listado.
- Validar que `precio` y `stock` no sean negativos.
- Agregar codigo unico o SKU.
- Registrar movimientos de inventario para auditoria.

### Ventas

Archivos actuales:

- `routes/venta.routes.js`
- `models/venta.js`
- `models/detalleventa.js`

Funciones:

- Crear venta.
- Validar cliente.
- Validar productos.
- Calcular subtotal y total.
- Descontar stock.
- Consultar ventas.
- Consultar detalle de venta.

Mejoras recomendadas:

- Ejecutar creacion de venta y descuento de stock dentro de una transaccion.
- Bloquear condiciones de carrera al vender el mismo producto concurrentemente.
- Guardar precio historico de venta, no depender del precio actual del producto.
- Agregar estados de venta: `pendiente`, `pagada`, `anulada`.

## Modelo de Datos

Relaciones actuales:

```text
Categoria 1 -> N Producto
Cliente 1 -> N Venta
Venta 1 -> N DetalleVenta
Producto 1 -> N DetalleVenta
Cliente 1 -> 1 Usuario
```

Vista simplificada:

```text
Usuario
  id
  username
  password
  rol
  clienteId

Cliente
  id
  identificacion
  nombre
  apellido
  email
  telefono
  direccion

Categoria
  id
  nombre
  descripcion

Producto
  id
  nombre
  descripcion
  precio
  stock
  categoriaId

Venta
  id
  fecha
  total
  clienteId

DetalleVenta
  id
  cantidad
  precioUnitario
  subtotal
  ventaId
  productoId
```

## API

Endpoints principales:

```text
POST /api/auth/register
POST /api/auth/login

GET    /api/clientes
POST   /api/clientes
GET    /api/clientes/:id
PUT    /api/clientes/:id
DELETE /api/clientes/:id

GET    /api/categorias
POST   /api/categorias
GET    /api/categorias/:id
PUT    /api/categorias/:id
DELETE /api/categorias/:id

GET    /api/productos
POST   /api/productos
GET    /api/productos/:id
PUT    /api/productos/:id
DELETE /api/productos/:id

GET  /api/ventas
POST /api/ventas
GET  /api/ventas/:id
```

Documentacion:

```text
GET /api-docs
GET /api-docs.json
```

## Seguridad

Estado actual:

- JWT para autenticacion.
- Roles para autorizacion.
- Helmet habilitado.
- CORS habilitado.
- Errores centralizados.

Mejoras recomendadas:

- Configurar CORS por origen permitido.
- Exigir `JWT_SECRET` desde variables de entorno.
- No usar secretos por defecto en produccion.
- Agregar rate limiting en login y registro.
- Registrar eventos de seguridad relevantes.

## Testing

Estado actual:

- Frontend tiene `lint` y `build`.
- Backend tiene script `test`, pero falla intencionalmente.

Flujo minimo recomendado:

```bash
cd frontend-app
npm run lint
npm run build
```

```bash
cd Herramientas-node-api
npm test
```

Pruebas prioritarias:

- Registro y login.
- Autorizacion por rol.
- CRUD de categorias.
- CRUD de productos.
- Creacion de venta.
- Descuento de stock.
- Stock insuficiente.
- Respuestas de error.

## Integracion y Entrega

Flujo recomendado:

```text
feature/* -> develop -> release/* -> main
```

Reglas:

- `main` solo recibe versiones verificadas.
- `develop` concentra integracion.
- Cada feature debe pasar revision.
- Cada release debe pasar pruebas manuales y automaticas.

## Oportunidades de Mejora

Prioridad alta:

- Agregar pruebas reales al backend.
- Corregir errores bloqueantes en consultas de productos.
- Usar transacciones en ventas.
- Separar rutas, servicios y validadores.
- Proteger `main` y trabajar con Pull Requests.

Prioridad media:

- Crear cliente API compartido en frontend.
- Implementar layout base, navegacion y rutas protegidas.
- Normalizar respuestas de API.
- Agregar paginacion consistente en todos los listados.
- Completar Swagger con ejemplos de request y response.

Prioridad baja:

- Agregar dashboards de ventas e inventario.
- Agregar auditoria de cambios.
- Agregar exportacion de reportes.
- Preparar despliegue con Docker.

## Principio de Diseno

Mantener modulos pequenos, rutas limpias y reglas de negocio fuera de los controladores.

```text
Simple primero.
Seguro por defecto.
Probado antes de integrar.
Produccion siempre estable.
```
