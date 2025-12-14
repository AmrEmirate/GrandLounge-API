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
      AuthController.register.bind(AuthController)
    );
    this.router.post(
      "/register/tenant",
      validate(AuthValidator.registerTenant),
      AuthController.registerTenant.bind(AuthController)
    );
    this.router.post(
      "/verify",
      validate(AuthValidator.verify),
      AuthController.verifyAndSetPassword.bind(AuthController)
    );
    this.router.post(
      "/resend-verification",
      validate(AuthValidator.resendVerification),
      AuthController.resendVerification.bind(AuthController)
    );
    this.router.post(
      "/login",
      authLimiter,
      validate(AuthValidator.login),
      AuthController.login.bind(AuthController)
    );
    this.router.post(
      "/password-reset/request",
      validate(AuthValidator.requestPasswordReset),
      AuthController.requestPasswordReset.bind(AuthController)
    );
    this.router.post(
      "/password-reset/confirm",
      validate(AuthValidator.confirmPasswordReset),
      AuthController.resetPassword.bind(AuthController)
    );
    this.router.post(
      "/confirm-email-change",
      AuthController.confirmEmailChange.bind(AuthController)
    );
    this.router.get(
      "/profile",
      authMiddleware(),
      AuthController.getProfile.bind(AuthController)
    );
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
