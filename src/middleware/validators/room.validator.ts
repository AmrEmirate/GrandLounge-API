import { body } from "express-validator";

export const RoomValidator = {
  create: [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Nama kamar wajib diisi")
      .isLength({ min: 2, max: 100 })
      .withMessage("Nama kamar harus 2-100 karakter"),
    body("price")
      .notEmpty()
      .withMessage("Harga wajib diisi")
      .isFloat({ min: 0 })
      .withMessage("Harga harus berupa angka positif"),
    body("capacity")
      .notEmpty()
      .withMessage("Kapasitas wajib diisi")
      .isInt({ min: 1 })
      .withMessage("Kapasitas minimal 1 orang"),
    body("description")
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage("Deskripsi maksimal 1000 karakter"),
  ],
  update: [
    body("name")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Nama kamar tidak boleh kosong")
      .isLength({ min: 2, max: 100 })
      .withMessage("Nama kamar harus 2-100 karakter"),
    body("price")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Harga harus berupa angka positif"),
    body("capacity")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Kapasitas minimal 1 orang"),
    body("description")
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage("Deskripsi maksimal 1000 karakter"),
  ],
};
