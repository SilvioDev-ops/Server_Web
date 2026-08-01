import mongoose from "mongoose";
import {
  ESTADOS_ORDEN,
  PRIORIDADES_ORDEN,
} from "../utils/ordenTrabajo.constants.js";

const parteTrabajoSchema = new mongoose.Schema(
  {
    nroMetros: {
      type: Number,
      default: 0,
    },

    empresas: {
      type: String,
      trim: true,
      default: "",
    },

    mamposteria: {
      type: Number,
      default: 0,
    },

    pinche: {
      type: Number,
      default: 0,
    },

    gliper: {
      type: Number,
      default: 0,
    },

    fallidos: {
      type: Number,
      default: 0,
    },

    cajas: {
      type: Number,
      default: 0,
    },

    limpieza: {
      type: Number,
      default: 0,
    },

    metros: {
      type: Number,
      default: 0,
    },

    fecha: {
      type: Date,
    },

    integrantes: [
      {
        type: String,
        trim: true,
      },
    ],

    patentes: [
      {
        type: String,
        trim: true,
        uppercase: true,
      },
    ],
    observaciones: {
      type: String,
      trim: true,
      default: "",
    },
  },

  {
    _id: false,
  },
);

const ordenTrabajoSchema = new mongoose.Schema(
  {
    // ============================
    // DATOS DE LA ORDEN
    // ============================

    odt: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      unique: true,
      index: true,
    },

    calle: {
      type: String,
      required: true,
      trim: true,
    },

    nro: {
      type: String,
      trim: true,
    },

    localidad: {
      type: String,
      trim: true,
      index: true,
    },

    direccionCompleta: {
      type: String,
      trim: true,
    },

    empresa: {
      type: String,
      trim: true,
      index: true,
    },

    ancho: {
      type: Number,
      default: 0,
    },

    largo: {
      type: Number,
      default: 0,
    },

    cantidad: {
      type: Number,
      default: 0,
    },

    mts: {
      type: Number,
      default: 0,
    },

    permiso: {
      type: String,
      trim: true,
    },

    equipo: {
      type: String,
      trim: true,
    },

    tipoCantidad: {
      type: String,
      trim: true,
    },

    ingreso: {
      type: Date,
    },

    trabajoRealizado: {
      type: String,
      trim: true,
      default: "",
    },

    // ============================
    // ESTADO
    // ============================

    estado: {
      type: String,
      enum: ESTADOS_ORDEN,
      default: "PENDIENTE",
      index: true,
    },
    historialEstados: [
      {
        estado: {
          type: String,
          enum: ESTADOS_ORDEN,
        },

        fecha: {
          type: Date,
          default: Date.now,
        },

        usuario: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          default: null,
        },

        comentario: {
          type: String,
          trim: true,
          default: "",
        },
      },
    ],

    prioridad: {
      type: String,
      enum: PRIORIDADES_ORDEN,
      default: "MEDIA",
    },

    // ============================
    // ASIGNACIÓN
    // ============================

    cuadrilla: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cuadrilla",
      default: null,
      index: true,
    },

    fechaAsignacion: {
      type: Date,
      default: null,
    },

    fechaInicioTrabajo: {
      type: Date,
      default: null,
    },

    fechaFinTrabajo: {
      type: Date,
      default: null,
    },

    asignadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    asignadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // ============================
    // PARTE DE TRABAJO
    // ============================

    parteTrabajo: {
      type: parteTrabajoSchema,
      default: () => ({}),
    },
    historialEstados: [
      {
        estado: {
          type: String,
          required: true,
        },

        fecha: {
          type: Date,
          default: Date.now,
        },

        usuario: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          default: null,
        },

        comentario: {
          type: String,
          trim: true,
          default: "",
        },
      },
    ],

    // ============================
    // OBSERVACIONES
    // ============================

    observaciones: {
      type: String,
      trim: true,
      default: "",
    },

    fotos: [
      {
        url: String,
        publicId: String,
        descripcion: String,
      },
    ],

    // ============================
    // AUDITORÍA
    // ============================

    creadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    actualizadoPor: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// ============================
// MIDDLEWARES
// ============================

ordenTrabajoSchema.pre("save", function (next) {
  const partes = [this.calle, this.nro, this.localidad].filter(Boolean);
  this.direccionCompleta = partes.join(" ");
  next();
});

ordenTrabajoSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  const data = update.$set || update;

  if (data.calle || data.nro || data.localidad) {
    const partes = [data.calle, data.nro, data.localidad].filter(Boolean);

    data.direccionCompleta = partes.join(" ");
  }

  next();
});

// ============================
// ÍNDICES
// ============================

ordenTrabajoSchema.index({
  estado: 1,
  cuadrilla: 1,
  fechaAsignacion: 1,
});

const OrdenTrabajo = mongoose.model("OrdenTrabajo", ordenTrabajoSchema);

export default OrdenTrabajo;
