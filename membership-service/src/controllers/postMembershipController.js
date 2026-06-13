import { getMembershipModel } from "../getModel.js"; // Asegúrate de que esta función obtenga el modelo correcto

export const postMembershipController = async (req, res) => {
  const {
    userId, // Debería venir del usuario autenticado (req.user.id)
    planId, // Opcional, si tienes un modelo de planes de membresía
    membershipType,
    price,
    currency,
    durationValue,
    durationUnit,
    startDate, // Opcional, si se calcula automáticamente
    endDate, // Opcional, si se calcula automáticamente
    status, // Opcional, si tiene un valor por defecto
    paymentTransactionId, // Opcional, si se enlaza con el servicio de pagos
    isAutoRenew,
    isTrial,
  } = req.body;

  // Asumiendo que userId viene del usuario autenticado (ej. req.user._id)
  // Si no tienes un middleware de autenticación que adjunte req.user, deberás ajustarlo.
  const authenticatedUserId = req.user ? req.user._id : userId; // Usa req.user._id si está disponible, o userId del body si es una prueba

  // Validaciones básicas de campos requeridos según el esquema mejorado
  if (!authenticatedUserId || !membershipType || price === undefined || !durationValue || !durationUnit) {
    return res.status(400).json({ message: "Missing required fields for membership creation." });
  }
  if (price < 0) {
    return res.status(400).json({ message: "Price cannot be negative." });
  }
  if (durationValue < 1) {
    return res.status(400).json({ message: "Duration value must be at least 1." });
  }

  // Calcular startDate y endDate si no se proporcionan
  const actualStartDate = startDate ? new Date(startDate) : new Date();
  let actualEndDate;

  if (endDate) {
    actualEndDate = new Date(endDate);
  } else {
    // Calcular endDate basado en durationValue y durationUnit
    actualEndDate = new Date(actualStartDate);
    switch (durationUnit) {
      case "days":
        actualEndDate.setDate(actualEndDate.getDate() + durationValue);
        break;
      case "months":
        actualEndDate.setMonth(actualEndDate.getMonth() + durationValue);
        break;
      case "years":
        actualEndDate.setFullYear(actualEndDate.getFullYear() + durationValue);
        break;
      default:
        return res.status(400).json({ message: "Invalid duration unit." });
    }
  }

  const Membership = getMembershipModel("Membership");
  const newMembershipData = {
    userId: authenticatedUserId,
    planId, // Puede ser null si no usas planes separados
    membershipType,
    price,
    currency: currency || "USD", // Usar el valor del body o el predeterminado del esquema
    durationValue,
    durationUnit,
    startDate: actualStartDate,
    endDate: actualEndDate,
    status: status || "Active", // Usar el valor del body o el predeterminado del esquema
    paymentTransactionId,
    isAutoRenew: isAutoRenew || false,
    isTrial: isTrial || false,
    // cancellationDate y cancellationReason no se establecen en la creación
  };

  const newMembership = new Membership(newMembershipData);

  try {
    const savedMembership = await newMembership.save();
    res.status(201).json(savedMembership);
  } catch (error) {
    console.error("Error creating membership:", error);
    // Manejo de errores más específico para Mongoose (ej. validación)
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message, errors: error.errors });
    }
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
