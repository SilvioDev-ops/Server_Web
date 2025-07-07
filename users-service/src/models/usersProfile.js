// users-service/src/models/UserProfile.js
import mongoose from "mongoose";

const userProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User", // Referencia al modelo User en auth-service
      unique: true, // Asegura que solo haya un perfil por usuario
    },
    email: {
      // Puedes incluirlo aquí para conveniencia, o confiar en el ref
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      // Asumo que este campo existe según discusiones anteriores
      type: String,
      trim: true,
      required: false,
    },
    address: {
      // Asumo que este campo existe según discusiones anteriores
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      zipCode: { type: String, trim: true },
    },
    avatar: {
      // Asumo que este campo existe según discusiones anteriores
      type: String,
      trim: true,
    },
    // --- NUEVO CAMPO PARA ELIMINACIÓN LÓGICA (SOFT DELETE) ---
    isDeleted: {
      type: Boolean,
      default: false, // Por defecto, el perfil no está eliminado
      index: true, // Añadir índice para búsquedas rápidas
    },
    // --- FIN NUEVO CAMPO ---
  },
  {
    timestamps: true, // Añade createdAt y updatedAt automáticamente
  }
);

const UserProfile = mongoose.model("UserProfile", userProfileSchema);
export default UserProfile;
