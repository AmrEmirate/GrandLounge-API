import { body } from "express-validator";

export const ReservationValidator = {
  create: [
    body("roomId")
      .notEmpty()
      .withMessage("Room ID wajib diisi")
      .isInt({ min: 1 })
      .withMessage("Room ID tidak valid"),
    body("checkIn")
      .notEmpty()
      .withMessage("Tanggal check-in wajib diisi")
      .isISO8601()
      .withMessage("Format tanggal check-in tidak valid")
      .custom((value) => {
        if (new Date(value) < new Date()) {
          throw new Error("Tanggal check-in tidak boleh di masa lalu");
        }
        return true;
      }),
    body("checkOut")
      .notEmpty()
      .withMessage("Tanggal check-out wajib diisi")
      .isISO8601()
      .withMessage("Format tanggal check-out tidak valid")
      .custom((value, { req }) => {
        if (new Date(value) <= new Date(req.body.checkIn)) {
          throw new Error("Tanggal check-out harus setelah check-in");
        }
        return true;
      }),
    body("guests")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Jumlah tamu minimal 1 orang"),
  ],
  update: [
    body("status")
      .optional()
      .isIn(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"])
      .withMessage("Status tidak valid"),
  ],
};
