# Contexto rápido del servicio de autenticación

Servicio Node.js/Express para registro, login y administración de usuarios. Usa MongoDB (ver `src/config/database.js`), JWT y validaciones con `express-validator`. El `app` se monta en `src/app.js` y el servidor se inicia desde `index.js`.

## Rutas principales (`/user`)
- `POST /register` y `POST /login` para alta e inicio de sesión.
- Flujos de credenciales: `PUT /updateUser/:userId` para cambiar contraseña, `POST /refresh-token` para renovar tokens, y `GET /verify-email` para verificación.
- Recuperación de acceso: `POST /forgot-password` y `POST /reset-password`.
- Administración: `GET /getAllUsers`, `POST /updateUserStatus/:userId` y `GET /getUser/:userId` con `authMiddleware` + `checkRol`.

## Comandos rápidos
- Desarrollo: `npm run dev`.
- Producción local: `npm start`.
- Pruebas: `npm test` (actualmente solo imprime `"Error: no test specified"`).

## Guías para Claude Code
- Revisa y extiende validaciones en `src/validators` cuando añadas o modifiques rutas.
- Usa `authMiddleware` y `checkRol` para proteger endpoints y roles.
- Los handlers viven en `src/handlers`; mantén la lógica de bases de datos en controladores/modelos en lugar de mezclarla en rutas.
- Este servicio espera respuestas JSON y usa ES modules; evita `require`.
