import mongoose from 'mongoose';

const membershipPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true 
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  durationValue: {
    type: Number,
    required: true,
    min: 1
  },
  durationUnit: {
    type: String,
    enum: ['days', 'months', 'years'],
    required: true
  },
  features: { // Características o beneficios de este plan
    type: [String], // Array de strings, ej: ["Acceso HD", "Soporte 24/7"]
    default: []
  },
  isAvailable: { // Si el plan está activo y se puede comprar
    type: Boolean,
    default: true
  }
}, {
  timestamps: true // createdAt, updatedAt
});

const MembershipPlan = mongoose.model('MembershipPlan', membershipPlanSchema);
export default MembershipPlan;