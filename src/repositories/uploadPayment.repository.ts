import { prisma } from "../config/prisma";

export class UploadPaymentRepository {
    async updatePaymentProof(invoiceNumber: string, proofUrl: string) {
        return prisma.booking.update({
            where: { invoiceNumber },
            data: {
                paymentProof: proofUrl,
                status: "MENUNGGU_KONFIRMASI",
                updatedAt: new Date()
            }
        });
    }
}
