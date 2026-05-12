# Plan de Desarrollo por Fases

## Contexto del Proyecto

El proyecto esta dividido en dos aplicaciones principales:

- `frontend-app`: aplicacion React + TypeScript + Vite.
- `Herramientas-node-api`: API Node.js + Express + Sequelize + PostgreSQL.

El objetivo de este plan es distribuir el trabajo entre 3 desarrolladores usando ramas independientes, integracion controlada y verificaciones antes de afectar la rama principal de produccion.

## Flujo de Ramas

La rama `main` debe mantenerse como rama estable de produccion. Ningun desarrollador debe trabajar directamente sobre ella.

Ramas principales:

```text
main
develop
feature/dev1-auth-clientes
feature/dev2-inventario-productos
feature/dev3-ventas-integracion
release/v1.0.0
hotfix/*
```

Flujo recomendado:

```text
feature branch -> Pull Request -> develop -> release -> Pull Request -> main
```

Reglas principales:

- `main` debe estar protegida.
- Todo cambio debe pasar primero por `develop`.
- Cada desarrollador trabaja en una rama independiente.
- Cada Pull Request debe incluir revision, integracion y pruebas.
- No se deben subir archivos sensibles como `.env`, credenciales o configuraciones privadas.

## Distribucion por Desarrollador

## Desarrollador 1: Autenticacion, Usuarios y Clientes

Rama:

```bash
feature/dev1-auth-clientes
```

Responsabilidades:

- Revisar y completar login y registro.
- Mejorar validaciones de usuario.
- Gestionar roles: `admin`, `vendedor`, `user`.
- Completar endpoints de clientes.
- Revisar manejo seguro de JWT.
- Implementar integracion frontend para login, registro y sesion.
- Proteger rutas en frontend segun autenticacion y rol.

Archivos principales:

- `Herramientas-node-api/routes/auth.routes.js`
- `Herramientas-node-api/routes/cliente.routes.js`
- `Herramientas-node-api/middleware/auth.js`
- `Herramientas-node-api/models/usuario.js`
- `Herramientas-node-api/models/cliente.js`
- `frontend-app/src`

Verificacion minima:

```bash
cd Herramientas-node-api
npm start
```

```bash
cd frontend-app
npm run lint
npm run build
```

## Desarrollador 2: Inventario, Categorias y Productos

Rama:

```bash
feature/dev2-inventario-productos
```

Responsabilidades:

- Implementar o completar CRUD de categorias.
- Implementar o completar CRUD de productos.
- Agregar filtros de productos: busqueda, categoria y precio.
- Validar stock, precios y datos requeridos.
- Implementar pantallas frontend para catalogo y gestion de productos.
- Implementar formularios de creacion y edicion de productos.
- Corregir errores actuales relacionados con productos.

Observacion tecnica:

En `Herramientas-node-api/routes/producto.routes.js` existe un posible error porque se usa `include` sin estar definido en la consulta de productos. Este punto debe corregirse antes de integrar la rama.

Archivos principales:

- `Herramientas-node-api/routes/producto.routes.js`
- `Herramientas-node-api/routes/categoria.routes.js`
- `Herramientas-node-api/models/producto.js`
- `Herramientas-node-api/models/categoria.js`
- `frontend-app/src`

Verificacion minima:

```bash
cd Herramientas-node-api
npm start
```

```bash
cd frontend-app
npm run lint
npm run build
```

## Desarrollador 3: Ventas, Integracion y Calidad

Rama:

```bash
feature/dev3-ventas-integracion
```

Responsabilidades:

- Implementar o completar flujo de ventas.
- Gestionar detalle de venta.
- Validar descuento de stock.
- Implementar consulta de historial de ventas.
- Integrar frontend con la API.
- Revisar y completar documentacion Swagger.
- Definir pruebas basicas del backend.
- Preparar validaciones finales antes de produccion.

Archivos principales:

- `Herramientas-node-api/routes/venta.routes.js`
- `Herramientas-node-api/models/venta.js`
- `Herramientas-node-api/models/detalleventa.js`
- `Herramientas-node-api/config/swagger.js`
- `frontend-app/src`

Verificacion minima:

```bash
cd Herramientas-node-api
npm start
```

```bash
cd frontend-app
npm run lint
npm run build
```

## Fase 1: Estabilizacion Base

Objetivo: dejar el proyecto listo para desarrollo paralelo.

Actividades:

- Crear rama `develop` desde `main`.
- Proteger `main`.
- Configurar Pull Requests obligatorios.
- Verificar que el frontend compile.
- Verificar conexion del backend con PostgreSQL.
- Crear archivo `.env` local a partir de `.env.example`.
- Resolver errores bloqueantes actuales.

Validaciones:

```bash
cd frontend-app
npm install
npm run lint
npm run build
```

```bash
cd Herramientas-node-api
npm install
npm start
```

Criterios de aceptacion:

- `main` no se modifica directamente.
- `develop` queda como rama de integracion.
- Cada desarrollador tiene su rama independiente.
- Backend y frontend arrancan localmente.

## Fase 2: Desarrollo Funcional Independiente

Objetivo: permitir que cada desarrollador implemente su modulo sin interferir con los demas.

