import { Router } from "express";

import {
  getCuadrillas,
  getCuadrillaById,
  createCuadrilla,
  updateCuadrilla,
  deleteCuadrilla,
  getOrdenesByCuadrilla,
} from "../controllers/cuadrilla.controller.js";

const router = Router();

// Obtener todas las cuadrillas
router.get("/", getCuadrillas);

// Obtener una cuadrilla por ID
router.get("/:id", getCuadrillaById);

// Crear una nueva cuadrilla
router.post("/", createCuadrilla);

// Actualizar una cuadrilla
router.put("/:id", updateCuadrilla);

// Eliminar una cuadrilla
router.delete("/:id", deleteCuadrilla);

// Obtener todas las órdenes de una cuadrilla
router.get("/:id/ordenes", getOrdenesByCuadrilla);

export default router;
