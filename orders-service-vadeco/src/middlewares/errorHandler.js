const errorHandler = (error, req, res, next) => {
  console.error("Error:", error);

  return res.status(error.statusCode || 500).json({
    message: error.message || "Error interno del servidor",
  });
};

export default errorHandler;
