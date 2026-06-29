import OrdenTrabajo from "../models/OrdenTrabajo.js";
import {
  DEFAULT_IMPORT_SHEETS,
  PUNTEO_IMPORT_SHEETS,
  parseOrdenesFromWorkbookBuffer,
} from "../utils/excelOrdenesImport.utils.js";

const bulkUpsertOrdenes = async (ordenes) => {
  const operations = ordenes.map((orden) => ({
    updateOne: {
      filter: {
        odt: orden.odt,
      },
      update: {
        $set: orden,
      },
      upsert: true,
    },
  }));

  return OrdenTrabajo.bulkWrite(operations, {
    ordered: false,
  });
};

const buildResponse = ({
  req,
  res,
  ordenes,
  resumenHojas,
  hojasBuscadas,
  hojasEncontradas,
  result,
  message,
}) => {
  return res.status(201).json({
    message,
    archivo: req.file.originalname,
    hojasBuscadas,
    hojasEncontradas,
    resumenHojas,
    resultado: {
      procesadas: ordenes.length,
      creadas: result.upsertedCount || 0,
      encontradasExistentes: result.matchedCount || 0,
      actualizadas: result.modifiedCount || 0,
    },
  });
};

const importExcelBySheets = async ({
  req,
  res,
  next,
  targetSheets,
  importSource,
  message,
  estado,
}) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Tenés que enviar un archivo Excel en el campo file",
      });
    }

    let { ordenes, resumenHojas, hojasBuscadas, hojasEncontradas } =
      parseOrdenesFromWorkbookBuffer(
        req.file.buffer,
        targetSheets,
        importSource,
      );

    if (!hojasEncontradas.length) {
      return res.status(400).json({
        message: "No se encontraron las hojas requeridas en el Excel",
        hojasBuscadas,
      });
    }

    if (!ordenes.length) {
      return res.status(400).json({
        message: "No se encontraron órdenes importables en las hojas indicadas",
        resumenHojas,
      });
    }

    // ✅ Asignar estado según el tipo de importación
    ordenes = ordenes.map((orden) => ({
      ...orden,
      estado,
    }));

    const result = await bulkUpsertOrdenes(ordenes);

    return buildResponse({
      req,
      res,
      ordenes,
      resumenHojas,
      hojasBuscadas,
      hojasEncontradas,
      result,
      message,
    });
  } catch (error) {
    next(error);
  }
};

export const importOrdenesExcel = async (req, res, next) => {
  return importExcelBySheets({
    req,
    res,
    next,
    targetSheets: DEFAULT_IMPORT_SHEETS,
    importSource: "carga general",
    message: "Importación de Excel finalizada",
    estado: "PENDIENTE",
  });
};

export const importPunteoExcel = async (req, res, next) => {
  return importExcelBySheets({
    req,
    res,
    next,
    targetSheets: PUNTEO_IMPORT_SHEETS,
    importSource: "carga punteo",
    message: "Importación de punteo finalizada",
    estado: "PUNTEO",
  });
};
