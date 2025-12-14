import { Router } from "express";
import ConfirmPaymentController from "../controllers/confirmPayment.controller";
import { verifyToken, isTenant } from "../middleware/auth.middleware";
import { validate, PaymentValidator } from "../middleware/validators";

class ConfirmPaymentRouter {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.patch(
      "/confirm/:invoiceNumber",
      verifyToken,
      isTenant,
      validate(PaymentValidator.confirm),
      ConfirmPaymentController.confirmPayment.bind(ConfirmPaymentController)
    );
  }
}

export default new ConfirmPaymentRouter().router;
