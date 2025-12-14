import { prisma } from "../config/prisma";
import cloudinaryUpload from "../config/cloudinary";
import { UploadPaymentRepository } from "../repositories/uploadPayment.repository";
import streamifier from "streamifier";
import ApiError from "../utils/apiError";

class UploadPaymentService {
  private uploadRepo: UploadPaymentRepository;

  constructor() {
    this.uploadRepo = new UploadPaymentRepository();
  }

  public async uploadPayment(invoiceNumber: string, file: Express.Multer.File) {
    if (!file) {
      throw new Error("File is required");
    }

    const transaction = await prisma.booking.findUnique({
      where: { invoiceNumber },
    });

    if (!transaction || transaction.status !== "MENUNGGU_PEMBAYARAN") {
      throw new Error("Invalid transaction status");
    }

    const oneHour = 60 * 60 * 1000;
    const bookingTime = new Date(transaction.createdAt).getTime();
    const currentTime = new Date().getTime();

    if (currentTime - bookingTime > oneHour) {
      await prisma.booking.update({
        where: { invoiceNumber },
        data: { status: "DIBATALKAN" },
      });
      throw new ApiError(
        400,
        "Payment time has expired. This booking has been cancelled."
      );
    }

    if (transaction.status !== "MENUNGGU_PEMBAYARAN") {
      throw new ApiError(
        400,
        "Invalid transaction status. Payment might have been processed or cancelled."
      );
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

    return this.uploadRepo.updatePaymentProof(
      invoiceNumber,
      (uploadResult as any).secure_url
    );
  }
}

export default new UploadPaymentService();
