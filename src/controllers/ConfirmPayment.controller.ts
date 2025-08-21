// src/controllers/ConfirmPayment.controller.ts
import { Request, Response, NextFunction } from "express";
import ApiError from "../utils/apiError";
import { ConfirmPaymentService } from "../services/ConfirmPayment.service";
import { prisma } from "../config/prisma"; // Pastikan Anda mengimpor Prisma

class ConfirmPaymentController {
    public async confirmPayment(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const userId = (req.user as any)?.id; 

            const tenant = await prisma.tenant.findUnique({
                where: { userId: userId },
            });

            if (!tenant) {
                throw new ApiError(403, "Tenant account not found.");
            }

            const { bookingId } = req.params;
            const { isAccepted } = req.body;

            if (bookingId === undefined || isAccepted === undefined) {
                throw new ApiError(400, "Booking ID and acceptance status are required.");
            }

            const result = await ConfirmPaymentService(
                tenant.id, 
                parseInt(bookingId),
                isAccepted
            );

            res.status(200).json({
                success: true,
                message: "Payment confirmation status updated successfully.",
                data: result
            });
        } catch (error) {
            next(error)
        }
    }
}

export default ConfirmPaymentController;