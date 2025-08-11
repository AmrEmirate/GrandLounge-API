import { Router } from 'express';
import passport from 'passport';
import {
  registerUser,
  verifyEmail,
  loginUser,
  forgotPasswordUser,
  resetPasswordUser,
  resendVerification,
  socialLoginCallback 
} from '../controllers/authController';

const router = Router();

// --- Rute Otentikasi Email & Password ---
router.post('/register', registerUser);
router.post('/verify', verifyEmail);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPasswordUser);
router.post('/reset-password', resetPasswordUser);
router.post('/resend-verification', resendVerification);

// --- Rute Social Login ---

// Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: 'http://localhost:3000/login-failed',
  }),
  socialLoginCallback 
);

// Facebook
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));
router.get(
  '/facebook/callback',
  passport.authenticate('facebook', {
    session: false,
    failureRedirect: 'http://localhost:3000/login-failed',
  }),
  socialLoginCallback 
);

// Twitter
router.get('/twitter', passport.authenticate('twitter'));
router.get(
  '/twitter/callback',
  passport.authenticate('twitter', {
    session: false,
    failureRedirect: 'http://localhost:3000/login-failed',
  }),
  socialLoginCallback 
);

export default router;