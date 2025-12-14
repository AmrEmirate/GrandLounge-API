import { Router } from "express";
import OrderListController from "../controllers/orderList.controller";
import { verifyToken, isUser, isTenant } from "../middleware/auth.middleware";

class OrderListRouter {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      "/order-list",
      verifyToken,
      isUser,
      OrderListController.orderList.bind(OrderListController)
    );

    this.router.get(
      "/tenant-transactions/pending",
      verifyToken,
      isTenant,
      OrderListController.pendingConfirmationList.bind(OrderListController)
    );

    this.router.patch(
      "/:bookingId/complete",
      verifyToken,
      isUser,
      OrderListController.completeOrder.bind(OrderListController)
    );

    this.router.get(
      "/tenant-transactions",
      verifyToken,
      isTenant,
      OrderListController.tenantTransactionList.bind(OrderListController)
    );
  }
}

export default new OrderListRouter().router;
