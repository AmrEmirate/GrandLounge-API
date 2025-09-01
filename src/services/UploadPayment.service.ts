import { prisma } from "../config/prisma";
import cloudinaryUpload from "../config/cloudinary";
import { UploadPaymentRepository } from "../repositories/UploadPayment.repositori";
import streamifier from 'streamifier';
import ApiError from "../utils/apiError";

const uploadRepo = new UploadPaymentRepository();

export const uploadPaymentService = async (invoiceNumber: string, file: Express.Multer.File) => {
    if (!file) {
        throw new Error("File is required");
    }

    const transaction = await prisma.booking.findUnique({ where: { invoiceNumber } });

    if (!transaction || transaction.status !== "MENUNGGU_PEMBAYARAN") {
        throw new Error("Invalid transaction status")
    }

    const oneHour = 60 * 60 * 1000; // 1 jam dalam milidetik
    const bookingTime = new Date(transaction.createdAt).getTime();
    const currentTime = new Date().getTime();

    if (currentTime - bookingTime > oneHour) {
        // Jika sudah lebih dari 1 jam, langsung batalkan booking dan lempar error
        await prisma.booking.update({
            where: { invoiceNumber },
            data: { status: 'DIBATALKAN' },
        });
        throw new ApiError(400, 'Payment time has expired. This booking has been cancelled.');
    }

    if (transaction.status !== "MENUNGGU_PEMBAYARAN") {
        
        throw new ApiError(400, "Invalid transaction status. Payment might have been processed or cancelled.");
    }

    const uploadResult = await new Promise((resolve, reject) => {
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

    return uploadRepo.updatePaymentProof(invoiceNumber, (uploadResult as any).secure_url);
}