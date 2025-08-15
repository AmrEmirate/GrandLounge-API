import { Request, Response, NextFunction } from "express";
import { OrderListService } from "../services/OrderList.service";

class OrderListController {
    public async orderList(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const accountId = (req.user as any).accountId;
            const filter = {
                checkIn: req.query.checkIn ? new Date(req.query.checkIn as string) : undefined,
                checkOut: req.query.checkOut ? new Date(req.query.checkOut as string) : undefined,
                invoiceNumber: req.query.invoiceNumber as string | undefined
            };

            const orderlist = await OrderListService(accountId, filter);

            res.status(200).json({
                success: true,
                message: "Order list retrieved successfully",
                data: orderlist
            })
        } catch (error) {
            next(error);
        }
    }
}

export default OrderListController;