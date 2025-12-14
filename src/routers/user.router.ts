import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import upload from "../middleware/upload.middleware";
import UserController from "../controllers/user.controller";

class UserRouter {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.patch(
      "/profile",
      authMiddleware(),
      upload.single("profilePicture"),
      UserController.updateProfile.bind(UserController)
    );
    this.router.patch(
      "/password",
      authMiddleware(),
      UserController.updatePassword.bind(UserController)
    );
    this.router.post(
      "/request-email-change",
      authMiddleware(),
      UserController.requestEmailChange.bind(UserController)
    );
    this.router.post(
      "/confirm-email-change",
      UserController.confirmEmailChange.bind(UserController)
    );
  }
}

export default new UserRouter().router;
