# Contexto rápido del servicio de membresías

Microservicio Express para gestionar planes de membresía y suscripciones de usuarios. Usa MongoDB (ver `src/config/database.js`) y middlewares de autenticación/roles en `src/middlewares` + utilidades en `src/utils`.

## Rutas principales (`/memberships`)
- Gestión de suscripciones: `POST /memberships` para crear, `DELETE /memberships/:membershipId` para cancelar, `POST /memberships/:membershipId/renew` para renovar y `PUT /memberships/:membershipId/suspend` para suspender.
- Planes: `POST /membership-plans`, `GET /membership-plans`, `PUT /membership-plans/:planId`, `DELETE /membership-plans/:planId`.
- Consultas: `GET /my-memberships` para el usuario, `GET /all-memberships` para admins y `GET /membership-history` para historial.

## Guías para Claude Code
- Mantén los validadores y middlewares de autorización (`authMiddleware` + `checkRol`) en cada ruta sensible.
- Coloca la lógica de negocio en controladores/handlers dentro de `src/handlers` y evita inflar las rutas.
- Reutiliza utilidades de roles o fechas en `src/utils` antes de introducir dependencias nuevas.
- ES modules únicamente (usa `import/export`).
