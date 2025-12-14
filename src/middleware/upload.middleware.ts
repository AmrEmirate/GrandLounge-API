import multer from "multer";
import { Request } from "express";

const imageFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Jenis file tidak valid. Hanya .jpg, .jpeg, .png, dan .gif yang diperbolehkan."
      )
    );
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1 * 1024 * 1024,
  },
  fileFilter: imageFilter,
});

const uploadPaymentMemory = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1 * 1024 * 1024 },
  fileFilter: (req: Request, file: Express.Multer.File, callback) => {
    const allowedMimes = ["image/jpeg", "image/png"];
    if (allowedMimes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(new Error("Invalid file type. Only JPG and PNG are allowed."));
    }
  },
});

export default upload;
export const uploadPaymentProof = uploadPaymentMemory.single("paymentProof");
