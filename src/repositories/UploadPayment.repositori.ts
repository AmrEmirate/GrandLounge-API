import { prisma } from "../config/prisma";

export class UploadPaymentRepository {
    async updatePaymentProof(transactionId: number, proofUrl: string) {
        return prisma.booking.update({
            where: { id: transactionId },
            data: {
                paymentProof: proofUrl,
                status: "MENUNGGU_PEMBAYARAN",
                updatedAt: new Date()
            }
        });
    }
}
