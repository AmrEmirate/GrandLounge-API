import { Router } from "express";
import CancelOrderController from "../controllers/cancelOrder.controller";
import { verifyToken, isUser, isTenant } from "../middleware/auth.middleware";

class CancelOrderRouter {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.patch(
      "/user/cancel/invoice/:invoice",
      verifyToken,
      isUser,
      CancelOrderController.cancelOrder.bind(CancelOrderController)
    );

    this.router.patch(
      "/tenant/cancel/invoice/:invoice",
      verifyToken,
      isTenant,
      CancelOrderController.cancelOrder.bind(CancelOrderController)
    );
  }
}

export default new CancelOrderRouter().router;
