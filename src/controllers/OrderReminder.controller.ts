import { Request, Response, NextFunction } from "express";
import ApiError from "../utils/apiError";
import { sendOrderConfirmation } from "../services/OrderReminder.service";

export class OrderReminderController {
    public async sendConfirm(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { bookingId } = req.body;
            if (!bookingId) {
                throw new ApiError(400, "Booking ID is required.");
            }

            const result = await sendOrderConfirmation(parseInt(bookingId));

            res.status(200).json({
                success: true,
                message: "Confirmation email sent successfully.",
                data: result
            });
        } catch (error) {
            next(error)
        }
    }
}

