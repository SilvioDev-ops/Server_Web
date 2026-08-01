import mongoose from "mongoose";

const integranteSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },

    legajo: {
      type: String,
      trim: true,
    },

    telefono: {
      type: String,
      trim: true,
    },
  },
  {
    _id: false,
  },
);

const cuadrillaSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    responsable: {
      type: String,
      required: true,
      trim: true,
    },

    telefono: {
      type: String,
      trim: true,
    },

    patente: {
      type: String,
      trim: true,
      uppercase: true,
    },

    activa: {
      type: Boolean,
      default: true,
    },
    color: {
      type: String,
      default: "#2563eb",
    },

    integrantes: [integranteSchema],
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export default mongoose.model("Cuadrilla", cuadrillaSchema);
