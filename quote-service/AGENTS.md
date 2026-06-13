# Contexto rápido del servicio de cotizaciones

Servicio pensado para manejar cotizaciones/presupuestos, con dependencias de Express, MongoDB y axios, pero actualmente sin código fuente: solo existen `package.json` y archivos vacíos (`.txt`).

## Situación actual
- No hay `src/` ni punto de entrada implementado; los scripts en `package.json` referencian `server.js`, que aún no existe.

## Comandos rápidos
- Desarrollo: `npm run dev` (fallará mientras no exista el punto de entrada `server.js`).
- Producción local: `npm start` (mismo problema que arriba).
- Pruebas: `npm test` solo imprime `"Error: no test specified"`.

## Guías para Claude Code
- Antes de agregar rutas, crea la estructura estándar (`src/app.js`, `src/routes`, `src/controllers`/`handlers`) siguiendo el estilo de los otros servicios.
- Define claramente el dominio (p. ej., creación de cotizaciones, cálculo de precios) y documenta los prefijos de rutas en `src/routes/indexRouter.js` cuando lo añadas.
- Considera añadir `type: "module"` si vas a usar sintaxis ES module como en los demás servicios del proyecto.
- Tests: tras crear la app, añade `src/tests/quotes.test.js` con Jest + Supertest. Cubre creación/listado de cotizaciones simuladas y validaciones de entrada; usa `supertest(app)` y mocks para dependencias externas (p. ej. `axios`).
