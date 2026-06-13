import { Router } from "express";

import {
  createOrden,
  deleteOrden,
  getDashboardOrdenes,
  getHojaRuta,
  getOrdenById,
  getOrdenes,
  updateEstadoOrden,
  updateOrden,
} from "../controllers/ordenTrabajo.controller.js";

import {
  importOrdenesExcel,
  importPunteoExcel,
} from "../controllers/importOrdenesExcel.controller.js";

import { uploadExcel } from "../middlewares/uploadExcel.js";
import validateRequest from "../middlewares/validateRequest.js";

import {
  createOrdenValidator,
  listOrdenesValidator,
  updateEstadoValidator,
  updateOrdenValidator,
  validateOrdenId,
} from "../middlewares/ordenTrabajo.validators.js";

const router = Router();

router.get("/", listOrdenesValidator, validateRequest, getOrdenes);
router.get("/dashboard", getDashboardOrdenes);
router.get("/hoja-ruta", getHojaRuta);

router.post("/importar-excel", uploadExcel.single("file"), importOrdenesExcel);
router.post("/importar-punteo", uploadExcel.single("file"), importPunteoExcel);

router.get("/:id", validateOrdenId, validateRequest, getOrdenById);

router.post("/", createOrdenValidator, validateRequest, createOrden);

router.put("/:id", updateOrdenValidator, validateRequest, updateOrden);

router.patch("/:id/estado", updateEstadoValidator, validateRequest, updateEstadoOrden);

router.delete("/:id", validateOrdenId, validateRequest, deleteOrden);

export default router;
