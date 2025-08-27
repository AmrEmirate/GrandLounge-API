import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { BookingStatus } from "../generated/prisma";

export const midtransWebhookController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const payload = req.body;

        // payload harus sesuai dokumentasi Midtrans
        const orderId = payload.order_id;
        const transactionStatus = payload.transaction_status; 

        const booking = await prisma.booking.findUnique({ where: { invoiceNumber: orderId } });
        if (!booking) return res.status(404).send("Booking not found");

        // Update status berdasarkan transaction_status
        let newStatus: BookingStatus | null = null;
        if (transactionStatus === "settlement" || transactionStatus === "capture") newStatus = BookingStatus.DIPROSES;
        else if (transactionStatus === "deny" || transactionStatus === "cancel") newStatus = BookingStatus.DIBATALKAN;
        else if (transactionStatus === "expire") newStatus = BookingStatus.DIBATALKAN;

        if (newStatus) {
            await prisma.booking.update({
                where: { id: booking.id },
                data: { status: newStatus },
            });
        }

        res.status(200).json({ success: true });
    } catch (err) {
        next(err);
    }
};
