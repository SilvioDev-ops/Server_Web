export const errorHandler = (error, _req, res, _next) => {
  console.error("ERROR:", error);

  if (error?.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0] || "campo";

    return res.status(409).json({
      message: `Ya existe una orden con ese ${field}`,
      error: error.message,
    });
  }

  if (error?.name === "ValidationError") {
    return res.status(400).json({
      message: "Error de validación",
      errors: Object.values(error.errors).map((err) => err.message),
    });
  }

  if (error?.name === "CastError") {
    return res.status(400).json({
      message: "ID o dato inválido",
      error: error.message,
    });
  }

  return res.status(error.status || 500).json({
    message: error.message || "Error interno del servidor",
  });
};
