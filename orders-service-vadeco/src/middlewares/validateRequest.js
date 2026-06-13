import { validationResult } from "express-validator";

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  return res.status(400).json({
    message: "Error de validación",
    errors: errors.array().map((error) => ({
      field: error.path,
      message: error.msg,
      value: error.value,
    })),
  });
};

export default validateRequest;
