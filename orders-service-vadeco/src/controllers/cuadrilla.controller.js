import Cuadrilla from "../models/cuadrilla.js";
import OrdenTrabajo from "../models/OrdenTrabajo.js";
// ==========================
// Obtener todas las cuadrillas
// ==========================
export const getCuadrillas = async (req, res, next) => {
  try {
    const cuadrillas = await Cuadrilla.find().sort({ nombre: 1 });

    return res.status(200).json({
      message: "Cuadrillas obtenidas correctamente",
      data: cuadrillas,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================
// Obtener una cuadrilla por ID
// ==========================
export const getCuadrillaById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const cuadrilla = await Cuadrilla.findById(id);

    if (!cuadrilla) {
      return res.status(404).json({
        message: "Cuadrilla no encontrada",
      });
    }

    return res.status(200).json(cuadrilla);
  } catch (error) {
    next(error);
  }
};

// ==========================
// Crear una nueva cuadrilla
// ==========================
export const createCuadrilla = async (req, res, next) => {
  try {
    const { nombre, responsable, telefono, patente, integrantes, activa } =
      req.body;

    const existe = await Cuadrilla.findOne({ nombre });

    if (existe) {
      return res.status(409).json({
        message: "Ya existe una cuadrilla con ese nombre",
      });
    }

    const nuevaCuadrilla = await Cuadrilla.create({
      nombre,
      responsable,
      telefono,
      patente,
      integrantes,
      activa,
    });

    return res.status(201).json({
      message: "Cuadrilla creada correctamente",
      data: nuevaCuadrilla,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================
// Actualizar una cuadrilla
// ==========================
export const updateCuadrilla = async (req, res, next) => {
  try {
    const { id } = req.params;

    const cuadrilla = await Cuadrilla.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!cuadrilla) {
      return res.status(404).json({
        message: "Cuadrilla no encontrada",
      });
    }

    return res.status(200).json({
      message: "Cuadrilla actualizada correctamente",
      data: cuadrilla,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================
// Eliminar una cuadrilla
// ==========================
export const deleteCuadrilla = async (req, res, next) => {
  try {
    const { id } = req.params;

    const cuadrilla = await Cuadrilla.findByIdAndDelete(id);

    if (!cuadrilla) {
      return res.status(404).json({
        message: "Cuadrilla no encontrada",
      });
    }

    return res.status(200).json({
      message: "Cuadrilla eliminada correctamente",
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// Obtener todas las órdenes de una cuadrilla
// ==========================================

export const getOrdenesByCuadrilla = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { page = 1, limit = 20, estado, prioridad, buscar } = req.query;

    const cuadrilla = await Cuadrilla.findById(id);

    if (!cuadrilla) {
      return res.status(404).json({
        message: "Cuadrilla no encontrada.",
      });
    }

    const filtro = {
      cuadrilla: id,
    };

    if (estado) {
      filtro.estado = estado;
    }

    if (prioridad) {
      filtro.prioridad = prioridad;
    }

    if (buscar) {
      filtro.$or = [
        {
          odt: {
            $regex: buscar,
            $options: "i",
          },
        },
        {
          direccionCompleta: {
            $regex: buscar,
            $options: "i",
          },
        },
        {
          empresa: {
            $regex: buscar,
            $options: "i",
          },
        },
      ];
    }

    const total = await OrdenTrabajo.countDocuments(filtro);

    const ordenes = await OrdenTrabajo.find(filtro)
      .select("odt direccionCompleta empresa estado prioridad fechaAsignacion")
      .sort({
        prioridad: -1,
        fechaAsignacion: -1,
        createdAt: -1,
      })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Las estadísticas las calculamos sobre TODAS las órdenes de la cuadrilla,
    // no sobre la página actual.
    const todasLasOrdenes = await OrdenTrabajo.find({
      cuadrilla: id,
    }).select("estado");

    const estadisticas = {
      total: todasLasOrdenes.length,
      asignadas: todasLasOrdenes.filter((o) => o.estado === "ASIGNADA").length,
      enProceso: todasLasOrdenes.filter((o) => o.estado === "EN_PROCESO")
        .length,
      realizadas: todasLasOrdenes.filter((o) => o.estado === "REALIZADA")
        .length,
      pendientes: todasLasOrdenes.filter((o) => o.estado === "PENDIENTE")
        .length,
      punteo: todasLasOrdenes.filter((o) => o.estado === "PUNTEO").length,
      devueltas: todasLasOrdenes.filter((o) => o.estado === "DEVUELTA").length,
      fugas: todasLasOrdenes.filter((o) => o.estado === "FUGA").length,
      desestimadas: todasLasOrdenes.filter((o) => o.estado === "DESESTIMADA")
        .length,
    };

    return res.status(200).json({
      cuadrilla,
      estadisticas,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
      filtros: {
        estado: estado || null,
        prioridad: prioridad || null,
        buscar: buscar || null,
      },
      ordenes,
    });
  } catch (error) {
    next(error);
  }
};
