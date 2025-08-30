import { Request, Response, NextFunction } from "express";
import ApiError from "../utils/apiError";
import { sendOrderConfirmationByInvoice } from "../services/OrderReminder.service";

export class OrderReminderController {
    public async sendConfirm(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { invoiceNumber } = req.body;
            if (!invoiceNumber) {
                throw new ApiError(400, "Invoice number is required.");
            }

            const result = await sendOrderConfirmationByInvoice(invoiceNumber);

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