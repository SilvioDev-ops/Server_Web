# Contexto rápido del servicio de perfiles de usuario

Servicio Express orientado a la gestión del perfil y recursos del usuario (diferente al login del `auth-service`). Usa MongoDB, autenticación JWT a través de `src/middlewares/authenticateToken.js` y utilidades de rol en `src/utils/checkRol.js`.

## Rutas principales (`/userProfile`)
- Creación y consulta: `POST /postUserProfile`, `GET /getUserProfile/:userId`.
- Administración: `GET /getAllUsersProfile` para admins y `DELETE /deleteUserProfile/:userId`.
- Actualizaciones: `PUT /putUserProfile/:userId` y `POST /uploadAvatar/:userId` para subir avatar.

## Comandos rápidos
- Desarrollo: `npm run dev`.
- Producción local: `npm start`.
- Pruebas: `npm test` (actualmente solo imprime `"Error: no test specified"`).

## Guías para Claude Code
- Mantén separada la validación de entrada en `src/validators` (p. ej. `postUserProfileValidator`, `uploadAvatarValidator`).
- Protege rutas con `authMiddleware` y `checkRol` como ya se hace en los ejemplos existentes.
- Ubica la lógica de negocio en handlers de `src/handlers`; los modelos viven en `src/models` y deben centralizar el acceso a MongoDB.
- Responde en JSON y respeta el patrón de ES modules.
