import { Request, Response, NextFunction } from "express";
import { CancelOrderService } from "../services/CancelOrder.service";
import { isTenant } from "../middleware/isTenant";

export class CancelOrderControllers {
    public async cancelOrder(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { invoice } = req.params;
            const user = req.user as any;

            const userId = user.id;
            const isTenant = user.role === 'TENANT'
            const canceledOrder = await CancelOrderService(invoice, userId, isTenant);

            res.status(200).json({
                success: true,
                message: "Order has been canceled successfully",
                data: canceledOrder
            });
        } catch (error) {
            next(error);
        }
    }
}
