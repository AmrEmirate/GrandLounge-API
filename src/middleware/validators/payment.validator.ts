import { body, param } from "express-validator";

export const PaymentValidator = {
  upload: [body("orderId").notEmpty().withMessage("Order ID wajib diisi")],
  confirm: [
    param("orderId").notEmpty().withMessage("Order ID wajib diisi"),
    body("status")
      .notEmpty()
      .withMessage("Status wajib diisi")
      .isIn(["CONFIRMED", "REJECTED"])
      .withMessage("Status harus CONFIRMED atau REJECTED"),
    body("reason")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Alasan maksimal 500 karakter"),
  ],
};
