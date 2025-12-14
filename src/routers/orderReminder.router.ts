import { Router } from "express";
import { OrderReminderController } from "../controllers/orderReminder.controller";
import { verifyToken, isTenant } from "../middleware/auth.middleware";

export default class OrderReminderRouter {
  private router: Router;
  private orderRemind: OrderReminderController;

  constructor() {
    this.router = Router();
    this.orderRemind = new OrderReminderController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      "/send-confirm-invoice",
      verifyToken,
      isTenant,
      this.orderRemind.sendConfirm
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
