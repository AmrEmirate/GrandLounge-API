import { Router } from "express";
import AuthController from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { authLimiter } from "../middleware/security.middleware";
import passport from "passport";
import { generateToken } from "../utils/jwt";
import { validate, AuthValidator } from "../middleware/validators";

class AuthRouter {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      "/register/user",
      validate(AuthValidator.registerUser),
      AuthController.register
    );
    this.router.post(
      "/register/tenant",
      validate(AuthValidator.registerTenant),
      AuthController.registerTenant
    );
    this.router.post(
      "/verify",
      validate(AuthValidator.verify),
      AuthController.verifyAndSetPassword
    );
    this.router.post(
      "/resend-verification",
      validate(AuthValidator.resendVerification),
      AuthController.resendVerification
    );
    this.router.post(
      "/login",
      authLimiter,
      validate(AuthValidator.login),
      AuthController.login
    );
    this.router.post(
      "/password-reset/request",
      validate(AuthValidator.requestPasswordReset),
      AuthController.requestPasswordReset
    );
    this.router.post(
      "/password-reset/confirm",
      validate(AuthValidator.confirmPasswordReset),
      AuthController.resetPassword
    );
    this.router.post(
      "/confirm-email-change",
      AuthController.confirmEmailChange
    );
    this.router.get("/profile", authMiddleware(), AuthController.getProfile);
    this.router.get(
      "/google",
      passport.authenticate("google", { scope: ["profile", "email"] })
    );
    this.router.get(
      "/google/callback",
      passport.authenticate("google", {
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
          profilePicture: user.profilePicture,
        };
        const token = generateToken(tokenPayload);
        res.redirect(
          `${process.env.FRONTEND_URL}/auth/callback?token=${token}`
        );
      }
    );
  }
}

export default new AuthRouter().router;
