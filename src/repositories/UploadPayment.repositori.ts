import { prisma } from "../config/prisma";

export class UploadPaymentRepository {
    async updatePaymentProof(bookingId: number, proofUrl: string) {
        return prisma.booking.update({
            where: { id: bookingId },
            data: {
                paymentProof: proofUrl,
                status: "MENUNGGU_PEMBAYARAN",
                updatedAt: new Date()
            }
        });
    }
}
