import { BookingStatus } from "../generated/prisma";
import ConfirmPaymentRepository from "../repositories/ConfirmPayment.repositori";
import ApiError from "../utils/apiError";
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
    const booking = await bookingRepo.findBookingByInvoice(invoiceNumber);

    if (!booking) {
        throw new ApiError(404, "Booking not found");
    }

    console.log("TenantId JWT (service):", tenantId);
    console.log("TenantId property:", booking.property.tenantId);

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

    const updatedBooking = await bookingRepo.updateBookingStatus(booking.id, newStatus);

    // ✅ Notifikasi & Email
    if (isAccepted) {
        const message = "Pembayaran Anda telah diterima. Pemesanan Anda sedang diproses.";
        await sendNotification(updatedBooking.userId, message);
        await sendBookingConfirmEmail(updatedBooking); // email detail booking
    } else {
        const message = "Pembayaran Anda ditolak. Silakan upload ulang bukti pembayaran.";
        await sendNotification(updatedBooking.userId, message);
        await sendPaymentRejectedEmail(updatedBooking); // email penolakan
    }

    return updatedBooking;
};
