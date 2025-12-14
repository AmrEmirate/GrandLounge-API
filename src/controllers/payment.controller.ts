import { Request, Response } from "express";
import PaymentService from "../services/payment.service";
import { AuthRequest } from "../middleware/auth.middleware";

class PaymentController {
  public async createPayment(req: AuthRequest, res: Response) {
    try {
      const { bookingId } = req.body;
      const userId = req.user!.id;

      if (!bookingId) {
        return res.status(400).json({ message: "Booking ID is required." });
      }

      const transaction = await PaymentService.createTransaction(
        bookingId,
        userId
      );
      res.status(200).json({
        message: "Payment link created successfully",
        data: transaction,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  public async handleWebhook(req: Request, res: Response) {
    try {
      await PaymentService.midtransWebhook(req.body);
      res.status(200).json({ message: "OK" });
    } catch (error: any) {
      console.error("Webhook Error:", error);
      res.status(500).json({ message: "Webhook processing failed" });
    }
  }
}

export default new PaymentController();
