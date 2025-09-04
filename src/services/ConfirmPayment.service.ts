import { BookingStatus } from "../generated/prisma";
import ConfirmPaymentRepository from "../repositories/ConfirmPayment.repositori";
import ApiError from "../utils/apiError";
import { prisma } from "../config/prisma"; // Import prisma untuk memulai transaksi
import {
    sendNotification,
    sendBookingConfirmEmail,
    sendPaymentRejectedEmail,
} from "../services/SendEmailNotification.service";

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

        if (
            booking.status !== "MENUNGGU_PEMBAYARAN" &&
            booking.status !== "MENUNGGU_KONFIRMASI"
        ) {
            throw new ApiError(400, "This booking cannot be canceled at its current status.");
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
    try {
        if (isAccepted) {
            const message = "Pembayaran Anda telah diterima. Pemesanan Anda sedang diproses.";
            await sendNotification(updatedBooking.userId, message);
            await sendBookingConfirmEmail(updatedBooking);
        } else {
            const message = "Pembayaran Anda ditolak. Silakan upload ulang bukti pembayaran.";
            await sendNotification(updatedBooking.userId, message);
            await sendPaymentRejectedEmail(updatedBooking);
        }
    } catch (error) {
        throw new ApiError(500, `Gagal mengirim notifikasi untuk booking ${updatedBooking.id}:`)
    }

    return updatedBooking;
};