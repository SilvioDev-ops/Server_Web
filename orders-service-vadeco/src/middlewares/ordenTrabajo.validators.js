import { body, param, query } from "express-validator";
import mongoose from "mongoose";
import { ESTADOS_ORDEN, PRIORIDADES_ORDEN } from "../utils/ordenTrabajo.constants.js";

const isMongoId = (value) => mongoose.Types.ObjectId.isValid(value);

const optionalNumericField = (fieldName, label) =>
  body(fieldName)
    .optional({ checkFalsy: true })
    .isNumeric()
    .withMessage(`${label} debe ser numérico`);

const parteTrabajoValidators = [
  optionalNumericField("parteTrabajo.nroMetros", "N° metros"),
  optionalNumericField("parteTrabajo.mamposteria", "Mampostería"),
  optionalNumericField("parteTrabajo.pinche", "Pinche"),
  optionalNumericField("parteTrabajo.gliper", "Glíper"),
  optionalNumericField("parteTrabajo.fallidos", "Fallidos"),
  optionalNumericField("parteTrabajo.cajas", "Cajas"),
  optionalNumericField("parteTrabajo.limpieza", "Limpieza"),
  optionalNumericField("parteTrabajo.metros", "Metros"),

  body("parteTrabajo.empresas")
    .optional({ checkFalsy: true })
    .trim(),

  body("parteTrabajo.cuadrilla")
    .optional({ checkFalsy: true })
    .trim(),

  body("parteTrabajo.fecha")
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage("La fecha del parte de trabajo debe ser válida"),

  body("parteTrabajo.integrantes")
    .optional()
    .isArray()
    .withMessage("Integrantes debe ser un array"),

  body("parteTrabajo.integrantes.*")
    .optional({ checkFalsy: true })
    .trim(),

  body("parteTrabajo.patentes")
    .optional()
    .isArray()
    .withMessage("Patentes debe ser un array"),

  body("parteTrabajo.patentes.*")
    .optional({ checkFalsy: true })
    .trim(),
];

export const validateOrdenId = [
  param("id")
    .custom(isMongoId)
    .withMessage("El id de la orden no es válido"),
];

export const createOrdenValidator = [
  body("odt")
    .trim()
    .notEmpty()
    .withMessage("La ODT es obligatoria"),

  body("calle")
    .trim()
    .notEmpty()
    .withMessage("La calle es obligatoria"),

  body("nro")
    .optional({ checkFalsy: true })
    .trim(),

  body("localidad")
    .optional({ checkFalsy: true })
    .trim(),

  body("empresa")
    .optional({ checkFalsy: true })
    .trim(),

  optionalNumericField("ancho", "El ancho"),
  optionalNumericField("largo", "El largo"),
  optionalNumericField("cantidad", "La cantidad"),
  optionalNumericField("mts", "Los MTS"),

  body("ingreso")
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage("La fecha de ingreso debe ser válida"),

  body("fechaHojaRuta")
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage("La fecha de hoja de ruta debe ser válida"),

  body("estado")
    .optional({ checkFalsy: true })
    .isIn(ESTADOS_ORDEN)
    .withMessage(`Estado inválido. Estados permitidos: ${ESTADOS_ORDEN.join(", ")}`),

  body("prioridad")
    .optional({ checkFalsy: true })
    .isIn(PRIORIDADES_ORDEN)
    .withMessage(`Prioridad inválida. Prioridades permitidas: ${PRIORIDADES_ORDEN.join(", ")}`),

  ...parteTrabajoValidators,
];

export const updateOrdenValidator = [
  ...validateOrdenId,

  body("odt")
    .optional({ checkFalsy: true })
    .trim(),

  body("calle")
    .optional({ checkFalsy: true })
    .trim(),

  optionalNumericField("ancho", "El ancho"),
  optionalNumericField("largo", "El largo"),
  optionalNumericField("cantidad", "La cantidad"),
  optionalNumericField("mts", "Los MTS"),

  body("estado")
    .optional({ checkFalsy: true })
    .isIn(ESTADOS_ORDEN)
    .withMessage(`Estado inválido. Estados permitidos: ${ESTADOS_ORDEN.join(", ")}`),

  body("prioridad")
    .optional({ checkFalsy: true })
    .isIn(PRIORIDADES_ORDEN)
    .withMessage(`Prioridad inválida. Prioridades permitidas: ${PRIORIDADES_ORDEN.join(", ")}`),

  ...parteTrabajoValidators,
];

export const updateEstadoValidator = [
  ...validateOrdenId,

  body("estado")
    .notEmpty()
    .withMessage("El estado es obligatorio")
    .isIn(ESTADOS_ORDEN)
    .withMessage(`Estado inválido. Estados permitidos: ${ESTADOS_ORDEN.join(", ")}`),
];

export const listOrdenesValidator = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("page debe ser un número mayor a 0"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("limit debe ser un número entre 1 y 100"),
];
