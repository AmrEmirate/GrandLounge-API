import { Request, Response, NextFunction } from "express";
import { getTenantTransactionListService, OrderListService } from "../services/OrderList.service";
import ApiError from "../utils/apiError";

class OrderListController {
    public async orderList(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const userId = (req.user as any).userId;
            const filter = {
                checkIn: req.query.checkIn ? new Date(req.query.checkIn as string) : undefined,
                checkOut: req.query.checkOut ? new Date(req.query.checkOut as string) : undefined,
                invoiceNumber: req.query.invoiceNumber as string | undefined,
                status: req.query.status as string,
            };

            if (filter.checkIn && filter.checkOut && filter.checkIn > filter.checkOut) {
                throw new ApiError(400, "Check-in date cannot be after check-out date");
            }

            const orderlist = await OrderListService(userId, filter);

            res.status(200).json({
                success: true,
                message: "Order list retrieved successfully",
                data: orderlist
            })
        } catch (error) {
            next(error);
        }
    }

    public async tenantTransactionList(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const userId = (req.user as any).id;
            const status = req.query.status as string | undefined;

            if (!userId) { 
                throw new ApiError(400, "User ID is required");
            }

            const reservation = await getTenantTransactionListService(userId, status);

            res.status(200).json({
                success: true,
                message: "Tenant transaction list retrieved successfully",
                data: reservation
            });
        } catch (error) {
            next(error)
        }
    }
}

export default OrderListController;