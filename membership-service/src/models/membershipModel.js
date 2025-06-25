import mongoose from "mongoose";

const membershipSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserProfile",
      required: true,
      index: true,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MembershipPlan",
      required: true,
    },

    membershipType: {
      type: String,
    },
    price: {
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
      required: false,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Cancelled", "Expired", "Trial", "Pending"],
      default: "Active",
      index: true,
    },
    paymentTransactionId: {
      type: String,
      ref: "PaymentTransaction",
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

const Membership = mongoose.model("Membership", membershipSchema);
export default Membership;
