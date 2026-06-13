import XLSX from "xlsx";

export const DEFAULT_IMPORT_SHEETS = ["PENDIENTE CABA", "ESPECIALES CABA"];
export const PUNTEO_IMPORT_SHEETS = ["PUNTEO"];

const normalizeText = (value) => {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
};

const normalizeHeader = (value) => {
  return normalizeText(value).replace(/[^A-Z0-9]/g, "");
};

const toStringOrUndefined = (value) => {
  if (value === null || value === undefined || value === "") return undefined;

  const text = String(value).trim();

  if (!text) return undefined;

  return text;
};

const toNumberOrUndefined = (value) => {
  if (value === null || value === undefined || value === "") return undefined;

  if (typeof value === "number") {
    return Number.isNaN(value) ? undefined : value;
  }

  const normalizedValue = String(value).trim().replace(",", ".");

  const number = Number(normalizedValue);

  return Number.isNaN(number) ? undefined : number;
};

const toDateOrUndefined = (value) => {
  if (value === null || value === undefined || value === "") return undefined;

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  if (typeof value === "number") {
    const parsedDate = XLSX.SSF.parse_date_code(value);

    if (!parsedDate) return undefined;

    return new Date(Date.UTC(parsedDate.y, parsedDate.m - 1, parsedDate.d));
  }

  const textValue = String(value).trim();

  const ddmmyyyy = textValue.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);

  if (ddmmyyyy) {
    const [, dd, mm, yyyy] = ddmmyyyy;
    const normalizedYear = yyyy.length === 2 ? `20${yyyy}` : yyyy;

    return new Date(Date.UTC(Number(normalizedYear), Number(mm) - 1, Number(dd)));
  }

  const parsed = new Date(textValue);

  if (Number.isNaN(parsed.getTime())) return undefined;

  return parsed;
};

const isEmptyValue = (value) => {
  return value === null || value === undefined || String(value).trim() === "";
};

const isEmptyRow = (row) => {
  return row.every(isEmptyValue);
};

const findColumnIndex = (headers, aliases) => {
  const normalizedHeaders = headers.map(normalizeHeader);
  const normalizedAliases = aliases.map(normalizeHeader);

  return normalizedHeaders.findIndex((header) => normalizedAliases.includes(header));
};

const buildColumnMap = (headers) => {
  return {
    odt: findColumnIndex(headers, ["ODT"]),
    calle: findColumnIndex(headers, ["Calle"]),
    nro: findColumnIndex(headers, ["Nro", "Número", "Numero"]),
    empresa: findColumnIndex(headers, ["EN", "Empresa", "EMPRESA"]),
    ancho: findColumnIndex(headers, ["ANCHO"]),
    largo: findColumnIndex(headers, ["LARGO"]),
    cantidad: findColumnIndex(headers, ["CANTIDAD"]),
    mts: findColumnIndex(headers, ["MTS", "M2", "MTS2", "METROS"]),
    permiso: findColumnIndex(headers, ["PERMISO"]),
    equipo: findColumnIndex(headers, ["EQ", "Equipo"]),
    tipoCantidad: findColumnIndex(headers, ["Tipo y Cantidad", "Tipo Cantidad"]),
    ingreso: findColumnIndex(headers, ["Ingreso"]),
    localidad: findColumnIndex(headers, ["LOC", "Localidad"]),
    trabajoRealizado: findColumnIndex(headers, ["Trabajo Realizado"]),
  };
};

const getCell = (row, columnIndex) => {
  if (columnIndex < 0) return undefined;

  return row[columnIndex];
};

const findHeaderRowIndex = (rows) => {
  return rows.findIndex((row) => {
    const normalizedRow = row.map(normalizeHeader);

    return (
      normalizedRow.includes("ODT") &&
      normalizedRow.some((cell) => cell === "CALLE") &&
      normalizedRow.some((cell) => cell === "NRO" || cell === "NUMERO")
    );
  });
};

