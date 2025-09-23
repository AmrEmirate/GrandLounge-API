import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import passport from 'passport';
import { generateToken } from '../utils/jwt';

const router = Router();

// Rute Registrasi
router.post('/register/user', AuthController.register);
router.post('/register/tenant', AuthController.registerTenant);

// Rute Verifikasi Email
router.post('/verify', AuthController.verifyAndSetPassword);
router.post('/resend-verification', AuthController.resendVerification);

// Rute Login
router.post('/login', AuthController.login);

// Rute Reset Password
router.post('/password-reset/request', AuthController.requestPasswordReset);
router.post('/password-reset/confirm', AuthController.resetPassword);

// Rute Konfirmasi Perubahan Email
router.post('/confirm-email-change', AuthController.confirmEmailChange);

// Rute Profil
router.get('/profile', authMiddleware(), AuthController.getProfile);

// --- Rute Social Login ---

// Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login`,
  }),
  (req, res) => {
    const user = req.user as any;
    const tokenPayload = {
      id: user.id,
      role: user.role,
      fullName: user.fullName,
      email: user.email,
      verified: user.verified,
      createdAt: user.createdAt,
      profilePicture: user.profilePicture
    };
    const token = generateToken(tokenPayload);
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  }
);

export default router;