import { Router } from "express";
import PaymentController from "../controllers/payment.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { UserRole } from "@prisma/client";

class PaymentRouter {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    
    this.router.post(
      "/create",
      authMiddleware([UserRole.USER, UserRole.TENANT]),
      PaymentController.createPayment.bind(PaymentController)
    );

    
    this.router.post(
      "/webhook",
      PaymentController.handleWebhook.bind(PaymentController)
    );
  }
}

export default new PaymentRouter().router;
