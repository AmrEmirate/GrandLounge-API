import { body } from "express-validator";

export const ReviewValidator = {
  create: [
    body("rating")
      .notEmpty()
      .withMessage("Rating wajib diisi")
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating harus antara 1-5"),
    body("comment")
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage("Komentar maksimal 1000 karakter"),
    body("orderId").notEmpty().withMessage("Order ID wajib diisi"),
  ],
  update: [
    body("rating")
      .optional()
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating harus antara 1-5"),
    body("comment")
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage("Komentar maksimal 1000 karakter"),
  ],
};
