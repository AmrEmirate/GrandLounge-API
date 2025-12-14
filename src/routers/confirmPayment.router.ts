import { Router } from "express";
import ConfirmPaymentController from "../controllers/confirmPayment.controller";
import { verifyToken, isTenant } from "../middleware/auth.middleware";
import { validate, PaymentValidator } from "../middleware/validators";

export default class ConfirmPaymentRouter {
  private router: Router;
  private confirmPayment: ConfirmPaymentController;

  constructor() {
    this.router = Router();
    this.confirmPayment = new ConfirmPaymentController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.patch(
      "/confirm/:invoiceNumber",
      verifyToken,
      isTenant,
      validate(PaymentValidator.confirm),
      this.confirmPayment.confirmPayment
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