const buildDetalleAdicional = (row, columns) => {
  const detalle = {
    calle: toStringOrUndefined(getCell(row, columns.calle)),
    nro: toStringOrUndefined(getCell(row, columns.nro)),
    ancho: toNumberOrUndefined(getCell(row, columns.ancho)),
    largo: toNumberOrUndefined(getCell(row, columns.largo)),
    cantidad: toNumberOrUndefined(getCell(row, columns.cantidad)),
    mts: toNumberOrUndefined(getCell(row, columns.mts)),
    permiso: toStringOrUndefined(getCell(row, columns.permiso)),
    equipo: toStringOrUndefined(getCell(row, columns.equipo)),
    tipoCantidad: toStringOrUndefined(getCell(row, columns.tipoCantidad)),
  };

  const partes = [];

  if (detalle.calle) partes.push(`calle ${detalle.calle}`);
  if (detalle.nro) partes.push(`nro ${detalle.nro}`);
  if (detalle.ancho !== undefined) partes.push(`ancho ${detalle.ancho}`);
  if (detalle.largo !== undefined) partes.push(`largo ${detalle.largo}`);
  if (detalle.cantidad !== undefined) partes.push(`cantidad ${detalle.cantidad}`);
  if (detalle.mts !== undefined) partes.push(`mts ${detalle.mts}`);
  if (detalle.permiso) partes.push(`permiso ${detalle.permiso}`);
  if (detalle.equipo) partes.push(`eq ${detalle.equipo}`);
  if (detalle.tipoCantidad) partes.push(`tipo ${detalle.tipoCantidad}`);

  return partes.length ? partes.join(" | ") : null;
};

const isSectionRow = ({ odt, calle, empresa }) => {
  const normalizedOdt = normalizeText(odt);
  const normalizedCalle = normalizeText(calle);
  const normalizedEmpresa = normalizeText(empresa);

  const possibleTitle = `${normalizedOdt} ${normalizedCalle} ${normalizedEmpresa}`;

  return (
    possibleTitle.includes("METROGAS") ||
    possibleTitle.includes("AYSA") ||
    possibleTitle.includes("PENDIENTE") ||
    possibleTitle.includes("ESPECIALES") ||
    possibleTitle.includes("PUNTEO")
  ) && !calle && !empresa;
};

const buildOrdenFromRow = ({ row, columns, sheetName, rowNumber, importSource }) => {
  const odt = toStringOrUndefined(getCell(row, columns.odt));
  const calle = toStringOrUndefined(getCell(row, columns.calle));
  const nro = toStringOrUndefined(getCell(row, columns.nro));
  const empresa = toStringOrUndefined(getCell(row, columns.empresa));
  const tipoCantidad = toStringOrUndefined(getCell(row, columns.tipoCantidad));
  const trabajoRealizado = toStringOrUndefined(getCell(row, columns.trabajoRealizado));

  if (!odt) return null;

  if (isSectionRow({ odt, calle, empresa })) return null;

  if (!calle && !nro && !empresa) return null;

  const textoPrioridad = normalizeText(`${tipoCantidad || ""} ${trabajoRealizado || ""}`);

  return {
    odt,
    calle: calle || "SIN CALLE",
    nro,
    localidad: toStringOrUndefined(getCell(row, columns.localidad)),
    empresa,
    ancho: toNumberOrUndefined(getCell(row, columns.ancho)),
    largo: toNumberOrUndefined(getCell(row, columns.largo)),
    cantidad: toNumberOrUndefined(getCell(row, columns.cantidad)),
    mts: toNumberOrUndefined(getCell(row, columns.mts)),
    permiso: toStringOrUndefined(getCell(row, columns.permiso)),
    equipo: toStringOrUndefined(getCell(row, columns.equipo)),
    tipoCantidad,
    ingreso: toDateOrUndefined(getCell(row, columns.ingreso)),
    trabajoRealizado,
    estado: "PENDIENTE",
    cuadrilla: "",
    fechaHojaRuta: undefined,
    prioridad: textoPrioridad.includes("PRIORIDAD") ? "ALTA" : "MEDIA",
    observaciones: `Importado desde Excel: ${importSource}, hoja ${sheetName}, fila ${rowNumber}`,
    fotos: [],
    __continuaciones: [],
  };
};

