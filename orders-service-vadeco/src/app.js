import express from "express";
import cors from "cors";
import morgan from "morgan";

import ordenTrabajoRoutes from "./routes/ordenTrabajo.routes.js";
import notFound from "./middlewares/notFound.js";
import errorHandler from "./middlewares/errorHandler.js";

const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.use("/api/ordenes", ordenTrabajoRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
