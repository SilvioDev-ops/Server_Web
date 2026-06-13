<<<<<<< HEAD
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
=======
import { getMembershipModel } from "../getModel.js";
import logger from "../utils/logger.js";

export const postMembershipController = async (
  req,
  res,
  ipAddress,
  authenticatedUserId
) => {
  logger.debug("CONTROLLER: Iniciando postMembershipController.", {
    ipAddress,
    authenticatedBy: authenticatedUserId,
  });

  const {
    planId,
    isAutoRenew,
    isTrial,
    paymentTransactionId,
    startDate,
    endDate,
    status,
  } = req.body;

  const userId = req.user ? req.user._id : null;

  try {
    if (!userId) {
      logger.warn("CONTROLLER: User not authenticated.", {
        ipAddress,
        authenticatedBy: authenticatedUserId,
      });
      return res.status(401).json({ message: "User not authenticated." });
    }
    if (!planId) {
      logger.warn("CONTROLLER: Missing planId for membership creation.", {
        ipAddress,
        authenticatedBy: authenticatedUserId,
      });
      return res
        .status(400)
        .json({ message: "Missing planId for membership creation." });
    }

    logger.debug(`CONTROLLER: Buscando plan con ID: ${planId}`, {
      ipAddress,
      authenticatedBy: authenticatedUserId,
    });
    const Membership = getMembershipModel("Membership");
    const MembershipPlan = getMembershipModel("MembershipPlan");

    const selectedPlan = await MembershipPlan.findById(planId);

    if (!selectedPlan) {
      logger.warn("CONTROLLER: Membership plan not found.", {
        planId,
        ipAddress,
        authenticatedBy: authenticatedUserId,
      });
      return res.status(404).json({ message: "Membership plan not found." });
    }
    logger.info("CONTROLLER: Membership plan found.", {
      planId,
      ipAddress,
      authenticatedBy: authenticatedUserId,
    });

    if (!selectedPlan.isActive || selectedPlan.isDeleted) {
      logger.warn(
        "CONTROLLER: Selected membership plan is not available or deleted.",
        {
          planId,
          isActive: selectedPlan.isActive,
          isDeleted: selectedPlan.isDeleted,
          ipAddress,
          authenticatedBy: authenticatedUserId,
        }
      );
      return res.status(400).json({
        message:
          "Selected membership plan is not available or has been deleted.",
      });
    }

    logger.debug(
      `CONTROLLER: Verificando membresía activa para usuario ${userId} y plan ${planId}`,
      { ipAddress, authenticatedBy: authenticatedUserId }
    );
    const existingActiveMembership = await Membership.findOne({
      userId: userId,
      status: "Active",
      planId: planId,
    });

    if (existingActiveMembership) {
      logger.warn(
        "CONTROLLER: User already has an active subscription for this plan.",
        { userId, planId, ipAddress, authenticatedBy: authenticatedUserId }
      );
      return res.status(409).json({
        message: "User already has an active subscription for this plan.",
      });
    }
    logger.info(
      "CONTROLLER: No existing active membership found. Proceeding to create.",
      { userId, planId, ipAddress, authenticatedBy: authenticatedUserId }
    );

    const {
      name: membershipType,
      price,
      currency,
      durationValue,
      durationUnit,
    } = selectedPlan;

    const actualStartDate = startDate ? new Date(startDate) : new Date();
    let actualEndDate;

    if (endDate) {
      actualEndDate = new Date(endDate);
    } else {
      actualEndDate = new Date(actualStartDate);
      switch (durationUnit) {
        case "days":
          actualEndDate.setDate(actualEndDate.getDate() + durationValue);
          break;
        case "months":
          actualEndDate.setMonth(actualEndDate.getMonth() + durationValue);
          break;
        case "years":
          actualEndDate.setFullYear(
            actualEndDate.getFullYear() + durationValue
          );
          break;
        default:
          logger.error("CONTROLLER: Invalid duration unit in selected plan.", {
            planId,
            durationUnit,
            ipAddress,
            authenticatedBy: authenticatedUserId,
          });
          return res
            .status(500)
            .json({ message: "Invalid duration unit in selected plan." });
      }
    }

    const newMembershipData = {
      userId: userId,
      planId: selectedPlan._id,
      membershipType,
      price,
      currency,
      durationValue,
      durationUnit,
      startDate: actualStartDate,
      endDate: actualEndDate,
      status: status || (isTrial ? "Trial" : "Active"),
      paymentTransactionId: paymentTransactionId,
      isAutoRenew: isAutoRenew || false,
      isTrial: isTrial || false,
      nextRenewalDate: isAutoRenew ? actualEndDate : undefined,
    };

    logger.debug("CONTROLLER: Datos de la nueva membresía preparados.", {
      newMembershipData,
      ipAddress,
      authenticatedBy: authenticatedUserId,
    });
    const newMembership = new Membership(newMembershipData);
    const savedMembership = await newMembership.save();
    logger.audit("CONTROLLER: Membresía guardada en la base de datos.", {
      membershipId: savedMembership._id,
      userId: savedMembership.userId,
      planId: savedMembership.planId,
      ipAddress,
      authenticatedBy: authenticatedUserId,
    });
    logger.info("CONTROLLER: Membresía creada exitosamente.", {
      membershipId: savedMembership._id,
      userId: savedMembership.userId,
      ipAddress,
      authenticatedBy: authenticatedUserId,
    });

    res.status(201).json(savedMembership);
  } catch (error) {
    logger.error("CONTROLLER: Error al crear membresía en el controlador:", {
      message: error.message,
      stack: error.stack,
      ipAddress,
      authenticatedBy: authenticatedUserId,
      body: req.body,
    });
    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({ message: error.message, errors: error.errors });
    }
    if (!res.headersSent) {
      res.status(500).json({
        message: "Internal server error in controller",
        error: error.message,
      });
    }
>>>>>>> cc7160a3ee5a811f12a3053acc295e6257a26319
  }
};
