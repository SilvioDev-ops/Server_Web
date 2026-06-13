# Prompt sugerido para Claude Code

Usa este prompt para pedir a Claude que genere las pruebas automatizadas en cada microservicio respetando las guías del repositorio:

```
Actúa como colaborador en este monorepo de microservicios Node.js/Express (ES modules). Para cada servicio existente:
1) Lee y respeta todas las instrucciones de los archivos `AGENTS.md` que apliquen al directorio.
2) Usa el listado de casos en `TESTS_PENDIENTES.md` como backlog mínimo.
3) Configura Jest + Supertest con script `"test": "cross-env NODE_ENV=test jest --runInBand"` y `testEnvironment: "node"`.
4) En las pruebas, importa la app sin abrir puerto (ej. `import app from "./src/app.js"` o ruta equivalente) y usa `supertest(app)`.
5) Si el servicio depende de MongoDB u otras integraciones, usa una URI de prueba/mocks y variables desde `.env.test`.
6) Implementa los casos de autorización, validación y rutas indicados por servicio; cubre happy path y rechazos.
7) Actualiza `package.json` solo en el servicio correspondiente y documenta comandos de prueba en los AGENTS si hiciste cambios relevantes.
8) Ejecuta `npm test` en cada servicio modificado y reporta resultados.
Entrega el código de pruebas organizado por servicio (carpeta `__tests__` o similar) y explica brevemente qué cubre cada suite.
```
