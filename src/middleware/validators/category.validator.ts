import { body } from "express-validator";

export const CategoryValidator = {
  create: [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Nama kategori wajib diisi")
      .isLength({ min: 2, max: 100 })
      .withMessage("Nama kategori harus 2-100 karakter"),
    body("description")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Deskripsi maksimal 500 karakter"),
  ],
  update: [
    body("name")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Nama kategori tidak boleh kosong")
      .isLength({ min: 2, max: 100 })
      .withMessage("Nama kategori harus 2-100 karakter"),
    body("description")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Deskripsi maksimal 500 karakter"),
  ],
};
