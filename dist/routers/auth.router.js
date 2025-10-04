"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = __importDefault(require("../controllers/auth.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const passport_1 = __importDefault(require("passport"));
const jwt_1 = require("../utils/jwt");
const router = (0, express_1.Router)();
// Rute Registrasi
router.post('/register/user', auth_controller_1.default.register);
router.post('/register/tenant', auth_controller_1.default.registerTenant);
// Rute Verifikasi Email
router.post('/verify', auth_controller_1.default.verifyAndSetPassword);
router.post('/resend-verification', auth_controller_1.default.resendVerification);
// Rute Login
router.post('/login', auth_controller_1.default.login);
// Rute Reset Password
router.post('/password-reset/request', auth_controller_1.default.requestPasswordReset);
router.post('/password-reset/confirm', auth_controller_1.default.resetPassword);
// Rute Konfirmasi Perubahan Email
router.post('/confirm-email-change', auth_controller_1.default.confirmEmailChange);
// Rute Profil
router.get('/profile', (0, auth_middleware_1.authMiddleware)(), auth_controller_1.default.getProfile);
// --- Rute Social Login ---
// Google
router.get('/google', passport_1.default.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport_1.default.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login`,
}), (req, res) => {
    const user = req.user;
    const tokenPayload = {
        id: user.id,
        role: user.role,
        fullName: user.fullName,
        email: user.email,
        verified: user.verified,
        createdAt: user.createdAt,
        profilePicture: user.profilePicture
    };
    const token = (0, jwt_1.generateToken)(tokenPayload);
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
});
exports.default = router;
