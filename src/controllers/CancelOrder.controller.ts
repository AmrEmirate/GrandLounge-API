import { Request, Response, NextFunction } from "express";
import CancelOrderService from "../services/cancelOrder.service";

class CancelOrderController {
  public async cancelOrder(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { invoice } = req.params;
      const user = req.user as any;

      const userId = user.id;
      const isTenant = user.role === "TENANT";
      const canceledOrder = await CancelOrderService.cancelOrder(
        invoice,
        userId,
        isTenant
      );

      res.status(200).json({
        success: true,
        message: "Order has been canceled successfully",
        data: canceledOrder,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new CancelOrderController();
