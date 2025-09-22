"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const upload_middleware_1 = __importDefault(require("../middleware/upload.middleware"));
const user_controller_1 = require("../controllers/user.controller");
const router = (0, express_1.Router)();
// Endpoint untuk memperbarui data teks (JSON) atau gambar (form-data)
router.patch('/profile', (0, auth_middleware_1.authMiddleware)(), upload_middleware_1.default.single('profilePicture'), user_controller_1.UserController.updateProfile);
// Endpoint khusus untuk memperbarui password
router.patch('/password', (0, auth_middleware_1.authMiddleware)(), user_controller_1.UserController.updatePassword);
// Endpoint untuk memulai proses ganti email
router.post('/request-email-change', (0, auth_middleware_1.authMiddleware)(), user_controller_1.UserController.requestEmailChange);
// Endpoint publik untuk mengkonfirmasi perubahan email via token
router.post('/confirm-email-change', user_controller_1.UserController.confirmEmailChange);
exports.default = router;
