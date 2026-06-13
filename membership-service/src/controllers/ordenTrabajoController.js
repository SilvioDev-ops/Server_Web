import mongoose from "mongoose";
import OrdenTrabajo from "../models/OrdenTrabajo.js";
import { DEFAULT_LIMIT, MAX_LIMIT } from "../utils/ordenTrabajo.constants.js";

const asyncHandler = (controller) => async (req, res, next) => {
  try {
    await controller(req, res, next);
  } catch (error) {
    next(error);
  }
};

const getUserIdFromRequest = (req) => {
  return req.user?._id || req.user?.id || req.userId || null;
};

const buildTextSearchFilter = (search) => {
  if (!search) return {};

  const regex = new RegExp(search.trim(), "i");

  return {
    $or: [
      { odt: regex },
      { calle: regex },
      { nro: regex },
      { empresa: regex },
      { localidad: regex },
      { permiso: regex },
      { equipo: regex },
      { cuadrilla: regex },
    ],
  };
};

const getDateRangeForDay = (date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return { $gte: start, $lt: end };
};

const buildOrdenesFilter = (query) => {
  const {
    estado,
    cuadrilla,
    empresa,
    localidad,
    odt,
    prioridad,
    search,
    fecha,
    desde,
    hasta,
  } = query;

  const filter = {
    ...buildTextSearchFilter(search),
  };

  if (estado) filter.estado = estado;
  if (cuadrilla) filter.cuadrilla = new RegExp(cuadrilla.trim(), "i");
  if (empresa) filter.empresa = new RegExp(empresa.trim(), "i");
  if (localidad) filter.localidad = new RegExp(localidad.trim(), "i");
  if (odt) filter.odt = new RegExp(odt.trim(), "i");

  if (prioridad === "true") filter.prioridad = true;
  if (prioridad === "false") filter.prioridad = false;

  if (fecha) {
    filter.fechaHojaRuta = getDateRangeForDay(fecha);
  } else if (desde || hasta) {
    filter.fechaHojaRuta = {};

    if (desde) {
      const desdeDate = new Date(desde);
      desdeDate.setHours(0, 0, 0, 0);
      filter.fechaHojaRuta.$gte = desdeDate;
    }

    if (hasta) {
      const hastaDate = new Date(hasta);
      hastaDate.setHours(23, 59, 59, 999);
      filter.fechaHojaRuta.$lte = hastaDate;
    }
  }

  return filter;
};

export const getOrdenesTrabajo = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Math.min(Number(req.query.limit) || DEFAULT_LIMIT, MAX_LIMIT);
  const skip = (page - 1) * limit;
  const sortBy = req.query.sortBy || "createdAt";
  const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

  const filter = buildOrdenesFilter(req.query);

  const [ordenes, total] = await Promise.all([
    OrdenTrabajo.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean({ virtuals: true }),
    OrdenTrabajo.countDocuments(filter),
  ]);

  res.status(200).json({
    data: ordenes,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
});

export const getOrdenTrabajoById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "ID de orden inválido" });
  }

  const orden = await OrdenTrabajo.findById(id);

  if (!orden) {
    return res.status(404).json({ message: "Orden de trabajo no encontrada" });
  }

  res.status(200).json(orden);
});

export const createOrdenTrabajo = asyncHandler(async (req, res) => {
  const userId = getUserIdFromRequest(req);

  const orden = await OrdenTrabajo.create({
    ...req.body,
    createdBy: userId,
    updatedBy: userId,
  });

  res.status(201).json({
    message: "Orden de trabajo creada correctamente",
    data: orden,
  });
});

export const updateOrdenTrabajo = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = getUserIdFromRequest(req);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "ID de orden inválido" });
  }

  const ordenActualizada = await OrdenTrabajo.findByIdAndUpdate(
    id,
    {
      ...req.body,
      updatedBy: userId,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!ordenActualizada) {
    return res.status(404).json({ message: "Orden de trabajo no encontrada" });
  }

  res.status(200).json({
    message: "Orden de trabajo actualizada correctamente",
    data: ordenActualizada,
  });
});

export const deleteOrdenTrabajo = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "ID de orden inválido" });
  }

  const ordenEliminada = await OrdenTrabajo.findByIdAndDelete(id);

  if (!ordenEliminada) {
    return res.status(404).json({ message: "Orden de trabajo no encontrada" });
  }

  res.status(200).json({
    message: "Orden de trabajo eliminada correctamente",
    data: ordenEliminada,
  });
});

export const changeEstadoOrdenTrabajo = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { estado, trabajoRealizado, observaciones } = req.body;
  const userId = getUserIdFromRequest(req);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "ID de orden inválido" });
  }

  const updateData = {
    estado,
    updatedBy: userId,
  };

  if (trabajoRealizado !== undefined) updateData.trabajoRealizado = trabajoRealizado;
  if (observaciones !== undefined) updateData.observaciones = observaciones;

  const ordenActualizada = await OrdenTrabajo.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!ordenActualizada) {
    return res.status(404).json({ message: "Orden de trabajo no encontrada" });
  }

  res.status(200).json({
    message: "Estado actualizado correctamente",
    data: ordenActualizada,
  });
});

export const getHojaRuta = asyncHandler(async (req, res) => {
  const { fecha, cuadrilla } = req.query;

  const filter = {};

  if (fecha) {
    filter.fechaHojaRuta = getDateRangeForDay(fecha);
  }

  if (cuadrilla) {
    filter.cuadrilla = new RegExp(cuadrilla.trim(), "i");
  }

  const ordenes = await OrdenTrabajo.find(filter)
    .sort({ prioridad: -1, localidad: 1, calle: 1, nro: 1 })
    .lean({ virtuals: true });

  res.status(200).json({
    data: ordenes,
    total: ordenes.length,
  });
});

export const getOrdenesDashboard = asyncHandler(async (_req, res) => {
  const [porEstado, porCuadrilla, total, prioridad] = await Promise.all([
    OrdenTrabajo.aggregate([
      { $group: { _id: "$estado", total: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    OrdenTrabajo.aggregate([
      {
        $group: {
          _id: { $ifNull: ["$cuadrilla", "SIN_CUADRILLA"] },
          total: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]),
    OrdenTrabajo.countDocuments(),
    OrdenTrabajo.countDocuments({ prioridad: true }),
  ]);

  res.status(200).json({
    total,
    prioridad,
    porEstado: porEstado.map((item) => ({ estado: item._id, total: item.total })),
    porCuadrilla: porCuadrilla.map((item) => ({ cuadrilla: item._id || "SIN_CUADRILLA", total: item.total })),
  });
});
