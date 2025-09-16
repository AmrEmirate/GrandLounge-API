import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { createMidtransTransaction } from '../services/midtrans.service';
import ApiError from '../utils/apiError';

export default class PaymentController  {
    public async createTransaction(
        req: Request, 
        res: Response, 
        next: NextFunction
    ): Promise <void> {
        try {
            const { invoiceNumber } = req.body;
            const userId = (req.user as any).id;

            if (!invoiceNumber) {
                throw new ApiError(400, 'Booking ID is required.');
            }

            const booking = await prisma.booking.findFirst({
                where: {
                    invoiceNumber: invoiceNumber,
                    userId: userId,
                },
                include: {
                    user: true,
                },
            });

            if (!booking) {
                throw new ApiError(404, 'Booking not found or you do not have permission.');
            }

            const midtransTransaction = await createMidtransTransaction(booking);

            // Simpan token transaksi Midtrans ke database Anda jika perlu
            await prisma.booking.update({
                where: { id: booking.id },
                data: {
                    paymentToken: midtransTransaction.token,
                    paymentUrl: midtransTransaction.redirect_url,
                },
            });

            res.status(200).json({
                success: true,
                message: 'Midtrans transaction created successfully.',
                data: midtransTransaction,
            });
        } catch (error) {
            next(error);
        }
    }
};