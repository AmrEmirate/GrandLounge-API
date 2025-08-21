import { prisma } from "../config/prisma";
import cloudinaryUpload from "../config/cloudinary";
import { UploadPaymentRepository } from "../repositories/UploadPayment.repositori";
import streamifier from 'streamifier';

const uploadRepo = new UploadPaymentRepository();

export const uploadPaymentService = async (bookingId: number, file: Express.Multer.File) => {
    if (!file) {
        throw new Error("File is required");
    }

    const transaction = await prisma.booking.findUnique({ where: { id: bookingId } });

    if (!transaction || transaction.status !== "MENUNGGU_PEMBAYARAN") {
        throw new Error("Invalid transaction status")
    }

    const uploadPayment = await new Promise((resolve, reject) => {
        const stream = cloudinaryUpload.uploader.upload_stream(
            { folder: "payment_proofs" },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        );
        streamifier.createReadStream(file.buffer).pipe(stream);
    });

    return uploadRepo.updatePaymentProof(bookingId, (uploadPayment as any).secure_url);
}