const finalizeOrden = (orden) => {
  const cleanOrden = { ...orden };

  if (cleanOrden.__continuaciones?.length) {
    cleanOrden.observaciones = [
      cleanOrden.observaciones,
      "Filas adicionales del Excel:",
      ...cleanOrden.__continuaciones.map((detalle, index) => `${index + 1}) ${detalle}`),
    ].join("\n");
  }

  delete cleanOrden.__continuaciones;

  Object.keys(cleanOrden).forEach((key) => {
    if (cleanOrden[key] === undefined || cleanOrden[key] === "") {
      delete cleanOrden[key];
    }
  });

  return cleanOrden;
};

const parseSheet = ({ worksheet, sheetName, importSource }) => {
  const rows = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    raw: true,
    defval: null,
    blankrows: false,
  });

  if (!rows.length) {
    return {
      sheetName,
      ordenes: [],
      omitidas: 0,
      combinadas: 0,
      totalFilas: 0,
      headerRow: null,
    };
  }

  const headerRowIndex = findHeaderRowIndex(rows);

  if (headerRowIndex === -1) {
    return {
      sheetName,
      ordenes: [],
      omitidas: rows.length,
      combinadas: 0,
      totalFilas: rows.length,
      headerRow: null,
    };
  }

  const headers = rows[headerRowIndex];
  const columns = buildColumnMap(headers);

  const ordenes = [];
  let lastOrden = null;
  let omitidas = 0;
  let combinadas = 0;

  rows.slice(headerRowIndex + 1).forEach((row, index) => {
    const rowNumber = headerRowIndex + index + 2;

    if (isEmptyRow(row)) {
      omitidas += 1;
      return;
    }

    const odt = toStringOrUndefined(getCell(row, columns.odt));

    if (!odt) {
      const detalleAdicional = buildDetalleAdicional(row, columns);

      if (lastOrden && detalleAdicional) {
        lastOrden.__continuaciones.push(`fila ${rowNumber}: ${detalleAdicional}`);
        combinadas += 1;
      } else {
        omitidas += 1;
      }

      return;
    }

    const orden = buildOrdenFromRow({
      row,
      columns,
      sheetName,
      rowNumber,
      importSource,
    });

    if (!orden) {
      omitidas += 1;
      return;
    }

    ordenes.push(orden);
    lastOrden = orden;
  });

  return {
    sheetName,
    ordenes: ordenes.map(finalizeOrden),
    omitidas,
    combinadas,
    totalFilas: rows.length - headerRowIndex - 1,
    headerRow: headerRowIndex + 1,
  };
};

export const parseOrdenesFromWorkbookBuffer = (
  buffer,
  targetSheets = DEFAULT_IMPORT_SHEETS,
  importSource = "carga general",
) => {
  const workbook = XLSX.read(buffer, {
    type: "buffer",
    cellDates: false,
  });

  const availableSheetNames = workbook.SheetNames;

  const targetSheetNames = targetSheets
    .map((targetSheetName) => {
      const normalizedTarget = normalizeText(targetSheetName);

      return availableSheetNames.find(
        (sheetName) => normalizeText(sheetName) === normalizedTarget,
      );
    })
    .filter(Boolean);

  const resumenHojas = [];
  const ordenes = [];

  targetSheetNames.forEach((sheetName) => {
    const worksheet = workbook.Sheets[sheetName];

    const parsedSheet = parseSheet({
      worksheet,
      sheetName,
      importSource,
    });

    resumenHojas.push({
      hoja: parsedSheet.sheetName,
      headerRow: parsedSheet.headerRow,
      totalFilas: parsedSheet.totalFilas,
      importables: parsedSheet.ordenes.length,
      omitidas: parsedSheet.omitidas,
      combinadas: parsedSheet.combinadas,
    });

    ordenes.push(...parsedSheet.ordenes);
  });

  return {
    ordenes,
    resumenHojas,
    hojasBuscadas: targetSheets,
    hojasEncontradas: targetSheetNames,
  };
};
