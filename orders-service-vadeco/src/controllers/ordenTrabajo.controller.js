import OrdenTrabajo from "../models/OrdenTrabajo.js";

const buildFilters = (query) => {
  const {
    estado,
    cuadrilla,
    localidad,
    empresa,
    fecha,
    desde,
    hasta,
    search,
  } = query;

  const filters = {};

  if (estado) filters.estado = estado;
  if (cuadrilla) filters.cuadrilla = new RegExp(cuadrilla, "i");
  if (localidad) filters.localidad = new RegExp(localidad, "i");
  if (empresa) filters.empresa = new RegExp(empresa, "i");

  if (fecha) {
    const start = new Date(`${fecha}T00:00:00.000Z`);
    const end = new Date(`${fecha}T23:59:59.999Z`);
    filters.fechaHojaRuta = { $gte: start, $lte: end };
  }

  if (desde || hasta) {
    filters.createdAt = {};
    if (desde) filters.createdAt.$gte = new Date(`${desde}T00:00:00.000Z`);
    if (hasta) filters.createdAt.$lte = new Date(`${hasta}T23:59:59.999Z`);
  }

  if (search) {
    const regex = new RegExp(search, "i");
    filters.$or = [
      { odt: regex },
      { calle: regex },
      { nro: regex },
      { direccionCompleta: regex },
      { permiso: regex },
      { equipo: regex },
      { tipoCantidad: regex },
      { trabajoRealizado: regex },
      { observaciones: regex },
    ];
  }

  return filters;
};

export const getOrdenes = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filters = buildFilters(req.query);

    const [ordenes, total] = await Promise.all([
      OrdenTrabajo.find(filters)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      OrdenTrabajo.countDocuments(filters),
    ]);

    return res.json({
      data: ordenes,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getOrdenById = async (req, res, next) => {
  try {
    const orden = await OrdenTrabajo.findById(req.params.id);

    if (!orden) {
      return res.status(404).json({
        message: "Orden de trabajo no encontrada",
      });
    }

    return res.json(orden);
  } catch (error) {
    next(error);
  }
};

export const createOrden = async (req, res, next) => {
  try {
    const ordenExistente = await OrdenTrabajo.findOne({
      odt: req.body.odt?.toUpperCase(),
    });

    if (ordenExistente) {
      return res.status(409).json({
        message: "Ya existe una orden con esa ODT",
      });
    }

    const orden = await OrdenTrabajo.create(req.body);

    return res.status(201).json({
      message: "Orden creada correctamente",
      data: orden,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Ya existe una orden con esa ODT",
      });
    }

    next(error);
  }
};

export const updateOrden = async (req, res, next) => {
  try {
    const orden = await OrdenTrabajo.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!orden) {
      return res.status(404).json({
        message: "Orden de trabajo no encontrada",
      });
    }

    return res.json({
      message: "Orden actualizada correctamente",
      data: orden,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Ya existe una orden con esa ODT",
      });
    }

    next(error);
  }
};

export const updateEstadoOrden = async (req, res, next) => {
  try {
    const orden = await OrdenTrabajo.findByIdAndUpdate(
      req.params.id,
      {
        estado: req.body.estado,
        actualizadoPor: req.body.actualizadoPor,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!orden) {
      return res.status(404).json({
        message: "Orden de trabajo no encontrada",
      });
    }

    return res.json({
      message: "Estado actualizado correctamente",
      data: orden,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteOrden = async (req, res, next) => {
  try {
    const orden = await OrdenTrabajo.findByIdAndDelete(req.params.id);

    if (!orden) {
      return res.status(404).json({
        message: "Orden de trabajo no encontrada",
      });
    }

    return res.json({
      message: "Orden eliminada correctamente",
      data: orden,
    });
  } catch (error) {
    next(error);
  }
};

export const getDashboardOrdenes = async (req, res, next) => {
  try {
    const [
      total,
      pendientes,
      asignadas,
      enProceso,
      realizadas,
      devueltas,
      fugas,
      desestimadas,
    ] = await Promise.all([
      OrdenTrabajo.countDocuments(),
      OrdenTrabajo.countDocuments({ estado: "PENDIENTE" }),
      OrdenTrabajo.countDocuments({ estado: "ASIGNADA" }),
      OrdenTrabajo.countDocuments({ estado: "EN_PROCESO" }),
      OrdenTrabajo.countDocuments({ estado: "REALIZADA" }),
      OrdenTrabajo.countDocuments({ estado: "DEVUELTA" }),
      OrdenTrabajo.countDocuments({ estado: "FUGA" }),
      OrdenTrabajo.countDocuments({ estado: "DESESTIMADA" }),
    ]);

    return res.json({
      total,
      pendientes,
      asignadas,
      enProceso,
      realizadas,
      devueltas,
      fugas,
      desestimadas,
    });
  } catch (error) {
    next(error);
  }
};

export const getHojaRuta = async (req, res, next) => {
  try {
    const { fecha, cuadrilla } = req.query;

    const filters = {};

    if (fecha) {
      const start = new Date(`${fecha}T00:00:00.000Z`);
      const end = new Date(`${fecha}T23:59:59.999Z`);
      filters.fechaHojaRuta = { $gte: start, $lte: end };
    }

    if (cuadrilla) {
      filters.cuadrilla = new RegExp(cuadrilla, "i");
    }

    const ordenes = await OrdenTrabajo.find(filters).sort({
      cuadrilla: 1,
      localidad: 1,
      calle: 1,
    });

    return res.json({
      data: ordenes,
      total: ordenes.length,
      filtros: {
        fecha: fecha || null,
        cuadrilla: cuadrilla || null,
      },
    });
  } catch (error) {
    next(error);
  }
};
