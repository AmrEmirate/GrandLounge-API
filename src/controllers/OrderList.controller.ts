import { Request, Response, NextFunction } from "express";
import { completeOrderService, getPendingConfirmationService, getTenantTransactionsService, OrderListService } from "../services/OrderList.service";
import ApiError from "../utils/apiError";

class OrderListController {
    public async orderList(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const userId = (req.user as any).id;
            const filter = {
                searchQuery: req.query.searchQuery as string | undefined,
                propertyName: req.query.propertyName as string | undefined,
                checkIn: req.query.checkIn ? new Date(req.query.checkIn as string) : undefined
            };

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
            const tenantId = (req.user as any).tenant.id;

            const filter = {
                searchQuery: req.query.searchQuery as string | undefined,
                propertyId: req.query.propertyId as string | undefined,
                checkIn: req.query.checkIn ? new Date(req.query.checkIn as string) : undefined,
                status: req.query.status as any | undefined
            };

            const transactions = await getTenantTransactionsService(tenantId, filter);

            res.status(200).json({
                success: true,
                message: "Tenant transaction list retrieved successfully",
                data: transactions
            });
        } catch (error) {
            next(error);
        }
    }

    public async completeOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req.user as any).id;
            const { bookingId } = req.params;
            const updatedOrder = await completeOrderService(userId, bookingId);

            res.status(200).json({
                success: true,
                message: "Order has been marked as completed.",
                data: updatedOrder,
            });
        } catch (error) {
            next(error);
        }
    }

    public async pendingConfirmationList(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const tenantId = (req.user as any).tenant.id;
            const transactions = await getPendingConfirmationService(tenantId);
            res.status(200).json({
                success: true,
                message: "Pending confirmation list retrieved successfully",
                data: transactions
            });
        } catch (error) {
            next(error);
        }
    }
}

export default OrderListController;