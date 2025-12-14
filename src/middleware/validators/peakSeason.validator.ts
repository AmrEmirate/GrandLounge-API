import { body } from "express-validator";

export const PeakSeasonValidator = {
  create: [
    body("name").trim().notEmpty().withMessage("Nama peak season wajib diisi"),
    body("startDate")
      .notEmpty()
      .withMessage("Tanggal mulai wajib diisi")
      .isISO8601()
      .withMessage("Format tanggal mulai tidak valid"),
    body("endDate")
      .notEmpty()
      .withMessage("Tanggal selesai wajib diisi")
      .isISO8601()
      .withMessage("Format tanggal selesai tidak valid")
      .custom((value, { req }) => {
        if (new Date(value) <= new Date(req.body.startDate)) {
          throw new Error("Tanggal selesai harus setelah tanggal mulai");
        }
        return true;
      }),
    body("priceMultiplier")
      .notEmpty()
      .withMessage("Price multiplier wajib diisi")
      .isFloat({ min: 0.1 })
      .withMessage("Price multiplier harus lebih dari 0"),
  ],
  update: [
    body("name")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Nama peak season tidak boleh kosong"),
    body("startDate")
      .optional()
      .isISO8601()
      .withMessage("Format tanggal mulai tidak valid"),
    body("endDate")
      .optional()
      .isISO8601()
      .withMessage("Format tanggal selesai tidak valid"),
    body("priceMultiplier")
      .optional()
      .isFloat({ min: 0.1 })
      .withMessage("Price multiplier harus lebih dari 0"),
  ],
};
