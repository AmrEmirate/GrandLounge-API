import { Router } from "express";
import OrderListController from "../controllers/orderList.controller";
import { verifyToken, isUser, isTenant } from "../middleware/auth.middleware";

export default class OrderListRouter {
  private router: Router;
  private orderList: OrderListController;

  constructor() {
    this.router = Router();
    this.orderList = new OrderListController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      "/order-list",
      verifyToken,
      isUser,
      this.orderList.orderList
    );

    this.router.get(
      "/tenant-transactions/pending",
      verifyToken,
      isTenant,
      this.orderList.pendingConfirmationList
    );

    this.router.patch(
      "/:bookingId/complete",
      verifyToken,
      isUser,
      this.orderList.completeOrder
    );

    this.router.get(
      "/tenant-transactions",
      verifyToken,
      isTenant,
      this.orderList.tenantTransactionList
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