Ramas:

```text
feature/dev1-auth-clientes
feature/dev2-inventario-productos
feature/dev3-ventas-integracion
```

Reglas:

- Cada desarrollador trabaja solo en su rama.
- Los commits deben ser pequenos y descriptivos.
- No se permiten commits directos a `develop`.
- Antes de abrir Pull Request, cada rama debe actualizarse con `develop`.

Comandos recomendados:

```bash
git checkout develop
git pull origin develop
git checkout feature/dev1-auth-clientes
git merge develop
```

Validaciones por rama:

```bash
cd frontend-app
npm run lint
npm run build
```

```bash
cd Herramientas-node-api
npm start
```

Criterios de aceptacion:

- La funcionalidad asignada funciona localmente.
- La rama no rompe modulos de otros desarrolladores.
- No se incluyen archivos sensibles.
- Existe Pull Request abierto hacia `develop`.

## Fase 3: Integracion en Develop

Objetivo: integrar las tres ramas sin afectar produccion.

Orden sugerido de integracion:

1. `feature/dev1-auth-clientes`
2. `feature/dev2-inventario-productos`
3. `feature/dev3-ventas-integracion`

Motivo del orden:

- Autenticacion y usuarios son base para permisos.
- Productos y categorias dependen de permisos.
- Ventas depende de clientes, productos y stock.

Por cada Pull Request:

- Revisar cambios.
- Resolver conflictos.
- Ejecutar frontend.
- Ejecutar backend.
- Probar flujo manual.
- Aprobar y mergear a `develop`.

Validaciones:

```bash
cd frontend-app
npm run lint
npm run build
```

```bash
cd Herramientas-node-api
npm start
```

Pruebas manuales minimas:

- Registro de usuario.
- Login.
- Crear categoria.
- Crear producto.
- Listar productos.
- Crear cliente.
- Crear venta.
- Verificar reduccion de stock.
- Consultar venta creada.

Criterios de aceptacion:

- `develop` contiene las tres funcionalidades.
- No hay errores de compilacion.
- La API responde correctamente.
- El frontend consume correctamente la API.

## Fase 4: Testing y Endurecimiento

Objetivo: evitar que errores lleguen a produccion.

Actividades recomendadas:

- Agregar pruebas backend, porque actualmente `npm test` falla intencionalmente.
- Cambiar el script `test` del backend para ejecutar pruebas reales.
- Crear pruebas para login.
- Crear pruebas para registro.
- Crear pruebas para CRUD de productos.
- Crear pruebas para creacion de venta.
- Crear pruebas para stock insuficiente.
- Validar errores de API.
- Revisar seguridad basica: JWT, roles, CORS y Helmet.
- Revisar documentacion Swagger.

Nuevo flujo esperado:

```bash
cd Herramientas-node-api
npm test
```

```bash
cd frontend-app
npm run lint
npm run build
```

Criterios de aceptacion:

- Tests backend pasan.
- Build frontend pasa.
- No hay errores criticos en flujos principales.
- Swagger documenta endpoints relevantes.

## Fase 5: Preproduccion

Objetivo: validar `develop` como candidato a produccion.

Crear rama:

```bash
release/v1.0.0
```

Desde:

```bash
develop
```

Actividades:

- Congelar nuevas funcionalidades.
- Permitir solo correcciones de bugs.
- Probar todo el flujo completo.
- Validar variables de entorno.
- Validar conexion a base de datos de staging.
- Revisar documentacion de instalacion.

Validaciones:

```bash
cd frontend-app
npm run lint
npm run build
```

```bash
cd Herramientas-node-api
npm start
```

Criterios de aceptacion:

- Rama `release/v1.0.0` estable.
- Sin bugs bloqueantes.
- Funcionalidades principales verificadas.
- Lista para Pull Request hacia `main`.

## Fase 6: Produccion

Objetivo: actualizar `main` sin corromperla.

Flujo recomendado mediante Pull Request:

```text
release/v1.0.0 -> main
```

Flujo local solo si el equipo lo autoriza:

```bash
git checkout main
git pull origin main
git merge release/v1.0.0
git tag v1.0.0
```

Despues del merge:

- Desplegar backend.
- Desplegar frontend.
- Ejecutar smoke test.
- Validar login.
- Validar catalogo.
- Validar venta.
- Validar stock.

Si algo falla:

- No desarrollar directamente en `main`.
- Crear rama `hotfix/correccion-produccion`.
- Integrar el hotfix tanto en `main` como en `develop`.

## Resumen de Responsabilidades

| Desarrollador | Rama | Area principal |
| --- | --- | --- |
| Dev 1 | `feature/dev1-auth-clientes` | Autenticacion, usuarios, clientes y sesion frontend |
| Dev 2 | `feature/dev2-inventario-productos` | Categorias, productos, stock y catalogo frontend |
| Dev 3 | `feature/dev3-ventas-integracion` | Ventas, detalle de venta, integracion final y calidad |

## Regla Principal

Nada entra a `main` si no paso primero por revision, integracion y pruebas:

```text
feature branch -> Pull Request -> develop -> release -> Pull Request -> main
```
