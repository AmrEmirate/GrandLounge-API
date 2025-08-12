import { prisma } from "../config/prisma";

export class UploadPaymentRepository {
    async updatePaymentProof(transactionId: string, proofUrl: string) {
        return prisma.transaction.update({
            where: { id: transactionId },
            data: {
                paymentProof: {
                    update: { fileUrl: proofUrl }
                },
                status: "MENUNGGU_KONFIRMASI",
                updatedAt: new Date()
            }
        });
    }
}
