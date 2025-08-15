import { prisma } from "../config/prisma";
import { cloudinaryUpload } from "../config/cloudinary";
import { UploadPaymentRepository } from "../repositories/UploadPayment.repositori";

const uploadRepo = new UploadPaymentRepository();

export const uploadPaymentService = async (transactionId: number, file: Express.Multer.File) => {
    if (!file) {
        throw new Error("File is required");
    }

    const transaction = await prisma.booking.findUnique({ where: { id: transactionId } });

    if (!transaction || transaction.status !== "MENUNGGU_PEMBAYARAN") {
        throw new Error("Invalid transaction status")
    }

    const uploadPayment = await cloudinaryUpload(file);

    return uploadRepo.updatePaymentProof(transactionId, uploadPayment.secure_url);
}