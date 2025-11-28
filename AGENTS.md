# Instrucciones para colaboradores y agentes de IA
Este repositorio contiene varios microservicios Node.js/Express escritos con módulos ES. Cada servicio vive en su propia carpeta con su propio `package.json` y punto de entrada (por ejemplo `index.js` o `server.js`) y suele montar un `app` desde `src/app.js`. Las dependencias y scripts se gestionan de manera independiente por servicio.

## Guía general de trabajo
- Mantén cada cambio dentro del servicio correspondiente; no mezcles lógica de dominios.
- Revisa los routers bajo `src/routes` para entender los prefijos de cada API antes de modificar controladores.
- Los middlewares comunes están en `src/middlewares` y utilidades en `src/utils`; reutilízalos en lugar de duplicar lógica.
- Sigue el formato ES module (imports `import ... from`), y evita introducir `require` en estos servicios.
- Cuando añadas nuevas rutas, crea validadores en `src/validators` si la estructura del servicio ya los usa.
- Documenta comandos de prueba o ejecución que uses en tus cambios.
- Los mensajes de commit deben estar en imperativo y mencionar qué hace el cambio; incluye las pruebas ejecutadas en el resumen final.

## Comandos rápidos
Cada servicio se ejecuta de forma aislada desde su carpeta:
- Desarrollo: `npm run dev` (usa `nodemon` + variables de entorno del propio servicio).
- Producción local: `npm start`.
- Pruebas: `npm test` actualmente muestra `"Error: no test specified"` porque ningún servicio tiene suites definidas aún.

## Instrucciones para agentes (crear y ejecutar pruebas)
- Usa Jest + Supertest para las pruebas de API HTTP; instala en cada servicio con `npm i -D jest supertest cross-env` y añade `"type": "module"` si vas a usar `import` en los tests.
- Crea un script `"test": "cross-env NODE_ENV=test jest --runInBand"` en el `package.json` de cada servicio y configura Jest con `"testEnvironment": "node"`.
- Prepara datos de entorno de prueba en `.env.test` (p. ej. `MONGODB_URI` fake) y carga con `cross-env` o `dotenv/config` en los tests.
- Monta la app sin abrir el puerto en los tests (importa `app` desde `src/app.js` y usa `supertest(app)`); si el servicio conecta a Mongo, usa una URI de base de datos efímera o mocks de modelos.
- Añade pruebas mínimas de smoke para cada router principal (ver secciones de rutas en los AGENTS específicos) y extiende con escenarios de autorización/validación.
