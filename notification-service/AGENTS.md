# Contexto rápido del servicio de notificaciones

Servicio mínimo de notificaciones centrado en el envío de correos para recuperación de contraseña. La app está en `src/app.js` y las rutas se montan desde `src/routes/indexRouter.js`.

## Ruta principal (`/notification`)
- `POST /forgot-password` delega en `sendResetPasswordEmailHandler` para disparar el correo de restablecimiento.

## Comandos rápidos
- Desarrollo: `npm run dev`.
- Producción local: `npm start`.
- Pruebas: `npm test` (actualmente muestra `"Error: no test specified"`).

## Guías para Claude Code
- Mantén la lógica de integración con el proveedor de correo dentro de `src/handlers` o servicios auxiliares; las rutas deben permanecer delgadas.
- Respeta la estructura de middleware existente (CORS, JSON parsing). Si añades más notificaciones, agrupa rutas relacionadas en `src/routes/notificationRouter.js` o nuevos routers.
