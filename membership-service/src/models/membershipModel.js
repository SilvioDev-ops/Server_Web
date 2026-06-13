import mongoose from "mongoose";

const membershipSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
<<<<<<< HEAD
      ref: "UserProfile", 
      required: true,
      index: true, 
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MembershipPlan", 
=======
      ref: "User",
      required: true,
      index: true,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MembershipPlan",
>>>>>>> cc7160a3ee5a811f12a3053acc295e6257a26319
      required: false,
    },
    membershipType: {
      type: String,
<<<<<<< HEAD
      enum: ["Basic", "Premium", "VIP", "Enterprise"], 
=======
      enum: ["Basic", "Premium", "VIP", "Enterprise"],
>>>>>>> cc7160a3ee5a811f12a3053acc295e6257a26319
      required: true,
    },
    price: {
      type: Number,
      required: true,
<<<<<<< HEAD
      min: 0, 
=======
      min: 0,
>>>>>>> cc7160a3ee5a811f12a3053acc295e6257a26319
    },
    currency: {
      type: String,
      required: true,
<<<<<<< HEAD
      default: "USD", 
=======
      default: "USD",
>>>>>>> cc7160a3ee5a811f12a3053acc295e6257a26319
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
    startDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    nextRenewalDate: {
      type: Date,
<<<<<<< HEAD
      required: false, 
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Cancelled", "Expired", "Trial"], 
      default: "Active",
      index: true, 
    },
    paymentTransactionId: {
      type: mongoose.Schema.Types.ObjectId, 
      ref: "PaymentTransaction", 
      required: false, 
=======
      required: false,
    },
    status: {
      type: String,
      enum: [
        "Active",
        "Inactive",
        "Cancelled",
        "Expired",
        "Trial",
        "Suspended",
      ],
      default: "Active",
      index: true,
    },
    paymentTransactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PaymentTransaction",
      required: false,
>>>>>>> cc7160a3ee5a811f12a3053acc295e6257a26319
    },
    cancellationDate: {
      type: Date,
      required: false,
    },
    cancellationReason: {
      type: String,
      required: false,
    },
<<<<<<< HEAD
=======
    suspensionDate: {
      type: Date,
      required: false,
    },
    suspensionReason: {
      type: String,
      required: false,
    },
>>>>>>> cc7160a3ee5a811f12a3053acc295e6257a26319
    isAutoRenew: {
      type: Boolean,
      default: false,
    },
<<<<<<< HEAD
    // Para membresías de prueba (trial)
=======
>>>>>>> cc7160a3ee5a811f12a3053acc295e6257a26319
    isTrial: {
      type: Boolean,
      default: false,
    },
  },
  {
<<<<<<< HEAD
    timestamps: true, 
    toJSON: { virtuals: true }, 
    toObject: { virtuals: true }, 
  }
);


// Determina si la membresía está activa actualmente
membershipSchema.virtual("isActive").get(function () {
  const now = new Date();
  return this.status === "Active" && this.startDate <= now && this.endDate >= now;
});

// Determina si la membresía ha expirado
membershipSchema.virtual("isExpired").get(function () {
  const now = new Date();
  return this.endDate < now && this.status !== "Cancelled"; 
});



const Membership = mongoose.model("Membership", membershipSchema);

export default Membership;
=======
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

membershipSchema.virtual("isActive").get(function () {
  const now = new Date();
  return (
    this.status === "Active" && this.startDate <= now && this.endDate >= now
  );
});

membershipSchema.virtual("isExpired").get(function () {
  const now = new Date();
  return this.endDate < now && this.status !== "Cancelled";
});

membershipSchema.virtual("isSuspended").get(function () {
  return this.status === "Suspended";
});

const Membership = mongoose.model("Membership", membershipSchema);

export default Membership;
>>>>>>> cc7160a3ee5a811f12a3053acc295e6257a26319
