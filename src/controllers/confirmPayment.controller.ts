import { Request, Response, NextFunction } from "express";
import ApiError from "../utils/apiError";
import ConfirmPaymentService from "../services/confirmPayment.service";
import { prisma } from "../config/prisma";

class ConfirmPaymentController {
  public async confirmPayment(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = (req.user as any)?.id;
      if (!userId) throw new ApiError(401, "Unauthorized");
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
        throw new ApiError(
          400,
          "Invoice number and acceptance status are required."
        );
      }

      const updatedBooking = await ConfirmPaymentService.confirmPayment(
        tenant.id,
        invoiceNumber,
        isAccepted
      );

      res.status(200).json({
        success: true,
        message: `Payment has been ${
          updatedBooking.status === "DIPROSES" ? "confirmed" : "rejected"
        } successfully.`,
        data: updatedBooking,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ConfirmPaymentController();
