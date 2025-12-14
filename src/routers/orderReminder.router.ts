import { Router } from "express";
import OrderReminderController from "../controllers/orderReminder.controller";
import { verifyToken, isTenant } from "../middleware/auth.middleware";

class OrderReminderRouter {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      "/send-confirm-invoice",
      verifyToken,
      isTenant,
      OrderReminderController.sendConfirm.bind(OrderReminderController)
    );
  }
}

export default new OrderReminderRouter().router;
