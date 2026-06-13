import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const fileName = file.originalname?.toLowerCase() || "";

  const isExcelFile =
    fileName.endsWith(".xlsx") ||
    fileName.endsWith(".xls");

  if (!isExcelFile) {
    return cb(new Error("El archivo debe ser Excel .xlsx o .xls"), false);
  }

  return cb(null, true);
};

export const uploadExcel = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});
