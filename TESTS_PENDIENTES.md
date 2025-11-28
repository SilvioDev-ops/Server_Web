# Lista de pruebas recomendadas por servicio

Este documento enumera las suites y casos mínimos que deberían implementarse en cada microservicio utilizando Jest y Supertest.

## auth-service (prefijo `/user`)
- Registro y login exitosos y con datos inválidos.
- Renovación de token (`POST /refresh-token`) con token válido/expirado.
- Recuperación y restablecimiento de contraseña (feliz y con token inválido o expirado).
- Rutas protegidas con `authMiddleware` y `checkRol`: acceso permitido/denegado según rol.
- Administración de usuarios (`GET /getAllUsers`, `POST /updateUserStatus/:userId`, `GET /getUser/:userId`).

## membership-service (prefijo `/memberships`)
- Creación de membresía (`POST /memberships`) con payload válido/inválido.
- Renovación (`POST /memberships/:membershipId/renew`) y suspensión (`PUT /memberships/:membershipId/suspend`).
- Cancelación (`DELETE /memberships/:membershipId`).
- Planes: crear/listar/actualizar/eliminar (`/membership-plans`).
- Consultas: `GET /my-memberships`, `GET /all-memberships`, `GET /membership-history` con roles Client/Admin.

## users-service (prefijo `/userProfile`)
- Creación de perfil (`POST /postUserProfile`) y validaciones de campos obligatorios.
- Consulta individual y masiva (`GET /getUserProfile/:userId`, `GET /getAllUsersProfile`) con control de roles.
- Actualización y eliminación (`PUT /putUserProfile/:userId`, `DELETE /deleteUserProfile/:userId`).
- Subida de avatar (`POST /uploadAvatar/:userId`) con archivo válido, tipo inválido y usuario sin permiso.

## notification-service (prefijo `/notification`)
- Envío de correo de recuperación (`POST /forgot-password`) éxito y validaciones de input.
- Manejo de error del proveedor de correo (mock) devuelve 500/controlado.

## payment-service (pendiente de implementación)
- Una vez creada la app: flujo de cobro simulado con validaciones de payload y manejo de error de Stripe (mock).
- Rutas protegidas (si aplica) con respuestas 401/403.

## quote-service (pendiente de implementación)
- Tras definir rutas: creación y listado de cotizaciones, validación de campos requeridos.
- Integraciones externas (axios) mockeadas para simular respuestas/errores.
