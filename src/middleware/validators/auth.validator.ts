import { body } from "express-validator";

export const AuthValidator = {
  registerUser: [
    body("email").isEmail().withMessage("Email tidak valid").normalizeEmail(),
    body("fullName")
      .trim()
      .notEmpty()
      .withMessage("Nama lengkap wajib diisi")
      .isLength({ min: 2, max: 100 })
      .withMessage("Nama lengkap harus 2-100 karakter"),
  ],
  registerTenant: [
    body("email").isEmail().withMessage("Email tidak valid").normalizeEmail(),
    body("fullName")
      .trim()
      .notEmpty()
      .withMessage("Nama lengkap wajib diisi")
      .isLength({ min: 2, max: 100 })
      .withMessage("Nama lengkap harus 2-100 karakter"),
    body("companyName")
      .trim()
      .notEmpty()
      .withMessage("Nama perusahaan wajib diisi"),
  ],
  login: [
    body("email").isEmail().withMessage("Email tidak valid").normalizeEmail(),
    body("password").notEmpty().withMessage("Password wajib diisi"),
  ],
  verify: [
    body("token").notEmpty().withMessage("Token verifikasi wajib diisi"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password minimal 6 karakter"),
  ],
  requestPasswordReset: [
    body("email").isEmail().withMessage("Email tidak valid").normalizeEmail(),
  ],
  confirmPasswordReset: [
    body("token").notEmpty().withMessage("Token reset wajib diisi"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("Password baru minimal 6 karakter"),
  ],
  resendVerification: [
    body("email").isEmail().withMessage("Email tidak valid").normalizeEmail(),
  ],
};
