import { Request, Response, NextFunction } from "express";
import ApiError from "../utils/apiError";
import { ConfirmPaymentService } from "../services/ConfirmPayment.service";

class ConfirmPaymentController {
    public async confirmPayment (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const tenantId = (req.user as any).tenant.id;
            
            const {bookingId, isAccepted} = req.body;

            // Validasi awal: pastikan ID booking dan status konfirmasi ada.
            if (bookingId === undefined || isAccepted === undefined) {
                throw new ApiError(400, "Booking ID and acceptance status are required.");
            }

            // Panggil service untuk menjalankan logika konfirmasi pembayaran.
            const result = await ConfirmPaymentService(
                tenantId,
                parseInt(bookingId),
                isAccepted
            )

            res.status(200).json({
                success: true,
                message: "Payment confirmation status updated successfully.",
                data: result
            })
        } catch (error) {
            next(error)
        }
    }
}

export default ConfirmPaymentController;