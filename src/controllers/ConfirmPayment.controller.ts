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
            if (!userId) throw new ApiError(401, "Unauthorized");

            // Ambil tenantId dari database menggunakan userId yang ada di token
            const tenant = await prisma.tenant.findUnique({
                where: { userId: userId },
                select: { id: true },
            });

            if (!tenant) {
                throw new ApiError(403, "Tenant account not found.");
            }

            const { invoiceNumber } = req.params;
            const { isAccepted } = req.body;

            if (!invoiceNumber || isAccepted === undefined) {
                throw new ApiError(400, "Invoice number and acceptance status are required.");
            }

            console.log("TenantId dari DB:", tenant.id);
            console.log("InvoiceNumber:", invoiceNumber);
            console.log("isAccepted:", isAccepted);

            const updatedBooking = await ConfirmPaymentService(
                tenant.id, // Gunakan tenant.id yang benar
                invoiceNumber,
                isAccepted
            );

            console.log("Booking property tenantId:", updatedBooking.property.tenantId);
            console.log("Booking status setelah update:", updatedBooking.status);

            res.status(200).json({
                success: true,
                message: `Payment has been ${updatedBooking.status === "DIPROSES" ? "confirmed" : "rejected"} successfully.`,
                data: updatedBooking,
            });
        } catch (error) {
            next(error);
        }
    }
}

export default ConfirmPaymentController;