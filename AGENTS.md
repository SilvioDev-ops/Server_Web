# Instrucciones para colaboradores y agentes de IA

Este repositorio contiene varios microservicios Node.js/Express escritos con módulos ES. Cada servicio vive en su propia carpeta con su propio `package.json` y punto de entrada (por ejemplo `index.js` o `server.js`) y suele montar un `app` desde `src/app.js`. Las dependencias y scripts se gestionan de manera independiente por servicio.

Al trabajar con Claude Code u otros agentes:
- Mantén cada cambio dentro del servicio correspondiente; no mezcles lógica de dominios.
- Revisa los routers bajo `src/routes` para entender los prefijos de cada API antes de modificar controladores.
- Los middlewares comunes están en `src/middlewares` y utilidades en `src/utils`; reutilízalos en lugar de duplicar lógica.
- Sigue el formato ES module (imports `import ... from`), y evita introducir `require` en estos servicios.
- Cuando añadas nuevas rutas, crea validadores en `src/validators` si la estructura del servicio ya los usa.
- Documenta comandos de prueba o ejecución que uses en tus cambios.

Se esperan mensajes de commits claros en presente imperativo y, si agregas pruebas, inclúyelas en la sección de pruebas del resumen final.
