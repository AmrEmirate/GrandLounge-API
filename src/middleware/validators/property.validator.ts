import { body } from "express-validator";

export const PropertyValidator = {
  create: [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Nama properti wajib diisi")
      .isLength({ min: 2, max: 200 })
      .withMessage("Nama properti harus 2-200 karakter"),
    body("address").trim().notEmpty().withMessage("Alamat wajib diisi"),
    body("categoryId")
      .notEmpty()
      .withMessage("Kategori wajib dipilih")
      .isInt({ min: 1 })
      .withMessage("ID kategori tidak valid"),
    body("cityId")
      .notEmpty()
      .withMessage("Kota wajib dipilih")
      .isInt({ min: 1 })
      .withMessage("ID kota tidak valid"),
    body("description")
      .optional()
      .trim()
      .isLength({ max: 2000 })
      .withMessage("Deskripsi maksimal 2000 karakter"),
    body("latitude")
      .optional()
      .isFloat({ min: -90, max: 90 })
      .withMessage("Latitude harus antara -90 dan 90"),
    body("longitude")
      .optional()
      .isFloat({ min: -180, max: 180 })
      .withMessage("Longitude harus antara -180 dan 180"),
  ],
  update: [
    body("name")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Nama properti tidak boleh kosong")
      .isLength({ min: 2, max: 200 })
      .withMessage("Nama properti harus 2-200 karakter"),
    body("address")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Alamat tidak boleh kosong"),
    body("categoryId")
      .optional()
      .isInt({ min: 1 })
      .withMessage("ID kategori tidak valid"),
    body("cityId")
      .optional()
      .isInt({ min: 1 })
      .withMessage("ID kota tidak valid"),
    body("description")
      .optional()
      .trim()
      .isLength({ max: 2000 })
      .withMessage("Deskripsi maksimal 2000 karakter"),
    body("latitude")
      .optional()
      .isFloat({ min: -90, max: 90 })
      .withMessage("Latitude harus antara -90 dan 90"),
    body("longitude")
      .optional()
      .isFloat({ min: -180, max: 180 })
      .withMessage("Longitude harus antara -180 dan 180"),
  ],
};
