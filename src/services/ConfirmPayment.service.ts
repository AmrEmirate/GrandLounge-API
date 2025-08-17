import { $Enums, BookingStatus, Prisma } from "../generated/prisma";
import ConfirmPaymentRepositori from "../repositories/ConfirmPayment.repositori";
import ApiError from "../utils/apiError";
import { sendNotification } from "./SendEmailNotification.service";

const bookingRepo = new ConfirmPaymentRepositori();
export const ConfirmPaymentService = async (tenantId: number, bookingId: number, isAccepted: boolean) => {
    const booking = await bookingRepo.findBookingById(bookingId);

    if (!booking) {
        throw new ApiError(404, "Booking not found")
    };

    if (booking.property.tenant_id !== tenantId) {
        throw new ApiError(403, "You do not have permission to confirm this payment.");
    }

    if (booking.status !== "MENUNGGU_PEMBAYARAN") {
        throw new ApiError(400, "Cannot confirm payment for this booking status.");
    }

    let newStatus: BookingStatus;
    if (isAccepted) {
        newStatus = BookingStatus.SUDAH_DIBAYAR;
    } else {
        newStatus = BookingStatus.DIBATALKAN;
    }

    const updatedBooking = await bookingRepo.updateBookingStatus(bookingId, newStatus);

    // Panggil layanan notifikasi hanya jika pembayaran diterima
    if (isAccepted) {
        const message = "Pembayaran Anda telah diterima. Pemesanan Anda sedang diproses.";

        await sendNotification(updatedBooking.user_id, message);
    }

    return updatedBooking
}