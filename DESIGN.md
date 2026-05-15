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

## Diseno Frontend

El frontend debe evolucionar desde la plantilla base de Vite hacia una interfaz administrativa moderna, limpia y enfocada en productividad. La experiencia debe priorizar lectura rapida, acciones claras y baja friccion para operar clientes, inventario y ventas.

### Estilo Visual

Direccion visual:

- Minimalista.
- Profesional.
- Clara para uso administrativo.
- Responsive desde el inicio.
- Sin decoracion innecesaria.

Paleta sugerida:

```text
Background principal: #F8FAFC
Superficie:            #FFFFFF
Texto principal:       #0F172A
Texto secundario:      #64748B
Borde:                 #E2E8F0
Primario:              #2563EB
Primario oscuro:       #1D4ED8
Exito:                 #16A34A
Alerta:                #F59E0B
Error:                 #DC2626
```

Tipografia:

```text
Familia: Inter, system-ui, sans-serif
Titulos: 600 - 700
Texto:   400 - 500
Tablas:  400 - 500
```

Escala de espaciado:

```text
4px, 8px, 12px, 16px, 24px, 32px, 48px
```

### Layout Principal

La aplicacion debe usar un layout administrativo con navegacion lateral en escritorio y navegacion compacta en movil.

```text
Desktop

+---------------------------------------------------+
| Sidebar     | Topbar                              |
|             |-------------------------------------|
| Dashboard   | Page title        Primary action     |
| Clientes    |-------------------------------------|
| Productos   | Content                             |
| Categorias  | Cards / tables / forms              |
| Ventas      |                                     |
+---------------------------------------------------+

Mobile

+-------------------------------------+
| Topbar + menu button                |
|-------------------------------------|
| Page title                          |
| Primary action                      |
|-------------------------------------|
| Content stacked                     |
+-------------------------------------+
```

Elementos del layout:

- `Sidebar`: acceso a modulos principales.
- `Topbar`: usuario activo, rol, logout y estado de sesion.
- `PageHeader`: titulo, descripcion corta y accion principal.
- `Content`: tarjetas, tablas, formularios y estados vacios.

### Navegacion

Rutas frontend sugeridas:

```text
/login
/register
/dashboard
/clientes
/clientes/nuevo
/clientes/:id
/categorias
/productos
/productos/nuevo
/productos/:id
/ventas
/ventas/nueva
/ventas/:id
```

Reglas de acceso:

```text
Publico:
  /login
  /register

Autenticado:
  /dashboard

Admin y vendedor:
  /clientes
  /categorias
  /productos
  /ventas

Solo admin:
  eliminaciones
  configuraciones criticas
```

### Pantallas Principales

#### Login

Objetivo:

- Permitir acceso rapido y claro.
- Mostrar errores sin exponer detalles sensibles.

Componentes:

- Tarjeta centrada.
- Campo usuario.
- Campo contrasena.
- Boton primario.
- Link a registro si aplica.

#### Dashboard

Objetivo:

- Dar resumen operativo del negocio.

Contenido recomendado:

- Ventas del dia.
- Productos con bajo stock.
- Total de clientes.
- Ultimas ventas.
- Accesos rapidos a nueva venta y nuevo producto.

#### Clientes

Objetivo:

- Buscar, crear y administrar clientes.

Componentes:

- Barra de busqueda.
- Tabla responsive.
- Acciones por fila.
- Formulario lateral o pagina dedicada para crear/editar.

Columnas sugeridas:

```text
Identificacion | Nombre | Email | Telefono | Acciones
```

#### Categorias

Objetivo:

- Mantener clasificacion simple del inventario.

Componentes:

- Lista compacta.
- Contador de productos asociados.
- Formulario de creacion rapida.

#### Productos

Objetivo:

- Administrar inventario con foco en stock y precio.

Componentes:

- Busqueda.
- Filtro por categoria.
- Filtro por rango de precio.
- Tabla o grilla compacta.
- Badge de stock bajo.
- Accion para editar producto.

Columnas sugeridas:

```text
Producto | Categoria | Precio | Stock | Estado | Acciones
```

Estados visuales:

```text
Stock alto:       badge verde
Stock bajo:       badge amarillo
Sin stock:        badge rojo
Producto inactivo: texto atenuado
```

#### Ventas

Objetivo:

- Crear ventas de forma rapida y segura.

Flujo recomendado:

```text
Seleccionar cliente -> Agregar productos -> Revisar total -> Confirmar venta
```

