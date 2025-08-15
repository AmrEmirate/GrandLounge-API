import { Request, Response, NextFunction } from "express";
import { CancelOrderService } from "../services/CancelOrder.service";

export class CancelOrderControllers {
    public async cancelOrder(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { id } = req.params;
            const canceledOrder = await CancelOrderService(Number(id));
    
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
