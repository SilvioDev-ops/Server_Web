# Orders Service - VaDeCo

Servicio independiente para gestionar órdenes de trabajo.

## Instalación

```bash
npm install
```

Crear `.env` copiando `.env.example`.

```env
PORT=3002
MONGO_URI=mongodb://127.0.0.1:27017/vadeco_orders
CLIENT_URL=http://localhost:5173
```

Levantar en desarrollo:

```bash
npm run dev
```

## Endpoints

```txt
GET    /api/ordenes
GET    /api/ordenes/dashboard
GET    /api/ordenes/hoja-ruta?fecha=2026-05-20&cuadrilla=MARIO
GET    /api/ordenes/:id
POST   /api/ordenes
PUT    /api/ordenes/:id
PATCH  /api/ordenes/:id/estado
DELETE /api/ordenes/:id
```

## Ejemplo POST

```json
{
  "odt": "E2026-I14525",
  "calle": "LAVALLE",
  "nro": "3693",
  "empresa": "METROGAS",
  "ancho": 2,
  "largo": 0.6,
  "cantidad": 12,
  "mts": 4.8,
  "permiso": "1500558814",
  "equipo": "96",
  "tipoCantidad": "64PG",
  "ingreso": "2026-05-19",
  "localidad": "CAP",
  "trabajoRealizado": "",
  "estado": "PENDIENTE",
  "cuadrilla": "JALENGA",
  "fechaHojaRuta": "2026-05-20",
  "prioridad": "MEDIA",
  "observaciones": ""
}
```
