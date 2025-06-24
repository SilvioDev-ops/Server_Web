import mongoose from "mongoose";

const membershipSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserProfile", // Asume que tienes un modelo UserProfile
      required: true,
      index: true,
    },
    // NUEVO CAMPO: Referencia al plan de membresía que el usuario compró
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MembershipPlan", // Referencia al nuevo modelo
      required: true, // Ahora es requerido porque cada membresía activa viene de un plan
    },
    // membershipType, price, durationValue, durationUnit, currency
    // Estos campos podrían ser redundantes si siempre se copian del plan,
    // pero pueden ser útiles si quieres que la membresía del usuario pueda tener
    // variaciones o si un plan cambia y no quieres que afecte membresías existentes.
    // Los dejaremos para tu flexibilidad, pero se poblarían desde 'planId'.
    membershipType: { // Ej: "Basic", "Premium", "VIP"
      type: String,
      // No required aquí si siempre se copia de planId, pero puede ser útil como backup
    },
    price: { // Precio pagado por el usuario (puede ser diferente al precio del plan si hay descuentos)
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "USD",
    },
    durationValue: {
      type: Number,
      required: true,
      min: 1,
    },
    durationUnit: {
      type: String,
      enum: ["days", "months", "years"],
      required: true,
      default: "months",
    },
    // --- Campos de estado y fechas de la suscripción específica del usuario ---
    startDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    nextRenewalDate: { // Para auto-renovación
      type: Date,
      required: false,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Cancelled", "Expired", "Trial", "Pending"],
      default: "Active",
      index: true,
    },
    paymentTransactionId: {
      type: String, // O ObjectId si tienes un modelo PaymentTransaction
      ref: "PaymentTransaction", // Si es ObjectId
      required: false,
    },
    cancellationDate: {
      type: Date,
      required: false,
    },
    cancellationReason: {
      type: String,
      required: false,
    },
    isAutoRenew: {
      type: Boolean,
      default: false,
    },
    isTrial: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtuals y Pre-hooks (mantener los que ya tenías)
membershipSchema.virtual("isActive").get(function () {
  const now = new Date();
  return this.status === "Active" && this.startDate <= now && this.endDate >= now;
});

membershipSchema.virtual("isExpired").get(function () {
  const now = new Date();
  return this.endDate < now && this.status !== "Cancelled";
});

const Membership = mongoose.model("Membership", membershipSchema);
export default Membership;