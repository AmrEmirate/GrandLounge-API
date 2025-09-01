import { BookingStatus } from "../generated/prisma";
import ConfirmPaymentRepository from "../repositories/ConfirmPayment.repositori";
import ApiError from "../utils/apiError";
import { prisma } from "../config/prisma"; // Import prisma untuk memulai transaksi
import {
    sendNotification,
    sendBookingConfirmEmail,
    sendPaymentRejectedEmail,
} from "../services/SendEmailNotification.service";

const bookingRepo = new ConfirmPaymentRepository();

export const ConfirmPaymentService = async (
    tenantId: string,
    invoiceNumber: string,
    isAccepted: boolean
) => {
    // Mulai transaksi untuk memastikan semua operasi DB aman
    const updatedBooking = await prisma.$transaction(async (tx) => {
        // Buat instance repo BARU KHUSUS untuk transaksi ini
        // dengan memberikan 'tx' ke constructor
        const transactionalRepo = new ConfirmPaymentRepository(tx);

        // Gunakan repo transaksional untuk semua operasi di dalam sini
        const booking = await transactionalRepo.findBookingByInvoice(invoiceNumber);

        if (!booking) {
            throw new ApiError(404, "Booking not found");
        }

        if (booking.property.tenantId !== tenantId) {
            throw new ApiError(403, "You do not have permission to confirm this payment.");
        }

        if (booking.status !== "MENUNGGU_PEMBAYARAN") {
            throw new ApiError(400, "Cannot confirm payment for this booking status.");
        }

        let newStatus: BookingStatus;
        if (isAccepted) {
            newStatus = BookingStatus.DIPROSES;
        } else {
            newStatus = BookingStatus.MENUNGGU_PEMBAYARAN;
        }

        const result = await transactionalRepo.updateBookingStatus(booking.id, newStatus);

        // Jika pembayaran ditolak, bersihkan link bukti pembayaran lama
        if (!isAccepted) {
            await transactionalRepo.clearPaymentProof(booking.id);
        }

        return result; // Kembalikan hasil dari dalam transaksi
    });

    // Kirim notifikasi HANYA JIKA transaksi di atas berhasil
    if (isAccepted) {
        const message = "Pembayaran Anda telah diterima. Pemesanan Anda sedang diproses.";
        await sendNotification(updatedBooking.userId, message);
        await sendBookingConfirmEmail(updatedBooking);
    } else {
        const message = "Pembayaran Anda ditolak. Silakan upload ulang bukti pembayaran.";
        await sendNotification(updatedBooking.userId, message);
        await sendPaymentRejectedEmail(updatedBooking);
    }

    return updatedBooking;
};