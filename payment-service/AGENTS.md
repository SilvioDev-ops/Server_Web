# Contexto rápido del servicio de pagos

Servicio preparado para Stripe y MongoDB (`package.json` incluye `stripe`, `express-validator`, `mongoose`), pero los archivos `app.js`, `index.js` y `src/getModel.js` están vacíos actualmente.

## Situación actual
- Aún no hay rutas ni lógica de negocio implementadas.
- Los scripts en `package.json` apuntan a `server.js`, que no existe; al iniciar este servicio deberás ajustar el punto de entrada.

## Comandos rápidos
- Desarrollo: `npm run dev` (fallará hasta que se cree un punto de entrada real).
- Producción local: `npm start` (igual que arriba, requiere definir `server.js` o actualizar scripts).
- Pruebas: `npm test` solo imprime `"Error: no test specified"`.

## Guías para Claude Code
- Sigue el patrón de los otros microservicios: crea `src/app.js` con middlewares base y un `index.js/server.js` que conecte a MongoDB antes de escuchar.
- Define routers en `src/routes` y, si añades validaciones, colócalas en `src/validators` (crea la carpeta si no existe).
- Usa ES modules (`type: "module"` no está definido aún, así que si los usas agrégalo a `package.json` o mantén `require` de forma consistente).
- Tests: una vez creado `src/app.js`, genera `src/tests/payments.test.js` con Jest + Supertest. Cubre al menos una ruta de pago simulado y valida respuestas de autorización/validación; usa `supertest(app)` y mocks para Stripe (`jest.mock('stripe')`) o servicios externos.