Componentes:

- Selector de cliente con busqueda.
- Buscador de productos.
- Carrito lateral o resumen fijo.
- Control de cantidad.
- Validacion de stock disponible.
- Total visible antes de confirmar.

#### Detalle de Venta

Objetivo:

- Mostrar comprobante interno de venta.

Contenido:

- Datos del cliente.
- Fecha.
- Productos vendidos.
- Cantidades.
- Precios unitarios.
- Subtotales.
- Total.

### Componentes Compartidos

Componentes base recomendados:

```text
Button
Input
Select
Textarea
Badge
Card
Table
Modal
Drawer
Toast
EmptyState
LoadingState
ErrorState
PageHeader
ProtectedRoute
AppLayout
```

Reglas de componentes:

- Cada componente debe tener una responsabilidad clara.
- Los estilos deben ser consistentes y reutilizables.
- Los formularios deben mostrar errores cerca del campo correspondiente.
- Las acciones destructivas deben requerir confirmacion.

### Estados de Interfaz

Cada pantalla que consume API debe contemplar estos estados:

```text
Idle
Loading
Success
Empty
Validation error
Server error
Unauthorized
Forbidden
```

Ejemplos:

- Si no hay productos, mostrar `EmptyState` con accion `Crear producto`.
- Si el token expira, redirigir a `/login`.
- Si el usuario no tiene permisos, mostrar una pantalla `403` clara.
- Si falla el servidor, permitir reintentar.

### Cliente API

El frontend debe centralizar llamadas HTTP en una capa compartida.

Estructura sugerida:

```text
src/shared/api/
  http.ts
  auth.api.ts
  clientes.api.ts
  categorias.api.ts
  productos.api.ts
  ventas.api.ts
```

Responsabilidades de `http.ts`:

- Definir `baseURL`.
- Adjuntar token JWT.
- Manejar errores comunes.
- Redirigir si la sesion expira.
- Normalizar respuestas.

Variable recomendada:

```text
VITE_API_URL=http://localhost:3000
```

### Manejo de Sesion

El estado de sesion debe ser pequeno y predecible.

Datos minimos:

```text
token
user.id
user.username
user.rol
```

Reglas:

- Persistir token solo si el equipo acepta el riesgo de `localStorage`.
- Limpiar sesion en logout.
- Validar rol antes de renderizar rutas protegidas.
- No duplicar informacion sensible en estado global.

### Formularios

Principios:

- Validar antes de enviar.
- Mostrar errores por campo.
- Deshabilitar submit durante envio.
- Evitar perdida accidental de datos.
- Confirmar acciones destructivas.

Campos requeridos por modulo:

```text
Cliente:
  identificacion, nombre, apellido, email, telefono, direccion

Categoria:
  nombre

Producto:
  nombre, precio, categoriaId

Venta:
  clienteId, productos[]
```

### Responsive

Breakpoints sugeridos:

```text
Mobile:  < 768px
Tablet:  768px - 1023px
Desktop: >= 1024px
```

Reglas:

- En movil, las tablas deben convertirse en tarjetas o listas apiladas.
- Las acciones principales deben permanecer visibles.
- La navegacion lateral debe convertirse en menu desplegable.
- Los formularios deben usar una sola columna en movil.

### Accesibilidad

Requisitos minimos:

- Contraste suficiente.
- Navegacion por teclado.
- Labels visibles o accesibles en inputs.
- Estados `focus-visible` claros.
- Mensajes de error asociados al campo.
- Botones con texto descriptivo.

### Propuesta Visual Minimalista

El diseño debe sentirse sobrio y funcional:

```text
Bordes suaves:       12px
Sombras:             sutiles o inexistentes
Fondos:              neutros
Acciones primarias:  azul consistente
Tablas:              limpias, con alto contraste y buena separacion
Cards:               solo para agrupar informacion util
```

Ejemplo de jerarquia de pagina:

```text
Titulo
Descripcion breve
Accion principal
Filtros
Contenido
Paginacion
```

### Prioridad de Implementacion Frontend

Orden recomendado:

1. Crear layout base y navegacion.
2. Crear cliente API compartido.
3. Implementar login y sesion.
4. Implementar rutas protegidas.
5. Implementar productos y categorias.
6. Implementar clientes.
7. Implementar ventas.
8. Agregar dashboard.
9. Pulir responsive y estados vacios.
10. Agregar pruebas de UI criticas.

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
