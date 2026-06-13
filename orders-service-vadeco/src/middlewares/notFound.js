const notFound = (req, res, next) => {
  return res.status(404).json({
    message: `Ruta no encontrada: ${req.originalUrl}`,
  });
};

export default notFound;
