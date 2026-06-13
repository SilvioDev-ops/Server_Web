import express from "express";
import cors from "cors";
import morgan from "morgan";

import ordenTrabajoRoutes from "./routes/ordenTrabajo.routes.js";
import notFound from "./middlewares/notFound.js";
import errorHandler from "./middlewares/errorHandler.js";

const app = express();

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:3000",
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.json({
    service: "orders-service",
    status: "ok",
    message: "Servicio de órdenes de trabajo funcionando",
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "orders-service",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/ordenes", ordenTrabajoRoutes);
app.use("/ordenes", ordenTrabajoRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
